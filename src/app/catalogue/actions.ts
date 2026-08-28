'use server';
import { revalidatePath } from 'next/cache';
import { createItemType, updateRate } from '@/lib/repo';

export async function addProduct(form: FormData) {
  const name_en = String(form.get('name_en') ?? '').trim();
  if (!name_en) return;
  createItemType({
    name_en,
    name_ur: String(form.get('name_ur') ?? '').trim() || name_en,
    family: String(form.get('family') ?? '').trim() || name_en,
    is_bareek: form.get('is_bareek') ? 1 : 0,
    default_rate: Number(form.get('default_rate')) || 0,
    description_en: String(form.get('description_en') ?? '').trim() || undefined,
  });
  revalidatePath('/catalogue'); revalidatePath('/billing'); revalidatePath('/');
}

export async function changeRate(form: FormData) {
  updateRate(Number(form.get('id')), Number(form.get('rate')) || 0);
  revalidatePath('/catalogue'); revalidatePath('/billing');
}
