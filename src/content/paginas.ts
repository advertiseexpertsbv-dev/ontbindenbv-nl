import { site } from '../lib/site'

/**
 * Vaste pagina's: titel en meta description (seo() in de head() van de route) en pad, in de volgorde van de sitemap.
 * Eén bron voor de routes, de sitemap (src/server.ts) en /llms.txt (src/server/llms.ts), zodat ze niet uit elkaar lopen.
 * Titels 1-op-1 van de oude site (seo() zet er ' - BV ontbinden?' achter, behalve bij exact). De oude site had alleen op de
 * homepage een meta description; de andere zijn nieuw geschreven.
 */
export const paginas = {
  home: {
    title: 'BV Ontbinden? Snelle & Complete begeleiding | OntbindenBV.nl',
    description:
      'BV ontbinden? Wij regelen de volledige beëindiging snel, correct en betaalbaar. Ontdek hoe OntbindenBV.nl je stap voor stap helpt bij het ontbinden van je BV.',
    path: '/',
  },
  overOns: {
    title: 'Over ons',
    description:
      'OntbindenBV.nl is een betrokken familiebedrijf met meer dan 25 jaar ervaring in het ontbinden van ondernemingen. Maak kennis met ons team.',
    path: '/over-ons/',
  },
  werkwijze: {
    title: 'Onze werkwijze',
    description:
      'Van gratis intake tot bevestiging van de ontbinding: in vijf stappen ontbindt OntbindenBV.nl jouw BV veilig en juridisch correct.',
    path: '/onze-werkwijze/',
  },
  intakegesprek: {
    title: 'Gratis intakegesprek',
    description:
      'Boek een gratis intakegesprek met OntbindenBV.nl. Laat je gegevens achter en wij bespreken hoe we jouw BV het beste kunnen ontbinden.',
    path: '/gratis-intakegesprek/',
  },
  contact: {
    title: 'Contact',
    description:
      `Neem contact op met OntbindenBV.nl voor een gratis intakegesprek over het ontbinden van jouw BV. ${site.phone ? `Bel ${site.phone}` : `Mail naar ${site.email}`} of stuur ons een bericht.`,
    path: '/contact/',
  },
  kennisbank: {
    title: 'Kennisbank',
    description:
      'Artikelen over BV ontbinden, turboliquidatie, BV opheffen met schulden en de verplichtingen bij de KvK en de Belastingdienst.',
    path: '/kennisbank/',
  },
  privacyverklaring: {
    title: 'Privacyverklaring (EU)',
    description:
      'Lees hoe OntbindenBV.nl omgaat met je persoonsgegevens: welke gegevens we verwerken, waarom, met wie we ze delen en welke rechten je hebt.',
    path: '/privacyverklaring-eu/',
  },
  cookiebeleid: {
    title: 'Cookiebeleid (EU)',
    description: 'Welke cookies OntbindenBV.nl gebruikt, waarvoor, en hoe je je toestemming wijzigt of intrekt.',
    path: '/cookiebeleid-eu/',
  },
}
