import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { site } from '../../lib/site'
import { beeld, SIZES } from '../../lib/beeld'
import { diensten, footerDiensten, vindDienst } from '../../content/diensten'
import { Button, Container, PhoneFill, StarFill } from '../ui'

/*
 * Header zoals de oude site:
 *  - vanaf 992px: reviewbalk (scrolt weg) + plakkend blok met logo/telefoon/knoppen en hoofdmenu (schaduw)
 *  - onder 992px: logo, telefoon (vanaf 768px) en hamburger; het menu klapt open onder de header
 *
 * Bediening (naast de oude site):
 *  - dropdown: muis (hover), tik (wisselt), toetsenbord (Enter/spatie, pijltjestoetsen, Escape sluit en geeft de focus terug)
 *  - mobiel menu: scrollt de pagina niet mee (scrollslot), het paneel scrolt zelf als het niet in beeld past;
 *    Escape sluit het en geeft de focus terug, de pagina erachter is inert (Tab blijft in het menu)
 */

/** Volgorde van "Veel voorkomende problemen" op de oude site (WordPress-menu, 3 kolommen) */
const DROPDOWN_VOLGORDE = [
  'hulp-bij-aansprakelijkheid-voor-schulden',
  'hulp-bij-belastingcontrole',
  'hulp-bij-belastingschuld',
  'hulp-bij-beslaglegging',
  'hulp-bij-bezwaar-maken',
  'hulp-bij-conservatoir-beslag',
  'hulp-bij-de-corona-regeling',
  'hulp-bij-een-bedrijfsopvolging',
  'hulp-bij-een-coronaschuld',
  'hulp-bij-een-definitieve-aanslag',
  'hulp-bij-een-deurwaarder',
  'hulp-bij-een-naheffingsaanslag',
  'hulp-bij-een-navorderingsaanslag',
  'hulp-bij-een-now-schuld',
  'hulp-bij-een-tvl-schuld',
  'hulp-bij-een-voorlopige-aanslag',
  'hulp-bij-een-vooroverleg',
  'hulp-bij-een-vragenbrief',
  'hulp-bij-executoriaal-beslag',
  'hulp-bij-internationaal-belastingrecht',
  'hulp-bij-invordering',
  'hulp-bij-jouw-belasting-audit',
  'hulp-bij-loonbeslag',
  'hulp-bij-saneren-belastingschuld',
  'hulp-kwijtschelding-belastingschuld',
  'hulp-met-in-beroep-gaan',
  'schijn-zelfstandigheid',
]
const dropdownDiensten = [
  ...DROPDOWN_VOLGORDE.map((slug) => vindDienst(slug)).filter((d) => d !== undefined),
  ...diensten.filter((d) => !DROPDOWN_VOLGORDE.includes(d.slug)),
]
/** Het dropdownpaneel heeft 3 kolommen: pijltje omhoog/omlaag springt een rij */
const DROPDOWN_KOLOMMEN = 3

const nav = [
  { label: 'Home', to: '/' },
  { label: 'Veel voorkomende problemen', menu: true },
  { label: 'Over ons', to: '/over-ons/' },
  { label: 'Onze werkwijze', to: '/onze-werkwijze/' },
  { label: 'Kennisbank', to: '/kennisbank/' },
  { label: 'Gratis intakegesprek', to: '/gratis-intakegesprek/' },
  { label: 'Contact', to: '/contact/' },
] as const

/** Mobiel menu: geen Home, Contact en losse intake-link; die zitten niet in het menu van de oude site */
const mobielNav = [
  { label: 'Over ons', to: '/over-ons/' },
  { label: 'Onze werkwijze', to: '/onze-werkwijze/' },
  { label: 'Kennisbank', to: '/kennisbank/' },
] as const

/** Het mobiele menu van de oude site schrijft vijf diensten met een kleine letter (eigen menulabels, anders dan de dienstnamen) */
const MOBIEL_LABELS: Record<string, string> = {
  'hulp-bij-de-corona-regeling': 'Corona regeling',
  'hulp-kwijtschelding-belastingschuld': 'Kwijtschelding belastingschuld',
  'hulp-bij-saneren-belastingschuld': 'Saneren belastingschuld',
  'hulp-bij-conservatoir-beslag': 'Conservatoir beslag',
  'hulp-bij-aansprakelijkheid-voor-schulden': 'Aansprakelijkheid voor schulden',
}

