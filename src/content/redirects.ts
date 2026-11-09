/*
 * Vaste 301-redirects van oude WordPress-paden (paden zonder trailing slash; doel mét slash, dus geen keten).
 * /category/uncategorized en de WordPress-sitemaps staan in src/server.ts.
 */
export const REDIRECTS: Record<string, string> = {
  // Standaardpagina van WordPress die op de oude site nog bereikbaar was
  '/sample-page': '/',
}
