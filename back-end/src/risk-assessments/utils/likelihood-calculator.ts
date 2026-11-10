/**
 * Likelihood Calculator
 * Implements OWASP and CVSS likelihood formulas
 */

import { CVSSMetrics } from './cvss-mapper';

export interface OWASPLikelihoodFactors {
  SL?: number; // Skill Level
  M?: number; // Motive
  O?: number; // Opportunity
  S?: number; // Size
  ED?: number; // External Discovery
  EE?: number; // External Ease of Exploitation
  A?: number; // Assumption
  ID?: number; // Internal Discovery
  LL?: number; // Likelihood Level
}

export const LOGGING_LEVEL_MAPPING = {
  active_review: 9,
  logged_reviewed: 6,
  logged_not_reviewed: 3,
  not_logged: 1,
};

/**
 * Calculate OWASP likelihood score (0-9)
 * L_OWASP = (SL + M + O + S + ED + EE + A + ID) / 8
 *
 * Note: The formula uses 8 factors. If not all are provided,
 * we use defaults or the provided values.
 */
export function calculateLikelihoodOWASP(
  factors: OWASPLikelihoodFactors,
  logging_level?: 'active_review' | 'logged_reviewed' | 'logged_not_reviewed' | 'not_logged',
): { score: number; factors: Record<string, number> } {
  const defaultFactors: OWASPLikelihoodFactors = {
    SL: 5,
    M: 5,
    O: 5,
    S: 5,
    ED: 5,
    EE: 5,
    A: 5,
    ID: 5,
  };

  // Use provided factors or defaults
  const finalFactors = { ...defaultFactors, ...factors };

  // Apply logging level to adjust likelihood if provided
  let adjustedFactors = { ...finalFactors };
  if (logging_level) {
    const loggingAdjustment = LOGGING_LEVEL_MAPPING[logging_level];
    // Average the logging level into the overall score
    // Use it to adjust exploitability (could be EE)
    adjustedFactors.EE = ((adjustedFactors.EE || 0) + loggingAdjustment) / 2;
  }

  // Calculate average
  const sum =
    (adjustedFactors.SL || 0) +
    (adjustedFactors.M || 0) +
    (adjustedFactors.O || 0) +
    (adjustedFactors.S || 0) +
    (adjustedFactors.ED || 0) +
    (adjustedFactors.EE || 0) +
    (adjustedFactors.A || 0) +
    (adjustedFactors.ID || 0);

  const score = sum / 8;
  return {
    score: Math.min(9, Math.max(0, score)),
    factors: adjustedFactors,
  };
}

/**
 * Calculate CVSS-based likelihood score (0-9)
 * L_CVSS = 0.25*AV + 0.15*AC + 0.15*AT + 0.15*PR + 0.15*UI + 0.15*E
 *
 * Note: AT and E are only in CVSS v4.0
 * For v3.1, we adjust weights to only use available metrics
 */
export function calculateLikelihoodCVSS(
  metrics: CVSSMetrics,
  weights?: {
    AV?: number;
    AC?: number;
    AT?: number;
    PR?: number;
    UI?: number;
    E?: number;
  },
): { score: number; weights: Record<string, number> } {
  // Default weights from specification
  const defaultWeights = {
    AV: 0.25,
    AC: 0.15,
    AT: 0.15,
    PR: 0.15,
    UI: 0.15,
    E: 0.15,
  };

  const finalWeights = { ...defaultWeights, ...weights };

  let sum = 0;
  let totalWeight = 0;

  // Only include metrics that exist
  if (metrics.AV !== undefined) {
    sum += metrics.AV * finalWeights.AV;
    totalWeight += finalWeights.AV;
  }
  if (metrics.AC !== undefined) {
    sum += metrics.AC * finalWeights.AC;
    totalWeight += finalWeights.AC;
  }
  if (metrics.AT !== undefined) {
    sum += metrics.AT * finalWeights.AT;
    totalWeight += finalWeights.AT;
  }
  if (metrics.PR !== undefined) {
    sum += metrics.PR * finalWeights.PR;
    totalWeight += finalWeights.PR;
  }
  if (metrics.UI !== undefined) {
    sum += metrics.UI * finalWeights.UI;
    totalWeight += finalWeights.UI;
  }
  if (metrics.E !== undefined) {
    sum += metrics.E * finalWeights.E;
    totalWeight += finalWeights.E;
  }

  // Normalize if not all weights were used
  const score = totalWeight > 0 ? sum / totalWeight : 0;

  return {
    score: Math.min(9, Math.max(0, score)),
    weights: finalWeights,
  };
}

/**
 * Calculate final likelihood combining OWASP and CVSS
 * if has_known_cve == 0: Likelihood_final = L_OWASP
 * if has_known_cve == 1: Likelihood_final = 0.70 * L_OWASP + 0.30 * L_CVSS
 */
export function calculateFinalLikelihood(
  owaspScore: number,
  cvssScore: number = 0,
  hasCVE: boolean = false,
  weights?: {
    owasp_weight?: number;
    cvss_weight?: number;
  },
): { score: number; weights: Record<string, number> } {
  const defaultWeights = {
    owasp_weight: 0.7,
    cvss_weight: 0.3,
  };

  const finalWeights = { ...defaultWeights, ...weights };

  let finalScore: number;

  if (!hasCVE) {
    finalScore = owaspScore;
  } else {
    finalScore = finalWeights.owasp_weight * owaspScore + finalWeights.cvss_weight * cvssScore;
  }

  return {
    score: Math.min(9, Math.max(0, finalScore)),
    weights: finalWeights,
  };
}
