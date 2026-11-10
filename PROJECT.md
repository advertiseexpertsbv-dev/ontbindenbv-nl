# PROJECT.md — projectspecifieke gegevens ontbindenbv.nl

Herbouw van de WordPress-site (block theme + Rank Math + Complianz + HubSpot-plugin, SiteGround) als TanStack Start-site op
Cloudflare Workers, op het sjabloon van belastingbemiddelaar-nl. Keuze van Steven (2026-11-09): **huidig ontwerp 1-op-1**,
alle URL's gelijk; dubbele artikelen pas na de livegang samenvoegen met 301's. Mail blijft op SiteGround.
Migratieplan: Claude Doc "Migratieplan ontbindenbv.nl naar Cloudflare" (https://claude.ai/artifact/A2zpGKxuByN25ysGikHVne).

## Identiteit

| Veld | Waarde |
|---|---|
| Sitenaam | OntbindenBV.nl (REST-sitenaam "BV ontbinden?"; og:site_name stond op "My WordPress") |
| Juridische naam | BCF Advies B.V. OntbindenBV.nl is een handelsnaam (KvK-register via TransFirm, goedgekeurd door Steven 2026-11-10) |
| Domein | ontbindenbv.nl (www → apex 301 in `src/server.ts`) |
| Telefoon | **Tijdelijk geen nummer** (Steven 2026-11-10): +31 85 004 8369 is nu van subsidiehulp.nl, nieuw nummer via Goedemorgen-Goedemiddag volgt. `site.phone` en `site.phoneHref` zijn leeg; dan verdwijnen header-telefoon, "Bel direct", bel-knoppen en de telefoonrij in het contactblok, en staat er e-mail. Nieuw nummer = beide velden invullen. Ook het BB-nummer (+31 85 130 0867) is uit 14 artikelen gehaald |
| Openingstijden | ma t/m vr 08:30–17:30, overal één versie (klant 2026-11-10, gelijk aan het blok Openingstijden op belastingbemiddelaar.nl). Ook `site.belTijden` naast het telefoonnummer en de terugbelmomenten in het intakeformulier (ma-vr 8.30-17.30; avond en weekend "op afspraak") |
| E-mail | info@ontbindenbv.nl |
| KvK | 96464054 |
| Adres | Houtzaagmolen 99, 2986 GE Ridderkerk, Nederland (hub-taak 174, bevestigd door Steven 2026-11-09), bezoek alleen op afspraak. Het KvK-register noemt nog Hoogeveenenweg 100 unit 2.11, Nieuwerkerk aan den IJssel (oude site, soms unit 2.01, postcode 2913 LV); de site blijft het bevestigde bezoekadres tonen |
| Reviews | 4,9 uit 5, 391 reviews (Google), van de oude site. **Niet getoond** zolang `site.reviews.googleUrl` leeg is: er was geen Google-profiel van OntbindenBV.nl te vinden en de oude link ging naar de eigen reviews (campagnecontrole 2026-11-10). Profiel-URL invullen = reviewbalk en score terug (cijfers dan nakijken). De drie klantreviews op de pagina blijven |
| Hub | project 26 "OntbindenBV", site-sleutel `obv` (aangemaakt 2026-11-10; code-koppeling in hub-PR #30) |

## Pagina's van de oude site (116 URL's in `ref/seo/seo.json`)

- 9 pagina's: `/`, `/over-ons/`, `/onze-werkwijze/`, `/contact/`, `/gratis-intakegesprek/`, `/bedankt/`, `/privacyverklaring-eu/`,
  `/cookiebeleid-eu/`, `/sample-page/` (WP-standaard, nu 301 naar `/`)
- 17 diensten onder `/dienst/<slug>/` (CPT `dienst`, Oxygen). "BV met activa" is geschrapt (klant 2026-11-10: alleen turboliquidatie, ook met schulden, en herstructurering), 301 naar Lege BV / turboliquidatie
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
- [x] BBase-hook van ontbindenbv.nl ingebouwd (2026-11-10), lokaal getest met een nagebootste BBase
- [ ] Worker-secret `CRM_WEBHOOK_SECRET` (waarde van `OBV_WEBHOOK_SECRET` van de BBase-beheerder) zetten (Steven)
- [x] HubSpot uit: niet meer nodig (besluit Steven 2026-11-09), `site.hubspotId` leeg
- [x] GTM-MB27H2SF versie 7 gepubliceerd (2026-11-10): leadtags op Custom Event `generate_lead`, Complianz-tag eruit
- [x] Hub-project OntbindenBV (`obv`) en Resend-domein ontbindenbv.nl
- [x] Livegang (2026-11-09): nameservers naar Cloudflare, domein in het dashboard aan de worker gekoppeld
- [ ] Domein (route of custom domain) ook in `wrangler.jsonc` vastleggen en `workers_dev` uit; eerst in het dashboard nakijken welke van de twee

## Bewuste verschillen met de oude site

- Reviews naast elkaar (3 kolommen vanaf 992px); oud stonden ze onder elkaar in een halve kolom.
- Veelgestelde vragen: alle antwoorden open zoals oud, maar per vraag in- en uitklapbaar.
- "Wat is je situatie?" toont de 6 hoofddiensten als tegels (sinds BV met activa weg is: 3 kolommen); de lijst was op de oude site leeg.
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
- Campagnecontrole 2026-11-10 (externe audit, door Claude beoordeeld): gele knop "Online afspraak inplannen" heet nu "Neem contact op"
  (`site.afspraakKnop`; er is geen agenda, het is het contactformulier); verstuurknop "Vraag gratis advies aan" met een privacyregel
  eronder; geen garanties op het uitblijven van bestuurdersaansprakelijkheid; FAQ en turbopagina noemen de deponering binnen 14 dagen
  en het informeren van schuldeisers (`TURBO_UITLEG` in `content/home.ts`); doorlooptijd overal "binnen 24 uur van start" en
  "vaak binnen een week geregeld"; garantie- en 9,4-claims uit de artikelen. Telefoons krijgen een uitsnede van de hero
  (`hero-mobiel.webp`, `scripts/hero-mobiel.mjs`, 39 kB i.p.v. 107 kB).
- Open uit die controle: ruim 20 kennisbankartikelen noemen nog "geen schulden" als voorwaarde voor turboliquidatie (juridisch onjuist:
  het gaat om baten op het moment van ontbinding, en de dienst is juist turboliquidatie mét schulden); artikelen gebruiken u, de rest
  van de site je; dubbele artikelen (o.a. turbo vs reguliere liquidatie, -2) nog samenvoegen met 301's.
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
(elk alleen als de bijbehorende secret is gezet). Wachtrij en logging zoals bij belastingbemiddelaar-nl; de BBase-hook en de
herhaalregels verschillen (zie hieronder).

- **Oude site**: Gravity Forms 1 (Contact, op `/contact/` en de homepage), 2 (Banner Contact, de kaart) en 3 (Intake gesprek,
  `/gratis-intakegesprek/`), dezelfde opbouw als de oude BB-site. Feeds (webhook naar BBase, HubSpot) niet gezien: WP-beheer.
- **Resend**: afzender `info@ontbindenbv.nl` (domein geverifieerd in Resend), ontvangers `info@ontbindenbv.nl,maurice@sea-experts.nl`
  zoals BB. Blijft ook met BBase aan, als vangnet (wens Steven 2026-11-10).
- **CRM BBase**: eigen hook (gegevens van de BBase-beheerder, 2026-11-10): `POST https://crm.belastingbemiddelaar.nl/api/public/hooks/ontbindenbv`
  (var `CRM_WEBHOOK_URL`), header `x-obv-secret` = secret `CRM_WEBHOOK_SECRET`, JSON `name`, `email`, `phone`, `message`,
  `submission_id` (verplicht) en `company`, `kvk` (optioneel, vragen de formulieren niet uit). `message` = bericht + gekozen
  contactmoment + "Formulier: … (pagina)". `submission_id` = `ontbindenbv-<lead-id>-<aanmaaktijd>`, vast per lead. Antwoorden:
  200 ontvangen, 400 velden kloppen niet, 401 geheim klopt niet, 503 later opnieuw. Omdat `submission_id` bij elke poging gelijk is,
  probeert de wachtrij het opnieuw bij verbindingsfouten, timeouts en 429/500/502/503/504 (4 pogingen: na 1, 5 en 15 min), niet bij
  400/401. Status per lead in `leads.crm_status`, logregels `[crm] lead N poging …` zonder persoonsgegevens.
- **HubSpot**: uit, niet meer nodig (besluit Steven 2026-11-09). De oude site had een eigen EU-portaal `146798603` (niet het
  BB-portaal). Met `site.hubspotId` leeg laadt er geen trackingscript, gaat er niets naar de Forms API (ook niet als de secret
  `HUBSPOT_FORMS_API` er staat) en noemt de privacyverklaring HubSpot niet. De code blijft voor als het ooit terug moet.
- **GTM**: bestaande container `GTM-MB27H2SF` (`site.gtmId`), Consent Mode v2 in `__root.tsx`, alleen op het echte domein.
  Versie 7 (live sinds 2026-11-10): Google tag GA4 `G-742VS3JNKX` en conversielinker op alle pagina's; GA4-event `OBV_lead` en
  Google Ads-conversie `AW-17511513426` (label `25vGCLuB5rUbENL6kZ5B`, waarde 300, enhanced conversions uit) op Custom Event
  **`generate_lead`** (komt uit `lib/conversie.ts`). Tot en met versie 6 vuurden ze op paginalading van /bedankt/, wat niet werkt
  omdat de site na de submit client-side naar /bedankt/ gaat. De Complianz-consenttag is eruit: de site zet de consent zelf. De
  oude trigger "Bedankt Pagina" staat nog in de container maar wordt niet gebruikt. Eventueel later: enhanced conversions aan
  (`user_data` zit in het event, zoals BB-versie 4).
- **Database**: D1 `ontbindenbv-db`, id `5c4f8c21-690b-48ce-b303-c797ed246e86`. Nieuwe migraties: `wrangler d1 migrations apply
  ontbindenbv-db --remote` vóór de deploy (de workflow stopt bij een nieuwe migratie).
- **Deploy**: elke push naar main gaat direct live. Het domein is in het Cloudflare-dashboard aan de worker gekoppeld (niet in
  `wrangler.jsonc`); een deploy laat die koppeling staan.

De interne BB-intake (`/intake-nieuwe-klant/`) is hier verwijderd; die van BB wordt gebruikt (zie CRM BBase).
