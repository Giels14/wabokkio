CREATE TABLE IF NOT EXISTS aanvragen (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,          -- UTC, datetime('now')
  naam TEXT NOT NULL,
  email TEXT NOT NULL,
  telefoon TEXT,
  bestemming TEXT NOT NULL,
  aankomst TEXT NOT NULL,
  vertrek TEXT NOT NULL,
  kamers_json TEXT NOT NULL,         -- [{"adults":2,"childAges":[4,7]}]
  bericht TEXT,
  taal TEXT NOT NULL DEFAULT 'nl'   -- nl/en
);
CREATE INDEX IF NOT EXISTS idx_aanvragen_created_at ON aanvragen(created_at);
