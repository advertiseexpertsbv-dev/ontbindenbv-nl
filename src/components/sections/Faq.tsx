import { useState } from 'react'
import { faq as homeFaq, type FaqItem } from '../../content/home'
import { Container } from '../ui'
import { FaqIcoon } from './icons'

/**
 * Veelgestelde vragen als uitklaplijst (ontwerpronde 2026-11-10): elke vraag is een afgeronde kaart met een plus/min-knop.
 * De eerste vraag staat open, de rest is dicht; een klik op de vraag klapt het antwoord in of uit. De antwoorden staan altijd in
 * de HTML (alleen met `hidden` verborgen), dus zoekmachines en het FAQPage-schema zien dezelfde tekst als voorheen.
 * items: per dienstpagina eigen vragen (antwoorden als HTML), anders die van de homepage.
 */
export default function Faq({ items = homeFaq }: { items?: FaqItem[] }) {
  const [open, setOpen] = useState<number[]>([0])
  if (items.length === 0) return null
  return (
    <section className="py-sectie" data-reveal suppressHydrationWarning>
      <Container className="max-w-[880px]">
        <h2 className="mb-8 text-center md:mb-12">Veelgestelde vragen</h2>
        <div className="flex flex-col gap-3">
          {items.map((f, i) => {
            const isOpen = open.includes(i)
            return (
              <div
                key={f.v}
                className={`rounded-2xl border transition-[border-color,background-color,box-shadow] duration-200 ${isOpen ? 'border-brand-200 bg-white shadow-kaart' : 'border-line bg-white hover:border-brand-200'}`}
              >
                <h3 className="m-0 text-[17px] leading-[1.4] font-semibold tracking-[-0.01em] md:text-[18px]">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen((o) => (isOpen ? o.filter((x) => x !== i) : [...o, i]))}
                    className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-4 rounded-2xl px-5 py-4 text-left text-brand-900 md:px-7 md:py-5"
                  >
                    {f.v}
                    <span
                      aria-hidden="true"
                      className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-200 ${isOpen ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-700'}`}
                    >
                      <FaqIcoon open={isOpen} className="size-3" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-${i}`}
                  hidden={!isOpen}
                  className="faq-antwoord px-5 pb-5 text-[16px] leading-[1.65] md:px-7 md:pb-6 md:text-[17px]"
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

/** Platte tekst van een HTML-antwoord (voor schema.org) */
function tekst(html: string) {
  return html
    .replace(/<\/p>\s*<p>/g, ' ')
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export function faqSchema(items: FaqItem[] = homeFaq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.v, acceptedAnswer: { '@type': 'Answer', text: tekst(f.a) } })),
  }
}
