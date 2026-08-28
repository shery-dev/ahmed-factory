'use client';
import { useUi } from './Shell';
import type { DictKey } from '@/lib/i18n';

/**
 * Shop-floor screens translate their headers. Management screens (dashboard,
 * catalogue, review) stay English by policy — see the language table in the
 * project briefing.
 */
export function PanelHeader({ title, desc }: { title: DictKey; desc?: DictKey }) {
  const { tr } = useUi();
  return (
    <div className="panel-header">
      <h2>{tr(title)}</h2>
      {desc && <p className="panel-desc">{tr(desc)}</p>}
    </div>
  );
}
