import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { posts, aantalPaginas } from './content/blog'
import { diensten } from './content/diensten'
import { paginas as vastePaginas } from './content/paginas'
import { site } from './lib/site'
import { isBeacon, telWeergave, verwerkBeacon } from './server/bezoeken'
import { schoonOp } from './server/bewaartermijn'
import { verwerkCrmBericht, type CrmBericht } from './server/crm'
import { appEnv } from './server/env'
import { llmsTxt } from './server/llms'
import { REDIRECTS } from './content/redirects'

const APEX_HOST = site.domain
const SITE = 'obv' // sleutel in de Advertisexperts-hub (bezoekersmeting)

/* Oude WordPress-paden zonder eigen tegenhanger → 301 */
const NAAR_HOME = ['/feed', '/comments/feed', '/author', '/category/uncategorized/feed']
const SITEMAPS_WP = ['/post-sitemap.xml', '/page-sitemap.xml', '/dienst-sitemap.xml', '/category-sitemap.xml']

function sitemap(): string {
  const url = (pad: string, lastmod?: string) => `  <url><loc>${site.url}${pad}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
  const vast = Object.values(vastePaginas).map((p) => p.path)
  const paginas = Array.from({ length: aantalPaginas - 1 }, (_, i) => `/kennisbank/page/${i + 2}/`)
  const regels = [
    ...vast.map((p) => url(p)),
    ...paginas.map((p) => url(p)),
    ...diensten.map((d) => url(`/dienst/${d.slug}/`)),
    ...posts.map((p) => url(`/${p.slug}/`, p.modified)),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${regels.join('\n')}\n</urlset>\n`
}

/*
 * Bewust geen Disallow voor de interne pagina's (/bedankt/, /intake-nieuwe-klant/, /bizzi/): ze staan op noindex (meta én
 * X-Robots-Tag, zie NOINDEX_PADEN) en niet in de sitemap. Google leest een noindex alleen op een pagina die het mag ophalen;
 * bij een Disallow kan een extern gelinkte URL toch als kale URL in de index komen. Crawlen is veilig: bots tellen niet mee
 * in de bezoekersmeting en een conversie komt alleen uit de sessionStorage van een bezoeker die het formulier verstuurde.
 */
const ROBOTS = `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`

/** Interne pagina's: nooit indexeren, gelijk aan hun meta robots (de statische /bizzi/ krijgt dezelfde header in public/_headers) */
const NOINDEX_PADEN: Record<string, string> = {
  '/bedankt': 'noindex',
  '/intake-nieuwe-klant': 'noindex',
  '/bizzi': 'noindex, nofollow',
}

/*
 * Beveiligings- en cacheheaders op elk antwoord van de worker (de statische bestanden krijgen dezelfde in public/_headers).
 * Bewust geen Content-Security-Policy en geen HSTS: GTM, HubSpot en YouTube moeten blijven werken en het echte domein is
 * nog niet omgezet. X-Frame-Options SAMEORIGIN laat inbedden op de eigen site toe.
 */
const BEVEILIGING: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
}

/** Cachebeleid voor statische paden, voor het geval de worker ze zelf bedient (normaal doet de assets-laag dat) */
function cacheVoorPad(pad: string): string | null {
  if (pad.startsWith('/assets/') || pad.startsWith('/fonts/')) return 'public, max-age=31536000, immutable'
  if (pad.startsWith('/images/')) return 'public, max-age=604800, stale-while-revalidate=86400'
  return null
}

function metHeaders(res: Response, pad: string): Response {
  if (res.status === 101) return res // WebSocket-upgrade (dev-server) ongemoeid laten
  // Response.redirect() en antwoorden van fetch() hebben onveranderlijke headers: kopieer naar een nieuw antwoord
  const uit = new Response(res.body, res)
  for (const [naam, waarde] of Object.entries(BEVEILIGING)) {
    if (!uit.headers.has(naam)) uit.headers.set(naam, waarde)
  }
  const kaalPad = pad.replace(/\/+$/, '')
  if (!uit.headers.has('X-Robots-Tag') && NOINDEX_PADEN[kaalPad]) uit.headers.set('X-Robots-Tag', NOINDEX_PADEN[kaalPad])
  if (!uit.headers.has('Cache-Control')) {
    const beleid = res.ok ? cacheVoorPad(pad) : null
    if (beleid) uit.headers.set('Cache-Control', beleid)
    // HTML: altijd opnieuw valideren, zodat een verouderde pagina nooit blijft hangen
    else if ((uit.headers.get('Content-Type') ?? '').includes('text/html')) uit.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  }
  return uit
}

