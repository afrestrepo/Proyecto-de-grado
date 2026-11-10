import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { RiskCalculationService } from './risk-calculation.service';
import { RiskAssessmentsService } from './risk-assessments.service';
import { RiskAssessment } from './interfaces/risk-assessment.interface';
import { AssetsService } from '../assets/assets.service';
import { ThreatsService } from '../threats/threats.service';
import { VulnerabilitiesService } from '../vulnerabilities/vulnerabilities.service';
import { CalculateRiskDto } from './dto/calculate-risk.dto';
import {
  calculateLikelihoodOWASP,
  calculateLikelihoodCVSS,
  calculateFinalLikelihood,
  OWASPLikelihoodFactors,
} from './utils/likelihood-calculator';
import { extractCVSSMetrics } from './utils/cvss-mapper';
import { scoreToLevel } from './utils/severity-calculator';
import { generateRandomAssets, pickRandom } from './utils/random-asset-generator';
import { AssetDocument } from '../assets/schemas/asset.schema';
import { extractAssetSignals } from './utils/asset-signal-extractor';
import { ImpactAiService } from './services/impact-ai.service';

@ApiTags('risk-assessments')
@Controller('risk-assessments')
export class RiskAssessmentsController {
  private readonly logger = new Logger(RiskAssessmentsController.name);

  constructor(
    private readonly riskCalculationService: RiskCalculationService,
    private readonly riskAssessmentsService: RiskAssessmentsService,
    private readonly assetsService: AssetsService,
    private readonly threatsService: ThreatsService,
    private readonly vulnerabilitiesService: VulnerabilitiesService,
    private readonly impactAiService: ImpactAiService,
  ) {}

  /**
   * Main endpoint to calculate risk using real asset, threat, and vulnerability data.
   * POST /risk-assessments/calculate
   */
  @ApiOperation({ summary: 'Calcular riesgo OWASP para un activo y amenaza' })
  @ApiResponse({ status: 201, description: 'Evaluación calculada y guardada en MongoDB' })
  @ApiResponse({ status: 400, description: 'DTO inválido' })
  @ApiResponse({ status: 404, description: 'Activo, amenaza o vulnerabilidad no encontrado' })
  @Post('calculate')
  async calculate(@Body() dto: CalculateRiskDto): Promise<{ data: any; id: string | undefined }> {
    this.logger.log(
      `[calculate] assetId=${dto.assetId} threatId=${dto.threatId} vulnerabilityId=${dto.vulnerabilityId ?? 'none'} useAI=${dto.useAI ?? true}`,
    );

    const asset = await this.assetsService.findById(dto.assetId);
    if (!asset) {
      throw new NotFoundException(`Asset ${dto.assetId} not found`);
    }

    const threat = await this.threatsService.findById(dto.threatId);
    if (!threat) {
      throw new NotFoundException(`Threat ${dto.threatId} not found`);
    }

    let vulnerability: any = undefined;
    if (dto.vulnerabilityId) {
      vulnerability = await this.vulnerabilitiesService.findById(dto.vulnerabilityId);
      if (!vulnerability) {
        throw new NotFoundException(`Vulnerability ${dto.vulnerabilityId} not found`);
      }
    }

    const riskCalculation = await this.riskCalculationService.calculateRisk({
      asset,
      threat: threat as any,
      vulnerability,
      useAI: dto.useAI,
      owaspLikelihoodFactors: dto.owaspLikelihoodFactors,
      owaspTechnicalFactors: dto.owaspTechnicalFactors,
      weights: dto.weights,
    });

    const savedRiskAssessment = await this.riskAssessmentsService.create({
      ...riskCalculation,
      assetId: dto.assetId,
      threatId: dto.threatId,
      vulnerabilityId: dto.vulnerabilityId,
    });

    return {
      data: riskCalculation,
      id: savedRiskAssessment._id?.toString(),
    };
  }

