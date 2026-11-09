/*
 * Doorsturen van leads naar CRM BBase (crm.belastingbemiddelaar.nl), buiten het request-pad.
 *
 * Waarom een Queue en geen ctx.waitUntil: BBase doet er bij een nieuwe lead vaak langer dan 8 s over (okt–nov 2026: 29 van 32
 * leads liepen in de oude 8s-timeout). waitUntil mag na het antwoord maar 30 s doorlopen, gedeeld door alle taken van dat request;
 * een timeout van 30 s plus herhaalpogingen past daar niet in. De Queue-consumer (zelfde Worker, `queue` in src/server.ts) heeft
 * minuten de tijd en kan een bericht met vertraging opnieuw aanbieden.
 *
 * Het wachtrijbericht bevat alleen het lead-id; de gegevens komen uit D1. Zo staan er geen persoonsgegevens in de wachtrij en
 * kan een oud lead-id nooit (per ongeluk) opnieuw naar BBase: alleen leads van de afgelopen CRM_MAX_LEEFTIJD_UUR worden verstuurd.
 *
 * Idempotentie: BBase heeft geen gedocumenteerd dedupe-veld (submission_id is alleen een kenmerk, zie PROJECT.md) en geen
 * opzoek-API; het ontdubbelt zelf op telefoonnummer (bekend contact → activity_logged_on_existing). Daarom:
 * - kolom leads.crm_status: vóór elke poging wordt de lead atomair op 'bezig N' gezet; een dubbel afgeleverd wachtrijbericht of
 *   een lead met een eindstatus (ok / fout / timeout) wordt overgeslagen;
 * - opnieuw proberen alleen als het verzoek BBase zeker niet verwerkt heeft: een snelle verbindingsfout of HTTP 429/502/503;
 * - NOOIT opnieuw na een timeout, HTTP 500/504 of een trage verbindingsfout: dan kan BBase de lead al hebben aangemaakt.
 *
 * Logregels bevatten alleen lead-id, poging, uitkomst, HTTP-status, duur en de 'action' van BBase: geen naam, e-mail, telefoon of URL.
 */
import { site } from '../lib/site'

/* Inzendingsnummers voor het CRM krijgen een vaste opslag, zodat ze niet botsen met de entry-id's van
   Gravity Forms die de oude site al naar het CRM stuurde (die lopen in de duizenden). */
export const CRM_ID_OPSLAG = 1_000_000
/** Timeout per poging vanuit de wachtrij */
export const CRM_TIMEOUT_MS = 30_000
/** Timeout als de wachtrij niet beschikbaar is en we via waitUntil versturen (moet binnen de 30 s na het antwoord passen) */
export const CRM_TIMEOUT_WAITUNTIL_MS = 25_000
export const CRM_MAX_POGINGEN = 4
/** Wachttijd (s) vóór poging 2, 3 en 4 */
export const CRM_WACHTTIJDEN_S = [60, 300, 900]
/** Een verbindingsfout binnen deze tijd betekent: BBase niet bereikt, dus veilig om opnieuw te proberen */
export const SNELLE_FOUT_MS = 5_000
/** Alleen leads die zo recent zijn worden verstuurd (geen backfill van oude leads) */
export const CRM_MAX_LEEFTIJD_UUR = 24
/** HTTP-statussen waarbij BBase (of de proxy ervoor) het verzoek zeker niet verwerkt heeft */
const OPNIEUW_STATUSSEN = new Set([429, 502, 503])

export type CrmBericht = { id: number }

/** Lead zoals opgeslagen in D1 (alleen de velden die BBase krijgt) */
export type CrmLead = {
  formulier: string
  naam: string
  email: string
  telefoon: string
  bericht: string
  pagina_url: string
  gegevens: string
  created_at: string
}

const intakeLink = (email: string) => `${site.intakeUrl}?klant=${encodeURIComponent(email)}`

function velden(gegevens: string): Record<string, string> {
  try {
    const v = JSON.parse(gegevens || '{}')
    return v && typeof v === 'object' ? (v as Record<string, string>) : {}
  } catch {
    return {}
  }
}

