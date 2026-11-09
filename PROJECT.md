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

## Overdracht: import in de omgeving `ontbindenbv-nl` (2026-11-09)

De eerste sessie kon ontbindenbv.nl niet bereiken (netwerkbeleid). De import gebeurt in een cloud-sessie op de persoonlijke
omgeving **ontbindenbv-nl**, die alleen `ontbindenbv.nl` en `www.ontbindenbv.nl` extra toestaat (package managers wel).
Externe hosts zoals fonts.googleapis.com of HubSpot-CDN's staan daar níet open: haal alleen van ontbindenbv.nl zelf.

Volgorde:

1. `pnpm install`, dan de WP REST API dumpen naar `ref/api/` (gitignored), zoals bij belastingbemiddelaar-nl:
   `pages-1.json` (`/wp-json/wp/v2/pages?per_page=100`), `dienst-1.json` (`/wp-json/wp/v2/dienst?per_page=100`),
   `posts-1.json` (`/wp-json/wp/v2/posts?per_page=100`, 80 posts), `media-N.json` (`/wp-json/wp/v2/media?per_page=100&page=N`).
2. `scripts/ref-capture.mjs` aanpassen: basis-URL `https://ontbindenbv.nl`, paden = de 9 pagina's + `/kennisbank/` + 18 diensten
   + een paar artikelen (de BB-paden `/intake-nieuwe-klant/`, `/bizzi/`, `/bizzyphone/` en de BB-artikelen eruit). Het script
   schrijft `ref/seo.json`; `parity.mjs`, `bouw-blog.py` en `bouw-diensten.py` lezen `ref/seo/seo.json` (verplaatsen of pad gelijktrekken).
   SEO voor álle 109 URL's (title, description, canonical) ophalen, ook voor elk artikel, want parity vergelijkt per URL.
3. Importscripts: `bouw-blog.py` werkt op de REST-content en is grotendeels herbruikbaar. `bouw-diensten.py` leest Oxygen-HTML
   (`ct-inner-content`) van de oude BB-site; ontbindenbv.nl is een block theme, dus die parser moet opnieuw voor block-markup.
   Beelden: originelen naar `ref/images/`, dan `node scripts/beelden.mjs` en `node scripts/beelden-varianten.mjs`.
4. Ontwerp 1-op-1 vanaf de screenshots: kleuren en lettertype in `@theme` (`src/styles.css`), logo's in `public/images/brand/`
   (de BB-logo's en BB-teamfoto's die niet op ontbindenbv.nl staan verwijderen), secties van de homepage nalopen
   (hero met formulier, "Dé specialist in BV ontbinden", "Wat is je situatie?", werkwijze in 6 stappen, reviews, FAQ, contact).
5. BB-specifieke onderdelen weghalen of hergebruiken na controle: `/intake-nieuwe-klant/` + `IntakeFormulier` + `content/intake.json`,
   BBase-CRM (`server/crm.ts`), teksten in `content/juridisch.ts`, `content/home.ts`, `content/footer.ts`, `content/redirects.ts`.
6. `pnpm typecheck && pnpm lint && pnpm build`, dan `node scripts/parity.mjs http://localhost:<poort>` tot 109/109.

Daarna (buiten de import): formulierkoppelingen nalopen in WP-beheer, GTM, D1 `ontbindenbv-db`, Resend, hub (`obv`), livegang.
De open vragen voor Steven staan in het migratieplan (Claude Doc, link bovenaan).
