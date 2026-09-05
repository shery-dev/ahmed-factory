'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, type FormEvent } from 'react';

/**
 * Wraps filter inputs and auto-submits the form whenever any value changes.
 * No "Filter" button needed — selecting a dropdown or changing a date
 * immediately navigates to the new URL.
 *
 * Works with <select>, <input type="date">, and <input type="text"> (on Enter).
 */
export function AutoFilter({
  children,
  baseParams = {},
}: {
  children: ReactNode;
  /** Extra params to always include in the URL (e.g. { unit: 'roll' }) */
  baseParams?: Record<string, string>;
}) {
  const router = useRouter();

  const submit = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(baseParams)) {
      if (v) params.set(k, v);
    }
    fd.forEach((v, k) => {
      if (v && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    router.push(`${form.action.split('?')[0]}${qs ? '?' + qs : ''}`);
  };

  return (
    <form
      method="get"
      onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget); }}
      onChange={(e) => {
        // Only auto-submit for selects and date inputs, not text fields
        const target = e.target as HTMLElement;
        if (target instanceof HTMLSelectElement || (target instanceof HTMLInputElement && target.type === 'date')) {
          submit(e.currentTarget as HTMLFormElement);
        }
      }}
    >
      {children}
    </form>
  );
}
