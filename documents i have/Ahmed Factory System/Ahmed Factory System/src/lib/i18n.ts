/**
 * Bilingual layer — English / Urdu.
 *
 * Policy from the project briefing:
 *   Shop floor  → Urdu primary   (billing, stock, receipts, errors, buttons)
 *   Management  → English primary (reports, dashboards)
 *   System      → English only    (code, database, logs)
 *
 * TRADE VOCABULARY IS NOT TRANSLATED. Raddi, Jutta, Totay, Nali, Bareek, Reel,
 * Roll and Tota are what the staff actually say. They are transliterated into
 * Urdu script, never replaced with an English equivalent.
 *
 * Every string the staff can see is a key here. Nothing is hardcoded in a
 * component. This is what makes retrofitting unnecessary later.
 */

export type Lang = 'en' | 'ur';

export const dict = {
  // ── Navigation ──
  appName:      { en: 'Ahmed Corrugation Machines', ur: 'احمد کورو گیشن مشینز' },
  dashboard:    { en: 'Dashboard',        ur: 'ڈیش بورڈ' },
  newBill:      { en: 'New Bill',         ur: 'نیا بل' },
  bills:        { en: 'Bills',            ur: 'بل' },
  customers:    { en: 'Customers',        ur: 'گاہک' },
  stock:        { en: 'Stock',            ur: 'اسٹاک' },
  catalogue:    { en: 'Catalogue',        ur: 'پروڈکٹ لسٹ' },
  review:       { en: 'Needs Attention',  ur: 'توجہ درکار' },
  changes:      { en: 'What Changed',     ur: 'کیا تبدیل ہوا' },
  operations:   { en: 'OPERATIONS',       ur: 'آپریشنز' },
  setup:        { en: 'SETUP',            ur: 'سیٹ اپ' },
  activity:     { en: 'ACTIVITY',         ur: 'سرگرمی' },

  // ── Sale forms (trade terms kept) ──
  rolls:        { en: 'Rolls',    ur: 'رول' },
  reels:        { en: 'Reels',    ur: 'ریل' },
  packets:      { en: 'Packets',  ur: 'پیکٹ' },
  totay:        { en: 'Totay',    ur: 'ٹوٹے' },
  jutta:        { en: 'Jutta',    ur: 'جوتا' },
  raddi:        { en: 'Raddi',    ur: 'ردی' },
  nali:         { en: 'Nali',     ur: 'نالی' },

  // ── Billing ──
  customer:     { en: 'Customer',        ur: 'گاہک' },
  cashCustomer: { en: 'Cash Customer',   ur: 'نقد گاہک' },
  ledgerClient: { en: 'Ledger Client',   ur: 'کھاتہ گاہک' },
  selectCustomer:{en: 'Select customer', ur: 'گاہک منتخب کریں' },
  paperType:    { en: 'Paper Type',      ur: 'کاغذ کی قسم' },
  size:         { en: 'Size',            ur: 'سائز' },
  quantity:     { en: 'Quantity',        ur: 'تعداد' },
  weight:       { en: 'Weight (Kg)',     ur: 'وزن (کلو)' },
  rate:         { en: 'Rate',            ur: 'ریٹ' },
  grammage:     { en: 'Grammage (gsm)',  ur: 'گرام' },
  length:       { en: 'Length (in)',     ur: 'لمبائی' },
  width:        { en: 'Width (in)',      ur: 'چوڑائی' },
  addLine:      { en: 'Add to Bill',     ur: 'بل میں شامل کریں' },
  remove:       { en: 'Remove',          ur: 'ہٹائیں' },
  subtotal:     { en: 'Subtotal',        ur: 'میزان' },
  rent:         { en: 'Rent',            ur: 'کرایہ' },
  paidNow:      { en: 'Paid Now',        ur: 'ادا شدہ' },
  netDue:       { en: 'Net Due',         ur: 'بقایا' },
  postBill:     { en: 'Post Bill',       ur: 'بل جمع کریں' },
  billItems:    { en: 'Bill Items',      ur: 'بل کی اشیاء' },
  noItems:      { en: 'No items added yet', ur: 'ابھی کوئی چیز شامل نہیں' },
  onHand:       { en: 'On hand',         ur: 'موجود' },
  amount:       { en: 'Amount',          ur: 'رقم' },
  item:         { en: 'Item',            ur: 'چیز' },
  balance:      { en: 'Balance',         ur: 'بقایا' },
  date:         { en: 'Date',            ur: 'تاریخ' },
  receipt:      { en: 'Receipt',         ur: 'رسید' },
  contact:      { en: 'Contact',         ur: 'رابطہ' },
  print:        { en: 'Print Receipt',   ur: 'رسید پرنٹ کریں' },
  paymentMethod:{ en: 'Payment method',  ur: 'ادائیگی کا طریقہ' },
  cash:         { en: 'Cash',            ur: 'نقد' },
  total:        { en: 'Total',           ur: 'کل' },

  // ── Feedback ──
  billPosted:   { en: 'Bill posted',     ur: 'بل جمع ہو گیا' },
  billFailed:   { en: 'Bill not posted', ur: 'بل جمع نہیں ہوا' },
  whatHappened: { en: 'What this bill changed', ur: 'اس بل سے کیا تبدیل ہوا' },
  notEnoughStock:{en: 'Not enough stock', ur: 'اسٹاک کم ہے' },
  newBillBtn:   { en: 'Start Another Bill', ur: 'نیا بل شروع کریں' },
  viewReceipt:  { en: 'View Receipt',    ur: 'رسید دیکھیں' },

  // ── Shop-floor page headers (Urdu primary, per the language policy) ──
  newBillDesc:  { en: 'Seven sale forms, each with the pricing rule verified from the 2022 code. Stock is checked before anything is written; posting updates the ledger, the stock and the receipt sequence in a single transaction.',
                  ur: 'سات فروخت کے فارم، ہر ایک کا ریٹ 2022 کے کوڈ سے تصدیق شدہ۔ کچھ لکھنے سے پہلے اسٹاک چیک ہوتا ہے؛ بل جمع کرنے پر کھاتہ، اسٹاک اور رسید نمبر ایک ہی ٹرانزیکشن میں اپ ڈیٹ ہوتے ہیں۔' },
  stockDesc:    { en: 'Rolls are counted; reels and totay are held in kilograms. Every movement names the bill that caused it.',
                  ur: 'رول گنتی میں، ریل اور ٹوٹے کلو میں۔ ہر حرکت اس بل کا نام بتاتی ہے جس کی وجہ سے ہوئی۔' },
  atomicNote:   { en: 'Posts ledger + stock + receipt in one transaction',
                  ur: 'کھاتہ، اسٹاک اور رسید ایک ساتھ جمع ہوتے ہیں' },

  // ── Misc ──
  search:       { en: 'Search',          ur: 'تلاش' },
  add:          { en: 'Add',             ur: 'شامل کریں' },
  save:         { en: 'Save',            ur: 'محفوظ کریں' },
  name:         { en: 'Name',            ur: 'نام' },
  type:         { en: 'Type',            ur: 'قسم' },
  unit:         { en: 'Unit',            ur: 'یونٹ' },
  roll:         { en: 'roll',            ur: 'رول' },
  reel:         { en: 'reel',            ur: 'ریل' },
  tota:         { en: 'tota',            ur: 'ٹوٹا' },
  outstanding:  { en: 'Outstanding',     ur: 'واجب الادا' },
  todaysBills:  { en: "Today's Bills",   ur: 'آج کے بل' },
  todaysSales:  { en: "Today's Sales",   ur: 'آج کی فروخت' },
  receivable:   { en: 'Receivable',      ur: 'وصولی' },
  products:     { en: 'Products',        ur: 'پروڈکٹس' },
  lowStock:     { en: 'Low Stock',       ur: 'کم اسٹاک' },
  noData:       { en: 'Nothing to show yet', ur: 'ابھی کچھ نہیں' },
} as const;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, lang: Lang): string {
  const e = dict[key];
  return (e?.[lang] ?? e?.en ?? key) as string;
}

/** Urdu is right-to-left. The whole document direction flips. */
export const dirFor = (lang: Lang) => (lang === 'ur' ? 'rtl' : 'ltr');

/**
 * Numerals stay Western (0-9) for money and quantities even in Urdu.
 * Consistency on figures matters more than script purity here — flagged in
 * the briefing as something to confirm with the staff.
 */
export const fmtNum = (n: number) =>
  new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(
    Math.round((n + Number.EPSILON) * 100) / 100,
  );
