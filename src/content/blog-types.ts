/**
 * Client-veilige typen en hulpfuncties voor de artikelen van de kennisbank. De artikelen zelf (blog.json) staan in blog.ts en
 * worden alleen server-side geladen via src/server/blog.ts, zodat ze niet in de JS-bundel van de bezoeker belanden.
 */

export type Post = {
  slug: string
  title: string
  date: string
  modified: string
  excerpt: string
  /** Tekst onder de titel in het kennisbankoverzicht, letterlijk van de oude site */
  kort: string
  image: string | null
  imageW: number | null
  imageH: number | null
  /** Alt-tekst van de uitgelichte afbeelding (WordPress-mediabibliotheek) */
  imageAlt?: string
  /** Exacte <title> en meta description van de oude pagina */
  seoTitle: string
  seoDescription: string
  /** Alleen gezet bij een Engelstalig artikel ('en') */
  taal?: string
  /** Veelgestelde vragen uit het FAQPage-schema dat in de oude tekst stond (voor het schema in de head) */
  faq?: { vraag: string; antwoord: string }[]
  /** Inhoudsopgave: de h2's van de tekst (met id) */
  toc: { id: string; tekst: string }[]
  html: string
  /** og:image met afmetingen en alt (optioneel, voor nieuwe artikelen) */
  ogBeeld?: { src: string; w: number; h: number; alt: string }
}

/** Wat een kaart in het kennisbankoverzicht nodig heeft (zonder artikeltekst) */
export type Kaart = {
  slug: string
  title: string
  image: string | null
  kort: string
  /** Taal van titel en tekst als die niet Nederlands is ('en'), voor het lang-attribuut */
  taal?: string
}

export function datumNL(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}
