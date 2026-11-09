import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { paginas } from '../content/paginas'
import { beeld, SIZES, teamKaartSizes } from '../lib/beeld'
import { overOns, team, vertrouwenKaart } from '../content/home'
import PaginaKop from '../components/sections/PaginaKop'
import Werkwijze from '../components/sections/Werkwijze'
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

/**
 * Over ons zoals de oude site: tekst met vinkjes links (60%), rechts een kaart met vinkjes die over de titelbalk valt en de
 * teamfoto; daaronder "Ons Team" (6 kaarten van 2:3), de werkwijze, reviews, veelgestelde vragen en het contactblok.
 */
function OverOns() {
  return (
    <>
      <PaginaKop titel="Over ons" kruimels={[{ label: 'Over ons' }]} />
      <section className="py-[72px]">
        <Container>
          <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
            <div className="min-[992px]:w-[60%] min-[992px]:pr-4">
              <h2 className="kop-h1 mb-4">{overOns.titel}</h2>
              <div className="mb-8 flex flex-col gap-[1.4em]">
                {overOns.alineas.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <h3 className="mb-4">{overOns.waarom}</h3>
              <Vinken items={overOns.punten} />
            </div>
            <div className="flex flex-col max-[991px]:-order-1 min-[992px]:w-[40%] min-[992px]:pl-4">
              <div className="bg-textuur relative mb-8 rounded-sm border border-bkg-light p-8 min-[992px]:-mt-[125px] min-[992px]:p-12">
                <Vinken items={vertrouwenKaart} />
              </div>
              <FotoVlak className="min-[992px]:flex-1">
                <img
                  {...beeld('/images/site/team.webp', SIZES.teamOverOns)}
                  alt="Het team van OntbindenBV.nl"
                  loading="lazy"
                  decoding="async"
                  width={1600}
                  height={1066}
                  className="absolute inset-0 size-full rounded-sm object-cover"
                />
              </FotoVlak>
            </div>
          </div>
        </Container>
      </section>
      <section className="py-[72px]" data-reveal suppressHydrationWarning>
        <Container>
          <h2 className="mb-4">Ons Team</h2>
          <ul className="grid grid-cols-1 gap-4 min-[768px]:grid-cols-2 min-[992px]:grid-cols-3">
            {team.map((m) => (
              <li key={m.naam} className="relative aspect-[2/3]">
                <img
                  {...beeld(m.foto, teamKaartSizes(m.foto))}
                  alt={`${m.naam}, ${m.rol}`}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={1200}
                  className="absolute inset-0 size-full rounded-sm object-cover"
                />
                <div className="bg-textuur absolute bottom-4 left-4 w-[calc(100%-2rem)] rounded-sm border border-bkg-light p-8">
                  <h3 className="mb-4">{m.naam}</h3>
                  <p>{m.rol}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <Werkwijze />
      <Reviews />
      <Faq />
      <ContactBlok />
    </>
  )
}
