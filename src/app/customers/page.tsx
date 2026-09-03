import Link from 'next/link';
import { listCustomers, customerBalance } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { AddCustomerForm } from '@/components/AddCustomerForm';

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

      <div className="split">
        <div>
          {customers.length === 0 ? (
            <div className="empty">No customers match your search</div>
          ) : (
            <div className="customer-grid">
              {customers.map((c) => (
                <div key={c.id} className={`customer-card ${!c.active ? 'customer-card--inactive' : ''}`}>
                  <div className="customer-card__top">
                    <div>
                      <div className="customer-card__name">
                        {c.name}
                        {c.needs_review === 1 && <span className="customer-card__review" style={{ marginInlineStart: 6 }}>CHECK</span>}
                      </div>
                      <div className="customer-card__code">{c.code}</div>
                    </div>
                    <div className={`customer-card__balance ${c.balance > 0 ? 'customer-card__balance--positive' : ''}`}>
                      {fmtNum(c.balance)}
                    </div>
                  </div>
                  <div className="customer-card__details">
                    <span className={`badge ${c.kind === 'cash' ? 'badge-kraft' : 'badge-purple'}`}>{c.kind}</span>
                    {c.contact && <span className="customer-card__chip">{'\u260E'} {c.contact}</span>}
                    {c.manual_ledger_page && <span className="customer-card__chip">{'\u2637'} p.{c.manual_ledger_page}</span>}
                    {!c.active && <span className="badge badge-muted">INACTIVE</span>}
                  </div>
                  <div className="customer-card__actions">
                    <Link className="customer-card__link" href={`/customers/${c.id}`}>
                      {'View Ledger \u2192'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">ADD A CUSTOMER</div>
          <AddCustomerForm />
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
