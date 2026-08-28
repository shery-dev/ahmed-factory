import { db, logActivity } from './db';
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
export const listItemTypes = (activeOnly = true): ItemType[] =>
  db.prepare(
    `SELECT * FROM item_types ${activeOnly ? 'WHERE active = 1' : ''}
     ORDER BY sort_order, name_en`,
  ).all() as ItemType[];

export function createItemType(input: {
  name_en: string; name_ur: string; family: string; is_bareek: number;
  default_rate: number; description_en?: string; description_ur?: string;
}) {
  const code = input.name_en.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const max = db.prepare(`SELECT COALESCE(MAX(sort_order),0) n FROM item_types`).get() as { n: number };
  const info = db.prepare(
    `INSERT INTO item_types
       (code, name_en, name_ur, family, is_bareek, description_en, description_ur, default_rate, sort_order)
     VALUES (@code, @name_en, @name_ur, @family, @is_bareek, @description_en, @description_ur, @default_rate, @sort_order)`,
  ).run({
    ...input, code,
    description_en: input.description_en ?? null,
    description_ur: input.description_ur ?? null,
    sort_order: max.n + 1,
  });
  logActivity(
    'Product added to catalogue',
    `${input.name_en} @ PKR ${input.default_rate} — no code change required`,
    'success', 'owner',
  );
  return Number(info.lastInsertRowid);
}

export function updateRate(itemTypeId: number, rate: number) {
  const prev = db.prepare(`SELECT name_en, default_rate FROM item_types WHERE id = ?`)
    .get(itemTypeId) as { name_en: string; default_rate: number };
  db.prepare(`UPDATE item_types SET default_rate = ? WHERE id = ?`).run(rate, itemTypeId);
  db.prepare(`UPDATE stock_items SET rate = ? WHERE item_type_id = ?`).run(rate, itemTypeId);
  logActivity('Rate changed', `${prev.name_en}: ${prev.default_rate} → ${rate}`, 'warn', 'owner');
}

// ─── Customers ────────────────────────────────────────────────────────────────
export const listCustomers = (kind?: 'cash' | 'ledger'): Customer[] =>
  db.prepare(
    `SELECT * FROM customers WHERE active = 1 ${kind ? 'AND kind = @kind' : ''}
     ORDER BY name`,
  ).all(kind ? { kind } : {}) as Customer[];

export const getCustomer = (id: number): Customer | undefined =>
  db.prepare(`SELECT * FROM customers WHERE id = ?`).get(id) as Customer | undefined;

export function createCustomer(input: {
  kind: 'cash' | 'ledger'; name: string; contact?: string;
  manual_ledger_page?: string; credit_limit?: number;
}) {
  // Cash customers get a c-prefixed code, ledger clients a plain integer —
  // exactly the convention the factory already uses.
  const prefix = input.kind === 'cash' ? 'c' : '';
  const row = db.prepare(
    `SELECT COALESCE(MAX(CAST(REPLACE(code,'c','') AS INTEGER)),0) n
     FROM customers WHERE kind = ?`,
  ).get(input.kind) as { n: number };
  const code = `${prefix}${row.n + 1}`;
  const info = db.prepare(
    `INSERT INTO customers (code, kind, name, contact, manual_ledger_page, credit_limit)
     VALUES (?,?,?,?,?,?)`,
  ).run(code, input.kind, input.name.trim(), input.contact ?? null,
        input.manual_ledger_page ?? null, input.credit_limit ?? 0);
  logActivity('Customer created', `${code} — ${input.name}`, 'success', 'counter');
  return Number(info.lastInsertRowid);
}

/**
 * THE BALANCE IS COMPUTED, NEVER STORED.
 * The 2022 system kept a BALANCE column in every row; editing or deleting any
 * earlier row silently corrupted every later balance. This cannot happen here.
 */
export function customerBalance(customerId: number): number {
  const r = db.prepare(
    `SELECT COALESCE(SUM(debit + rent - credit), 0) AS bal
     FROM ledger_entries WHERE customer_id = ? AND flagged = 0`,
  ).get(customerId) as { bal: number };
  return Math.round((r.bal + Number.EPSILON) * 100) / 100;
}