/**
 * Zelfde JSON als de Gravity Forms-webhooks van de oude site, per formulier met dezelfde sleutels en formuliertitel:
 * Hero = "Banner Contact" (form 2), Contact = "Contact" (form 1), Gratis intakegesprek = "Intake gesprek" (form 3).
 */
export function crmBody(lead: CrmLead, id: number): Record<string, string> {
  const basis = {
    name: lead.naam,
    email: lead.email,
    phone: lead.telefoon,
    message: lead.bericht ?? '',
    intake_link: intakeLink(lead.email),
    // Zoals date_created van Gravity Forms: UTC, 'JJJJ-MM-DD UU:MM:SS' (created_at van D1 heeft precies dat formaat)
    submitted_at: lead.created_at,
    source_url: lead.pagina_url ? `${site.url}${lead.pagina_url}` : `${site.url}/`,
  }
  const submission_id = String(CRM_ID_OPSLAG + id)
  return lead.formulier === 'Gratis intakegesprek'
    ? { ...basis, preferred_time: velden(lead.gegevens)['Gewenst contactmoment'] ?? '', submission_id, form_title: 'Intake gesprek' }
    : lead.formulier === 'Contact'
      ? { ...basis, form_title: 'Contact', submission_id }
      : { ...basis, form_name: 'Banner Contact' }
}

export type Uitkomst = {
  soort: 'ok' | 'opnieuw' | 'fout'
  reden: string
  status: number
  ms: number
  actie: string
}

/** Alleen het veld 'action' uit het antwoord (bv. activity_logged_on_existing), en alleen als het een simpele code is */
function leesActie(tekst: string): string {
  try {
    const a = (JSON.parse(tekst) as { action?: unknown })?.action
    return typeof a === 'string' && /^[a-z0-9_.-]{1,60}$/i.test(a) ? a : ''
  } catch {
    return ''
  }
}

type Fetcher = (url: string, init: RequestInit) => Promise<Response>

/** Eén poging; gooit nooit */
export async function crmPoging(url: string, body: unknown, timeoutMs: number, fetcher: Fetcher = fetch, nu: () => number = Date.now): Promise<Uitkomst> {
  const start = nu()
  try {
    const res = await fetcher(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    })
    const tekst = await res.text().catch(() => '')
    const ms = nu() - start
    const actie = leesActie(tekst)
    if (res.ok) return { soort: 'ok', reden: 'ok', status: res.status, ms, actie }
    return { soort: OPNIEUW_STATUSSEN.has(res.status) ? 'opnieuw' : 'fout', reden: `http_${res.status}`, status: res.status, ms, actie }
  } catch (err) {
    const ms = nu() - start
    const naam = err instanceof Error || (typeof err === 'object' && err && 'name' in err) ? String((err as { name: unknown }).name) : ''
    if (naam === 'TimeoutError' || naam === 'AbortError') return { soort: 'fout', reden: 'timeout', status: 0, ms, actie: '' }
    if (ms < SNELLE_FOUT_MS) return { soort: 'opnieuw', reden: 'verbinding', status: 0, ms, actie: '' }
    return { soort: 'fout', reden: 'verbinding_traag', status: 0, ms, actie: '' }
  }
}

export type Logger = { log: (regel: string) => void; error: (regel: string) => void }

export type CrmDeps = {
  db: D1Database
  url?: string
  timeoutMs?: number
  fetcher?: Fetcher
  logger?: Logger
  /** Eén poging zonder herhaling (terugvaloptie via waitUntil als de wachtrij niet beschikbaar is) */
  eenmalig?: boolean
}

export type Besluit = { actie: 'ack' } | { actie: 'retry'; delaySeconds: number }

const regel = (id: number, poging: number, tekst: string, eenmalig = false) =>
  `[crm] lead ${id} poging ${poging}/${eenmalig ? 1 : CRM_MAX_POGINGEN}${eenmalig ? ' (direct)' : ''}: ${tekst}`

