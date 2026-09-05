import Link from 'next/link';

/**
 * One shape for every "nothing here yet" moment in the app: an emoji, a
 * short bold heading, one sentence, and — only where there's something
 * useful to do about it — a single action. Plain Unicode emoji rather than
 * lucide here on purpose: these are the one deliberately informal spot in an
 * otherwise icon-system-driven UI, per the design brief for this pass.
 */
export function EmptyState({
  emoji, heading, message, actionLabel, actionHref,
}: {
  emoji: string; heading: string; message?: string;
  actionLabel?: string; actionHref?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-emoji" aria-hidden>{emoji}</div>
      <div className="empty-heading">{heading}</div>
      {message && <div className="empty-message">{message}</div>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary" style={{ marginTop: 12 }}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
