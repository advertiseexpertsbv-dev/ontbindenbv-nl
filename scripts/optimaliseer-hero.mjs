// Zelfde pixels en uitsnedes als de bestaande WebP-varianten; WebP blijft fallback.
import sharp from 'sharp'
import { stat } from 'node:fs/promises'
for (const name of ['hero', 'hero-1200w', 'hero-1440w']) {
  const input = `public/images/site/${name}.webp`
  const output = `public/images/site/${name}.avif`
  await sharp(input).avif({ quality: 60, effort: 6 }).toFile(output)
  console.log(name, (await stat(input)).size, '→', (await stat(output)).size)
}
