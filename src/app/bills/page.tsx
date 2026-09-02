import Link from 'next/link';
import { listBills, countBills } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export default async function BillsPage({ searchParams }: { searchParams: Promise<{ q?: string; from?: string; to?: string; kind?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q || '';
  const from = sp.from || '';
  const to = sp.to || '';
  const kind = sp.kind || '';
  const status = sp.status || '';
  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const opts = { search: q || undefined, from: from || undefined, to: to || undefined, kind: kind || undefined, status: status || undefined };
  const [bills, total] = await Promise.all([
    listBills({ ...opts, limit: PAGE_SIZE, offset }),
    countBills(opts),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const qs = (extra: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    if (kind) p.set('kind', kind);
    if (status) p.set('status', status);
    for (const [k, v] of Object.entries(extra)) { if (v !== undefined && v !== '') p.set(k, String(v)); }
    return '?' + p.toString();
  };

  return (
    <>
      <div className="panel-header">
        <h2>Bills</h2>
        <p className="panel-desc">
          Every bill carries a receipt number allocated from a database sequence
          inside the posting transaction, so two bills raised at the same moment
          can never share a number.
        </p>
      </div>

      {/* Search + Filters */}
      <form method="GET" className="row wrap" style={{ gap: 8, marginBottom: 16 }}>
        <input className="input" name="q" defaultValue={q} placeholder="Search customer, receipt #…" style={{ minWidth: 220, flex: '1 1 200px' }} />
        <input className="input" type="date" name="from" defaultValue={from} style={{ flex: '0 1 150px' }} />
        <input className="input" type="date" name="to" defaultValue={to} style={{ flex: '0 1 150px' }} />
        <select className="select" name="kind" defaultValue={kind} style={{ flex: '0 1 120px' }}>
          <option value="">All types</option>
          <option value="cash">Cash</option>
          <option value="ledger">Ledger</option>
        </select>
        <select className="select" name="status" defaultValue={status} style={{ flex: '0 1 120px' }}>
          <option value="">All status</option>
          <option value="posted">Posted</option>
          <option value="void">Void</option>
        </select>
        <button className="btn btn-primary" type="submit" style={{ padding: '6px 16px' }}>Filter</button>
        {(q || from || to || kind || status) && (
          <a href="/bills" className="btn btn-ghost" style={{ padding: '6px 12px' }}>Clear</a>
        )}
      </form>

      <div className="row" style={{ gap: 8, marginBottom: 12 }}>
        <a className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} href={`/api/export?type=bills&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`}>Export CSV</a>
      </div>

      {total > 0 && (
        <div className="t-muted" style={{ marginBottom: 8, fontSize: 12 }}>
          Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total} bills
        </div>
      )}

      {bills.length === 0 ? (
        <div className="card"><div className="empty">No bills match your filters.</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>RECEIPT</th><th>DATE</th><th>CUSTOMER</th><th>TYPE</th>
                <th className="right">LINES</th><th className="right">SUBTOTAL</th>
                <th className="right">PAID</th><th>STATUS</th><th></th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} style={b.status === 'void' ? { opacity: 0.5 } : undefined}>
                  <td className="num t-strong">#{b.receipt_no}</td>
                  <td className="num t-muted">{b.ts.slice(0, 16)}</td>
                  <td>
                    <span className="t-strong">{b.customer_name}</span>{' '}
                    <span className="mono t-muted">{b.customer_code}</span>
                  </td>
                  <td>
                    <span className={`badge ${b.kind === 'cash' ? 'badge-kraft' : 'badge-purple'}`}>
                      {b.kind}
                    </span>
                  </td>
                  <td className="right num">{b.line_count}</td>
                  <td className="right num t-strong">{fmtNum(b.subtotal)}</td>
                  <td className="right num stat-green">{fmtNum(b.credit)}</td>
                  <td>
                    {b.status === 'void'
                      ? <span className="badge badge-red">VOID</span>
                      : <span className="badge badge-green">OK</span>}
                  </td>
                  <td className="right">
                    <Link className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}
                          href={`/bills/${b.id}`}>Receipt</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="row" style={{ gap: 6, marginTop: 16, justifyContent: 'center' }}>
          {page > 1 && <a className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} href={qs({ page: page - 1 })}>← Prev</a>}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a key={p} className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 10px', fontSize: 11 }} href={qs({ page: p })}>{p}</a>
          ))}
          {page < totalPages && <a className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} href={qs({ page: page + 1 })}>Next →</a>}
        </div>
      )}
    </>
  );
}
