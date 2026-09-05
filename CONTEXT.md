# CONTEXT — Ahmed Corrugation Machines Factory System

The story so far: the business, how this repo relates to its sibling
project, and a session-by-session account of what's been built. Read this
before touching the code. For the terse "rules to follow while coding"
version, see **AGENTS.md**; this file is the "why" it points back to.

Keep this file current. When you finish a piece of work, add it to the
merge log or "what's built," and update "what's not built yet." When you
hit a real business question you can't answer from the code, add it to
"Open questions for the factory" rather than guessing and moving on.

---

## 1. The business, and why there are two codebases

**Ahmed Corrugation Machines** is a corrugated-packaging paper business in
Pakistan. Paper trading (buying bulk reels/rolls, reselling to box makers),
converting (cutting reels into sheets/packets to spec), and by-product sales
(raddi/jutta/nali by weight). Customers are cash (pay at the counter, code
prefix `c`) or ledger (run an account). Everything was done by hand — paper
registers, mental arithmetic — until a 2022 PyQt5 + Excel system was built,
which corrupted itself and was abandoned (Excel-as-database, no
transactions, 18 paper types hardcoded 364 times across 4 files, a stored
`BALANCE` column that silently drifted). Full forensic detail on that system
lives in `documents i have/` in this repo, and in the sibling project's own
`business_understanding.md` / `deep_code_analysis.md`.

**This repo (`ahmed-factory`) and a sibling directory (`Ahmed Factory
System`) are two independent rebuilds of the same original Next.js
prototype**, grown in different directions without either one knowing about
the other until this repo's `ui-merge` branch (§3 below) started pulling
them back together:

- **This repo** went deep on *operational completeness*: real JWT auth with
  role-based routes, a Turso cloud database (fully async), bill void, a full
  expenses module, a reports suite (daily report, stock valuation, top
  customers), waste-stock tracking for jutta/raddi/nali, settings, CSV
  export, and a "Professional v3" visual redesign. It is deployed on Vercel
  and pushed to `github.com/shery-dev/ahmed-factory`.
- **The sibling project** went deep on *UI/UX polish for the operational
  loop*: a lucide-react icon system used consistently everywhere, the Stock
  module's family -> thickness -> size navigation (replacing a flat list),
  a concurrency guard and large-quantity soft-warning on stock mutations,
  customer search/quick-add/phone-dedup/purchase-history on the billing
  screen, and a shared StatusBadge/EmptyState component system. It never
  got auth, Turso, void, expenses, or reports built — this repo already had
  all of that.

**The decision, made explicit in this session**: this repo (`ahmed-factory`)
is the one going forward. The sibling project's UI/UX work is being ported
IN, piece by piece, onto this repo's async backend — never the reverse, and
never by replacing this repo's extra features. See §3 for exactly what's
been merged and what hasn't yet.

### Domain vocabulary (never translate these)

| Term | Meaning |
|---|---|
| Reel | A large roll of raw paper, bought in bulk |
| Roll | A cut roll, sold by count |
| Tota / Totay | Paper sold by weight, between reel and packet |
| Packet | Sheets cut to a customer's exact length/width/grammage |
| Moti | The normal/thick weight of a paper family |
| Bareek | The thin weight of the same paper family |
| Raddi | Waste paper, sold by weight |
| Jutta | A by-product of conversion, sold by weight |
| Nali | Paper cores — meaning not yet fully confirmed |
| Rent | A charge on every ledger line — meaning not yet confirmed |

### The catalogue: 9 families × 2 thicknesses

