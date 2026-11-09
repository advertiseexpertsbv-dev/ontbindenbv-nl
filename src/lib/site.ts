export const site = {
  name: 'OntbindenBV.nl',
  /** Naam in lopende tekst / merk */
  brand: 'OntbindenBV.nl',
  legalName: 'OntbindenBV.nl', // TODO: juridische naam bevestigen (KvK 96464054)
  kvk: '96464054',
  domain: 'ontbindenbv.nl',
  url: 'https://ontbindenbv.nl',
  description:
    'BV ontbinden? Wij regelen de volledige beëindiging snel, correct en betaalbaar. Gratis intakegesprek en een vaste prijs vooraf.', // TODO: 1-op-1 uit de oude site
  phone: '+31 85 004 8369',
  phoneHref: 'tel:+31850048369',
  email: 'info@ontbindenbv.nl',
  address: {
    street: 'Houtzaagmolen 99', // nieuw adres (hub-taak 174), bezoek alleen op afspraak; huisnummer/postcode te bevestigen
    postalCode: '2986 GE',
    city: 'Ridderkerk',
    country: 'Nederland',
  },
  /** Zichtbaar naast het telefoonnummer (header, hero, CTA's) */
  belTijden: 'Bereikbaar tussen 08:00 en 18:00',
  /** Contactblok */
  openingstijden: { dagen: 'maandag tot en met vrijdag', tijden: '08:30 uur tot 17:30' },
  linkedin: '', // oude site linkte naar '#'
  /** Google Tag Manager (Consent Mode v2, zie routes/__root.tsx). Leeg = GTM niet laden. */
  gtmId: '', // TODO: container van ontbindenbv.nl (of nieuwe) invullen
  /** HubSpot-tracking (portaal van het CRM). Wordt pas na toestemming (marketing/statistieken) geladen. */
  hubspotId: '', // TODO: HubSpot-portaal van ontbindenbv.nl nalopen in WP-beheer
  /** HubSpot-formulieren per formulier (EU-portaal), aangemaakt door de Gravity Forms HubSpot-add-on van de oude site */
  hubspotFormulieren: {} as Record<string, string>, // TODO: formulier-GUID's na controle in WP-beheer
  reviews: { score: '4,9', count: 391 },
  /** Afspraken online inplannen (zelfde doel als de knop op de oude site: /contact/) */
  afspraakHref: '/contact/',
} as const

export type Site = typeof site
