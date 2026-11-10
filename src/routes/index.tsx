import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { paginas } from '../content/paginas'
import { beeld, SIZES } from '../lib/beeld'
import { introHome, vertrouwen } from '../content/home'
import Hero, { HERO_PRELOADS } from '../components/sections/Hero'
import Situatie from '../components/sections/Situatie'
import Werkwijze from '../components/sections/Werkwijze'
import CtaBand from '../components/sections/CtaBand'
import Reviews from '../components/sections/Reviews'
import Faq, { faqSchema } from '../components/sections/Faq'
import ContactBlok from '../components/sections/ContactBlok'
import FotoVlak from '../components/sections/FotoVlak'
import Vinken from '../components/sections/Vinken'
import { Container } from '../components/ui'

export const Route = createFileRoute('/')({
  head: () => {
    const h = seo({ ...paginas.home, exact: true })
    return {
      ...h,
      links: [...h.links, ...HERO_PRELOADS],
      scripts: [...h.scripts, { type: 'application/ld+json', children: JSON.stringify(faqSchema()) }],
    }
  },
  component: Home,
})

const rij = 'flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0'

function Home() {
  return (
    <>
      <Hero />
      <div className="h-0 md:h-[72px]" aria-hidden="true" />
      <section className="py-sectie" data-reveal suppressHydrationWarning>
        <Container className="flex flex-col gap-16">
          <div className={rij}>
            <div className="min-[992px]:w-[60%] min-[992px]:pr-4">
              <h2 className="mb-4">{introHome.titel}</h2>
              <p className="mb-8">{introHome.alinea}</p>
              <h3 className="mb-4">{introHome.vraag}</h3>
              <p dangerouslySetInnerHTML={{ __html: introHome.antwoord }} />
            </div>
            <div className="flex min-[992px]:w-[40%] min-[992px]:pl-4">
              <FotoVlak>
                <img
                  {...beeld('/images/site/intro.webp', SIZES.intro)}
                  alt="Peter Brouwers, fiscaal specialist bij OntbindenBV.nl"
                  loading="lazy"
                  decoding="async"
                  width={1600}
                  height={1066}
                  className="absolute inset-0 size-full rounded-2xl object-cover"
                />
              </FotoVlak>
            </div>
          </div>
          <div className={rij}>
            <div className="flex min-[992px]:w-[40%] min-[992px]:pr-4">
              <FotoVlak>
                <img
                  {...beeld('/images/site/team.webp', SIZES.team)}
                  alt="Het team van OntbindenBV.nl"
                  loading="lazy"
                  decoding="async"
                  width={1600}
                  height={1066}
                  className="absolute inset-0 size-full rounded-2xl object-cover"
                />
              </FotoVlak>
            </div>
            <div className="min-[992px]:w-[60%] min-[992px]:pl-4">
              <h2 className="mb-4">{introHome.titel2}</h2>
              <p className="mb-8">{introHome.alinea2}</p>
              <h3 className="mb-4">{introHome.waarom}</h3>
              <Vinken items={vertrouwen} />
            </div>
          </div>
        </Container>
      </section>
      <Situatie />
      <Werkwijze />
      <CtaBand />
      <Reviews />
      <Faq />
      <ContactBlok />
    </>
  )
}
