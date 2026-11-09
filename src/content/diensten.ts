import data from './diensten.json'

/** Lijstitem: gewone tekst, of een vet kopje (lead) met de omschrijving op de regel eronder (x) */
export type DienstLijstItem = string | { lead: string; x: string }

export type DienstBlok =
  | { t: 'p'; x: string }
  | { t: 'h'; x: string }
  /** Vette tussenregel in lopende tekst, bijvoorbeeld "Voor de Werknemer:" */
  | { t: 'b'; x: string }
  | { t: 'ul'; items: DienstLijstItem[] }

export type Dienst = {
  slug: string
  /** Korte naam (menu, tegels, footer) */
  naam: string
  h1: string
  sub: string
  seoTitle: string
  description: string
  blokken: DienstBlok[]
}

export const diensten = data as Dienst[]

export function vindDienst(slug: string): Dienst | undefined {
  return diensten.find((d) => d.slug === slug)
}

/** Volgorde in de footer en in "Veel voorkomende problemen" (zoals op de oude site, Schijn Zelfstandigheid als laatste in de footer) */
const FOOTER = diensten.filter((d) => d.slug !== 'schijn-zelfstandigheid').slice(0, 15)
export const footerDiensten = [...FOOTER, ...diensten.filter((d) => d.slug === 'schijn-zelfstandigheid')]

/** Menu "Veel voorkomende problemen": gesorteerd op slug (URL), zoals de oude site (Aansprakelijkheid, Belastingcontrole, Hulp bij belastingschuld, ...) */
export const menuDiensten = [...diensten].sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
