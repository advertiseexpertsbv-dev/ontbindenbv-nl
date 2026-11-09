-- Eerste pagina van het bezoek (landingspagina) per lead, voor SEO-inzicht
ALTER TABLE leads ADD COLUMN landingspagina TEXT NOT NULL DEFAULT '';
