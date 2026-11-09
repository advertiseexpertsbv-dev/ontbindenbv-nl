import { Link } from '@tanstack/react-router'
import { site } from '../../lib/site'
import { beeld, SIZES } from '../../lib/beeld'
import { footerDiensten, footerOver } from '../../content/menu'
import { Container } from '../ui'

/** Tekst links in de footer, regel voor regel zoals de oude site (adres: het nieuwe adres) */
const footerRegels = [
  'Wij bieden adviesdiensten aan ondernemers.',
  'Wij bieden geen krediet, schuldafkoop of schuldverwerking.',
  'Wij adviseren uitsluitend over bedrijfsbeëindiging, herstructurering en schuldhulptrajecten.',
  `Kamer van Koophandel: ${site.kvk}`,
  `Adres: ${site.address.street}, ${site.address.postalCode} ${site.address.city}`,
  'Kosten: Advies gesprek is altijd kosteloos en eventuele kosten zullen vooraf worden besproken.',
]

/*
 * Footer zoals de oude site: merkblauw, hoofdblok met 72px padding (logo + tekst max 300px links, rechts de kolommen Diensten
 * en Over), onderbalk met witte rand en 48px padding. Tekst en links in de gewone tekstmaat (22px op desktop, 14px mobiel).
 * De band "Volg ons online" van de oude site linkte nergens heen (#) en staat er daarom (nog) niet.
 */
export default function Footer() {
  return (
    <footer className="bg-brand-700 text-white">
      <Container className="grid grid-cols-1 gap-12 py-18 min-[992px]:grid-cols-[minmax(0,300px)_auto] min-[992px]:justify-between">
        <div className="max-w-[300px]">
          <img
            {...beeld('/images/brand/logo-wit.webp', SIZES.logoFooter)}
            alt={site.name}
            width={290}
            height={75}
            loading="lazy"
            decoding="async"
            className="aspect-[580/150] h-[75px] w-auto"
          />
          <p className="mt-8">Neem vandaag nog contact op voor een kosteloze intake en laat ons je helpen met het veilig en snel beëindigen van jouw BV.</p>
          <p className="mt-[1.4em]">
            {footerRegels.map((r, i) => (
              <span key={r}>
                {i > 0 && <br />}
                {r}
              </span>
            ))}
          </p>
        </div>

        <div className="flex flex-col gap-12 min-[768px]:flex-row">
          <nav aria-label="Diensten">
            <h2 className="mb-4 text-[18px] !text-white md:text-[22px]">Diensten</h2>
            <ul className="flex flex-col gap-4">
              {footerDiensten.map((d) => (
                <li key={d.slug}>
                  <Link to="/dienst/$dienst/" params={{ dienst: d.slug }} className="tik block hover:underline">
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Over">
            <h2 className="mb-4 text-[18px] !text-white md:text-[22px]">Over</h2>
            <ul className="flex flex-col gap-4">
              {footerOver.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="tik block hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>

      <div className="border-t border-white">
        <Container className="flex flex-col flex-wrap justify-between gap-4 py-12 min-[992px]:flex-row">
          <p>©{new Date().getFullYear()} Ontbinden BV - Alle rechten voorbehouden</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/cookiebeleid-eu/" className="tik hover:underline">
              Cookiebeleid
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
