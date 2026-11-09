import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

/**
 * Zelfde kader als de oude site: max 1272px breed met 16px zijmarge (dus 1240px inhoud), op elke breedte.
 * Heeft de className zelf een max-w-, dan geldt die (smalle tekstkolom) in plaats van de standaardbreedte.
 */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  const eigenBreedte = /(^|\s)(?:[\w-]+:)*max-w-/.test(className)
  return <div className={`mx-auto w-full px-4 ${eigenBreedte ? '' : 'max-w-[1272px]'} ${className}`}>{children}</div>
}

export function Section({
  children,
  className = '',
  id,
  reveal = true,
}: {
  children: ReactNode
  className?: string
  id?: string
  reveal?: boolean
}) {
  return (
    <section
      id={id}
      {...(reveal ? { 'data-reveal': true } : {})}
      suppressHydrationWarning
      className={`py-[72px] ${className}`}
    >
      <Container>{children}</Container>
    </section>
  )
}

type ButtonProps = {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: 'blue' | 'yellow' | 'white' | 'outline' | 'outlineLight' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'header'
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
  arrow?: boolean
}

/* Knop van de oude site: pil, padding 16px 32px + 1px rand, tekst 14px (onder 768px) of 17px in gewone dikte, regelhoogte 1.8.
   Kleurwissel bij hover is direct (oud: transition 0s); alleen het pijltje schuift in 0,3s (zie `arrow` hieronder). */
const base =
  'group inline-flex items-center justify-center rounded-full border font-normal leading-[1.8] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px whitespace-nowrap'
const variants = {
  // Oude site: bij hover wordt alleen de vulling donker (#03396c), de rand blijft merkblauw
  blue: 'border-brand-700 bg-brand-700 text-white hover:bg-brand-hover',
  yellow: 'border-accent bg-accent text-brand-950 hover:border-accent-dark hover:bg-accent-dark',
  // Oude site: bij hover wordt de vulling blauw en de tekst wit, de witte rand blijft staan
  white: 'border-white bg-white text-brand-700 hover:bg-brand-700 hover:text-white',
  outline: 'border-transparent bg-transparent text-brand-700 ring-2 ring-brand-700 hover:bg-brand-700 hover:text-white',
  outlineLight: 'border-transparent bg-transparent text-white ring-2 ring-white/80 hover:bg-white hover:text-brand-700',
  ghost: 'border-transparent text-brand-700 hover:bg-brand-50',
}
const sizes = {
  sm: 'px-6 py-2.5 text-[14px]',
  md: 'px-8 py-4 text-[14px] md:text-[17px]',
  // De oude site kent één knopmaat; lg blijft beschikbaar voor bestaande aanroepen
  lg: 'px-8 py-4 text-[14px] md:text-[17px]',
  // Header op 992-1239px: compacter, zodat logo, telefoon en beide knoppen op één regel passen (de oude header loopt daar over)
  header: 'px-5 py-4 text-[14px] min-[992px]:text-[15px] min-[1100px]:px-6 min-[1200px]:px-8 min-[1200px]:text-[17px]',
}

