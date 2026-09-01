'use server';
import { revalidatePath } from 'next/cache';
import { createCustomer, updateCustomer, deactivateCustomer, reactivateCustomer } from '@/lib/repo';

export async function addCustomer(form: FormData) {
  const kind = String(form.get('kind') ?? 'cash') as 'cash' | 'ledger';
  const name = String(form.get('name') ?? '').trim();
  if (!name) return;
  await createCustomer({
    kind,
    name,
    contact: String(form.get('contact') ?? '').trim() || undefined,
    manual_ledger_page: String(form.get('manual_ledger_page') ?? '').trim() || undefined,
    credit_limit: Number(form.get('credit_limit')) || 0,
  });
  revalidatePath('/customers'); revalidatePath('/billing'); revalidatePath('/');
}

export async function editCustomer(form: FormData) {
  const id = Number(form.get('id'));
  const name = String(form.get('name') ?? '').trim();
  if (!id || !name) return;
  await updateCustomer(id, {
    name,
    contact: String(form.get('contact') ?? '').trim() || undefined,
    credit_limit: Number(form.get('credit_limit')) || 0,
  });
  revalidatePath('/customers/' + id); revalidatePath('/customers'); revalidatePath('/billing');
}

export async function deactivateCustomerAction(form: FormData) {
  const id = Number(form.get('id'));
  if (!id) return;
  await deactivateCustomer(id);
  revalidatePath('/customers'); revalidatePath('/billing');
}

export async function reactivateCustomerAction(form: FormData) {
  const id = Number(form.get('id'));
  if (!id) return;
  await reactivateCustomer(id);
  revalidatePath('/customers'); revalidatePath('/billing');
}
