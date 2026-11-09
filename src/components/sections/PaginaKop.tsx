import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { beeld, SIZES } from '../../lib/beeld'
import { Container } from '../ui'

/**
 * Titelbalk van onderliggende pagina's, zoals de oude site: padding 72px, kruimelpad ("Home" halfvet) en titel (h1).
 *
 * variant="blauw" (standaard): het blauwe verloop met rechtsonder de grote letters "BV" (600px, vanaf 768px), witte tekst
 * (over ons, contact, diensten, juridisch). Onder de titel optioneel een ondertitel (22px) en vinkjes (dienstpagina's).
 * variant="licht": lichte balk met de bg-full-textuur en blauwe tekst (kennisbank).
 */
export default function PaginaKop({
  titel,
  kruimels = [],
  sub,
  variant = 'blauw',
  children,
}: {
  titel: string
  kruimels?: { label: string; to?: string }[]
  sub?: string
  variant?: 'blauw' | 'licht'
  children?: ReactNode
}) {
  const licht = variant === 'licht'
  const tekst = licht ? 'text-brand-700' : 'text-white'
  return (
    <section className={licht ? 'bg-textuur relative' : 'bg-verloop relative isolate overflow-hidden text-white'}>
      {!licht && (
        <img
          {...beeld('/images/site/banner-bv.webp', SIZES.bannerBv)}
          alt=""
          width={600}
          height={475}
          decoding="async"
          className="pointer-events-none absolute right-0 bottom-0 -z-10 hidden h-auto w-[600px] md:block"
        />
      )}
      <Container className="py-[72px]">
        {kruimels.length > 0 && (
          <nav aria-label="Kruimelpad" className={tekst}>
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
        <h1 className={`w-fit ${licht ? '!text-brand-700' : '!text-white'} ${sub || children ? 'mb-4' : ''}`}>{titel}</h1>
        {sub && <p className={`text-[18px] leading-[1.125] font-normal md:text-[22px] ${tekst}`}>{sub}</p>}
        {children}
      </Container>
    </section>
  )
}
