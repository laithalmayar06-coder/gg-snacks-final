# Staff MFA / AAL2 rollout

This phase adds native Supabase TOTP MFA to the existing staff allowlist. No migration or Edge Function was deployed automatically.

## Manual rollout

1. In the existing Supabase project's Authentication MFA settings, enable TOTP enrollment and verification. Confirm existing admin/viewer membership. Keep an authorized Supabase project administrator available for identity-verified recovery; do not remove membership or weaken policies to work around a lost authenticator.
2. Test on staging with migrations 001-003 already present. Apply `supabase/migrations/004_staff_mfa.sql`, deploy the updated `ratings-dashboard` Edge Function and deploy this frontend. Existing function secrets and config are reused; no new frontend environment variables or Vercel settings are required.
3. Run `supabase/tests/cms_rls.sql` and `supabase/tests/staff_mfa.sql` in staging. Both roll back fixtures. The latter tests AAL1 denial, AAL2 viewer/admin permissions, nonstaff denial, staff-list privacy, public catalog reads and anonymous rating inserts. Node SQL assertions alone do not validate live database policies.
4. Verify real TOTP enrollment and challenge using admin and viewer accounts. Test an incorrect code, reload during setup, logout from CMS, expired sessions, public pages and the existing anonymous rating URL. Verify direct password-only API calls are denied even without using the frontend.
5. Deploy the frontend MFA flow before or alongside enforcement so staff have a working enrollment route. Apply migration 004 and deploy the updated Edge Function in the same coordinated production rollout; protection is incomplete until BOTH are deployed. Existing password-only sessions will need MFA. Do not edit migrations 001-003.

Native TOTP configuration and flow: https://supabase.com/docs/guides/auth/auth-mfa/totp
AAL enforcement: https://supabase.com/docs/guides/auth/auth-mfa

## Flow and boundaries

Email/password login goes to `/admin/mfa`. Membership is checked using the existing current-user `cms_staff_role()` RPC. Nonstaff accounts cannot reach enrollment in this UI or any privileged data. Staff without a verified TOTP device explicitly start setup, scan the private QR and verify a code. Existing devices are challenged; multiple verified authenticators can be selected. Interrupted, unverified setup factors created by this flow are cleaned only when restarting enrollment. Verified devices are never removed by this page.

The QR (which contains the setup secret) is held only in component memory while needed and disappears on verification or leaving the page. Raw secrets and provisioning URIs are not retained separately, logged or stored in application storage. Native Supabase session persistence remains unchanged.

Both admin and viewer require AAL2 in the frontend guard. Migration 004 requires AAL2 AND the existing role for all privileged CMS reads/writes. The `Public CMS read` policies remain unchanged, so AAL1 sessions can still read the same public content as anyone else; this is not privileged CMS access. Archived catalog entries remain public as before. No rating grants, allowlist schema or business data change.

The Edge Function validates the user AND signed token claims, confirms matching identity and AAL2, then checks the allowlist before querying ratings with the server key. Its structured `mfa_required` response sends the frontend back through verification.

Logout is available throughout CMS navigation and the MFA page, using existing local-session scope. Other device sessions are not signed out. Logout is disabled while verification/setup is pending to avoid racing those operations. Supabase-issued access JWTs can remain valid until expiry; MFA does not change that lifetime.

No recovery bypass is included. If a staff member loses their authenticator, verify their identity through your established administrative process before a trusted project administrator resets the factor using Supabase's supported administration tools. On next sign-in, that account must enroll again before protected access. Never copy factor secrets into support messages.

## Verification limits

Local TypeScript/build and mocked unit/render tests are automated. Live TOTP, deployed Edge enforcement and PostgreSQL RLS tests require the manual staging checks above. This implementation is not active on production until the manual rollout is completed.
