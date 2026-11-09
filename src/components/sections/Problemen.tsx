import { Link } from '@tanstack/react-router'
import { diensten } from '../../content/diensten'
import { site } from '../../lib/site'
import { Container } from '../ui'

/** "Veel voorkomende problemen": lichtblauwe sectie met patroon, kop links en een raster van witte tegels (4 / 2 / 1 kolommen) */
export default function Problemen() {
  return (
    <section className="bg-textuur py-[72px]" data-reveal suppressHydrationWarning>
      <Container>
        <h2 className="mb-4 text-[30px] md:text-[40px]">Veel voorkomende problemen</h2>
        <p className="mb-8">Heb jij hulp nodig bij 1 van deze problemen?</p>
        <ul className="mb-8 grid gap-4 min-[481px]:grid-cols-2 min-[992px]:grid-cols-4">
          {diensten.map((d) => (
            <li key={d.slug}>
              <Link
                to="/dienst/$dienst/"
                params={{ dienst: d.slug }}
                className="block h-full rounded-sm border border-oud-rand bg-white p-4 text-center text-[16px] font-normal leading-[1.3] text-brand-700 hover:bg-brand-700 hover:text-white"
              >
                {d.naam}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-center">
          <b>Niet gevonden waar u naar op zoek bent?</b> Neem telefonisch contact op via{' '}
          <a href={site.phoneHref} className="inline-block whitespace-nowrap font-bold text-brand-700">
            {site.phone}
          </a>
        </p>
      </Container>
    </section>
  )
}
