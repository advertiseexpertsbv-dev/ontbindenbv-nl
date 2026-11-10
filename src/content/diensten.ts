import data from './diensten.json'
import type { FaqItem } from './home'

/**
 * Blokken van de tekstkolom van een dienstpagina, in de volgorde van de oude site (scripts/bouw-diensten.py).
 * HTML-velden bevatten alleen b, em, a en br.
 */
export type DienstBlok =
  /** Tekstblok: alinea's (HTML) die op de oude site met een witregel gescheiden waren */
  | { t: 'p'; alineas: string[] }
  /** Tussenkop */
  | { t: 'h'; x: string }
  /** Vette tussenregel */
  | { t: 'b'; x: string }
  /** Vinkjeslijst (items als HTML) */
  | { t: 'ul'; items: string[] }
  /** Tabel "Voordelen / Wat wij doen" */
  | { t: 'tabel'; kop: string[]; rijen: string[][] }
  /** Knoppen "Gratis intakegesprek" en "Online afspraak inplannen" */
  | { t: 'knoppen' }

export type Dienst = {
  slug: string
  /** Naam van de dienst (titel in WordPress) */
  naam: string
  h1: string
  sub: string
  seoTitle: string
  description: string
  /** Vinkjes in de titelbalk (HTML), alleen bij de hoofddiensten */
  bannerPunten: string[]
  /** Hoofddienst: met werkwijze en CTA-band onder de tekst */
  uitgebreid: boolean
  blokken: DienstBlok[]
  /** Eigen veelgestelde vragen (antwoorden als HTML) */
  faq: FaqItem[]
}

export const diensten = data as Dienst[]

export function vindDienst(slug: string): Dienst | undefined {
  return diensten.find((d) => d.slug === slug)
}
