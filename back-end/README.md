# Risk Assessment Back-End

NestJS REST API for cybersecurity risk assessment. Implements the OWASP Risk Rating Methodology combined with CVSS metrics and an optional AI layer (Ollama) for business impact scoring.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + NestJS 11 |
| Primary DB | MongoDB (assets, threats, vulnerabilities, risk assessments, questionnaires) |
| Secondary DB | SQLite via TypeORM (tasks, controls, patterns, OSA sync, mappings) |
| AI inference | Ollama (local LLM — `llama3.1:8b` or `llama3.2:3b`) |
| Validation | class-validator + class-transformer |
| Docs | Swagger UI at `/api` |

## Prerequisites

- **Node.js** ≥ 20
- **MongoDB** running on `localhost:27017` (or set `MONGODB_URI`)
- **Ollama** (optional — required only for AI-assisted impact scoring)

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost/test` | MongoDB connection string |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama base URL |
| `OLLAMA_MODEL` | `llama3.1:8b` | Model used for AI impact scoring |
| `PORT` | `5000` | HTTP port |

## Setup

```bash
npm install
```

## Running the App

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```




## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
# Cómo correr el back-end

---

## 1. Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Node.js | v18+ | Correr el servidor |
| MongoDB | v6+ | Base de datos de amenazas |
| Ollama + `llama3.2:3b` | v0.22+ | Traducir controles |

---

## 2. Configuración inicial

Crear `.env` en la raíz del proyecto:

```env
OSA_API_KEY=osa_442e7670db5a0f811ccff5fa3053b0202585e5e56882c86e
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3.2:3b
```

Instalar dependencias:

```bash
npm install
```

---

## 3. Arrancar el servidor

```bash
# Desarrollo (reinicia solo al guardar cambios)
npm run start:dev

# Producción
npm run build && npm run start:prod
```

El servidor levanta en `http://localhost:5000`.

---

## 4. Cargar controles NIST

Requiere el archivo `src/controls/NIST_SP-800-53_rev5_catalog.json`.

```bash
node scripts/seed-nist-controls.js
```

Resultado esperado: `✅ Controles insertados/actualizados: 324`

---

## 5. Cargar patrones y controles OSA

Requiere `OSA_API_KEY` en el `.env` y el servidor corriendo.

```bash
# Ver estado actual
curl http://localhost:5000/osa-sync/status

# Lanzar sincronización
curl -X POST http://localhost:5000/osa-sync
```

---

## 6. Traducir controles al español

Requiere Ollama corriendo con el modelo descargado:

```bash
# Verificar que está activo y tiene el modelo
ollama list

# Si no está, descargarlo
ollama pull llama3.2:3b
```

```bash
# Traducir solo los que no tienen traducción aún
node scripts/translate-controls.js

# Forzar retraducción de todos
node scripts/translate-controls.js --force

# Probar con pocos controles primero
node scripts/translate-controls.js --limit 10
```

---

## 7. Flujo completo desde cero

```bash
# Terminal 1
mongod

# Terminal 2
ollama serve

# Terminal 3 — backend
npm install
npm run start:dev

# Terminal 4 — datos
node scripts/seed-nist-controls.js
node scripts/translate-controls.js
```

---

## 8. Correr las pruebas

```bash
npm test
```

Resultado esperado: **143 tests · 7 suites · 0 fallos**

### Qué prueba cada suite

#### `tasks.service.spec.ts`

| Grupo | Tests |
|---|---|
| `create()` | Llama a repo con el DTO · Crea sin `amenazaId` |
| `update()` | Retorna `null` si no existe · Registra `ESTADO_CAMBIADO` · No registra historial si el valor no cambia · Registra `TRATAMIENTO_CAMBIADO` · Registra `TAREA_EDITADA` · Múltiples campos = múltiples entradas · Usa `"sistema"` como autor por defecto · Usa el `userId` recibido |
| Notas | `createNote` null si tarea no existe · Crea nota asociada · Registra `NOTA_AÑADIDA` · `updateNote` null si no existe · Modifica y registra `NOTA_EDITADA` · `removeNote` elimina y registra `NOTA_ELIMINADA` · No registra historial si nota no existe · `findNotes` ordena DESC |
| Documentos | `uploadDocument` null si tarea no existe · Crea con nombre/url/tareaId · Registra `DOCUMENTO_AÑADIDO` · `updateDocument` null si no existe · Actualiza y registra `DOCUMENTO_EDITADO` · `removeDocument` elimina y registra `DOCUMENTO_ELIMINADO` · No registra historial si doc no existe · `findDocuments` ordena DESC |
| Historial | `findOne` incluye historial ordenado DESC · Enriquece controles desde DB · No consulta `controlRepo` si controles vacío · Extrae `grupo` y `descripcionGrupo` del último mapeo · Retorna `grupo=null` si no hay mapeo · Maneja JSON inválido sin explotar · Retorna `null` si tarea no existe · Historial no tiene `updatedAt` (inmutable) · El servicio no expone métodos de edición/borrado de historial |

