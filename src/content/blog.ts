/**
 * Alle artikelen van de kennisbank (blog.json, gegenereerd door scripts/bouw-blog.py), nieuwste eerst.
 * SERVER-ONLY: importeer dit bestand alleen in src/server/*, src/server.ts of scripts, nooit in routes of componenten (anders komt
 * blog.json in de client-bundel). Voor de browser: zie content/blog-types.ts en de server functions in src/server/blog.ts.
 */
import data from './blog.json'
import blogVariantenData from './beeldvarianten-blog.json'
import { srcSetVan, type MetSrcSet, type Varianten } from '../lib/beeld'
import type { Kaart, Post } from './blog-types'

export type { Kaart, Post } from './blog-types'

export const posts = data as Post[]

/** Kleinere varianten van de artikelbeelden (scripts/beelden-varianten.mjs), voor srcset in kaarten en artikelhtml */
export const blogVarianten = blogVariantenData as Varianten

/** Tien artikelen per pagina, zoals de oude kennisbank (8 pagina's) */
export const PER_PAGINA = 10
export const aantalPaginas = Math.ceil(posts.length / PER_PAGINA)

export function vindPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

export function paginaPosts(pagina: number): Post[] {
  return posts.slice((pagina - 1) * PER_PAGINA, pagina * PER_PAGINA)
}

/**
 * `sizes` per kaart: de eerste (grote) kaart is een helft van de container (596px vanaf 1300px, cover op 546px hoog),
 * de andere tonen het beeld op 200x150 (cover).
 */
const SIZES_GROOT = '(min-width: 1300px) 640px, (min-width: 992px) calc(50vw - 40px), calc(100vw - 32px)'
const SIZES_KLEIN = '(min-width: 480px) 200px, 140px'

/** Kaartgegevens zonder artikeltekst */
export function kaart(p: Post, groot = false): Kaart & MetSrcSet {
  const imageSrcSet = p.image ? srcSetVan(p.image, blogVarianten) : undefined
  return {
    slug: p.slug,
    title: p.title,
    image: p.image,
    kort: p.kort,
    ...(imageSrcSet ? { imageSrcSet, imageSizes: groot ? SIZES_GROOT : SIZES_KLEIN } : {}),
    ...(p.taal ? { taal: p.taal } : {}),
  }
}
