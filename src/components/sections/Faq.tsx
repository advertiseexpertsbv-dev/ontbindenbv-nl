import { useState } from 'react'
import { faq as homeFaq, type FaqItem } from '../../content/home'
import { Container } from '../ui'
import { FaqIcoon } from './icons'

/**
 * Veelgestelde vragen zoals de oude site: vraag in merkblauw (18px vet) met een blauwe lijn eronder, het antwoord eronder.
 * Op de oude site staan alle antwoorden open; hier ook, en een klik op de vraag klapt het antwoord in of uit.
 * items: per dienstpagina eigen vragen (antwoorden als HTML), anders die van de homepage.
 */
export default function Faq({ items = homeFaq }: { items?: FaqItem[] }) {
  const [dicht, setDicht] = useState<number[]>([])
  if (items.length === 0) return null
  return (
    <section className="py-[72px]" data-reveal suppressHydrationWarning>
      <Container>
        <h2 className="mb-8 text-center">Veelgestelde vragen</h2>
        <div className="flex flex-col">
          {items.map((f, i) => {
            const open = !dicht.includes(i)
            return (
              <div key={f.v} className="px-8 py-2 md:px-12">
                <h3 className="m-0 text-[18px] leading-[1.125] font-bold">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-${i}`}
                    onClick={() => setDicht((d) => (open ? [...d, i] : d.filter((x) => x !== i)))}
                    className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center justify-between gap-4 border-b border-brand-700 pb-4 text-left"
                  >
                    {f.v}
                    <FaqIcoon open={open} />
                  </button>
                </h3>
                <div id={`faq-${i}`} hidden={!open} className="faq-antwoord mt-4" dangerouslySetInnerHTML={{ __html: f.a }} />
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
