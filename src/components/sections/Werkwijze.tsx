import { werkwijze, werkwijzeIntro } from '../../content/home'
import { Container } from '../ui'

/**
 * "Onze werkwijze": links kop en intro (40%), rechts de vijf stappen (60%) met een cirkel van 48px naast de blauwe titel,
 * de tekst 64px ingesprongen en een gestippelde lijn tussen de cirkels, zoals de oude site.
 */
export default function Werkwijze() {
  return (
    <section id="werkwijze" className="py-sectie" data-reveal suppressHydrationWarning>
      <Container>
        <div className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:gap-0">
          <div className="min-[992px]:w-[40%] min-[992px]:pr-4">
            <h2 className="mb-4">Onze werkwijze</h2>
            <p>{werkwijzeIntro}</p>
          </div>
          <div className="min-[992px]:w-[60%] min-[992px]:pl-4">
            <ol className="flex flex-col gap-10">
              {werkwijze.map((s, i) => (
                <li key={s.titel} className="relative">
                  <h3 className="mb-2 flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-700 text-[18px] font-bold text-white shadow-[0_0_0_6px_var(--color-brand-50)]">{i + 1}</span>
                    {s.titel}
                  </h3>
                  <p className="ml-16 text-body">{s.tekst}</p>
                  {i < werkwijze.length - 1 && <span className="absolute top-14 left-6 h-[calc(100%-1rem)] border-l-2 border-dashed border-brand-200" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  )
}
