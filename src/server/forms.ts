import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { ipHash, slaLeadOp, teVeelAanvragen, verwerkNa, type LeadInput } from './leads'
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
