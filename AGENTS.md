<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ahmed Corrugation Machines — agent operating rules

For the full story — business background, how this repo relates to its
sibling project, what's built, what's left, open questions for the factory
— read **CONTEXT.md** in this same directory first. This file is the terse,
imperative half: what to do and not do while writing code here. If the two
disagree, CONTEXT.md's "what's actually true right now" wins; this file can
drift behind a fast-moving codebase, that one is meant to be kept current.

## What this is

Billing, ledger, stock, expenses, and reporting for a corrugated-paper
trading business in Pakistan — deployed on Vercel, backed by Turso (a
distributed SQLite), with real JWT authentication and role-based routes.
This is the **more feature-complete of two sibling codebases** that grew
independently from the same original prototype (see CONTEXT.md §1) and is
the one going forward; the other (`Ahmed Factory System`, a sibling
directory) is being merged INTO this one piece by piece, not the reverse.

`npm run dev` seeds a local SQLite file and serves on :3210. Login with
`admin` / `admin123` (seeded on first login attempt). Production reads
`TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` from the environment instead.

## Non-negotiable rules

1. **The catalogue is data.** Paper types live in `item_types`. Never write
   a product name into a component, a mock, or a fallback. Query `repo.ts`.
2. **Never store a balance.** `customerBalance()` sums `ledger_entries` on
   every read. There is no `balance` column and there must never be one.
3. **Money and stock move together or not at all.** `postBill()` is one
   transaction (`db.batch`): receipt number, bill, bill_lines, stock
   decrement, stock movement, ledger entry. Never split this across calls.
   `voidBill()` reverses all of it the same way.
4. **Never block the factory.** No hard validation stops a receive, an
   issue, or a count. Suspicious data (over-issue, a brand-new size, an
   outsized quantity) gets *flagged* — a `data_issues` row, a soft confirm-
   again step — never refused. The one deliberate exception is the stock
   module's concurrency guard (`stock/actions.ts`), which stops a write
   only when on-hand has changed since the screen loaded, and even that
   just asks for one more tap, not a hard error.
5. **"Remove" is deactivation, not deletion**, for both products
   (`deactivateItemType`) and customers (`deactivateCustomer`). Foreign
   keys from `bill_lines`/`ledger_entries`/`stock_movements` mean a real
   DELETE would eventually be blocked or, worse, orphan history.
6. **Every function in `repo.ts` is `async` and talks to the database
   through `dbAll`/`dbGet`/`dbRun`/`db.batch`** (see `db.ts`) — never a raw
   `db.execute()` scattered through a page or action, and never a second
   copy of a query that already exists here. Multi-step writes that must
   succeed or fail together use `db.batch([...])`, not sequential awaited
   calls (a crash between them would leave a half-written transaction).
7. **Every staff-facing string is an i18n key**, `src/lib/i18n.ts`'s `dict`
   read via `tr()` from `useUi()`. Trade vocabulary — Raddi, Jutta, Totay,
   Nali, Bareek, Moti, Reel, Roll, Tota — is transliterated, never
   translated. Before adding a key, check it doesn't already exist under a
   slightly different name — this file has grown from two independent
   sessions and already had two real collisions caught during the merge
   (`countedQty`, `creditLimit`) where the existing key won silently.
8. **Auth is enforced in `middleware.ts`, not in each page.** `ROLE_ACCESS`
   there (and duplicated in `auth.ts`'s `hasAccess` — keep both in sync if
   you change one) maps a route prefix to the roles allowed on it. A page
   itself doesn't need to check the session unless it needs to know *who*
   is logged in, not just *whether* someone is.
9. **Verify before calling anything done.** `npx tsc --noEmit`, then
   `npm run verify:stock` (runs against a throwaway copy of the real
   database via `TURSO_DATABASE_URL` pointed at a temp file — see
   "Verification scripts" below), then a route smoke test with an
   authenticated session, then `npm run build`.
