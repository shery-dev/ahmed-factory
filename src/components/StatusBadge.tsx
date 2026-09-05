import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * The one place the OK / Low / Out / Quarantined icon+colour pairing is
 * defined. Every status indicator in the app — a stock tile, a billing
 * on-hand check, a flagged ledger row — renders through this, so the pairing
 * can never drift into meaning something different on one screen than
 * another the way the ad-hoc purple/red/yellow badges had started to.
 */
export type Status = 'ok' | 'low' | 'out' | 'quarantined';

const STATUS: Record<Status, { icon: LucideIcon; tone: 'green' | 'amber' | 'red' | 'orange'; badgeCls: string }> = {
  ok:           { icon: CheckCircle2,  tone: 'green', badgeCls: 'badge-green' },
  low:          { icon: AlertTriangle, tone: 'amber', badgeCls: 'badge-yellow' },
  out:          { icon: XCircle,       tone: 'red',   badgeCls: 'badge-red' },
  quarantined:  { icon: ShieldAlert,   tone: 'orange', badgeCls: 'badge-orange' },
};

/** A bare icon in its tinted circle — for tight spaces (a tile corner, a chip). */
export function StatusIcon({ status, size = 11 }: { status: Status; size?: number }) {
  const { icon: I, tone } = STATUS[status];
  return <span className={`icon-badge sm ${tone}`}><I size={size} /></span>;
}

/** Icon + label pill — for a table cell or anywhere a status needs a caption. */
export function StatusBadge({ status, children }: { status: Status; children: ReactNode }) {
  const { icon: I, badgeCls } = STATUS[status];
  return <span className={`badge ${badgeCls}`}><I size={11} />{children}</span>;
}
