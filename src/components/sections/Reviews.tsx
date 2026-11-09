import { reviews } from '../../content/home'
import { site } from '../../lib/site'
import { Container } from '../ui'
import { FaStar, GoogleG } from './icons'

/**
 * Reviews zoals de oude site: kop links, score met gele sterren en het Google-logo rechts, witte kaarten met dunne rand.
 * De oude slider liet de drie kaarten onder elkaar zien (600px breed); hier staan ze vanaf 992px naast elkaar.
 */
export default function Reviews() {
  return (
    <section id="reviews" className="bg-textuur py-[72px]" data-reveal suppressHydrationWarning>
      <Container>
        <div className="mb-12 flex flex-col gap-6 min-[992px]:flex-row min-[992px]:justify-between min-[992px]:gap-0">
          <div className="min-[992px]:w-[60%] min-[992px]:pr-4">
            <h2 className="mb-4">
              Ontdek wat tevreden klanten
              <br />
              over ons zeggen
            </h2>
            <p>Lees wat onze tevreden klanten over ons zeggen</p>
          </div>
          <div className="flex items-start justify-end">
            <div className="flex items-center gap-2 text-[14px]">
              <span className="flex text-star" role="img" aria-label={`${site.reviews.score} van 5 sterren`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <FaStar key={i} className="size-4" />
                ))}
              </span>
              <span>
                <b>{site.reviews.score}</b> uit 5
              </span>
              <GoogleG className="size-5" />
            </div>
          </div>
        </div>
        <ul className="grid gap-8 min-[992px]:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.naam} className="rounded-sm border border-oud-rand bg-white p-8">
              <div className="mb-6">
                {/* h3 (geen h4) zodat de kopvolgorde onder de h2 klopt; maat blijft die van de oude h4 (16px, vanaf 768px 18px) */}
                <h3 className="text-[16px] md:text-[18px]">{r.bedrijf}</h3>
                <p className="text-[14px]">{r.datum}</p>
              </div>
              <p className="mb-4">
                <b>{r.naam}</b>
              </p>
              <p>{r.tekst}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
