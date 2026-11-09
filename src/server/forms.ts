import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { appEnv } from './env'
import { ipHash, naarHubspot, slaLeadOp, teVeelAanvragen, verwerkNa, type LeadInput } from './leads'
import { site } from '../lib/site'

type Resultaat = { ok: true } | { ok: false; fout: string }

const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const s = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function schoon(d: LeadInput): LeadInput {
  const velden: Record<string, string> = {}
  for (const [k, v] of Object.entries(d.velden ?? {})) {
    const w = s(v, 500)
    if (w) velden[s(k, 80)] = w
  }
  return {
    formulier: s(d.formulier, 80) || 'Onbekend',
    naam: s(d.naam, 120),
    email: s(d.email, 200),
    telefoon: s(d.telefoon, 40),
    bericht: s(d.bericht, 4000) || undefined,
    velden,
    pagina: s(d.pagina, 200) || undefined,
    attributie: d.attributie,
    hutk: s(d.hutk, 80) || undefined,
    website: s(d.website, 100),
    controle: s(d.controle, 100),
  }
}

/** Alle publieke formulieren (hero, contact, gratis intakegesprek): naam, e-mail en telefoon verplicht */
export const verzendLead = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as LeadInput)
  .handler(async ({ data }): Promise<Resultaat> => {
    const lead = schoon(data)
    if (lead.controle || lead.website) return { ok: true } // honeypot: doen alsof het gelukt is
    if (lead.naam.length < 2) return { ok: false, fout: 'Vul je naam in.' }
    if (!reEmail.test(lead.email)) return { ok: false, fout: 'Vul een geldig e-mailadres in.' }
    if (lead.telefoon.replace(/\D/g, '').length < 8) return { ok: false, fout: 'Vul een geldig telefoonnummer in.' }
    try {
      const hash = await ipHash(getRequestHeader('cf-connecting-ip'))
      if (await teVeelAanvragen(hash)) {
        return { ok: false, fout: `Je hebt al meerdere aanvragen verstuurd. Bel ons gerust: ${site.phone}.` }
      }
      const id = await slaLeadOp(lead, hash)
      await verwerkNa(lead, id)
      return { ok: true }
    } catch {
      return { ok: false, fout: `Er ging iets mis. Bel ons gerust, dan lossen we het direct op: ${site.phone}.` }
    }
  })

export type IntakeInput = { klant: string; samenvatting: string; velden: Record<string, string> }

/** Interne intake van de bellers: alles bewaren in D1, mail naar het kantoor en (met klant-e-mail) naar HubSpot */
export const verzendIntake = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as IntakeInput)
  .handler(async ({ data }): Promise<Resultaat> => {
    const velden: Record<string, string> = {}
    for (const [k, v] of Object.entries(data.velden ?? {})) {
      const w = s(v, 2000)
      if (w) velden[s(k, 120)] = w
    }
    const klant = s(data.klant, 200)
    const samenvatting = s(data.samenvatting, 8000)
    if (!Object.keys(velden).length && !samenvatting) return { ok: false, fout: 'Vul minimaal één vraag in.' }
    try {
      const e = appEnv()
      const row = await e.DB.prepare('INSERT INTO intakes (klant, samenvatting, gegevens) VALUES (?, ?, ?) RETURNING id')
        .bind(klant, samenvatting, JSON.stringify(velden))
        .first<{ id: number }>()
      const antwoorden = [...Object.entries(velden).map(([k, v]) => `${k}: ${v}`), '', 'Samenvatting:', samenvatting].join('\n')
      const tekst = [`Intake nieuwe klant #${row?.id}`, klant ? `Klant: ${klant}` : '', '', antwoorden].join('\n')
      // Zoals de HubSpot-feed van de oude site (form 4): het contact (e-mail uit ?klant=) krijgt de intake in `intake_nieuwe_klant`
      const hubspot = reEmail.test(klant)
        ? naarHubspot('Intake', { email: klant, intake_nieuwe_klant: antwoorden }, { pageUri: `${site.url}/intake-nieuwe-klant/`, pageName: 'Intake nieuwe klant' }, `intake ${row?.id}`)
        : Promise.resolve('')
      if (e.RESEND_API_KEY) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${e.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `bb-intake-${row?.id}` },
          body: JSON.stringify({
            from: e.RESEND_FROM ?? `${site.name} <${site.email}>`,
            to: (e.INTAKE_NOTIFICATIE_EMAIL ?? e.NOTIFICATIE_EMAIL ?? site.email).split(',').map((x) => x.trim()).filter(Boolean),
            subject: `Intake nieuwe klant${klant ? ` - ${klant}` : ''}`,
            text: tekst,
          }),
          signal: AbortSignal.timeout(8000),
        }).catch(() => undefined)
        if (!res?.ok) console.error(`[mail] intake ${row?.id}: Resend ${res ? `HTTP ${res.status}` : 'niet bereikbaar'}`)
      }
      await hubspot
      return { ok: true }
    } catch {
      return { ok: false, fout: 'Opslaan is niet gelukt. Probeer het opnieuw.' }
    }
  })

