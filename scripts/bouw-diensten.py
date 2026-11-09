"""ref/diensten.json + ref/api/dienst-1.json + ref/diensten/<slug>.html → src/content/diensten.json

De tekstblokken komen rechtstreeks uit de opgeslagen HTML van de oude pagina (kolom 'ct-inner-content'),
zodat de opbouw gelijk blijft aan de oude site:
  - alinea's staan in 1 tekstblok, gescheiden door een dubbele <br>  -> {'t':'p'}
  - tussenkoppen (h3)                                               -> {'t':'h'}
  - vette tussenregel zoals 'Voor de Werknemer:'                    -> {'t':'b'}
  - lijst (div.list) met vinkjes; een item mag beginnen met een
    vet kopje, dan staat de omschrijving op de volgende regel       -> {'t':'ul','items':[str | {'lead','x'}]}
Gebruik: python3 scripts/bouw-diensten.py [uitvoerbestand]   (vanuit de projectroot)
"""
import json, re, html, sys
from bs4 import BeautifulSoup, NavigableString

R = 'ref'
UIT = sys.argv[1] if len(sys.argv) > 1 else 'src/content/diensten.json'
api = json.load(open(f'{R}/api/dienst-1.json'))
raw = json.load(open(f'{R}/diensten.json'))
seo = json.load(open(f'{R}/seo/seo.json'))


def schoon(t):
    return re.sub(r'\s+', ' ', t.replace('\xa0', ' ')).strip()


def alineas(tb):
    """Splits een tekstblok op een dubbele <br> in alinea's; geeft lijst van lijsten met nodes."""
    groepen, cur, run = [], [], 0
    for c in tb.children:
        if getattr(c, 'name', None) == 'br':
            run += 1
            continue
        if run >= 2 and schoon(''.join(n.get_text() if hasattr(n, 'get_text') else str(n) for n in cur)):
            groepen.append(cur)
            cur = []
        elif run == 1:
            cur.append(NavigableString(' '))
        run = 0
        cur.append(c)
    if cur:
        groepen.append(cur)
    return groepen


def tekst_van(nodes):
    return schoon(''.join(n.get_text() if hasattr(n, 'get_text') else str(n) for n in nodes))


def lijstitem(tb):
    """Item uit div.list: optioneel vet kopje (<b>) + omschrijving."""
    kinderen = [c for c in tb.children if not (isinstance(c, NavigableString) and not schoon(str(c)))]
    if kinderen and getattr(kinderen[0], 'name', None) == 'b':
        lead = schoon(kinderen[0].get_text())
        rest = tekst_van(kinderen[1:])
        if lead and rest:
            return {'lead': lead, 'x': rest}
        return lead or rest
    return tekst_van(tb.children)


def blokken_uit_html(pad):
    soup = BeautifulSoup(open(pad, encoding='utf-8').read(), 'lxml')
    inner = soup.select_one('.spacing_2 .ct-inner-content')
    out = []

    def loop(node):
        for c in node.children:
            naam = getattr(c, 'name', None)
            if not naam:
                continue
            cls = c.get('class') or []
            if naam == 'h3':
                x = schoon(c.get_text())
                if x:
                    out.append({'t': 'h', 'x': x})
            elif 'list' in cls:
                items = [lijstitem(tb) for tb in c.select('.ct-text-block')]
                items = [i for i in items if i]
                if items:
                    out.append({'t': 'ul', 'items': items})
            elif 'ct-text-block' in cls:
                vet = [x for x in c.children if getattr(x, 'name', None) == 'b']
                zonder_vet = tekst_van([x for x in c.children if getattr(x, 'name', None) != 'b'])
                if vet and not zonder_vet:
                    x = schoon(c.get_text())
                    if x:
                        out.append({'t': 'b', 'x': x})
                    continue
                for g in alineas(c):
                    x = tekst_van(g)
                    if x:
                        out.append({'t': 'p', 'x': x})
            elif naam == 'div':
                loop(c)

    loop(inner)
    return out


# volgorde zoals op de homepage: schijn-zelfstandigheid eerst, rest in API-volgorde (begint bij naheffingsaanslag)
uit = []
for d in api:
    s = d['slug']
    r = raw[s]
    bl = blokken_uit_html(f'{R}/diensten/{s}.html')
    naam = html.unescape(d['title']['rendered'])
    ps = [b['x'] for b in bl if b['t'] == 'p']
    first = next((p for p in ps if len(p) > 60), '')
    desc = re.sub(r'\s+', ' ', first)[:157].rsplit(' ', 1)[0] + '…' if len(first) > 157 else first
    uit.append({'slug': s, 'naam': naam, 'h1': r['h1'], 'sub': r['sub'], 'seoTitle': re.sub(r'\s*-\s*Belasting Bemiddelaar$', '', seo.get(d['link'], {}).get('title', naam)), 'description': desc, 'blokken': bl})
json.dump(uit, open(UIT, 'w'), ensure_ascii=False, indent=1)
for u in uit[:1] + [x for x in uit if x['slug'] == 'schijn-zelfstandigheid']:
    print(u['slug'], u['naam'], '|', u['seoTitle'], '|', u['description'][:80])
    for b in u['blokken']:
        print('  ', b['t'], b['x'] if b['t'] != 'ul' else len(b['items']))
print([(u['slug'], sum(len(b.get('items', [])) for b in u['blokken'] if b['t'] == 'ul')) for u in uit])
