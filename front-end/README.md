# Evaluador de Riesgos — PYMEs

Front-end del sistema de evaluación de riesgos de seguridad de la información para pequeñas y medianas empresas.

## Stack tecnológico

| Tecnología | Versión |
|---|---|
| Next.js (App Router) | 16 |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | 4 |

El backend es un servicio separado; las rutas de `app/api/` actúan como proxy.

## Requisitos funcionales implementados

El proyecto implementa 4 de los 9 requisitos funcionales definidos, presentados como un **stepper** (asistente por pasos) dentro de cada evaluación:

| Paso | RF | Descripción |
|---|---|---|
| 1 — Identificación | RF-3 | Registro y clasificación de vulnerabilidades |
| 2 — Análisis | RF-4 | Cálculo de probabilidad e impacto (OWASP) |
| 3 — Tratamiento | RF-6 | Selección de estrategia: mitigar, evadir, transferir o aceptar |
| 4 — Seguimiento | RF-8 | Gestión del ciclo de vida de tareas derivadas |

Los requisitos restantes (RF-1, RF-2, RF-5, RF-7, RF-9) tienen rutas placeholder reservadas.

## Estructura del proyecto

```
├── app/
│   ├── layout.tsx                  # Layout raíz (fuentes, metadata)
│   ├── page.tsx                    # Redirige a /evaluation
│   ├── globals.css                 # Tailwind v4 + variables globales
│   │
│   ├── (auth)/                     # Grupo de rutas de autenticación
│   │   ├── layout.tsx              # Layout centrado sin sidebar
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (dashboard)/                # Grupo de rutas principales
│   │   ├── layout.tsx              # Layout con Sidebar + Navbar
│   │   ├── page.tsx                # Dashboard
│   │   │
│   │   ├── evaluation/
│   │   │   ├── layout.tsx          # Layout de sección
│   │   │   ├── page.tsx            # Listado de evaluaciones
│   │   │   ├── new/page.tsx        # Crear nueva evaluación
│   │   │   └── [evaluationId]/
│   │   │       ├── layout.tsx      # Layout con StepperNav
│   │   │       ├── page.tsx        # Redirige al paso 1
│   │   │       ├── identification/ # Paso 1 — RF-3
│   │   │       ├── analysis/       # Paso 2 — RF-4
│   │   │       ├── treatment/      # Paso 3 — RF-6
│   │   │       └── tracking/       # Paso 4 — RF-8
│   │   │
│   │   ├── company/                # Placeholder RF-1
│   │   ├── users/                  # Placeholder RF-2
│   │   ├── matrix/                 # Placeholder RF-5
│   │   ├── controls/               # Placeholder RF-7
│   │   └── posture/                # Placeholder RF-9
│   │
│   └── api/                        # Route handlers (proxy al backend)
│       ├── auth/route.ts
│       ├── vulnerabilities/route.ts
│       ├── risks/route.ts
│       ├── treatments/route.ts
│       └── tasks/route.ts
│
├── components/
│   ├── ui/                         # Primitivos reutilizables (Tailwind puro)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── stepper.tsx
│   │   └── spinner.tsx
│   │
│   ├── layout/                     # Componentes de estructura
│   │   ├── sidebar.tsx
│   │   ├── navbar.tsx
│   │   └── stepper-nav.tsx
│   │
│   └── evaluation/                 # Componentes de dominio por RF
│       ├── vulnerability-list.tsx
│       ├── vulnerability-detail.tsx
│       ├── risk-calculator.tsx
│       ├── risk-summary.tsx
│       ├── treatment-selector.tsx
│       ├── action-list.tsx
│       ├── task-card.tsx
│       ├── task-timeline.tsx
│       └── task-assignment.tsx
│
├── types/                          # Interfaces TypeScript
│   ├── api.ts                      # ApiResponse, ApiError, PaginatedResponse
│   ├── vulnerability.ts            # Vulnerabilidad
│   ├── risk.ts                     # Riesgo, NivelRiesgo, factores OWASP
│   ├── treatment.ts                # Tratamiento, Accion, EstadoAccion
│   ├── task.ts                     # Tarea, EstadoTarea, PrioridadTarea
│   ├── user.ts                     # Usuario, RolUsuario
│   └── company.ts                  # Empresa, ActivoInformacion
│
├── lib/
│   ├── api-client.ts               # Wrapper fetch genérico tipado
│   ├── constants.ts                # STEPPER_STEPS, TREATMENT_OPTIONS
│   └── utils.ts                    # cn() — merge de clases con clsx
│
├── hooks/
│   ├── use-evaluation.ts           # Lógica de evaluación
│   ├── use-stepper.ts              # Navegación entre pasos
│   └── use-api.ts                  # Fetch con estado de carga/error
│
├── context/
│   └── evaluation-context.tsx      # EvaluationProvider + useEvaluationContext
│
└── proxy.ts                        # Proxy de peticiones (Next.js 16)
```

## Convenciones

- **Carpetas y archivos** en inglés.
- **Texto visible al usuario** (labels, mensajes, tooltips) en español.
- Estilos con **Tailwind puro** — sin librerías de componentes externas.
- Alias de importación: `@/*` → raíz del proyecto.

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (ej. `http://localhost:5000/api`) |
