import { useMemo, useState } from 'react'
import raw from '../../content/intake.json'
import { verzendIntake } from '../../server/forms'
import { Foutmelding, VerstuurKnop, inputClass } from './fields'
import { Button } from '../ui'

type Veld = {
  id: string
  type: 'section' | 'radio' | 'checkbox' | 'text' | 'textarea' | 'email'
  label: string
  desc?: string
  /** Voorbeeldtekst (placeholder) uit het oude formulier */
  ph?: string
  hideLabel?: boolean
  options?: string[]
  cond?: { action: 'show' | 'hide'; logic: 'all' | 'any'; rules: { field: string; value: string }[] }
}
const velden = raw as Veld[]
type Waarden = Record<string, string | string[]>

const SAMENVATTING_ID = '70'
const KLANT_ID = '69'
const OVERWAARDE_ID = '46'

/**
 * Kleurvlakken van de oude intake (eigen CSS .intake_form): roze voor STAP 4 t/m 8 en de AANVULLEND-blokken financiering,
 * overige schulden en eerdere regeling; geel voor 6B corona; blauw voor STAP 9 turbo-liquidatie; groen voor de AANVULLEND-blokken
 * zakelijke lening en doorlopende begeleiding. Alle andere vragen hebben geen kleur.
 */
type Kleur = 'rood' | 'geel' | 'blauw' | 'groen'
const KLEUR_VAN: Record<string, Kleur> = {}
const kleurIds = (kleur: Kleur, ids: (string | number)[]) => ids.forEach((id) => (KLEUR_VAN[String(id)] = kleur))
kleurIds('rood', [79, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53])
kleurIds('geel', [32, 33, 34, 35])
kleurIds('blauw', [71, 72, 73, 74, 75, 76])
kleurIds('groen', [62, 63, 64, 65])
const KLEUR_KLASSE: Record<Kleur, string> = { rood: 'bg-red-50', geel: 'bg-yellow-50', blauw: 'bg-blue-50', groen: 'bg-green-50' }

function eur(v: string): number | null {
  const n = Number(v.replace(/[€\s.]/g, '').replace(',', '.'))
  return Number.isFinite(n) && v.trim() !== '' ? n : null
}

/** Zichtbaarheid volgens de voorwaarden uit het oude formulier. Regels op een verborgen veld tellen niet mee. */
function zichtbaar(v: Veld, w: Waarden, cache: Map<string, boolean> = new Map()): boolean {
  if (cache.has(v.id)) return cache.get(v.id)!
  let ok = true
  if (v.cond) {
    const trefs = v.cond.rules.map((r) => {
      const bron = velden.find((x) => x.id === r.field)
      if (bron && !zichtbaar(bron, w, cache)) return false
      const waarde = w[r.field]
      return Array.isArray(waarde) ? waarde.includes(r.value) : waarde === r.value
    })
    const geraakt = v.cond.logic === 'all' ? trefs.every(Boolean) : trefs.some(Boolean)
    ok = v.cond.action === 'show' ? geraakt : !geraakt
  }
  cache.set(v.id, ok)
  return ok
}

/** Overwaarde = waarde woning − hypotheek: afgeleid, niet getypt (zodra beide bedragen zijn ingevuld) */
function overwaarde(ruw: Waarden): number | null {
  const waarde = eur(String(ruw['44'] ?? ''))
  const hyp = eur(String(ruw['45'] ?? ''))
  return waarde !== null && hyp !== null ? Math.round(waarde - hyp) : null
}
function metOverwaarde(ruw: Waarden): Waarden {
  const o = overwaarde(ruw)
  return o !== null ? { ...ruw, [OVERWAARDE_ID]: String(o) } : ruw
}

/**
 * Antwoorden op vragen die door een andere keuze verborgen raken, worden gewist (zoals Gravity Forms op de oude intake doet):
 * wisselt de beller tijdens het gesprek van klanttype of hoofdreden, dan begint de vraag bij terugkeren weer leeg.
 */
function zonderVerborgen(ruw: Waarden): Waarden {
  const w = metOverwaarde(ruw)
  const cache = new Map<string, boolean>()
  const uit: Waarden = {}
  for (const [id, waarde] of Object.entries(ruw)) {
    const v = velden.find((x) => x.id === id)
    if (!v || zichtbaar(v, w, cache)) uit[id] = waarde
  }
  return uit
}

