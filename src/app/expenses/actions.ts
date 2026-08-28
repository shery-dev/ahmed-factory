'use server';
import { revalidatePath } from 'next/cache';
import { addExpense, resolveIssue } from '@/lib/repo';

export async function recordExpense(form: FormData) {
  const raw = String(form.get('detail') ?? '').trim();
  const amount = Number(form.get('amount'));
  const category = String(form.get('category') ?? 'general').trim();
  if (!raw || !amount) return;

  // Support comma-separated quick entry: "diesel 3000, chai 400, loading 1200"
  // If a single amount is provided with a single detail, treat as one row.
  addExpense({ category, detail: raw, amount });
  revalidatePath('/expenses');
  revalidatePath('/');
}

export async function resolveIssueAction(form: FormData) {
  const id = Number(form.get('id'));
  const note = String(form.get('note') ?? '').trim();
  if (!id) return;
  resolveIssue(id, note);
  revalidatePath('/review');
}