10. **Work on a branch, never commit straight to `main`.** This repo is
    connected to Vercel; `main` is the production branch. Every commit
    described in CONTEXT.md's merge section happened on `ui-merge`, pushed
    to `origin`, which Vercel builds as a separate Preview Deployment —
    the production URL only moves when `main` moves.

## Architecture map

```
src/lib/schema.sql   The data model. item_types, stock_items,
                      stock_movements, customers, bills/bill_lines,
                      ledger_entries, expenses, settings, users, counters,
                      activity_log, data_issues. Read this first.
src/lib/db.ts         The Turso/libsql client + dbAll/dbGet/dbRun helpers
                      that mimic better-sqlite3's synchronous API shape,
                      just async. TURSO_DATABASE_URL picks Turso vs a
                      local file — this is also the hook verification
                      scripts use to point at a throwaway copy.
src/lib/auth.ts       JWT sessions (jose), password hashing (Web Crypto
                      SHA-256 - not bcrypt; fine for this threat model, but
                      know that's the choice if you ever touch it),
                      ROLE_ACCESS, user CRUD.
src/middleware.ts     Route protection, mirroring ROLE_ACCESS from auth.ts.
src/lib/pricing.ts    The 7 sale-form formulas, verified against the 2022
                      legacy code. Identical to the sibling project's copy
                      - do not let these two drift once merging is done.
src/lib/repo.ts       Every SQL statement in the app. ~50+ exported async
                      functions, including the family/thickness stock
                      functions and findCustomerByContact ported in from
                      the sibling project (see CONTEXT.md's merge log).
src/lib/settings.ts   Configurable settings (payment methods, etc.),
                      key-value in the `settings` table.
src/lib/export.ts     CSV export helpers, used by /api/export.

src/app/*/actions.ts  'use server' functions — the only things UI calls to
                      write data. Call repo.ts; never inline SQL.
src/app/*/page.tsx    Server components; every repo.ts call needs `await`.

src/components/
  Shell.tsx           Top nav + sidebar + language/theme context + logout.
                      Still on unicode-symbol nav icons and the original
                      two-section (Operations/Setup) grouping - NOT YET
                      merged with the sibling project's lucide-react icon
                      system and four-section regrouping. Don't assume
                      it's been done; check CONTEXT.md's merge log.
  PanelHeader.tsx      title/desc/action - action is an optional right-
                      aligned slot, added during the Stock merge.
  UnitIcon / StatusBadge / EmptyState
                      Ported verbatim from the sibling project (pure
                      presentational, zero repo.ts dependency). StatusBadge
                      is the ONE place the ok/low/out/quarantined
                      icon+colour mapping is defined - CheckCircle2/green,
                      AlertTriangle/amber, XCircle/red, ShieldAlert/orange.
                      Only Dashboard and Stock use it so far; Customers,
                      Review, Changes, Bills still use raw badge-* classes
                      and haven't been converted.
  CustomerPanel.tsx     Search/quick-add/purchase-history, used by
                      Billing. Calls billing/actions.ts's quickAddCustomer
                      (dedup-aware) and getCustomerHistory.
  StockHome.tsx / ProductStock.tsx
                      The Stock module: family -> thickness -> size. See
                      "Stock module conventions" below.
  QuickAddCustomer.tsx  The OLDER quick-add button, no longer used inside
                      BillingForm (replaced by CustomerPanel) but left in
                      place - still functional if something else needs a
                      bare create-only button rather than search+dedup.
  AddCustomerForm/Modal, ReceivePaymentForm, RateEditPopup,
  StockAdjustPopup, StockCardGroup, ExpenseRow
                      Pre-existing, not touched by the merge. Own their
                      own inline styles/popups rather than the sheet/
                      control-bar CSS pattern below - don't assume they
                      share conventions with the newer Stock/Billing code.

scripts/
  seed.mjs             Idempotent - skips if item_types already has rows.
                      FIXED during the merge: its schema-statement filter
                      used to drop every CREATE TABLE whose preceding
                      comment header made the chunk start with `--`, i.e.
                      all of them, on a truly fresh local database. If you
                      ever rewrite this file, keep stripping comment LINES,
                      not rejecting chunks that merely start with one.
  migrate.mjs           Idempotent migrations for an EXISTING database
                      (schema.sql's CREATE TABLE IF NOT EXISTS can't add a
                      column to a live table). Currently: item_types.
                      reorder_level. Add new migrations here.
  verify-stock.ts       Copies data/factory.db to a tmp file, sets
                      TURSO_DATABASE_URL to it, runs real repo.ts
                      functions, asserts, discards the copy. Never touches
                      the real database. Add new verify-*.ts scripts
                      following this exact pattern for anything else
                      correctness-critical.
  ts-hooks.mjs / ts-resolve.mjs
                      Lets plain `node` run these .ts scripts (resolves
                      `@/lib/x` and extensionless `./x` imports).
```

