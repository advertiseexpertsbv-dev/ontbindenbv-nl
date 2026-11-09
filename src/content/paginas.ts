/**
 * Vaste pagina's: titel en meta description (seo() in de head() van de route) en pad, in de volgorde van de sitemap.
 * Eén bron voor de routes, de sitemap (src/server.ts) en /llms.txt (src/server/llms.ts), zodat ze niet uit elkaar lopen.
 */
export const paginas = {
  home: {
    title: 'Belastingbemiddelaar: hulp bij belastingschuld & -zaken',
    description:
      'Hulp bij belastingzaken nodig? Dé Belastingbemiddelaar neemt het contact met de Belastingdienst over. Meer dan 25 jaar ervaring. Plan een kosteloze intake.',
    path: '/',
  },
  overOns: {
    title: 'Over ons',
    description: 'Ontmoet het team van Dé Belastingbemiddelaar: ervaren fiscalisten rond oprichter Peter Brouwers die voor jou met de Belastingdienst bemiddelen.',
    path: '/over-ons/',
  },
  werkwijze: {
    title: 'Onze werkwijze',
    description: 'In vijf stappen van kosteloze intake naar afhandeling: zo lost Dé Belastingbemiddelaar jouw zaak met de Belastingdienst op.',
    path: '/onze-werkwijze/',
  },
  intakegesprek: {
    title: 'Gratis intakegesprek',
    description: 'Boek een gratis intakegesprek met Dé Belastingbemiddelaar. Laat je gegevens achter en wij regelen een moment dat jou uitkomt.',
    path: '/gratis-intakegesprek/',
  },
  contact: {
    title: 'Contact',
    description: 'Neem contact op met Dé Belastingbemiddelaar voor een kosteloze intake. Bel +31 85 130 0867 of stuur ons een bericht.',
    path: '/contact/',
  },
  nieuws: {
    title: 'Nieuws',
    description: 'Het laatste nieuws en praktische artikelen over belastingschulden, betalingsregelingen, BV-zaken en de Belastingdienst.',
    path: '/kennisbank/',
  },
  privacyverklaring: {
    title: 'Privacyverklaring',
    description: 'Lees hoe Belasting Bemiddelaar omgaat met je persoonsgegevens: welke gegevens we verwerken, waarom, met wie we ze delen en welke rechten je hebt.',
    path: '/privacyverklaring-eu/',
  },
  cookiebeleid: {
    title: 'Cookiebeleid (EU)',
    description: 'Welke cookies Belasting Bemiddelaar gebruikt, waarvoor, en hoe je je toestemming wijzigt of intrekt.',
    path: '/cookiebeleid-eu/',
  },
}
