import { randomBytes } from 'crypto';

const prob = (p: number) => Math.random() < p;
const fakeId = () => randomBytes(12).toString('hex');
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const pickN = <T>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);

export type AssetProfile =
  | 'servidor_ecommerce'
  | 'servidor_erp'
  | 'servidor_crm'
  | 'servidor_base_datos'
  | 'servidor_correo'
  | 'servidor_web_corporativo'
  | 'workstation_admin'
  | 'workstation_empleado'
  | 'terminal_pos'
  | 'laptop_campo';

export interface GeneratedAsset {
  _id: string;
  id: string;
  name: string;
  description: string;
  profile: AssetProfile;
  dispositivos: Record<string, boolean>;
  software: {
    general: {
      navegador_internet: boolean; sistema_operativo: boolean; sistema_operativo_movil: boolean;
      administrador_correo_elec: boolean; software_ofimatico: boolean; antivirus: boolean;
      servidor_web: boolean; gestion_operacion: boolean; base_datos: boolean;
      seguridad: boolean; gestion_red: boolean; cuales_aplicaciones: string[];
    };
    especifico: { erp: boolean; crm: boolean; cuales_aplicaciones: string[] };
  };
  servicios_web: { servicios_web_clientes: string[]; servicios_web_operacion: string[] };
  acceso_personas: {
    apps_servicios_internet: boolean; admin_dispositivos: boolean;
    admin_redes_servidores: boolean; admin_apps: boolean; admin_servicio_web: boolean;
  };
  informacion_clientes: {
    personal: { nombre: boolean; identificacion: boolean; direccion: boolean; telefono: boolean };
    general: { id_req_compra: boolean; id_recibo_pago: boolean };
  };
  datos_corporativos: {
    nombre: boolean; nit: boolean; direccion: boolean; telefono: boolean;
    redes_sociales: boolean; medios_comunicacion: boolean;
  };
  datos_empleados: {
    nombre: boolean; nit: boolean; direccion: boolean; telefono: boolean;
    redes_sociales: boolean; medios_comunicacion: boolean;
  };
  vulnerableThreats: any[];
}

type ProfileData = Omit<GeneratedAsset, '_id' | 'id' | 'name' | 'description' | 'profile' | 'vulnerableThreats'>;

const baseDisp = (overrides: Partial<Record<string, boolean>> = {}): Record<string, boolean> => ({
  computador_escritorio: false, laptop: false, celular_convencional: false,
  celular_inteligente: false, telefono_fijo: false, captura_dmc: false,
  datafono: false, radiotelefono: false, lector_codigos: false,
  agenda_personal: false, wearables: false, dispositivos_red: false,
  ...overrides,
});

