/**
 * seed-nist-controls.js
 * Lee NIST_SP-800-53_rev5_catalog.json y hace upsert en la tabla `controls` de SQLite.
 *
 * Uso:
 *   1. Coloca el archivo JSON en: src/controls/NIST_SP-800-53_rev5_catalog.json
 *   2. Ejecuta: node scripts/seed-nist-controls.js
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '../src/controls/NIST_SP-800-53_rev5_catalog.json');
const DB_PATH   = path.join(__dirname, '../database.sqlite');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatId(rawId) {
  // "ac-2" → "AC-02"  |  "sc-13" → "SC-13"
  const [familia, numero] = rawId.split('-');
  return `${familia.toUpperCase()}-${numero.padStart(2, '0')}`;
}

function getFamily(rawId) {
  return rawId.split('-')[0].toUpperCase();
}

function extractDescription(parts) {
  if (!parts) return null;
  const statement = parts.find((p) => p.name === 'statement');
  if (!statement) return null;

  const items = statement.parts?.filter((p) => p.name === 'item') ?? [];
  const prose = items.map((p) => p.prose).filter(Boolean);

  // Si no hay items pero el statement tiene prose directo
  if (prose.length === 0 && statement.prose) return statement.prose;

  return prose.length > 0 ? prose.join(' | ') : null;
}

function extractSupplementalGuidance(parts) {
  if (!parts) return null;
  const guidance = parts.find((p) => p.name === 'guidance');
  return guidance?.prose ?? null;
}

function isWithdrawn(props) {
  return (props ?? []).some((p) => p.name === 'status' && p.value === 'withdrawn');
}

function isEnhancement(rawId) {
  return rawId.includes('.');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`❌ Archivo no encontrado: ${JSON_PATH}`);
    console.error('   Coloca el archivo NIST_SP-800-53_rev5_catalog.json en src/controls/');
    process.exit(1);
  }

  const raw = fs.readFileSync(JSON_PATH, 'utf-8');
  const catalog = JSON.parse(raw);
  const groups = catalog?.catalog?.groups ?? [];

  const db = new sqlite3.Database(DB_PATH);

  const run = (sql, params) =>
    new Promise((resolve, reject) =>
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      }),
    );

  let insertados = 0;
  let withdrawn   = 0;
  let total       = 0;

  try {
    await run('BEGIN TRANSACTION', []);

    for (const group of groups) {
      const familyName = group.title;
      const controls   = group.controls ?? [];

      for (const ctrl of controls) {
        // Saltar enhancements (ac-2.1, ac-2.2, etc.)
        if (isEnhancement(ctrl.id)) continue;

        total++;

        const id          = formatId(ctrl.id);
        const family      = getFamily(ctrl.id);
        const name        = ctrl.title;
        const description = extractDescription(ctrl.parts);
        const suppGuid    = extractSupplementalGuidance(ctrl.parts);
        const wdrawn      = isWithdrawn(ctrl.props) ? 1 : 0;
        const syncedAt    = new Date().toISOString();

        if (wdrawn) withdrawn++;

        await run(
          `INSERT INTO controls (id, name, family, familyName, description, supplementalGuidance, baselineLow, baselineModerate, baselineHigh, syncedAt)
           VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, ?)
           ON CONFLICT(id) DO UPDATE SET
             name                = excluded.name,
             family              = excluded.family,
             familyName          = excluded.familyName,
             description         = excluded.description,
             supplementalGuidance = excluded.supplementalGuidance,
             syncedAt            = excluded.syncedAt`,
          [id, name, family, familyName, description, suppGuid, syncedAt],
        );

        insertados++;
      }
    }

    await run('COMMIT', []);

  } catch (err) {
    await run('ROLLBACK', []).catch(() => {});
    console.error('❌ Error durante la inserción:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }

  console.log(`✅ Controles insertados/actualizados: ${insertados}`);
  console.log(`⚠️  Controles withdrawn:              ${withdrawn}`);
  console.log(`📊 Total procesados:                  ${total}`);
}

main();
