# DARKWESSOS TASK 06A-2 — SQLite STORY API (RADNO)

## Lokalni Termux / desktop

Requires Node.js 22.13+ with built-in `node:sqlite` support (experimental in Node 22). Keep the entire extracted project in a **new** folder; back up the old TASK 06A-1 folder and export your `.md` manuscript before switching.

In terminal 1:

```sh
export STORY_PASSWORD='choose-a-unique-password-of-20-plus-characters'
export STORY_DB_PATH="$PWD/data/story.sqlite"
npm run story:api
```

In terminal 2, in the same project:

```sh
npm ci
npm run dev
```

Open the Vite URL on the **same device**. Enter the STORY password in the editor, click `Prijavi se`, then `Sinhronizuj na server`. Server sync is **manual** in this milestone; local IndexedDB autosave continues independently. Vite proxies `/api` to `http://127.0.0.1:8787`. If using a remote device, expose the frontend and API only behind a properly configured HTTPS reverse proxy; do not open the backend directly to the Internet.

## API

- `POST /api/login` with `{ "password": "..." }` sets an HttpOnly SameSite=Strict cookie.
- `GET /api/story/book-i` returns the latest document.
- `PUT /api/story/book-i` requires `{title,body,expectedRevision,operationId}` and `X-Story-Request: 1`. Success: 200. Revision conflict: 409.
- `GET /api/story/book-i/revisions` returns the newest 200 immutable revisions.
- `POST /api/logout` revokes the current session.
- `GET /api/health` provides a basic health response.

The API uses SQLite WAL, a schema migration marker, `BEGIN IMMEDIATE` transactions, expected-revision compare-and-swap, and persisted idempotency keys. The password is an environment variable and never bundled into the frontend. Local drafts are not silently overwritten by remote changes. If a save times out after the server commits, the saved operation ID can be retried.

## Known limits — do not treat as production-ready

- Only one fixed manuscript (`book-i`) and one shared login/password; no multi-user accounts.
- No rate limiting or password-rotation mechanism; use a protected private environment.
- Manual server sync only; no automatic background sync, merge UI, or multi-device onboarding.
- The initial server-to-device import is deliberately blocked when the server already has content; this prevents overwriting local work. A safe explicit import/merge workflow is a follow-up.
- This build has not been validated on Android or deployed to Railway.
- SQLite on Railway requires a **persistent volume** mounted at the directory used by `STORY_DB_PATH`; do not rely on ephemeral filesystem.
- Back up the database to **external storage** with a SQLite-consistent backup mechanism. Copying only the main `.sqlite` file while WAL writes are active is not safe. Backups, restore drills, HTTPS proxy, secure cookie settings, and deployment need further verification.
- For a future HTTPS deployment set `STORY_SECURE_COOKIE=1` and `STORY_BIND_HOST=0.0.0.0` and restrict access with HTTPS and network controls.

## Validation

Run `npm test` for automated API authentication, revision conflict, idempotency and revision-history checks. Run `npm run build` after installing dependencies in a network-enabled environment. Then test manually on Android: local autosave, reload, login, server sync, offline edit, conflict, repeated retry and export.
