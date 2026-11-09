import { createFileRoute, notFound } from '@tanstack/react-router'
import { seo } from '../lib/seo'
import { haalPost } from '../server/blog'
import { site } from '../lib/site'
import ArtikelKop from '../components/sections/ArtikelKop'
import KaartFormulier from '../components/sections/KaartFormulier'
import { PostKaart } from '../components/sections/NieuwsOverzicht'
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
            publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `${site.url}/images/brand/2024-06-belasting-bemiddelaar-logo.png` } },
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

function Artikel() {
  const { post: p, meer } = Route.useLoaderData()
  return (
    <>
      <ArtikelKop titel={p.title} image={p.image} datum={p.date} taal={p.taal} />
      {/* 184px: de titelkaart hangt 120px onder de fotobanner (zoals de oude site) */}
      <section className="pb-[72px] pt-[184px]">
        <Container className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 min-[992px]:grid-cols-[minmax(0,744fr)_minmax(0,496fr)] min-[992px]:gap-0">
          {/* lang: vier artikelen zijn volledig Engelstalig; de rest van de pagina (formulier, menu) blijft Nederlands */}
          <article lang={p.taal} className="min-w-0 min-[992px]:pr-4">
            {p.image && (
              // Bewust zonder srcset: de fotobanner erboven (ArtikelKop, CSS-achtergrond) gebruikt hetzelfde origineel, dus de browser
              // haalt het beeld maar één keer op. Een kleinere variant hier zou een tweede download naast de banner geven.
              <img
                src={p.image}
                alt={p.imageAlt ?? ''}
                width={p.imageW ?? undefined}
                height={p.imageH ?? undefined}
                fetchPriority="high"
                decoding="async"
                className="mb-4 block h-auto max-h-[450px] w-auto max-w-full rounded-[4px]"
              />
            )}
            {/* Geen apart 'Over de auteur'-blok: de oude site had het niet en in 123 artikelen staat de bio al in de tekst zelf */}
            <div className="artikel-post" dangerouslySetInnerHTML={{ __html: p.html }} />
          </article>
          <div className="min-w-0 min-[992px]:pl-4">
            <KaartFormulier formulier={`Artikel: ${p.slug}`} />
          </div>
        </Container>
      </section>
      {meer.length > 0 && (
        <section className="py-[72px]">
          <Container>
            <h2 className="mb-4">Gerelateerd nieuws</h2>
            <div className="grid gap-x-4 gap-y-12 min-[768px]:grid-cols-2 min-[992px]:grid-cols-3">
              {meer.map((m) => (
                <PostKaart key={m.slug} p={m} niveau="h3" />
              ))}
            </div>
          </Container>
        </section>
      )}
      <CtaBand />
      <Reviews />
      <Faq />
      <ContactBlok />
    </>
  )
}
