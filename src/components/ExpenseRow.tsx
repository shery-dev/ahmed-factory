'use client';

import { useState } from 'react';
import { editExpense, deleteExpenseAction } from '@/app/expenses/actions';
import { fmtNum } from '@/lib/i18n';
import { Sensitive } from './Sensitive';

export function ExpenseRow({ expense, categories }: { expense: { id: number; ts: string; category: string; detail: string; amount: number; actor: string }; categories: string[] }) {
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  if (editing) {
    return (
      <tr>
        <td className="num t-muted">{expense.ts.slice(0, 10)}</td>
        <td colSpan={4}>
          <form action={async (fd: FormData) => { await editExpense(fd); setEditing(false); }} className="row wrap" style={{ gap: 6 }}>
            <input type="hidden" name="id" value={expense.id} />
            <select className="select" name="category" defaultValue={expense.category} style={{ flex: '0 1 110px', padding: '4px 6px', fontSize: 11 }}>
              {categories.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
            <input className="input" name="detail" defaultValue={expense.detail} style={{ flex: '1 1 150px', padding: '4px 6px', fontSize: 11 }} />
            <input className="input num" name="amount" type="number" step="any" defaultValue={expense.amount} style={{ width: 90, padding: '4px 6px', fontSize: 11 }} />
            <button className="btn btn-primary" type="submit" style={{ padding: '4px 10px', fontSize: 10 }}>Save</button>
            <button type="button" className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => setEditing(false)}>Cancel</button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="num t-muted">{expense.ts.slice(0, 10)}</td>
      <td><span className="badge badge-muted">{expense.category}</span></td>
      <td>{expense.detail}</td>
      <td className="right num t-strong"><Sensitive>{fmtNum(expense.amount)}</Sensitive></td>
      <td className="t-muted">
        <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
          <span>{expense.actor}</span>
          <button className="icon-btn" style={{ height: 20, minWidth: 20, padding: 0, fontSize: 10 }} onClick={() => setEditing(true)} title="Edit">{"✎"}</button>
          {confirmDel ? (
            <form action={async (fd: FormData) => { await deleteExpenseAction(fd); }} style={{ display: 'inline' }}>
              <input type="hidden" name="id" value={expense.id} />
              <button className="icon-btn" style={{ height: 20, minWidth: 20, padding: 0, fontSize: 10, color: 'var(--accent-red-solid)' }} title="Confirm delete">{"✓"}</button>
            </form>
          ) : (
            <button className="icon-btn" style={{ height: 20, minWidth: 20, padding: 0, fontSize: 10 }} onClick={() => setConfirmDel(true)} title="Delete">{"×"}</button>
          )}
        </div>
      </td>
    </tr>
  );
}
