import { kaart } from '../../content/home'
import LeadForm from '../forms/LeadForm'
import BelDirect from './BelDirect'

/**
 * Lichtblauwe formulierkaart (hero, dienst- en artikelpagina's) zoals de oude site: patroon, 4px hoeken, binnenruimte 32px
 * (vanaf 992px 48px), kop "Direct kosteloos advies." als h3 (18/22px), telefoonblok eronder.
 */
export default function KaartFormulier({ formulier = 'Hero', titel = kaart.titel, className = '' }: { formulier?: string; titel?: string; className?: string }) {
  return (
    <aside className={`bg-textuur w-full rounded-sm border border-bkg-light p-8 min-[992px]:p-12 ${className}`} aria-label="Contactformulier">
      <h2 className="mb-4 text-[18px] md:text-[22px]">{titel}</h2>
      <p className="mb-8">{kaart.sub}</p>
      <LeadForm formulier={formulier} />
      <BelDirect className="mt-6" />
    </aside>
  )
}
