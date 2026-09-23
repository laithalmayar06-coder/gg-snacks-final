# Public website analytics

Official @vercel/analytics integration, locally implemented only. No automatic deployment or dashboard enablement. No Vercel configuration, SEO, backend, form, auth or visual changes.

## Enable

1. In the existing Vercel project, open Analytics / Web Analytics and Enable.
2. Deploy the frontend through the normal workflow. The integration runs only in production builds on gg-snacks-final.vercel.app. If the canonical domain changes, update the explicit hostname in src/analytics/PublicAnalytics.tsx.
3. Basic public pageviews work without any application environment variables. Custom events are opt-in: if the project's Vercel plan supports them, set VITE_ANALYTICS_CUSTOM_EVENTS=true for Production and rebuild/redeploy. This flag is public configuration, not a secret. Vercel currently documents custom events for Pro/Enterprise; no plan upgrade was made.
4. Inspect network requests and the Vercel dashboard after deployment. Confirm the analytics script/intake work through existing hosting rewrites; configuration was not altered. Browser blockers may prevent telemetry. Verify initial page visits, client navigation/back/forward, and public-to-admin transitions. Direct admin visits should not load the collector; navigating there after a public page should send no pageview or custom event. The previously loaded script may remain in memory.

## Data boundaries

Automatic tracking is disabled. React Router path changes generate explicit pageviews. Query strings and fragments are removed, product and valid rating URLs are grouped into route templates without slugs, and unknown/staff routes are excluded. Language changes do not create duplicate pageviews. No form interaction, input value, comment, name, email, phone, message, auth token, staff role or user ID is passed to analytics. No IP address is read or stored by application code. No application fingerprint or analytics storage/cookie is added.

The integration uses Vercel's hosted collection infrastructure, which receives network requests and manages its own privacy practices and standard browser/referrer metadata. This is not a claim that no network metadata reaches Vercel. The beforeSend filter controls the reported page/event URL, not all provider-managed fields. No session replay is installed. Staff-only routes are excluded; a staff member visiting the public site is indistinguishable from other public visitors without adding auth-dependent tracking logic, which this phase avoids.

## Optional events (no custom properties)

- explore_products_click: hero Explore Products link activation (including keyboard-generated clicks).
- feedback_started: entry to /feedback; means opening the feedback flow, not submitting a rating.
- contact_form_opened: entry to /contact.
- business_enquiry_opened: entry to /business.
- arena_viewed: entry to /arena.
- tournaments_viewed: entry to /tournaments.
- find_gg_viewed: entry to /find-gg.

These route-entry events do not prove interaction with a form or completion. No submissions are tracked. The flag defaults to false so unsupported custom-event collection is not silently enabled.

## Validation

TypeScript/production build and all 13 existing/new test scripts passed, including public analytics exclusions/redaction and 60 bilingual render smoke cases. Live dashboard delivery and browser network checks remain manual. Entry JS increased approximately 3.1 kB uncompressed / 1.2 kB gzip; the asynchronously loaded Vercel collector is additional network overhead. No measured browser speed claims are made.

Files changed: package.json, package-lock.json, src/App.tsx, src/analytics/PublicAnalytics.tsx (new), src/analytics/policy.ts (new), tests/publicAnalytics.cjs (new), ANALYTICS_SETUP.md (new).

Official references:
- https://vercel.com/docs/analytics/quickstart
- https://vercel.com/docs/analytics/package
- https://vercel.com/docs/analytics/custom-events
- https://vercel.com/docs/analytics/privacy-policy