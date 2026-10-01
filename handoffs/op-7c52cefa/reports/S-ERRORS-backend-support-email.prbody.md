# One support email on every public page (S-ERRORS slice 1, backend)

Owner ruling 2026-10-01 14:19 PDT: the support email is `Bradleyapple1031@gmail.com`, one address everywhere.

## Tier header
- **Tier:** T2
- **Why:** customer-visible contact on the public pages filed with the App Store, Play Store and Stripe (privacy, terms, security, status, help, download, signup). No behavior, auth, data or contract change beyond the published address.
- **T4 trigger scan:** none. No auth, RLS, tenancy, PII handling, money, credentials, migrations, `.github/workflows/*`, `scripts/ci/*`, `prisma/schema-parity-baseline.sql` or branch-protection files.
- **T3 trigger scan:** none. No shared primitive, contract or cross-repo API change. (The mobile half is a separate PR in growth-project-mobile and does not depend on this one.)
- **Bounded T1:** n/a (graded T2 because the change is customer-visible policy-page copy).
- **Builder-owner:** S-ERRORS builder (Claude Opus 5.5) for operator agent 109.
- **Acceptance evidence:** targeted jest below; CI at head.
- **Promotion triggers:** any change to auth, consent, policy wording beyond the address, or to a CI gate file re-grades upward.

## What changed
- `src/public-pages/trust-pages.html.ts`: `SUPPORT_EMAIL` = `Bradleyapple1031@gmail.com` (was `Bradley@Bradleytgpcoaching.com`). Help pages already re-export it.
- `src/public-pages/public-pages.html.ts`: the second, local `SUPPORT_EMAIL = 'hello@trygrowthproject.com'` is gone; the download and signup pages import the single constant. All four `mailto:` CTAs now go to the one address.
- `src/public-pages/README.md`, `docs/deploy-runbook.md`: text references to the support address (App Store Connect and Stripe Customer Portal setup steps) updated.
- Tests: three existing assertions updated to the new address; new `test/support-email.guard.spec.ts`.

## Guard (`test/support-email.guard.spec.ts`)
Fails the build if any email address other than `SUPPORT_EMAIL` appears anywhere under `src/` (code, templates, READMEs), unless the domain is reserved (RFC 2606/6761: example.com, .invalid, .test) or the address is in an allowlist where each entry carries its reason (outbound no-reply senders, the Resend From default, the contract-party fallback identity, a code comment). It also fails on any retired address (`hello@trygrowthproject.com`, `Bradley@Bradleytgpcoaching.com`, `hello@thegrowthproject.app`), fails on stale allowlist entries, renders every public page (download, signup, privacy, terms, security, status, all help pages) and asserts every `mailto:` targets `SUPPORT_EMAIL`, and has a negative control proving the detector flags a planted address.

## Overlap with open #611 (public trust pages rewrite)
Kept minimal so #611 rebases cleanly; `git merge-tree` against #611's head is reported in the comment below.
- #611 keeps `SUPPORT_EMAIL` in `trust-pages.html.ts` and adds `ACCOUNT_DELETION_EMAIL = 'Bradleyapple1031@gmail.com'`. After this lands both hold the same address. Recommended on #611's rebase: `export const ACCOUNT_DELETION_EMAIL = SUPPORT_EMAIL;` so there is one source.
- #611's privacy policy "Deleting your account" section says "by emailing ${SUPPORT_EMAIL}". On main today that resolves to the older `Bradley@Bradleytgpcoaching.com`; with this change it resolves to `Bradleyapple1031@gmail.com`, which is the owner's ruling. No #611 text change is needed.
- #611 adds `import { policyFooterLinks } from './trust-pages.html';` at the top of `public-pages.html.ts`. To avoid a textual conflict, this PR imports `SUPPORT_EMAIL` where the old local constant was (line 14), not at the top. #611 can fold both into one import line when it rebases.
- #611 rewrites the README trust-pages section and several runbook sections; this PR touches only the address lines, outside #611's hunks.
- #611's tests assert `SUPPORT_EMAIL` by reference, except `help-delete-account.spec.ts`, which asserts the new address literally, so it stays green.
- Open #610 (community safety) names `Bradley@Bradleytgpcoaching.com` as the safety contact. After this guard lands, #610 fails the guard on rebase unless it uses `SUPPORT_EMAIL` or adds an allowlist entry with a reason. This needs an operator or owner decision (recommended default: use `SUPPORT_EMAIL`, one inbox).

## Tests
`heavy.sh npx jest --runInBand test/support-email.guard.spec.ts test/trust-pages.spec.ts test/help-pages.spec.ts test/public-pages.spec.ts` (result in the comment below).

## Fix round
| Finding | What changed | Commit | Test that proves it |
|---|---|---|---|
| (none yet) | | | |