export function customerLedger(customerId: number) {
  const rows = db.prepare(
    `SELECT * FROM ledger_entries WHERE customer_id = ? ORDER BY ts, id`,
  ).all(customerId) as Array<{
    id: number; ts: string; receipt_no: number | null; particulars: string;
    debit: number; credit: number; credit_method: string | null; rent: number;
    manual_page: string | null; flagged: number; flag_reason: string | null;
  }>;
  let running = 0;
  return rows.map((r) => {
    // Quarantined rows are shown for transparency but never move the balance.
    if (!r.flagged) running += r.debit + r.rent - r.credit;
    return { ...r, balance: Math.round((running + Number.EPSILON) * 100) / 100 };
  });
}

export function outstandingBalances() {
  return (db.prepare(
    `SELECT c.id, c.code, c.name, c.kind, c.contact,
            COALESCE(SUM(CASE WHEN l.flagged = 0 THEN l.debit + l.rent - l.credit ELSE 0 END), 0) AS balance,
            MAX(l.ts) AS last_activity
     FROM customers c LEFT JOIN ledger_entries l ON l.customer_id = c.id
     WHERE c.active = 1
     GROUP BY c.id HAVING balance > 0.005
     ORDER BY balance DESC`,
  ).all() as Array<{ id: number; code: string; name: string; kind: string;
                     contact: string | null; balance: number; last_activity: string | null }>);
}

// ─── Stock ────────────────────────────────────────────────────────────────────
export const listStock = (unit?: string): StockRow[] =>
  db.prepare(
    `SELECT s.*, t.name_en, t.name_ur
     FROM stock_items s JOIN item_types t ON t.id = s.item_type_id
     ${unit ? 'WHERE s.unit = @unit' : ''}
     ORDER BY t.sort_order, s.size`,
  ).all(unit ? { unit } : {}) as StockRow[];

export const sizesFor = (itemTypeId: number, unit: string) =>
  db.prepare(
    `SELECT size, quantity FROM stock_items
     WHERE item_type_id = ? AND unit = ? ORDER BY size`,
  ).all(itemTypeId, unit) as Array<{ size: number; quantity: number }>;

export const stockOnHand = (itemTypeId: number, size: number, unit: string): number => {
  const r = db.prepare(
    `SELECT quantity FROM stock_items WHERE item_type_id=? AND size=? AND unit=?`,
  ).get(itemTypeId, size, unit) as { quantity: number } | undefined;
  return r?.quantity ?? 0;
};

