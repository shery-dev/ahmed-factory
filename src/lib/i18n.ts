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

  // ── Stock module ──
  // Moti and bareek are trade terms for thickness — transliterated, not
  // translated. "Thick" and "thin" are not what anyone on the floor says.
  moti:         { en: 'Moti',            ur: 'موٹی' },
  bareek:       { en: 'Bareek',          ur: 'باریک' },
  thickness:    { en: 'Thickness',       ur: 'موٹائی' },
  sizesTracked: { en: 'Sizes',           ur: 'سائز' },
  lowCount:     { en: 'Low',             ur: 'کم' },
  outCount:     { en: 'Out',             ur: 'ختم' },
  quarantined:  { en: 'Quarantined',     ur: 'مشکوک' },
  allProducts:  { en: 'All products',    ur: 'تمام پروڈکٹس' },
  needsAttentionOnly: { en: 'Needs attention', ur: 'توجہ درکار' },
  notStocked:   { en: 'Not stocked',     ur: 'موجود نہیں' },
  openProduct:  { en: 'Open',            ur: 'کھولیں' },
  backToStock:  { en: 'All stock',       ur: 'تمام اسٹاک' },

  // Updating a size
  receive:      { en: 'Receive',         ur: 'آمد' },
  issue:        { en: 'Issue',           ur: 'اجراء' },
  setCount:     { en: 'Set count',       ur: 'گنتی' },
  currentlyOnHand:{ en: 'On hand now',   ur: 'اس وقت موجود' },
  addQty:       { en: 'How many received?', ur: 'کتنے آئے؟' },
  issueQty:     { en: 'How many going out?', ur: 'کتنے جا رہے ہیں؟' },
  reasonRequired:{ en: 'Reason is required', ur: 'وجہ لکھنا ضروری ہے' },
  cancel:       { en: 'Cancel',          ur: 'منسوخ' },
  confirm:      { en: 'Confirm',         ur: 'تصدیق کریں' },
  afterThis:    { en: 'After this',      ur: 'اس کے بعد' },
  chooseSize:   { en: 'Tap a size to update it', ur: 'اپ ڈیٹ کے لیے سائز پر ٹیپ کریں' },
  addSize:      { en: 'Add size',        ur: 'نیا سائز' },
  newSizeInches:{ en: 'New size (inches)', ur: 'نیا سائز (انچ)' },
  reorderLevel: { en: 'Low below',       ur: 'کم شمار کریں' },
  movements:    { en: 'Movements',       ur: 'اسٹاک کی حرکت' },
  noMovements:  { en: 'No movements yet', ur: 'ابھی کوئی حرکت نہیں' },
  sizesOutOf:   { en: 'sizes out of stock', ur: 'سائز ختم' },
  sizesLow:     { en: 'sizes running low', ur: 'سائز کم' },

  // Concurrency guard: someone else changed this size while the sheet was
  // open. Never silently write over what they did.
  stockChanged: { en: 'Stock changed while this was open', ur: 'یہ کھلا تھا جب اسٹاک بدل گیا' },
  nowOnHand:    { en: 'Now on hand',      ur: 'اب موجود' },
  tapAgainToConfirm: { en: 'Tap Confirm again to proceed', ur: 'جاری رکھنے کے لیے دوبارہ تصدیق پر ٹیپ کریں' },

  // Large-quantity soft warning — never a hard block, just one extra tap.
  largeQtyWarning: { en: 'That is a large quantity — is it correct?', ur: 'یہ زیادہ مقدار ہے — کیا یہ درست ہے؟' },
  confirmAnyway:   { en: 'Yes, confirm',  ur: 'ہاں، تصدیق کریں' },

  // Illustrative examples of the kind of note staff already write by hand —
  // shown as-is regardless of language, since they are the note itself.
  reasonExampleReceive: { en: 'e.g. Ahmed Sheikh ka truck Gujrat se aaya, size 17',
                           ur: 'e.g. Ahmed Sheikh ka truck Gujrat se aaya, size 17' },
  reasonExampleIssue:   { en: 'e.g. maal kharab tha, wapis bheja',
                           ur: 'e.g. maal kharab tha, wapis bheja' },
  reasonExampleCount:   { en: 'e.g. floor count by Ali, weekly check',
                           ur: 'e.g. floor count by Ali, weekly check' },

  // Replaces the flat SIZES/LOW/OUT/QUARANTINED number row — a status line
  // that says something, plus (on the product page) exactly which sizes.
  allStockOk:      { en: 'Every tracked size is within its reorder level',
                     ur: 'ہر ٹریک شدہ سائز اپنی مقررہ حد میں ہے' },
  needsAttention:  { en: 'Needs attention', ur: 'توجہ درکار' },
  productsAffected: { en: 'products affected', ur: 'پروڈکٹس متاثر' },

  // Empty-state heading + one sentence, for the shop-floor screens that are
  // translated (management screens hardcode English, per the language
  // policy above, so their empty states do too).
  emptyBillHeading:      { en: 'No items yet', ur: 'ابھی کوئی چیز نہیں' },
  emptyBillMessage:      { en: 'Add a line above to start the bill.', ur: 'بل شروع کرنے کے لیے اوپر ایک لائن شامل کریں۔' },
  emptyMovementsHeading: { en: 'No movements yet', ur: 'ابھی کوئی حرکت نہیں' },
  emptyMovementsMessage: { en: 'Receive, issue or count this product to start its history.',
                            ur: 'اس پروڈکٹ کی تاریخ شروع کرنے کے لیے آمد، اجراء یا گنتی درج کریں۔' },
  emptyStockHeading:     { en: 'Nothing needs attention', ur: 'کچھ توجہ درکار نہیں' },
  emptyStockMessage:     { en: 'Every product is within its reorder level.',
                            ur: 'ہر پروڈکٹ اپنی مقررہ حد میں ہے۔' },

  // Billing: customer search / quick-add / purchase history
  searchCustomer:      { en: 'Search by name or phone', ur: 'نام یا فون سے تلاش کریں' },
  noMatchesFound:      { en: 'No match — add them below', ur: 'کوئی نہیں ملا — نیچے شامل کریں' },
  newCashCustomer:      { en: 'New Cash Customer', ur: 'نیا نقد گاہک' },
  newLedgerCustomer:    { en: 'New Ledger Customer', ur: 'نیا کھاتہ گاہک' },
  ledgerPageField:      { en: 'Manual ledger page', ur: 'رجسٹر کا صفحہ' },
  createAndSelect:      { en: 'Create & select', ur: 'بنائیں اور منتخب کریں' },
  change:                { en: 'Change', ur: 'تبدیل کریں' },
  matchedExisting:      { en: 'Already on file — matched to', ur: 'پہلے سے موجود ہے — اس سے ملایا گیا' },
  purchaseHistory:      { en: 'Purchase History', ur: 'خریداری کی تاریخ' },
  noHistoryYet:        { en: 'No purchases yet', ur: 'ابھی کوئی خریداری نہیں' },
  nameRequired:         { en: 'Name is required', ur: 'نام درکار ہے' },
  viewFullLedger:       { en: 'View full ledger', ur: 'مکمل کھاتہ دیکھیں' },

  stockHomeDesc:{ en: 'Every paper is held in two thicknesses — moti and bareek — and in many widths. Pick a product to see its sizes and update what is on hand.',
                  ur: 'ہر کاغذ دو موٹائیوں میں ہوتا ہے — موٹی اور باریک — اور کئی چوڑائیوں میں۔ سائز دیکھنے اور اسٹاک اپ ڈیٹ کرنے کے لیے پروڈکٹ منتخب کریں۔' },
  stockProductDesc:{ en: 'Each tile is one width. Tap it to receive a delivery, issue paper out, or enter a physical count.',
                  ur: 'ہر خانہ ایک چوڑائی ہے۔ آمد درج کرنے، اسٹاک نکالنے یا گنتی درج کرنے کے لیے اس پر ٹیپ کریں۔' },

  // ── Customers ──
  addCustomer:    { en: 'Add Customer',     ur: 'گاہک شامل کریں' },
  editCustomer:   { en: 'Edit Customer',    ur: 'گاہک تبدیل کریں' },
  customerName:   { en: 'Customer Name',    ur: 'گاہک کا نام' },
  customerKind:   { en: 'Account Type',     ur: 'کھاتہ کی قسم' },
  cashKind:       { en: 'Cash',             ur: 'نقد' },
  ledgerKind:     { en: 'Ledger',           ur: 'کھاتہ' },
  creditLimit:    { en: 'Credit Limit',     ur: 'کھاتہ حد' },
  ledgerPage:     { en: 'Ledger Page Ref',  ur: 'کھاتہ صفحہ نمبر' },
  deactivate:     { en: 'Deactivate',       ur: 'غیر فعال کریں' },
  contactInfo:    { en: 'Contact Info',     ur: 'رابطہ معلومات' },

  // ── Stock ──
  receiveDelivery:{ en: 'Receive Delivery', ur: 'مال وصول کریں' },
  physicalCount:  { en: 'Physical Count',   ur: 'گنتی' },
  vendor:         { en: 'Vendor',           ur: 'فروخت کنندہ' },
  note:           { en: 'Note',             ur: 'نوٹ' },
  reason:         { en: 'Reason',           ur: 'وجہ' },
  systemQty:      { en: 'System Qty',       ur: 'سسٹم مقدار' },
  countedQty:     { en: 'Counted Qty',      ur: 'گنتی مقدار' },
  variance:       { en: 'Variance',         ur: 'فرق' },
  postAdjustment: { en: 'Post Adjustment',  ur: 'تبدیلی جمع کریں' },
  product:        { en: 'Product',          ur: 'پروڈکٹ' },

  // ── Bills ──
  voidBill:       { en: 'Void Bill',        ur: 'بل منسوخ کریں' },
  voidReason:     { en: 'Reason for void',  ur: 'منسوخی کی وجہ' },
  confirmVoid:    { en: 'Are you sure? This cannot be undone.', ur: 'کیا آپ کو یقین ہے؟ یہ واپس نہیں ہو سکتا' },
  voided:         { en: 'VOID',             ur: 'منسوخ' },
  billHistory:    { en: 'Bill History',     ur: 'بل کی تاریخ' },

  // ── Expenses ──
  expenses:       { en: 'Expenses',         ur: 'اخراجات' },
  addExpense:     { en: 'Add Expense',      ur: 'خرچ شامل کریں' },
  category:       { en: 'Category',         ur: 'قسم' },
  detail:         { en: 'Detail',           ur: 'تفصیل' },
  expenseAmount:  { en: 'Amount (PKR)',     ur: 'رقم (روپے)' },

  // ── Review ──
  resolve:        { en: 'Resolve',          ur: 'حل کریں' },
  resolved:       { en: 'Resolved',         ur: 'حل ہو گیا' },
  open:           { en: 'Open',             ur: 'کھلا' },
  resolveNote:    { en: 'Resolution note',  ur: 'حل کا نوٹ' },

  // ── Phase 3 ──
  settings:     { en: 'Settings',         ur: 'ترتیبات' },
  reports:      { en: 'Reports',          ur: 'رپورٹس' },
  export:       { en: 'Export',           ur: 'ایکسپورٹ' },
  printStatement:{ en: 'Print Statement', ur: 'اسٹیٹمنٹ پرنٹ' },
  users:        { en: 'Users',            ur: 'صارفین' },
  login:        { en: 'Login',            ur: 'لاگ ان' },
  logout:       { en: 'Logout',           ur: 'لاگ آؤٹ' },

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
