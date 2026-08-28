'use server';

import { revalidatePath } from 'next/cache';
import { postBill } from '@/lib/repo';
import type { LineInput } from '@/lib/pricing';

/**
 * Server Action. The browser never talks to the database directly, and the
 * pricing / stock / ledger rules live in lib/, so a quotation agent calling
 * postBill() later gets identical behaviour to the counter clerk clicking
 * the button. One implementation, two callers.
 */
export async function submitBill(input: {
  customerId: number; lines: LineInput[];
  rent?: number; credit?: number; creditMethod?: string;
}) {
  const res = postBill(input);
  if (res.ok) {
    revalidatePath('/'); revalidatePath('/bills');
    revalidatePath('/stock'); revalidatePath('/customers');
  }
  return res;
}
