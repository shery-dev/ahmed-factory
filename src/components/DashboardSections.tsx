'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { X, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'dashboard-hidden';

interface HiddenCtx {
  hidden: Set<string>;
  ready: boolean;
  toggle: (id: string) => void;
  restoreAll: () => void;
}

const Ctx = createContext<HiddenCtx>({
  hidden: new Set(), ready: false,
  toggle: () => {}, restoreAll: () => {},
});

function HiddenProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHidden(new Set(JSON.parse(raw) as string[]));
    } catch {}
    setReady(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const restoreAll = useCallback(() => {
    setHidden(new Set());
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return <Ctx.Provider value={{ hidden, ready, toggle, restoreAll }}>{children}</Ctx.Provider>;
}

/**
 * Restore button — appears in the dashboard header when any section is hidden.
 * Clicking it shows all hidden sections again.
 */
export function RestoreButton() {
  const { hidden, ready, restoreAll } = useContext(Ctx);
  if (hidden.size === 0 || !ready) return null;
  return (
    <button
      className="icon-btn"
      onClick={restoreAll}
      title="Show hidden sections"
      style={{ fontSize: 12, gap: 4 }}
    >
      <RotateCcw size={13} />
      <span>Restore</span>
    </button>
  );
}

/**
 * Wraps a hideable dashboard section. When the section's id is in the hidden
 * set, renders nothing. Otherwise renders its children.
 */
export function DashboardSections({ children, id }: { children: React.ReactNode; id: string }) {
  const { hidden } = useContext(Ctx);
  if (hidden.has(id)) return null;
  return <>{children}</>;
}

/**
 * Small X button on each dashboard card. Clicking hides that card.
 * Must be rendered inside a <DashboardSections> wrapper (which provides state).
 */
export function HideButton({ id }: { id: string }) {
  const { toggle } = useContext(Ctx);
  return (
    <button
      className="hide-card-btn"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
      title="Hide this section"
    >
      <X size={13} />
    </button>
  );
}

/**
 * Page-level wrapper — the dashboard page renders this once around its content.
 * It provides the shared hidden-state context to all DashboardSections and
 * HideButton children inside.
 */
export function DashboardVisibility({ children }: { children: ReactNode }) {
  return <HiddenProvider>{children}</HiddenProvider>;
}
