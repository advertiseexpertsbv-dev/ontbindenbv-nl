"""Zet de WordPress-posts (ref/api) om naar src/content/blog.json.
Gebruik: python3 scripts/bouw-blog.py [uitvoerbestand]   (standaard src/content/blog.json)"""
import json, re, html, os, sys
from PIL import Image
R = 'ref'
UIT = sys.argv[1] if len(sys.argv) > 1 else 'src/content/blog.json'
posts = json.load(open(f'{R}/api/posts-1.json')) + json.load(open(f'{R}/api/posts-2.json'))
media = {m['id']: m['source_url'] for m in json.load(open(f'{R}/api/media-1.json')) + json.load(open(f'{R}/api/media-2.json'))}
seo = json.load(open(f'{R}/seo/seo.json'))
kaart = json.load(open(f'{R}/beeldkaart.json'))

def norm(u): return re.sub(r'-\d+x\d+(?=\.[a-z]+$)', '', u)
def lokaal(u):
    u = norm(u.replace('http://', 'https://'))
    key = u.split('/uploads/')[-1].replace('/', '_')
    return kaart.get(key)

_maten = {}
def maten(pad):
    """Afmetingen (breedte, hoogte) van een lokaal beeld in public/, voor width/height tegen layout shift"""
    if pad not in _maten:
        try:
            with Image.open('public' + pad) as im: _maten[pad] = im.size
        except Exception:
            _maten[pad] = None
    return _maten[pad]

# Alt-teksten voor portretten van het team (WordPress had ze leeg). Alleen waar naam en functie betrouwbaar zijn:
# de bestandsnaam noemt de persoon en naam/functie staan op de site zelf (content/home.ts, team). De vele illustratieve
# foto's en banners tussen de alinea's (team- en stockfoto's zonder bijschrift) blijven bewust alt="" (decoratief).
ALT_PORTRET = {
    '2024-07-kevin.webp': 'Kevin Quik, specialist in het begeleiden van fiscale controles',
    '2024-07-heleen-brouwers.webp': 'Heleen Brouwers, adviseur belastingschulden en fiscale denktank',
    '2024-07-michael.webp': 'Michael Bhattoe, fiscaal communicatiespecialist',
    '2024-07-michael-bhattoe.webp': 'Michael Bhattoe, fiscaal communicatiespecialist',
    '2024-07-peter.webp': 'Peter Brouwers, expert belastingzaken, fiscaal adviseur en accountant',
}

def alt_voor(pad, alt):
    """Bestaande alt-tekst blijft staan; een lege alt wordt aangevuld voor de portretten hierboven"""
    if alt: return alt
    return ALT_PORTRET.get(pad.rsplit('/', 1)[-1], '')

# Een <a> waarvan de href geen geldige URL is (een losse zin of redactie-opmerking uit WordPress) wordt platte tekst,
# behalve waar de bestemming ondubbelzinnig uit de tekst volgt: de zin 'Schedule a free, no-obligation consultation. ...'
# (dissolution-decision-bv) is de Engelse variant van de oproep die in converting-a-bv naar /gratis-intakegesprek/ linkt.
# De overige drie kapotte links (redactie-opmerking 'Aankruisen door de lezer ...' in voorkom-je-schijnzelfstandigheid en
# de herhaalde zin in hoe-kom-ik-van-mijn-belastingschuld-af) hebben geen aanwijsbare bestemming en blijven platte tekst.
GELDIGE_HREF = re.compile(r'^(?:https?://[^\s()<>]+|/\S*|#\S*|mailto:\S+|tel:\S+)$')
HERSTEL_HREF = [(re.compile(r'^\s*Schedule a free, no-obligation consultation\.'), '/gratis-intakegesprek/')]

def schoon_links(h):
    def link(m):
        if GELDIGE_HREF.match(html.unescape(m.group(1)).strip()): return m.group(0)
        tekst = html.unescape(re.sub(r'<[^>]+>', '', m.group(2)))
        for patroon, href in HERSTEL_HREF:
            if patroon.match(tekst): return f'<a href="{href}">{m.group(2)}</a>'
        return m.group(2)
    return re.sub(r'(?s)<a\b[^>]*?\shref="([^"]*)"[^>]*>(.*?)</a>', link, h)

