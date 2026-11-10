export const STEPPER_STEPS = [
  { id: "identification", label: "Identificación", href: "identification" },
  { id: "analysis", label: "Análisis", href: "analysis" },
  { id: "treatment", label: "Tratamiento", href: "treatment" },
  { id: "tracking", label: "Seguimiento", href: "tracking" },
] as const;

export const TREATMENT_OPTIONS = [
  "mitigar",
  "evadir",
  "transferir",
  "aceptar",
] as const;

// Mock data para amenazas
export interface MockThreat {
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

export const MOCK_THREATS: MockThreat[] = [
  {
    id: "threat-001",
    codigo: "AMZ-001",
    descripcion: "Acceso indebido por error de configuración en permisos",
    origen: "accidental",
    impacto: {
      confidencialidad: true,
      integridad: true,
      disponibilidad: false,
    },
    activoAfectado: {
      datos: true,
      servicios: false,
      personas: false,
    },
  },
  {
    id: "threat-002",
    codigo: "AMZ-002",
    descripcion: "Manipulación intencional de transacciones por usuario interno",
    origen: "deliberado",
    impacto: {
      confidencialidad: false,
      integridad: true,
      disponibilidad: true,
    },
    activoAfectado: {
      datos: true,
      servicios: true,
      personas: false,
    },
  },
  {
    id: "threat-003",
    codigo: "AMZ-003",
    descripcion: "Interrupción operativa por falla eléctrica prolongada",
    origen: "ambiental",
    impacto: {
      confidencialidad: false,
      integridad: false,
      disponibilidad: true,
    },
    activoAfectado: {
      datos: false,
      servicios: true,
      personas: true,
    },
  },
  {
    id: "threat-004",
    codigo: "AMZ-004",
    descripcion: "Borrado no autorizado de evidencias de auditoría",
    origen: "deliberado",
    impacto: {
      confidencialidad: true,
      integridad: true,
      disponibilidad: true,
    },
    activoAfectado: {
      datos: true,
      servicios: true,
      personas: false,
    },
  },
  {
    id: "threat-005",
    codigo: "AMZ-005",
    descripcion: "Exposición de información personal por envío incorrecto",
    origen: "accidental",
    impacto: {
      confidencialidad: true,
      integridad: false,
      disponibilidad: false,
    },
    activoAfectado: {
      datos: true,
      servicios: false,
      personas: true,
    },
  },
];
