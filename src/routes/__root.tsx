import type { ReactNode } from 'react'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import CookieBanner from '../components/layout/CookieBanner'
import MobieleBalk from '../components/layout/MobieleBalk'
import { Button } from '../components/ui'
import { site } from '../lib/site'
import { CONSENT_STORAGE_KEY } from '../lib/consent'
import '../lib/attribution'

import appCss from '../styles.css?url'

// Scroll-reveals — óók voor elementen die later (SPA-navigatie) in de DOM komen.
const INIT_SCRIPT = `(function(){
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce||!('IntersectionObserver' in window)){document.documentElement.classList.add('js');return;}
document.documentElement.classList.add('js');
var io=new IntersectionObserver(function(entries){for(var i=0;i<entries.length;i++){if(entries[i].isIntersecting){entries[i].target.classList.add('revealed');io.unobserve(entries[i].target)}}},{threshold:0,rootMargin:'0px 0px -40px 0px'});
function observeAll(root){(root||document).querySelectorAll('[data-reveal]:not(.revealed)').forEach(function(el){io.observe(el)})}
function start(){observeAll();new MutationObserver(function(muts){for(var i=0;i<muts.length;i++){for(var j=0;j<muts[i].addedNodes.length;j++){var n=muts[i].addedNodes[j];if(n.nodeType===1){if(n.hasAttribute&&n.hasAttribute('data-reveal')){io.observe(n)}observeAll(n)}}}}).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',start)}else{start()}
})();`

/* Consent Mode v2: standaard alles 'denied', tenzij de bezoeker eerder koos (localStorage, zie lib/consent.ts). Vóór GTM. */
const CONSENT_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
(function(){var k={voorkeuren:false,statistieken:false,marketing:false};try{var r=localStorage.getItem('${CONSENT_STORAGE_KEY}');if(r){var o=JSON.parse(r);if(o&&o.keuzes){k.voorkeuren=!!o.keuzes.voorkeuren;k.statistieken=!!o.keuzes.statistieken;k.marketing=!!o.keuzes.marketing}}}catch(e){}
var g=function(b){return b?'granted':'denied'};
gtag('consent','default',{ad_storage:g(k.marketing),ad_user_data:g(k.marketing),ad_personalization:g(k.marketing),analytics_storage:g(k.statistieken),personalization_storage:g(k.voorkeuren),functionality_storage:'granted',security_storage:'granted',wait_for_update:500});})();`

/* GTM alleen op het echte domein (testleads op workers.dev/localhost mogen niet als conversie tellen) en pas bij de
   eerste interactie of kort na load, zodat third-party JS de LCP niet hindert. Uitzondering: een advertentieklik (gclid,
   gbraid, wbraid) laadt GTM direct. De Conversion Linker leest de klik-id uit de URL wanneer GTM start; navigeert de bezoeker
   eerder binnen de app (bv. homepage → /gratis-intakegesprek/), dan is de klik-id uit de URL en telt de lead niet in Ads. */
const GTM_SCRIPT = `(function(w,d,s,l,i){if(location.hostname.indexOf('workers.dev')>-1||location.hostname==='localhost')return;var laadt=false;function laad(){if(laadt)return;laadt=true;
w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}
['pointerdown','keydown','touchstart','scroll'].forEach(function(e){w.addEventListener(e,laad,{once:true,passive:true})});
var plan=function(){if('requestIdleCallback' in w){w.requestIdleCallback(laad,{timeout:3000})}else{w.setTimeout(laad,3000)}};
if(/[?&](gclid|gbraid|wbraid)=/.test(location.search)){laad();return}
if(d.readyState==='complete')plan();else w.addEventListener('load',plan,{once:true});})(window,document,'script','dataLayer','${site.gtmId}');`

/* HubSpot-tracking (CRM-portaal ${site.hubspotId}): alleen op het echte domein en pas na toestemming voor statistiek of marketing. */
const HUBSPOT_SCRIPT = `(function(){if(location.hostname.indexOf('workers.dev')>-1||location.hostname==='localhost')return;var klaar=false;
function ok(){try{var r=localStorage.getItem('${CONSENT_STORAGE_KEY}');if(!r)return false;var o=JSON.parse(r);return !!(o&&o.keuzes&&(o.keuzes.statistieken||o.keuzes.marketing))}catch(e){return false}}
function laad(){if(klaar||!ok())return;klaar=true;var s=document.createElement('script');s.id='hs-script-loader';s.async=true;s.defer=true;s.src='https://js-eu1.hs-scripts.com/${site.hubspotId}.js';document.head.appendChild(s)}
laad();window.addEventListener('cookie-consent-gewijzigd',laad);})();`

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#11558c' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/manrope-latin.woff2', crossOrigin: 'anonymous' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/brand/favicon-32.png' },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/images/brand/favicon-192.png' },
      // Op de standaardlocatie, met witte achtergrond (iOS maakt transparantie zwart)
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
    scripts: [
      { children: INIT_SCRIPT, type: 'text/javascript' },
      { children: CONSENT_SCRIPT, type: 'text/javascript' },
      ...(site.gtmId ? [{ children: GTM_SCRIPT, type: 'text/javascript' }] : []),
      ...(site.hubspotId ? [{ children: HUBSPOT_SCRIPT, type: 'text/javascript' }] : []),
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          name: site.name,
          description: site.description,
          url: site.url,
          logo: `${site.url}/images/brand/logo.png`,
          image: `${site.url}/images/og.jpg`,
          ...(site.phone ? { telephone: site.phoneHref.replace('tel:', '') } : {}),
          email: site.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: site.address.street,
            postalCode: site.address.postalCode,
            addressLocality: site.address.city,
            addressCountry: 'NL',
          },
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:30',
            closes: '17:30',
          },
          areaServed: 'NL',
          ...(site.linkedin ? { sameAs: [site.linkedin] } : {}),
          // Bewust geen aggregateRating: zelf-bediende reviews in structured data kunnen door Google worden afgekeurd
        }),
      },
    ],
  }),
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      {/* React 19 tilt title en meta naar de <head>: oude site had 'Page Not Found - BV ontbinden?' en noindex */}
      <title>Pagina niet gevonden - BV ontbinden?</title>
      <meta name="robots" content="noindex, follow" />
      <p className="text-6xl font-bold text-brand-500">404</p>
      <h1 className="mt-4">Deze pagina bestaat niet</h1>
      <p className="mt-3">
        Misschien is de pagina verplaatst. Ga terug naar de homepage of {site.phone ? 'bel' : 'mail'} ons:{' '}
        <a href={site.phone ? site.phoneHref : `mailto:${site.email}`} className="font-bold whitespace-nowrap text-brand-700">
          {site.phone || site.email}
        </a>
      </p>
      <Button href="/" className="mt-8" arrow>
        Naar de homepage
      </Button>
    </div>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        {site.gtmId && (
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${site.gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" />
          </noscript>
        )}
        <a
          href="#hoofdinhoud"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-100 focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Direct naar inhoud
        </a>
        {/* Vóór de header in de DOM: een toetsenbordgebruiker bereikt de cookiekeuze direct (de kaart staat 'fixed') */}
        <CookieBanner />
        <Header />
        <main id="hoofdinhoud" className="flex-1">
          {children}
        </main>
        <Footer />
        <MobieleBalk />
        <Scripts />
      </body>
    </html>
  )
}
