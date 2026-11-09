import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { paginas } from '../content/paginas'
import { beeld, SIZES } from '../lib/beeld'
import PaginaKop from '../components/sections/PaginaKop'
import LeadForm from '../components/forms/LeadForm'
import { ContactRijen } from '../components/sections/ContactBlok'
import FotoVlak from '../components/sections/FotoVlak'
import { Container } from '../components/ui'

export const Route = createFileRoute('/contact')({
  head: () => seo(paginas.contact),
  component: Contact,
})

/** Contactpagina zoals de oude site: links kop, intro en formulier, rechts een kaart met contactgegevens die over de titelbalk steekt en daaronder een foto */
function Contact() {
  return (
    <>
      <PaginaKop titel="Contact" kruimels={[{ label: 'Contact' }]} />
      <section className="py-[72px]">
        <Container>
          <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
            <div className="min-[992px]:w-[60%] min-[992px]:pr-4">
              <h2 className="mb-4">Wij helpen je graag verder met al je vragen</h2>
              <p className="mb-8">Neem vandaag nog contact op met Dé Belastingbemiddelaar voor een kosteloze intake en laat ons jou helpen met het oplossen van jouw fiscale problemen.</p>
              <LeadForm formulier="Contact" className="mb-6" />
            </div>
            <div className="flex flex-col min-[992px]:w-[40%] min-[992px]:pl-4">
              <div className="bg-textuur relative mb-8 rounded-sm border border-bkg-light p-8 min-[992px]:-mt-[125px] min-[992px]:p-12">
                <h2 className="mb-4">Neem contact op</h2>
                <p className="mb-8">Neem vandaag nog contact op met ons voor een kosteloze intake en laat ons jou helpen met het oplossen van jouw fiscale problemen.</p>
                <ContactRijen blauw />
              </div>
              <FotoVlak className="min-[992px]:flex-1">
                <img {...beeld('/images/site/team.webp', SIZES.teamContact)} alt="Peter en Heleen Brouwers van Dé Belastingbemiddelaar" loading="lazy" decoding="async" width={1600} height={900} className="absolute inset-0 size-full rounded-sm object-cover" />
              </FotoVlak>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
