# Deployment checklist

## Before deploy

- [ ] Review real company content in `src/data/siteContent.ts`; keep unconfirmed details null. Contact form is still a visual preview.
- [ ] Review real product/flavor data in `src/data/products.ts`; confirm whether placeholders are acceptable for launch. Update the database INSERT policy when introducing new slugs.
- [ ] Configure only the two public Vite variables in Vercel; no service-role/secret keys. Keep local env files out of Git.
- [ ] Run TypeScript, all tests and production build (README commands).
- [ ] Verify Supabase migrations, INSERT-only anonymous privileges, staff membership and Auth settings in the actual project.
- [ ] Configure exact dashboard origins and deploy the staff-checked Edge Function. Follow README Production Deployment.

## After deploy

- [ ] Homepage and all existing sections load; favicon and metadata are present.
- [ ] `/products` and all four family pages load; flavor links open the matching rating page.
- [ ] English/Arabic and RTL work on homepage, products and rating pages.
- [ ] Check mobile/tablet layout, keyboard focus and reduced motion in a browser.
- [ ] Submit a public rating and verify its row in Supabase; verify failure/retry preserves comment.
- [ ] Staff admin login works, including session restoration after refresh.
- [ ] Dashboard loads and filters; signed-out access redirects and non-staff access is denied.
- [ ] Anonymous database SELECT/UPDATE/DELETE remain denied; INSERT works even while staff is signed in.
- [ ] Logout clears the dashboard and returns to login.
- [ ] Direct visits and refreshes work on `/products`, `/products/loots`, `/rate/loots/flavor-1`, `/admin/login`, `/dashboard/ratings`.
- [ ] Unknown URL shows branded fallback; invalid product/flavor and failed requests show friendly errors.
- [ ] HTTPS works on the canonical domain; internal routes return `X-Robots-Tag: noindex, nofollow`.
- [ ] No unexpected console errors, failed assets or exposed secrets in browser/network output.

Local tests do not replace these deployed checks. No deployment, real rating insert or live authorization audit was performed automatically.
