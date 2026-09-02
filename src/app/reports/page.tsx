import { stockValuationReport, topCustomersByVolume, topCustomersByOutstanding, periodSummary } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({
  searchParams,
}: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { from = '', to = '' } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const periodFrom = from || today;
  const periodTo = to || today;

  const [valuation, topVolume, topOutstanding, period] = await Promise.all([
    stockValuationReport(),
    topCustomersByVolume(10),
    topCustomersByOutstanding(10),
    periodSummary(periodFrom, periodTo),
  ]);

  const totalValue = valuation.reduce((s: number, r: any) => s + r.value, 0);
  const lowStockCount = valuation.filter((r: any) => r.is_low).length;

  const pct = (curr: number, prev: number) => {
    if (!prev) return curr > 0 ? '+100%' : '0%';
    const p = ((curr - prev) / prev * 100).toFixed(1);
    return (Number(p) >= 0 ? '+' : '') + p + '%';
  };

  return (
    <>
      <div className="panel-header">
        <h2>Reports</h2>
        <p className="panel-desc">
          Stock valuation, top customers, and period-over-period comparison.
        </p>
      </div>

      {/* Period selector */}
      <form className="row wrap" style={{ gap: 8, marginBottom: 20 }} method="get">
        <input className="input" name="from" type="date" defaultValue={periodFrom} style={{ flex: '0 1 160px' }} />
        <input className="input" name="to" type="date" defaultValue={periodTo} style={{ flex: '0 1 160px' }} />
        <button className="btn btn-primary" type="submit" style={{ padding: '6px 16px' }}>Compare Period</button>
      </form>

      {/* Period comparison */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">PERIOD COMPARISON: {period.from} TO {period.to} ({period.days} DAYS)</div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <div className="t-muted" style={{ fontSize: 11 }}>BILLS</div>
            <div className="stat-big num">{period.bills.n}</div>
            <div className="t-muted" style={{ fontSize: 11 }}>prev: {period.prev.bills.n} ({pct(period.bills.n, period.prev.bills.n)})</div>
          </div>
          <div>
            <div className="t-muted" style={{ fontSize: 11 }}>REVENUE</div>
            <div className="stat-big stat-accent num">PKR {fmtNum(period.bills.revenue)}</div>
            <div className="t-muted" style={{ fontSize: 11 }}>prev: PKR {fmtNum(period.prev.bills.revenue)} ({pct(period.bills.revenue, period.prev.bills.revenue)})</div>
          </div>
          <div>
            <div className="t-muted" style={{ fontSize: 11 }}>COLLECTED</div>
            <div className="stat-big stat-green num">PKR {fmtNum(period.bills.collected)}</div>
            <div className="t-muted" style={{ fontSize: 11 }}>prev: PKR {fmtNum(period.prev.bills.collected)}</div>
          </div>
          <div>
            <div className="t-muted" style={{ fontSize: 11 }}>EXPENSES</div>
            <div className="stat-big num">PKR {fmtNum(period.expenses.total)}</div>
            <div className="t-muted" style={{ fontSize: 11 }}>prev: PKR {fmtNum(period.prev.expenses.total)} ({pct(period.expenses.total, period.prev.expenses.total)})</div>
          </div>
        </div>
      </div>

      <div className="split">
        <div>
          {/* Stock Valuation */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">STOCK VALUATION</div>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div>
                <span className="stat-big stat-accent num">PKR {fmtNum(totalValue)}</span>
                <span className="t-muted" style={{ marginLeft: 10, fontSize: 12 }}>{valuation.length} lines</span>
              </div>
              {lowStockCount > 0 && <span className="badge badge-yellow">{lowStockCount} LOW</span>}
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>PRODUCT</th><th className="right">SIZE</th><th className="right">QTY</th>
                    <th className="right">RATE</th><th className="right">VALUE</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {valuation.slice(0, 30).map((r: any, i: number) => (
                    <tr key={i}>
                      <td className="t-strong">{r.name_en}</td>
                      <td className="right num">{r.size}&quot;</td>
                      <td className="right num">{fmtNum(r.quantity)} {r.unit}</td>
                      <td className="right num t-muted">{fmtNum(r.rate)}</td>
                      <td className="right num t-strong">PKR {fmtNum(r.value)}</td>
                      <td>{r.is_low ? <span className="badge badge-yellow">LOW</span> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {valuation.length > 30 && (
              <div className="t-muted" style={{ marginTop: 8, fontSize: 12, textAlign: 'center' }}>
                Showing 30 of {valuation.length} lines
              </div>
            )}
          </div>
        </div>

        <div className="stack">
          {/* Top Customers by Volume */}
          <div className="card">
            <div className="card-title">TOP CUSTOMERS BY VOLUME</div>
            {topVolume.length === 0 ? (
              <div className="empty">No bills yet</div>
            ) : (
              <div className="stack sm">
                {topVolume.map((c: any, i: number) => (
                  <Link key={c.id} href={`/customers/${c.id}`} className="row between"
                        style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <span>
                      <span className="t-muted num" style={{ marginRight: 8 }}>{i + 1}.</span>
                      <span className="t-strong">{c.name}</span>{' '}
                      <span className="t-muted mono">{c.code}</span>
                    </span>
                    <span className="num t-strong">PKR {fmtNum(c.total_volume)} <span className="t-muted">({c.bill_count})</span></span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top Customers by Outstanding */}
          <div className="card">
            <div className="card-title">TOP CUSTOMERS BY OUTSTANDING</div>
            {topOutstanding.length === 0 ? (
              <div className="empty">Nothing outstanding</div>
            ) : (
              <div className="stack sm">
                {topOutstanding.map((c: any, i: number) => (
                  <Link key={c.id} href={`/customers/${c.id}`} className="row between"
                        style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <span>
                      <span className="t-muted num" style={{ marginRight: 8 }}>{i + 1}.</span>
                      <span className="t-strong">{c.name}</span>{' '}
                      <span className="t-muted mono">{c.code}</span>
                    </span>
                    <span className="num stat-accent" style={{ fontWeight: 600 }}>PKR {fmtNum(c.balance)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
