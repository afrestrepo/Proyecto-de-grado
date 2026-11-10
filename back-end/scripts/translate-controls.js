/**
 * translate-controls.js
 * Traduce la descripción de cada control NIST al español usando Ollama (llama3.2:3b).
 * Reemplaza {{ insert: param, xxx }} con frases contextuales en español.
 *
 * Uso: node scripts/translate-controls.js
 * Opciones:
 *   --force   Retraducir controles que ya tienen descriptionEs
 *   --limit N Procesar solo N controles (útil para pruebas)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH     = path.join(__dirname, '../database.sqlite');
const OLLAMA_URL  = 'http://localhost:11434/api/generate';
const MODEL       = 'llama3.2:3b';
const FORCE       = process.argv.includes('--force');
const LIMIT_IDX   = process.argv.indexOf('--limit');
const LIMIT       = LIMIT_IDX !== -1 ? parseInt(process.argv[LIMIT_IDX + 1], 10) : Infinity;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const db = new sqlite3.Database(DB_PATH);

const all = (sql, params = []) =>
  new Promise((res, rej) => db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));

const run = (sql, params = []) =>
  new Promise((res, rej) => db.run(sql, params, function (err) { err ? rej(err) : res(this); }));

async function callOllama(prompt) {
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response.trim();
}

function buildPrompt(id, name, description) {
  return `Eres un experto en seguridad de la información. Traduce al español la siguiente descripción del control NIST SP 800-53 "${id} - ${name}".

Reglas:
1. Devuelve ÚNICAMENTE el texto traducido, sin explicaciones ni comentarios adicionales.
2. Cuando encuentres una expresión como {{ insert: param, ac-07_odp.01 }}, reemplázala por una frase corta en español entre paréntesis que describa qué tipo de valor organizacional representa ese parámetro (ej: "(número de intentos permitidos)", "(período de tiempo definido por la organización)", "(lista de tipos de eventos)", etc.).
3. Mantén el significado técnico exacto del control.
4. No uses comillas ni formato markdown.

Descripción original:
${description}

Traducción:`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const whereClause = FORCE
    ? "description IS NOT NULL AND description != ''"
    : "description IS NOT NULL AND description != '' AND (descriptionEs IS NULL OR descriptionEs = '')";

  const controls = await all(`SELECT id, name, description FROM controls WHERE ${whereClause} ORDER BY id`);

  const toProcess = controls.slice(0, LIMIT);
  console.log(`📋 Controles a traducir: ${toProcess.length}${FORCE ? ' (forzado)' : ''}`);

  let ok = 0;
  let errores = 0;

  for (const ctrl of toProcess) {
    process.stdout.write(`  ${ctrl.id.padEnd(8)} ${ctrl.name.substring(0, 40).padEnd(40)} → `);
    try {
      const prompt = buildPrompt(ctrl.id, ctrl.name, ctrl.description);
      const translated = await callOllama(prompt);
      await run('UPDATE controls SET descriptionEs = ? WHERE id = ?', [translated, ctrl.id]);
      console.log('✅');
      ok++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errores++;
    }
  }

  db.close();
  console.log(`\n✅ Traducidos: ${ok} | ❌ Errores: ${errores} | Total: ${toProcess.length}`);
}

main().catch((err) => {
  console.error('Error fatal:', err);
  db.close();
  process.exit(1);
});
