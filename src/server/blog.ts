import { createServerFn } from '@tanstack/react-start'
import { aantalPaginas, blogVarianten, kaart, paginaPosts, vindPost } from '../content/blog'
import { verrijkArtikelBeelden } from '../lib/beeld'

/**
 * Artikeldata alleen server-side: blog.json komt hierdoor niet in de JS-bundel van de bezoeker.
 * De loaders van /$slug/ en /kennisbank/ roepen deze functies aan (bij het eerste verzoek op de server,
 * bij navigeren in de browser via een kleine request).
 */

/** Eén artikel; null bij een onbekende slug (de loader gooit dan notFound) */
export const haalPost = createServerFn({ method: 'GET' })
  .validator((d: unknown) => d as { slug: string })
  .handler(async ({ data }) => {
    const post = vindPost(String(data.slug))
    if (!post) return null
    // Afbeeldingen in de tekst krijgen srcset/sizes (de tekst zelf blijft ongewijzigd); zie verrijkArtikelBeelden in lib/beeld.ts
    const html = verrijkArtikelBeelden(post.html, blogVarianten, post.image !== null)
    return { post: { ...post, html } }
  })

/** Eén pagina van de kennisbank (alleen kaartgegevens); null bij een ongeldig paginanummer */
export const haalKennisbank = createServerFn({ method: 'GET' })
  .validator((d: unknown) => d as { pagina: number })
  .handler(async ({ data }) => {
    const pagina = Number(data.pagina)
    if (!Number.isInteger(pagina) || pagina < 1 || pagina > aantalPaginas) return null
    return { pagina, aantalPaginas, kaarten: paginaPosts(pagina).map((p, i) => kaart(p, i === 0)) }
  })
