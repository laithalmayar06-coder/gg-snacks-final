# Performance and SEO basics

Implemented locally; no deployment, database or security changes made in this phase.

## Changes and audit

- Existing public/admin route lazy imports already separate page code. Retained Suspense, error boundaries, route structure and session gates.
- Split Supabase's existing eagerly required SDK into a cacheable vendor chunk. CMS reads still need it on public startup; this does not defer CMS or reduce first-load network traffic. No dependency added. Shared imports are bundled once; no duplicate SDK copy found in the output.
- Catalog images after the first two cards use native lazy loading. Hero/product-detail loading stays unchanged. Existing fixed-size/aspect-ratio containers reserve image space, and decoding remains asynchronous. No invented image dimensions or replaced assets.
- Hero ambient motion already pauses with IntersectionObserver and page visibility. Other reviewed GSAP effects are finite reveals or scroll-controlled effects. Reduced-motion handling is preserved; no animation/style changes were needed.
- Centralized metadata avoids competing language/page title effects. Metadata effects depend on scalar values rather than rerunning for unrelated CMS table updates. No CMS fetch/render logic was changed.
- Existing page headings, link labels, document language and direction were retained.

## SEO configuration

`src/data/seo.ts` defines the confirmed origin https://gg-snacks-final.vercel.app and stable public sitemap routes. Update this one origin if the domain changes.

Titles/descriptions use existing EN/AR copy; product detail metadata reads the same catalog names/descriptions as the page. Canonical links exclude query strings and fragments. Utility/staff/rating/unknown paths receive client-side noindex and no canonical. These are crawler hints, not access controls.

Vite emits `dist/robots.txt` and `dist/sitemap.xml` during production build. They are not source files in public/ and are not served by the Vite development server. The sitemap contains stable public routes only; CMS product slugs are deliberately omitted because they can be activated/deactivated independently of a build. Public product detail pages still receive canonical URLs and remain discoverable through catalog links.

No invented schema, company claims or language-specific URLs were added. EN/AR share URLs, so no fake hreflang alternates are emitted.

## Boundaries and final assets

This remains a client-rendered SPA. Initial HTML contains default English title/description, Open Graph and Twitter summary metadata. Route-specific and Arabic metadata/canonical/noindex values update after JavaScript executes. Social crawlers that do not execute JavaScript may only see defaults. Reliable route-specific social previews and initial-response noindex require a separately approved prerender/server-rendering phase; Vercel configuration was not changed.

No approved raster social image exists in the current assets. SVG favicon/CSS logo were not converted into an invented social banner. Set `siteContent.seo.defaultSocialPreviewImage` when an approved image is available; verify preview rendering then. Final responsive image variants, intrinsic dimensions and image-driven LCP/CLS measurements await real assets.

## Measured local build

- Before: largest JS chunk 487.34 kB (146.38 kB gzip); total JS 687,873 bytes.
- After: largest JS chunk 272.66 kB (89.47 kB gzip); Supabase vendor 219.30 kB (57.81 kB gzip); total JS 689,569 bytes.
- Total JS increased by 1,696 bytes. This is vendor cache isolation, not a claim of lower first-load transfer or measured browser speed.
- CSS output unchanged.

`npm.cmd run build` passed (includes `tsc --noEmit`). All 11 `tests/*.cjs` scripts passed, including the new SEO tests and 58 EN/AR server-render cases. Mocked security tests are not live database tests. Browser layout/Lighthouse/live crawler checks were not run.

## Manual verification

1. Build, then run `npm.cmd run preview`. Check home, public pages and product deep links, switching EN/AR and using back/forward. Inspect title, description, canonical, OG and Twitter tags in the live DOM.
2. Check `/robots.txt` and `/sitemap.xml` through preview and after the normal deployment. Confirm hosting serves these files instead of the SPA fallback.
3. Confirm first-row/hero images load promptly and later catalog images defer when actual CMS images are present; inspect layout stability on mobile and desktop.
4. Verify reduced motion and off-screen/background-tab hero pause. Run mobile Lighthouse with a stable network and final assets before making speed claims.
5. Validate social previews with the target platform's inspector. Submit the sitemap in Search Console after deployment; check rendered canonical selection. Revisit dynamic product sitemap generation when final catalog publication is approved.

Only files changed by this phase:
- src/App.tsx
- src/components/PageMetadata.tsx (new)
- src/components/PublicPageLayout.tsx
- src/components/PackagingStage.tsx
- src/pages/Products.tsx
- src/i18n/LanguageContext.tsx
- src/data/seo.ts (new)
- vite.config.ts
- tests/seo.cjs (new)
- PERFORMANCE_SEO.md (new)

Existing package, rating-abuse and diagnostic work was preserved.