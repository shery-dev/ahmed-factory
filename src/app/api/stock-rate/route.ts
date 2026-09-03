import { NextRequest, NextResponse } from 'next/server';
import { dbRun, logActivity } from '@/lib/db';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { stockId, newRate } = body;

  if (!stockId || newRate == null || newRate < 0) {
    return NextResponse.json({ error: 'Invalid stock ID or rate' }, { status: 400 });
  }

  await dbRun(`UPDATE stock_items SET rate = ? WHERE id = ?`, [newRate, stockId]);
  await logActivity('Stock rate updated', `Stock #${stockId} → PKR ${newRate}`, 'system', 'store');

  return NextResponse.json({ ok: true });
}
