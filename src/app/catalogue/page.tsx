import Link from 'next/link';
import { Layers, Plus } from 'lucide-react';
import { listItemTypes, type ItemType } from '@/lib/repo';
import { addProduct, changeRate, toggleProductActive } from './actions';

export const dynamic = 'force-dynamic';

interface FamilyGroup { moti: ItemType | null; bareek: ItemType | null }

export default async function CataloguePage({
  searchParams,
}: { searchParams: Promise<{ search?: string; show_inactive?: string; addFamily?: string; addBareek?: string }> }) {
  const { search = '', show_inactive = '', addFamily = '', addBareek = '' } = await searchParams;
  const items = await listItemTypes({
    activeOnly: show_inactive !== '1',
    search: search || undefined,
  });

  // Grouped the same way Stock groups them — one card per paper family, moti
  // and bareek side by side — rather than a flat table where the family
  // column just repeats itself down every other row.
  const families = new Map<string, FamilyGroup>();
  for (const it of items) {
    const g = families.get(it.family) ?? { moti: null, bareek: null };
    if (it.is_bareek) g.bareek = it; else g.moti = it;
    families.set(it.family, g);
  }

  return (
    <>
      <div className="panel-header">
        <div className="panel-header-row">
          <h2>Catalogue</h2>
          <span className="t-muted" style={{ fontSize: 12.5 }}>{items.length} paper types</span>
        </div>
      </div>

      <form className="row wrap" style={{ gap: 8, marginBottom: 18 }} method="get">
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

      {families.size === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <p className="t-muted">No products match.</p>
        </div>
      ) : (
        <div className="cat-family-grid" style={{ marginBottom: 24 }}>
          {[...families].map(([family, g]) => (
            <div key={family} className="family-card">
              <div className="family-head">
                <span className="icon-badge neutral"><Layers size={13} /></span>
                <span className="family-name" style={{ cursor: 'default' }}>{family}</span>
              </div>
              <CatalogueRow item={g.moti} family={family} label="Moti" bareek={false} />
              <CatalogueRow item={g.bareek} family={family} label="Bareek" bareek />
            </div>
          ))}
        </div>
      )}

      <div className="card" id="add-product">
        <div className="card-title">ADD A PRODUCT</div>
        <form action={addProduct} className="cat-add-form">
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
            <input className="input" name="family" placeholder="e.g. White Top Liner" defaultValue={addFamily} />
          </div>
          <div className="field">
            <label>DEFAULT RATE (PKR)</label>
            <input className="input num" name="default_rate" type="number" step="any" defaultValue={0} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>DESCRIPTION</label>
            <input className="input" name="description_en" placeholder="What it is used for" />
          </div>
          <label className="row" style={{ gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <input type="checkbox" name="is_bareek" defaultChecked={addBareek === '1'} /> Bareek (thin) variant
          </label>
          <button className="btn btn-primary" style={{ justifySelf: 'start', padding: '9px 22px' }}>
            Add to Catalogue
          </button>
        </form>
      </div>
    </>
  );
}

function CatalogueRow({ item, family, label, bareek }: {
  item: ItemType | null; family: string; label: string; bareek: boolean;
}) {
  if (!item) {
    return (
      <Link href={`?addFamily=${encodeURIComponent(family)}&addBareek=${bareek ? '1' : '0'}#add-product`}
            className="cat-row cat-row-empty">
        <span className={`thickness-tag ${bareek ? 'is-bareek' : ''}`}>{label}</span>
        <span className="cat-row-empty-label"><Plus size={13} /> Add {label.toLowerCase()} variant</span>
      </Link>
    );
  }
  return (
    <div className={`cat-row ${item.active ? '' : 'cat-row-inactive'}`}>
      <div className="cat-row-top">
        <span className={`thickness-tag ${bareek ? 'is-bareek' : ''}`}>{label}</span>
        <span className="cat-row-name">{item.name_en}</span>
        <span className="cat-row-urdu">{item.name_ur}</span>
        <span className={`badge ${item.active ? 'badge-green' : 'badge-muted'}`}>
          {item.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>
      {item.description_en && (
        <div className="cat-row-desc">
          {item.description_en.length > 130 ? `${item.description_en.slice(0, 130)}…` : item.description_en}
        </div>
      )}
      <div className="cat-row-actions">
        <form action={changeRate} className="row" style={{ gap: 6, alignItems: 'center' }}>
          <input type="hidden" name="id" value={item.id} />
          <span className="t-muted" style={{ fontSize: 11 }}>PKR</span>
          <input className="input num" name="rate" type="number" step="any"
                 defaultValue={item.default_rate} style={{ width: 76, padding: '5px 8px' }} />
          <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 11 }}>Set</button>
        </form>
        <form action={toggleProductActive}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="active" value={item.active} />
          <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }}
                  title={item.active ? 'Deactivate' : 'Reactivate'}>
            {item.active ? 'Deactivate' : 'Activate'}
          </button>
        </form>
      </div>
    </div>
  );
}
