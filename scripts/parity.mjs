// Vergelijkt alle URL's van de oude site (ref/seo/seo.json + sitemap) met de nieuwe site: status, titel, canonical, H1.
// Gebruik: node scripts/parity.mjs <basisurl>
import { readFile } from 'node:fs/promises'
const base = process.argv[2] ?? 'http://localhost:3004'
const oud = JSON.parse(await readFile('ref/seo/seo.json', 'utf8'))
const urls = Object.keys(oud)
const verwacht = { '/bizzyphone/': 301, '/bedankt/': 200 }
let fout = 0
const res = await Promise.all(
  urls.map(async (u) => {
    const pad = new URL(u).pathname
    const r = await fetch(base + pad, { redirect: 'manual' })
    const html = r.status === 200 ? await r.text() : ''
    const titel = html.match(/<title>([^<]*)<\/title>/)?.[1]?.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'") ?? ''
    const canon = html.match(/rel="canonical" href="([^"]*)"/)?.[1] ?? ''
    const h1 = (html.match(/<h1[^>]*>/g) ?? []).length
    return { pad, status: r.status, titel, canon, h1, oud: oud[u].title }
  }),
)
for (const r of res) {
  const problemen = []
  if ((verwacht[r.pad] ?? 200) !== r.status) problemen.push(`status ${r.status}`)
  if (r.status === 200) {
    if (r.canon && r.canon !== `https://belastingbemiddelaar.nl${r.pad}`) problemen.push(`canonical ${r.canon}`)
    if (r.h1 !== 1) problemen.push(`h1-aantal ${r.h1}`)
    const verschil = r.titel !== r.oud && !r.titel.startsWith(r.oud.replace(/ - Belasting ?Bemiddelaar$/, ''))
    if (verschil) problemen.push(`titel: "${r.titel}" ≠ oud "${r.oud}"`)
  }
  if (problemen.length) { fout++; console.log(r.pad, '→', problemen.join(' | ')) }
}
console.log(`${res.length} URL's gecontroleerd, ${fout} met afwijking`)
