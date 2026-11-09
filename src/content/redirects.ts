/*
 * SEO-opschoning (opschoonvoorstel 14-10-2026): dubbele/kannibaliserende blogartikelen → 301 naar het sterkste artikel
 * (zelfde intentie). De bronartikelen zijn uit blog.json verwijderd (dus niet meer in sitemap, overzicht en llms.txt);
 * interne links wijzen direct naar het doel. Paden zonder trailing slash; doel mét slash (geen keten).
 */
export const REDIRECTS: Record<string, string> = {
  '/automatische-conceptenwat-als-je-belastingschuld-niet-kunt-betalen': '/wat-moet-ik-doen-als-ik-mijn-belastingschuld-niet-kan-betalen/',
  '/flitsliquidatie-bv': '/bv-snel-en-veilig-opheffen/',
  '/preferente-schuldeiser-2026': '/preferente-schuldeiser/',
  '/wat-kost-het-ontbinden-van-een-bv': '/wat-kost-het-ontbinden-van-een-bv-3/',
  '/wat-kost-het-ontbinden-van-een-bv-2': '/wat-kost-het-ontbinden-van-een-bv-3/',
  '/wat-houdt-de-wet-dba-in-2026': '/wet-dba-2026-uitleg/',
  // samenvoegingen (teksten Copywriting v1, 15-10-2026)
  '/ontbinden-met-vordering-op-de-dga': '/vordering-op-de-dga/',
  '/wie-kan-mij-helpen-met-belastingschuld': '/hoe-kan-ik-hulp-krijgen-met-mijn-belastingschuld/',
  '/wie-kan-mij-helpen-met-een-belastingschuld': '/hoe-kan-ik-hulp-krijgen-met-mijn-belastingschuld/',
  '/hulp-bij-belastingschuld': '/hoe-kan-ik-hulp-krijgen-met-mijn-belastingschuld/',
  '/hulp-bij-het-oplossen-van-een-belastingschuld': '/hoe-kan-ik-hulp-krijgen-met-mijn-belastingschuld/',
  '/btw-schuld-structureel-2026': '/btw-schuld/',
}
