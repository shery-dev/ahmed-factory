import { BillingForm, type CatalogueItem, type CustomerOpt } from '@/components/BillingForm';
import { PanelHeader } from '@/components/PanelHeader';
import { listItemTypes, listCustomers, sizesFor, customerBalance } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export default function BillingPage() {
  const items: CatalogueItem[] = listItemTypes().map((t) => ({
    id: t.id, name_en: t.name_en, name_ur: t.name_ur, default_rate: t.default_rate,
    sizes: {
      roll: sizesFor(t.id, 'roll'),
      reel: sizesFor(t.id, 'reel'),
      tota: sizesFor(t.id, 'tota'),
    },
  }));
  const customers: CustomerOpt[] = listCustomers().map((c) => ({
    id: c.id, code: c.code, name: c.name, kind: c.kind, balance: customerBalance(c.id),
  }));

  return (
    <>
      <PanelHeader title="newBill" desc="newBillDesc" />
      <BillingForm items={items} customers={customers} />
    </>
  );
}