export default function IntakeFormulier() {
  const [ruw, setW] = useState<Waarden>({})
  const [fout, setFout] = useState<string | null>(null)
  const [bezig, setBezig] = useState(false)
  const [klaar, setKlaar] = useState(false)

  // Het veld "Klant" (e-mail) wordt via de link gevuld, zoals in HubSpot ingesteld: ?klant=… (ook ?email=…)
  const [klant] = useState(() => {
    if (typeof window === 'undefined') return ''
    const p = new URLSearchParams(window.location.search)
    return p.get('klant') ?? p.get('email') ?? p.get('klant_email') ?? ''
  })

  const w = useMemo<Waarden>(() => metOverwaarde(ruw), [ruw])
  // Overwaarde is alleen vergrendeld zolang ze uit woning en hypotheek wordt berekend; anders kan de beller ze zelf noteren (zoals oud)
  const overwaardeBerekend = overwaarde(ruw) !== null

  const cache = new Map<string, boolean>()
  const zicht = useMemo(() => velden.filter((v) => v.id !== KLANT_ID && v.id !== SAMENVATTING_ID && zichtbaar(v, w, cache)), [w]) // eslint-disable-line react-hooks/exhaustive-deps

  // Opeenvolgende zichtbare vragen met dezelfde kleur vormen één kleurvlak (zoals de oude intake)
  const blokken = useMemo(() => {
    const b: { kleur?: Kleur; items: Veld[] }[] = []
    for (const v of zicht) {
      const kleur = KLEUR_VAN[v.id]
      const laatste = b[b.length - 1]
      if (laatste && laatste.kleur === kleur) laatste.items.push(v)
      else b.push({ kleur, items: [v] })
    }
    return b
  }, [zicht])

  // Na elke wijziging verdwijnen de antwoorden van vragen die daardoor verborgen raken
  const zet = (id: string, waarde: string | string[]) => setW((x) => zonderVerborgen({ ...x, [id]: waarde }))
  const wissel = (id: string, optie: string) =>
    setW((x) => {
      const cur = (x[id] as string[] | undefined) ?? []
      return zonderVerborgen({ ...x, [id]: cur.includes(optie) ? cur.filter((o) => o !== optie) : [...cur, optie] })
    })

  function bouwVelden(): Record<string, string> {
    const uit: Record<string, string> = {}
    let vorig = ''
    for (const v of zicht) {
      if (v.type === 'section') continue
      const waarde = w[v.id]
      const tekst = Array.isArray(waarde) ? waarde.join(', ') : (waarde ?? '').toString().trim()
      if (tekst) uit[v.hideLabel ? `${vorig} – ${v.label}` : v.label] = tekst
      if (!v.hideLabel) vorig = v.label
    }
    return uit
  }

  async function verstuur(e: React.FormEvent) {
    e.preventDefault()
    // De knop is niet disabled (focus blijft staan, aria-busy), dus dubbel klikken blokkeren we hier
    if (bezig) return
    setBezig(true)
    setFout(null)
    const vv = bouwVelden()
    const samenvatting = String(w['68'] ?? '').trim()
    let res: Awaited<ReturnType<typeof verzendIntake>>
    try {
      res = await verzendIntake({
        data: {
          klant,
          samenvatting: samenvatting,
          velden: vv,
        },
      })
    } catch {
      res = { ok: false, fout: 'Opslaan is niet gelukt. Probeer het opnieuw.' }
    } finally {
      setBezig(false)
    }
    if (res.ok) setKlaar(true)
    else setFout(res.fout)
  }

  if (klaar) {
    return (
      <div className="rounded-[14px] bg-brand-50 p-8 text-center">
        <h2 className="text-[26px] font-bold">Intake verstuurd</h2>
        <p className="mt-3">De intake is opgeslagen en naar het kantoor gemaild.</p>
        <Button className="mt-6" onClick={() => { setW({}); setKlaar(false); window.scrollTo({ top: 0 }) }}>
          Nieuwe intake starten
        </Button>
      </div>
    )
  }

  // Keuzeknop van de oude intake: 2px lichte rand, 4px hoeken, padding 8px 16px, tekst 14px/25,2px (15px/27px vanaf 768px).
  // Actief: merkblauw met witte tekst; hover: lichtblauwe vulling. De radio zelf is verborgen, de focusring staat om de knop.
  const pil = (actief: boolean) =>
    `inline-flex cursor-pointer rounded-[4px] border-2 px-4 py-2 text-[14px] leading-[25.2px] transition-colors md:text-[15px] md:leading-[27px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500 ${actief ? 'border-brand-700 bg-brand-700 text-white' : 'border-form-lijn bg-white text-body hover:bg-bkg-light'}`

  /** Sectiekop: 14px/600 in bijna zwart, 32px boven de tekst; buiten een kleurvlak met een grijze lijn eronder */
  const kop = (v: Veld, inKleur: boolean) => (
    <div key={v.id} className={inKleur ? undefined : 'border-b border-form-kop pb-2 pr-4'}>
      <h2 className="mt-8 text-[14px] font-semibold leading-[1.3] text-text">{v.label}</h2>
    </div>
  )

  /** Beschrijving onder een vraag: 15px/27px met 13px lucht erboven, op elke breedte */
  const beschrijving = 'pt-[13px] text-[15px] leading-[27px] text-body'

  const vraag = (v: Veld) => (
    <div key={v.id}>
      {(v.type === 'radio' || v.type === 'checkbox') && (
        <fieldset className="min-w-0">
          {/* De tekst staat in de oude site in een span met padding-right 0,125em; dat bepaalt waar lange vragen afbreken */}
          <legend className="mb-2 text-[14px] leading-[25.2px] text-body md:text-[16px] md:leading-[28.8px]">
            <span className="pe-[0.125em]">{v.label}</span>
          </legend>
          <div className="flex flex-wrap gap-4">
            {v.options?.map((o) => {
              const actief = v.type === 'radio' ? w[v.id] === o : ((w[v.id] as string[]) ?? []).includes(o)
              return (
                <label key={o} className={pil(actief)}>
                  <input
                    type={v.type}
                    name={`f${v.id}`}
                    checked={actief}
                    onChange={() => (v.type === 'radio' ? zet(v.id, o) : wissel(v.id, o))}
                    className="sr-only"
                  />
                  {o}
                </label>
              )
            })}
          </div>
          {v.desc && <p className={beschrijving}>{v.desc}</p>}
        </fieldset>
      )}
      {(v.type === 'text' || v.type === 'textarea') && (
        // Het oude tekstvak laat onder zich een regelrest staan (9,6px, onder 768px 8,2px)
        <div className={v.type === 'textarea' ? 'pb-[8.2px] md:pb-[9.6px]' : undefined}>
          <label htmlFor={`f${v.id}`} className={v.hideLabel ? 'sr-only' : 'mb-2 block text-[14px] leading-[25.2px] text-body md:text-[16px] md:leading-[28.8px]'}>
            <span className={v.hideLabel ? undefined : 'pe-[0.125em]'}>{v.label}</span>
          </label>
          {v.type === 'text' ? (
            <input
              id={`f${v.id}`}
              className={inputClass}
              value={String(w[v.id] ?? '')}
              onChange={(e) => zet(v.id, e.target.value)}
              placeholder={v.ph}
              readOnly={v.id === OVERWAARDE_ID && overwaardeBerekend}
            />
          ) : (
            <textarea id={`f${v.id}`} className={inputClass} value={String(w[v.id] ?? '')} onChange={(e) => zet(v.id, e.target.value)} placeholder={v.ph} />
          )}
          {v.desc && <p className={beschrijving}>{v.desc}</p>}
        </div>
      )}
    </div>
  )

  const item = (v: Veld, inKleur: boolean) => (v.type === 'section' ? kop(v, inKleur) : vraag(v))

  return (
    <form onSubmit={verstuur} noValidate className="flex flex-col gap-8" data-hs-do-not-collect="true">
      {blokken.map((blok, bi) => {
        if (!blok.kleur) return blok.items.map((v) => item(v, false))
        // Kleurvlak: volle breedte, vlakke hoeken, 32px binnenruimte links en rechts. Het vlak loopt tot aan de volgende vraag door
        // (pb-8 vult de ruimte tussen de vragen, -mb-8 neemt die ruimte weer terug) en nog 16px (geel 48px) onder een laatste vraag.
        const bleed = !blokken[bi + 1]?.kleur
        return (
          <div
            key={blok.items[0].id}
            className={`relative -mb-8 flex flex-col gap-8 px-8 pb-8 ${KLEUR_KLASSE[blok.kleur]} ${bleed ? `after:absolute after:inset-x-0 after:top-full after:bg-inherit ${blok.kleur === 'geel' ? 'after:h-12' : 'after:h-4'}` : ''}`}
          >
            {blok.items.map((v) => item(v, true))}
          </div>
        )
      })}
      {/* Afstand laatste vraag tot knop: 46,1px vanaf 768px, 24,4px erboven; het oude formulier laat onder de knop nog 24px staan */}
      <div className="-mt-[21.7px] pb-6 pt-[14.1px] md:mt-0">
        {fout && (
          <div className="mb-3">
            <Foutmelding tekst={fout} />
          </div>
        )}
        <VerstuurKnop bezig={bezig} />
      </div>
    </form>
  )
}
