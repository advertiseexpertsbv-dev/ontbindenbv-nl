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
    <section id="reviews" className="bg-textuur py-sectie" data-reveal suppressHydrationWarning>
      <Container>
        <div className="mb-10 flex flex-col gap-6 min-[992px]:mb-12 min-[992px]:flex-row min-[992px]:justify-between min-[992px]:gap-0">
          <div className="min-[992px]:w-[60%] min-[992px]:pr-4">
            <h2 className="mb-4">
              Ontdek wat tevreden klanten
              <br />
              over ons zeggen
            </h2>
            <p className="text-muted">Lees wat onze tevreden klanten over ons zeggen</p>
          </div>
          {/* Score van Belasting Bemiddelaar (site.reviews.bron), met de herkomst erbij. Google-logo en link alleen met een
              controleerbaar Google-profiel (site.reviews.googleUrl). */}
          <div className="flex flex-col items-start gap-1 text-[14px] min-[992px]:items-end">
            <div className="flex items-center gap-2">
              <span className="flex text-star" role="img" aria-label={`${site.reviews.score} van 5 sterren`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <FaStar key={i} className="size-4" />
                ))}
              </span>
              <span>
                <b>{site.reviews.score}</b> uit 5
              </span>
              {site.reviews.googleUrl && (
                <a href={site.reviews.googleUrl} target="_blank" rel="noopener" aria-label="Bekijk de reviews op Google">
                  <GoogleG className="size-5" />
                </a>
              )}
            </div>
            <p className="text-muted">
              {site.reviews.count} reviews van {site.reviews.bron}, hetzelfde team
            </p>
          </div>
        </div>
        <ul className="grid gap-5 min-[992px]:grid-cols-3 min-[992px]:gap-6">
          {reviews.map((r) => (
            <li key={r.naam} className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-kaart md:p-8">
              {/* Aanhalingsteken als versiering */}
              <svg viewBox="0 0 32 24" className="mb-5 h-6 w-8 shrink-0 text-brand-200" fill="currentColor" aria-hidden="true">
                <path d="M0 24V14.4C0 6.4 4.3 1.6 12.8 0l1.4 3.2C9.6 4.6 7.4 7.4 7.2 11.2H13V24H0zm18.4 0V14.4C18.4 6.4 22.7 1.6 31.2 0l1.4 3.2c-4.6 1.4-6.8 4.2-7 8H31V24H18.4z" />
              </svg>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3">
                {/* h3 (geen h4) zodat de kopvolgorde onder de h2 klopt */}
                <h3 className="text-[17px] md:text-[18px]">{r.bedrijf}</h3>
                <p className="text-[14px] text-muted">{r.datum}</p>
              </div>
              <p className="mb-3 text-[15px] text-ink">
                <b>{r.naam}</b>
              </p>
              <p className="text-[16px] leading-[1.65] text-body">{r.tekst}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
