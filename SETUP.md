# Setup — CoC Platform

The app is built and runs **right now** in "snapshot" mode (it reads a data
snapshot parsed from the AS spreadsheets in `/reference`). To make it live —
real applications, an editable roster, etc. — point it at a Supabase project.

## Run the site locally (no database needed)

```bash
cd web
npm install
npm run dev          # → http://localhost:3000
```

The footer shows **"spreadsheet snapshot"** until a database is connected.

---

## Connect the live database

### 1. Create the Supabase project
Create a **new** Supabase project for CoC (separate from Lagoon's
`qecthmyzcicllttplhjq`). Name it e.g. `coc-platform`. Region: `us-west-1`.

### 2. Apply the schema + seed
Three ways — pick one:

- **Let Claude do it (fastest):** tell Claude the new project's ref. It will
  run `apply_migration` with `supabase/migrations/0001_init.sql` and execute
  `supabase/seed.sql` through the Supabase MCP.
- **Supabase SQL editor:** paste `supabase/migrations/0001_init.sql`, run it,
  then paste `supabase/seed.sql` and run it.
- **Supabase CLI:**
  ```bash
  supabase link --project-ref YOUR_REF
  supabase db push           # applies migrations/
  psql "$DATABASE_URL" -f supabase/seed.sql
  ```

### 3. Wire the env
```bash
cd web
cp .env.local.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```
The footer should now read **"live database"** and pages read from Postgres.

### 4. Make yourself an admin
The board console (`/admin`) is gated by the `board_member` table. After you
sign in once at `/login` (UCSB email → 6-digit code), grant yourself admin:

```sql
insert into board_member (user_id, role)
select id, 'admin' from auth.users where email = 'YOUR_EMAIL@ucsb.edu'
on conflict (user_id) do update set role = 'admin', is_active = true;
```

Then reload `/admin` — you'll have the dashboard, applications pipeline, and
position management. Students never need an account; they just apply.

---

## What's where

| Path | What |
|---|---|
| `src/app` | Next.js 15 routes: `/`, `/positions`, `/positions/[id]`, `/directory`, `/budget`, `/about`, `/minutes`, `/admin` |
| `src/lib/data.ts` | Data layer — live Supabase if configured, else snapshot |
| `src/lib/seed-data.json` | Snapshot bundled for snapshot mode |
| `supabase/migrations/0001_init.sql` | Full schema + RLS (the public/private boundary) |
| `supabase/seed.sql` | Real BCUs, positions, roster & budget parsed from `/reference` |
| `reference/` | Original AS spreadsheets, SOPs, minutes, chairs meeting files (source of truth) |
| `reference/Minutes/` | Word source archive for CoC meeting minutes by quarter |
| `reference/Chairs Meeting/` | Chairs meeting planning, attendance, notes, and RSVP source files |
| `PLAN.md` | The full plan & roadmap |

## Regenerating seed data
The seed is generated from the spreadsheets in `/reference`. If those change,
re-run the generators (a Python venv with `openpyxl` is required) to refresh
`supabase/seed.sql` and `src/lib/seed-data.json`.

```bash
python supabase/scripts/gen_seed.py
python supabase/scripts/gen_json.py
```

Minutes and Chairs Meeting documents are indexed in
`src/lib/reference-archive.ts` so the site can show what source records exist
while the full text is imported into database-backed public minute pages.
