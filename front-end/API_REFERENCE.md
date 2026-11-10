# API Reference - Patrones y Controles

## Endpoints Requeridos

### 1. GET /api/patterns
Obtiene la lista de todos los patrones.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "nombre del patrón",
      "description": "descripción corta",
      "keyControlAreas": "descripción de áreas clave",
      "whenToUse": "cuándo usar",
      "whenNotToUse": "cuándo no usar",
      "typicalChallenges": "retos típicos",
      "threatResistance": "resistencia a amenazas",
      "assumptions": "suposiciones",
      "developmentAreas": "áreas de desarrollo",
      "controlsCount": 5,
      "createdAt": "2026-04-28T10:00:00Z",
      "updatedAt": "2026-04-28T10:00:00Z"
    }
  ]
}
```

---

### 2. POST /api/patterns
Crea un nuevo patrón.

**Request Body:**
```json
{
  "name": "Patrón de Acceso",
  "description": "Patrón para controlar acceso a sistemas",
  "keyControlAreas": "Autenticación, Autorización, Auditoría",
  "whenToUse": "Cuando hay múltiples usuarios accediendo a sistemas sensibles",
  "whenNotToUse": "En sistemas de baja criticidad",
  "typicalChallenges": "Gestión de permisos, revocación de acceso",
  "threatResistance": "Previene accesos no autorizados, escalación de privilegios",
  "assumptions": "Existe sistema de identidad centralizado",
  "developmentAreas": "Integración con SAML, MFA obligatorio"
}
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Patrón de Acceso",
    "description": "Patrón para controlar acceso a sistemas",
    "keyControlAreas": "Autenticación, Autorización, Auditoría",
    "whenToUse": "Cuando hay múltiples usuarios accediendo a sistemas sensibles",
    "whenNotToUse": "En sistemas de baja criticidad",
    "typicalChallenges": "Gestión de permisos, revocación de acceso",
    "threatResistance": "Previene accesos no autorizados, escalación de privilegios",
    "assumptions": "Existe sistema de identidad centralizado",
    "developmentAreas": "Integración con SAML, MFA obligatorio",
    "controlsCount": 0,
    "createdAt": "2026-04-28T10:00:00Z",
    "updatedAt": "2026-04-28T10:00:00Z"
  }
}
```

---

### 3. DELETE /api/patterns/{patternId}
Elimina un patrón y todos sus controles asociados.

**Response:**
```json
{
  "message": "Patrón eliminado exitosamente"
}
```

---

### 4. GET /api/patterns/{patternId}/controls
Obtiene los controles asociados a un patrón específico.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Control de Autenticación",
      "description": "Validar identidad del usuario",
      "complementaryGuidance": "Usar estándares OAuth2",
      "enhancements": "Implementar 2FA",
      "status": "en progreso",
      "patternId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-04-28T10:00:00Z",
      "updatedAt": "2026-04-28T10:00:00Z"
    }
  ]
}
```

---

### 5. POST /api/controls
Crea un nuevo control asociado a un patrón.

**Request Body:**
```json
{
  "name": "Control de Autenticación",
  "description": "Validar identidad del usuario con credenciales",
  "complementaryGuidance": "Usar estándares OAuth2 o OIDC",
  "enhancements": "Implementar 2FA para mayor seguridad",
  "status": "None",
  "patternId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Control de Autenticación",
    "description": "Validar identidad del usuario con credenciales",
    "complementaryGuidance": "Usar estándares OAuth2 o OIDC",
    "enhancements": "Implementar 2FA para mayor seguridad",
    "status": "None",
    "patternId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-28T10:00:00Z",
    "updatedAt": "2026-04-28T10:00:00Z"
  }
}
```

---

### 6. DELETE /api/controls/{controlId}
Elimina un control específico.

**Response:**
```json
{
  "message": "Control eliminado exitosamente"
}
```

---

## Validaciones Requeridas

### En el Servidor:
1. **Nombre del Patrón**: Máximo 100 caracteres
2. **Descripción del Patrón**: Máximo 500 caracteres
3. **Cuándo Usarlo**: Máximo 300 caracteres
4. **Cuándo NO Usarlo**: Máximo 300 caracteres
5. **Todos los campos descritos son requeridos** (excepto complementaryGuidance y enhancements en controles)
6. **Estado del Control**: Solo aceptar: "None", "tomado", "en progreso", "terminado"

### En el Cliente (Ya Implementado):
- Validación de campos requeridos antes de enviar
- Contadores de caracteres (hasta 10000 caracteres por campo)
- Mensajes de error claros

---

## Estados Posibles de un Control

- **None**: Control sin asignar
- **tomado**: Control ha sido asignado/adoptado
- **en progreso**: Control en implementación
- **terminado**: Control completamente implementado

---

## Notas de Implementación

1. Los controles se crean **después** del patrón en el flujo del cliente
2. El campo `controlsCount` en patrones se obtiene contando los controles asociados
3. Es recomendable agregar cascading delete: eliminar un patrón también elimina sus controles
4. Considerar agregar búsqueda/filtrado en futuras versiones
5. Los UUIDs deben ser generados en el servidor
6. Las timestamps deben incluir zona horaria (ISO 8601)

---

## Curl Examples

### Crear Patrón
```bash
curl -X POST http://localhost:3000/api/patterns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Patrón de Acceso",
    "description": "Control de acceso a sistemas",
    "keyControlAreas": "Autenticación, Autorización",
    "whenToUse": "En todos los sistemas",
    "whenNotToUse": "Nunca",
    "typicalChallenges": "Gestión de permisos",
    "threatResistance": "Acceso no autorizado",
    "assumptions": "Sistema de identidad",
    "developmentAreas": "MFA"
  }'
```

### Obtener Patrones
```bash
curl http://localhost:3000/api/patterns
```

### Crear Control
```bash
curl -X POST http://localhost:3000/api/controls \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Autenticación",
    "description": "Validar usuario",
    "status": "None",
    "patternId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```
