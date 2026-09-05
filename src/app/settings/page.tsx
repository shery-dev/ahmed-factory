import { getSettings, getExpenseCategories, getPaymentMethods } from '@/lib/settings';
import { listUsers } from '@/lib/auth';
import { saveSettings, addUserAction, editUserAction, deactivateUserAction, activateUserAction, changePasswordAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();
  const categories = getExpenseCategories(settings);
  const methods = getPaymentMethods(settings);
  const users = await listUsers();

  return (
    <>
      <div className="panel-header">
        <h2>Settings</h2>
        <p className="panel-desc">Business details, system lists, and user accounts.</p>
      </div>

      <form action={saveSettings}>
        <div className="split">
          <div className="stack sm">
            <div className="card">
              <div className="card-title">BUSINESS INFORMATION</div>
              <div className="stack sm">
                <div className="field">
                  <label>FACTORY NAME (ENGLISH)</label>
                  <input className="input" name="factory_name" defaultValue={settings.factory_name} />
                </div>
                <div className="field">
                  <label>FACTORY NAME (URDU)</label>
                  <input className="input" name="factory_name_ur" defaultValue={settings.factory_name_ur}
                         style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }} />
                </div>
                <div className="field">
                  <label>ADDRESS</label>
                  <input className="input" name="factory_address" defaultValue={settings.factory_address}
                         placeholder="Factory address for receipts" />
                </div>
                <div className="field">
                  <label>PHONE</label>
                  <input className="input" name="factory_phone" defaultValue={settings.factory_phone}
                         placeholder="Contact number for receipts" />
                </div>
              </div>
            </div>
          </div>

          <div className="stack sm">
            <div className="card">
              <div className="card-title">EXPENSE CATEGORIES</div>
              <p className="t-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                One category per line. Used on the Expenses page.
              </p>
              <textarea className="input" name="expense_categories" rows={8}
                        defaultValue={categories.join('\n')}
                        style={{ fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }} />
            </div>

            <div className="card">
              <div className="card-title">PAYMENT METHODS</div>
              <p className="t-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                One method per line. Used on the billing screen.
              </p>
              <textarea className="input" name="payment_methods" rows={5}
                        defaultValue={methods.join('\n')}
                        style={{ fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }} />
            </div>

            <button className="btn btn-primary btn-block" type="submit">Save All Settings</button>
          </div>
        </div>
      </form>

      {/* Users Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">USER ACCOUNTS</div>
        <p className="t-muted" style={{ fontSize: 12, marginBottom: 12 }}>
          Manage who can access the system. Owner has full access; Counter handles billing; Store manages stock.
        </p>

        <div className="table-wrap" style={{ marginBottom: 16 }}>
          <table>
            <thead>
              <tr>
                <th>USERNAME</th><th>NAME</th><th>ROLE</th><th>STATUS</th><th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td className="mono t-strong">{u.username}</td>
                  <td>{u.name}</td>
                  <td>
                    <span className={`badge ${u.role === 'owner' ? 'badge-purple' : u.role === 'store' ? 'badge-blue' : 'badge-kraft'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {u.active
                      ? <span className="badge badge-green">ACTIVE</span>
                      : <span className="badge badge-red">INACTIVE</span>}
                  </td>
                  <td>
                    <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                      {u.active ? (
                        <form action={deactivateUserAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <button className="icon-btn" style={{ height: 24, minWidth: 24, padding: 0, fontSize: 10, color: 'var(--accent-red-solid)' }} title="Deactivate">{"\u00d7"}</button>
                        </form>
                      ) : (
                        <form action={activateUserAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <button className="icon-btn" style={{ height: 24, minWidth: 24, padding: 0, fontSize: 10, color: 'var(--accent-green-solid)' }} title="Activate">{"\u2713"}</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add User Form */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div className="card-title">ADD NEW USER</div>
          <form action={addUserAction} className="row wrap" style={{ gap: 8 }}>
            <input className="input" name="username" required placeholder="username" style={{ flex: '1 1 120px', padding: '6px 10px', fontSize: 12 }} />
            <input className="input" name="name" required placeholder="Full name" style={{ flex: '1 1 150px', padding: '6px 10px', fontSize: 12 }} />
            <input className="input" name="password" type="password" required placeholder="Password" style={{ flex: '1 1 120px', padding: '6px 10px', fontSize: 12 }} />
            <select className="select" name="role" defaultValue="counter" style={{ flex: '0 1 120px', padding: '6px 10px', fontSize: 12 }}>
              <option value="owner">Owner</option>
              <option value="counter">Counter</option>
              <option value="store">Store</option>
            </select>
            <button className="btn btn-primary" type="submit" style={{ padding: '6px 16px', fontSize: 12 }}>Add User</button>
          </form>
        </div>
      </div>
    </>
  );
}
