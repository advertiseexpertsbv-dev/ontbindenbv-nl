"""ref/api/dienst-1.json + ref/diensten/<slug>.html + ref/seo/seo.json → src/content/diensten.json

De dienstpagina's van ontbindenbv.nl (Oxygen) hebben één tekstkolom naast het formulier. Die kolom wordt in volgorde
omgezet naar blokken, zodat de opbouw gelijk blijft aan de oude site:
  - tekstblok (ct-text-block): alinea's gescheiden door een dubbele <br>         -> {'t':'p','alineas': [html (b/em/a/br)]}
    een tekstblok dat helemaal vet is                                          -> {'t':'b','x': tekst}
  - tussenkop (h2/h3 ct-headline)                                              -> {'t':'h','x': tekst}
  - lijst (div.list) met vinkjes                                               -> {'t':'ul','items':[html]}
  - tabel 'Voordelen / Wat wij doen' (dienst_waarom)                           -> {'t':'tabel','kop':[a,b],'rijen':[[a,b]]}
  - knoppengroep (btn_group: Gratis intakegesprek + Online afspraak inplannen) -> {'t':'knoppen'}
  - de rij met USP's bovenaan (usp_grid) is overal gelijk en staat in content/home.ts (vertrouwenDienst)
De vinkjes in de titelbalk (bij de 7 hoofddiensten) gaan mee als 'bannerPunten': [html]; 'uitgebreid' = de pagina toont
ook de werkwijze en de CTA-band (met de knop 'Bel direct met een specialist').
De veelgestelde vragen per dienst (accordion onder de reviews) gaan mee als 'faq': [{v, a}] (a = html met p/em/b/a).
Gebruik: python3 scripts/bouw-diensten.py [uitvoerbestand]   (vanuit de projectroot)
"""
import json, re, html, sys
from bs4 import BeautifulSoup, NavigableString, Tag

R = 'ref'
BASE = 'https://ontbindenbv.nl'
UIT = sys.argv[1] if len(sys.argv) > 1 else 'src/content/diensten.json'
api = json.load(open(f'{R}/api/dienst-1.json'))
seo = json.load(open(f'{R}/seo/seo.json'))
SUFFIX = ' - BV ontbinden?'


def schoon(t):
    return re.sub(r'\s+', ' ', t.replace('\xa0', ' ')).strip()


def interne_href(href):
    href = href.strip()
    m = re.match(r'https?://(?:www\.)?ontbindenbv\.nl(/.*)?$', href)
    return (m.group(1) or '/') if m else href


def inline_html(nodes):
    """Nodes → beperkte HTML: alleen tekst, b/strong (→ b), em/i (→ em), a (href) en br blijven over."""
    uit = []
    for n in nodes:
        if isinstance(n, NavigableString):
            uit.append(html.escape(str(n).replace('\xa0', ' '), quote=False))
        elif isinstance(n, Tag):
            naam = n.name
            binnen = inline_html(n.children)
            if naam in ('b', 'strong'):
                uit.append(f'<b>{binnen}</b>' if schoon(n.get_text()) else binnen)
            elif naam in ('em', 'i'):
                uit.append(f'<em>{binnen}</em>' if schoon(n.get_text()) else binnen)
            elif naam == 'a' and n.get('href'):
                href = interne_href(n['href'])
                if href in ('#', ''):  # lege placeholder-links van de oude site: bellen of een intake plannen
                    href = 'tel:+31850048369' if schoon(n.get_text()).lower().startswith('bel') else '/gratis-intakegesprek/'
                uit.append(f'<a href="{html.escape(href)}">{binnen}</a>')
            elif naam == 'br':
                uit.append('<br>')
            else:
                uit.append(binnen)
    return ''.join(uit)


def html_schoon(h):
    h = re.sub(r'\s+', ' ', h)
    h = re.sub(r'^(?:\s|<br>)+|(?:\s|<br>)+$', '', h)
    return h.strip()


def alineas(tb):
    """Splitst een tekstblok op een dubbele <br> in alinea's (lijst van node-lijsten)."""
    groepen, cur, run = [], [], 0
    for c in tb.children:
        if getattr(c, 'name', None) == 'br':
            run += 1
            continue
        if run >= 2 and schoon(''.join(n.get_text() if hasattr(n, 'get_text') else str(n) for n in cur)):
            groepen.append(cur)
            cur = []
        elif run == 1:
            cur.append(Tag(name='br'))
        run = 0
        cur.append(c)
    if cur:
        groepen.append(cur)
    return groepen


def helemaal_vet(tb):
    tekst = schoon(tb.get_text())
    vet = schoon(' '.join(b.get_text() for b in tb.find_all(['b', 'strong'])))
    return bool(tekst) and tekst == vet


