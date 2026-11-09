/**
 * Alle blogartikelen (blog.json, gegenereerd door scripts/bouw-blog.py).
 * SERVER-ONLY: importeer dit bestand alleen in src/server/*, src/server.ts of scripts, nooit in
 * routes of componenten (anders komt blog.json in de client-bundel). Voor de browser: zie
 * content/blog-types.ts en de server functions in src/server/blog.ts.
 */
import data from './blog.json'
import blogVariantenData from './beeldvarianten-blog.json'
import { kaartSizes, srcSetVan, type MetSrcSet, type Varianten } from '../lib/beeld'
import type { Kaart, Post } from './blog-types'

export type { Kaart, Post } from './blog-types'

/** Nieuwste eerst */
export const posts = data as Post[]

/** Kleinere varianten van de blogbeelden (scripts/beelden-varianten.mjs), voor srcset in kaarten en artikelhtml */
export const blogVarianten = blogVariantenData as Varianten

export const PER_PAGINA = 9
export const aantalPaginas = Math.ceil(posts.length / PER_PAGINA)

export function vindPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

export function paginaPosts(pagina: number): Post[] {
  return posts.slice((pagina - 1) * PER_PAGINA, pagina * PER_PAGINA)
}

/** 'Gerelateerd nieuws' zoals de oude site (WordPress-lus over alle berichten): de drie nieuwste artikelen,
 *  op elk artikel hetzelfde, behalve dat het artikel zelf wordt overgeslagen (dan schuift de vierde op).
 *  Dat houdt de interne linkstructuur gelijk aan de oude site. */
export function gerelateerd(slug: string, aantal = 3): Post[] {
  return posts.filter((p) => p.slug !== slug).slice(0, aantal)
}

/** Kaartgegevens zonder artikeltekst; de samenvatting wordt tot 10 woorden ingekort (zoals de oude site) */
export function kaart(p: Post): Kaart & MetSrcSet {
  const woorden = p.excerpt.replace(/\s*\[…\]\s*$/, '').split(/\s+/).filter(Boolean)
  const kort = woorden.slice(0, 10).join(' ') + (woorden.length > 10 ? '...' : '')
  const imageSrcSet = p.image ? srcSetVan(p.image, blogVarianten) : undefined
  const imageSizes = imageSrcSet && p.image ? kaartSizes(blogVarianten[p.image]) : undefined
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    image: p.image,
    kort,
    ...(imageSrcSet ? { imageSrcSet, imageSizes } : {}),
    ...(p.taal ? { taal: p.taal } : {}),
  }
}
