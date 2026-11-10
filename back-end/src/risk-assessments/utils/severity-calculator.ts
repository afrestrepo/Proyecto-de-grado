/**
 * Severity Calculator
 * Converts scores to levels and applies severity matrix
 */

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ImpactLevel = 'Low' | 'Medium' | 'High';

const SCORE_TO_LEVEL_THRESHOLDS = {
  Low: 3,
  Medium: 6,
  High: 9,
};

/**
 * Convert a score (0-9) to a severity level
 */
export function scoreToLevel(score: number): ImpactLevel {
  if (score < SCORE_TO_LEVEL_THRESHOLDS.Low) {
    return 'Low';
  }
  if (score < SCORE_TO_LEVEL_THRESHOLDS.Medium) {
    return 'Medium';
  }
  return 'High';
}

/**
 * Severity matrix based on likelihood and impact
 * Low: score < 3
 * Medium: 3 <= score < 6
 * High: score >= 6
 */
const SEVERITY_MATRIX: Record<ImpactLevel, Record<ImpactLevel, SeverityLevel>> = {
  Low: {
    Low: 'Low',
    Medium: 'Low',
    High: 'Medium',
  },
  Medium: {
    Low: 'Low',
    Medium: 'Medium',
    High: 'High',
  },
  High: {
    Low: 'Medium',
    Medium: 'High',
    High: 'Critical',
  },
};

/**
 * Calculate final severity based on likelihood and impact levels
 */
export function calculateSeverity(
  likelihoodLevel: ImpactLevel,
  impactLevel: ImpactLevel,
): SeverityLevel {
  return SEVERITY_MATRIX[likelihoodLevel][impactLevel];
}

/**
 * Get the severity matrix (for potential UI display or customization)
 */
export function getSeverityMatrix(): Record<ImpactLevel, Record<ImpactLevel, SeverityLevel>> {
  return SEVERITY_MATRIX;
}
