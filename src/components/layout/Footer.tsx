import { Link } from '@tanstack/react-router'
import { site } from '../../lib/site'
import { beeld, SIZES } from '../../lib/beeld'
import { footerDiensten } from '../../content/diensten'
import { footerLabels } from '../../content/footer'
import { Container, Linkedin } from '../ui'

const over = [
  { label: 'Home', to: '/' },
  { label: 'Over ons', to: '/over-ons/' },
  { label: 'Onze werkwijze', to: '/onze-werkwijze/' },
  { label: 'Kennisbank', to: '/kennisbank/' },
  { label: 'Gratis intakegesprek', to: '/gratis-intakegesprek/' },
  { label: 'Contact', to: '/contact/' },
] as const

/*
 * Footer zoals de oude site: band "Volg ons online" (rand boven en onder, 48px padding), hoofdblok met 72px padding
 * (logo + tekst max 300px, daarnaast Diensten in 2 kolommen en Over), onderbalk met 48px padding.
 * Vanaf 1124px zijn de kolombreedtes die van de oude site (1fr, 616,4 en 175,1px bij 1240px inhoud). Tussen 992 en 1123px
 * is de linkerkolom op de oude site te smal voor het logo en het mailadres; daar staat de introtekst boven de linklijsten,
 * zodat geen dienstnaam over twee regels breekt. Onder 992px staat alles onder elkaar.
 */
export default function Footer() {
  return (
    <footer className="bg-brand-700 text-white">
      <div className="border-y border-white">
        <Container className="flex flex-wrap items-center gap-4 py-12">
          <span>Volg ons online</span>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener"
            aria-label="Belasting Bemiddelaar op LinkedIn (opent in nieuw venster)"
            className="tik grid size-[34px] place-items-center rounded-full bg-white text-brand-700 transition-opacity hover:opacity-80"
          >
            <Linkedin className="size-[17px]" />
          </a>
        </Container>
      </div>

      <Container className="grid grid-cols-1 gap-12 py-18 min-[992px]:grid-cols-[568.4px_175.1px] min-[992px]:justify-between min-[1124px]:grid-cols-[minmax(0,1fr)_616.4px_175.1px] min-[1124px]:gap-0">
        <div className="max-w-[300px] min-[992px]:col-span-2 min-[1124px]:col-span-1">
          {/* 2x-variant van het logo (480px, 15 KB i.p.v. 900px PNG van 38 KB), met een 240px-variant voor 1x-schermen; onder de vouw, dus lazy */}
          <img
            {...beeld('/images/brand/2024-07-belasting-bemiddelaar-logo-white-480.webp', SIZES.logoFooter)}
            alt={site.name}
            width={237}
            height={75}
            loading="lazy"
            decoding="async"
            className="aspect-[480/151] h-[75px] w-auto"
          />
          <p className="mt-8">Neem vandaag nog contact op met ons voor een kosteloze intake en laat ons jou helpen met het oplossen van jouw fiscale problemen.</p>
          <a href={site.phoneHref} className="tik mt-6 block text-[20px] font-semibold">
            {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="tik mt-1 block underline underline-offset-4">
            {site.email}
          </a>
        </div>

        <div className="min-[1124px]:pr-12">
          <h3 className="mb-4 text-white">Diensten</h3>
          <ul className="grid grid-cols-1 gap-4 min-[992px]:grid-cols-2 min-[992px]:gap-x-4">
            {footerDiensten.map((d) => (
              <li key={d.slug}>
                <Link to="/dienst/$dienst/" params={{ dienst: d.slug }} className="tik block hover:underline">
                  {footerLabels[d.slug] ?? d.naam}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-white">Over</h3>
          <ul className="flex flex-col gap-4">
            {over.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="tik block hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-white">
        <Container className="flex flex-col flex-wrap justify-between gap-4 py-12 min-[992px]:flex-row">
          <p>©{new Date().getFullYear()} Belasting Bemiddelaar - Alle rechten voorbehouden</p>
          {/* Onder 480px staat Cookievoorkeuren op een eigen regel, zonder los streepje aan het eind van de regel erboven */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/cookiebeleid-eu/" className="tik hover:underline">
              Cookiebeleid (EU)
            </Link>
            <span aria-hidden="true">-</span>
            <Link to="/privacyverklaring-eu/" className="tik hover:underline">
              Privacyverklaring
            </Link>
            <span aria-hidden="true" className="max-[479px]:hidden">
              -
            </span>
            <button type="button" className="tik hover:underline max-[479px]:basis-full max-[479px]:text-left" onClick={() => window.dispatchEvent(new Event('open-cookie-voorkeuren'))}>
              Cookievoorkeuren
            </button>
          </div>
        </Container>
      </div>
    </footer>
  )
}
