# ontbindenbv.nl

Herbouw van de WordPress-site (SiteGround) als TanStack Start-site op Cloudflare Workers met D1, op het sjabloon van
belastingbemiddelaar-nl. Ontwerp, URL's en teksten 1-op-1 van de oude site. Conventies: `AGENTS.md`. Projectgegevens,
koppelingen en de livegang-checklist: `PROJECT.md`.

```bash
pnpm install
pnpm exec wrangler d1 migrations apply ontbindenbv-db --local
pnpm dev            # http://localhost:3000 (of de eerstvolgende vrije poort)
pnpm typecheck && pnpm lint && pnpm build
pnpm run deploy
```
