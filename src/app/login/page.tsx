import { loginAction } from './actions';

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ redirect?: string; error?: string }> }) {
  const { redirect = '/', error: queryError } = await searchParams;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 20%, var(--accent-kraft-soft) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, var(--accent-blue-bg) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: 400, position: 'relative', zIndex: 1 }}>
        <div className="card" style={{ padding: '36px 32px' }}>
          {/* Logo + Title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, var(--accent-kraft), var(--accent-kraft-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fff', fontSize: 22,
              boxShadow: '0 4px 20px var(--accent-kraft-bg)',
            }}>AC</div>
            <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Ahmed Corrugation Machines
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
              Sign in to your account
            </p>
          </div>

          <form action={loginAction}>
            <input type="hidden" name="redirect" value={redirect} />
            {queryError && (
              <div className="info-card warn" style={{ marginBottom: 16 }}>
                <div>{queryError}</div>
              </div>
            )}
            <div className="field" style={{ marginBottom: 14 }}>
              <label>USERNAME</label>
              <input className="input" name="username" required autoFocus placeholder="Enter username" />
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>PASSWORD</label>
              <input className="input" name="password" type="password" required placeholder="Enter password" />
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit">
              Sign In
            </button>
          </form>

          <div style={{
            marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)',
            textAlign: 'center', color: 'var(--text-faint)', fontSize: 11,
          }}>
            Default credentials: <span className="mono">admin</span> / <span className="mono">admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
