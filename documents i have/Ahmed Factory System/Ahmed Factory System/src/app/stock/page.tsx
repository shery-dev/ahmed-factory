import { db } from '@/lib/db';
import { listStock } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { PanelHeader } from '@/components/PanelHeader';

export const dynamic = 'force-dynamic';

export default async function StockPage({
  searchParams,
}: { searchParams: Promise<{ unit?: string }> }) {
  const { unit = 'roll' } = await searchParams;
  const rows = listStock(unit);
  const movements = db.prepare(
    `SELECT m.*, t.name_en FROM stock_movements m
     LEFT JOIN item_types t ON t.id = m.item_type_id
     ORDER BY m.id DESC LIMIT 15`,
  ).all() as any[];

  const totalUnits = rows.reduce((s, r) => s + r.quantity, 0);
  const flagged = rows.filter((r) => r.flagged).length;

  return (
    <>
      <PanelHeader title="stock" desc="stockDesc" />

      <div className="tabs">
        {(['roll', 'reel', 'tota'] as const).map((u) => (
          <a key={u} href={`/stock?unit=${u}`} className={`tab ${unit === u ? 'active' : ''}`}>
            {u === 'roll' ? 'Rolls' : u === 'reel' ? 'Reels' : 'Totay'}
          </a>
        ))}
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card tight">
          <div className="card-title">LINES</div>
          <div className="stat-big num">{rows.length}</div>
        </div>
        <div className="card tight">
          <div className="card-title">TOTAL {unit === 'roll' ? 'ROLLS' : 'KG'}</div>
          <div className="stat-big stat-accent num">{fmtNum(totalUnits)}</div>
        </div>
        <div className="card tight">
          <div className="card-title">QUARANTINED</div>
          <div className={`stat-big num ${flagged ? 'stat-red' : ''}`}>{flagged}</div>
          <div className="stat-sub">Failed import sanity check</div>
        </div>
        <div className="card tight">
          <div className="card-title">AT OR BELOW 5</div>
          <div className="stat-big num">{rows.filter((r) => r.quantity <= 5 && !r.flagged).length}</div>
        </div>
      </div>

      <div className="split">
        <div className="table-wrap" style={{ maxHeight: 620, overflowY: 'auto' }}>
          <table>
            <thead>
              <tr><th>PRODUCT</th><th className="right">SIZE</th><th className="right">ON HAND</th><th className="right">RATE</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="t-strong">{r.name_en}</td>
                  <td className="right num">{r.size}&quot;</td>
                  <td className="right num t-strong">{fmtNum(r.quantity)}</td>
                  <td className="right num t-muted">{r.rate ? fmtNum(r.rate) : '—'}</td>
                  <td className="right">
                    {r.flagged
                      ? <span className="badge badge-red" title={r.flag_reason ?? ''}>QUARANTINED</span>
                      : r.quantity <= 0 ? <span className="badge badge-red">OUT</span>
                      : r.quantity <= 5 ? <span className="badge badge-yellow">LOW</span>
                      : <span className="badge badge-green">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">RECENT MOVEMENTS</div>
          {movements.length === 0 ? (
            <div className="empty">No movements yet</div>
          ) : (
            <div className="log-body">
              {movements.map((m) => (
                <div key={m.id} className={`log-entry ${m.direction === 'out' ? 'log-warn' : 'log-success'}`}>
                  <span className="log-time">{String(m.ts).slice(11, 16)}</span>
                  <span style={{ minWidth: 0 }}>
                    <span className="log-msg">
                      {m.direction === 'out' ? '−' : '+'}{fmtNum(m.quantity)} {m.unit} · {m.name_en} {m.size}&quot;
                    </span>
                    <span className="log-detail">
                      {m.note}{m.ref_type === 'bill' ? ` · bill #${m.ref_id}` : ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
