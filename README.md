# GG Snacks

## Where to update real company content

Edit **`src/data/siteContent.ts`** for all company facts, contact details, About/Why GG copy, hero copy, footer labels and SEO defaults. English and Arabic values are stored together. Existing marketing text is temporary; legal name, full address, phone numbers, email, social URLs and social-preview image are intentionally null until confirmed.

The `company` declaration at the top feeds `siteContent.company`; About body and footer location reuse those facts by default. Use section-specific fields when different wording is needed. `longDescription` and `legalName` are prepared but not displayed until a future section calls for them. Other interface labels and form messages remain in `src/i18n/translations.ts`, which imports the company copy rather than duplicating it.

Enter WhatsApp/phone numbers with international country codes. Use full HTTP(S) URLs for maps and social profiles. Missing values retain the existing non-clickable placeholders; invalid URLs never become links. A phone row appears only once a phone is provided. No contact form submission is introduced.

Set `seo.defaultSocialPreviewImage` only when a real image exists; an absolute public URL is recommended for social crawlers. Restart/rebuild after changing SEO defaults. Product/flavor content still belongs in `src/data/products.ts`.

## Entering confirmed product content

Edit **`src/data/products.ts`** only for product/family content. The four entries in `productFamilies` are the source for catalogue pages, detail pages, homepage product stages, rating identity and dashboard names.

- Override `shortDescription`, `longDescription`, `packageSize` and `ingredients` after `...unknownDetails` using `{ en: 'confirmed English text', ar: 'confirmed Arabic text' }`. Keep unknown values `null`.
- `nutrition` is `null` until verified. Its shape is `{ basis: { en, ar }, entries: [{ label: { en, ar }, value: { en, ar } }] }`. Enter the confirmed serving/weight basis and label/value strings; no units or facts are inferred.
- Set family/flavor `image` to an imported PNG or a public path such as `/products/your-file.png`. Flavor images take priority over family images; missing/failed images show the existing placeholder. No real images are included.
- Replace any `previewFlavors(...)` call with an array of objects containing `id`, `slug`, `name: { en, ar }`, `shortName: null` (or localized short labels), `image: null`, `accentColor`, `isActive: true`, and `isPlaceholder: false` once confirmed. Any number of flavors is supported. Do not enter `ratingPath`: `defineProducts()` derives it automatically.
- `isActive: false` hides a flavor from catalogue/homepage selectors while preserving historical dashboard labels and existing direct rating URLs. Keep existing IDs/slugs stable once URLs have been shared or ratings collected.
- Current generated flavor names are explicitly marked placeholders. Product facts remain null. Generic UI copy is still in `src/i18n/translations.ts`; it is not a product claim.

**Database compatibility:** The existing rating INSERT policy in migration 001 still restricts slugs to the current placeholder list. When introducing new slugs, update that SQL policy in Supabase as a separate migration before accepting ratings for those slugs. This refactor intentionally does not change rating authorization or the submission flow.

Run `node tests/productData.cjs` to check path derivation, lookup fallback, image priority and dynamic flavor counts.

React, TypeScript, Vite, Tailwind, GSAP and Supabase. Node 22.12+.

## Local development

Run `npm.cmd install`, then `npm.cmd run dev`. Public configuration in `.env.local` (gitignored):

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

Never use a service-role/secret key in frontend configuration. Remove the obsolete `SUPABASE_SERVER_KEY` entry if previously added. The local Vite reader has been removed. No server key is needed on your frontend machine.

## Staff dashboard setup — follow in order

### 1. Run SQL

In Supabase, open **SQL Editor → New query**.

- If `public.ratings` already exists from this project, do not rerun 001. On a fresh project only, run the entire `supabase/migrations/001_create_ratings.sql` first.
- Paste and run the entire `supabase/migrations/002_staff_users.sql` once. It creates staff membership, enables RLS, denies client access and grants server reads. It does not change anonymous rating INSERT.

These migrations intentionally fail if their tables already exist. Both admin and viewer staff roles currently grant read-only dashboard access.

### 2. Create the first staff user

1. Go to **Authentication → Sign In / Providers**. Turn **Allow new users to sign up** off. Keep email/password sign-in enabled and anonymous sign-in disabled. Public rating inserts do not use anonymous Auth accounts.
2. Go to **Authentication → Users → Add user → Create new user**.
3. Enter the staff email and a strong password. Enable **Auto Confirm User**, then create the user. Never put passwords in SQL or source files.
4. Copy the user's **User UID**.
5. In SQL Editor run this, replacing the UUID:

```sql
insert into public.staff_users (user_id, role)
values ('PASTE_AUTH_USER_UUID_HERE'::uuid, 'admin')
on conflict (user_id) do update set role = excluded.role;
```

Use `'viewer'` for other read-only staff. To revoke access, delete the membership row; subsequent function requests return 403. Already delivered browser data cannot be retracted.

### 3. Set Edge Function environment

