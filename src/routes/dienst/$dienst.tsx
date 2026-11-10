import { createFileRoute, notFound } from '@tanstack/react-router'
import { seo } from '../../lib/seo'
import { diensten, vindDienst, type DienstBlok } from '../../content/diensten'
import { vertrouwenDienst } from '../../content/home'
import { site } from '../../lib/site'
import PaginaKop from '../../components/sections/PaginaKop'
import KaartFormulier from '../../components/sections/KaartFormulier'
import Vinken, { Vink } from '../../components/sections/Vinken'
import Werkwijze from '../../components/sections/Werkwijze'
import CtaBand from '../../components/sections/CtaBand'
import Reviews from '../../components/sections/Reviews'
import Faq, { faqSchema } from '../../components/sections/Faq'
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
    const h = seo({ title: d.seoTitle, description: d.description, path: `/dienst/${params.dienst}/` })
    if (!d.faq.length) return h
    return { ...h, scripts: [...h.scripts, { type: 'application/ld+json', children: JSON.stringify(faqSchema(d.faq)) }] }
  },
  component: Dienstpagina,
})

/** Ruimte onder een blok zoals de oude site: tussenkop 16px, tekst 32px, lijst, tabel en knoppen 48px; niets onder het laatste blok */
const ruimte: Record<DienstBlok['t'], string> = { h: 'mb-4', p: 'mb-8', b: 'mb-8', ul: 'mb-12', tabel: 'mb-12', knoppen: 'mb-12' }

function Blok({ b, laatste }: { b: DienstBlok; laatste: boolean }) {
  const mb = laatste ? '' : ruimte[b.t]
  switch (b.t) {
    case 'h':
      return <h2 className={mb}>{b.x}</h2>
    case 'b':
      return (
        <p className={mb}>
          <b>{b.x}</b>
        </p>
      )
    case 'p':
      return (
        <div className={`tekst-html flex flex-col gap-[1.4em] ${mb}`}>
          {b.alineas.map((a, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: a }} />
          ))}
        </div>
      )
    case 'ul':
      return <Vinken items={b.items} className={`tekst-html ${mb}`} />
    case 'tabel':
      // Oude site: blauw raster (auto/1fr), kopregel en cellen 8px/16px binnenruimte. De celtekst was daar donker op blauw;
      // hier wit, zodat hij leesbaar is.
      return (
        <table className={`w-full overflow-hidden rounded-2xl bg-brand-700 text-[16px] text-white ${mb}`}>
          <thead>
            <tr>
              {b.kop.map((k) => (
                <th key={k} scope="col" className="border-b border-white/20 bg-brand-800 px-5 py-3 text-left align-top font-bold">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rijen.map(([a, c]) => (
              <tr key={a}>
                <th scope="row" className="w-[45%] border-t border-white/10 px-5 py-3 text-left align-top font-semibold">
                  {a}
                </th>
                <td className="border-t border-white/10 px-5 py-3 align-top text-white/90">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'knoppen':
      return (
        <div className={`flex flex-col items-start gap-4 min-[992px]:flex-row min-[992px]:flex-wrap min-[992px]:items-center ${mb}`}>
          <Button href="/gratis-intakegesprek/" arrow>
            Gratis intakegesprek
          </Button>
          <Button href={site.afspraakHref} variant="yellow" arrow>
            {site.afspraakKnop}
          </Button>
        </div>
      )
  }
}

/**
 * Dienstpagina zoals de oude site: blauwe titelbalk (bij de hoofddiensten met vinkjes), een rij met drie blauwe vinkjes die
 * de balk raakt, de tekstkolom (60%) met de formulierkaart ernaast (40%, blijft staan bij scrollen), dan bij de hoofddiensten
 * de werkwijze en de CTA-band, en daarna reviews, de eigen veelgestelde vragen en het contactblok.
 */
function Dienstpagina() {
  const d = Route.useLoaderData()
  return (
    <>
      <PaginaKop titel={d.h1} sub={d.sub}>
        {d.bannerPunten.length > 0 && <Vinken items={d.bannerPunten} licht className="mt-8" />}
      </PaginaKop>
      <section className="py-sectie">
        <Container className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:items-start min-[992px]:gap-0">
          <div className="min-w-0 min-[992px]:w-[60%] min-[992px]:pr-4">
            <ul className="tekst-vink -mt-6 mb-12 flex flex-wrap items-center gap-x-8 gap-y-3 min-[992px]:-mt-12">
              {vertrouwenDienst.map((t) => (
                <li key={t} className="flex items-center">
                  <Vink kleur="blauw" className="mr-2" />
                  {t}
                </li>
              ))}
            </ul>
            {d.blokken.map((b, i) => (
              <Blok key={i} b={b} laatste={i === d.blokken.length - 1} />
            ))}
          </div>
          <div className="min-w-0 min-[992px]:sticky min-[992px]:top-[11rem] min-[992px]:w-[40%] min-[992px]:pl-4">
            <KaartFormulier formulier={`Dienst: ${d.naam}`} />
          </div>
        </Container>
      </section>
      {d.uitgebreid && (
        <>
          <Werkwijze />
          <CtaBand bel />
        </>
      )}
      <Reviews />
      {d.faq.length > 0 && <Faq items={d.faq} />}
      <ContactBlok />
    </>
  )
}
