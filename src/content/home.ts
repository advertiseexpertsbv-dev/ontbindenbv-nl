import { site } from '../lib/site'

/* Teksten en data die op meerdere pagina's terugkomen. 1-op-1 overgenomen van de oude site (ontbindenbv.nl). */

/** Vinkjes in de hero en bij "Daarom kiezen ondernemers voor ons" */
export const vertrouwen = ['1.200 ontbindingen', 'Gratis intakegesprek', 'Vanaf 1 week geregeld', 'Vaste prijs vooraf'] as const

/** Vinkjes op de kaart naast de titelbalk (over ons, gratis intakegesprek) */
export const vertrouwenKaart = ['1.200 ontbindingen', 'Gratis intakegesprek', 'Vanaf 2 werkdagen geregeld', 'Vaste prijs vooraf'] as const

/** Rij met blauwe vinkjes boven de tekst van de dienstpagina's */
export const vertrouwenDienst = ['1.200 ontbindingen', 'Gratis intakegesprek', 'Vaste prijs vooraf'] as const

export const hero = {
  titel: 'BV ontbinden?',
  sub: 'Wij regelen het snel, veilig en juridisch correct',
} as const

/** Formulierkaart (hero, dienstpagina's, artikelen) */
export const kaart = {
  titel: 'Direct kosteloos advies.',
  sub: 'Altijd kosteloos en vrijblijvend advies gesprek.',
} as const

export const introHome = {
  titel: 'Dé specialist in BV ontbinden',
  alinea:
    'Welkom bij OntbindenBV.nl, dé expert in Nederland voor het beëindigen en liquideren van jouw BV. Of het nu gaat om een lege BV, een BV met activa of zelfs een BV met schulden – wij staan voor je klaar. Wij begrijpen dat het ontbinden van een onderneming vaak gepaard gaat met stress en onzekerheid. Juist in die periode wil je een partij die alles uit handen neemt en jou volledig ontzorgt.',
  vraag: 'En wat doen wij dan?',
  /** HTML: de vette woorden zoals op de oude site */
  antwoord:
    'Met meer dan 25 jaar ervaring en ruim <b>1.200 ondernemers die je voorgingen</b>, weten wij exact hoe we jouw situatie moeten aanpakken. Van turbo-liquidatie tot complexe liquidaties: ons team vindt altijd de beste oplossing.<br><br><b>Jij houdt je hoofd vrij, terwijl wij zorgen voor de juridische kant, de KVK-uitschrijving en de communicatie met alle betrokken instanties.</b>',
  titel2: 'Geen zorgen, OntbindenBV.nl regelt het',
  alinea2:
    'Als familiebedrijf combineren wij persoonlijke betrokkenheid met diepgaande expertise. We werken transparant en beginnen altijd met een gratis intake, waarin we jouw situatie in kaart brengen. Op basis daarvan ontvang je direct een helder plan én een vaste prijs vooraf. Geen verrassingen achteraf – alleen zekerheid en duidelijkheid.',
  waarom: 'Daarom kiezen ondernemers voor ons',
} as const

export const situatie = {
  titel: 'Wat is je situatie?',
  tekst:
    'Elke BV of stichting heeft een unieke situatie. Wij zorgen voor de juiste aanpak en begeleiden je van A tot Z. Selecteer hieronder wat het beste bij je past.',
} as const

export const werkwijzeIntro =
  'OntbindenBV.nl werkt transparant en efficiënt. Wij willen het proces van het ontbinden van jouw BV zo soepel en stressvrij mogelijk maken. Of het nu gaat om een lege BV, een BV met activa of met schulden: wij nemen alles uit handen. Daarom volgen we de volgende stappen om jouw BV veilig en correct te beëindigen:'

