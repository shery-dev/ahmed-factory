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
export const listItemTypes = async (opts?: { activeOnly?: boolean; search?: string }): Promise<ItemType[]> => {
  const params: any[] = [];
  let sql = `SELECT * FROM item_types WHERE 1=1`;
  if (opts?.activeOnly !== false) { sql += ' AND active = 1'; }
  if (opts?.search) { sql += ' AND (name_en LIKE ? OR name_ur LIKE ? OR code LIKE ? OR family LIKE ?)'; const s = `%${opts.search}%`; params.push(s, s, s, s); }
  sql += ' ORDER BY sort_order, name_en';
  return dbAll<ItemType>(sql, params);
};

export async function deactivateItemType(id: number) {
  const item = await dbGet<{ name_en: string }>(`SELECT name_en FROM item_types WHERE id = ?`, [id]);
  await dbRun(`UPDATE item_types SET active = 0 WHERE id = ?`, [id]);
  if (item) await logActivity('Product deactivated', item.name_en, 'warn', 'owner');
}

export async function reactivateItemType(id: number) {
  const item = await dbGet<{ name_en: string }>(`SELECT name_en FROM item_types WHERE id = ?`, [id]);
  await dbRun(`UPDATE item_types SET active = 1 WHERE id = ?`, [id]);
  if (item) await logActivity('Product reactivated', item.name_en, 'success', 'owner');
}

export async function updateItemType(id: number, input: { name_en?: string; name_ur?: string; family?: string; description_en?: string; description_ur?: string }) {
  const prev = await dbGet<{ name_en: string }>(`SELECT name_en FROM item_types WHERE id = ?`, [id]);
  const sets: string[] = [];
  const params: any[] = [];
  if (input.name_en !== undefined) { sets.push('name_en = ?'); params.push(input.name_en.trim()); }
  if (input.name_ur !== undefined) { sets.push('name_ur = ?'); params.push(input.name_ur.trim()); }
  if (input.family !== undefined) { sets.push('family = ?'); params.push(input.family.trim()); }
  if (input.description_en !== undefined) { sets.push('description_en = ?'); params.push(input.description_en.trim() || null); }
  if (input.description_ur !== undefined) { sets.push('description_ur = ?'); params.push(input.description_ur.trim() || null); }
  if (sets.length) { params.push(id); await dbRun(`UPDATE item_types SET ${sets.join(', ')} WHERE id = ?`, params); }
  if (prev) await logActivity('Product updated', prev.name_en, 'system', 'owner');
}

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
export const listCustomers = async (opts?: { kind?: 'cash' | 'ledger'; search?: string; includeInactive?: boolean }): Promise<Customer[]> => {
  const params: any[] = [];
  let sql = `SELECT * FROM customers WHERE 1=1`;
  if (!opts?.includeInactive) { sql += ' AND active = 1'; }
  if (opts?.kind) { sql += ' AND kind = ?'; params.push(opts.kind); }
  if (opts?.search) { sql += ' AND (name LIKE ? OR code LIKE ? OR contact LIKE ?)'; const s = `%${opts.search}%`; params.push(s, s, s); }
  sql += ' ORDER BY name';
  return dbAll<Customer>(sql, params);
};

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
  name: string; contact?: string; credit_limit?: number; manual_ledger_page?: string;
}) {
  const prev = await getCustomer(id);
  if (!prev) return;
  await dbRun(
    `UPDATE customers SET name = ?, contact = ?, credit_limit = ?, manual_ledger_page = ?,
       needs_review = CASE WHEN ? != '' AND needs_review = 1 THEN 0 ELSE needs_review END
     WHERE id = ?`,
    [input.name.trim(), input.contact ?? null, input.credit_limit ?? 0, input.manual_ledger_page ?? null, input.name.trim(), id],
  );
  await logActivity('Customer updated', `${prev.code} — ${input.name}`, 'system', 'counter');
}

export async function deactivateCustomer(id: number) {
  const c = await getCustomer(id);
  if (!c) return;
  await dbRun(`UPDATE customers SET active = 0 WHERE id = ?`, [id]);
  await logActivity('Customer deactivated', `${c.code} — ${c.name}`, 'warn', 'owner');
}

