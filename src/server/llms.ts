import { posts } from '../content/blog'
import { diensten } from '../content/diensten'
import { paginas } from '../content/paginas'
import { site } from '../lib/site'

/*
 * llms.txt (https://llmstxt.org): de pagina's van de sitemap (src/server.ts) met hun titel en meta description, uit dezelfde
 * contentbronnen als de pagina's zelf, dus het loopt vanzelf mee. Zonder de overzichtspagina's /kennisbank/page/N/: die hebben
 * geen eigen inhoud, de artikelen staan hieronder los.
 */

type Link = { titel: string; pad: string; omschrijving: string }

function regel({ titel, pad, omschrijving }: Link): string {
  const tekst = omschrijving.replace(/\s+/g, ' ').trim()
  // Blokhaken in een titel zouden de Markdown-link breken
  return `- [${titel.replace(/[[\]]/g, '\\$&')}](${site.url}${pad})${tekst ? `: ${tekst}` : ''}`
}

function sectie(kop: string, links: Link[]): string {
  return links.length ? `\n## ${kop}\n${links.map(regel).join('\n')}\n` : ''
}

export function llmsTxt(): string {
  const vast = Object.values(paginas).map((p) => ({ titel: p.path === '/' ? 'Home' : p.title, pad: p.path, omschrijving: p.description }))
  const dienstLinks = diensten.map((d) => ({ titel: d.naam, pad: `/dienst/${d.slug}/`, omschrijving: d.description }))
  // Omschrijving zoals de meta description in routes/$slug.tsx
  const artikelen = posts.map((p) => ({ titel: p.title, pad: `/${p.slug}/`, omschrijving: p.seoDescription || p.excerpt.slice(0, 157) }))
  return `# ${site.name}\n\n> ${site.description}\n${sectie("Pagina's", vast)}${sectie('Diensten', dienstLinks)}${sectie('Artikelen', artikelen)}`
}
