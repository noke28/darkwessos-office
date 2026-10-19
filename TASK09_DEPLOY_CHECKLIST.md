# TASK 09 — kontrolisana objava

1. Paket sadrži React/Vite frontend; Cloudflare Pages root ``, build `npm ci && npm run build`, output `dist`.
2. GitHub Actions workflow `.github/workflows/verify.yml` pokreće testove i build na push/PR.
3. Prije zamjene produkcije potvrditi uspješan GitHub Actions build na grani za provjeru.
4. Nakon toga spojiti u `main`; postojeći Cloudflare Pages Git integration automatski objavljuje.
5. Provjeriti COMMAND, STORY, WORKSHOP i ARCHIVE na Androidu; u STORY provjeriti autosave i Markdown izvoz.
6. Backend Node/SQLite nije dio Pages deploymenta. Supabase sinhronizacija nije implementirana.
7. Kanon i zaključane projektne odluke nisu mijenjani.
