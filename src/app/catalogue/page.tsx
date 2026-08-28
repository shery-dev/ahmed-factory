import { listItemTypes } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { addProduct, changeRate } from './actions';

export const dynamic = 'force-dynamic';

export default async function CataloguePage() {
  const items = await listItemTypes(false);
  return (
    <>
      <div className="panel-header">
        <h2>Catalogue</h2>
        <p className="panel-desc">
          The 2022 system hardcoded these product names <b>364 times across four
          source files</b>, so adding one meant a multi-day edit with a real chance
          of missing a branch. Here they are rows in a table. Add one below and it
          appears on the billing screen immediately — no code change, no deploy.
        </p>
      </div>

      <div className="split">
        <div className="table-wrap" style={{ maxHeight: 640, overflowY: 'auto' }}>
          <table>
            <thead>
              <tr><th>PRODUCT</th><th>URDU</th><th>FAMILY</th><th className="right">RATE (PKR)</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>
                    <span className="t-strong">{i.name_en}</span>
                    {i.is_bareek === 1 && (
                      <span className="badge badge-blue" style={{ marginInlineStart: 8 }}>BAREEK</span>
                    )}
                    {i.description_en && (
                      <div className="t-muted" style={{ maxWidth: 380, marginTop: 3 }}>
                        {i.description_en.slice(0, 110)}{i.description_en.length > 110 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: 2 }}>{i.name_ur}</td>
                  <td className="t-muted">{i.family}</td>
                  <td className="right num t-strong">{fmtNum(i.default_rate)}</td>
                  <td className="right">
                    <form action={changeRate} className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                      <input type="hidden" name="id" value={i.id} />
                      <input className="input num" name="rate" type="number" step="any"
                             defaultValue={i.default_rate} style={{ width: 78, padding: '4px 8px' }} />
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>Set</button>
                    </form>
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
          <div className="info-card good" style={{ marginTop: 14 }}>
            <div>
              This is the acceptance test from the Scope of Work: <b>a new product must
              be addable in under a minute with no code change.</b> New products are
              coming, so this had to be data from the start.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
