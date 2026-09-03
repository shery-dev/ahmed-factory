'use client';

import { useState } from 'react';
import { fmtNum } from '@/lib/i18n';
import { StockAdjustPopup } from './StockAdjustPopup';

interface StockLine {
  id: number; size: number; unit: string; quantity: number; rate: number;
  flagged: number; flag_reason: string | null;
}

interface ProductGroup {
  name: string;
  lines: StockLine[];
  totalQty: number;
  lowCount: number;
  outCount: number;
  flaggedCount: number;
}

function StockCard({ group, unitLabel }: { group: ProductGroup; unitLabel: string }) {
  const [hovered, setHovered] = useState(false);
  const [adjustingId, setAdjustingId] = useState<number | null>(null);

  const status = group.flaggedCount > 0 ? 'quarantined'
    : group.outCount > 0 ? 'out'
    : group.lowCount > 0 ? 'low'
    : 'ok';

  return (
    <div
      className={`stock-card stock-card--${status}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="stock-card__header">
        <div className="stock-card__name">{group.name}</div>
        <div className="stock-card__stats">
          <div className="stock-card__total num">{fmtNum(group.totalQty)}</div>
          <div className="stock-card__unit">{unitLabel}</div>
        </div>
      </div>
      <div className="stock-card__meta">
        <span className={`stock-card__badge stock-card__badge--${status}`}>
          {status === 'ok' ? 'OK' : status === 'low' ? 'LOW' : status === 'out' ? 'OUT' : 'QUARANTINED'}
        </span>
        <span className="stock-card__count">{group.lines.length} sizes</span>
      </div>
      <div className={`stock-card__expand ${hovered ? 'stock-card__expand--open' : ''}`}>
        <div className="stock-card__divider" />
        <div className="stock-card__list">
          {group.lines.map((l) => {
            const lineStatus = l.flagged ? 'quarantined' : l.quantity <= 0 ? 'out' : l.quantity <= 5 ? 'low' : 'ok';
            return (
              <div key={l.id} className={`stock-card__row stock-card__row--${lineStatus}`} style={{ position: 'relative' }}>
                <span className="stock-card__size num">{l.size}&quot;</span>
                <span
                  className="stock-card__qty num"
                  onClick={() => hovered && !l.flagged && setAdjustingId(l.id)}
                  style={{ cursor: hovered && !l.flagged ? 'pointer' : 'default', textDecoration: hovered && !l.flagged ? 'underline' : 'none' }}
                  title={hovered && !l.flagged ? 'Click to adjust stock' : undefined}
                >
                  {fmtNum(l.quantity)}
                </span>
                {l.rate > 0 && <span className="stock-card__rate num">@{fmtNum(l.rate)}</span>}
                <span className={`stock-card__dot stock-card__dot--${lineStatus}`} />
                {adjustingId === l.id && (
                  <StockAdjustPopup
                    stockId={l.id}
                    currentQty={l.quantity}
                    unitLabel={unitLabel}
                    onClose={() => setAdjustingId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function StockCardGroup({
  groups, unitLabel,
}: {
  groups: ProductGroup[];
  unitLabel: string;
}) {
  return (
    <div className="stock-grid">
      {groups.map((g) => (
        <StockCard key={g.name} group={g} unitLabel={unitLabel} />
      ))}
    </div>
  );
}
