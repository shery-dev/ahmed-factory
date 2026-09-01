'use client';

import { useState, useTransition } from 'react';
import { quickAddCustomer } from '@/app/billing/actions';

export function QuickAddCustomer({ onCreated }: { onCreated: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await quickAddCustomer(formData);
      if (res.ok && res.id) {
        onCreated(res.id);
        setOpen(false);
        setError('');
      } else {
        setError(res.error || 'Failed to create customer');
      }
    });
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}
              onClick={() => setOpen(true)}>
        + New Customer
      </button>
    );
  }

  return (
    <div className="card" style={{ marginTop: 8, borderColor: 'var(--accent-blue-solid)' }}>
      <div className="card-title" style={{ fontSize: 12 }}>QUICK ADD CUSTOMER</div>
      <form action={submit} className="stack sm">
        <div className="row wrap" style={{ gap: 8 }}>
          <select className="select" name="kind" defaultValue="cash" style={{ flex: '0 1 120px' }}>
            <option value="cash">Cash</option>
            <option value="ledger">Ledger</option>
          </select>
          <input className="input" name="name" required placeholder="Name" style={{ flex: '1 1 150px' }} />
          <input className="input" name="contact" placeholder="Phone (optional)" style={{ flex: '1 1 140px' }} />
          <button className="btn btn-primary" type="submit" disabled={pending} style={{ padding: '6px 14px', fontSize: 12 }}>
            {pending ? '...' : 'Add'}
          </button>
          <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => setOpen(false)}>Cancel</button>
        </div>
        {error && <div className="t-muted" style={{ color: 'var(--accent-red-solid)', fontSize: 11 }}>{error}</div>}
      </form>
    </div>
  );
}
