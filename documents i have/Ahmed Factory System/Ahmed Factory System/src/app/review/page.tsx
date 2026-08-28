import { dataIssues } from '@/lib/repo';

export const dynamic = 'force-dynamic';

const SEV: Record<string, string> = { error: 'badge-red', warn: 'badge-yellow', info: 'badge-blue' };

export default function ReviewPage() {
  const issues = dataIssues();
  const byEntity = issues.reduce<Record<string, typeof issues>>((acc, i) => {
    (acc[i.entity] ??= []).push(i);
    return acc;
  }, {});

  return (
    <>
      <div className="panel-header">
        <h2>Needs Attention</h2>
        <p className="panel-desc">
          The import refused to silently trust bad data, and refused to silently drop
          it. Anything that failed a sanity check was brought in as zero, flagged on
          the record, and listed here for a human to resolve. This is the
          &ldquo;fail into a queue, never into an error&rdquo; rule from the Scope of
          Work, applied to the data migration itself.
        </p>
      </div>

      {issues.length === 0 ? (
        <div className="card"><div className="empty">Nothing outstanding.</div></div>
      ) : (
        <div className="stack">
          {Object.entries(byEntity).map(([entity, list]) => (
            <div className="card" key={entity}>
              <div className="row between" style={{ marginBottom: 12 }}>
                <div className="card-title" style={{ margin: 0 }}>{entity.toUpperCase()}</div>
                <span className="badge badge-muted">{list.length}</span>
              </div>
              <div className="stack sm">
                {list.map((i) => (
                  <div key={i.id} className="row" style={{
                    gap: 10, padding: '9px 11px', background: 'var(--bg-elevated)',
                    borderRadius: 8, alignItems: 'flex-start',
                  }}>
                    <span className={`badge ${SEV[i.severity] ?? 'badge-muted'}`}>{i.severity}</span>
                    <span style={{ fontSize: 12.5, lineHeight: 1.55 }}>{i.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="info-card warn" style={{ marginTop: 18 }}>
        <div>
          <b>The two that matter most.</b> Every stock quantity came from the 2022
          spreadsheet and follows arithmetic test patterns — treat all of them as
          unverified until a physical count is entered. And nothing in 12,000 lines
          of legacy code explains what the <b>rent</b> column charges for; it needs
          an answer from the factory before anyone builds on it.
        </div>
      </div>
    </>
  );
}
