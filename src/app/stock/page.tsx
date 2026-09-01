import { dbAll } from '@/lib/db';
import { listStock, stockSummary, listItemTypes } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { PanelHeader } from '@/components/PanelHeader';
import { receiveDelivery, postPhysicalCount } from './actions';

export const dynamic = 'force-dynamic';

export default async function StockPage({
  searchParams,
}: { searchParams: Promise<{ unit?: string; search?: string; view?: string }> }) {
  const { unit = 'roll', search = '', view = 'detail' } = await searchParams;
  const rows = view === 'combined' ? [] : await listStock({ unit, search: search || undefined });
  const summary = view === 'combined' ? await stockSummary(search || undefined) : [];
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

      <form className="row wrap" style={{ gap: 8, marginBottom: 12 }} method="get">
        <input className="input" name="search" defaultValue={search} placeholder="Search product name..." style={{ flex: '1 1 200px' }} />
        <input type="hidden" name="view" value={view} />
        {view !== 'combined' && <input type="hidden" name="unit" value={unit} />}
        <button className="btn btn-ghost" type="submit" style={{ padding: '6px 14px' }}>Search</button>
        {search && <a className="btn btn-ghost" href={`/stock?unit=${unit}&view=${view}`} style={{ padding: '6px 14px' }}>Clear</a>}
      </form>

      <div className="tabs">
        {(['roll', 'reel', 'tota'] as const).map((u) => (
          <a key={u} href={`/stock?unit=${u}&view=detail`} className={`tab ${unit === u && view === 'detail' ? 'active' : ''}`}>
            {u === 'roll' ? 'Rolls' : u === 'reel' ? 'Reels' : 'Totay'}
          </a>
        ))}
        <a href={`/stock?view=combined&search=${search}`} className={`tab ${view === 'combined' ? 'active' : ''}`}>
          Combined View
        </a>
      </div>

      {view === 'combined' ? (
        <>
          <div className="grid grid-3" style={{ marginBottom: 20 }}>
            <div className="card tight">
              <div className="card-title">PRODUCTS</div>
              <div className="stat-big num">{summary.length}</div>
            </div>
            <div className="card tight">
              <div className="card-title">TOTAL ROLLS</div>
              <div className="stat-big stat-accent num">{fmtNum(summary.reduce((s, r) => s + r.total_roll, 0))}</div>
            </div>
            <div className="card tight">
              <div className="card-title">LOW STOCK LINES</div>
              <div className={`stat-big num ${summary.reduce((s,r) => s + r.low, 0) > 0 ? 'stat-red' : ''}`}>
                {summary.reduce((s, r) => s + r.low, 0)}
              </div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PRODUCT</th><th className="right">ROLLS</th>
                  <th className="right">REELS (KG)</th><th className="right">TOTAY (KG)</th>
                  <th className="right">LINES</th><th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((r) => (
                  <tr key={r.item_type_id}>
                    <td className="t-strong">{r.name_en}</td>
                    <td className="right num">{fmtNum(r.total_roll)}</td>
                    <td className="right num">{fmtNum(r.total_reel_kg)}</td>
                    <td className="right num">{fmtNum(r.total_tota_kg)}</td>
                    <td className="right num t-muted">{r.lines}</td>
                    <td>
                      {r.low > 0
                        ? <span className="badge badge-yellow">{r.low} LOW</span>
                        : <span className="badge badge-green">OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
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
            </div>
            <div className="card tight">
              <div className="card-title">AT OR BELOW 5</div>
              <div className="stat-big num">{rows.filter((r) => r.quantity <= 5 && !r.flagged).length}</div>
            </div>
          </div>

          <div className="table-wrap" style={{ maxHeight: 620, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr><th>PRODUCT</th><th className="right">SIZE</th><th className="right">ON HAND</th><th className="right">RATE</th><th></th></tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={5} className="t-muted" style={{ textAlign: 'center', padding: 24 }}>No stock items match</td></tr>
                ) : rows.map((r) => (
                  <tr key={r.id}>
                    <td className="t-strong">{r.name_en}</td>
                    <td className="right num">{r.size}&quot;</td>
                    <td className="right num t-strong">{fmtNum(r.quantity)}</td>
                    <td className="right num t-muted">{r.rate ? fmtNum(r.rate) : '\u2014'}</td>
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
        </>
      )}

      <div className="split" style={{ marginTop: 20 }}>
        <div></div>
        <div className="stack sm">
          <div className="card">
            <div className="card-title">RECEIVE DELIVERY</div>
            <form action={receiveDelivery} className="stack sm">
              <div className="field">
                <label>PRODUCT</label>
                <select className="select" name="itemTypeId" required>
                  <option value="">\u2014 Select \u2014</option>
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
            <form action={postPhysicalCount} className="stack sm">
              <div className="field">
                <label>PRODUCT</label>
                <select className="select" name="itemTypeId" required>
                  <option value="">\u2014 Select \u2014</option>
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
                <input className="input" name="reason" required placeholder="e.g. Physical count" />
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
                        {m.direction === 'out' ? '\u2212' : m.direction === 'adjust' ? '\u00b1' : '+'}
                        {fmtNum(m.quantity)} {m.unit} \u00b7 {m.name_en} {m.size}&quot;
                      </span>
                      <span className="log-detail">
                        {m.note}{m.ref_type === 'bill' ? ` \u00b7 bill #${m.ref_id}` : ''}
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
