# Componentes de Patrones y Controles

Esta carpeta contiene todos los componentes necesarios para la gestión de patrones y controles en la aplicación.

## 📚 Componentes

### `pattern-form.tsx`
Formulario modal con dos pasos para crear patrones.

**Props:**
```typescript
interface PatternFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patternData: CreatePatternPayload, controls: Control[]) => Promise<void>;
  loading?: boolean;
}
```

**Uso:**
```tsx
<PatternForm
  isOpen={isFormOpen}
  onClose={() => setIsFormOpen(false)}
  onSubmit={handleCreatePattern}
  loading={isSubmitting}
/>
```

---

### `pattern-list.tsx`
Tabla que muestra todos los patrones.

**Props:**
```typescript
interface PatternListProps {
  patterns: Pattern[];
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}
```

**Uso:**
```tsx
<PatternList
  patterns={patterns}
  onDelete={handleDeletePattern}
  loading={loading}
/>
```

**Características:**
- Tabla responsive
- Columnas: Nombre, Descripción, Cantidad de Controles, Fecha, Acciones
- Badge mostrando cantidad de controles
- Botón eliminar con icono

---

### `control-form.tsx`
Sub-formulario para agregar controles a un patrón.

**Props:**
```typescript
interface ControlFormProps {
  onAddControl: (control: Omit<Control, "id" | "createdAt" | "updatedAt" | "patternId">) => void;
  onCancel: () => void;
}
```

**Uso:**
```tsx
<ControlForm
  onAddControl={handleAddControl}
  onCancel={() => setShowControlForm(false)}
/>
```

**Campos:**
- Nombre (requerido)
- Descripción (requerido)
- Orientación Complementaria (opcional)
- Enhancements/Mejoras (opcional)
- Estado (dropdown con 4 opciones)

---

### `control-list.tsx`
Lista visual de controles agregados.

**Props:**
```typescript
interface ControlListProps {
  controls: Control[];
  onRemove: (index: number) => void;
}
```

**Uso:**
```tsx
<ControlList
  controls={controls}
  onRemove={handleRemoveControl}
/>
```

**Características:**
- Tarjetas para cada control
- Información completa visible
- Badge de estado con color
- Botón eliminar

---

## 🔄 Flujo de Uso

### Crear un Patrón Nuevo

```typescript
import { PatternForm } from "@/components/patterns/pattern-form";
import { usePattern } from "@/hooks/use-pattern";

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const { createPattern, createControl } = usePattern();

  const handleCreatePattern = async (patternData, controls) => {
    // 1. Crear el patrón
    const pattern = await createPattern(patternData);

    // 2. Crear todos los controles asociados
    for (const control of controls) {
      await createControl({
        ...control,
        patternId: pattern.id,
      });
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Crear Patrón
      </button>
      <PatternForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleCreatePattern}
      />
    </>
  );
}
```

---

## 🎨 Estados Visuales

### Estados de Control

| Estado | Color | Caso de Uso |
|--------|-------|-----------|
| None | Gris | Control sin asignar |
| tomado | Azul | Control adoptado |
| en progreso | Amarillo | En implementación |
| terminado | Verde | Completado |

---

## 📋 Validaciones

### Patrón
- ✅ Todos los campos son requeridos
 - ✅ Nombre: máximo 10000 caracteres
 - ✅ Descripción: máximo 10000 caracteres
 - ✅ "Cuándo Usarlo" y "Cuándo NO Usarlo": máximo 10000 caracteres cada uno

### Control
- ✅ Nombre: requerido
- ✅ Descripción: requerido
- ✅ Orientación y Mejoras: opcionales
- ✅ Estado: debe ser una de las 4 opciones válidas

---

## 🔌 Integración con API

Los componentes se integran con el hook `usePattern` que maneja todas las llamadas API:

```typescript
const {
  patterns,           // Array de patrones
  loading,            // boolean durante operaciones
  error,              // string si hay error
  fetchPatterns,      // () => Promise<void>
  createPattern,      // (data) => Promise<Pattern>
  createControl,      // (data) => Promise<Control>
  deletePattern,      // (id) => Promise<void>
  deleteControl,      // (id) => Promise<void>
} = usePattern();
```

---

## 🧪 Testing

Ver [TESTING_GUIDE.md](../../TESTING_GUIDE.md) para casos de prueba detallados.

### Datos Mock

Para pruebas sin backend, usa `lib/mock-data.ts`:

```typescript
import { MOCK_PATTERNS, getMockControls } from "@/lib/mock-data";

// Usar directamente
const patterns = MOCK_PATTERNS;
const controls = getMockControls(patternId);
```

---

## 🚀 Mejoras Futuras

- [ ] Editar patrones existentes
- [ ] Búsqueda y filtrado
- [ ] Paginación
- [ ] Export a PDF/Excel
- [ ] Clonar patrones
- [ ] Historial de cambios
- [ ] Validación en tiempo real del servidor
- [ ] Notificaciones de éxito/error

---

## 📞 Troubleshooting

### El formulario no abre
- Verificar que `isOpen={true}` se pasa correctamente
- Verificar que `onClose` está conectado

### Los controles no se guardan
- Verificar que `createControl` está siendo llamado después de `createPattern`
- Verificar que `patternId` se pasa correctamente

### Validaciones no funcionan
- Verificar que los campos tienen las clases correctas
- Ver console del navegador para errores de validación

### Estilos no aplican
- Verificar que Tailwind CSS está importado
- Verificar que las clases Tailwind están en el proyecto

---

## 📝 Notas de Desarrollo

- Todos los componentes son "use client" (client-side)
- Usan hooks de React para estado
- Validación optimista en cliente
- Manejo de errores con try-catch
- TypeScript strict mode habilitado
