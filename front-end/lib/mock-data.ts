// Mock data para pruebas sin backend

export const MOCK_PATTERNS = [
  {
    id: "pat-001",
    name: "Patrón de Control de Acceso",
    description: "Patrón integral para gestionar acceso a sistemas y recursos",
    keyControlAreas: "Autenticación, Autorización, Auditoría, Revocación de Acceso",
    whenToUse:
      "Cuando hay múltiples usuarios con diferentes niveles de acceso a sistemas sensibles",
    whenNotToUse:
      "En sistemas de muy baja criticidad o sistemas sin datos sensibles",
    typicalChallenges:
      "Gestión compleja de permisos, auditoría de accesos, revocación en tiempo real",
    threatResistance:
      "Previene accesos no autorizados, escalación de privilegios, acceso a datos sensibles",
    assumptions:
      "Existe un sistema de identidad centralizado, todos los usuarios tienen credenciales únicas",
    developmentAreas:
      "Implementar MFA obligatorio, integración SAML, análisis de comportamiento anómalo",
    controlsCount: 3,
    createdAt: "2026-04-20T10:30:00Z",
    updatedAt: "2026-04-20T10:30:00Z",
  },
  {
    id: "pat-002",
    name: "Patrón de Encriptación de Datos",
    description: "Protección de datos en reposo y en tránsito mediante encriptación",
    keyControlAreas:
      "Encriptación, Gestión de Claves, Protocolos Seguros, Certificados",
    whenToUse:
      "Para proteger datos sensibles, PII, información financiera o de negocio",
    whenNotToUse: "En datos públicos o no sensibles, aunque no está prohibido",
    typicalChallenges:
      "Gestión de claves, rendimiento, compatibilidad, actualización de algoritmos",
    threatResistance:
      "Previene robo de datos, interceptación, acceso no autorizado a información sensible",
    assumptions:
      "Infraestructura robusta, HSM disponible, políticas de rotación de claves",
    developmentAreas:
      "Post-quantum cryptography, encriptación homomórfica, auditoría de claves",
    controlsCount: 2,
    createdAt: "2026-04-18T14:15:00Z",
    updatedAt: "2026-04-18T14:15:00Z",
  },
];

export const MOCK_CONTROLS = {
  "pat-001": [
    {
      id: "ctl-001",
      name: "Autenticación Multifactor",
      description:
        "Implementar MFA para todos los accesos a sistemas sensibles",
      complementaryGuidance:
        "Usar autenticadores TOTP o push notifications, no SMS si es posible",
      enhancements:
        "Agregar biometría, implementar riesgos adaptativos basados en comportamiento",
      status: "en progreso",
      patternId: "pat-001",
      createdAt: "2026-04-20T10:30:00Z",
      updatedAt: "2026-04-20T10:30:00Z",
    },
    {
      id: "ctl-002",
      name: "Control de Rol Basado (RBAC)",
      description:
        "Implementar sistema de permisos basado en roles de usuario",
      complementaryGuidance: "Seguir principio de menor privilegio",
      enhancements: "Migrar a ABAC para mayor granularidad",
      status: "terminado",
      patternId: "pat-001",
      createdAt: "2026-04-20T10:30:00Z",
      updatedAt: "2026-04-20T10:30:00Z",
    },
    {
      id: "ctl-003",
      name: "Auditoría de Acceso",
      description: "Registrar todos los accesos a sistemas y cambios de permisos",
      complementaryGuidance: "Almacenar logs inmutables, validar integridad",
      enhancements: "Implementar correlación de eventos, detección de anomalías",
      status: "tomado",
      patternId: "pat-001",
      createdAt: "2026-04-20T10:30:00Z",
      updatedAt: "2026-04-20T10:30:00Z",
    },
  ],
  "pat-002": [
    {
      id: "ctl-004",
      name: "Encriptación en Tránsito (TLS)",
      description:
        "Usar TLS 1.3+ para toda comunicación entre servicios y con clientes",
      complementaryGuidance: "Validar certificados, usar HSTS",
      enhancements: "Implementar Certificate Pinning para apps móviles",
      status: "en progreso",
      patternId: "pat-002",
      createdAt: "2026-04-18T14:15:00Z",
      updatedAt: "2026-04-18T14:15:00Z",
    },
    {
      id: "ctl-005",
      name: "Encriptación en Reposo",
      description:
        "Encriptar datos sensibles almacenados en bases de datos y archivos",
      complementaryGuidance:
        "Usar AES-256, rotación regular de claves, HSM para almacenamiento",
      enhancements:
        "Encriptación en nivel de campo, NIST Approved algorithms",
      status: "None",
      patternId: "pat-002",
      createdAt: "2026-04-18T14:15:00Z",
      updatedAt: "2026-04-18T14:15:00Z",
    },
  ],
};

// Funciones helper para pruebas
export function getMockPatterns() {
  return MOCK_PATTERNS;
}

export function getMockControls(patternId: string) {
  return MOCK_CONTROLS[patternId as keyof typeof MOCK_CONTROLS] || [];
}

export function getMockPatternWithControls(patternId: string) {
  const pattern = MOCK_PATTERNS.find((p) => p.id === patternId);
  if (!pattern) return null;

  return {
    ...pattern,
    controls: getMockControls(patternId),
  };
}

// Para usar en pruebas, comentar el apiClient real y usar esto
export const mockApiClient = {
  getPatterns: () => Promise.resolve({ data: MOCK_PATTERNS }),
  getControls: (patternId: string) =>
    Promise.resolve({ data: getMockControls(patternId) }),
  createPattern: (data: any) =>
    Promise.resolve({
      data: {
        ...data,
        id: `pat-${Date.now()}`,
        controlsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
  createControl: (data: any) =>
    Promise.resolve({
      data: {
        ...data,
        id: `ctl-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
};
