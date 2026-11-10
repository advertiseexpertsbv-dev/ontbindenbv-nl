// Maakt de mobiele uitsnede van de hero: het linkerdeel van public/images/site/hero.webp (480 x 819, zelfde resolutie).
// Op een telefoon is van de hero (object-cover, object-left, ca. 1060px hoog) alleen de linker 240-465 bronpixels zichtbaar;
// de volledige foto van 1806px (ca. 107 kB) is daar grotendeels verspilde download. Hero.tsx gebruikt deze uitsnede
// (ca. 39 kB) tot 599px breed (daar is hooguit 465 bronpixels zichtbaar, gemeten met Playwright), daarboven het origineel.
// Herhaalbaar: node scripts/hero-mobiel.mjs (opnieuw draaien als hero.webp verandert).
import sharp from 'sharp'

const BRON = 'public/images/site/hero.webp'
const DOEL = 'public/images/site/hero-mobiel.webp'
const BREEDTE = 480

const meta = await sharp(BRON).metadata()
const info = await sharp(BRON)
  .extract({ left: 0, top: 0, width: BREEDTE, height: meta.height })
  .webp({ quality: 80, effort: 6 })
  .toFile(DOEL)
console.log(`${DOEL}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} kB`)
