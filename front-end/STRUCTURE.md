# Estructura de la Sección de Patrones y Controles

## 📁 Árbol de Archivos

```
/Users/tomas/Desktop/front-end/
├── app/(dashboard)/
│   └── patterns/
│       └── page.tsx                    # Página principal de patrones
├── components/
│   ├── patterns/
│   │   ├── control-form.tsx            # Sub-formulario para agregar controles
│   │   ├── control-list.tsx            # Lista de controles
│   │   ├── pattern-form.tsx            # Formulario de 2 pasos para patrones
│   │   ├── pattern-list.tsx            # Tabla de patrones
│   │   └── IMPLEMENTATION.md           # Documentación del componente
│   ├── layout/
│   │   └── sidebar.tsx                 # (ACTUALIZADO) Agregó link a patrones
│   └── ui/
│       ├── button.tsx                  # (ACTUALIZADO) Componente botón
│       ├── input.tsx                   # (ACTUALIZADO) Input
│       ├── modal.tsx                   # (ACTUALIZADO) Modal dialog
│       ├── select.tsx                  # (ACTUALIZADO) Select
│       └── textarea.tsx                # (ACTUALIZADO) Textarea
├── hooks/
│   └── use-pattern.ts                  # Hook para operaciones CRUD
├── lib/
│   ├── mock-data.ts                    # Datos mock para pruebas
│   └── utils.ts                        # (ACTUALIZADO) formatDate()
├── types/
│   └── pattern.ts                      # Tipos e interfaces
├── API_REFERENCE.md                    # Especificación de endpoints
├── TESTING_GUIDE.md                    # Guía de pruebas
└── package.json                        # (ACTUALIZADO) Instaló lucide-react
```

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                      PatternsPage                           │
│                  (app/patterns/page.tsx)                    │
└────┬──────────────────────────────────────────────┬─────────┘
     │                                              │
     ├─────────────────────────────────┐            │
     │                                 │            │
   usePattern()                    PatternForm      │
     │                           (Modal Dialog)     │
     │                                 │            │
     ├─ fetchPatterns()       ┌─────────┴──────┐   │
     ├─ createPattern()       │                │   │
     ├─ createControl()       Step 1: Info    Step 2: Controls
     ├─ deletePattern()       │                │   │
     └─ deleteControl()       │           ControlForm
                              │           ControlList
                              └─────────────┬──────┘
                                            │
                                    Back to PatternList
```

## 🎯 Estados del Componente PatternForm

```
┌──────────────────────────────────────────────────────────┐
│              PatternForm (isOpen=true)                   │
├──────────────────────────────────────────────────────────┤
│  step: "info" | "controls"                              │
│  patternData: CreatePatternPayload                       │
│  controls: Control[]                                     │
│  showControlForm: boolean                                │
│  errors: Record<string, string>                          │
│  loading: boolean                                        │
└──────────────────────────────────────────────────────────┘

        ┌─────────────────────────┐
        │    PASO 1: INFO         │
        ├─────────────────────────┤
        │ ✓ Nombre (100 chars)    │
        │ ✓ Descripción (500)     │
        │ ✓ Áreas Clave           │
        │ ✓ Cuándo Usarlo (300)   │
        │ ✓ Cuándo NO Usarlo (300)│
        │ ✓ Retos Típicos         │
        │ ✓ Resistencia Amenazas  │
        │ ✓ Suposiciones          │
        │ ✓ Áreas Desarrollo      │
        │                         │
        │  [Cancelar] [Siguiente] │
        └─────────────────────────┘
                   ↓
        ┌─────────────────────────┐
        │  PASO 2: CONTROLES      │
        ├─────────────────────────┤
        │ ControlList             │
        │ ├─ Control 1            │
        │ ├─ Control 2            │
        │ └─ Control N            │
        │                         │
        │ [+ Agregar Nuevo]       │
        │ (abre ControlForm)      │
        │                         │
        │ [Atrás] [Crear Patrón]  │
        └─────────────────────────┘
