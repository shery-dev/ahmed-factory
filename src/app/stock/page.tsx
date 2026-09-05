import Link from 'next/link';
import { Tags } from 'lucide-react';
import { familyStock, listWasteStock } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { PanelHeader } from '@/components/PanelHeader';
import { StockHome } from '@/components/StockHome';
import { receiveWasteDelivery } from './actions';

export const dynamic = 'force-dynamic';

export default async function StockPage({
  searchParams,
}: { searchParams: Promise<{ unit?: string; filter?: string; view?: string }> }) {
  const { unit = 'roll', filter = 'all', view = 'stock' } = await searchParams;
  const isWaste = view === 'waste';

  const families = isWaste ? [] : await familyStock(unit);
  const wasteStock = isWaste ? await listWasteStock() : [];
  const wasteMap = new Map(wasteStock.map((w) => [w.category, w.total_kg]));
  const wasteTotal = wasteStock.reduce((s, w) => s + w.total_kg, 0);

  return (
    <>
      <PanelHeader
        title="stock"
        action={
          <Link href="/catalogue" className="btn btn-ghost" style={{ fontSize: 12.5 }}>
            <Tags size={15} /> Manage paper types
          </Link>
        }
      />

      <div style={{ marginBottom: 8 }}>
        <a className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} href="/api/export?type=stock">Export Stock CSV</a>
      </div>

      <div className="tabs">
        <a href={`/stock?unit=${unit}&filter=${filter}`} className={`tab ${!isWaste ? 'active' : ''}`}>Stock</a>
        <a href="/stock?view=waste" className={`tab ${isWaste ? 'active' : ''}`}>Waste &amp; Scrap</a>
      </div>

      {isWaste ? (
        <>
          <div className="grid grid-4" style={{ marginBottom: 20 }}>
            <div className="card tight">
              <div className="card-title">TOTAL KG</div>
              <div className="stat-big stat-accent num">{fmtNum(wasteTotal)}</div>
            </div>
            {(['jutta', 'raddi', 'nali'] as const).map((cat) => (
              <div key={cat} className="card tight">
                <div className="card-title">{cat.toUpperCase()}</div>
                <div className="stat-big num">{fmtNum(wasteMap.get(cat) ?? 0)}</div>
                <div className="stat-sub">kg on hand</div>
              </div>
            ))}
          </div>

          <div className="split">
            <div>
              <div className="card">
                <div className="card-title">WASTE &amp; SCRAP INVENTORY</div>
                <div className="table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
                  <table>
                    <thead>
                      <tr><th>CATEGORY</th><th className="right">ON HAND (KG)</th></tr>
                    </thead>
                    <tbody>
                      {(['jutta', 'raddi', 'nali'] as const).map((cat) => (
                        <tr key={cat}>
                          <td className="t-strong">{cat.charAt(0).toUpperCase() + cat.slice(1)}</td>
                          <td className="right num">{fmtNum(wasteMap.get(cat) ?? 0)}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid var(--border)' }}>
                        <td className="t-strong">TOTAL</td>
                        <td className="right num t-strong">{fmtNum(wasteTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">RECEIVE WASTE DELIVERY</div>
              <form action={receiveWasteDelivery} className="stack sm">
                <div className="field">
                  <label>CATEGORY</label>
                  <select className="select" name="category" required>
                    <option value="jutta">Jutta (Scrap)</option>
                    <option value="raddi">Raddi (Waste)</option>
                    <option value="nali">Nali (Edge Trim)</option>
                  </select>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>QUANTITY (KG)</label>
                    <input className="input num" name="quantity" type="number" step="any" required />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>RATE (PKR/KG)</label>
                    <input className="input num" name="rate" type="number" step="any" defaultValue={0} />
                  </div>
                </div>
                <div className="field">
                  <label>VENDOR / NOTE</label>
                  <input className="input" name="note" placeholder="Optional" />
                </div>
                <button className="btn btn-primary btn-block">Record Waste Delivery</button>
              </form>
            </div>
          </div>
        </>
      ) : (
        <StockHome unit={unit} filter={filter} families={families} />
      )}
    </>
  );
}
