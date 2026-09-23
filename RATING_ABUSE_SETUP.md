# Public rating abuse protection rollout

Implemented locally only. Do not treat this feature as live until the function, frontend, migration and ingress checks below are complete. Existing package/CLI changes were left untouched.

## Protection

The browser calls the account-free `submit-rating` Edge Function. It validates the original four families and three flavor slugs, integer scores 1-5, optional comments up to 1000 characters, language, request shape and an 8 KiB streaming body limit. It fixes the stored source to `qr`. There are no name/phone/account fields and no route changes.

A service-role-only RPC validates again, locks a private source row, checks limits and inserts the rating in one transaction. Limits span all product/flavor combinations: at least 10 seconds between accepted submissions, at most 5 accepted submissions per rolling minute and 30 per rolling hour. Rejected attempts do not extend the waiting period. Responses use HTTP 429 and Retry-After. Storage failures fail closed; the frontend never falls back to direct inserts.

Migration 005 revokes the original anonymous INSERT column grant and removes its INSERT policy. Public and authenticated clients cannot directly insert or read ratings or call the privileged RPC. This is necessary to prevent bypassing the limiter. Customers still submit without an account through the function. Existing rating rows, columns, dashboard/MFA enforcement and CMS are unchanged.

## Manual Supabase steps

1. Use staging first. Review and apply `supabase/migrations/005_rating_abuse_protection.sql` after 001-004. No migration has been applied automatically.
2. Set Edge secrets (never VITE variables):
   - `RATINGS_HASH_SECRET`: cryptographically random secret of at least 32 characters, shared by all function instances. Generate privately; do not paste it into source, logs or chat. Rotating it resets source limits.
   - `RATINGS_ALLOWED_ORIGINS`: comma-separated exact website origins, plus local development origins only when needed.
   - `RATINGS_TRUSTED_IP_HEADER`: `x-forwarded-for` or `x-real-ip`, ONLY after proving the selected header is overwritten by your trusted Supabase ingress. The function accepts a single IP address and rejects comma-separated proxy chains. It does not trust a browser-provided source id.
   Existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` remain server-side.
3. Validate ingress in staging before opening submission: requests from one network with forged values in the configured header must NOT receive independent buckets. Test omitted headers, single forged addresses and forged lists. Verify two separate networks are independent. If the gateway preserves caller-supplied values or provides an ambiguous chain, do not activate this configuration; obtain a documented trusted client-IP header from the ingress. Do not simply select the first proxy hop. Missing/unusable IP configuration returns 503.
4. Deploy the new function with `supabase functions deploy submit-rating`. Its checked-in function configuration disables JWT verification because it is intentionally anonymous. Authorization on the private database RPC remains service-role-only. Do not redeploy or alter ratings-dashboard for this phase.
5. Enable Supabase Cron/pg_cron if not already enabled and schedule hourly cleanup using the SQL editor:

   select cron.schedule('gg-rating-limit-cleanup', '0 * * * *', 'select public.purge_rating_limits();');

   Avoid duplicate jobs if one already exists. Cleanup removes only expired limiter rows. Monitor the job; without it expired metadata persists even though old timestamps stop counting.
6. Coordinate frontend deployment, function deployment and migration in a short maintenance window. An old frontend cannot submit once direct INSERT is revoked. Deploying only the function/frontend leaves the old direct-insert bypass open until migration 005 is applied. Never restore that bypass as an automatic fallback.
7. Run `supabase/tests/rating_abuse.sql` in staging. It rolls back all fixtures. Also run the existing CMS/MFA SQL tests. `staff_mfa.sql` now expects migration 005 and checks denial of direct rating inserts. Test concurrent calls from the same source: the first accepted request must prevent the others from inserting during the 10-second cooldown. Check an existing QR URL, Arabic/English wait messages, and AAL2 dashboard access.

## Privacy and limits

Raw addresses are used transiently by the Edge Function, HMAC-SHA256 hashed with a server secret and never stored by application code. IPv4 uses the network's visible address; IPv6 is grouped by /64 to resist privacy-address rotation. No cookies, browser fingerprint, geolocation or third-party service is added. The private table contains only keyed hashes, accepted timestamps (maximum 30 per active source), and expiry. It has no rating/user foreign key and no dashboard exposure. These hashes remain pseudonymous data, not a claim of anonymization.

Counters expire one hour after the last accepted rating. Hourly cleanup retains them for approximately one to two hours, assuming the scheduled job runs. Supabase/infrastructure may separately log request metadata under its own retention settings; this implementation does not disable platform logs.

Shared Wi-Fi/carrier NAT customers share a limit. Distributed bots can rotate networks, and this does not prevent volumetric traffic costs before the limiter. Tune only after observing legitimate traffic. Source-header integrity is essential. Supabase discusses forwarded client IPs here, but deployment-specific anti-spoofing still needs verification: https://github.com/orgs/supabase/discussions/7884

Optional next phase: add a server-verified Turnstile challenge if bot pressure justifies the extra user interaction and external service. No bot vendor or dependency was added in this phase.

## Verification boundaries

Local TypeScript/build, existing tests and mocked Edge/transport tests are automated. Database SQL tests, concurrent database requests, trusted-ingress behavior and live deployment were not run automatically. Passing mocked tests does not prove deployed RLS or proxy integrity.
