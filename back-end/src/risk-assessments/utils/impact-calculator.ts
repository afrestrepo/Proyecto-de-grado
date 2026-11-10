/**
 * Impact Calculator
 * Implements technical and business impact formulas
 */

import { CVSSMetrics } from './cvss-mapper';

export interface OWASPTechnicalFactors {
  LC?: number; // Loss of Confidentiality
  LI?: number; // Loss of Integrity
  LA?: number; // Loss of Availability
  LAc?: number; // Loss of Accountability
}

/**
 * Calculate technical impact using OWASP factors (0-9)
 * I_Tech_OWASP = (LC + LI + LA + LAc) / 4
 */
export function calculateTechnicalImpactOWASP(
  factors: OWASPTechnicalFactors,
): { score: number; factors: Record<string, number> } {
  const defaultFactors: OWASPTechnicalFactors = {
    LC: 5,
    LI: 5,
    LA: 5,
    LAc: 5,
  };

  const finalFactors = { ...defaultFactors, ...factors };

  const sum =
    (finalFactors.LC || 0) +
    (finalFactors.LI || 0) +
    (finalFactors.LA || 0) +
    (finalFactors.LAc || 0);

  const score = sum / 4;
  return {
    score: Math.min(9, Math.max(0, score)),
    factors: finalFactors,
  };
}

/**
 * Calculate technical impact using CVSS metrics (0-9)
 * I_CVSS = 0.70 * avg(VC, VI, VA) + 0.30 * avg(SC, SI, SA)
 *
 * VC = Vulnerable Confidentiality
 * VI = Vulnerable Integrity
 * VA = Vulnerable Availability
 * SC = Subsequent (system) Confidentiality
 * SI = Subsequent (system) Integrity
 * SA = Subsequent (system) Availability
 */
export function calculateTechnicalImpactCVSS(
  metrics: CVSSMetrics,
  weights?: {
    vulnerable_weight?: number;
    subsequent_weight?: number;
  },
): { score: number; weights: Record<string, number> } {
  const defaultWeights = {
    vulnerable_weight: 0.7,
    subsequent_weight: 0.3,
  };

  const finalWeights = { ...defaultWeights, ...weights };

  // Calculate average of vulnerable system impacts
  const vulnerableImpacts: number[] = [];
  if (metrics.VC !== undefined) vulnerableImpacts.push(metrics.VC);
  if (metrics.VI !== undefined) vulnerableImpacts.push(metrics.VI);
  if (metrics.VA !== undefined) vulnerableImpacts.push(metrics.VA);

  const avgVulnerable =
    vulnerableImpacts.length > 0
      ? vulnerableImpacts.reduce((a, b) => a + b, 0) / vulnerableImpacts.length
      : 0;

  // Calculate average of subsequent system impacts
  const subsequentImpacts: number[] = [];
  if (metrics.SC !== undefined) subsequentImpacts.push(metrics.SC);
  if (metrics.SI !== undefined) subsequentImpacts.push(metrics.SI);
  if (metrics.SA !== undefined) subsequentImpacts.push(metrics.SA);

  const avgSubsequent =
    subsequentImpacts.length > 0
      ? subsequentImpacts.reduce((a, b) => a + b, 0) / subsequentImpacts.length
      : 0;

  // Weighted combination
  const score =
    finalWeights.vulnerable_weight * avgVulnerable +
    finalWeights.subsequent_weight * avgSubsequent;

  return {
    score: Math.min(9, Math.max(0, score)),
    weights: finalWeights,
  };
}

/**
 * Calculate final technical impact combining OWASP and CVSS
 * if has_known_cve == 0: Impact_technical_final = I_Tech_OWASP
 * if has_known_cve == 1: Impact_technical_final = 0.70 * I_Tech_OWASP + 0.30 * I_CVSS
 */
export function calculateTechnicalImpactFinal(
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

/**
 * Calculate business impact (0-9)
 * Impact_business_final = (FD + RD + NC + PV) / 4
 *
 * FD = Financial/Operational Damage
 * RD = Reputational Damage
 * NC = Non-Compliance
 * PV = Privacy Violation
 */
export function calculateBusinessImpact(
  FD: number,
  RD: number,
  NC: number,
  PV: number,
): { score: number; factors: Record<string, number> } {
  const sum = FD + RD + NC + PV;
  const score = sum / 4;

  return {
    score: Math.min(9, Math.max(0, score)),
    factors: { FD, RD, NC, PV },
  };
}

/**
 * Select the final impact (business or technical) based on business factors
 * if (supports_customers + supports_critical_operations + contains_personal_data + has_regulatory_exposure) >= 2:
 *    Impact_final = Impact_business_final
 * else:
 *    Impact_final = Impact_technical_final
 */
export function selectFinalImpact(
  technicalScore: number,
  businessScore: number,
  businessFactorsCount: number,
): {
  type: 'technical' | 'business';
  score: number;
} {
  if (businessFactorsCount >= 2) {
    return {
      type: 'business',
      score: businessScore,
    };
  }
  return {
    type: 'technical',
    score: technicalScore,
  };
}
