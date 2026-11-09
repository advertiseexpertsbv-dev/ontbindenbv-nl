import { createServerFn } from '@tanstack/react-start'
import { aantalPaginas, blogVarianten, gerelateerd, kaart, paginaPosts, vindPost } from '../content/blog'
import { verrijkArtikelBeelden } from '../lib/beeld'

/**
 * Blogdata alleen server-side: blog.json (1,5 MB) komt hierdoor niet in de JS-bundel van de bezoeker.
 * De loaders van /$slug/ en /kennisbank/ roepen deze functies aan (bij het eerste verzoek op de server,
 * bij navigeren in de browser via een kleine request).
 */

/** Eén artikel met de drie gerelateerde artikelen; null bij een onbekende slug (de loader gooit dan notFound) */
export const haalPost = createServerFn({ method: 'GET' })
  .validator((d: unknown) => d as { slug: string })
  .handler(async ({ data }) => {
    const post = vindPost(String(data.slug))
    if (!post) return null
    // Afbeeldingen in de tekst krijgen srcset/sizes (de tekst zelf blijft ongewijzigd); zie verrijkArtikelBeelden in lib/beeld.ts
    const html = verrijkArtikelBeelden(post.html, blogVarianten, post.image !== null)
    return { post: { ...post, html }, meer: gerelateerd(post.slug).map(kaart) }
  })

/** Eén pagina van het nieuwsoverzicht (alleen kaartgegevens); null bij een ongeldig paginanummer */
export const haalNieuws = createServerFn({ method: 'GET' })
  .validator((d: unknown) => d as { pagina: number })
  .handler(async ({ data }) => {
    const pagina = Number(data.pagina)
    if (!Number.isInteger(pagina) || pagina < 1 || pagina > aantalPaginas) return null
    return { pagina, aantalPaginas, kaarten: paginaPosts(pagina).map(kaart) }
  })