export function Button({ children, href, onClick, variant = 'blue', size = 'md', type = 'button', className = '', disabled, arrow }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`
  const inhoud = arrow ? (
    <span className="relative flex items-center pr-5 transition-[padding] duration-300 group-hover:pl-5 group-hover:pr-0">
      {children}
      <span aria-hidden="true" className="btn-pijl absolute left-full -translate-x-full transition-all duration-300 group-hover:left-0 group-hover:translate-x-0" />
    </span>
  ) : (
    children
  )
  if (href) {
    if (/^(tel:|mailto:|https?:)/.test(href)) {
      return (
        <a href={href} className={classes}>
          {inhoud}
        </a>
      )
    }
    return (
      <Link to={href} className={classes}>
        {inhoud}
      </Link>
    )
  }
  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {inhoud}
    </button>
  )
}

type IconProps = { className?: string }
const svg = (d: string, extra = {}) =>
  function Icon({ className = 'size-5' }: IconProps) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...extra}>
        <path d={d} />
      </svg>
    )
  }

export const ChevronRight = svg('M9 6l6 6-6 6', { strokeWidth: 3 })
export const ChevronDown = svg('M6 9l6 6 6-6')
export const ChevronLeft = svg('M15 6l-6 6 6 6', { strokeWidth: 3 })
export const Plus = svg('M12 5v14M5 12h14')
export const Minus = svg('M5 12h14')
export const Menu = svg('M4 7h16M4 12h16M4 17h16')
export const Close = svg('M6 6l12 12M18 6L6 18')
export const Phone = svg('M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z')
export const Mail = svg('M3 6h18v12H3zM3 7l9 6 9-6')
export const Clock = svg('M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z')
export const Pin = svg('M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11zM12 12a2 2 0 100-4 2 2 0 000 4z')
export const CheckCircle = svg('M21 12a9 9 0 11-18 0 9 9 0 0118 0zM8 12.5l3 3 5-6')

/** Gevulde hoorn en ster uit de oude site (FontAwesome-paden) */
export function PhoneFill({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 22 28" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 19.375c0 0.562-0.25 1.656-0.484 2.172-0.328 0.766-1.203 1.266-1.906 1.656-0.922 0.5-1.859 0.797-2.906 0.797-1.453 0-2.766-0.594-4.094-1.078-0.953-0.344-1.875-0.766-2.734-1.297-2.656-1.641-5.859-4.844-7.5-7.5-0.531-0.859-0.953-1.781-1.297-2.734-0.484-1.328-1.078-2.641-1.078-4.094 0-1.047 0.297-1.984 0.797-2.906 0.391-0.703 0.891-1.578 1.656-1.906 0.516-0.234 1.609-0.484 2.172-0.484 0.109 0 0.219 0 0.328 0.047 0.328 0.109 0.672 0.875 0.828 1.188 0.5 0.891 0.984 1.797 1.5 2.672 0.25 0.406 0.719 0.906 0.719 1.391 0 0.953-2.828 2.344-2.828 3.187 0 0.422 0.391 0.969 0.609 1.344 1.578 2.844 3.547 4.813 6.391 6.391 0.375 0.219 0.922 0.609 1.344 0.609 0.844 0 2.234-2.828 3.187-2.828 0.484 0 0.984 0.469 1.391 0.719 0.875 0.516 1.781 1 2.672 1.5 0.313 0.156 1.078 0.5 1.188 0.828 0.047 0.109 0.047 0.219 0.047 0.328z" />
    </svg>
  )
}

export function StarFill({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 26 28" fill="currentColor" className={className} aria-hidden="true">
      <path d="M26 10.109c0 0.281-0.203 0.547-0.406 0.75l-5.672 5.531 1.344 7.812c0.016 0.109 0.016 0.203 0.016 0.313 0 0.406-0.187 0.781-0.641 0.781-0.219 0-0.438-0.078-0.625-0.187l-7.016-3.687-7.016 3.687c-0.203 0.109-0.406 0.187-0.625 0.187-0.453 0-0.656-0.375-0.656-0.781 0-0.109 0.016-0.203 0.031-0.313l1.344-7.812-5.688-5.531c-0.187-0.203-0.391-0.469-0.391-0.75 0-0.469 0.484-0.656 0.875-0.719l7.844-1.141 3.516-7.109c0.141-0.297 0.406-0.641 0.766-0.641s0.625 0.344 0.766 0.641l3.516 7.109 7.844 1.141c0.375 0.063 0.875 0.25 0.875 0.719z" />
    </svg>
  )
}

export function Linkedin({ className = 'size-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3a2 2 0 100 4 2 2 0 000-4zM20.44 13.1c0-3.1-1.65-4.7-3.86-4.7a3.3 3.3 0 00-2.97 1.63V8.5h-3.37V20h3.37v-6.1c0-1.6.3-3.15 2.3-3.15 1.96 0 1.99 1.83 1.99 3.25V20h3.37l.17-6.9z" />
    </svg>
  )
}

export function Star({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
    </svg>
  )
}

export function Stars({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 text-star ${className}`} role="img" aria-label="5 van 5 sterren">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} />
      ))}
    </span>
  )
}

/** Gele vinkjes-lijst zoals "Gratis Intakegesprek / 25 Jaar Ervaring …" */
export function Vinklijst({ items, className = '', light }: { items: readonly string[]; className?: string; light?: boolean }) {
  return (
    <ul className={`space-y-4 ${className}`}>
      {items.map((t) => (
        <li key={t} className={`flex items-center gap-4 ${light ? 'text-white' : ''}`}>
          <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-accent text-white">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          {t}
        </li>
      ))}
    </ul>
  )
}