  /**
   * Test endpoint to calculate likelihood from real DB entities.
   * POST /risk-assessments/test-likelihood
   */
  @ApiOperation({ summary: 'Probar cálculo de probabilidad con datos reales' })
  @Post('test-likelihood')
  async testLikelihood(
    @Body()
    body: {
      threatId: string;
      vulnerabilityId?: string;
      owaspLikelihoodFactors?: OWASPLikelihoodFactors;
      weights?: {
        owasp_weight?: number;
        cvss_weight?: number;
      };
    },
  ): Promise<any> {
    this.logger.log(
      `[test-likelihood] threatId: ${body.threatId}, vulnerabilityId: ${body.vulnerabilityId ?? 'none'}`,
    );

    if (!body.threatId) {
      throw new BadRequestException('threatId is required');
    }

    const threatDoc = await this.threatsService.findById(body.threatId);
    if (!threatDoc) {
      throw new NotFoundException(`Threat ${body.threatId} not found`);
    }

    let vulnerabilityDoc: any = undefined;
    if (body.vulnerabilityId) {
      vulnerabilityDoc = await this.vulnerabilitiesService.findById(body.vulnerabilityId);
      if (!vulnerabilityDoc) {
        throw new NotFoundException(`Vulnerability ${body.vulnerabilityId} not found`);
      }
    }

    const likelihoodOWASP = calculateLikelihoodOWASP(
      body.owaspLikelihoodFactors ?? {},
      threatDoc.logging_level as any,
    );

    const cvssData = vulnerabilityDoc
      ? extractCVSSMetrics(vulnerabilityDoc)
      : { metrics: {}, source: null, baseScore: undefined };

    const hasCVSS = !!vulnerabilityDoc && Object.keys(cvssData.metrics).length > 0;
    const likelihoodCVSS = hasCVSS ? calculateLikelihoodCVSS(cvssData.metrics) : undefined;

    const likelihoodWeights = {
      ...(body.weights?.owasp_weight !== undefined ? { owasp_weight: body.weights.owasp_weight } : {}),
      ...(body.weights?.cvss_weight !== undefined ? { cvss_weight: body.weights.cvss_weight } : {}),
    };

    const finalLikelihood = calculateFinalLikelihood(
      likelihoodOWASP.score,
      likelihoodCVSS?.score ?? 0,
      hasCVSS,
      likelihoodWeights,
    );

    const response: any = {
      threat: {
        _id: (threatDoc as any)._id?.toString?.() || (threatDoc as any)._id,
        description: threatDoc.description,
        logging_level: threatDoc.logging_level,
        origin: threatDoc.origin,
      },
      likelihood: {
        owasp: {
          score: likelihoodOWASP.score,
          factors: likelihoodOWASP.factors,
        },
        final: {
          score: finalLikelihood.score,
          level: scoreToLevel(finalLikelihood.score),
        },
      },
      trace: {
        used_cvss: hasCVSS,
        weights_used: {
          owasp: finalLikelihood.weights.owasp_weight,
          cvss: finalLikelihood.weights.cvss_weight,
        },
      },
    };

    if (hasCVSS && vulnerabilityDoc) {
      response.vulnerability = {
        _id: vulnerabilityDoc._id?.toString?.() || vulnerabilityDoc._id,
        cveId: vulnerabilityDoc.cveId,
        baseScore: cvssData.baseScore,
        cvssVersion: cvssData.source === 'cvss_v4.0' ? 'v4.0' : 'v3.1',
      };
      response.likelihood.cvss = { score: likelihoodCVSS?.score ?? 0 };
    }

    return response;
  }

  /**
   * Get all risk assessments with optional pagination.
   * GET /risk-assessments?limit=100&skip=0
   */
  @ApiOperation({ summary: 'Listar evaluaciones de riesgo' })
  @ApiResponse({ status: 200, description: 'Lista paginada de evaluaciones' })
  @Get()
  async findAll(
    @Query('limit') limit: string = '100',
    @Query('skip') skip: string = '0',
  ): Promise<RiskAssessment[]> {
    return this.riskAssessmentsService.findAll(parseInt(limit), parseInt(skip));
  }

