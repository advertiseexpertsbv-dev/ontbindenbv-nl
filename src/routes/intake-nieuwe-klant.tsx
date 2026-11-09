import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import IntakeFormulier from '../components/forms/IntakeFormulier'
import { Container } from '../components/ui'

export const Route = createFileRoute('/intake-nieuwe-klant')({
  head: () => seo({ title: 'Bellers – Intake nieuwe klant', description: 'Interne intake voor de bellers van Belasting Bemiddelaar.', path: '/intake-nieuwe-klant/', noindex: true }),
  component: () => (
    // Zoals de oude pagina: lichtblauwe sectie (72px boven en onder), witte kaart met 4px hoeken en padding 64px 48px, kop 40px/800 (30px/800 op mobiel)
    <section className="bg-bkg-light py-[72px]">
      <Container>
        <div className="rounded-[4px] bg-white px-12 py-16">
          <h1 className="mb-4">Bellers – Intake nieuwe klant</h1>
          <IntakeFormulier />
        </div>
      </Container>
    </section>
  ),
})
