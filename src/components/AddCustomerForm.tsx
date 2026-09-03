'use client';

import { useState } from 'react';
import { addCustomer } from '@/app/customers/actions';

export function AddCustomerForm() {
  const [kind, setKind] = useState<'cash' | 'ledger'>('cash');

  return (
    <form action={addCustomer} className="stack sm">
      <div className="field">
        <label>ACCOUNT TYPE</label>
        <select className="select" name="kind" value={kind} onChange={(e) => setKind(e.target.value as 'cash' | 'ledger')}>
          <option value="cash">Cash (c-prefix code)</option>
          <option value="ledger">Ledger (number code)</option>
        </select>
      </div>
      <div className="field">
        <label>NAME</label>
        <input className="input" name="name" required placeholder="Customer or business name" />
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
      <button className="btn btn-primary btn-block">Add Customer</button>
    </form>
  );
}
