// Test de formulieren lokaal (dev-server). Testdata: naam "Test", geen echte gegevens.
// Gebruik: node scripts/test-forms.mjs [basisurl]
import { chromium } from 'playwright'
const base = process.argv[2] ?? 'http://localhost:3004'
const b = await chromium.launch()
const fouten = []
async function vul(pad, opties = {}) {
  const p = await b.newPage()
  p.on('pageerror', (e) => fouten.push(`${pad}: ${e.message}`))
  await p.goto(base + pad, { waitUntil: 'networkidle' })
  const form = p.locator('form').first()
  await form.locator('input[name=naam]').fill('Test')
  await form.locator('input[name=email]').fill('test@example.com')
  await form.locator('input[name=telefoon]').fill('0612345678')
  await form.locator('textarea[name=bericht]').fill('Testaanvraag, mag verwijderd worden')
  // Gewone radioknoppen: zonder force, want de cookiebanner kan de eerste radio op een laag venster afdekken
  if (opties.moment) await form.locator('input[name=moment]').first().check()
  await form.locator('button[type=submit]').click()
  await p.waitForURL('**/bedankt/', { timeout: 15000 })
  await p.waitForTimeout(800)
  const conv = await p.evaluate(() => (window.dataLayer || []).filter((e) => e.event === 'generate_lead').length)
  console.log('OK', pad, '→', p.url().replace(base, ''), 'generate_lead events:', conv)
  await p.close()
}
await vul('/')
await vul('/contact/')
await vul('/gratis-intakegesprek/', { moment: true })
await vul('/dienst/hulp-bij-loonbeslag/')

// intake
const p = await b.newPage()
await p.goto(base + '/intake-nieuwe-klant/', { waitUntil: 'networkidle' })
await p.getByText('BV', { exact: true }).click()
await p.getByText('Belastingschuld + stoppen (turbo-liquidatie)').click()
await p.getByText('€ 5.000 - € 100.000').click()
await p.locator('textarea').last().fill('Test intake, mag verwijderd worden')
console.log('BV-opties zichtbaar:', await p.getByText('Stoppen onderneming / turbo-liquidatie').count())
await p.getByRole('button', { name: 'Versturen' }).click()
await p.getByText('Intake verstuurd').waitFor({ timeout: 10000 })
console.log('OK intake')
await b.close()
if (fouten.length) { console.log('JS-fouten:', fouten); process.exit(1) }
