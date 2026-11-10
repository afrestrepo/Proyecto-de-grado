// ─── Tipos de entrada ─────────────────────────────────────────────────────────

export interface AmenazaOrigin {
  accidental?: boolean;
  deliberate?: boolean;
  environmental?: boolean;
}

export interface AmenazaAffects {
  confidentiality?: boolean;
  integrity?: boolean;
  availability?: boolean;
}

export interface SoftwareGeneral {
  sistema_operativo?: boolean;
  navegador_internet?: boolean;
  administrador_correo_elec?: boolean;
  software_ofimatico?: boolean;
  antivirus?: boolean;
  servidor_web?: boolean;
  gestion_operacion?: boolean;
  base_datos?: boolean;
  seguridad?: boolean;
  gestion_red?: boolean;
}

export interface VulnerableAssets {
  software?: {
    general?: SoftwareGeneral;
    especifico?: { erp?: boolean; crm?: boolean };
  };
  servicios_web?: {
    servicios_web_clientes?: boolean;
    servicios_web_operacion?: boolean;
  };
  acceso_personas?: {
    apps_servicios_internet?: boolean;
    admin_dispositivos?: boolean;
    admin_redes_servidores?: boolean;
    admin_apps?: boolean;
    admin_servicio_web?: boolean;
  };
  informacion_clientes?: {
    personal?: boolean;
    general?: boolean;
  };
  dispositivos?: boolean;
  datos_corporativos?: boolean;
  datos_empleados?: boolean;
}

export interface AmenazaInput {
  _id?: { $oid: string };
  id: string;
  description?: string;
  affects?: AmenazaAffects;
  assets?: { data?: boolean; services?: boolean };
  people?: boolean;
  origin?: AmenazaOrigin;
  vulnerable_assets?: VulnerableAssets;
  logging_level?: 'not_logged' | 'partial' | 'full';
  __v?: number;
}

// ─── Tipos de patrón OSA ──────────────────────────────────────────────────────

export interface ControlOSA {
  id: string;
  name: string;
  family: string;
  familyName?: string;
  baselineLow?: boolean;
  baselineModerate?: boolean;
  baselineHigh?: boolean;
}

export interface PatronOSA {
  id: string;
  slug: string;
  title: string;
  description?: string;
  classification?: string;
  status?: string;
  controls: ControlOSA[];
  [key: string]: unknown;
}

// ─── Tipos de salida ──────────────────────────────────────────────────────────

export interface ControlMapeado {
  codigo: string;
  familia: string;
  nombre: string;
  descripcion: string | null;
  descripcionEs: string | null;
}

export interface MapeoItem {
  patron_osa: string | null;
  nombre_patron: string;
  controles: ControlMapeado[];
}

export interface Clasificacion {
  threat_id: string;
  grupo: number;
  nombre_grupo: string;
  requiere_revision_manual: boolean;
  justificacion: string;
  mapeo: MapeoItem[];
}

// ─── Definición de los 7 grupos ───────────────────────────────────────────────

interface GrupoDefinicion {
  nombre: string;
  condicionArquitectural: string;
}

const GRUPOS_DEF: Record<number, GrupoDefinicion> = {
  1: {
    nombre: 'Amenazas Físicas y Ambientales',
    condicionArquitectural:
      'Ausencia de controles físicos, ambientales y de planes de continuidad de negocio',
  },
  2: {
    nombre: 'Interceptación y Espionaje',
    condicionArquitectural:
      'Comunicaciones sin cifrar, sin control de flujo de información, exposición de datos sensibles en tránsito',
  },
  3: {
    nombre: 'Robo y Acceso Físico No Autorizado',
    condicionArquitectural:
      'Sin control de acceso físico, dispositivos sin cifrar, sin gestión de medios de almacenamiento',
  },
  4: {
    nombre: 'Fallos y Mal Funcionamiento de Sistemas',
    condicionArquitectural:
      'Sin gestión de parches, sin baseline de configuración, sin planes de contingencia operativos',
  },
  5: {
    nombre: 'Amenazas de Red y Perímetro',
    condicionArquitectural:
      'Red plana sin segmentación, sin monitoreo activo, sin control de acceso perimetral',
  },
  6: {
    nombre: 'Amenazas a Aplicaciones y Datos',
    condicionArquitectural:
      'Entrada no validada, sin separación de capas, sin gestión segura de sesiones ni consultas parametrizadas',
  },
  7: {
    nombre: 'Amenazas a Endpoints y Software Malicioso',
    condicionArquitectural:
      'Dispositivos sin bastionado, sin protección de malware actualizada, sin gestión de identidad ni acceso privilegiado',
  },
};