/**
 * Verwerkt één wachtrijbericht (of, zonder wachtrij, één directe poging). Geeft terug of het bericht klaar is (ack) of later
 * opnieuw moet (retry). Gooit nooit bij een BBase-fout; alleen bij een onverwachte D1-fout.
 */
export async function verwerkCrmBericht(bericht: CrmBericht, poging: number, deps: CrmDeps): Promise<Besluit> {
  const log = deps.logger ?? console
  const eenmalig = deps.eenmalig ?? false
  const id = Number(bericht?.id)
  const regel_ = (tekst: string) => regel(id, poging, tekst, eenmalig)
  if (!Number.isInteger(id) || id <= 0) {
    log.error('[crm] ongeldig wachtrijbericht overgeslagen')
    return { actie: 'ack' }
  }
  if (!deps.url) {
    log.error(regel_('overgeslagen, CRM_WEBHOOK_URL ontbreekt'))
    return { actie: 'ack' }
  }
  const lead = await deps.db
    .prepare(
      `SELECT formulier, naam, email, telefoon, bericht, pagina_url, gegevens, created_at, crm_status FROM leads
       WHERE id = ? AND created_at > datetime('now', ?)`,
    )
    .bind(id, `-${CRM_MAX_LEEFTIJD_UUR} hours`)
    .first<CrmLead & { crm_status: string }>()
  if (!lead) {
    log.error(regel_(`overgeslagen, lead onbekend of ouder dan ${CRM_MAX_LEEFTIJD_UUR} uur`))
    return { actie: 'ack' }
  }
  // Atomair claimen: alleen een nieuwe lead of een lead die op een herhaalpoging wacht. Anders is hij al (of nog) verwerkt.
  const claim = await deps.db
    .prepare(`UPDATE leads SET crm_status = ? WHERE id = ? AND (crm_status = '' OR crm_status LIKE 'opnieuw%')`)
    .bind(`bezig ${poging}`, id)
    .run()
  if (!claim.meta.changes) {
    log.log(regel_(`overgeslagen, al verwerkt (status ${lead.crm_status.split(' ')[0] || 'onbekend'})`))
    return { actie: 'ack' }
  }

  const u = await crmPoging(deps.url, crmBody(lead, id), deps.timeoutMs ?? CRM_TIMEOUT_MS, deps.fetcher)
  const details = `HTTP ${u.status || '-'} in ${u.ms} ms${u.actie ? ` action=${u.actie}` : ''}`
  let status: string
  let besluit: Besluit = { actie: 'ack' }
  if (u.soort === 'ok') {
    status = `ok ${u.status}${u.actie ? ` ${u.actie}` : ''}`
    log.log(regel_(`doorgestuurd ${details}`))
  } else if (u.soort === 'opnieuw' && !eenmalig && poging < CRM_MAX_POGINGEN) {
    const delaySeconds = CRM_WACHTTIJDEN_S[Math.min(poging - 1, CRM_WACHTTIJDEN_S.length - 1)]
    status = `opnieuw ${poging} ${u.reden}`
    besluit = { actie: 'retry', delaySeconds }
    log.error(regel_(`mislukt (${u.reden}) ${details}, nieuwe poging over ${delaySeconds} s`))
  } else {
    status = `${u.reden === 'timeout' ? 'timeout' : 'fout'} ${u.reden} poging ${poging}`
    const waarom =
      u.soort === 'opnieuw'
        ? 'geen pogingen meer'
        : u.reden === 'timeout' || u.reden === 'verbinding_traag' || u.status === 500 || u.status === 504
          ? 'niet opnieuw, BBase kan de lead al hebben aangemaakt'
          : 'niet opnieuw'
    log.error(regel_(`NIET doorgestuurd (${u.reden}) ${details}, ${waarom}`))
  }
  await deps.db.prepare('UPDATE leads SET crm_status = ? WHERE id = ?').bind(status, id).run()
  return besluit
}
