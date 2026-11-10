/**
 * ImpactAiService
 *
 * Calls the local Ollama model to infer OWASP impact factors from asset data.
 * Always returns null on any failure so the caller can apply a deterministic
 * fallback without breaking the risk calculation flow.
 *
 * Why a dedicated service: OllamaService in mapping/ is not exported from
 * MappingModule. Creating a local instance via ConfigService avoids cross-module
 * coupling and keeps impact logic self-contained.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssetDocument } from '../../assets/schemas/asset.schema';
import { AssetSignals } from '../utils/asset-signal-extractor';

export interface AiImpactFactors {
  technicalImpact: {
    lossOfConfidentiality: number;
    lossOfIntegrity: number;
    lossOfAvailability: number;
    lossOfAccountability: number;
  };
  businessImpact: {
    financialDamage: number;
    reputationDamage: number;
    nonCompliance: number;
    privacyViolation: number;
  };
  explanation: string;
}

const FACTOR_KEYS_TECHNICAL = [
  'lossOfConfidentiality',
  'lossOfIntegrity',
  'lossOfAvailability',
  'lossOfAccountability',
] as const;

const FACTOR_KEYS_BUSINESS = [
  'financialDamage',
  'reputationDamage',
  'nonCompliance',
  'privacyViolation',
] as const;

@Injectable()
export class ImpactAiService {
  private readonly logger = new Logger(ImpactAiService.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('OLLAMA_URL', 'http://localhost:11434');
    this.model = this.configService.get<string>('OLLAMA_MODEL', 'llama3.2:3b');
  }

  async inferImpactFactors(
    asset: AssetDocument,
    signals: AssetSignals,
  ): Promise<AiImpactFactors | null> {
    const prompt = this.buildPrompt(asset, signals);

    try {
      const raw = await this.callOllama(prompt);
      const parsed = this.parseResponse(raw);
      if (!parsed) {
        this.logger.warn('[ImpactAiService] Respuesta de Ollama descartada — fallback determinístico');
        return null;
      }
      return parsed;
    } catch (err: any) {
      this.logger.warn(`[ImpactAiService] Error llamando Ollama: ${err?.message ?? err} — fallback determinístico`);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Prompt construction
  // ---------------------------------------------------------------------------

  private buildPrompt(asset: AssetDocument, signals: AssetSignals): string {
    const { businessContextSignals: s } = signals;

    const softwareLines: string[] = [];
    const gen = asset.software?.general ?? {};
    const esp = asset.software?.especifico ?? {};
    if (gen.base_datos) softwareLines.push('Base de datos');
    if (gen.servidor_web) softwareLines.push('Servidor web');
    if (gen.gestion_operacion) softwareLines.push('Software de gestión de operación');
    if (esp.erp) softwareLines.push('ERP');
    if (esp.crm) softwareLines.push('CRM');
    if (esp.cuales_aplicaciones?.length) softwareLines.push(...esp.cuales_aplicaciones);
    if (gen.cuales_aplicaciones?.length) softwareLines.push(...gen.cuales_aplicaciones);

    const webClients = asset.servicios_web?.servicios_web_clientes ?? [];
    const webOps = asset.servicios_web?.servicios_web_operacion ?? [];

    return `Eres un experto en ciberseguridad aplicando la OWASP Risk Rating Methodology.

Analiza el siguiente activo de una PYME y asigna puntajes de impacto en escala 0-9.

ACTIVO:
- Nombre: ${asset.name ?? 'Sin nombre'}
- Descripción: ${asset.description ?? 'Sin descripción'}
- Software: ${softwareLines.length ? softwareLines.join(', ') : 'ninguno relevante'}
- Servicios web para clientes: ${webClients.length ? webClients.join(', ') : 'ninguno'}
- Servicios web de operación: ${webOps.length ? webOps.join(', ') : 'ninguno'}
- Tiene datos personales de clientes o empleados: ${s.personalData ? 'SÍ' : 'NO'}
- Soporta operación crítica (ERP/CRM/BD): ${s.criticalOperation ? 'SÍ' : 'NO'}
- Orientado al cliente (customer-facing): ${s.customerFacing ? 'SÍ' : 'NO'}
- Visible públicamente en internet: ${s.publicVisibility ? 'SÍ' : 'NO'}
- Expuesto a regulación: ${s.regulatoryExposure ? 'SÍ' : 'NO'}

ESCALA OWASP (0-9):
- 0-2: Mínimo
- 3-5: Moderado
- 6-7: Significativo
- 8-9: Severo/Catastrófico

Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta:
{
  "technicalImpact": {
    "lossOfConfidentiality": <0-9>,
    "lossOfIntegrity": <0-9>,
    "lossOfAvailability": <0-9>,
    "lossOfAccountability": <0-9>
  },
  "businessImpact": {
    "financialDamage": <0-9>,
    "reputationDamage": <0-9>,
    "nonCompliance": <0-9>,
    "privacyViolation": <0-9>
  },
  "explanation": "<una oración explicando los puntajes>"
}`;
  }

  // ---------------------------------------------------------------------------
  // Ollama HTTP call
  // ---------------------------------------------------------------------------

  private doGenerate(prompt: string): Promise<Response> {
    return fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.1, top_p: 0.9, num_predict: 512 },
      }),
    });
  }

  private async pullModel(): Promise<void> {
    this.logger.log(`[ImpactAiService] Model '${this.model}' not found — pulling, this may take several minutes...`);
    const res = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: this.model }),
    });
    if (!res.ok) {
      throw new Error(`Failed to pull model '${this.model}': ${await res.text()}`);
    }
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const line = decoder.decode(value, { stream: true }).trim();
      if (line) {
        try {
          const status = JSON.parse(line) as { status?: string };
          if (status.status) this.logger.log(`[ImpactAiService] pull: ${status.status}`);
        } catch { /* partial chunk */ }
      }
    }
    this.logger.log(`[ImpactAiService] Model '${this.model}' pulled successfully`);
  }

  private async callOllama(prompt: string): Promise<unknown> {
    let res = await this.doGenerate(prompt);

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 404 && body.includes('not found')) {
        await this.pullModel();
        res = await this.doGenerate(prompt);
        if (!res.ok) {
          throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
        }
      } else {
        throw new Error(`Ollama HTTP ${res.status}: ${body}`);
      }
    }

    const data = await res.json();
    this.logger.debug(`[ImpactAiService] Ollama raw: ${String(data?.response).substring(0, 200)}`);

    return JSON.parse(data.response);
  }

  // ---------------------------------------------------------------------------
  // Response validation
  // ---------------------------------------------------------------------------

  private parseResponse(raw: unknown): AiImpactFactors | null {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, any>;

    if (!r.technicalImpact || typeof r.technicalImpact !== 'object') return null;
    if (!r.businessImpact || typeof r.businessImpact !== 'object') return null;

    for (const key of FACTOR_KEYS_TECHNICAL) {
      if (!this.isValidFactor(r.technicalImpact[key])) {
        this.logger.warn(`[ImpactAiService] Factor inválido technicalImpact.${key}: ${r.technicalImpact[key]}`);
        return null;
      }
    }

    for (const key of FACTOR_KEYS_BUSINESS) {
      if (!this.isValidFactor(r.businessImpact[key])) {
        this.logger.warn(`[ImpactAiService] Factor inválido businessImpact.${key}: ${r.businessImpact[key]}`);
        return null;
      }
    }

    return {
      technicalImpact: {
        lossOfConfidentiality: r.technicalImpact.lossOfConfidentiality,
        lossOfIntegrity: r.technicalImpact.lossOfIntegrity,
        lossOfAvailability: r.technicalImpact.lossOfAvailability,
        lossOfAccountability: r.technicalImpact.lossOfAccountability,
      },
      businessImpact: {
        financialDamage: r.businessImpact.financialDamage,
        reputationDamage: r.businessImpact.reputationDamage,
        nonCompliance: r.businessImpact.nonCompliance,
        privacyViolation: r.businessImpact.privacyViolation,
      },
      explanation: typeof r.explanation === 'string' ? r.explanation : '',
    };
  }

  private isValidFactor(v: unknown): v is number {
    return typeof v === 'number' && v >= 0 && v <= 9 && isFinite(v);
  }

  async ping(): Promise<{ available: boolean; url: string; model: string; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { method: 'GET' });
      return { available: res.ok, url: this.baseUrl, model: this.model };
    } catch (err: any) {
      return { available: false, url: this.baseUrl, model: this.model, error: err?.message };
    }
  }
}