export const werkwijze = [
  {
    titel: 'Gratis intake',
    tekst:
      'We starten altijd met een gratis intake. Hierin brengen we jouw situatie in kaart en bekijken we of het gaat om een lege BV, een BV met activa of schulden.',
  },
  {
    titel: 'Plan van aanpak',
    tekst:
      'Op basis van de intake stellen we direct een duidelijk plan op. Hierin staat welke vorm van liquidatie geschikt is en welke stappen we gaan nemen om jouw BV veilig te ontbinden.',
  },
  {
    titel: 'Contact met KVK en instanties',
    tekst: 'Wij nemen al het contact met de KVK en overige instanties volledig over. Geen ingewikkelde formulieren of gesprekken – wij regelen alles namens jou.',
  },
  {
    titel: 'Inzetten van onze expertise',
    tekst:
      'Dankzij onze jarenlange ervaring en kennis van wet- en regelgeving weten we exact hoe we jouw situatie het beste aanpakken. Ook in complexe gevallen zorgen wij voor de juiste oplossing.',
  },
  {
    titel: 'Afronding en bevestiging',
    tekst: 'Zodra de BV officieel is ontbonden, ontvang je van ons de bevestiging. We zorgen dat je volledig compliant bent en geen losse eindjes meer hebt.',
  },
] as const

/** Korte stappenlijst op /gratis-intakegesprek/ (zo stond hij op de oude site) */
export const intakeStappen = ['Kosteloze intake', 'Plan van aanpak', 'Contact met de Belastingdienst', 'Inzetten van onze expertise', 'Afhandeling'] as const

export const cta = {
  titel: 'Dus waar wacht je nog op?',
  tekst: 'Laat het stressvolle proces van een BV-ontbinding aan ons over, zodat jij je kunt focussen op wat écht belangrijk is: jouw onderneming en je toekomst.',
} as const

export const reviews = [
  {
    bedrijf: 'Kyka Holding BV',
    datum: '2 januari 2025',
    naam: 'Karta Miardjo',
    tekst:
      '"OntbindenBV.nl heeft ons uitstekend geholpen bij de turbo-liquidatie van onze BV. Dankzij hun deskundigheid en efficiënte aanpak was het proces binnen korte tijd afgerond. Ze namen ons alle zorgen uit handen en zorgden voor een foutloze afwikkeling. Absoluut een aanrader voor iedereen die een BV snel en veilig wil beëindigen."',
  },
  {
    bedrijf: 'Nut Tree Holding B.V',
    datum: '12 juni 2024',
    naam: 'M.C.A. Nootenboom',
    tekst:
      '"Ik ben ontzettend tevreden over OntbindenBV.nl. Zij hebben onze turbo-liquidatie perfect begeleid en alles snel en duidelijk geregeld. Voor het eerst voelde dit proces niet stressvol, omdat ik wist dat alles juridisch en administratief goed werd afgehandeld. Echt topservice – ik zou ze zeker aanraden!"',
  },
  {
    bedrijf: 'Broers Logistics B.V.',
    datum: '9 april 2025',
    naam: 'H.T. Kaplan',
    tekst:
      '"OntbindenBV.nl heeft onze turbo-liquidatie volledig zorgeloos geregeld. Vanaf het eerste contact gaven ze duidelijkheid over de stappen en namen ze alles uit handen. Het hele traject verliep snel, professioneel en zonder verrassingen. Heel fijn om met zulke betrouwbare specialisten te werken."',
  },
] as const

export type FaqItem = { v: string; a: string }

