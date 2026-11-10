# Guía de Pruebas - Sección de Patrones y Controles

## 🚀 Cómo Ejecutar

### 1. Iniciar el servidor de desarrollo
```bash
cd /Users/tomas/Desktop/front-end
npm run dev
```

Luego abre [http://localhost:3000](http://localhost:3000)

### 2. Navegar a la sección de Patrones
- Click en el menú izquierdo → "Patrones" (bajo la sección "Estrategia")
- O ve directamente a: [http://localhost:3000/patterns](http://localhost:3000/patterns)

---

## 🧪 Pruebas Manuales

### Test 1: Ver Página Vacía
**Pasos:**
1. Navega a /patterns
2. Deberías ver el mensaje "No hay patrones creados aún"
3. Botón "Crear Nuevo Patrón" está visible

**Resultado Esperado:** ✅ Vista limpia y clara

---

### Test 2: Crear Patrón - Validación
**Pasos:**
1. Click en "Crear Nuevo Patrón"
2. Sin escribir nada, click en "Siguiente"

**Resultado Esperado:** ❌ Se muestran errores de validación para todos los campos requeridos

---

### Test 3: Crear Patrón - Contador de Caracteres
**Pasos:**
1. Click en "Crear Nuevo Patrón"
2. En el campo "Nombre", escribe un texto largo
3. Verifica que el contador de caracteres se actualice

**Resultado Esperado:** ✅ El contador muestra "X/100" y se actualiza en tiempo real

---

### Test 4: Crear Patrón - Paso 1 Completo
**Pasos:**
1. Completa TODOS los campos en Paso 1:
   - **Nombre:** "Patrón de Encriptación de Datos"
   - **Descripción:** "Proteger datos sensibles mediante encriptación"
   - **Áreas Clave:** "Encriptación en tránsito, encriptación en reposo"
   - **Cuándo Usarlo:** "Para proteger PII y datos financieros"
   - **Cuándo NO Usarlo:** "En datos públicos"
   - **Retos Típicos:** "Gestión de claves, rendimiento"
   - **Resistencia a Amenazas:** "Previene robo de datos"
   - **Suposiciones:** "Sistema de identidad centralizado"
   - **Áreas de Desarrollo:** "Implementar post-quantum cryptography"

2. Click en "Siguiente"

**Resultado Esperado:** ✅ Avanza al Paso 2 sin errores

---

### Test 5: Agregar Controles - Sin Controles
**Pasos:**
1. En Paso 2, verifica que se muestre "No hay controles agregados aún"
2. Click en "Agregar Nuevo Control"

**Resultado Esperado:** ✅ Se abre el sub-formulario

---

### Test 6: Agregar Control - Validación
**Pasos:**
1. Con el sub-formulario abierto, click en "Agregar Control" sin llenar nada

**Resultado Esperado:** ❌ Se muestran errores solo en "Nombre" y "Descripción"

---

### Test 7: Agregar Control - Completo
**Pasos:**
1. Llena el sub-formulario:
   - **Nombre:** "Encriptación TLS 1.3"
   - **Descripción:** "Usar TLS 1.3 para toda comunicación"
   - **Orientación:** "Validar certificados, usar HSTS"
   - **Mejoras:** "Certificate Pinning"
   - **Estado:** "en progreso"

2. Click en "Agregar Control"

**Resultado Esperado:** ✅ El control aparece en la lista de Paso 2

---

### Test 8: Múltiples Controles
**Pasos:**
1. Repite Test 7 dos veces más con datos diferentes
2. Verifica que los tres controles aparezcan en la lista

**Resultado Esperado:** ✅ Todos los controles se muestran correctamente

---

### Test 9: Remover Control
**Pasos:**
1. En la lista de controles, click en el icono de basura de uno
2. El control desaparece de la lista

**Resultado Esperado:** ✅ Control eliminado correctamente

---

### Test 10: Volver Atrás
**Pasos:**
1. En Paso 2, click en "Atrás"
2. Verifica que vuelva a Paso 1 con los datos intactos

**Resultado Esperado:** ✅ Los datos del patrón se mantienen

---

### Test 11: Crear Patrón Completo
**Pasos:**
1. Estando en Paso 2 con al menos 1 control
2. Click en "Crear Patrón"

**Resultado Esperado:**
- ⏳ Se muestra "Creando..." en el botón
- ✅ Modal se cierra
- ✅ El nuevo patrón aparece en la tabla
- ✅ Muestra la cantidad correcta de controles

---

### Test 12: Tabla de Patrones
**Pasos:**
1. Crea 3 patrones diferentes
2. Verifica que la tabla muestre:
   - ✅ Nombre del patrón
   - ✅ Descripción (truncada)
   - ✅ Cantidad de controles (badge azul)
   - ✅ Fecha de creación
   - ✅ Botón de eliminar

**Resultado Esperado:** ✅ Tabla completa con todos los datos

---

### Test 13: Cancelar Formulario
**Pasos:**
1. Click en "Crear Nuevo Patrón"
2. Llena algunos datos
3. Click en "Cancelar"

**Resultado Esperado:** ✅ Modal se cierra sin guardar datos

---

### Test 14: Responsive Design (Móvil)
**Pasos:**
1. Abre DevTools (F12)
2. Activa modo móvil (Ctrl+Shift+M)
3. Navega a /patterns
4. Intenta crear un patrón

**Resultado Esperado:** ✅ La interfaz es usable en móvil

---

## 🔌 Integración con Mock Data

Si el backend aún no está listo, puedes usar datos mock:

### Opción 1: Usar Mock Data en el Hook
Edita [hooks/use-pattern.ts](/hooks/use-pattern.ts):

```typescript
import { mockApiClient } from "@/lib/mock-data";

// Cambia las llamadas a apiClient por mockApiClient
const response = await mockApiClient.getPatterns();
```

### Opción 2: Usar Mock Data en la Página
Edita [app/(dashboard)/patterns/page.tsx](/app/(dashboard)/patterns/page.tsx):

```typescript
import { MOCK_PATTERNS, getMockControls } from "@/lib/mock-data";

export default function PatternsPage() {
  const [patterns, setPatterns] = useState(MOCK_PATTERNS);
  // ... resto del código
}
```

---

## 🐛 Debugging

### Ver Requests en DevTools
1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Crea un patrón
4. Verifica que se hagan requests a `/api/patterns` y `/api/controls`

### Ver Console Errors
1. Ve a la pestaña "Console" en DevTools
2. Si hay errores, aparecerán ahí

### Componentes React
1. Instala [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/)
2. Inspeccciona componentes en árbol de componentes

---

## 📊 Casos de Uso Completados

- ✅ Visualizar lista de patrones en tabla
- ✅ Crear patrón con formulario de 2 pasos
- ✅ Validación en cliente con mensajes claros
- ✅ Agregar múltiples controles a un patrón
- ✅ Mostrar información completa del control
- ✅ Eliminar controles antes de guardar
- ✅ Cancelar en cualquier momento
- ✅ Feedback visual de carga
- ✅ Manejo de errores

---

## 🔧 Próximos Pasos (Backend)

1. Implementar endpoints REST
2. Validar datos en servidor
3. Implementar DELETE endpoints
4. Agregar autenticación/autorización
5. Agregar búsqueda y filtrado
6. Implementar edición de patrones

---

## 📝 Notas

- Los datos se guardan en estado temporal durante el flujo
- Las validaciones ocurren en el cliente antes de enviar
- Los UUIDs se generarán en el servidor (frontend usa `id`)
- Las timestamps se formatean en formato DD/MM/YYYY
