# QA and stabilization — 2026-09-07

## Fixed

- Completed homepage sections now have working Router navigation instead of coming-soon notices. Hero rating link moves to its CTA; footer Products opens the catalogue. Mobile menu closes on link selection and focuses its first link when opened.
- Route/anchor changes restore scroll and keyboard focus without resetting language or rating state. Homepage content now sits in a single main landmark, with the footer outside it.
- Rating header can wrap on narrow screens. Long content has overflow wrapping; product technical labels and stage captions wrap. Latin product titles align correctly within Arabic pages. Dashboard staff emails can wrap.
- Auth session events clear stale restoration errors. Dashboard fetches have a timeout and reject malformed payloads through the existing friendly error state.
- Route modules load on demand. Friendly localized loading/error states handle route chunk failures. Initial JS is approximately 248 KB before gzip, versus approximately 630 KB previously. No 500 KB chunk warning remains. Supabase is in a separate approximately 220 KB chunk, not required for the homepage.

## Checks run

- TypeScript and production build.
- Existing product-data, company-content/link, analytics and mocked Edge authorization tests.
- New mocked rating submission tests: score bounds, invalid product/flavor/language, whitespace trimming, empty comment, length cap and failed writes.
- 22 server-render smoke checks across English and Arabic: home, catalogue, all four families, invalid product/flavor, valid rating, login and dashboard loading state. Includes main/footer semantics and initial rating form state.
- HTTP 200 for the key routes. Vite returns the SPA shell for invalid slugs; the render tests check the branded error component rather than treating HTTP 200 as proof of validity.

## Not verified live

No browser was connected to the computer-use tool. Therefore screenshots, actual layout geometry, mouse/keyboard interaction, contrast sampling and real responsive rendering at 1440, 1280, 1024, 768, 430, 390, 375 and 360 pixels were not tested. CSS review is not a substitute for those checks.

No real feedback was submitted and no staff credentials were requested. Real Auth session restoration/expiry, account roles, deployed Edge Function CORS, RLS and database availability must be checked against the configured Supabase project. Security tests use mocks; permission policies and submission behavior were not changed.

## Manual browser checklist

1. `/`: inspect all eight widths above, both languages, and 200% zoom. Open mobile menu with keyboard, use Escape, follow About/Why GG/Contact, hero CTAs and footer links. Check focus, no clipping and no viewport overflow.
2. `/products` and `/products/loots` (also other families): check wrapping selectors, different accents, rating link destination, Back navigation and language changes without losing selected flavor. Test a broken image URL in local product data and restore it afterward.
3. `/rate/loots/flavor-1`: keyboard radio navigation, retained comment through language change and simulated network failure, loading/double-submit guard, real success once authorized to write a test rating. `/rate/loots/invalid` and `/products/invalid` must show branded errors.
4. `/admin/login` and `/dashboard/ratings`: signed-out redirect, wrong credentials, non-staff denial, staff success, reload/expired session and logout. Dashboard table should scroll inside its region on mobile. Test empty/filter/no-comment/error states.
5. Enable OS/browser reduced motion and repeat navigation and family/rating selections. Content must remain visible and usable.

## Intentionally unchanged

- Distribution and the visual-only rating/contact previews remain placeholders; no distribution page or generic rating-selection flow was added. Product detail rating links are functional.
- Internal staff screens remain explicitly English/LTR. Public sections retain English/Arabic.
- Unknown company/product facts remain placeholders. Existing database slug allowlist and the dashboard's labeled 10,000-row snapshot limit remain unchanged.
- Unknown general routes retain the existing home redirect; invalid product/flavor routes keep their branded error states.

This is a code/test stabilization pass, not a complete live production certification.
