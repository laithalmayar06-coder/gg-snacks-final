# Public content sweep

Scope: local public route/component/data inspection, EN/AR render checks and existing tests. No live CMS records changed or inspected; no external destination availability or browser interaction claims. Backend, admin, auth, ratings, analytics, migrations and Vercel configuration were untouched.

## Findings and disposition

| Finding | Classification | Action |
| --- | --- | --- |
| FAQ says business enquiries do not send/save | Safe to fix now | Replaced with EN/AR instructions to use the working Business Enquiries page. |
| Business description source still says preview-only | Safe to fix now | Updated publicContent.formNote to existing approved functional-form wording. The metadata system consumes this copy; SEO logic itself is unchanged. |
| Contact introduction promises future channels even when CMS channels may exist | Safe to fix now | Replaced with neutral instructions to use the existing form. CMS contact rendering unchanged. |
| Find GG homepage says discovery is coming soon despite a working directory | Safe to fix now | Removed the Coming Soon heading/CTA wording; points to the current directory. |
| Homepage disabled city/district controls say cities are coming soon | Safe to fix now | Clarified that selection happens on Find GG; controls stay disabled and the working link remains. No duplicate search flow added. |
| Homepage displays two repeated fake store-detail rows | Safe to fix now | Removed the repeated placeholder rows; preserved illustrative map, heading, explanation and directory link. |
| Finder fallback exposes Sample store A/B/C and sample districts | Safe to fix now | Excluded marked demo records from public fallback rendering. Existing sample fixtures remain in data/stores.ts for filter tests; CMS store mapping is untouched. |
| FAQ says finder uses sample listings | Safe to fix now | Now explains available listings and the empty result state without claiming verified stockists. |
| GG Arena app/visual Coming Soon | Intentional placeholder | Kept as approved. |
| Tournaments Coming Soon, pending game/prize/rules/stream and approved dates | Intentional placeholder | Kept. No invented registration/stream links. Dates remain the existing January/March 2027 copy, with CMS overrides preserved. |
| Packaging placeholders, abstract stage, Flavor 01/02/03, pending size/ingredients/nutrition | Requires official content/assets | Kept explicit pending labels. Real imagery/product facts must be supplied through the established catalog. No rating URLs or rating logic touched. |
| About media, brand story/vision/mission/values fallback text | Requires official content/assets | Kept the pending state. Existing CMS overrides continue to work. |
| Missing email/phone/WhatsApp/address/socials | Requires official content/assets | No fake values found in static configuration; null values remain null. Footer already hides unconfigured social links. Contact detail pending labels remain where official details are absent. |
| Privacy and Terms placeholder documents | Requires official content/assets | Kept explicit unpublished notices and routes; no invented legal policy. Official approved documents and publication dates are required. |
| Real stockists and online stores | Requires official content/assets | No real listings invented. The directory shows existing empty-results copy until CMS supplies listings; the map remains explicitly illustrative. |
| Old RateSnackCTA preview component and ratingLocalNote/ratePreviewNote strings | Intentional inactive legacy placeholder | Not mounted/referenced by the current Home/rating UI. Left untouched under the no-rating-change constraint; not a current public message. |
| Old publicContent.check/checked preview strings and demo-label strings | Intentional inactive legacy placeholder | No longer used by the active enquiry form; preserved unused keys rather than expanding this sweep into unrelated cleanup. |

## Link audit

- Header: /, /products, /arena, /tournaments, /find-gg, /about, /contact match App routes.
- Footer: all eleven required destinations exist, including /feedback, /business, /faq, /privacy and /terms. Footer wordmark #main-content resolves in its Home/PublicPageLayout hosts.
- Hero Explore Products, product-world/featured cards, feedback CTA and contact CTA lead to existing destinations.
- Products/family navigation and all twelve existing family/flavour feedback destinations remain covered by existing product/feedback tests. Invalid combinations remain rejected.
- FAQ is an accordion with textual page references, not dead-link buttons.
- Arena/Tournaments entry links resolve. Pending registration/stream values remain text, not fabricated links.
- Find GG entry link resolves; city/district search lives on /find-gg. Decorative homepage selectors remain disabled with explanatory copy.
- Empty static social/map/online values do not create anchors. Existing CMS URLs continue through the existing safe-URL checks. This validates supported URL schemes, not whether a remote page is reachable.

No broken local public route links were found; no route or URL changes were needed. External CMS links and published content should be checked manually with the currently deployed CMS data.

## Verification

TypeScript (tsc --noEmit via build), production build and all 13 test scripts passed, including 60 EN/AR server-render cases. The finder smoke assertion now requires that sample stores are absent. These checks do not replace visual/browser or live CMS checks.

## Files changed

- src/components/HomepageSections.tsx
- src/components/StoreFinder.tsx
- src/data/faq.ts
- src/data/homepage.ts
- src/data/publicContent.ts
- tests/renderSmoke.cjs
- CONTENT_SWEEP.md (this report)