# Contact and business enquiries

Implemented locally only. Nothing has been deployed or applied to Supabase automatically.

## Flow and storage

Existing contact/business forms now call the anonymous `submit-enquiry` Edge Function. Contact submits `general`; business keeps all seven existing category IDs/labels. Company and phone are optional. Existing classes/layouts are retained with EN/AR sending, success, validation and failure states. Fields/button are locked during submission and after confirmed success. No automatic retry; a network timeout can leave acceptance uncertain, and a later manual retry may duplicate a previously accepted enquiry.

The function validates JSON shape, string types, category, language, email, phone, name/company (200 characters), email (254), message (3000) and rejects control characters. Streaming body size is limited to 24 KiB (including multibyte Arabic/JSON escaping); body reads are bounded to 10 seconds. Database constraints independently restrict required values, lengths, categories, language and statuses. No fields for IP address, fingerprint, analytics or browser identity exist. Application code does not log submitted data. Infrastructure logs and backups remain subject to platform retention settings.

## Security model

New migration `supabase/migrations/006_enquiries.sql` creates only `public.enquiries`, its index, grants and enquiry-specific RLS policies. Existing tables/policies/auth/MFA are unchanged.

- Anonymous visitors have no table privileges and cannot directly insert, select, update or delete enquiries.
- Submission uses a service-role credential exclusively inside the Edge Function. The browser gets only an acceptance boolean or generic error, never a stored row.
- Authenticated nonstaff and password-only staff cannot read/update enquiries.
- AAL2 allowlisted viewers/admins may read. Only AAL2 admins may update, and the authenticated SQL grant permits only the status column.
- No staff deletion or content editing is offered.
- Allowed origins are configured explicitly; CORS is not bot protection or proof of caller identity. Account-free callers without an Origin header can submit valid data. Dedicated enquiry spam/rate limiting/CAPTCHA is postponed; the unresolved rating IP trust configuration is not reused.

`/admin/enquiries` uses the existing StaffSession/RequireStaffSession guard and shared logout. It provides EN/AR type/status filters, 25-item pages, plain-text escaped message details and admin-only status controls. Staff data is fetched with the staff client, never the public CMS provider, and is not persisted in browser storage. The common navigation adds only an Enquiries link.

## Manual Supabase steps

1. Review in staging. Apply only migration 006 with the SQL editor after migrations 003 and 004. It has no dependency on 005. Do not run a blanket database push that would inadvertently apply pending migration 005.
2. Run `supabase/tests/enquiries.sql` in staging as a database administrator. It rolls back all fixtures and checks anonymous denial, nonstaff/AAL1 denial, AAL2 viewer read-only access, AAL2 admin status updates, and denial of content edits/deletion/invalid statuses.
3. Set server-side Edge secret `ENQUIRIES_ALLOWED_ORIGINS` to `https://gg-snacks-final.vercel.app`. Add exact local/staging origins separated by commas only as needed. Do not put secrets in VITE variables. Existing platform-provided SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY remain server-side.
4. Deploy only `supabase functions deploy submit-enquiry --project-ref YOUR_PROJECT_REF`. The checked-in function-specific configuration disables JWT verification for this intentionally anonymous endpoint. No other function needs redeployment.
5. Deploy frontend changes after the table/function/configuration are ready. Until then submission fails visibly; it never silently falls back to a direct database insert.
6. Test EN/AR contact and each business category; inspect optional company/phone, loading/error/success and repeated clicks. Verify stored fields in the protected inbox. Test admin status changes and viewer read-only access, including direct API attempts with anon, AAL1, nonstaff and AAL2 viewer tokens. Test an expired staff session, filter pagination and logout.

## Verification and boundaries

Local production build (including TypeScript check) and all 12 `tests/*.cjs` scripts passed. The suite includes mocked Edge validation/persistence, duplicate-click protection, policy structure checks and 60 EN/AR server-render checks. SQL tests, deployed Edge behavior and browser interaction were not run automatically; local mocks do not prove live RLS.

No external email provider or dependency was added. Acceptance is determined only by successful storage. Future notification work should use a durable queue/outbox after persistence; provider failures must not cause a stored enquiry to be reported as rejected. Delivery/retry infrastructure, retention/purge policy and spam protection are deferred. Existing SEO is untouched, including the previous business-page preview description; updating that metadata requires a separately authorized SEO change.

## Files changed in this phase

- src/App.tsx
- src/cms/AdminNavigation.tsx
- src/components/EnquiryForm.tsx
- src/data/enquiries.ts
- src/data/enquiryCopy.ts (new)
- src/pages/AdminEnquiries.tsx (new)
- src/services/enquiries.ts (new)
- supabase/config.toml (submit-enquiry stanza only)
- supabase/functions/submit-enquiry/index.ts (new)
- supabase/functions/submit-enquiry/validation.ts (new)
- supabase/migrations/006_enquiries.sql (new)
- supabase/tests/enquiries.sql (new)
- tests/enquiries.cjs (new)
- tests/publicPages.cjs (company optional expectation)
- tests/renderSmoke.cjs (real-submission copy and new protected page)
- ENQUIRIES_SETUP.md (new)