import Link from 'next/link';
import { dashboard, recentActivity, outstandingBalances } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const LEVEL: Record<string, string> = {
  system: 'log-system', agent: 'log-agent', success: 'log-success',
  warn: 'log-warn', error: 'log-error',
};

export default function Home() {
  const d = dashboard();
  const log = recentActivity(18);
  const owed = outstandingBalances().slice(0, 6);

  return (
    <>
      <div className="panel-header">
        <h2>Dashboard</h2>
        <p className="panel-desc">
          Live position for Ahmed Corrugation Machines. Every figure below is
          computed from the transaction tables — none of it is stored or
          maintained by hand.
        </p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">TODAY&apos;S BILLS</div>
          <div className="stat-big num">{d.billsToday.n}</div>
          <div className="stat-sub num">PKR {fmtNum(d.billsToday.v)} billed</div>
        </div>
        <div className="card">
          <div className="card-title">CASH RECEIVED TODAY</div>
          <div className="stat-big stat-green num">PKR {fmtNum(d.creditToday.v)}</div>
          <div className="stat-sub">Credits posted against bills</div>
        </div>
        <div className="card">
          <div className="card-title">TOTAL RECEIVABLE</div>
          <div className="stat-big stat-accent num">PKR {fmtNum(d.receivable.v)}</div>
          <div className="stat-sub">Computed, never stored</div>
        </div>
        <div className="card">
          <div className="card-title">CATALOGUE</div>
          <div className="stat-big num">{d.products.n}</div>
          <div className="stat-sub">
            products · {d.customers.n} customers
          </div>
        </div>
      </div>

      {d.issues.n > 0 && (
        <div className="info-card warn" style={{ marginBottom: 20 }}>
          <div>
            <b>{d.issues.n} items need attention.</b> The 2022 import contained
            values that failed sanity checks — negative stock, implausible
            quantities and placeholder customer names. Nothing was silently
            dropped or silently trusted.{' '}
            <Link href="/review" style={{ color: 'var(--accent-yellow)' }}>Review them →</Link>
          </div>
        </div>
      )}

      <div className="split">
        <div className="card">
          <div className="card-title">ACTIVITY LOG</div>
          <div className="log-body">
            {log.map((l) => (
              <div key={l.id} className={`log-entry ${LEVEL[l.level] ?? 'log-system'}`}>
                <span className="log-time">{l.ts.slice(11, 16)}</span>
                <span style={{ minWidth: 0 }}>
                  <span className="log-msg">{l.event}</span>
                  {l.detail && <span className="log-detail">{l.detail}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-title">OUTSTANDING BALANCES</div>
            {owed.length === 0 ? (
              <div className="empty">Nothing outstanding</div>
            ) : (
              <div className="stack sm">
                {owed.map((c) => (
                  <Link key={c.id} href={`/customers/${c.id}`} className="row between"
                        style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <span>
                      <span className="t-strong">{c.name}</span>{' '}
                      <span className="t-muted mono">{c.code}</span>
                    </span>
                    <span className="num t-strong">PKR {fmtNum(c.balance)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">LOW STOCK</div>
            {d.lowStock.length === 0 ? (
              <div className="empty">Nothing running low</div>
            ) : (
              <div className="stack sm">
                {d.lowStock.map((s: any, i: number) => (
                  <div key={i} className="row between"
                       style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <span className="t-strong" style={{ fontSize: 12.5 }}>
                      {s.name_en} <span className="t-muted">{s.size}″</span>
                    </span>
                    <span className={`badge ${s.quantity <= 0 ? 'badge-red' : 'badge-yellow'}`}>
                      {fmtNum(s.quantity)} {s.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
