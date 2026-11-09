import LeadForm from '../forms/LeadForm'
import BelDirect from './BelDirect'

/**
 * Lichtblauwe formulierkaart (hero, dienst- en artikelpagina's): patroon, scherpe hoeken, telefoonblok eronder.
 * Binnenruimte zoals de oude zijkolomkaart: 32px, vanaf 992px 48px (de hero op de homepage geeft zelf md:p-12 mee: daar is het
 * al vanaf 768px 48px). Kop 18px (20px vanaf 768px), geen schaduw en niet plakkend.
 */
export default function KaartFormulier({ formulier = 'Hero', titel = 'Waar kunnen we je mee helpen?', className = '' }: { formulier?: string; titel?: string; className?: string }) {
  return (
    <aside className={`bg-textuur w-full rounded-sm border border-bkg-light p-8 text-body min-[992px]:p-12 ${className}`} aria-label="Contactformulier">
      <h2 className="mb-4 text-[18px] font-bold md:text-[20px]">{titel}</h2>
      <p className="mb-8">Altijd kosteloos en vrijblijvend advies&nbsp;gesprek.</p>
      <LeadForm formulier={formulier} />
      <BelDirect className="mt-6" />
    </aside>
  )
}