const FACTORIES: Record<AssetProfile, () => ProfileData> = {
  servidor_ecommerce: () => ({
    dispositivos: baseDisp({ dispositivos_red: true }),
    software: {
      general: {
        navegador_internet: false, sistema_operativo: true, sistema_operativo_movil: false,
        administrador_correo_elec: false, software_ofimatico: false, antivirus: prob(0.7),
        servidor_web: true, gestion_operacion: prob(0.6), base_datos: true,
        seguridad: prob(0.5), gestion_red: prob(0.4),
        cuales_aplicaciones: ['nginx', 'postgresql'],
      },
      especifico: { erp: false, crm: prob(0.4), cuales_aplicaciones: prob(0.5) ? ['WooCommerce'] : [] },
    },
    servicios_web: {
      servicios_web_clientes: ['tienda.empresa.com', ...(prob(0.7) ? ['pagos.empresa.com'] : [])],
      servicios_web_operacion: prob(0.5) ? ['admin.empresa.com'] : [],
    },
    acceso_personas: {
      apps_servicios_internet: true, admin_dispositivos: prob(0.3),
      admin_redes_servidores: prob(0.6), admin_apps: true, admin_servicio_web: true,
    },
    informacion_clientes: {
      personal: { nombre: true, identificacion: prob(0.85), direccion: prob(0.9), telefono: prob(0.75) },
      general: { id_req_compra: true, id_recibo_pago: true },
    },
    datos_corporativos: {
      nombre: true, nit: prob(0.5), direccion: prob(0.4), telefono: prob(0.3),
      redes_sociales: prob(0.3), medios_comunicacion: prob(0.2),
    },
    datos_empleados: {
      nombre: prob(0.3), nit: false, direccion: false, telefono: false,
      redes_sociales: false, medios_comunicacion: false,
    },
  }),
  servidor_erp: () => ({
    dispositivos: baseDisp({ computador_escritorio: true, laptop: true }),
    software: {
      general: {
        navegador_internet: false, sistema_operativo: true, sistema_operativo_movil: false,
        administrador_correo_elec: false, software_ofimatico: prob(0.5), antivirus: prob(0.8),
        servidor_web: false, gestion_operacion: true, base_datos: true,
        seguridad: prob(0.4), gestion_red: prob(0.3),
        cuales_aplicaciones: ['SAP', 'Oracle DB'],
      },
      especifico: { erp: true, crm: prob(0.3), cuales_aplicaciones: ['SAP Business One'] },
    },
    servicios_web: {
      servicios_web_clientes: [],
      servicios_web_operacion: ['erp.empresa.local', ...(prob(0.5) ? ['reportes.empresa.local'] : [])],
    },
    acceso_personas: {
      apps_servicios_internet: false, admin_dispositivos: prob(0.4),
      admin_redes_servidores: prob(0.5), admin_apps: true, admin_servicio_web: false,
    },
    informacion_clientes: {
      personal: { nombre: prob(0.4), identificacion: false, direccion: false, telefono: false },
      general: { id_req_compra: true, id_recibo_pago: prob(0.7) },
    },
    datos_corporativos: {
      nombre: true, nit: true, direccion: true, telefono: true,
      redes_sociales: false, medios_comunicacion: prob(0.3),
    },
    datos_empleados: {
      nombre: true, nit: true, direccion: prob(0.8), telefono: prob(0.6),
      redes_sociales: false, medios_comunicacion: false,
    },
  }),
  servidor_crm: () => ({
    dispositivos: baseDisp({ dispositivos_red: true }),
    software: {
      general: {
        navegador_internet: false, sistema_operativo: true, sistema_operativo_movil: false,
        administrador_correo_elec: false, software_ofimatico: false, antivirus: prob(0.6),
        servidor_web: true, gestion_operacion: true, base_datos: true,
        seguridad: prob(0.5), gestion_red: prob(0.3),
        cuales_aplicaciones: ['nginx', 'mysql'],
      },
      especifico: { erp: false, crm: true, cuales_aplicaciones: ['HubSpot', 'Salesforce'] },
    },
    servicios_web: {
      servicios_web_clientes: prob(0.5) ? ['portal.empresa.com'] : [],
      servicios_web_operacion: ['crm.empresa.local'],
    },
    acceso_personas: {
      apps_servicios_internet: prob(0.6), admin_dispositivos: false,
      admin_redes_servidores: prob(0.4), admin_apps: true, admin_servicio_web: prob(0.5),
    },
    informacion_clientes: {
      personal: { nombre: true, identificacion: prob(0.6), direccion: prob(0.7), telefono: true },
      general: { id_req_compra: prob(0.5), id_recibo_pago: prob(0.3) },
    },
    datos_corporativos: {
      nombre: true, nit: prob(0.4), direccion: prob(0.3), telefono: prob(0.4),
      redes_sociales: prob(0.5), medios_comunicacion: prob(0.4),
    },
    datos_empleados: {
      nombre: prob(0.4), nit: false, direccion: false, telefono: prob(0.3),
      redes_sociales: false, medios_comunicacion: false,
    },
  }),
  servidor_base_datos: () => ({
    dispositivos: baseDisp({ dispositivos_red: true }),
    software: {
      general: {
        navegador_internet: false, sistema_operativo: true, sistema_operativo_movil: false,
        administrador_correo_elec: false, software_ofimatico: false, antivirus: prob(0.6),
        servidor_web: false, gestion_operacion: false, base_datos: true,
        seguridad: prob(0.4), gestion_red: prob(0.3),
        cuales_aplicaciones: ['PostgreSQL', 'Redis'],
      },
      especifico: { erp: false, crm: false, cuales_aplicaciones: [] },
    },
    servicios_web: {
      servicios_web_clientes: [],
      servicios_web_operacion: prob(0.3) ? ['db-admin.empresa.local'] : [],
    },
    acceso_personas: {
      apps_servicios_internet: false, admin_dispositivos: false,
      admin_redes_servidores: prob(0.7), admin_apps: prob(0.5), admin_servicio_web: false,
    },
    informacion_clientes: {
      personal: { nombre: prob(0.7), identificacion: prob(0.6), direccion: prob(0.5), telefono: prob(0.6) },
      general: { id_req_compra: prob(0.6), id_recibo_pago: prob(0.5) },
    },
    datos_corporativos: {
      nombre: prob(0.6), nit: prob(0.5), direccion: prob(0.4), telefono: prob(0.3),
      redes_sociales: false, medios_comunicacion: false,
    },
    datos_empleados: {
      nombre: prob(0.6), nit: prob(0.5), direccion: prob(0.4), telefono: prob(0.4),
      redes_sociales: false, medios_comunicacion: false,
    },
  }),
  servidor_correo: () => ({
    dispositivos: baseDisp({ dispositivos_red: true }),
    software: {
      general: {
        navegador_internet: false, sistema_operativo: true, sistema_operativo_movil: false,
        administrador_correo_elec: true, software_ofimatico: false, antivirus: prob(0.7),
        servidor_web: prob(0.5), gestion_operacion: false, base_datos: prob(0.4),
        seguridad: prob(0.6), gestion_red: prob(0.5),
        cuales_aplicaciones: ['Postfix', 'Dovecot'],
      },
      especifico: { erp: false, crm: false, cuales_aplicaciones: [] },
    },
    servicios_web: {
      servicios_web_clientes: ['mail.empresa.com'],
      servicios_web_operacion: prob(0.4) ? ['webmail.empresa.local'] : [],
    },
    acceso_personas: {
      apps_servicios_internet: true, admin_dispositivos: false,
      admin_redes_servidores: prob(0.4), admin_apps: prob(0.3), admin_servicio_web: prob(0.5),
    },
    informacion_clientes: {
      personal: { nombre: prob(0.5), identificacion: false, direccion: prob(0.3), telefono: prob(0.4) },
      general: { id_req_compra: false, id_recibo_pago: false },
    },
    datos_corporativos: {
      nombre: true, nit: prob(0.3), direccion: prob(0.3), telefono: prob(0.4),
      redes_sociales: prob(0.3), medios_comunicacion: prob(0.4),
    },
    datos_empleados: {
      nombre: prob(0.5), nit: false, direccion: false, telefono: prob(0.4),
      redes_sociales: false, medios_comunicacion: false,
    },
  }),
  servidor_web_corporativo: () => ({
    dispositivos: baseDisp({ dispositivos_red: true }),
    software: {
      general: {
        navegador_internet: false, sistema_operativo: true, sistema_operativo_movil: false,
        administrador_correo_elec: false, software_ofimatico: false, antivirus: prob(0.5),
        servidor_web: true, gestion_operacion: false, base_datos: prob(0.5),
        seguridad: prob(0.4), gestion_red: prob(0.2),
        cuales_aplicaciones: ['Apache', 'WordPress'],
      },
      especifico: { erp: false, crm: false, cuales_aplicaciones: [] },
    },
    servicios_web: {
      servicios_web_clientes: ['www.empresa.com', ...(prob(0.4) ? ['blog.empresa.com'] : [])],
      servicios_web_operacion: [],
    },
    acceso_personas: {
      apps_servicios_internet: true, admin_dispositivos: false,
      admin_redes_servidores: false, admin_apps: prob(0.3), admin_servicio_web: prob(0.6),
    },
    informacion_clientes: {
      personal: { nombre: prob(0.2), identificacion: false, direccion: false, telefono: prob(0.2) },
      general: { id_req_compra: false, id_recibo_pago: false },
    },
    datos_corporativos: {
      nombre: true, nit: prob(0.4), direccion: prob(0.6), telefono: prob(0.6),
      redes_sociales: prob(0.6), medios_comunicacion: prob(0.5),
    },
    datos_empleados: {
      nombre: false, nit: false, direccion: false, telefono: false,
      redes_sociales: false, medios_comunicacion: false,
    },
  }),
  workstation_admin: () => ({
    dispositivos: baseDisp({ computador_escritorio: prob(0.5), laptop: prob(0.5) }),
    software: {
      general: {
        navegador_internet: true, sistema_operativo: true, sistema_operativo_movil: false,
        administrador_correo_elec: prob(0.7), software_ofimatico: true, antivirus: prob(0.8),
        servidor_web: false, gestion_operacion: prob(0.4), base_datos: prob(0.3),
        seguridad: prob(0.6), gestion_red: prob(0.7),
        cuales_aplicaciones: ['Windows 11', 'PuTTY'],
      },
      especifico: { erp: prob(0.4), crm: prob(0.3), cuales_aplicaciones: [] },
    },
    servicios_web: {
      servicios_web_clientes: [],
      servicios_web_operacion: prob(0.3) ? ['admin-panel.empresa.local'] : [],
    },
    acceso_personas: {
      apps_servicios_internet: prob(0.4), admin_dispositivos: true,
      admin_redes_servidores: true, admin_apps: true, admin_servicio_web: prob(0.6),
    },
    informacion_clientes: {
      personal: { nombre: prob(0.3), identificacion: false, direccion: false, telefono: false },
      general: { id_req_compra: prob(0.3), id_recibo_pago: false },
    },
    datos_corporativos: {
      nombre: prob(0.5), nit: prob(0.4), direccion: false, telefono: false,
      redes_sociales: false, medios_comunicacion: false,
    },
    datos_empleados: {
      nombre: prob(0.4), nit: prob(0.3), direccion: false, telefono: false,
      redes_sociales: false, medios_comunicacion: false,
    },
  }),
  workstation_empleado: () => ({
    dispositivos: baseDisp({ computador_escritorio: prob(0.7), laptop: prob(0.3) }),
    software: {
      general: {
        navegador_internet: true, sistema_operativo: true, sistema_operativo_movil: false,
        administrador_correo_elec: prob(0.6), software_ofimatico: true, antivirus: prob(0.7),
        servidor_web: false, gestion_operacion: prob(0.2), base_datos: false,
        seguridad: prob(0.3), gestion_red: false,
        cuales_aplicaciones: ['Windows 11', 'Office 365'],
      },
      especifico: { erp: prob(0.2), crm: prob(0.2), cuales_aplicaciones: [] },
    },
    servicios_web: { servicios_web_clientes: [], servicios_web_operacion: [] },
    acceso_personas: {
      apps_servicios_internet: prob(0.3), admin_dispositivos: false,
      admin_redes_servidores: false, admin_apps: false, admin_servicio_web: false,
    },
    informacion_clientes: {
      personal: { nombre: prob(0.1), identificacion: false, direccion: false, telefono: false },
      general: { id_req_compra: prob(0.2), id_recibo_pago: false },
    },
    datos_corporativos: {
      nombre: prob(0.3), nit: false, direccion: false, telefono: false,
      redes_sociales: false, medios_comunicacion: false,
    },
    datos_empleados: {
      nombre: false, nit: false, direccion: false, telefono: false,
      redes_sociales: false, medios_comunicacion: false,
    },
  }),
  terminal_pos: () => ({
    dispositivos: baseDisp({ computador_escritorio: true, datafono: true, lector_codigos: prob(0.7) }),
    software: {
      general: {
        navegador_internet: false, sistema_operativo: true, sistema_operativo_movil: false,
        administrador_correo_elec: false, software_ofimatico: false, antivirus: prob(0.5),
        servidor_web: false, gestion_operacion: true, base_datos: false,
        seguridad: prob(0.3), gestion_red: false,
        cuales_aplicaciones: ['Software POS'],
      },
      especifico: { erp: false, crm: false, cuales_aplicaciones: [] },
    },
    servicios_web: { servicios_web_clientes: [], servicios_web_operacion: [] },
    acceso_personas: {
      apps_servicios_internet: false, admin_dispositivos: false,
      admin_redes_servidores: false, admin_apps: false, admin_servicio_web: false,
    },
    informacion_clientes: {
      personal: { nombre: false, identificacion: false, direccion: false, telefono: false },
      general: { id_req_compra: true, id_recibo_pago: prob(0.4) },
    },
    datos_corporativos: {
      nombre: false, nit: false, direccion: false, telefono: false,
      redes_sociales: false, medios_comunicacion: false,
    },
    datos_empleados: {
      nombre: false, nit: false, direccion: false, telefono: false,
      redes_sociales: false, medios_comunicacion: false,
    },
  }),
  laptop_campo: () => ({
    dispositivos: baseDisp({ laptop: true, celular_inteligente: prob(0.5) }),
    software: {
      general: {
        navegador_internet: true, sistema_operativo: true, sistema_operativo_movil: false,
        administrador_correo_elec: prob(0.6), software_ofimatico: true, antivirus: prob(0.6),
        servidor_web: false, gestion_operacion: prob(0.2), base_datos: false,
        seguridad: prob(0.2), gestion_red: false,
        cuales_aplicaciones: ['Windows 11'],
      },
      especifico: { erp: prob(0.1), crm: prob(0.1), cuales_aplicaciones: [] },
    },
    servicios_web: { servicios_web_clientes: [], servicios_web_operacion: [] },
    acceso_personas: {
      apps_servicios_internet: prob(0.2), admin_dispositivos: false,
      admin_redes_servidores: false, admin_apps: false, admin_servicio_web: false,
    },
    informacion_clientes: {
      personal: { nombre: false, identificacion: false, direccion: false, telefono: false },
      general: { id_req_compra: prob(0.1), id_recibo_pago: false },
    },
    datos_corporativos: {
      nombre: prob(0.2), nit: false, direccion: false, telefono: false,
      redes_sociales: false, medios_comunicacion: false,
    },
    datos_empleados: {
      nombre: false, nit: false, direccion: false, telefono: false,
      redes_sociales: false, medios_comunicacion: false,
    },
  }),
};

