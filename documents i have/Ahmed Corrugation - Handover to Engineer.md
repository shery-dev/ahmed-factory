# Handover — Ahmed Corrugation Machines

**For:** the engineer taking this forward
**Date:** 28 August 2026
**Status:** billing core working on real catalogue data. Everything else is yours.

---

## 1. Start here

```bash
cd "Ahmed Factory System"
npm install
npm run dev          # → http://localhost:3210
```

Spend twenty minutes before writing any code:

1. **Walk the app.** Post a bill. Watch the effects panel. Press the **اردو**
   button. Open **What Changed** — it lists each 2022 defect against its fix.
2. **Read `README.md`** — especially *About the data*.
3. **Read four files, in this order:**
   - `src/lib/schema.sql` — the whole data model, commented
   - `src/lib/pricing.ts` — the seven formulas, single source of truth
   - `src/lib/repo.ts` — all SQL. `postBill()` is the important function
   - `src/lib/i18n.ts` — the bilingual layer
4. **Skim the three companion documents** in the parent folder. The
   *Project Briefing* is short and sets the ground rules. The *Scope of Work*
   is the full picture.

Do **not** read the 2022 Python for architecture. Read it only for domain
knowledge, and use `Factory Management System First Deployment` — it is the
newer folder despite the other being called "Final".

---

## 2. Rules that do not bend

These came out of why the 2022 attempt failed. Everything else is open.

1. **The catalogue is data.** If a hardcoded list of paper types appears
   anywhere — including inside an agent prompt — the central defect is back.
2. **Never store a balance.** Compute it. See `customerBalance()`.
3. **Money and stock move together or not at all.** Anything that changes both
   goes in one transaction, like `postBill()`.
4. **Never block the factory.** An agent that cannot parse something, or a
   validation that is unsure, creates a queue item — it does not stop a sale.
5. **Agents propose, humans dispose.** Nothing touching money, stock or a
   customer commits without a named human approving it.
6. **Every staff-facing string is a key in `i18n.ts`.** No exceptions, from the
   first line of any new screen.
7. **One implementation per rule.** The UI, a server action and an agent all
   call the same function. Never a second copy of a pricing formula.

---

## 3. The work, in order

Effort is a rough guide for one engineer. Acceptance criteria are what I will
check.

### Wave 1 — Finish the operational loop

This is the wave you named. Two of these are nearly free: **the backend already
exists and has no UI**.

---

**T1 · Add and edit customers** — *backend done, UI missing*

`createCustomer()` in `src/lib/repo.ts:70` is written and unused. It already
generates codes in the factory's own convention (`c1` for cash, `1` for ledger).

- Build the form. Copy the pattern in `src/app/catalogue/` exactly — a server
  action in `actions.ts`, a `<form action={…}>` on the page.
- Add edit and deactivate. Never hard-delete a customer with ledger history;
  set `active = 0`.
- Clear the `needs_review` flag when a placeholder name is replaced — that badge
  is how the 2022 test names get cleaned up.

*Acceptance:* a walk-in customer can be created and billed without leaving the
billing screen. Effort: **S**

---

**T2 · Stock in / receive delivery** — *backend done, UI missing*

`stockIn()` in `src/lib/repo.ts:155` is written and unused. It already upserts
the level and writes the movement row in one transaction.

- Form: product, size, unit, quantity, rate, vendor, note.
- Add `vendor` to `stock_movements` (a column, or a `vendors` table if the
  factory tracks purchases properly — ask; it is question 10 in Appendix C).
- Allow a new size to be received that does not exist yet. `stockIn()` handles
  this via `ON CONFLICT`.

*Acceptance:* a delivery is recorded and appears in Recent Movements with its
vendor. Effort: **S**

---

**T3 · Stock adjustment and physical count**

The imported quantities are unreliable (README explains why). The factory needs
a way to set truth.

