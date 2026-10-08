# SMALL-M-COPY-131 — dead switch and honest copy

## Outcome

Operator-authorized follow-up complete at 10:10 PDT: PR #563 is READY at `161fcbeb226a5cd39f501bacd3ff3d3b02ef341c`, all four CI checks passed, and GitHub reports MERGEABLE / CLEAN; seven U findings resolved (six initial plus review U1), zero outstanding B/U findings. ([Round-2 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6065116691), [CI verification](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37813421132/job/113435814062))

Historical round 1 completed at 09:28 PDT at `3c10e1165cddf4700edcd6d9f4ae3af4b1604918`, with six initial fixes; the later Opus U1 is addressed by the authorized follow-up above. ([Original READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6064395747), [Opus U1](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6064837514))

## Grading

Tier: T2  
Why: Remove a nonfunctional preference and correct bounded client copy and error alerts within existing screens.  
T4 trigger scan: none; no auth, tenancy, payment, credential, backend or destructive-data behavior changes.  
T3 trigger scan: none; existing API contracts and screen ownership stay unchanged.  
Bounded T1: NO; tracing notification consumers requires product-level engineering judgment.  
Canonical builder: GPT-6.1 Sol  
Parent owner: operator agent 131  
Acceptance evidence: failing-first rendered tests for the removed switch, shortcut naming/description and three failure alerts; retained routes, saved preferences and digest field mapping.  
Promotion triggers: any new notification sender, shared error contract or T4 boundary.

## Scope traced

- Original mobile base was `868a629c00e55584c5e648f5471410884cf3774c`; work is restricted to the assigned category, Profile, Shortcuts and fasting copy. ([Notification preferences at the base](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/868a629c00e55584c5e648f5471410884cf3774c/src/screens/settings/NotificationPreferencesScreen.tsx))
- Backend trace used `652b07a856fd807462da244c80f529eef39123c9`; `eat_enabled` is defined/defaulted/saved but no backend sender consumes it, so remove the client_bot row without deleting saved values. ([Preference persistence](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/652b07a856fd807462da244c80f529eef39123c9/src/notifications/notifications.service.ts))
- Keep Settings' Summary emails wording: the existing client weekly digest builds check-in/workout/weight summaries, sends the client template, and filters recipients by `digest_email`; the client daily digest is separately opt-in on the server. ([Digest service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/652b07a856fd807462da244c80f529eef39123c9/src/notifications/digest.service.ts), [Scheduled digest trigger](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/652b07a856fd807462da244c80f529eef39123c9/src/notifications/digest.scheduler.ts))

## B list

None identified in the assigned scope.

## U list

Six assigned U findings and the later review U1 are fixed in the PR; their regressions were seen in failing-first tests. ([Mobile PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563), [Round-2 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6065116691))

- U1 — dead Reminders switch; a client can save an eat_enabled choice that affects no notification sender. ([Notification preferences](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/868a629c00e55584c5e648f5471410884cf3774c/src/screens/settings/NotificationPreferencesScreen.tsx))
- U2 — Profile calls the existing Shortcuts screen Widgets and implies customization that does not exist. ([Profile](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/868a629c00e55584c5e648f5471410884cf3774c/src/screens/client/ProfileScreen.tsx), [Shortcuts](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/868a629c00e55584c5e648f5471410884cf3774c/src/screens/client/WidgetsScreen.tsx))
- U3 — Quick log claims access from anywhere instead of naming its actual food-log action. ([Shortcuts](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/868a629c00e55584c5e648f5471410884cf3774c/src/screens/client/WidgetsScreen.tsx))
- U4–U6 — Fasting Start, Fasting End and Shortcuts Start can display raw error text rather than a fixed action-specific instruction. ([Fasting](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/868a629c00e55584c5e648f5471410884cf3774c/src/screens/client/FastingScreen.tsx), [Shortcuts](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/868a629c00e55584c5e648f5471410884cf3774c/src/screens/client/WidgetsScreen.tsx))
- Review U1 (seventh resolved U) — a client whose fast is already running gets a correct Open Fasting instruction for HTTP 400/409 rather than being told to retry the connection; both cases are restored and proven in tests. ([Opus finding](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6064837514), [Updated handler](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/WidgetsScreen.tsx), [Restored tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/__tests__/WidgetsScreen.test.tsx))

## C one-liners

None pursued.

## PRs

### Operator-authorized follow-up

