import { createFileRoute, notFound } from '@tanstack/react-router'
import { seo } from '../../lib/seo'
import { beeld, SIZES } from '../../lib/beeld'
import { diensten, vindDienst, type DienstBlok } from '../../content/diensten'
import { vertrouwen } from '../../content/home'
import { site } from '../../lib/site'
import PaginaKop from '../../components/sections/PaginaKop'
import KaartFormulier from '../../components/sections/KaartFormulier'
import MobielFormulier from '../../components/sections/MobielFormulier'
import Werkwijze from '../../components/sections/Werkwijze'
import CtaBand from '../../components/sections/CtaBand'
import Reviews from '../../components/sections/Reviews'
import Faq from '../../components/sections/Faq'
import ContactBlok from '../../components/sections/ContactBlok'
import { Button, Container } from '../../components/ui'

export const Route = createFileRoute('/dienst/$dienst')({
  loader: ({ params }) => {
    const d = vindDienst(params.dienst)
    if (!d) throw notFound()
    return d
  },
  head: ({ loaderData, params }) => {
    const d = loaderData ?? diensten[0]
    return seo({ title: d.seoTitle, description: d.description, path: `/dienst/${params.dienst}/` })
  },
  component: Dienstpagina,
})

/** Ronde vink (wit vinkje in gekleurde cirkel, 26px) zoals op de oude site */
function Vink({ className }: { className: string }) {
  return (
    <span className={`grid size-[26px] shrink-0 place-items-center rounded-full p-[5px] ${className}`} aria-hidden="true">
      <svg viewBox="0 0 28 28" className="size-4 fill-white">
        <path d="M26.109 8.844c0 0.391-0.156 0.781-0.438 1.062l-13.438 13.438c-0.281 0.281-0.672 0.438-1.062 0.438s-0.781-0.156-1.062-0.438l-7.781-7.781c-0.281-0.281-0.438-0.672-0.438-1.062s0.156-0.781 0.438-1.062l2.125-2.125c0.281-0.281 0.672-0.438 1.062-0.438s0.781 0.156 1.062 0.438l4.594 4.609 10.25-10.266c0.281-0.281 0.672-0.438 1.062-0.438s0.781 0.156 1.062 0.438l2.125 2.125c0.281 0.281 0.438 0.672 0.438 1.062z" />
      </svg>
    </span>
  )
}

/** Ruimte onder een blok, zoals de oude site: alinea's in 1 tekstblok 1 regel wit, tussenkoppen 16px, rest 32px */
function ruimteOnder(b: DienstBlok, volgende?: DienstBlok) {
  if (!volgende) return ''
  if (b.t === 'h' || b.t === 'b') return 'mb-4'
  if (b.t === 'p' && volgende.t === 'p') return 'mb-[1.8em]'
  return 'mb-8'
}

function Blok({ b, volgende }: { b: DienstBlok; volgende?: DienstBlok }) {
  const mb = ruimteOnder(b, volgende)
  if (b.t === 'h')
    return <h2 className={`text-[18px] font-bold leading-[1.3] md:text-[20px] ${mb}`}>{b.x}</h2>
  if (b.t === 'b') return <p className={`font-bold ${mb}`}>{b.x}</p>
  if (b.t === 'ul')
    return (
      <ul className={`flex flex-col gap-4 ${mb}`}>
        {b.items.map((it) => {
          const lead = typeof it === 'string' ? null : it.lead
          const tekst = typeof it === 'string' ? it : it.x
          return (
            <li key={lead ?? tekst} className="flex items-center gap-4">
              <Vink className="bg-accent" />
              <span>
                {lead && (
                  <>
                    <b className="font-bold">{lead}</b>
                    <br />
                  </>
                )}
                {tekst}
              </span>
            </li>
          )
        })}
      </ul>
    )
  return <p className={mb}>{b.x}</p>
}

function Dienstpagina() {
  const d = Route.useLoaderData()
  return (
    <>
      <PaginaKop titel={d.h1} sub={d.sub} />
      <div className="px-4 pt-6 md:hidden">
        <MobielFormulier formulier={`Dienst: ${d.naam}`} />
      </div>
      <section className="py-[72px]">
        <Container className="grid gap-10 min-[992px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] min-[992px]:gap-0">
          <div className="min-w-0 min-[992px]:pr-4">
            <ul className="-mt-12 mb-16 flex flex-wrap justify-between gap-4 text-[14px] leading-[1.8]">
              {vertrouwen.map((t) => (
                <li key={t} className="flex items-center">
                  <Vink className="mr-2 bg-brand-700" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mb-8">
              {d.blokken.map((b, i) => (
                <Blok key={i} b={b} volgende={d.blokken[i + 1]} />
              ))}
            </div>
            <div className="flex flex-col gap-4 min-[992px]:flex-row min-[992px]:flex-wrap">
              <Button href="/gratis-intakegesprek/" arrow>
                Gratis intakegesprek
              </Button>
              <Button href={site.afspraakHref} variant="yellow" arrow>
                Online afspraak inplannen
              </Button>
            </div>
          </div>
          <div className="flex min-w-0 flex-col min-[992px]:pl-4">
            <KaartFormulier
              formulier={`Dienst: ${d.naam}`}
              className="relative z-10 mb-8 max-md:hidden max-[992px]:p-8! min-[992px]:-mt-[125px]"
            />
            <div className="relative h-[min(75vw,350px)] min-[992px]:h-auto min-[992px]:max-h-[750px] min-[992px]:flex-1">
              <img
                {...beeld('/images/site/peter-schilderij.webp', SIZES.schilderijDienst)}
                alt=""
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
                className="size-full rounded-[4px] object-cover min-[992px]:absolute min-[992px]:inset-0"
              />
            </div>
          </div>
        </Container>
      </section>
      <Werkwijze compact />
      <CtaBand />
      <Reviews />
      <Faq />
      <ContactBlok />
    </>
  )
}
