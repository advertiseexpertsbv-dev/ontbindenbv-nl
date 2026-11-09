import { site } from '../../lib/site'
import { beeld, SIZES } from '../../lib/beeld'
import { contactBlok } from '../../content/home'
import LeadForm from '../forms/LeadForm'
import { Container } from '../ui'
import { FaClock, FaEnvelope, FaMarker, FaPhone, IcoAt, IcoNavigatie, IcoPhone } from './icons'

/**
 * Contactgegevens als lijst met ronde icoonvlakken van 50px. licht = lichte cirkels met massieve blauwe iconen
 * (contactblok onderaan de pagina's); blauw = blauwe cirkels met lichte iconen (kaart op /contact/).
 */
export function ContactRijen({ blauw = false }: { blauw?: boolean }) {
  const rijen = [
    {
      titel: 'Telefoonnummer',
      icoon: blauw ? <FaPhone className="size-6" /> : <IcoPhone className="size-4 text-diep" />,
      tekst: (
        <a href={site.phoneHref} className="tik inline-block whitespace-nowrap">
          {site.phone}
        </a>
      ),
    },
    {
      titel: 'Email',
      icoon: blauw ? <FaEnvelope className="size-6" /> : <IcoAt className="size-4 text-diep" />,
      tekst: (
        <a href={`mailto:${site.email}`} className="tik inline-block">
          {site.email}
        </a>
      ),
    },
    {
      titel: 'Openingstijden',
      icoon: <FaClock className={blauw ? 'size-6' : 'size-6 text-brand-700'} />,
      tekst: (
        <>
          {site.openingstijden.dagen}
          <br />
          {site.openingstijden.tijden}
        </>
      ),
    },
    {
      titel: 'Adres',
      icoon: blauw ? <FaMarker className="size-6" /> : <IcoNavigatie className="size-4 text-diep" />,
      tekst: (
        <>
          {site.address.street},
          <br />
          {site.address.postalCode} {site.address.city},
          <br />
          {site.address.country}
        </>
      ),
    },
  ]
  return (
    <ul className="flex flex-col gap-4">
      {rijen.map((r) => (
        <li key={r.titel} className="grid grid-cols-[auto_minmax(0,1fr)] items-start md:grid-cols-[auto_1fr]">
          <span className={`mr-4 grid size-[50px] shrink-0 place-items-center rounded-full ${blauw ? 'bg-brand-700 text-bkg-light' : 'bg-bkg-light'}`}>{r.icoon}</span>
          <div className="flex items-center text-[14px] [overflow-wrap:anywhere] md:[overflow-wrap:normal]">
            <div>
              <b className="text-[16px]">{r.titel}</b>
              <br />
              {r.tekst}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Contactblok onderaan de pagina's, zoals de oude site: links de ronde foto (200px) naast kop, tekst en contactgegevens,
 * rechts het formulier in een lichtblauwe kaart met patroon. Onder 768px staat de foto als brede banner boven de kop.
 */
export default function ContactBlok({ titel = 'Wij helpen je graag verder met al je vragen' }: { titel?: string }) {
  return (
    <section id="contact" className="py-[72px]" data-reveal suppressHydrationWarning>
      <Container>
        <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
          <div className="min-[992px]:w-1/2 min-[992px]:pr-4">
            <div className="mb-8 mt-4 grid md:grid-cols-[auto_1fr] md:gap-8">
              <img
                {...beeld('/images/site/contact.webp', SIZES.contactFoto)}
                alt="Peter en Heleen van Dé Belastingbemiddelaar"
                loading="lazy"
                decoding="async"
                width={1223}
                height={1152}
                className="h-[50vw] min-h-[200px] w-full rounded-sm object-cover md:aspect-square md:h-auto md:min-h-0 md:w-[200px] md:self-start md:rounded-full"
              />
              <div className="pt-8">
                <h2 className="mb-4">Neem contact op</h2>
                <p className="mb-8">{contactBlok.tekst}</p>
                <ContactRijen />
              </div>
            </div>
          </div>
          <div className="min-[992px]:w-1/2 min-[992px]:pl-4">
            <div className="bg-textuur rounded-sm border border-bkg-light p-8 md:p-12">
              <h2 className="mb-4">{titel}</h2>
              <p className="mb-8">Neem vandaag nog contact op met ons voor een kosteloze intake en laat ons jou helpen met het oplossen van jouw fiscale problemen.</p>
              <LeadForm formulier="Contact" className="mb-6" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
