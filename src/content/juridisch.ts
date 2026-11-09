import { site } from '../lib/site'

/* Privacyverklaring en cookiebeleid. De oude site toonde hier een automatisch gegenereerd Complianz-beleid voor de
   WordPress-installatie; deze teksten beschrijven de werking van de nieuwe site (formulieren, opslag, cookies).
   Door de eigenaar te laten bevestigen (zie PROJECT.md). */

export const bijgewerkt = '9 november 2026'

const adres = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`

export const privacyverklaring = `
<p>${site.name} (${adres}) is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in deze privacyverklaring. Heb je vragen? Mail ons via <a href="mailto:${site.email}">${site.email}</a> of bel <a class="whitespace-nowrap" href="${site.phoneHref}">${site.phone}</a>.</p>

<h2>Welke gegevens verwerken wij?</h2>
<ul>
<li><strong>Contactformulieren</strong> (hoofdformulier, contactpagina en gratis intakegesprek): naam, e-mailadres, telefoonnummer, je bericht en, bij het intakeformulier, je voorkeursmoment om gebeld te worden.</li>
<li><strong>Intakegesprek</strong>: wat je ons vertelt over je BV of stichting (bijvoorbeeld activa, schulden en de gewenste vorm van ontbinding). Deze gegevens leggen onze medewerkers vast in je dossier.</li>
<li><strong>Herkomst van je bezoek</strong>: de bron en campagne waarmee je op onze site kwam (bijvoorbeeld een Google-advertentie of zoekresultaat), de pagina waarop je het formulier invulde en het type apparaat. We bewaren dit bij je aanvraag om te zien welke kanalen werken.</li>
<li><strong>Beveiliging tegen misbruik</strong>: je IP-adres slaan we niet op, alleen een daarvan afgeleide, gehashte code die elke dag verandert. Daarmee voorkomen we dat iemand het formulier massaal invult.</li>
<li><strong>Websitegebruik</strong>: paginastatistieken zonder cookies en zonder IP-adressen op te slaan, en, alleen met jouw toestemming, statistiek- en marketingcookies (zie het <a href="/cookiebeleid-eu/">cookiebeleid</a>).</li>
</ul>

<h2>Waarvoor gebruiken wij deze gegevens?</h2>
<ul>
<li>Je aanvraag behandelen en contact met je opnemen over een kosteloze intake (uitvoering van je verzoek).</li>
<li>Een dossier opbouwen en de ontbinding of liquidatie van je BV verzorgen, inclusief het contact met de KVK en andere instanties (uitvoering van de overeenkomst).</li>
<li>Onze website, dienstverlening en advertenties verbeteren (gerechtvaardigd belang, of jouw toestemming bij cookies).</li>
<li>Voldoen aan wettelijke verplichtingen.</li>
</ul>

<h2>Met wie delen wij gegevens?</h2>
<p>Wij verkopen je gegevens niet. We delen ze alleen met partijen die ze voor ons verwerken, op basis van een verwerkersovereenkomst of de standaardvoorwaarden van die partij:</p>
<ul>
${site.hubspotId ? '<li><strong>HubSpot</strong> (Europese servers): contactbeheer. Je aanvraag wordt bij je contactgegevens vastgelegd. Alleen met jouw toestemming meet HubSpot ook je bezoeken aan de site.</li>\n' : ''}<li><strong>Cloudflare</strong>: hosting van de website, opslag van formulierinzendingen en de paginastatistieken.</li>
<li><strong>Resend</strong>: verzenden van de e-mailmelding aan ons kantoor wanneer je een formulier invult.</li>
<li><strong>Advertise Experts</strong>: ons marketingbureau, dat de website en onze advertenties beheert en daarvoor aanvragen inziet om te beoordelen welke kanalen werken.</li>
<li><strong>Google</strong> (Tag Manager, Analytics, Ads): alleen met jouw toestemming voor statistiek of marketing. Met toestemming voor marketing sturen we bij een aanvraag ook je e-mailadres, telefoonnummer en naam onherkenbaar gemaakt (gehasht) naar Google Ads, zodat we kunnen meten welke advertenties tot aanvragen leiden.</li>
</ul>
<p>Sommige van deze partijen zijn gevestigd buiten de Europese Economische Ruimte. Zij werken met passende waarborgen, zoals de standaardcontractbepalingen van de Europese Commissie.</p>

