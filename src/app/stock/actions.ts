'use server';
import { revalidatePath } from 'next/cache';
import { stockIn, stockAdjust } from '@/lib/repo';

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

export async function postPhysicalCount(form: FormData) {
  const itemTypeId = Number(form.get('itemTypeId'));
  const size = Number(form.get('size'));
  const unit = String(form.get('unit')) as 'roll' | 'reel' | 'tota';
  const newQuantity = Number(form.get('newQuantity'));
  const reason = String(form.get('reason') ?? '').trim();

  if (!itemTypeId || !size || !reason) return;

  await stockAdjust({ itemTypeId, size, unit, newQuantity, reason });
  revalidatePath('/stock');
  revalidatePath('/');
}