// ─── Patrones OSA por grupo (grupos 2, 5, 6) ─────────────────────────────────

const PATRONES_POR_GRUPO: Record<number, string[]> = {
  2: ['SP-013', 'SP-039'],
  5: ['SP-016'],
  6: ['SP-030'],
};

const FAMILIAS_POR_GRUPO: Record<number, string[]> = {
  2: ['SC', 'SI', 'AC', 'AU'],
  5: ['SC', 'SI', 'AU', 'AC'],
  6: ['SI', 'AC', 'IA', 'SC'],
};

// ─── Controles base para grupos sin patrón OSA ───────────────────────────────
// Solo definen QUÉ controles aplican. nombre y descripcion los enriquece MappingService desde la BD.

type BaseControl = { codigo: string; familia: string };

const CONTROLES_BASE_GRUPO1: BaseControl[] = [
  { codigo: 'PE-01', familia: 'PE' }, { codigo: 'PE-02', familia: 'PE' },
  { codigo: 'PE-03', familia: 'PE' }, { codigo: 'PE-06', familia: 'PE' },
  { codigo: 'PE-09', familia: 'PE' }, { codigo: 'PE-10', familia: 'PE' },
  { codigo: 'PE-11', familia: 'PE' }, { codigo: 'PE-12', familia: 'PE' },
  { codigo: 'PE-13', familia: 'PE' }, { codigo: 'PE-14', familia: 'PE' },
  { codigo: 'PE-15', familia: 'PE' }, { codigo: 'PE-18', familia: 'PE' },
  { codigo: 'CP-01', familia: 'CP' }, { codigo: 'CP-02', familia: 'CP' },
  { codigo: 'CP-04', familia: 'CP' }, { codigo: 'CP-06', familia: 'CP' },
  { codigo: 'CP-07', familia: 'CP' }, { codigo: 'CP-08', familia: 'CP' },
  { codigo: 'CP-09', familia: 'CP' }, { codigo: 'CP-10', familia: 'CP' },
  { codigo: 'MP-01', familia: 'MP' }, { codigo: 'MP-02', familia: 'MP' },
  { codigo: 'MP-04', familia: 'MP' }, { codigo: 'MP-05', familia: 'MP' },
  { codigo: 'MP-06', familia: 'MP' },
];

const CONTROLES_BASE_GRUPO3: BaseControl[] = [
  { codigo: 'PE-02', familia: 'PE' }, { codigo: 'PE-03', familia: 'PE' },
  { codigo: 'PE-05', familia: 'PE' }, { codigo: 'PE-06', familia: 'PE' },
  { codigo: 'PE-08', familia: 'PE' }, { codigo: 'MP-02', familia: 'MP' },
  { codigo: 'MP-03', familia: 'MP' }, { codigo: 'MP-04', familia: 'MP' },
  { codigo: 'MP-05', familia: 'MP' }, { codigo: 'MP-06', familia: 'MP' },
  { codigo: 'AC-03', familia: 'AC' }, { codigo: 'AC-06', familia: 'AC' },
  { codigo: 'AC-19', familia: 'AC' }, { codigo: 'CM-02', familia: 'CM' },
  { codigo: 'CM-06', familia: 'CM' }, { codigo: 'CM-08', familia: 'CM' },
];

