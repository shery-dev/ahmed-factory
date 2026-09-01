import { listItemTypes } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { addProduct, changeRate, toggleProductActive } from './actions';

export const dynamic = 'force-dynamic';

export default async function CataloguePage({
  searchParams,
}: { searchParams: Promise<{ search?: string; show_inactive?: string }> }) {
  const { search = '', show_inactive = '' } = await searchParams;
  const items = await listItemTypes({
    activeOnly: show_inactive !== '1',
    search: search || undefined,
  });

  return (
    <>
      <div className="panel-header">
        <h2>Catalogue</h2>
        <p className="panel-desc">
          Products are data rows, not hardcoded values. Add a product and it appears
          on the billing screen immediately.
        </p>
      </div>

      <form className="row wrap" style={{ gap: 8, marginBottom: 16 }} method="get">
        <input className="input" name="search" defaultValue={search} placeholder="Search product name, code, family..." style={{ flex: '1 1 220px' }} />
        <label className="row" style={{ gap: 6, fontSize: 12, color: 'var(--text-muted)', alignItems: 'center' }}>
          <input type="checkbox" name="show_inactive" value="1" defaultChecked={show_inactive === '1'} />
          Show inactive
        </label>
        <button className="btn btn-ghost" type="submit" style={{ padding: '6px 14px' }}>Filter</button>
        {(search || show_inactive) && (
          <a className="btn btn-ghost" href="/catalogue" style={{ padding: '6px 14px' }}>Clear</a>
        )}
      </form>

      <div className="split">
        <div className="table-wrap" style={{ maxHeight: 640, overflowY: 'auto' }}>
          <table>
            <thead>
              <tr><th>PRODUCT</th><th>URDU</th><th>FAMILY</th><th className="right">RATE (PKR)</th><th>STATUS</th><th></th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} className="t-muted" style={{ textAlign: 'center', padding: 24 }}>No products match</td></tr>
              ) : items.map((i) => (
                <tr key={i.id} style={{ opacity: i.active ? 1 : 0.5 }}>
                  <td>
                    <span className="t-strong">{i.name_en}</span>
                    {i.is_bareek === 1 && (
                      <span className="badge badge-blue" style={{ marginInlineStart: 8 }}>BAREEK</span>
                    )}
                    {i.description_en && (
                      <div className="t-muted" style={{ maxWidth: 380, marginTop: 3 }}>
                        {i.description_en.slice(0, 110)}{i.description_en.length > 110 ? '...' : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: 2 }}>{i.name_ur}</td>
                  <td className="t-muted">{i.family}</td>
                  <td className="right num t-strong">{fmtNum(i.default_rate)}</td>
                  <td>
                    {i.active
                      ? <span className="badge badge-green">ACTIVE</span>
                      : <span className="badge badge-muted">INACTIVE</span>}
                  </td>
                  <td className="right">
                    <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      <form action={changeRate} className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                        <input type="hidden" name="id" value={i.id} />
                        <input className="input num" name="rate" type="number" step="any"
                               defaultValue={i.default_rate} style={{ width: 78, padding: '4px 8px' }} />
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>Set</button>
                      </form>
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={i.id} />
                        <input type="hidden" name="active" value={i.active} />
                        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10 }}
                                title={i.active ? 'Deactivate' : 'Reactivate'}>
                          {i.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">ADD A PRODUCT</div>
          <form action={addProduct} className="stack sm">
            <div className="field">
              <label>NAME (ENGLISH)</label>
              <input className="input" name="name_en" required placeholder="e.g. White Top Liner" />
            </div>
            <div className="field">
              <label>NAME (URDU)</label>
              <input className="input" name="name_ur" placeholder="وائٹ ٹاپ لائنر"
                     style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }} />
            </div>
            <div className="field">
              <label>FAMILY</label>
              <input className="input" name="family" placeholder="e.g. White Top Liner" />
            </div>
            <div className="field">
              <label>DEFAULT RATE (PKR)</label>
              <input className="input num" name="default_rate" type="number" step="any" defaultValue={0} />
            </div>
            <div className="field">
              <label>DESCRIPTION</label>
              <input className="input" name="description_en" placeholder="What it is used for" />
            </div>
            <label className="row" style={{ gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <input type="checkbox" name="is_bareek" /> Bareek (thin) variant
            </label>
            <button className="btn btn-primary btn-block">Add to Catalogue</button>
          </form>
        </div>
      </div>
    </>
  );
}
