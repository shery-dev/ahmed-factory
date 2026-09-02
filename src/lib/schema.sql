-- Ahmed Corrugation Machines — operational schema
-- Replaces book.xlsx (29 sheets) with 9 tables.
-- Design rules enforced here, from the Scope of Work:
--   1. The catalogue is DATA. Adding a product is an INSERT, never a code change.
--   2. Balance is NEVER stored. It is computed on read from debit/credit/rent.
--   3. Receipt numbers come from a counter row updated inside the same transaction.
--   4. Every stock change is a movement row that names what caused it.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── Catalogue ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS item_types (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  code           TEXT    NOT NULL UNIQUE,
  name_en        TEXT    NOT NULL,
  name_ur        TEXT    NOT NULL,
  family         TEXT    NOT NULL,           -- Fluting / L1 / Kraft ...
  is_bareek      INTEGER NOT NULL DEFAULT 0,
  description_en TEXT,
  description_ur TEXT,
  default_rate   REAL    NOT NULL DEFAULT 0, -- PKR, per unit of the sale form
  active         INTEGER NOT NULL DEFAULT 1,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Stock ────────────────────────────────────────────────────────────────────
-- unit: 'roll' = counted | 'reel' = kilograms | 'tota' = kilograms
CREATE TABLE IF NOT EXISTS stock_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  item_type_id INTEGER NOT NULL REFERENCES item_types(id),
  size         INTEGER NOT NULL,             -- width in inches
  unit         TEXT    NOT NULL CHECK (unit IN ('roll','reel','tota')),
  quantity     REAL    NOT NULL DEFAULT 0,
  rate         REAL    NOT NULL DEFAULT 0,
  flagged      INTEGER NOT NULL DEFAULT 0,   -- imported value failed a sanity check
  flag_reason  TEXT,
  UNIQUE (item_type_id, size, unit)
);
CREATE INDEX IF NOT EXISTS idx_stock_type ON stock_items(item_type_id, unit);

CREATE TABLE IF NOT EXISTS stock_movements (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ts           TEXT    NOT NULL DEFAULT (datetime('now')),
  direction    TEXT    NOT NULL CHECK (direction IN ('in','out','adjust')),
  item_type_id INTEGER REFERENCES item_types(id),
  size         INTEGER,
  unit         TEXT,
  quantity     REAL    NOT NULL,
  rate         REAL    NOT NULL DEFAULT 0,
  ref_type     TEXT,                          -- 'bill' | 'stock_in' | 'adjustment'
  ref_id       INTEGER,
  note         TEXT,
  actor        TEXT    NOT NULL DEFAULT 'system'
);
CREATE INDEX IF NOT EXISTS idx_mov_ref ON stock_movements(ref_type, ref_id);
CREATE INDEX IF NOT EXISTS idx_mov_ts  ON stock_movements(ts);

-- ─── Customers ────────────────────────────────────────────────────────────────
-- kind 'cash'   → code like c1, pays at the counter
-- kind 'ledger' → code like 1, runs an account
CREATE TABLE IF NOT EXISTS customers (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  code                TEXT    NOT NULL UNIQUE,
  kind                TEXT    NOT NULL CHECK (kind IN ('cash','ledger')),
  name                TEXT    NOT NULL,
  contact             TEXT,
  manual_ledger_page  TEXT,                   -- ties a row back to the paper register
  credit_limit        REAL    NOT NULL DEFAULT 0,
  needs_review        INTEGER NOT NULL DEFAULT 0,
  active              INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cust_kind ON customers(kind, active);

-- ─── Bills ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bills (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_no    INTEGER NOT NULL UNIQUE,      -- from counters, inside the transaction
  ts            TEXT    NOT NULL DEFAULT (datetime('now')),
  customer_id   INTEGER NOT NULL REFERENCES customers(id),
  kind          TEXT    NOT NULL CHECK (kind IN ('cash','ledger')),
  subtotal      REAL    NOT NULL DEFAULT 0,
  rent          REAL    NOT NULL DEFAULT 0,
  credit        REAL    NOT NULL DEFAULT 0,   -- paid now
  credit_method TEXT,
  note          TEXT,
  status        TEXT    NOT NULL DEFAULT 'posted',
  created_by    TEXT    NOT NULL DEFAULT 'counter'
);
CREATE INDEX IF NOT EXISTS idx_bills_ts   ON bills(ts);
CREATE INDEX IF NOT EXISTS idx_bills_cust ON bills(customer_id);

CREATE TABLE IF NOT EXISTS bill_lines (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id      INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  form         TEXT    NOT NULL CHECK (form IN ('rolls','reels','packets','totay','jutta','raddi','nali')),
  item_type_id INTEGER REFERENCES item_types(id),
  size         INTEGER,
  unit         TEXT,
  qty          REAL,      -- rolls: count | packets: number of packets
  weight_kg    REAL,      -- reels / totay / jutta / raddi / nali
  grammage     REAL,      -- packets only
  length_in    REAL,      -- packets only
  width_in     REAL,      -- packets only
  rate         REAL    NOT NULL,
  amount       REAL    NOT NULL,
  description  TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lines_bill ON bill_lines(bill_id);

-- ─── Ledger ───────────────────────────────────────────────────────────────────
-- No BALANCE column, deliberately. See lib/repo/ledger.ts — it is computed.
CREATE TABLE IF NOT EXISTS ledger_entries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            TEXT    NOT NULL DEFAULT (datetime('now')),
  customer_id   INTEGER NOT NULL REFERENCES customers(id),
  bill_id       INTEGER REFERENCES bills(id) ON DELETE CASCADE,
  receipt_no    INTEGER,
  particulars   TEXT    NOT NULL,
  debit         REAL    NOT NULL DEFAULT 0,
  credit        REAL    NOT NULL DEFAULT 0,
  credit_method TEXT,
  rent          REAL    NOT NULL DEFAULT 0,
  manual_page   TEXT,
  flagged       INTEGER NOT NULL DEFAULT 0,   -- imported amount failed a sanity check
  flag_reason   TEXT
);
CREATE INDEX IF NOT EXISTS idx_ledger_cust ON ledger_entries(customer_id, ts);

-- ─── Expenses ─────────────────────────────────────────────────────────────────
-- One row per expense line, not several concatenated with '||' into one cell.
CREATE TABLE IF NOT EXISTS expenses (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       TEXT NOT NULL DEFAULT (datetime('now')),
  category TEXT NOT NULL DEFAULT 'general',
  detail   TEXT NOT NULL,
  amount   REAL NOT NULL,
  actor    TEXT NOT NULL DEFAULT 'owner'
);

-- ─── Settings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- ─── Users (Phase 3) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  name          TEXT    NOT NULL,
  role          TEXT    NOT NULL CHECK (role IN ('owner','counter','store')),
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Infrastructure ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS counters (
  name  TEXT    PRIMARY KEY,
  value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_log (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      TEXT NOT NULL DEFAULT (datetime('now')),
  level   TEXT NOT NULL DEFAULT 'system',   -- system | agent | success | warn | error
  actor   TEXT NOT NULL DEFAULT 'system',
  event   TEXT NOT NULL,
  detail  TEXT,
  bill_id INTEGER
);
CREATE INDEX IF NOT EXISTS idx_log_ts ON activity_log(ts);

-- Anything the import could not trust. Nothing is silently dropped.
CREATE TABLE IF NOT EXISTS data_issues (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  source    TEXT NOT NULL,
  entity    TEXT NOT NULL,
  detail    TEXT NOT NULL,
  severity  TEXT NOT NULL DEFAULT 'warn',
  resolved  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
