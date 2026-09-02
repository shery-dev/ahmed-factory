import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBill } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { PrintButton } from '@/components/PrintButton';
import { VoidBillForm } from '../VoidBillForm';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function BillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bill = await getBill(Number(id));
  if (!bill) notFound();

  const settings = await getSettings();
  const isVoid = bill.status === 'void';
  const net = bill.subtotal + bill.rent - bill.credit;
  const wa = `https://wa.me/${(bill.contact ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(
    `${settings.factory_name}\nReceipt #${bill.receipt_no}\nTotal: PKR ${fmtNum(bill.subtotal + bill.rent)}\nPaid: PKR ${fmtNum(bill.credit)}\nBalance: PKR ${fmtNum(net)}`,
  )}`;

  return (
    <>
      <div className="row between no-print" style={{ marginBottom: 18 }}>
        <div className="panel-header" style={{ margin: 0 }}>
          <h2>
            Receipt #{bill.receipt_no}
            {isVoid && <span className="badge badge-red" style={{ marginInlineStart: 10, fontSize: 13 }}>VOID</span>}
          </h2>
          <p className="panel-desc">
            {bill.ts.slice(0, 16)} · {bill.customer_name}
            {isVoid && bill.note && <span style={{ color: 'var(--accent-red-solid)' }}> — {bill.note}</span>}
          </p>
        </div>
        <div className="row">
          <Link className="btn btn-ghost" href="/bills">← All bills</Link>
          {!isVoid && bill.contact && (
            <a className="btn btn-ghost" href={wa} target="_blank" rel="noreferrer">
              Send on WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="receipt" style={isVoid ? { opacity: 0.5 } : undefined}>
        <div className="receipt-head">
          <h3>{settings.factory_name}</h3>
          {settings.factory_name_ur && <div style={{ fontSize: 11, color: '#666', fontFamily: "'Noto Nastaliq Urdu', serif" }}>{settings.factory_name_ur}</div>}
          {settings.factory_address && <div style={{ fontSize: 10, color: '#888' }}>{settings.factory_address}</div>}
          {settings.factory_phone && <div style={{ fontSize: 10, color: '#888' }}>{settings.factory_phone}</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
          <div>
            <div><b>{bill.customer_name}</b> ({bill.customer_code})</div>
            {bill.contact && <div style={{ color: '#666' }}>{bill.contact}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>Receipt <b>#{bill.receipt_no}</b></div>
            <div style={{ color: '#666' }}>{bill.ts.slice(0, 10)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>ITEM</th><th style={{ textAlign: 'right' }}>RATE</th><th style={{ textAlign: 'right' }}>AMOUNT</th></tr>
          </thead>
          <tbody>
            {bill.lines.map((l: any) => (
              <tr key={l.id}>
                <td>{l.description}</td>
                <td style={{ textAlign: 'right' }}>{fmtNum(l.rate)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtNum(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 14, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal / میزان</span><span>{fmtNum(bill.subtotal)}</span>
          </div>
          {bill.rent > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Rent / کرایہ</span><span>{fmtNum(bill.rent)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Paid / ادا شدہ ({bill.credit_method ?? '—'})</span><span>{fmtNum(bill.credit)}</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', fontWeight: 700,
            fontSize: 15, borderTop: '2px solid #111', paddingTop: 7, marginTop: 4,
          }}>
            <span>Balance / بقایا</span><span>PKR {fmtNum(net)}</span>
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 10, color: '#888', textAlign: 'center' }}>
          شکریہ — Thank you for your business
        </div>
      </div>

      {!isVoid && (
        <div className="card no-print" style={{ marginTop: 20, borderColor: 'var(--accent-red-solid)' }}>
          <div className="card-title" style={{ color: 'var(--accent-red-solid)' }}>VOID THIS BILL</div>
          <p className="t-muted" style={{ fontSize: 12, marginBottom: 10 }}>
            Voiding reverses the stock movements and ledger entry, keeps the receipt number
            consumed (gaps in the sequence are correct and auditable). <b>This cannot be undone.</b>
            The original bill remains visible, marked void.
          </p>
          <VoidBillForm billId={bill.id} />
        </div>
      )}

      <PrintButton />
    </>
  );
}
