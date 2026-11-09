export type Attributie = {
  first_source: string
  first_medium: string
  last_source: string
  last_medium: string
  utm_source: string
  utm_campaign: string
  utm_term: string
  utm_agid: string
  device: string
  /** Eerste pagina (pad zonder domein) van deze sessie, of van de laatste aanraking van buiten */
  landingspagina: string
}

const FIRST = 'bb-first-touch'
const LAST = 'bb-last-touch'
const UTM = 'bb-utm'
const LANDING = 'bb-landing'

type Touch = { source: string; medium: string }

function leesParams(): Record<string, string> {
  const p = new URLSearchParams(window.location.search)
  const out: Record<string, string> = {}
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_agid', 'device', 'gclid', 'wbraid']) {
    const v = p.get(k)
    if (v) out[k] = v.slice(0, 500)
  }
  return out
}

function classificeer(params: Record<string, string>): Touch | null {
  if (params.utm_source) return { source: params.utm_source, medium: params.utm_medium || 'none' }
  if (params.gclid || params.wbraid) return { source: 'google', medium: 'cpc' }
  let host = ''
  try {
    host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
  } catch {
    host = ''
  }
  if (!host) return { source: 'direct', medium: 'none' }
  if (host === window.location.hostname.replace(/^www\./, '')) return null // eigen site: geen nieuwe touch
  if (/(^|\.)google\./.test(host)) return { source: 'google', medium: 'organic' }
  if (/(^|\.)bing\./.test(host)) return { source: 'bing', medium: 'organic' }
  if (/(^|\.)duckduckgo\./.test(host)) return { source: 'duckduckgo', medium: 'organic' }
  return { source: host, medium: 'referral' }
}

function init() {
  if (typeof window === 'undefined') return
  const params = leesParams()
  if (params.utm_source || params.utm_campaign || params.device) {
    try {
      sessionStorage.setItem(
        UTM,
        JSON.stringify({
          utm_source: params.utm_source ?? '',
          utm_campaign: params.utm_campaign ?? '',
          utm_term: params.utm_term ?? '',
          utm_agid: params.utm_agid ?? '',
          device: params.device ?? '',
        }),
      )
    } catch {
      /* storage niet beschikbaar */
    }
  }
  const touch = classificeer(params)
  // Landingspagina: eerste pagina van deze sessie, opnieuw bij een nieuwe aanraking van buiten (niet bij een klik binnen de site)
  try {
    if (touch || !sessionStorage.getItem(LANDING)) sessionStorage.setItem(LANDING, window.location.pathname.slice(0, 200))
  } catch {
    /* storage niet beschikbaar */
  }
  if (!touch) return
  try {
    if (!localStorage.getItem(FIRST))
      localStorage.setItem(FIRST, JSON.stringify({ ...touch, datum: new Date().toISOString() }))
    localStorage.setItem(LAST, JSON.stringify({ ...touch, datum: new Date().toISOString() }))
  } catch {
    /* storage niet beschikbaar */
  }
}

init()

export function haalAttributie(): Attributie {
  const leeg: Attributie = {
    first_source: '',
    first_medium: '',
    last_source: '',
    last_medium: '',
    utm_source: '',
    utm_campaign: '',
    utm_term: '',
    utm_agid: '',
    device: '',
    landingspagina: '',
  }
  if (typeof window === 'undefined') return leeg
  const lees = <T,>(k: string): T | null => {
    try {
      const r = localStorage.getItem(k)
      return r ? (JSON.parse(r) as T) : null
    } catch {
      return null
    }
  }
  let utm: Record<string, string> | null = null
  try {
    utm = JSON.parse(sessionStorage.getItem(UTM) || 'null')
  } catch {
    utm = null
  }
  let landingspagina = ''
  try {
    landingspagina = sessionStorage.getItem(LANDING) ?? ''
  } catch {
    landingspagina = ''
  }
  const first = lees<Touch>(FIRST)
  const last = lees<Touch>(LAST)
  return {
    ...leeg,
    first_source: first?.source ?? '',
    first_medium: first?.medium ?? '',
    last_source: last?.source ?? '',
    last_medium: last?.medium ?? '',
    utm_source: utm?.utm_source ?? '',
    utm_campaign: utm?.utm_campaign ?? '',
    utm_term: utm?.utm_term ?? '',
    utm_agid: utm?.utm_agid ?? '',
    device: utm?.device ?? '',
    landingspagina,
  }
}
