// RF-1 (futuro): Tipos para empresa y activos de información

export interface Empresa {
  id: string;
  nombre: string;
  nit: string;
  sector: string;
  tamano: "micro" | "pequena" | "mediana";
  activos: ActivoInformacion[];
}

export interface ActivoInformacion {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  empresaId: string;
}
