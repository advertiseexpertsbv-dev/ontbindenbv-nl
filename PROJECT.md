# PROJECT.md — projectspecifieke gegevens ontbindenbv.nl

Herbouw van de WordPress-site (block theme + Rank Math + Complianz + HubSpot-plugin, SiteGround) als TanStack Start-site op
Cloudflare Workers, op het sjabloon van belastingbemiddelaar-nl. Keuze van Steven (2026-11-09): **huidig ontwerp 1-op-1**,
alle URL's gelijk; dubbele artikelen pas na de livegang samenvoegen met 301's. Mail blijft op SiteGround.
Migratieplan: Claude Doc "Migratieplan ontbindenbv.nl naar Cloudflare" (https://claude.ai/artifact/A2zpGKxuByN25ysGikHVne).

## Identiteit

| Veld | Waarde |
|---|---|
| Sitenaam | OntbindenBV.nl (REST-sitenaam "BV ontbinden?"; og:site_name stond op "My WordPress") |
| Domein | ontbindenbv.nl (www → apex 301 in `src/server.ts`) |
| Telefoon | +31 85 004 8369 (`tel:+31850048369`), "Bereikbaar tussen 08:00 en 18:00" |
| Contactblok | ma t/m vr 08:30–17:30 (zo op de oude site; intakeformulier noemt 8.00–17.00) |
| E-mail | info@ontbindenbv.nl |
| KvK | 96464054 |
| Adres | Nieuw (hub-taak 174): Houtzaagmolen 99, 2986 GE Ridderkerk, bezoek alleen op afspraak (te bevestigen). Oude site: Hoogeveenenweg 100, unit 2.11 (soms 2.01), 2913 LV Nieuwerkerk aan den IJssel |
| Reviews | 4,9 uit 5, 391 reviews (Google) |
| Hub | site-sleutel `obv` (voorstel), project nog te kiezen (eigen project of onder Belasting Bemiddelaar, id 19) |

## Pagina's van de oude site (109 URL's, sitemap 2026-11-09)

- 9 pagina's: `/`, `/over-ons/`, `/onze-werkwijze/`, `/contact/`, `/gratis-intakegesprek/`, `/bedankt/`, `/privacyverklaring-eu/`,
  `/cookiebeleid-eu/`, `/sample-page/` (WP-standaard)
- 18 diensten onder `/dienst/<slug>/` (CPT `dienst`)
- 80 artikelen op `/<slug>/`, overzicht op `/kennisbank/` (page_for_posts 55), 1 categorie `/category/uncategorized/`

## Stand

- [x] Sjabloon overgenomen, identiteit, `/kennisbank/` en `/privacyverklaring-eu/` als routes (2026-11-09)
- [ ] Inhoud importeren via de WP REST API (cloud-sessie moet ontbindenbv.nl kunnen bereiken)
- [ ] Ontwerp 1-op-1 (kleuren, logo, lettertype, secties) vanaf screenshots van de oude site
- [ ] Formulierkoppelingen nalopen in WP-beheer (plugin, HubSpot-portaal, BBase, ontvangers)
- [ ] GTM-container, D1 `ontbindenbv-db`, Resend, hub-koppeling
- [ ] Parity 109/109, livegang (DNS-zone, nameservers, worker-routes), nazorg
