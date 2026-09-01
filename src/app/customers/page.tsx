import Link from 'next/link';
import { listCustomers, customerBalance } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { addCustomer } from './actions';

export const dynamic = 'force-dynamic';

export default async function CustomersPage({
  searchParams,
}: { searchParams: Promise<{ search?: string; kind?: string; show_inactive?: string }> }) {
  const { search = '', kind = '', show_inactive = '' } = await searchParams;
  const customersList = await listCustomers({
    kind: kind as 'cash' | 'ledger' | undefined || undefined,
    search: search || undefined,
    includeInactive: show_inactive === '1',
  });
  const customers = await Promise.all(customersList.map(async (c) => ({ ...c, balance: await customerBalance(c.id) })));

  return (
    <>
      <div className="panel-header">
        <h2>Customers</h2>
        <p className="panel-desc">
          Cash customers carry a <span className="mono">c</span>-prefixed code, ledger
          clients a plain number. Balances are computed from the ledger every time.
        </p>
      </div>

      <form className="row wrap" style={{ gap: 8, marginBottom: 16 }} method="get">
        <input className="input" name="search" defaultValue={search} placeholder="Search name, code, contact..." style={{ flex: '1 1 220px' }} />
        <select className="select" name="kind" defaultValue={kind} style={{ flex: '0 1 150px' }}>
          <option value="">All types</option>
          <option value="cash">Cash</option>
          <option value="ledger">Ledger</option>
        </select>
        <label className="row" style={{ gap: 6, fontSize: 12, color: 'var(--text-muted)', alignItems: 'center' }}>
          <input type="checkbox" name="show_inactive" value="1" defaultChecked={show_inactive === '1'} />
          Show inactive
        </label>
        <button className="btn btn-ghost" type="submit" style={{ padding: '6px 14px' }}>Filter</button>
        {(search || kind || show_inactive) && (
          <a className="btn btn-ghost" href="/customers" style={{ padding: '6px 14px' }}>Clear</a>
        )}
      </form>

      <div className="split">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CODE</th><th>NAME</th><th>TYPE</th><th>CONTACT</th>
                <th>LEDGER PAGE</th><th className="right">BALANCE</th><th></th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={7} className="t-muted" style={{ textAlign: 'center', padding: 24 }}>No customers match your search</td></tr>
              ) : customers.map((c) => (
                <tr key={c.id} style={{ opacity: c.active ? 1 : 0.5 }}>
                  <td className="mono t-strong">{c.code}</td>
                  <td>
                    <span className="t-strong">{c.name}</span>
                    {c.needs_review === 1 && (
                      <span className="badge badge-yellow" style={{ marginInlineStart: 8 }}>CHECK</span>
                    )}
                    {!c.active && (
                      <span className="badge badge-muted" style={{ marginInlineStart: 8 }}>INACTIVE</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${c.kind === 'cash' ? 'badge-kraft' : 'badge-purple'}`}>{c.kind}</span>
                  </td>
                  <td className="num t-muted">{c.contact || '\u2014'}</td>
                  <td className="num t-muted">{c.manual_ledger_page || '\u2014'}</td>
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

        <div className="card">
          <div className="card-title">ADD A CUSTOMER</div>
          <form action={addCustomer} className="stack sm">
            <div className="field">
              <label>ACCOUNT TYPE</label>
              <select className="select" name="kind" defaultValue="cash">
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
              <input className="input" name="contact" placeholder="Optional" />
            </div>
            <div className="field">
              <label>LEDGER PAGE REF</label>
              <input className="input" name="manual_ledger_page" placeholder="Paper register page number" />
            </div>
            <div className="field">
              <label>CREDIT LIMIT (PKR)</label>
              <input className="input num" name="credit_limit" type="number" step="any" defaultValue={0} />
            </div>
            <button className="btn btn-primary btn-block">Add Customer</button>
          </form>
          <div className="info-card good" style={{ marginTop: 14 }}>
            <div>
              Walk-in cash customers can also be created directly from the billing screen.
              Codes are generated automatically.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
