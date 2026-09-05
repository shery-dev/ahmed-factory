'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { t, dirFor, type Lang, type DictKey } from '@/lib/i18n';
import { logoutAction } from '@/app/login/actions';

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
  const [restored, setRestored] = useState(false);
  const pathname = usePathname();

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
    if (!restored) return;
    try {
      localStorage.setItem('acm-lang', lang);
      localStorage.setItem('acm-theme', light ? 'light' : 'dark');
    } catch {}
  }, [lang, light, restored]);

  const tr = (k: DictKey) => t(k, lang);

  type NavEntry = { href: string; label: DictKey; count?: number; alert?: boolean; icon: string };
  const nav: NavEntry[] = [
    { href: '/',          label: 'dashboard',  icon: '\u2302' },
    { href: '/billing',   label: 'newBill',    icon: '\u002B' },
    { href: '/bills',     label: 'bills',      count: counts.bills, icon: '\u2637' },
    { href: '/customers', label: 'customers',  count: counts.customers, icon: '\u263A' },
    { href: '/stock',     label: 'stock',      icon: '\u25A3' },
    { href: '/expenses',  label: 'expenses' as DictKey, icon: '\u0024' },
    { href: '/reports',   label: 'reports' as DictKey, icon: '\u2636' },
  ];
  const setup: NavEntry[] = [
    { href: '/catalogue', label: 'catalogue', count: counts.products, icon: '\u2630' },
    { href: '/review',    label: 'review',    count: counts.issues, alert: counts.issues > 0, icon: '\u26A0' },
    { href: '/changes',   label: 'changes',   icon: '\u21BA' },
    { href: '/settings',  label: 'settings' as DictKey, icon: '\u2699' },
  ];

  const Item = ({ href, label: k, count, alert, icon }: NavEntry) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return (
      <Link href={href} className={`sidebar-item ${active ? 'active' : ''}`}>
        <span className="item-icon">{icon}</span>
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
          <span className="nav-separator">{'\u2502'}</span>
          <span className="nav-subtitle">
            {lang === 'ur' ? '\u0628\u0644\u0646\u06AF\u060C \u06A9\u06BE\u0627\u062A\u06C1 \u0627\u0648\u0631 \u0627\u0633\u0679\u0627\u06A9' : 'Billing, Ledger & Stock'}
          </span>
        </div>
        <div className="nav-right">
          <span className="nav-badge">FACTORY</span>
          <button
            className={`icon-btn ${lang === 'ur' ? 'on' : ''}`}
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
            title="Switch language"
          >
            {lang === 'en' ? '\u0627\u0631' : 'EN'}
          </button>
          <form action={logoutAction} style={{ display: 'inline' }}>
            <button type="submit" className="icon-btn" title="Logout" style={{ fontSize: 14 }}>{'\u21A9'}</button>
          </form>
          <button className="icon-btn" onClick={() => setLight(!light)} title="Theme">
            {light ? '\u263E' : '\u2600'}
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

export function T({ k }: { k: DictKey }) {
  const { tr } = useUi();
  return <>{tr(k)}</>;
}
