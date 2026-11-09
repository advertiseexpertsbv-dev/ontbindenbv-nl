-- Interne intake door de bellers (/intake-nieuwe-klant/). Aparte tabel zodat de leadtellingen in de hub niet vervuild raken.
CREATE TABLE IF NOT EXISTS intakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  klant TEXT NOT NULL DEFAULT '',
  samenvatting TEXT NOT NULL DEFAULT '',
  gegevens TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_intakes_created_at ON intakes (created_at DESC);
