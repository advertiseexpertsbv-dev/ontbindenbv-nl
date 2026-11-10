import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { paginas } from '../content/paginas'
import { beeld, SIZES } from '../lib/beeld'
import { intakeStappen, vertrouwenKaart } from '../content/home'
import PaginaKop from '../components/sections/PaginaKop'
import LeadForm from '../components/forms/LeadForm'
import FotoVlak from '../components/sections/FotoVlak'
import Vinken from '../components/sections/Vinken'
import { Container } from '../components/ui'

export const Route = createFileRoute('/gratis-intakegesprek')({
  head: () => seo(paginas.intakegesprek),
  component: Intake,
})

/** Intakepagina zoals de oude site: links kop, intro en formulier (max 498px), rechts een vinkjeskaart die over de titelbalk steekt, de vijf stappen en de teamfoto */
function Intake() {
  return (
    <>
      <PaginaKop titel="Gratis Intakegesprek" kruimels={[{ label: 'Gratis intakegesprek' }]} />
      <section className="py-sectie">
        <Container>
          <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
            <div className="min-[992px]:w-1/2 min-[992px]:pr-4">
              <h2 className="mb-4">Vraag hier jouw gratis intakegesprek aan</h2>
              <p className="mb-8">Laat je gegevens achter, en wij regelen een gratis intakegesprek om te bespreken hoe we jou het beste kunnen helpen</p>
              <div className="max-w-[498px]">
                <LeadForm formulier="Gratis intakegesprek" variant="gratis" berichtLabel="Waar kan ik je mee helpen?" className="mb-6" />
              </div>
            </div>
            <div className="flex flex-col min-[992px]:w-1/2 min-[992px]:pl-4">
              <div className="bg-textuur relative mb-8 rounded-2xl border border-line p-6 shadow-zwevend sm:p-8 min-[992px]:-mt-[125px] min-[992px]:p-10">
                <Vinken items={vertrouwenKaart} />
              </div>
              <ol className="mb-8 flex flex-col gap-4">
                {intakeStappen.map((s, i) => (
                  <li key={s} className="relative">
                    <h3 className="flex items-center gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-700 text-white">{i + 1}</span>
                      {s}
                    </h3>
                    {i < intakeStappen.length - 1 && <span className="absolute top-12 left-6 h-4 border-l border-dashed border-brand-700" aria-hidden="true" />}
                  </li>
                ))}
              </ol>
              <FotoVlak className="min-[992px]:flex-1">
                <img
                  {...beeld('/images/site/team-contact.webp', SIZES.teamContact)}
                  alt="Het team van OntbindenBV.nl"
                  loading="lazy"
                  decoding="async"
                  width={1600}
                  height={1066}
                  className="absolute inset-0 size-full rounded-2xl object-cover"
                />
              </FotoVlak>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
