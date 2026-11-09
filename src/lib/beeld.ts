/**
 * Responsive afbeeldingen. scripts/beelden-varianten.mjs maakt van elk beeld kleinere varianten
 * (<naam>-<breedte>w.webp, zelfde uitsnede) en schrijft de manifesten src/content/beeldvarianten.json (site, brand)
 * en beeldvarianten-blog.json (blog, alleen server-side). Hier wordt daaruit de srcset gebouwd.
 *
 * `sizes` hoort bij de plek waar het beeld staat en geeft de breedte in beeldpunten die het beeld bij 1x echt nodig heeft.
 * Bij object-cover is dat vaak MEER dan de breedte van het vlak: past de verhouding niet, dan schaalt de browser het beeld
 * op tot de hoogte vol is (de hero is op een telefoon ca. 2100px breed). Gemeten per breedte met Playwright; zie AGENTS.md.
 */
import siteVarianten from '../content/beeldvarianten.json'

/** Manifest: beeldpad → natuurlijke breedte (w) en hoogte (h) en de breedtes van de kleinere varianten (v) */
export type Varianten = Record<string, { w: number; h: number; v: number[] }>

/** Optionele srcset en sizes op een kaart (nieuwsoverzicht), server-side bepaald uit het blog-manifest */
export type MetSrcSet = { imageSrcSet?: string; imageSizes?: string }

/** srcset-waarde (kleinste variant eerst, het origineel als laatste); undefined als er geen kleinere variant is */
export function srcSetVan(src: string, varianten: Varianten): string | undefined {
  const e = varianten[src]
  if (!e || e.v.length === 0) return undefined
  const stam = src.replace(/\.webp$/, '')
  return [...e.v.map((b) => `${stam}-${b}w.webp ${b}w`), `${src} ${e.w}w`].join(', ')
}

/** Props voor een <img> van site/ of brand/: src, plus srcSet en sizes als er varianten zijn. Gebruik: <img {...beeld(src, SIZES.x)} alt="…" /> */
export function beeld(src: string, sizes: string): { src: string; srcSet?: string; sizes?: string } {
  const srcSet = srcSetVan(src, siteVarianten as Varianten)
  return srcSet ? { src, srcSet, sizes } : { src }
}

/** Gemeenschappelijke `sizes` per plek (getoonde breedte bij 1x; bij object-cover de breedte die de hoogte vraagt) */
export const SIZES = {
  /** Header- en footerlogo: vaste getoonde breedte */
  logoHeader: '212px',
  logoFooter: '290px',
  /** Hero (1806x819, cover op een sectie van ca. 730px hoog): bijna altijd het origineel nodig */
  hero: '(min-width: 1800px) 100vw, 1806px',
  /** De letters "BV" in de blauwe titelbalk */
  bannerBv: '600px',
  /** Vrijstaande foto boven de CTA-band (375px breed) */
  cta: '375px',
  /** Home: Peter naast de intro (40% kolom, cover) en het team naast "Geen zorgen" */
  intro: '(min-width: 992px) 760px, 620px',
  team: '(min-width: 992px) 660px, 620px',
  /** ContactBlok: ronde foto van 200px (vanaf 768px), op een telefoon een banner over de volle breedte */
  contactFoto: '(min-width: 768px) 300px, calc(100vw - 32px)',
  /** /contact/ en /gratis-intakegesprek/: teamfoto in de rechterkolom */
  teamContact: '(min-width: 992px) 620px, calc(100vw - 32px)',
  /** /over-ons/: teamfoto naast de tekst */
  teamOverOns: '(min-width: 992px) 520px, calc(100vw - 32px)',
  /** Afbeelding in een artikel: kolom van 745px vanaf 1300px, 60% van de container tussen 992 en 1299px, anders de volle breedte */
  artikel: '(min-width: 1300px) 745px, (min-width: 992px) calc((100vw - 32px) * 0.6 - 16px), calc(100vw - 32px)',
} as const

