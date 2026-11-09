import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { paginas } from '../content/paginas'
import { privacyverklaring } from '../content/juridisch'
import JuridischePagina from '../components/sections/JuridischePagina'

export const Route = createFileRoute('/privacyverklaring-eu')({
  head: () => seo(paginas.privacyverklaring),
  component: () => <JuridischePagina titel="Privacyverklaring (EU)" html={privacyverklaring} />,
})
