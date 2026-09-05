/**
 * Idempotent migrations for an existing database. schema.sql only uses
 * CREATE TABLE IF NOT EXISTS, so it can't add a column to a table that
 * already exists — each step below handles that, safe to run repeatedly.
 *
 *   npm run migrate
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

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(ROOT, 'data', 'factory.db')}`;
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });

const done = [];
const skipped = [];

async function hasColumn(table, column) {
  const info = await db.execute({ sql: `PRAGMA table_info(${table})`, args: [] });
  return info.rows.some((r) => r.name === column);
}

// ── item_types.reorder_level ──────────────────────────────────────────────
// Per-product low-stock threshold, replacing a flat "<= 5" that was the same
// for every size of every paper regardless of how fast it actually moves.
if (!(await hasColumn('item_types', 'reorder_level'))) {
  await db.execute({ sql: `ALTER TABLE item_types ADD COLUMN reorder_level REAL NOT NULL DEFAULT 5`, args: [] });
  done.push('item_types.reorder_level added (default 5, editable per product)');
} else {
  skipped.push('item_types.reorder_level already present');
}

for (const d of done) console.log(`✓ ${d}`);
for (const s of skipped) console.log(`· ${s}`);

if (done.length) {
  await db.execute({
    sql: `INSERT INTO activity_log (level, actor, event, detail) VALUES (?,?,?,?)`,
    args: ['system', 'migration', 'Schema migrated', done.join(' · ')],
  });
}
db.close();
