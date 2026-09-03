'use client';

import { useState } from 'react';
import { receivePaymentAction } from '@/app/customers/actions';
import { fmtNum } from '@/lib/i18n';

export function ReceivePaymentForm({ customerId, balance, paymentMethods }: {
  customerId: number; balance: number; paymentMethods: string[];
}) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(paymentMethods[0] || 'Cash');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) return;
    setBusy(true);
    setResult(null);

    const fd = new FormData();
    fd.set('customerId', String(customerId));
    fd.set('amount', String(num));
    fd.set('method', method);
    fd.set('note', note);

    const res = await receivePaymentAction(fd);
    setResult(res);
    setBusy(false);
    if (res.ok) {
      setAmount('');
      setNote('');
    }
  }

  return (
    <div className="card" style={{ borderColor: 'var(--accent-green-solid)' }}>
      <div className="card-title" style={{ color: 'var(--accent-green-solid)' }}>RECEIVE PAYMENT</div>
      {balance > 0 && (
        <div className="t-muted" style={{ fontSize: 12, marginBottom: 10 }}>
          Outstanding: <strong className="t-strong">PKR {fmtNum(balance)}</strong>
        </div>
      )}
      <form onSubmit={handleSubmit} className="stack sm">
        <div className="field">
          <label>AMOUNT (PKR)</label>
          <input className="input num" type="number" min="1" step="any" value={amount}
                 onChange={(e) => setAmount(e.target.value)} placeholder={balance > 0 ? String(balance) : '0'} required autoFocus />
        </div>
        <div className="field">
          <label>METHOD</label>
          <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
            {paymentMethods.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="field">
          <label>NOTE (OPTIONAL)</label>
          <input className="input" type="text" value={note}
                 onChange={(e) => setNote(e.target.value)} placeholder="Cash received, bank transfer ref..." />
        </div>
        {result && (
          <div className={`info-card ${result.ok ? 'good' : 'warn'}`} style={{ fontSize: 12 }}>
            <div>{result.ok ? 'Payment recorded successfully' : result.error || 'Failed to record payment'}</div>
          </div>
        )}
        <button className="btn btn-block" type="submit" disabled={busy || !amount}
                style={{ background: 'var(--accent-green-solid)', color: '#fff', border: 'none' }}>
          {busy ? 'Recording...' : 'Record Payment'}
        </button>
      </form>
    </div>
  );
}
