import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { paginas } from '../content/paginas'
import { beeld, SIZES, teamKaartSizes } from '../lib/beeld'
import { overOns, team, vertrouwen } from '../content/home'
import PaginaKop from '../components/sections/PaginaKop'
import Werkwijze from '../components/sections/Werkwijze'
import CtaBand from '../components/sections/CtaBand'
import Reviews from '../components/sections/Reviews'
import Faq from '../components/sections/Faq'
import ContactBlok from '../components/sections/ContactBlok'
import FotoVlak from '../components/sections/FotoVlak'
import Vinken from '../components/sections/Vinken'
import { Container } from '../components/ui'

export const Route = createFileRoute('/over-ons')({
  head: () => seo(paginas.overOns),
  component: OverOns,
})

function OverOns() {
  return (
    <>
      <PaginaKop titel="Over ons" kruimels={[{ label: 'Over ons' }]} />
      <section className="py-[72px]">
        <Container>
          <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
            <div className="min-[992px]:w-[60%] min-[992px]:pr-4">
              <h2 className="mb-4 text-[30px] md:text-[40px]">De Belasting Bemiddelaar</h2>
              {overOns.map((t, i) => (
                <p key={t} className={i < overOns.length - 1 ? 'mb-[1.8em]' : undefined}>
                  {t}
                </p>
              ))}
            </div>
            <div className="flex flex-col min-[992px]:w-[40%] min-[992px]:pl-4">
              <div className="bg-textuur relative mb-8 rounded-sm border border-bkg-light p-8 min-[992px]:-mt-[125px] min-[992px]:p-12">
                <Vinken items={vertrouwen} />
              </div>
              <FotoVlak className="min-[992px]:flex-1">
                <img {...beeld('/images/site/contact.webp', SIZES.contactGroot)} alt="Peter en Heleen Brouwers van Dé Belastingbemiddelaar" loading="lazy" decoding="async" width={1223} height={1152} className="absolute inset-0 size-full rounded-sm object-cover" />
              </FotoVlak>
            </div>
          </div>
        </Container>
      </section>
      <section className="py-[72px]" data-reveal suppressHydrationWarning>
        <Container>
          <h2 className="mb-4">Ons Team</h2>
          <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 min-[992px]:grid-cols-3">
            {team.map((m) => (
              <li key={m.naam} className="relative aspect-[2/3]">
                <img {...beeld(m.foto, teamKaartSizes(m.foto))} alt={`${m.naam}, ${m.rol}`} loading="lazy" decoding="async" width={600} height={900} className="absolute inset-0 size-full rounded-sm object-cover" />
                <div className="bg-textuur absolute bottom-4 left-4 w-[calc(100%-2rem)] rounded-sm border border-bkg-light p-8">
                  <h3 className="mb-4 text-brand-700">{m.naam}</h3>
                  <p>{m.rol}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <Werkwijze />
      <CtaBand />
      <Reviews />
      <Faq />
      <ContactBlok />
    </>
  )
}
