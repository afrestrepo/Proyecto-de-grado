export interface Threat {
  id: string;
  codigo: string;
  descripcion: string;
  origen: "accidental" | "deliberado" | "ambiental";
  impacto: {
    confidencialidad: boolean;
    integridad: boolean;
    disponibilidad: boolean;
  };
  activoAfectado: {
    datos: boolean;
    servicios: boolean;
    personas: boolean;
  };
}
