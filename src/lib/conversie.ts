/* Leadconversie voor GTM / GA4 / Google Ads: alleen `generate_lead` na een geslaagde submit (zie onderaan). */
export type ConversieGegevens = { form_type: string; [sleutel: string]: unknown }

/** Contactgegevens voor Google Ads enhanced conversions (GTM-variabele 'User-Provided Data',
 *  modus Code, leest `user_data` uit het generate_lead-event). Google hasht ze client-side;
 *  de tag respecteert Consent Mode (ad_user_data). Telefoon in E.164. */
export type Contactgegevens = { voornaam?: string; achternaam?: string; telefoon?: string; email?: string }

export function normaliseerTelefoon(t?: string): string {
  const d = (t ?? '').replace(/[^\d+]/g, '')
  if (!d) return ''
  if (d.startsWith('+')) return d
  if (d.startsWith('00')) return `+${d.slice(2)}`
  if (d.startsWith('0')) return `+31${d.slice(1)}`
  return `+31${d}`
}

export function userData(c: Contactgegevens) {
  const u: Record<string, unknown> = {}
  const email = c.email?.trim().toLowerCase()
  const phone = normaliseerTelefoon(c.telefoon)
  if (email) u.email = email
  if (phone) u.phone_number = phone
  const first = c.voornaam?.trim()
  const last = c.achternaam?.trim()
  if (first || last) u.address = { first_name: first ?? '', last_name: last ?? '' }
  return u
}

/* ---- Leadconversie: alleen na een geslaagde serverrespons, nooit bij het laden van /bedankt ----
 * De submit-handler roept `await meldConversie(...)` aan ná `res.ok` en vóór de navigatie naar /bedankt.
 * Het event `generate_lead` (form_type, form_id, user_data) gaat direct de dataLayer in; daarna wachten we
 * tot GTM de tags heeft afgevuurd (eventCallback), maximaal ~1,5 s, zodat de navigatie de tags niet afbreekt.
 * /bedankt is puur UX: een herlaad of direct bezoek telt nooit als conversie. GTM moet triggeren op het
 * Custom Event `generate_lead` (niet op een paginaweergave van /bedankt). */
export type LeadContact = { email?: string; telefoon?: string; naam?: string; voornaam?: string; achternaam?: string }

type LeadW = Window & { dataLayer?: unknown[]; google_tag_manager?: unknown; gtag?: (...a: unknown[]) => void }

const WACHT_MAX_MS = 1500

/** user_data voor Google Ads enhanced conversions: e-mail (lowercase), telefoon in E.164 (+31…), naam. */
export function leadUserData(c: LeadContact = {}): Record<string, unknown> {
  const u: Record<string, unknown> = {}
  const email = (c.email ?? '').trim().toLowerCase()
  const phone = normaliseerTelefoon(c.telefoon ?? '')
  if (email) u.email = email
  if (phone) u.phone_number = phone
  let first = (c.voornaam ?? '').trim()
  let last = (c.achternaam ?? '').trim()
  if (!first && !last && c.naam) {
    const [v, ...r] = c.naam.trim().split(/\s+/)
    first = v ?? ''
    last = r.join(' ')
  }
  if (first || last) u.address = { first_name: first, last_name: last }
  return u
}

function wacht(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

/** Duwt het event en wacht (max ~1,5 s) tot GTM het verwerkt heeft. Lost altijd op, gooit nooit. */
export async function stuurLeadEvent(event: Record<string, unknown>): Promise<void> {
  if (typeof window === 'undefined') return
  const w = window as LeadW
  const start = Date.now()
  try {
    w.dataLayer = w.dataLayer || []
    // GTM is gepland (gtm.js staat in de queue) maar nog niet geladen: kort wachten tot hij er is
    const gepland = w.dataLayer.some((e) => !!e && typeof e === 'object' && (e as { event?: unknown }).event === 'gtm.js')
    while (gepland && !w.google_tag_manager && Date.now() - start < 1000) await wacht(50)
    if (!w.google_tag_manager) {
      // Geen GTM (niet-live host, geblokkeerd of nog niet gestart): event staat in de queue, niet wachten
      w.dataLayer.push(event)
            return
    }
    const rest = Math.max(300, WACHT_MAX_MS - (Date.now() - start))
    await new Promise<void>((klaar) => {
      let gedaan = false
      const once = () => {
        if (!gedaan) {
          gedaan = true
          klaar()
        }
      }
      w.dataLayer!.push({ ...event, eventCallback: once, eventTimeout: Math.max(200, rest - 300) })
      setTimeout(once, rest)
    })
  } catch {
    /* nooit de navigatie blokkeren */
  }
}

/** `generate_lead` na een geslaagde verzending. `gegevens.user_data` mag al klaarstaan; anders uit `contact`. */
export async function meldConversie(gegevens: ConversieGegevens, contact: LeadContact = {}): Promise<void> {
  const user_data = (gegevens.user_data as Record<string, unknown> | undefined) ?? leadUserData(contact)
  const event: Record<string, unknown> = {
    event: 'generate_lead',
    ...gegevens,
    form_id: (gegevens.form_id as string | undefined) ?? gegevens.form_type,
    ...(Object.keys(user_data).length ? { user_data } : {}),
  }
  await stuurLeadEvent(event)
}
