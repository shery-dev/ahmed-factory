'use server';
import { revalidatePath } from 'next/cache';
import { voidBill } from '@/lib/repo';

export async function voidBillAction(form: FormData) {
  const billId = Number(form.get('billId'));
  const reason = String(form.get('reason') ?? '').trim();
  if (!billId || !reason) return;
  voidBill(billId, reason);
  revalidatePath(`/bills/${billId}`);
  revalidatePath('/bills');
  revalidatePath('/stock');
  revalidatePath('/customers');
  revalidatePath('/');
}
