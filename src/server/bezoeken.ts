/* Bezoekersmeting zonder cookies.
 *
 * Elke paginaweergave wordt server-side als één datapunt naar Cloudflare
 * Analytics Engine geschreven (dataset 'site_bezoeken', gedeeld door alle
 * sites; de Advertisexperts-hub leest 'm uit). Er worden geen persoonsgegevens
 * bewaard: de bezoeker-hash is een dag-gebonden afgeleide van IP + browser en
 * is de volgende dag niet meer te herleiden. Er is dus geen toestemming nodig
 * en álle bezoekers tellen mee (niet alleen wie cookies accepteert).
 *
 * Kolommen (blob1 …): pad, host, land, verwijzer-host, bron, medium, campagne,
 * apparaat, soort ('pagina' = volledige lading, 'spa' = navigatie in de site),
 * bezoeker-hash, zoekterm. index1 = site-sleutel, double1 = 1.
 */
import { env, waitUntil } from 'cloudflare:workers'

type Datapunt = { blobs?: string[]; doubles?: number[]; indexes?: string[] }
type Dataset = { writeDataPoint: (punt: Datapunt) => void }
type Soort = 'pagina' | 'spa'

const BOT_RE =
  /bot|crawl|spider|slurp|preview|lighthouse|headless|python|curl|wget|java\/|go-http|facebookexternalhit|whatsapp|telegram|pingdom|uptime|monitor|ahrefs|semrush|screaming|dataprovider|petalbot|bytespider|gptbot|claude|anthropic|openai/i
const OVERGESLAGEN = ['/api/', '/_serverFn/', '/_build/', '/cdn-cgi/', '/images/', '/assets/', '/fonts/']
const BESTAND_RE = /\.[a-z0-9]{2,5}$/i
const ZOEKMACHINE_RE = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.[a-z.]+|ecosia\.org|startpage\.com|qwant\.com|search\.brave\.com)$/
const SOCIAL_RE =
  /(^|\.)(facebook\.com|instagram\.com|linkedin\.com|pinterest\.[a-z.]+|t\.co|twitter\.com|x\.com|youtube\.com|tiktok\.com|nextdoor\.[a-z.]+|reddit\.com)$/

function dataset(): Dataset | undefined {
  return (env as { BEZOEKEN?: Dataset }).BEZOEKEN
}

const knip = (s: string, max: number) => (s.length > max ? s.slice(0, max) : s)

function normaliseerPad(pad: string): string {
  const kaal = pad.replace(/\/+$/, '')
  return kaal || '/'
}

/* Alleen 'echte' paginaverzoeken van een browser tellen: geen API, assets,
   bestanden (sitemap, robots, …) of fetches vanuit de router. */
export function isPaginaVerzoek(request: Request, url: URL): boolean {
  if (request.method !== 'GET') return false
  const pad = url.pathname
  if (OVERGESLAGEN.some((p) => pad.startsWith(p))) return false
  if (BESTAND_RE.test(pad)) return false
  const bestemming = request.headers.get('sec-fetch-dest')
  if (bestemming) return bestemming === 'document'
  return (request.headers.get('accept') ?? '').includes('text/html')
}

function isBot(request: Request): boolean {
  const ua = request.headers.get('user-agent') ?? ''
  return !ua || BOT_RE.test(ua)
}

