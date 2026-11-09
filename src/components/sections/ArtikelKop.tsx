import type { CSSProperties } from 'react'
import { datumNL } from '../../content/blog-types'
import { Container } from '../ui'

/**
 * Titelbalk van een artikel zoals de oude site: een fotobanner van 250px met de afbeelding van het
 * artikel (blauwe overlay), waaroverheen een lichte kaart hangt (120px onder de banner) met de titel
 * in merkblauw en daaronder avatar en 'Geplaatst door'-regel. De sectie na deze kop geeft 184px
 * bovenruimte (zie $slug.tsx). Stijlen: .artikel-foto in styles.css (BLOK-C).
 */
export default function ArtikelKop({ titel, image, datum, taal }: { titel: string; image: string | null; datum: string; taal?: string }) {
  return (
    <section
      className={`relative z-[1] flex min-h-[250px] items-end ${image ? 'artikel-foto' : ''}`}
      style={image ? ({ '--artikel-foto-url': `url("${image}")` } as CSSProperties) : undefined}
    >
      {/* Kaart hangt 120px onder de banner. Bij een lange titel (kaart hoger dan 394px) groeit de banner mee, zodat de titel leesbaar
          blijft; -mt-6: tot 24px mag de kaart achter de header schuiven, net als op de oude site (daar tot de titel zelf afgekapt wordt). */}
      <Container className="relative -mb-[120px] -mt-6">
        <div className="rounded-[4px] bg-textuur p-12">
          <h1 lang={taal} className="artikel-titel mb-4">{titel}</h1>
          <div className="flex items-center gap-4 text-text">
            {/* Avatar zoals de oude site: de foto van Peter voor het schilderij, vierkant bijgesneden (100px, voor scherpe weergave op 50px) */}
            <img src="/images/blog/auteur-peter-100.webp" alt="" width={50} height={50} className="size-[50px] shrink-0 rounded-full object-cover" />
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
