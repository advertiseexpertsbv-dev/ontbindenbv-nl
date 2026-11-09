import { werkwijze } from '../../content/home'
import { Container } from '../ui'

/**
 * "Onze werkwijze": links kop en intro (40%), rechts de vijf stappen (60%) met een cirkel van 48px naast de blauwe titel,
 * de tekst 64px ingesprongen en een gestippelde lijn tussen de cirkels, zoals de oude site.
 * De prop compact (dienstpagina's) is behouden voor bestaande aanroepen; de oude site kent één weergave.
 */
export default function Werkwijze(props: { compact?: boolean }) {
  void props
  return (
    <section id="werkwijze" className="py-[72px]" data-reveal suppressHydrationWarning>
      <Container>
        <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
          <div className="min-[992px]:w-[40%] min-[992px]:pr-4">
            <h2 className="mb-4 text-[30px] md:text-[40px]">Onze werkwijze</h2>
            <p>
              Dé Belastingbemiddelaar is transparant en efficiënt. We willen het proces van het oplossen van fiscale problemen zo soepel en stressvrij mogelijk maken voor onze klanten. Daarom hanteren we de volgende stappen om jouw belastingzaken op te lossen:
            </p>
          </div>
          <div className="min-[992px]:w-[60%] min-[992px]:pl-4">
            <ol className="flex flex-col gap-12">
              {werkwijze.map((s, i) => (
                <li key={s.titel} className="relative">
                  <h3 className="mb-4 flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full border border-oud-rand bg-brand-700 text-white">{i + 1}</span>
                    {s.titel}
                  </h3>
                  <p className="ml-16">{s.tekst}</p>
                  {i < werkwijze.length - 1 && <span className="absolute left-6 top-12 h-full border-l border-dashed border-brand-700" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  )
}
