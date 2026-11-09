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
| Adres | Houtzaagmolen 99, 2986 GE Ridderkerk, Nederland (hub-taak 174, bevestigd door Steven 2026-11-09), bezoek alleen op afspraak. Oude site: Hoogeveenenweg 100, unit 2.11 (soms 2.01), 2913 LV Nieuwerkerk aan den IJssel |
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
- [x] Koppelingen zoals belastingbemiddelaar.nl (besluit Steven 2026-11-09), zie "Formulieren en koppelingen"
- [x] D1 `ontbindenbv-db` aangemaakt (WEUR) met migraties 0001–0004, ook geregistreerd in `d1_migrations` (2026-11-09)
- [x] Deploy-workflow `.github/workflows/deploy.yml` (zoals BB); deployt alleen als de repo-secret `CLOUDFLARE_API_TOKEN` er is
- [x] Repo-secret `CLOUDFLARE_API_TOKEN` en Worker-secret `RESEND_API_KEY` gezet door Steven; eerste deploy naar
      https://ontbindenbv-nl.advertisexperts.workers.dev, Queue `ontbindenbv-crm` door de workflow aangemaakt (2026-11-09)
- [ ] Worker-secret `CRM_WEBHOOK_URL` (BBase) volgt later (Steven)
- [x] HubSpot uit: niet meer nodig (besluit Steven 2026-11-09), `site.hubspotId` leeg
- [ ] GTM-MB27H2SF vóór de livegang aanpassen (zie "Formulieren en koppelingen"): leadtags op Custom Event `generate_lead`
- [ ] Hub-koppeling (`obv`) en Resend-domein ontbindenbv.nl (na de DNS-verhuizing)
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
- Adres: nieuw adres (Houtzaagmolen 99, Ridderkerk) i.p.v. Nieuwerkerk aan den IJssel.
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

## Formulieren en koppelingen (zoals belastingbemiddelaar.nl)

Elke inzending → D1-tabel `leads` → Resend-mail (en Zapier, niet in gebruik) en CRM BBase via de Queue `ontbindenbv-crm`
(elk alleen als de bijbehorende secret is gezet). Werking, retry en logging: zie PROJECT.md van belastingbemiddelaar-nl, de
code in `src/server/leads.ts` en `src/server/crm.ts` is gelijk.

- **Oude site**: Gravity Forms 1 (Contact, op `/contact/` en de homepage), 2 (Banner Contact, de kaart) en 3 (Intake gesprek,
  `/gratis-intakegesprek/`), dezelfde opbouw als de oude BB-site. Feeds (webhook naar BBase, HubSpot) niet gezien: WP-beheer.
- **Resend**: afzender tijdelijk `info@advertisexperts.com` (ontbindenbv.nl staat niet in het Resend-account), ontvangers
  `info@ontbindenbv.nl,maurice@sea-experts.nl` zoals BB. Na de DNS-verhuizing ontbindenbv.nl toevoegen in Resend en terugzetten.
- **CRM BBase**: secret `CRM_WEBHOOK_URL` (volledige URL incl. `?secret=…`, waarde uit de Gravity Forms-webhook van ontbindenbv.nl;
  bij BB `crm.belastingbemiddelaar.nl`). Payload gelijk aan BB. `intake_link` gaat naar de interne intake van BB
  (`site.intakeUrl`, https://belastingbemiddelaar.nl/intake-nieuwe-klant/): ontbindenbv.nl heeft die pagina niet.
- **HubSpot**: uit, niet meer nodig (besluit Steven 2026-11-09). De oude site had een eigen EU-portaal `146798603` (niet het
  BB-portaal). Met `site.hubspotId` leeg laadt er geen trackingscript, gaat er niets naar de Forms API (ook niet als de secret
  `HUBSPOT_FORMS_API` er staat) en noemt de privacyverklaring HubSpot niet. De code blijft voor als het ooit terug moet.
- **GTM**: bestaande container `GTM-MB27H2SF` (`site.gtmId`), Consent Mode v2 in `__root.tsx`, alleen op het echte domein.
  Inhoud (gelezen uit gtm.js, 2026-11-09): Google tag GA4 `G-742VS3JNKX` en conversielinker op alle pagina's; GA4-event `OBV_lead`
  en Google Ads-conversie `AW-17511513426` (label `25vGCLuB5rUbENL6kZ5B`, waarde 300, enhanced conversions uit) op **gtm.js +
  URL bevat /bedankt/**; een Complianz-consenttemplate (cookie `cmplz_consent_mode`). Die trigger werkt hier niet: na de submit
  gaat de site client-side naar /bedankt/ (geen nieuwe gtm.js), dus er zou geen conversie meer tellen. Nodig, zoals BB-versie 4:
  beide leadtags op Custom Event `generate_lead` (event komt uit `lib/conversie.ts`), Complianz-template eruit (de site zet de
  consent zelf), eventueel enhanced conversions aan (`user_data` zit in het event). Testen in GTM-preview op workers.dev kan niet
  (GTM laadt alleen op het echte domein), dus direct na de livegang controleren.
- **Database**: D1 `ontbindenbv-db`, id `5c4f8c21-690b-48ce-b303-c797ed246e86`. Nieuwe migraties: `wrangler d1 migrations apply
  ontbindenbv-db --remote` vóór de deploy (de workflow stopt bij een nieuwe migratie).
- **Deploy**: bij push naar main naar het test-adres op workers.dev (geen routes, dus niet live). Livegang = routes in
  `wrangler.jsonc` + DNS, alleen na akkoord van Steven.

De interne BB-intake (`/intake-nieuwe-klant/`) is hier verwijderd; die van BB wordt gebruikt (zie CRM BBase).
