'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, UserPlus, X, History as HistoryIcon } from 'lucide-react';
import { useUi } from './Shell';
import { fmtNum } from '@/lib/i18n';
import { quickAddCustomer, getCustomerHistory, type HistoryEntry, type QuickAddResult } from '@/app/billing/actions';
import { EmptyState } from './EmptyState';

export interface CustomerOpt {
  id: number; code: string; name: string; kind: 'cash' | 'ledger';
  contact: string | null; balance: number;
}

type Mode = 'search' | 'add-cash' | 'add-ledger';

/**
 * Find-or-create, in one place. A walk-in shouldn't need a side trip to a
 * separate Customers screen before they can be billed, and a repeat cash
 * customer typing the same phone number twice should land on the SAME
 * record — not fork it into two, which is exactly how a "customer" stops
 * meaning anything over time. See createOrFindCustomer() in repo.ts.
 */
export function CustomerPanel({
  initialCustomers, customerId, onSelect,
}: {
  initialCustomers: CustomerOpt[];
  customerId: number | '';
  onSelect: (id: number | '') => void;
}) {
  const { tr, lang } = useUi();
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('search');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [creditLimit, setCreditLimit] = useState('0');
  const [ledgerPage, setLedgerPage] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const selected = customers.find((c) => c.id === customerId);

  useEffect(() => {
    if (!customerId) { setHistory(null); return; }
    let cancelled = false;
    setHistoryLoading(true);
    getCustomerHistory(Number(customerId)).then((rows) => {
      if (!cancelled) { setHistory(rows); setHistoryLoading(false); }
    });
    return () => { cancelled = true; };
  }, [customerId]);

  const qDigits = query.replace(/\D/g, '');
  const results = query.trim()
    ? customers.filter((c) => {
        const q = query.trim().toLowerCase();
        return c.name.toLowerCase().includes(q)
          || c.code.toLowerCase().includes(q)
          || (qDigits.length >= 3 && (c.contact ?? '').replace(/\D/g, '').includes(qDigits));
      }).slice(0, 8)
    : [];

  function select(id: number) {
    onSelect(id);
    setQuery('');
    setNotice(null);
  }

  function startAdd(kind: 'cash' | 'ledger') {
    setMode(kind === 'cash' ? 'add-cash' : 'add-ledger');
    setName(query.trim()); // whatever they were searching for is probably the name
    setContact(''); setCreditLimit('0'); setLedgerPage('');
  }

  async function submitAdd() {
    if (!name.trim()) return;
    setBusy(true);
    const fd = new FormData();
    fd.set('kind', mode === 'add-ledger' ? 'ledger' : 'cash');
    fd.set('name', name);
    fd.set('contact', contact);
    if (mode === 'add-ledger') {
      fd.set('credit_limit', creditLimit);
      fd.set('manual_ledger_page', ledgerPage);
    }
    const res: QuickAddResult = await quickAddCustomer(fd);
    setBusy(false);
    if (!res.ok || !res.id) { setNotice(res.error ?? 'Could not add customer'); return; }
    const added: CustomerOpt = {
      id: res.id, code: res.code!, name: res.name!, kind: res.kind!,
      contact: res.contact ?? null, balance: res.balance ?? 0,
    };
    setCustomers((cs) => (cs.some((c) => c.id === added.id) ? cs : [...cs, added]));
    setNotice(res.existed ? `${tr('matchedExisting')} ${added.name} (${added.code})` : null);
    onSelect(added.id);
    setMode('search'); setQuery('');
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="card-title">{tr('customer')}</div>

        {selected ? (
          <div className="cust-selected">
            <div style={{ minWidth: 0 }}>
              <div className="t-strong">{selected.name}</div>
              <div className="row" style={{ gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <span className={`badge ${selected.kind === 'cash' ? 'badge-kraft' : 'badge-purple'}`}>
                  {selected.kind === 'cash' ? tr('cashCustomer') : tr('ledgerClient')}
                </span>
                <span className="t-muted mono" style={{ fontSize: 11 }}>{selected.code}</span>
              </div>
              {selected.contact && <div className="t-muted" style={{ fontSize: 11.5, marginTop: 4 }}>{selected.contact}</div>}
              {selected.kind === 'ledger' && (
                <div className="t-muted" style={{ marginTop: 4 }}>
                  {tr('balance')}: <span className="num t-strong">PKR {fmtNum(selected.balance)}</span>
                </div>
              )}
            </div>
            <button className="icon-btn" onClick={() => { onSelect(''); setNotice(null); }} title={tr('change')}>
              <X size={13} />
            </button>
          </div>
        ) : mode === 'search' ? (
          <>
            <div className="cust-search-wrap">
              <div className="field">
                <div className="row" style={{ gap: 6 }}>
                  <Search size={14} className="t-faint" style={{ flexShrink: 0 }} />
                  <input className="input" placeholder={tr('searchCustomer')}
                         value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
                </div>
              </div>
              {query.trim() && (
                <div className="cust-results">
                  {results.length === 0 ? (
                    <div className="cust-empty-hint">{tr('noMatchesFound')}</div>
                  ) : results.map((c) => (
                    <div key={c.id} className="cust-result-row" onClick={() => select(c.id)}>
                      <span style={{ minWidth: 0 }}>
                        <span className="t-strong" style={{ fontSize: 12.5 }}>{c.name}</span>{' '}
                        <span className="t-muted mono" style={{ fontSize: 11 }}>{c.code}</span>
                        {c.contact && <div className="t-muted" style={{ fontSize: 11 }}>{c.contact}</div>}
                      </span>
                      <span className={`badge ${c.kind === 'cash' ? 'badge-kraft' : 'badge-purple'}`}>
                        {c.kind === 'cash' ? tr('cashCustomer') : tr('ledgerClient')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="cust-quickadd-toggle">
              <button className="cust-quickadd-btn" onClick={() => startAdd('cash')}>
                <UserPlus size={13} /> {tr('newCashCustomer')}
              </button>
              <button className="cust-quickadd-btn ledger" onClick={() => startAdd('ledger')}>
                <UserPlus size={13} /> {tr('newLedgerCustomer')}
              </button>
            </div>
          </>
        ) : (
          <div className="stack sm">
            <div className={`badge ${mode === 'add-cash' ? 'badge-kraft' : 'badge-purple'}`} style={{ alignSelf: 'flex-start' }}>
              {mode === 'add-cash' ? tr('newCashCustomer') : tr('newLedgerCustomer')}
            </div>
            <div className="field">
              <label>{tr('name')}</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div className="field">
              <label>{tr('contact')}</label>
              <input className="input" value={contact} onChange={(e) => setContact(e.target.value)}
                     placeholder="03xx-xxxxxxx" />
            </div>
            {mode === 'add-ledger' && (
              <>
                <div className="field">
                  <label>{tr('creditLimit')}</label>
                  <input className="input num" type="number" min="0" value={creditLimit}
                         onChange={(e) => setCreditLimit(e.target.value)} />
                </div>
                <div className="field">
                  <label>{tr('ledgerPageField')}</label>
                  <input className="input" value={ledgerPage} onChange={(e) => setLedgerPage(e.target.value)} />
                </div>
              </>
            )}
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setMode('search')}>{tr('cancel')}</button>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={!name.trim() || busy} onClick={submitAdd}>
                {tr('createAndSelect')}
              </button>
            </div>
          </div>
        )}

        {notice && (
          <div className="info-card" style={{ marginTop: 10 }}><div>{notice}</div></div>
        )}
      </div>

      {selected && (
        <div className="card">
          <div className="card-title">
            <span className="card-title-icon"><HistoryIcon size={13} /></span>
            {tr('purchaseHistory')}
          </div>
          {historyLoading ? (
            <div className="empty">…</div>
          ) : !history || history.length === 0 ? (
            <EmptyState emoji="🧾" heading={tr('noHistoryYet')} />
          ) : (
            <div>
              {history.map((h) => (
                <div key={h.id} className="history-row">
                  <span style={{ minWidth: 0 }}>
                    <span className="t-muted num">{h.ts.slice(0, 10)}</span>
                    {h.receipt_no && <span className="t-faint num"> · #{h.receipt_no}</span>}
                    <div className="t-strong" style={{ fontSize: 11.5, marginTop: 2 }}>
                      {h.particulars.length > 60 ? `${h.particulars.slice(0, 60)}…` : h.particulars}
                    </div>
                  </span>
                  <span className="num" style={{ flexShrink: 0, textAlign: lang === 'ur' ? 'left' : 'right' }}>
                    {h.debit > 0 && <div className="t-strong">{fmtNum(h.debit)}</div>}
                    {h.credit > 0 && <div className="stat-green">−{fmtNum(h.credit)}</div>}
                  </span>
                </div>
              ))}
              {selected.kind === 'ledger' && (
                <Link href={`/customers/${selected.id}`} className="t-muted"
                      style={{ display: 'block', marginTop: 10, fontSize: 11, textAlign: 'center' }}>
                  {tr('viewFullLedger')} →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
