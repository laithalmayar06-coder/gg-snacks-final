# Final POP-G / TRIGGER flavors

Implemented locally only. No database changes, Edge deployments, frontend deployments or live rating submissions were performed.

## Approved mapping

| Product | Permanent slug | English | Arabic |
| --- | --- | --- | --- |
| POP-G | flavor-1 | White Cheese | جبنة بيضاء |
| POP-G | flavor-2 | Sour Cream & Onion | كريمة حامضة وبصل |
| POP-G | flavor-3 | Hot & Sweet | حار وحلو |
| TRIGGER | flavor-1 | Chicken Noodles | نودلز الدجاج |
| TRIGGER | flavor-2 | Vegetable Noodles | نودلز الخضار |
| TRIGGER | flavor-3 | Taco | تاكو |
| TRIGGER | flavor-4 | Sushi | سوشي |

Existing product/flavor slugs and IDs stay unchanged. Static rating pages, dashboard display names, fallback product selectors and feedback routing use src/data/products.ts. The public catalog and admin flavor editor use Supabase public.flavors when CMS data is available. Updating local data alone does not update those remote rows.

The CMS already supports any number of flavors. No CMS schema or permission change is needed. The migration marks these seven names as final and adds Sushi to TRIGGER. Existing active states, images, colors, descriptions and ordering are preserved; a newly inserted Sushi row is active, with display_order 3 and the current TRIGGER family accent. If flavor-4 already exists, its ID and presentation settings are retained.

## Current remote schema and revised migration scope

The read-only inspection of project tyfqxxuwlklpzudcfjzo found the original anon-only "Anonymous rating inserts" policy and its column-level INSERT grant, the CMS flavor tables, and no rating-limiter table or RPC. Migration history was empty/absent, so object presence does not establish which numbered migrations were formally recorded.

Migration 007 now targets that existing anonymous-insert schema. Migration 005 remains pending. Do not apply it as a prerequisite, run a generic db push, or mark it as applied.

The revised 007 transaction:
- Checks that the expected anon-only INSERT policy and six original CMS flavors exist; otherwise it fails before changes.
- Updates only the six approved flavor names/final flags and inserts or updates TRIGGER flavor-4. Existing identity and presentation fields are retained. The existing CMS trigger refreshes updated_at for updated rows.
- Alters only the WITH CHECK expression of "Anonymous rating inserts" on public.ratings: the original twelve route pairs stay valid, and trigger/flavor-4 is the only added pair.
- Preserves the 1-5 score, 1000-character comment limit, nullable EN/AR language behavior, qr source check, role targets, grants and all other policies.

It does not create or replace any function, table, schema or rate-limiter object. public.products is read only to resolve existing parent IDs and the new flavor's accent. Existing ratings are not changed.

## Manual steps, only after separate approval

1. Use a staging database matching the current anonymous-insert schema first. Review the complete revised supabase/migrations/007_final_flavor_names.sql.
2. After approval, execute ONLY that file's complete SQL transaction in the intended project's Supabase SQL editor. Verify the project ref before execution. Do not select/run other migrations. This does not automatically populate the Supabase CLI migration-history table; reconcile history separately rather than marking pending migrations as applied.
3. In staging only, run supabase/tests/final_flavors.sql. It rolls back every synthetic rating. It checks the seven CMS names, twelve existing QR combinations, TRIGGER Sushi, rejection of unsupported combinations, retained validation and denial of anonymous reads. It targets the current pre-005 policy; do not run the separate rating-abuse tests while 005 is pending.
4. After an approved release, reload public catalog/CMS pages to refresh names. Check /products/pop-g, /products/trigger, /feedback and /admin/flavors in EN/AR as applicable; the admin editor retains its existing permissions.

No Edge Function deployment is needed for this database-policy revision. Do not deploy the pending anti-abuse frontend/submit-rating flow with 005 absent: that flow still calls the unavailable rate-limiter RPC. This migration alone does not make that separate flow operational. Review frontend submission compatibility before any later release.

If 005 is adopted in a future phase, its replacement RPC allowlist must be reviewed to retain trigger/flavor-4. Do not apply the original 005 later without that compatibility review.

## URL compatibility

All existing /rate/pop-g/flavor-1 through flavor-3 and /rate/trigger/flavor-1 through flavor-3 URLs are unchanged. LOOTS and X-STIX remain unchanged.

New URL: /rate/trigger/flavor-4. Migration 007 enables its database insertion through the existing anonymous policy when applied. It has not been applied remotely, and no live submission readiness is claimed. No QR codes were generated.

## Verification boundaries

The local focused test checks frontend/CMS mappings and compares the new policy predicate against the original policy to verify the sole route extension. It does not execute SQL or contact Supabase. The rollback-only SQL test is prepared for staging but has not been run. No migration, deployment or live rating submission was performed during this revision.