const NAMES: Record<AssetProfile, string> = {
  servidor_ecommerce: 'Servidor E-Commerce',
  servidor_erp: 'Sistema ERP',
  servidor_crm: 'Servidor CRM',
  servidor_base_datos: 'Servidor Base de Datos',
  servidor_correo: 'Servidor de Correo',
  servidor_web_corporativo: 'Servidor Web Corporativo',
  workstation_admin: 'Workstation Administrador',
  workstation_empleado: 'Workstation Empleado',
  terminal_pos: 'Terminal POS',
  laptop_campo: 'Laptop de Campo',
};

const DESCRIPTIONS: Record<AssetProfile, string> = {
  servidor_ecommerce: 'Servidor de tienda online con manejo de pagos y datos personales de clientes',
  servidor_erp: 'Sistema ERP: gestiona nomina, inventario, contabilidad y datos de empleados',
  servidor_crm: 'Sistema CRM: historial de clientes, oportunidades de venta y contactos',
  servidor_base_datos: 'Servidor dedicado de base de datos; centraliza informacion del negocio',
  servidor_correo: 'Servidor de correo corporativo; gestiona comunicaciones internas y externas',
  servidor_web_corporativo: 'Sitio web publico de la empresa con informacion corporativa',
  workstation_admin: 'Equipo de TI con acceso privilegiado a servidores y sistemas',
  workstation_empleado: 'Equipo de uso general de empleado para tareas de oficina',
  terminal_pos: 'Terminal de punto de venta en tienda fisica con datafono',
  laptop_campo: 'Portatil de empleado de campo para trabajo fuera de oficina',
};

