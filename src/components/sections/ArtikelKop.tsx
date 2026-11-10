import { datumNL } from '../../content/blog-types'
import { beeld, SIZES } from '../../lib/beeld'
import { Container } from '../ui'

/**
 * Titelbalk van een artikel zoals de oude site: de blauwe balk (verloop met de letters "BV", 250px hoog) met daaroverheen een
 * lichte kaart die 120px onder de balk uitsteekt, met de titel en daaronder avatar en de regel "Geplaatst door". De sectie
 * na deze kop geeft 184px bovenruimte (zie $slug.tsx).
 */
export default function ArtikelKop({ titel, datum, taal }: { titel: string; datum: string; taal?: string }) {
  return (
    <section className="bg-verloop relative isolate flex min-h-[250px] items-end">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <img {...beeld('/images/site/banner-bv.webp', SIZES.bannerBv)} alt="" width={600} height={475} decoding="async" className="absolute right-0 bottom-0 hidden h-auto w-[600px] md:block" />
      </div>
      <Container className="relative -mb-[120px] pt-10">
        <div className="rounded-2xl border border-line bg-white p-8 shadow-zwevend md:p-12">
          <h1 lang={taal} className="mb-4 hyphens-auto [hyphenate-limit-chars:12_4_4] md:hyphens-manual">
            {titel}
          </h1>
          <div className="flex items-center gap-4 text-[15px] text-body">
            <img src="/images/site/auteur.webp" alt="" width={50} height={50} className="size-[50px] shrink-0 rounded-full object-cover" />
            <p>
              <b>Geplaatst door:</b>
              <br />
              Peter Brouwers, op <time dateTime={datum}>{datumNL(datum)}</time>
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
