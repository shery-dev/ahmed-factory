import { dbAll, dbGet, dbRun } from './db';

const DEFAULTS: Record<string, string> = {
  factory_name: 'Ahmed Corrugation Machines',
  factory_name_ur: 'احمد کوروگیشن مشینز',
  factory_address: '',
  factory_phone: '',
  expense_categories: JSON.stringify(['general','diesel','transport','chai','loading','maintenance','rent','salary','other']),
  payment_methods: JSON.stringify(['Cash','Cheque','Transfer']),
};

export async function ensureSettingsTable() {
  await dbRun(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '')`, []);
}

export async function getSetting(key: string, fallback?: string): Promise<string> {
  await ensureSettingsTable();
  const row = await dbGet<{ value: string }>(`SELECT value FROM settings WHERE key = ?`, [key]);
  return row?.value ?? fallback ?? DEFAULTS[key] ?? '';
}

export async function getSettings(): Promise<Record<string, string>> {
  await ensureSettingsTable();
  const rows = await dbAll<{ key: string; value: string }>(`SELECT key, value FROM settings`);
  const result: Record<string, string> = { ...DEFAULTS };
  for (const r of rows) result[r.key] = r.value;
  return result;
}

export async function updateSetting(key: string, value: string) {
  await ensureSettingsTable();
  await dbRun(
    `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

export async function updateSettings(pairs: Record<string, string>) {
  await ensureSettingsTable();
  for (const [key, value] of Object.entries(pairs)) {
    await updateSetting(key, value);
  }
}

export function getExpenseCategories(settings: Record<string, string>): string[] {
  try { return JSON.parse(settings.expense_categories || '[]'); } catch { return DEFAULTS.expense_categories ? JSON.parse(DEFAULTS.expense_categories) : []; }
}

export function getPaymentMethods(settings: Record<string, string>): string[] {
  try { return JSON.parse(settings.payment_methods || '[]'); } catch { return DEFAULTS.payment_methods ? JSON.parse(DEFAULTS.payment_methods) : []; }
}
