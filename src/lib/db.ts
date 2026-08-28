import { createClient, type Client } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Database configuration:
 * - Production (Vercel): Uses Turso cloud database
 * - Development: Uses local SQLite file if TURSO_DATABASE_URL not set
 */

const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'factory.db');

declare global {
  // eslint-disable-next-line no-var
  var __factoryDb: Client | undefined;
}

function open(): Client {
  // Use Turso in production, local file in development
  const url = process.env.TURSO_DATABASE_URL || `file:${LOCAL_DB_PATH}`;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  return client;
}

// Reused across hot reloads in dev so we don't leak handles.
export const db: Client = global.__factoryDb ?? open();
if (process.env.NODE_ENV !== 'production') global.__factoryDb = db;

// Helper to execute raw SQL (for schema initialization)
export async function applySchema(target: Client = db) {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'src', 'lib', 'schema.sql'),
    'utf8',
  );
  // Execute each statement separately since libsql doesn't support multiple statements
  const statements = sql.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    await target.execute({ sql: stmt, args: [] });
  }
}

export const money = (n: number) =>
  new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(
    Math.round((n + Number.EPSILON) * 100) / 100,
  );

export async function logActivity(
  event: string,
  detail = '',
  level: 'system' | 'agent' | 'success' | 'warn' | 'error' = 'system',
  actor = 'system',
  billId: number | null = null,
  target: Client = db,
) {
  await target.execute({
    sql: `INSERT INTO activity_log (level, actor, event, detail, bill_id) VALUES (?, ?, ?, ?, ?)`,
    args: [level, actor, event, detail, billId],
  });
}

// Helper functions to mimic better-sqlite3 API
export async function dbAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  const result = await db.execute({ sql, args: params });
  return result.rows as T[];
}

export async function dbGet<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  const result = await db.execute({ sql, args: params });
  return result.rows[0] as T | undefined;
}

export async function dbRun(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number; changes: number }> {
  const result = await db.execute({ sql, args: params });
  return {
    lastInsertRowid: Number(result.lastInsertRowid),
    changes: result.rowsAffected,
  };
}
