# TASK 06B — GitHub Actions + Android debug APK

This is an additive patch for the **application repository**, not the canonical `zagor-duh-zime` story repository. Copy `.github/` and `capacitor.config.json` into the root of the React/Vite application alongside `package.json`.

## GitHub

Create a **private, separate** repository for the app, e.g. `darkwessos-office`, then from the application root:

```sh
git init
git add .
git commit -m "Add DARKWESSOS CI and Android debug APK workflow"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-APP-REPO.git
git push -u origin main
```

If the folder is already a Git repository, **do not** run `git init`, reset history, or blindly replace its remote. Check `git remote -v` and `git status` first.

In GitHub: Actions → **DARKWESSOS Android debug APK** → Run workflow → wait → download `darkwessos-debug-apk` from Artifacts. The APK is an unsigned-for-release **debug build** and should only be used for private testing. GitHub artifact downloads may be ZIP files containing the APK.

## Important limitations

- This builds the **web frontend packaged in an Android WebView**, **not** a native SQLite/Node backend.
- `server.mjs` is not packaged or started. Login/sync needs a reachable API server and compatible origin/CORS/cookie/auth setup. The current `vite.config.ts` proxy works in dev only, not inside an APK. The current `src/lib/storyApi.ts` uses `/api` relative to the APK's origin; it requires a deliberate remote API configuration and HTTPS before sync can work. Do not expose an unauthenticated HTTP backend on the internet.
- IndexedDB persistence in a WebView is **not automatically the same storage** as Chrome browser IndexedDB; export a Markdown backup before installing. No automatic transfer of existing browser data is implemented.
- The workflow has **not been executed on GitHub** here. Capacitor/Gradle compatibility and the exact debug APK build must be verified in Actions. This bootstrap workflow intentionally does not add dependencies to the project's package lock or commit generated native sources; for reproducible long-term use, pin and commit them after a successful first build.
- Do not put credentials, manuscripts, SQLite database files, `.env`, or API secrets into Git.
