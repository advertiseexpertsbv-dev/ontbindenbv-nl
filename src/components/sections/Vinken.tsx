import { FaCheck } from './icons'

/** Lijst met gele vinkjes ("Gratis Intakegesprek", "25 Jaar Ervaring", ...) zoals op de oude site: 26px gele cirkel met wit vinkje */
export default function Vinken({ items, licht, className = '' }: { items: readonly string[]; licht?: boolean; className?: string }) {
  return (
    <ul className={`flex flex-col gap-4 ${className}`}>
      {items.map((t) => (
        <li key={t} className="flex items-center gap-4">
          <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-accent p-[5px] text-white">
            <FaCheck className="size-4" />
          </span>
          <span className={licht ? 'text-white' : undefined}>{t}</span>
        </li>
      ))}
    </ul>
  )
}
