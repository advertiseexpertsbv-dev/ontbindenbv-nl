import { site } from '../../lib/site'
import { beeld, SIZES } from '../../lib/beeld'
import { cta } from '../../content/home'
import { Button, Container } from '../ui'

/**
 * Blauwe CTA-band "Dus waar wacht je nog op?" met het verloop van de oude site, een vrijstaande foto (300px kolom) die tegen de
 * onderrand staat en boven de band uitsteekt, tekst in het midden en de knoppen rechts. Onder 768px is de foto verborgen.
 * bel: tweede knop "Bel direct met een specialist" (dienstpagina's) in plaats van "Online afspraak inplannen" (alleen met een nummer).
 */
export default function CtaBand({ bel = false }: { bel?: boolean }) {
  return (
    <section className="bg-verloop relative text-white">
      <Container className="grid grid-cols-1 gap-8 py-[72px] min-[768px]:grid-cols-[300px_minmax(0,1fr)] min-[992px]:grid-cols-[300px_minmax(0,1fr)_auto]">
        <div className="relative hidden min-[768px]:row-span-2 min-[768px]:block min-[992px]:row-span-1">
          <img
            {...beeld('/images/site/cta.webp', SIZES.cta)}
            alt="Medewerker van OntbindenBV.nl"
            loading="lazy"
            decoding="async"
            width={750}
            height={1017}
            className="absolute right-0 -bottom-[72px] aspect-[750/1017] h-auto w-[375px] max-w-none"
          />
        </div>
        <div>
          <h2 className="mb-4 !text-white">{cta.titel}</h2>
          <p className="text-white">{cta.tekst}</p>
        </div>
        <div className="flex flex-col items-start gap-4 min-[992px]:justify-center">
          <Button href="/contact/" variant="yellow" arrow className="w-full min-[992px]:w-auto">
            Plan gratis intake
          </Button>
          {bel && site.phone ? (
            <Button href={site.phoneHref} variant="white" arrow className="w-full min-[992px]:w-auto">
              Bel direct met een specialist
            </Button>
          ) : (
            <Button href="/gratis-intakegesprek/" variant="white" arrow className="w-full min-[992px]:w-auto">
              Online afspraak inplannen
            </Button>
          )}
        </div>
      </Container>
    </section>
  )
}
