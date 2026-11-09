import { createFileRoute } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { paginas } from '../content/paginas'
import { cookiebeleid } from '../content/juridisch'
import JuridischePagina from '../components/sections/JuridischePagina'

export const Route = createFileRoute('/cookiebeleid-eu')({
  head: () => seo(paginas.cookiebeleid),
  component: () => <JuridischePagina titel="Cookiebeleid (EU)" html={cookiebeleid} />,
})
