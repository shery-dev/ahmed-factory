import { listExpenses } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { recordExpense } from './actions';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage({
  searchParams,
}: { searchParams: Promise<{ from?: string; to?: string; category?: string }> }) {
  const { from, to, category } = await searchParams;
  const expenses = listExpenses(from, to, category);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const categories = ['general', 'diesel', 'transport', 'chai', 'loading', 'maintenance', 'rent', 'salary', 'other'];

  return (
    <>
      <div className="panel-header">
        <h2>Expenses</h2>
        <p className="panel-desc">
          One row per expense with a category. The 2022 system concatenated several
          into one cell with <span className="mono">||</span>, making analysis impossible.
          Type a detail and amount, pick a category, and it appears here.
        </p>
      </div>

      <div className="split">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="stat-big stat-accent num" style={{ marginBottom: 4 }}>
              PKR {fmtNum(total)}
            </div>
            <div className="stat-sub">{expenses.length} entries shown</div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>DATE</th><th>CATEGORY</th><th>DETAIL</th>
                  <th className="right">AMOUNT</th><th>BY</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={5} className="t-muted" style={{ textAlign: 'center', padding: 24 }}>No expenses recorded yet</td></tr>
                ) : expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="num t-muted">{e.ts.slice(0, 10)}</td>
                    <td><span className="badge badge-muted">{e.category}</span></td>
                    <td>{e.detail}</td>
                    <td className="right num t-strong">{fmtNum(e.amount)}</td>
                    <td className="t-muted">{e.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">ADD EXPENSE</div>
          <form action={recordExpense} className="stack sm">
            <div className="field">
              <label>CATEGORY</label>
              <select className="select" name="category" defaultValue="general">
                {categories.map((c) => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>DETAIL</label>
              <input className="input" name="detail" required
                     placeholder="e.g. Diesel for generator" />
            </div>
            <div className="field">
              <label>AMOUNT (PKR)</label>
              <input className="input num" name="amount" type="number" step="any" required />
            </div>
            <button className="btn btn-primary btn-block">Record Expense</button>
          </form>
          <div className="info-card good" style={{ marginTop: 14 }}>
            <div>
              This is the seed of agent A6 from the Scope of Work. Soon the owner
              will be able to type <span className="mono">diesel 3000, chai 400, loading 1200</span> and
              the system will split it into categorised rows for confirmation.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
