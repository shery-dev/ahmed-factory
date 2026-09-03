import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomer, customerLedger, customerBalance } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { getSettings } from '@/lib/settings';
import { PrintButton } from '@/components/PrintButton';
import { editCustomer, deactivateCustomerAction, reactivateCustomerAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCustomer(Number(id));
  if (!c) notFound();
  const settings = await getSettings();
  const rows = await customerLedger(c.id);
  const balance = await customerBalance(c.id);

  const exportHref = `/api/export?type=ledger&customer_id=${c.id}`;

  const whatsappText = `Customer Statement: ${c.name} (${c.code})\nBalance: PKR ${balance.toFixed(2)}\nEntries: ${rows.length}\n\nRecent:\n` +
    rows.slice(-10).map(r => `${r.ts.slice(0,10)} | Dr ${r.debit || 0} | Cr ${r.credit || 0} | Bal ${r.balance}`).join('\n');
  const whatsappUrl = c.contact ? `https://wa.me/${c.contact.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(whatsappText)}` : null;

  return (
    <>
      <div className="row between" style={{ marginBottom: 18 }}>
        <div className="panel-header" style={{ margin: 0 }}>
          <h2>{c.name} <span className="mono t-muted" style={{ fontSize: 14 }}>{c.code}</span></h2>
          <p className="panel-desc">
            {c.kind === 'cash' ? 'Cash customer' : 'Ledger client'}
            {c.contact ? ` \u00b7 ${c.contact}` : ''}
            {c.manual_ledger_page ? ` \u00b7 paper register page ${c.manual_ledger_page}` : ''}
            {!c.active && ' \u00b7 INACTIVE'}
          </p>
        </div>
        <Link className="btn btn-ghost" href="/customers">\u2190 All customers</Link>
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

      {whatsappUrl && (
        <div style={{ marginBottom: 16 }}>
          <a className="btn btn-ghost" href={whatsappUrl} target="_blank" rel="noopener" style={{ fontSize: 12 }}>
            Send Statement via WhatsApp
          </a>
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <a className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} href={exportHref}>Export Ledger CSV</a>
      </div>


      {/* Print-only statement */}
      <div className="print-only statement-print">
        <div style={{ borderBottom: '2px solid #111', paddingBottom: 10, marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, marginBottom: 2 }}>{settings.factory_name}</h2>
          {settings.factory_name_ur && <div style={{ fontSize: 13, color: '#444' }}>{settings.factory_name_ur}</div>}
          {settings.factory_address && <div style={{ fontSize: 11, color: '#666' }}>{settings.factory_address}</div>}
          {settings.factory_phone && <div style={{ fontSize: 11, color: '#666' }}>{settings.factory_phone}</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12 }}>
          <div>
            <div><b>{c.name}</b> ({c.code})</div>
            {c.contact && <div>{c.contact}</div>}
            <div>{c.kind === 'cash' ? 'Cash Customer' : 'Ledger Client'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>Statement as of {new Date().toISOString().slice(0, 10)}</div>
            <div><b>Outstanding: PKR {fmtNum(balance)}</b></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>DATE</th><th>RECEIPT</th><th>PARTICULARS</th>
              <th style={{ textAlign: 'right' }}>DEBIT</th><th style={{ textAlign: 'right' }}>CREDIT</th>
              <th style={{ textAlign: 'right' }}>RENT</th><th style={{ textAlign: 'right' }}>BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.ts.slice(0, 10)}</td>
                <td>{r.receipt_no ? '#' + r.receipt_no : '\u2014'}</td>
                <td style={{ maxWidth: 280 }}>{r.particulars}</td>
                <td style={{ textAlign: 'right' }}>{r.debit ? fmtNum(r.debit) : ''}</td>
                <td style={{ textAlign: 'right' }}>{r.credit ? fmtNum(r.credit) : ''}</td>
                <td style={{ textAlign: 'right' }}>{r.rent ? fmtNum(r.rent) : ''}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{r.flagged ? 'EXCLUDED' : fmtNum(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 14, paddingTop: 8, borderTop: '2px solid #111', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
          <span>Total Outstanding</span>
          <span>PKR {fmtNum(balance)}</span>
        </div>
      </div>

      <div className="no-print" style={{ marginBottom: 16 }}>
        <PrintButton label="Print Statement" />
      </div>

      <div className="split">
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
                  <td className="num">{r.receipt_no ? `#${r.receipt_no}` : '\u2014'}</td>
                  <td style={{ maxWidth: 340 }}>{r.particulars}</td>
                  <td className="right num">{r.debit ? fmtNum(r.debit) : '\u2014'}</td>
                  <td className="right num stat-green">{r.credit ? fmtNum(r.credit) : '\u2014'}</td>
                  <td className="right num">{r.rent ? fmtNum(r.rent) : '\u2014'}</td>
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

        <div className="stack sm">
          <div className="card">
            <div className="card-title">EDIT CUSTOMER</div>
            <form action={editCustomer} className="stack sm">
              <input type="hidden" name="id" value={c.id} />
              <div className="field">
                <label>NAME</label>
                <input className="input" name="name" required defaultValue={c.name} />
              </div>
              <div className="field">
                <label>CONTACT</label>
                <input className="input" name="contact" defaultValue={c.contact ?? ''} />
              </div>
              {c.kind === 'ledger' && (
                <>
                  <div className="field">
                    <label>LEDGER PAGE REF</label>
                    <input className="input" name="manual_ledger_page" defaultValue={c.manual_ledger_page ?? ''} placeholder="Paper register page number" />
                  </div>
                  <div className="field">
                    <label>CREDIT LIMIT (PKR)</label>
                    <input className="input num" name="credit_limit" type="number" step="any"
                           defaultValue={c.credit_limit} />
                  </div>
                </>
              )}
              <button className="btn btn-primary btn-block">Save Changes</button>
            </form>
            {c.needs_review === 1 && (
              <div className="info-card warn" style={{ marginTop: 10 }}>
                <div>Updating the name will clear the <b>CHECK</b> badge.</div>
              </div>
            )}
          </div>

          {c.active ? (
            <div className="card" style={{ borderColor: 'var(--accent-red-solid)' }}>
              <div className="card-title" style={{ color: 'var(--accent-red-solid)' }}>DEACTIVATE</div>
              <p className="t-muted" style={{ fontSize: 12, marginBottom: 10 }}>
                Customer will no longer appear on billing screen. Existing entries preserved.
              </p>
              <form action={deactivateCustomerAction}>
                <input type="hidden" name="id" value={c.id} />
                <button className="btn btn-block" style={{
                  background: 'var(--accent-red-solid)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                }}>Deactivate Customer</button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ borderColor: 'var(--accent-green-solid)' }}>
              <div className="card-title" style={{ color: 'var(--accent-green-solid)' }}>REACTIVATE</div>
              <p className="t-muted" style={{ fontSize: 12, marginBottom: 10 }}>
                This customer is currently inactive. Reactivate to make them visible again.
              </p>
              <form action={reactivateCustomerAction}>
                <input type="hidden" name="id" value={c.id} />
                <button className="btn btn-block" style={{
                  background: 'var(--accent-green-solid)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                }}>Reactivate Customer</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
