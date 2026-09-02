import { BillingForm, type CatalogueItem, type CustomerOpt } from '@/components/BillingForm';
import { PanelHeader } from '@/components/PanelHeader';
import { listItemTypes, listCustomers, sizesFor, customerBalance } from '@/lib/repo';
import { getSettings, getPaymentMethods } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const itemTypes = await listItemTypes();
  const items: CatalogueItem[] = await Promise.all(itemTypes.map(async (t) => ({
    id: t.id, name_en: t.name_en, name_ur: t.name_ur, default_rate: t.default_rate,
    sizes: {
      roll: await sizesFor(t.id, 'roll'),
      reel: await sizesFor(t.id, 'reel'),
      tota: await sizesFor(t.id, 'tota'),
    },
  })));
  const customersList = await listCustomers();
  const customers: CustomerOpt[] = await Promise.all(customersList.map(async (c) => ({
    id: c.id, code: c.code, name: c.name, kind: c.kind, balance: await customerBalance(c.id),
  })));

  const settings = await getSettings();
  const paymentMethods = getPaymentMethods(settings);

  return (
    <>
      <PanelHeader title="newBill" desc="newBillDesc" />
      <BillingForm items={items} customers={customers} paymentMethods={paymentMethods} />
    </>
  );
}