Fluting, L1, L2, Test Liner, Boxboard 2.5, Boxboard 3, Local Kraft, Imported
Kraft, Super Fluting — each in moti and bareek, 18 `item_types` rows total.
Both sibling projects seed from the same `data/import/legacy.json` (copied
into this repo during the merge — it wasn't committed here before, see
§3's first entry), which already carries a fix for a 2022 import bug where
the Boxboard families' moti and bareek rows had different `family` strings
(`"Boxboard 2.5 No"` vs `"Boxboard 2.5"`), silently splitting one family
into two. `Boxboard 2.5`'s moti rate (111 PKR) is still inconsistent with
every other family's moti/bareek gap (~3 PKR) and remains unconfirmed.

---

## 2. What this repo already had, before any merge work

Built independently, across the git history on `main` (`0648483` through
`f138836`) — real Wave 1 *and* Wave 2 features the sibling project never
reached:

- **Authentication** — JWT sessions (`jose`), role-based route protection
  (`owner`/`counter`/`store`) enforced in `middleware.ts`, a login page,
  full user CRUD in `auth.ts`.
- **Turso cloud database** — every `repo.ts` function is `async`, talking
  to `@libsql/client` through `dbAll`/`dbGet`/`dbRun` helpers in `db.ts`
  that mimic `better-sqlite3`'s shape. Falls back to a local SQLite file
  when `TURSO_DATABASE_URL` isn't set (used for local dev).
- **Bill void** — `voidBill()` reverses stock movements and posts offsetting
  ledger entries, all logged. Answers one of the sibling project's open
  questions: the correction policy is void-and-reissue, already built.
- **Expenses** — full CRUD (`addExpense`/`listExpenses`/`updateExpense`/
  `deleteExpense`), categorized, not concatenated into one string like the
  2022 system did.
- **Reports** — a daily report (debit/credit, cash vs. client, expenses by
  category, net position, printable), stock valuation, top customers by
  volume and by outstanding balance, period summaries.
- **Waste-stock tracking** — `listWasteStock`/`addWasteStock`/
  `adjustWasteStock`/`wasteStockOnHand`, tracking jutta/raddi/nali by
  weight per category. This is a real (if simpler) answer to a gap the
  sibling project explicitly flagged and left unbuilt: those three sale
  forms had zero inventory tracking there.
- **Settings** — configurable payment methods and other key-value settings.
- **CSV export**, **customer recent-rate suggestion** (`customerRecentRate`
  — what did this customer last pay for this product), **real customer
  CRUD** (create/update/deactivate/reactivate, not just create).
- **"Professional v3" visual redesign** — its own shadow/radius token
  scale, refined colors, a hover-expand stock card UI, a polished login
  page. This is a *different* visual system from the sibling project's,
  coexisting in `globals.css` after the merge (see AGENTS.md).

---

## 3. The merge: what's been ported in, session by session

All of this happened on branch **`ui-merge`**, pushed to `origin`, deployed
by Vercel as a Preview Deployment (not touching the `main` production
branch — see AGENTS.md rule 10 for why that separation matters). The
Vercel deployment ID for the state as of the last commit below is
**`dpl_2XAGFkihS34yCbCNnuGcoTPBnpRr`**.

**`17223ca` Fix seed script and unblock local dev.** Before any UI work
could start, this repo could not actually seed a fresh local database.
`scripts/seed.mjs`'s statement-splitting filter rejected any SQL chunk that
*started with* a comment line — which was all of them, since every
`CREATE TABLE` in `schema.sql` is preceded by a `-- section` header with no
semicolon separating them. This had apparently never been caught because
the script was only ever run against a Turso instance that already had the
schema applied some other way. Also: `.gitignore` blanket-ignored `/data/`,
silently excluding the actual source import data
(`data/import/legacy.json`) from git history, not just the generated `.db`
file — nothing in this repo could seed at all until that file was copied
over from the sibling project. And `better-sqlite3` was a dependency with
zero actual usage in `src/` (a leftover from before the Turso migration)
whose native build was failing and blocking `npm install` entirely —
removed.

**Foundation commit.** i18n keys, CSS classes, and the `item_types.
reorder_level` column (+ `scripts/migrate.mjs`) needed by the ported Stock
module, added without touching anything existing. Two real key collisions
(`countedQty`, `creditLimit`) were found and resolved by keeping this
repo's existing versions — object-literal duplicate keys don't error in
JS, they silently let the later one win, which would have been an
invisible bug if left unnoticed.

**Stock module port.** `/stock` gained the family -> thickness -> size
navigation: 9 family cards, a product page with every stocked width as a
tappable tile, and a Receive/Issue/Set Count sheet with a concurrency
guard (a mutation is rejected if on-hand changed since the screen loaded)
and a large-quantity soft warning. New async `repo.ts` functions
(`typeStockSummaries`, `familyStock`, `sizeRows`, `movementsFor`,
`largeQtyThreshold`, `stockOut`, `setReorderLevel`, `knownFamilies`,
`siblingThickness`, `getItemType`) follow this file's existing
`dbAll`/`dbGet`/`dbRun` pattern. **Preserved, not replaced**: the Waste &
Scrap tab, the Export Stock CSV link, and the pre-existing `stockAdjust()`
(now used as the Set Count backend, since it already did exactly that
correctly). Dropped the old flat rolls/reels/totay list and a "Combined"
pivot-table view, both superseded by the family view.

**Billing customer panel port.** The plain "pick an existing customer"
dropdown and an always-create "+ New Customer" button were replaced with
`CustomerPanel`: type-ahead search over name/code/phone, two quick-add
buttons (Cash/Ledger), and a purchase-history side panel. The real fix
underneath: `quickAddCustomer()` always inserted a new customer even if the
phone number already belonged to someone — added `findCustomerByContact()`
(digit-normalized) and wired it in, restoring a legacy-system convention
("phone number as deduplication key for cash customers") that this repo's
async rewrite had dropped. Every other Billing feature — waste-stock
integration, stock-capped quantity inputs, the item picker with inline
stock preview, cash-customer auto-pay-in-full, configurable payment
methods — is untouched.

**Dashboard visual pass.** Icon-badged stat cards, a Quick Actions row
linking only to screens that actually exist, matching icons on panel
titles, `StatusBadge`/`EmptyState` in the Low Stock and Outstanding
Balances panels. The date-range filter and the Expenses stat card — both
things this repo's dashboard had that the sibling project's never did —
are untouched.

### What's NOT merged yet

- **Shell.tsx / the sidebar** — still on unicode-symbol icons (`⌂`, `☎`,
  `☺`...) and the original two-section (Operations/Setup) nav grouping.
  The sibling project's lucide-react icon system and four-section
  regrouping (Sales/Customers/Inventory/System) has not been touched here.
  This repo's sidebar also has three nav items the sibling project never
  had (Expenses, Reports, Settings) plus a logout button — any future
  merge of Shell.tsx must preserve those.
- **StatusBadge/EmptyState propagation** — only Dashboard and the Stock
  module use them so far. Customers, Review, Changes, and Bills still use
  raw `badge-*` classes and plain `<div className="empty">` text.
- **Catalogue UI polish** — this repo's catalogue already has search + full
  CRUD (more capable than the sibling project's), but never got the
  family-name autocomplete-on-add or the icon treatment.
- **Two visual systems coexist** in `globals.css` — the pre-existing
  "Professional v3" tokens (shadows, radius scale) and the ported
  icon-badge system sit side by side rather than being unified. Not a bug,
  but worth knowing before assuming every screen shares one design
  language.

---

## 4. What works end-to-end today

Everything in §2 (auth, void, expenses, reports, waste-stock, settings,
CSV export, full customer/catalogue CRUD) plus, after the merge: the
Stock module's family/thickness/size navigation with a concurrency guard,
Billing's customer search/dedup/purchase-history, and the Dashboard's
icon-badged overview. Two verification suites exist:
`npm run verify:stock` (14 checks) covering the ported stock-mutation
logic — both safe to run anytime, since they run against a throwaway copy
of the database via `TURSO_DATABASE_URL`, never the live one.

## 5. What's not built yet

- The Shell/sidebar and Catalogue merges described above.
- Orders, gate passes, the dispatch board — the 9-state order lifecycle
  from the original Scope of Work. Stock still decrements at billing,
  which is correct for counter sales but wrong for delivery orders (goods
  leave before the invoice) — the documented target is to decrement at the
  gate pass instead. Blocked on the open question below.
- Production/conversion tracking (reel -> packets, with wastage) — see the
  open question below; packets currently price and post correctly but
  draw down no stock, a known and now-understood gap, not a silent bug.
- Postgres/further scaling work — this repo already solved the "prototype
  database" problem via Turso, so this is lower priority here than it was
  for the sibling project.
- The 9 operations agents (A1–A9) and 10 growth agents (G1–G10) from the
  original Scope of Work — not started; explicitly gated behind the
  operations system being stable first.

## 6. Open questions for the factory (still blocking real design work)

1. **What does "rent" charge for?** Appears on every ledger line; nothing
   in the 2022 legacy code or either rebuild explains it.
2. **How do gate passes work today?** Blocks the entire orders/dispatch
   design — the single largest remaining piece of work in either codebase.
3. ~~Correction policy — void-and-reissue, or amend?~~ **Answered by this
   repo's existing `voidBill()`**: void-and-reissue, already built.
4. What exactly are **jutta** and **nali**, precisely enough to describe in
   a catalogue entry? (Waste-stock tracking exists for them now, but the
   category descriptions are still generic.)
5. ~~Should production/conversion (reel → packets) be tracked with
   wastage?~~ **Partially answered** (recorded in the sibling project's
   own CONTEXT.md from a direct conversation with the user): a reel/roll
   sent for conversion is removed from inventory at the moment it's sent,
   not proportionally as packets sell later; any leftover is re-entered;
   the packets produced become their own trackable stock. **Not built in
   either repo yet** — packets have no `stock_items` unit of their own,
   and there's no conversion/production event distinct from a sale.
6. **Bareek's real size range** — do the seeded 28 sizes (17″–44″) match
   what's actually on the floor? Needs a walk of the godown to settle,
   since the seed data comes from the same untrusted 2022 export
   everything else did.
7. **Boxboard 2.5's moti rate (111 PKR)** — inconsistent with every other
   family's moti/bareek gap (~3 PKR). Possibly a bad legacy figure.
8. Do ledger clients have **credit limits or payment terms** enforced
   anywhere beyond the `credit_limit` column existing on `customers`?
9. How reliable is the **factory's internet**, given this repo now depends
   on a cloud database (Turso) rather than a purely local file?
