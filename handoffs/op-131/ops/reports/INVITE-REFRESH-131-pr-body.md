Tier: T1
Why: Bounded pending-invite UI refresh using the existing attach result, read-only coach preview and shared entitlement re-read.
T4 trigger scan: None; no auth, tenancy, consent-grant, payment-write or server contract changes.
T3 trigger scan: None; existing Attach, storage and entitlement decisions remain authoritative.
Bounded T1: YES — four assigned mobile files plus the dependent Home composition test's mock/copy update, under 400 changed lines, no dependency or lockfile changes.
Canonical builder: GPT-6.1 Sol
Parent owner: operator agent 131
Acceptance evidence: Added `src/components/__tests__/PendingInviteBanner.test.tsx`; focused failing-first proof on mobile main 868a629c received zero entitlement refresh calls after successful Attach; all 15 new cases and the 5 dependent Home composition cases pass locally through `ops/heavy.sh`, one changed file at a time ([regression change](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).
Promotion triggers: Any change to authorization, coach/tenant assignment rules, consent grant, plan activation or money writes requires regrading.

## What changes for coaches/clients
- A signed-in client who taps Attach now re-reads the shared entitlement and Home's coachless eligibility without reopening the app ([refresh change](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).
- An optional, read-only preview names a confirmed coach; absent, invalid or unavailable previews never invent a name or block Attach ([preview change](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).
- A quiet hairline section replaces the cramped inline layout, with untruncated copy, a forest Attach text action and a visible Dismiss action ([banner change](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).
- Existing attach consent, sharing-version payload, cache patch and pending-code clearing are preserved ([parity tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).

## B / U list
- B: none in this bounded slice.
- U3 (seen in a test): an ordinary signed-in client opens a coach invite and successfully taps Attach, but the shared gate and Home previously remained stale ([regression test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).

## Routes/actions before -> after
| Before | Destination / effect before | After | Destination / effect after | Proof |
|---|---|---|---|---|
| Attach | Explicit existing `/auth/attach-invite-code` with saved code and advertised sharing version | Attach | Same POST and consent; successful result also refreshes entitlement and `['coachless', 'home']` | Success, existing-policy and no-policy tests |
| Close icon, accessibility label “Dismiss invite code” | Clear pending code and hide banner | Dismiss, same accessibility label | Same clear/hide handler; disabled while Attach is busy | Dismiss test; both 44 pt actions tested |
| Foreground invite link | Saved code appears on mounted Home | Same link | Same subscription also loads the coach preview | Foreground-link test |
| Failed Attach | 4xx clears code; transient failure retains code for another Attach | Same | Same storage rules, specific refusal or an actionable fallback | Permanent, transient and fallback tests |

No routes, navigators or functional pathways were removed; only decorative icons were removed ([change set](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).

## Truthful sweep
| State | Copy / behavior | Proof |
|---|---|---|
| No saved invite | No banner or preview/attach call | Empty-state test |
| Confirmed preview | Coach name comes only from a valid, nonempty preview | Named-coach test |
| Invalid, empty or failed preview | No invented coach name; explicit Attach remains available | Preview cases |
| Successful attach | Says only that the invite attached; never promises an active plan | Success and failed-entitlement-refresh tests |
| Refused attach | Keeps a specific server refusal; otherwise gives an appropriate next action | Error cases |
| Sharing notice | Same advertised version; the confirmed coach name only changes the existing sentence's recipient | Named-coach and old-policy cases |

## Acceptance
- Failing first: the focused successful-attach case failed on unchanged mobile main 868a629c with “Expected number of calls: 1; Received number of calls: 0” ([regression test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).
- Passing: `ops/heavy.sh npx jest src/components/__tests__/PendingInviteBanner.test.tsx --runInBand --silent` — 15/15 ([regression tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).
- Passing: the changed `HomeChildCards.calm128.test.tsx` alone via `ops/heavy.sh` — 5/5, preserving the Home section/style and handler assertions ([dependent test change](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).
- Theme/readability checks cover light and dark semantic tokens, unclamped 14 pt copy, forest Attach and 44 × 44 pt minimum actions ([theme cases](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).
- `git diff --check` clean; no full local suite, typecheck or lint run (CI owns those) ([change set](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).
- Matching `src/components/README.md` updated, including the optional existing preview endpoint and refresh behavior ([module note](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/566)).
- The first CI run identified the existing Home child-card test's mock missing the new preview helper; its mock and expected invite copy are updated without changing the composition/action assertions ([initial CI](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37809651426/job/113422875398)).
- No merge, deployment, production writes or flag changes.

agent 131
