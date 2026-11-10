# Clasificadores de Amenazas

Este directorio contiene dos clasificadores de amenazas. Ambos son **funciones puras** (sin side effects, sin I/O, determinísticas).

---

## `threat-classifier.ts` — v1 (texto + flags CIA)

Clasificación basada en keywords sobre `description` + flags de origen `["A","D","E"]` + flags CIA.

**Entrada:** `AmenazaInput` con `description: string`, `origin: string[]`, `affectsConfidentiality/Integrity/Availability: boolean`

**Uso:**
```typescript
import { clasificarAmenaza } from './threat-classifier';
const resultado = clasificarAmenaza(vulnerability, patterns);
```

---

## `clasificador.ts` — v2 (activos booleanos)

Clasificación basada en los campos booleanos de `vulnerable_assets` (qué activo está expuesto), el origen (accidental/deliberado/ambiental) y los flags de afectación CIA.

### Entrada

```typescript
interface AmenazaInput {
  id: string;
  description?: string;
  origin?: { accidental?: boolean; deliberate?: boolean; environmental?: boolean };
  affects?: { confidentiality?: boolean; integrity?: boolean; availability?: boolean };
  vulnerable_assets?: VulnerableAssets;
  logging_level?: 'not_logged' | 'partial' | 'full';
}
```

Los campos de `vulnerable_assets` son los que determinan el grupo en la mayoría de los pasos.

### Árbol de decisión (pseudocódigo)

```
clasificarAmenaza(amenaza, patrones):

  o  = amenaza.origin
  va = amenaza.vulnerable_assets
  sg = va.software.general
  se = va.software.especifico
  sw = va.servicios_web
  ap = va.acceso_personas
  ic = va.informacion_clientes
  af = amenaza.affects

  // PASO 1 — Origen ambiental (máxima prioridad)
  // Eventos naturales o ambientales prevalecen sobre cualquier otro vector.
  if o.environmental:
    return Grupo 1

  // PASO 2 — Robo físico deliberado
  // Dispositivos físicos son el blanco, pero SIN componentes técnicos de red o aplicación.
  if o.deliberate AND va.dispositivos
     AND NOT sg.gestion_red AND NOT sg.seguridad
     AND NOT sg.servidor_web AND NOT sg.base_datos
     AND NOT sw.servicios_web_clientes:
    return Grupo 3

  // PASO 3 — Fallo accidental puro
  // Solo aplica cuando el origen es EXCLUSIVAMENTE accidental (sin componente deliberado).
  if o.accidental AND NOT o.deliberate:
    return Grupo 4

  // PASO 4 — Amenaza de red y perímetro
  if o.deliberate AND (sg.gestion_red OR sg.seguridad OR ap.admin_redes_servidores):
    return Grupo 5

  // PASO 5 — Amenaza de aplicaciones y datos
  if o.deliberate AND (sg.servidor_web OR sg.base_datos
     OR sw.servicios_web_clientes OR sw.servicios_web_operacion
     OR se.erp OR se.crm OR ap.admin_apps OR ap.admin_servicio_web):
    return Grupo 6

  // PASO 6 — Interceptación / espionaje pasivo
  // Amenaza pasiva de confidencialidad: afecta confidentiality pero NO availability.
  if o.deliberate AND af.confidentiality AND NOT af.availability
     AND (ic.personal OR ic.general OR va.datos_corporativos):
    return Grupo 2

  // PASO 7 — Residual (endpoints y malware)
  // Confianza siempre baja — verificar que los activos estén correctamente marcados.
  return Grupo 7
```

### Tabla de grupos

| # | Nombre | Condición principal | Patrones OSA (keywords) | Familias NIST | ATT&CK |
|---|--------|--------------------|--------------------------|--------------| -------|
| 1 | Amenazas Físicas y Ambientales | `origin.environmental` | physical, site, continuity, backup | PE, CP, MP | null |
| 2 | Interceptación y Espionaje | `deliberate` + `confidentiality` + `!availability` + datos sensibles | encrypt, communicat, data protection, secure channel | SC, SI, AC, AU | T1040, T1557 |
| 3 | Robo y Acceso Físico No Autorizado | `deliberate` + `dispositivos` (sin activos técnicos) | physical, media, asset | PE, MP, AC, CM | null |
| 4 | Fallos y Mal Funcionamiento | `accidental` + `!deliberate` | availability, continuity, backup, configuration, patch, vulnerability | CP, CM, SA, SI, AT | null |
| 5 | Amenazas de Red y Perímetro | `deliberate` + red/seguridad/admin_redes | network, dmz, firewall, perimeter, zone, boundary | SC, SI, AU, IR, AC | T1498, T1499, T1562, T1557, T1110 |
| 6 | Amenazas a Aplicaciones y Datos | `deliberate` + servidor_web/base_datos/servicios_web/ERP/apps | web application, database, api, application security | SI, AC, SC, AU, SA | T1190, T1059, T1110, T1557 |
| 7 | Endpoints y Software Malicioso | Residual (ninguno de los anteriores) | endpoint, client, identity, access management, awareness | AC, SI, AT, IR, CM, RA | T1566, T1547, T1078, T1068 |

### Confianza

| Valor | Cuándo |
|-------|--------|
| `alta` | El grupo fue determinado por campos `vulnerable_assets` específicos, o por flags de origen puros (Grupos 1 y 4) |
| `media` | El grupo fue alcanzado por flags de origen/CIA pero sin activos booleanos concretos que lo confirmen |
| `baja` | Cayó en Grupo 7 por descarte — verificar que `vulnerable_assets` esté completo |

