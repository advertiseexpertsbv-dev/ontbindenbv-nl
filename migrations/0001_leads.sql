-- Leads van de publieke formulieren (hero, contact, gratis intakegesprek).
-- Kolomnamen sluiten aan op de Advertisexperts-hub (site_key 'bb'): naam, email, telefoon, created_at en de attributievelden.
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL DEFAULT 'contact',
  formulier TEXT NOT NULL DEFAULT '',
  naam TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  telefoon TEXT NOT NULL DEFAULT '',
  bericht TEXT NOT NULL DEFAULT '',
  pagina_url TEXT NOT NULL DEFAULT '',
  gegevens TEXT NOT NULL DEFAULT '{}',
  first_source TEXT NOT NULL DEFAULT '',
  first_medium TEXT NOT NULL DEFAULT '',
  last_source TEXT NOT NULL DEFAULT '',
  last_medium TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_term TEXT NOT NULL DEFAULT '',
  utm_agid TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL DEFAULT '',
  ip_hash TEXT NOT NULL DEFAULT '',
  hubspot_status TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ip ON leads (ip_hash, created_at);
