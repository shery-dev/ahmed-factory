/**
 * Seed the database from the 2022 workbook export.
 *
 * Works with both:
 *   - Local SQLite file (no env vars needed)
 *   - Turso cloud database (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN in .env.local)
 *
 * Run:  npm run seed     (idempotent — skips if data already exists)
 */
import { createClient } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env.local manually (scripts don't go through Next.js env loading)
const envPath = path.join(ROOT, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const val = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

const IMPORT = path.join(ROOT, 'data', 'import', 'legacy.json');
const SCHEMA = path.join(ROOT, 'src', 'lib', 'schema.sql');

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(ROOT, 'data', 'factory.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url,
  authToken: authToken || undefined,
});

console.log(`Connecting to: ${url.replace(/\/\/.*@/, '//***@')}`);

// ─── Schema ──────────────────────────────────────────────────────────────────
const schemaSql = fs.readFileSync(SCHEMA, 'utf8');
// NOTE: each chunk between semicolons commonly starts with a `-- section`
// comment header followed by the real statement on the next line — filtering
// out anything that STARTS WITH '--' (as this used to) throws away the whole
// chunk, comment header AND the CREATE TABLE/INDEX after it. That silently
// skipped every table in this schema when seeding a brand-new local database
// (only ever worked against a Turso instance that already had the schema
// applied some other way). Strip comment LINES instead of whole chunks.
const statements = schemaSql.split(';')
  .map(s => s.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim())
  .filter(Boolean);
for (const stmt of statements) {
  if (stmt.toUpperCase().startsWith('PRAGMA')) continue;
  try {
    await db.execute({ sql: stmt, args: [] });
  } catch (e) {
    if (!String(e).includes('already exists')) {
      console.warn('Schema warning:', String(e).slice(0, 120));
    }
  }
}
console.log('✓ Schema applied (or already exists)');

// ─── Check if already seeded ─────────────────────────────────────────────────
const existing = await db.execute({ sql: 'SELECT COUNT(*) as n FROM item_types', args: [] });
if (Number(existing.rows[0].n) > 0) {
  console.log('✓ Database already has data — skipping seed.');
  db.close();
  process.exit(0);
}

const legacy = JSON.parse(fs.readFileSync(IMPORT, 'utf8'));
const issues = [];
const addIssue = (entity, detail, severity = 'warn') =>
  issues.push({ source: 'book.xlsx', entity, detail, severity });

// ─── Catalogue ────────────────────────────────────────────────────────────────
const typeIds = {};
for (const t of legacy.item_types) {
  const result = await db.execute({
    sql: `INSERT INTO item_types (code,name_en,name_ur,family,is_bareek,description_en,default_rate,sort_order)
   VALUES (@code,@name_en,@name_ur,@family,@is_bareek,@description_en,@default_rate,@sort_order)`,
    args: [t.code, t.name_en, t.name_ur, t.family, t.is_bareek, t.description_en, t.default_rate, t.sort_order],
  });
  typeIds[t.code] = Number(result.lastInsertRowid);
}
console.log(`✓ ${legacy.item_types.length} product types imported`);

// ─── Stock, with sanity checks ────────────────────────────────────────────────
const MAX_PLAUSIBLE = { roll: 2000, reel: 50000, tota: 50000 };
let flagged = 0, imported = 0;
for (const s of legacy.stock) {
  const tid = typeIds[s.type_code];
  if (!tid) { addIssue('stock', `Unknown product code "${s.type_code}" — row skipped`, 'error'); continue; }
  let qty = Number(s.quantity) || 0;
  let flag = 0, reason = null;
  if (qty < 0) {
    reason = `Source had a negative quantity (${qty}). Imported as 0.`;
    qty = 0; flag = 1;
  } else if (qty > (MAX_PLAUSIBLE[s.unit] ?? 5000)) {
    reason = `Source value ${qty.toLocaleString()} is implausible. Imported as 0.`;
    qty = 0; flag = 1;
  }
  if (flag) { flagged++; addIssue('stock', `${s.type_code} size ${s.size} (${s.unit}): ${reason}`); }
  await db.execute({
    sql: `INSERT INTO stock_items (item_type_id,size,unit,quantity,rate,flagged,flag_reason)
   VALUES (?,?,?,?,?,?,?)
   ON CONFLICT(item_type_id,size,unit) DO UPDATE SET quantity = quantity + excluded.quantity`,
    args: [tid, s.size, s.unit, qty, s.rate ?? 0, flag, reason],
  });
  imported++;
}
console.log(`✓ ${imported} stock rows imported, ${flagged} quarantined`);

// ─── Customers ────────────────────────────────────────────────────────────────
const custIds = {};
const LOOKS_LIKE_TEST = /^(qasim|abeera|abc|asc|acv fe|test|aaa|xyz)$/i;
for (const c of legacy.customers) {
  const suspect = !c.name || LOOKS_LIKE_TEST.test(c.name.trim());
  if (suspect) {
    addIssue('customer', `"${c.name || '(blank)'}" (${c.code}) looks like 2022 test data.`);
  }
  const result = await db.execute({
    sql: `INSERT INTO customers (code,kind,name,contact,manual_ledger_page,needs_review)
   VALUES (?,?,?,?,?,?)`,
    args: [c.code, c.kind, c.name || `Unnamed ${c.code}`, c.contact || null, c.manual_ledger_page || null, suspect ? 1 : 0],
  });
  custIds[c.code] = Number(result.lastInsertRowid);
}
console.log(`✓ ${legacy.customers.length} customers imported`);

// ─── Ledger ───────────────────────────────────────────────────────────────────
const MAX_LINE_PKR = 5_000_000;
const toIso = (d) => {
  const m = String(d).match(/^(\d{2})-(\d{2})-(\d{2,4})$/);
  if (!m) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  const yr = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${yr}-${m[2]}-${m[1]} 09:00:00`;
};
let maxReceipt = 0, ledgerFlagged = 0;
for (const l of legacy.ledger) {
  const cid = custIds[l.code];
  if (!cid) continue;
  const rno = Number(l.receipt_no) || null;
  if (rno && rno > maxReceipt) maxReceipt = rno;
  const d = l.debit || 0, c = l.credit || 0, r = l.rent || 0;
  const worst = Math.max(d, c, r);
  let flag = 0, reason = null;
  if (worst > MAX_LINE_PKR) {
    reason = `Amount PKR ${worst.toLocaleString()} is not plausible. Excluded from balances.`;
    flag = 1; ledgerFlagged++;
    addIssue('ledger', `"${l.particulars}" (${l.code}, receipt ${rno ?? '—'}): ${reason}`, 'error');
  }
  await db.execute({
    sql: `INSERT INTO ledger_entries (ts,customer_id,receipt_no,particulars,debit,credit,credit_method,rent,flagged,flag_reason)
   VALUES (?,?,?,?,?,?,?,?,?,?)`,
    args: [toIso(l.date), cid, rno, l.particulars, d, c, l.credit_method || null, r, flag, reason],
  });
}
console.log(`✓ ${legacy.ledger.length} ledger entries imported, ${ledgerFlagged} quarantined`);

// ─── Counters ─────────────────────────────────────────────────────────────────
await db.execute({ sql: `INSERT INTO counters (name,value) VALUES ('receipt_no',?)`, args: [maxReceipt] });
console.log(`✓ Receipt sequence starts after #${maxReceipt}`);

// ─── Data issues ──────────────────────────────────────────────────────────────
for (const i of issues) {
  await db.execute({
    sql: `INSERT INTO data_issues (source,entity,detail,severity) VALUES (?,?,?,?)`,
    args: [i.source, i.entity, i.detail, i.severity],
  });
}
await db.execute({
  sql: `INSERT INTO data_issues (source,entity,detail,severity) VALUES (?,?,?,?)`,
  args: ['book.xlsx', 'stock', 'error',
    'All per-size quantities came from the 2022 spreadsheet. Treat every figure as unverified until a physical count is entered.'],
});
await db.execute({
  sql: `INSERT INTO data_issues (source,entity,detail,severity) VALUES (?,?,?,?)`,
  args: ['business', 'ledger', 'warn',
    'The "rent" column exists in every legacy sheet but nothing explains what it charges for. Confirm with the factory.'],
});
console.log(`✓ ${issues.length + 2} items written to Needs Attention queue`);

// ─── Activity log ─────────────────────────────────────────────────────────────
await db.execute({ sql: `INSERT INTO activity_log (level,actor,event,detail) VALUES (?,?,?,?)`,
  args: ['system', 'import', 'Database created', 'Schema applied — 9 tables'] });
await db.execute({ sql: `INSERT INTO activity_log (level,actor,event,detail) VALUES (?,?,?,?)`,
  args: ['success', 'import', 'Catalogue imported', `${legacy.item_types.length} product types`] });
await db.execute({ sql: `INSERT INTO activity_log (level,actor,event,detail) VALUES (?,?,?,?)`,
  args: ['warn', 'import', 'Stock quarantined', `${flagged} rows failed sanity checks`] });
await db.execute({ sql: `INSERT INTO activity_log (level,actor,event,detail) VALUES (?,?,?,?)`,
  args: ['warn', 'import', 'Customers need review', 'Legacy names look like 2022 test entries'] });

db.close();
console.log('\n✅ Seed complete');
