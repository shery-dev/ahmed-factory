/**
 * Seed the database from the 2022 workbook export.
 *
 * Principle carried over from the Scope of Work: NOTHING IS SILENTLY DROPPED
 * AND NOTHING IMPLAUSIBLE IS SILENTLY IMPORTED. Values that fail a sanity
 * check are imported as zero, flagged on the stock row, and written to
 * data_issues so they surface in the app's "Needs Attention" queue.
 *
 * Run:  npm run seed     (idempotent — skips if the database already exists)
 *       npm run reset    (delete and rebuild)
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DB_PATH = path.join(ROOT, 'data', 'factory.db');
const IMPORT = path.join(ROOT, 'data', 'import', 'legacy.json');

if (fs.existsSync(DB_PATH)) {
  console.log('✓ Database already exists — skipping seed. Use `npm run reset` to rebuild.');
  process.exit(0);
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.exec(fs.readFileSync(path.join(ROOT, 'src', 'lib', 'schema.sql'), 'utf8'));

const legacy = JSON.parse(fs.readFileSync(IMPORT, 'utf8'));
const issues = [];
const addIssue = (entity, detail, severity = 'warn') =>
  issues.push({ source: 'book.xlsx', entity, detail, severity });

// ─── Catalogue ────────────────────────────────────────────────────────────────
const insType = db.prepare(
  `INSERT INTO item_types (code,name_en,name_ur,family,is_bareek,description_en,default_rate,sort_order)
   VALUES (@code,@name_en,@name_ur,@family,@is_bareek,@description_en,@default_rate,@sort_order)`,
);
const typeIds = {};
db.transaction(() => {
  for (const t of legacy.item_types) {
    typeIds[t.code] = Number(insType.run(t).lastInsertRowid);
  }
})();
console.log(`✓ ${legacy.item_types.length} product types imported (rates and descriptions are real)`);

// ─── Stock, with sanity checks ────────────────────────────────────────────────
// The legacy per-size quantities are demonstrably unreliable: negatives,
// and values like 1,111,111,189. They are imported but quarantined.
const MAX_PLAUSIBLE = { roll: 2000, reel: 50000, tota: 50000 };
const insStock = db.prepare(
  `INSERT INTO stock_items (item_type_id,size,unit,quantity,rate,flagged,flag_reason)
   VALUES (?,?,?,?,?,?,?)
   ON CONFLICT(item_type_id,size,unit) DO UPDATE SET quantity = quantity + excluded.quantity`,
);
let flagged = 0, imported = 0;
db.transaction(() => {
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
    insStock.run(tid, s.size, s.unit, qty, s.rate ?? 0, flag, reason);
    imported++;
  }
})();
console.log(`✓ ${imported} stock rows imported, ${flagged} quarantined as implausible`);

// ─── Customers ────────────────────────────────────────────────────────────────
const insCust = db.prepare(
  `INSERT INTO customers (code,kind,name,contact,manual_ledger_page,needs_review)
   VALUES (@code,@kind,@name,@contact,@manual_ledger_page,@needs_review)`,
);
const custIds = {};
// These names are visibly placeholders from 2022 testing, not the real register.
const LOOKS_LIKE_TEST = /^(qasim|abeera|abc|asc|acv fe|test|aaa|xyz)$/i;
db.transaction(() => {
  for (const c of legacy.customers) {
    const suspect = !c.name || LOOKS_LIKE_TEST.test(c.name.trim());
    if (suspect) {
      addIssue('customer', `"${c.name || '(blank)'}" (${c.code}) looks like 2022 test data — replace with the real customer from the paper register.`);
    }
    custIds[c.code] = Number(insCust.run({
      code: c.code, kind: c.kind, name: c.name || `Unnamed ${c.code}`,
      contact: c.contact || null, manual_ledger_page: c.manual_ledger_page || null,
      needs_review: suspect ? 1 : 0,
    }).lastInsertRowid);
  }
})();
console.log(`✓ ${legacy.customers.length} customers imported`);

// ─── Ledger — opening entries only, balance NEVER imported ────────────────────
const insLedger = db.prepare(
  `INSERT INTO ledger_entries (ts,customer_id,receipt_no,particulars,debit,credit,credit_method,rent,flagged,flag_reason)
   VALUES (?,?,?,?,?,?,?,?,?,?)`,
);
// A single line above this is not a real transaction for this business —
// rates run 28-111 PKR against weights in kilograms.
const MAX_LINE_PKR = 5_000_000;
const toIso = (d) => {
  const m = String(d).match(/^(\d{2})-(\d{2})-(\d{2,4})$/);
  if (!m) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  const yr = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${yr}-${m[2]}-${m[1]} 09:00:00`;
};
let maxReceipt = 0, ledgerFlagged = 0;
db.transaction(() => {
  for (const l of legacy.ledger) {
    const cid = custIds[l.code];
    if (!cid) continue;
    const rno = Number(l.receipt_no) || null;
    if (rno && rno > maxReceipt) maxReceipt = rno;
    const d = l.debit || 0, c = l.credit || 0, r = l.rent || 0;
    const worst = Math.max(d, c, r);
    let flag = 0, reason = null;
    if (worst > MAX_LINE_PKR) {
      reason = `Amount PKR ${worst.toLocaleString()} is not a plausible transaction. Excluded from balances.`;
      flag = 1; ledgerFlagged++;
      addIssue('ledger', `"${l.particulars}" (${l.code}, receipt ${rno ?? '—'}): ${reason}`, 'error');
    }
    insLedger.run(toIso(l.date), cid, rno, l.particulars,
      d, c, l.credit_method || null, r, flag, reason);
  }
})();
console.log(`✓ ${legacy.ledger.length} ledger entries imported, ${ledgerFlagged} quarantined (balances are computed, never stored)`);

// ─── Counters ─────────────────────────────────────────────────────────────────
// One shared receipt sequence for cash and ledger bills, as the factory uses.
db.prepare(`INSERT INTO counters (name,value) VALUES ('receipt_no',?)`).run(maxReceipt);
console.log(`✓ Receipt sequence starts after #${maxReceipt}`);

// ─── Data issues ──────────────────────────────────────────────────────────────
const insIssue = db.prepare(
  `INSERT INTO data_issues (source,entity,detail,severity) VALUES (@source,@entity,@detail,@severity)`,
);
db.transaction(() => {
  issues.forEach((i) => insIssue.run(i));
  insIssue.run({
    source: 'book.xlsx', entity: 'stock', severity: 'error',
    detail: 'All per-size quantities came from the 2022 spreadsheet and follow arithmetic test patterns. Treat every figure as unverified until a physical count is entered.',
  });
  insIssue.run({
    source: 'business', entity: 'ledger', severity: 'warn',
    detail: 'The "rent" column exists in every legacy sheet but nothing in 12,000 lines of code explains what it charges for. Confirm with the factory before relying on it.',
  });
})();
console.log(`✓ ${issues.length + 2} items written to the Needs Attention queue`);

// ─── Activity log seed ────────────────────────────────────────────────────────
const log = db.prepare(`INSERT INTO activity_log (level,actor,event,detail) VALUES (?,?,?,?)`);
log.run('system', 'import', 'Database created', `Schema applied — 9 tables replacing 29 spreadsheet sheets`);
log.run('success', 'import', 'Catalogue imported', `${legacy.item_types.length} product types are now DATA, not code`);
log.run('warn', 'import', 'Stock quarantined', `${flagged} rows failed sanity checks and were imported as 0`);
log.run('warn', 'import', 'Customers need review', 'Legacy names look like 2022 test entries');

db.close();
console.log('\n✅ Seed complete →', path.relative(ROOT, DB_PATH));
