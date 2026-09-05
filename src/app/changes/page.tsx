import Link from 'next/link';
import { dbGet } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Change {
  title: string;
  legacy: string;
  now: string;
  status: 'done' | 'partial' | 'next';
  proof?: { href: string; label: string };
  evidence?: string;
}

const CHANGES: Change[] = [
  {
    title: 'The catalogue is data, not code',
    legacy: 'The 18 paper types were written into the source as literal text 364 times across 4 files. stock.py alone had 18 near-identical functions differing only by which name they mentioned. Adding a product was a multi-day edit.',
    now: 'One item_types table. Adding a product is an INSERT and it appears on the billing screen immediately.',
    status: 'done',
    proof: { href: '/catalogue', label: 'Add a product and watch it appear in billing' },
    evidence: 'stock.py: 132 · factorycustomers.py: 104 · CashBillclass.py: 102 · stock_in_out_record.py: 26',
  },
  {
    title: 'One event, not five separate writes',
    legacy: 'Billing, stock and the ledger were three screens writing to three spreadsheet sheets at different times, with no guarantee they agreed.',
    now: 'Posting a bill allocates the receipt number, writes the bill and its lines, decrements stock with movement rows, and posts the ledger entry — inside a single SQLite transaction. If any step fails, none are written.',
    status: 'done',
    proof: { href: '/billing', label: 'Post a bill and read the effects panel' },
  },
  {
    title: 'The balance is computed, never stored',
    legacy: 'A BALANCE column sat in every row. Editing or deleting any earlier row silently corrupted every balance after it.',
    now: 'ledger_entries holds only debit, credit and rent. The running balance is calculated on read.',
    status: 'done',
    proof: { href: '/customers', label: 'Open any customer ledger' },
  },
  {
    title: 'Receipt numbers cannot collide',
    legacy: 'The next number came from reading the last row of a sheet and adding one, with cash and client bills sharing the counter. Two bills raised together produced duplicate numbers on real customer paperwork.',
    now: 'A counters row is incremented inside the posting transaction. Concurrency cannot produce a duplicate.',
    status: 'done',
    proof: { href: '/bills', label: 'See the receipt sequence' },
  },
  {
    title: 'Bad data is quarantined, not silently trusted',
    legacy: 'Negative stock and values like 1,111,111,189 sat in the sheets and were read back as fact.',
    now: 'The import sanity-checks every row. Failures are imported as zero, flagged on the record, and queued for a human. Nothing is silently dropped or silently believed.',
    status: 'done',
    proof: { href: '/review', label: 'Open the Needs Attention queue' },
  },
  {
    title: 'Bilingual from the first commit',
    legacy: 'English-only PyQt5 windows pinned to a fixed 1360×850 pixel layout.',
    now: 'Every staff-facing string is a translation key. Urdu flips the document to RTL and switches to Nastaliq. Trade terms — Raddi, Jutta, Totay, Nali, Bareek — are transliterated, never translated away.',
    status: 'done',
    proof: { href: '/billing', label: 'Press the اردو button in the top bar' },
  },
  {
    title: 'Pricing lives in exactly one place',
    legacy: 'The seven pricing formulas were duplicated inside PyQt button handlers across several files, coordinated by 376 global statements.',
    now: 'src/lib/pricing.ts is the single implementation. The UI calls it, the server action calls it, and a future quotation agent will call the same function.',
    status: 'done',
    evidence: 'Rolls: rate × size × qty  ·  Packets: (L × W × gsm ÷ 15500) × packets × rate',
  },
  {
    title: 'Stock moves at the gate pass, not at the bill',
    legacy: 'Stock decremented when the bill was raised — wrong for delivery jobs, where paper leaves hours or days before invoicing.',
    now: 'Not yet built. This prototype still decrements at billing, which is correct for counter sales. Orders, gate passes and the dispatch board are Phase 3.',
    status: 'next',
  },
  {
    title: 'Agents on top of the same domain layer',
    legacy: 'No automation of any kind.',
    now: 'Not yet built. The foundation is in place: because pricing, stock and ledger rules sit behind lib/repo.ts rather than inside screens, an order-intake or quotation agent calls exactly what the counter clerk calls.',
    status: 'next',
  },
  {
    title: 'Version control, backups, restore',
    legacy: 'None of the three. A corrupted spreadsheet became a total loss.',
    now: 'Git from the first commit and a reproducible seed. Managed Postgres with tested restore is a Phase 1 deliverable in production — SQLite here so the prototype runs with nothing to install.',
    status: 'partial',
  },
];

