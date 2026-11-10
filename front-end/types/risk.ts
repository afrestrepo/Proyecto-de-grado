// RF-4: Tipos para análisis de riesgo (probabilidad e impacto OWASP)

export interface Riesgo {
  id: string;
  vulnerabilidadId: string;
  probabilidad: number;
  impacto: number;
  nivelRiesgo: NivelRiesgo;
  factoresProbabilidad: FactoresProbabilidad;
  factoresImpacto: FactoresImpacto;
  evaluationId: string;
}

export type NivelRiesgo = "critico" | "alto" | "medio" | "bajo" | "informativo";

export interface FactoresProbabilidad {
  nivelHabilidad: number;
  motivacion: number;
  oportunidad: number;
  tamano: number;
  facilidadDescubrimiento: number;
  facilidadExplotacion: number;
  conciencia: number;
  deteccionIntrusos: number;
}

export interface FactoresImpacto {
  perdidaConfidencialidad: number;
  perdidaIntegridad: number;
  perdidaDisponibilidad: number;
  perdidaTrazabilidad: number;
  danoFinanciero: number;
  danoReputacion: number;
  noConformidad: number;
  privacidad: number;
}
