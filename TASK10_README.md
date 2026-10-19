# TASK 10 — Supabase private STORY backup

Cloud: Supabase Auth (email/password) and `public.story_documents` RLS; local IndexedDB autosave remains authoritative for drafting. Manual cloud sync is conflict-safe: no automatic remote-to-local import, no overwrite if cloud differs from last confirmed checkpoint. A first-time login on a different device with an existing remote manuscript is deliberately blocked from overwriting. Export `.md` and reconcile manually.

Configuration: Vite build-time `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (public key only). Never use service-role keys in client code. For Cloudflare Pages set these variables for production and preview builds; keep private `.env.production` out of Git.

Auth: register email and password; confirm email if required; sign in; press 'Sinhronizuj u cloud'. Offline typing continues without network. Cloud sync is **manual**, not automatic. Browser localStorage holds the Supabase session and sync checkpoint; treat devices as trusted.

Limitations: no automated multi-device merge or cloud restore UI. A new device must not overwrite a pre-existing cloud copy; manual reconciliation is necessary. Local data can be lost if browser site data is cleared before backup. Security review and real-device tests required before calling sync production-ready.
