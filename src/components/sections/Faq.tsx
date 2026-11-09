import { useState } from 'react'
import { faq } from '../../content/home'
import { Container } from '../ui'
import { FaqIcoon } from './icons'

/**
 * Veelgestelde vragen als accordion zoals de oude site: er staat altijd één vraag open (op een lichtblauw paneel),
 * elke vraag heeft een blauwe scheidslijn en een vol plus/min-teken, en het openen glijdt in ca. 0,5 seconde.
 */
export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="py-[72px]" data-reveal suppressHydrationWarning>
      <Container>
        <h2 className="mb-8 text-center">Veelgestelde vragen</h2>
        <div className="flex flex-col">
          {faq.map((f, i) => {
            const open_ = open === i
            return (
              <div key={f.v} className={`px-8 transition-[margin,padding,background-color] duration-500 md:px-12 ${open_ ? 'my-4 bg-bkg-light py-8 md:py-[50px]' : 'py-2'}`}>
                <h3 className="m-0 text-[18px]">
                  <button
                    type="button"
                    aria-expanded={open_}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(i)}
                    className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center justify-between gap-4 border-b border-brand-700 pb-4 text-left"
                  >
                    {f.v}
                    <FaqIcoon open={open_} />
                  </button>
                </h3>
                <div id={`faq-${i}`} inert={!open_} className={`grid transition-[grid-template-rows] duration-500 ${open_ ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <p className="mt-4">{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.v, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}
