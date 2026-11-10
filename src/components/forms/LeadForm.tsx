import { useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { verzendLead } from '../../server/forms'
import { haalAttributie } from '../../lib/attribution'
import { meldConversie, userData } from '../../lib/conversie'
import { hubspotIdentify, hubspotUtk } from '../../lib/hubspot'
import { site } from '../../lib/site'
import { Foutmelding, Veld, VerstuurKnop, inputClass } from './fields'

/** Terugbelmomenten, in lijn met de openingstijden (ma-vr 08:30-17:30); avond en weekend alleen op afspraak (campagnecontrole 2026-11-10) */
const MOMENTEN = ['Maandag t/m vrijdag tussen 8.30 - 17.30', 'Maandag t/m vrijdag na 17.30 (op afspraak)', 'Weekend (op afspraak)'] as const

/** Meldingen zoals Gravity Forms op de oude site, direct onder het veld */
const VERPLICHT = 'Dit veld is vereist.'
const EMAIL_ONGELDIG = 'Het ingevoerde e-mailadres is ongeldig, controleer het formaat (bijv. email@domein.com).'
// Zelfde regels als de server (src/server/forms.ts), zodat een veldfout nooit pas na het verzenden verschijnt
const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type VeldNaam = 'naam' | 'email' | 'telefoon'
type Fouten = Partial<Record<VeldNaam, string>>

function valideer(naam: string, email: string, telefoon: string): Fouten {
  const f: Fouten = {}
  if (!naam) f.naam = VERPLICHT
  else if (naam.length < 2) f.naam = 'Vul je naam in.'
  if (!email) f.email = VERPLICHT
  else if (!reEmail.test(email)) f.email = EMAIL_ONGELDIG
  if (!telefoon) f.telefoon = VERPLICHT
  else if (telefoon.replace(/\D/g, '').length < 8) f.telefoon = 'Vul een geldig telefoonnummer in.'
  return f
}

type Props = {
  /** Naam van het formulier in mail en CRM, bv. 'Hero', 'Contact', 'Gratis intakegesprek' */
  formulier: string
  /** 'gratis': met voorkeursmoment (zoals het formulier op /gratis-intakegesprek/) */
  variant?: 'standaard' | 'gratis'
  /**
   * 'gestapeld': Naam, Telefoonnummer, E-mailadres en Bericht onder elkaar (Gravity Form 1: contactpagina en contactblok).
   * 'paar': Naam, daaronder E-mailadres en Telefoonnummer naast elkaar vanaf 768px (hero en gratis intakegesprek).
   * Standaard 'gestapeld' voor formulier 'Contact', anders 'paar'.
   */
  indeling?: 'paar' | 'gestapeld'
  berichtLabel?: string
  /** 'kort': alleen naam, telefoon en e-mail (mobiel formulier onder de hero) */
  kort?: boolean
  /** form_location in het generate_lead-event, bv. 'mobiel_onder_hero' */
  locatie?: string
  className?: string
}

export default function LeadForm({ formulier, variant = 'standaard', indeling, berichtLabel = 'Bericht', kort = false, locatie, className = '' }: Props) {
  const gestapeld = kort || (indeling ?? (formulier === 'Contact' ? 'gestapeld' : 'paar')) === 'gestapeld'
  const id = useId()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [fout, setFout] = useState<string | null>(null)
  const [fouten, setFouten] = useState<Fouten>({})
  const [bezig, setBezig] = useState(false)
  // Samenvatting voor schermlezers (onzichtbaar, zoals de verborgen samenvatting van Gravity Forms); teller zorgt dat elke poging opnieuw wordt voorgelezen
  const [samenvatting, setSamenvatting] = useState(0)
  const bezigRef = useRef(false)
  const velden = useRef<Partial<Record<VeldNaam, HTMLInputElement | null>>>({})

  const invoerId = (k: VeldNaam) => `${id}-${k}`
  const foutId = (k: VeldNaam) => `${id}-${k}-fout`
  // Een fout verdwijnt zodra de bezoeker het veld aanpast
  const wis = (k: VeldNaam) => () => setFouten((f) => (f[k] ? { ...f, [k]: undefined } : f))
  const invoerProps = (k: VeldNaam) => ({
    id: invoerId(k),
    name: k,
    className: inputClass,
    required: true,
    'aria-invalid': fouten[k] ? (true as const) : undefined,
    'aria-describedby': fouten[k] ? foutId(k) : undefined,
    onChange: wis(k),
    ref: (el: HTMLInputElement | null) => {
      velden.current[k] = el
    },
  })
  const veld = (k: VeldNaam, label: string) => (
    <Veld label={label} htmlFor={invoerId(k)} required fout={fouten[k]} foutId={foutId(k)}>
      {k === 'naam' && <input {...invoerProps(k)} autoComplete="name" />}
      {k === 'email' && <input {...invoerProps(k)} type="email" autoComplete="email" />}
      {k === 'telefoon' && <input {...invoerProps(k)} type="tel" autoComplete="tel" />}
    </Veld>
  )

  async function verzend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (bezigRef.current) return
    const f = new FormData(e.currentTarget)
    const v = (k: string) => String(f.get(k) ?? '').trim()
    setFout(null)
    // Alle lege of ongeldige velden krijgen tegelijk een melding onder het veld; het eerste foute veld krijgt de focus
    const nieuw = valideer(v('naam'), v('email'), v('telefoon'))
    setFouten(nieuw)
    const eerste = (['naam', gestapeld ? 'telefoon' : 'email', gestapeld ? 'email' : 'telefoon'] as VeldNaam[]).find((k) => nieuw[k])
    if (eerste) {
      setSamenvatting((n) => n + 1)
      velden.current[eerste]?.focus()
      return
    }
    setSamenvatting(0)
    bezigRef.current = true
    setBezig(true)
    let res: Awaited<ReturnType<typeof verzendLead>>
    try {
      res = await verzendLead({
        data: {
          formulier,
          naam: v('naam'),
          email: v('email'),
          telefoon: v('telefoon'),
          bericht: v('bericht'),
          velden: variant === 'gratis' && v('moment') ? { 'Gewenst contactmoment': v('moment') } : {},
          controle: v('obv_controle_veld'),
          hutk: hubspotUtk(),
          pagina: pathname,
          attributie: haalAttributie(),
        },
      })
    } catch {
      // Geen verbinding of serverfout: het formulier blijft bruikbaar en de bezoeker krijgt het nummer
      res = { ok: false, fout: site.phone ? `Er ging iets mis. Bel ons gerust, dan lossen we het direct op: ${site.phone}.` : `Er ging iets mis. Mail ons gerust, dan lossen we het direct op: ${site.email}.` }
    } finally {
      bezigRef.current = false
      setBezig(false)
    }
    if (!res.ok) {
      setFout(res.fout)
      return
    }
    const [voornaam, ...rest] = v('naam').split(/\s+/)
    hubspotIdentify(v('email'), v('telefoon'))
    await meldConversie({ form_type: formulier, form_id: `lead-form-${formulier}`, form_location: locatie ?? 'pagina', user_data: userData({ voornaam, achternaam: rest.join(' '), email: v('email'), telefoon: v('telefoon') }) })
    navigate({ to: '/bedankt/' })
  }

  return (
    <form onSubmit={verzend} className={`flex flex-col gap-3 ${className}`} noValidate data-hs-do-not-collect="true">
      <p className="sr-only">Velden met een sterretje zijn verplicht.</p>
      {samenvatting > 0 && (
        <p key={samenvatting} role="alert" className="sr-only">
          Er was een probleem met je inzending. Controleer de gemarkeerde velden.
        </p>
      )}
      {veld('naam', 'Naam')}
      {gestapeld ? (
        <>
          {veld('telefoon', 'Telefoonnummer')}
          {veld('email', 'E-mailadres')}
        </>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {veld('email', 'E-mailadres')}
          {veld('telefoon', 'Telefoonnummer')}
        </div>
      )}
      {/* Het oude tekstvak laat onder zich een regelrest staan (9,6px, op mobiel 8,2px) */}
      {!kort && (
        <div className="pb-[8.2px] md:pb-[9.6px]">
          <Veld label={berichtLabel} htmlFor={`${id}-bericht`}>
            <textarea id={`${id}-bericht`} name="bericht" className={inputClass} />
          </Veld>
        </div>
      )}
      {variant === 'gratis' && (
        // Zoals de oude site: gewone radioknoppen (13px) onder elkaar, label 15px/27px (14px/25,2px onder 768px), geen rand of vulling
        <fieldset className="min-w-0">
          <legend className="mb-2 text-[14px] font-normal leading-[25.2px] text-body md:text-[16px] md:leading-[28.8px]">
            <span className="pe-[0.125em]">Welk moment komt jou uit?</span>
          </legend>
          <div>
            {MOMENTEN.map((m) => (
              <label key={m} className="flex cursor-pointer items-center text-[14px] leading-[25.2px] text-body md:text-[15px] md:leading-[27px]">
                <input type="radio" name="moment" value={m} className="m-0 mr-4 size-[13px] shrink-0 cursor-pointer accent-brand-700" />
                {m}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {/* Honeypot: voor mensen onzichtbaar */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        {/* Bewust geen herkenbare naam (zoals 'website'): browsers en wachtwoordmanagers vullen dit veld dan niet automatisch in */}
        <label>
          Laat leeg
          <input name="obv_controle_veld" type="text" tabIndex={-1} autoComplete="new-password" />
        </label>
      </div>
      {/* Knop zoals Gravity Forms: 32,2px onder het tekstvak (op 768px+ 55,6px), 53,5px hoog (op mobiel 50,1px) */}
      <div className={kort ? 'mt-2' : 'mt-3 md:mt-[34px]'}>
        {fout && (
          <div className="mb-3">
            <Foutmelding tekst={fout} />
          </div>
        )}
        <VerstuurKnop bezig={bezig} />
        <p className="mt-3 text-[13px] leading-[1.5] text-muted">
          We gebruiken je gegevens alleen om contact met je op te nemen over je aanvraag. Lees onze{' '}
          <a href="/privacyverklaring-eu/" className="underline">
            privacyverklaring
          </a>
          .
        </p>
      </div>
    </form>
  )
}
