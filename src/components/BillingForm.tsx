'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useUi } from './Shell';
import {
  FORM_FIELDS, priceAndDescribe, billTotals, validateLine,
  type SaleForm, type LineInput, type PricedLine,
} from '@/lib/pricing';
import { fmtNum, type DictKey } from '@/lib/i18n';
import { submitBill } from '@/app/billing/actions';
import { CustomerPanel, type CustomerOpt } from './CustomerPanel';

export type { CustomerOpt };
export interface CatalogueItem {
  id: number; name_en: string; name_ur: string; default_rate: number;
  sizes: { roll: { size: number; quantity: number }[]; reel: { size: number; quantity: number }[]; tota: { size: number; quantity: number }[] };
}

const FORMS: SaleForm[] = ['rolls', 'reels', 'packets', 'totay', 'jutta', 'raddi', 'nali'];
const UNIT_FOR: Partial<Record<SaleForm, 'roll' | 'reel' | 'tota'>> = {
  rolls: 'roll', reels: 'reel', totay: 'tota', packets: 'reel',
};

const WASTE_FORMS: Record<string, string> = { jutta: 'jutta', raddi: 'raddi', nali: 'nali' };

export function BillingForm({ items, customers, paymentMethods, wasteStock }: { items: CatalogueItem[]; customers: CustomerOpt[]; paymentMethods: string[]; wasteStock?: Record<string, number> }) {
  const { tr, lang } = useUi();
  const nameOf = (i: CatalogueItem) => (lang === 'ur' ? i.name_ur : i.name_en);

  const [customerId, setCustomerId] = useState<number | ''>('');
  const [form, setForm] = useState<SaleForm>('rolls');
  const [typeId, setTypeId] = useState<number | ''>('');
  const [size, setSize] = useState<number | ''>('');
  const [vals, setVals] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<PricedLine[]>([]);
  const [rent, setRent] = useState('0');
  const [credit, setCredit] = useState('0');
  const [creditMethod, setCreditMethod] = useState('Cash');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<null | { ok: boolean; receiptNo?: number; billId?: number; effects?: string[]; errors?: string[] }>(null);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const spec = FORM_FIELDS[form];
  const unit = UNIT_FOR[form];
  const item = items.find((i) => i.id === typeId);
  const sizeOpts = item && unit ? item.sizes[unit] : [];
  const onHand = sizeOpts.find((s) => s.size === size)?.quantity ?? null;
  const customer = customers.find((c) => c.id === customerId);

  // Waste stock on hand (for jutta, raddi, nali)
  const wasteCategory = WASTE_FORMS[form];
  const wasteOnHand = wasteCategory && wasteStock ? (wasteStock[wasteCategory] ?? 0) : null;

  // Rate from catalogue (auto-fills, but user can override)
  const [rate, setRate] = useState(0);
  useEffect(() => { setRate(item?.default_rate ?? 0); }, [item]);

  // Compute total stock per item (across the relevant unit)
  const itemStock = useMemo(() => {
    const map = new Map<number, number>();
    for (const it of items) {
      const u = UNIT_FOR[form];
      const sizes = u ? it.sizes[u] ?? [] : [];
      map.set(it.id, sizes.reduce((s, x) => s + x.quantity, 0));
    }
    return map;
  }, [items, form]);

  // Close item picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    if (pickerOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [pickerOpen]);

  const totals = useMemo(
    () => billTotals(lines, Number(rent) || 0, Number(credit) || 0),
    [lines, rent, credit],
  );

  const isCash = customer?.kind === 'cash';

  // Auto-set credit = full amount for cash customers (everything is paid immediately)
  useEffect(() => {
    if (isCash) {
      const sub = lines.reduce((s, l) => s + l.amount, 0);
      setCredit(String(sub + (Number(rent) || 0)));
      setCreditMethod('Cash');
    }
  }, [isCash, lines, rent]);



  // Clear picker when switching tabs
  function switchForm(f: SaleForm) {
    setForm(f); setVals({}); setSize(''); setTypeId(''); setErrors([]); setPickerOpen(false); setRate(0);
  }

  const draft = (): LineInput => ({
    form,
    itemTypeId: spec.needsType ? (typeId === '' ? null : Number(typeId)) : null,
    itemTypeName: spec.needsType ? (item ? nameOf(item) : '') : tr(form as DictKey),
    size: spec.needsSize ? (size === '' ? null : Number(size)) : null,
    qty: vals.qty ? Number(vals.qty) : null,
    weightKg: vals.weightKg ? Number(vals.weightKg) : null,
    grammage: vals.grammage ? Number(vals.grammage) : null,
    lengthIn: vals.lengthIn ? Number(vals.lengthIn) : null,
    widthIn: vals.widthIn ? Number(vals.widthIn) : null,
    rate,
  });

  const preview = priceAndDescribe(draft());

  function pickType(id: number) {
    setTypeId(id);
    setSize('');
    setPickerOpen(false);
  }

  function addLine() {
    const d = draft();
    const errs = validateLine(d);
    // Warn on stock, but let the counter proceed — never block a sale.
    setErrors(errs);
    if (errs.length) return;
    setLines([...lines, priceAndDescribe(d)]);
    setVals({}); setSize(''); setErrors([]);
  }

  async function post() {
    if (!customerId || !lines.length) return;
    setBusy(true);
    const res = await submitBill({
      customerId: Number(customerId),
      lines: lines.map(({ amount, description, unit: u, stockDraw, ...rest }) => rest),
      rent: Number(rent) || 0,
      credit: Number(credit) || 0,
      creditMethod,
      note: note || undefined,
    });
    setResult(res);
    setBusy(false);
    if (res.ok) { setLines([]); setRent('0'); setCredit('0'); setNote(''); }
  }

  // ── Success / failure panel ──
  if (result) {
    return (
      <div className="stack">
        <div className="card" style={{ borderColor: result.ok ? 'var(--accent-green-solid)' : 'var(--accent-red-solid)' }}>
          <div className="row between" style={{ marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 19, color: 'var(--text-primary)', marginBottom: 4 }}>
                {result.ok ? `✓ ${tr('billPosted')}` : `✕ ${tr('billFailed')}`}
              </h2>
              {result.ok && (
                <div className="panel-desc">
                  {tr('receipt')} <span className="num t-strong">#{result.receiptNo}</span>
                </div>
              )}
            </div>
            <span className={`badge ${result.ok ? 'badge-green' : 'badge-red'}`}>
              {result.ok ? 'COMMITTED' : 'ROLLED BACK'}
            </span>
          </div>

          <div className="card-title">{tr('whatHappened')}</div>
          <div className="log-body">
            {(result.ok ? result.effects ?? [] : result.errors ?? []).map((e, i) => (
              <div key={i} className={`log-entry ${result.ok ? 'log-success' : 'log-error'}`}>
                <span className="log-time num">{String(i + 1).padStart(2, '0')}</span>
                <span className="log-msg">{e}</span>
              </div>
            ))}
          </div>

          <div className="info-card good" style={{ marginTop: 14 }}>
            <div>
              {result.ok
                ? <>All steps completed inside <b>one transaction</b> — stock, ledger, and receipt are in sync.</>
                : <>Nothing was written. The transaction rolled back completely.</>}
            </div>
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => setResult(null)}>{tr('newBillBtn')}</button>
            {result.ok && result.billId && (
              <a className="btn btn-ghost" href={`/bills/${result.billId}`}>{tr('viewReceipt')}</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Entry form ──
  return (
    <div className="split">
      {/* Left: item entry */}
      <div className="stack">
        <CustomerPanel
          initialCustomers={customers}
          customerId={customerId}
          onSelect={(id) => setCustomerId(id)}
        />
        {customer && customer.balance > 0 && (
          <div className="info-card warn" style={{ fontSize: 12 }}>
            <div>Outstanding balance: <b>PKR {fmtNum(customer.balance)}</b></div>
          </div>
        )}

        <div className="card">
          <div className="tabs">
            {FORMS.map((f) => (
              <button key={f} className={`tab ${form === f ? 'active' : ''}`}
                      onClick={() => switchForm(f)}>
                {tr(f as DictKey)}
              </button>
            ))}
          </div>

          <div className="row wrap" style={{ marginBottom: 14, gap: 8 }}>
            <span className="formula-chip">{spec.formula}</span>
            {onHand !== null && (
              <span className={`badge ${onHand <= 0 ? 'badge-red' : onHand <= 5 ? 'badge-yellow' : 'badge-green'}`}>
                {tr('onHand')}: {fmtNum(onHand)} {unit === 'roll' ? 'rolls' : 'kg'}
              </span>
            )}
            {wasteOnHand !== null && (
              <span className={`badge ${wasteOnHand <= 0 ? 'badge-red' : 'badge-green'}`}>
                On hand: {fmtNum(wasteOnHand)} kg
              </span>
            )}
          </div>

          <div className="form-grid">
            {spec.needsType && (
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label>{tr('paperType')}</label>
                <div ref={pickerRef} style={{ position: 'relative' }}>
                  <button type="button" className="select" style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                          onClick={() => setPickerOpen(!pickerOpen)}>
                    {item ? nameOf(item) : '\u2014'}
                  </button>
                  {pickerOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
                      maxHeight: 220, overflowY: 'auto', marginTop: 2,
                    }}>
                      {items.map((i) => {
                        const stock = itemStock.get(i.id) ?? 0;
                        const oos = stock <= 0;
                        return (
                          <div key={i.id}
                               onClick={() => !oos && pickType(i.id)}
                               style={{
                                 padding: '8px 12px', cursor: oos ? 'not-allowed' : 'pointer',
                                 fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                 textDecoration: oos ? 'line-through' : 'none',
                                 opacity: oos ? 0.45 : 1,
                                 background: typeId === i.id ? 'var(--bg-elevated)' : 'transparent',
                               }}>
                            <span>{nameOf(i)}</span>
                            <span className="t-muted num" style={{ fontSize: 11 }}>{fmtNum(stock)} {unit === 'roll' ? 'rolls' : 'kg'}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            {spec.needsSize && (
              <div className="field">
                <label>{tr('size')} (inches)</label>
                <select className="select" value={size} disabled={!item}
                        onChange={(e) => setSize(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">{'\u2014'}</option>
                  {sizeOpts.map((s) => (
                    <option key={s.size} value={s.size} disabled={s.quantity <= 0}>
                      {`${s.size} (${fmtNum(s.quantity)})${s.quantity <= 0 ? ' \u2014 OUT' : ''}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {spec.fields.map((f) => {
              const isQty = f === 'qty';
              const isWeight = f === 'weightKg';
              // Cap qty (rolls) and weightKg (reels, totay) at available stock
              const stockCap = (isQty || isWeight) && onHand !== null ? onHand : null;
              // Cap weightKg for waste forms (jutta, raddi, nali) at waste stock
              const wasteCap = isWeight && wasteOnHand !== null ? wasteOnHand : null;
              const maxStock = stockCap ?? wasteCap;
              return (
                <div className="field" key={f}>
                  <label>
                    {isQty ? `${tr('quantity')} (${spec.unitLabel})`
                      : isWeight ? tr('weight')
                      : f === 'grammage' ? tr('grammage')
                      : f === 'lengthIn' ? tr('length') : tr('width')}
                    {maxStock !== null && <span className="t-muted" style={{ fontSize: 11, marginInlineStart: 6 }}>max: {fmtNum(maxStock)}</span>}
                  </label>
                  <input className="input num" type="number" min="0" step={isQty ? "1" : "any"}
                         value={vals[f] ?? ''}
                         onChange={(e) => {
                           const raw = e.target.value;
                           if (raw === '' || raw === '-') { setVals({ ...vals, [f]: raw }); return; }
                           let num = Number(raw);
                           if (isNaN(num) || num < 0) return;
                           if (maxStock !== null && maxStock > 0 && num > maxStock) num = maxStock;
                           if (isQty) num = Math.floor(num); // rolls are whole units only
                           setVals({ ...vals, [f]: String(num) });
                         }} />
                </div>
              );
            })}
            <div className="field">
              <label>{tr('rate')} (PKR)</label>
              <input className="input num" type="number" min="0" step="any" value={rate}
                     onChange={(e) => setRate(Number(e.target.value))} />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="info-card warn" style={{ marginTop: 12 }}>
              <div>{errors.join(' · ')}</div>
            </div>
          )}

          <div className="row between" style={{ marginTop: 16 }}>
            <div>
              <div className="t-muted">{tr('amount')}</div>
              <div className="stat-big stat-accent num">PKR {fmtNum(preview.amount)}</div>
            </div>
            <button className="btn btn-primary btn-lg" onClick={addLine}>+ {tr('addLine')}</button>
          </div>
        </div>
      </div>

      {/* Right: the bill */}
      <div className="card">
        <div className="card-title">{tr('billItems')}</div>
        {lines.length === 0 ? (
          <div className="empty">{tr('noItems')}</div>
        ) : (
          <div className="stack sm">
            {lines.map((l, i) => (
              <div key={i} className="row between" style={{
                padding: '9px 11px', background: 'var(--bg-elevated)', borderRadius: 8, gap: 10,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div className="t-strong" style={{ fontSize: 12.5 }}>{l.description}</div>
                  <div className="t-muted num">
                    {tr(l.form as DictKey)} · {tr('rate')} {fmtNum(l.rate)}
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="num t-strong">{fmtNum(l.amount)}</span>
                  <button className="icon-btn" style={{ height: 24, minWidth: 24, padding: 0 }}
                          onClick={() => setLines(lines.filter((_, j) => j !== i))}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="field" style={{ marginBottom: 12 }}>
          <label>NOTE (OPTIONAL)</label>
          <input className="input" name="bill-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Delivery note, special instruction..." />
        </div>

        <div className="totals">
          <div className="total-row">
            <span>{tr('subtotal')}</span><span className="num">PKR {fmtNum(totals.subtotal)}</span>
          </div>
          <div className="total-row">
            <span>{tr('rent')}</span>
            <input className="input num" style={{ width: 110, padding: '4px 8px', textAlign: 'end' }}
                   type="number" min="0" step="any" value={rent} onChange={(e) => setRent(e.target.value)} />
          </div>
          {isCash ? (
            <>
              <div className="total-row">
                <span>{tr('paidNow')}</span>
                <span className="num stat-green">PKR {fmtNum(totals.subtotal + (Number(rent) || 0))}</span>
              </div>
              <div className="total-row">
                <span>{tr('paymentMethod')}</span>
                <span className="t-muted">Cash</span>
              </div>
            </>
          ) : (
            <>
              <div className="total-row">
                <span>{tr('paidNow')}</span>
                <input className="input num" style={{ width: 110, padding: '4px 8px', textAlign: 'end' }}
                       type="number" min="0" step="any" value={credit} onChange={(e) => setCredit(e.target.value)} />
              </div>
              <div className="total-row">
                <span>{tr('paymentMethod')}</span>
                <select className="select" style={{ width: 130, padding: '4px 8px' }}
                        value={creditMethod} onChange={(e) => setCreditMethod(e.target.value)}>
                  {paymentMethods.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="total-row grand">
            <span>{tr('netDue')}</span><span className="num">PKR {fmtNum(totals.net)}</span>
          </div>
        </div>

        <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 16 }}
                disabled={!customerId || !lines.length || busy} onClick={post}>
          {busy ? '…' : tr('postBill')}
        </button>
      </div>
    </div>
  );
}
