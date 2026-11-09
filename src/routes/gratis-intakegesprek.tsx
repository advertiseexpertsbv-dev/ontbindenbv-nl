import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { paginas } from '../content/paginas'
import { beeld, SIZES } from '../lib/beeld'
import { vertrouwen, werkwijze } from '../content/home'
import PaginaKop from '../components/sections/PaginaKop'
import LeadForm from '../components/forms/LeadForm'
import FotoVlak from '../components/sections/FotoVlak'
import Vinken from '../components/sections/Vinken'
import { Container } from '../components/ui'

export const Route = createFileRoute('/gratis-intakegesprek')({
  head: () => seo(paginas.intakegesprek),
  component: Intake,
})

/** Intakepagina zoals de oude site: links kop, intro en formulier (max 483px), rechts een vinkjeskaart die over de titelbalk steekt, de vijf stappen en een foto */
function Intake() {
  return (
    <>
      <PaginaKop titel="Gratis Intakegesprek" kruimels={[{ label: 'Gratis intakegesprek' }]} />
      <section className="py-[72px]">
        <Container>
          <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
            <div className="min-[992px]:w-1/2 min-[992px]:pr-4">
              <h2 className="mb-4">Boek hier jouw gratis intakegesprek</h2>
              <p className="mb-8">Laat je gegevens achter, en wij regelen een gratis intakegesprek om te bespreken hoe we jou het beste kunnen helpen</p>
              <div className="max-w-[483px]">
                {/* mb-6: het oude formulier eindigt 24px onder de knop */}
                <LeadForm formulier="Gratis intakegesprek" variant="gratis" berichtLabel="Waar kan ik je mee helpen?" className="mb-6" />
              </div>
            </div>
            <div className="flex flex-col min-[992px]:w-1/2 min-[992px]:pl-4">
              <div className="bg-textuur relative mb-8 rounded-sm border border-bkg-light p-8 min-[992px]:-mt-[125px] min-[992px]:p-12">
                <Vinken items={vertrouwen} />
              </div>
              <ol className="mb-8 flex flex-col gap-4">
                {werkwijze.map((s, i) => (
                  <li key={s.titel} className="relative">
                    <h3 className="flex items-center gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-full border border-oud-rand bg-brand-700 text-white">{i + 1}</span>
                      {s.titel}
                    </h3>
                    {i < werkwijze.length - 1 && <span className="absolute left-6 top-12 h-4 border-l border-dashed border-brand-700" aria-hidden="true" />}
                  </li>
                ))}
              </ol>
              <FotoVlak className="min-[992px]:flex-1">
                <img {...beeld('/images/site/team.webp', SIZES.teamIntake)} alt="Peter en Heleen Brouwers van Dé Belastingbemiddelaar" loading="lazy" decoding="async" width={1600} height={900} className="absolute inset-0 size-full rounded-sm object-cover" />
              </FotoVlak>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
