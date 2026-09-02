import { dbAll, dbGet } from './db';

function csvEscape(v: string | number | null): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function toCsv(rows: (string | number | null)[][]): string {
  return rows.map(r => r.map(csvEscape).join(',')).join('\n');
}

export async function exportBillsCsv(from?: string, to?: string): Promise<string> {
  const params: any[] = [];
  let sql = `SELECT b.id, b.receipt_no, b.ts, b.kind, b.subtotal, b.rent, b.credit, b.credit_method, b.status, b.note,
            c.name AS customer_name, c.code AS customer_code
     FROM bills b JOIN customers c ON c.id = b.customer_id WHERE 1=1`;
  if (from) { sql += ' AND date(b.ts) >= ?'; params.push(from); }
  if (to) { sql += ' AND date(b.ts) <= ?'; params.push(to); }
  sql += ' ORDER BY b.id DESC';
  const bills = await dbAll<any>(sql, params);

  const header = ['receipt_no','date','customer_name','customer_code','kind','subtotal','rent','paid','method','status','note'];
  const rows = bills.map(b => [b.receipt_no, b.ts, b.customer_name, b.customer_code, b.kind, b.subtotal, b.rent, b.credit, b.credit_method||'', b.status, b.note||'']);
  return toCsv([header, ...rows]);
}

export async function exportExpensesCsv(from?: string, to?: string, category?: string): Promise<string> {
  const params: any[] = [];
  let sql = 'SELECT * FROM expenses WHERE 1=1';
  if (from) { sql += ' AND date(ts) >= ?'; params.push(from); }
  if (to) { sql += ' AND date(ts) <= ?'; params.push(to); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY ts DESC';
  const rows = await dbAll<any>(sql, params);
  const header = ['date','category','detail','amount','actor'];
  const data = rows.map(r => [r.ts, r.category, r.detail, r.amount, r.actor]);
  return toCsv([header, ...data]);
}

export async function exportCustomerLedgerCsv(customerId: number): Promise<string> {
  const cust = await dbGet<any>('SELECT name, code FROM customers WHERE id = ?', [customerId]);
  if (!cust) return '';
  const entries = await dbAll<any>(
    'SELECT * FROM ledger_entries WHERE customer_id = ? ORDER BY ts, id', [customerId]
  );
  let running = 0;
  const header = ['date','receipt_no','particulars','debit','credit','rent','balance'];
  const data = entries.map((r: any) => {
    if (!r.flagged) running += r.debit + r.rent - r.credit;
    return [r.ts.slice(0,10), r.receipt_no || '', r.particulars, r.debit || '', r.credit || '', r.rent || '', Math.round(running*100)/100];
  });
  return toCsv([header, ...data]);
}

export async function exportStockSummaryCsv(): Promise<string> {
  const rows = await dbAll<any>(
    `SELECT t.name_en, t.code,
      COALESCE(SUM(CASE WHEN s.unit='roll' THEN s.quantity ELSE 0 END), 0) AS rolls,
      COALESCE(SUM(CASE WHEN s.unit='reel' THEN s.quantity ELSE 0 END), 0) AS reels_kg,
      COALESCE(SUM(CASE WHEN s.unit='tota' THEN s.quantity ELSE 0 END), 0) AS totay_kg
    FROM stock_items s JOIN item_types t ON t.id = s.item_type_id
    GROUP BY s.item_type_id ORDER BY t.sort_order, t.name_en`
  );
  const header = ['product','code','rolls','reels_kg','totay_kg'];
  const data = rows.map(r => [r.name_en, r.code, r.rolls, r.reels_kg, r.totay_kg]);
  return toCsv([header, ...data]);
}
