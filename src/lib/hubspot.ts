/* HubSpot-koppeling in de browser.
 *
 * Het HubSpot-trackingscript (zie routes/__root.tsx) laadt pas na toestemming. Na een verzonden
 * formulier koppelen we het e-mailadres aan de bezoeker (`identify`). De volledige lead gaat
 * server-side naar het HubSpot-formulier van dat formulier (src/server/leads.ts, HUBSPOT_FORMS_API).
 * Geen naam in `identify`: het formulier zet de volledige naam in `lastname` (zoals de oude site),
 * een gesplitste naam zou daar dwars doorheen schrijven. De formulieren hebben `data-hs-do-not-collect`,
 * zodat "formulieren verzamelen" van het trackingscript geen tweede inzending maakt.
 */
type W = Window & { _hsq?: unknown[][] }

export function hubspotIdentify(email: string, telefoon: string): void {
  if (typeof window === 'undefined') return
  const w = window as W
  w._hsq = w._hsq || []
  w._hsq.push(['identify', { email, phone: telefoon }])
}

/** Bezoekerscookie van HubSpot (alleen aanwezig na toestemming) voor koppeling aan de sessie */
export function hubspotUtk(): string {
  if (typeof document === 'undefined') return ''
  return document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/)?.[1] ?? ''
}
