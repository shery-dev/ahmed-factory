'use server';
import { revalidatePath } from 'next/cache';
import { updateSettings } from '@/lib/settings';

export async function saveSettings(formData: FormData) {
  const pairs: Record<string, string> = {};
  const keys = ['factory_name','factory_name_ur','factory_address','factory_phone'];
  for (const k of keys) {
    const v = formData.get(k);
    if (v !== null) pairs[k] = String(v).trim();
  }
  // Convert textarea (one per line) to JSON array
  const cats = String(formData.get('expense_categories') ?? '').trim();
  if (cats) pairs.expense_categories = JSON.stringify(cats.split('\n').map(s => s.trim()).filter(Boolean));
  const methods = String(formData.get('payment_methods') ?? '').trim();
  if (methods) pairs.payment_methods = JSON.stringify(methods.split('\n').map(s => s.trim()).filter(Boolean));
  await updateSettings(pairs);
  revalidatePath('/settings');
}


import { createUser, updateUser, changeUserPassword, deactivateUser, activateUser, type Role } from '@/lib/auth';

export async function addUserAction(formData: FormData): Promise<void> {
  const username = String(formData.get('username') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const name = String(formData.get('name') || '').trim();
  const role = String(formData.get('role') || 'counter') as Role;
  if (!username || !password || !name) return;
  await createUser({ username, password, name, role });
  revalidatePath('/settings');
}

export async function editUserAction(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  const name = String(formData.get('name') || '').trim();
  const role = String(formData.get('role') || 'counter') as Role;
  if (!id) return;
  await updateUser(id, { name, role });
  revalidatePath('/settings');
}

export async function deactivateUserAction(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!id) return;
  await deactivateUser(id);
  revalidatePath('/settings');
}

export async function activateUserAction(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!id) return;
  await activateUser(id);
  revalidatePath('/settings');
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  const password = String(formData.get('password') || '');
  if (!id || !password) return;
  await changeUserPassword(id, password);
  revalidatePath('/settings');
}
