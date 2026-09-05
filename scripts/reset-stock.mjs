/**
 * Clears every product's current stock quantity back to zero, across the
 * whole catalogue — NOT a full database reset. item_types (the catalogue),
 * customers, bills, ledger_entries, expenses, settings, and users are all
 * left exactly as they are. Only `stock_items` is emptied; `stock_movements`
 * (the audit trail of how those old numbers were reached) is left in place.
 *
 * Why this instead of reseeding from data/import/legacy.json: the 2022
 * import's stock figures are the same untrusted data that produced the
 * Boxboard family-split bug and (per user report) at least one product
 * whose recorded stock disagrees with the real godown. Rather than patch
 * these one at a time as they're found, this makes every size on every
 * product start at zero and immediately open to a real Receive/Add Size —
 * a store man re-entering a true physical count is more trustworthy than
 * a 47-year-old spreadsheet export.
 *
 * Safe by construction:
 *   - No FK from anything else to stock_items.id — schema.sql shows
 *     stock_movements references item_type_id as plain data, not a hard
 *     foreign key to a stock_items row, so this can't orphan anything.
 *   - Dry-run by default. Prints exactly what's there and exits 0 without
 *     changing anything. Add --commit to actually clear it.
 *
 * Usage:
 *   node scripts/reset-stock.mjs             (dry run — reports only)
 *   node scripts/reset-stock.mjs --commit    (actually clears stock_items)
 *
 * Point it at production the same way every other script here does:
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/reset-stock.mjs
 * or put those two lines in .env.local and omit the env vars on the command line.
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

const commit = process.argv.includes('--commit');
const url = process.env.TURSO_DATABASE_URL || `file:${path.join(ROOT, 'data', 'factory.db')}`;
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });

console.log(`Target: ${url.replace(/\/\/.*@/, '//***@')}`);
console.log(commit ? 'Mode: COMMIT — this WILL delete rows.\n' : 'Mode: DRY RUN — no changes will be made.\n');

// ─── Report current state first, always ────────────────────────────────────
const totals = await db.execute(
  `SELECT COUNT(*) AS rows, COALESCE(SUM(quantity), 0) AS total_qty FROM stock_items`,
);
const byUnit = await db.execute(
  `SELECT unit, COUNT(*) AS rows, COALESCE(SUM(quantity), 0) AS qty FROM stock_items GROUP BY unit`,
);
const movementCount = await db.execute(`SELECT COUNT(*) AS n FROM stock_movements`);
const itemTypeCount = await db.execute(`SELECT COUNT(*) AS n FROM item_types WHERE active = 1`);
const customerCount = await db.execute(`SELECT COUNT(*) AS n FROM customers`);
const billCount = await db.execute(`SELECT COUNT(*) AS n FROM bills`);

console.log('Current stock_items:');
console.log(`  ${totals.rows[0].rows} rows, ${totals.rows[0].total_qty} total units on hand`);
for (const r of byUnit.rows) console.log(`    ${r.unit}: ${r.rows} rows, ${r.qty} units`);
console.log(`\nUnaffected by this script (reported so you can confirm nothing else moves):`);
console.log(`  item_types (active): ${itemTypeCount.rows[0].n}`);
console.log(`  customers:           ${customerCount.rows[0].n}`);
console.log(`  bills:               ${billCount.rows[0].n}`);
console.log(`  stock_movements:     ${movementCount.rows[0].n} (kept — audit history, not touched)`);

if (!commit) {
  console.log('\nNo changes made. Re-run with --commit to clear stock_items to zero rows.');
  db.close();
  process.exit(0);
}

if (Number(totals.rows[0].rows) === 0) {
  console.log('\nstock_items is already empty — nothing to do.');
  db.close();
  process.exit(0);
}

await db.execute(`DELETE FROM stock_items`);
try {
  await db.execute({
    sql: `INSERT INTO activity_log (level, actor, event, detail) VALUES (?,?,?,?)`,
    args: ['system', 'owner', 'Stock reset',
      `Cleared ${totals.rows[0].rows} stock_items rows (${totals.rows[0].total_qty} units) for manual re-entry`],
  });
} catch { /* activity_log may not exist on a brand-new database */ }

const after = await db.execute(`SELECT COUNT(*) AS n FROM stock_items`);
console.log(`\n✓ stock_items cleared. Rows remaining: ${after.rows[0].n} (should be 0).`);
console.log('Every product/size is now "Not stocked" and open to Receive / Add Size.');
db.close();
