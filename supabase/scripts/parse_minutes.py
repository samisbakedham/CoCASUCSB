import zipfile, re, os, glob
from xml.etree import ElementTree as ET
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
ROOT="/Users/wonda/Documents/GitHub/CoCASUCSB/reference/Minutes"
OUT="/Users/wonda/Documents/GitHub/CoCASUCSB/supabase/seed_minutes.sql"

def text_of(el): return "".join(t.text or "" for t in el.iter('{%s}t'%NS['w'])).strip()
def elements(path):
    z=zipfile.ZipFile(path); root=ET.fromstring(z.read('word/document.xml'))
    body=root.find('w:body',NS); out=[]
    for el in body:
        tag=el.tag.split('}')[1]
        if tag=='p':
            t=text_of(el)
            if t: out.append(("P",t))
        elif tag=='tbl':
            for row in el.findall('.//w:tr',NS):
                cells=[re.sub(r'\s+',' ',text_of(c)) for c in row.findall('w:tc',NS)]
                cells=[c for c in cells if c]
                if cells: out.append(("ROW",cells))
    return out

def q(s):
    if s is None: return "null"
    s=str(s).strip()
    return "null" if s=="" else "'"+s.replace("'","''")+"'"

SECT=re.compile(r'^(ACCEPTANCE|CONSENT|ACTION ITEM|F-1|F-2|OLD BUSINESS|NEW BUSINESS|DISCUSSION|REMARKS|ADJOURN|EVERYONE)', re.I)
REPORTS=re.compile(r'member report', re.I)
def status_norm(s):
    s=s.lower()
    if 'present' in s: return 'present'
    if 'excus' in s: return 'excused'
    if 'late' in s or 'arrived' in s: return 'late'
    if 'proxy' in s: return 'proxy'
    if 'absent' in s: return 'unexcused'
    return 'present'

def date_from_name(name):
    m=re.match(r'\s*(\d{1,2})-(\d{1,2})-(\d{2})', os.path.basename(name))
    if not m: return None
    mo,d,y=m.groups(); return f"20{y}-{int(mo):02d}-{int(d):02d}"

def parse(path):
    els=elements(path)
    meeting={'date':date_from_name(path),'location':None,'recorded_by':None,
             'called_to_order':None,'called_by':None,'qotw':None,'term':None}
    attendance=[]; reports=[]
    # metadata + roll call
    i=0; n=len(els)
    while i<n:
        kind,val=els[i]
        if kind=="P":
            t=val
            if t.lower().startswith("location:"):
                body=re.sub(r'^location:\s*','',t,flags=re.I)
                parts=re.split(r'\s*minutes\s*/\s*actions recorded by:\s*', body, flags=re.I)
                meeting['location']=(parts[0] or '').strip() or None
                meeting['recorded_by']=(parts[1].strip() if len(parts)>1 else None) or None
            elif t.lower().startswith("call to order"):
                m=re.search(r'(\d{1,2}[:.]\d{2}\s*[apAP]?\.?[mM]?)', t)
                if m: meeting['called_to_order']=m.group(1).strip()
                m2=re.search(r'by\s+(.+)$', t)
                if m2: meeting['called_by']=m2.group(1).strip()
            elif t.lower().startswith("question of the week") or t.lower().startswith("qotw:"):
                meeting['qotw']=re.sub(r'^(question of the week:?|qotw:)\s*','',t,flags=re.I).strip() or None
            elif t.lower()=="roll call":
                # consume following ROWs
                j=i+1
                while j<n and els[j][0]=="ROW":
                    cells=els[j][1]
                    # skip header row
                    if not (len(cells)>=2 and cells[0].lower()=="name"):
                        k=0
                        while k+1 < len(cells):
                            name=cells[k].strip(); st=cells[k+1].strip()
                            if name and name.lower()!="name" and not name.lower().startswith("note"):
                                attendance.append((name, status_norm(st)))
                            k+=2
                    j+=1
                i=j; continue
        i+=1
    names={a[0] for a in attendance}
    # reports
    start=None
    for idx,(kind,val) in enumerate(els):
        if kind=="P" and REPORTS.search(val): start=idx+1; break
    if start is not None:
        cur=None
        for kind,val in els[start:]:
            if kind!="P": continue
            t=val
            if SECT.match(t): break
            if 'advisor and senate liaison' in t.lower(): continue
            # heading if starts with an attendance name or VACANT and has " - " or "-" position
            is_head=False; head=t
            if re.match(r'^vacant\b', t, re.I): is_head=True
            else:
                for nm in names:
                    if t.startswith(nm):
                        is_head=True; break
            if is_head:
                if cur and cur['body']: reports.append(cur)
                cur={'heading':t,'body':[]}
            elif cur is not None:
                # report bullet
                cur['body'].append(t)
        if cur and cur['body']: reports.append(cur)
    return meeting, attendance, reports

files=[]
for q3 in ["Fall quarter 2025 - CoC minutes","Winter quarter","Spring quarter"]:
    files+=sorted(glob.glob(os.path.join(ROOT,q3,"*.docx")))
files=[f for f in files if 'TEMPLATE' not in f.upper()]

L=["-- AUTO-GENERATED minutes seed from reference/Minutes/**.docx","begin;",
   "delete from meeting;",""]
mc=ac=ic=0
for f in files:
    try:
        meeting,att,reps=parse(f)
    except Exception as e:
        print("ERR",os.path.basename(f),e); continue
    if not meeting['date']: continue
    term="2025-26"
    L.append(f"insert into meeting(meeting_date,location,term,called_to_order,called_by,qotw,is_published) values "
             f"({q(meeting['date'])},{q(meeting['location'])},{q(term)},{q(meeting['called_to_order'])},{q(meeting['called_by'])},{q(meeting['qotw'])},true);")
    mc+=1
    mref=f"(select id from meeting where meeting_date={q(meeting['date'])} limit 1)"
    for name,st in att:
        L.append(f"insert into meeting_attendance(meeting_id,person_id,display_name,status) values "
                 f"({mref},(select id from person where full_name={q(name)} order by created_at limit 1),{q(name)},'{st}');")
        ac+=1
    for o,r in enumerate(reps,1):
        body=" ".join(r['body'])[:1800]
        L.append(f"insert into minute_item(meeting_id,section,ordinal,heading,body) values "
                 f"({mref},'report',{o},{q(r['heading'])},{q(body)});")
        ic+=1
L.append("commit;")
open(OUT,"w").write("\n".join(L)+"\n")
print(f"Parsed {mc} meetings, {ac} attendance rows, {ic} report items -> {OUT}")