  /**
   * Simulate a full company risk portfolio: random in-memory assets against real DB threats/vulns.
   * GET /risk-assessments/simulate
   */
  @ApiOperation({ summary: 'Simular portafolio de riesgo de empresa con activos aleatorios y datos reales de la BD' })
  @Get('simulate')
  async simulate(
    @Query('useAI') useAIStr: string = 'false',
  ): Promise<any> {
    const useAI = useAIStr === 'true';
    const allThreats = await this.threatsService.findAll();

    if (allThreats.length === 0) {
      throw new NotFoundException('No hay amenazas en la base de datos');
    }

    const assetCount = Math.floor(Math.random() * 6) + 5; // 5–10 assets
    const threatsPerAsset = Math.floor(Math.random() * 2) + 2; // 2–3 threats per asset
    const assets = generateRandomAssets(assetCount);

    const vulnsWithCvss = await this.vulnerabilitiesService.findWithCvss(200);

    this.logger.log(
      `[simulate] ${assetCount} activos, ${threatsPerAsset} amenazas/activo, ` +
      `${allThreats.length} amenazas en BD, ${vulnsWithCvss.length} vulns con CVSS`,
    );

    const severityOrder: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    const severityDist: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    let totalCalculations = 0;
    const startTime = Date.now();

    const assetResults: any[] = [];
    for (const asset of assets) {
      const selectedThreats = pickRandom(allThreats, threatsPerAsset, threatsPerAsset);

      const calculations: any[] = [];
      for (const threat of selectedThreats) {
        const useVuln = Math.random() < 0.6 && vulnsWithCvss.length > 0;
        const vuln = useVuln ? pickRandom(vulnsWithCvss, 1, 1)[0] : undefined;

        try {
          const result = await this.riskCalculationService.calculateRisk({
            asset: asset as unknown as AssetDocument,
            threat: threat as any,
            vulnerability: vuln,
            useAI,
          });

          totalCalculations++;
          const sev = result.severity.level;
          if (sev in severityDist) severityDist[sev]++;

          calculations.push({
            threat_description: (threat as any).description,
            vulnerability_cve: vuln ? ((vuln as any).cveId ?? null) : null,
            likelihood: result.likelihood,
            technical_impact: result.technical_impact,
            business_impact: result.business_impact,
            selected_impact: result.selected_impact,
            severity: sev,
          });
        } catch (err: any) {
          this.logger.warn(`[simulate] error: ${err.message}`);
        }
      }

      const validCalcs = calculations;
      const worstSeverity = validCalcs.reduce(
        (best, c) => (severityOrder[c.severity] ?? 0) > (severityOrder[best] ?? 0) ? c.severity : best,
        'Low',
      );
      const avgLikelihood = validCalcs.length
        ? +(validCalcs.reduce((s, c) => s + c.likelihood.score, 0) / validCalcs.length).toFixed(2)
        : 0;
      const avgImpact = validCalcs.length
        ? +(validCalcs.reduce((s, c) => s + c.selected_impact.score, 0) / validCalcs.length).toFixed(2)
        : 0;

      assetResults.push({
        asset_name: asset.name,
        asset_profile: asset.profile,
        asset_description: asset.description,
        worst_severity: worstSeverity,
        avg_likelihood: avgLikelihood,
        avg_impact: avgImpact,
        calculations: validCalcs,
      });
    }

    const allLikelihoods = assetResults.flatMap((a) => a.calculations.map((c: any) => c.likelihood.score));
    const allImpacts = assetResults.flatMap((a) => a.calculations.map((c: any) => c.selected_impact.score));
    const globalAvgLikelihood = allLikelihoods.length
      ? +(allLikelihoods.reduce((s, v) => s + v, 0) / allLikelihoods.length).toFixed(2)
      : 0;
    const globalAvgImpact = allImpacts.length
      ? +(allImpacts.reduce((s, v) => s + v, 0) / allImpacts.length).toFixed(2)
      : 0;

    return {
      metadata: {
        generated_assets: assetCount,
        total_calculations: totalCalculations,
        duration_ms: Date.now() - startTime,
      },
      summary: {
        severity_distribution: severityDist,
        global_avg_likelihood: globalAvgLikelihood,
        global_avg_impact: globalAvgImpact,
        highest_risk_assets: [...assetResults]
          .sort((a, b) => (severityOrder[b.worst_severity] ?? 0) - (severityOrder[a.worst_severity] ?? 0))
          .slice(0, 3)
          .map((a) => ({
            name: a.asset_name,
            profile: a.asset_profile,
            worst_severity: a.worst_severity,
            avg_impact: a.avg_impact,
          })),
      },
      assets: assetResults,
    };
  }

