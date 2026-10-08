# DES-AW-127 — role choice and invite

## Scope traced
- Read the complete agent-128 common brief, the final DES-AW-127 entry, SoT A1/A2 owner overrides/A6, design (c)/(e), target catalog, design-guide sections, and mobile doctrine.
- Own worktree: `/home/user/workspace/wt/DES-AW-127-mobile`; branch `agent128/des-aw-127`.
- Scope is the three assigned screens, their tests, and only their key-file entries in the auth README. Acceptance, pairing, role, consent, storage and navigation logic stay frozen.
- Current RoleSelection has no role-choice controls: it confirms the server's client role. Coach/client choice lives in CreateAccount, owned by another job; no role selection will be invented here.
- Routes/actions traced: invite entry/preview/paste; Continue, Connect to my coach, Finish sign-up, Keep my current coach, Continue without a coach for now, notice acknowledgement and both support links; accepted invite Continue to app/Sign in/Create account, failure Welcome and network retry; email Continue/Sign in/Contact support.

## B list
- B1: Opening a valid invite tells an ordinary user they are linked to a coach even though the public acceptance endpoint only validates the invite. Fix with neutral, resolved-invite copy; never assert a coach relationship.
- B2 (frozen logic, operator): A signed-in user opens a valid invite and Continue goes to Welcome without attaching the invite or forwarding its code. No pairing/auth change in this visual-only job.

## U list
- Already-used invite labels its Welcome navigation “Go to sign in”; relabel to “Back to welcome” without altering the handler.
- Cream-filled form/notices, boxed secondary actions, undersized helper text, uppercase primary buttons and filled success icons need the calm, theme-driven visual pass.

## C one-liners
- None.

## PRs
- [Mobile PR #502](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/502), initial head `6b106265dc4d3c73de075e9abfb62d7478205bfb`, 301 changed lines (223 additions / 78 deletions), six files. First [CI job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37689157480/job/113024592883) failed on two test navigation type assertions; production sources typecheck through this point. Fix changes only the test state getter to a Jest mock with its same return value. No forbidden casts.
- CodeQL green at initial head; no lens verdicts yet.
- `origin/main` merged before initial push, then updated to `f240af37f38d775ad4b47794e8978c8f31ad8dce` with a clean merge. Auth README untouched by those main changes; no conflict.
- Current pushed head `0bc90070932a995770056bdf44b3fcbc30b61f85`; still 301 changed lines. Test-only typing fix passes the 11-test targeted file; new CI pending. Fresh merge check after the fix reports “Already up to date”.
- Second [CI job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37689565548/job/113025965450) still rejected the full mock object cast: native navigation methods lack Jest's `.mock` members and the partial object lacks full navigator methods. Correct fix: structurally validate a typed `Partial<navigation>` stub before the test render assertion; no `any`, `unknown` or `never` casts. A small isolated navigation typing proof (no screens/project graph) is saved as `DES-AW-127-nav-type-proof.ts`.
- Isolated navigation-type proof now passes under heavy.sh; no full local project typecheck. New invite/verified test remains 11/11 green.
- Latest pushed head `33c493c212b2fdcc98ea6f6ee2ddae0ed929140c`, 303 changed lines (225 additions / 78 deletions), six assigned files. Clean merge of latest main; no auth README conflicts. CI pending.
- Latest-head [CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37690235868/job/113028236062): lint and typecheck now passed; full test step in progress. Both CodeQL analyses and CodeQL check are green.
- FINAL: head `33c493c212b2fdcc98ea6f6ee2ddae0ed929140c`, 303 changed lines (225 additions / 78 deletions). Exact-head CI fully green, including full tests and all CodeQL checks. Opus/Sol verdicts pending; no verdict wait under the override.
- Immediately before READY, fetched and merged `origin/main` (`4185b9b2cb4e415234dc526af0f0da97d2dd8ef4`): “Already up to date”; clean worktree, no conflict, clean diff check.
- [READY comment posted](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/502#issuecomment-6047436615) at 2026-10-07 14:42:53 PDT. PR body includes tier header, truthful sweep, all routes/actions before → after and acceptance evidence.
- Failing-first: new invite/verified test against unmodified baseline `c00a2a5f` failed 7/11 tests (attachment claims, incorrect used-link label, radius/tap size and uppercase buttons). Log: `ops/reports/DES-AW-127-baseline.log`.
- Local targeted runs (each through heavy.sh, one file at a time): invite/verified 11, role retry 19, role contract 15, existing acceptance 9, email-link routing 9, voice guard 8, doctrine 30; all 101 passed. Final affected-file reruns green.
- A proposed additional never-resolving preview test was removed: awaiting the real blur callback intentionally awaits the mocked unresolved promise and times out; no production behavior or test-timeout change was made.
- No functional handler, request payload, authorization, storage or route destination edits.
- TypeScript AST extraction compared ten original handler declarations with the edited screens: all byte-identical (`accept`, invite navigation callbacks, `previewCode`, `persistRole`, `finishAfterAttach`, both completion handlers, signup-underneath detector).

## Truthful sweep
- AcceptInvite baseline lines 147/197-203: “Accepting your invite…”, “You're in”, and “You've been linked to …/your coach.” imply acceptance/attachment. The public endpoint only validates. Replacement: “Checking your invite…”, “Invite ready”, “This invite is ready to use.” plus the returned coach name when present.
- AcceptInvite baseline line 275: “Go to sign in” actually calls the Welcome handler. Replacement: “Back to welcome”.
- RoleSelection: “You will be paired with …” remains only after `invitePreview.valid`; prefer the real coach name when returned, in serif. Required/codeless, retry, acknowledgement, attachment-confirmed, error and sharing-notice sentences remain unchanged.
- EmailVerified: all existing state-driven copy remains unchanged, including the quoted signup-control label “I verified my email”; this is an instruction referencing a real button, not a first-person institutional statement.

## Not fixed (needs operator)
- `src/screens/auth/AcceptInviteScreen.tsx:126-131` (current baseline): signed-in Continue discards the invite. `backend src/invite-codes/invite-codes.service.ts:1400-1505` validates only. Recommended default: route a separate T4-capable builder to the existing explicit join/sharing flow with the code preserved; do not automatically attach a coach in this visual PR.

## HANDOFF
- COMPLETE: [PR #502](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/502) READY at `33c493c212b2fdcc98ea6f6ee2ddae0ed929140c`; CI green, conflict-free. Operator owns lens routing and any merge. No merge, deploy, production action or second job was performed.
- B1 fixed, B2 frozen/escalated; U1/U2 fixed. Operator recommendation: a separate T4-capable assignment preserves the accepted code into the existing explicit joining/sharing flow for signed-in users. This visual PR must not silently attach or change a coach.
- Files saved: this report; `DES-AW-127-pr-body.md`; `DES-AW-127-ready-comment.md`; baseline log and original source patch; second CI log; isolated nav typing proof. Worktree `/home/user/workspace/wt/DES-AW-127-mobile`.
- Notify written; finishing immediately per the owner override, without waiting for lens verdicts.
