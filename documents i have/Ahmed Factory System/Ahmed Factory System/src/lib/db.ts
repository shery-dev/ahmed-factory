import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

/**
 * SQLite is used here so the whole system runs locally with no services to
 * install. The repository layer below is the only place that touches SQL,
 * so moving to Postgres for production is a contained change.
 */

const DB_PATH = path.join(process.cwd(), 'data', 'factory.db');

declare global {
  // eslint-disable-next-line no-var
  var __factoryDb: Database.Database | undefined;
}

function open(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

// Reused across hot reloads in dev so we don't leak handles.
export const db: Database.Database = global.__factoryDb ?? open();
if (process.env.NODE_ENV !== 'production') global.__factoryDb = db;

export function applySchema(target: Database.Database = db) {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'src', 'lib', 'schema.sql'),
    'utf8',
  );
  target.exec(sql);
}

export const money = (n: number) =>
  new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(
    Math.round((n + Number.EPSILON) * 100) / 100,
  );

export function logActivity(
  event: string,
  detail = '',
  level: 'system' | 'agent' | 'success' | 'warn' | 'error' = 'system',
  actor = 'system',
  billId: number | null = null,
  target: Database.Database = db,
) {
  target
    .prepare(
      `INSERT INTO activity_log (level, actor, event, detail, bill_id)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(level, actor, event, detail, billId);
}
