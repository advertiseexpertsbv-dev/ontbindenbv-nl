import { Link } from '@tanstack/react-router'
import type { Kaart } from '../../content/blog-types'
import type { MetSrcSet } from '../../lib/beeld'
import PaginaKop from './PaginaKop'
import { Container } from '../ui'

/**
 * Nieuwskaart zoals de oude site: foto (10:7) met daaroverheen een witte tekstkaart die onderaan
 * uitgelijnd is, titel, korte samenvatting (10 woorden) en een blauwe 'Lees meer'-pil. Geen datum.
 * Bij hover wordt de tekstkaart merkblauw. De hele kaart is één link.
 * eager: alleen voor de eerste kaart boven de vouw (LCP, fetchPriority high); alle andere kaarten zijn lazy, zodat ze niet
 * vooraf worden geladen (op een telefoon staat alleen de eerste kaart in beeld).
 */
export function PostKaart({ p, niveau = 'h2', eager = false }: { p: Kaart & MetSrcSet; niveau?: 'h2' | 'h3'; eager?: boolean }) {
  const Kop = niveau
  return (
    <Link to="/$slug/" params={{ slug: p.slug }} className="group relative block pb-[144px]">
      <div className="aspect-[10/7] w-full overflow-hidden rounded-[4px] bg-brand-100">
        {p.image && (
          <img
            src={p.image}
            srcSet={p.imageSrcSet}
            sizes={p.imageSizes}
            alt=""
            width={640}
            height={448}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : undefined}
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>
      <div className="absolute bottom-0 left-[5%] w-[95%] rounded-[4px] border border-oud-rand bg-white px-4 py-8 transition-colors duration-300 group-hover:border-brand-700 group-hover:bg-brand-700">
        <Kop lang={p.taal} className="mb-4 text-[18px] font-bold leading-[1.3] text-text transition-colors duration-300 group-hover:text-white md:text-[20px]">{p.title}</Kop>
        <p lang={p.taal} className="mb-8 text-[14px] leading-[1.8] text-text transition-colors duration-300 group-hover:text-white md:text-[17px]">{p.kort}</p>
        {/* Oud: bij hover op de kaart worden alleen de kleuren omgedraaid (de rand van de knop blijft merkblauw); het pijltje schuift pas
            als de muis op de knop zelf staat. */}
        <span className="group/knop ml-auto flex w-fit items-center rounded-full border border-brand-700 bg-brand-700 px-8 py-4 text-[14px] leading-[1.8] text-white transition-colors duration-300 group-hover:bg-white group-hover:text-brand-700 md:text-[17px]">
          <span className="relative flex items-center pr-5 transition-[padding] duration-300 group-hover/knop:pl-5 group-hover/knop:pr-0">
            Lees meer
            <span aria-hidden="true" className="btn-pijl absolute left-full -translate-x-full transition-all duration-300 group-hover/knop:left-0 group-hover/knop:translate-x-0" />
          </span>
        </span>
      </div>
    </Link>
  )
}

function paginaLink(n: number) {
  return n === 1 ? ({ to: '/kennisbank/' } as const) : ({ to: '/kennisbank/page/$pagina/', params: { pagina: String(n) } } as const)
}

/** Paginering als de oude site: blauwe blokken, huidige pagina wit met blauwe rand, '« Vorige' en 'Volgende »'.
 *  Maten zoals oud: 52px hoog en 14px onder 768px, 54px en 17px erboven. Op een smal scherm loopt de rij over twee regels;
 *  de oude blokken overlapten elkaar dan (inline-elementen), hier staan ze netjes onder elkaar. */
const blok = 'inline-flex h-[52px] items-center border border-brand-700 px-4 text-[14px] leading-none md:h-[54px] md:text-[17px]'
const blokActief = `${blok} bg-white text-brand-700`
const blokLink = `tik ${blok} bg-brand-700 text-white transition-colors hover:bg-brand-800`

export default function NieuwsOverzicht({ pagina, aantalPaginas, kaarten }: { pagina: number; aantalPaginas: number; kaarten: (Kaart & MetSrcSet)[] }) {
  const nummers = Array.from({ length: aantalPaginas }, (_, i) => i + 1).filter((n) => n === 1 || n === aantalPaginas || Math.abs(n - pagina) <= 2)
  return (
    <>
      {/* Kruimelpad als oud: 'Home » Nieuws » Pagina 2' (Nieuws is daar geen link) */}
      <PaginaKop variant="licht" titel="Het laatste nieuws" kruimels={[{ label: 'Nieuws' }, ...(pagina > 1 ? [{ label: `Pagina ${pagina}` }] : [])]} />
      <section className="pb-[60px] pt-[72px]">
        <Container>
          <div className="grid gap-x-4 gap-y-12 min-[768px]:grid-cols-2 min-[992px]:grid-cols-3">
            {kaarten.map((p, i) => (
              <PostKaart key={p.slug} p={p} eager={i === 0} />
            ))}
          </div>
          <nav aria-label="Paginering" className="mt-9 flex flex-wrap items-center justify-center gap-[4.5px]">
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
