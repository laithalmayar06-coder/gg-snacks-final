# Temporary client-IP diagnostic — completed, removed remotely

Live checks were performed against the workspace's existing Supabase project. No raw IP addresses or secret values were included in diagnostic responses or this report. A separate token-protected function was used; submit-rating was not modified/deployed, migration 005 was not applied, and no production rate-limit setting was enabled.

## Observations

| Header | Baseline | Forged request | Conclusion |
| --- | --- | --- | --- |
| x-forwarded-for | Present, multiple addresses; comparison tag also changed on a later normal control | Forged test address absent; same value as initial baseline during the x-forwarded-for probe | Unsuitable for the current single-IP parser; changing proxy chain cannot establish a trusted hop |
| x-real-ip | Absent | Remained absent when explicitly supplied | Unusable on this ingress |
| cf-connecting-ip | Present, single IP, stable across successful baseline/control requests | Both reserved forged values produced HTTP 403 without usable diagnostic output | Candidate only; cannot prove which network boundary rejected the request or guarantee caller independence |

The required baseline and all three forgery cases were attempted. The cf-connecting-ip test was retried with two different reserved addresses; both returned 403. Some earlier requests failed at transport level, and those failures are not treated as evidence of header trust. These requests originated from one execution environment/network; no independent-network result is available.

**Recommendation: do not set RATINGS_TRUSTED_IP_HEADER yet.** No reliably trustworthy, supported header was established. Current submit-rating code only allows x-forwarded-for or x-real-ip. Do not add cf-connecting-ip support or pick the first forwarded hop based on this result alone.

## Cleanup

The remote ip-header-diagnostic function was deleted, IP_DIAGNOSTIC_TOKEN was unset, and its local .env.local file was removed after testing. The isolated diagnostic source and non-secret runners remain for a controlled repeat. They do not import application code or access any database. Do not include this temporary function in general deployments.

## Exact manual repeat steps

Use a staging project when possible. Run commands in the GG SNACK folder. Replace PROJECT_REF with the intended project's actual reference; do not run db push or any migration command.

1. Privately generate a 32-byte random token and put exactly one line in diagnostics/client-ip/.env.local:

   IP_DIAGNOSTIC_TOKEN=YOUR_RANDOM_TOKEN

   This file is ignored by the existing *.local rule. Do not commit or share it. In PowerShell, the following creates it without printing the secret (run only when that file does not already exist):

   $tokenPath = Join-Path (Get-Location) 'diagnostics/client-ip/.env.local'
   if (Test-Path -LiteralPath $tokenPath) { throw 'Refusing to overwrite existing token file' }
   $bytes = New-Object byte[] 32
   $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
   $rng.GetBytes($bytes)
   $rng.Dispose()
   [IO.File]::WriteAllText($tokenPath, 'IP_DIAGNOSTIC_TOKEN=' + [Convert]::ToBase64String($bytes), [Text.UTF8Encoding]::new($false))

2. Deploy only the isolated diagnostic:

   npx.cmd supabase secrets set --env-file diagnostics/client-ip/.env.local --project-ref PROJECT_REF
   npx.cmd supabase functions deploy ip-header-diagnostic --project-ref PROJECT_REF --no-verify-jwt

   JWT verification is disabled only for this temporary endpoint; it enforces its separate diagnostic token and exposes no browser CORS access.

3. Run the local privacy check, then the live probe:

   node diagnostics/client-ip/check.cjs
   node diagnostics/client-ip/probe.cjs https://PROJECT_REF.supabase.co/functions/v1/ip-header-diagnostic

   The runner sends no custom IP headers for baseline/control calls. It then forges each of x-forwarded-for, x-real-ip and cf-connecting-ip individually with 198.51.100.77 and 203.0.113.88, with a normal control after each. All three observed headers are compared for every request to catch cross-header influence. It prints only presence/change/probe-match flags and reserved test values, never real IPs or opaque tags.

4. Repeat from a separate ordinary network without this execution environment's proxy (for example, a laptop on a mobile hotspot). A changed baseline between networks is expected. Never classify a failed/403 request as proof the function received an overwritten header. Ask Supabase to confirm which header is guaranteed to be overwritten and whether custom domains/proxies affect that guarantee. The current diagnostic's HMAC tags are intentionally per-run; do not publish secrets or raw headers to compare runs.

5. Cleanup even if a probe fails:

   npx.cmd supabase functions delete ip-header-diagnostic --project-ref PROJECT_REF --yes
   npx.cmd supabase secrets unset IP_DIAGNOSTIC_TOKEN --project-ref PROJECT_REF --yes
   Remove-Item -LiteralPath 'C:\Users\Legion\Desktop\GG SNACK\diagnostics\client-ip\.env.local'

Keep migration 005 and production limiter activation separate. These steps never submit ratings.