const BADGE = {
  done: { cls: 'badge-green', label: 'IN THIS BUILD' },
  partial: { cls: 'badge-yellow', label: 'PARTIAL' },
  next: { cls: 'badge-muted', label: 'NEXT PHASE' },
};

export default async function ChangesPage() {
  const counts = {
    types: (await dbGet<{ n: number }>(`SELECT COUNT(*) n FROM item_types`))?.n ?? 0,
    stock: (await dbGet<{ n: number }>(`SELECT COUNT(*) n FROM stock_items`))?.n ?? 0,
    customers: (await dbGet<{ n: number }>(`SELECT COUNT(*) n FROM customers`))?.n ?? 0,
    ledger: (await dbGet<{ n: number }>(`SELECT COUNT(*) n FROM ledger_entries`))?.n ?? 0,
    tables: (await dbGet<{ n: number }>(
      `SELECT COUNT(*) n FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`,
    ))?.n ?? 0,
  };
  const done = CHANGES.filter((c) => c.status === 'done').length;

  return (
    <>
      <div className="panel-header">
        <h2>What Changed</h2>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <div className="card tight">
          <div className="card-title">FIXED IN THIS BUILD</div>
          <div className="stat-big stat-green num">{done}<span style={{ fontSize: 15, color: 'var(--text-faint)' }}>/{CHANGES.length}</span></div>
        </div>
        <div className="card tight">
          <div className="card-title">TABLES</div>
          <div className="stat-big num">{counts.tables}</div>
          <div className="stat-sub">replacing 29 sheets</div>
        </div>
        <div className="card tight">
          <div className="card-title">IMPORTED</div>
          <div className="stat-big stat-accent num">{counts.types}</div>
          <div className="stat-sub">products · {counts.stock} stock rows</div>
        </div>
        <div className="card tight">
          <div className="card-title">LEDGER</div>
          <div className="stat-big num">{counts.ledger}</div>
          <div className="stat-sub">{counts.customers} customers</div>
        </div>
      </div>

      <div className="stack">
        {CHANGES.map((c, i) => (
          <div className="card" key={i}>
            <div className="row between wrap" style={{ marginBottom: 12, gap: 10 }}>
              <div className="row" style={{ gap: 10 }}>
                <span className="num" style={{ color: 'var(--accent-kraft)', fontWeight: 700, fontSize: 12 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="t-strong" style={{ fontSize: 14.5 }}>{c.title}</span>
              </div>
              <span className={`badge ${BADGE[c.status].cls}`}>{BADGE[c.status].label}</span>
            </div>

            <div className="grid grid-2">
              <div style={{
                padding: '11px 13px', borderRadius: 8, background: 'var(--log-error-bg)',
                borderInlineStart: '2px solid var(--accent-red-solid)',
              }}>
                <div className="card-title" style={{ marginBottom: 6, color: 'var(--accent-red)' }}>2022 SYSTEM</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>{c.legacy}</div>
              </div>
              <div style={{
                padding: '11px 13px', borderRadius: 8,
                background: c.status === 'next' ? 'var(--bg-elevated)' : 'var(--log-success-bg)',
                borderInlineStart: `2px solid ${c.status === 'next' ? 'var(--border-hover)' : 'var(--accent-green-solid)'}`,
              }}>
                <div className="card-title" style={{
                  marginBottom: 6,
                  color: c.status === 'next' ? 'var(--text-faint)' : 'var(--accent-green)',
                }}>
                  {c.status === 'next' ? 'PLANNED' : 'THIS BUILD'}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>{c.now}</div>
              </div>
            </div>

            {(c.evidence || c.proof) && (
              <div className="row between wrap" style={{ marginTop: 12, gap: 10 }}>
                {c.evidence ? <span className="formula-chip">{c.evidence}</span> : <span />}
                {c.proof && (
                  <Link className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 11.5 }}
                        href={c.proof.href}>
                    {c.proof.label} →
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="info-card" style={{ marginTop: 20 }}>
        <div>
          <b>What this prototype is not.</b> It is a working demonstration of the
          billing core on real catalogue data — not the production system. Orders and
          gate passes, the document-capture agent, expenses, the daily report,
          authentication and roles are all still ahead. Full scope is in{' '}
          <i>Process Map, Agent Architecture &amp; Scope of Work</i>.
        </div>
      </div>
    </>
  );
}
