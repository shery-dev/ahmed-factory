import Link from 'next/link';
import { listCustomers, customerBalance } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default function CustomersPage() {
  const customers = listCustomers().map((c) => ({ ...c, balance: customerBalance(c.id) }));
  return (
    <>
      <div className="panel-header">
        <h2>Customers</h2>
        <p className="panel-desc">
          Cash customers carry a <span className="mono">c</span>-prefixed code, ledger
          clients a plain number — the convention the factory already uses. Balances
          are calculated from the ledger every time this page loads, never stored.
        </p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>CODE</th><th>NAME</th><th>TYPE</th><th>CONTACT</th>
              <th>LEDGER PAGE</th><th className="right">BALANCE</th><th></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="mono t-strong">{c.code}</td>
                <td>
                  <span className="t-strong">{c.name}</span>
                  {c.needs_review === 1 && (
                    <span className="badge badge-yellow" style={{ marginInlineStart: 8 }}>CHECK</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${c.kind === 'cash' ? 'badge-kraft' : 'badge-purple'}`}>{c.kind}</span>
                </td>
                <td className="num t-muted">{c.contact || '—'}</td>
                <td className="num t-muted">{c.manual_ledger_page || '—'}</td>
                <td className={`right num t-strong ${c.balance > 0 ? 'stat-accent' : ''}`}>
                  {fmtNum(c.balance)}
                </td>
                <td className="right">
                  <Link className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}
                        href={`/customers/${c.id}`}>Ledger</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
