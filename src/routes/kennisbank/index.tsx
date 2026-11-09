import { createFileRoute, notFound } from '@tanstack/react-router'
import { seo } from '../../lib/seo'
import { paginas } from '../../content/paginas'
import { haalKennisbank } from '../../server/blog'
import KennisbankOverzicht from '../../components/sections/KennisbankOverzicht'

export const Route = createFileRoute('/kennisbank/')({
  loader: async () => {
    const r = await haalKennisbank({ data: { pagina: 1 } })
    if (!r) throw notFound()
    return r
  },
  head: () => seo(paginas.kennisbank),
  component: Kennisbank,
})

function Kennisbank() {
  const { pagina, aantalPaginas, kaarten } = Route.useLoaderData()
  return <KennisbankOverzicht pagina={pagina} aantalPaginas={aantalPaginas} kaarten={kaarten} />
}
