/* Cookie-consent + Google Consent Mode v2.
 *
 * De keuze staat in localStorage onder `bb-cookie-consent` en wordt bij het
 * laden al in de <head> uitgelezen (zie routes/__root.tsx), zodat GTM met de
 * juiste consent-status start. Zonder keuze start alles op 'denied'.
 *
 * Mapping naar Consent Mode:
 *   statistieken → analytics_storage
 *   marketing    → ad_storage, ad_user_data, ad_personalization
 *   voorkeuren   → personalization_storage
 */
export const CONSENT_STORAGE_KEY = 'bb-cookie-consent'

export type Keuzes = {
  voorkeuren: boolean
  statistieken: boolean
  marketing: boolean
}

export const standaardKeuzes: Keuzes = {
  voorkeuren: false,
  statistieken: false,
  marketing: false,
}

type Gtag = (...args: unknown[]) => void
type W = Window & { gtag?: Gtag; dataLayer?: unknown[] }

export function parseKeuzes(raw: string | null): Keuzes {
  if (!raw) return standaardKeuzes
  try {
    return {
      ...standaardKeuzes,
      ...(JSON.parse(raw) as { keuzes?: Partial<Keuzes> }).keuzes,
    }
  } catch {
    return standaardKeuzes
  }
}

/* Werkt de Consent Mode-status bij en meldt de wijziging als dataLayer-event
   (`cookie_consent_update`), zodat GTM-triggers erop kunnen reageren. */
export function updateConsent(keuzes: Keuzes): void {
  if (typeof window === 'undefined') return
  const w = window as W
  w.dataLayer = w.dataLayer || []
  const dl = w.dataLayer
  const gtag: Gtag = w.gtag ?? ((...args: unknown[]) => dl.push(args))
  const stand = (aan: boolean) => (aan ? 'granted' : 'denied')
  gtag('consent', 'update', {
    ad_storage: stand(keuzes.marketing),
    ad_user_data: stand(keuzes.marketing),
    ad_personalization: stand(keuzes.marketing),
    analytics_storage: stand(keuzes.statistieken),
    personalization_storage: stand(keuzes.voorkeuren),
  })
  dl.push({
    event: 'cookie_consent_update',
    consent_statistieken: keuzes.statistieken,
    consent_marketing: keuzes.marketing,
    consent_voorkeuren: keuzes.voorkeuren,
  })
}
