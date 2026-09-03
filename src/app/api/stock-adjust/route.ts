import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbGet } from '@/lib/db';
import { logActivity } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { stockId, delta, reason } = body;

  if (!stockId || !delta || !reason) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Get current stock
  const current = await dbGet<{ quantity: number; item_type_id: number; size: number; unit: string }>(
    `SELECT quantity, item_type_id, size, unit FROM stock_items WHERE id = ?`,
    [stockId]
  );

  if (!current) {
    return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
  }

  const newQty = current.quantity + delta;

  // Update stock
  await dbRun(
    `UPDATE stock_items SET quantity = ? WHERE id = ?`,
    [newQty, stockId]
  );

  // Log movement
  await dbRun(
    `INSERT INTO stock_movements (direction, item_type_id, size, unit, quantity, rate, ref_type, note, actor)
     VALUES ('adjust', ?, ?, ?, ?, 0, 'adjust', ?, 'store')`,
    [current.item_type_id, current.size, current.unit, Math.abs(delta), `${reason} (was ${current.quantity}, now ${newQty})`]
  );

  await logActivity('Stock adjusted', `${delta > 0 ? '+' : ''}${delta} on stock #${stockId} — ${reason}`, 'system', 'store');

  return NextResponse.json({ ok: true });
}
