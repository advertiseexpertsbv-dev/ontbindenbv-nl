export const site = {
  name: 'OntbindenBV.nl',
  /** Naam in lopende tekst / merk */
  brand: 'OntbindenBV.nl',
  /** Juridische naam. OntbindenBV.nl is de handelsnaam (KvK-register via TransFirm, goedgekeurd door Steven 2026-11-10). */
  legalName: 'BCF Advies B.V.',
  kvk: '96464054',
  domain: 'ontbindenbv.nl',
  /** Achtervoegsel van de paginatitels, zoals de oude site (Rank Math): 'Contact - BV ontbinden?' */
  titelSuffix: 'BV ontbinden?',
  url: 'https://ontbindenbv.nl',
  description:
    'BV ontbinden? Wij regelen de volledige beëindiging snel, correct en betaalbaar. Gratis intakegesprek, de kosten bespreken we vooraf met je.',
  /**
   * Telefoonnummer: tijdelijk leeg (besluit Steven 2026-11-10). Het oude nummer +31 85 004 8369 is nu van subsidiehulp.nl;
   * een nieuw nummer (Goedemorgen-Goedemiddag) volgt. Leeg = nergens een nummer of bel-knop, wel e-mail en formulieren.
   * Nieuw nummer: vul beide velden in (phoneHref als 'tel:+31…'), dan staat het overal weer.
   */
  phone: '' as string,
  phoneHref: '' as string,
  email: 'info@ontbindenbv.nl',
  address: {
    street: 'Houtzaagmolen 99', // nieuw adres (hub-taak 174, bevestigd door Steven 2026-11-09), bezoek alleen op afspraak
    postalCode: '2986 GE',
    city: 'Ridderkerk',
    country: 'Nederland',
  },
  /** Zichtbaar naast het telefoonnummer (header, hero, CTA's). Gelijk aan de openingstijden (klant 2026-11-10: één versie) */
  belTijden: 'Bereikbaar tussen 08:30 en 17:30',
  /** Contactblok */
  openingstijden: { dagen: 'maandag tot en met vrijdag', tijden: '08:30 uur tot 17:30' },
  linkedin: '', // oude site linkte naar '#'
  /** Google Tag Manager (Consent Mode v2, zie routes/__root.tsx). Leeg = GTM niet laden. */
  gtmId: 'GTM-MB27H2SF', // bestaande container van de oude site ontbindenbv.nl
  /**
   * HubSpot staat uit: niet meer nodig (besluit Steven 2026-11-09). De oude site had een eigen EU-portaal (146798603).
   * Leeg = geen trackingscript, niets naar de Forms API en HubSpot niet in de privacyverklaring.
   */
  hubspotId: '',
  /** HubSpot-formulier-GUID's per formulier (alleen als HubSpot weer aan gaat) */
  hubspotFormulieren: {} as Partial<Record<'Hero' | 'Contact' | 'Gratis intakegesprek', string>>,
  /**
   * Interne intake van de bellers, gedeeld met belastingbemiddelaar.nl (zelfde team en CRM BBase). ontbindenbv.nl heeft die
   * pagina zelf niet; de link gaat als intake_link mee naar BBase.
   */
  intakeUrl: 'https://belastingbemiddelaar.nl/intake-nieuwe-klant/',
  /**
   * Reviewscore van Belasting Bemiddelaar: hetzelfde bedrijf en team (Steven, 2026-11-11: "je mag de reviews van belasting
   * bemiddelaar gebruiken"). Er bestaat geen eigen profiel van OntbindenBV.nl, dus de herkomst (`bron`) staat er altijd bij,
   * in de reviewbalk en bij de reviews. Score en aantal zoals belastingbemiddelaar.nl ze toont (2026-11-11: 4,9 uit 5, 391 reviews;
   * daar zonder link naar Google). Het Google-logo en een link naar buiten komen er alleen bij als googleUrl naar het openbare
   * Google-profiel wijst, zodat een bezoeker score en aantal kan controleren. Wijzigt de score daar, dan hier ook.
   */
  reviews: { score: '4,9', count: 391, bron: 'Belasting Bemiddelaar', googleUrl: '' as string },
  /**
   * Gele knop naar het contactformulier. Op de oude site heette hij "Online afspraak inplannen", maar er is geen agenda: het is een
   * gewoon formulier. Daarom "Neem contact op" (campagnecontrole 2026-11-10). De blauwe knop gaat naar /gratis-intakegesprek/.
   */
  afspraakHref: '/contact/',
  afspraakKnop: 'Neem contact op',
} as const

export type Site = typeof site
