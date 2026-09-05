/**
 * Idempotent migrations for an existing database. schema.sql only uses
 * CREATE TABLE IF NOT EXISTS, so it can't add a column to a table that
 * already exists — each step below handles that, safe to run repeatedly.
 *
 *   npm run migrate
 *
 * This ALSO runs as part of `npm run build`, which is what makes a Vercel
 * deploy pick up schema changes. It used to be a local-only step: the
 * production Turso database was created before `item_types.reorder_level`
 * existed, nothing in the deploy pipeline ever added it, and /stock — the
 * only screen that selects that column — threw
 * `SQLITE_ERROR: no such column: t.reorder_level` on every request.
 * Adding a column to schema.sql is NOT enough on its own; add it here too.
 */
import { createClient } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const envPath = path.join(ROOT, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq);
    if (!process.env[k]) process.env[k] = t.slice(eq + 1);
  }
}

// On Vercel/CI there is no local SQLite file worth migrating — the only
// database that matters is Turso. Falling back to `file:data/factory.db`
// there would "succeed" against a throwaway file inside the build sandbox
// and leave production exactly as broken as before, with a green build to
// say otherwise. Say so loudly instead, and don't fail the deploy over it.
const CI = !!(process.env.VERCEL || process.env.CI);
if (CI && !process.env.TURSO_DATABASE_URL) {
  console.warn('! TURSO_DATABASE_URL is not set in this build environment — skipping migration.');
  console.warn('  The deployed app WILL still read Turso at runtime, so any schema change');
  console.warn('  in this commit has NOT been applied to it. Set TURSO_DATABASE_URL and');
  console.warn('  TURSO_AUTH_TOKEN in the Vercel project env (Production + Preview), then redeploy.');
  process.exit(0);
}

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(ROOT, 'data', 'factory.db')}`;
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });

console.log(`Migrating: ${url.replace(/\/\/.*@/, '//***@')}`);

const done = [];
const skipped = [];

// ─── Tables ───────────────────────────────────────────────────────────────────
// Every CREATE TABLE / CREATE INDEX in schema.sql is `IF NOT EXISTS`, so
// replaying the whole file is a no-op on a database that already has them and
// creates anything a deploy added since. Same comment-stripping rule as
// seed.mjs: strip comment LINES, never reject a chunk that starts with one
// (each statement is preceded by a `-- section` header).
const schemaSql = fs.readFileSync(path.join(ROOT, 'src', 'lib', 'schema.sql'), 'utf8');
const statements = schemaSql.split(';')
  .map((s) => s.split('\n').filter((line) => !line.trim().startsWith('--')).join('\n').trim())
  .filter(Boolean);
let created = 0;
for (const stmt of statements) {
  if (stmt.toUpperCase().startsWith('PRAGMA')) continue;
  try {
    await db.execute({ sql: stmt, args: [] });
    created++;
  } catch (e) {
    if (!String(e).includes('already exists')) {
      console.warn('Schema warning:', String(e).slice(0, 160));
    }
  }
}
skipped.push(`schema.sql replayed (${created} statements, all IF NOT EXISTS)`);

// ─── Column migrations ────────────────────────────────────────────────────────
async function hasTable(table) {
  const r = await db.execute({
    sql: `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    args: [table],
  });
  return r.rows.length > 0;
}

async function hasColumn(table, column) {
  const info = await db.execute({ sql: `PRAGMA table_info(${table})`, args: [] });
  return info.rows.some((r) => r.name === column);
}

/** Add a column to an existing table, once. No-op if the table is absent. */
async function addColumn(table, column, ddl, note) {
  if (!(await hasTable(table))) {
    skipped.push(`${table}.${column} — table does not exist yet`);
    return;
  }
  if (await hasColumn(table, column)) {
    skipped.push(`${table}.${column} already present`);
    return;
  }
  await db.execute({ sql: `ALTER TABLE ${table} ADD COLUMN ${ddl}`, args: [] });
  done.push(note);
}

// Per-product low-stock threshold, replacing a flat "<= 5" that was the same
// for every size of every paper regardless of how fast it actually moves.
await addColumn(
  'item_types', 'reorder_level',
  `reorder_level REAL NOT NULL DEFAULT 5`,
  'item_types.reorder_level added (default 5, editable per product)',
);

// \u2500\u2500\u2500 Data corrections \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// The original 2022 import gave the Boxboard families' moti and bareek rows
// DIFFERENT `family` strings ("Boxboard 2.5 No" vs "Boxboard 2.5", same for
// "Boxboard 3"), silently splitting one family into two on the Stock screen
// (11 cards instead of 9, each showing only one thickness \u2014 the other reads
// as "Not stocked" because it is grouped under the sibling's family name
// instead). This was fixed in data/import/legacy.json, the source seed.mjs
// reads from \u2014 but seed.mjs skips reseeding once item_types has rows, so
// that fix only ever reached a database seeded AFTER the fix landed. Any
// database seeded before it (including, as far as we can tell, production)
// still has the old split strings and never got corrected, because nothing
// until now re-wrote EXISTING rows. This only changes the `family` text
// label on rows that already exist \u2014 it does not touch stock_items,
// quantities, or movement history, so it is safe to run against a database
// with real transactions already posted, and is a no-op once corrected.
async function unifyFamily(wrongFamily, correctFamily, note) {
  if (!(await hasTable('item_types'))) return;
  const before = await db.execute({
    sql: `SELECT COUNT(*) n FROM item_types WHERE family = ?`, args: [wrongFamily],
  });
  const n = Number(before.rows[0].n);
  if (n === 0) { skipped.push(`${note} \u2014 already unified`); return; }
  await db.execute({
    sql: `UPDATE item_types SET family = ? WHERE family = ?`,
    args: [correctFamily, wrongFamily],
  });
  done.push(`${note}: ${n} row(s) moved from "${wrongFamily}" to "${correctFamily}"`);
}

await unifyFamily('Boxboard 2.5 No', 'Boxboard 2.5', 'Boxboard 2.5 family split');
await unifyFamily('Boxboard 3 No', 'Boxboard 3', 'Boxboard 3 family split');

for (const d of done) console.log(`\u2713 ${d}`);
for (const s of skipped) console.log(`\u00b7 ${s}`);

if (done.length) {
  try {
    await db.execute({
      sql: `INSERT INTO activity_log (level, actor, event, detail) VALUES (?,?,?,?)`,
      args: ['system', 'migration', 'Schema migrated', done.join(' \u00b7 ')],
    });
  } catch { /* activity_log may not exist on a brand-new database yet */ }
}
db.close();
