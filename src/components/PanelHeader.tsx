'use client';
import type { ReactNode } from 'react';
import { useUi } from './Shell';
import type { DictKey } from '@/lib/i18n';

/**
 * Shop-floor screens translate their headers. Management screens (dashboard,
 * catalogue, review) stay English by policy — see the language table in the
 * project briefing.
 */
export function PanelHeader({ title, desc, action }: { title: DictKey; desc?: DictKey; action?: ReactNode }) {
  const { tr } = useUi();
  return (
    <div className="panel-header">
      <div className="panel-header-row">
        <h2>{tr(title)}</h2>
        {action}
      </div>
      {desc && <p className="panel-desc">{tr(desc)}</p>}
    </div>
  );
}
