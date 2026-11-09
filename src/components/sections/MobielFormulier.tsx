import { kaart } from '../../content/home'
import LeadForm from '../forms/LeadForm'

/**
 * Kort formulier (naam, telefoon, e-mail) direct onder de hero, alleen onder 768px. Zelfde endpoint, validatie en
 * generate_lead-tracking als de formulierkaart, met form_location 'mobiel_onder_hero'. Vanaf 768px verborgen; daar blijft
 * de bestaande kaart staan.
 */
export default function MobielFormulier({ formulier, className = '' }: { formulier: string; className?: string }) {
  return (
    <aside id="mobiel-formulier" className={`bg-textuur scroll-mt-4 rounded-sm border border-bkg-light p-6 md:hidden ${className}`} aria-label="Contactformulier">
      <h2 className="mb-2 text-[18px]">{kaart.titel}</h2>
      <p className="mb-4">{kaart.sub}</p>
      <LeadForm formulier={formulier} kort locatie="mobiel_onder_hero" />
    </aside>
  )
}
