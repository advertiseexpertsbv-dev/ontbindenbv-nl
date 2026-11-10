import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import PaginaKop from '../components/sections/PaginaKop'
import Vinken from '../components/sections/Vinken'
import { Button, Container } from '../components/ui'

export const Route = createFileRoute('/bedankt')({
  head: () => seo({ title: 'Bedankt', description: 'Bedankt voor je bericht. We nemen spoedig contact met je op.', path: '/bedankt/', noindex: true }),
  component: Bedankt,
})

/** Vinkjes op de kaart van de bedanktpagina (oude site) */
const punten = ['Gratis Intakegesprek', '25 Jaar Ervaring', 'Persoonlijke Aanpak', 'Brede Expertise']

/** Bedanktpagina zoals de oude site: links kop, tekst en knop (op mobiel over de volle breedte), rechts de vinkjeskaart die over de titelbalk steekt */
function Bedankt() {
  return (
    <>
      <PaginaKop titel="Bedankt" kruimels={[{ label: 'Bedankt' }]} />
      <section className="py-[72px]">
        <Container>
          <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
            <div className="min-[992px]:w-[60%] min-[992px]:pr-4">
              <h2 className="kop-h1 mb-4">Bedankt voor je bericht</h2>
              <p className="mb-8">
                Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op. Heb je in de tussentijd nog vragen? Aarzel dan niet om contact
                op te nemen.
              </p>
              <Button href="/" arrow className="w-full min-[992px]:w-auto">
                Terug naar home
              </Button>
            </div>
            <div className="min-[992px]:w-[40%] min-[992px]:pl-4">
              <div className="bg-textuur relative rounded-sm border border-bkg-light p-8 min-[992px]:-mt-[125px] min-[992px]:p-12">
                <Vinken items={punten} />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
