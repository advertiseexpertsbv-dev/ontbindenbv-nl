// Screenshots van de nieuwe site (desktop + mobiel). Gebruik: node scripts/screenshot.mjs [basisurl] pad1 pad2 …
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
const [base = 'http://localhost:3000', ...paden] = process.argv.slice(2)
const lijst = paden.length ? paden : ['/']
await mkdir('ref/nieuw', { recursive: true })
const b = await chromium.launch()
for (const pad of lijst) {
  for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const p = await b.newPage({ viewport: vp })
    await p.goto(base + pad, { waitUntil: 'networkidle' })
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)) } window.scrollTo(0, 0) })
    await p.waitForTimeout(500)
    await p.addStyleTag({ content: '.js [data-reveal]{opacity:1!important;transform:none!important}' })
    await p.evaluate(() => document.querySelectorAll('[role=region][aria-label=Cookiemelding]').forEach((e) => e.remove()))
    const n = pad === '/' ? 'home' : pad.replace(/^\/|\/$/g, '').replace(/\//g, '--')
    await p.screenshot({ path: `ref/nieuw/${n}-${label}.png`, fullPage: true })
    await p.close()
    console.log('ok', label, pad)
  }
}
await b.close()
