import { FaCheck } from './icons'

/**
 * Vinkjeslijst van de oude site: ronde stip van 27px (8px rand om een vinkje van 11px), tekst 18px, 16px tussenruimte.
 * kleur="geel" (standaard): gele stip met donker vinkje; kleur="blauw": blauwe stip met wit vinkje.
 * Items mogen eenvoudige HTML bevatten (vet), zoals de oude site.
 */
export default function Vinken({
  items,
  licht,
  kleur = 'geel',
  className = '',
}: {
  items: readonly string[]
  licht?: boolean
  kleur?: 'geel' | 'blauw'
  className?: string
}) {
  return (
    <ul className={`tekst-vink flex flex-col gap-4 ${className}`}>
      {items.map((t) => (
        <li key={t} className="flex items-center gap-4">
          <Vink kleur={kleur} />
          <span className={licht ? 'text-white' : undefined} dangerouslySetInnerHTML={{ __html: t }} />
        </li>
      ))}
    </ul>
  )
}

export function Vink({ kleur = 'geel', className = '' }: { kleur?: 'geel' | 'blauw'; className?: string }) {
  return (
    <span
      className={`grid size-[27px] shrink-0 place-items-center rounded-full ${kleur === 'geel' ? 'bg-accent text-text' : 'bg-brand-700 text-white'} ${className}`}
      aria-hidden="true"
    >
      <FaCheck className="size-[11px]" />
    </span>
  )
}
