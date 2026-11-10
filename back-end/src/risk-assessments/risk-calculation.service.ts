import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AssetDocument } from '../assets/schemas/asset.schema';
import { CVSSMetrics, extractCVSSMetrics } from './utils/cvss-mapper';
import {
  calculateLikelihoodOWASP,
  calculateLikelihoodCVSS,
  calculateFinalLikelihood,
  OWASPLikelihoodFactors,
} from './utils/likelihood-calculator';
import {
  calculateTechnicalImpactOWASP,
  calculateTechnicalImpactCVSS,
  calculateTechnicalImpactFinal,
  calculateBusinessImpact,
  selectFinalImpact,
  OWASPTechnicalFactors,
} from './utils/impact-calculator';
import {
  scoreToLevel,
  calculateSeverity,
  ImpactLevel,
} from './utils/severity-calculator';
import { extractAssetSignals } from './utils/asset-signal-extractor';
import { ImpactAiService } from './services/impact-ai.service';
import { Threat } from '../threats/interfaces/threat.interface';
import { RiskAssessment } from './interfaces/risk-assessment.interface';

export interface RiskCalculationInput {
  asset: AssetDocument;
  threat: Threat;
  vulnerability?: any;
  useAI?: boolean;
  owaspLikelihoodFactors?: OWASPLikelihoodFactors;
  owaspTechnicalFactors?: OWASPTechnicalFactors;
  weights?: {
    owasp_likelihood_weight?: number;
    cvss_likelihood_weight?: number;
    owasp_impact_weight?: number;
    cvss_impact_weight?: number;
  };
}

export interface RiskCalculationOutput
  extends Omit<RiskAssessment, '_id' | 'createdAt' | 'updatedAt'> {}

@Injectable()
export class RiskCalculationService {
  private readonly logger = new Logger(RiskCalculationService.name);

  constructor(private readonly impactAiService: ImpactAiService) {}

  /**
   * Main orchestration method.
   * Calculates full risk assessment for a real asset + threat + optional vulnerability.
   */
  async calculateRisk(input: RiskCalculationInput): Promise<RiskCalculationOutput> {
    const { asset, threat, vulnerability, useAI, owaspLikelihoodFactors, owaspTechnicalFactors, weights } = input;

    if (!asset || !threat) {
      throw new BadRequestException('Asset and Threat are required');
    }

    // Step 1: Extract CVSS metrics from vulnerability (if provided)
    const { metrics: cvssMetrics, source: cvssSource, baseScore } = vulnerability
      ? extractCVSSMetrics(vulnerability)
      : { metrics: {} as CVSSMetrics, source: null, baseScore: undefined };

    const hasCVE = !!vulnerability && Object.keys(cvssMetrics).length > 0;

    // Step 2: Extract business context signals from the real asset schema
    const signals = extractAssetSignals(asset);
    this.logger.debug(
      `[RiskCalculationService] Asset signals — businessContextScore: ${signals.businessContextScore}, ` +
      `signals: ${JSON.stringify(signals.businessContextSignals)}`,
    );

    // Step 3: Optionally call AI for factor inference
    let aiResult: Awaited<ReturnType<ImpactAiService['inferImpactFactors']>> = null;
    const shouldUseAI = useAI !== false;
    if (shouldUseAI) {
      aiResult = await this.impactAiService.inferImpactFactors(asset, signals);
    }

    const aiUsed = aiResult !== null;

    // Step 4: Resolve OWASP technical factors
    // Priority: explicit input override > AI result > deterministic signals
    const resolvedTechnical: OWASPTechnicalFactors = owaspTechnicalFactors ?? (
      aiUsed
        ? {
            LC: aiResult!.technicalImpact.lossOfConfidentiality,
            LI: aiResult!.technicalImpact.lossOfIntegrity,
            LA: aiResult!.technicalImpact.lossOfAvailability,
            LAc: aiResult!.technicalImpact.lossOfAccountability,
          }
        : {
            LC: signals.owaspTechnicalFactors.LC,
            LI: signals.owaspTechnicalFactors.LI,
            LA: signals.owaspTechnicalFactors.LA,
            LAc: signals.owaspTechnicalFactors.LAc,
          }
    );

    // Step 5: Resolve business factors
    const resolvedBusiness = aiUsed
      ? {
          FD: aiResult!.businessImpact.financialDamage,
          RD: aiResult!.businessImpact.reputationDamage,
          NC: aiResult!.businessImpact.nonCompliance,
          PV: aiResult!.businessImpact.privacyViolation,
        }
      : signals.businessFactors;

    // Step 6: Calculate Likelihood
    const likelihood = this.calculateLikelihood(
      threat,
      cvssMetrics,
      hasCVE,
      owaspLikelihoodFactors,
      weights,
    );

    // Step 7: Calculate Technical Impact (OWASP + CVSS blend)
    const technicalImpact = this.calculateTechnicalImpact(
      cvssMetrics,
      hasCVE,
      resolvedTechnical,
      weights,
    );

    // Step 8: Calculate Business Impact
    const businessImpact = calculateBusinessImpact(
      resolvedBusiness.FD,
      resolvedBusiness.RD,
      resolvedBusiness.NC,
      resolvedBusiness.PV,
    );

    // Step 9: Select final impact using businessContextScore
    const selectedImpactData = selectFinalImpact(
      technicalImpact.score,
      businessImpact.score,
      signals.businessContextScore,
    );

    const selectedImpactLevel = scoreToLevel(selectedImpactData.score);

    // Step 10: Calculate final severity from likelihood × impact
    const likelihoodLevel: ImpactLevel = scoreToLevel(likelihood.score);
    const severityLevel = calculateSeverity(likelihoodLevel, selectedImpactLevel);

    // Step 11: Build complete audit trace
    const trace = {
      used_cvss: hasCVE,
      used_cve: !!vulnerability,
      cvss_source: cvssSource,
      calculation_method: 'OWASP Risk Rating Methodology',
      technical_formula: '(LC + LI + LA + LAc) / 4',
      business_formula: '(FD + RD + NC + PV) / 4',
      selection_rule: `businessContextScore (${signals.businessContextScore}) >= 2 => ${selectedImpactData.type} impact selected`,
      ai_used: aiUsed,
      weights: {
        owasp_likelihood_weight: weights?.owasp_likelihood_weight ?? 0.7,
        cvss_likelihood_weight: weights?.cvss_likelihood_weight ?? 0.3,
        owasp_impact_weight: weights?.owasp_impact_weight ?? 0.7,
        cvss_impact_weight: weights?.cvss_impact_weight ?? 0.3,
      },
      business_factors_inferred: !aiUsed,
      business_factors: resolvedBusiness,
      LAc_reasoning: 'LAc = 7 (conservative default — asset schema has no logging metadata)',
    };

    // Step 12: Assemble result
    const result: RiskCalculationOutput = {
      assetId: ((asset as any)._id?.toString?.() || (asset as any)._id) || '',
      threatId: ((threat as any)._id?.toString?.() || (threat as any)._id) || '',
      vulnerabilityId: vulnerability?._id,
      likelihood: {
        score: likelihood.score,
        level: likelihoodLevel,
        factors: likelihood.factors,
      },
      technical_impact: {
        score: technicalImpact.score,
        level: scoreToLevel(technicalImpact.score),
        factors: {
          ...resolvedTechnical,
          cvss_score: hasCVE ? technicalImpact.factors?.cvss_score : undefined,
        },
      },
      business_impact: {
        score: businessImpact.score,
        level: scoreToLevel(businessImpact.score),
        factors: businessImpact.factors,
      },
      selected_impact: {
        type: selectedImpactData.type,
        score: selectedImpactData.score,
        level: selectedImpactLevel,
      },
      severity: {
        level: severityLevel,
      },
      business_context_signals: signals.businessContextSignals,
      ai_used: aiUsed,
      ai_explanation: aiUsed ? aiResult!.explanation : undefined,
      trace,
    };

    return result;
  }

