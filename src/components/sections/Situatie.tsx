import { Link } from '@tanstack/react-router'
import { situatie } from '../../content/home'
import { footerDiensten } from '../../content/menu'
import { site } from '../../lib/site'
import { ChevronRight, Container } from '../ui'

/**
 * "Wat is je situatie?": lichtblauwe sectie met patroon. Op de oude site stond hier een lege keuzelijst onder "Selecteer
 * hieronder wat het beste bij je past"; hier staan de zes hoofddiensten als tegels (3 / 2 / 1 kolommen).
 * De kop was op de oude site een tweede h1; hier een h2 in dezelfde maat.
 */
export default function Situatie() {
  return (
    <section className="bg-textuur py-sectie" data-reveal suppressHydrationWarning>
      <Container>
        <h2 className="kop-h1 mb-4">{situatie.titel}</h2>
        <p className="mb-8">{situatie.tekst}</p>
        <ul className="mb-10 grid gap-3 min-[481px]:grid-cols-2 min-[992px]:grid-cols-3 min-[992px]:gap-4">
          {footerDiensten.map((d) => (
            <li key={d.slug}>
              <Link
                to="/dienst/$dienst/"
                params={{ dienst: d.slug }}
                className="group flex h-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-5 py-4 text-left text-[16px] leading-[1.35] font-semibold text-brand-800 shadow-kaart transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-kaart-hover motion-reduce:hover:translate-y-0 md:text-[17px]"
              >
                {d.label}
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-colors duration-200 group-hover:bg-brand-700 group-hover:text-white"
                >
                  <ChevronRight className="size-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-center text-muted">
          <b className="text-ink">Niet gevonden waar u naar op zoek bent?</b> {site.phone ? 'Neem telefonisch contact op via' : 'Neem contact op via'}{' '}
          <a href={site.phone ? site.phoneHref : `mailto:${site.email}`} className="inline-block font-semibold whitespace-nowrap text-brand-700 underline-offset-3 hover:underline">
            {site.phone || site.email}
          </a>
        </p>
      </Container>
    </section>
  )
}