export function stockIn(input: {
  itemTypeId: number; size: number; unit: 'roll' | 'reel' | 'tota';
  quantity: number; rate: number; note?: string;
}) {
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO stock_items (item_type_id, size, unit, quantity, rate)
       VALUES (@itemTypeId, @size, @unit, @quantity, @rate)
       ON CONFLICT(item_type_id, size, unit)
       DO UPDATE SET quantity = quantity + excluded.quantity, rate = excluded.rate`,
    ).run(input);
    db.prepare(
      `INSERT INTO stock_movements
         (direction, item_type_id, size, unit, quantity, rate, ref_type, note, actor)
       VALUES ('in', @itemTypeId, @size, @unit, @quantity, @rate, 'stock_in', @note, 'store')`,
    ).run({ ...input, note: input.note ?? 'Stock received' });
  });
  tx();
  logActivity('Stock received', `${input.quantity} ${input.unit} @ size ${input.size}`, 'success', 'store');
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
 * ONE EVENT, FIVE CONSEQUENCES — all inside a single SQLite transaction.
 * If any step throws, every step rolls back. In the 2022 system these were
 * separate spreadsheet writes that routinely disagreed with each other.
 */
export function postBill(input: PostBillInput): PostBillResult {
  const errors: string[] = [];
  const customer = getCustomer(input.customerId);
  if (!customer) return { ok: false, errors: ['Customer not found'] };
  if (!input.lines.length) return { ok: false, errors: ['Bill has no lines'] };

  input.lines.forEach((l, idx) =>
    validateLine(l).forEach((e) => errors.push(`Line ${idx + 1}: ${e}`)),
  );
  if (errors.length) return { ok: false, errors };

  const priced = input.lines.map(priceAndDescribe);
  const totals = billTotals(priced, input.rent ?? 0, input.credit ?? 0);

  // Stock feasibility — checked BEFORE anything is written.
  if (!input.allowNegativeStock) {
    for (const l of priced) {
      if (!l.stockDraw) continue;
      const have = stockOnHand(l.itemTypeId!, l.stockDraw.size, l.stockDraw.unit);
      if (have < l.stockDraw.quantity) {
        errors.push(
          `Not enough stock for ${l.description} — on hand ${have}, needed ${l.stockDraw.quantity}`,
        );
      }
    }
  }
  if (errors.length) return { ok: false, errors };

  const effects: string[] = [];
  let billId = 0, receiptNo = 0;

  const tx = db.transaction(() => {
    // 1. Receipt number from a counter, inside the transaction.
    //    Cannot produce duplicates the way "last row + 1" did.
    db.prepare(`UPDATE counters SET value = value + 1 WHERE name = 'receipt_no'`).run();
    receiptNo = (db.prepare(`SELECT value FROM counters WHERE name='receipt_no'`)
      .get() as { value: number }).value;
    effects.push(`Receipt #${receiptNo} allocated from sequence`);

    // 2. Bill header + lines
    billId = Number(db.prepare(
      `INSERT INTO bills (receipt_no, customer_id, kind, subtotal, rent, credit, credit_method, note)
       VALUES (?,?,?,?,?,?,?,?)`,
    ).run(receiptNo, customer.id, customer.kind, totals.subtotal, totals.rent,
          totals.credit, input.creditMethod ?? null, input.note ?? null).lastInsertRowid);

    const insLine = db.prepare(
      `INSERT INTO bill_lines
        (bill_id, form, item_type_id, size, unit, qty, weight_kg, grammage,
         length_in, width_in, rate, amount, description)
       VALUES (@bill_id,@form,@item_type_id,@size,@unit,@qty,@weight_kg,@grammage,
               @length_in,@width_in,@rate,@amount,@description)`,
    );
    for (const l of priced) {
      insLine.run({
        bill_id: billId, form: l.form, item_type_id: l.itemTypeId ?? null,
        size: l.size ?? null, unit: l.unit, qty: l.qty ?? null,
        weight_kg: l.weightKg ?? null, grammage: l.grammage ?? null,
        length_in: l.lengthIn ?? null, width_in: l.widthIn ?? null,
        rate: l.rate, amount: l.amount, description: l.description,
      });
    }
    effects.push(`${priced.length} line${priced.length > 1 ? 's' : ''} written, subtotal PKR ${totals.subtotal}`);

    // 3. Stock decremented + a movement row naming the bill that caused it
    let moved = 0;
    const upd = db.prepare(
      `UPDATE stock_items SET quantity = quantity - ?
       WHERE item_type_id = ? AND size = ? AND unit = ?`,
    );
    const mov = db.prepare(
      `INSERT INTO stock_movements
         (direction, item_type_id, size, unit, quantity, rate, ref_type, ref_id, note, actor)
       VALUES ('out',?,?,?,?,?,'bill',?,?,'counter')`,
    );
    for (const l of priced) {
      if (!l.stockDraw) continue;
      upd.run(l.stockDraw.quantity, l.itemTypeId, l.stockDraw.size, l.stockDraw.unit);
      mov.run(l.itemTypeId, l.stockDraw.size, l.stockDraw.unit, l.stockDraw.quantity,
              l.rate, billId, `Sold to ${customer.name}`);
      moved++;
    }
    effects.push(moved
      ? `${moved} stock movement${moved > 1 ? 's' : ''} recorded against bill #${receiptNo}`
      : 'No stock-tracked items on this bill');

    // 4. Ledger entry — debit the customer, credit anything paid now
    db.prepare(
      `INSERT INTO ledger_entries
         (customer_id, bill_id, receipt_no, particulars, debit, credit, credit_method, rent, manual_page)
       VALUES (?,?,?,?,?,?,?,?,?)`,
    ).run(customer.id, billId, receiptNo,
          priced.map((l) => l.description).join(' || '),
          totals.subtotal, totals.credit, input.creditMethod ?? null,
          totals.rent, customer.manual_ledger_page);
    effects.push(`Ledger entry posted — debit ${totals.subtotal}, credit ${totals.credit}`);

    // 5. Audit
    logActivity('Bill posted', `#${receiptNo} · ${customer.name} · PKR ${totals.net} net`,
                'success', 'counter', billId);
  });

  try {
    tx();
  } catch (e) {
    // Nothing was written. This is the guarantee the old system could not make.
    logActivity('Bill FAILED — all changes rolled back', String(e), 'error', 'counter');
    return { ok: false, errors: [`Transaction rolled back: ${String(e)}`] };
  }

  const balance = customerBalance(customer.id);
  effects.push(`${customer.name} balance now PKR ${balance} (computed, not stored)`);
  return { ok: true, billId, receiptNo, effects };
}

