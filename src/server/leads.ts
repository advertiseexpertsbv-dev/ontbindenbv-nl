import type { Attributie } from '../lib/attribution'
import { site } from '../lib/site'
import { waitUntil } from 'cloudflare:workers'
import { appEnv } from './env'
import { CRM_TIMEOUT_WAITUNTIL_MS, verwerkCrmBericht, type CrmBericht } from './crm'

export type LeadInput = {
  formulier: string
  naam: string
  email: string
  telefoon: string
  bericht?: string
  /** Extra velden (label → waarde), bv. gewenst contactmoment */
  velden?: Record<string, string>
  pagina?: string
  attributie?: Attributie
  /** HubSpot-bezoekerscookie (alleen aanwezig na toestemming) */
  hutk?: string
  /** Honeypot (veld obv_controle_veld): moet leeg zijn */
  controle?: string
  /** Oude honeypotnaam, nog geaccepteerd voor pagina's die vóór de wijziging geladen zijn */
  website?: string
}

const MAX_PER_UUR = 5

async function ipHash(ip: string | undefined): Promise<string> {
  if (!ip) return ''
  const data = new TextEncoder().encode(`${ip}|${new Date().toISOString().slice(0, 10)}|${site.domain}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function teVeelAanvragen(hash: string): Promise<boolean> {
  if (!hash) return false
  const r = await appEnv()
    .DB.prepare(`SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')`)
    .bind(hash)
    .first<{ n: number }>()
  return (r?.n ?? 0) >= MAX_PER_UUR
}

/** Alleen een pad op de eigen site: begint met één /, geen spaties of backslashes, max 200 tekens; anders leeg */
function schoonLandingspagina(waarde: unknown): string {
  if (typeof waarde !== 'string') return ''
  if (waarde.length > 200 || !waarde.startsWith('/') || waarde.startsWith('//') || /[\s\\]/.test(waarde)) return ''
  return waarde
}

/** Voert de INSERT uit met landingspagina; heeft de database die kolom nog niet (migratie nog niet gedraaid), dan zonder, zodat er nooit een lead verloren gaat */
async function metLandingspagina<T>(insert: (metKolom: boolean) => Promise<T>): Promise<T> {
  try {
    return await insert(true)
  } catch (err) {
    const melding = err instanceof Error ? err.message : String(err)
    if (!melding.includes('landingspagina') || !/no such column|has no column named/.test(melding)) throw err
    console.error('Kolom leads.landingspagina ontbreekt nog; lead opgeslagen zonder landingspagina. Draai de migratie.')
    return insert(false)
  }
}

export async function slaLeadOp(lead: LeadInput, hash: string): Promise<number> {
  const a = lead.attributie
  const landingspagina = schoonLandingspagina(a?.landingspagina)
  const row = await metLandingspagina((metKolom) =>
    appEnv()
      .DB.prepare(
        `INSERT INTO leads (type, formulier, naam, email, telefoon, bericht, pagina_url, gegevens,
           first_source, first_medium, last_source, last_medium, utm_source, utm_campaign, utm_term, utm_agid, device, ip_hash${metKolom ? ', landingspagina' : ''})
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?${metKolom ? ', ?' : ''}) RETURNING id`,
      )
      .bind(
        'contact',
        lead.formulier,
        lead.naam,
        lead.email,
        lead.telefoon,
        lead.bericht ?? '',
        lead.pagina ?? '',
        JSON.stringify(lead.velden ?? {}),
        a?.first_source ?? '',
        a?.first_medium ?? '',
        a?.last_source ?? '',
        a?.last_medium ?? '',
        a?.utm_source ?? '',
        a?.utm_campaign ?? '',
        a?.utm_term ?? '',
        a?.utm_agid ?? '',
        a?.device ?? '',
        hash,
        ...(metKolom ? [landingspagina] : []),
      )
      .first<{ id: number }>(),
  )
  if (!row?.id) throw new Error('lead niet opgeslagen')
  return row.id
}

export { ipHash }

function regels(lead: LeadInput): string[] {
  const r = [
    `Naam: ${lead.naam}`,
    `E-mailadres: ${lead.email}`,
    `Telefoonnummer: ${lead.telefoon}`,
    ...Object.entries(lead.velden ?? {}).map(([k, v]) => `${k}: ${v}`),
  ]
  if (lead.bericht) r.push('', 'Bericht:', lead.bericht)
  return r
}

/** Notificatie per mail (Resend). Zonder API-key: alleen opslag in D1. */
export async function stuurNotificatie(lead: LeadInput, id: number): Promise<void> {
  const e = appEnv()
  if (!e.RESEND_API_KEY) return
  const aan = (e.NOTIFICATIE_EMAIL ?? site.email).split(',').map((s) => s.trim()).filter(Boolean)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${e.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `obv-lead-${id}`,
      },
      body: JSON.stringify({
        from: e.RESEND_FROM ?? `${site.name} <${site.email}>`,
        to: aan,
        reply_to: lead.email,
        subject: `Nieuwe aanvraag via ${site.domain} (${lead.formulier})`,
        text: [
          `Nieuwe aanvraag via ${site.domain} (${lead.formulier})`,
          lead.pagina ? `Pagina: ${site.url}${lead.pagina}` : '',
          `Aanvraagnummer: ${id}`,
          '',
          ...regels(lead),
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) console.error(`[mail] Resend HTTP ${res.status} voor lead ${id}`)
  } catch {
    console.error(`[mail] notificatie voor lead ${id} mislukt`)
  }
}

/** Link naar de interne intake met het e-mailadres van de lead (zoals het verborgen veld "Intake link" op de oude site) */
const intakeLink = (email: string) => `${site.intakeUrl}?klant=${encodeURIComponent(email)}`
const paginaUrl = (lead: LeadInput) => (lead.pagina ? `${site.url}${lead.pagina}` : `${site.url}/`)

type HubspotFormulier = 'Hero' | 'Contact' | 'Gratis intakegesprek'

/**
 * HubSpot Forms API (anoniem, EU-portaal). Alleen actief als de secret HUBSPOT_FORMS_API 'aan' is; geen var in
 * wrangler.jsonc, want vars gelden ook lokaal en dan komen testaanvragen in HubSpot.
 * Let op: HubSpot antwoordt ook bij ongeldige gegevens met 200 en valideert pas later.
 */
export async function naarHubspot(formulier: HubspotFormulier, velden: Record<string, string>, context: Record<string, string>, label: string): Promise<string> {
  if (appEnv().HUBSPOT_FORMS_API !== 'aan') return ''
  const guid = site.hubspotFormulieren[formulier]
  if (!guid) {
    console.error(`[hubspot] geen HubSpot-formulier voor ${formulier}, ${label} overgeslagen`)
    return 'geen formulier'
  }
  try {
    const res = await fetch(`https://api-eu1.hsforms.com/submissions/v3/integration/submit/${site.hubspotId}/${guid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: Object.entries(velden)
          .filter(([, value]) => value)
          .map(([name, value]) => ({ name, value })),
        context,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) console.error(`[hubspot] HTTP ${res.status} voor ${label}`, (await res.text()).slice(0, 200))
    return res.ok ? 'ok' : `fout ${res.status}`
  } catch {
    console.error(`[hubspot] ${label} niet doorgestuurd`)
    return 'fout'
  }
}

/**
 * Velden zoals de HubSpot-feeds van de oude site (Gravity Forms HubSpot-add-on), en alleen velden die in het
 * HubSpot-formulier staan: de volledige naam in `lastname`, op /gratis-intakegesprek/ de hulpvraag in
 * `project_objective` en het voorkeursmoment in `message`.
 */
function hubspotVelden(lead: LeadInput): Record<string, string> {
  const basis = { email: lead.email, lastname: lead.naam, phone: lead.telefoon, intake_link: intakeLink(lead.email) }
  if (lead.formulier === 'Contact') return { ...basis, message: lead.bericht ?? '', website: paginaUrl(lead), hs_lead_status: 'NEW' }
  if (lead.formulier === 'Gratis intakegesprek') {
    return { ...basis, project_objective: lead.bericht ?? '', message: lead.velden?.['Gewenst contactmoment'] ?? '' }
  }
  return { ...basis, message: lead.bericht ?? '' }
}

export async function stuurHubspot(lead: LeadInput, id: number): Promise<string> {
  const formulier: HubspotFormulier = lead.formulier === 'Contact' || lead.formulier === 'Gratis intakegesprek' ? lead.formulier : 'Hero'
  const context = { ...(lead.hutk ? { hutk: lead.hutk } : {}), pageUri: paginaUrl(lead), pageName: lead.formulier }
  return naarHubspot(formulier, hubspotVelden(lead), context, `lead ${id}`)
}

export async function stuurZapier(lead: LeadInput, id: number): Promise<void> {
  const url = appEnv().ZAPIER_WEBHOOK_URL
  if (!url) return
  const a = lead.attributie
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        bron: site.domain,
        formulier: lead.formulier,
        naam: lead.naam,
        email: lead.email,
        telefoon: lead.telefoon,
        bericht: lead.bericht ?? '',
        velden: lead.velden ?? {},
        pagina: lead.pagina ? `${site.url}${lead.pagina}` : '',
        datum: new Date().toISOString(),
        first_source: a?.first_source ?? '',
        last_source: a?.last_source ?? '',
        utm_source: a?.utm_source ?? '',
        utm_campaign: a?.utm_campaign ?? '',
        utm_term: a?.utm_term ?? '',
      }),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    console.error(`[zapier] lead ${id} niet doorgestuurd`)
  }
}

/**
 * CRM BBase: niet meer in het request-pad. De lead gaat als id in de wachtrij (binding CRM_QUEUE); de consumer in
 * src/server.ts stuurt hem door met een ruime timeout en veilige herhaalpogingen (zie src/server/crm.ts). Is de wachtrij er
 * niet of mislukt het plaatsen, dan één directe poging via waitUntil (25 s), zodat de bezoeker niet hoeft te wachten.
 */
export async function zetCrmInWachtrij(id: number): Promise<void> {
  const e = appEnv()
  if (!e.CRM_WEBHOOK_URL) return
  if (e.CRM_QUEUE) {
    try {
      await e.CRM_QUEUE.send({ id } satisfies CrmBericht)
      console.log(`[crm] lead ${id} in wachtrij`)
      return
    } catch {
      console.error(`[crm] lead ${id}: wachtrij niet bereikbaar, directe poging via waitUntil`)
    }
  } else {
    console.error(`[crm] lead ${id}: binding CRM_QUEUE ontbreekt, directe poging via waitUntil`)
  }
  waitUntil(
    verwerkCrmBericht({ id }, 1, { db: e.DB, url: e.CRM_WEBHOOK_URL, timeoutMs: CRM_TIMEOUT_WAITUNTIL_MS, eenmalig: true }).catch(() =>
      console.error(`[crm] lead ${id} (direct): onverwachte fout`),
    ),
  )
}

export async function verwerkNa(lead: LeadInput, id: number): Promise<void> {
  const [, hs] = await Promise.all([
    Promise.allSettled([stuurNotificatie(lead, id), stuurZapier(lead, id), zetCrmInWachtrij(id)]),
    stuurHubspot(lead, id),
  ])
  if (hs) await appEnv().DB.prepare('UPDATE leads SET hubspot_status = ? WHERE id = ?').bind(hs, id).run()
}

