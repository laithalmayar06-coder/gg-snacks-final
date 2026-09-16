# Phase 4 CMS setup

## Activation

The application code is ready, but migration 003 has not been applied to the connected Supabase project. Read-only checks found the six CMS tables absent. Live CMS CRUD and database RLS verification therefore remain pending.

1. Review and apply `supabase/migrations/003_admin_cms.sql` in the existing project's Supabase SQL editor, after the existing migrations. Use your normal database backup process. The transaction creates new tables and seeds placeholders; it does not modify ratings, staff membership, auth or existing policies.
2. Sign in through `/admin/login` using an existing staff account. An existing `admin` can edit; a `viewer` can read. Membership administration remains outside this CMS.
3. Run `supabase/tests/cms_rls.sql` against a local/staging database with migration 003 installed. It uses reserved test identities and rolls its changes back. This is a manual database test, not part of the Node test suite.
4. Verify saves in every CMS section, reload public pages in English and Arabic, and check existing rating submission and dashboard access in the deployed environment.

No new environment variables, packages, service-role frontend keys, Edge Function deployment or Vercel changes are required.

## Admin pages

- `/admin/products`: bilingual names, descriptions, size, ingredients, allergens, nutrition text, image reference, accent, visibility and order.
- `/admin/flavors`: parent product, bilingual names/descriptions, image, accent, placeholder status, visibility and order.
- `/admin/stores`: bilingual location details, map/online links, optional coordinates, visibility and order. Stores support confirmed deletion.
- `/admin/content`: About, Story, Vision, Mission, Values and four Why GG cards, in both languages.
- `/admin/tournament`: bilingual event information, dates, game, prize, rules, registration information, stream URL and status.
- `/admin/contact`: email, optional phone/WhatsApp and social links.

The existing `/dashboard/ratings` now includes CMS navigation. Its dashboard behavior and login are unchanged. Images use URLs or existing asset paths; uploads are not included.

## Catalog and rating compatibility

Catalog ids, slugs and flavor parents are immutable after creation. Rename display labels freely. Archive products/flavors using Active instead of deleting them. Discovery lists hide archived entries; original product and printed rating routes remain available.

New catalog entries are catalog-only. Rating buttons are limited to the original supported product/flavor combinations. Neither rating submission nor its database policy is extended in Phase 4.

## Public integration and fallbacks

The homepage catalog, product pages, feedback picker, Find GG, About/Why GG, tournament content and contact/social displays consume managed content. Public data refreshes on a full page load or return from the admin area.

Unavailable tables retain static or last successfully loaded content. Successful empty catalog/store results show empty listings rather than restoring sample records. Blank business copy uses approved existing text; blank contact values show placeholders. No real contact details or stores were invented.

## Security

All six new tables enable RLS. Public clients can read catalog metadata, including archived catalog records needed for stable URLs. Catalog entries are not private drafts. Other tables expose only active rows. Existing staff viewers can read all CMS rows; only admins can insert/update, and only stores allow deletion. No public client can write CMS data.

The role helper reads the current authenticated user's existing staff membership with a fixed empty search path. Save/delete requests compare updated_at to detect concurrent edits. UI permissions supplement database enforcement; they do not replace it.

Reference: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [database functions](https://supabase.com/docs/guides/database/functions).

## Verification boundaries

TypeScript, production build, Node tests and bilingual server-render tests are local checks. SQL policy assertions in Node are structural checks, not live RLS execution. No browser session or database management connection was available for live login, CRUD or deployed database tests.

Phase 5 remains separate: final assets and animation polish, subject to its own approved scope.
