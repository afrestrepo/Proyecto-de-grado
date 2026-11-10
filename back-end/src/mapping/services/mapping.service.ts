import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Model } from 'mongoose';
import { MappingResult, MappingStatus } from '../entities/mapping-result.entity';
import { Pattern } from '../../patterns/entities/pattern.entity';
import { Tarea } from '../../tasks/entities/task.entity';
import { Control } from '../../controls/entities/control.entity';
import { Threat } from '../../threats/schemas/threat.schema';
import {
  clasificarAmenaza,
  AmenazaInput,
  PatronOSA,
  Clasificacion,
} from '../../classifier/clasificador';

export type MappingResponse = MappingResult & { parsedClasificacion?: Clasificacion };

@Injectable()
export class MappingService {
  private readonly logger = new Logger(MappingService.name);

  constructor(
    @InjectRepository(MappingResult)
    private readonly mappingRepo: Repository<MappingResult>,
    @InjectRepository(Pattern)
    private readonly patternRepo: Repository<Pattern>,
    @InjectRepository(Tarea)
    private readonly taskRepo: Repository<Tarea>,
    @InjectRepository(Control)
    private readonly controlRepo: Repository<Control>,
    @Inject('THREAT_MODEL')
    private readonly threatModel: Model<Threat>,
    private readonly dataSource: DataSource,
  ) {}

  async mitigate(taskId: string): Promise<MappingResponse> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task ${taskId} no encontrada`);
    if (!task.amenazaId) {
      throw new NotFoundException(`La tarea ${taskId} no tiene una amenaza asociada`);
    }

    const threat = await this.threatModel.findOne({ id: task.amenazaId }).exec();
    if (!threat) {
      throw new NotFoundException(`Amenaza ${task.amenazaId} no encontrada`);
    }

    const patterns = await this.patternRepo.find({ relations: ['controls'] });
    const mapping = this.mappingRepo.create({ taskId, status: MappingStatus.PENDING });
    await this.mappingRepo.save(mapping);

    let clasificacion: Clasificacion | undefined;

    try {
      const amenaza = this.threatToAmenazaInput(threat);
      const resultado = clasificarAmenaza(amenaza, patterns as unknown as PatronOSA[]);
      clasificacion = await this.enrichControles(resultado);

      this.logger.log(
        `Clasificación: Grupo ${clasificacion.grupo} "${clasificacion.nombre_grupo}" ` +
        `| requiere_revision_manual: ${clasificacion.requiere_revision_manual}`,
      );

      mapping.clasificacion = JSON.stringify(clasificacion);
      mapping.status = MappingStatus.COMPLETED;

      const allControlIds = [
        ...new Set(
          clasificacion.mapeo.flatMap((m) => m.controles.map((c) => c.codigo)),
        ),
      ];
      if (allControlIds.length) {
        await this.dataSource.query(`UPDATE tareas SET controles = ? WHERE id = ?`, [allControlIds.join(','), taskId]);
        this.logger.log(`Controles guardados: ${allControlIds.join(', ')}`);
      }
    } catch (err) {
      this.logger.error(`Mapping fallido: ${err}`);
      mapping.status = MappingStatus.FAILED;
      mapping.error = err instanceof Error ? err.message : String(err);
    }

    const saved = await this.mappingRepo.save(mapping);
    const { results: _r, ...savedWithout } = saved as MappingResult & { results?: string };
    return { ...savedWithout, parsedClasificacion: clasificacion };
  }

  async findAll(): Promise<MappingResponse[]> {
    const results = await this.mappingRepo.find({ order: { createdAt: 'DESC' } });
    return results.map((r) => this.withParsed(r));
  }

  async findByTask(taskId: string): Promise<MappingResponse[]> {
    const results = await this.mappingRepo.find({ where: { taskId }, order: { createdAt: 'DESC' } });
    return results.map((r) => this.withParsed(r));
  }

  async findOne(id: string): Promise<MappingResponse | null> {
    const r = await this.mappingRepo.findOne({ where: { id } });
    return r ? this.withParsed(r) : null;
  }

  private withParsed(r: MappingResult): MappingResponse {
    const { results: _results, ...rest } = r as MappingResult & { results?: string };
    let parsedClasificacion: Clasificacion | undefined;
    try { parsedClasificacion = rest.clasificacion ? JSON.parse(rest.clasificacion) : undefined; } catch { /* omitir */ }
    return { ...rest, parsedClasificacion };
  }

  // ─── Enriquece controles con nombre y descripcion desde la BD ───────────

  private async enrichControles(resultado: Clasificacion): Promise<Clasificacion> {
    const codigos = resultado.mapeo.flatMap((m) => m.controles.map((c) => c.codigo));
    if (!codigos.length) return resultado;

    const dbControls = await this.controlRepo.findBy({ id: In(codigos) });
    const dbMap = new Map(dbControls.map((c) => [c.id, c]));

    return {
      ...resultado,
      mapeo: resultado.mapeo.map((item) => ({
        ...item,
        controles: item.controles.map((ctrl) => {
          const db = dbMap.get(ctrl.codigo);
          return {
            ...ctrl,
            nombre: db?.name ?? ctrl.codigo,
            descripcion: db?.description ?? null,
            descripcionEs: db?.descriptionEs ?? null,
          };
        }),
      })),
    };
  }

  // ─── Threat → AmenazaInput ──────────────────────────────────────────────

  private threatToAmenazaInput(threat: Threat): AmenazaInput {
    return {
      id: threat.id,
      description: threat.description,
      origin: {
        deliberate:    !!threat.origin?.deliberate,
        accidental:    !!threat.origin?.accidental,
        environmental: !!threat.origin?.environmental,
      },
      affects: {
        confidentiality: !!threat.affects?.confidentiality,
        integrity:       !!threat.affects?.integrity,
        availability:    !!threat.affects?.availability,
      },
      vulnerable_assets: threat.vulnerable_assets as any,
      logging_level: (threat.logging_level ?? 'not_logged') as AmenazaInput['logging_level'],
    };
  }
}