/**
 * `sizes` voor een foto in een nieuwskaart: vlak van 10:7 (403px breed vanaf 1240px, 3 kolommen vanaf 992px, 2 vanaf 768px, daaronder
 * de volle breedte min 32px) met object-cover. Een foto die liggender is dan 10:7 (bv. 16:9) wordt op de hoogte geschaald en heeft
 * dan meer nodig dan de kaartbreedte (factor 0,7 x breedte/hoogte).
 */
export function kaartSizes(e: { w: number; h: number }): string {
  const f = Math.max(1, (0.7 * e.w) / e.h)
  const k = f.toFixed(2)
  return `(min-width: 1240px) ${Math.round(403 * f)}px, (min-width: 992px) calc((100vw - 64px) / 3 * ${k}), (min-width: 768px) calc((100vw - 48px) / 2 * ${k}), calc((100vw - 32px) * ${k})`
}

/**
 * `sizes` voor een foto in een teamkaart op /over-ons/: kaart 2:3 (403x604 vanaf 1240px; 3 kolommen vanaf 992px, 2 vanaf 768px,
 * daaronder 358px breed) met object-cover. De foto wordt op de hoogte geschaald, dus een liggende foto heeft veel meer nodig dan de
 * kaartbreedte: 1,5x voor een vierkante foto, 2,67x voor Peter bij het schilderij (1600x900), 1,08x voor een staande foto.
 */
export function teamKaartSizes(src: string): string {
  const e = (siteVarianten as Varianten)[src]
  const f = Math.max(1, e ? (1.5 * e.w) / e.h : 1.5)
  const px = (breedte: number) => `${Math.round(breedte * f)}px`
  return `(min-width: 1240px) ${px(403)}, (min-width: 992px) calc((100vw - 64px) / 3 * ${f.toFixed(2)}), (min-width: 768px) calc((100vw - 48px) / 2 * ${f.toFixed(2)}), ${px(358)}`
}

/**
 * Verrijkt de <img>-tags in artikel-html (blog.json, alle tags hebben de vorm <img src width height alt loading>):
 * - srcset + sizes voor beelden waarvan varianten bestaan (de tekst blijft ongewijzigd);
 * - decoding="async";
 * - loading="lazy" ook voor de eerste afbeelding zodra het artikel een uitgelichte afbeelding heeft: die staat boven de tekst
 *   (en krijgt fetchPriority=high), dus de eerste afbeelding in de tekst staat altijd onder de vouw. Zonder uitgelichte
 *   afbeelding blijft de eerste (eager) staan.
 */
export function verrijkArtikelBeelden(html: string, varianten: Varianten, heeftUitgelicht: boolean): string {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    let t = tag
    const src = /\ssrc="([^"]+)"/.exec(t)?.[1]
    const srcSet = src ? srcSetVan(src, varianten) : undefined
    if (srcSet && !/\ssrcset=/.test(t)) {
      t = t.replace(/(\ssrc="[^"]+")/, `$1 srcset="${srcSet}" sizes="${SIZES.artikel}"`)
      // Een variant heeft door afronding een iets andere verhouding dan het origineel (bv. 800x533 i.p.v. 1024x683); met height:auto zou
      // de hoogte dan een fractie van een pixel verschillen en de tekst eronder subpixel verschuiven. De verhouding uit de attributen vastzetten.
      const w = /\swidth="(\d+)"/.exec(t)?.[1]
      const h = /\sheight="(\d+)"/.exec(t)?.[1]
      if (w && h && !/\sstyle=/.test(t)) t = t.replace(/(\sheight="\d+")/, `$1 style="aspect-ratio:${w}/${h}"`)
    }
    if (!/\sdecoding=/.test(t)) t = t.replace(/\s*\/?>$/, ' decoding="async">')
    if (heeftUitgelicht) t = t.replace(/\sloading="eager"/, ' loading="lazy"')
    return t
  })
}
