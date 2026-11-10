import { kaart } from '../../content/home'
import LeadForm from '../forms/LeadForm'
import BelDirect from './BelDirect'

/**
 * Witte formulierkaart (hero, dienst- en artikelpagina's): 16px hoeken, dunne rand en zachte schaduw (zwevend: diepere schaduw,
 * voor de kaart die over de hero heen valt), kop "Direct kosteloos advies." (22/26px), telefoonblok eronder. text-body: in de
 * hero (text-white) zou de toelichting anders wit op wit staan.
 */
export default function KaartFormulier({
  formulier = 'Hero',
  titel = kaart.titel,
  zwevend = false,
  className = '',
}: {
  formulier?: string
  titel?: string
  zwevend?: boolean
  className?: string
}) {
  return (
    <aside
      className={`w-full rounded-2xl border border-line bg-white p-6 text-body sm:p-8 min-[992px]:p-10 ${zwevend ? 'shadow-zwevend' : 'shadow-kaart'} ${className}`}
      aria-label="Contactformulier"
    >
      <h2 className="mb-2 text-[22px] md:text-[26px]">{titel}</h2>
      <p className="mb-6 text-muted">{kaart.sub}</p>
      <LeadForm formulier={formulier} />
      <BelDirect className="mt-6" />
    </aside>
  )
}
