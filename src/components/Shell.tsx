'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { t, dirFor, type Lang, type DictKey } from '@/lib/i18n';

// ─── Language + theme context ─────────────────────────────────────────────────
interface UiCtx { lang: Lang; setLang: (l: Lang) => void; tr: (k: DictKey) => string; }
const Ui = createContext<UiCtx>({ lang: 'en', setLang: () => {}, tr: (k) => k });
export const useUi = () => useContext(Ui);

export interface SidebarCounts {
  bills: number; customers: number; products: number; issues: number;
  receivable: string; salesToday: string;
}

export function Shell({ children, counts }: { children: ReactNode; counts: SidebarCounts }) {
  const [lang, setLang] = useState<Lang>('en');
  const [light, setLight] = useState(false);
  // Guards the save effect so it cannot write the default over a stored
  // preference before the restore has been applied.
  const [restored, setRestored] = useState(false);
  const pathname = usePathname();

  // Restore preferences. Wrapped because storage can throw (private windows,
  // blocked site data) — a failure must still leave a usable page.
  useEffect(() => {
    try {
      const l = localStorage.getItem('acm-lang') as Lang | null;
      const th = localStorage.getItem('acm-theme');
      if (l === 'ur' || l === 'en') setLang(l);
      if (th === 'light') setLight(true);
    } catch {}
    setRestored(true);
  }, []);

  useEffect(() => {
    document.body.setAttribute('dir', dirFor(lang));
    document.body.classList.toggle('light', light);
    if (!restored) return;   // never persist before restore has run
    try {
      localStorage.setItem('acm-lang', lang);
      localStorage.setItem('acm-theme', light ? 'light' : 'dark');
    } catch {}
  }, [lang, light, restored]);

  const tr = (k: DictKey) => t(k, lang);

  type NavEntry = { href: string; label: DictKey; count?: number; alert?: boolean };
  const nav: NavEntry[] = [
    { href: '/',          label: 'dashboard' },
    { href: '/billing',   label: 'newBill' },
    { href: '/bills',     label: 'bills',     count: counts.bills },
    { href: '/customers', label: 'customers', count: counts.customers },
    { href: '/stock',     label: 'stock' },
    { href: '/expenses',  label: 'expenses' as DictKey },
  ];
  const setup: NavEntry[] = [
    { href: '/catalogue', label: 'catalogue', count: counts.products },
    { href: '/review',    label: 'review',    count: counts.issues, alert: counts.issues > 0 },
    { href: '/changes',   label: 'changes' },
  ];

  const Item = ({ href, label: k, count, alert }: NavEntry) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return (
      <Link href={href} className={`sidebar-item ${active ? 'active' : ''}`}>
        <span className="item-dot" />
        <span>{tr(k)}</span>
        {count !== undefined && (
          <span className={`item-count num ${alert ? 'alert' : ''}`}>{count}</span>
        )}
      </Link>
    );
  };

  return (
    <Ui.Provider value={{ lang, setLang, tr }}>
      <nav className="top-nav no-print">
        <div className="nav-left">
          <div className="nav-mark">AC</div>
          <span className="nav-title">{tr('appName')}</span>
          <span className="nav-separator">|</span>
          <span className="nav-subtitle">
            {lang === 'ur' ? 'بلنگ، کھاتہ اور اسٹاک' : 'Billing, Ledger & Stock'}
          </span>
        </div>
        <div className="nav-right">
          <span className="nav-badge">PROTOTYPE</span>
          <button
            className={`icon-btn ${lang === 'ur' ? 'on' : ''}`}
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
            title="Switch language / زبان تبدیل کریں"
          >
            {lang === 'en' ? 'اردو' : 'EN'}
          </button>
          <button className="icon-btn" onClick={() => setLight(!light)} title="Theme">
            {light ? '☾' : '☀'}
          </button>
        </div>
      </nav>

      <div className="app-container">
        <aside className="sidebar no-print">
          <div className="sidebar-section">
            <div className="sidebar-label">{tr('operations')}</div>
            {nav.map((n) => <Item key={n.href} {...n} />)}
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">{tr('setup')}</div>
            {setup.map((n) => <Item key={n.href} {...n} />)}
          </div>
          <div className="sidebar-section sidebar-stats">
            <div className="sidebar-label">{tr('activity')}</div>
            <div className="stat-row">
              <span>{tr('todaysSales')}</span>
              <span className="stat-value">{counts.salesToday}</span>
            </div>
            <div className="stat-row">
              <span>{tr('receivable')}</span>
              <span className="stat-value">{counts.receivable}</span>
            </div>
          </div>
        </aside>
        <main className="main-content">{children}</main>
      </div>
    </Ui.Provider>
  );
}

/** Small helper so server-rendered pages can still use translated labels. */
export function T({ k }: { k: DictKey }) {
  const { tr } = useUi();
  return <>{tr(k)}</>;
}
