'use server';

import { revalidatePath } from 'next/cache';
import { postBill, createCustomer, customerRecentRate } from '@/lib/repo';
import type { LineInput } from '@/lib/pricing';

export async function submitBill(input: {
  customerId: number; lines: LineInput[];
  rent?: number; credit?: number; creditMethod?: string; note?: string;
}) {
  const res = await postBill(input);
  if (res.ok) {
    revalidatePath('/'); revalidatePath('/bills');
    revalidatePath('/stock'); revalidatePath('/customers');
  }
  return res;
}

export async function quickAddCustomer(formData: FormData): Promise<{ ok: boolean; id?: number; error?: string }> {
  const kind = (formData.get('kind') as string) || 'cash';
  const name = (formData.get('name') as string || '').trim();
  const contact = (formData.get('contact') as string || '').trim();
  if (!name) return { ok: false, error: 'Name is required' };
  try {
    const id = await createCustomer({ kind: kind as 'cash' | 'ledger', name, contact: contact || undefined });
    revalidatePath('/customers');
    return { ok: true, id: Number(id) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function getRecentRate(customerId: number, itemTypeId: number): Promise<{ rate: number | null }> {
  const rate = await customerRecentRate(customerId, itemTypeId);
  return { rate };
}
