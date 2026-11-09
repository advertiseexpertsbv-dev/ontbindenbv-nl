# AGENTS.md — Conventies voor dit project (en het sjabloon)

Dit project is ontbindenbv.nl, gebouwd op hetzelfde sjabloon als de andere
Cloudflare-sites (TanStack Start). Projectspecifieke gegevens staan in PROJECT.md; alles
hieronder is generiek.

## Stack

- **TanStack Start** (React 19, file-based routing, server functions) + Vite
- **Tailwind CSS 4** (tokens via `@theme` in `src/styles.css`)
- **Cloudflare Workers** via `@cloudflare/vite-plugin` + `wrangler.jsonc`
- **D1** (SQLite) voor formuliergegevens, migraties in `migrations/`
- pnpm; scripts: `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm deploy`

## Mappenstructuur

```
src/
  routes/               File-based routing (1 bestand = 1 URL, altijd mét trailing slash)
    __root.tsx          Layout, consent, GTM, HubSpot-loader, schema.org
    index.tsx           Homepage
    $slug.tsx           Blogartikel (/<slug>/), data uit content/blog.json via server/blog.ts (server function; blog.json zit niet in de client-bundel)
    dienst/$dienst.tsx  Dienstpagina (/dienst/<slug>/), data uit content/diensten.json
    nieuws/             Overzicht + /nieuws/page/N/
    intake-nieuwe-klant.tsx   Interne intake voor bellers (noindex)
  components/
    ui/                 Container, Button, iconen, Vinklijst
    layout/             Header (topbalk, menu), Footer, CookieBanner
    sections/           Hero, KaartFormulier, Werkwijze, Reviews, Faq, ContactBlok, ...
    forms/              LeadForm (alle publieke formulieren), IntakeFormulier (voorwaardelijke velden)
  content/              home.ts (reviews, FAQ, team, werkwijze), diensten.ts + .json, blog.ts + blog.json (blog.ts is server-only; de client gebruikt blog-types.ts en server/blog.ts),
                        intake.json, juridisch.ts, paginas.ts (titel/description/pad van de vaste pagina's: routes, sitemap en llms.txt)
  lib/                  site.ts (config!), seo.ts, attribution.ts, consent.ts, conversie.ts, hubspot.ts, beeld.ts (srcset/sizes)
  server/               leads.ts (D1, Resend, HubSpot, Zapier), forms.ts (server functions), bezoeken.ts, llms.ts (/llms.txt)
  server.ts             Worker-entry: www→apex, trailing slash 301, sitemap, robots, llms.txt, oude WP-URL's
public/bizzi/           Zelfstandige interne tool (BizziPhone beslisboom), noindex
scripts/                bouw-blog.py / bouw-diensten.py / bouw-intake.py (importeren), beelden.mjs, beelden-varianten.mjs,
                        ref-capture.mjs, screenshot.mjs, test-forms.mjs, parity.mjs
```

## Kernregels

1. **Content staat in `src/content/`**, nooit hard in secties. Secties lezen
   content-bestanden en zijn per project herbruikbaar.
2. **Branding via tokens**: kleuren/lettertypes staan in `@theme` in
   `src/styles.css` en `src/lib/site.ts`. Nooit hexcodes in componenten.
3. **Nieuwe pagina** = `createFileRoute` + `head: () => seo({...})` uit
   `src/lib/seo.ts` (titel, description, canonical altijd invullen). Een vaste, indexeerbare pagina krijgt die
   in `src/content/paginas.ts` (`head: () => seo(paginas.x)`); dan staat hij ook in de sitemap en `/llms.txt`.
4. **SEO-route met parameters**: zie `src/routes/dienst/$dienst.tsx` en
   `$slug.tsx` — contentbestand met `vindX(slug)`-validator
   (throw `notFound()` bij onbekende slug). URL's altijd mét trailing slash
   (`trailingSlash: 'always'` in `src/router.tsx`; links als `to="/dienst/$dienst/"`).
5. **Formulieren**: UI-component in `components/forms/`, verzenden via
   server function in `src/server/forms.ts` → opslag in D1 via `src/server/leads.ts`.
   E-mailnotificatie (Resend) is optioneel; zonder key wordt alleen opgeslagen.
6. **Toegankelijkheid**: telefoonnummer zichtbaar in header en CTA's,
   alt-teksten, focus-zichtbare outlines, skip-link, formulieren met labels.