```

## 🔐 Estados del Control

```
┌─────────────────────────────────────┐
│      ControlStatus (Enums)          │
├─────────────────────────────────────┤
│ "None"          → Sin asignar       │
│ "tomado"        → Adoptado          │
│ "en progreso"   → Implementando     │
│ "terminado"     → Completado        │
└─────────────────────────────────────┘
```

## 📊 Tabla de Patrones

```
┌───────────────────────────────────────────────────────────────────────┐
│ Nombre  │ Descripción  │ Controles │ Fecha Creación │ Acciones        │
├─────────┼──────────────┼───────────┼────────────────┼─────────────────┤
│ Patrón1 │ Descripción1 │ [5]       │ 20/04/2026     │ [🗑️] Eliminar   │
│ Patrón2 │ Descripción2 │ [3]       │ 18/04/2026     │ [🗑️] Eliminar   │
└───────────────────────────────────────────────────────────────────────┘
```

## 🔌 Integración API

```
┌──────────────────────────────────────────────────────────┐
│              apiClient (lib/api-client.ts)               │
├──────────────────────────────────────────────────────────┤
│  Realiza requests HTTP con:                             │
│  - Base URL: process.env.NEXT_PUBLIC_API_URL            │
│  - Headers: Content-Type: application/json              │
│  - Error handling automático                            │
└──────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
    Backend API          Backend API         Backend API
    POST /api/patterns   GET /api/patterns   POST /api/controls
    DELETE /api/...      GET /api/.../...    DELETE /api/...
```

## 🎨 Componentes UI Reutilizables

```
┌────────────────────────────────────────┐
│         Componentes Base UI             │
├────────────────────────────────────────┤
│ Button                                  │
│ ├─ variants: primary, secondary,       │
│ │            danger, outline, ghost    │
│ └─ sizes: sm, md, lg                   │
│                                        │
│ Modal                                   │
│ ├─ isOpen: boolean                     │
│ ├─ onClose: () => void                 │
│ └─ title: string                       │
│                                        │
│ Input / Select / Textarea              │
│ ├─ Estilos consistentes                │
│ └─ Focus states definidos              │
└────────────────────────────────────────┘
```

## 📦 Dependencias Agregadas

```json
{
  "dependencies": {
    "lucide-react": "latest"  // Para iconos (Trash2, X, etc.)
  }
}
```

## 🧪 Flujo de Prueba

```
Usuario Abre /patterns
    ↓
Carga usePattern hook
    ↓
Llama fetchPatterns()
    ↓
Muestra PatternList con datos
    ↓
Usuario Click "Crear Nuevo Patrón"
    ↓
Abre PatternForm Modal
    ↓
Paso 1: Completa forma + valida
    ↓
Paso 2: Agrega controles (opcional)
    ↓
Click "Crear Patrón"
    ↓
createPattern() → createControl() (por cada control)
    ↓
fetchPatterns() (recarga lista)
    ↓
Modal se cierra
    ↓
Nueva entrada aparece en tabla
```

## 🚀 Despliegue

```
npm run build
    ↓
    ✓ Compiled successfully
    ✓ Ruta /patterns generada
    ✓ Componentes code-split
    ↓
npm start (o npm run dev)
    ↓
Aplicación lista en http://localhost:3000
```

## 📋 Checklist de Implementación

- ✅ Tipos TypeScript definidos
- ✅ Hook usePattern creado
- ✅ Componente PatternForm (2 pasos)
- ✅ Componente ControlForm
- ✅ Componente PatternList (tabla)
- ✅ Componente ControlList
- ✅ Página principal creada
- ✅ Navegación actualizada
- ✅ Componentes UI implementados
- ✅ Mock data disponible
- ✅ Build exitoso
- ✅ Documentación completa
- ✅ Guía de pruebas
- ✅ Referencia API

## 📝 Notas de Desarrollo

- Los controles se crean localmente hasta completar el patrón
- Validación optimista en cliente
- Error handling con mensajes claros
- Estados de loading durante operaciones
- Datos mock disponibles para testing sin backend
