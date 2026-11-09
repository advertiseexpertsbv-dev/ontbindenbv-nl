// Zet de vaste beelden van de oude site (ref/images) om naar public/images/site en public/images/brand, plus favicons en og.jpg.
// Bron: de originelen die scripts/ref-capture.mjs en de WP-mediabibliotheek leverden (ref/ staat niet in git).
// Gebruik: node scripts/site-beelden.mjs   en daarna   node scripts/beelden-varianten.mjs   (srcset-varianten en manifest)
import sharp from 'sharp'
import { mkdir, rm, readdir } from 'node:fs/promises'

const REF = 'ref/images'
const SITE = 'public/images/site'
const BRAND = 'public/images/brand'
await mkdir(SITE, { recursive: true })
await mkdir(BRAND, { recursive: true })
// Oude beelden (sjabloon) opruimen; alles hieronder wordt opnieuw gemaakt
for (const f of await readdir(SITE)) await rm(`${SITE}/${f}`)
for (const f of await readdir(BRAND)) if (f !== 'btn-arrow.svg') await rm(`${BRAND}/${f}`)

const webp = (img, q = 78) => img.webp({ quality: q, effort: 5, alphaQuality: 100 })

/** Foto's: [doel, bron, maximale breedte] (nooit vergroten) */
const fotos = [
  // Homepage: hero (achtergrond met 30% blauwe laag), Peter naast de intro, het team bij "Geen zorgen"
  ['hero', '2025_11_banner-ontbinde-bv.jpg', 1806],
  ['intro', '2025_08_RUMFUNK-4358.jpg', 1600],
  ['team', '2025_08_RUMFUNK-4349-1.jpg', 1600],
  // Ronde foto in het contactblok (200px, op een telefoon een banner over de volle breedte)
  ['contact', '2025_08_RUMFUNK-4384.jpg', 1200],
  // Teamfoto op /contact/ en /gratis-intakegesprek/ (RUMFUNK-4351-1 is hetzelfde beeld)
  ['team-contact', '2025_08_RUMFUNK-4351.jpg', 1600],
]
for (const [doel, bron, max] of fotos) {
  await webp(sharp(`${REF}/${bron}`).rotate().resize({ width: max, withoutEnlargement: true })).toFile(`${SITE}/${doel}.webp`)
}

// Avatar bij "Geplaatst door" in de artikelen: Peter, vierkant (100px voor scherpe weergave op 50px)
await webp(sharp(`${REF}/2025_08_RUMFUNK-4384.jpg`).rotate().extract({ left: 540, top: 0, width: 760, height: 760 }).resize(100, 100), 82).toFile(`${SITE}/auteur.webp`)

// Teamleden op /over-ons/: kaart van 2:3, dus de liggende foto's worden in het midden staand uitgesneden (800x1200)
const leden = [
  ['peter', '2025_08_RUMFUNK-4383.jpg'],
  ['heleen', '2025_08_RUMFUNK-4400.jpg'],
  ['kevin', '2025_08_RUMFUNK-4365.jpg'],
  ['michael', '2025_08_RUMFUNK-4413.jpg'],
  ['daisy', '2025_08_RUMFUNK-4394.jpg'],
  ['bas', '2025_08_WhatsApp-Image-2568-08-27-at-11.29.09.jpeg'],
]
for (const [doel, bron] of leden) {
  await webp(sharp(`${REF}/${bron}`).rotate().resize({ width: 800, height: 1200, fit: 'cover', position: 'centre' })).toFile(`${SITE}/${doel}.webp`)
}

// Vrijstaande foto (transparant) die boven de CTA-band uitsteekt: 375px breed getoond, 750px voor 2x-schermen
await webp(sharp(`${REF}/2025_08_ontbindenbv-cta-1.png`).resize({ width: 750 }), 82).toFile(`${SITE}/cta.webp`)
// De grote letters "BV" rechtsonder in de blauwe titelbalk (oud: 600px breed)
await sharp(`${REF}/2025_09_ontbindenbv-banner-overlay.png`).resize({ width: 1068 }).webp({ lossless: true }).toFile(`${SITE}/banner-bv.webp`)

// Logo's: header 212x55 en footer 290x75 getoond; 2x-varianten als WebP, PNG voor schema.org en e-mail
await webp(sharp(`${REF}/2025_08_ontbindenbvp-logo.png`).resize({ width: 424 }), 90).toFile(`${BRAND}/logo.webp`)
await sharp(`${REF}/2025_08_ontbindenbvp-logo.png`).resize({ width: 600 }).png({ compressionLevel: 9 }).toFile(`${BRAND}/logo.png`)
await webp(sharp(`${REF}/2025_08_ontbindenbvp-logo-white.png`).resize({ width: 580 }), 90).toFile(`${BRAND}/logo-wit.webp`)

// Favicons uit het oude favicon (512x512)
const favi = `${REF}/2025_08_ontbindenbv-favi.png`
for (const b of [32, 192]) await sharp(favi).resize(b, b).png({ compressionLevel: 9 }).toFile(`${BRAND}/favicon-${b}.png`)
// iOS maakt transparantie zwart: witte achtergrond
await sharp(favi).resize(180, 180).flatten({ background: '#ffffff' }).png({ compressionLevel: 9 }).toFile('public/apple-touch-icon.png')
// favicon.ico: PNG van 32px in een ICO-container (één beeld)
const png32 = await sharp(favi).resize(32, 32).png().toBuffer()
const kop = Buffer.alloc(22)
kop.writeUInt16LE(0, 0)
kop.writeUInt16LE(1, 2)
kop.writeUInt16LE(1, 4)
kop.writeUInt8(32, 6)
kop.writeUInt8(32, 7)
kop.writeUInt8(0, 8)
kop.writeUInt8(0, 9)
kop.writeUInt16LE(1, 10)
kop.writeUInt16LE(32, 12)
kop.writeUInt32LE(png32.length, 14)
kop.writeUInt32LE(22, 18)
const { writeFile } = await import('node:fs/promises')
await writeFile('public/favicon.ico', Buffer.concat([kop, png32]))

// Deelafbeelding (og:image) 1200x630 uit de hero
await sharp(`${REF}/2025_11_banner-ontbinde-bv.jpg`).resize(1200, 630, { fit: 'cover', position: 'left' }).jpeg({ quality: 82, mozjpeg: true }).toFile('public/images/og.jpg')

console.log('klaar:', (await readdir(SITE)).length, 'site-beelden,', (await readdir(BRAND)).length, 'brand-bestanden')
