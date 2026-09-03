'use client';

import { useState } from 'react';
import { fmtNum } from '@/lib/i18n';
import { StockAdjustPopup } from './StockAdjustPopup';
import { RateEditPopup } from './RateEditPopup';

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
  const [adjustingLine, setAdjustingLine] = useState<StockLine | null>(null);
  const [editingRateLine, setEditingRateLine] = useState<StockLine | null>(null);
  const modalOpen = !!adjustingLine || !!editingRateLine;

  const status = group.flaggedCount > 0 ? 'quarantined'
    : group.outCount > 0 ? 'out'
    : group.lowCount > 0 ? 'low'
    : 'ok';

  return (
    <div
      className={`stock-card stock-card--${status}`}
      onMouseEnter={() => !modalOpen && setHovered(true)}
      onMouseLeave={() => !modalOpen && setHovered(false)}
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
            const canAdjust = !l.flagged;
            return (
              <div
                key={l.id}
                className={`stock-card__row stock-card__row--${lineStatus}`}
                onClick={() => canAdjust && setAdjustingLine(l)}
                style={{
                  cursor: canAdjust ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (canAdjust) (e.currentTarget as HTMLElement).style.background = 'var(--bg-main)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                <span className="stock-card__size num">{l.size}&quot;</span>
                <span className="stock-card__qty num">{fmtNum(l.quantity)}</span>
                {l.rate > 0 && (
                  <span
                    className="stock-card__rate num"
                    onClick={(e) => { e.stopPropagation(); if (canAdjust) setEditingRateLine(l); }}
                    style={{ cursor: canAdjust ? 'pointer' : 'default', textDecoration: canAdjust ? 'underline dotted' : 'none' }}
                    title={canAdjust ? 'Click to edit rate' : undefined}
                  >
                    @{fmtNum(l.rate)}
                  </span>
                )}
                <span className={`stock-card__dot stock-card__dot--${lineStatus}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Quantity adjust modal */}
      {adjustingLine && (
        <StockAdjustPopup
          stockId={adjustingLine.id}
          currentQty={adjustingLine.quantity}
          unitLabel={unitLabel}
          sizeLabel={`${adjustingLine.size}"`}
          productName={group.name}
          onClose={() => setAdjustingLine(null)}
        />
      )}

      {/* Rate edit modal */}
      {editingRateLine && (
        <RateEditPopup
          stockId={editingRateLine.id}
          currentRate={editingRateLine.rate}
          sizeLabel={`${editingRateLine.size}"`}
          productName={group.name}
          onClose={() => setEditingRateLine(null)}
        />
      )}
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