function apparaat(request: Request): string {
  const ua = request.headers.get('user-agent') ?? ''
  if (/iPad|Tablet|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet'
  if (request.headers.get('sec-ch-ua-mobile') === '?1' || /Mobi|iPhone|Android/i.test(ua)) return 'mobiel'
  return 'desktop'
}

function verwijzerHost(verwijzer: string): string {
  try {
    return verwijzer ? new URL(verwijzer).hostname.replace(/^www\./, '').toLowerCase() : ''
  } catch {
    return ''
  }
}

/* Zelfde indeling als lib/attribution.ts (client), maar dan server-side. */
function classificeer(url: URL, verwijzer: string, eigenHost: string): { bron: string; medium: string } {
  const p = url.searchParams
  const utmBron = p.get('utm_source')
  if (utmBron) return { bron: utmBron.toLowerCase(), medium: (p.get('utm_medium') || 'none').toLowerCase() }
  if (p.get('gclid') || p.get('wbraid') || p.get('gbraid')) return { bron: 'google', medium: 'cpc' }
  if (p.get('msclkid')) return { bron: 'bing', medium: 'cpc' }
  if (p.get('fbclid')) return { bron: 'facebook', medium: 'social' }
  if (!verwijzer) return { bron: 'direct', medium: 'none' }
  if (verwijzer === eigenHost) return { bron: 'intern', medium: 'intern' }
  const zoek = verwijzer.match(ZOEKMACHINE_RE)
  if (zoek) return { bron: zoek[2].split('.')[0].replace('search', 'brave'), medium: 'organic' }
  const social = verwijzer.match(SOCIAL_RE)
  if (social) return { bron: social[2].split('.')[0].replace(/^t$/, 'twitter'), medium: 'social' }
  return { bron: verwijzer, medium: 'referral' }
}

/* Dag-gebonden hash van IP + browser: telt unieke bezoekers per dag zonder
   cookies en zonder dat het IP-adres wordt opgeslagen. */
async function bezoekerHash(request: Request, host: string): Promise<string> {
  const ip = request.headers.get('cf-connecting-ip') ?? ''
  const ua = request.headers.get('user-agent') ?? ''
  const dag = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Amsterdam' })
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${host}|${dag}|${ip}|${ua}`))
  return [...new Uint8Array(digest).slice(0, 8)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function schrijf(request: Request, site: string, url: URL, soort: Soort, verwijzer: string): Promise<void> {
  const ds = dataset()
  if (!ds) return
  const host = new URL(request.url).hostname.replace(/^www\./, '').toLowerCase()
  const land = (request as Request & { cf?: { country?: string } }).cf?.country ?? ''
  const verwijzerHostnaam = verwijzerHost(verwijzer)
  const { bron, medium } = soort === 'spa' ? { bron: 'intern', medium: 'intern' } : classificeer(url, verwijzerHostnaam, host)
  const p = url.searchParams
  ds.writeDataPoint({
    indexes: [site],
    blobs: [
      knip(normaliseerPad(url.pathname), 200),
      host,
      land,
      knip(verwijzerHostnaam, 100),
      knip(bron, 100),
      knip(medium, 50),
      knip(p.get('utm_campaign') ?? '', 100),
      apparaat(request),
      soort,
      await bezoekerHash(request, host),
      knip(p.get('utm_term') ?? '', 100),
    ],
    doubles: [1],
  })
}

/* Roep aan ná het afhandelen: telt alleen geslaagde HTML-pagina's, zodat
   redirects (www, trailing slash) en 404's niet dubbel of onterecht tellen. */
export function telWeergave(request: Request, antwoord: Response, site: string): void {
  try {
    const url = new URL(request.url)
    if (!isPaginaVerzoek(request, url) || isBot(request)) return
    if (antwoord.status !== 200 || !(antwoord.headers.get('content-type') ?? '').includes('text/html')) return
    waitUntil(schrijf(request, site, url, 'pagina', request.headers.get('referer') ?? ''))
  } catch {
    /* de meting mag nooit een pagina breken */
  }
}

/* Beacon vanuit de browser voor navigaties binnen de site (zie lib/bezoek.ts). */
export function isBeacon(request: Request, url: URL): boolean {
  return request.method === 'POST' && url.pathname.replace(/\/+$/, '') === '/api/bezoek'
}

export async function verwerkBeacon(request: Request, site: string): Promise<Response> {
  const klaar = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
  try {
    const herkomst = request.headers.get('sec-fetch-site')
    if ((herkomst && herkomst !== 'same-origin') || isBot(request)) return klaar()
    const body = (await request.json()) as { pad?: unknown }
    const pad = typeof body.pad === 'string' ? body.pad : ''
    if (!pad.startsWith('/') || pad.startsWith('//') || pad.length > 500) return klaar()
    waitUntil(schrijf(request, site, new URL(pad, request.url), 'spa', ''))
  } catch {
    /* ongeldige beacon: negeren */
  }
  return klaar()
}
