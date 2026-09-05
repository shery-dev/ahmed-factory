import { Disc, Disc3, Package2, type LucideIcon } from 'lucide-react';

/**
 * One small icon per stock unit — rolls, reels, totay. Reused wherever a
 * unit needs to be picked (stock home, product detail), so the shape of
 * "this is a roll" is defined exactly once, the same way the pricing
 * formulas are. Backed by lucide-react, the app's one icon library.
 */
const UNIT_ICON: Record<string, LucideIcon> = {
  roll: Disc,    // a roll, seen end-on
  reel: Disc3,   // a reel — concentric rims read as "wound"
  tota: Package2, // a tied bundle
};

export function UnitIcon({ unit, size = 17 }: { unit: string; size?: number }) {
  const I = UNIT_ICON[unit];
  return I ? <I size={size} /> : null;
}
