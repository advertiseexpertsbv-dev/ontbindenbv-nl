import { appEnv } from './env'

/** Bewaartermijn voor aanvragen en intakes in de site-database (staat ook in de privacyverklaring, content/juridisch.ts) */
export const BEWAARTERMIJN_JAREN = 5

/**
 * Wist persoonsgegevens ouder dan de bewaartermijn. Leads worden geanonimiseerd: naam, contactgegevens, bericht, extra velden
 * en de IP-code gaan eruit, maar formulier, pagina, bron en datum blijven staan zodat de tellingen in de hub kloppen.
 * Intakes worden verwijderd (die tellen nergens mee). Draait dagelijks via de cron in wrangler.jsonc.
 * BBase en HubSpot vallen hierbuiten; daar regelt Belasting Bemiddelaar de termijn zelf.
 */
export async function schoonOp(): Promise<{ leads: number; intakes: number }> {
  const db = appEnv().DB
  const grens = `-${BEWAARTERMIJN_JAREN} years`
  const [leads, intakes] = await db.batch([
    db
      .prepare(
        `UPDATE leads SET naam = '', email = '', telefoon = '', bericht = '', gegevens = '{}', ip_hash = ''
         WHERE created_at < datetime('now', ?)
           AND (naam != '' OR email != '' OR telefoon != '' OR bericht != '' OR gegevens != '{}' OR ip_hash != '')`,
      )
      .bind(grens),
    db.prepare(`DELETE FROM intakes WHERE created_at < datetime('now', ?)`).bind(grens),
  ])
  const aantal = { leads: leads.meta.changes ?? 0, intakes: intakes.meta.changes ?? 0 }
  console.log(`[bewaartermijn] ${aantal.leads} lead(s) geanonimiseerd, ${aantal.intakes} intake(s) verwijderd`)
  return aantal
}