/** Routering en redirects (ongewijzigd): geeft het antwoord terug zonder de algemene headers */
async function route(request: Request): Promise<Response> {
  const url = new URL(request.url)

  // http → https en www → apex (één canonieke host), in één redirect
  if (url.hostname === `www.${APEX_HOST}` || (url.protocol === 'http:' && url.hostname === APEX_HOST)) {
    url.hostname = APEX_HOST
    url.protocol = 'https:'
    return Response.redirect(url.toString(), 301)
  }

  // Bezoekersmeting (cookieloos, Analytics Engine): beacon voor navigaties binnen de site
  if (isBeacon(request, url)) return verwerkBeacon(request, SITE)

  const pad = url.pathname.replace(/\/+$/, '') || '/'

  // Test-URL (workers.dev): nooit indexeren, ook niet per ongeluk als duplicaat van het echte domein
  const testHost = url.hostname.endsWith('.workers.dev')
  if (testHost && pad === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' },
    })
  }

  // SEO-opschoning: samengevoegde/dubbele artikelen → 301 naar het doel (vóór de slash-redirect, dus geen keten)
  const doel = REDIRECTS[pad]
  if (doel) return Response.redirect(`${site.url}${doel}`, 301)

  // Pagina-URL's altijd mét trailing slash (301, niet de 307 van de router)
  if (
    pad !== '/' &&
    !url.pathname.endsWith('/') &&
    !/\.[a-z0-9]+$/i.test(pad) &&
    !pad.startsWith('/_') &&
    !pad.startsWith('/cdn-cgi') &&
    request.method === 'GET'
  ) {
    url.pathname = `${pad}/`
    return Response.redirect(url.toString(), 301)
  }

  if (pad === '/sitemap.xml' || pad === '/sitemap_index.xml') {
    return new Response(sitemap(), {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    })
  }
  if (SITEMAPS_WP.includes(pad)) return Response.redirect(`${site.url}/sitemap.xml`, 301)
  if (pad === '/robots.txt') {
    return new Response(ROBOTS, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    })
  }
  // https://llmstxt.org: zelfde pagina's als de sitemap (server/llms.ts). Hier, anders maakt de router er een 307 naar /llms.txt/ van.
  if (pad === '/llms.txt') {
    return new Response(llmsTxt(), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    })
  }

  // Oude WordPress-paden
  if (pad === '/bizzyphone') return Response.redirect(`${site.url}/bizzi/`, 301)
  if (pad === '/category/uncategorized') return Response.redirect(`${site.url}/kennisbank/`, 301)
  if (NAAR_HOME.some((o) => pad === o || pad.startsWith(`${o}/`))) return Response.redirect(`${site.url}/`, 301)
  if (pad.startsWith('/wp-') || pad.startsWith('/xmlrpc.php') || pad.endsWith('.php')) {
    return new Response('Not found', { status: 404 })
  }

  const antwoord = await handler.fetch(request)
  if (!testHost) {
    telWeergave(request, antwoord, SITE)
    return antwoord
  }
  const res = new Response(antwoord.body, antwoord)
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return res
}

const entry = createServerEntry({
  async fetch(request) {
    const antwoord = await route(request)
    return metHeaders(antwoord, new URL(request.url).pathname)
  },
})

export default {
  fetch: entry.fetch,
  /* Dagelijkse cron (wrangler.jsonc): persoonsgegevens ouder dan de bewaartermijn opschonen (server/bewaartermijn.ts) */
  async scheduled(_controller: ScheduledController, _env: unknown, ctx: ExecutionContext) {
    ctx.waitUntil(schoonOp())
  },
  /* Wachtrij belastingbemiddelaar-crm: leads doorsturen naar CRM BBase buiten het request-pad (server/crm.ts) */
  async queue(batch: MessageBatch<CrmBericht>) {
    const e = appEnv()
    for (const bericht of batch.messages) {
      try {
        const besluit = await verwerkCrmBericht(bericht.body, bericht.attempts, { db: e.DB, url: e.CRM_WEBHOOK_URL })
        if (besluit.actie === 'retry') bericht.retry({ delaySeconds: besluit.delaySeconds })
        else bericht.ack()
      } catch {
        // Onverwachte (D1-)fout: later opnieuw. Was de lead al geclaimd ('bezig'), dan slaat de volgende poging hem over.
        console.error(`[crm] lead ${Number(bericht.body?.id) || '?'}: onverwachte fout in de wachtrij, nieuwe poging over 60 s`)
        bericht.retry({ delaySeconds: 60 })
      }
    }
  },
}
