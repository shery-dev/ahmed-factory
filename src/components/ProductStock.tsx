'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X, Plus, Loader2, PackagePlus, PackageMinus, ClipboardList, ArrowRight } from 'lucide-react';
import { useUi } from './Shell';
import { fmtNum, type DictKey } from '@/lib/i18n';
import type { ItemType, SizeRow } from '@/lib/repo';
import { receiveStock, issueStock, countStock, changeReorderLevel, type ActionResult } from '@/app/stock/actions';
import { UnitIcon } from './UnitIcon';
import { StatusBadge, type Status } from './StatusBadge';
import { EmptyState } from './EmptyState';

/**
 * One product, one unit, every width it is held in — and the only place on the
 * shop floor where a level can be changed by hand.
 *
 * Each width is a tile rather than a table row: a store man reads a number he
 * can see from arm's length, taps it with one hand, and never has to find the
 * right line in a list of 576. Tapping opens the update sheet, which is the
 * answer to "we have no way to update the stock".
 */

type Mode = 'receive' | 'issue' | 'count';
type Movement = {
  id: number; ts: string; direction: string; size: number | null; unit: string | null;
  quantity: number; ref_type: string | null; ref_id: number | null;
  note: string | null; actor: string;
};

const UNITS: Array<{ key: string; label: DictKey }> = [
  { key: 'roll', label: 'rolls' },
  { key: 'reel', label: 'reels' },
  { key: 'tota', label: 'totay' },
];

