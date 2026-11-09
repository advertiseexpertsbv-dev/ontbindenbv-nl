import { createFileRoute, notFound } from '@tanstack/react-router'
import { seo } from '../../lib/seo'
import { paginas } from '../../content/paginas'
import { haalNieuws } from '../../server/blog'
import NieuwsOverzicht from '../../components/sections/NieuwsOverzicht'

export const Route = createFileRoute('/kennisbank/')({
  loader: async () => {
    const r = await haalNieuws({ data: { pagina: 1 } })
    if (!r) throw notFound()
    return r
  },
  head: () => seo(paginas.nieuws),
  component: NieuwsPagina,
})

function NieuwsPagina() {
  const { pagina, aantalPaginas, kaarten } = Route.useLoaderData()
  return <NieuwsOverzicht pagina={pagina} aantalPaginas={aantalPaginas} kaarten={kaarten} />
}