### Alertas de logging

| `logging_level` | Alerta | Controles requeridos |
|-----------------|--------|----------------------|
| `not_logged` | CRÍTICA — sin trazabilidad | AU-02, AU-03, AU-08, AU-12 |
| `not_logged` + `deliberate` + `confidentiality` | CRÍTICA adicional — sin evidencia forense | AU-09, AU-11, IR-05 |
| `partial` | MEDIA — gaps de visibilidad | AU-02, AU-12 |
| `full` + `deliberate` | INFORMATIVA — verificar envío a SIEM externo | AU-09 |

### Controles adicionales por activo

Independientemente del grupo, ciertos activos generan controles adicionales:

| Activo | Controles |
|--------|-----------|
| `informacion_clientes.personal` | SC-28, AC-03 |
| `datos_empleados` | AC-06 |
| `software.general.antivirus` | SI-03, SI-07 |
| `software.general.sistema_operativo` | CM-06, CM-07 |
| `software.general.navegador_internet` | SC-18, CM-07 |
| `software.general.administrador_correo_elec` | SI-08, AT-02 |
| `acceso_personas.admin_dispositivos` | AC-05, AU-09 |
| `acceso_personas.apps_servicios_internet` | IA-02, AC-14 |
| `software.especifico.erp` o `crm` | AC-04, AU-10 |

Los controles adicionales se deducan por `id` manteniendo la primera aparición.

### Subfunciones exportadas

```typescript
extraerActivosVulnerables(amenaza)         // → string[] con paths de activos activos
seleccionarPatrones(grupo, patrones)       // → PatronResult[] filtrados por familia NIST
controlesAdicionalesPorActivos(amenaza)    // → ControlAdicional[] deduplicados
alertasLogging(amenaza)                    // → AlertaLogging[]
calcularConfianza(amenaza, grupo)          // → 'alta' | 'media' | 'baja'
construirRutaMapeo(amenaza, grupo, patrones) // → string con trazabilidad ISO/MAGERIT
```

### Uso

```typescript
import { clasificarAmenaza, AmenazaInput, PatronOSA } from './clasificador';

const resultado = clasificarAmenaza(amenaza, patrones);
// resultado.grupo.numero     → 1..7
// resultado.patronesOSA      → PatronResult[] con controles NIST filtrados
// resultado.tecnicasATTACK   → string[] | null
// resultado.confianza        → 'alta' | 'media' | 'baja'
// resultado.alertasLogging   → AlertaLogging[]
// resultado.controlesAdicionalesPorActivos → ControlAdicional[]
// resultado.ambiguedad       → string | null
// resultado.rutaMapeo        → 'ISO/MAGERIT:id → vulnerable_assets:... → Grupo5 → SP-016 → SC-07,...'
```

---

## Limitaciones conocidas

### Paso 2 vs Paso 4/5/6 (dispositivos físicos + activos técnicos)

Si una amenaza marca `dispositivos: true` junto con activos de red o aplicación (e.g., `gestion_red: true`), el Paso 2 se excluye y la amenaza cae en Grupo 5 o 6. El clasificador reporta esto como ambigüedad.

### Paso 3 (accidental) con origen mixto A+D

Si `accidental: true` y `deliberate: true` simultáneamente, el Paso 3 se salta por completo. El árbol trata el vector deliberado como predominante y continúa a Paso 4-6. La ambigüedad se reporta en `resultado.ambiguedad`.

### Grupo 7 por descarte

Si ningún activo `vulnerable_assets` es `true` y el origen no es ambiental ni puramente accidental, la amenaza cae en Grupo 7 con confianza `baja`. Esto es correcto como default pero requiere verificación manual de que los activos estén completos en el registro.

### Paso 6 (espionaje) estrecho

Para activar Grupo 2 se requiere simultáneamente: `deliberate`, `confidentiality: true`, `availability: false`, y al menos un activo de información (`informacion_clientes.personal/general` o `datos_corporativos`). Una amenaza de espionaje sin esos activos marcados cae en Grupo 7.

---

## Cómo extender el clasificador

### Agregar un nuevo activo en `controlesAdicionalesPorActivos`

1. Añadir el campo booleano en la interfaz `VulnerableAssets`.
2. Agregar el `if` correspondiente en `controlesAdicionalesPorActivos`.
3. Actualizar `extraerActivosVulnerables` si el activo debe aparecer en la ruta.
4. Escribir al menos un caso de prueba en `clasificador.spec.ts`.

### Agregar un nuevo grupo

1. Añadir entrada en `GRUPOS_DEF` con `nombre`, `condicionArquitectural`, `patronKeywords`, `familiasNIST`, `attck`.
2. Insertar el paso en el árbol de `clasificarAmenaza` con las condiciones booleanas correspondientes.
3. Añadir a `GRUPOS_SIN_ATTCK` si el vector es físico o puramente accidental.
4. Actualizar `vaUsado` en `calcularConfianza` para el nuevo grupo.
5. Escribir casos de prueba en `clasificador.spec.ts`.

### Agregar una técnica ATT&CK

Añadir una entrada en `ATTACK_KEYWORDS`:
```typescript
T1595: ['reconocimiento activo', 'escaneo', 'fingerprint'],
```
La técnica se detectará automáticamente desde `amenaza.description` para grupos que no están en `GRUPOS_SIN_ATTCK` (1, 3, 4).
