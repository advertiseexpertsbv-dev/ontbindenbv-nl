import { site } from '../../lib/site'
import { beeld, SIZES } from '../../lib/beeld'
import { vertrouwen } from '../../content/home'
import { Button, Container } from '../ui'
import KaartFormulier from './KaartFormulier'
import Vinken from './Vinken'
import MobielFormulier from './MobielFormulier'

/**
 * Hero van de homepage, opgebouwd zoals de oude site: foto met een egale blauwe laag van 30%, tekst links (60%) en de
 * formulierkaart rechts (40%) die 150px onder de hero uitsteekt. Onder 992px staan de kolommen onder elkaar.
 */
export default function Hero() {
  return (
    <section className="relative isolate text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* LCP-afbeelding: niet lazy, fetchPriority high. Varianten van 1200/1440px voor 992-1599px; onder 992px schaalt object-cover het beeld op (ca. 2100px), daar blijft het origineel van 1600px */}
        <picture style={{ display: 'contents' }}>
          <source type="image/avif" srcSet="/images/site/hero-1200w.avif 1200w, /images/site/hero-1440w.avif 1440w, /images/site/hero.avif 1600w" sizes={SIZES.hero} />
          <img {...beeld('/images/site/hero.webp', SIZES.hero)} alt="" width={1600} height={1066} fetchPriority="high" decoding="async" className="size-full object-cover object-[0%_30%]" />
        </picture>
        <div className="absolute inset-0 bg-diep/30" />
      </div>
      <Container className="py-[72px]">
        <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
          <div className="flex flex-col justify-center min-[992px]:w-[60%] min-[992px]:pr-4">
            <h1 className="mb-4 !text-white">Hulp bij belastingzaken nodig?</h1>
            <p className="mb-8 text-white">Onze experts staan voor jou klaar! Laat ons jouw fiscale kopzorgen verlichten met onze bewezen expertise en persoonlijke aanpak.</p>
            <MobielFormulier formulier="Hero" className="mb-8" />
            <Vinken items={vertrouwen} licht className="mb-8" />
            <div className="flex w-full flex-col items-start gap-4 min-[992px]:w-auto min-[992px]:flex-row min-[992px]:flex-wrap min-[992px]:items-center">
              <Button href="/gratis-intakegesprek/" variant="blue" arrow className="w-full min-[992px]:w-auto">
                Gratis intakegesprek
              </Button>
              <Button href={site.afspraakHref} variant="yellow" arrow className="w-full min-[992px]:w-auto">
                Online afspraak inplannen
              </Button>
            </div>
          </div>
          <div className="max-md:hidden min-[992px]:w-[40%] min-[992px]:pl-4">
            <KaartFormulier formulier="Hero" className="-mb-[150px] md:p-12" />
          </div>
        </div>
      </Container>
    </section>
  )
}
