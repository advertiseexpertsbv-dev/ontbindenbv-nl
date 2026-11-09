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
