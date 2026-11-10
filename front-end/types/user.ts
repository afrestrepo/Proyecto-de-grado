// RF-2 (futuro): Tipos para usuarios

export type RolUsuario = "administrador" | "administrador_riesgos" | "usuario_responsable";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  empresaId: string;
}
