import { useId, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { reviews } from '../../content/home'
import { site } from '../../lib/site'
import { Container } from '../ui'
import { FaStar, PijlLang } from './icons'

/** Bezoekers die minder beweging willen krijgen geen vloeiende animatie bij het schuiven (WCAG 2.3.3) */
const scrollGedrag = (): ScrollBehavior => (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')

/**
 * Reviews zoals de oude site: kop links, score met zwarte sterren rechts, ronde pijlknoppen boven de slider en vlakke
 * witte kaarten van 600px die doorlopen tot de rand van het scherm (kaart 3 steekt eruit). De pijlen lopen rond (aan het
 * einde terug naar het begin en omgekeerd, zoals de oneindige Flickity-slider) en met de muis is de lijst te slepen
 * (cursor grab). De scrollbare lijst is met het toetsenbord bereikbaar en heeft een naam voor schermlezers.
 */
export default function Reviews() {
  const lijstId = useId()
  const lijst = useRef<HTMLUListElement>(null)
  const sleep = useRef<{ x: number; scrollLeft: number; actief: boolean } | null>(null)
  const [sleept, setSleept] = useState(false)

  const schuif = (richting: 1 | -1) => {
    const el = lijst.current
    if (!el) return
    const kaart = el.firstElementChild as HTMLElement | null
    const stap = (kaart?.offsetWidth ?? el.clientWidth) + 32
    const max = el.scrollWidth - el.clientWidth
    const behavior = scrollGedrag()
    if (richting === 1 && el.scrollLeft >= max - 2) el.scrollTo({ left: 0, behavior })
    else if (richting === -1 && el.scrollLeft <= 2) el.scrollTo({ left: max, behavior })
    else el.scrollBy({ left: richting * stap, behavior })
  }

  // Slepen met de muis (aanraken scrolt al native): tijdens het slepen staat het magnetisch uitlijnen uit, daarna klikt de lijst weer vast
  const sleepStart = (e: PointerEvent<HTMLUListElement>) => {
    const el = lijst.current
    if (!el || e.pointerType !== 'mouse' || e.button !== 0) return
    sleep.current = { x: e.clientX, scrollLeft: el.scrollLeft, actief: false }
  }
  const sleepVerder = (e: PointerEvent<HTMLUListElement>) => {
    const el = lijst.current
    const s = sleep.current
    if (!el || !s) return
    // De muisknop is buiten de lijst losgelaten: niet meer slepen
    if (e.buttons === 0) return sleepEinde(e)
    const dx = e.clientX - s.x
    if (!s.actief) {
      if (Math.abs(dx) < 4) return
      s.actief = true
      el.setPointerCapture(e.pointerId)
      el.style.scrollSnapType = 'none'
      setSleept(true)
    }
    el.scrollLeft = s.scrollLeft - dx
  }
  function sleepEinde(e: PointerEvent<HTMLUListElement>) {
    const el = lijst.current
    const s = sleep.current
    sleep.current = null
    if (!el || !s?.actief) return
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    el.style.scrollSnapType = ''
    setSleept(false)
  }

  const pijl =
    'tik grid size-[35px] cursor-pointer place-items-center rounded-full bg-brand-700 text-white hover:bg-brand-hover min-[992px]:size-[52px]'
  return (
    <section id="reviews" className="bg-textuur py-[72px]" data-reveal suppressHydrationWarning>
      <Container>
        <div className="mb-12 flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
          <div className="min-[992px]:w-[60%] min-[992px]:pr-4">
            <h2 className="mb-4">
              Ontdek wat tevreden klanten
              <br />
              over ons zeggen
            </h2>
            <p>Lees wat onze tevreden klanten over ons zeggen</p>
          </div>
          <div className="flex items-start justify-end min-[992px]:w-[40%] min-[992px]:pl-4">
            <div className="mb-12 flex items-center gap-2">
              <span className="flex text-black" role="img" aria-label={`${site.reviews.score} van 5 sterren`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <FaStar key={i} className="size-4" />
                ))}
              </span>
              <span className="text-[14px]">
                <b>{site.reviews.score}</b> uit 5
              </span>
            </div>
          </div>
        </div>
        <div className="relative" role="region" aria-roledescription="carousel" aria-label="Klantreviews">
          <div className="absolute -top-4 right-0 flex -translate-y-full gap-3 min-[992px]:-top-8">
            <button type="button" onClick={() => schuif(-1)} aria-label="Vorige reviews" aria-controls={lijstId} className={pijl}>
              <PijlLang className="h-[11px] w-[16.5px] rotate-180" />
            </button>
            <button type="button" onClick={() => schuif(1)} aria-label="Volgende reviews" aria-controls={lijstId} className={pijl}>
              <PijlLang className="h-[11px] w-[16.5px]" />
            </button>
          </div>
          <ul
            ref={lijst}
            id={lijstId}
            role="list"
            tabIndex={0}
            aria-label="Reviews van klanten"
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={sleepStart}
            onPointerMove={sleepVerder}
            onPointerUp={sleepEinde}
            onPointerCancel={sleepEinde}
            className={`no-scrollbar mr-[calc(50%_-_50vw)] flex snap-x snap-mandatory items-start gap-8 overflow-x-auto ${sleept ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          >
            {reviews.map((r) => (
              <li key={r.naam} className="w-[calc(100vw_-_2rem)] shrink-0 snap-start rounded-sm border border-oud-rand bg-white p-8 md:w-[600px]">
                <div className="mb-6">
                  {/* h3 (geen h4) zodat de kopvolgorde onder de h2 klopt; maat blijft die van de oude h4 (16px, vanaf 768px 18px) */}
                  <h3 className="text-[16px] md:text-[18px]">{r.bedrijf}</h3>
                  <p className="text-[14px]">{r.datum}</p>
                </div>
                <p className="mb-4">
                  <b>{r.naam}</b>
                </p>
                <p>{r.tekst}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
