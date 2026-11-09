import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { paginas } from '../content/paginas'
import { beeld, SIZES } from '../lib/beeld'
import { introHome } from '../content/home'
import Hero from '../components/sections/Hero'
import Problemen from '../components/sections/Problemen'
import Werkwijze from '../components/sections/Werkwijze'
import CtaBand from '../components/sections/CtaBand'
import Reviews from '../components/sections/Reviews'
import Faq, { faqSchema } from '../components/sections/Faq'
import ContactBlok from '../components/sections/ContactBlok'
import BelDirect from '../components/sections/BelDirect'
import FotoVlak from '../components/sections/FotoVlak'
import { Container } from '../components/ui'

export const Route = createFileRoute('/')({
  head: () => {
    const h = seo({ ...paginas.home, exact: true })
    return { ...h, scripts: [{ type: 'application/ld+json', children: JSON.stringify(faqSchema()) }] }
  },
  component: Home,
})

const rij = 'flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0'

function Home() {
  return (
    <>
      <Hero />
      <div className="h-0 md:h-[72px]" aria-hidden="true" />
      <section className="py-[72px]" data-reveal suppressHydrationWarning>
        <Container className="flex flex-col gap-16">
          <div className={rij}>
            <div className="min-[992px]:w-[60%] min-[992px]:pr-4">
              <h2 className="mb-4">{introHome.titel}</h2>
              <div>
                {introHome.alinea1.map((t) => (
                  <p key={t} className="mb-[1.8em]">
                    {t}
                  </p>
                ))}
                <p className="font-bold text-brand-700">{introHome.vraag}</p>
                {introHome.alinea2.map((t) => (
                  <p key={t} className="mb-[1.8em]">
                    {t}
                  </p>
                ))}
                <p className="font-bold text-brand-700">{introHome.slot}</p>
              </div>
            </div>
            <div className="flex min-[992px]:w-[40%] min-[992px]:pl-4">
              <FotoVlak>
                <img {...beeld('/images/site/intro.webp', SIZES.intro)} alt="Adviseur van Dé Belastingbemiddelaar bestudeert een belastingbrief" loading="lazy" decoding="async" width={1600} height={1066} className="absolute inset-0 size-full rounded-sm object-cover" />
              </FotoVlak>
            </div>
          </div>
          <div className={rij}>
            <div className="flex min-[992px]:w-[40%] min-[992px]:pr-4">
              <FotoVlak>
                <img {...beeld('/images/site/peter-schilderij.webp', SIZES.schilderijHome)} alt="Peter Brouwers, oprichter van Dé Belastingbemiddelaar" loading="lazy" decoding="async" width={1600} height={900} className="absolute inset-0 size-full rounded-sm object-cover" />
                <div className="absolute bottom-8 left-8 flex w-[calc(100%-4rem)] items-center justify-center rounded-sm bg-bkg-light p-4">
                  <BelDirect />
                </div>
              </FotoVlak>
            </div>
            <div className="min-[992px]:w-[60%] min-[992px]:pl-4">
              {introHome.alinea3.map((t, i) => (
                <p key={t} className={i < introHome.alinea3.length - 1 ? 'mb-[1.8em]' : undefined}>
                  {t}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <Problemen />
      <Werkwijze />
      <CtaBand />
      <Reviews />
      <Faq />
      <ContactBlok />
    </>
  )
}
