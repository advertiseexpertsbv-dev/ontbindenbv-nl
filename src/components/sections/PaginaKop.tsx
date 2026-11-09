import { Link } from '@tanstack/react-router'
import { beeld, SIZES } from '../../lib/beeld'
import { Container } from '../ui'

/**
 * Titelbalk van onderliggende pagina's, kruimelpad en titel. Maten zoals de oude site (padding 72px,
 * titel 30/40px extra bold met regelhoogte 1,3, kruimelpad en ondertitel 14/17px met regelhoogte 1,8,
 * omslag bij 768px).
 *
 * variant="foto" (standaard): foto met 50% blauwe laag en witte tekst (over ons, contact, diensten, juridisch).
 * variant="licht": lichte balk met de bg-full-textuur en blauwe tekst, zoals de oude nieuwspagina's
 * (gebruik <PaginaKop variant="licht" ... />).
 */
export default function PaginaKop({
  titel,
  kruimels = [],
  sub,
  variant = 'foto',
}: {
  titel: string
  kruimels?: { label: string; to?: string }[]
  sub?: string
  variant?: 'foto' | 'licht'
}) {
  const licht = variant === 'licht'
  const tekst = licht ? 'text-brand-700' : 'text-white'
  return (
    <section className={licht ? 'bg-textuur relative' : 'relative isolate overflow-hidden bg-diep text-white'}>
      {!licht && (
        <>
          {/* Bovenaan de pagina en het grootste beeld in beeld: de LCP-afbeelding, dus niet lazy en fetchPriority high */}
          <img {...beeld('/images/site/page-banner.webp', SIZES.paginaBanner)} alt="" width={1600} height={445} fetchPriority="high" decoding="async" className="absolute inset-0 -z-20 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-diep/50" />
        </>
      )}
      <Container className="py-[72px]">
        {kruimels.length > 0 && (
          <nav aria-label="Kruimelpad" className={`text-[14px] leading-[1.8] md:text-[17px] ${tekst}`}>
            <Link to="/" className="tik inline-block font-semibold hover:underline">
              Home
            </Link>
            {kruimels.map((k) => (
              <span key={k.label}>
                <span aria-hidden="true">{' » '}</span>
                {k.to ? (
                  <Link to={k.to} className="hover:underline">
                    {k.label}
                  </Link>
                ) : (
                  <span>{k.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {/* w-fit: net als de oude site (flex-item) krijgt de kop de breedte van het langste woord als dat net niet in de kolom past, zodat een kop als 'Navorderingsaanslag?' op 390px niet met een los vraagteken afbreekt */}
        <h1 className={`w-fit text-[30px] font-extrabold leading-[1.3] md:text-[40px] ${licht ? '!text-brand-700' : '!text-white'}`}>{titel}</h1>
        {sub && <p className={`mt-4 text-[14px] leading-[1.8] md:text-[17px] ${tekst}`}>{sub}</p>}
      </Container>
    </section>
  )
}
