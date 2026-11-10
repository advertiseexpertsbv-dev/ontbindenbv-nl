/*
 * Doorsturen van leads naar CRM BBase (crm.belastingbemiddelaar.nl), buiten het request-pad.
 *
 * Eigen hook voor ontbindenbv.nl (gegevens van de BBase-beheerder, 2026-11-10): POST naar CRM_WEBHOOK_URL
 * (https://crm.belastingbemiddelaar.nl/api/public/hooks/ontbindenbv, var in wrangler.jsonc) met de header `x-obv-secret`
 * (secret CRM_WEBHOOK_SECRET) en JSON {name, email, phone, message, submission_id, company?, kvk?}; alle verplicht behalve
 * company en kvk. Antwoorden: 200 ontvangen, 400 velden kloppen niet, 401 geheim klopt niet, 503 later opnieuw (zelfde
 * submission_id). Zonder URL of geheim gaat er niets naar BBase; de leadmail (src/server/leads.ts) gaat altijd, als vangnet.
 *
 * Waarom een Queue en geen ctx.waitUntil: BBase doet er bij een nieuwe lead vaak langer dan 8 s over (okt–nov 2026: 29 van 32
 * leads liepen in de oude 8s-timeout). waitUntil mag na het antwoord maar 30 s doorlopen, gedeeld door alle taken van dat request;
 * een timeout van 30 s plus herhaalpogingen past daar niet in. De Queue-consumer (zelfde Worker, `queue` in src/server.ts) heeft
 * minuten de tijd en kan een bericht met vertraging opnieuw aanbieden.
 *
 * Het wachtrijbericht bevat alleen het lead-id; de gegevens komen uit D1. Zo staan er geen persoonsgegevens in de wachtrij en
 * kan een oud lead-id nooit (per ongeluk) opnieuw naar BBase: alleen leads van de afgelopen CRM_MAX_LEEFTIJD_UUR worden verstuurd.
 *
 * Idempotentie: submission_id is per lead vast (lead-id plus aanmaaktijd, zie submissionId) en bij elke nieuwe poging gelijk,
 * zodat BBase een herhaling herkent. Daarom:
 * - kolom leads.crm_status: vóór elke poging wordt de lead atomair op 'bezig N' gezet; een dubbel afgeleverd wachtrijbericht of
 *   een lead met een eindstatus (ok / fout) wordt overgeslagen;
 * - opnieuw proberen bij alles wat tijdelijk kan zijn: verbindingsfout, timeout en HTTP 429/500/502/503/504;
 * - niet opnieuw bij een andere 4xx (400 velden, 401 geheim): een herhaling lost dat niet op, dat staat in de logs.
 *
 * Logregels bevatten alleen lead-id, poging, uitkomst, HTTP-status, duur en de 'action' van BBase: geen naam, e-mail, telefoon of URL.
 */
import { site } from '../lib/site'

/** Timeout per poging vanuit de wachtrij */
export const CRM_TIMEOUT_MS = 30_000
/** Timeout als de wachtrij niet beschikbaar is en we via waitUntil versturen (moet binnen de 30 s na het antwoord passen) */
export const CRM_TIMEOUT_WAITUNTIL_MS = 25_000
export const CRM_MAX_POGINGEN = 4
/** Wachttijd (s) vóór poging 2, 3 en 4 */
export const CRM_WACHTTIJDEN_S = [60, 300, 900]
/** Alleen leads die zo recent zijn worden verstuurd (geen backfill van oude leads) */
export const CRM_MAX_LEEFTIJD_UUR = 24
/** HTTP-statussen die tijdelijk kunnen zijn: opnieuw proberen met hetzelfde submission_id */
const OPNIEUW_STATUSSEN = new Set([429, 500, 502, 503, 504])

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

function velden(gegevens: string): Record<string, string> {
  try {
    const v = JSON.parse(gegevens || '{}')
    return v && typeof v === 'object' ? (v as Record<string, string>) : {}
  } catch {
    return {}
  }
}

/** Vast inzendingsnummer per lead (ook na een nieuwe database uniek door de aanmaaktijd), bv. 'ontbindenbv-12-20261110045012' */
export const submissionId = (id: number, createdAt: string) => `ontbindenbv-${id}-${createdAt.replace(/\D/g, '')}`

/**
 * Body voor de hook van ontbindenbv.nl. `message` is verplicht: het bericht van de bezoeker, aangevuld met het gekozen
 * contactmoment (gratis intakegesprek), het formulier en de pagina. company en kvk vragen de formulieren niet uit.
 */
export function crmBody(lead: CrmLead, id: number): Record<string, string> {
  const extra = velden(lead.gegevens)
  const pagina = lead.pagina_url ? `${site.url}${lead.pagina_url}` : `${site.url}/`
  const regels = [
    (lead.bericht ?? '').trim(),
    extra['Gewenst contactmoment'] ? `Gewenst contactmoment: ${extra['Gewenst contactmoment']}` : '',
    `Formulier: ${lead.formulier || 'onbekend'} (${pagina})`,
  ].filter(Boolean)
  return {
    name: lead.naam,
    email: lead.email,
    phone: lead.telefoon,
    message: regels.join('\n\n'),
    submission_id: submissionId(id, lead.created_at),
  }
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
export async function crmPoging(
  url: string,
  geheim: string,
  body: unknown,
  timeoutMs: number,
  fetcher: Fetcher = fetch,
  nu: () => number = Date.now,
): Promise<Uitkomst> {
  const start = nu()
  try {
    const res = await fetcher(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-obv-secret': geheim },
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
    if (naam === 'TimeoutError' || naam === 'AbortError') return { soort: 'opnieuw', reden: 'timeout', status: 0, ms, actie: '' }
    return { soort: 'opnieuw', reden: 'verbinding', status: 0, ms, actie: '' }
  }
}

export type Logger = { log: (regel: string) => void; error: (regel: string) => void }

export type CrmDeps = {
  db: D1Database
  url?: string
  /** Waarde voor de header x-obv-secret (secret CRM_WEBHOOK_SECRET) */
  geheim?: string
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
  if (!deps.url || !deps.geheim) {
    log.error(regel_(`overgeslagen, ${deps.url ? 'CRM_WEBHOOK_SECRET' : 'CRM_WEBHOOK_URL'} ontbreekt`))
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

  const u = await crmPoging(deps.url, deps.geheim, crmBody(lead, id), deps.timeoutMs ?? CRM_TIMEOUT_MS, deps.fetcher)
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
    status = `fout ${u.reden} poging ${poging}`
    const waarom =
      u.soort === 'opnieuw'
        ? 'geen pogingen meer'
        : u.status === 401
          ? 'niet opnieuw, geheim (CRM_WEBHOOK_SECRET) klopt niet'
          : u.status === 400
            ? 'niet opnieuw, BBase keurt de velden af'
            : 'niet opnieuw'
    log.error(regel_(`NIET doorgestuurd (${u.reden}) ${details}, ${waarom}`))
  }
  await deps.db.prepare('UPDATE leads SET crm_status = ? WHERE id = ?').bind(status, id).run()
  return besluit
}
