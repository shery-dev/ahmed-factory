import './globals.css';
import type { Metadata } from 'next';
import { Shell } from '@/components/Shell';
import { dashboard, listBills, dataIssues } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Ahmed Corrugation Machines — Factory System',
  description: 'Billing, ledger and stock for Ahmed Corrugation Machines.',
};

// Always read fresh — this is an operational system, not a marketing site.
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const d = dashboard();
  const counts = {
    bills: listBills(999).length,
    customers: d.customers.n,
    products: d.products.n,
    issues: d.issues.n,
    receivable: `PKR ${fmtNum(d.receivable.v)}`,
    salesToday: `PKR ${fmtNum(d.billsToday.v)}`,
  };
  return (
    <html lang="en">
      <body>
        <Shell counts={counts}>{children}</Shell>
      </body>
    </html>
  );
}
