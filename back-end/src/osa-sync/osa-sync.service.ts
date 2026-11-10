import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Pattern } from '../patterns/entities/pattern.entity';
import { Control } from '../controls/entities/control.entity';

@Injectable()
export class OsaSyncService {
  private readonly logger = new Logger(OsaSyncService.name);
  private readonly apiBase = 'https://www.opensecurityarchitecture.org/api/v1';

  constructor(
    @InjectRepository(Pattern) private patternRepo: Repository<Pattern>,
    @InjectRepository(Control) private controlRepo: Repository<Control>,
    private configService: ConfigService,
  ) {}

  private get apiKey(): string {
    return this.configService.get<string>('OSA_API_KEY', '');
  }

  private async apiGet(path: string): Promise<any> {
    const res = await fetch(`${this.apiBase}${path}`, {
      headers: { 'X-API-Key': this.apiKey },
    });
    if (!res.ok) {
      throw new Error(`OSA API error ${res.status} for ${path}`);
    }
    return res.json();
  }

  async sync(): Promise<{ patterns: number; controls: number }> {
    this.logger.log('Iniciando sincronización con OSA...');

    const controls = await this.fetchAllControls();
    await this.upsertControls(controls);
    this.logger.log(`${controls.length} controles sincronizados`);

    const patterns = await this.fetchAllPatternsWithDetail();
    await this.upsertPatterns(patterns);
    this.logger.log(`${patterns.length} patrones sincronizados`);

    return { patterns: patterns.length, controls: controls.length };
  }

  async getStatus(): Promise<{
    lastSync: Date | null;
    patterns: number;
    controls: number;
  }> {
    const [patternCount, controlCount] = await Promise.all([
      this.patternRepo.count(),
      this.controlRepo.count(),
    ]);

    const lastSynced = await this.patternRepo.findOne({
      where: {},
      order: { syncedAt: 'DESC' },
      select: ['syncedAt'],
    });

    return {
      lastSync: lastSynced?.syncedAt ?? null,
      patterns: patternCount,
      controls: controlCount,
    };
  }

  private async fetchAllControls(): Promise<any[]> {
    const results: any[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const data = await this.apiGet(`/controls?page=${page}&per_page=100`);
      results.push(...data.data);
      totalPages = data.pagination.total_pages;
      page++;
    }
    return results;
  }

  private async fetchAllPatternsWithDetail(): Promise<any[]> {
    const listResults: any[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const data = await this.apiGet(`/patterns?page=${page}&per_page=100`);
      listResults.push(...data.data);
      totalPages = data.pagination.total_pages;
      page++;
    }

    // Fetch details in batches of 10 to respect rate limits
    const detailed: any[] = [];
    for (let i = 0; i < listResults.length; i += 10) {
      const batch = listResults.slice(i, i + 10);
      const batchResults = await Promise.all(
        batch.map((p) => this.apiGet(`/patterns/${p.id}`).then((d) => d.data)),
      );
      detailed.push(...batchResults);
    }
    return detailed;
  }

  private async upsertControls(controls: any[]): Promise<void> {
    const now = new Date();
    const entities = controls.map((c) =>
      this.controlRepo.create({
        id: c.id,
        name: c.name,
        family: c.family,
        familyName: c.family_name,
        description: c.description ?? null,
        supplementalGuidance: c.supplemental_guidance ?? null,
        enhancements: c.enhancements ?? null,
        baselineLow: c.baseline_low ?? false,
        baselineModerate: c.baseline_moderate ?? false,
        baselineHigh: c.baseline_high ?? false,
        syncedAt: now,
      }),
    );
    await this.controlRepo.save(entities, { chunk: 50 });
  }

  private async upsertPatterns(patterns: any[]): Promise<void> {
    const now = new Date();

    for (const p of patterns) {
      const controlIds: string[] = (p.controls ?? []).map((c: any) =>
        typeof c === 'string' ? c : c.id,
      );

      const controls =
        controlIds.length > 0
          ? await this.controlRepo.findBy({ id: In(controlIds) })
          : [];

      const developmentAreas: string | undefined = p.examples?.[
        'Developing Areas'
      ]
        ? JSON.stringify(p.examples['Developing Areas'])
        : undefined;

      const entityData: DeepPartial<Pattern> = {
        id: p.id,
        slug: p.slug ?? p.id,
        title: p.title,
        description: p.content?.description ?? p.description ?? null,
        classification: p.metadata?.classification ?? null,
        status: p.metadata?.status ?? p.status ?? 'active',
        authors: p.metadata?.authors ?? p.authors ?? [],
        datePublished: p.metadata?.datePublished ?? null,
        dateModified: p.metadata?.dateModified ?? null,
        keyControlAreas: p.content?.keyControlAreas
          ? JSON.stringify(p.content.keyControlAreas)
          : undefined,
        assumptions: p.content?.assumptions ?? null,
        typicalChallenges: p.content?.typicalChallenges ?? null,
        threatResistance: p.content?.threatResistance ?? null,
        indications: p.content?.indications ?? null,
        contraIndications: p.content?.contraIndications ?? null,
        developmentAreas,
        controls,
        syncedAt: now,
      };

      await this.patternRepo.save(this.patternRepo.create(entityData));
    }
  }
}
