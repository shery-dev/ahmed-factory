import { notFound } from 'next/navigation';
import { getItemType, siblingThickness, sizeRows, movementsFor, largeQtyThreshold } from '@/lib/repo';
import { ProductStock } from '@/components/ProductStock';

export const dynamic = 'force-dynamic';

export default async function ProductStockPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ unit?: string }>;
}) {
  const { id } = await params;
  const { unit = 'roll' } = await searchParams;

  const type = await getItemType(Number(id));
  if (!type) notFound();

  const sibling = await siblingThickness(type);

  return (
    <ProductStock
      type={type}
      sibling={sibling ?? null}
      unit={unit}
      rows={await sizeRows(type.id, unit)}
      movements={await movementsFor(type.id, 14)}
      qtyThreshold={await largeQtyThreshold(type.id, unit as 'roll' | 'reel' | 'tota')}
    />
  );
}
