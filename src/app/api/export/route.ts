import { NextRequest, NextResponse } from 'next/server';
import { exportBillsCsv, exportExpensesCsv, exportCustomerLedgerCsv, exportStockSummaryCsv } from '@/lib/export';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;

  let csv: string;
  let filename: string;

  switch (type) {
    case 'bills':
      csv = await exportBillsCsv(from, to);
      filename = 'bills.csv';
      break;
    case 'expenses':
      csv = await exportExpensesCsv(from, to, searchParams.get('category') || undefined);
      filename = 'expenses.csv';
      break;
    case 'ledger': {
      const customerId = Number(searchParams.get('customer_id'));
      if (!customerId) return new NextResponse('Missing customer_id', { status: 400 });
      csv = await exportCustomerLedgerCsv(customerId);
      filename = 'ledger.csv';
      break;
    }
    case 'stock':
      csv = await exportStockSummaryCsv();
      filename = 'stock_summary.csv';
      break;
    default:
      return new NextResponse('Invalid type', { status: 400 });
  }

  // Add BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF';
  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="' + filename + '"',
    },
  });
}
