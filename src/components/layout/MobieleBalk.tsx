import { site } from '../../lib/site'

type W = Window & { dataLayer?: unknown[] }

function meldKlik(cta: string) {
  if (typeof window === 'undefined') return
  const w = window as W
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event: 'cta_click', cta_type: cta, cta_location: 'mobiele_balk', page_path: window.location.pathname })
}

/**
 * Vaste balk onderaan, alleen onder 768px: 'Bel direct' (tel:) en 'Gratis intake'. De site heeft geen WhatsApp-nummer,
 * dus geen WhatsApp-knop. 'Gratis intake' scrolt naar het korte formulier als dat op de pagina staat, anders naar
 * /gratis-intakegesprek/. Elke klik stuurt een cta_click-event naar de dataLayer.
 */
export default function MobieleBalk() {
  return (
    <>
      <div className="h-[64px] md:hidden" aria-hidden="true" />
      <nav
        aria-label="Snel contact"
        className="fixed inset-x-0 bottom-0 z-90 flex gap-2 border-t border-form-lijn bg-white px-3 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden"
      >
        <a
          href={site.phoneHref}
          onClick={() => meldKlik('bel_direct')}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-brand-700 font-semibold text-brand-700"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
          </svg>
          Bel direct
        </a>
        <a
          href="/gratis-intakegesprek/"
          onClick={(e) => {
            meldKlik('gratis_intake')
            const doel = document.getElementById('mobiel-formulier')
            if (doel) {
              e.preventDefault()
              doel.scrollIntoView({ behavior: 'smooth', block: 'start' })
              doel.querySelector<HTMLInputElement>('input[name="naam"]')?.focus({ preventScroll: true })
            }
          }}
          className="flex h-12 flex-1 items-center justify-center rounded-full bg-brand-700 font-semibold text-white"
        >
          Gratis intake
        </a>
      </nav>
    </>
  )
}
