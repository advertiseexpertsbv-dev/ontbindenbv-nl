// Vergelijkt alle URL's van de oude site (ref/seo/seo.json) met de nieuwe site: status, titel, canonical en het aantal h1's.
// Gebruik: node scripts/parity.mjs <basisurl>   (bv. http://localhost:3000)
import { readFile } from 'node:fs/promises'
const base = process.argv[2] ?? 'http://localhost:3000'
const oud = JSON.parse(await readFile('ref/seo/seo.json', 'utf8'))
const urls = Object.keys(oud)
// Bewuste redirects (content/redirects.ts en src/server.ts)
const verwacht = { '/sample-page/': 301, '/category/uncategorized/': 301 }
const SUFFIX = / - BV ontbinden\?$/
const ontsnap = (t) => t.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
let fout = 0
const res = []
// In porties van 8, zodat de dev-server niet overbelast raakt
for (let i = 0; i < urls.length; i += 8) {
  res.push(
    ...(await Promise.all(
      urls.slice(i, i + 8).map(async (u) => {
        const pad = new URL(u).pathname
        const r = await fetch(base + pad, { redirect: 'manual' })
        const html = r.status === 200 ? await r.text() : ''
        const titel = ontsnap(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '')
        const canon = html.match(/rel="canonical" href="([^"]*)"/)?.[1] ?? ''
        const h1 = (html.match(/<h1[\s>]/g) ?? []).length
        return { pad, status: r.status, titel, canon, h1, oud: oud[u].title ?? '' }
      }),
    )),
  )
}
for (const r of res) {
  const problemen = []
  if ((verwacht[r.pad] ?? 200) !== r.status) problemen.push(`status ${r.status}`)
  if (r.status === 200) {
    if (r.canon !== `https://ontbindenbv.nl${r.pad}`) problemen.push(`canonical ${r.canon || '(geen)'}`)
    if (r.h1 !== 1) problemen.push(`h1-aantal ${r.h1}`)
    // Gelijk, of (bij bewust unieke titels, zoals de kennisbankpagina's) beginnend met de oude titel zonder suffix
    if (r.titel !== r.oud && !r.titel.startsWith(r.oud.replace(SUFFIX, ''))) problemen.push(`titel: "${r.titel}" ≠ oud "${r.oud}"`)
  }
  if (problemen.length) {
    fout++
    console.log(r.pad, '→', problemen.join(' | '))
  }
}
console.log(`${res.length} URL's gecontroleerd, ${fout} met afwijking`)
process.exit(fout ? 1 : 0)
