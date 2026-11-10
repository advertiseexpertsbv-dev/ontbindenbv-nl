import { createFileRoute, notFound } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { haalPost } from '../server/blog'
import { site } from '../lib/site'
import { vertrouwenKaart } from '../content/home'
import ArtikelKop from '../components/sections/ArtikelKop'
import KaartFormulier from '../components/sections/KaartFormulier'
import Vinken from '../components/sections/Vinken'
import { FaqIcoon } from '../components/sections/icons'
import CtaBand from '../components/sections/CtaBand'
import Reviews from '../components/sections/Reviews'
import Faq from '../components/sections/Faq'
import ContactBlok from '../components/sections/ContactBlok'
import { Container } from '../components/ui'

export const Route = createFileRoute('/$slug')({
  // De artikeltekst (blog.json) wordt alleen server-side geladen; zie src/server/blog.ts
  loader: async ({ params }) => {
    const r = await haalPost({ data: { slug: params.slug } })
    if (!r) throw notFound()
    return r
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {}
    const p = loaderData.post
    const h = seo({
      title: p.seoTitle || p.title,
      description: p.seoDescription || p.excerpt.slice(0, 157),
      path: `/${params.slug}/`,
      exact: true,
      ogImage: p.ogBeeld?.src ?? p.image ?? undefined,
      ogImageMeta: p.ogBeeld,
      article: { published: p.date, modified: p.modified },
    })
    return {
      ...h,
      // Engelstalige artikelen: og:locale en_US (seo() zet nl_NL); de taal van de tekst staat in lang={p.taal} en inLanguage hieronder
      meta: p.taal === 'en' ? h.meta.map((m) => ('property' in m && m.property === 'og:locale' ? { ...m, content: 'en_US' } : m)) : h.meta,
      scripts: [
        ...(h.scripts ?? []),
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': p.ogBeeld ? 'BlogPosting' : 'Article',
            headline: p.title,
            inLanguage: p.taal === 'en' ? 'en' : 'nl',
            datePublished: p.date,
            dateModified: p.modified,
            image: p.ogBeeld
              ? { '@type': 'ImageObject', url: `${site.url}${p.ogBeeld.src}`, width: p.ogBeeld.w, height: p.ogBeeld.h }
              : p.image
                ? `${site.url}${p.image}`
                : undefined,
            author: { '@type': 'Person', name: 'Peter Brouwers' },
            publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `${site.url}/images/brand/logo.png` } },
            mainEntityOfPage: `${site.url}/${params.slug}/`,
          }),
        },
        ...(p.faq?.length
          ? [
              {
                type: 'application/ld+json',
                children: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.vraag, acceptedAnswer: { '@type': 'Answer', text: f.antwoord } })),
                }),
              },
            ]
          : []),
      ],
    }
  },
  component: Artikel,
})

/**
 * Artikel zoals de oude site: blauwe titelbalk met de titelkaart, links de inhoudsopgave (ingeklapt), de uitgelichte afbeelding en
 * de tekst (60%), rechts de vinkjeskaart en het formulier; daaronder de CTA-band, reviews, veelgestelde vragen en het contactblok.
 */
function Artikel() {
  const { post: p } = Route.useLoaderData()
  return (
    <>
      <ArtikelKop titel={p.title} datum={p.date} taal={p.taal} />
      {/* 184px: de titelkaart hangt 120px onder de balk, daarna 64px ruimte (zoals de oude site) */}
      <section className="pt-[184px] pb-sectie">
        <Container className="flex flex-col gap-10 min-[992px]:flex-row min-[992px]:items-start min-[992px]:gap-0">
          {/* lang: vijf artikelen zijn Engelstalig; de rest van de pagina (formulier, menu) blijft Nederlands */}
          <article lang={p.taal} className="min-w-0 min-[992px]:w-[60%] min-[992px]:pr-4">
            {p.toc.length > 1 && (
              <details className="group mb-8 rounded-xl border border-line bg-brand-50/50 px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-brand-800 [&::-webkit-details-marker]:hidden">
                  {p.taal === 'en' ? 'Table of contents' : 'Inhoudsopgave'}
                  <FaqIcoon open={false} className="size-3 text-brand-700 transition-transform group-open:rotate-45" />
                </summary>
                <ol className="mt-4 flex list-decimal flex-col gap-2 pl-6 text-[16px] marker:text-brand-600">
                  {p.toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="underline-offset-2 hover:text-brand-700 hover:underline">
                        {t.tekst}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}
            {p.image && (
              <img
                src={p.image}
                alt={p.imageAlt ?? ''}
                width={p.imageW ?? undefined}
                height={p.imageH ?? undefined}
                fetchPriority="high"
                decoding="async"
                className="mb-8 block h-auto max-h-[1024px] w-auto max-w-full rounded-2xl"
              />
            )}
            <div className="artikel-post" dangerouslySetInnerHTML={{ __html: p.html }} />
          </article>
          <div className="min-w-0 min-[992px]:w-[40%] min-[992px]:pl-4">
            <div className="bg-textuur mb-8 rounded-2xl border border-line p-6 sm:p-8 min-[992px]:p-10">
              <Vinken items={vertrouwenKaart} />
            </div>
            <KaartFormulier formulier={`Artikel: ${p.slug}`} titel="Waar kunnen we je mee helpen?" />
          </div>
        </Container>
      </section>
      <CtaBand />
      <Reviews />
      <Faq />
      <ContactBlok />
    </>
  )
}