const WEIGHTED_POOL: AssetProfile[] = [
  'workstation_empleado', 'workstation_empleado', 'workstation_empleado',
  'servidor_ecommerce', 'servidor_ecommerce',
  'servidor_erp', 'servidor_erp',
  'servidor_crm', 'servidor_crm',
  'servidor_base_datos', 'servidor_base_datos',
  'terminal_pos', 'terminal_pos',
  'servidor_web_corporativo',
  'workstation_admin',
  'servidor_correo',
  'laptop_campo',
];

export function generateRandomAssets(count: number): GeneratedAsset[] {
  const shuffledPool = shuffle(WEIGHTED_POOL);
  const counters: Partial<Record<AssetProfile, number>> = {};

  return Array.from({ length: count }, (_, i) => {
    const profile = shuffledPool[i % shuffledPool.length] as AssetProfile;
    counters[profile] = (counters[profile] ?? 0) + 1;
    const seq = counters[profile]!;

    return {
      _id: fakeId(),
      id: `BULK-${String(i + 1).padStart(3, '0')}`,
      name: `${NAMES[profile]} #${seq}`,
      description: DESCRIPTIONS[profile],
      profile,
      vulnerableThreats: [],
      ...FACTORIES[profile](),
    };
  });
}

export function pickRandom<T>(arr: T[], min: number, max: number): T[] {
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  return pickN(arr, Math.min(n, arr.length));
}