def koppen_niveau(h):
    """De titel van het artikel is de h1, dus de eerste kop in de tekst mag niet dieper dan h2 zijn (WCAG 1.3.1, axe heading-order).
    41 artikelen beginnen met een h3 ('Introductie over ...'): de koppen vóór de eerste h2 (of alle koppen als er geen h2 is) gaan
    zoveel niveaus omhoog dat de eerste een h2 wordt. Het uiterlijk blijft gelijk aan de oude site: een verhoogde kop krijgt
    class kop-<oud niveau> (zie .kop-3 en .kop-4 in styles.css, BLOK-C)."""
    niveaus = [int(n) for n in re.findall(r'<h([1-6])\b', h)]
    eerste_h2 = next((i for i, n in enumerate(niveaus) if n == 2), len(niveaus))
    lead = niveaus[:eerste_h2]
    if not lead or min(lead) <= 2: return h
    shift = min(lead) - 2
    teller = iter(range(len(niveaus)))
    huidig = {}
    def kop(m):
        sluit, n, rest = m.group(1), int(m.group(2)), m.group(3)
        if not sluit: huidig['i'] = next(teller)
        i = huidig['i']
        if i >= eerste_h2: return m.group(0)
        nieuw = n - shift
        return f'</h{nieuw}>' if sluit else f'<h{nieuw} class="kop-{n}"{rest}>'
    return re.sub(r'<(/?)h([1-6])\b([^>]*)>', kop, h)

# Engelstalige artikelen (4 stuks) krijgen taal 'en' in blog.json: lang-attribuut, og:locale en inLanguage in $slug.tsx.
# Herkenning aan het aantal Nederlandse tegen Engelse functiewoorden in het begin van de tekst; het resultaat wordt bij het bouwen getoond.
NL_WOORDEN = re.compile(r'\b(de|het|een|en|van|je|niet|voor|met|zijn|dat|op|bij|als)\b', re.I)
EN_WOORDEN = re.compile(r'\b(the|and|of|to|for|with|your|you|are|that|this|can|will)\b', re.I)
def taal_van(h):
    tekst = re.sub(r'<[^>]+>', ' ', h)[:3000]
    return 'en' if len(EN_WOORDEN.findall(tekst)) >= 3 * len(NL_WOORDEN.findall(tekst)) + 20 else 'nl'

