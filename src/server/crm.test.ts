/*
 * Tests voor het doorsturen naar BBase (src/server/crm.ts), met een nagebootste fetch en een echte SQLite als D1.
 * Er gaat niets naar buiten. Draaien: npx -y -p node@22 -p tsx tsx --test src/server/crm.test.ts
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { crmBody, crmPoging, verwerkCrmBericht, CRM_MAX_POGINGEN, type CrmLead } from './crm'

/** Minimale D1-nabootsing op node:sqlite: prepare().bind().first()/run() */
function nepD1() {
  const db = new DatabaseSync(':memory:')
  for (const f of ['0001_leads.sql', '0003_leads_landingspagina.sql', '0004_leads_crm_status.sql']) {
    db.exec(readFileSync(new URL(`../../migrations/${f}`, import.meta.url), 'utf8'))
  }
  const d1 = {
    prepare(sql: string) {
      let args: unknown[] = []
      const st = {
        bind(...a: unknown[]) {
          args = a
          return st
        },
        async first<T>() {
          return (db.prepare(sql).get(...(args as never[])) as T) ?? null
        },
        async run() {
          const r = db.prepare(sql).run(...(args as never[]))
          return { meta: { changes: Number(r.changes) } }
        },
      }
      return st
    },
  }
  return { db, d1: d1 as unknown as D1Database }
}

function nieuweLead(db: DatabaseSync, formulier = 'Contact', ouderdom = '0 hours'): number {
  const r = db
    .prepare(
      `INSERT INTO leads (formulier, naam, email, telefoon, bericht, pagina_url, gegevens, created_at)
       VALUES (?, 'Test Persoon', 'test@example.invalid', '0600000000', 'Testaanvraag', '/contact/', ?, datetime('now', ?)) RETURNING id`,
    )
    .get(formulier, JSON.stringify({ 'Gewenst contactmoment': 'Ochtend' }), `-${ouderdom}`) as { id: number }
  return r.id
}

const status = (db: DatabaseSync, id: number) => (db.prepare('SELECT crm_status FROM leads WHERE id = ?').get(id) as { crm_status: string }).crm_status

function logger() {
  const regels: string[] = []
  return { regels, log: (r: string) => regels.push(r), error: (r: string) => regels.push(r) }
}

const URL_ = 'https://crm.mock.invalid/hook?secret=GEHEIM123'
const antwoord = (status: number, body = '{"ok":true,"action":"lead_created"}') => async () => new Response(body, { status })
/** fetch die pas reageert na `ms`, en net als de echte fetch afbreekt op het signal */
const traag =
  (ms: number, status = 200) =>
  (_url: string, init: RequestInit) =>
    new Promise<Response>((resolve, reject) => {
      const t = setTimeout(() => resolve(new Response('{"action":"lead_created"}', { status })), ms)
      init.signal?.addEventListener('abort', () => {
        clearTimeout(t)
        reject(init.signal?.reason)
      })
    })

test('payload is gelijk aan de oude Gravity Forms-webhook per formulier', () => {
  const lead: CrmLead = {
    formulier: 'Gratis intakegesprek',
    naam: 'A',
    email: 'a@b.nl',
    telefoon: '0612345678',
    bericht: '',
    pagina_url: '/gratis-intakegesprek/',
    gegevens: '{"Gewenst contactmoment":"Middag"}',
    created_at: '2026-11-04 09:00:00',
  }
  assert.deepEqual(crmBody(lead, 5), {
    name: 'A',
    email: 'a@b.nl',
    phone: '0612345678',
    message: '',
    intake_link: 'https://belastingbemiddelaar.nl/intake-nieuwe-klant/?klant=a%40b.nl',
    submitted_at: '2026-11-04 09:00:00',
    source_url: 'https://ontbindenbv.nl/gratis-intakegesprek/',
    preferred_time: 'Middag',
    submission_id: '1000005',
    form_title: 'Intake gesprek',
  })
  assert.equal(crmBody({ ...lead, formulier: 'Contact' }, 5).form_title, 'Contact')
  assert.equal(crmBody({ ...lead, formulier: 'Contact' }, 5).submission_id, '1000005')
  const hero = crmBody({ ...lead, formulier: 'Hero', pagina_url: '' }, 5)
  assert.equal(hero.form_name, 'Banner Contact')
  assert.equal(hero.submission_id, undefined)
  assert.equal(hero.source_url, 'https://ontbindenbv.nl/')
})

test('succes: ack, status ok, log zonder persoonsgegevens of secret', async () => {
  const { db, d1 } = nepD1()
  const id = nieuweLead(db)
  const l = logger()
  const r = await verwerkCrmBericht({ id }, 1, { db: d1, url: URL_, fetcher: antwoord(200), logger: l })
  assert.deepEqual(r, { actie: 'ack' })
  assert.equal(status(db, id), 'ok 200 lead_created')
  assert.match(l.regels.join('\n'), new RegExp(`\\[crm\\] lead ${id} poging 1/${CRM_MAX_POGINGEN}: doorgestuurd HTTP 200 in \\d+ ms action=lead_created`))
  for (const geheim of ['Test Persoon', 'test@example', '0600000000', 'GEHEIM123', 'crm.mock']) assert.ok(!l.regels.join('\n').includes(geheim), geheim)
})

test('traag maar binnen 30 s (12 s, zoals BBase bij een nieuwe lead): gelukt', async () => {
  const { db, d1 } = nepD1()
  const id = nieuweLead(db)
  const r = await verwerkCrmBericht({ id }, 1, { db: d1, url: URL_, fetcher: traag(1200), timeoutMs: 3000, logger: logger() })
  assert.deepEqual(r, { actie: 'ack' })
  assert.match(status(db, id), /^ok 200/)
})

