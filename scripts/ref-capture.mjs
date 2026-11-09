// Referentie van de oude WordPress-site vastleggen: screenshots (desktop + mobiel), HTML en SEO per pagina.
// Gebruik: node scripts/ref-capture.mjs [basisurl]   (output in ref/, gitignored)
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.argv[2] ?? 'https://belastingbemiddelaar.nl'
const dienstSlugs = process.env.DIENSTEN ? process.env.DIENSTEN.split(',') : []
const paden = [
  '/', '/over-ons/', '/onze-werkwijze/', '/gratis-intakegesprek/', '/intake-nieuwe-klant/', '/contact/',
  '/bedankt/', '/kennisbank/', '/privacyverklaring-eu/', '/cookiebeleid-eu/', '/bizzi/', '/bizzyphone/',
  '/belastingschuld-oplossen/', '/betalingsregeling-belastingdienst/',
  ...dienstSlugs.map((s) => `/dienst/${s}/`),
]
const naam = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '--'))

await mkdir('ref/screens', { recursive: true })
await mkdir('ref/html', { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
})
const seo = {}
for (const pad of paden) {
  for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await ctx.newPage()
    await page.setViewportSize(vp)
    try {
      await page.goto(base + pad, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(() => {
        document.querySelectorAll('.cmplz-cookiebanner, #cmplz-cookiebanner-container, .cmplz-blocked-content-notice').forEach((el) => el.remove())
      })
      await page.evaluate(async () => {
        const delay = (ms) => new Promise((r) => setTimeout(r, ms))
        const step = window.innerHeight * 0.7
        for (let y = 0; y <= document.body.scrollHeight; y += step) { window.scrollTo(0, y); await delay(120) }
        window.scrollTo(0, 0); await delay(300)
      })
      await page.screenshot({ path: `ref/screens/${naam(pad)}-${label}.png`, fullPage: true })
      if (label === 'desktop') {
        await writeFile(`ref/html/${naam(pad)}.html`, await page.content())
        seo[pad] = {
          title: await page.title(),
          description: await page.locator('meta[name="description"]').first().getAttribute('content').catch(() => null),
          h1: await page.locator('h1').first().innerText().catch(() => null),
        }
      }
      console.log('ok', label, pad)
    } catch (e) { console.log('FOUT', label, pad, String(e).slice(0, 100)) }
    await page.close()
  }
}
await writeFile('ref/seo.json', JSON.stringify(seo, null, 2))
await browser.close()
