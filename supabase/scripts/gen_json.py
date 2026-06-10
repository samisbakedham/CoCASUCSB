import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
seed_source = (ROOT / "supabase" / "scripts" / "gen_seed.py").read_text().split("# emit")[0]
ns: dict[str, object] = {"__file__": str(ROOT / "supabase" / "scripts" / "gen_seed.py")}
exec(seed_source, ns)

bcus = ns["bcus"]
persons = ns["persons"]
appts = ns["appts"]
positions = ns["positions"]
budget = ns["budget"]

out = {"bcus": [], "roster": [], "budget": [], "positions": []}

for b in bcus.values():
    out["bcus"].append(
        {
            "slug": b["slug"],
            "name": b["name"],
            "short": b["short"],
            "type": b["type"],
            "website": b.get("website"),
            "contact_name": b.get("cname"),
            "contact_email": b.get("cemail"),
        }
    )

for i, p in enumerate(positions, 1):
    b = bcus[p["bcu"]]
    out["positions"].append(
        {
            "id": f"p{i}",
            "title": p["title"],
            "status": p["status"],
            "routing": p["routing"],
            "external_url": p["external_url"],
            "coc_advertises": p["coc_adv"],
            "notes": p["notes"],
            "bcu_slug": b["slug"],
            "bcu_name": b["name"],
            "bcu_short": b["short"],
            "bcu_type": b["type"],
        }
    )

for a in appts:
    pr = persons[a["pk"]]
    b = bcus[a["bcu"]]
    out["roster"].append(
        {
            "full_name": pr["full_name"],
            "as_email": pr["asem"],
            "role_title": a["role"],
            "is_chair": a["is_chair"],
            "term": a["term"],
            "bcu_slug": b["slug"],
            "bcu_name": b["name"],
            "bcu_short": b["short"],
            "bcu_type": b["type"],
        }
    )

for b in budget:
    out["budget"].append(
        {
            "entity": b["entity"],
            "fiscal_year": b["fy"],
            "category": b["cat"],
            "description": b["desc"],
            "amount": b["amt"],
            "recommendation_stage": b["stage"],
            "sort_order": b["sort"],
        }
    )

dest = ROOT / "src" / "lib" / "seed-data.json"
dest.write_text(json.dumps(out, indent=0) + "\n")

staff_rows = [x for x in out["budget"] if x["fiscal_year"] == "2026-27" and x["category"] == "staff_allocation"]
print("Wrote", dest)
print(
    "counts:",
    len(out["bcus"]),
    "bcus",
    len(out["positions"]),
    "positions",
    len(out["roster"]),
    "roster",
    len(out["budget"]),
    "budget",
    len(staff_rows),
    "staff allocation rows",
)
