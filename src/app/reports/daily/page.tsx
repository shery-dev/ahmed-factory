import { dailyReport } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function DailyReportPage({
  searchParams,
}: { searchParams: Promise<{ date?: string }> }) {
  const { date = '' } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const d = date || today;

  const r = await dailyReport(d);

  const dayName = new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="panel-header no-print">
        <h2>Daily Report</h2>
      </div>

      <form className="row wrap no-print" style={{ gap: 8, marginBottom: 20 }} method="get">
        <input className="input" name="date" type="date" defaultValue={d} style={{ flex: '0 1 160px' }} />
        <button className="btn btn-ghost" type="submit" style={{ padding: '6px 14px' }}>Show Day</button>
        {d !== today && <a className="btn btn-ghost" href="/reports/daily" style={{ padding: '6px 14px' }}>Today</a>}
        <div className="spacer" />
        <span className="t-muted" style={{ fontSize: 12 }}>Use Ctrl+P to print</span>
      </form>

      <div className="daily-report" style={{ maxWidth: 800 }}>
        <div className="report-header" style={{ borderBottom: '2px solid var(--text-primary)', paddingBottom: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 20, color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>Ahmed Corrugation Machines</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Daily Report</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{dayName}</div>
              <div className="num" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d}</div>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <div className="card tight" style={{ textAlign: 'center' }}>
            <div className="card-title">TOTAL BILLS</div>
            <div className="stat-big num" style={{ fontSize: 22 }}>{r.totalBills}</div>
          </div>
          <div className="card tight" style={{ textAlign: 'center' }}>
            <div className="card-title">TOTAL DEBIT</div>
            <div className="stat-big num stat-accent" style={{ fontSize: 22 }}>{fmtNum(r.totalDebit)}</div>
          </div>
          <div className="card tight" style={{ textAlign: 'center' }}>
            <div className="card-title">TOTAL CREDIT</div>
            <div className="stat-big num stat-green" style={{ fontSize: 22 }}>{fmtNum(r.totalCredit)}</div>
          </div>
          <div className="card tight" style={{ textAlign: 'center' }}>
            <div className="card-title">NET POSITION</div>
            <div className={'stat-big num ' + (r.netPosition >= 0 ? 'stat-green' : 'stat-red')} style={{ fontSize: 22 }}>
              {r.netPosition >= 0 ? '+' : ''}{fmtNum(r.netPosition)}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">CASH vs CLIENT BREAKDOWN</div>
          <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr><th>CATEGORY</th><th className="right">BILLS</th><th className="right">BILL AMOUNT</th><th className="right">COLLECTED</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className="t-strong">Cash Customers</td>
                  <td className="right num">{r.cashBills.length}</td>
                  <td className="right num">PKR {fmtNum(r.cashTotal)}</td>
                  <td className="right num stat-green">{fmtNum(r.cashCollected)}</td>
                </tr>
                <tr>
                  <td className="t-strong">Client (Ledger) Customers</td>
                  <td className="right num">{r.ledgerBills.length}</td>
                  <td className="right num">PKR {fmtNum(r.ledgerTotal)}</td>
                  <td className="right num stat-accent">{fmtNum(r.ledgerCollected)}</td>
                </tr>
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <td className="t-strong">TOTAL</td>
                  <td className="right num t-strong">{r.totalBills}</td>
                  <td className="right num t-strong">PKR {fmtNum(r.cashTotal + r.ledgerTotal)}</td>
                  <td className="right num t-strong">{fmtNum(r.cashCollected + r.ledgerCollected)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">EXPENSES</div>
          {r.expenseByCategory.length === 0 ? (
            <div className="empty">No expenses recorded</div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr><th>CATEGORY</th><th className="right">ENTRIES</th><th className="right">AMOUNT</th></tr>
                </thead>
                <tbody>
                  {r.expenseByCategory.map((e: any) => (
                    <tr key={e.category}>
                      <td className="t-strong">{e.category}</td>
                      <td className="right num">{e.n}</td>
                      <td className="right num">PKR {fmtNum(e.total)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid var(--border)' }}>
                    <td className="t-strong">TOTAL EXPENSES</td>
                    <td className="right num t-strong">{r.expenses.length}</td>
                    <td className="right num stat-red" style={{ fontWeight: 700 }}>PKR {fmtNum(r.expenseTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">NET POSITION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="row between" style={{ padding: '6px 0' }}>
              <span>Cash Collected</span>
              <span className="num stat-green" style={{ fontWeight: 600 }}>+ {fmtNum(r.cashCollected)}</span>
            </div>
            <div className="row between" style={{ padding: '6px 0' }}>
              <span>Credit Collected (from ledger customers)</span>
              <span className="num stat-green" style={{ fontWeight: 600 }}>+ {fmtNum(r.ledgerCollected)}</span>
            </div>
            <div className="row between" style={{ padding: '6px 0' }}>
              <span>Total Expenses</span>
              <span className="num stat-red" style={{ fontWeight: 600 }}>- {fmtNum(r.expenseTotal)}</span>
            </div>
            <div style={{ borderTop: '2px solid var(--accent-kraft)', marginTop: 8, paddingTop: 10 }}>
              <div className="row between">
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>NET CASH MOVEMENT</span>
                <span className={'num ' + (r.netPosition >= 0 ? 'stat-green' : 'stat-red')} style={{ fontWeight: 800, fontSize: 18 }}>
                  {r.netPosition >= 0 ? '+' : ''}PKR {fmtNum(r.netPosition)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {r.cashBills.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">CASH BILLS ({r.cashBills.length})</div>
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead><tr><th>RECEIPT</th><th>CUSTOMER</th><th className="right">AMOUNT</th><th className="right">PAID</th></tr></thead>
                <tbody>
                  {r.cashBills.map((b: any) => (
                    <tr key={b.id}>
                      <td className="num">{b.receipt_no}</td>
                      <td className="t-strong">{b.name}</td>
                      <td className="right num">{fmtNum(b.subtotal)}</td>
                      <td className="right num stat-green">{fmtNum(b.credit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {r.ledgerBills.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">CLIENT BILLS ({r.ledgerBills.length})</div>
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead><tr><th>RECEIPT</th><th>CUSTOMER</th><th className="right">AMOUNT</th><th className="right">PAID</th></tr></thead>
                <tbody>
                  {r.ledgerBills.map((b: any) => (
                    <tr key={b.id}>
                      <td className="num">{b.receipt_no}</td>
                      <td className="t-strong">{b.name}</td>
                      <td className="right num">{fmtNum(b.subtotal)}</td>
                      <td className="right num stat-accent">{fmtNum(b.credit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {r.expenses.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">EXPENSE DETAIL ({r.expenses.length})</div>
            <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead><tr><th>TIME</th><th>CATEGORY</th><th>DETAIL</th><th className="right">AMOUNT</th></tr></thead>
                <tbody>
                  {r.expenses.map((e: any) => (
                    <tr key={e.id}>
                      <td className="num t-muted">{e.ts.slice(11, 16)}</td>
                      <td className="t-strong">{e.category}</td>
                      <td className="t-muted">{e.detail || '-'}</td>
                      <td className="right num">{fmtNum(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
