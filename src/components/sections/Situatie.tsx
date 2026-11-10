import { Link } from '@tanstack/react-router'
import { situatie } from '../../content/home'
import { footerDiensten } from '../../content/menu'
import { site } from '../../lib/site'
import { Container } from '../ui'

/**
 * "Wat is je situatie?": lichtblauwe sectie met patroon. Op de oude site stond hier een lege keuzelijst onder "Selecteer
 * hieronder wat het beste bij je past"; hier staan de zes hoofddiensten als tegels (3 / 2 / 1 kolommen).
 * De kop was op de oude site een tweede h1; hier een h2 in dezelfde maat.
 */
export default function Situatie() {
  return (
    <section className="bg-textuur py-[72px]" data-reveal suppressHydrationWarning>
      <Container>
        <h2 className="kop-h1 mb-4">{situatie.titel}</h2>
        <p className="mb-8">{situatie.tekst}</p>
        <ul className="mb-8 grid gap-4 min-[481px]:grid-cols-2 min-[992px]:grid-cols-3">
          {footerDiensten.map((d) => (
            <li key={d.slug}>
              <Link
                to="/dienst/$dienst/"
                params={{ dienst: d.slug }}
                className="flex h-full items-center justify-center rounded-sm border border-oud-rand bg-white p-4 text-center text-[16px] leading-[1.3] text-brand-700 hover:bg-brand-700 hover:text-white md:text-[18px]"
              >
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-center">
          <b>Niet gevonden waar u naar op zoek bent?</b> {site.phone ? 'Neem telefonisch contact op via' : 'Neem contact op via'}{' '}
          <a href={site.phone ? site.phoneHref : `mailto:${site.email}`} className="inline-block font-normal whitespace-nowrap text-brand-700">
            {site.phone || site.email}
          </a>
        </p>
      </Container>
    </section>
  )
}
