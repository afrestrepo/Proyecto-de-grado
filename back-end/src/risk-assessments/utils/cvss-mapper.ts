/**
 * CVSS to 0-9 Scale Mapper
 * Converts CVSS v3.1 and v4.0 metrics to a normalized 0-9 scale
 */

export interface CVSSMetrics {
  AV?: number; // Attack Vector
  AC?: number; // Attack Complexity
  AT?: number; // Attack Requirements (v4.0)
  PR?: number; // Privileges Required
  UI?: number; // User Interaction
  E?: number; // Exploitability (v4.0)
  VC?: number; // Confidentiality (Vulnerable System)
  VI?: number; // Integrity (Vulnerable System)
  VA?: number; // Availability (Vulnerable System)
  SC?: number; // Confidentiality (Subsequent System)
  SI?: number; // Integrity (Subsequent System)
  SA?: number; // Availability (Subsequent System)
}

/**
 * Mapeos obligatorios según especificación.
 * Acepta tanto abreviaciones del vector string (N, L, H) como los strings
 * completos que almacena MongoDB (NETWORK, LOW, HIGH, etc.)
 */
const CVSS_MAPPINGS: Record<string, Record<string, number>> = {
  AV: { N: 9, A: 6, L: 3, P: 1, NETWORK: 9, ADJACENT: 6, LOCAL: 3, PHYSICAL: 1 },
  AC: { L: 9, H: 3, LOW: 9, HIGH: 3 },
  AT: { N: 9, P: 4, NONE: 9, PRESENT: 4 },
  PR: { N: 9, L: 5, H: 2, NONE: 9, LOW: 5, HIGH: 2 },
  // v3.1: NONE/REQUIRED  |  v4.0: NONE/PASSIVE/ACTIVE
  UI: { N: 9, P: 6, A: 3, NONE: 9, PASSIVE: 6, ACTIVE: 3, REQUIRED: 3 },
  E: { A: 9, P: 6, U: 3, X: 6, ATTACKED: 9, POC: 6, UNREPORTED: 3, NOTDEFINED: 6 },
  // Impact values for VC, VI, VA, SC, SI, SA
  Impact: { H: 9, L: 5, N: 0, HIGH: 9, LOW: 5, NONE: 0 },
};

/**
 * Map a single CVSS metric value to 0-9 scale
 */
function mapMetricValue(
  metricName: string,
  value: string,
): number {
  if (!value) return 0;
  
  const mapping = CVSS_MAPPINGS[metricName];
  if (!mapping) {
    console.warn(`Unknown metric: ${metricName}`);
    return 0;
  }

  const mapped = mapping[value];
  if (mapped === undefined) {
    console.warn(`Unknown value for ${metricName}: ${value}`);
    return 0;
  }

  return mapped;
}

/**
 * Extract and map CVSS metrics from CVSS v3.1 object
 */
export function mapCVSSV3Metrics(cvssV3: any): CVSSMetrics {
  if (!cvssV3) return {};

  return {
    AV: mapMetricValue('AV', cvssV3.attackVector),
    AC: mapMetricValue('AC', cvssV3.attackComplexity),
    PR: mapMetricValue('PR', cvssV3.privilegesRequired),
    UI: mapMetricValue('UI', cvssV3.userInteraction),
    VC: mapMetricValue('Impact', cvssV3.confidentialityImpact),
    VI: mapMetricValue('Impact', cvssV3.integrityImpact),
    VA: mapMetricValue('Impact', cvssV3.availabilityImpact),
  };
}

/**
 * Extract and map CVSS metrics from CVSS v4.0 object
 */
export function mapCVSSV4Metrics(cvssV4: any): CVSSMetrics {
  if (!cvssV4) return {};

  return {
    AV: mapMetricValue('AV', cvssV4.attackVector),
    AC: mapMetricValue('AC', cvssV4.attackComplexity),
    AT: mapMetricValue('AT', cvssV4.attackRequirements),
    PR: mapMetricValue('PR', cvssV4.privilegesRequired),
    UI: mapMetricValue('UI', cvssV4.userInteraction),
    E: mapMetricValue('E', cvssV4.exploitability),
    VC: mapMetricValue('Impact', cvssV4.vulnConfidentialityImpact),
    VI: mapMetricValue('Impact', cvssV4.vulnIntegrityImpact),
    VA: mapMetricValue('Impact', cvssV4.vulnAvailabilityImpact),
    SC: mapMetricValue('Impact', cvssV4.subConfidentialityImpact),
    SI: mapMetricValue('Impact', cvssV4.subIntegrityImpact),
    SA: mapMetricValue('Impact', cvssV4.subAvailabilityImpact),
  };
}

/**
 * Extract CVSS metrics from vulnerability document
 * Prefers CVSS v4.0 if available, falls back to v3.1
 */
export function extractCVSSMetrics(vulnerability: any): {
  metrics: CVSSMetrics;
  source: 'cvss_v4.0' | 'cvss_v3.1' | null;
  baseScore?: number;
} {
  if (!vulnerability || !vulnerability.metrics || vulnerability.metrics.length === 0) {
    return { metrics: {}, source: null };
  }

  const cvssMetric = vulnerability.metrics.find((m: any) => m.format === 'CVSS');
  if (!cvssMetric) {
    return { metrics: {}, source: null };
  }

  // Prefer v4.0 if available (check baseScore to ensure it has real data, not an empty object)
  if (cvssMetric.cvssV4_0 && cvssMetric.cvssV4_0.baseScore != null) {
    return {
      metrics: mapCVSSV4Metrics(cvssMetric.cvssV4_0),
      source: 'cvss_v4.0',
      baseScore: cvssMetric.cvssV4_0.baseScore,
    };
  }

  // Fall back to v3.1 (check baseScore to ensure it has real data)
  if (cvssMetric.cvssV3_1 && cvssMetric.cvssV3_1.baseScore != null) {
    return {
      metrics: mapCVSSV3Metrics(cvssMetric.cvssV3_1),
      source: 'cvss_v3.1',
      baseScore: cvssMetric.cvssV3_1.baseScore,
    };
  }

  return { metrics: {}, source: null };
}
