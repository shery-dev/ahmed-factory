/**
 * THE PRICING ENGINE — single source of truth.
 *
 * Every formula below was extracted from the 2022 codebase
 * (CashBillclass.py) and verified line by line. They are the most
 * valuable thing in the legacy system and they must not drift.
 *
 * In the old system these calculations were duplicated inside PyQt button
 * handlers across several files. Here there is exactly one implementation,
 * which the UI, the API and any future quotation agent all call.
 *
 * DO NOT reimplement any of these anywhere else.
 */

export type SaleForm =
  | 'rolls' | 'reels' | 'packets' | 'totay' | 'jutta' | 'raddi' | 'nali';

/** Converts square inches × gsm to the ream basis used in the paper trade. */
export const REAM_CONSTANT = 15500;

export interface LineInput {
  form: SaleForm;
  itemTypeId?: number | null;
  itemTypeName?: string;
  size?: number | null;       // width, inches
  qty?: number | null;        // rolls: count | packets: number of packets
  weightKg?: number | null;   // reels, totay, jutta, raddi, nali
  grammage?: number | null;   // packets
  lengthIn?: number | null;   // packets
  widthIn?: number | null;    // packets
  rate: number;
}

export interface PricedLine extends LineInput {
  amount: number;
  description: string;
  unit: 'roll' | 'reel' | 'tota' | null;
  /** How much stock this line consumes, if it touches stock at all. */
  stockDraw: { unit: 'roll' | 'reel' | 'tota'; size: number; quantity: number } | null;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Rolls: rate × size × quantity
 *
 * NOTE: size (width in inches) is a MULTIPLIER, not just a label. The rate is
 * per inch of width, per roll. This is the single easiest formula in the
 * system to get wrong — a naive `rate × qty` under-bills by a factor of ~20.
 * Verified against add_rolls() in CashBillclass.py.
 */
export function priceRolls(i: LineInput): number {
  return round2(i.rate * (i.size ?? 0) * (i.qty ?? 0));
}

/** Reels: rate × weight (kg). Verified against add_reels(). */
export function priceReels(i: LineInput): number {
  return round2(i.rate * (i.weightKg ?? 0));
}

/**
 * Packets: (length × width × grammage ÷ 15500) × packets × rate
 * Verified against add_packets(). The 15500 is the trade's ream conversion.
 */
export function pricePackets(i: LineInput): number {
  const area = (i.lengthIn ?? 0) * (i.widthIn ?? 0) * (i.grammage ?? 0);
  return round2((area / REAM_CONSTANT) * (i.qty ?? 0) * i.rate);
}

/** Totay: rate × weight (kg). Verified against add_totay(). */
export function priceTotay(i: LineInput): number {
  return round2(i.rate * (i.weightKg ?? 0));
}

/** Jutta, Raddi, Nali: rate × weight (kg). Not stock-tracked. */
export function priceByWeight(i: LineInput): number {
  return round2(i.rate * (i.weightKg ?? 0));
}

export function priceLine(i: LineInput): number {
  switch (i.form) {
    case 'rolls':   return priceRolls(i);
    case 'reels':   return priceReels(i);
    case 'packets': return pricePackets(i);
    case 'totay':   return priceTotay(i);
    case 'jutta':
    case 'raddi':
    case 'nali':    return priceByWeight(i);
    default:        return 0;
  }
}

/** Human-readable line text, matching the shorthand staff already use. */
export function describeLine(i: LineInput): string {
  const t = i.itemTypeName ?? '';
  switch (i.form) {
    case 'rolls':   return `${i.size} ${t} ${i.qty} Rolls`;
    case 'reels':   return `${i.size} ${t} ${i.weightKg} Kg Reel`;
    case 'packets': return `${i.lengthIn}x${i.widthIn} ${t} ${i.grammage}gsm ${i.qty} Packets`;
    case 'totay':   return `${i.size} ${t} ${i.weightKg} Kg Tota`;
    case 'jutta':   return `${i.weightKg} Kg Jutta`;
    case 'raddi':   return `Raddi ${i.weightKg} Kg`;
    case 'nali':    return `Nali ${i.weightKg} Kg`;
    default:        return t;
  }
}

/** Which sale forms draw down stock, and in what unit. */
const STOCK_UNIT: Partial<Record<SaleForm, 'roll' | 'reel' | 'tota'>> = {
  rolls: 'roll',
  reels: 'reel',
  totay: 'tota',
  packets: 'reel', // packets are cut from a reel (or a tota — see note below)
};

export function priceAndDescribe(i: LineInput): PricedLine {
  const amount = priceLine(i);
  const unit = STOCK_UNIT[i.form] ?? null;

  let stockDraw: PricedLine['stockDraw'] = null;
  if (unit && i.size != null) {
    // rolls draw a count; reels/totay draw kilograms
    const quantity =
      i.form === 'rolls' ? (i.qty ?? 0)
      : i.form === 'packets' ? 0            // consumption modelled at conversion, not sale
      : (i.weightKg ?? 0);
    if (quantity > 0) stockDraw = { unit, size: i.size, quantity };
  }

  return { ...i, amount, unit, description: describeLine(i), stockDraw };
}

export interface BillTotals {
  subtotal: number;
  rent: number;
  credit: number;
  /** What the customer still owes on this bill. */
  net: number;
}

export function billTotals(
  lines: { amount: number }[],
  rent = 0,
  credit = 0,
): BillTotals {
  const subtotal = round2(lines.reduce((s, l) => s + l.amount, 0));
  return {
    subtotal,
    rent: round2(rent),
    credit: round2(credit),
    net: round2(subtotal + rent - credit),
  };
}

/** Field requirements per sale form — drives both the UI and validation. */
export const FORM_FIELDS: Record<SaleForm, {
  needsType: boolean; needsSize: boolean;
  fields: ('qty' | 'weightKg' | 'grammage' | 'lengthIn' | 'widthIn')[];
  formula: string;
  unitLabel: string;
}> = {
  rolls:   { needsType: true,  needsSize: true,  fields: ['qty'],
             formula: 'rate × size × quantity', unitLabel: 'rolls' },
  reels:   { needsType: true,  needsSize: true,  fields: ['weightKg'],
             formula: 'rate × weight', unitLabel: 'kg' },
  packets: { needsType: true,  needsSize: false, fields: ['lengthIn', 'widthIn', 'grammage', 'qty'],
             formula: '(L × W × gsm ÷ 15500) × packets × rate', unitLabel: 'packets' },
  totay:   { needsType: true,  needsSize: true,  fields: ['weightKg'],
             formula: 'rate × weight', unitLabel: 'kg' },
  jutta:   { needsType: false, needsSize: false, fields: ['weightKg'],
             formula: 'rate × weight', unitLabel: 'kg' },
  raddi:   { needsType: false, needsSize: false, fields: ['weightKg'],
             formula: 'rate × weight', unitLabel: 'kg' },
  nali:    { needsType: false, needsSize: false, fields: ['weightKg'],
             formula: 'rate × weight', unitLabel: 'kg' },
};

export function validateLine(i: LineInput): string[] {
  const spec = FORM_FIELDS[i.form];
  const errs: string[] = [];
  if (spec.needsType && !i.itemTypeId) errs.push('Paper type not selected');
  if (spec.needsSize && !i.size)       errs.push('Size not selected');
  if (!(i.rate > 0))                   errs.push('Rate must be greater than zero');
  for (const f of spec.fields) {
    const v = i[f];
    if (v == null || !(Number(v) > 0)) errs.push(`${f} must be greater than zero`);
  }
  return errs;
}
