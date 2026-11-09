/**
 * Client-veilige typen en hulpfuncties voor blogartikelen. De artikelen zelf (blog.json, 1,5 MB)
 * staan in blog.ts en worden alleen server-side geladen via src/server/blog.ts, zodat ze niet in
 * de JS-bundel van de bezoeker belanden.
 */

export type Post = {
  slug: string
  title: string
  date: string
  modified: string
  excerpt: string
  image: string | null
  imageW: number | null
  imageH: number | null
  seoTitle: string
  seoDescription: string
  /** Alleen gezet bij een Engelstalig artikel ('en'); ontbreekt bij Nederlandse artikelen */
  taal?: string
  html: string
  /** Nieuwe artikelen (m1, okt 2026): alt-tekst van de uitgelichte afbeelding */
  imageAlt?: string
  /** og:image 1200×630 met afmetingen en alt */
  ogBeeld?: { src: string; w: number; h: number; alt: string }
  /** Artikelspecifieke FAQ (voor FAQPage-schema); de vragen staan ook in de tekst */
  faq?: { vraag: string; antwoord: string }[]
}

/** Wat een nieuwskaart nodig heeft (zonder artikeltekst) */
export type Kaart = {
  slug: string
  title: string
  date: string
  image: string | null
  /** Eerste 10 woorden van de samenvatting, zoals de oude site */
  kort: string
  /** Taal van titel en samenvatting als die niet Nederlands is ('en'), voor het lang-attribuut */
  taal?: string
}

export function datumNL(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}
