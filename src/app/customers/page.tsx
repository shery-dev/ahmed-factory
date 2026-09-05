import Link from 'next/link';
import { listCustomers, customerBalance } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { AddCustomerButton } from '@/components/AddCustomerModal';

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

  const totalBalance = customers.reduce((s, c) => s + c.balance, 0);
  const cashCount = customers.filter(c => c.kind === 'cash').length;
  const ledgerCount = customers.filter(c => c.kind === 'ledger').length;

  return (
    <>
      <div className="row between" style={{ marginBottom: 18 }}>
        <div className="panel-header" style={{ margin: 0 }}>
          <h2>Customers</h2>
          <p className="panel-desc">
            Cash customers carry a <span className="mono">c</span>-prefixed code, ledger clients a plain number.
          </p>
        </div>
        <AddCustomerButton />
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

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card tight">
          <div className="card-title">TOTAL</div>
          <div className="stat-big num">{customers.length}</div>
        </div>
        <div className="card tight">
          <div className="card-title">CASH</div>
          <div className="stat-big num">{cashCount}</div>
        </div>
        <div className="card tight">
          <div className="card-title">LEDGER</div>
          <div className="stat-big num">{ledgerCount}</div>
        </div>
        <div className="card tight">
          <div className="card-title">TOTAL RECEIVABLE</div>
          <div className="stat-big stat-accent num">PKR {fmtNum(totalBalance)}</div>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="card"><div className="empty">No customers match your search</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CODE</th>
                <th>NAME</th>
                <th>TYPE</th>
                <th>CONTACT</th>
                <th className="right">BALANCE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} style={!c.active ? { opacity: 0.5 } : undefined}>
                  <td className="mono t-muted">{c.code}</td>
                  <td>
                    <span className="t-strong">{c.name}</span>
                    {c.needs_review === 1 && <span className="badge badge-yellow" style={{ marginInlineStart: 6, fontSize: 9, padding: '1px 5px' }}>CHECK</span>}
                    {!c.active && <span className="badge badge-muted" style={{ marginInlineStart: 6, fontSize: 9, padding: '1px 5px' }}>INACTIVE</span>}
                  </td>
                  <td>
                    <span className={`badge ${c.kind === 'cash' ? 'badge-kraft' : 'badge-purple'}`}>{c.kind}</span>
                  </td>
                  <td className="t-muted">{c.contact || '\u2014'}</td>
                  <td className="right num t-strong">
                    {c.balance > 0 ? <span className="stat-accent">PKR {fmtNum(c.balance)}</span> : <span className="t-muted">PKR 0</span>}
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
      )}
    </>
  );
}
