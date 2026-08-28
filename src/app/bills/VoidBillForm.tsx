'use client';

import { voidBillAction } from './actions';

export function VoidBillForm({ billId }: { billId: number }) {
  return (
    <form action={voidBillAction} className="row" style={{ gap: 8 }}>
      <input type="hidden" name="billId" value={billId} />
      <input className="input" name="reason" required placeholder="Reason for voiding"
             style={{ flex: 1 }} />
      <button className="btn" style={{
        background: 'var(--accent-red-solid)', color: '#fff',
        border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
      }}
      onClick={(e) => {
        if (!confirm('Are you sure? The stock and ledger will be reversed.')) {
          e.preventDefault();
        }
      }}>
        Void Bill
      </button>
    </form>
  );
}
