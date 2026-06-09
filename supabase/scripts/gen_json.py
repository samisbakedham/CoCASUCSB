import json, os
ns={}
src=open('/tmp/gen_seed.py').read().split('# emit')[0]
exec(src, ns)
bcus=ns['bcus']; persons=ns['persons']; appts=ns['appts']; positions=ns['positions']; budget=ns['budget']
out={"bcus":[],"roster":[],"budget":[],"positions":[]}
for b in bcus.values():
    out["bcus"].append(dict(slug=b['slug'],name=b['name'],short=b['short'],type=b['type'],
                            website=b.get('website'),contact_name=b.get('cname'),contact_email=b.get('cemail')))
for i,p in enumerate(positions,1):
    b=bcus[p['bcu']]
    out["positions"].append(dict(id=f"p{i}",title=p['title'],status=p['status'],routing=p['routing'],
        external_url=p['external_url'],coc_advertises=p['coc_adv'],notes=p['notes'],
        bcu_slug=b['slug'],bcu_name=b['name'],bcu_short=b['short'],bcu_type=b['type']))
for a in appts:
    pr=persons[a['pk']]; b=bcus[a['bcu']]
    out["roster"].append(dict(full_name=pr['full_name'],as_email=pr['asem'],role_title=a['role'],
        is_chair=a['is_chair'],term=a['term'],bcu_slug=b['slug'],bcu_name=b['name'],bcu_short=b['short'],bcu_type=b['type']))
for b in budget:
    out["budget"].append(dict(entity=b['entity'],fiscal_year=b['fy'],category=b['cat'],
        description=b['desc'],amount=b['amt'],recommendation_stage=b['stage'],sort_order=b['sort']))
d="/Users/wonda/Documents/GitHub/CoCASUCSB/web/src/lib"; os.makedirs(d,exist_ok=True)
json.dump(out,open(d+"/seed-data.json","w"),indent=0)
tot=sum((x['amount'] or 0) for x in out['budget'] if x['fiscal_year']=='2026-27' and x['category']=='staff_allocation')
print("OK budget keys fixed. FY27 staff total = ${:,.0f}".format(tot))
print("counts:",len(out['bcus']),"bcus",len(out['positions']),"positions",len(out['roster']),"roster",len(out['budget']),"budget")
