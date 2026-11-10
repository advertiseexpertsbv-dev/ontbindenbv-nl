import type { ReactNode } from 'react'

/** Invoerveld en tekstvak: stijl staat in BLOK-D van src/styles.css (zwarte rand, 4px hoeken, 52px/100px hoog, padding 16px 32px) */
export const inputClass = 'form-invoer'

/**
 * Veld met label (16px, 14px onder 768px), klein rood sterretje en een eventuele foutmelding direct onder het veld.
 * Bij een fout wordt het label rood, zoals bij Gravity Forms. Het veld zelf krijgt aria-invalid en aria-describedby van de aanroeper.
 */
export function Veld({
  label,
  htmlFor,
  children,
  required,
  fout,
  foutId,
}: {
  label: string
  htmlFor: string
  children: ReactNode
  required?: boolean
  fout?: string | null
  foutId?: string
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={`mb-2 block text-[14px] font-normal leading-[1.4] md:text-[16px] ${fout ? 'text-form-fout' : 'text-body'}`}>
        <span className="pe-[0.125em]">{label}</span>
        {required && (
          <span className="ml-0.5 text-[13.008px] text-form-fout" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {fout && (
        <p id={foutId} className="mt-2 text-[12px] font-normal leading-[1.8] text-form-fout">
          {fout}
        </p>
      )}
    </div>
  )
}

/**
 * Versturen-knop zoals de oude site (blauwe verlooppil; stijl .form-knop in src/styles.css).
 * Tijdens het verzenden blijft de knop blauw met een draaiend icoon (aria-busy) en krijgt hij geen disabled: een disabled knop
 * verliest de focus, waardoor toetsenbordgebruikers niet weten waar ze zijn. Dubbel verzenden blokkeert de aanroeper met `bezig`.
 * De statusmelding voor schermlezers staat naast de knop, zodat de naam van de knop gelijk blijft. Tekst 'Vraag gratis advies aan'
 * i.p.v. 'Versturen': zegt wat er gebeurt (campagnecontrole 2026-11-10).
 */
export function VerstuurKnop({ bezig, className = '', tekst = 'Vraag gratis advies aan' }: { bezig: boolean; className?: string; tekst?: string }) {
  return (
    <>
      <button type="submit" className={`form-knop ${className}`} aria-busy={bezig ? 'true' : undefined} aria-disabled={bezig ? 'true' : undefined}>
        <span className={bezig ? 'invisible' : undefined}>{tekst}</span>
        {bezig && <span className="form-spinner" aria-hidden="true" />}
      </button>
      <p role="status" className="sr-only">
        {bezig ? 'Bezig met versturen…' : ''}
      </p>
    </>
  )
}

/** Melding voor fouten van de server (te veel aanvragen, technische fout). Fouten per veld staan onder het veld zelf. */
export function Foutmelding({ tekst }: { tekst: string | null }) {
  if (!tekst) return null
  return (
    <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
      {tekst}
    </p>
  )
}
