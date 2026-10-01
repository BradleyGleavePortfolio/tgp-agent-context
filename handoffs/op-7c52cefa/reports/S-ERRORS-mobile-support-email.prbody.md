# One support email in the app (S-ERRORS slice 1, mobile)

Owner ruling 2026-10-01 14:19 PDT: the support email is `Bradleyapple1031@gmail.com`, one address everywhere.

## Tier header
- **Tier:** T2
- **Why:** customer-visible support path (Support screen email action and text, the "Request access" link on Create account). No auth logic, consent, data or network contract change.
- **T4 trigger scan:** none. No auth or session logic, RLS, PII handling, payments, credentials, `.github/workflows/*` or CI gate files. The CreateAccountScreen edit only changes the target of an existing `mailto:` link.
- **T3 trigger scan:** the lane says T3 if auth or consent surfaces change. This PR changes only a mailto target on CreateAccountScreen, with no auth flow, state or copy change, so it stays T2. Any later auth-copy change re-grades it to T3.
- **Bounded T1:** n/a.
- **Builder-owner:** S-ERRORS builder (Claude Opus 5.5) for operator agent 109.
- **Acceptance evidence:** targeted jest and tsc below; CI at head.
- **Promotion triggers:** an auth-flow or consent change; the app-wide error mapper (next S-ERRORS slice) ships in its own PR.

## What changed
- New `src/constants/support.ts`: `SUPPORT_EMAIL = 'Bradleyapple1031@gmail.com'` and `supportMailto(subject?)`.
- `SupportInboxScreen.tsx`: drops its local `SUPPORT_EMAIL = 'hello@thegrowthproject.app'` (from #306) and uses the constant for the text and the Email action.
- `CreateAccountScreen.tsx`: the "Request access" mailto (was `hello@thegrowthproject.app`) uses `supportMailto('Request access to The Growth Project')`. The subject line is unchanged.
- Every "Contact support" button on Login, Create account and Role selection already goes to `SupportInbox`, so it now reaches the one address. WelcomeScreen has had no mailto since #306 (it shows the optional-code note), so it needed no change.
- `SupportInboxUnavailable.test.tsx`: asserts the new mailto and that the address is shown in words.
- New guard `src/constants/__tests__/supportEmail.guard.test.ts`.

## Guard
Fails the build if any email address other than `SUPPORT_EMAIL` appears in shipped source (`src/` outside tests, plus app.json/eas.json), unless the domain is reserved (RFC 2606/6761) or the address is allowlisted with a reason. The allowlist holds email-field placeholder text and the store-screenshot demo account. The guard also fails on any retired address (`hello@thegrowthproject.app`, `hello@trygrowthproject.com`, `Bradley@Bradleytgpcoaching.com`), on any `mailto:` whose target is not `SUPPORT_EMAIL`, and on stale allowlist entries, and it has a negative control.

## Coordination
- Open #314 (community safety) adds `COMMUNITY_SUPPORT_EMAIL = 'Bradley@Bradleytgpcoaching.com'` in `src/api/communityErrors.ts`. After this lands, #314 fails this guard on rebase unless it imports `SUPPORT_EMAIL` from `src/constants/support`, or adds an allowlist entry with a reason if the owner keeps a separate safety contact. Operator or owner decision; recommended default: `SUPPORT_EMAIL`, one inbox.
- The app-wide error mapper (next S-ERRORS slice, not in this PR) imports `SUPPORT_EMAIL` from here, and so can #314's `communityErrors.ts`.

## Tests
`heavy.sh npx jest --runInBand src/constants/__tests__/supportEmail.guard.test.ts src/screens/support/__tests__/SupportInboxUnavailable.test.tsx src/screens/auth/__tests__/CreateAccountScreen.test.tsx`; `heavy.sh npx tsc --noEmit -p tsconfig.json` (results in the comment below).

## Fix round
| Finding | What changed | Commit | Test that proves it |
|---|---|---|---|
| (none yet) | | | |
