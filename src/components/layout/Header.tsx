import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { site } from '../../lib/site'
import { beeld, SIZES } from '../../lib/beeld'
import { hoofdmenu } from '../../content/menu'
import { Button, ChevronDown, Container, PhoneFill, StarFill } from '../ui'
import { GoogleG } from '../sections/icons'

/*
 * Header:
 *  - vanaf 992px: reviewbalk (scrolt weg) + plakkend blok met logo/telefoon/knoppen en hoofdmenu (schaduw)
 *  - onder 992px: compacte balk met logo, telefoon (vanaf 768px) en hamburger; het menu vult het scherm onder de header
 *
 * Bediening:
 *  - drie dropdowns (BV ontbinden, BV met Schulden, Bedrijf herstructureren), elk één kolom in een witte zwevende kaart
 *  - dropdown: muis (hover), tik (wisselt), toetsenbord (Enter/spatie, pijltjestoetsen, Escape sluit en geeft de focus terug)
 *  - mobiel menu (ontwerpronde 2026-11-10): dezelfde indeling als het desktopmenu, groepen klappen open als uitklaplijst.
 *    Wit paneel tot de onderkant van het scherm, scrollt zelf; de pagina erachter scrollt niet (scrollslot) en is inert
 *    (Tab blijft in het menu); de vaste balk onderaan verdwijnt zolang het menu open is. Escape sluit en geeft de focus terug.
 */

const mobielRij = 'flex w-full items-center justify-between gap-4 py-4 text-left text-[17px] font-semibold text-ink'
const navLink =
  "relative py-4 text-[16px] font-semibold text-text transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-2.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-700 after:transition-transform after:duration-200 after:content-[''] hover:text-brand-700 hover:after:scale-x-100 min-[1200px]:text-[17px]"

