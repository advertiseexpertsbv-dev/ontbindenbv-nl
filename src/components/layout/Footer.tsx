import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { site } from '../../lib/site'
import { beeld, SIZES } from '../../lib/beeld'
import { footerDiensten, footerOver } from '../../content/menu'
import { Container } from '../ui'

/**
 * Tekst links in de footer, regel voor regel zoals de oude site (adres: het nieuwe adres). Telefoon is nieuw (2026-11-13) en
 * valt weg als site.phone leeg is.
 */
const footerRegels: ReactNode[] = [
  'Wij bieden adviesdiensten aan ondernemers.',
  'Wij bieden geen krediet, schuldafkoop of schuldverwerking.',
  'Wij adviseren uitsluitend over bedrijfsbeëindiging, herstructurering en schuldhulptrajecten.',
  `Kamer van Koophandel: ${site.kvk}`,
  `Adres: ${site.address.street}, ${site.address.postalCode} ${site.address.city}`,
  ...(site.phone
    ? [
        <>
          Telefoon:{' '}
          <a href={site.phoneHref} className="whitespace-nowrap underline-offset-3 transition-colors hover:text-white hover:underline">
            {site.phone}
          </a>
        </>,
      ]
    : []),
  'Kosten: Advies gesprek is altijd kosteloos en eventuele kosten zullen vooraf worden besproken.',
]

/*
 * Footer: merkblauw, hoofdblok met logo + tekst (max 380px) links en rechts de kolommen Diensten en Over, onderbalk met een
 * lichte scheidingslijn. Tekst 15px in iets gedempt wit, links worden bij hover helder wit (ontwerpronde 2026-11-10).
 * De band "Volg ons online" van de oude site linkte nergens heen (#) en staat er daarom (nog) niet.
 */
export default function Footer() {
  return (
    <footer className="bg-brand-700 text-[15px] leading-[1.7] text-white/85">
      <Container className="grid grid-cols-1 gap-12 py-16 min-[992px]:grid-cols-[minmax(0,380px)_auto] min-[992px]:justify-between min-[992px]:py-20">
        <div className="max-w-[380px]">
          <img
            {...beeld('/images/brand/logo-wit.webp', SIZES.logoFooter)}
            alt={site.name}
            width={290}
            height={75}
            loading="lazy"
            decoding="async"
            className="aspect-[580/150] h-[75px] w-auto"
          />
          <p className="mt-6 text-white">Neem vandaag nog contact op voor een kosteloze intake en laat ons je helpen met het veilig en snel beëindigen van jouw BV.</p>
          <p className="mt-5 text-[14px] leading-[1.75] text-white/75">
            {footerRegels.map((r, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {r}
              </span>
            ))}
          </p>
        </div>

        <div className="flex flex-col gap-10 min-[768px]:flex-row min-[768px]:gap-16">
          <nav aria-label="Diensten">
            <h2 className="mb-4 text-[17px] !text-white">Diensten</h2>
            <ul className="flex flex-col gap-2.5">
              {footerDiensten.map((d) => (
                <li key={d.slug}>
                  <Link to="/dienst/$dienst/" params={{ dienst: d.slug }} className="tik block transition-colors hover:text-white hover:underline">
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Over">
            <h2 className="mb-4 text-[17px] !text-white">Over</h2>
            <ul className="flex flex-col gap-2.5">
              {footerOver.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="tik block transition-colors hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>

      <div className="border-t border-white/20 text-[14px] text-white/75">
        <Container className="flex flex-col gap-3 py-8">
          <div className="flex flex-col flex-wrap justify-between gap-4 min-[992px]:flex-row min-[992px]:items-center">
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
          </div>
          <p>{site.name} is een handelsnaam van {site.legalName} · KvK {site.kvk}</p>
        </Container>
      </div>
    </footer>
  )
}
