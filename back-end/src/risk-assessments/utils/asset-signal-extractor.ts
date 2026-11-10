/**
 * Asset Signal Extractor
 *
 * Maps the real MongoDB Asset schema (nested structure) to OWASP Risk Rating
 * signals and factors. This is the bridge between asset inventory data and
 * the risk calculation engine.
 *
 * Why: The business-factors-inferrer uses a flat Asset interface that does not
 * match the actual AssetDocument from MongoDB. This extractor reads the real
 * nested fields and derives OWASP-compatible signals without modifying callers.
 */

import { AssetDocument } from '../../assets/schemas/asset.schema';

export interface BusinessContextSignals {
  customerFacing: boolean;
  criticalOperation: boolean;
  personalData: boolean;
  regulatoryExposure: boolean;
  publicVisibility: boolean;
}

export interface OWASPTechnicalFactors {
  LC: number;   // Loss of Confidentiality
  LI: number;   // Loss of Integrity
  LA: number;   // Loss of Availability
  LAc: number;  // Loss of Accountability (always inferred — no log data in asset schema)
  LAc_inferred: boolean;
}

export interface BusinessFactors {
  FD: number;   // Financial/Operational Damage
  RD: number;   // Reputation Damage
  NC: number;   // Non-Compliance
  PV: number;   // Privacy Violation
}

export interface AssetSignals {
  businessContextSignals: BusinessContextSignals;
  businessContextScore: number;
  owaspTechnicalFactors: OWASPTechnicalFactors;
  businessFactors: BusinessFactors;
}

// ---------------------------------------------------------------------------
// Signal derivation helpers
// ---------------------------------------------------------------------------

function hasAnyTrue(obj: Record<string, any> | undefined | null): boolean {
  if (!obj) return false;
  return Object.values(obj).some((v) => v === true);
}

function deriveBusinessContextSignals(asset: AssetDocument): BusinessContextSignals {
  const personalInfo = asset.informacion_clientes?.personal ?? {};
  const clientGeneral = asset.informacion_clientes?.general ?? {};
  const empleados = asset.datos_empleados ?? {};
  const web = asset.servicios_web ?? {};
  const acceso = asset.acceso_personas ?? {};
  const sw = asset.software ?? {};
  const especifico = sw.especifico ?? {};
  const general = sw.general ?? {};

  // customerFacing: asset interacts with external customers
  const customerFacing =
    (web.servicios_web_clientes?.length ?? 0) > 0 ||
    hasAnyTrue(personalInfo) ||
    hasAnyTrue(clientGeneral);

  // criticalOperation: asset supports core business processes
  const criticalOperation =
    especifico.erp === true ||
    especifico.crm === true ||
    general.base_datos === true ||
    general.gestion_operacion === true ||
    (web.servicios_web_operacion?.length ?? 0) > 0;

  // personalData: asset stores personal information of any party
  const personalData =
    hasAnyTrue(personalInfo) ||
    empleados.nombre === true ||
    empleados.nit === true ||
    empleados.direccion === true ||
    empleados.telefono === true;

  // regulatoryExposure: personal or identity data triggers regulatory obligations
  const regulatoryExposure =
    personalData ||
    personalInfo.identificacion === true;

  // publicVisibility: asset is reachable from the internet
  const publicVisibility =
    (web.servicios_web_clientes?.length ?? 0) > 0 ||
    acceso.apps_servicios_internet === true ||
    acceso.admin_servicio_web === true;

  return { customerFacing, criticalOperation, personalData, regulatoryExposure, publicVisibility };
}

// ---------------------------------------------------------------------------
// OWASP Technical Factor inference
// ---------------------------------------------------------------------------

function inferLC(signals: BusinessContextSignals, asset: AssetDocument): number {
  const { personalData, customerFacing } = signals;
  const general = asset.software?.general ?? {};
  const especifico = asset.software?.especifico ?? {};

  if (personalData && customerFacing) return 9;
  if (personalData || hasAnyTrue(asset.datos_corporativos ?? {})) return 7;
  if (general.base_datos || hasAnyTrue(especifico)) return 6;
  return 5;
}

function inferLI(signals: BusinessContextSignals): number {
  if (signals.criticalOperation) return 7;
  return 3;
}

function inferLA(signals: BusinessContextSignals, asset: AssetDocument): number {
  const general = asset.software?.general ?? {};

  if (signals.criticalOperation || signals.customerFacing) return 7;
  if (general.servidor_web === true) return 5;
  return 3;
}

// LAc is always conservatively inferred — the asset schema has no log metadata
function inferLAc(): number {
  return 7;
}

// ---------------------------------------------------------------------------
// Business Factor inference
// ---------------------------------------------------------------------------

function inferFD(signals: BusinessContextSignals): number {
  if (signals.criticalOperation && signals.customerFacing) return 9;
  if (signals.criticalOperation || signals.customerFacing) return 7;
  return 3;
}

function inferRD(signals: BusinessContextSignals): number {
  if (signals.publicVisibility && signals.customerFacing) return 9;
  if (signals.customerFacing || signals.publicVisibility) return 6;
  return 3;
}

function inferNC(signals: BusinessContextSignals): number {
  if (signals.personalData && signals.regulatoryExposure) return 9;
  if (signals.personalData || signals.regulatoryExposure) return 7;
  return 2;
}

function inferPV(signals: BusinessContextSignals, asset: AssetDocument): number {
  if (!signals.personalData) return 0;

  const personalInfo = asset.informacion_clientes?.personal ?? {};
  const personalFieldCount = Object.values(personalInfo).filter((v) => v === true).length;

  if (signals.customerFacing && personalFieldCount >= 2) return 9;
  if (signals.customerFacing) return 7;
  if (personalFieldCount >= 2) return 5;
  return 3;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function extractAssetSignals(asset: AssetDocument): AssetSignals {
  const businessContextSignals = deriveBusinessContextSignals(asset);

  const businessContextScore = [
    businessContextSignals.customerFacing,
    businessContextSignals.criticalOperation,
    businessContextSignals.personalData,
    businessContextSignals.regulatoryExposure,
    businessContextSignals.publicVisibility,
  ].filter(Boolean).length;

  const owaspTechnicalFactors: OWASPTechnicalFactors = {
    LC: inferLC(businessContextSignals, asset),
    LI: inferLI(businessContextSignals),
    LA: inferLA(businessContextSignals, asset),
    LAc: inferLAc(),
    LAc_inferred: true,
  };

  const businessFactors: BusinessFactors = {
    FD: inferFD(businessContextSignals),
    RD: inferRD(businessContextSignals),
    NC: inferNC(businessContextSignals),
    PV: inferPV(businessContextSignals, asset),
  };

  return {
    businessContextSignals,
    businessContextScore,
    owaspTechnicalFactors,
    businessFactors,
  };
}
