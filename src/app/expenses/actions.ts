'use server';
import { revalidatePath } from 'next/cache';
import { addExpense, updateExpense, deleteExpense, resolveIssue } from '@/lib/repo';

export async function recordExpense(form: FormData) {
  const raw = String(form.get('detail') ?? '').trim();
  const amount = Number(form.get('amount'));
  const category = String(form.get('category') ?? 'general').trim();
  if (!raw || !amount) return;
  await addExpense({ category, detail: raw, amount });
  revalidatePath('/expenses'); revalidatePath('/');
}

export async function editExpense(form: FormData) {
  const id = Number(form.get('id'));
  const raw = String(form.get('detail') ?? '').trim();
  const amount = Number(form.get('amount'));
  const category = String(form.get('category') ?? 'general').trim();
  if (!id || !raw || !amount) return;
  await updateExpense(id, { category, detail: raw, amount });
  revalidatePath('/expenses'); revalidatePath('/');
}

export async function deleteExpenseAction(form: FormData) {
  const id = Number(form.get('id'));
  if (!id) return;
  await deleteExpense(id);
  revalidatePath('/expenses'); revalidatePath('/');
}

export async function resolveIssueAction(form: FormData) {
  const id = Number(form.get('id'));
  const note = String(form.get('note') ?? '').trim();
  if (!id) return;
  await resolveIssue(id, note);
  revalidatePath('/review');
}
