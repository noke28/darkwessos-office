# TASK 07 — ONLINE READY (priprema, nije deploy)

## Jedan origin, jedan servis
Node `server.mjs` služi React `dist/` i `/api/*` na istoj HTTPS domeni. Postojeći `storyApi.ts` radi s relativnim `/api` putanjama, a HttpOnly SameSite=Strict sesija ostaje na istom originu.

## Railway preduslovi prije produkcije
1. Napraviti NOVI Railway servis za aplikaciju `darkwessos-office` (nikako KATE MCP ili canon).
2. Deploy izvornog projekta (ne ZIP-a kao jedne datoteke); Railway root mora sadržati `package.json`, `server.mjs`, `railway.json`, `src/`.
3. Postaviti `STORY_PASSWORD` na dugu jedinstvenu lozinku, `STORY_SECURE_COOKIE=1`, `STORY_DB_PATH=/data/story.sqlite`, `NODE_ENV=production`. Ne stavljati lozinku u GitHub.
4. Montirati trajni Railway volume na `/data` PRIJE prvog pisanja. Bez volumea SQLite podaci mogu nestati pri redeployu.
5. Uključiti HTTPS javnu domenu. `PORT` obezbjeđuje Railway.
6. Provjeriti login, create/save, reload, drugi uređaj, konflikt revizije, logout i backup.
7. Obavezno uspostaviti redovne backup kopije SQLite datoteke i testirati vraćanje prije upotrebe za jedini primjerak rukopisa.

## Ograničenja
- Ovo nije izvršena online objava. Nije potvrđen Railway račun, volumen, domena ili end-to-end test.
- Lokalni IndexedDB je samo pomoćna kopija; postojeći rukopis iz Chromea nije automatski prenesen na server. Sačuvati Markdown export prije migracije.
- Jedan korisnik/jedan dokument (`book-i`), nema višekorisničkog RBAC-a.
- Za produkciju dodatno preporučena zaštita login endpointa od brute-force pokušaja, monitoring i provjera obnove backup kopije.
- `server.mjs` koristi Node `node:sqlite`; koristiti Node 22+ sa odgovarajućom podrškom.
