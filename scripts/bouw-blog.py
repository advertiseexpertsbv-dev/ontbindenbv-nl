"""Zet de WordPress-posts van ontbindenbv.nl (ref/api/posts-1.json) om naar src/content/blog.json.
Eerst node scripts/beelden.mjs (maakt public/images/blog en ref/beeldkaart.json).
Gebruik: python3 scripts/bouw-blog.py [uitvoerbestand]   (standaard src/content/blog.json)

Per artikel: titel, datums, samenvatting, uitgelichte afbeelding (met alt en afmetingen), de exacte <title> en meta description
van de oude pagina (ref/seo/seo.json), de veelgestelde vragen uit het FAQPage-schema dat in de tekst stond (voor het schema in de
head), de inhoudsopgave (h2's met een id) en de opgeschoonde html."""
import json, re, html, os, sys
from PIL import Image

R = 'ref'
BASE = 'https://ontbindenbv.nl'
UIT = sys.argv[1] if len(sys.argv) > 1 else 'src/content/blog.json'
posts = json.load(open(f'{R}/api/posts-1.json'))
media = {m['id']: m for m in json.load(open(f'{R}/api/media-1.json')) + json.load(open(f'{R}/api/media-2.json'))}
seo = json.load(open(f'{R}/seo/seo.json'))
kaart = json.load(open(f'{R}/beeldkaart.json'))


def archief_teksten():
    """De korte tekst onder de titel in het kennisbankoverzicht (oud: de eerste woorden van de samenvatting met '...'),
    letterlijk uit ref/html/kennisbank.html en kennisbank--page--N.html"""
    from bs4 import BeautifulSoup
    uit = {}
    for f in sorted(os.listdir(f'{R}/html')):
        if not re.match(r'kennisbank(--page--\d+)?\.html$', f):
            continue
        soup = BeautifulSoup(open(f'{R}/html/{f}', encoding='utf-8').read(), 'lxml')
        for a in soup.select('.oxy-posts a.oxy-post'):
            t = a.select_one('.ct-text-block')
            uit[a['href'].rstrip('/').split('/')[-1]] = re.sub(r'\s+', ' ', t.get_text()).strip() if t else ''
    return uit


archief = archief_teksten()


def lokaal(u):
    """WordPress-URL -> lokaal pad (/images/blog/...), of None"""
    k = re.sub(r'-\d+x\d+(?=\.[a-z]+$)', '', u.replace('http://', 'https://')).split('/uploads/')[-1].replace('/', '_')
    return kaart.get(k) or kaart.get(re.sub(r'(\.[a-z]+)$', r'-scaled\1', k))


_maten = {}
def maten(pad):
    """(breedte, hoogte) van een lokaal beeld in public/, voor width/height tegen layout shift"""
    if pad not in _maten:
        try:
            with Image.open('public' + pad) as im:
                _maten[pad] = im.size
        except Exception:
            _maten[pad] = None
    return _maten[pad]


def faq_uit_scripts(h):
    """Het FAQPage-schema dat WordPress als <script> in de tekst had (soms met <br /> erin door wpautop) -> [{vraag, antwoord}]"""
    uit = []
    for s in re.findall(r'(?s)<script[^>]*application/ld\+json[^>]*>(.*?)</script>', h):
        s = re.sub(r'<br\s*/?>', '', s)
        try:
            d = json.loads(html.unescape(s))
        except Exception as e:
            print('  schema niet te lezen:', str(e)[:60])
            continue
        for item in d if isinstance(d, list) else [d]:
            if item.get('@type') != 'FAQPage':
                continue
            for q in item.get('mainEntity', []):
                a = q.get('acceptedAnswer', {})
                if q.get('name') and a.get('text'):
                    uit.append({'vraag': q['name'].strip(), 'antwoord': a['text'].strip()})
    return uit