7. **Afbeeldingen**: WebP, max 1800px, in `public/images/` (`blog/` = beelden van de oude
   site, `site/` = pagina-foto's, `brand/` = logo's). Referentiemateriaal in `/ref/` is gitignored.
   - **Varianten voor srcset**: naast een origineel staan kleinere varianten `<naam>-<breedte>w.webp`
     (zelfde uitsnede, WebP kwaliteit 80, nooit vergroot; de originelen blijven staan). Ze worden gemaakt door
     `node scripts/beelden-varianten.mjs` (herhaalbaar; breedtes per beeld staan bovenin het script: blog 480/800/1200,
     site/brand afgestemd op de plek). Draai het na elk nieuw of vervangen beeld in `public/images/`; het script
     schrijft ook de manifesten `src/content/beeldvarianten.json` (site, brand) en `beeldvarianten-blog.json`
     (blog, alleen server-side). Een variant blijft alleen bestaan als hij minstens 12% kleiner is dan de volgende.
     Bewerk of verwijder varianten niet met de hand.
   - **Gebruik**: een `<img>` van `site/` of `brand/` krijgt zijn srcset via `beeld(src, SIZES.x)` uit `src/lib/beeld.ts`
     (`<img {...beeld('/images/site/hero.webp', SIZES.hero)} alt="…" />`); nieuwskaarten krijgen `imageSrcSet` en
     `imageSizes` van `kaart()` in `content/blog.ts`; de `<img>`'s in artikelhtml krijgen srcset, sizes en een vaste
     `aspect-ratio` server-side in `haalPost` (`verrijkArtikelBeelden`, de tekst blijft onveranderd).
   - **`sizes` klopt met de plek**: het is de breedte in beeldpunten die het beeld bij 1x echt nodig heeft, per breekpunt.
     Bij `object-cover` is dat vaak MEER dan de breedte van het vlak (een liggende foto in een staand of laag vlak wordt op de
     hoogte geschaald; de hero is op een telefoon ca. 2100px breed nodig, dus daar blijft het origineel van 1600px).
     Meet het: zie de `SIZES` in `src/lib/beeld.ts`. Een nieuwe plek krijgt een eigen `SIZES`-regel; schat nooit op `100vw`.
   - **Laden**: alleen de LCP-afbeelding (hero, titelbalk `page-banner`, eerste nieuwskaart, uitgelichte afbeelding van
     een artikel) is `fetchPriority="high"` en niet lazy; React 19 zet elke niet-lazy `<img>` als `<link rel=preload>` in de
     `<head>`, dus alles onder de vouw (ook de 2e en 3e nieuwskaart) is `loading="lazy"`. Altijd `decoding="async"` en
     `width`/`height` (of een vaste `aspect-ratio`). Heeft een logo `h-… w-auto`, zet dan ook `aspect-[breedte/hoogte]`
     van het origineel, anders verandert de breedte met de afronding van de variant.
   - De uitgelichte afbeelding bovenaan een artikel heeft bewust geen srcset: de fotobanner erboven gebruikt hetzelfde
     bestand als CSS-achtergrond, zodat de browser het één keer ophaalt.
8. **Geen secrets in code**: `.dev.vars` lokaal, `wrangler secret put` in prod.
9. **Meten via GTM + Consent Mode v2**: container-id in `site.ts` (`gtmId`),
   consent-default + lazy GTM-loader in `routes/__root.tsx`, consent-updates
   via `lib/consent.ts`, leadconversie via `lib/conversie.ts`
   (`meldConversie` vóór redirect, `verwerkConversie` op `/bedankt`).
   Nooit losse GA4/Ads-snippets in code — alles via de GTM-container.
10. **Typecheck + lint vóór committen**: `pnpm typecheck && pnpm lint`.

## Verificatie bij elke wijziging

```bash
pnpm typecheck && pnpm lint && pnpm build && pnpm preview
```

## Deploy

```bash
pnpm run deploy                 # production
pnpm cf-typegen                 # na wijziging van bindings in wrangler.jsonc
```

D1-migraties: `wrangler d1 migrations apply ontbindenbv-db --remote`

Formuliertest (dev-server draait): `node scripts/test-forms.mjs [url]`
Parity met de oude site (status/titel/canonical per URL): `node scripts/parity.mjs <url>`
Testlead verwijderen: `wrangler d1 execute ontbindenbv-db --remote --command "DELETE FROM leads WHERE naam='Test'"`
