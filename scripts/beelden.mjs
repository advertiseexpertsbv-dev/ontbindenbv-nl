// Zet de originele beelden van de oude site (ref/images) om naar WebP in public/images.
// Logo's en favicon blijven PNG. Gebruik: node scripts/beelden.mjs
// Draai daarna node scripts/beelden-varianten.mjs: dat maakt de kleinere srcset-varianten (<naam>-<breedte>w.webp) en de manifesten.
import sharp from 'sharp'
import { readdir, writeFile } from 'node:fs/promises'

const bron = 'ref/images'
const bestanden = (await readdir(bron)).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
const kaart = {}
const naamVan = (f) => f.replace(/^(\d{4})_(\d{2})_/, '$1-$2-').replace(/\.[a-z]+$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
for (const f of bestanden) {
  const n = naamVan(f)
  const logo = /logo|favi/i.test(f)
  const uit = logo ? `brand/${n}.png` : `blog/${n}.webp`
  const img = sharp(`${bron}/${f}`)
  const meta = await img.metadata()
  const max = logo ? 900 : 1600
  const pipe = img.resize({ width: Math.min(meta.width ?? max, max), withoutEnlargement: true })
  await (logo ? pipe.png({ compressionLevel: 9 }) : pipe.webp({ quality: 78 })).toFile(`public/images/${uit}`)
  kaart[f.replace(/_/g, '/').replace(/^(\d{4}\/\d{2})\//, '$1/')] = `/images/${uit}`
  kaart[f] = `/images/${uit}`
}
await writeFile('ref/beeldkaart.json', JSON.stringify(kaart, null, 1))
console.log(bestanden.length, 'beelden')
