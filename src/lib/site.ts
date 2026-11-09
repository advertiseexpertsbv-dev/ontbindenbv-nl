export const site = {
  name: 'OntbindenBV.nl',
  /** Naam in lopende tekst / merk */
  brand: 'OntbindenBV.nl',
  legalName: 'OntbindenBV.nl', // TODO: juridische naam bevestigen (KvK 96464054)
  kvk: '96464054',
  domain: 'ontbindenbv.nl',
  /** Achtervoegsel van de paginatitels, zoals de oude site (Rank Math): 'Contact - BV ontbinden?' */
  titelSuffix: 'BV ontbinden?',
  url: 'https://ontbindenbv.nl',
  description:
    'BV ontbinden? Wij regelen de volledige beëindiging snel, correct en betaalbaar. Gratis intakegesprek en een vaste prijs vooraf.',
  phone: '+31 85 004 8369',
  phoneHref: 'tel:+31850048369',
  email: 'info@ontbindenbv.nl',
  address: {
    street: 'Houtzaagmolen 99', // nieuw adres (hub-taak 174, bevestigd door Steven 2026-11-09), bezoek alleen op afspraak
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
  gtmId: 'GTM-MB27H2SF', // bestaande container van de oude site ontbindenbv.nl
  /** HubSpot-tracking (EU-portaal van ontbindenbv.nl, niet dat van BB). Wordt pas na toestemming (marketing/statistieken) geladen. */
  hubspotId: '146798603', // uit js-eu1.hs-scripts.com/146798603.js op de oude site
  /** HubSpot-formulieren per formulier (EU-portaal), aangemaakt door de Gravity Forms HubSpot-add-on van de oude site */
  // TODO: GUID's uit WP-beheer (Gravity Forms > HubSpot-feeds) of HubSpot > Formulieren. Zonder GUID slaat de server HubSpot over.
  hubspotFormulieren: {} as Partial<Record<'Hero' | 'Contact' | 'Gratis intakegesprek', string>>,
  /**
   * Interne intake van de bellers, gedeeld met belastingbemiddelaar.nl (zelfde team en CRM BBase). ontbindenbv.nl heeft die
   * pagina zelf niet; de link gaat als intake_link mee naar BBase en HubSpot.
   */
  intakeUrl: 'https://belastingbemiddelaar.nl/intake-nieuwe-klant/',
  reviews: { score: '4,9', count: 391 },
  /** Afspraken online inplannen (zelfde doel als de knop op de oude site: /contact/) */
  afspraakHref: '/contact/',
} as const

export type Site = typeof site
