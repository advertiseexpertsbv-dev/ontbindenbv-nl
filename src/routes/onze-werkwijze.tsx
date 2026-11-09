import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { paginas } from '../content/paginas'
import PaginaKop from '../components/sections/PaginaKop'
import Werkwijze from '../components/sections/Werkwijze'
import CtaBand from '../components/sections/CtaBand'
import Reviews from '../components/sections/Reviews'
import Faq from '../components/sections/Faq'
import ContactBlok from '../components/sections/ContactBlok'

export const Route = createFileRoute('/onze-werkwijze')({
  head: () => seo(paginas.werkwijze),
  component: () => (
    <>
      <PaginaKop titel="Onze werkwijze" kruimels={[{ label: 'Onze werkwijze' }]} />
      <Werkwijze />
      <CtaBand />
      <Reviews />
      <Faq />
      <ContactBlok />
    </>
  ),
})