  // ---------------------------------------------------------------------------
  // Likelihood helpers (unchanged logic)
  // ---------------------------------------------------------------------------

  private calculateLikelihood(
    threat: Threat,
    cvssMetrics: CVSSMetrics,
    hasCVE: boolean,
    owaspFactors?: OWASPLikelihoodFactors,
    weights?: RiskCalculationInput['weights'],
  ) {
    const defaultOWASPFactors: OWASPLikelihoodFactors = {
      SL: 5, M: 5, O: 5, S: 5, ED: 5, EE: 5, A: 5, ID: 5,
    };

    const finalOWASPFactors = { ...defaultOWASPFactors, ...owaspFactors };

    const owaspLikelihood = calculateLikelihoodOWASP(
      finalOWASPFactors,
      threat.logging_level,
    );

    let cvssLikelihood = { score: 0, weights: {} };
    if (hasCVE) {
      cvssLikelihood = calculateLikelihoodCVSS(cvssMetrics, {
        AV: weights?.owasp_likelihood_weight,
        AC: weights?.cvss_likelihood_weight,
      });
    }

    const finalLikelihood = calculateFinalLikelihood(
      owaspLikelihood.score,
      cvssLikelihood.score,
      hasCVE,
      {
        owasp_weight: weights?.owasp_likelihood_weight ?? 0.7,
        cvss_weight: weights?.cvss_likelihood_weight ?? 0.3,
      },
    );

    return {
      score: finalLikelihood.score,
      factors: {
        ...owaspLikelihood.factors,
        cvss_score: cvssLikelihood.score,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Technical impact helpers (unchanged math)
  // ---------------------------------------------------------------------------

  private calculateTechnicalImpact(
    cvssMetrics: CVSSMetrics,
    hasCVE: boolean,
    owaspFactors: OWASPTechnicalFactors,
    weights?: RiskCalculationInput['weights'],
  ) {
    const owaspImpact = calculateTechnicalImpactOWASP(owaspFactors);

    let cvssImpact = { score: 0, weights: {} };
    if (hasCVE) {
      cvssImpact = calculateTechnicalImpactCVSS(cvssMetrics, {
        vulnerable_weight: weights?.owasp_impact_weight ?? 0.7,
        subsequent_weight: weights?.cvss_impact_weight ?? 0.3,
      });
    }

    const finalImpact = calculateTechnicalImpactFinal(
      owaspImpact.score,
      cvssImpact.score,
      hasCVE,
      {
        owasp_weight: weights?.owasp_impact_weight ?? 0.7,
        cvss_weight: weights?.cvss_impact_weight ?? 0.3,
      },
    );

    return {
      score: finalImpact.score,
      factors: {
        ...owaspImpact.factors,
        cvss_score: cvssImpact.score,
      },
    };
  }
}
