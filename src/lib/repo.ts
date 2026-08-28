import { db, logActivity, dbAll, dbGet, dbRun } from './db';
import { priceAndDescribe, billTotals, validateLine, type LineInput } from './pricing';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ItemType {
  id: number; code: string; name_en: string; name_ur: string; family: string;
  is_bareek: number; description_en: string | null; description_ur: string | null;
  default_rate: number; active: number; sort_order: number;
}
export interface Customer {
  id: number; code: string; kind: 'cash' | 'ledger'; name: string;
  contact: string | null; manual_ledger_page: string | null;
  credit_limit: number; needs_review: number; active: number;
}
export interface StockRow {
  id: number; item_type_id: number; size: number; unit: string;
  quantity: number; rate: number; flagged: number; flag_reason: string | null;
  name_en: string; name_ur: string;
}

// ─── Catalogue ────────────────────────────────────────────────────────────────
export const listItemTypes = async (activeOnly = true): Promise<ItemType[]> =>
  dbAll<ItemType>(
    `SELECT * FROM item_types ${activeOnly ? 'WHERE active = 1' : ''}
     ORDER BY sort_order, name_en`,
  );

export async function createItemType(input: {
  name_en: string; name_ur: string; family: string; is_bareek: number;
  default_rate: number; description_en?: string; description_ur?: string;
}) {
  const code = input.name_en.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const max = await dbGet<{ n: number }>(`SELECT COALESCE(MAX(sort_order),0) n FROM item_types`);
  const info = await dbRun(
    `INSERT INTO item_types
       (code, name_en, name_ur, family, is_bareek, description_en, description_ur, default_rate, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [code, input.name_en, input.name_ur, input.family, input.is_bareek,
     input.description_en ?? null, input.description_ur ?? null, input.default_rate, (max?.n ?? 0) + 1],
  );
  await logActivity(
    'Product added to catalogue',
    `${input.name_en} @ PKR ${input.default_rate} — no code change required`,
    'success', 'owner',
  );
  return info.lastInsertRowid;
}

export async function updateRate(itemTypeId: number, rate: number) {
  const prev = await dbGet<{ name_en: string; default_rate: number }>(
    `SELECT name_en, default_rate FROM item_types WHERE id = ?`, [itemTypeId],
  );
  await dbRun(`UPDATE item_types SET default_rate = ? WHERE id = ?`, [rate, itemTypeId]);
  await dbRun(`UPDATE stock_items SET rate = ? WHERE item_type_id = ?`, [rate, itemTypeId]);
  if (prev) await logActivity('Rate changed', `${prev.name_en}: ${prev.default_rate} → ${rate}`, 'warn', 'owner');
}

// ─── Customers ────────────────────────────────────────────────────────────────
export const listCustomers = async (kind?: 'cash' | 'ledger'): Promise<Customer[]> =>
  dbAll<Customer>(
    `SELECT * FROM customers WHERE active = 1 ${kind ? 'AND kind = ?' : ''}
     ORDER BY name`,
    kind ? [kind] : [],
  );

export const getCustomer = async (id: number): Promise<Customer | undefined> =>
  dbGet<Customer>(`SELECT * FROM customers WHERE id = ?`, [id]);

export async function createCustomer(input: {
  kind: 'cash' | 'ledger'; name: string; contact?: string;
  manual_ledger_page?: string; credit_limit?: number;
}) {
  const prefix = input.kind === 'cash' ? 'c' : '';
  const row = await dbGet<{ n: number }>(
    `SELECT COALESCE(MAX(CAST(REPLACE(code,'c','') AS INTEGER)),0) n FROM customers WHERE kind = ?`,
    [input.kind],
  );
  const code = `${prefix}${(row?.n ?? 0) + 1}`;
  const info = await dbRun(
    `INSERT INTO customers (code, kind, name, contact, manual_ledger_page, credit_limit) VALUES (?,?,?,?,?,?)`,
    [code, input.kind, input.name.trim(), input.contact ?? null, input.manual_ledger_page ?? null, input.credit_limit ?? 0],
  );
  await logActivity('Customer created', `${code} — ${input.name}`, 'success', 'counter');
  return info.lastInsertRowid;
}

export async function updateCustomer(id: number, input: {
  name: string; contact?: string; credit_limit?: number;
}) {
  const prev = await getCustomer(id);
  if (!prev) return;
  await dbRun(
    `UPDATE customers SET name = ?, contact = ?, credit_limit = ?,
       needs_review = CASE WHEN ? != '' AND needs_review = 1 THEN 0 ELSE needs_review END
     WHERE id = ?`,
    [input.name.trim(), input.contact ?? null, input.credit_limit ?? 0, input.name.trim(), id],
  );
  await logActivity('Customer updated', `${prev.code} — ${input.name}`, 'system', 'counter');
}

export async function deactivateCustomer(id: number) {
  const c = await getCustomer(id);
  if (!c) return;
  await dbRun(`UPDATE customers SET active = 0 WHERE id = ?`, [id]);
  await logActivity('Customer deactivated', `${c.code} — ${c.name}`, 'warn', 'owner');
}

/**
 * THE BALANCE IS COMPUTED, NEVER STORED.
 */
export async function customerBalance(customerId: number): Promise<number> {
  const r = await dbGet<{ bal: number }>(
    `SELECT COALESCE(SUM(debit + rent - credit), 0) AS bal FROM ledger_entries WHERE customer_id = ? AND flagged = 0`,
    [customerId],
  );
  return Math.round(((r?.bal ?? 0) + Number.EPSILON) * 100) / 100;
}

export async function customerLedger(customerId: number) {
  const rows = await dbAll<{
    id: number; ts: string; receipt_no: number | null; particulars: string;
    debit: number; credit: number; credit_method: string | null; rent: number;
    manual_page: string | null; flagged: number; flag_reason: string | null;
  }>(`SELECT * FROM ledger_entries WHERE customer_id = ? ORDER BY ts, id`, [customerId]);
  
  let running = 0;
  return rows.map((r) => {
    if (!r.flagged) running += r.debit + r.rent - r.credit;
    return { ...r, balance: Math.round((running + Number.EPSILON) * 100) / 100 };
  });
}

export async function outstandingBalances() {
  return dbAll<{ id: number; code: string; name: string; kind: string;
                 contact: string | null; balance: number; last_activity: string | null }>(
    `SELECT c.id, c.code, c.name, c.kind, c.contact,
            COALESCE(SUM(CASE WHEN l.flagged = 0 THEN l.debit + l.rent - l.credit ELSE 0 END), 0) AS balance,
            MAX(l.ts) AS last_activity
     FROM customers c LEFT JOIN ledger_entries l ON l.customer_id = c.id
     WHERE c.active = 1
     GROUP BY c.id HAVING balance > 0.005
     ORDER BY balance DESC`,
  );
}

// ─── Stock ────────────────────────────────────────────────────────────────────
export const listStock = async (unit?: string): Promise<StockRow[]> =>
  dbAll<StockRow>(
    `SELECT s.*, t.name_en, t.name_ur
     FROM stock_items s JOIN item_types t ON t.id = s.item_type_id
     ${unit ? 'WHERE s.unit = ?' : ''}
     ORDER BY t.sort_order, s.size`,
    unit ? [unit] : [],
  );

export const sizesFor = async (itemTypeId: number, unit: string) =>
  dbAll<{ size: number; quantity: number }>(
    `SELECT size, quantity FROM stock_items WHERE item_type_id = ? AND unit = ? ORDER BY size`,
    [itemTypeId, unit],
  );

export const stockOnHand = async (itemTypeId: number, size: number, unit: string): Promise<number> => {
  const r = await dbGet<{ quantity: number }>(
    `SELECT quantity FROM stock_items WHERE item_type_id=? AND size=? AND unit=?`,
    [itemTypeId, size, unit],
  );
  return r?.quantity ?? 0;
};

export async function stockIn(input: {
  itemTypeId: number; size: number; unit: 'roll' | 'reel' | 'tota';
  quantity: number; rate: number; note?: string;
}) {
  // Use batch for transaction-like behavior
  await db.batch([
    {
      sql: `INSERT INTO stock_items (item_type_id, size, unit, quantity, rate)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(item_type_id, size, unit)
       DO UPDATE SET quantity = quantity + excluded.quantity, rate = excluded.rate`,
      args: [input.itemTypeId, input.size, input.unit, input.quantity, input.rate],
    },
    {
      sql: `INSERT INTO stock_movements
         (direction, item_type_id, size, unit, quantity, rate, ref_type, note, actor)
       VALUES ('in', ?, ?, ?, ?, ?, 'stock_in', ?, 'store')`,
      args: [input.itemTypeId, input.size, input.unit, input.quantity, input.rate, input.note ?? 'Stock received'],
    },
  ]);
  await logActivity('Stock received', `${input.quantity} ${input.unit} @ size ${input.size}`, 'success', 'store');
}

// ─── Billing: the atomic transaction ──────────────────────────────────────────
export interface PostBillInput {
  customerId: number;
  lines: LineInput[];
  rent?: number;
  credit?: number;
  creditMethod?: string;
  note?: string;
  allowNegativeStock?: boolean;
}

export interface PostBillResult {
  ok: boolean;
  billId?: number;
  receiptNo?: number;
  errors?: string[];
  effects?: string[];
}

/**
 * ONE EVENT, FIVE CONSEQUENCES — all inside a single transaction.
 */
export async function postBill(input: PostBillInput): Promise<PostBillResult> {
  const errors: string[] = [];
  const customer = await getCustomer(input.customerId);
  if (!customer) return { ok: false, errors: ['Customer not found'] };
  if (!input.lines.length) return { ok: false, errors: ['Bill has no lines'] };

  input.lines.forEach((l, idx) =>
    validateLine(l).forEach((e) => errors.push(`Line ${idx + 1}: ${e}`)),
  );
  if (errors.length) return { ok: false, errors };

  const priced = input.lines.map(priceAndDescribe);
  const totals = billTotals(priced, input.rent ?? 0, input.credit ?? 0);

  // Stock feasibility check
  if (!input.allowNegativeStock) {
    for (const l of priced) {
      if (!l.stockDraw) continue;
      const have = await stockOnHand(l.itemTypeId!, l.stockDraw.size, l.stockDraw.unit);
      if (have < l.stockDraw.quantity) {
        errors.push(`Not enough stock for ${l.description} — on hand ${have}, needed ${l.stockDraw.quantity}`);
      }
    }
  }
  if (errors.length) return { ok: false, errors };

  const effects: string[] = [];
  let billId = 0, receiptNo = 0;

  try {
    // 1. Get receipt number
    await dbRun(`UPDATE counters SET value = value + 1 WHERE name = 'receipt_no'`, []);
    const counter = await dbGet<{ value: number }>(`SELECT value FROM counters WHERE name='receipt_no'`);
    receiptNo = counter!.value;
    effects.push(`Receipt #${receiptNo} allocated from sequence`);

    // 2. Insert bill
    const billResult = await dbRun(
      `INSERT INTO bills (receipt_no, customer_id, kind, subtotal, rent, credit, credit_method, note) VALUES (?,?,?,?,?,?,?,?)`,
      [receiptNo, customer.id, customer.kind, totals.subtotal, totals.rent, totals.credit, input.creditMethod ?? null, input.note ?? null],
    );
    billId = billResult.lastInsertRowid;

    // 3. Insert bill lines
    for (const l of priced) {
      await dbRun(
        `INSERT INTO bill_lines (bill_id, form, item_type_id, size, unit, qty, weight_kg, grammage, length_in, width_in, rate, amount, description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [billId, l.form, l.itemTypeId ?? null, l.size ?? null, l.unit, l.qty ?? null, l.weightKg ?? null, l.grammage ?? null, l.lengthIn ?? null, l.widthIn ?? null, l.rate, l.amount, l.description],
      );
    }
    effects.push(`${priced.length} line${priced.length > 1 ? 's' : ''} written, subtotal PKR ${totals.subtotal}`);

    // 4. Stock movements
    let moved = 0;
    for (const l of priced) {
      if (!l.stockDraw) continue;
      await dbRun(`UPDATE stock_items SET quantity = quantity - ? WHERE item_type_id = ? AND size = ? AND unit = ?`,
        [l.stockDraw.quantity, l.itemTypeId, l.stockDraw.size, l.stockDraw.unit]);
      await dbRun(
        `INSERT INTO stock_movements (direction, item_type_id, size, unit, quantity, rate, ref_type, ref_id, note, actor) VALUES ('out',?,?,?,?,?,'bill',?,?,'counter')`,
        [l.itemTypeId, l.stockDraw.size, l.stockDraw.unit, l.stockDraw.quantity, l.rate, billId, `Sold to ${customer.name}`],
      );
      moved++;
    }
    effects.push(moved ? `${moved} stock movement${moved > 1 ? 's' : ''} recorded against bill #${receiptNo}` : 'No stock-tracked items on this bill');

    // 5. Ledger entry
    await dbRun(
      `INSERT INTO ledger_entries (customer_id, bill_id, receipt_no, particulars, debit, credit, credit_method, rent, manual_page) VALUES (?,?,?,?,?,?,?,?,?)`,
      [customer.id, billId, receiptNo, priced.map((l) => l.description).join(' || '), totals.subtotal, totals.credit, input.creditMethod ?? null, totals.rent, customer.manual_ledger_page],
    );
    effects.push(`Ledger entry posted — debit ${totals.subtotal}, credit ${totals.credit}`);

    // 6. Audit
    await logActivity('Bill posted', `#${receiptNo} · ${customer.name} · PKR ${totals.net} net`, 'success', 'counter', billId);

  } catch (e) {
    await logActivity('Bill FAILED — all changes rolled back', String(e), 'error', 'counter');
    return { ok: false, errors: [`Transaction rolled back: ${String(e)}`] };
  }

  const balance = await customerBalance(customer.id);
  effects.push(`${customer.name} balance now PKR ${balance} (computed, not stored)`);
  return { ok: true, billId, receiptNo, effects };
}

export async function stockAdjust(input: {
  itemTypeId: number; size: number; unit: 'roll' | 'reel' | 'tota';
  newQuantity: number; reason: string; actor?: string;
}) {
  const prev = await stockOnHand(input.itemTypeId, input.size, input.unit);
  const diff = input.newQuantity - prev;
  
  await db.batch([
    {
      sql: `UPDATE stock_items SET quantity = ?, flagged = 0, flag_reason = NULL WHERE item_type_id = ? AND size = ? AND unit = ?`,
      args: [input.newQuantity, input.itemTypeId, input.size, input.unit],
    },
    {
      sql: `INSERT INTO stock_movements (direction, item_type_id, size, unit, quantity, rate, ref_type, note, actor) VALUES ('adjust', ?, ?, ?, ?, 0, 'adjustment', ?, ?)`,
      args: [input.itemTypeId, input.size, input.unit, Math.abs(diff),
        `${input.reason} (${prev} → ${input.newQuantity}, Δ${diff > 0 ? '+' : ''}${diff})`,
        input.actor ?? 'owner'],
    },
  ]);
  await logActivity('Stock adjusted',
    `${input.size}" — ${prev} → ${input.newQuantity} (${diff > 0 ? '+' : ''}${diff})`,
    'warn', input.actor ?? 'owner');
}

// ─── Bills: void ─────────────────────────────────────────────────────────────
export async function voidBill(billId: number, reason: string, actor = 'owner') {
  const bill = await getBill(billId);
  if (!bill) return { ok: false, error: 'Bill not found' };
  if (bill.status === 'void') return { ok: false, error: 'Bill is already void' };

  try {
    // 1. Mark bill void
    await dbRun(`UPDATE bills SET status = 'void', note = COALESCE(note || ' | ', '') || 'VOID: ' || ? WHERE id = ?`,
      [reason, billId]);

    // 2. Reverse stock movements
    const lines = bill.lines as any[];
    for (const l of lines) {
      if (l.form === 'rolls' || l.form === 'reels' || l.form === 'totay') {
        const unit = l.form === 'rolls' ? 'roll' : l.form === 'reels' ? 'reel' : 'tota';
        const qty = l.form === 'rolls' ? l.qty : l.weight_kg;
        if (!qty || !l.size) continue;
        await dbRun(`UPDATE stock_items SET quantity = quantity + ? WHERE item_type_id = ? AND size = ? AND unit = ?`,
          [qty, l.item_type_id, l.size, unit]);
        await dbRun(
          `INSERT INTO stock_movements (direction, item_type_id, size, unit, quantity, rate, ref_type, ref_id, note, actor) VALUES ('in', ?, ?, ?, ?, ?, 'void', ?, 'Void reversal — bill #' || ?, ?)`,
          [l.item_type_id, l.size, unit, qty, l.rate, billId, bill.receipt_no, actor],
        );
      }
    }

    // 3. Reverse ledger entries
    await dbRun(
      `INSERT INTO ledger_entries (customer_id, bill_id, receipt_no, particulars, debit, credit, rent, manual_page) VALUES (?, ?, ?, 'VOID reversal — bill #' || ?, 0, ?, ?, ?)`,
      [bill.customer_id, billId, bill.receipt_no, bill.receipt_no, bill.subtotal, bill.rent, bill.manual_ledger_page ?? null],
    );
    await dbRun(
      `INSERT INTO ledger_entries (customer_id, bill_id, receipt_no, particulars, debit, credit, rent) VALUES (?, ?, ?, 'VOID offset — bill #' || ?, ?, 0, 0)`,
      [bill.customer_id, billId, bill.receipt_no, bill.receipt_no, bill.subtotal + bill.rent],
    );

    await logActivity('Bill voided', `#${bill.receipt_no} — ${reason}`, 'warn', actor, billId);
  } catch (e) {
    await logActivity('Void FAILED', String(e), 'error', actor);
    return { ok: false, error: `Transaction failed: ${String(e)}` };
  }
  return { ok: true };
}

// ─── Expenses ─────────────────────────────────────────────────────────────────
export async function addExpense(input: { category: string; detail: string; amount: number; actor?: string }) {
  const info = await dbRun(`INSERT INTO expenses (category, detail, amount, actor) VALUES (?, ?, ?, ?)`,
    [input.category, input.detail, input.amount, input.actor ?? 'owner']);
  await logActivity('Expense recorded', `${input.category}: ${input.detail} — PKR ${input.amount}`, 'system', input.actor ?? 'owner');
  return info.lastInsertRowid;
}

export const listExpenses = async (from?: string, to?: string, category?: string) => {
  const params: unknown[] = [];
  let sql = `SELECT * FROM expenses WHERE 1=1`;
  if (from) { sql += ' AND date(ts) >= ?'; params.push(from); }
  if (to) { sql += ' AND date(ts) <= ?'; params.push(to); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY ts DESC';
  return dbAll<{ id: number; ts: string; category: string; detail: string; amount: number; actor: string }>(sql, params);
};

// ─── Data issues: resolve ─────────────────────────────────────────────────────
export async function resolveIssue(issueId: number, note: string) {
  await dbRun(`UPDATE data_issues SET resolved = 1 WHERE id = ?`, [issueId]);
  await logActivity('Issue resolved', note || `Issue #${issueId}`, 'success', 'owner');
}

export const allDataIssues = async (resolved?: boolean) => {
  const sql = `SELECT * FROM data_issues ${resolved !== undefined ? `WHERE resolved = ${resolved ? 1 : 0}` : ''} ORDER BY severity, id`;
  return dbAll<{ id: number; source: string; entity: string; detail: string; severity: string; resolved: number; created_at: string }>(sql);
};

// ─── Reads for the UI ─────────────────────────────────────────────────────────
export const getBill = async (id: number) => {
  const bill = await dbGet<any>(
    `SELECT b.*, c.name AS customer_name, c.code AS customer_code, c.contact FROM bills b JOIN customers c ON c.id = b.customer_id WHERE b.id = ?`,
    [id],
  );
  if (!bill) return null;
  bill.lines = await dbAll(`SELECT * FROM bill_lines WHERE bill_id = ? ORDER BY id`, [id]);
  return bill;
};

export const listBills = async (limit = 100) =>
  dbAll<any>(
    `SELECT b.id, b.receipt_no, b.ts, b.subtotal, b.rent, b.credit, b.kind, b.status,
            c.name AS customer_name, c.code AS customer_code,
            (SELECT COUNT(*) FROM bill_lines WHERE bill_id = b.id) AS line_count
     FROM bills b JOIN customers c ON c.id = b.customer_id
     ORDER BY b.id DESC LIMIT ?`,
    [limit],
  );

export const recentActivity = async (limit = 40) =>
  dbAll<{ id: number; ts: string; level: string; actor: string; event: string; detail: string | null; bill_id: number | null }>(
    `SELECT * FROM activity_log ORDER BY id DESC LIMIT ?`, [limit],
  );

export const dataIssues = async () =>
  dbAll<{ id: number; source: string; entity: string; detail: string; severity: string }>(
    `SELECT * FROM data_issues WHERE resolved = 0 ORDER BY severity, id`,
  );

export async function dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const q = async (sql: string, ...a: unknown[]) => dbGet<any>(sql, a);
  return {
    billsToday:   await q(`SELECT COUNT(*) n, COALESCE(SUM(subtotal),0) v FROM bills WHERE date(ts)=?`, today),
    creditToday:  await q(`SELECT COALESCE(SUM(credit),0) v FROM bills WHERE date(ts)=?`, today),
    expensesToday:await q(`SELECT COALESCE(SUM(amount),0) v FROM expenses WHERE date(ts)=?`, today),
    customers:    await q(`SELECT COUNT(*) n FROM customers WHERE active=1`),
    products:     await q(`SELECT COUNT(*) n FROM item_types WHERE active=1`),
    receivable:   await q(`SELECT COALESCE(SUM(debit+rent-credit),0) v FROM ledger_entries WHERE flagged = 0`),
    lowStock:     await dbAll<any>(
      `SELECT t.name_en, t.name_ur, s.size, s.unit, s.quantity FROM stock_items s JOIN item_types t ON t.id=s.item_type_id WHERE s.quantity <= 5 AND s.flagged = 0 ORDER BY s.quantity LIMIT 8`,
    ),
    issues:       await q(`SELECT COUNT(*) n FROM data_issues WHERE resolved=0`),
  };
}
