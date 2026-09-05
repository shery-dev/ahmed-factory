'use client';

import { useUi } from './Shell';

/**
 * Wraps any financial or personal value. When privacy mode is on (eye icon in
 * the top nav), shows ••••• instead of the real value. When off, renders the
 * children exactly as passed — same classes, same layout, same everything.
 *
 * Usage:
 *   <Sensitive className="stat-big num sensitive">PKR {fmtNum(12345)}</Sensitive>
 *
 * The `sensitive` class is kept on the wrapper so any existing CSS that targets
 * it (grid placement, font, color) continues to work unchanged.
 */
export function Sensitive({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { privacyOn } = useUi();
  const cls = className ? `${className} sensitive` : 'sensitive';
  return (
    <span className={cls} style={style}>
      {privacyOn ? '•••••' : children}
    </span>
  );
}
