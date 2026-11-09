import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, Close } from '../ui'
import {
  CONSENT_STORAGE_KEY as STORAGE_KEY,
  parseKeuzes,
  standaardKeuzes as standaard,
  updateConsent,
  type Keuzes,
} from '../../lib/consent'

function abonneer(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener('cookie-consent-gewijzigd', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('cookie-consent-gewijzigd', callback)
  }
}

function leesSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? 'geen'
}

function serverSnapshot(): string {
  return 'onbekend'
}

const categorieen = [
  {
    key: 'voorkeuren',
    label: 'Voorkeuren',
    tekst: 'De technische opslag of toegang is noodzakelijk voor het legitieme doel voorkeuren op te slaan die niet door de abonnee of gebruiker zijn aangevraagd.',
  },
  {
    key: 'statistieken',
    label: 'Statistieken',
    tekst:
      'De technische opslag of toegang die uitsluitend wordt gebruikt voor anonieme statistische doeleinden. Zonder dagvaarding, vrijwillige naleving door je internetprovider of aanvullende gegevens van een derde partij kan informatie die alleen voor dit doel wordt opgeslagen of opgehaald gewoonlijk niet worden gebruikt om je te identificeren.',
  },
  {
    key: 'marketing',
    label: 'Marketing',
    tekst:
      'De technische opslag of toegang is nodig om gebruikersprofielen op te stellen voor het verzenden van reclame, of om de gebruiker op een site of over verschillende sites te volgen voor soortgelijke marketingdoeleinden.',
  },
] as const

/* Tekst van de oude Complianz-banner (CKB-04), met 'je' in plaats van het 'uw' dat daar halverwege de zin stond */
const bannerTekst =
  "Om de beste ervaringen te bieden, gebruiken wij technologieën zoals cookies om informatie over je apparaat op te slaan en/of te raadplegen. Door in te stemmen met deze technologieën kunnen wij gegevens zoals surfgedrag of unieke ID's op deze site verwerken. Als je geen toestemming geeft of je toestemming intrekt, kan dit een nadelige invloed hebben op bepaalde functies en mogelijkheden."

/* Knoppen zoals de oude Complianz-banner: pil van 45px, 15px/500, grijs (Accepteren blauw) */
/* Onder 640px compact: drie knoppen naast elkaar (40px, 13px), zodat de banner maximaal ~30% van het scherm beslaat */
const knop =
  'h-10 min-w-0 flex-1 shrink-0 whitespace-nowrap rounded-full border border-transparent px-1 font-banner text-[13px] font-medium transition-colors duration-200 sm:h-[45px] sm:w-auto sm:px-2 sm:text-[15px]'
const knopGrijs = `${knop} bg-banner-knop text-banner-tekst hover:bg-banner-knop-hover`
const knopBlauw = `${knop} border-brand-700 bg-brand-700 text-white hover:border-brand-hover hover:bg-brand-hover`

/* Schakelaar voor een categorie: native checkbox (role=switch), blauw als aan */
const schakel =
  'relative h-[22px] w-[40px] shrink-0 cursor-pointer appearance-none rounded-full bg-schakel-uit transition-colors checked:bg-brand-700 before:absolute before:left-[3px] before:top-[3px] before:size-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-[18px]'

/**
 * Cookiebanner naar het voorbeeld van de oude site: compacte lichtblauwe kaart linksonder (mobiel: volle breedte onderaan),
 * gecentreerde blauwe titel, sluitkruisje, pilknoppen en links naar cookiebeleid en privacyverklaring. De voorkeuren
 * staan in compacte rijen met een schakelaar; de knoppen blijven altijd in beeld.
 *
 * Toegankelijkheid: role=dialog (niet-modaal), staat vóór de header in de DOM (toetsenbord bereikt hem direct), bij
 * heropenen via de footer gaat de focus naar de kaart en bij sluiten terug naar de opener; Escape sluit een heropende banner.
 */
