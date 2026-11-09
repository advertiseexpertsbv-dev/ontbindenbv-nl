import { site } from '../../lib/site'
import { FaPhone } from './icons'

/** "Bel direct op: ..." met bereikbaarheidsregel en groene stip (onder het formulier in de herokaart en op de foto in de intro) */
export default function BelDirect({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <FaPhone className="size-4 shrink-0 text-brand-700" />
      <div>
        <a href={site.phoneHref} className="tik block text-[18px] font-medium leading-[1.3] text-brand-700 md:text-[20px]">
          Bel direct op:&nbsp;<span className="inline-block whitespace-nowrap">{site.phone}</span>
        </a>
        <span className="flex items-center gap-1 text-[12px] text-muted before:block before:size-2 before:shrink-0 before:rounded-full before:bg-online before:content-['']">
          {site.belTijden}
        </span>
      </div>
    </div>
  )
}