#### `tasks.controller.spec.ts`

| Grupo | Tests |
|---|---|
| `create()` | Pasa DTO al servicio y retorna tarea creada |
| `findAll()` | Retorna array de tareas |
| `findWithTreatment()` | Solo tareas con tratamiento |
| `findWithoutTreatment()` | Solo tareas sin tratamiento |
| `findOne()` | Retorna tarea · Retorna `null` si no existe |
| `update()` | Pasa `id`, `dto` y `userId` del header |
| `remove()` | Llama con el `id` correcto |
| Notas | `createNote` pasa id/dto/userId · `findNotes` retorna notas · `updateNote` pasa notaId/texto/userId · `removeNote` pasa id y userId |
| Documentos | `uploadDocument` construye dto con nombre original y url generada · `findDocuments` retorna docs · `updateDocument` pasa docId/dto/userId · `removeDocument` pasa id y userId |

#### Otras suites

| Suite | Qué prueba |
|---|---|
| `clasificador.spec.ts` | Clasificador de amenazas por categorías y grupos |
| `likelihood-calculator.spec.ts` | Cálculo de probabilidad OWASP/CVSS |
| `impact-calculator.spec.ts` | Impacto técnico y de negocio |
| `severity-calculator.spec.ts` | Matriz de severidad |
| `business-factors-inferrer.spec.ts` | Inferencia de factores de negocio |
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:5000`.  
Swagger UI: `http://localhost:5000/api`

## Ollama (AI Integration)

AI is **optional**. Risk assessments fall back to rule-based impact scoring when Ollama is unavailable.

**Option A — local install:**

```bash
# Install from https://ollama.com, then:
ollama pull llama3.1:8b
```

**Option B — Docker:**

```bash
docker compose up -d
# The model is pulled automatically on first start
```

Check AI connectivity:
```
GET /risk-assessments/health/ai
```

## API Modules

| Prefix | Description |
|---|---|
| `/assets` | IT asset management (MongoDB) |
| `/threats` | Threat catalog (MongoDB, seeded on startup) |
| `/vulnerabilities` | CVE vulnerability catalog (MongoDB) |
| `/risk-assessments` | OWASP + CVSS risk calculation and storage |
| `/questionnaires` | Security questionnaires |
| `/cve-ingest` | CVE ingestion from NVD |
| `/tasks` | Remediation task tracking (SQLite) |
| `/controls` | NIST SP 800-53 controls (SQLite) |
| `/patterns` | Security patterns (SQLite) |
| `/mapping` | Threat-to-control mapping via Ollama |
| `/osa-sync` | OSA synchronization |
| `/scripts` | Seed and data-loading utilities |

### Key Risk Assessment Endpoints

```
POST /risk-assessments/calculate          # Calculate risk for an asset + threat + vulnerability
GET  /risk-assessments                    # List all assessments (paginated)
GET  /risk-assessments/simulate           # Simulate full company risk portfolio
GET  /risk-assessments/bulk-test          # Bulk test with random assets
GET  /risk-assessments/:id                # Get assessment by ID
GET  /risk-assessments/:id/trace          # Full traceability for an assessment
GET  /risk-assessments/severity/:level    # Filter by severity (Low/Medium/High/Critical)
POST /risk-assessments/recalculate/:id    # Recalculate an existing assessment
```

## Tests

```bash
# Unit tests
npm run test

# Unit tests (watch)
npm run test:watch

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## Data Seeding

Threats and vulnerabilities are seeded automatically on startup. To reload rules from the Excel file:

```
POST /scripts/load-rules
```

The source data files live in [data/](data/).

## CORS

Requests from `http://localhost:5000` and `http://localhost:5001` (front-end dev server) are allowed by default.
