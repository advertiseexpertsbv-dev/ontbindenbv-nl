import { createFileRoute, notFound } from '@tanstack/react-router'
import { seo } from '../../../lib/seo'
import { haalNieuws } from '../../../server/blog'
import NieuwsOverzicht from '../../../components/sections/NieuwsOverzicht'

export const Route = createFileRoute('/kennisbank/page/$pagina')({
  loader: async ({ params }) => {
    const n = Number(params.pagina)
    // pagina 1 is /kennisbank/ zelf; ongeldige of te hoge paginanummers geven een 404
    if (!Number.isInteger(n) || n < 2) throw notFound()
    const r = await haalNieuws({ data: { pagina: n } })
    if (!r) throw notFound()
    return r
  },
  // Bewust verschil met de oude site (SEO-02/SEO-04): oud hebben alle vervolgpagina's dezelfde title 'Nieuws - Belasting Bemiddelaar' en
  // geen meta description. Hier krijgt elke pagina een eigen title en een eigen description (met 'Pagina N van M'); scripts/parity.mjs
  // accepteert de title omdat hij met de oude title begint. Canonical, robots en URL's zijn gelijk aan oud.
  head: ({ params, loaderData }) =>
    seo({
      title: `Nieuws - pagina ${params.pagina}`,
      description: `Het laatste nieuws en praktische artikelen over belastingschulden, betalingsregelingen, BV-zaken en de Belastingdienst. Pagina ${params.pagina}${loaderData ? ` van ${loaderData.aantalPaginas}` : ''}.`,
      path: `/kennisbank/page/${params.pagina}/`,
    }),
  component: NieuwsPagina,
})

function NieuwsPagina() {
  const { pagina, aantalPaginas, kaarten } = Route.useLoaderData()
  return <NieuwsOverzicht pagina={pagina} aantalPaginas={aantalPaginas} kaarten={kaarten} />
}
