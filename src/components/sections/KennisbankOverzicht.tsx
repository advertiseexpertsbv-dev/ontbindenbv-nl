import { Link } from '@tanstack/react-router'
import type { Kaart } from '../../content/blog-types'
import type { MetSrcSet } from '../../lib/beeld'
import PaginaKop from './PaginaKop'
import { Container } from '../ui'

type K = Kaart & MetSrcSet

/**
 * Eerste artikel van de pagina, zoals de oude kennisbank: groot vlak (links, drie rijen hoog) met de foto en daarover onderaan
 * titel, korte tekst en "Meer Lezen" in wit.
 */
function GroteKaart({ p }: { p: K }) {
  return (
    <Link
      to="/$slug/"
      params={{ slug: p.slug }}
      className="group relative isolate flex min-h-[360px] items-end overflow-hidden rounded-sm bg-brand-700 p-8 text-white min-[992px]:row-span-3 min-[992px]:min-h-0"
    >
      {p.image && (
        <img
          src={p.image}
          srcSet={p.imageSrcSet}
          sizes={p.imageSizes}
          alt=""
          width={640}
          height={586}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <span className="absolute inset-0 -z-10 bg-linear-to-t from-black/60 via-black/20 to-transparent" aria-hidden="true" />
      <div lang={p.taal}>
        <h2 className="mb-4 text-[18px] !text-white md:text-[22px]">{p.title}</h2>
        <p className="mb-8">{p.kort}</p>
        <span className="text-[#c7dbef] group-hover:underline">Meer Lezen</span>
      </div>
    </Link>
  )
}

/** Overige artikelen: foto van 200x150 (op een smalle telefoon 140x105) met titel en "Meer Lezen" ernaast */
function KleineKaart({ p }: { p: K }) {
  return (
    <Link to="/$slug/" params={{ slug: p.slug }} className="group grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4 min-[480px]:grid-cols-[200px_minmax(0,1fr)] min-[480px]:gap-8">
      <span className="bg-textuur block aspect-[4/3] overflow-hidden rounded-sm">
        {p.image && (
          <img
            src={p.image}
            srcSet={p.imageSrcSet}
            sizes={p.imageSizes}
            alt=""
            width={200}
            height={150}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </span>
      <span lang={p.taal}>
        <h2 className="mb-4 text-[18px] text-text group-hover:text-brand-700 md:text-[22px]">{p.title}</h2>
        <span className="group-hover:underline">Meer Lezen</span>
      </span>
    </Link>
  )
}

function paginaLink(n: number) {
  return n === 1 ? ({ to: '/kennisbank/' } as const) : ({ to: '/kennisbank/page/$pagina/', params: { pagina: String(n) } } as const)
}

/** Paginering als de oude site: blauwe blokken, de huidige pagina wit met blauwe rand, '« Vorige' en 'Volgende »' */
const blok = 'inline-flex items-center border border-brand-700 p-4'
const blokActief = `${blok} bg-white text-brand-700`
const blokLink = `tik ${blok} bg-brand-700 text-white transition-colors hover:bg-brand-hover`

/**
 * Kennisbank zoals de oude site: lichte titelbalk, twee kolommen met het eerste artikel groot (links, drie rijen hoog) en de
 * andere als rij met foto, tien per pagina, en de paginering (1, 2, 3, …, 8) eronder.
 */
export default function KennisbankOverzicht({ pagina, aantalPaginas, kaarten }: { pagina: number; aantalPaginas: number; kaarten: K[] }) {
  const nummers = Array.from({ length: aantalPaginas }, (_, i) => i + 1).filter((n) => n === 1 || n === aantalPaginas || Math.abs(n - pagina) <= 2)
  const [eerste, ...rest] = kaarten
  return (
    <>
      <PaginaKop
        variant="licht"
        titel="Kennisbank"
        kruimels={pagina > 1 ? [{ label: 'Kennisbank', to: '/kennisbank/' }, { label: `Pagina ${pagina}` }] : [{ label: 'Kennisbank' }]}
      />
      <section className="py-[72px]">
        <Container>
          <div className="grid gap-12 min-[992px]:grid-cols-2">
            {eerste && <GroteKaart p={eerste} />}
            {rest.map((p) => (
              <KleineKaart key={p.slug} p={p} />
            ))}
          </div>
          <nav aria-label="Paginering" className="mt-8 flex flex-wrap items-center justify-center gap-1">
            {pagina > 1 && (
              <Link {...paginaLink(pagina - 1)} rel="prev" className={blokLink}>
                « Vorige
              </Link>
            )}
            {nummers.map((n, i) => (
              <span key={n} className="contents">
                {i > 0 && n - nummers[i - 1] > 1 && (
                  <span aria-hidden="true" className={`${blok} bg-brand-700 text-white`}>
                    …
                  </span>
                )}
                {n === pagina ? (
                  <span aria-current="page" className={blokActief}>
                    {n}
                  </span>
                ) : (
                  <Link {...paginaLink(n)} aria-label={`Pagina ${n}`} className={blokLink}>
                    {n}
                  </Link>
                )}
              </span>
            ))}
            {pagina < aantalPaginas && (
              <Link {...paginaLink(pagina + 1)} rel="next" className={blokLink}>
                Volgende »
              </Link>
            )}
          </nav>
        </Container>
      </section>
    </>
  )
}
