export interface Likelihood {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  factors: Record<string, any>;
}

export interface Impact {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  factors: Record<string, any>;
}

export interface SelectedImpact {
  type: 'technical' | 'business';
  score: number;
  level: 'Low' | 'Medium' | 'High';
}

export interface Severity {
  level: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface BusinessContextSignals {
  customerFacing: boolean;
  criticalOperation: boolean;
  personalData: boolean;
  regulatoryExposure: boolean;
  publicVisibility: boolean;
}

export interface Trace {
  used_cvss: boolean;
  used_cve: boolean;
  weights: Record<string, any>;
  calculation_method: string;
  technical_formula?: string;
  business_formula?: string;
  selection_rule?: string;
  ai_used?: boolean;
  business_factors?: Record<string, any>;
  business_factors_inferred?: boolean;
  cvss_source?: string | null;
}

export interface RiskAssessment {
  _id?: string;
  assetId: string;
  threatId: string;
  vulnerabilityId?: string;
  likelihood: Likelihood;
  technical_impact: Impact;
  business_impact: Impact;
  selected_impact: SelectedImpact;
  severity: Severity;
  business_context_signals?: BusinessContextSignals;
  ai_used?: boolean;
  ai_explanation?: string;
  trace: Trace;
  recalculated_from?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