## Design system conventions (partially applied — see CONTEXT.md)

- Two design systems currently coexist in `globals.css`: the pre-existing
  **"Professional v3"** system (its own shadow/radius scale — `--shadow-*`,
  `--radius-*` — used by the Customers/Stock card components, popups, and
  most of the app), and the **ported icon-badge system** (`.icon-badge`,
  `.control-bar`, `.family-card`/`.thickness-row`/`.size-tile`, `.sheet`/
  `.mode-tabs`/`.stepper`, `.cust-*`), appended below a clear comment
  divider and used only by Dashboard, Billing's customer panel, and Stock.
  Don't assume every screen uses the same button/card class — check what's
  actually imported before copying a pattern.
- **Colour tone system** (`.icon-badge`, `.badge`, `.attn-chip`): tone
  classes `amber` / `neutral` / `green` / `red` / `orange`. Amber means
  "something to act on." Never invent a new status colour outside this set.
- **Server-action result pattern**: an action that can meaningfully fail
  (stock mutations, quick-add) returns a typed result object (`ActionResult`
  in `stock/actions.ts`, `QuickAddResult` in `billing/actions.ts`) rather
  than throwing, so the calling client component can react. `quickAddCustomer`'s
  return type is a superset of its original `{ok, id, error}` shape — grew
  new optional fields rather than changing shape, to stay compatible with
  the older `QuickAddCustomer.tsx` button.

## Stock module conventions

- Family = a paper type (Fluting, L1, …). Thickness = moti/bareek, encoded
  as `item_types.family` (shared string) + `item_types.is_bareek`. **A
  family's moti and bareek rows must have an identical `family` string** —
  the original 2022 import had this wrong for two families
  (`"Boxboard 2.5 No"` vs `"Boxboard 2.5"`), fixed in the shared
  `data/import/legacy.json` both sibling projects seed from.
- `reorder_level` on `item_types` (added by `migrate.mjs`) is the
  per-product low-stock threshold — never hardcode a number like `<= 5`.
  `largeQtyThreshold()` similarly derives a per-product "does this
  movement look unusually big" number from recent history.
- Receive -> `stockIn()` (flags a genuinely new size into `data_issues`,
  never blocks). Issue -> `stockOut()` (allowed to go negative on purpose;
  a shortfall means the record is wrong, not that the store man should be
  stopped). Set Count -> the pre-existing `stockAdjust()` (already correct:
  sets the record to match a physical count, clears any quarantine flag).
  Don't add a fourth way to change a stock level — extend one of these.

## Before you finish any task

1. `npx tsc --noEmit` — zero errors.
2. `npm run verify:stock` — green. Write a new `verify-*.ts` for anything
   else correctness-critical you touch, following the same throwaway-copy
   pattern (never assert against the real database).
3. Hit the routes you touched with an authenticated session (log in once,
   reuse the session cookie) and check the actual response, not just the
   status code.
4. `npm run build` — a production build catches things dev mode doesn't.
5. Commit to a branch, not `main`. Push it; Vercel builds a Preview
   Deployment automatically.
6. Update CONTEXT.md's merge-progress and "what's built" sections if you
   shipped something a future session would need to know about.
