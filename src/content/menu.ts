/**
 * Menu's van de oude site (WordPress-menu's, 2026-11-09). Labels staan los van de dienstnamen: het menu gebruikt eigen
 * labels ("Lege BV", "Hulp bij Schuldsanering"). Elk item wijst naar een dienstpagina (/dienst/<slug>/).
 * "Hulp mij Schuldsanering" (typfout in het oude menu) is "Hulp bij Schuldsanering" geworden.
 */
export type MenuDienst = { label: string; slug: string }
export type MenuItem = { label: string; to: string } | { label: string; dienst: string } | { label: string; menu: MenuDienst[] }

export const hoofdmenu: MenuItem[] = [
  { label: 'Home', to: '/' },
  {
    label: 'BV ontbinden',
    menu: [
      { label: 'BV hoge schulden', slug: 'bv-hoge-schulden' },
      { label: 'BV met schulden', slug: 'bv-met-schulden' },
      { label: 'Lege BV', slug: 'lege-bv-turbo-liquidatie' },
    ],
  },
  {
    label: 'BV met Schulden',
    menu: [
      // Oude menu: "BV met schulden ontbinden" wees naar /dienst/bv-hoge-schulden/ (zelfde doel als "BV hoge schulden"); zo gelaten
      { label: 'BV met schulden ontbinden', slug: 'bv-hoge-schulden' },
      { label: 'Hulp bij bedrijfschuld', slug: 'hulp-bij-bedrijfschuld-voor-ondernemers-met-een-bv' },
      { label: 'Hulp bij vennootschapsbelasting', slug: 'problemen-met-vennootschapsbelasting-binnen-je-bv' },
      { label: 'Hulp bij Schuldsanering', slug: 'schuldsanering-bv' },
      { label: 'Hulp bij Schuldregeling', slug: 'schuldregeling-bv' },
      { label: 'Hulp bij Schuldhulpverlening', slug: 'schuldhulpverlening-bv' },
      { label: 'Hulp bij Schulden Belastingdienst', slug: 'schulden-belastingdienst-bv' },
      { label: 'Hulp bij Omzetbelasting', slug: 'omzetbelasting-bv' },
      { label: 'Hulp bij Loonbelasting', slug: 'hulp-bij-loonbelasting-bv' },
      { label: 'Hulp bij Courantschuld', slug: 'courantschuld-binnen-je-bv-wij-helpen-je-verder' },
      { label: 'Hulp bij Betalingsproblemen', slug: 'betalingsproblemen-bv' },
      { label: 'Belastingadviseur BV', slug: 'belastingadviseur-bv' },
    ],
  },
  { label: 'Turbo liquidatie', dienst: 'lege-bv-turbo-liquidatie' },
  {
    label: 'Bedrijf herstructureren',
    menu: [
      { label: 'Bedrijf herstructureren', slug: 'bedrijf-herstructureren' },
      { label: 'VOF omzetten naar BV', slug: 'vof-omzetten-naar-bv' },
      { label: 'Eenmanszaak omzetten naar BV', slug: 'eenmanszaak-omzetten-naar-bv' },
    ],
  },
  { label: 'Over ons', to: '/over-ons/' },
  { label: 'Onze werkwijze', to: '/onze-werkwijze/' },
  { label: 'Contact', to: '/contact/' },
]

/** Footer-kolom "Diensten" en het paneel "Diensten" in het mobiele menu (zelfde lijst op de oude site) */
export const footerDiensten: MenuDienst[] = [
  { label: 'Bedrijf herstructureren', slug: 'bedrijf-herstructureren' },
  { label: 'VOF omzetten naar BV', slug: 'vof-omzetten-naar-bv' },
  { label: 'Eenmanszaak omzetten naar BV', slug: 'eenmanszaak-omzetten-naar-bv' },
  { label: 'BV hoge schulden', slug: 'bv-hoge-schulden' },
  { label: 'BV met schulden', slug: 'bv-met-schulden' },
  { label: 'Lege BV (Turbo liquidatie)', slug: 'lege-bv-turbo-liquidatie' },
]

/** Footer-kolom "Over" */
export const footerOver = [
  { label: 'Home', to: '/' },
  { label: 'Onze werkwijze', to: '/onze-werkwijze/' },
  { label: 'Over ons', to: '/over-ons/' },
  { label: 'Gratis intakegesprek', to: '/gratis-intakegesprek/' },
  { label: 'Kennisbank', to: '/kennisbank/' },
] as const

/** Mobiel menu: na "Diensten" alleen deze links, zoals de oude site */
export const mobielNav = [
  { label: 'Over ons', to: '/over-ons/' },
  { label: 'Onze werkwijze', to: '/onze-werkwijze/' },
  { label: 'Contact', to: '/contact/' },
] as const
