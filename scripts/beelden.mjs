// Zet de beelden die de artikelen gebruiken (uitgelichte afbeelding en afbeeldingen in de tekst) van de oude site (ref/images)
// om naar WebP in public/images/blog, en schrijft ref/beeldkaart.json (WordPress-pad -> lokaal pad) voor scripts/bouw-blog.py.
// De vaste beelden van de pagina's maakt scripts/site-beelden.mjs.
// Gebruik: node scripts/beelden.mjs   en daarna   node scripts/beelden-varianten.mjs   (srcset-varianten en manifesten)
import sharp from 'sharp'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'

const bron = 'ref/images'
const DOEL = 'public/images/blog'
const posts = JSON.parse(await readFile('ref/api/posts-1.json', 'utf8'))
const media = [...JSON.parse(await readFile('ref/api/media-1.json', 'utf8')), ...JSON.parse(await readFile('ref/api/media-2.json', 'utf8'))]
const bestanden = new Set(await readdir(bron))

// WordPress-URL -> bestandsnaam in ref/images ('2025/08/x-1024x683.jpg' -> '2025_08_x.jpg'; grote originelen heten '-scaled')
function bestandVan(url) {
  const k = url.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '').split('/uploads/').pop().replace(/\//g, '_')
  if (bestanden.has(k)) return k
  const scaled = k.replace(/(\.[a-z]+)$/i, '-scaled$1')
  return bestanden.has(scaled) ? scaled : null
}

const gebruikt = new Map() // url-sleutel -> bestand
for (const p of posts) {
  const urls = [...p.content.rendered.matchAll(/<img\b[^>]*?(?:data-src|\ssrc)="(https?:\/\/[^"]+\/uploads\/[^"]+)"/g)].map((m) => m[1])
  const f = media.find((m) => m.id === p.featured_media)
  if (f) urls.push(f.source_url)
  for (const u of urls) {
    const b = bestandVan(u)
    if (b) gebruikt.set(b, b)
    else console.warn('ontbreekt:', u)
  }
}

await mkdir(DOEL, { recursive: true })
for (const f of await readdir(DOEL)) await rm(`${DOEL}/${f}`)
const naamVan = (f) =>
  f
    .replace(/^(\d{4})_(\d{2})_/, '$1-$2-')
    .replace(/\.[a-z]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
const kaart = {}
for (const f of gebruikt.keys()) {
  const uit = `${naamVan(f)}.webp`
  await sharp(`${bron}/${f}`).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(`${DOEL}/${uit}`)
  kaart[f] = `/images/blog/${uit}`
}
await writeFile('ref/beeldkaart.json', JSON.stringify(kaart, null, 1))
console.log(Object.keys(kaart).length, 'artikelbeelden')