/** Veelgestelde vragen van de homepage, over ons en onze werkwijze (a = HTML) */
export const faq: FaqItem[] = [
  {
    v: 'Wanneer moet ik een specialist inschakelen?',
    a: '<p>Zodra je BV geen activiteiten meer heeft, of wanneer schulden en risico’s het verstandig maken om te stoppen.</p><p><a href="/gratis-intakegesprek/"><em>Vraag een intake aan en ontdek de beste route.</em></a></p>',
  },
  {
    v: 'Wat zijn de voordelen van OntbindenBV.nl?',
    a: '<p>Transparante vaste prijs vooraf, &gt;1.200 ondernemers gingen je voor, snelle afhandeling en volledige ontzorging.</p><p><a href="/gratis-intakegesprek/"><em>Plan je gratis intake vandaag nog.</em></a></p>',
  },
  {
    v: 'Hoe kan OntbindenBV.nl helpen bij een turbo-liquidatie?',
    a: '<p>Wij checken of jouw BV voldoet aan de voorwaarden, stellen alle documenten op en zorgen dat je snel bent uitgeschreven bij de KVK.</p><p><a href="/gratis-intakegesprek/"><em>Laat ons gratis je BV checken.</em></a></p>',
  },
  {
    v: 'Wat is het verschil tussen een turbo- en een reguliere liquidatie?',
    a: '<p>Turbo is alleen mogelijk zonder activa en schulden. In alle andere gevallen begeleiden wij de reguliere route.</p><p><a href="/gratis-intakegesprek/"><em>Gratis intake: wij adviseren welke vorm geschikt is.</em></a></p>',
  },
  {
    v: 'Wat kost het om mijn BV te ontbinden?',
    a: '<p>De kosten hangen af van jouw situatie (lege BV, activa, schulden). Je krijgt altijd vooraf een vaste prijs.</p><p><a href="/gratis-intakegesprek/"><em>Vraag vandaag nog je vrijblijvende offerte aan.</em></a></p>',
  },
  {
    v: 'Kan ik zelf een BV ontbinden?',
    a: '<p>In theorie wel, maar de risico’s zijn groot (aansprakelijkheid, fouten bij schulden). Met ons weet je zeker dat het goed en veilig gebeurt.</p><p><a href="/gratis-intakegesprek/"><em>Bespreek je situatie gratis met ons team.</em></a></p>',
  },
  {
    v: 'Hoe lang duurt het gemiddeld?',
    a: '<p>Een turbo-liquidatie kan vaak binnen 5 werkdagen rond zijn. Complexere trajecten duren langer, maar wij zorgen voor de snelst mogelijke afronding.</p><p><a href="/gratis-intakegesprek/"><em>Vraag een gratis inschatting aan.</em></a></p>',
  },
]

export const team = [
  { naam: 'Peter Brouwers', rol: 'Expert belastingzaken, Fiscaal adviseur en accountant', foto: '/images/site/peter.webp' },
  { naam: 'Heleen Brouwers', rol: 'Adviseur belastingschulden en fiscale denktank', foto: '/images/site/heleen.webp' },
  { naam: 'Kevin Quik', rol: 'Specialist in het begeleiden van fiscale controles', foto: '/images/site/kevin.webp' },
  { naam: 'Michael Bhattoe', rol: 'Fiscaal communicatie specialist', foto: '/images/site/michael.webp' },
  { naam: 'Daisy Taylor', rol: 'Financieel specialist', foto: '/images/site/daisy.webp' },
  { naam: 'Bas de Graaf', rol: 'Expert schuldhulp verlening', foto: '/images/site/bas.webp' },
] as const

export const overOns = {
  titel: 'jouw partner in BV-ontbinding',
  alineas: [
    'OntbindenBV.nl is een betrokken familiebedrijf met meer dan 25 jaar ervaring in het ontbinden van ondernemingen. Wij ondersteunen ondernemers in heel Nederland—of je nu een lege BV hebt, één met activa of zelfs schulden—met een persoonlijke en complete aanpak.',
    'Onze missie: jouw ontzorgen tijdens het vaak lastige proces van BV-ontbinding. Van intake tot KVK-uitschrijving: wij staan naast je, zorgen dat alles juridisch correct gebeurt en jij krijgt vanaf dag één van ons een vaste prijs en helder plan.',
  ],
  waarom: 'Waarom kies je voor OntbindenBV.nl?',
  /** HTML (vette woorden zoals de oude site) */
  punten: [
    'Meer dan <b>1.200 ontbindingen</b> succesvol afgerond',
    '<b>Familiebedrijf</b>, met persoonlijke service en heldere communicatie',
    'Direct inzicht: <b>gratis intake</b>, plan &amp; vaste prijs vooraf',
    'Expertise in elk scenario: van eenvoudig tot complex (zoals activa of schulden)',
    'Volledig compliance: je bent verzekerd dat het proces correct en foutloos verloopt',
  ],
} as const

export const contactBlok = {
  tekst: 'U kunt ons bereiken op werkdagen, van maandag tot en met vrijdag van 08:30 uur tot 17:30 uur.',
  formTitel: 'Wij helpen je graag verder met al je vragen',
  formTekst: 'Neem vandaag nog contact op met ons voor een kosteloze intake en laat ons jou helpen met het oplossen van jouw fiscale problemen.',
  telefoon: site.phone,
  email: site.email,
} as const
