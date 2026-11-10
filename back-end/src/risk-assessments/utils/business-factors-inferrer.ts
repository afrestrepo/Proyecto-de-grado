/**
 * Business Factors Inferrer
 * Calculates business impact factors (FD, RD, NC, PV) from asset and threat data
 */

export interface Asset {
  criticality: 1 | 2 | 3;
  supports_customers: 0 | 1;
  supports_critical_operations: 0 | 1;
  contains_personal_data: 0 | 1;
  has_regulatory_exposure: 0 | 1;
  is_internet_exposed: 0 | 1;
}

export interface BusinessFactors {
  FD: number; // Financial/Operational damage
  RD: number; // Reputational damage
  NC: number; // Non-compliance
  PV: number; // Privacy violation
}

/**
 * Calculate Financial/Operational Damage (FD)
 * FD = min(9, 1 + 2*asset_criticality + 2*supports_critical_operations + 2*supports_customers)
 */
export function calculateFD(asset: Asset): number {
  const score =
    1 +
    2 * asset.criticality +
    2 * asset.supports_critical_operations +
    2 * asset.supports_customers;
  return Math.min(9, score);
}

/**
 * Calculate Reputational Damage (RD)
 * RD = min(9, 1 + 3*supports_customers + 1*asset_criticality + 2*is_internet_exposed)
 */
export function calculateRD(asset: Asset): number {
  const score =
    1 +
    3 * asset.supports_customers +
    1 * asset.criticality +
    2 * asset.is_internet_exposed;
  return Math.min(9, score);
}

/**
 * Calculate Non-Compliance (NC)
 * NC = min(9, 1 + 3*has_regulatory_exposure + 3*contains_personal_data)
 */
export function calculateNC(asset: Asset): number {
  const score = 1 + 3 * asset.has_regulatory_exposure + 3 * asset.contains_personal_data;
  return Math.min(9, score);
}

/**
 * Calculate Privacy Violation (PV)
 * PV = 0 if contains_personal_data=0
 * PV = 5 if contains_personal_data=1
 * PV = 7 if contains_personal_data=1 AND supports_customers=1
 */
export function calculatePV(asset: Asset): number {
  if (asset.contains_personal_data === 0) {
    return 0;
  }
  if (asset.supports_customers === 1) {
    return 7;
  }
  return 5;
}

/**
 * Infer all business factors from asset data
 */
export function inferBusinessFactors(asset: Asset): BusinessFactors {
  return {
    FD: calculateFD(asset),
    RD: calculateRD(asset),
    NC: calculateNC(asset),
    PV: calculatePV(asset),
  };
}

/**
 * Determine business impact level based on factors count
 * Returns true if impact should be business-based (>= 2 factors present)
 */
export function shouldUseBusinessImpact(
  supports_customers: 0 | 1,
  supports_critical_operations: 0 | 1,
  contains_personal_data: 0 | 1,
  has_regulatory_exposure: 0 | 1,
): boolean {
  const factorCount =
    supports_customers +
    supports_critical_operations +
    contains_personal_data +
    has_regulatory_exposure;
  return factorCount >= 2;
}
