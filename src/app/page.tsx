import Link from 'next/link';
import {
  Activity, AlertTriangle, ArrowRight, Banknote, Coins, FilePlus2, HandCoins,
  Landmark, Package, PackagePlus, Receipt, Tags, TrendingUp, UserPlus, Users,
} from 'lucide-react';
import { dashboard, recentActivity, outstandingBalances, dailyBillingTrend } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

const LEVEL: Record<string, string> = {
  system: 'log-system', agent: 'log-agent', success: 'log-success',
  warn: 'log-warn', error: 'log-error',
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => iso(new Date(Date.now() - n * 86400000));

/**
 * The dashboard answers four questions, in the order a counter actually asks
 * them: what came in today, what is owed to us, what needs a decision right
 * now, and what happened. The stat cards it replaced answered the first one
 * four times over — bills, cash, expenses, receivable, all the same size, none
 * of them saying whether the day was going well.
 */
export default async function Home({
  searchParams,
}: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { from = '', to = '' } = await searchParams;
  const [d, log, owedAll, trend] = await Promise.all([
    dashboard(from || undefined, to || undefined),
    recentActivity(14),
    outstandingBalances(),
    dailyBillingTrend(7),
  ]);

  const today = iso(new Date());
  const billed = d.billsToday?.v ?? 0;
  const collected = d.creditToday?.v ?? 0;
  const onAccount = Math.max(0, billed - collected);
  // A day with no billing has no collection rate — showing 0% would read as a
  // bad day rather than an empty one.
  const collectedPct = billed > 0 ? Math.round((collected / billed) * 100) : null;

  const outCount = Number(d.stockAlerts?.out ?? 0);
  const lowCount = Number(d.stockAlerts?.low ?? 0);
  const issueCount = Number(d.issues?.n ?? 0);
  const needsAttention = outCount + lowCount + issueCount > 0;

  // Ageing by time since the customer last moved money, not by invoice date:
  // there is no invoice-level allocation in the ledger, so a true 30/60/90 is
  // not derivable yet. "Nothing for 60 days" is still the signal worth seeing,
  // and the heading says exactly that rather than implying a real ageing run.
  const buckets = [
    { key: 'recent', label: 'Under 30 days', tone: 'green', total: 0, n: 0 },
    { key: 'mid', label: '30 – 60 days', tone: 'amber', total: 0, n: 0 },
    { key: 'stale', label: 'Over 60 days', tone: 'red', total: 0, n: 0 },
  ];
  for (const c of owedAll) {
    const age = c.last_activity
      ? Math.floor((Date.now() - new Date(c.last_activity).getTime()) / 86400000)
      : 999;
    const b = age <= 30 ? buckets[0] : age <= 60 ? buckets[1] : buckets[2];
    b.total += c.balance;
    b.n += 1;
  }
  const owed = owedAll.slice(0, 6);

  const periodLabel = from ? (to && to !== from ? `${from} → ${to}` : from) : 'Today';
  const peak = Math.max(...trend.map((t) => t.billed), 1);

  const PRESETS = [
    { label: 'Today', href: '/', on: !from },
    { label: '7 days', href: `/?from=${daysAgo(6)}&to=${today}`, on: from === daysAgo(6) },
    { label: '30 days', href: `/?from=${daysAgo(29)}&to=${today}`, on: from === daysAgo(29) },
  ];

  return (
    <>
      <div className="panel-header">
        <div className="panel-header-row">
          <h2>Dashboard</h2>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <div className="seg">
              {PRESETS.map((p) => (
                <Link key={p.label} href={p.href} className={`seg-btn ${p.on ? 'active' : ''}`}>
                  {p.label}
                </Link>
              ))}
            </div>
            <Link href="/billing" className="btn btn-primary" style={{ fontSize: 13 }}>
              <FilePlus2 size={15} /> New Bill
            </Link>
          </div>
        </div>
      </div>

      {/* ── The day itself: billed, how much of it actually came in, and the
          shape of the week behind it. One band, because they are one story. ── */}
      <section className="hero-band">
        <div className="hero-cell">
          <div className="hero-label">
            <span className="icon-badge amber"><Receipt size={13} /></span>
            Billed · {periodLabel}
          </div>
          <div className="hero-figure num sensitive">
            <span className="hero-cur">PKR</span> {fmtNum(billed)}
          </div>
          <div className="hero-sub">
            {d.billsToday?.n ?? 0} {(d.billsToday?.n ?? 0) === 1 ? 'bill' : 'bills'} posted
          </div>
        </div>

        <div className="hero-cell">
          <div className="hero-label">
            <span className="icon-badge green"><Banknote size={13} /></span>
            Collected
            {collectedPct !== null && <span className="hero-pct sensitive">{collectedPct}%</span>}
          </div>
          <div className="hero-figure num hero-green sensitive">
            <span className="hero-cur">PKR</span> {fmtNum(collected)}
          </div>
          {billed > 0 ? (
            <>
              <div className="split-bar" role="img"
                   aria-label={`${collectedPct}% of billing collected, the rest on account`}>
                <span className="split-fill" style={{ width: `${collectedPct}%` }} />
              </div>
              <div className="hero-sub sensitive">
                PKR {fmtNum(onAccount)} left on account
              </div>
            </>
          ) : (
            <div className="hero-sub">Nothing billed in this period</div>
          )}
        </div>

        <div className="hero-cell">
          <div className="hero-label">
            <span className="icon-badge neutral"><TrendingUp size={13} /></span>
            Last 7 days
          </div>
          <div className="spark">
            {trend.map((t) => {
              const h = Math.max(3, Math.round((t.billed / peak) * 100));
              const isToday = t.date === today;
              return (
                <div key={t.date} className="spark-col"
                     title={`${t.date} — PKR ${fmtNum(t.billed)} over ${t.bills} bill(s)`}>
                  <div className={`spark-bar ${isToday ? 'is-today' : ''}`} style={{ height: `${h}%` }} />
                  <span className="spark-tick">{t.date.slice(8)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Standing totals: true regardless of which period is selected. ── */}
      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <Link href="/customers" className="card stat-card">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="card-title">TOTAL RECEIVABLE</div>
            <span className="icon-badge lg amber"><Landmark size={17} /></span>
          </div>
          <div className="stat-big stat-accent num sensitive">PKR {fmtNum(d.receivable?.v ?? 0)}</div>
          <div className="stat-sub">Across {owedAll.length} customers</div>
        </Link>

        <Link href="/expenses" className="card stat-card">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="card-title">EXPENSES · {periodLabel.toUpperCase()}</div>
            <span className="icon-badge lg red"><Coins size={17} /></span>
          </div>
          <div className="stat-big num sensitive">PKR {fmtNum(d.expensesToday?.v ?? 0)}</div>
          <div className="stat-sub">Recorded against this period</div>
        </Link>

        <Link href="/customers" className="card stat-card">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="card-title">CUSTOMERS</div>
            <span className="icon-badge lg neutral"><Users size={17} /></span>
          </div>
          <div className="stat-big num">{fmtNum(d.customers?.n ?? 0)}</div>
          <div className="stat-sub">Cash and ledger accounts</div>
        </Link>

        <Link href="/catalogue" className="card stat-card">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="card-title">CATALOGUE</div>
            <span className="icon-badge lg neutral"><Tags size={17} /></span>
          </div>
          <div className="stat-big num">{fmtNum(d.products?.n ?? 0)}</div>
          <div className="stat-sub">Paper types in moti and bareek</div>
        </Link>
      </div>

      {/* ── One line for everything waiting on a person. Absent when there is
          nothing waiting, rather than a permanent green "all clear" banner. ── */}
      {needsAttention && (
        <div className="attn-bar">
          <span className="attn-bar-lead">
            <AlertTriangle size={15} /> Needs attention
          </span>
          {outCount > 0 && (
            <Link href="/stock?filter=attention" className="attn-chip c-out">
              {fmtNum(outCount)} {outCount === 1 ? 'size' : 'sizes'} out of stock
            </Link>
          )}
          {lowCount > 0 && (
            <Link href="/stock?filter=attention" className="attn-chip c-low">
              {fmtNum(lowCount)} below reorder level
            </Link>
          )}
          {issueCount > 0 && (
            <Link href="/review" className="attn-chip c-flag">
              {fmtNum(issueCount)} flagged from the 2022 import
            </Link>
          )}
        </div>
      )}

      <div className="quick-actions" style={{ marginBottom: 20 }}>
        <Link href="/billing" className="quick-action-tile">
          <span className="icon-badge lg amber"><FilePlus2 size={19} /></span>
          <span className="quick-action-label">New Bill</span>
        </Link>
        <Link href="/stock" className="quick-action-tile">
          <span className="icon-badge lg neutral"><PackagePlus size={19} /></span>
          <span className="quick-action-label">Receive Stock</span>
        </Link>
        <Link href="/customers" className="quick-action-tile">
          <span className="icon-badge lg green"><HandCoins size={19} /></span>
          <span className="quick-action-label">Take Payment</span>
        </Link>
        <Link href="/expenses" className="quick-action-tile">
          <span className="icon-badge lg red"><Coins size={19} /></span>
          <span className="quick-action-label">Add Expense</span>
        </Link>
        <Link href="/customers" className="quick-action-tile">
          <span className="icon-badge lg neutral"><UserPlus size={19} /></span>
          <span className="quick-action-label">Add Customer</span>
        </Link>
        <Link href="/bills" className="quick-action-tile">
          <span className="icon-badge lg neutral"><Receipt size={19} /></span>
          <span className="quick-action-label">All Bills</span>
        </Link>
      </div>

      <div className="split">
        <div className="card">
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>
              <span className="card-title-icon"><Landmark size={13} /></span>
              OUTSTANDING BALANCES
            </div>
            <Link href="/customers" className="link-more">
              All customers <ArrowRight size={13} />
            </Link>
          </div>

          {owedAll.length === 0 ? (
            <EmptyState emoji="✅" heading="All settled up" message="No customer owes anything right now." />
          ) : (
            <>
              {/* Where the money is sitting, before who it is sitting with. */}
              <div className="age-row">
                {buckets.map((b) => (
                  <div key={b.key} className={`age-cell tone-${b.tone}`}>
                    <div className="age-label">{b.label}</div>
                    <div className="age-value num sensitive">PKR {fmtNum(b.total)}</div>
                    <div className="age-count">{b.n} {b.n === 1 ? 'customer' : 'customers'}</div>
                  </div>
                ))}
              </div>
              <div className="age-note">Measured from each customer&apos;s last ledger movement.</div>

              <div className="stack sm">
                {owed.map((c) => (
                  <Link key={c.id} href={`/customers/${c.id}`} className="owed-row">
                    <span className="owed-name sensitive">
                      <span className="t-strong">{c.name}</span>
                      <span className="t-muted mono owed-code">{c.code}</span>
                    </span>
                    <span className="num t-strong sensitive">PKR {fmtNum(c.balance)}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="stack">
          <div className="card">
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>
                <span className="card-title-icon"><Package size={13} /></span>
                LOW STOCK
              </div>
              <Link href="/stock" className="link-more">
                Stock <ArrowRight size={13} />
              </Link>
            </div>
            {d.lowStock.length === 0 ? (
              <EmptyState emoji="📦" heading="Stock looks healthy" message="Nothing is below its reorder level." />
            ) : (
              <div className="stack sm">
                {d.lowStock.map((s: any, i: number) => (
                  <Link key={i} href={`/stock/${s.item_type_id}?unit=${s.unit}`} className="owed-row">
                    <span className="owed-name">
                      <span className="t-strong" style={{ fontSize: 12.5 }}>{s.name_en}</span>
                      <span className="t-muted owed-code">{s.size}&quot;</span>
                    </span>
                    <StatusBadge status={s.quantity <= 0 ? 'out' : 'low'}>
                      {fmtNum(s.quantity)} {s.unit}
                    </StatusBadge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">
              <span className="card-title-icon"><Activity size={13} /></span>
              ACTIVITY
            </div>
            <div className="log-body" style={{ maxHeight: 260 }}>
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
        </div>
      </div>
    </>
  );
}
