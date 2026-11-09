-- Status van het doorsturen naar CRM BBase per lead (src/server/crm.ts): '' = nog niet, 'bezig N', 'opnieuw N …', 'ok …', 'fout …', 'timeout …'.
-- Voorkomt dat een lead twee keer naar BBase gaat (dubbel afgeleverd wachtrijbericht) en maakt het resultaat per lead terug te vinden.
ALTER TABLE leads ADD COLUMN crm_status TEXT NOT NULL DEFAULT '';
-- Bestaande leads krijgen een eindstatus, zodat ze nooit (opnieuw) via de wachtrij naar BBase gaan: geen backfill.
UPDATE leads SET crm_status = 'voor_wachtrij';