export default function CookieBanner() {
  const opgeslagen = useSyncExternalStore(abonneer, leesSnapshot, serverSnapshot)
  const [geopend, setGeopend] = useState(false)
  const [voorkeurenOpen, setVoorkeurenOpen] = useState(false)
  const [bewerkteKeuzes, setBewerkteKeuzes] = useState<Keuzes>(standaard)
  const [uitgeklapt, setUitgeklapt] = useState<string | null>(null)
  const kaartRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const openHandler = () => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setBewerkteKeuzes(parseKeuzes(localStorage.getItem(STORAGE_KEY)))
      setGeopend(true)
      setVoorkeurenOpen(true)
    }
    window.addEventListener('open-cookie-voorkeuren', openHandler)
    return () => window.removeEventListener('open-cookie-voorkeuren', openHandler)
  }, [])

  const zichtbaar = opgeslagen !== 'onbekend' && (opgeslagen === 'geen' || geopend)

  // Heropend via de footer: focus naar de kaart
  useEffect(() => {
    if (geopend && zichtbaar) kaartRef.current?.focus()
  }, [geopend, zichtbaar])

  const terugNaarOpener = useCallback(() => {
    const opener = openerRef.current
    openerRef.current = null
    if (opener && document.contains(opener)) opener.focus()
  }, [])

  // Sluit een heropende banner zonder de bestaande keuze te wijzigen
  const sluitHeropend = useCallback(() => {
    setGeopend(false)
    setVoorkeurenOpen(false)
    setUitgeklapt(null)
    terugNaarOpener()
  }, [terugNaarOpener])

  function bewaar(nieuw: Keuzes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ keuzes: nieuw, datum: new Date().toISOString() }))
      window.dispatchEvent(new CustomEvent('cookie-consent-gewijzigd', { detail: nieuw }))
    } catch {
      // opslag niet beschikbaar: banner verdwijnt alleen voor deze sessie
    }
    updateConsent(nieuw)
    sluitHeropend()
  }

  // Kruisje: bij het eerste bezoek gelijk aan Weigeren (zoals de oude banner), bij heropenen sluiten met behoud van de keuze
  function sluit() {
    if (opgeslagen === 'geen' && !geopend) bewaar(standaard)
    else sluitHeropend()
  }

  useEffect(() => {
    if (!zichtbaar || !geopend) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') sluitHeropend()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [zichtbaar, geopend, sluitHeropend])

  if (!zichtbaar) return null

  return (
    <div
      ref={kaartRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-titel"
      aria-describedby="cookie-tekst"
      tabIndex={-1}
      className={`fixed bottom-0 left-0 z-100 flex ${voorkeurenOpen ? 'max-h-dvh' : 'max-h-[30dvh]'} w-full flex-col rounded-t-[4px] bg-bkg-light shadow-banner focus:outline-none sm:bottom-[10px] sm:left-[10px] sm:max-h-[calc(100dvh-20px)] sm:w-[548px] sm:rounded-[4px]`}
    >
      <button
        type="button"
        onClick={sluit}
        aria-label="Sluiten"
        className="tik absolute right-4 top-3 z-10 sm:right-8 grid size-5 place-items-center text-banner-tekst hover:text-brand-700 sm:top-[34px]"
      >
        <Close className="size-5 [stroke-width:3]" />
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 sm:px-8 sm:pt-8">
        {/* Op mobiel zonder zichtbare titel (oude site), voor schermlezers altijd aanwezig */}
        <h2 id="cookie-titel" className="sr-only text-center text-[18px] font-bold leading-[1.3] sm:not-sr-only sm:mb-5 sm:block sm:px-8">
          Beheer toestemming
        </h2>
        {/* Mobiel: tekst begint 40px onder de bovenrand (naast het kruisje), 5px smaller dan de kaart, zoals de oude banner */}
        <p id="cookie-tekst" className="pr-8 text-[12px] leading-[17px] text-banner-tekst sm:mt-0 sm:pr-0 sm:text-[14px] sm:leading-[21px]">
          {bannerTekst}
        </p>

        {voorkeurenOpen && (
          <fieldset className="mt-3 space-y-2.5 border-0 p-0">
            <legend className="sr-only">Cookiecategorieën</legend>
            <div className="bg-banner-knop">
              <div className="flex h-[45px] items-center justify-between gap-3 px-[10px]">
                <span className="text-[14px] font-medium text-banner-tekst">Functioneel</span>
                <span className="text-[13px] font-medium text-banner-actief">Altijd actief</span>
              </div>
            </div>
            {categorieen.map((cat) => {
              const open = uitgeklapt === cat.key
              return (
                <div key={cat.key} className="bg-banner-knop">
                  <div className="flex h-[45px] items-center justify-between gap-3 px-[10px]">
                    <label htmlFor={`ck-${cat.key}`} className="flex-1 cursor-pointer text-[14px] font-medium text-banner-tekst">
                      {cat.label}
                    </label>
                    <input
                      id={`ck-${cat.key}`}
                      type="checkbox"
                      role="switch"
                      checked={bewerkteKeuzes[cat.key]}
                      onChange={(e) => setBewerkteKeuzes((k) => ({ ...k, [cat.key]: e.target.checked }))}
                      className={schakel}
                    />
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`ck-uitleg-${cat.key}`}
                      aria-label={`Toelichting ${cat.label}`}
                      onClick={() => setUitgeklapt(open ? null : cat.key)}
                      className="tik grid size-6 place-items-center text-banner-tekst"
                    >
                      <ChevronDown className={`size-5 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {open && (
                    <p id={`ck-uitleg-${cat.key}`} className="px-[10px] pb-3 text-[13px] leading-[1.5] text-banner-tekst">
                      {cat.tekst}
                    </p>
                  )}
                </div>
              )
            })}
          </fieldset>
        )}
      </div>

      <div className="shrink-0 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 sm:px-8 sm:pb-9 sm:pt-[25px]">
        <div className="flex flex-row gap-[6px] sm:gap-[10px]">
          <button
            type="button"
            className={knopBlauw}
            onClick={() => bewaar({ voorkeuren: true, statistieken: true, marketing: true })}
          >
            Accepteren
          </button>
          <button type="button" className={knopGrijs} onClick={() => bewaar(standaard)}>
            Weigeren
          </button>
          {voorkeurenOpen ? (
            <button type="button" className={knopGrijs} onClick={() => bewaar(bewerkteKeuzes)}>
              Voorkeuren opslaan
            </button>
          ) : (
            <button
              type="button"
              className={knopGrijs}
              onClick={() => {
                setBewerkteKeuzes(parseKeuzes(localStorage.getItem(STORAGE_KEY)))
                setVoorkeurenOpen(true)
              }}
            >
              Bekijk voorkeuren
            </button>
          )}
        </div>
        {/* pr-[11px]: de linkregel van de oude banner staat 5,5px links van het midden */}
        <div className="mt-1 flex flex-wrap justify-center gap-x-[10px] gap-y-1 text-[12px] leading-[18px] sm:mt-4 sm:pr-[11px] sm:text-[14px] sm:leading-[21px]">
          <Link to="/cookiebeleid-eu/" className="tik text-brand-700 underline">
            Cookiebeleid
          </Link>
          <Link to="/privacyverklaring-eu/" className="tik text-brand-700 underline">
            Privacyverklaring
          </Link>
        </div>
      </div>
    </div>
  )
}