const CONTROLES_BASE_GRUPO4: BaseControl[] = [
  { codigo: 'CP-02', familia: 'CP' }, { codigo: 'CP-04', familia: 'CP' },
  { codigo: 'CP-07', familia: 'CP' }, { codigo: 'CP-09', familia: 'CP' },
  { codigo: 'CP-10', familia: 'CP' }, { codigo: 'CM-02', familia: 'CM' },
  { codigo: 'CM-03', familia: 'CM' }, { codigo: 'CM-04', familia: 'CM' },
  { codigo: 'CM-06', familia: 'CM' }, { codigo: 'SA-08', familia: 'SA' },
  { codigo: 'SA-10', familia: 'SA' }, { codigo: 'SA-11', familia: 'SA' },
  { codigo: 'SI-02', familia: 'SI' }, { codigo: 'SI-07', familia: 'SI' },
  { codigo: 'SI-10', familia: 'SI' }, { codigo: 'SI-11', familia: 'SI' },
  { codigo: 'AT-02', familia: 'AT' }, { codigo: 'AT-03', familia: 'AT' },
  { codigo: 'AT-04', familia: 'AT' },
];

const CONTROLES_BASE: Record<number, BaseControl[]> = {
  1: CONTROLES_BASE_GRUPO1,
  3: CONTROLES_BASE_GRUPO3,
  4: CONTROLES_BASE_GRUPO4,
};

function baseToMapeado(c: BaseControl): ControlMapeado {
  return { codigo: c.codigo, familia: c.familia, nombre: c.codigo, descripcion: null, descripcionEs: null };
}

// ─── Subfunciones exportadas ───────────────────────────────────────────────────

/**
 * Extrae la lista plana de rutas de activos vulnerables activos (valor = true).
 */
export function extraerActivosVulnerables(amenaza: AmenazaInput): string[] {
  const va = amenaza.vulnerable_assets;
  if (!va) return [];

  const activos: string[] = [];
  const sg = va.software?.general ?? {};
  const se = va.software?.especifico ?? {};
  const sw = va.servicios_web ?? {};
  const ap = va.acceso_personas ?? {};
  const ic = va.informacion_clientes ?? {};

  if (sg.sistema_operativo)         activos.push('software.general.sistema_operativo');
  if (sg.navegador_internet)        activos.push('software.general.navegador_internet');
  if (sg.administrador_correo_elec) activos.push('software.general.administrador_correo_elec');
  if (sg.software_ofimatico)        activos.push('software.general.software_ofimatico');
  if (sg.antivirus)                 activos.push('software.general.antivirus');
  if (sg.servidor_web)              activos.push('software.general.servidor_web');
  if (sg.gestion_operacion)         activos.push('software.general.gestion_operacion');
  if (sg.base_datos)                activos.push('software.general.base_datos');
  if (sg.seguridad)                 activos.push('software.general.seguridad');
  if (sg.gestion_red)               activos.push('software.general.gestion_red');

  if (se.erp) activos.push('software.especifico.erp');
  if (se.crm) activos.push('software.especifico.crm');

  if (sw.servicios_web_clientes)  activos.push('servicios_web.servicios_web_clientes');
  if (sw.servicios_web_operacion) activos.push('servicios_web.servicios_web_operacion');

  if (ap.apps_servicios_internet) activos.push('acceso_personas.apps_servicios_internet');
  if (ap.admin_dispositivos)      activos.push('acceso_personas.admin_dispositivos');
  if (ap.admin_redes_servidores)  activos.push('acceso_personas.admin_redes_servidores');
  if (ap.admin_apps)              activos.push('acceso_personas.admin_apps');
  if (ap.admin_servicio_web)      activos.push('acceso_personas.admin_servicio_web');

  if (ic.personal)           activos.push('informacion_clientes.personal');
  if (ic.general)            activos.push('informacion_clientes.general');
  if (va.dispositivos)       activos.push('dispositivos');
  if (va.datos_corporativos) activos.push('datos_corporativos');
  if (va.datos_empleados)    activos.push('datos_empleados');

  return activos;
}

/**
 * Construye los ítems de mapeo para el grupo dado.
 * Grupos 1/3/4 → lista base de controles sin patrón OSA.
 * Grupos 2/5/6 → patrones OSA específicos filtrados por familia.
 * Grupo 7      → array vacío.
 */