Hosted functions already receive `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Supabase. They stay server-side. Do not copy them into `.env.local`.

In **Edge Functions → Secrets**, add:

```text
Name: DASHBOARD_ALLOWED_ORIGINS
Value: http://localhost:5173,http://127.0.0.1:5173,https://YOUR_REAL_SITE_DOMAIN
```

Replace the production domain with your real origin. No trailing slash or paths. Add a different local port only if used. CORS is an extra restriction; token validation and database membership are the authorization boundary.

### 4. Deploy

From the project root in PowerShell:

```powershell
npx.cmd supabase login
npx.cmd supabase functions deploy ratings-dashboard --project-ref YOUR_PROJECT_REF
```

The CLI may prompt to install itself; it is deployment tooling, not an app dependency. Find the project ref in **Project Settings → General**, or in the project URL subdomain. This deploys the function only; run SQL separately.

`supabase/config.toml` uses `verify_jwt = false` because the handler validates every bearer token with Supabase Auth `getUser(token)`. This supports modern signing keys without the legacy gateway verifier. It does NOT make dashboard data public: missing/invalid users receive 401; non-staff receive 403. Do not remove the handler's authentication checks. In the function's configuration, the legacy gateway JWT verification setting should match this file.

Restart Vite after public env changes. Production hosting needs the same two public Vite variables at build time and SPA routing to `index.html` for `/admin/login` and `/dashboard/ratings`.

### 5. Test

- **Anonymous:** Open `/dashboard/ratings` in a private window. Expect `/admin/login`. A GET without a bearer token to `https://YOUR_PROJECT_REF.supabase.co/functions/v1/ratings-dashboard` returns 401.
- **Non-staff:** Manually create another Auth account but do not add a staff row. Sign in. Expect **ACCESS DENIED** and a 403 function response, with no ratings displayed.
- **Staff:** Sign in with the admin account. Expect email, Logout and ratings. Refresh the browser to verify restoration, then test filters and Refresh. Viewer staff also have access.
- **Logout/expiry:** Logout returns to login. Reopening the dashboard redirects. Rejected tokens trigger one refresh attempt; unrecoverable sessions return to login. Logout clears the SDK session on this browser; issued access tokens can remain valid until expiry. Removing staff membership denies subsequent requests immediately.
- **Public submission:** While signed in as staff, submit `/rate/loots/flavor-1`. Verify the row in Supabase Table Editor. Rating inserts still use a separate anonymous client, not staff credentials.

Audit client privileges in SQL Editor:

```sql
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('ratings', 'staff_users')
  and grantee in ('anon', 'authenticated', 'PUBLIC');

select grantee, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'ratings'
  and grantee in ('anon', 'authenticated', 'PUBLIC');

select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public' and tablename in ('ratings', 'staff_users');
```

Expected: no client table-level SELECT/UPDATE/DELETE, anon INSERT column grants on ratings only, and the original anonymous INSERT policy only. Resolve any unrelated pre-existing broader grants before production.

## Architecture and limits

`getStaffSupabase()` uses SDK-managed persistent sessions and automatic refresh. There is no custom password storage or public signup UI. `getSupabase()` stays anonymous, nonpersistent, and uses a separate storage namespace. Route guards control navigation only; the Edge Function validates the user against Auth and checks `staff_users` on every request before using its server credential to read ratings.

The function returns up to the latest 10,000 ratings, with an explicit truncation flag. Existing client-side analytics and filters use that snapshot. Partial totals are labeled, not presented as full-database totals. Feedback is fetched only through the function and is not persisted in browser storage. Refresh rechecks staff membership. No realtime refresh is implemented.

## Validation

```powershell
npx.cmd tsc --noEmit
npm.cmd run build
node tests/ratingAnalytics.cjs
node tests/dashboardSecurity.cjs
node tests/productData.cjs
node tests/siteContent.cjs
node tests/ratingSubmission.cjs
node tests/renderSmoke.cjs
```

If Deno is installed: `deno check supabase/functions/ratings-dashboard/index.ts`. Vite TypeScript checking covers frontend code, not Deno functions. Security tests execute the actual handler with mocked Supabase responses; live Auth, RLS and deployment checks require the configured project.

