import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { CreateTaskNoteDto } from '../dtos/create-task-note.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { UploadTaskDocumentDto } from '../dtos/upload-task-document.dto';
import { Tarea, Nota, Documento, Historial, AccionHistorial } from '../entities/task.entity';
import { Control } from '../../controls/entities/control.entity';
import { MappingResult, MappingStatus } from '../../mapping/entities/mapping-result.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    @InjectRepository(Nota)
    private readonly notaRepo: Repository<Nota>,
    @InjectRepository(Documento)
    private readonly documentoRepo: Repository<Documento>,
    @InjectRepository(Historial)
    private readonly historialRepo: Repository<Historial>,
    @InjectRepository(Control)
    private readonly controlRepo: Repository<Control>,
    @InjectRepository(MappingResult)
    private readonly mappingRepo: Repository<MappingResult>,
  ) {}

  private async log(entry: {
    tareaId: string;
    accion: AccionHistorial;
    campo?: string;
    valorAntes?: string;
    valorDespues?: string;
    creadoPor: string;
  }): Promise<void> {
    await this.historialRepo.save(this.historialRepo.create(entry));
  }

  private async enrichTarea(tarea: Tarea) {
    const ids = tarea.controles ?? [];
    const [controles, historial, ultimoMapeo] = await Promise.all([
      ids.length ? this.controlRepo.findBy({ id: In(ids) }) : Promise.resolve([]),
      this.historialRepo.find({ where: { tareaId: tarea.id }, order: { creadoEn: 'DESC' } }),
      this.mappingRepo.findOne({ where: { taskId: tarea.id, status: MappingStatus.COMPLETED }, order: { createdAt: 'DESC' } }),
    ]);

    let grupo: number | null = null;
    let descripcionGrupo: string | null = null;
    if (ultimoMapeo?.clasificacion) {
      try {
        const parsed = JSON.parse(ultimoMapeo.clasificacion);
        grupo = parsed.grupo ?? null;
        descripcionGrupo = parsed.nombre_grupo ?? null;
      } catch { /* ignorar */ }
    }

    return { ...tarea, controles, historial, grupo, descripcionGrupo };
  }

  async create(createTaskDto: CreateTaskDto): Promise<Tarea> {
    const tarea = this.tareaRepo.create(createTaskDto);
    return this.tareaRepo.save(tarea);
  }

  async findAll() {
    const tareas = await this.tareaRepo.find({ order: { nombre: 'ASC' } });
    return Promise.all(tareas.map((t) => this.enrichTarea(t)));
  }

  async findWithTreatment() {
    const tareas = await this.tareaRepo
      .createQueryBuilder('tarea')
      .where('tarea.tratamiento IS NOT NULL')
      .orderBy('tarea.nombre', 'ASC')
      .getMany();
    return Promise.all(tareas.map((t) => this.enrichTarea(t)));
  }

  async findWithoutTreatment() {
    const tareas = await this.tareaRepo
      .createQueryBuilder('tarea')
      .where('tarea.tratamiento IS NULL')
      .orderBy('tarea.nombre', 'ASC')
      .getMany();
    return Promise.all(tareas.map((t) => this.enrichTarea(t)));
  }

  async findOne(id: string) {
    const tarea = await this.tareaRepo.findOne({ where: { id } });
    if (!tarea) return null;
    return this.enrichTarea(tarea);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId = 'sistema'): Promise<Tarea | null> {
    const tarea = await this.tareaRepo.findOne({ where: { id } });
    if (!tarea) return null;

    for (const [campo, nuevoValor] of Object.entries(updateTaskDto)) {
      if (nuevoValor === undefined) continue;
      const valorAntes = String((tarea as any)[campo] ?? '');
      const valorDespues = String(nuevoValor);
      if (valorAntes === valorDespues) continue;

      let accion = AccionHistorial.TAREA_EDITADA;
      if (campo === 'estado') accion = AccionHistorial.ESTADO_CAMBIADO;
      else if (campo === 'tratamiento') accion = AccionHistorial.TRATAMIENTO_CAMBIADO;

      await this.log({ tareaId: id, accion, campo, valorAntes, valorDespues, creadoPor: userId });
    }

    Object.assign(tarea, updateTaskDto);
    return this.tareaRepo.save(tarea);
  }

  async remove(id: string): Promise<void> {
    await this.tareaRepo.delete(id);
  }

  async createNote(id: string, dto: CreateTaskNoteDto, userId = 'sistema'): Promise<Nota | null> {
    const tarea = await this.tareaRepo.findOne({ where: { id } });
    if (!tarea) return null;
    const nota = this.notaRepo.create({ texto: dto.texto, tarea, tareaId: tarea.id });
    const saved = await this.notaRepo.save(nota);
    await this.log({ tareaId: id, accion: AccionHistorial.NOTA_AÑADIDA, valorDespues: saved.texto, creadoPor: userId });
    return saved;
  }

  findNotes(id: string): Promise<Nota[]> {
    return this.notaRepo.find({ where: { tareaId: id }, order: { creadoEn: 'DESC' } });
  }

  async updateNote(notaId: string, texto: string, userId = 'sistema'): Promise<Nota | null> {
    const nota = await this.notaRepo.findOne({ where: { id: notaId } });
    if (!nota) return null;
    const valorAntes = nota.texto;
    nota.texto = texto;
    const saved = await this.notaRepo.save(nota);
    await this.log({ tareaId: nota.tareaId, accion: AccionHistorial.NOTA_EDITADA, valorAntes, valorDespues: texto, creadoPor: userId });
    return saved;
  }

  async removeNote(notaId: string, userId = 'sistema'): Promise<void> {
    const nota = await this.notaRepo.findOne({ where: { id: notaId } });
    if (nota) {
      await this.log({ tareaId: nota.tareaId, accion: AccionHistorial.NOTA_ELIMINADA, valorAntes: nota.texto, creadoPor: userId });
    }
    await this.notaRepo.delete(notaId);
  }

  async uploadDocument(id: string, dto: UploadTaskDocumentDto, userId = 'sistema'): Promise<Documento | null> {
    const tarea = await this.tareaRepo.findOne({ where: { id } });
    if (!tarea) return null;
    const doc = this.documentoRepo.create({ nombreArchivo: dto.nombreArchivo, urlArchivo: dto.urlArchivo, tarea, tareaId: tarea.id });
    const saved = await this.documentoRepo.save(doc);
    await this.log({ tareaId: id, accion: AccionHistorial.DOCUMENTO_AÑADIDO, valorDespues: saved.nombreArchivo, creadoPor: userId });
    return saved;
  }

  findDocuments(id: string): Promise<Documento[]> {
    return this.documentoRepo.find({ where: { tareaId: id }, order: { subidoEn: 'DESC' } });
  }

  async updateDocument(docId: string, dto: UploadTaskDocumentDto, userId = 'sistema'): Promise<Documento | null> {
    const doc = await this.documentoRepo.findOne({ where: { id: docId } });
    if (!doc) return null;
    const valorAntes = doc.nombreArchivo;
    Object.assign(doc, dto);
    const saved = await this.documentoRepo.save(doc);
    await this.log({ tareaId: doc.tareaId, accion: AccionHistorial.DOCUMENTO_EDITADO, valorAntes, valorDespues: dto.nombreArchivo, creadoPor: userId });
    return saved;
  }

  async removeDocument(docId: string, userId = 'sistema'): Promise<void> {
    const doc = await this.documentoRepo.findOne({ where: { id: docId } });
    if (doc) {
      await this.log({ tareaId: doc.tareaId, accion: AccionHistorial.DOCUMENTO_ELIMINADO, valorAntes: doc.nombreArchivo, creadoPor: userId });
    }
    await this.documentoRepo.delete(docId);
  }
}