def tekstkolom(soup):
    usp = soup.select_one('.usp_grid')
    return usp.parent if usp else None


def blokken_uit_html(soup):
    kolom = tekstkolom(soup)
    out = []
    for c in kolom.children:
        if not isinstance(c, Tag):
            continue
        cls = c.get('class') or []
        if 'usp_grid' in cls:
            continue
        if c.name in ('h2', 'h3', 'h4'):
            x = schoon(c.get_text())
            if x:
                out.append({'t': 'h', 'x': x})
        elif 'btn_group' in cls:
            if not out or out[-1]['t'] != 'knoppen':
                out.append({'t': 'knoppen'})
        elif 'list' in cls:
            items = [html_schoon(inline_html(tb.children)) for tb in c.select('.ct-text-block')]
            items = [i for i in items if schoon(re.sub(r'<[^>]+>', ' ', i))]
            if items:
                out.append({'t': 'ul', 'items': items})
        elif 'dienst_waarom' in cls:
            cellen = [schoon(tb.get_text()) for tb in c.select(':scope > div .ct-text-block')]
            kop, rest = cellen[:2], cellen[2:]
            out.append({'t': 'tabel', 'kop': kop, 'rijen': [rest[i:i + 2] for i in range(0, len(rest), 2)]})
        elif 'ct-text-block' in cls:
            if helemaal_vet(c):
                out.append({'t': 'b', 'x': schoon(c.get_text())})
                continue
            als = [html_schoon(inline_html(g)) for g in alineas(c)]
            als = [h for h in als if schoon(re.sub(r'<[^>]+>', ' ', h))]
            if als:
                out.append({'t': 'p', 'alineas': als})
        else:
            x = schoon(c.get_text())
            if x:
                print('  overgeslagen blok:', c.name, cls, x[:60])
    return out


def faq_uit_html(soup):
    uit = []
    for item in soup.select('.accordion .accordion_item'):
        v = schoon(item.select_one('.accordion_title').get_text())
        inhoud = item.select_one('.accordion_content')
        delen = []
        for p in inhoud.find_all('p') or [inhoud]:
            h = html_schoon(inline_html(p.children))
            if schoon(re.sub(r'<[^>]+>', ' ', h)):
                delen.append(f'<p>{h}</p>')
        if v and delen:
            uit.append({'v': v, 'a': ''.join(delen)})
    return uit


uit = []
for d in api:
    s = d['slug']
    soup = BeautifulSoup(open(f'{R}/diensten/{s}.html', encoding='utf-8').read(), 'lxml')
    banner = soup.select_one('section.banner_page')
    h1 = schoon(banner.find('h1').get_text())
    sub_el = banner.select_one('.ct-text-block')
    sub = schoon(sub_el.get_text()) if sub_el else ''
    bl = blokken_uit_html(soup)
    blijst = banner.select_one('.list')
    banner_punten = [html_schoon(inline_html(tb.children)) for tb in blijst.select('.ct-text-block')] if blijst else []
    uitgebreid = any('werkwijze' in h.get_text().lower() for h in soup.select('h2'))
    naam = html.unescape(d['title']['rendered']).strip()
    s_seo = seo.get(f'{BASE}/dienst/{s}/', {})
    titel = s_seo.get('title') or f'{naam}{SUFFIX}'
    desc = s_seo.get('description') or ''
    if not desc:
        ps = [schoon(re.sub(r'<[^>]+>', ' ', a)) for b in bl if b['t'] == 'p' for a in b['alineas']]
        first = html.unescape(next((p for p in ps if len(p) > 60), ps[0] if ps else naam))
        first = schoon(first)
        desc = first[:157].rsplit(' ', 1)[0] + '…' if len(first) > 157 else first
    uit.append({
        'slug': s,
        'naam': naam,
        'h1': h1,
        'sub': sub,
        # exact de oude <title> zonder het suffix; seo() zet ' - BV ontbinden?' er weer achter
        'seoTitle': titel[: -len(SUFFIX)] if titel.endswith(SUFFIX) else titel,
        'description': desc,
        'bannerPunten': banner_punten,
        'uitgebreid': uitgebreid,
        'blokken': bl,
        'faq': faq_uit_html(soup),
    })
json.dump(uit, open(UIT, 'w'), ensure_ascii=False, indent=1)
for u in uit:
    soorten = {}
    for b in u['blokken']:
        soorten[b['t']] = soorten.get(b['t'], 0) + 1
    print(u['slug'], '|', u['sub'][:30], '| banner', len(u['bannerPunten']), '| uitgebreid', u['uitgebreid'], '|', soorten, '| faq', len(u['faq']))
