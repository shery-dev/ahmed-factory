'use server';

import { revalidatePath } from 'next/cache';
import {
  postBill, createCustomer, customerRecentRate,
  findCustomerByContact, getCustomer, customerBalance, customerLedger,
} from '@/lib/repo';
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

export interface QuickAddResult {
  ok: boolean; id?: number; error?: string;
  code?: string; name?: string; kind?: 'cash' | 'ledger';
  contact?: string | null; balance?: number; existed?: boolean;
}

/**
 * Quick-add from the billing screen itself — a walk-in shouldn't need a trip
 * to the Customers page first. Checks for an existing customer with the same
 * phone number (same kind) before creating a new one, so retyping the same
 * number doesn't fork a second record for the same person — the return
 * shape stays backward compatible with the plain { ok, id, error } the
 * older QuickAddCustomer button already expects, with the extra fields new
 * callers (the customer search/history panel) use to show which happened.
 */
export async function quickAddCustomer(formData: FormData): Promise<QuickAddResult> {
  const kind = ((formData.get('kind') as string) || 'cash') as 'cash' | 'ledger';
  const name = (formData.get('name') as string || '').trim();
  const contact = (formData.get('contact') as string || '').trim();
  const manual_ledger_page = (formData.get('manual_ledger_page') as string || '').trim();
  const credit_limit = Number(formData.get('credit_limit')) || 0;
  if (!name) return { ok: false, error: 'Name is required' };

  try {
    let id: number; let existed = false;
    const match = contact ? await findCustomerByContact(kind, contact) : undefined;
    if (match) {
      id = match.id; existed = true;
    } else {
      id = Number(await createCustomer({
        kind, name, contact: contact || undefined,
        manual_ledger_page: manual_ledger_page || undefined, credit_limit,
      }));
    }
    revalidatePath('/customers'); revalidatePath('/billing');
    const c = await getCustomer(id);
    return {
      ok: true, id, existed,
      code: c?.code, name: c?.name, kind: c?.kind,
      contact: c?.contact, balance: await customerBalance(id),
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function getRecentRate(customerId: number, itemTypeId: number): Promise<{ rate: number | null }> {
  const rate = await customerRecentRate(customerId, itemTypeId);
  return { rate };
}

export interface HistoryEntry {
  id: number; ts: string; receipt_no: number | null; particulars: string;
  debit: number; credit: number; rent: number; balance: number; flagged: number;
}

/** Recent-first, capped — the side panel is a glance, not the full statement. */
export async function getCustomerHistory(customerId: number, limit = 8): Promise<HistoryEntry[]> {
  const rows = await customerLedger(customerId);
  return rows.slice(-limit).reverse();
}
