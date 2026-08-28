import { allDataIssues } from '@/lib/repo';
import { resolveIssueAction } from '@/app/expenses/actions';

export const dynamic = 'force-dynamic';

const SEV: Record<string, string> = { error: 'badge-red', warn: 'badge-yellow', info: 'badge-blue' };

export default async function ReviewPage({
  searchParams,
}: { searchParams: Promise<{ filter?: string }> }) {
  const { filter = 'open' } = await searchParams;
  const resolved = filter === 'resolved';
  const issues = await allDataIssues(resolved);

  const byEntity = issues.reduce<Record<string, typeof issues>>((acc, i) => {
    (acc[i.entity] ??= []).push(i);
    return acc;
  }, {});

  const openCount = (await allDataIssues(false)).length;
  const resolvedCount = (await allDataIssues(true)).length;

  return (
    <>
      <div className="panel-header">
        <h2>Needs Attention</h2>
        <p className="panel-desc">
          The import refused to silently trust bad data, and refused to silently drop
          it. Anything that failed a sanity check was brought in as zero, flagged on
          the record, and listed here for a human to resolve.
        </p>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        <a href="/review?filter=open" className={`tab ${!resolved ? 'active' : ''}`}>
          Open ({openCount})
        </a>
        <a href="/review?filter=resolved" className={`tab ${resolved ? 'active' : ''}`}>
          Resolved ({resolvedCount})
        </a>
      </div>

      {issues.length === 0 ? (
        <div className="card">
          <div className="empty">
            {resolved ? 'Nothing resolved yet.' : 'Nothing outstanding. Queue is clear.'}
          </div>
        </div>
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
                    <span style={{ fontSize: 12.5, lineHeight: 1.55, flex: 1 }}>{i.detail}</span>
                    {!resolved && (
                      <form action={resolveIssueAction} className="row" style={{ gap: 6, alignItems: 'center' }}>
                        <input type="hidden" name="id" value={i.id} />
                        <input className="input" name="note" placeholder="Note"
                               style={{ width: 120, padding: '4px 8px', fontSize: 11 }} />
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>
                          Resolve
                        </button>
                      </form>
                    )}
                    {resolved && (
                      <span className="badge badge-green">DONE</span>
                    )}
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
