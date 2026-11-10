import { site } from '../../lib/site'
import { beeld, SIZES } from '../../lib/beeld'
import { hero, vertrouwen } from '../../content/home'
import { Button, Container } from '../ui'
import KaartFormulier from './KaartFormulier'
import Vinken from './Vinken'
import MobielFormulier from './MobielFormulier'

const HERO = '/images/site/hero.webp'
const HERO_MOBIEL = '/images/site/hero-mobiel.webp'
const HERO_MOBIEL_MEDIA = '(max-width: 599px)'

/** Preloads van de hero voor de head van de homepage: per schermbreedte precies het beeld dat de <picture> kiest */
export const HERO_PRELOADS = [
  { rel: 'preload', as: 'image', href: HERO_MOBIEL, media: HERO_MOBIEL_MEDIA, fetchPriority: 'high' },
  { rel: 'preload', as: 'image', href: HERO, media: '(min-width: 600px)', fetchPriority: 'high' },
]

/**
 * Hero van de homepage: foto (links uitgelijnd) met een donkerblauwe verlooplaag die achter de tekst het donkerst is, zodat de witte
 * tekst overal goed leesbaar is; tekst links (60%) en de formulierkaart rechts (40%) die 150px onder de hero uitsteekt.
 * Onder 992px staan de kolommen onder elkaar.
 */
export default function Hero() {
  return (
    <section className="relative isolate text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* LCP-afbeelding: niet lazy, fetchPriority high. Tot 599px de linker uitsnede (scripts/hero-mobiel.mjs): door object-left
            is daar alleen dat deel zichtbaar. React zet een <img> in een <picture> niet zelf als preload; de preloads (met media)
            staan daarom in de head van de homepage (routes/index.tsx, HERO_PRELOADS). */}
        <picture>
          <source media={HERO_MOBIEL_MEDIA} srcSet={HERO_MOBIEL} width={480} height={819} />
          <img {...beeld(HERO, SIZES.hero)} alt="" width={1806} height={819} fetchPriority="high" decoding="async" className="size-full object-cover object-left" />
        </picture>
        <div className="absolute inset-0 bg-linear-to-b from-brand-950/75 via-brand-950/55 to-brand-950/70 min-[992px]:bg-linear-to-r min-[992px]:from-brand-950/80 min-[992px]:via-brand-950/45 min-[992px]:to-brand-950/10" />
      </div>
      <Container className="pt-10 pb-12 min-[768px]:py-16 min-[992px]:py-24">
        <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
          <div className="flex flex-col justify-center min-[992px]:w-[60%] min-[992px]:pr-4">
            <h1 className="mb-4 !text-white drop-shadow-[0_2px_12px_rgba(8,38,64,0.35)]">{hero.titel.replace(' ', ' ')}</h1>
            <p className="mb-8 text-[18px] leading-[1.45] font-medium text-white/95 md:text-[22px]">{hero.sub}</p>
            <MobielFormulier formulier="Hero" className="mb-8" />
            <Vinken items={vertrouwen} licht className="mb-8" />
            <div className="flex w-full flex-col items-start gap-4 min-[992px]:w-auto min-[992px]:flex-row min-[992px]:flex-wrap min-[992px]:items-center">
              <Button href="/gratis-intakegesprek/" variant="blue" arrow className="w-full min-[992px]:w-auto">
                Gratis adviesgesprek
              </Button>
              <Button href={site.afspraakHref} variant="yellow" arrow className="w-full min-[992px]:w-auto">
                {site.afspraakKnop}
              </Button>
            </div>
          </div>
          <div className="max-md:hidden min-[992px]:w-[40%] min-[992px]:pl-4">
            <KaartFormulier formulier="Hero" zwevend className="-mb-[150px]" />
          </div>
        </div>
      </Container>
    </section>
  )
}
