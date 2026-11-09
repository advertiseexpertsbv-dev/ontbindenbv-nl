import { createFileRoute, notFound } from '@tanstack/react-router'
import { seo } from '../../../lib/seo'
import { paginas } from '../../../content/paginas'
import { haalKennisbank } from '../../../server/blog'
import KennisbankOverzicht from '../../../components/sections/KennisbankOverzicht'

export const Route = createFileRoute('/kennisbank/page/$pagina')({
  loader: async ({ params }) => {
    const n = Number(params.pagina)
    // pagina 1 is /kennisbank/ zelf; ongeldige of te hoge paginanummers geven een 404
    if (!Number.isInteger(n) || n < 2) throw notFound()
    const r = await haalKennisbank({ data: { pagina: n } })
    if (!r) throw notFound()
    return r
  },
  // Oud hadden alle vervolgpagina's de titel 'Kennisbank - BV ontbinden?' zonder description; hier krijgt elke pagina een eigen titel
  // en description (met 'pagina N'). Canonical, robots en URL's zijn gelijk aan oud.
  head: ({ params, loaderData }) =>
    seo({
      title: `Kennisbank - pagina ${params.pagina}`,
      description: `${paginas.kennisbank.description} Pagina ${params.pagina}${loaderData ? ` van ${loaderData.aantalPaginas}` : ''}.`,
      path: `/kennisbank/page/${params.pagina}/`,
    }),
  component: Kennisbank,
})

function Kennisbank() {
  const { pagina, aantalPaginas, kaarten } = Route.useLoaderData()
  return <KennisbankOverzicht pagina={pagina} aantalPaginas={aantalPaginas} kaarten={kaarten} />
}
