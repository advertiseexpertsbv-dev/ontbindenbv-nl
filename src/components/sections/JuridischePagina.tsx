import PaginaKop from './PaginaKop'
import { Container } from '../ui'

/**
 * Privacyverklaring en cookiebeleid: titelbalk plus tekst links uitgelijnd in een kolom van 800px,
 * met de compacte opmaak van de oude cookiebeleid-pagina: tekst 14px met regelhoogte 1,8 (op alle
 * breedtes), alinea's 14px onder, tussenkoppen 22px/800 in merkblauw met 15px boven, 10px onder en
 * 10px padding eronder (oud 38,6px hoog), lijsten met bolletjes, 40px inspringing en 15px marge links. De HTML komt uit src/content/juridisch.ts.
 */
const tekst = [
  'max-w-[800px] text-[14px] leading-[1.8]',
  '[&_p]:mb-[14px]',
  '[&_h2]:mt-[15px] [&_h2]:mb-[10px] [&_h2]:pb-[10px] [&_h2]:text-[22px] [&_h2]:font-extrabold [&_h2]:leading-[1.3] [&_h2]:text-brand-700',
  '[&_ul]:mt-[14px] [&_ul]:mb-[15px] [&_ul]:ml-[15px] [&_ul]:list-disc [&_ul]:pl-10',
  '[&_a]:text-brand-700 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:no-underline',
].join(' ')

export default function JuridischePagina({ titel, html }: { titel: string; html: string }) {
  return (
    <>
      <PaginaKop titel={titel} kruimels={[{ label: titel }]} />
      <section className="py-[72px]">
        <Container>
          <div className={tekst} dangerouslySetInnerHTML={{ __html: html }} />
        </Container>
      </section>
    </>
  )
}
