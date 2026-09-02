import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { dbAll, dbGet, dbRun } from './db';

// JWT secret — 32 bytes for HS256
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ahmed-factory-dev-secret-change-me!');

export type Role = 'owner' | 'counter' | 'store';

export interface SessionUser {
  id: number;
  username: string;
  name: string;
  role: Role;
}

// ── Password hashing with Web Crypto SHA-256 ──
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'ahmed-salt-2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('hex');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

// ── JWT session management ──
export async function createSession(user: SessionUser): Promise<string> {
  return new SignJWT({ id: user.id, username: user.username, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (!payload.id || !payload.username) return null;
    return {
      id: payload.id as number,
      username: payload.username as string,
      name: (payload.name as string) || (payload.username as string),
      role: (payload.role as Role) || 'counter',
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifySession(token);
}

// ── User management ──
export async function getUserByUsername(username: string): Promise<(SessionUser & { password_hash: string; active: number }) | null> {
  const row = await dbGet<any>(
    'SELECT id, username, password_hash, name, role, active FROM users WHERE username = ?', [username]
  );
  if (!row) return null;
  return { id: row.id, username: row.username, password_hash: row.password_hash, name: row.name, role: row.role, active: row.active };
}

export async function ensureUsersTable() {
  await dbRun(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner','counter','store')),
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`, []);
}

export async function seedDefaultUser() {
  await ensureUsersTable();
  const existing = await dbGet<any>('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!existing) {
    const hash = await hashPassword('admin123');
    await dbRun(
      'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
      ['admin', hash, 'Administrator', 'owner']
    );
  }
}

export async function listUsers() {
  await ensureUsersTable();
  return dbAll<any>('SELECT id, username, name, role, active, created_at FROM users ORDER BY id');
}

export async function createUser(input: { username: string; password: string; name: string; role: Role }) {
  await ensureUsersTable();
  const hash = await hashPassword(input.password);
  return dbRun(
    'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
    [input.username.trim().toLowerCase(), hash, input.name.trim(), input.role]
  );
}

export async function updateUser(id: number, input: { name?: string; role?: Role; active?: number }) {
  const sets: string[] = [];
  const params: any[] = [];
  if (input.name !== undefined) { sets.push('name = ?'); params.push(input.name.trim()); }
  if (input.role !== undefined) { sets.push('role = ?'); params.push(input.role); }
  if (input.active !== undefined) { sets.push('active = ?'); params.push(input.active); }
  if (sets.length) { params.push(id); await dbRun(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params); }
}

export async function changeUserPassword(id: number, newPassword: string) {
  const hash = await hashPassword(newPassword);
  await dbRun('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
}

export async function deactivateUser(id: number) {
  await dbRun('UPDATE users SET active = 0 WHERE id = ?', [id]);
}

export async function activateUser(id: number) {
  await dbRun('UPDATE users SET active = 1 WHERE id = ?', [id]);
}

// ── Route protection map ──
export const ROLE_ACCESS: Record<string, Role[]> = {
  '/settings':   ['owner'],
  '/reports':    ['owner'],
  '/expenses':   ['owner'],
  '/billing':    ['owner', 'counter'],
  '/bills':      ['owner', 'counter'],
  '/customers':  ['owner', 'counter'],
  '/stock':      ['owner', 'store'],
  '/catalogue':  ['owner', 'store'],
};

export function hasAccess(pathname: string, role: Role): boolean {
  // Exact match or prefix match
  for (const [route, roles] of Object.entries(ROLE_ACCESS)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return roles.includes(role);
    }
  }
  // Dashboard, login, and other routes are accessible to all authenticated users
  return true;
}
