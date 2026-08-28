# Ahmed Corrugation Machines — Factory System

A working prototype of the billing core, built on the **real catalogue data**
imported from the 2022 `book.xlsx`.

It exists so the proposal can be **checked rather than taken on trust**. Open
the **What Changed** page in the app: every claim about the rebuild links to the
screen where you can verify it yourself.

---

## Run it

```bash
cd "Ahmed Factory System"
npm install
npm run dev
```

Then open **http://localhost:3210**

`npm run dev` seeds the database first if it does not exist. Nothing else to
install — no database server, no Docker.

| Command | Does |
| :--- | :--- |
| `npm run dev` | Seed if needed, then start on port 3210 |
| `npm run reset` | Delete and rebuild the database from `data/import/legacy.json` |
| `npm run build` | Production build |

> After `npm run reset`, restart the dev server — it holds an open handle to the
> old database file.

---

## What is in it

| Screen | What it demonstrates |
| :--- | :--- |
| **Dashboard** | Live position, activity log, outstanding balances, low stock |
| **New Bill** | All seven sale forms with verified pricing, live stock check, atomic posting |
| **Bills / Receipt** | Sequence-allocated receipt numbers, printable bilingual receipt, WhatsApp link |
| **Customers** | Ledger with a **computed** running balance |
| **Stock** | Levels by unit, movements traced to the bill that caused them |
| **Catalogue** | Add a product with no code change — the key acceptance test |
| **Needs Attention** | Everything the import refused to silently trust |
| **What Changed** | Each 2022 defect, the fix, and a link to verify it |

---

## The seven pricing formulas

Extracted from `CashBillclass.py` and verified line by line. They live in
exactly one place — `src/lib/pricing.ts` — which the UI, the server action and
any future quotation agent all call.

| Form | Formula |
| :--- | :--- |
| Rolls | `rate × size × quantity` |
| Reels | `rate × weight_kg` |
| Packets | `(length × width × grammage ÷ 15500) × packets × rate` |
| Totay / Jutta / Raddi / Nali | `rate × weight_kg` |

**Rolls is the one people get wrong.** Size (width in inches) is a *multiplier* —
the rate is per inch of width, per roll. A naive `rate × qty` under-bills by
roughly a factor of twenty.

---

## The design rules this build enforces

1. **The catalogue is data.** 2022 hardcoded 18 product names 364 times across
   4 files. Here it is one table. Adding a product is an `INSERT`.
2. **One event, five consequences, one transaction.** Posting a bill allocates
   the receipt number, writes the bill and lines, decrements stock with movement
   rows, and posts the ledger entry — atomically. If any step fails, none are
   written. *(Verified by test: a forced failure left both stock and the receipt
   counter untouched.)*
3. **The balance is computed, never stored.** `ledger_entries` holds only debit,
   credit and rent.
4. **Receipt numbers come from a counter** incremented inside the transaction,
   not from "last row + 1".
5. **Fail into a queue, never into an error.** Bad import data is quarantined and
   listed, never silently dropped or silently believed.
6. **Bilingual from the first commit.** Every staff-facing string is a key in
   `src/lib/i18n.ts`. Urdu flips to RTL and Nastaliq.

---

## Language policy

Implemented exactly as the project briefing specifies:

| Layer | Language | Where |
| :--- | :--- | :--- |
| Shop floor | **Urdu primary** | Billing, stock, receipts, buttons, errors |
| Management | English primary | Dashboard, catalogue, review, what-changed |
| System | English only | Code, database, logs |

**Trade vocabulary is transliterated, never translated.** رول, ریل, پیکٹ, ٹوٹے,
جوتا, ردی, نالی — these are what the staff say. Numerals stay Western (0–9) for
money and quantities; confirm that choice with the staff.

---

## About the data — read this

The import is faithful to `book.xlsx`, and the 2022 workbook is not trustworthy.
Both facts are visible in the app rather than hidden.

**Real and usable:**
- All 18 product types, their **rates** (28–111 PKR) and their descriptions.
- The customer ID conventions (`c1` for cash, `1` for ledger).
- The ledger column structure, including `manual_ledger_page`.

**Imported but unreliable — replace before any real use:**
- **Customer names** are 2022 placeholders (`qasim`, `abeera`, `abc`, `asc`,
  `acv fe`). Flagged with a `CHECK` badge. Replace from the paper register.
- **Stock quantities** follow arithmetic test patterns (200, 235, 270, 305 …).
  Six rows were impossible — negatives and values like `1,111,111,189` — and were
  imported as 0 and quarantined. **Treat every quantity as unverified until a
  physical count is entered.**
- **Opening balances.** One ledger row (`Nali 100000000 Kg`, debit
  PKR 200 trillion) exceeded the plausibility ceiling and is excluded from all
  balances. Others below the ceiling are still visibly wrong — `Nali 2 Kg` at
  PKR 1.1 million is why `qasim` shows a large balance. The Scope of Work is
  right: **enter opening balances from the paper register rather than migrating
  these.**

Sanity thresholds live in `scripts/seed.mjs` (`MAX_PLAUSIBLE`, `MAX_LINE_PKR`)
and are deliberately easy to tune once the real ranges are known.

---

## Architecture

```
src/
  lib/
    schema.sql     11 tables replacing 29 spreadsheet sheets
    pricing.ts     the 7 formulas — single source of truth
    repo.ts        all SQL, incl. postBill() atomic transaction
    i18n.ts        EN/UR dictionary
    db.ts          connection + activity log
  components/      Shell (nav, language, theme), BillingForm, PanelHeader
  app/             dashboard, billing, bills, customers, stock,
                   catalogue, review, changes
scripts/seed.mjs   import with sanity checks
data/import/       legacy.json exported from book.xlsx
```

**SQLite** is used so this runs with nothing to install. All SQL is confined to
`src/lib/repo.ts`, so moving to Postgres for production is a contained change.
Mutations go through Server Actions; the browser never touches the database.

`postBill()` is deliberately a plain function rather than an HTTP handler — the
order-intake and quotation agents in the Scope of Work call the same function the
counter clerk's button calls. One implementation, two callers.

---

## What this is not

A working demonstration of the **billing core**, not the production system.
Still ahead, in the order set out in the Scope of Work:

- Orders, gate passes and the dispatch board — including moving the stock
  decrement to the gate pass, which is where goods physically leave
- Authentication, roles and an audit trail
- Expenses and the daily report
- The document-capture agent and the rest of the agent layer
- Postgres, managed backups and a **tested restore**

Known prototype limitations: no auth (anyone can post a bill); a brief flash of
English before the stored Urdu preference loads; and packets consume stock at
conversion rather than at sale, which is modelled but not yet implemented.

---

## Companion documents

- **Ahmed Corrugation - Project Briefing (READ FIRST)** — vision and ground rules
- **Ahmed Corrugation - Process Map & Agent Scope of Work** — full scope, 9 agents
- **Ahmed Packages - Future Roadmap** — export business and 10 growth agents

UI conventions (dark-default tokens, 240px sidebar, tinted log rows) follow the
Raydian / Verifone HTML mockup, re-accented in kraft amber.
