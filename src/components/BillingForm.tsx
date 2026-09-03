'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUi } from './Shell';
import {
  FORM_FIELDS, priceAndDescribe, billTotals, validateLine,
  type SaleForm, type LineInput, type PricedLine,
} from '@/lib/pricing';
import { fmtNum, type DictKey } from '@/lib/i18n';
import { submitBill, getRecentRate } from '@/app/billing/actions';
import { QuickAddCustomer } from './QuickAddCustomer';

export interface CatalogueItem {
  id: number; name_en: string; name_ur: string; default_rate: number;
  sizes: { roll: { size: number; quantity: number }[]; reel: { size: number; quantity: number }[]; tota: { size: number; quantity: number }[] };
}
export interface CustomerOpt {
  id: number; code: string; name: string; kind: 'cash' | 'ledger'; balance: number;
}

const FORMS: SaleForm[] = ['rolls', 'reels', 'packets', 'totay', 'jutta', 'raddi', 'nali'];
const UNIT_FOR: Partial<Record<SaleForm, 'roll' | 'reel' | 'tota'>> = {
  rolls: 'roll', reels: 'reel', totay: 'tota', packets: 'reel',
};

export function BillingForm({ items, customers, paymentMethods }: { items: CatalogueItem[]; customers: CustomerOpt[]; paymentMethods: string[] }) {
  const { tr, lang } = useUi();
  const nameOf = (i: CatalogueItem) => (lang === 'ur' ? i.name_ur : i.name_en);

  const [customerId, setCustomerId] = useState<number | ''>('');
  const [form, setForm] = useState<SaleForm>('rolls');
  const [typeId, setTypeId] = useState<number | ''>('');
  const [size, setSize] = useState<number | ''>('');
  const [rate, setRate] = useState<string>('');
  const [vals, setVals] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<PricedLine[]>([]);
  const [rent, setRent] = useState('0');
  const [credit, setCredit] = useState('0');
  const [creditMethod, setCreditMethod] = useState('Cash');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<null | { ok: boolean; receiptNo?: number; billId?: number; effects?: string[]; errors?: string[] }>(null);
  const [busy, setBusy] = useState(false);

  const spec = FORM_FIELDS[form];
  const unit = UNIT_FOR[form];
  const item = items.find((i) => i.id === typeId);
  const sizeOpts = item && unit ? item.sizes[unit] : [];
  const onHand = sizeOpts.find((s) => s.size === size)?.quantity ?? null;
  const customer = customers.find((c) => c.id === customerId);

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



  // Auto-fill rate from customer's last purchase of this product
  const prevRateRef = { current: '' };
  if (customerId && typeId && prevRateRef.current !== customerId + '-' + typeId) {
    prevRateRef.current = customerId + '-' + typeId;
    getRecentRate(Number(customerId), Number(typeId)).then((r) => {
      if (r.rate !== null && !rate) setRate(String(r.rate));
    });
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
    rate: Number(rate) || 0,
  });

  const preview = priceAndDescribe(draft());

  function pickType(v: string) {
    setTypeId(v === '' ? '' : Number(v));
    setSize('');
    const it = items.find((i) => i.id === Number(v));
    if (it) setRate(String(it.default_rate)); // rate comes from the catalogue, editable
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
                ? <>All of the above happened inside <b>one database transaction</b>. If any single step had failed, none of them would have been written. The 2022 system wrote these to separate spreadsheet sheets, which is why stock and money drifted apart.</>
                : <>Nothing was written. The transaction rolled back completely, leaving stock and the ledger exactly as they were.</>}
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
        <div className="card">
          <div className="card-title">{tr('customer')}</div>
          <select className="select" value={customerId}
                  onChange={(e) => setCustomerId(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">— {tr('selectCustomer')} —</option>
            <optgroup label={tr('cashCustomer')}>
              {customers.filter((c) => c.kind === 'cash').map((c) => (
                <option key={c.id} value={c.id}>{c.code} · {c.name}</option>
              ))}
            </optgroup>
            <optgroup label={tr('ledgerClient')}>
              {customers.filter((c) => c.kind === 'ledger').map((c) => (
                <option key={c.id} value={c.id}>{c.code} · {c.name} (PKR {fmtNum(c.balance)})</option>
              ))}
            </optgroup>
          </select>
          {customer && (
            <div className="row" style={{ marginTop: 10, gap: 8 }}>
              <span className={`badge ${customer.kind === 'cash' ? 'badge-kraft' : 'badge-purple'}`}>
                {customer.kind === 'cash' ? tr('cashCustomer') : tr('ledgerClient')}
              </span>
              <span className="t-muted">
                {tr('balance')}: <span className="num t-strong">PKR {fmtNum(customer.balance)}</span>
              </span>
            </div>
          )}
          {customer && customer.balance > 0 && (
            <div className="info-card warn" style={{ marginTop: 10, fontSize: 12 }}>
              <div>Outstanding balance: <b>PKR {fmtNum(customer.balance)}</b></div>
            </div>
          )}
          <QuickAddCustomer onCreated={(id) => setCustomerId(id)} />
        </div>

        <div className="card">
          <div className="tabs">
            {FORMS.map((f) => (
              <button key={f} className={`tab ${form === f ? 'active' : ''}`}
                      onClick={() => { setForm(f); setVals({}); setSize(''); setTypeId(''); setRate(''); setErrors([]); }}>
                {tr(f as DictKey)}
              </button>
            ))}
          </div>

          <div className="row wrap" style={{ marginBottom: 14, gap: 8 }}>
            <span className="formula-chip">{spec.formula}</span>
            {onHand !== null && (
              <span className={`badge ${onHand <= 0 ? 'badge-red' : onHand <= 5 ? 'badge-yellow' : 'badge-green'}`}>
                {tr('onHand')}: {fmtNum(onHand)} {unit}
              </span>
            )}
          </div>

          <div className="form-grid">
            {spec.needsType && (
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label>{tr('paperType')}</label>
                <select className="select" value={typeId} onChange={(e) => pickType(e.target.value)}>
                  <option value="">—</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{nameOf(i)}</option>)}
                </select>
              </div>
            )}
            {spec.needsSize && (
              <div className="field">
                <label>{tr('size')}</label>
                <select className="select" value={size} disabled={!item}
                        onChange={(e) => setSize(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">—</option>
                  {sizeOpts.map((s) => (
                    <option key={s.size} value={s.size}>{s.size}″ ({fmtNum(s.quantity)})</option>
                  ))}
                </select>
              </div>
            )}
            {spec.fields.map((f) => (
              <div className="field" key={f}>
                <label>
                  {f === 'qty' ? `${tr('quantity')} (${spec.unitLabel})`
                    : f === 'weightKg' ? tr('weight')
                    : f === 'grammage' ? tr('grammage')
                    : f === 'lengthIn' ? tr('length') : tr('width')}
                </label>
                <input className="input num" type="number" min="0" step="any" value={vals[f] ?? ''}
                       onChange={(e) => setVals({ ...vals, [f]: e.target.value })} />
              </div>
            ))}
            <div className="field">
              <label>{tr('rate')} (PKR)</label>
              <input className="input num" type="number" min="0" step="any" value={rate}
                     onChange={(e) => setRate(e.target.value)} />
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
        <div className="t-muted" style={{ marginTop: 8, textAlign: 'center', fontSize: 11 }}>
          {tr('atomicNote')}
        </div>
      </div>
    </div>
  );
}
