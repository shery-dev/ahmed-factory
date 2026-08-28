import Link from 'next/link';
import { listBills } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default function BillsPage() {
  const bills = listBills(200);
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
      {bills.length === 0 ? (
        <div className="card"><div className="empty">No bills yet — raise one from New Bill.</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>RECEIPT</th><th>DATE</th><th>CUSTOMER</th><th>TYPE</th>
                <th className="right">LINES</th><th className="right">SUBTOTAL</th>
                <th className="right">PAID</th><th></th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id}>
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
    </>
  );
}