<h2>Hoe lang bewaren wij gegevens?</h2>
<p>We bewaren persoonsgegevens niet langer dan nodig is voor de doelen waarvoor we ze verzamelen of dan de wet vereist:</p>
<ul>
<li><strong>Klantdossiers</strong>: zeven jaar na afronding van de opdracht, vanwege de wettelijke bewaarplicht voor onze administratie.</li>
<li><strong>Aanvragen waaruit geen opdracht volgt</strong>: maximaal vijf jaar na je aanvraag. Daarna wissen we je naam, contactgegevens en bericht; wat overblijft (bijvoorbeeld via welke advertentie een aanvraag binnenkwam) is niet meer tot jou te herleiden. Wil je dat we je gegevens eerder verwijderen? Laat het ons weten, dan doen we dat.</li>
<li><strong>Paginastatistieken</strong> bevatten geen namen, contactgegevens of IP-adressen; een bezoeker is daarin hooguit binnen één dag als dezelfde te herkennen.</li>
</ul>

<h2>Je rechten</h2>
<p>Je hebt het recht om je gegevens in te zien, te laten corrigeren of te laten verwijderen, bezwaar te maken tegen de verwerking en je gegevens over te laten dragen. Je kunt een gegeven toestemming altijd intrekken, bijvoorbeeld via "Cookievoorkeuren" onderaan elke pagina. Stuur je verzoek naar <a href="mailto:${site.email}">${site.email}</a>; we reageren binnen vier weken. Kom je er niet uit met ons? Dan kun je een klacht indienen bij de <a href="https://autoriteitpersoonsgegevens.nl" rel="noopener" target="_blank">Autoriteit Persoonsgegevens</a>.</p>

<h2>Beveiliging</h2>
<p>Het verkeer met onze website verloopt versleuteld (https) en formuliergegevens worden opgeslagen in een afgeschermde database. Vermoed je misbruik of heb je een beveiligingsmelding? Neem dan direct contact met ons op.</p>

<p><em>Laatst bijgewerkt: ${bijgewerkt}.</em></p>
`

export const cookiebeleid = `
<p>Deze website gebruikt cookies en vergelijkbare technieken (zoals opslag in je browser). Hieronder lees je welke, waarvoor, en hoe je je keuze wijzigt. Via "Cookievoorkeuren" onderaan elke pagina kun je je toestemming op elk moment aanpassen of intrekken.</p>

<h2>Functioneel (altijd actief)</h2>
<p>Noodzakelijk voor het werken van de site. Hiervoor is geen toestemming nodig.</p>
<ul>
<li><strong>obv-cookie-consent</strong> (browseropslag): onthoudt je cookiekeuze.</li>
<li><strong>obv-first-touch, obv-last-touch</strong> (browseropslag) en <strong>obv-utm, obv-landing</strong> (sessie): onthouden via welke bron en op welke pagina je op de site kwam, zodat we dit bij een aanvraag kunnen vastleggen.</li>
</ul>

<h2>Voorkeuren</h2>
<p>Voor het onthouden van instellingen die je niet zelf hebt gevraagd. Alleen met jouw toestemming.</p>

<h2>Statistieken</h2>
<p>Voor het meten van het gebruik van de website, alleen met jouw toestemming. We gebruiken <strong>Google Analytics 4</strong> (via Google Tag Manager)${site.hubspotId ? ' en het <strong>HubSpot</strong>-trackingscript (Europese servers)' : ''}. Daarnaast tellen we paginabezoeken zonder cookies en zonder IP-adressen op te slaan; dat valt hier niet onder.</p>

<h2>Marketing</h2>
<p>Voor het meten van advertenties en het tonen van relevante advertenties, alleen met jouw toestemming. We gebruiken <strong>Google Ads</strong> (conversiemeting) via Google Tag Manager${site.hubspotId ? ' en <strong>HubSpot</strong>' : ''}. Met deze toestemming sturen we bij een aanvraag ook je e-mailadres, telefoonnummer en naam gehasht naar Google Ads, om aanvragen aan advertenties te kunnen koppelen (enhanced conversions).</p>

<h2>Cookies van derden verwijderen</h2>
<p>Je kunt cookies altijd verwijderen via de instellingen van je browser. Zonder toestemming voor statistiek of marketing worden geen cookies van Google${site.hubspotId ? ' of HubSpot' : ''} geplaatst.</p>

<h2>Vragen?</h2>
<p>Mail ons via <a href="mailto:${site.email}">${site.email}</a>. Lees ook onze <a href="/privacyverklaring-eu/">privacyverklaring</a>.</p>

<p><em>Laatst bijgewerkt: ${bijgewerkt}.</em></p>
`