def schoon(h):
    h = re.sub(r'(?s)<noscript>.*?</noscript>', '', h)
    h = re.sub(r'<!--.*?-->', '', h, flags=re.S)
    def img(m):
        tag = m.group(0)
        src = re.search(r'data-src="([^"]+)"', tag) or re.search(r'\ssrc="(https?://[^"]+)"', tag)
        alt = re.search(r'alt="([^"]*)"', tag)
        if not src: return ''
        l = lokaal(src.group(1))
        if not l: return ''
        a = alt_voor(l, alt.group(1) if alt else '')
        return f'<img src="{l}" alt="{a}" loading="lazy" decoding="async">'
    h = re.sub(r'<img\b[^>]*>', img, h)
    h = re.sub(r'<h1\b', '<h2', h); h = re.sub(r'</h1>', '</h2>', h)
    # YouTube-embeds: WordPress lazyload zet de bron in data-src; die moet naar src voordat de data-attributen verdwijnen
    h = re.sub(r'(<iframe\b[^>]*?\s)data-src="', r'\1src="', h)
    h = re.sub(r'\s(class|style|id|data-[a-z-]+|decoding|sizes|srcset|width|height)="[^"]*"', '', h)
    # iframes: 16:9-wrapper (div.video), originele titel behouden, zonder de omliggende figure/div van WordPress
    def video(m):
        tag = m.group('iframe')
        src = re.search(r'\ssrc="([^"]+)"', tag)
        if not src: return m.group(0)
        yt = re.match(r'https?://(?:www\.)?youtube(?:-nocookie)?\.com/embed/([A-Za-z0-9_-]+)', src.group(1))
        url = f'https://www.youtube-nocookie.com/embed/{yt.group(1)}' if yt else src.group(1).replace('?feature=oembed', '')
        titel = re.search(r'\stitle="([^"]*)"', tag)
        t = titel.group(1) if titel else 'Video'
        return (f'<div class="video"><iframe src="{url}" title="{t}" loading="lazy" '
                f'allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" '
                f'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>')
    h = re.sub(r'(?s)(?:<figure>\s*<div>\s*)?(?P<iframe><iframe\b[^>]*></iframe>)(?:\s*</div>\s*</figure>)?', video, h)
    # width/height van de lokale beelden (tegen layout shift); na het strippen van de WordPress-attributen
    def afm(m):
        mt = maten(m.group(1))
        return f'<img src="{m.group(1)}" width="{mt[0]}" height="{mt[1]}"' if mt else m.group(0)
    h = re.sub(r'<img src="(/images/[^"]+)"', afm, h)
    h = re.sub(r'href="https?://(?:www\.)?belastingbemiddelaar\.nl(/[^"]*)?"', lambda m: f'href="{m.group(1) or "/"}"', h)
    # lege paragrafen en lege figuren (David-L.jpg geeft op de oude site een 404, het beeld ontbreekt dus ook lokaal).
    # Opeenvolgende br's blijven staan: de oude site toont die als witregels (9 plaatsen met 3 br).
    h = re.sub(r'<p>\s*(?:<br\s*/?>|&nbsp;|\s)*</p>', '', h)
    h = re.sub(r'<figure>\s*</figure>', '', h)
    h = schoon_links(h)
    h = koppen_niveau(h)
    # externe links: noopener, in een nieuw venster. WordPress had target en rel al op de LinkedIn-links gezet;
    # die eerst weghalen, anders staan ze er dubbel in (ongeldige HTML).
    h = re.sub(r'(<a\b[^>]*?)\s(?:target|rel)="[^"]*"', r'\1', h)
    h = re.sub(r'(<a\b[^>]*?)\s(?:target|rel)="[^"]*"', r'\1', h)
    h = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" rel="noopener" target="_blank"', h)
    # de eerste afbeelding in de tekst niet lazy: op een telefoon (en bij een artikel zonder uitgelichte afbeelding ook op een
    # desktop) staat hij al deels in het eerste scherm
    h = re.sub(r'(<img\b[^>]*?) loading="lazy"', r'\1 loading="eager"', h, count=1)
    return h.strip()

uit = []
for p in sorted(posts, key=lambda x: x['date'], reverse=True):
    link = p['link']
    s = seo.get(link, {})
    plain = html.unescape(re.sub(r'<[^>]+>', ' ', p['excerpt']['rendered']))
    plain = re.sub(r'\s+', ' ', plain).strip()
    ft = media.get(p['featured_media'])
    inhoud = schoon(p['content']['rendered'])
    uit.append({
        'slug': p['slug'],
        'title': html.unescape(p['title']['rendered']).strip(),
        'date': p['date'][:10],
        'modified': p['modified'][:10],
        'excerpt': plain,
        'image': lokaal(ft) if ft else None,
        'imageW': maten(lokaal(ft))[0] if ft and lokaal(ft) and maten(lokaal(ft)) else None,
        'imageH': maten(lokaal(ft))[1] if ft and lokaal(ft) and maten(lokaal(ft)) else None,
        # exact de <title> van de oude pagina (bij 23 posts met suffix ' - Belasting Bemiddelaar', bij de rest zonder)
        'seoTitle': s.get('title', ''),
        'seoDescription': s.get('description', ''),
        # alleen aanwezig bij Engelstalige artikelen (de rest is Nederlands)
        **({'taal': 'en'} if taal_van(inhoud) == 'en' else {}),
        'html': inhoud,
    })
json.dump(uit, open(UIT, 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(uit), os.path.getsize(UIT) // 1024, 'KB')
print('zonder image:', sum(1 for u in uit if not u['image']), '| zonder seoDescription:', sum(1 for u in uit if not u['seoDescription']))
print('resterende wp-content verwijzingen:', sum(u['html'].count('wp-content') for u in uit))
print('Engelstalig:', ', '.join(u['slug'] for u in uit if u.get('taal') == 'en'))
print('koppen met verhoogd niveau (class kop-N):', sum(u['html'].count('class="kop-') for u in uit), 'in', sum(1 for u in uit if 'class="kop-' in u['html']), 'artikelen')