- A count sheet screen: pick a product, enter counted quantities per size, see
  system vs counted vs variance.
- Posting writes `direction = 'adjust'` movements with a **mandatory reason** —
  never a silent overwrite.
- Clearing `flagged` / `flag_reason` on a counted row is how the quarantine
  gets resolved.

*Acceptance:* a physical count replaces the legacy figures and every change is
traceable to who entered it and why. Effort: **M**

---

**T4 · Correct and void bills** ⚠️ *biggest gap in the prototype*

**There is currently no way to fix a mistake.** In a real factory this happens
several times a day, and its absence will stop adoption faster than anything
else on this list.

- Void a bill: reverse the ledger entry, reverse the stock movements, keep the
  original visible and marked `void`. **Never delete.**
- The receipt number stays consumed — gaps in the sequence are correct and
  auditable.
- Decide with the factory whether an edit is allowed at all, or whether the
  answer is always void-and-reissue. **Void-and-reissue is the safer default.**
- `bills.status` already exists for this.

*Acceptance:* a wrongly posted bill can be voided; stock and balance return
exactly to their prior values; both bills remain visible. Effort: **M**

---

**T5 · Expenses**

The `expenses` table exists. Nothing else does — no repo functions, no UI.

- One row per expense with a category. The 2022 system concatenated several into
  one cell with `||`, which made analysis impossible.
- Let the owner type `diesel 3000, chai 400, loading 1200` and split it into
  three categorised rows for confirmation. That is the seed of agent A6.

*Acceptance:* expenses are enterable and queryable by category and date range.
Effort: **S**

---

**T6 · Resolve items in Needs Attention**

`/review` is read-only. `data_issues.resolved` exists and is never set.

- Add resolve-with-note, and a filter for open vs resolved.
- Link each issue to the record it concerns so it can be fixed in place.

*Acceptance:* the queue can be worked to zero. Effort: **S**

---

### Wave 2 — Make it safe to use

**T7 · Authentication and roles** — `users` table is in the schema and unused.
Roles: owner, counter, store. Counter can bill; only owner can void, change a
rate, or adjust stock. *Effort:* **M**

**T8 · Audit trail** — `activity_log` records events but not *who*. Once T7
lands, stamp every write with the user, and record agent actions distinctly from
human ones. *Effort:* **S**

**T9 · Postgres, backups, tested restore** — SQLite is here so the prototype
runs with nothing installed. All SQL is confined to `src/lib/repo.ts`, so this
is a contained change. **Test the restore, not just the backup** — an untested
backup is not a backup, and this is precisely what turned the 2022 corruption
into a total loss. *Effort:* **M**

**T10 · Real opening balances** — do not migrate the 2022 ledger amounts. Enter
them from the paper register, using `manual_ledger_page` to tie each customer
back to their page. *Effort:* **S**, but needs the factory.

---

### Wave 3 — The real process

**T11 · Orders, gate pass and dispatch board** — the largest piece. Section 3 of
the Scope of Work has the state machine. The key design decision: **stock should
decrement at the gate pass, not at the bill**, because on delivery jobs the paper
leaves before the invoice exists. This prototype still decrements at billing,
which is correct only for counter sales. *Effort:* **L**

**T12 · Daily report** — get the current paper format photographed and reproduce
it. An owner who has read the same layout for years will not adopt a better one.
Make it any date range, not just today. *Effort:* **M**

**T13 · Receipt polish** — embed a Nastaliq font rather than relying on Google
Fonts (the factory printer will be offline), test on the actual thermal or A5
printer, and match the receipt customers already recognise. *Effort:* **S**

---

### Wave 4 — Agents

Full specifications are in the Scope of Work, Section 5. Build in this order —
it is deliberate: cheapest and most trust-building first.

1. **A9 Query agent** — read-only, cheapest to build, the one the owner will use
   most. Enforce read-only at the database credential, not in the prompt.