test('timeout: GEEN herhaling (BBase kan de lead al hebben aangemaakt)', async () => {
  const { db, d1 } = nepD1()
  const id = nieuweLead(db)
  const l = logger()
  const r = await verwerkCrmBericht({ id }, 1, { db: d1, url: URL_, fetcher: traag(2000), timeoutMs: 200, logger: l })
  assert.deepEqual(r, { actie: 'ack' })
  assert.match(status(db, id), /^timeout/)
  assert.match(l.regels[0], /NIET doorgestuurd \(timeout\).*niet opnieuw/)
})

test('HTTP 503: herhaling met oplopende wachttijd, na de laatste poging stoppen', async () => {
  const { db, d1 } = nepD1()
  const id = nieuweLead(db)
  const vertragingen: number[] = []
  for (let p = 1; p <= CRM_MAX_POGINGEN; p++) {
    const r = await verwerkCrmBericht({ id }, p, { db: d1, url: URL_, fetcher: antwoord(503, 'busy'), logger: logger() })
    if (r.actie === 'retry') vertragingen.push(r.delaySeconds)
    else assert.equal(p, CRM_MAX_POGINGEN)
  }
  assert.deepEqual(vertragingen, [60, 300, 900])
  assert.match(status(db, id), /^fout http_503 poging 4/)
})

test('HTTP 503 en daarna succes', async () => {
  const { db, d1 } = nepD1()
  const id = nieuweLead(db)
  assert.equal((await verwerkCrmBericht({ id }, 1, { db: d1, url: URL_, fetcher: antwoord(502), logger: logger() })).actie, 'retry')
  assert.match(status(db, id), /^opnieuw 1 http_502/)
  assert.deepEqual(await verwerkCrmBericht({ id }, 2, { db: d1, url: URL_, fetcher: antwoord(200), logger: logger() }), { actie: 'ack' })
  assert.match(status(db, id), /^ok 200/)
})

test('HTTP 500 / 504 / 4xx: geen herhaling', async () => {
  for (const code of [500, 504, 400, 401]) {
    const { db, d1 } = nepD1()
    const id = nieuweLead(db)
    assert.deepEqual(await verwerkCrmBericht({ id }, 1, { db: d1, url: URL_, fetcher: antwoord(code), logger: logger() }), { actie: 'ack' }, String(code))
    assert.match(status(db, id), new RegExp(`^fout http_${code}`))
  }
})

test('snelle verbindingsfout: herhaling; trage verbindingsfout: niet', async () => {
  const snel = await crmPoging(URL_, {}, 1000, async () => {
    throw new TypeError('Network connection lost')
  })
  assert.equal(snel.soort, 'opnieuw')
  let t = 0
  const traagFout = await crmPoging(
    URL_,
    {},
    30000,
    async () => {
      t = 10_000
      throw new TypeError('Network connection lost')
    },
    () => t,
  )
  assert.equal(traagFout.soort, 'fout')
  assert.equal(traagFout.reden, 'verbinding_traag')
})

test('dubbel afgeleverd bericht of lead met eindstatus: niet nog eens versturen', async () => {
  const { db, d1 } = nepD1()
  const id = nieuweLead(db)
  let calls = 0
  const f = async () => {
    calls++
    return new Response('{}', { status: 200 })
  }
  await verwerkCrmBericht({ id }, 1, { db: d1, url: URL_, fetcher: f, logger: logger() })
  const l = logger()
  assert.deepEqual(await verwerkCrmBericht({ id }, 1, { db: d1, url: URL_, fetcher: f, logger: l }), { actie: 'ack' })
  assert.equal(calls, 1)
  assert.match(l.regels[0], /al verwerkt \(status ok\)/)
})

test('geen backfill: bestaande leads (migratie) en leads ouder dan 24 uur worden nooit verstuurd', async () => {
  const { db, d1 } = nepD1()
  // Lead van vóór de migratie: krijgt 'voor_wachtrij'
  const db2 = new DatabaseSync(':memory:')
  db2.exec(readFileSync(new URL('../../migrations/0001_leads.sql', import.meta.url), 'utf8'))
  db2.exec(`INSERT INTO leads (formulier, naam) VALUES ('Contact', 'X')`)
  db2.exec(readFileSync(new URL('../../migrations/0004_leads_crm_status.sql', import.meta.url), 'utf8'))
  assert.equal((db2.prepare('SELECT crm_status FROM leads').get() as { crm_status: string }).crm_status, 'voor_wachtrij')

  const oud = nieuweLead(db, 'Contact', '30 hours')
  let calls = 0
  const f = async () => {
    calls++
    return new Response('{}', { status: 200 })
  }
  await verwerkCrmBericht({ id: oud }, 1, { db: d1, url: URL_, fetcher: f, logger: logger() })
  db.exec(`UPDATE leads SET crm_status = 'voor_wachtrij'`)
  const recent = nieuweLead(db)
  db.prepare(`UPDATE leads SET crm_status = 'voor_wachtrij' WHERE id = ?`).run(recent)
  await verwerkCrmBericht({ id: recent }, 1, { db: d1, url: URL_, fetcher: f, logger: logger() })
  await verwerkCrmBericht({ id: 999999 }, 1, { db: d1, url: URL_, fetcher: f, logger: logger() })
  assert.equal(calls, 0)
})

test('eenmalig (terugval via waitUntil): geen herhaling bij 503', async () => {
  const { db, d1 } = nepD1()
  const id = nieuweLead(db)
  const l = logger()
  assert.deepEqual(await verwerkCrmBericht({ id }, 1, { db: d1, url: URL_, fetcher: antwoord(503), logger: l, eenmalig: true }), { actie: 'ack' })
  assert.match(l.regels[0], /poging 1\/1 \(direct\)/)
})
