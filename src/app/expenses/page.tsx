import { listExpenses } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { recordExpense } from './actions';
import { ExpenseRow } from '@/components/ExpenseRow';
import { getSettings, getExpenseCategories } from '@/lib/settings';
import { Sensitive } from '@/components/Sensitive';
import { AutoFilter } from '@/components/AutoFilter';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage({
  searchParams,
}: { searchParams: Promise<{ from?: string; to?: string; category?: string }> }) {
  const { from, to, category } = await searchParams;
  const expenses = await listExpenses(from, to, category);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const settings = await getSettings();
  const categories = getExpenseCategories(settings);

  return (
    <>
      <div className="panel-header">
        <h2>Expenses</h2>
      </div>

      <AutoFilter>
        <div className="row wrap" style={{ gap: 8, marginBottom: 16 }}>
          <input className="input" name="from" type="date" defaultValue={from || ''} style={{ flex: '0 1 160px' }} />
          <input className="input" name="to" type="date" defaultValue={to || ''} style={{ flex: '0 1 160px' }} />
          <select className="select" name="category" defaultValue={category || ''} style={{ flex: '0 1 150px' }}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>
          {(from || to || category) && (
            <a className="btn btn-ghost" href="/expenses" style={{ padding: '6px 14px' }}>Clear</a>
          )}
        </div>
      </AutoFilter>

      <div style={{ marginBottom: 12 }}>
        <a className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} href={`/api/export?type=expenses&from=${from || ''}&to=${to || ''}&category=${category || ''}`}>Export CSV</a>
      </div>

      <div className="split">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <Sensitive className="stat-big stat-accent num" style={{ marginBottom: 4 }}>
              PKR {fmtNum(total)}
            </Sensitive>
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
                  <ExpenseRow key={e.id} expense={e} categories={categories} />
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
        </div>
      </div>
    </>
  );
}
