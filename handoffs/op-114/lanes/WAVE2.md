# Agent 114 wave 2 (owner "SCALE", 2026-10-02 18:58 PDT) — builder protocol + per-lane scope
Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (Governing rules, Sandbox limits, Git and GitHub, PR body contract, Reports,
Final answer), /home/user/workspace/ops/_BUILD_COMMON.md, /home/user/workspace/ops/lanes114/_COMMON_114.md (wins on conflict).
Then ONLY your lane's section below. Report: /home/user/workspace/ops/reports/<LANE>-114.md ending with "## HANDOFF".

## Builder protocol (every wave-2 lane)
1. You are the only writer on your PRs. Never touch another PR. Work in /home/user/workspace/wt/<LANE>-<n>; link deps with
   /home/user/workspace/ops/link_deps.sh; targeted jest only via /home/user/workspace/ops/heavy.sh --runInBand; GitHub CI runs the rest.
2. Read EVERY AUDIT and FIX ROUND comment on your PRs. List every open finding (A/B/C) from BOTH lenses at their latest verdict heads.
   If a later push already claims fixes but has no FIX ROUND comment, verify each claim in code + tests before relying on it.
3. Close every A and B finding (and every cheap C) with code + a test that fails before and passes after. Do it right once: the next
   audit must be APPROVE from both lenses. More functionality, never less. Pristine, specific copy; no generic errors.
4. Merge origin/main (merge commit, never force-push). Backend main is 12e1b03b; mobile main is 1f8981dd (#314 merged).
   Backend: the required "npm audit" check fails repo-wide on GHSA-vfj7-8cjw-p6xm (operator ruling OR-114-2, fixed on main by a separate
   PR) — ignore it, never touch the lockfile or the audit workflow for it. Every OTHER required check must be green at your head.
5. Pairs (OR-112-13) are fixed together by the same lane so one audit round closes both halves.
6. Post one comment per PR: "FIX ROUND <k> (<LANE>, agent 114) — <repo>#<n> @ <full sha>" with a finding -> change -> commit -> test table,
   update the PR body Fix round table + tier header, and end with "READY FOR AUDIT" once CI is green.
7. Final answer (<300 words): PRs, heads, findings closed, checks, operator decisions needed.

## B-TRIALS-2 — backend #656 (real free trials on recurring packages; T4; pairs with #654 + mobile #334)
#656 @16c65ffe, never audited, CI red (build-and-test, CodeQL). Owner 16:34: real free trials — coach sets days, card up front, one
trial per client per coach, trial-ending notice. #654 (lane B-RECUR-BE) reads CoachPackage.trial_days defensively and owns Stripe
subscription creation; #656 owns the package field, validation, coach API, one-trial rule data, trial-ending notice. Read #654's body
(gh pr view 654 -R BradleyGleavePortfolio/growth-project-backend) and make #656 compose with it in either merge order; state the order
in the body. Fix CI and CodeQL for real (no dismissals). Coach-side mobile input for trial days: check whether any mobile PR has it
(rg in growth-project-mobile and open PRs); if none, open ONE small mobile PR (T3+, your lane owns it) adding the trial-days input to the
package editor with server validation messages; do not edit #321 or #334.

## S-DUNNING-R6 — backend #628 + mobile #322 (dunning v2 lockout + native card update; T4)
#628 @8bd6fcaf (CI red: build-and-test), #322 @2d808dc6 (CI red: Typecheck, lint, test). Latest verdicts: Opus APPROVE at 739e9a54 /
0b4813dc, Sol REQUEST CHANGES at 739e9a54 / 0b4813dc (19:46-19:47Z). Round 5 (lane S-DUNNING-R5, agent 113) was pushed but the lane
died before CI/comment. Finish round 5 properly: close Sol's findings, fix CI, compose with #654's subscription lifecycle
(invoice.payment_failed on a never-entitled attempt is NOT dunning; renewal failures are) and with the native card-update screen.

## S-COACH-BE-4 — backend #641 (coach Money read model, truthful Connect status, idempotent package create; T4)
#641 @ef08c3fd, CI green. Both lenses REQUEST CHANGES at bb17e19a (23:38Z Opus, 23:42Z Sol). ef08c3fd was pushed afterwards by S-COACH-3
(agent 113) with no FIX ROUND comment. Verify every finding is closed (incl. B-641-5 idempotent create, OR-112-16/OR-113-6), fix what
is not, merge main, post the FIX ROUND comment. Do not edit mobile #329/#332 (lane S-COACH-MOB-4 owns them; tell the operator in your
report about any API change they must follow).

## S-COACH-MOB-4 — mobile #329 (coach setup wizard, Stripe Express onboarding; T4) + #332 (Money page, stacked on #329's branch)
#329 @e8ea0806 CI red; both lenses BLOCK at 83ee0e46. #332 @61eea115 (base agent/clinic/s-coach-wizard) both REQUEST CHANGES. OR-112-9:
#332 is audited on its own, merged into #329's branch when dual-APPROVED, then a #329 delta closes A-329-1. Close every finding on both,
fix CI, follow backend #641's current contract (read its head; lane S-COACH-BE-4 may change it — re-check before you finish).
Idempotent package create: retry with the same Idempotency-Key.

## S-MWB-4 — backend #640 (Programs library API, bulk assign, program-as-package) + mobile #328 (Programs tab); T4
#640 @b9d00d56 CI green; #328 @4810a3f4 CI red. Both lenses REQUEST CHANGES at 213a186d / 67f9ef4f (23:26-23:32Z). Confirm round
b9d00d56 closes all #640 findings (post the FIX ROUND comment if missing), finish #328 (CI + findings). OR-112-18: the autosave
owner/visibility check (sub-coaches can edit any plan in the tenant) is required before launch — include it here if small, else open
one follow-up PR in your lane. Manifest flips are the operator's, not yours.

## B-NOTIF-5 — backend #647 (booking times in recipient zone, one inbox row) + #648 (device push via Expo; T4)
#647 @e4418a8b CI red (Banned cast tokens), #648 @81c52a12 BEHIND. Both lenses REQUEST CHANGES at 3a93fbde / 81c52a12. Close all
findings; OR-113-5 quiet hours 21:00-08:00 in the recipient's zone (defer non-urgent, urgent bypass) enforced before launch; carry the
corrected #647 into #648; no Android delivery claim without the FCM V1 key (degrade cleanly, iOS works).

## B-UGC-8 — backend #652 (community follow-ups: atomic author voice delete, server-only coach lookup, ...; T4)
#652 @dcb5ad63 CI red (build-and-test), never audited. OR-112-6: #610's C findings ("Bucket not found" counted as deleted, placeholder
stall, crash window, open coach-lookup grant, retry count) must all be closed here. Fix CI, verify each item with a test.

## B-JOURNEY-5 — backend #609 (C05 coach welcome at completion + 13 ...) + mobile #312 (workout reminders toggle); T4
#609 @7ec1adb1, #312 @537547bb, both CI green; both lenses REQUEST CHANGES at 40616dcf / 90e78abe. Later pushes have no FIX ROUND
comment. Verify every finding closed, finish what is not, merge main, post FIX ROUND comments. NEVER commit the coach welcome text
(runtime config only) and never name the clinic partner.
