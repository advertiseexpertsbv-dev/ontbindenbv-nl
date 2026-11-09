/*
 * Vaste 301-redirects van oude WordPress-paden (paden zonder trailing slash; doel mét slash, dus geen keten).
 * Sitemap-doelen eindigen op .xml: geen slash, en geen keten (de slash-redirect slaat extensies over).
 * /category/uncategorized, /sitemap_index.xml en de Rank Math-sitemaps (*-sitemap.xml) staan in src/server.ts.
 */
export const REDIRECTS: Record<string, string> = {
  // Standaardpagina van WordPress die op de oude site nog bereikbaar was
  '/sample-page': '/',
  // Typo van de oude WordPress-site (404). De echte pagina is /gratis-intakegesprek/.
  '/gratis-intakesprek': '/',
  // WordPress 5.5-kernsitemaps. Zonder deze regel vangt /wp- ze als 404.
  '/wp-sitemap.xml': '/sitemap.xml',
  '/wp-sitemap-posts-post-1.xml': '/sitemap.xml',
  '/wp-sitemap-posts-page-1.xml': '/sitemap.xml',
  '/wp-sitemap-pages-page-1.xml': '/sitemap.xml',
  '/wp-sitemap-posts-dienst-1.xml': '/sitemap.xml',
  '/wp-sitemap-taxonomies-category-1.xml': '/sitemap.xml',
  '/wp-sitemap-users-1.xml': '/sitemap.xml',
}

/**
 * Doelpad van een vaste redirect, of van elke andere /wp-sitemap-….xml (pagina 2, post_tag, …).
 * Geen .xsl: dat is een stylesheet, geen sitemap.
 */
export function doelVoor(pad: string): string | undefined {
  const vast = REDIRECTS[pad]
  if (vast) return vast
  if (/^\/wp-sitemap-[a-z0-9_-]+\.xml$/.test(pad)) return '/sitemap.xml'
  return undefined
}
