import type { ReactNode } from 'react'

/**
 * Vlak voor een foto die de hoogte van de naastgelegen kolom volgt (vanaf 992px). Gestapeld is het vlak 75vw hoog met
 * maximaal 350px, zoals de oude site. De foto zelf staat er absoluut in (absolute inset-0 size-full object-cover).
 */
export default function FotoVlak({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`relative h-[75vw] max-h-[350px] w-full min-[992px]:h-auto min-[992px]:max-h-none ${className}`}>{children}</div>
}