export function seleccionarPatrones(grupo: number, patrones: PatronOSA[]): MapeoItem[] {
  if (grupo in CONTROLES_BASE) {
    return [{
      patron_osa: null,
      nombre_patron: 'Sin patrón OSA',
      controles: CONTROLES_BASE[grupo].map(baseToMapeado),
    }];
  }

  if (grupo === 7) return [];

  const ids     = PATRONES_POR_GRUPO[grupo] ?? [];
  const familias = FAMILIAS_POR_GRUPO[grupo] ?? [];

  const items: MapeoItem[] = [];
  for (const patronId of ids) {
    const patron = patrones.find((p) => p.id === patronId);
    if (!patron) continue;
    items.push({
      patron_osa: patron.id,
      nombre_patron: patron.title,
      controles: patron.controls
        .filter((c) => familias.includes(c.family))
        .map((c) => ({
          codigo: c.id,
          familia: c.family,
          nombre: c.name,
          descripcion: null,
          descripcionEs: null,
        })),
    });
  }
  return items;
}

// ─── Constructor interno de resultado ─────────────────────────────────────────

function clasificacion(
  grupo: number,
  amenaza: AmenazaInput,
  patrones: PatronOSA[],
): Clasificacion {
  const def = GRUPOS_DEF[grupo];
  return {
    threat_id: amenaza.id,
    grupo,
    nombre_grupo: def.nombre,
    requiere_revision_manual: grupo === 7,
    justificacion: def.condicionArquitectural,
    mapeo: seleccionarPatrones(grupo, patrones),
  };
}

// ─── Clasificador principal ────────────────────────────────────────────────────

/**
 * Función pura: sin fetch, sin archivos, sin side effects.
 * Determinístico: misma entrada → misma salida siempre.
 */
export function clasificarAmenaza(
  amenaza: AmenazaInput,
  patrones: PatronOSA[],
): Clasificacion {
  const o  = amenaza.origin           ?? {};
  const va = amenaza.vulnerable_assets ?? {};
  const af = amenaza.affects           ?? {};
  const sg = va.software?.general      ?? {};
  const se = va.software?.especifico   ?? {};
  const sw = va.servicios_web          ?? {};
  const ap = va.acceso_personas        ?? {};
  const ic = va.informacion_clientes   ?? {};

  // ── PASO 1: Origen ambiental (máxima prioridad) ───────────────────────────
  if (o.environmental) {
    return clasificacion(1, amenaza, patrones);
  }

  // ── PASO 2: Vector físico deliberado ──────────────────────────────────────
  if (
    o.deliberate &&
    va.dispositivos &&
    !sg.gestion_red &&
    !sg.seguridad &&
    !ap.admin_redes_servidores &&
    !sg.servidor_web &&
    !sg.base_datos &&
    !se.erp &&
    !se.crm &&
    !sw.servicios_web_clientes &&
    !sw.servicios_web_operacion
  ) {
    return clasificacion(3, amenaza, patrones);
  }

  // ── PASO 3: Fallo interno accidental puro ─────────────────────────────────
  if (o.accidental && !o.deliberate) {
    return clasificacion(4, amenaza, patrones);
  }

  // ── PASO 4: Vector de red y perímetro ────────────────────────────────────
  if (o.deliberate && (sg.gestion_red || sg.seguridad || ap.admin_redes_servidores)) {
    return clasificacion(5, amenaza, patrones);
  }

  // ── PASO 5: Vector de aplicación y datos ──────────────────────────────────
  if (
    o.deliberate && (
      sg.servidor_web ||
      sg.base_datos   ||
      sw.servicios_web_clientes ||
      sw.servicios_web_operacion ||
      se.erp ||
      se.crm ||
      ap.admin_apps ||
      ap.admin_servicio_web
    )
  ) {
    return clasificacion(6, amenaza, patrones);
  }

  // ── PASO 6: Interceptación / espionaje pasivo remoto ─────────────────────
  if (
    o.deliberate &&
    af.confidentiality &&
    !af.availability &&
    (ic.personal || ic.general || va.datos_corporativos)
  ) {
    return clasificacion(2, amenaza, patrones);
  }

  // ── PASO 7: Residual — endpoints y software malicioso ────────────────────
  return clasificacion(7, amenaza, patrones);
}
