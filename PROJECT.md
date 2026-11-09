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

## Pagina's van de oude site (116 URL's in `ref/seo/seo.json`)

- 9 pagina's: `/`, `/over-ons/`, `/onze-werkwijze/`, `/contact/`, `/gratis-intakegesprek/`, `/bedankt/`, `/privacyverklaring-eu/`,
  `/cookiebeleid-eu/`, `/sample-page/` (WP-standaard, nu 301 naar `/`)
- 18 diensten onder `/dienst/<slug>/` (CPT `dienst`, Oxygen)
- 80 artikelen op `/<slug>/` (ook de twee "landingspagina's" `/turboliquidatie-bv/` en
  `/bv-ontbinding-turboliquidatie-bv-beeindiging/` zijn gewone posts), overzicht `/kennisbank/` + `/kennisbank/page/2-8/`
  (10 per pagina), `/category/uncategorized/` (nu 301 naar `/kennisbank/`)

## Stand

- [x] Sjabloon overgenomen, identiteit (2026-11-09)
- [x] Inhoud geïmporteerd: pagina's, 18 diensten (`scripts/bouw-diensten.py`), 80 artikelen (`scripts/bouw-blog.py`),
      beelden (`scripts/site-beelden.mjs`, `scripts/beelden.mjs`, `scripts/beelden-varianten.mjs`) (2026-11-09)
- [x] Ontwerp 1-op-1: Oxygen + Twenty Twenty-Five-typografie (Manrope 300, koppen 400), kleuren, knoppen, verloop, alle secties
- [x] URL-check: `node scripts/parity.mjs http://localhost:3000` → 116/116 (status, titel, canonical, één h1)
- [ ] Formulierkoppelingen nalopen in WP-beheer (Gravity Forms: ontvangers, HubSpot-portaal?, BBase?, Zapier?)
- [ ] GTM-container (oud: GTM-MB27H2SF) in `site.gtmId`, HubSpot alleen als de oude site die gebruikte (`site.hubspotId`)
- [ ] D1 `ontbindenbv-db` aanmaken + migraties, Resend (afzender/ontvangers), hub-koppeling (`obv`)
- [ ] Livegang (DNS-zone, nameservers, worker-routes) alleen na expliciet akkoord van Steven, nazorg

## Bewuste verschillen met de oude site

- Reviews naast elkaar (3 kolommen vanaf 992px); oud stonden ze onder elkaar in een halve kolom.
- Veelgestelde vragen: alle antwoorden open zoals oud, maar per vraag in- en uitklapbaar.
- "Wat is je situatie?" toont de 7 hoofddiensten als tegels; de lijst was op de oude site leeg.
- Tweede h1 op een pagina (homepage, over ons, bedankt) is een h2 in dezelfde maat.
- "Volg ons online" in de footer weggelaten: de links (Facebook, Instagram, LinkedIn) wezen naar `#`. Echte URL's nodig.
- Tabel "Voordelen / Wat wij doen" op de dienstpagina's: witte tekst op blauw (oud donker op blauw, slecht leesbaar).
- Artikelen: auteur "Peter Brouwers" (oud: typfout "Bouwers"), datum in het Nederlands, werkende inhoudsopgave (oud leeg),
  geen kapotte avatar. Het FAQPage-schema dat in 17 artikelen als `<script>` in de tekst stond, staat nu in de head.
- Juridische pagina's: titelbalk met h1 (oud geen h1); teksten beschrijven de nieuwe site i.p.v. de Complianz-standaardtekst
  (door de eigenaar te bevestigen).
- Lege `#`-links in dienstteksten: "Bel…" → `tel:`, overige → `/gratis-intakegesprek/`; kapotte link `/gratis-intakesprek/` hersteld.
- Adres: nieuw adres (Houtzaagmolen 99, Ridderkerk) i.p.v. Nieuwerkerk aan den IJssel (te bevestigen).
- Mobiele balk onderaan (Bel direct / Gratis intake) is een toevoeging uit het sjabloon.
- `/bedankt/` staat op noindex (oud: index).

## Werkwijze import (reproduceerbaar)

`ref/` (gitignored) bevat de dump: `ref/api/*.json` (WP REST: pages, dienst, posts, media), `ref/html/*.html` (gerenderde pagina's),
`ref/diensten/*.html`, `ref/seo/seo.json` (title/description/canonical/robots per URL), `ref/images/` (originelen) en
`ref/screens/` (screenshots oud). Opnieuw opbouwen:

1. `python3 scripts/bouw-diensten.py` → `src/content/diensten.json`
2. `node scripts/beelden.mjs` (artikelbeelden + `ref/beeldkaart.json`) en `python3 scripts/bouw-blog.py` → `src/content/blog.json`
3. `node scripts/site-beelden.mjs && node scripts/beelden-varianten.mjs` (vaste beelden, favicons, og.jpg, srcset-varianten)
4. `pnpm typecheck && pnpm lint && pnpm build`, dan `pnpm dev` en `node scripts/parity.mjs http://localhost:3000`

De interne BB-intake (`/intake-nieuwe-klant/`) is verwijderd. De BBase/HubSpot-code in `src/server/` blijft slapend (alleen actief
met secrets); `intake_link` in de HubSpot/CRM-velden wijst nog naar die BB-pagina: bij de formulierkoppeling beslissen.
De open vragen voor Steven staan in het migratieplan (Claude Doc, link bovenaan).
