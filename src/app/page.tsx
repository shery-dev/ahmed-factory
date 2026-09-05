import Link from 'next/link';
import {
  Activity, AlertTriangle, ArrowRight, Banknote, Coins, FilePlus2, HandCoins,
  Landmark, Package, PackagePlus, Receipt, Tags, TrendingUp, UserPlus, Users,
} from 'lucide-react';
import { dashboard, recentActivity, outstandingBalances, dailyBillingTrend } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { Sensitive } from '@/components/Sensitive';
import { DashboardSections, HideButton, DashboardVisibility, RestoreButton } from '@/components/DashboardSections';
import { PrivacyToggle } from '@/components/PrivacyToggle';

export const dynamic = 'force-dynamic';

const LEVEL: Record<string, string> = {
  system: 'log-system', agent: 'log-agent', success: 'log-success',
  warn: 'log-warn', error: 'log-error',
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => iso(new Date(Date.now() - n * 86400000));

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
  const collectedPct = billed > 0 ? Math.round((collected / billed) * 100) : null;

  const outCount = Number(d.stockAlerts?.out ?? 0);
  const lowCount = Number(d.stockAlerts?.low ?? 0);
  const issueCount = Number(d.issues?.n ?? 0);
  const needsAttention = outCount + lowCount + issueCount > 0;

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
    <DashboardVisibility>
      <div className="panel-header">
        <div className="panel-header-row">
          <h2>Dashboard</h2>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <RestoreButton />
            <PrivacyToggle />
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

      <section className="hero-band">
        <div className="hero-cell">
          <div className="hero-label">
            <span className="icon-badge amber"><Receipt size={13} /></span>
            Billed · {periodLabel}
          </div>
          <Sensitive className="hero-figure num">
            <span className="hero-cur">PKR</span> {fmtNum(billed)}
          </Sensitive>
          <div className="hero-sub">
            <Sensitive>{d.billsToday?.n ?? 0} {(d.billsToday?.n ?? 0) === 1 ? 'bill' : 'bills'} posted</Sensitive>
          </div>
        </div>

        <div className="hero-cell">
          <div className="hero-label">
            <span className="icon-badge green"><Banknote size={13} /></span>
            Collected
            {collectedPct !== null && <Sensitive className="hero-pct">{collectedPct}%</Sensitive>}
          </div>
          <Sensitive className="hero-figure num hero-green">
            <span className="hero-cur">PKR</span> {fmtNum(collected)}
          </Sensitive>
          {billed > 0 ? (
            <>
              <div className="split-bar" role="img"
                   aria-label={`${collectedPct}% of billing collected, the rest on account`}>
                <span className="split-fill" style={{ width: `${collectedPct}%` }} />
              </div>
              <div className="hero-sub">
                <Sensitive>PKR {fmtNum(onAccount)} left on account</Sensitive>
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

      <DashboardSections id="stats">
        <div className="grid grid-4" style={{ marginBottom: 18 }}>
          <Link href="/customers" className="card stat-card">
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div className="card-title">TOTAL RECEIVABLE</div>
              <span className="icon-badge lg amber"><Landmark size={17} /></span>
            </div>
            <Sensitive className="stat-big stat-accent num">PKR {fmtNum(d.receivable?.v ?? 0)}</Sensitive>
            <div className="stat-sub">Across <Sensitive>{owedAll.length}</Sensitive> customers</div>
          </Link>

          <Link href="/expenses" className="card stat-card">
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div className="card-title">EXPENSES · {periodLabel.toUpperCase()}</div>
              <span className="icon-badge lg red"><Coins size={17} /></span>
            </div>
            <Sensitive className="stat-big num">PKR {fmtNum(d.expensesToday?.v ?? 0)}</Sensitive>
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
      </DashboardSections>

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
        <DashboardSections id="outstanding">
          <div className="card">
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>
                <span className="card-title-icon"><Landmark size={13} /></span>
                OUTSTANDING BALANCES
              </div>
              <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                <HideButton id="outstanding" />
                <Link href="/customers" className="link-more">
                  All customers <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {owedAll.length === 0 ? (
              <EmptyState emoji="✅" heading="All settled up" message="No customer owes anything right now." />
            ) : (
              <>
                <div className="age-row">
                  {buckets.map((b) => (
                    <div key={b.key} className={`age-cell tone-${b.tone}`}>
                      <div className="age-label">{b.label}</div>
                      <Sensitive className="age-value num">PKR {fmtNum(b.total)}</Sensitive>
                      <div className="age-count"><Sensitive>{b.n}</Sensitive> {b.n === 1 ? 'customer' : 'customers'}</div>
                    </div>
                  ))}
                </div>

                <div className="stack sm">
                  {owed.map((c) => (
                    <Link key={c.id} href={`/customers/${c.id}`} className="owed-row">
                      <span className="owed-name">
                        <Sensitive className="t-strong">{c.name}</Sensitive>
                        <span className="t-muted mono owed-code">{c.code}</span>
                      </span>
                      <Sensitive className="num t-strong">PKR {fmtNum(c.balance)}</Sensitive>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </DashboardSections>

        <div className="stack">
          <DashboardSections id="low-stock">
            <div className="card">
              <div className="row between" style={{ marginBottom: 12 }}>
                <div className="card-title" style={{ marginBottom: 0 }}>
                  <span className="card-title-icon"><Package size={13} /></span>
                  LOW STOCK
                </div>
                <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                  <HideButton id="low-stock" />
                  <Link href="/stock" className="link-more">
                    Stock <ArrowRight size={13} />
                  </Link>
                </div>
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
          </DashboardSections>

          <DashboardSections id="activity">
            <div className="card">
              <div className="row between" style={{ marginBottom: 12 }}>
                <div className="card-title" style={{ marginBottom: 0 }}>
                  <span className="card-title-icon"><Activity size={13} /></span>
                  ACTIVITY
                </div>
                <HideButton id="activity" />
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
          </DashboardSections>
        </div>
      </div>
    </DashboardVisibility>
  );
}
