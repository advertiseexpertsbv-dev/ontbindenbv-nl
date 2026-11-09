// Maakt kleinere varianten (<naam>-<breedte>w.webp) naast de originelen in public/images, voor srcset.
// De originelen blijven ongewijzigd (zelfde uitsnede, alleen kleiner; nooit vergroten) en schrijft twee manifesten:
//   src/content/beeldvarianten.json       site/ en brand/ (door componenten gelezen via src/lib/beeld.ts)
//   src/content/beeldvarianten-blog.json  blog/ (alleen server-side: kaarten en artikelhtml in src/content/blog.ts en src/server/blog.ts)
// Reproduceerbaar en idempotent: elke run schrijft de varianten opnieuw en ruimt verouderde varianten op.
// Gebruik: node scripts/beelden-varianten.mjs
import sharp from 'sharp'
import { readdir, writeFile, stat, unlink } from 'node:fs/promises'

const ROOT = 'public/images'
const KWALITEIT = 80
/** Een variant blijft alleen bestaan als hij in beeldpunten hooguit 90% van het origineel is en minstens 12% minder bytes kost dan de volgende grotere. */
const MAX_VERHOUDING = 0.9
const MIN_BESPARING = 0.12

/** Blogbeelden (kaarten en artikelen): getoond op 280-730px, dus 480/800/1200 dekt 1x en 2x. */
const BLOG_BREEDTES = [480, 800, 1200]

/** Overige beelden: breedtes afgestemd op wat de pagina's werkelijk nodig hebben (zie `sizes` in src/lib/beeld.ts).
 *  Hero: 1200 en 1440 (op smalle schermen schaalt object-cover het beeld juist op, dus daar blijft het origineel van 1600). */
const SITE_BREEDTES = {
  'site/hero.webp': [1200, 1440],
  'site/page-banner.webp': [1200],
  'site/contact.webp': [240, 480, 800],
  'site/team.webp': [480, 800, 1200],
  'site/intro.webp': [480, 800, 1200],
  'site/peter-schilderij.webp': [480, 800, 1200],
  'site/peter.webp': [300],
  'site/heleen.webp': [480, 640],
  'site/gerard.webp': [480, 640],
  'site/kevin.webp': [480, 640],
  'site/michael.webp': [480, 640],
  'site/bas.webp': [480, 640],
  'brand/2024-06-belasting-bemiddelaar-logo-420.webp': [210],
  'brand/2024-07-belasting-bemiddelaar-logo-white-480.webp': [240],
}

const isVariant = (f) => /-\d+w\.webp$/.test(f)

async function maakVarianten(map, f, breedtes) {
  const pad = `${ROOT}/${map}/${f}`
  const stam = f.replace(/\.webp$/, '')
  const meta = await sharp(pad).metadata()
  const origBytes = (await stat(pad)).size
  const kandidaten = [...new Set(breedtes)].filter((b) => b <= (meta.width ?? 0) * MAX_VERHOUDING).sort((a, b) => a - b)
  const gemaakt = []
  for (const b of kandidaten) {
    const buf = await sharp(pad)
      .resize({ width: b, withoutEnlargement: true })
      .webp({ quality: KWALITEIT, effort: 5, alphaQuality: 100 })
      .toBuffer()
    gemaakt.push({ b, buf })
  }
  // Van groot naar klein: alleen houden wat echt kleiner is dan de volgende grotere
  const behouden = []
  let volgende = origBytes
  for (const v of [...gemaakt].reverse()) {
    if (v.buf.length <= volgende * (1 - MIN_BESPARING)) {
      behouden.unshift(v)
      volgende = v.buf.length
    }
  }
  // Verouderde varianten van dit beeld opruimen
  for (const g of await readdir(`${ROOT}/${map}`)) {
    if (!g.startsWith(`${stam}-`) || !isVariant(g)) continue
    const rest = g.slice(stam.length + 1)
    if (!/^\d+w\.webp$/.test(rest)) continue // andere naam die toevallig met deze stam begint
    if (!behouden.some((v) => v.b === parseInt(rest, 10))) await unlink(`${ROOT}/${map}/${g}`)
  }
  for (const v of behouden) await writeFile(`${ROOT}/${map}/${stam}-${v.b}w.webp`, v.buf)
  return { w: meta.width ?? 0, h: meta.height ?? 0, bytes: origBytes, v: behouden.map((v) => v.b), vBytes: behouden.map((v) => v.buf.length) }
}

const site = {}
const blog = {}
let totaal = { beelden: 0, varianten: 0, bytes: 0 }

for (const map of ['blog', 'site', 'brand']) {
  const bestanden = (await readdir(`${ROOT}/${map}`)).filter((f) => f.endsWith('.webp') && !isVariant(f)).sort()
  for (const f of bestanden) {
    const sleutel = `${map}/${f}`
    const breedtes = map === 'blog' ? BLOG_BREEDTES : SITE_BREEDTES[sleutel]
    if (!breedtes) continue
    const r = await maakVarianten(map, f, breedtes)
    totaal.beelden++
    totaal.varianten += r.v.length
    totaal.bytes += r.vBytes.reduce((a, b) => a + b, 0)
    if (r.v.length) (map === 'blog' ? blog : site)[`/images/${sleutel}`] = { w: r.w, h: r.h, v: r.v }
    if (map !== 'blog') console.log(sleutel.padEnd(58), `${r.w}w ${String(r.bytes).padStart(6)} B`, r.v.map((b, i) => `${b}w=${r.vBytes[i]}`).join('  ') || '(geen)')
  }
}

// Eén regel per beeld, zodat het bestand leesbaar blijft en diffs klein zijn
const schrijf = (naam, data) =>
  writeFile(`src/content/${naam}`, '{\n' + Object.entries(data).map(([k, v]) => ` ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n') + '\n}\n')
await schrijf('beeldvarianten.json', site)
await schrijf('beeldvarianten-blog.json', blog)
console.log(`blog: ${Object.keys(blog).length} beelden met varianten; totaal ${totaal.beelden} bronbeelden, ${totaal.varianten} varianten, ${(totaal.bytes / 1024 / 1024).toFixed(1)} MB`)
