// RF-6: Tipos para tratamiento de riesgos

export type TipoTratamiento = "mitigar" | "evitar" | "transferir" | "aceptar";

export interface Tratamiento {
  id: string;
  riesgoId: string;
  tipo: TipoTratamiento;
  justificacion: string;
  acciones: Accion[];
  evaluacionId: string;
}

export interface Accion {
  id: string;
  tratamientoId: string;
  descripcion: string;
  responsableId: string | null;
  estado: EstadoAccion;
  fechaLimite: string | null;
}

export type EstadoAccion = "pendiente" | "en_progreso" | "completada" | "cancelada";
