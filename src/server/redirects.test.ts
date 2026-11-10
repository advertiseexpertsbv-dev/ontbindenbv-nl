/*
 * 301-redirects van oude WordPress-paden (src/server.ts + src/content/redirects.ts).
 * cloudflare:workers bestaat alleen in de worker; deze paden keren terug vóór een binding.
 * Draaien: npx -y -p node@22 -p tsx tsx --test src/server/redirects.test.ts
 */
import { registerHooks } from 'node:module'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const CF_MOCK =
  'data:text/javascript,' +
  encodeURIComponent('export const env = {}\nexport const waitUntil = () => {}\n')

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'cloudflare:workers') return { url: CF_MOCK, shortCircuit: true }
    return nextResolve(specifier, context)
  },
})

const { default: worker } = await import('../server.ts')

async function locatie(pad: string, host = 'https://ontbindenbv.nl') {
  const res = await worker.fetch(new Request(host + pad))
  return { status: res.status, location: res.headers.get('location') }
}

test('typo /gratis-intakesprek gaat permanent naar de homepage, zonder querystring', async () => {
  for (const pad of [
    '/gratis-intakesprek',
    '/gratis-intakesprek/',
    '/gratis-intakesprek/?utm_source=oud&gclid=abc',
  ]) {
    const r = await locatie(pad)
    assert.equal(r.status, 301, pad)
    assert.equal(r.location, 'https://ontbindenbv.nl/', pad)
  }
  // Vaste redirects wijzen naar site.url, ook als het verzoek op de test-host binnenkomt
  const dev = await locatie('/gratis-intakesprek/', 'https://ontbindenbv-nl.advertisexperts.workers.dev')
  assert.equal(dev.status, 301)
  assert.equal(dev.location, 'https://ontbindenbv.nl/')
})

test('juiste pagina /gratis-intakegesprek/ wordt niet naar de homepage gestuurd', async () => {
  // Zonder slash alleen de bestaande trailing-slash-redirect (query blijft), niet naar /
  const kaal = await locatie('/gratis-intakegesprek')
  assert.equal(kaal.status, 301)
  assert.equal(kaal.location, 'https://ontbindenbv.nl/gratis-intakegesprek/')

  const metQuery = await locatie('/gratis-intakegesprek?utm=x')
  assert.equal(metQuery.status, 301)
  assert.equal(metQuery.location, 'https://ontbindenbv.nl/gratis-intakegesprek/?utm=x')
})

test('bestaande vaste redirects blijven gelijk en laten de querystring vallen', async () => {
  const sample = await locatie('/sample-page/?x=1')
  assert.equal(sample.status, 301)
  assert.equal(sample.location, 'https://ontbindenbv.nl/')

  const cat = await locatie('/category/uncategorized/?x=1')
  assert.equal(cat.status, 301)
  assert.equal(cat.location, 'https://ontbindenbv.nl/kennisbank/')
})

test('oude WordPress-kernsitemaps gaan permanent naar /sitemap.xml, zonder querystring', async () => {
  const paden = [
    '/wp-sitemap.xml',
    '/wp-sitemap-posts-post-1.xml',
    '/wp-sitemap-posts-page-1.xml',
    '/wp-sitemap-pages-page-1.xml',
    '/wp-sitemap-posts-dienst-1.xml',
    '/wp-sitemap-taxonomies-category-1.xml',
    '/wp-sitemap-users-1.xml',
    // Zelfde patroon, niet stuk voor stuk in de map: latere pagina en een andere taxonomie
    '/wp-sitemap-posts-post-2.xml',
    '/wp-sitemap-taxonomies-post_tag-1.xml',
  ]
  for (const pad of paden) {
    for (const variant of [pad, `${pad}/`, `${pad}/?utm=oud`]) {
      const r = await locatie(variant)
      assert.equal(r.status, 301, variant)
      assert.equal(r.location, 'https://ontbindenbv.nl/sitemap.xml', variant)
    }
  }
  const dev = await locatie('/wp-sitemap.xml/', 'https://ontbindenbv-nl.advertisexperts.workers.dev')
  assert.equal(dev.status, 301)
  assert.equal(dev.location, 'https://ontbindenbv.nl/sitemap.xml')
})

test('sitemap_index.xml blijft de sitemap zelf; stylesheet en overige /wp- paden blijven 404', async () => {
  const index = await worker.fetch(new Request('https://ontbindenbv.nl/sitemap_index.xml'))
  assert.equal(index.status, 200)
  assert.equal(index.headers.get('location'), null)
  assert.match(index.headers.get('content-type') ?? '', /xml/)
  assert.match(await index.text(), /<urlset/)

  const bestaand = await locatie('/post-sitemap.xml')
  assert.equal(bestaand.status, 301)
  assert.equal(bestaand.location, 'https://ontbindenbv.nl/sitemap.xml')

  for (const pad of ['/wp-sitemap.xsl', '/wp-login.php']) {
    const r = await locatie(pad)
    assert.equal(r.status, 404, pad)
    assert.equal(r.location, null, pad)
  }
})

test('verwijderde pagina’s (stichting, liquidatiegids, BV met activa) gaan permanent naar een passende pagina', async () => {
  for (const [pad, doel] of [
    ['/stichting-opheffen-eenvoudig-zonder-notaris/', 'https://ontbindenbv.nl/'],
    ['/stichting-liquideren-kvk-vereffening-2025/', 'https://ontbindenbv.nl/'],
    ['/stichting-opheffen-met-schulden', 'https://ontbindenbv.nl/'],
    ['/ontbindenbv-nl-bv-liquideren/', 'https://ontbindenbv.nl/dienst/lege-bv-turbo-liquidatie/'],
    ['/wat-kost-het-ontbinden-van-een-bv-2025-vanaf-e289/', 'https://ontbindenbv.nl/wat-kost-het-ontbinden-van-een-bv-2025/'],
    ['/dienst/bv-met-activa/', 'https://ontbindenbv.nl/dienst/lege-bv-turbo-liquidatie/'],
  ]) {
    const r = await locatie(pad)
    assert.equal(r.status, 301, pad)
    assert.equal(r.location, doel, pad)
  }
})
