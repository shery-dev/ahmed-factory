'use server';
import { revalidatePath } from 'next/cache';
import { stockIn, stockAdjust, addWasteStock, adjustWasteStock } from '@/lib/repo';

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
