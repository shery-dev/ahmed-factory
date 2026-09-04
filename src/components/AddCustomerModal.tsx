'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { addCustomer } from '@/app/customers/actions';

export function AddCustomerButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)} style={{ padding: '8px 18px' }}>
        + Add Customer
      </button>
      {open && (
        <AddCustomerModal onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function AddCustomerModal({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<'cash' | 'ledger'>('cash');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    await addCustomer(fd);
    onClose();
  }

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)',
        width: '100%', maxWidth: 460, padding: '24px 28px',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Add Customer</div>

        <form onSubmit={handleSubmit} className="stack sm">
          <div className="field">
            <label>ACCOUNT TYPE</label>
            <select className="select" name="kind" value={kind} onChange={(e) => setKind(e.target.value as 'cash' | 'ledger')}>
              <option value="cash">Cash (c-prefix code)</option>
              <option value="ledger">Ledger (number code)</option>
            </select>
          </div>
          <div className="field">
            <label>NAME</label>
            <input className="input" name="name" required placeholder="Customer or business name" autoFocus />
          </div>
          <div className="field">
            <label>CONTACT (PHONE / WHATSAPP)</label>
            <input className="input" name="contact" placeholder="Phone number" />
          </div>
          {kind === 'ledger' && (
            <>
              <div className="field">
                <label>LEDGER PAGE REF</label>
                <input className="input" name="manual_ledger_page" placeholder="Paper register page number" />
              </div>
              <div className="field">
                <label>CREDIT LIMIT (PKR)</label>
                <input className="input num" name="credit_limit" type="number" step="any" defaultValue={0} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={busy}
                    style={{ flex: 1, padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>
              {busy ? 'Adding...' : 'Add Customer'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={onClose}
                    style={{ padding: '12px 16px', fontSize: 14 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