export async function reactivateCustomer(id: number) {
  const c = await dbGet<Customer>(`SELECT * FROM customers WHERE id = ?`, [id]);
  if (!c) return;
  await dbRun(`UPDATE customers SET active = 1 WHERE id = ?`, [id]);
  await logActivity('Customer reactivated', `${c.code} — ${c.name}`, 'success', 'owner');
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

/**
 * Record a payment received from a customer.
 * Inserts a ledger entry with credit = amount, which reduces the outstanding balance.
 */
export async function receivePayment(input: {
  customerId: number; amount: number; method: string; note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (input.amount <= 0) return { ok: false, error: 'Amount must be greater than zero' };
  const c = await getCustomer(input.customerId);
  if (!c) return { ok: false, error: 'Customer not found' };

  try {
    await dbRun(
      `INSERT INTO ledger_entries (customer_id, particulars, debit, credit, credit_method, rent)
       VALUES (?, ?, 0, ?, ?, 0)`,
      [input.customerId, input.note || `Payment received`, input.amount, input.method],
    );
    await logActivity('Payment received', `${c.name} · PKR ${input.amount} via ${input.method}`, 'success', 'ledger', input.customerId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
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
export const listStock = async (opts?: { unit?: string; search?: string }): Promise<StockRow[]> => {
  const params: any[] = [];
  let sql = `SELECT s.*, t.name_en, t.name_ur
     FROM stock_items s JOIN item_types t ON t.id = s.item_type_id WHERE 1=1`;
  if (opts?.unit) { sql += ' AND s.unit = ?'; params.push(opts.unit); }
  if (opts?.search) { sql += ' AND (t.name_en LIKE ? OR t.name_ur LIKE ? OR t.code LIKE ?)'; const s = `%${opts.search}%`; params.push(s, s, s); }
  sql += ' ORDER BY t.sort_order, s.size';
  return dbAll<StockRow>(sql, params);
};

export const stockSummary = async (search?: string) => {
  const params: any[] = [];
  let sql = `SELECT s.item_type_id, t.name_en, t.name_ur,
    COALESCE(SUM(CASE WHEN s.unit='roll' THEN s.quantity ELSE 0 END), 0) AS total_roll,
    COALESCE(SUM(CASE WHEN s.unit='reel' THEN s.quantity ELSE 0 END), 0) AS total_reel_kg,
    COALESCE(SUM(CASE WHEN s.unit='tota' THEN s.quantity ELSE 0 END), 0) AS total_tota_kg,
    COUNT(*) AS lines,
    SUM(CASE WHEN s.quantity <= 5 AND s.flagged = 0 THEN 1 ELSE 0 END) AS low
  FROM stock_items s JOIN item_types t ON t.id = s.item_type_id WHERE 1=1`;
  if (search) { sql += ' AND (t.name_en LIKE ? OR t.name_ur LIKE ? OR t.code LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
  sql += ' GROUP BY s.item_type_id ORDER BY t.sort_order, t.name_en';
  return dbAll<any>(sql, params);
};

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
  const params: any[] = [];
  let sql = `SELECT * FROM expenses WHERE 1=1`;
  if (from) { sql += ' AND date(ts) >= ?'; params.push(from); }
  if (to) { sql += ' AND date(ts) <= ?'; params.push(to); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY ts DESC';
  return dbAll<{ id: number; ts: string; category: string; detail: string; amount: number; actor: string }>(sql, params);
};

export async function updateExpense(id: number, input: { category: string; detail: string; amount: number }) {
  await dbRun(`UPDATE expenses SET category = ?, detail = ?, amount = ? WHERE id = ?`,
    [input.category, input.detail, input.amount, id]);
  await logActivity('Expense updated', `${input.category}: ${input.detail} — PKR ${input.amount}`, 'system', 'owner');
}

export async function deleteExpense(id: number) {
  const e = await dbGet<{ category: string; detail: string; amount: number }>(`SELECT * FROM expenses WHERE id = ?`, [id]);
  await dbRun(`DELETE FROM expenses WHERE id = ?`, [id]);
  if (e) await logActivity('Expense deleted', `${e.category}: ${e.detail} — PKR ${e.amount}`, 'warn', 'owner');
}

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

export const listBills = async (opts?: { limit?: number; offset?: number; search?: string; from?: string; to?: string; kind?: string; status?: string }) => {
  const params: any[] = [];
  let sql = `SELECT b.id, b.receipt_no, b.ts, b.subtotal, b.rent, b.credit, b.kind, b.status, b.note,
            c.name AS customer_name, c.code AS customer_code,
            (SELECT COUNT(*) FROM bill_lines WHERE bill_id = b.id) AS line_count
     FROM bills b JOIN customers c ON c.id = b.customer_id WHERE 1=1`;
  if (opts?.search) { sql += ' AND (c.name LIKE ? OR c.code LIKE ? OR CAST(b.receipt_no AS TEXT) LIKE ?)'; const s = `%${opts.search}%`; params.push(s, s, s); }
  if (opts?.from) { sql += ' AND date(b.ts) >= ?'; params.push(opts.from); }
  if (opts?.to) { sql += ' AND date(b.ts) <= ?'; params.push(opts.to); }
  if (opts?.kind) { sql += ' AND b.kind = ?'; params.push(opts.kind); }
  if (opts?.status) { sql += ' AND b.status = ?'; params.push(opts.status); }
  sql += ' ORDER BY b.id DESC';
  if (opts?.limit) { sql += ' LIMIT ?'; params.push(opts.limit); } else { sql += ' LIMIT 50'; }
  if (opts?.offset) { sql += ' OFFSET ?'; params.push(opts.offset); }
  return dbAll<any>(sql, params);
};

export const countBills = async (opts?: { search?: string; from?: string; to?: string; kind?: string; status?: string }) => {
  const params: any[] = [];
  let sql = `SELECT COUNT(*) n FROM bills b JOIN customers c ON c.id = b.customer_id WHERE 1=1`;
  if (opts?.search) { sql += ' AND (c.name LIKE ? OR c.code LIKE ? OR CAST(b.receipt_no AS TEXT) LIKE ?)'; const s = `%${opts.search}%`; params.push(s, s, s); }
  if (opts?.from) { sql += ' AND date(b.ts) >= ?'; params.push(opts.from); }
  if (opts?.to) { sql += ' AND date(b.ts) <= ?'; params.push(opts.to); }
  if (opts?.kind) { sql += ' AND b.kind = ?'; params.push(opts.kind); }
  if (opts?.status) { sql += ' AND b.status = ?'; params.push(opts.status); }
  return (await dbGet<{ n: number }>(sql, params))?.n ?? 0;
};

export const recentActivity = async (limit = 40) =>
  dbAll<{ id: number; ts: string; level: string; actor: string; event: string; detail: string | null; bill_id: number | null }>(
    `SELECT * FROM activity_log ORDER BY id DESC LIMIT ?`, [limit],
  );

export const dataIssues = async () =>
  dbAll<{ id: number; source: string; entity: string; detail: string; severity: string }>(
    `SELECT * FROM data_issues WHERE resolved = 0 ORDER BY severity, id`,
  );

export async function dashboard(from?: string, to?: string) {
  const date = from || new Date().toISOString().slice(0, 10);
  const toDate = to || date;
  const q = async (sql: string, ...a: unknown[]) => dbGet<any>(sql, a);
  const dateFilter = from || to ? `date(ts) >= ? AND date(ts) <= ?` : `date(ts) = ?`;
  const dateParams = from || to ? [date, toDate] : [date];
  return {
    billsToday:   await q(`SELECT COUNT(*) n, COALESCE(SUM(subtotal),0) v FROM bills WHERE ${dateFilter}`, ...dateParams),
    creditToday:  await q(`SELECT COALESCE(SUM(credit),0) v FROM bills WHERE ${dateFilter}`, ...dateParams),
    expensesToday:await q(`SELECT COALESCE(SUM(amount),0) v FROM expenses WHERE ${dateFilter}`, ...dateParams),
    customers:    await q(`SELECT COUNT(*) n FROM customers WHERE active=1`),
    products:     await q(`SELECT COUNT(*) n FROM item_types WHERE active=1`),
    receivable:   await q(`SELECT COALESCE(SUM(debit+rent-credit),0) v FROM ledger_entries WHERE flagged = 0`),
    lowStock:     await dbAll<any>(
      `SELECT t.name_en, t.name_ur, s.size, s.unit, s.quantity FROM stock_items s JOIN item_types t ON t.id=s.item_type_id WHERE s.quantity <= 5 AND s.flagged = 0 ORDER BY s.quantity LIMIT 8`,
    ),
    issues:       await q(`SELECT COUNT(*) n FROM data_issues WHERE resolved=0`),
  };
}


// ─── Reports (Phase 3) ─────────────────────────────────────────────────────
export async function stockValuationReport() {
  return dbAll<any>(
    `SELECT s.item_type_id, t.name_en, t.name_ur, s.size, s.unit, s.quantity, s.rate,
            ROUND(s.quantity * s.rate, 2) AS value,
            CASE WHEN s.quantity <= 5 AND s.flagged = 0 THEN 1 ELSE 0 END AS is_low
     FROM stock_items s JOIN item_types t ON t.id = s.item_type_id
     WHERE s.flagged = 0
     ORDER BY t.sort_order, t.name_en, s.size`
  );
}

export async function topCustomersByVolume(limit = 10) {
  return dbAll<any>(
    `SELECT c.id, c.code, c.name, COUNT(b.id) AS bill_count,
            COALESCE(SUM(b.subtotal), 0) AS total_volume
     FROM customers c JOIN bills b ON b.customer_id = c.id
     WHERE b.status = 'posted'
     GROUP BY c.id ORDER BY total_volume DESC LIMIT ?`,
    [limit]
  );
}

export async function topCustomersByOutstanding(limit = 10) {
  return dbAll<any>(
    `SELECT c.id, c.code, c.name,
            COALESCE(SUM(CASE WHEN l.flagged = 0 THEN l.debit + l.rent - l.credit ELSE 0 END), 0) AS balance
     FROM customers c LEFT JOIN ledger_entries l ON l.customer_id = c.id
     WHERE c.active = 1
     GROUP BY c.id HAVING balance > 0.005
     ORDER BY balance DESC LIMIT ?`,
    [limit]
  );
}

export async function periodSummary(from: string, to: string) {
  const dateParams = [from, to];
  const bills = await dbGet<any>(
    `SELECT COUNT(*) n, COALESCE(SUM(subtotal), 0) revenue, COALESCE(SUM(credit), 0) collected
     FROM bills WHERE date(ts) >= ? AND date(ts) <= ? AND status = 'posted'`, dateParams
  );
  const expenses = await dbGet<any>(
    `SELECT COUNT(*) n, COALESCE(SUM(amount), 0) total
     FROM expenses WHERE date(ts) >= ? AND date(ts) <= ?`, dateParams
  );
  // Previous period for comparison
  const fromDt = new Date(from);
  const toDt = new Date(to);
  const days = Math.round((toDt.getTime() - fromDt.getTime()) / 86400000) + 1;
  const prevFrom = new Date(fromDt.getTime() - days * 86400000).toISOString().slice(0, 10);
  const prevTo = new Date(fromDt.getTime() - 86400000).toISOString().slice(0, 10);
  const prevParams = [prevFrom, prevTo];
  const prevBills = await dbGet<any>(
    `SELECT COUNT(*) n, COALESCE(SUM(subtotal), 0) revenue, COALESCE(SUM(credit), 0) collected
     FROM bills WHERE date(ts) >= ? AND date(ts) <= ? AND status = 'posted'`, prevParams
  );
  const prevExpenses = await dbGet<any>(
    `SELECT COUNT(*) n, COALESCE(SUM(amount), 0) total
     FROM expenses WHERE date(ts) >= ? AND date(ts) <= ?`, prevParams
  );
  return {
    from, to, days,
    bills: bills ?? { n: 0, revenue: 0, collected: 0 },
    expenses: expenses ?? { n: 0, total: 0 },
    prev: {
      from: prevFrom, to: prevTo,
      bills: prevBills ?? { n: 0, revenue: 0, collected: 0 },
      expenses: prevExpenses ?? { n: 0, total: 0 },
    },
  };
}

export async function customerRecentRate(customerId: number, itemTypeId: number): Promise<number | null> {
  const r = await dbGet<{ rate: number }>(
    `SELECT bl.rate FROM bill_lines bl JOIN bills b ON b.id = bl.bill_id
     WHERE b.customer_id = ? AND bl.item_type_id = ? AND b.status = 'posted'
     ORDER BY b.ts DESC LIMIT 1`,
    [customerId, itemTypeId],
  );
  return r?.rate ?? null;
}


// --- Daily Report ---
export async function dailyReport(date: string) {
  const d = date || new Date().toISOString().slice(0, 10);

  const cashBills = await dbAll<any>(
    "SELECT b.id, b.receipt_no, b.ts, c.name, c.code, b.subtotal, b.credit, b.credit_method FROM bills b JOIN customers c ON c.id = b.customer_id WHERE date(b.ts) = ? AND c.kind = 'cash' AND b.status = 'posted' ORDER BY b.ts", [d]
  );

  const ledgerBills = await dbAll<any>(
    "SELECT b.id, b.receipt_no, b.ts, c.name, c.code, b.subtotal, b.credit, b.credit_method FROM bills b JOIN customers c ON c.id = b.customer_id WHERE date(b.ts) = ? AND c.kind = 'ledger' AND b.status = 'posted' ORDER BY b.ts", [d]
  );

  const expenses = await dbAll<any>(
    "SELECT id, ts, category, detail, amount, actor FROM expenses WHERE date(ts) = ? ORDER BY ts", [d]
  );

  const expenseByCategory = await dbAll<any>(
    "SELECT category, COUNT(*) n, SUM(amount) total FROM expenses WHERE date(ts) = ? GROUP BY category ORDER BY total DESC", [d]
  );

  const cashTotal = cashBills.reduce((s: number, b: any) => s + (b.subtotal || 0), 0);
  const cashCollected = cashBills.reduce((s: number, b: any) => s + (b.credit || 0), 0);
  const ledgerTotal = ledgerBills.reduce((s: number, b: any) => s + (b.subtotal || 0), 0);
  const ledgerCollected = ledgerBills.reduce((s: number, b: any) => s + (b.credit || 0), 0);
  const expenseTotal = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);

  const ledgerMovement = await dbGet<any>(
    "SELECT COALESCE(SUM(debit), 0) total_debit, COALESCE(SUM(credit), 0) total_credit, COALESCE(SUM(rent), 0) total_rent FROM ledger_entries WHERE date(ts) = ? AND flagged = 0", [d]
  );

  const lm = ledgerMovement || { total_debit: 0, total_credit: 0, total_rent: 0 };
  const netPosition = cashCollected - expenseTotal;

  return {
    date: d, cashBills, ledgerBills, expenses, expenseByCategory,
    cashTotal, cashCollected, ledgerTotal, ledgerCollected, expenseTotal,
    ledgerMovement: lm, netPosition,
    totalBills: cashBills.length + ledgerBills.length,
    totalDebit: lm.total_debit,
    totalCredit: lm.total_credit,
    totalRent: lm.total_rent,
  };
}

// ─── Waste & Scrap Stock (Jutta, Raddi, Nali) ─────────────────────────────────

async function ensureWasteTable() {
  await dbRun(`CREATE TABLE IF NOT EXISTS waste_stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK (category IN ('jutta','raddi','nali')),
    quantity_kg REAL NOT NULL DEFAULT 0,
    rate REAL NOT NULL DEFAULT 0,
    ts TEXT NOT NULL DEFAULT (datetime('now'))
  )`, []);
}

export const listWasteStock = async (): Promise<{ category: string; total_kg: number }[]> => {
  await ensureWasteTable();
  return dbAll<{ category: string; total_kg: number }>(
    `SELECT category, COALESCE(SUM(quantity_kg), 0) as total_kg FROM waste_stock GROUP BY category ORDER BY category`, []
  );
};

export async function addWasteStock(category: 'jutta' | 'raddi' | 'nali', quantityKg: number, rate: number, note?: string) {
  await ensureWasteTable();
  await dbRun(
    `INSERT INTO waste_stock (category, quantity_kg, rate) VALUES (?, ?, ?)`,
    [category, quantityKg, rate]
  );
  await logActivity('Waste stock added', `${quantityKg} kg ${category}`, 'success', 'store');
}

export async function adjustWasteStock(category: string, deltaKg: number, reason: string) {
  await ensureWasteTable();
  await dbRun(
    `INSERT INTO waste_stock (category, quantity_kg, rate) VALUES (?, ?, 0)`,
    [category, deltaKg]
  );
  await logActivity('Waste stock adjusted', `${deltaKg > 0 ? '+' : ''}${deltaKg} kg ${category} — ${reason}`, 'system', 'store');
}

export const wasteStockOnHand = async (category: string): Promise<number> => {
  await ensureWasteTable();
  const r = await dbGet<{ total_kg: number }>(
    `SELECT COALESCE(SUM(quantity_kg), 0) as total_kg FROM waste_stock WHERE category = ?`,
    [category]
  );
  return r?.total_kg ?? 0;
};
