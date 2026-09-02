import './globals.css';
import type { Metadata } from 'next';
import { Shell } from '@/components/Shell';
import { dashboard, listBills } from '@/lib/repo';
import { fmtNum } from '@/lib/i18n';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Ahmed Corrugation Machines — Factory System',
  description: 'Billing, ledger and stock for Ahmed Corrugation Machines.',
};

// Always read fresh — this is an operational system, not a marketing site.
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Don’t wrap the login page in the Shell
  const h = headers();
  const pathname = (await h).get('x-invoke-path') || '';
  const isLogin = pathname.includes('/login');

  if (isLogin) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  const d = await dashboard();
  const billsList = await listBills({ limit: 999 });
  const counts = {
    bills: billsList.length,
    customers: d.customers?.n ?? 0,
    products: d.products?.n ?? 0,
    issues: d.issues?.n ?? 0,
    receivable: `PKR ${fmtNum(d.receivable?.v ?? 0)}`,
    salesToday: `PKR ${fmtNum(d.billsToday?.v ?? 0)}`,
  };
  return (
    <html lang="en">
      <body>
        <Shell counts={counts}>{children}</Shell>
      </body>
    </html>
  );
}