2. **A1 Order intake** — the owner dictates a day's orders in Roman Urdu; it
   returns confirmable order lines. Build the alias table from day one: every
   correction the owner makes is remembered.
3. **A2 Dispatch tracker** — needs T11.
4. **A3 Document capture** — photograph the manual ledger. Mandatory side-by-side
   verification, and log every human correction as training data.
5. **A4 Billing assistant**, then the rest.

**The architectural point:** `postBill()` is a plain function, not an HTTP
handler, precisely so an agent calls exactly what the counter clerk's button
calls. Keep it that way. If you find yourself writing agent-specific pricing or
stock logic, stop — that is the 2022 failure repeating.

Before building any agent, build its **evaluation set**: twenty real order
dictations, thirty real ledger photographs. Every prompt change runs against it.

---

## 4. Known debt in this prototype

I would rather you find these here than in the code.

| Item | Where | Note |
| :--- | :--- | :--- |
| No authentication | everywhere | Anyone can post a bill. T7 |
| No bill void or edit | `postBill()` | T4. The most urgent |
| No pagination | `listBills(200)`, `/stock` | Stock loads all 585 rows |
| Packets do not draw stock | `pricing.ts` `priceAndDescribe()` | `stockDraw` is 0 for packets — consumption belongs at conversion, which is unbuilt. Deliberate, but wrong today |
| Flash of English | `Shell.tsx` | Urdu preference loads after first paint. Move to a cookie so the server renders the right direction |
| `dashboard()` runs on every page | `layout.tsx` | Fine at this size, will not scale |
| Sanity thresholds are guesses | `scripts/seed.mjs` | `MAX_PLAUSIBLE`, `MAX_LINE_PKR`. Tune once real ranges are known |
| No tests | — | Start with `pricing.ts`. Seven formulas, seven tests. Do this first |
| Dev server holds the DB handle | `db.ts` | Restart after `npm run reset` |

---

## 5. Conventions

**Adding a screen**

```
src/app/<name>/page.tsx        server component, reads via repo.ts
src/app/<name>/actions.ts      'use server', mutations, revalidatePath()
src/components/<Name>.tsx      'use client', only if it needs interactivity
```

Use `<PanelHeader title="key" desc="key" />` on shop-floor screens so the header
translates. Management screens keep English headers by policy — see the language
table in the briefing.

**Adding a translated string** — add to `dict` in `src/lib/i18n.ts`, use
`tr('key')` from `useUi()`. Trade terms are transliterated, never translated:
رول, ریل, پیکٹ, ٹوٹے, جوتا, ردی, نالی.

**Adding a table** — `src/lib/schema.sql`, then repo functions. Keep all SQL in
`repo.ts`; the Postgres move depends on that.

**Anything writing money or stock** — wrap in `db.transaction()` and log to
`activity_log`. Follow `postBill()`.

---

## 6. Done, for this stage

- A customer can be created, edited and billed without touching the database.
- A delivery can be received and a physical count posted, with reasons recorded.
- A wrongly posted bill can be voided and stock and balance return to exact
  prior values.
- Expenses are categorised and queryable.
- The Needs Attention queue can be worked to zero.
- Real opening balances are in, from the paper register.
- `pricing.ts` has tests.
- Roles exist; only the owner can void, reprice or adjust.
- A backup has been **restored** into a working system, and the test is written
  down.

---

## 7. Before you build the screens

Questions only the factory can answer. Appendix C of the Scope of Work has all
of them; these three block Wave 1:

1. **What does `rent` charge for?** It has a column in every legacy sheet and
   nothing in 12,000 lines of code explains it.
2. **How do gate passes work today?** Is one written, who signs it, does it
   precede the bill? T11 depends entirely on the answer.
3. **Correction policy** — when a bill is wrong, does the factory void and
   reissue, or amend? T4 depends on this.

Ask early. Qasim would much rather answer now than review the wrong thing in
three weeks.
