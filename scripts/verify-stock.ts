/**
 * Verifies the Stock module functions ported from the sibling project,
 * against a throwaway copy of the real (seeded) database — never the live
 * one. Mirrors that project's own verify-stock.ts pattern.
 *
 *   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/ts-hooks.mjs scripts/verify-stock.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const SOURCE = path.join(process.cwd(), 'data', 'factory.db');
const TEMP = path.join(os.tmpdir(), `ahmed-factory-verify-${Date.now()}.db`);
if (!fs.existsSync(SOURCE)) {
  console.error('No data/factory.db to copy. Run `npm run seed` first.');
  process.exit(1);
}
fs.copyFileSync(SOURCE, TEMP);
// db.ts already reads this to pick Turso vs a local file — no new plumbing needed.
process.env.TURSO_DATABASE_URL = `file:${TEMP}`;

const repo = await import('@/lib/repo');
const { db } = await import('@/lib/db');

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${label}${ok ? '' : `\n    expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

const type = (await repo.listItemTypes({ activeOnly: true })).find((t) => t.name_en === 'Fluting')!;
check('Fluting exists in the seeded catalogue', !!type, true);

// ── stockIn / stockOut ───────────────────────────────────────────────────────
const SIZE = 30, UNIT = 'roll' as const;
const startingQty = await repo.stockOnHand(type.id, SIZE, UNIT); // real seeded data, not necessarily 0
await repo.stockIn({ itemTypeId: type.id, size: SIZE, unit: UNIT, quantity: 50, rate: type.default_rate });
check('receive adds to the level', await repo.stockOnHand(type.id, SIZE, UNIT), startingQty + 50);

const { after } = await repo.stockOut({ itemTypeId: type.id, size: SIZE, unit: UNIT, quantity: 12, reason: 'verify: damaged' });
check('issue subtracts from the level', after, startingQty + 38);
check('...and matches stockOnHand', await repo.stockOnHand(type.id, SIZE, UNIT), startingQty + 38);

const issuesBefore = (await repo.allDataIssues()).length;
await repo.stockOut({ itemTypeId: type.id, size: SIZE, unit: UNIT, quantity: 1000, reason: 'verify: over-issue' });
check('over-issue is allowed (never blocks), level goes negative',
      (await repo.stockOnHand(type.id, SIZE, UNIT)) < 0, true);
check('...and raises a data issue', (await repo.allDataIssues()).length > issuesBefore, true);

// ── New-size safeguard ───────────────────────────────────────────────────────
const NEW_SIZE = 999;
const issuesBefore2 = (await repo.allDataIssues()).length;
await repo.stockIn({ itemTypeId: type.id, size: NEW_SIZE, unit: UNIT, quantity: 5, rate: 0 });
check('receiving a brand-new size succeeds', await repo.stockOnHand(type.id, NEW_SIZE, UNIT), 5);
check('...and raises exactly one Needs Attention row', (await repo.allDataIssues()).length, issuesBefore2 + 1);
await repo.stockIn({ itemTypeId: type.id, size: NEW_SIZE, unit: UNIT, quantity: 3, rate: 0 });
check('receiving that size again does NOT raise a second issue',
      (await repo.allDataIssues()).length, issuesBefore2 + 1);

// ── Reorder level drives "low" ───────────────────────────────────────────────
await repo.setReorderLevel(type.id, 50);
let summary = (await repo.typeStockSummaries(UNIT)).find((t) => t.id === type.id)!;
check('a size below the new reorder level counts as low', summary.low > 0, true);
await repo.setReorderLevel(type.id, 1);
summary = (await repo.typeStockSummaries(UNIT)).find((t) => t.id === type.id)!;
check('the same size is not low once the level is 1', summary.low === 0 || summary.low < summary.sizes, true);

// ── Family grouping ───────────────────────────────────────────────────────────
const families = await repo.familyStock(UNIT);
check('nine families, not eighteen loose products', families.length, 9);
check('every family has both a moti and a bareek variant',
      families.every((f) => f.moti && f.bareek), true);

// ── Large-quantity threshold ─────────────────────────────────────────────────
const threshold = await repo.largeQtyThreshold(type.id, UNIT);
check('a threshold is always returned', threshold > 0, true);
console.log(`\n(for reference: Fluting roll large-quantity threshold is ${threshold})`);

db.close();
// libsql's local-file client holds the handle briefly after close() on
// Windows; failing to remove the temp copy is not worth failing the run over.
try { fs.rmSync(TEMP, { force: true }); } catch {}

console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} CHECK(S) FAILED.`}`);
process.exit(failures === 0 ? 0 : 1);
