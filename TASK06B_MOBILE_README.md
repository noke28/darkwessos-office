# DARKWESSOS — TASK 06B · SAMO MOBILNI CHROME

Ovo je **kompletan projektni izvor** (06A-2 + Android UUID hotfix + TASK 06B workflow), a ne samo dodatak. Koristi se isključivo u zasebnom privatnom repozitoriju `darkwessos-office`.

## Najlakši postupak na telefonu — uz povezani GitHub plugin

1. U Chromeu otvori https://github.com/new i prijavi se.
2. **Repository name**: `darkwessos-office`. **Private**: uključeno. Odaberi **Create repository**. Ako je ime već zauzeto, nemoj praviti duplikat.
3. Vrati se u ChatGPT i napiši: **`Repo darkwessos-office je kreiran; prenesi TASK 06B kompletan izvor preko GitHub konektora.`** Nemoj slati ZIP u GitHub web upload: GitHub ga ne raspakuje u radne datoteke.
4. Kada konektor potvrdi da su svi fajlovi u `main` grani, u Chromeu otvori `https://github.com/<tvoj-nalog>/darkwessos-office/actions`.
5. Ako GitHub traži da uključiš Actions, potvrdi samo za ovaj privatni repozitorij.
6. Odaberi **DARKWESSOS web build** i pogledaj rezultat. Ako prođe, odaberi **DARKWESSOS Android debug APK** → **Run workflow** → **Run workflow**.
7. Otvori završeni run → **Artifacts** → `darkwessos-debug-apk`. GitHub preuzima ZIP; raspakuj ga u Files na Androidu i instaliraj `app-debug.apk`.

### Alternativa bez ChatGPT konektora

Na GitHub.com ne možeš samo uploadovati ovaj ZIP i očekivati da workflow vidi izvore: GitHub neće raspakovati ZIP. Koristi GitHub Codespaces u Chromeu (ako ti je dostupan) za upload ZIP-a, raspakivanje i commit iz Codespaces web okruženja. Codespaces može imati zasebne troškove i zahtijeva osnovno korištenje cloud terminala; zato je prva opcija jednostavnija.

## Granice

- APK sadrži frontend + IndexedDB pohranu, ne Node/SQLite server. Server-sync je odgođen. Izvoz Markdown kopije prije promjene ili brisanja aplikacije.
- IndexedDB iz Chromea se **ne prenosi automatski** u instalirani APK. Postojeći tekst prije prelaska izvezi kao `.md`; nema automatskog uvoza tog fajla u APK.
- Ovaj debug APK nije potpisana produkcijska distribucija. Instaliraj samo vlastiti build iz vlastitog repozitorija.
- Ne stavljaj rukopise, `.env`, SQLite bazu, lozinke ili tokene u GitHub.
- Ako build ne prođe, treba pregledati stvarni GitHub Actions log; konfiguracija još nije potvrđena na GitHub runneru.
- APK u ovom paketu nije unaprijed izgrađen.
