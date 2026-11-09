import { site } from './site'
import { vindDienst } from '../content/diensten'

export type Kruimel = { name: string; path: string }

export type SeoInput = {
  title: string
  description: string
  path?: string
  ogImage?: string
  /** Afmetingen en alt van og:image (alleen als bekend) */
  ogImageMeta?: { w: number; h: number; alt: string }
  noindex?: boolean
  /** Titel zonder merknaam-suffix (blogposts behouden hun bestaande titel) */
  exact?: boolean
  article?: { published: string; modified: string }
  /** Kruimelpad voor de BreadcrumbList; zonder waarde wordt het afgeleid uit het pad (zie kruimelsVoor) */
  crumbs?: Kruimel[]
}

/** Canonical altijd mét trailing slash (zelfde URL's als de oude site) */
function metSlash(path: string) {
  if (path === '/' || path === '') return '/'
  return path.endsWith('/') ? path : `${path}/`
}

/** Namen van de losse pagina's, gelijk aan het zichtbare kruimelpad (PaginaKop) */
const PAGINANAMEN: Record<string, string> = {
  '/over-ons/': 'Over ons',
  '/onze-werkwijze/': 'Onze werkwijze',
  '/gratis-intakegesprek/': 'Gratis intakegesprek',
  '/contact/': 'Contact',
  '/kennisbank/': 'Kennisbank',
  '/privacyverklaring-eu/': 'Privacyverklaring',
  '/cookiebeleid-eu/': 'Cookiebeleid (EU)',
}

/**
 * Kruimelpad zoals het zichtbare kruimelpad op de pagina: Home » pagina, Home » Nieuws » artikel,
 * Home » Nieuws » Pagina N, Home » dienst. De startpagina heeft geen kruimelpad.
 */
export function kruimelsVoor(path: string, title: string, article: boolean): Kruimel[] {
  const pad = metSlash(path)
  if (pad === '/') return []
  const home: Kruimel = { name: 'Home', path: '/' }
  const nieuws: Kruimel = { name: 'Kennisbank', path: '/kennisbank/' }
  if (PAGINANAMEN[pad]) return pad === '/kennisbank/' ? [home, nieuws] : [home, { name: PAGINANAMEN[pad], path: pad }]
  const nieuwsPagina = /^\/nieuws\/page\/(\d+)\/$/.exec(pad)
  if (nieuwsPagina) return [home, nieuws, { name: `Pagina ${nieuwsPagina[1]}`, path: pad }]
  const dienst = /^\/dienst\/([^/]+)\/$/.exec(pad)
  if (dienst) return [home, { name: vindDienst(dienst[1])?.naam ?? title, path: pad }]
  if (article) return [home, nieuws, { name: title, path: pad }]
  return [home, { name: title, path: pad }]
}

/** schema.org BreadcrumbList als JSON-tekst voor een ld+json-script */
export function breadcrumbJsonLd(crumbs: Kruimel[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((k, i) => ({ '@type': 'ListItem', position: i + 1, name: k.name, item: `${site.url}${k.path}` })),
  })
}

export function seo({ title, description, path = '/', ogImage, ogImageMeta, noindex, exact, article, crumbs }: SeoInput) {
  const fullTitle = exact || title.includes(site.name) ? title : `${title} - ${site.name}`
  const url = `${site.url}${metSlash(path)}`
  const img = ogImage ?? '/images/og.jpg'
  const kruimels = noindex ? [] : (crumbs ?? kruimelsVoor(path, title, Boolean(article)))
  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large' },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:type', content: article ? 'article' : 'website' },
      { property: 'og:locale', content: 'nl_NL' },
      { property: 'og:site_name', content: site.name },
      { property: 'og:image', content: img.startsWith('http') ? img : `${site.url}${img}` },
      ...(ogImageMeta
        ? [
            { property: 'og:image:width', content: String(ogImageMeta.w) },
            { property: 'og:image:height', content: String(ogImageMeta.h) },
            { property: 'og:image:alt', content: ogImageMeta.alt },
          ]
        : []),
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      ...(article
        ? [
            { property: 'article:published_time', content: article.published },
            { property: 'article:modified_time', content: article.modified },
          ]
        : []),
    ],
    links: [{ rel: 'canonical', href: url }],
    // BreadcrumbList (alleen pagina's met een kruimelpad). Routes die zelf `scripts` teruggeven voegen deze toe via breadcrumbJsonLd().
    scripts: kruimels.length ? [{ type: 'application/ld+json', children: breadcrumbJsonLd(kruimels) }] : [],
  }
}
