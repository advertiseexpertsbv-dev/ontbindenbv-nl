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

/** Contactpagina zoals de oude site: links kop, intro en formulier, rechts een kaart met contactgegevens die over de titelbalk steekt en daaronder de teamfoto */
function Contact() {
  return (
    <>
      <PaginaKop titel="Contact" kruimels={[{ label: 'Contact' }]} />
      <section className="py-[72px]">
        <Container>
          <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
            <div className="min-[992px]:w-[60%] min-[992px]:pr-4">
              <h2 className="mb-4">Wij helpen je graag verder met al je vragen</h2>
              <p className="mb-8">
                Neem vandaag nog contact op met OntbindenBV.nl voor een gratis en vrijblijvend intakegesprek. Samen kijken we welke ontbindingsvorm het
                beste past bij jouw situatie – of het nu gaat om een lege BV, een BV met activa of een BV met (hoge) schulden.
              </p>
              <LeadForm formulier="Contact" className="mb-6" />
            </div>
            <div className="flex flex-col min-[992px]:w-[40%] min-[992px]:pl-4">
              <div className="bg-textuur relative mb-8 rounded-sm border border-bkg-light p-8 min-[992px]:-mt-[125px] min-[992px]:p-12">
                <h2 className="mb-4">Neem contact op</h2>
                <p className="mb-8">
                  OntbindenBV.nl staat voor je klaar om jouw BV op de juiste manier te beëindigen. Plan een gratis intake en ontdek hoe wij je snel,
                  veilig en volledig ontzorgen.
                </p>
                <ContactRijen blauw />
              </div>
              <FotoVlak className="min-[992px]:flex-1">
                <img
                  {...beeld('/images/site/team-contact.webp', SIZES.teamContact)}
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
    </>
  )
}
