import Link from 'next/link';
import { FilePlus2, Receipt, Banknote, DollarSign, Landmark, Package, Users, Activity } from 'lucide-react';
import { dashboard, recentActivity, outstandingBalances } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

const LEVEL: Record<string, string> = {
  system: 'log-system', agent: 'log-agent', success: 'log-success',
  warn: 'log-warn', error: 'log-error',
};

export default async function Home({
  searchParams,
}: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { from = '', to = '' } = await searchParams;
  const d = await dashboard(from || undefined, to || undefined);
  const log = await recentActivity(18);
  const owed = (await outstandingBalances()).slice(0, 6);

  const period = from ? (to ? `${from} to ${to}` : from) : 'today';

  return (
    <>
      <div className="panel-header">
        <div className="panel-header-row">
          <h2>Dashboard</h2>
          <Link href="/billing" className="btn btn-primary" style={{ fontSize: 13 }}>
            <FilePlus2 size={15} /> New Bill
          </Link>
        </div>
        <p className="panel-desc">
          Live position for Ahmed Corrugation Machines. Every figure below is
          computed from the transaction tables.
        </p>
      </div>

      <form className="row wrap" style={{ gap: 8, marginBottom: 16 }} method="get">
        <input className="input" name="from" type="date" defaultValue={from} style={{ flex: '0 1 160px' }} />
        <input className="input" name="to" type="date" defaultValue={to} style={{ flex: '0 1 160px' }} />
        <button className="btn btn-ghost" type="submit" style={{ padding: '6px 14px' }}>
          {from ? 'Show Period' : 'Show Today'}
        </button>
        {from && (
          <a className="btn btn-ghost" href="/" style={{ padding: '6px 14px' }}>Back to Today</a>
        )}
      </form>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="card-title">BILLS ({period.toUpperCase()})</div>
            <span className="icon-badge lg amber"><Receipt size={17} /></span>
          </div>
          <div className="stat-big num">{d.billsToday?.n ?? 0}</div>
          <div className="stat-sub num">PKR {fmtNum(d.billsToday?.v ?? 0)} billed</div>
        </div>
        <div className="card">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="card-title">CASH RECEIVED</div>
            <span className="icon-badge lg green"><Banknote size={17} /></span>
          </div>
          <div className="stat-big stat-green num">PKR {fmtNum(d.creditToday?.v ?? 0)}</div>
          <div className="stat-sub">Credits posted against bills</div>
        </div>
        <div className="card">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="card-title">EXPENSES</div>
            <span className="icon-badge lg red"><DollarSign size={17} /></span>
          </div>
          <div className="stat-big num">PKR {fmtNum(d.expensesToday?.v ?? 0)}</div>
          <div className="stat-sub">Total for period</div>
        </div>
        <div className="card">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="card-title">TOTAL RECEIVABLE</div>
            <span className="icon-badge lg neutral"><Landmark size={17} /></span>
          </div>
          <div className="stat-big stat-accent num">PKR {fmtNum(d.receivable?.v ?? 0)}</div>
          <div className="stat-sub">{d.products?.n ?? 0} products · {d.customers?.n ?? 0} customers</div>
        </div>
      </div>

      {/* What's actually one tap away today. */}
      <div className="quick-actions">
        <Link href="/billing" className="quick-action-tile">
          <span className="icon-badge lg amber"><FilePlus2 size={19} /></span>
          <span className="quick-action-label">New Bill</span>
        </Link>
        <Link href="/stock" className="quick-action-tile">
          <span className="icon-badge lg neutral"><Package size={19} /></span>
          <span className="quick-action-label">Stock</span>
        </Link>
        <Link href="/customers" className="quick-action-tile">
          <span className="icon-badge lg neutral"><Users size={19} /></span>
          <span className="quick-action-label">Customers</span>
        </Link>
        <Link href="/bills" className="quick-action-tile">
          <span className="icon-badge lg neutral"><Receipt size={19} /></span>
          <span className="quick-action-label">Bills</span>
        </Link>
      </div>

      {(d.issues?.n ?? 0) > 0 && (
        <div className="info-card warn" style={{ marginBottom: 20 }}>
          <div>
            <b>{d.issues?.n} items need attention.</b> The 2022 import contained
            values that failed sanity checks.{' '}
            <Link href="/review" style={{ color: 'var(--accent-yellow)' }}>Review them →</Link>
          </div>
        </div>
      )}

      <div className="split">
        <div className="card">
          <div className="card-title">
            <span className="card-title-icon"><Activity size={13} /></span>
            ACTIVITY LOG
          </div>
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
            <div className="card-title">
              <span className="card-title-icon"><Landmark size={13} /></span>
              OUTSTANDING BALANCES
            </div>
            {owed.length === 0 ? (
              <EmptyState emoji="✅" heading="All settled up" message="No customer owes anything right now." />
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
            <div className="card-title">
              <span className="card-title-icon"><Package size={13} /></span>
              LOW STOCK
            </div>
            {d.lowStock.length === 0 ? (
              <EmptyState emoji="📦" heading="Stock looks healthy" message="Nothing is below its reorder level." />
            ) : (
              <div className="stack sm">
                {d.lowStock.map((s: any, i: number) => (
                  <div key={i} className="row between"
                       style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <span className="t-strong" style={{ fontSize: 12.5 }}>
                      {s.name_en} <span className="t-muted">{s.size}&quot;</span>
                    </span>
                    <StatusBadge status={s.quantity <= 0 ? 'out' : 'low'}>
                      {fmtNum(s.quantity)} {s.unit}
                    </StatusBadge>
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