def koppen_niveau(h):
    """De titel van het artikel is de h1, dus de eerste kop in de tekst mag niet dieper dan h2 zijn (WCAG 1.3.1). Koppen vóór de
    eerste h2 (of alle koppen als er geen h2 is) gaan zoveel niveaus omhoog dat de eerste een h2 wordt; ze houden de maat van hun
    oude niveau via class kop-<oud niveau> (styles.css)."""
    niveaus = [int(n) for n in re.findall(r'<h([1-6])\b', h)]
    eerste_h2 = next((i for i, n in enumerate(niveaus) if n == 2), len(niveaus))
    lead = niveaus[:eerste_h2]
    if not lead or min(lead) <= 2:
        return h
    shift = min(lead) - 2
    teller = iter(range(len(niveaus)))
    huidig = {}

    def kop(m):
        sluit, n, rest = m.group(1), int(m.group(2)), m.group(3)
        if not sluit:
            huidig['i'] = next(teller)
        if huidig['i'] >= eerste_h2:
            return m.group(0)
        nieuw = n - shift
        return f'</h{nieuw}>' if sluit else f'<h{nieuw} class="kop-{n}"{rest}>'

    return re.sub(r'<(/?)h([1-6])\b([^>]*)>', kop, h)


def slug_van(t):
    t = html.unescape(re.sub(r'<[^>]+>', '', t)).lower()
    t = t.replace('ë', 'e').replace('é', 'e').replace('è', 'e').replace('ï', 'i').replace('ö', 'o').replace('ü', 'u').replace('’', '')
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')[:60] or 'kop'


def inhoudsopgave(h):
    """Geeft elke h2 een id en levert de lijst [{id, tekst}] voor de inhoudsopgave"""
    toc, gezien = [], set()

    def kop(m):
        attrs, binnen = m.group(1), m.group(2)
        tekst = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', binnen))).strip()
        if not tekst:
            return m.group(0)
        basis = slug_van(tekst)
        i, n = basis, 2
        while i in gezien:
            i, n = f'{basis}-{n}', n + 1
        gezien.add(i)
        toc.append({'id': i, 'tekst': tekst})
        return f'<h2 id="{i}"{attrs}>{binnen}</h2>'

    return re.sub(r'(?s)<h2\b([^>]*)>(.*?)</h2>', kop, h), toc


GELDIGE_HREF = re.compile(r'^(?:https?://[^\s()<>]+|/\S*|#\S*|mailto:\S+|tel:\S+)$')


def schoon_links(h):
    """Een <a> zonder geldige href (losse zin of redactie-opmerking uit WordPress) wordt platte tekst"""
    def link(m):
        return m.group(0) if GELDIGE_HREF.match(html.unescape(m.group(1)).strip()) else m.group(2)
    return re.sub(r'(?s)<a\b[^>]*?\shref="([^"]*)"[^>]*>(.*?)</a>', link, h)


NL_WOORDEN = re.compile(r'\b(de|het|een|en|van|je|niet|voor|met|zijn|dat|op|bij|als)\b', re.I)
EN_WOORDEN = re.compile(r'\b(the|and|of|to|for|with|your|you|are|that|this|can|will)\b', re.I)
def taal_van(h):
    tekst = re.sub(r'<[^>]+>', ' ', h)[:3000]
    return 'en' if len(EN_WOORDEN.findall(tekst)) >= 3 * len(NL_WOORDEN.findall(tekst)) + 20 else 'nl'