const mobielRij = 'w-[calc(100%+2rem)] -mx-4 border-b border-white p-4 text-left text-[18px] text-brand-700'

export default function Header() {
  const { pathname } = useLocation()
  // Menu's onthouden bij welke pagina ze geopend zijn; navigeren sluit ze dus vanzelf
  const [mobielPad, setMobielPad] = useState<string | null>(null)
  const [menuPad, setMenuPad] = useState<string | null>(null)
  const [mobielDiensten, setMobielDiensten] = useState(false)
  // Onderkant van de header op het moment van openen (px vanaf de bovenkant van het scherm) en hoogte van het dienstenpaneel
  const [menuTop, setMenuTop] = useState(103)
  const [dienstenHoogte, setDienstenHoogte] = useState(0)
  const mobielOpen = mobielPad === pathname
  const menuOpen = menuPad === pathname
  const setMobielOpen = (open: boolean) => setMobielPad(open ? pathname : null)
  const setMenuOpen = (open: boolean) => setMenuPad(open ? pathname : null)

  const headerRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const dropdownKnopRef = useRef<HTMLButtonElement>(null)
  const dropdownPaneelRef = useRef<HTMLDivElement>(null)
  const mobielKnopRef = useRef<HTMLButtonElement>(null)
  const dienstenKnopRef = useRef<HTMLButtonElement>(null)
  const dienstenPaneelRef = useRef<HTMLDivElement>(null)
  const terugKnopRef = useRef<HTMLButtonElement>(null)
  const inDienstenPaneel = useRef(false)
  // Hoe is het menu-item het laatst bediend? Een muisklik mag het (door hover geopende) menu niet sluiten.
  const laatsteInvoer = useRef<string>('')

  // Escape sluit het geopende menu; een klik of tik buiten het hoofdmenu sluit de dropdown
  useEffect(() => {
    if (!menuOpen && !mobielOpen) return
    const toets = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (menuOpen) {
        setMenuPad(null)
        dropdownKnopRef.current?.focus()
      }
      if (mobielOpen) {
        setMobielPad(null)
        mobielKnopRef.current?.focus()
      }
    }
    const buiten = (e: PointerEvent) => {
      if (menuOpen && navRef.current && !navRef.current.contains(e.target as Node)) setMenuPad(null)
    }
    document.addEventListener('keydown', toets)
    document.addEventListener('pointerdown', buiten)
    return () => {
      document.removeEventListener('keydown', toets)
      document.removeEventListener('pointerdown', buiten)
    }
  }, [menuOpen, mobielOpen])

  // Scrollslot achter het open mobiele menu. De pagina staat op html (overflow-x: clip in styles.css),
  // dus het slot moet daar op. Een eventuele scrollbalk wordt opgevangen zodat de pagina niet verspringt.
  // De pagina erachter (main, footer en de skip-link, de buren van de header) is `inert`: Tab en schermlezer blijven in het menu.
  // Wordt het venster breed genoeg voor het desktopmenu (tablet draaien), dan sluit het mobiele menu.
  useEffect(() => {
    if (!mobielOpen) return
    const html = document.documentElement
    const body = document.body
    const eerderHtml = html.style.overflow
    const eerderPadding = body.style.paddingRight
    const balk = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    if (balk > 0) body.style.paddingRight = `${balk}px`
    const achter = Array.from(headerRef.current?.parentElement?.querySelectorAll(':scope > main, :scope > footer, :scope > a[href="#hoofdinhoud"]') ?? [])
    achter.forEach((el) => el.setAttribute('inert', ''))
    const breed = window.matchMedia('(min-width: 992px)')
    const sluitBijBreed = () => {
      if (breed.matches) setMobielPad(null)
    }
    breed.addEventListener('change', sluitBijBreed)
    return () => {
      breed.removeEventListener('change', sluitBijBreed)
      achter.forEach((el) => el.removeAttribute('inert'))
      html.style.overflow = eerderHtml
      body.style.paddingRight = eerderPadding
    }
  }, [mobielOpen])

  // Focus volgt het tweede paneel van het mobiele menu: naar de terugknop bij openen, terug naar "Veel voorkomende problemen" bij sluiten
  useEffect(() => {
    if (!mobielOpen) {
      inDienstenPaneel.current = false
      return
    }
    if (mobielDiensten) {
      terugKnopRef.current?.focus({ preventScroll: true })
      inDienstenPaneel.current = true
    } else if (inDienstenPaneel.current) {
      dienstenKnopRef.current?.focus({ preventScroll: true })
      inDienstenPaneel.current = false
    }
  }, [mobielOpen, mobielDiensten])

  const openMobiel = () => {
    if (!mobielOpen) setMenuTop(Math.round(headerRef.current?.getBoundingClientRect().bottom ?? 103))
    setMobielDiensten(false)
    setMobielOpen(!mobielOpen)
  }

  const openDiensten = () => {
    setDienstenHoogte(dienstenPaneelRef.current?.scrollHeight ?? 0)
    setMobielDiensten(true)
  }

  // Pijltjestoetsen in het dropdownpaneel: omlaag/omhoog = een rij, links/rechts = een item, Home/End = eerste/laatste
  const dropdownToets = (e: KeyboardEvent<HTMLDivElement>) => {
    const links = Array.from(dropdownPaneelRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])
    if (e.target === dropdownKnopRef.current) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMenuOpen(true)
        requestAnimationFrame(() => links[0]?.focus())
      }
      return
    }
    const nu = links.indexOf(e.target as HTMLAnchorElement)
    if (nu < 0) return
    let volgende = nu
    switch (e.key) {
      case 'ArrowDown':
        if (nu + DROPDOWN_KOLOMMEN < links.length) volgende = nu + DROPDOWN_KOLOMMEN
        break
      case 'ArrowUp':
        if (nu - DROPDOWN_KOLOMMEN >= 0) volgende = nu - DROPDOWN_KOLOMMEN
        else {
          e.preventDefault()
          dropdownKnopRef.current?.focus()
          return
        }
        break
      case 'ArrowRight':
        volgende = Math.min(nu + 1, links.length - 1)
        break
      case 'ArrowLeft':
        volgende = Math.max(nu - 1, 0)
        break
      case 'Home':
        volgende = 0
        break
      case 'End':
        volgende = links.length - 1
        break
      default:
        return
    }
    e.preventDefault()
    links[volgende]?.focus()
  }

  const beschikbaar = `calc(100dvh - ${menuTop}px)`

  return (
    <>
      {/* Reviewbalk: alleen vanaf 992px, scrolt met de pagina mee weg */}
      <div className="bg-textuur hidden min-[992px]:block">
        <Container className="flex items-center gap-2 py-2 text-[14px]">
          <span className="flex text-text" role="img" aria-label={`${site.reviews.score} van 5 sterren`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <StarFill key={i} className="size-4" />
            ))}
          </span>
          <span>
            Een score van <strong>{site.reviews.score}</strong> uit 5 op basis van{' '}
            {/* Onzichtbaar vergroot tikvlak (44px hoog) zonder dat de regel hoger wordt; de oude site heeft hier geen link */}
            <Link to="/" hash="reviews" className="relative underline after:absolute after:-inset-x-1 after:-inset-y-[13px] after:content-['']">
              {site.reviews.count} reviews
            </Link>
          </span>
        </Container>
      </div>

      <header ref={headerRef} className="relative z-50 bg-white min-[992px]:sticky min-[992px]:top-0 min-[992px]:shadow-header">
        <Container className="flex items-center justify-between py-6">
          <Link to="/" aria-label={`${site.name}, naar de homepage`} className="shrink-0">
            <img {...beeld('/images/brand/2024-06-belasting-bemiddelaar-logo-420.webp', SIZES.logoHeader)} alt={site.name} width={191} height={55} className="aspect-[420/121] h-[55px] w-auto" />
          </Link>

          <div className="flex items-center gap-4 min-[768px]:gap-12 min-[992px]:gap-6 min-[1200px]:gap-12">
            {/* Telefoon vanaf 768px zoals de oude site (992-1099px: zonder "Bel direct op:", anders past het niet naast de knoppen) */}
            <div className="hidden items-center gap-4 min-[768px]:flex">
              <PhoneFill className="size-4 shrink-0 text-brand-700" />
              <div>
                <p className="text-[20px] leading-[1.3] font-medium whitespace-nowrap text-brand-700">
                  <a href={site.phoneHref}>
                    <span className="min-[992px]:max-[1099px]:hidden">Bel direct op: </span>
                    {site.phone}
                  </a>
                </p>
                <span className="flex items-center gap-1 text-[12px] text-muted">
                  <span className="size-2 rounded-full bg-[#31d937]" aria-hidden="true" />
                  {site.belTijden}
                </span>
              </div>
            </div>
            {/* Onder 768px heeft de oude header geen telefoon; projectregel: het nummer blijft bereikbaar (nummer waar ruimte is, anders de hoorn) */}
            <a
              href={site.phoneHref}
              className="tik flex min-h-11 items-center gap-2 text-[14px] font-medium text-brand-700 min-[768px]:hidden"
              aria-label={`Bel ${site.phone}`}
            >
              <PhoneFill className="size-5 shrink-0 min-[480px]:size-4" />
              <span className="max-[479px]:hidden">{site.phone}</span>
            </a>

            <div className="hidden items-center gap-4 min-[992px]:flex">
              <Button href="/gratis-intakegesprek/" arrow variant="blue" size="header">
                Gratis intakegesprek
              </Button>
              <Button href={site.afspraakHref} arrow variant="yellow" size="header">
                Online afspraak inplannen
              </Button>
            </div>

            {/* Hamburger: 30x20px tekening in een tikdoel van 44px, wordt een kruisje */}
            <button
              ref={mobielKnopRef}
              type="button"
              className="-mx-[7px] grid size-11 shrink-0 place-items-center min-[992px]:hidden"
              aria-label={mobielOpen ? 'Menu sluiten' : 'Menu openen'}
              aria-expanded={mobielOpen}
              aria-controls="mobiel-menu"
              onClick={openMobiel}
            >
              <span className="relative block h-5 w-[30px]" aria-hidden="true">
                <span className={`absolute inset-x-0 top-0 h-[3px] rounded-full bg-brand-700 transition-transform duration-300 motion-reduce:transition-none ${mobielOpen ? 'translate-y-[8.5px] rotate-45' : ''}`} />
                <span className={`absolute inset-x-0 top-[8.5px] h-[3px] rounded-full bg-brand-700 transition-opacity duration-300 motion-reduce:transition-none ${mobielOpen ? 'opacity-0' : ''}`} />
                <span className={`absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-brand-700 transition-transform duration-300 motion-reduce:transition-none ${mobielOpen ? '-translate-y-[8.5px] -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </Container>

        {/* Hoofdmenu desktop */}
        <nav ref={navRef} aria-label="Hoofdmenu" className="hidden border-t border-bkg-light min-[992px]:block">
          <Container className="relative flex items-center justify-between">
            {nav.map((item) =>
              'menu' in item ? (
                <div
                  key={item.label}
                  className="min-[1100px]:relative"
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setMenuOpen(true)}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && setMenuOpen(false)}
                  onKeyDown={dropdownToets}
                  onBlur={(e) => {
                    // Toetsenbord: focus die buiten het menu belandt sluit het menu
                    if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) setMenuOpen(false)
                  }}
                >
                  <button
                    ref={dropdownKnopRef}
                    type="button"
                    className={`flex cursor-pointer items-center py-4 text-[17px] transition-colors duration-300 hover:text-brand-700 ${menuOpen ? 'text-brand-700' : 'text-text'}`}
                    aria-expanded={menuOpen}
                    aria-controls="dropdown-diensten"
                    onPointerDown={(e) => {
                      laatsteInvoer.current = e.pointerType
                    }}
                    onClick={() => {
                      // Muis: de hover opende het al, een klik laat het menu staan. Tik of toets: wisselen.
                      if (laatsteInvoer.current === 'mouse') setMenuOpen(true)
                      else setMenuOpen(!menuOpen)
                      laatsteInvoer.current = ''
                    }}
                  >
                    {item.label}
                    <span aria-hidden="true" className="ml-[0.5em] size-[0.35em] rotate-135 border-t-[0.1em] border-r-[0.1em] border-current" />
                  </button>
                  {/* Altijd aanwezig (zoals de verborgen submenu's van de oude site), zodat aria-controls klopt en de links in de HTML staan */}
                  <div
                    id="dropdown-diensten"
                    ref={dropdownPaneelRef}
                    className={`bg-textuur absolute top-full left-4 z-[60] max-h-[calc(100vh-176px)] w-max grid-cols-[repeat(3,auto)] gap-x-20 overflow-y-auto rounded-b-sm p-8 whitespace-nowrap min-[1100px]:left-0 min-[1100px]:-ml-8 ${menuOpen ? 'grid' : 'hidden'}`}
                  >
                    {dropdownDiensten.map((d) => (
                      <Link
                        key={d.slug}
                        to="/dienst/$dienst/"
                        params={{ dienst: d.slug }}
                        className="block py-4 text-text transition-colors duration-300 hover:text-brand-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        {d.naam}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.label} to={item.to} className="py-4 text-text transition-colors duration-300 hover:text-brand-700">
                  {item.label}
                </Link>
              ),
            )}
          </Container>
        </nav>

        {/* Mobiel menu: lichtblauw vlak onder de header; "Veel voorkomende problemen" schuift een tweede paneel in.
            Een tik op een link sluit het menu, ook als je al op die pagina bent. */}
        {mobielOpen && (
          <div
            id="mobiel-menu"
            className="bg-bkg-light absolute inset-x-0 top-full z-[15] overflow-hidden min-[992px]:hidden"
            style={{ maxHeight: beschikbaar, height: mobielDiensten && dienstenHoogte ? `min(${dienstenHoogte}px, ${beschikbaar})` : undefined }}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) setMobielOpen(false)
            }}
          >
            <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: beschikbaar }} inert={mobielDiensten}>
              <nav aria-label="Mobiel menu" className="px-4 py-8">
                <button
                  ref={dienstenKnopRef}
                  type="button"
                  className={`${mobielRij} flex cursor-pointer items-center justify-between`}
                  aria-expanded={mobielDiensten}
                  aria-controls="mobiel-diensten"
                  onClick={openDiensten}
                >
                  Veel voorkomende problemen
                  <span aria-hidden="true" className="h-3 w-2 bg-brand-700 [clip-path:polygon(40%_0,100%_50%,40%_100%,0_100%,60%_50%,0_0)]" />
                </button>
                {mobielNav.map((item, i) => (
                  <Link key={item.label} to={item.to} className={`${mobielRij} block ${i === mobielNav.length - 1 ? 'border-b-0' : ''}`}>
                    {item.label}
                  </Link>
                ))}
                <div className="mt-8 grid gap-4">
                  <Button href="/gratis-intakegesprek/" arrow className="w-full">
                    Gratis intakegesprek
                  </Button>
                  <Button href={site.afspraakHref} variant="yellow" arrow className="w-full">
                    Online afspraak inplannen
                  </Button>
                </div>
              </nav>
            </div>

            <div
              id="mobiel-diensten"
              ref={dienstenPaneelRef}
              className={`bg-bkg-light absolute inset-0 z-[1] overflow-y-auto overscroll-contain px-4 py-8 transition-transform duration-300 motion-reduce:transition-none ${mobielDiensten ? 'translate-x-0' : 'translate-x-full'}`}
              inert={!mobielDiensten}
            >
              <button
                ref={terugKnopRef}
                type="button"
                className="relative -mt-3 -ml-3 mb-1 grid size-11 cursor-pointer place-items-center"
                aria-label="Terug naar het menu"
                onClick={() => setMobielDiensten(false)}
              >
                <span className="relative block size-5" aria-hidden="true">
                  <span className="absolute inset-x-0 top-[9px] h-0.5 rotate-45 rounded-full bg-brand-700" />
                  <span className="absolute inset-x-0 top-[9px] h-0.5 -rotate-45 rounded-full bg-brand-700" />
                </span>
              </button>
              <nav aria-label="Veel voorkomende problemen">
                <ul>
                  {footerDiensten.map((d, i) => (
                    <li key={d.slug}>
                      <Link
                        to="/dienst/$dienst/"
                        params={{ dienst: d.slug }}
                        className={`${mobielRij} block ${i === footerDiensten.length - 1 ? 'border-b-0' : ''}`}
                      >
                        {MOBIEL_LABELS[d.slug] ?? d.naam}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