export default function Header() {
  const { pathname } = useLocation()
  // Menu's onthouden bij welke pagina ze geopend zijn; navigeren sluit ze dus vanzelf
  const [mobielPad, setMobielPad] = useState<string | null>(null)
  // Welke dropdown open is, met de pagina waarop hij geopend werd ("<pad>|<label>")
  const [menuPad, setMenuPad] = useState<string | null>(null)
  // Welke groep in het mobiele menu open is (label), of geen
  const [mobielGroep, setMobielGroep] = useState<string | null>(null)
  // Onderkant van de header op het moment van openen (px vanaf de bovenkant van het scherm)
  const [menuTop, setMenuTop] = useState(72)
  const mobielOpen = mobielPad === pathname
  const menuOpen = menuPad?.startsWith(`${pathname}|`) ?? false
  const openLabel = menuOpen ? menuPad!.slice(pathname.length + 1) : null
  const setMobielOpen = (open: boolean) => setMobielPad(open ? pathname : null)
  const setMenuOpen = (label: string | null) => setMenuPad(label ? `${pathname}|${label}` : null)

  const headerRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const dropdownKnoppen = useRef<Record<string, HTMLButtonElement | null>>({})
  const dropdownPanelen = useRef<Record<string, HTMLDivElement | null>>({})
  const mobielKnopRef = useRef<HTMLButtonElement>(null)
  // Hoe is het menu-item het laatst bediend? Een muisklik mag het (door hover geopende) menu niet sluiten.
  const laatsteInvoer = useRef<string>('')

  // Escape sluit het geopende menu; een klik of tik buiten het hoofdmenu sluit de dropdown
  useEffect(() => {
    if (!menuOpen && !mobielOpen) return
    const toets = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (menuOpen) {
        const knop = openLabel ? dropdownKnoppen.current[openLabel] : null
        setMenuPad(null)
        knop?.focus()
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
  }, [menuOpen, mobielOpen, openLabel])

  // Scrollslot achter het open mobiele menu. De pagina staat op html (overflow-x: clip in styles.css),
  // dus het slot moet daar op. Een eventuele scrollbalk wordt opgevangen zodat de pagina niet verspringt.
  // De pagina erachter (main, footer en de skip-link, de buren van de header) is `inert`: Tab en schermlezer blijven in het menu.
  // De klasse menu-open op html verbergt de vaste balk onderaan (MobieleBalk), die anders over het menu heen zou liggen.
  // Wordt het venster breed genoeg voor het desktopmenu (tablet draaien), dan sluit het mobiele menu.
  useEffect(() => {
    if (!mobielOpen) return
    const html = document.documentElement
    const body = document.body
    const eerderHtml = html.style.overflow
    const eerderPadding = body.style.paddingRight
    const balk = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    html.classList.add('menu-open')
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
      html.classList.remove('menu-open')
      html.style.overflow = eerderHtml
      body.style.paddingRight = eerderPadding
    }
  }, [mobielOpen])

  const openMobiel = () => {
    if (!mobielOpen) setMenuTop(Math.max(0, Math.round(headerRef.current?.getBoundingClientRect().bottom ?? 72)))
    setMobielGroep(null)
    setMobielOpen(!mobielOpen)
  }

  // Pijltjestoetsen in een dropdown (één kolom): omlaag/omhoog = volgend/vorig item, Home/End = eerste/laatste
  const dropdownToets = (label: string) => (e: KeyboardEvent<HTMLDivElement>) => {
    const knop = dropdownKnoppen.current[label]
    const links = Array.from(dropdownPanelen.current[label]?.querySelectorAll<HTMLAnchorElement>('a') ?? [])
    if (e.target === knop) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMenuOpen(label)
        requestAnimationFrame(() => links[0]?.focus())
      }
      return
    }
    const nu = links.indexOf(e.target as HTMLAnchorElement)
    if (nu < 0) return
    let volgende = nu
    switch (e.key) {
      case 'ArrowDown':
        volgende = Math.min(nu + 1, links.length - 1)
        break
      case 'ArrowUp':
        if (nu === 0) {
          e.preventDefault()
          knop?.focus()
          return
        }
        volgende = nu - 1
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

  return (
    <>
      {/* Reviewbalk: alleen vanaf 992px, scrolt met de pagina mee weg. De reviews zijn van Belasting Bemiddelaar (site.reviews.bron),
          dat staat er altijd bij. Met een Google-profiel (site.reviews.googleUrl) linkt het aantal daarheen en staat het Google-logo
          erbij; anders linkt het naar de reviews op de homepage. */}
      <div className="bg-textuur hidden min-[992px]:block">
        <Container className="flex items-center gap-2 py-2 text-[14px]">
          <span className="flex text-star" role="img" aria-label={`${site.reviews.score} van 5 sterren`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <StarFill key={i} className="size-4" />
            ))}
          </span>
          <span>
            Een score van <strong>{site.reviews.score}</strong> uit 5 op basis van{' '}
            {/* Onzichtbaar vergroot tikvlak (44px hoog) zonder dat de regel hoger wordt */}
            <a
              href={site.reviews.googleUrl || '/#reviews'}
              {...(site.reviews.googleUrl ? { target: '_blank', rel: 'noopener' } : {})}
              className="relative underline after:absolute after:-inset-x-1 after:-inset-y-[13px] after:content-['']"
            >
              {site.reviews.count} reviews
            </a>{' '}
            van {site.reviews.bron}, hetzelfde team
          </span>
          {site.reviews.googleUrl && <GoogleG className="size-5" />}
        </Container>
      </div>

      <header ref={headerRef} className="relative z-50 bg-white min-[992px]:sticky min-[992px]:top-0 min-[992px]:shadow-header">
        <Container className="flex items-center justify-between py-3.5 min-[768px]:py-4 min-[992px]:py-5">
          <Link to="/" aria-label={`${site.name}, naar de homepage`} className="shrink-0">
            <img
              {...beeld('/images/brand/logo.webp', SIZES.logoHeader)}
              alt={site.name}
              width={212}
              height={55}
              className="aspect-[424/110] h-[44px] w-auto min-[768px]:h-[50px] min-[1200px]:h-[55px]"
            />
          </Link>

          <div className="flex items-center gap-4 min-[768px]:gap-12 min-[992px]:gap-6 min-[1200px]:gap-12">
            {/* Telefoon vanaf 768px zoals de oude site (992-1099px: zonder "Bel direct op:", anders past het niet naast de knoppen).
                Zonder nummer (site.phone leeg) staan telefoonblok en hoorn er niet. */}
            {site.phone && (
            <div className="hidden items-center gap-4 min-[768px]:flex">
              <PhoneFill className="size-4 shrink-0 text-brand-700" />
              <div>
                <p className="text-[22px] leading-[1.125] font-medium whitespace-nowrap text-brand-700">
                  <a href={site.phoneHref}>
                    <span className="min-[992px]:max-[1099px]:hidden">Bel direct op: </span>
                    {site.phone}
                  </a>
                </p>
                <span className="flex items-center gap-1 text-[12px] text-bereikbaar">
                  <span className="size-2 rounded-full bg-[#31d937]" aria-hidden="true" />
                  {site.belTijden}
                </span>
              </div>
            </div>
            )}
            {/* Onder 768px heeft de oude header geen telefoon; projectregel: het nummer blijft bereikbaar (nummer waar ruimte is, anders de hoorn) */}
            {site.phone && (
            <a
              href={site.phoneHref}
              className="tik flex min-h-11 items-center gap-2 text-[14px] font-medium text-brand-700 min-[768px]:hidden"
              aria-label={`Bel ${site.phone}`}
            >
              <PhoneFill className="size-5 shrink-0 min-[480px]:size-4" />
              <span className="max-[479px]:hidden">{site.phone}</span>
            </a>
            )}

            <div className="hidden items-center gap-3 min-[992px]:flex">
              <Button href="/gratis-intakegesprek/" arrow variant="blue" size="header">
                Gratis adviesgesprek
              </Button>
              <Button href={site.afspraakHref} arrow variant="yellow" size="header">
                {site.afspraakKnop}
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
        <nav ref={navRef} aria-label="Hoofdmenu" className="hidden border-t border-line min-[992px]:block">
          <Container className="relative flex items-center justify-between">
            {hoofdmenu.map((item) => {
              if ('menu' in item) {
                const open = openLabel === item.label
                const id = `dropdown-${item.label.toLowerCase().replace(/[^a-z]+/g, '-')}`
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setMenuOpen(item.label)}
                    onPointerLeave={(e) => e.pointerType === 'mouse' && setMenuOpen(null)}
                    onKeyDown={dropdownToets(item.label)}
                    onBlur={(e) => {
                      // Toetsenbord: focus die buiten het menu belandt sluit het menu
                      if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) setMenuOpen(null)
                    }}
                  >
                    <button
                      ref={(el) => {
                        dropdownKnoppen.current[item.label] = el
                      }}
                      type="button"
                      className={`flex cursor-pointer items-center py-4 text-[16px] font-semibold transition-colors duration-200 hover:text-brand-700 min-[1200px]:text-[17px] ${open ? 'text-brand-700' : 'text-text'}`}
                      aria-expanded={open}
                      aria-controls={id}
                      onPointerDown={(e) => {
                        laatsteInvoer.current = e.pointerType
                      }}
                      onClick={() => {
                        // Muis: de hover opende het al, een klik laat het menu staan. Tik of toets: wisselen.
                        if (laatsteInvoer.current === 'mouse') setMenuOpen(item.label)
                        else setMenuOpen(open ? null : item.label)
                        laatsteInvoer.current = ''
                      }}
                    >
                      {item.label}
                      <ChevronDown className={`ml-1 size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {/* Altijd aanwezig (zoals de verborgen submenu's van de oude site), zodat aria-controls klopt en de links in de HTML staan */}
                    <div
                      id={id}
                      ref={(el) => {
                        dropdownPanelen.current[item.label] = el
                      }}
                      className={`absolute top-full left-0 z-[60] -ml-3 max-h-[calc(100vh-176px)] w-max min-w-[260px] flex-col overflow-y-auto rounded-xl border border-line bg-white p-2 whitespace-nowrap shadow-zwevend ${open ? 'flex' : 'hidden'}`}
                    >
                      {item.menu.map((d) => (
                        <Link
                          key={d.label}
                          to="/dienst/$dienst/"
                          params={{ dienst: d.slug }}
                          className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-text transition-colors duration-150 hover:bg-brand-50 hover:text-brand-700 focus-visible:bg-brand-50"
                          onClick={() => setMenuOpen(null)}
                        >
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }
              if ('dienst' in item)
                return (
                  <Link key={item.label} to="/dienst/$dienst/" params={{ dienst: item.dienst }} className={navLink}>
                    {item.label}
                  </Link>
                )
              return (
                <Link key={item.label} to={item.to} className={navLink}>
                  {item.label}
                </Link>
              )
            })}
          </Container>
        </nav>

        {/* Mobiel menu: wit paneel van de onderkant van de header tot de onderkant van het scherm, met de indeling van het
            desktopmenu. Een tik op een link sluit het menu, ook als je al op die pagina bent. */}
        {mobielOpen && (
          <div
            id="mobiel-menu"
            className="fixed inset-x-0 bottom-0 z-[15] overflow-y-auto overscroll-contain border-t border-line bg-white min-[992px]:hidden"
            style={{ top: menuTop }}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) setMobielOpen(false)
            }}
          >
            <nav aria-label="Mobiel menu">
              <Container className="pt-2 pb-10">
                <ul>
                  {hoofdmenu.map((item) => {
                    if ('menu' in item) {
                      const open = mobielGroep === item.label
                      const id = `mobiel-${item.label.toLowerCase().replace(/[^a-z]+/g, '-')}`
                      return (
                        <li key={item.label} className="border-b border-line">
                          <button
                            type="button"
                            className={`${mobielRij} cursor-pointer ${open ? 'text-brand-700' : ''}`}
                            aria-expanded={open}
                            aria-controls={id}
                            onClick={() => setMobielGroep(open ? null : item.label)}
                          >
                            {item.label}
                            <span
                              aria-hidden="true"
                              className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-200 ${open ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-700'}`}
                            >
                              <ChevronDown className={`size-4 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
                            </span>
                          </button>
                          <ul id={id} hidden={!open} className="mb-4 ml-1 border-l-2 border-brand-100 pl-4">
                            {item.menu.map((d) => (
                              <li key={d.label}>
                                <Link
                                  to="/dienst/$dienst/"
                                  params={{ dienst: d.slug }}
                                  className="block py-2.5 text-[16px] font-medium text-body transition-colors hover:text-brand-700"
                                >
                                  {d.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      )
                    }
                    return (
                      <li key={item.label} className="border-b border-line">
                        {'dienst' in item ? (
                          <Link to="/dienst/$dienst/" params={{ dienst: item.dienst }} className={mobielRij}>
                            {item.label}
                          </Link>
                        ) : (
                          <Link to={item.to} className={mobielRij}>
                            {item.label}
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-8 grid gap-3">
                  <Button href="/gratis-intakegesprek/" arrow className="w-full">
                    Gratis intakegesprek
                  </Button>
                  <Button href={site.afspraakHref} variant="yellow" arrow className="w-full">
                    {site.afspraakKnop}
                  </Button>
                </div>
                <p className="mt-6 text-center text-[14px] text-muted">
                  {site.phone ? (
                    <a href={site.phoneHref} className="font-semibold text-brand-700">
                      {site.phone}
                    </a>
                  ) : (
                    <a href={`mailto:${site.email}`} className="font-semibold text-brand-700">
                      {site.email}
                    </a>
                  )}
                  <br />
                  {site.belTijden}
                </p>
              </Container>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
