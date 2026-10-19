# TASK 08 — Cloudflare Pages

React/Vite Office: COMMAND, STORY, WORKSHOP, ARCHIVE i Radne ideje. STORY čuva lokalno u IndexedDB i podržava Markdown izvoz.

Cloudflare Pages: root = repo root; build = `npm ci && npm run build`; output = `dist`; Node 22.

Postojeći Node/SQLite server **nije deployan** na Pages. Online sinhronizacija je isključena dok se ne izradi kompatibilan i siguran backend. `VITE_STORY_API_ENABLED=false`.

Provjera: `npm ci`, `npm test`, `npm run build`. Lokalno: 14/14 testova uspješno; npm ci i build nisu provjereni jer npm cache nema potrebne pakete.

BlockNote i Supabase nisu integrisani. Lokalni storage nije cloud backup; izvozite rukopis kao `.md`. Kanon nije mijenjan.
