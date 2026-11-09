import { site } from '../../lib/site'
import { beeld, SIZES } from '../../lib/beeld'
import { Button, Container } from '../ui'

/**
 * Blauwe CTA-band "Dus waar wacht je nog op?": effen merkblauw, foto van Peter (300px) die tegen de onderrand staat en
 * 23px boven de band uitsteekt, tekst in het midden en de knoppen rechts. Onder 768px is de foto verborgen.
 */
export default function CtaBand() {
  return (
    <section className="relative bg-brand-700 text-white">
      <Container className="grid grid-cols-1 gap-8 py-[72px] min-[768px]:grid-cols-[300px_minmax(0,1fr)] min-[992px]:grid-cols-[300px_minmax(0,1fr)_auto]">
        <div className="relative hidden min-[768px]:row-span-2 min-[768px]:block min-[992px]:row-span-1">
          <img {...beeld('/images/site/peter.webp', SIZES.peterCta)} alt="Peter Brouwers, oprichter van Dé Belastingbemiddelaar" loading="lazy" decoding="async" width={652} height={823} className="absolute -bottom-[72px] right-0 aspect-[652/823] h-auto w-full max-w-none" />
        </div>
        <div>
          <h2 className="mb-4 text-[30px] !text-white min-[768px]:text-[40px]">Dus waar wacht je nog op?</h2>
          <p className="text-white">Laat het stressvolle gedoe met de belastingdienst over aan ons, zodat jij je kunt richten op wat echt belangrijk is: jouw onderneming.</p>
        </div>
        <div className="flex flex-col items-start gap-4">
          <Button href={site.afspraakHref} variant="yellow" arrow className="w-full min-[992px]:w-auto">
            Online afspraak inplannen
          </Button>
          <Button href="/gratis-intakegesprek/" variant="white" arrow className="w-full min-[992px]:w-auto">
            Gratis intakegesprek
          </Button>
        </div>
      </Container>
    </section>
  )
}
