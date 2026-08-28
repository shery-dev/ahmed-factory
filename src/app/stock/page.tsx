import { dbAll } from '@/lib/db';
import { listStock, listItemTypes } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { PanelHeader } from '@/components/PanelHeader';
import { receiveDelivery, postPhysicalCount } from './actions';

export const dynamic = 'force-dynamic';

export default async function StockPage({
  searchParams,
}: { searchParams: Promise<{ unit?: string }> }) {
  const { unit = 'roll' } = await searchParams;
  const rows = await listStock(unit);
  const movements = await dbAll<any>(
    `SELECT m.*, t.name_en FROM stock_movements m
     LEFT JOIN item_types t ON t.id = m.item_type_id
     ORDER BY m.id DESC LIMIT 15`,
  );

  const items = await listItemTypes();
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

        <div className="stack sm">
          <div className="card">
            <div className="card-title">RECEIVE DELIVERY</div>
            <form action={receiveDelivery} className="stack sm">
              <div className="field">
                <label>PRODUCT</label>
                <select className="select" name="itemTypeId" required>
                  <option value="">— Select —</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.name_en}</option>
                  ))}
                </select>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>SIZE (inches)</label>
                  <input className="input num" name="size" type="number" required placeholder="e.g. 36" />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>UNIT</label>
                  <select className="select" name="unit" defaultValue={unit}>
                    <option value="roll">Rolls</option>
                    <option value="reel">Kg (Reel)</option>
                    <option value="tota">Kg (Tota)</option>
                  </select>
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>QUANTITY</label>
                  <input className="input num" name="quantity" type="number" step="any" required />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>RATE (PKR)</label>
                  <input className="input num" name="rate" type="number" step="any" defaultValue={0} />
                </div>
              </div>
              <div className="field">
                <label>VENDOR / NOTE</label>
                <input className="input" name="note" placeholder="Optional" />
              </div>
              <button className="btn btn-primary btn-block">Record Delivery</button>
            </form>
          </div>

          <div className="card">
            <div className="card-title">PHYSICAL COUNT</div>
            <p className="t-muted" style={{ fontSize: 12, marginBottom: 10 }}>
              Set the true quantity after a physical count. Every change is traced
              to who entered it and why — no silent overwrites.
            </p>
            <form action={postPhysicalCount} className="stack sm">
              <div className="field">
                <label>PRODUCT</label>
                <select className="select" name="itemTypeId" required>
                  <option value="">— Select —</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.name_en}</option>
                  ))}
                </select>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>SIZE (inches)</label>
                  <input className="input num" name="size" type="number" required />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>UNIT</label>
                  <select className="select" name="unit" defaultValue={unit}>
                    <option value="roll">Rolls</option>
                    <option value="reel">Kg (Reel)</option>
                    <option value="tota">Kg (Tota)</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>COUNTED QUANTITY</label>
                <input className="input num" name="newQuantity" type="number" step="any" required />
              </div>
              <div className="field">
                <label>REASON (MANDATORY)</label>
                <input className="input" name="reason" required
                       placeholder="e.g. Physical count — monthly audit" />
              </div>
              <button className="btn btn-block" style={{
                background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
              }}>Post Count</button>
            </form>
          </div>

          <div className="card">
            <div className="card-title">RECENT MOVEMENTS</div>
            {movements.length === 0 ? (
              <div className="empty">No movements yet</div>
            ) : (
              <div className="log-body">
                {movements.map((m) => (
                  <div key={m.id} className={`log-entry ${
                    m.direction === 'out' ? 'log-warn'
                    : m.direction === 'adjust' ? 'log-error'
                    : 'log-success'}`}>
                    <span className="log-time">{String(m.ts).slice(11, 16)}</span>
                    <span style={{ minWidth: 0 }}>
                      <span className="log-msg">
                        {m.direction === 'out' ? '−' : m.direction === 'adjust' ? '±' : '+'}
                        {fmtNum(m.quantity)} {m.unit} · {m.name_en} {m.size}&quot;
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
      </div>
    </>
  );
}
