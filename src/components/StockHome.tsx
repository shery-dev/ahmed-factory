'use client';

import Link from 'next/link';
import { Layers, ChevronRight } from 'lucide-react';
import { useUi } from './Shell';
import { fmtNum, type DictKey } from '@/lib/i18n';
import type { FamilyStock, TypeStockSummary } from '@/lib/repo';
import { UnitIcon } from './UnitIcon';
import { StatusBadge, StatusIcon, type Status } from './StatusBadge';
import { EmptyState } from './EmptyState';

/**
 * Stock home — one card per paper family, each split into moti and bareek.
 *
 * The screen this replaced rendered the stock table exactly as the database
 * stores it: 576 rows, every product interleaved with every other, no grouping
 * and no way in. Nobody on the floor asks "show me all stock". They ask for one
 * paper, in one thickness, in one width, which is the order these screens now
 * follow: family → thickness → size.
 */

const UNITS: Array<{ key: 'roll' | 'reel' | 'tota'; label: DictKey }> = [
  { key: 'roll', label: 'rolls' },
  { key: 'reel', label: 'reels' },
  { key: 'tota', label: 'totay' },
];

export function StockHome({
  unit, filter, families,
}: {
  unit: string;
  filter: string;
  families: FamilyStock[];
}) {
  const { tr } = useUi();

  const attention = families.filter((f) => f.low + f.out + f.flagged > 0);
  const shown = filter === 'attention' ? attention : families;

  const totals = families.reduce(
    (a, f) => ({
      sizes: a.sizes + f.sizes, low: a.low + f.low,
      out: a.out + f.out, flagged: a.flagged + f.flagged,
    }),
    { sizes: 0, low: 0, out: 0, flagged: 0 },
  );

  return (
    <>
      <div className="control-bar">
        <div className="control-row">
          <span className="control-label">{tr('unit')}</span>
          {UNITS.map((u) => (
            <Link
              key={u.key}
              href={`/stock?unit=${u.key}${filter === 'attention' ? '&filter=attention' : ''}`}
              className={`control-btn ${unit === u.key ? 'active' : ''}`}
            >
              <UnitIcon unit={u.key} />
              {tr(u.label)}
            </Link>
          ))}
        </div>
        <div className="control-divider" />
        <div className="control-row">
          <span className="control-label">{tr('allProducts')}</span>
          <Link href={`/stock?unit=${unit}`}
                className={`control-btn ${filter !== 'attention' ? 'active' : ''}`}>
            {tr('allProducts')}
          </Link>
          <Link href={`/stock?unit=${unit}&filter=attention`}
                className={`control-btn ${filter === 'attention' ? 'active' : ''}`}>
            {tr('needsAttentionOnly')} {attention.length ? `· ${attention.length}` : ''}
          </Link>
        </div>
      </div>

      {/* A status line, not four raw numbers. What the numbers used to say —
          576 sizes, 6 low — never told anyone WHICH six; that answer lives on
          each product page now, next to the sizes it's actually about. */}
      {totals.low + totals.out + totals.flagged === 0 ? (
        <div className="info-card good" style={{ marginBottom: 20 }}>
          <div>{tr('allStockOk')} — {fmtNum(totals.sizes)} {tr('sizesTracked').toLowerCase()}.</div>
        </div>
      ) : (
        <div className="info-card warn" style={{ marginBottom: 20 }}>
          <div className="row wrap" style={{ gap: 6 }}>
            {totals.out > 0 && <StatusBadge status="out">{fmtNum(totals.out)} {tr('sizesOutOf')}</StatusBadge>}
            {totals.low > 0 && <StatusBadge status="low">{fmtNum(totals.low)} {tr('sizesLow')}</StatusBadge>}
            {totals.flagged > 0 && <StatusBadge status="quarantined">{fmtNum(totals.flagged)} {tr('quarantined')}</StatusBadge>}
            <span>— {attention.length} {tr('productsAffected')}.</span>
          </div>
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState emoji="✅" heading={tr('emptyStockHeading')} message={tr('emptyStockMessage')} />
      ) : (
        <div className="family-grid">
          {shown.map((f) => {
            // Tapping the family name (e.g. "Fluting") has to go somewhere —
            // it opens the same variant a bare mention of the paper means on
            // the floor: moti by default, bareek only when nothing else exists.
            const defaultVariant = f.moti ?? f.bareek;
            return (
              <div key={f.family} className="family-card">
                <div className="family-head">
                  {/* One generic icon for every family — never a different
                      shape per type. That per-product visual distinction was
                      deliberately removed two sessions ago; this only marks
                      "this is a paper type" as a category, not which one. */}
                  <span className="icon-badge neutral"><Layers size={13} /></span>
                  {defaultVariant ? (
                    <Link href={`/stock/${defaultVariant.id}?unit=${unit}`} className="family-name">
                      {f.family}
                    </Link>
                  ) : (
                    <span className="family-name">{f.family}</span>
                  )}
                </div>
                <ThicknessRow t={f.moti} unit={unit} label={tr('moti')} tr={tr} />
                <ThicknessRow t={f.bareek} unit={unit} label={tr('bareek')} bareek tr={tr} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/**
 * A single row is either the product's whole state or nothing about it — no
 * counts, no "3 out / 1 low" pile of badges. Just the name, its size range if
 * it has one, and — only when something on it actually needs a look — one
 * coloured mark. Worst case wins: a size that's out says more than a size
 * that's merely low, so only the single most severe colour shows.
 */
function ThicknessRow({ t, unit, label, bareek, tr }: {
  t: TypeStockSummary | null;
  unit: string;
  label: string;
  bareek?: boolean;
  tr: (k: DictKey) => string;
}) {
  if (!t) {
    // Nothing to walk into — this thickness has no catalogue entry at all,
    // not just an empty one. Add it from the Catalogue page instead.
    return (
      <div className="thickness-row empty-row">
        <span className={`thickness-tag ${bareek ? 'is-bareek' : ''}`}>{label}</span>
        <span className="thickness-meta">{tr('notStocked')}</span>
      </div>
    );
  }
  if (t.sizes === 0) {
    // The product exists and has a real page to receive stock on — it just
    // has no sizes recorded yet (brand new, or its stock was reset for a
    // clean manual recount). This used to render identically to the "no
    // catalogue entry at all" case above: a dead div with no way in, which
    // was the actual bug behind "I can't click it to add stock."
    return (
      <Link href={`/stock/${t.id}?unit=${unit}`} className="thickness-row empty-row is-open">
        <span className={`thickness-tag ${bareek ? 'is-bareek' : ''}`}>{label}</span>
        <span className="thickness-meta">{tr('notStocked')}</span>
        <span className="thickness-end"><ChevronRight size={16} className="chev" /></span>
      </Link>
    );
  }
  // Worst case wins — a size that's out says more than one that's merely low.
  const status: Status | null = t.out > 0 ? 'out' : t.low > 0 ? 'low' : t.flagged > 0 ? 'quarantined' : null;
  const borderCls = status === 'out' ? 'attn-red' : status === 'low' ? 'attn-yellow' : status === 'quarantined' ? 'attn-purple' : '';
  return (
    <Link href={`/stock/${t.id}?unit=${unit}`} className={`thickness-row ${borderCls}`}>
      <span className={`thickness-tag ${bareek ? 'is-bareek' : ''}`}>{label}</span>
      {t.min_size != null && (
        <span className="thickness-meta">{t.min_size}″–{t.max_size}″</span>
      )}
      <span className="thickness-end">
        {status && <StatusIcon status={status} size={11} />}
        <ChevronRight size={16} className="chev" />
      </span>
    </Link>
  );
}