Official references: [Auth getUser](https://supabase.com/docs/reference/javascript/auth-getuser), [password sign-in](https://supabase.com/docs/guides/auth/passwords), [function configuration](https://supabase.com/docs/guides/functions/function-configuration).

## Production Deployment

### Vercel frontend build settings

| Setting | Value for this repository layout |
| --- | --- |
| Root Directory | Repository root (leave blank / `.`) |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |
| Node.js Version | 22.x |

The selected root must contain the `package.json` named `gg-snacks`, `package-lock.json`, `src/main.tsx`, and `vercel.json`. If this app is placed inside a larger repository, select that app folder relative to the repository root instead; do not select the enclosing workspace. `vercel.json` explicitly sets the install/build/output commands and retains SPA rewrites.

The build script is `tsc --noEmit && vite build`; it does not need `PORT` or build other packages. This local project contains no `pnpm-workspace.yaml`, recursive workspace script, or `artifacts/mockup-sandbox`. If Vercel logs still show that package, check the connected repository, production branch, deployed commit and Root Directory. Remove any old recursive build override such as `pnpm -r build` or `turbo build`; ensure the deployed commit contains this app's configuration. Keep unrelated demo packages locally without invoking them from this deployment. Do not add `PORT` as a workaround.

Commit/push the configuration changes, then deploy the new commit with the settings above. If retrying after correcting settings, redeploy without the existing build cache. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured as described below; no Supabase configuration changes are needed for this build correction.

Deploy manually; nothing in this repository deploys automatically until you connect it to a host. Complete [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md). Placeholder company/product content and the visual-only contact form still need a launch decision. Review the staff setup and SQL privilege audit above against your actual Supabase project first.

1. In Vercel choose **Add New → Project**.
2. Import the Git repository with this app at its root. Choose **Vite**, Node **22.x**, install command `npm ci`, build command `npm run build`, output `dist`. Commit `vercel.json`; its SPA rewrite preserves direct route visits. Existing files such as scripts and the favicon are served as assets.
3. Under project **Settings → Environment Variables**, configure these for **Production** before building:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
   ```

   Replace placeholders with the project URL and public anon/publishable key. Both variables are public and embedded at build time. Never add service-role, secret, staff passwords or `SUPABASE_SERVER_KEY` to frontend env files or Vercel for this static app. `.env.local` and other env variants are ignored; only `.env.example` is intended for Git. Use a separate Supabase project for previews if desired, and explicitly configure its public variables. Redeploy after changing Vite variables.
4. Click **Deploy** and wait for the build to finish.
5. Copy the actual production HTTPS origin. In the remaining examples, replace `https://YOUR_DOMAIN.com` with that origin; do not paste the placeholder literally.
6. In Supabase **Authentication → URL Configuration**, set **Site URL** to `https://YOUR_DOMAIN.com`. Add these exact **Redirect URLs**:

   ```text
   https://YOUR_DOMAIN.com/admin/login
   http://127.0.0.1:5173/admin/login
   http://localhost:5173/admin/login
   ```

   Retain only local URLs you use. Current email/password login navigates inside React and does not use an email/OAuth callback; this does not add password-reset or OAuth support. Use exact production URLs, not wildcard preview domains. Keep public signup and anonymous Auth disabled as described above.
7. In Supabase **Edge Functions → Secrets**, set `DASHBOARD_ALLOWED_ORIGINS` to a comma-separated list of exact origins, for example:

   ```text
   http://127.0.0.1:5173,http://localhost:5173,https://YOUR_DOMAIN.com
   ```

   No paths, trailing slashes or `*`. Include only trusted origins; each preview deployment needs an explicit origin if it should use this dashboard. The function compares exact origins and still authenticates the token and checks staff membership on every read. Hosted `SUPABASE_SERVICE_ROLE_KEY` remains in Supabase only.
8. If the function has not been deployed or its source/config changed, run from the project root:

   ```powershell
   npx.cmd supabase login
   npx.cmd supabase functions deploy ratings-dashboard --project-ref YOUR_PROJECT_REF
   ```

   Supabase secret updates take effect without a code redeploy. Keep the committed function configuration: gateway `verify_jwt = false` is paired with mandatory server-side `getUser(token)` and staff checks. Never remove those checks. SQL is applied separately; do not rerun existing create-table migrations blindly.
9. Open `/rate/loots/flavor-1`, submit a test rating, and verify the row in Supabase Table Editor. Test a failed request and retry. The frontend never SELECTs ratings.
10. Open `/admin/login` and sign in with an explicitly created staff account.
11. Check dashboard data and filters, non-staff denial, signed-out redirect, refresh and logout. Run the SQL privilege audit above: anonymous SELECT/UPDATE/DELETE must remain denied while anonymous INSERT remains allowed. Local mocked tests cannot establish deployed permissions.
12. Paste each route directly into a new browser tab and refresh: `/products`, `/products/loots`, `/rate/loots/flavor-1`, `/admin/login`, `/dashboard/ratings`. Check an unknown URL and invalid product/flavor. Complete mobile, bilingual, HTTPS and console checks in the checklist.

For a custom domain, add it under **Vercel → Project → Settings → Domains**, apply the DNS records Vercel provides, and wait for verification/HTTPS. Choose the canonical domain, then update Supabase Site URL, exact redirect URLs and allowed origins to match. Remove obsolete origins when no longer used. No production hostname is hardcoded in application code.

`vercel.json` marks `/admin/*` and `/dashboard/*` responses `X-Robots-Tag: noindex, nofollow`; this is indexing guidance, not authorization. Public navigation does not link to either. Unknown routes use the branded client fallback; a static SPA rewrite returns HTTP 200 even for that fallback (a server-rendered HTTP 404 is outside this setup). SEO defaults and favicon already ship in built HTML; language selection updates document language, direction and localized metadata.

References: [Vercel Vite SPA routing](https://vercel.com/docs/frameworks/frontend/vite), [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [Supabase function secrets](https://supabase.com/docs/guides/functions/secrets).