  /**
   * Bulk test: generate random assets in-memory and calculate risk against real threats/vulns from DB.
   * GET /risk-assessments/bulk-test?count=15&useAI=false&threatsPerAsset=3
   */
  @ApiOperation({ summary: 'Prueba masiva: activos aleatorios vs amenazas y vulnerabilidades reales de la BD' })
  @Get('bulk-test')
  async bulkTest(
    @Query('count') countStr: string = '15',
    @Query('useAI') useAIStr: string = 'false',
    @Query('threatsPerAsset') threatsPerAssetStr: string = '3',
  ): Promise<any> {
    const count = Math.min(30, Math.max(5, parseInt(countStr) || 15));
    const useAI = useAIStr === 'true';
    const threatsPerAsset = Math.min(5, Math.max(1, parseInt(threatsPerAssetStr) || 3));

    const [allThreats, vulnsWithCvss] = await Promise.all([
      this.threatsService.findAll(),
      this.vulnerabilitiesService.findWithCvss(200),
    ]);

    if (allThreats.length === 0) {
      throw new BadRequestException('No hay amenazas en la BD. Ejecuta el seed primero.');
    }

    const assets = generateRandomAssets(count);
    const startTime = Date.now();

    const severityOrder: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1, 'N/A': 0 };
    const severityDist: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    let totalCalculations = 0;
    let aiUsedCount = 0;

    const assetResults = await Promise.all(
      assets.map(async (asset) => {
        const selectedThreats = pickRandom(allThreats, Math.min(threatsPerAsset, allThreats.length), Math.min(threatsPerAsset, allThreats.length));

        const signals = extractAssetSignals(asset as unknown as AssetDocument);

        const calculations = await Promise.all(
          selectedThreats.map(async (threat) => {
            const useVuln = Math.random() < 0.5 && vulnsWithCvss.length > 0;
            const vuln = useVuln ? pickRandom(vulnsWithCvss, 1, 1)[0] : undefined;

            try {
              const result = await this.riskCalculationService.calculateRisk({
                asset: asset as unknown as AssetDocument,
                threat: threat as any,
                vulnerability: vuln,
                useAI,
              });

              totalCalculations++;
              if (result.ai_used) aiUsedCount++;

              const sev = result.severity.level;
              if (sev in severityDist) severityDist[sev]++;

              await this.riskAssessmentsService.create({
                assetId: new mongoose.Types.ObjectId(asset._id),
                threatId: (threat as any)._id,
                vulnerabilityId: vuln ? (vuln as any)._id : undefined,
                likelihood: result.likelihood,
                technical_impact: result.technical_impact,
                business_impact: result.business_impact,
                selected_impact: result.selected_impact,
                severity: result.severity,
                business_context_signals: result.business_context_signals,
                ai_used: result.ai_used,
                ai_explanation: result.ai_explanation,
                trace: result.trace,
              });

              return {
                threat_id: (threat as any)._id?.toString(),
                threat_description: (threat as any).description,
                vulnerability_cve: vuln ? (vuln as any).cveId ?? 'sin CVE' : null,
                likelihood: result.likelihood,
                technical_impact: {
                  score: result.technical_impact.score,
                  level: result.technical_impact.level,
                },
                business_impact: {
                  score: result.business_impact.score,
                  level: result.business_impact.level,
                },
                selected_impact: result.selected_impact,
                severity: sev,
                ai_used: result.ai_used,
              };
            } catch (err: any) {
              this.logger.warn(`[bulk-test] error en asset=${asset.id} threat=${(threat as any)._id}: ${err.message}`);
              return null;
            }
          }),
        );

        const validCalcs = calculations.filter(Boolean) as any[];
        const worstSeverity = validCalcs.reduce((best, c) =>
          (severityOrder[c.severity] ?? 0) > (severityOrder[best] ?? 0) ? c.severity : best,
          'Low',
        );
        const avgLikelihood = validCalcs.length
          ? +(validCalcs.reduce((s, c) => s + c.likelihood.score, 0) / validCalcs.length).toFixed(2)
          : 0;
        const avgImpact = validCalcs.length
          ? +(validCalcs.reduce((s, c) => s + c.selected_impact.score, 0) / validCalcs.length).toFixed(2)
          : 0;

        return {
          asset_id: asset.id,
          asset_name: asset.name,
          asset_profile: asset.profile,
          description: asset.description,
          business_context_score: signals.businessContextScore,
          business_context_signals: signals.businessContextSignals,
          worst_severity: worstSeverity,
          avg_likelihood: avgLikelihood,
          avg_impact: avgImpact,
          calculations: validCalcs,
        };
      }),
    );