export function ProductStock({
  type, sibling, unit, rows, movements, qtyThreshold,
}: {
  type: ItemType;
  sibling: ItemType | null;
  unit: string;
  rows: SizeRow[];
  movements: Movement[];
  /** A movement above this is unusual for this product — soft warning only. */
  qtyThreshold: number;
}) {
  const { tr, lang } = useUi();
  const ur = lang === 'ur';

  const [open, setOpen] = useState<{ size: number; qty: number; isNew: boolean } | null>(null);
  const [mode, setMode] = useState<Mode>('receive');
  const [value, setValue] = useState(0);
  const [newSize, setNewSize] = useState('');
  // Someone else changed this exact size while the sheet was open — surfaced
  // instead of silently writing over their movement.
  const [staleQty, setStaleQty] = useState<number | null>(null);
  // A movement that looks unusually large for this product needs one extra
  // tap before it commits — never a hard block, per the project's rule that
  // nothing here is allowed to stop the factory.
  const [largeConfirmed, setLargeConfirmed] = useState(false);
  const [pending, setPending] = useState(false);

  const total = rows.reduce((s, r) => s + r.quantity, 0);
  // Not just how many — which ones. A count told nobody whether the low size
  // was the one they were about to sell out of.
  const outSizes = rows.filter((r) => !r.flagged && r.quantity <= 0).map((r) => r.size);
  const lowSizes = rows.filter((r) => !r.flagged && r.quantity > 0 && r.quantity <= type.reorder_level).map((r) => r.size);
  const flaggedSizes = rows.filter((r) => r.flagged).map((r) => r.size);
  const out = outSizes.length;
  const low = lowSizes.length;

  const moti = type.is_bareek ? sibling : type;
  const bareek = type.is_bareek ? type : sibling;

  function openTile(size: number, qty: number, isNew = false) {
    setOpen({ size, qty, isNew });
    setMode('receive');
    setValue(0);
    setNewSize('');
    setStaleQty(null);
    setLargeConfirmed(false);
  }
  function pickMode(m: Mode) {
    setMode(m);
    // A count starts from what the system believes, so the store man edits a
    // number rather than typing one from scratch. Receiving and issuing start
    // at zero — they are deltas, not totals.
    setValue(m === 'count' ? (open?.qty ?? 0) : 0);
    setStaleQty(null);
    setLargeConfirmed(false);
  }
  function setValueAndResetConfirm(v: number) {
    setValue(v);
    setLargeConfirmed(false);
  }

  const after = !open ? 0
    : mode === 'receive' ? open.qty + value
    : mode === 'issue' ? open.qty - value
    : value;

  // What actually moved, regardless of mode — the number the sanity check
  // should judge, not the resulting total (a count landing on a huge on-hand
  // figure is normal for a big product; a huge single movement is not).
  const movedAmount = mode === 'count' ? Math.abs(value - (open?.qty ?? 0)) : value;
  const isLarge = movedAmount > qtyThreshold;

  async function submit(fd: FormData) {
    if (isLarge && !largeConfirmed) { setLargeConfirmed(true); return; }
    if (!open) return;
    if (!open.isNew) fd.set('expectedQty', String(open.qty));

    const run = mode === 'receive' ? receiveStock : mode === 'issue' ? issueStock : countStock;
    setPending(true);
    try {
      const result: ActionResult = await run(fd);
      if (!result.ok) {
        if (result.reason === 'stale') {
          // Rebase on the real number and make them look at it and confirm
          // again — never commit the old plan on top of what actually happened.
          setStaleQty(result.currentQty);
          setOpen({ ...open, qty: result.currentQty });
          if (mode === 'count') setValue(result.currentQty);
          setLargeConfirmed(false);
        }
        return;
      }
      setOpen(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="panel-header">
        <Link href="/stock" className="t-muted" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <ChevronLeft size={13} className="chev" /> {tr('backToStock')}
        </Link>
        <h2 style={{ marginTop: 6 }}>
          {ur ? type.name_ur : type.name_en}{' '}
          {type.is_bareek === 1 && (
            <span className="badge badge-blue" style={{ verticalAlign: 'middle' }}>
              {tr('bareek')}
            </span>
          )}
        </h2>
      </div>

      {/* Thickness and unit, framed as one deliberate control rather than two
          floating rows of pills — both pick "which grid of tiles below". */}
      <div className="control-bar">
        <div className="control-row">
          <span className="control-label">{tr('thickness')}</span>
          <ThicknessTab t={moti} current={type} unit={unit} label={tr('moti')} />
          <ThicknessTab t={bareek} current={type} unit={unit} label={tr('bareek')} />
        </div>
        <div className="control-divider" />
        <div className="control-row">
          <span className="control-label">{tr('unit')}</span>
          {UNITS.map((u) => (
            <Link key={u.key} href={`/stock/${type.id}?unit=${u.key}`}
                  className={`control-btn ${unit === u.key ? 'active' : ''}`}>
              <UnitIcon unit={u.key} />
              {tr(u.label)}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card tight">
          <div className="card-title">{tr('currentlyOnHand')}</div>
          <div className="stat-big stat-accent num">{fmtNum(total)}</div>
          <div className="stat-sub">{tr(unit as DictKey)}</div>
        </div>
        <div className="card tight">
          <div className="card-title">{tr('sizesTracked')}</div>
          <div className="stat-big num">{rows.length}</div>
        </div>
        {/* Which sizes, not just how many — each chip jumps straight to its
            tile below rather than making someone hunt through the grid. */}
        <div className="card tight" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">{tr('needsAttention')}</div>
          {out + low + flaggedSizes.length === 0 ? (
            <div className="stat-sub" style={{ marginTop: 6 }}>{tr('allStockOk')}</div>
          ) : (
            <div style={{ marginTop: 4 }}>
              {outSizes.map((s) => (
                <a key={`o${s}`} href={`#size-${s}`} className="attn-chip c-out">{s}″</a>
              ))}
              {lowSizes.map((s) => (
                <a key={`l${s}`} href={`#size-${s}`} className="attn-chip c-low">{s}″</a>
              ))}
              {flaggedSizes.map((s) => (
                <a key={`f${s}`} href={`#size-${s}`} className="attn-chip c-flag">{s}″</a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="row between" style={{ marginBottom: 4 }}>
        <span className="t-muted" style={{ fontSize: 11 }}>{tr('reorderLevel')}</span>
        <form action={changeReorderLevel} className="row" style={{ gap: 6 }}>
          <input type="hidden" name="itemTypeId" value={type.id} />
          <input className="input num" name="level" type="number" step="any" min={0}
                 defaultValue={type.reorder_level} style={{ width: 60, padding: '5px 8px' }} />
          <span className="t-muted" style={{ fontSize: 11 }}>{tr(unit as DictKey)}</span>
          <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 11.5 }}>{tr('save')}</button>
        </form>
      </div>

      <div className="split">
        <div>
          <div className="size-grid-head">
            <div className="card-title" style={{ marginBottom: 0 }}>{tr('chooseSize')}</div>
            <button className="btn-add-size" onClick={() => openTile(0, 0, true)}>
              <Plus size={13} /> {tr('addSize')}
            </button>
          </div>
          <div className="size-table">
            <div className="size-table-head">
              <span className="size-col-size">{tr('size')}</span>
              <span className="size-col-qty">{tr('onHand')}</span>
              <span className="size-col-rate">{tr('rate')}</span>
              <span className="size-col-status">{tr('status')}</span>
              <span className="size-col-chev" />
            </div>
            {rows.map((r) => {
              const state = r.flagged ? 'flagged'
                : r.quantity <= 0 ? 'out'
                : r.quantity <= type.reorder_level ? 'low' : '';
              const status: Status | null = r.flagged ? 'quarantined'
                : r.quantity <= 0 ? 'out'
                : r.quantity <= type.reorder_level ? 'low' : null;
              return (
                <button key={r.size} id={`size-${r.size}`} className={`size-row ${state}`}
                        onClick={() => openTile(r.size, r.quantity)}
                        title={r.flag_reason ?? undefined}>
                  <span className="size-col-size size-row-size">{r.size}″</span>
                  <span className="size-col-qty size-row-qty num">
                    {fmtNum(r.quantity)} <small>{tr(unit as DictKey)}</small>
                  </span>
                  <span className="size-col-rate size-row-rate num">{fmtNum(r.rate)}</span>
                  <span className="size-col-status">
                    {status === 'out' ? <StatusBadge status="out">{tr('statusOut')}</StatusBadge>
                      : status === 'low' ? <StatusBadge status="low">{tr('statusLow')}</StatusBadge>
                      : status === 'quarantined' ? <StatusBadge status="quarantined">{tr('statusFlagged')}</StatusBadge>
                      : <span className="size-row-ok">{tr('inStock')}</span>}
                  </span>
                  <span className="size-col-chev"><ChevronRight size={16} className="chev" /></span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-title">{tr('movements')}</div>
          {movements.length === 0 ? (
            <EmptyState emoji="📭" heading={tr('emptyMovementsHeading')} message={tr('emptyMovementsMessage')} />
          ) : (
            <div className="log-body">
              {movements.map((m) => (
                <div key={m.id}
                     className={`log-entry ${m.direction === 'out' ? 'log-warn'
                       : m.direction === 'adjust' ? 'log-system' : 'log-success'}`}>
                  <span className="log-time">{String(m.ts).slice(5, 16)}</span>
                  <span style={{ minWidth: 0 }}>
                    <span className="log-msg num">
                      {m.direction === 'out' ? '−' : m.direction === 'adjust' ? '=' : '+'}
                      {fmtNum(Math.abs(m.quantity))} {m.unit ?? unit} · {m.size}″
                    </span>
                    <span className="log-detail">
                      {m.note}{m.ref_type === 'bill' ? ` · bill #${m.ref_id}` : ''} · {m.actor}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <div>
                <div className="sheet-title">
                  {ur ? type.name_ur : type.name_en}
                  {open.isNew ? '' : ` · ${open.size}″`}
                </div>
                <div className="sheet-sub">
                  {tr('currentlyOnHand')}: <b className="num">{fmtNum(open.qty)}</b> {tr(unit as DictKey)}
                </div>
              </div>
              <button className="icon-btn" onClick={() => setOpen(null)}><X size={14} /></button>
            </div>

            <div className="mode-tabs">
              <button className={`mode-btn m-receive ${mode === 'receive' ? 'on' : ''}`}
                      onClick={() => pickMode('receive')}>
                <PackagePlus size={16} /> {tr('receive')}
              </button>
              <button className={`mode-btn m-issue ${mode === 'issue' ? 'on' : ''}`}
                      onClick={() => pickMode('issue')}>
                <PackageMinus size={16} /> {tr('issue')}
              </button>
              <button className={`mode-btn m-count ${mode === 'count' ? 'on' : ''}`}
                      onClick={() => pickMode('count')}>
                <ClipboardList size={16} /> {tr('setCount')}
              </button>
            </div>

            {staleQty !== null && (
              <div className="info-card warn">
                <div>
                  <b>{tr('stockChanged')}</b><br />
                  {tr('nowOnHand')}: <b className="num">{fmtNum(staleQty)}</b> {tr(unit as DictKey)}
                  <br />{tr('tapAgainToConfirm')}
                </div>
              </div>
            )}

            <form action={submit} className="stack">
              <input type="hidden" name="itemTypeId" value={type.id} />
              <input type="hidden" name="unit" value={unit} />
              <input type="hidden" name="rate" value={type.default_rate} />

              {open.isNew ? (
                <div className="field">
                  <label>{tr('newSizeInches')}</label>
                  <input className="input num" name="size" type="number" required min={1}
                         inputMode="numeric" value={newSize}
                         onChange={(e) => setNewSize(e.target.value)} autoFocus />
                </div>
              ) : (
                <input type="hidden" name="size" value={open.size} />
              )}

              <div className="field">
                <label>
                  {mode === 'receive' ? tr('addQty')
                    : mode === 'issue' ? tr('issueQty') : tr('countedQty')}
                  {' '}({tr(unit as DictKey)})
                </label>
                <div className="stepper">
                  <button type="button" className="step-btn"
                          onClick={() => setValueAndResetConfirm(Math.max(0, value - 1))}>−</button>
                  <input
                    className="step-input num"
                    name={mode === 'count' ? 'counted' : 'quantity'}
                    type="number" step="any" min={0} required inputMode="numeric"
                    value={value}
                    onChange={(e) => setValueAndResetConfirm(Number(e.target.value))}
                  />
                  <button type="button" className="step-btn"
                          onClick={() => setValueAndResetConfirm(value + 1)}>+</button>
                </div>
              </div>

              <div className="quick-chips">
                {[5, 10, 25, 50, 100].map((n) => (
                  <button key={n} type="button" className="chip"
                          onClick={() => setValueAndResetConfirm(mode === 'count' ? n : value + n)}>
                    {mode === 'count' ? n : `+${n}`}
                  </button>
                ))}
              </div>

              <div className="preview-line">
                <span>{tr('afterThis')}</span>
                <span className="preview-transition">
                  <b className="num">{fmtNum(open.qty)}</b>
                  <ArrowRight size={14} className="preview-arrow" />
                  <b className={`num ${after < 0 ? 'stat-red' : ''}`}>
                    {fmtNum(mode === 'count' ? value : after)}
                  </b>
                  <span className="preview-unit">{tr(unit as DictKey)}</span>
                </span>
              </div>

              {isLarge && (
                <div className="info-card warn">
                  <div><b>{tr('largeQtyWarning')}</b></div>
                </div>
              )}

              <div className="field">
                <label>
                  {tr('reason')}
                  {mode !== 'receive' && <span style={{ color: 'var(--accent-red)' }}> *</span>}
                </label>
                <input className="input" name="reason" required={mode !== 'receive'}
                       placeholder={
                         mode === 'receive' ? tr('reasonExampleReceive')
                           : mode === 'issue' ? tr('reasonExampleIssue')
                           : tr('reasonExampleCount')
                       } />
              </div>

              <button className="btn btn-primary btn-lg btn-block" disabled={pending}>
                {pending
                  ? <Loader2 size={16} className="spin" />
                  : (isLarge && largeConfirmed ? tr('confirmAnyway') : tr('confirm'))}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ThicknessTab({ t, current, unit, label }: {
  t: ItemType | null; current: ItemType; unit: string; label: string;
}) {
  if (!t) return <span className="control-btn faint">{label}</span>;
  const active = t.id === current.id;
  const bareek = t.is_bareek === 1;
  return (
    <Link href={`/stock/${t.id}?unit=${unit}`}
          className={`control-btn ${active ? 'active' : ''} ${bareek ? 'is-bareek' : ''}`}>
      {label}
    </Link>
  );
}
