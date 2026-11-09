"""ref/intake-fields.json + ref/intake-logic.json → src/content/intake.json (formulier 'Intake nieuwe klant')"""
import json
d=json.load(open('ref/intake-fields.json')); logic=json.load(open('ref/intake-logic.json'))
out=[]
for f in d['fields']:
    t=f['type']; e={'id':f['id'],'type':t}
    if t=='section': e['label']=f['html']
    else:
        e['label']=f['label']; 
        if f['desc']: e['desc']=f['desc']
        if 'hidden_label' in f['css']: e['hideLabel']=True
        # Voorbeeldtekst (placeholder) van het oude formulier; staat bij tekstvelden en tekstvakken in inputs[].ph
        if t in ('text','textarea','email'):
            ph=next((i['ph'] for i in f['inputs'] if i.get('ph')),'')
            if ph: e['ph']=ph
        if t in('radio','checkbox'):
            seen=[]; 
            for i in f['inputs']:
                if i['type'] in('radio','checkbox') and i['name'] and not i['name'].startswith('gform') and i['label'] and i['label'] not in seen: seen.append(i['label'])
            e['options']=seen
        if f['required']: e['required']=True
    l=logic.get(f['id'],{}).get('field') if f['id'] in logic else None
    if l:
        rules=[{'field':r['fieldId'],'value':r['value']} for r in l['rules']]
        # Op de live oude pagina blijft STAP 10 (veld 54 t/m 60) verborgen bij BV + 'Belastingschuld + stoppen (turbo-liquidatie)':
        # Gravity Forms past de voorwaarden van de sectiekop (54) toe op alle velden in die sectie, en die kop kent deze regel niet.
        # De losse regel op veld 55/56/57/60 werkt daardoor niet; hier weggelaten zodat het formulier gelijk blijft aan de live site.
        if f['id'] in ('55','56','57','60'):
            rules=[r for r in rules if r['value']!='Belastingschuld + stoppen (turbo-liquidatie)']
        e['cond']={'action':l['actionType'],'logic':l['logicType'],'rules':rules}
    out.append(e)
json.dump(out,open('src/content/intake.json','w'),ensure_ascii=False,indent=1)
print(len(out)); print([ (e['id'],e['type'],len(e.get('options',[]))) for e in out if e['type'] in ('radio','checkbox')])