def schoon(h):
    h = re.sub(r'(?s)<noscript>.*?</noscript>', '', h)
    h = re.sub(r'(?s)<script\b.*?</script>', '', h)
    h = re.sub(r'(?s)<!--.*?-->', '', h)

    def img(m):
        tag = m.group(0)
        src = re.search(r'data-src="([^"]+)"', tag) or re.search(r'\ssrc="(https?://[^"]+)"', tag)
        if not src:
            return ''
        l = lokaal(src.group(1))
        if not l:
            print('  beeld ontbreekt:', src.group(1))
            return ''
        alt = re.search(r'alt="([^"]*)"', tag)
        return f'<img src="{l}" alt="{alt.group(1) if alt else ""}" loading="lazy">'

    h = re.sub(r'<img\b[^>]*>', img, h)
    h = re.sub(r'<h1\b', '<h2', h)
    h = re.sub(r'</h1>', '</h2>', h)
    h = re.sub(r'(<iframe\b[^>]*?\s)data-src="', r'\1src="', h)
    h = re.sub(r'\s(class|style|id|data-[a-z-]+|decoding|sizes|srcset|width|height)="[^"]*"', '', h)

    def video(m):
        tag = m.group('iframe')
        src = re.search(r'\ssrc="([^"]+)"', tag)
        if not src:
            return m.group(0)
        yt = re.match(r'https?://(?:www\.)?youtube(?:-nocookie)?\.com/embed/([A-Za-z0-9_-]+)', src.group(1))
        url = f'https://www.youtube-nocookie.com/embed/{yt.group(1)}' if yt else src.group(1).replace('?feature=oembed', '')
        titel = re.search(r'\stitle="([^"]*)"', tag)
        return (f'<div class="video"><iframe src="{url}" title="{titel.group(1) if titel else "Video"}" loading="lazy" '
                f'allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" '
                f'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>')

    h = re.sub(r'(?s)(?:<figure>\s*<div>\s*)?(?P<iframe><iframe\b[^>]*></iframe>)(?:\s*</div>\s*</figure>)?', video, h)

    def afm(m):
        mt = maten(m.group(1))
        return f'<img src="{m.group(1)}" width="{mt[0]}" height="{mt[1]}"' if mt else m.group(0)

    h = re.sub(r'<img src="(/images/[^"]+)"', afm, h)
    # interne links relatief
    h = re.sub(r'href="https?://(?:www\.)?ontbindenbv\.nl(/[^"]*)?"', lambda m: f'href="{m.group(1) or "/"}"', h)
    # lege alinea's, lege figuren en een <br> direct aan het begin of eind van een alinea (WordPress-restjes)
    h = re.sub(r'<p>\s*(?:<br\s*/?>|&nbsp;|\s)*</p>', '', h)
    h = re.sub(r'<figure>\s*</figure>', '', h)
    h = re.sub(r'<p>(\s*<strong>\s*<br\s*/?>\s*</strong>)', '<p>', h)
    h = re.sub(r'<br\s*/?>\s*</p>', '</p>', h)
    h = schoon_links(h)
    h = koppen_niveau(h)
    # externe links: noopener, nieuw venster (bestaande target/rel eerst weg, anders dubbel)
    for _ in range(2):
        h = re.sub(r'(<a\b[^>]*?)\s(?:target|rel)="[^"]*"', r'\1', h)
    h = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" rel="noopener" target="_blank"', h)
    return re.sub(r'\n{3,}', '\n\n', h).strip()


uit = []
for p in sorted(posts, key=lambda x: x['date'], reverse=True):
    link = p['link']
    s = seo.get(link, {})
    plain = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', p['excerpt']['rendered']))).strip()
    ft = media.get(p['featured_media'])
    beeld = lokaal(ft['source_url']) if ft else None
    mt = maten(beeld) if beeld else None
    ruw = p['content']['rendered']
    inhoud, toc = inhoudsopgave(schoon(ruw))
    titel = html.unescape(p['title']['rendered']).strip()
    uit.append({
        'slug': p['slug'],
        'title': titel,
        'date': p['date'][:10],
        'modified': p['modified'][:10],
        'excerpt': plain,
        'kort': archief.get(p['slug']) or (' '.join(plain.split()[:10]) + '...'),
        'image': beeld,
        'imageW': mt[0] if mt else None,
        'imageH': mt[1] if mt else None,
        **({'imageAlt': ft['alt_text'].strip()} if ft and ft.get('alt_text', '').strip() else {}),
        # exact de <title> en meta description van de oude pagina
        'seoTitle': s.get('title', ''),
        'seoDescription': s.get('description', ''),
        **({'taal': 'en'} if taal_van(inhoud) == 'en' else {}),
        **({'faq': f} if (f := faq_uit_scripts(ruw)) else {}),
        'toc': toc,
        'html': inhoud,
    })
json.dump(uit, open(UIT, 'w'), ensure_ascii=False, separators=(',', ':'))
print('kaarttekst uit het oude overzicht:', sum(1 for u in uit if u['slug'] in archief), 'van', len(uit))
print(len(uit), 'artikelen,', os.path.getsize(UIT) // 1024, 'KB')
print('zonder image:', sum(1 for u in uit if not u['image']), '| zonder seoTitle:', sum(1 for u in uit if not u['seoTitle']), '| zonder seoDescription:', sum(1 for u in uit if not u['seoDescription']))
print('resterende wp-content verwijzingen:', sum(u['html'].count('wp-content') for u in uit))
print('Engelstalig:', ', '.join(u['slug'] for u in uit if u.get('taal') == 'en'))
print('met FAQ-schema:', sum(1 for u in uit if u.get('faq')), '| koppen verhoogd:', sum(1 for u in uit if 'class="kop-' in u['html']))