- Pushed head: `161fcbeb226a5cd39f501bacd3ff3d3b02ef341c`; 170 changed lines (134 additions / 36 deletions). Normal main merge `b2fbe098c4bb28b70fa870099bc098b66f750346` brought in `726f90baf1bb946aef9564c250e6ebaf935a073d`, with only the requested README conflict resolution. ([Combined README](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/README.md))
- Review U1 implemented in a separate commit: HTTP 400/409 now identifies the running fast; every other failure retains the connection line, via existing `errorStatus`. ([Shortcuts fix](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/WidgetsScreen.tsx))
- Both running-fast regressions failed first at the merge-only head; the four updated HTTP 400/409/500/offline cases pass after the fix. ([Restored Shortcuts tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/__tests__/WidgetsScreen.test.tsx))
- Both commits pushed together once at 10:02 PDT; the existing PR body is updated. At 10:10 PDT the exact new head was confirmed MERGEABLE / CLEAN and all four checks SUCCESS, immediately before posting FIX ROUND 2 READY. ([CI job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37813421132/job/113435814062), [CodeQL job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37813421195/job/113435808322), [Round-2 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6065116691))
- Both follow-up commits have author and committer Bradley Gleave <bradley@bradleytgpcoaching.com>, with no co-author trailer; there is still only one PR. ([Mobile PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563))

### Round 1 (historical)

- PR: [growth-project-mobile #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563).
- Head: `3c10e1165cddf4700edcd6d9f4ae3af4b1604918`; 141 changed lines (106 additions / 35 deletions), 13 files; author and committer both Bradley Gleave <bradley@bradleytgpcoaching.com>, no co-author trailer. ([Mobile PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563))
- CI at the exact head: all four checks SUCCESS — Typecheck, lint, test; Analyze (actions); Analyze (javascript-typescript); CodeQL. Verified 09:28 PDT immediately before READY. ([CI job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807956046/job/113417082986), [CodeQL TypeScript job](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37807956243/job/113417084711), [Mobile PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563))
- GitHub: OPEN, non-draft, MERGEABLE / CLEAN; refreshed `origin/main` remains `868a629c00e55584c5e648f5471410884cf3774c`, so no merge-main commit was needed. ([Mobile PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563))
- READY posted once using the required opening first line; independent verdicts are left to the operator's launched lenses, not awaited by this builder. ([READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6064395747))

## Tests

Eight failing-first assertions failed against unchanged source at mobile base `868a629c`: category (3), Profile (1), Shortcuts (2), Fasting (2); after the fixes, eleven targeted tests pass across six changed files. ([Category regression coverage](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/settings/__tests__/PreferenceScreens.calm.test.tsx), [Profile regression coverage](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/__tests__/ProfileScreen.savedValues.test.tsx), [Shortcuts regression coverage](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/__tests__/WidgetsScreen.test.tsx), [Fasting regression coverage](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/3c10e1165cddf4700edcd6d9f4ae3af4b1604918/src/screens/client/__tests__/FastingScreen.remove.test.tsx))

Logs: `/home/user/workspace/ops/reports/SMALL-M-COPY-131-*-failing-first.log` and `SMALL-M-COPY-131-*-green.log`.

CI/head snapshot: `/home/user/workspace/ops/reports/SMALL-M-COPY-131-ci-status.json`. PR body, READY payload and creation/post receipts are retained alongside this report.

Follow-up logs: `SMALL-M-COPY-131-round2-Widgets-failing-first.log`, `SMALL-M-COPY-131-round2-Widgets-green.log`, and `SMALL-M-COPY-131-round2-push.log` in the same report directory.

## Not fixed (needs operator)

None; the requested conflict resolution and review U1 are complete, with no owner decision needed. ([Round-2 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6065116691))

## HANDOFF

The same job's authorized short follow-up is complete and READY; no new PR or second job was opened. ([Round-2 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6065116691))

- Audit target: [growth-project-mobile #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563) at `161fcbeb226a5cd39f501bacd3ff3d3b02ef341c`, 170 changed lines (134 additions / 36 deletions), four green checks, MERGEABLE / CLEAN. ([Round-2 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6065116691))
- Branch/worktree: `agent131/small-m-copy-131`, `/home/user/workspace/wt/SMALL-M-COPY-131-mobile`; normal merge and bounded U1 fix committed and pushed together once, with no remaining source edits. ([Mobile PR #563](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563))
- Fresh review target is the head above; round-1 approvals are historical because the requested follow-up changes runtime copy. The builder does not wait for new verdicts. ([Round-2 READY](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/563#issuecomment-6065116691))
- Evidence: two restored running-fast tests failed first, then the four updated HTTP 400/409/500/offline cases passed locally; full CI passed at the new head. ([Restored tests](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/161fcbeb226a5cd39f501bacd3ff3d3b02ef341c/src/screens/client/__tests__/WidgetsScreen.test.tsx), [CI verification](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37813421132/job/113435814062))
- CI/head snapshot and READY receipt: `SMALL-M-COPY-131-round2-ci-status.json`, `SMALL-M-COPY-131-round2-ready-posted.log` in the report directory.
- Notify counts mean B=0 and seven resolved U findings; outstanding B/U = 0/0.
- No PR merge, deployment, flag change, production write, dependency change, stash, rebase or force-push performed.
- Builder ends now.
