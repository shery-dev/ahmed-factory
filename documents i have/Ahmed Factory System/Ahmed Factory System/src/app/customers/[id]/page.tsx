import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomer, customerLedger, customerBalance } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCustomer(Number(id));
  if (!c) notFound();
  const rows = customerLedger(c.id);
  const balance = customerBalance(c.id);

  return (
    <>
      <div className="row between" style={{ marginBottom: 18 }}>
        <div className="panel-header" style={{ margin: 0 }}>
          <h2>{c.name} <span className="mono t-muted" style={{ fontSize: 14 }}>{c.code}</span></h2>
          <p className="panel-desc">
            {c.kind === 'cash' ? 'Cash customer' : 'Ledger client'}
            {c.contact ? ` · ${c.contact}` : ''}
            {c.manual_ledger_page ? ` · paper register page ${c.manual_ledger_page}` : ''}
          </p>
        </div>
        <Link className="btn btn-ghost" href="/customers">← All customers</Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">CURRENT BALANCE</div>
          <div className="stat-big stat-accent num">PKR {fmtNum(balance)}</div>
          <div className="stat-sub">Computed from {rows.length} entries</div>
        </div>
        <div className="card">
          <div className="card-title">TOTAL DEBIT</div>
          <div className="stat-big num">{fmtNum(rows.filter((r) => !r.flagged).reduce((s, r) => s + r.debit, 0))}</div>
        </div>
        <div className="card">
          <div className="card-title">TOTAL CREDIT</div>
          <div className="stat-big stat-green num">{fmtNum(rows.filter((r) => !r.flagged).reduce((s, r) => s + r.credit, 0))}</div>
        </div>
        <div className="card">
          <div className="card-title">TOTAL RENT</div>
          <div className="stat-big num">{fmtNum(rows.filter((r) => !r.flagged).reduce((s, r) => s + r.rent, 0))}</div>
          <div className="stat-sub">Meaning unconfirmed</div>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>DATE</th><th>RECEIPT</th><th>PARTICULARS</th>
              <th className="right">DEBIT</th><th className="right">CREDIT</th>
              <th className="right">RENT</th><th className="right">BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.flagged ? 'quarantined' : ''}>
                <td className="num t-muted">{r.ts.slice(0, 10)}</td>
                <td className="num">{r.receipt_no ? `#${r.receipt_no}` : '—'}</td>
                <td style={{ maxWidth: 340 }}>{r.particulars}</td>
                <td className="right num">{r.debit ? fmtNum(r.debit) : '—'}</td>
                <td className="right num stat-green">{r.credit ? fmtNum(r.credit) : '—'}</td>
                <td className="right num">{r.rent ? fmtNum(r.rent) : '—'}</td>
                <td className="right num t-strong">
                  {r.flagged
                    ? <span className="badge badge-red" title={r.flag_reason ?? ''}>EXCLUDED</span>
                    : fmtNum(r.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-card good" style={{ marginTop: 16 }}>
        <div>
          The <b>Balance</b> column is calculated as it renders, by running down the
          entries above. The 2022 system stored this number in every row — editing or
          deleting any earlier entry silently corrupted every balance after it. That
          failure mode does not exist here. Rows marked <b>EXCLUDED</b> carry amounts
          the import judged impossible; they are kept visible but never move the balance.
        </div>
      </div>
    </>
  );
}
