import { TipoTratamiento } from "@/types/treatment";

export type TaskStatus = "ninguno" | "tomado" | "en progreso" | "terminado";

export interface Control {
  id: string;
  name: string;
  family: string;
  familyName: string;
  description: string | null;
  descriptionEs: string | null;
  supplementalGuidance: string | null;
  enhancements: string | null;
  baselineLow: boolean;
  baselineModerate: boolean;
  baselineHigh: boolean;
  syncedAt: string;
}

export interface TaskNote {
  id: string;
  texto: string;
  creadoEn: string;
  tareaId: string;
}

export interface TaskDocument {
  id: string;
  nombreArchivo: string;
  urlArchivo: string | null;
  subidoEn: string;
  tareaId: string;
}

export interface AuditEntry {
  accion: string;
  campo: string | null;
  valorAntes: string | null;
  valorDespues: string | null;
  creadoPor: string;
  creadoEn: string;
}

export interface Tarea {
  id: string;
  nombre: string;
  tratamiento: TipoTratamiento | null;
  estado: TaskStatus;
  controles: Control[];
  responsableId: string;
  amenazaId: string;
  grupo: string | null;
  descripcionGrupo: string | null;
  notas: TaskNote[];
  documentos: TaskDocument[];
  historial: AuditEntry[];
}