    const impactTypeDist = assetResults.reduce(
      (acc, a) => {
        a.calculations.forEach((c: any) => {
          const t = c.selected_impact?.type ?? 'technical';
          acc[t] = (acc[t] ?? 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const allLikelihoods = assetResults.flatMap((a) => a.calculations.map((c: any) => c.likelihood.score));
    const allImpacts = assetResults.flatMap((a) => a.calculations.map((c: any) => c.selected_impact?.score ?? 0));
    const globalAvgLikelihood = allLikelihoods.length
      ? +(allLikelihoods.reduce((s, v) => s + v, 0) / allLikelihoods.length).toFixed(2)
      : 0;
    const globalAvgImpact = allImpacts.length
      ? +(allImpacts.reduce((s, v) => s + v, 0) / allImpacts.length).toFixed(2)
      : 0;

    return {
      metadata: {
        generated_assets: count,
        total_calculations: totalCalculations,
        threats_available_in_db: allThreats.length,
        vulnerabilities_with_cvss: vulnsWithCvss.length,
        threats_per_asset: threatsPerAsset,
        use_ai: useAI,
        ai_used_count: aiUsedCount,
        duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      summary: {
        severity_distribution: severityDist,
        global_avg_likelihood: globalAvgLikelihood,
        global_avg_impact: globalAvgImpact,
        impact_type_distribution: impactTypeDist,
        highest_risk_assets: assetResults
          .sort((a, b) => (severityOrder[b.worst_severity] ?? 0) - (severityOrder[a.worst_severity] ?? 0))
          .slice(0, 5)
          .map((a) => ({ name: a.asset_name, profile: a.asset_profile, worst_severity: a.worst_severity, avg_impact: a.avg_impact })),
      },
      assets: assetResults,
    };
  }

  /**
   * Get risk assessment by ID.
   * GET /risk-assessments/:id
   */
  @ApiOperation({ summary: 'Verificar disponibilidad del modelo de IA (Ollama)' })
  @ApiResponse({ status: 200, description: 'Estado de conexión con Ollama' })
  @Get('health/ai')
  async healthAi(): Promise<{ available: boolean; url: string; model: string; error?: string }> {
    return this.impactAiService.ping();
  }

  @ApiOperation({ summary: 'Obtener todas las evaluaciones de un activo' })
  @ApiResponse({ status: 200, description: 'Evaluaciones ordenadas por fecha descendente' })
  @Get('asset/:assetId')
  async findByAsset(@Param('assetId') assetId: string): Promise<RiskAssessment[]> {
    return this.riskAssessmentsService.findByAssetId(assetId);
  }

  @ApiOperation({ summary: 'Obtener trazabilidad completa de una evaluación' })
  @ApiResponse({ status: 200, description: 'Campos de trazabilidad: assetId, threatId, trace, timestamps' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  @Get(':id/trace')
  async findTrace(@Param('id') id: string): Promise<any> {
    const result = await this.riskAssessmentsService.findTraceById(id);
    if (!result) {
      throw new NotFoundException(`Risk assessment ${id} not found`);
    }
    return result;
  }

  @ApiOperation({ summary: 'Obtener evaluación de riesgo por ID' })
  @ApiResponse({ status: 200, description: 'Evaluación completa con todos los campos' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  @Get(':id')
  async findById(@Param('id') id: string): Promise<RiskAssessment> {
    const assessment = await this.riskAssessmentsService.findById(id);
    if (!assessment) {
      throw new NotFoundException(`Risk assessment ${id} not found`);
    }
    return assessment;
  }

  /**
   * Get risk assessments for a specific asset + threat pair.
   * GET /risk-assessments/asset/:assetId/threat/:threatId
   */
  @ApiOperation({ summary: 'Buscar evaluaciones por activo y amenaza' })
  @Get('asset/:assetId/threat/:threatId')
  async findByAssetAndThreat(
    @Param('assetId') assetId: string,
    @Param('threatId') threatId: string,
  ): Promise<RiskAssessment[]> {
    return this.riskAssessmentsService.findByAssetAndThreat(assetId, threatId);
  }

  /**
   * Get risk assessments filtered by severity level.
   * GET /risk-assessments/severity/:level
   */
  @ApiOperation({ summary: 'Filtrar evaluaciones por nivel de severidad' })
  @ApiResponse({ status: 200, description: 'Evaluaciones filtradas por nivel' })
  @ApiResponse({ status: 400, description: 'Nivel de severidad inválido (válidos: Low, Medium, High, Critical)' })
  @Get('severity/:level')
  async findBySeverity(
    @Param('level') level: 'Low' | 'Medium' | 'High' | 'Critical',
  ): Promise<RiskAssessment[]> {
    const validLevels = ['Low', 'Medium', 'High', 'Critical'];
    if (!validLevels.includes(level)) {
      throw new BadRequestException(`Invalid severity level: ${level}`);
    }
    return this.riskAssessmentsService.findBySeverity(level);
  }

  /**
   * Recalculate an existing risk assessment with updated parameters.
   * POST /risk-assessments/recalculate/:id
   */
  @ApiOperation({ summary: 'Recalcular una evaluación existente' })
  @Post('recalculate/:id')
  async recalculate(
    @Param('id') id: string,
    @Body() recalculateDto: {
      useAI?: boolean;
      weights?: any;
      owaspLikelihoodFactors?: any;
      owaspTechnicalFactors?: any;
    },
  ): Promise<{ data: any; id: string | undefined }> {
    const existing = await this.riskAssessmentsService.findById(id);
    if (!existing) {
      throw new NotFoundException(`Risk assessment ${id} not found`);
    }

    const asset = await this.assetsService.findById(existing.assetId.toString());
    if (!asset) {
      throw new NotFoundException(`Asset ${existing.assetId} not found`);
    }

    const threat = await this.threatsService.findById(existing.threatId.toString());
    if (!threat) {
      throw new NotFoundException(`Threat ${existing.threatId} not found`);
    }

    let vulnerability: any = undefined;
    if (existing.vulnerabilityId) {
      vulnerability = await this.vulnerabilitiesService.findById(
        existing.vulnerabilityId.toString(),
      );
    }

    const riskCalculation = await this.riskCalculationService.calculateRisk({
      asset,
      threat: threat as any,
      vulnerability,
      useAI: recalculateDto.useAI,
      owaspLikelihoodFactors: recalculateDto.owaspLikelihoodFactors,
      owaspTechnicalFactors: recalculateDto.owaspTechnicalFactors,
      weights: recalculateDto.weights,
    });

    const savedRiskAssessment = await this.riskAssessmentsService.create({
      ...riskCalculation,
      assetId: existing.assetId,
      threatId: existing.threatId,
      vulnerabilityId: existing.vulnerabilityId,
      recalculated_from: id,
    });

    return {
      data: riskCalculation,
      id: savedRiskAssessment._id?.toString(),
    };
  }
}