// ─── Reads for the UI ─────────────────────────────────────────────────────────
export const getBill = (id: number) => {
  const bill = db.prepare(
    `SELECT b.*, c.name AS customer_name, c.code AS customer_code, c.contact
     FROM bills b JOIN customers c ON c.id = b.customer_id WHERE b.id = ?`,
  ).get(id) as any;
  if (!bill) return null;
  bill.lines = db.prepare(`SELECT * FROM bill_lines WHERE bill_id = ? ORDER BY id`).all(id);
  return bill;
};

export const listBills = (limit = 100) =>
  db.prepare(
    `SELECT b.id, b.receipt_no, b.ts, b.subtotal, b.rent, b.credit, b.kind,
            c.name AS customer_name, c.code AS customer_code,
            (SELECT COUNT(*) FROM bill_lines WHERE bill_id = b.id) AS line_count
     FROM bills b JOIN customers c ON c.id = b.customer_id
     ORDER BY b.id DESC LIMIT ?`,
  ).all(limit) as any[];

export const recentActivity = (limit = 40) =>
  db.prepare(`SELECT * FROM activity_log ORDER BY id DESC LIMIT ?`).all(limit) as Array<{
    id: number; ts: string; level: string; actor: string;
    event: string; detail: string | null; bill_id: number | null;
  }>;

export const dataIssues = () =>
  db.prepare(`SELECT * FROM data_issues WHERE resolved = 0 ORDER BY severity, id`).all() as Array<{
    id: number; source: string; entity: string; detail: string; severity: string;
  }>;

export function dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const q = (sql: string, ...a: any[]) => db.prepare(sql).get(...a) as any;
  return {
    billsToday:   q(`SELECT COUNT(*) n, COALESCE(SUM(subtotal),0) v FROM bills WHERE date(ts)=?`, today),
    creditToday:  q(`SELECT COALESCE(SUM(credit),0) v FROM bills WHERE date(ts)=?`, today),
    expensesToday:q(`SELECT COALESCE(SUM(amount),0) v FROM expenses WHERE date(ts)=?`, today),
    customers:    q(`SELECT COUNT(*) n FROM customers WHERE active=1`),
    products:     q(`SELECT COUNT(*) n FROM item_types WHERE active=1`),
    receivable:   q(`SELECT COALESCE(SUM(debit+rent-credit),0) v FROM ledger_entries WHERE flagged = 0`),
    lowStock:     db.prepare(
      `SELECT t.name_en, t.name_ur, s.size, s.unit, s.quantity
       FROM stock_items s JOIN item_types t ON t.id=s.item_type_id
       WHERE s.quantity <= 5 AND s.flagged = 0 ORDER BY s.quantity LIMIT 8`).all() as any[],
    issues:       q(`SELECT COUNT(*) n FROM data_issues WHERE resolved=0`),
  };
}
