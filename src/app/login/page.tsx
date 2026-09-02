import { loginAction } from './actions';

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ redirect?: string; error?: string }> }) {
  const { redirect = '/', error: queryError } = await searchParams;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
    }}>
      <div style={{ width: 360 }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
              background: 'linear-gradient(135deg, var(--accent-kraft), var(--accent-kraft-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#16150f', fontSize: 20,
            }}>AC</div>
            <h2 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>Ahmed Corrugation Machines</h2>
            <p className="t-muted" style={{ fontSize: 12 }}>Sign in to continue</p>
          </div>

          <form action={loginAction}>
            <input type="hidden" name="redirect" value={redirect} />
            {queryError && (
              <div className="info-card warn" style={{ marginBottom: 12 }}>
                <div>{queryError}</div>
              </div>
            )}
            <div className="field" style={{ marginBottom: 12 }}>
              <label>USERNAME</label>
              <input className="input" name="username" required autoFocus placeholder="admin" />
            </div>
            <div className="field" style={{ marginBottom: 16 }}>
              <label>PASSWORD</label>
              <input className="input" name="password" type="password" required placeholder="Enter password" />
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit">Sign In</button>
          </form>

          <div className="t-muted" style={{ marginTop: 16, fontSize: 11, textAlign: 'center' }}>
            Default: admin / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
