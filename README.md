# DARKWESSOS 3.0 — Local V1 Prototype

React + TypeScript + Vite, four modules, schematic Leaflet Atlas, local Canon Reader, and exportable working notes.

## Run

```bash
npm install
npm run dev
```

For production-like local build: `npm run build`. For preliminary static checks: `npm test`.

## Privacy / scope

- No private canon is bundled. No GitHub token or server-side GitHub access.
- Canon Reader accepts a **local JSON bundle**, kept in volatile React memory; reload clears it.
- Do **not** deploy with private source files under `public/` or bundle them into frontend JS.
- Atlas coordinates are explicitly TEST placeholders, **not** canonical Darkwood geography.
- Notes are not autosaved. Export `.txt` before leaving the page.
- App is a clean-room implementation inspired by the existing HTML Shell, **not** a byte-for-byte migration of the repository file.
- No GitHub repositories, Cloudflare services, or canon sources were changed.

## Import JSON format

```json
{"schema_version":1,"repository":"noke28/zagor-duh-zime","revision_id":"0123456789abcdef0123456789abcdef01234567","sources":[{"source_id":"example","path":"authority/example.md","revision_id":"0123456789abcdef0123456789abcdef01234567","status":"RADNO","content":"Sample content"}]}
```

The example is only a format illustration. `revision_id` is syntactically validated, not independently verified against GitHub. `content_hash` is optional and not yet cryptographically checked. Do not treat the imported status as verified canon without independent authority validation. This is a V1 limitation.

## Next integration

1. Confirm the correct `authority/AUTHORITY.md` and commit SHA.
2. Generate a private bundle offline with exact commit, paths, hashes and statuses.
3. Verify hashes in the browser and validate authority precedence before displaying a source as authoritative.
4. Replace TEST marker with source-backed schematic atlas entries.
5. Test on Android and verify no private source appears in deployed assets.


## TASK 05A — Living Atlas workflow

WORKSHOP → TEST lokacija → Otvori izvor → ARCHIVE → Razvij ideju → Notes → izvoz .txt / kopiraj za KATE.
TEST izvor i koordinate su demonstracijski. Paket iz Archive nije kriptografski verificiran.
Radna bilješka se čuva samo u React memoriji dok je stranica otvorena; ne osvježavaj prije izvoza.
Kopiranje za KATE ne šalje poruku automatski.

Termux: `npm install`, `npm test`, `npm run build`, `npx vite preview --host 127.0.0.1`, zatim Chrome `http://localhost:4173/`.


## TASK 06A-1 — STORY offline editor (RADNO)

STORY sada omogućava Markdown uređivanje, IndexedDB lokalno spremanje, lokalnu historiju revizija, vraćanje revizije i `.md` izvoz. Podaci su samo u pregledniku na tom uređaju: nema SQLite servera, autentifikacije, sinhronizacije niti vanjskog backupa. IndexedDB može biti obrisan od strane preglednika ili korisnika; redovno izvoziti rukopis. Pri grešci spremanja tekst treba odmah izvesti.

Pokretanje u Termuxu: `npm ci`, `npm test`, `npm run build`, `npm run dev`. Ručno provjeriti pisanje, reload, historiju, vraćanje i offline ponašanje.

Napomena: postojeći modul Notes i dalje koristi localStorage za *radne bilješke*, ne za STORY rukopis; taj modul nije mijenjan u TASK 06A-1.
