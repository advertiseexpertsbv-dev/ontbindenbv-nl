/* Meldt navigaties binnen de site (SPA) aan de server, zodat die als
   paginaweergave meetellen in de cookieloze bezoekersmeting
   (zie server/bezoeken.ts). De eerste lading telt de server zelf. */
export function meldWeergave(pad: string): void {
  if (typeof window === 'undefined') return
  try {
    const body = JSON.stringify({ pad })
    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon('/api/bezoek', new Blob([body], { type: 'application/json' }))
    } else {
      void fetch('/api/bezoek', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
    }
  } catch {
    /* de meting mag nooit de site storen */
  }
}
