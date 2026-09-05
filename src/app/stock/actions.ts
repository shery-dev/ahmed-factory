'use server';
import { revalidatePath } from 'next/cache';
import { stockIn, stockOut, stockAdjust, addWasteStock, adjustWasteStock, stockOnHand, setReorderLevel } from '@/lib/repo';

export async function receiveDelivery(form: FormData) {
  const itemTypeId = Number(form.get('itemTypeId'));
  const size = Number(form.get('size'));
  const unit = String(form.get('unit')) as 'roll' | 'reel' | 'tota';
  const quantity = Number(form.get('quantity'));
  const rate = Number(form.get('rate')) || 0;
  const note = String(form.get('note') ?? '').trim();

  if (!itemTypeId || !size || !quantity) return;

  await stockIn({ itemTypeId, size, unit, quantity, rate, note: note || undefined });
  revalidatePath('/stock');
  revalidatePath('/');
}

export async function receiveWasteDelivery(form: FormData) {
  const category = String(form.get('category')) as 'jutta' | 'raddi' | 'nali';
  const quantityKg = Number(form.get('quantity'));
  const rate = Number(form.get('rate')) || 0;
  const note = String(form.get('note') ?? '').trim();

  if (!category || !quantityKg) return;

  await addWasteStock(category, quantityKg, rate, note || undefined);
  revalidatePath('/stock');
  revalidatePath('/');
}

export async function adjustWasteStockAction(form: FormData) {
  const category = String(form.get('category'));
  const deltaKg = Number(form.get('delta'));
  const reason = String(form.get('reason') ?? '').trim();

  if (!category || !deltaKg || !reason) return;

  await adjustWasteStock(category, deltaKg, reason);
  revalidatePath('/stock');
  revalidatePath('/');
}

// ─── The family/thickness/size product page (ported from Ahmed Factory
// System) — Receive/Issue/Set Count with a concurrency guard. Every
// mutation compares on-hand at commit time against what the client saw
// when the sheet opened; a mismatch stops the write and hands back the
// real number instead of silently layering one person's action over
// another's. ───────────────────────────────────────────────────────────────

type Unit = 'roll' | 'reel' | 'tota';
export type ActionResult =
  | { ok: true }
  | { ok: false; reason: 'stale'; currentQty: number }
  | { ok: false; reason: 'invalid' };

const num = (f: FormData, k: string) => Number(f.get(k));
const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

function refreshProduct(itemTypeId: number) {
  revalidatePath(`/stock/${itemTypeId}`);
  revalidatePath('/stock');
  revalidatePath('/');
  revalidatePath('/billing');
}

async function checkNotStale(itemTypeId: number, size: number, unit: Unit, expectedQty: number) {
  const current = await stockOnHand(itemTypeId, size, unit);
  return current === expectedQty ? null : current;
}

export async function receiveStock(form: FormData): Promise<ActionResult> {
  const itemTypeId = num(form, 'itemTypeId');
  const quantity = num(form, 'quantity');
  const size = num(form, 'size');
  const unit = str(form, 'unit') as Unit;
  if (!itemTypeId || !(quantity > 0)) return { ok: false, reason: 'invalid' };

  // A brand-new size has no "expected quantity" to go stale.
  if (form.has('expectedQty')) {
    const stale = await checkNotStale(itemTypeId, size, unit, num(form, 'expectedQty'));
    if (stale !== null) return { ok: false, reason: 'stale', currentQty: stale };
  }

  await stockIn({
    itemTypeId, size, unit, quantity,
    rate: num(form, 'rate') || 0,
    note: str(form, 'reason') || 'Stock received',
  });
  refreshProduct(itemTypeId);
  return { ok: true };
}

export async function issueStock(form: FormData): Promise<ActionResult> {
  const itemTypeId = num(form, 'itemTypeId');
  const quantity = num(form, 'quantity');
  const reason = str(form, 'reason');
  const size = num(form, 'size');
  const unit = str(form, 'unit') as Unit;
  if (!itemTypeId || !(quantity > 0) || !reason) return { ok: false, reason: 'invalid' };

  const stale = await checkNotStale(itemTypeId, size, unit, num(form, 'expectedQty'));
  if (stale !== null) return { ok: false, reason: 'stale', currentQty: stale };

  await stockOut({ itemTypeId, size, unit, quantity, reason });
  refreshProduct(itemTypeId);
  return { ok: true };
}

export async function countStock(form: FormData): Promise<ActionResult> {
  const itemTypeId = num(form, 'itemTypeId');
  const counted = num(form, 'counted');
  const reason = str(form, 'reason');
  const size = num(form, 'size');
  const unit = str(form, 'unit') as Unit;
  // A count of zero is meaningful — the shelf is empty — so only reject NaN.
  if (!itemTypeId || !Number.isFinite(counted) || counted < 0 || !reason) {
    return { ok: false, reason: 'invalid' };
  }

  const stale = await checkNotStale(itemTypeId, size, unit, num(form, 'expectedQty'));
  if (stale !== null) return { ok: false, reason: 'stale', currentQty: stale };

  // stockAdjust already exists in repo.ts for exactly this — "the floor is
  // right, set the record to match" — including clearing any quarantine
  // flag, since a human has now counted the paper themselves.
  await stockAdjust({ itemTypeId, size, unit, newQuantity: counted, reason });
  refreshProduct(itemTypeId);
  return { ok: true };
}

export async function changeReorderLevel(form: FormData) {
  const itemTypeId = num(form, 'itemTypeId');
  const level = num(form, 'level');
  if (!itemTypeId || !Number.isFinite(level) || level < 0) return;
  await setReorderLevel(itemTypeId, level);
  refreshProduct(itemTypeId);
  revalidatePath('/catalogue');
}
