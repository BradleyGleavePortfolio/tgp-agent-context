# B-MOB-A (agent 115) — mobile #326 -> #315 -> copy sweep #339 -> #331, plus backend #611 (added 11:25)

Stopped under PAUSE (owner 11:25 PDT). The one PR in flight at the PAUSE was backend #611, which is finished: pushed, green, FIX ROUND 7 READY FOR AUDIT. Nothing else was started.

## Status at the PAUSE (11:40 PDT)

| PR | Head | Checks | Verdicts at head | State | Next step |
|---|---|---|---|---|---|
| mobile#326 | 7c5626ed | 3/3 green | Opus APPROVE, Sol APPROVE | **MERGED** (main 47124a4d) | none |
| mobile#315 | 8fff3f8f3829aab4079973b38428e2d266bc3f3b | 3/3 green | Opus APPROVE, Sol APPROVE | done; BEHIND main again (merge-only) | Operator: update-branch, then merge together with backend #611 (publication pair) |
| backend#611 | 5eac8f21bb70460da7dea7be5ce9f84f40870afb | all green (15 pass, 1 skipping) | none yet; FIX ROUND 7 READY FOR AUDIT posted | BEHIND main (merge-only) | Lenses: audit O-611-1..6. Operator: update-branch; merge with #315 once both are dual APPROVE |
| mobile#339 | 8165ca9560d2bcd35f92b1cd8468e6c998aa552a | 3/3 green | Sol REQUEST CHANGES (B-339-1); Opus none | open, BEHIND | Next builder: fix B-339-1 (below) with a failing-before test |
| mobile#331 | 5b58a1218acb1f5ba15cada8b8eaf8b78c75a058 (pushed) + local cd37225 (NOT pushed) | 3/3 green at 5b58a121 | Sol BLOCK (A-331-7 r2) and Opus RC (B-331-9) at c621770f; none at 5b58a121 | open, BEHIND, waiting (PAUSE) | Next builder: push cd37225, run the before-proof, post FIX ROUND 3 (below) |

## backend#611 — FIX ROUND 7 (owner answers O-611-1..6)
- Start head: 1af96efa (dual APPROVE), BEHIND. Merged main as d280d73e (clean auto-merge). Fix commit: 5eac8f21.
- Items:
  - O-611-1: new first paragraph in "Deleting your account": information is kept while the account is open; deletion can be started in the app or by email. The approved paragraph is byte-identical.
  - O-611-2: the Anthropic 30-day sentence, in the Privacy retention list and in the consumer-health Deletion section.
  - O-611-3: Mux named in both provider lists, with what it receives (`createDirectUpload` sends no metadata).
  - O-611-4: plan-agnostic backups (six-month limit; pre-update copies deleted 30 days after verify, never kept beyond 90 days) on /privacy, /consumer-health-privacy and /help/delete-account. "Rolling schedule" wording removed; no Supabase plan claim.
  - O-611-5: Stripe redaction tools; Sentry 90 days; Resend 30 days; PostHog recording off and a deleted person removed within 30 days.
  - O-611-6: de-identified data (RCW 19.373.010) and health-data use (Apple 5.1.3), on both policies.
- Procedures doc updated: §1, §1.1, §3, §4, §6, §7, §8, §9, §10. Also the README vendor rule and POLICY_LAST_REVIEWED, now 2026-10-03.
- Tests: new spec test/privacy-owner-answers.spec.ts (7 tests). Three existing backup pins moved to the new wording.
  - Failing-before: https://github.com/BradleyGleavePortfolio/growth-project-backend/actions/runs/37144067930 — red, 6 failed / 1 passed (the voice-constant check passes in both).
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611#issuecomment-5972222465. PR body has a Fix round 7 table.

## mobile#326 — MERGED
- 764c2eb5: pure main merge. 7c5626ed: seam test sentry.referenceTag.seam.test.ts.
- Before-runs: 37140649836 and 37140651300 (both red).
- FIX ROUND 4: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/326#issuecomment-5971714424. Dual APPROVE, then merged.

## mobile#315 — dual APPROVE at 8fff3f8f
- be1ebba5: pure merge. a4d344df: captureErrorWithoutPii sets the `reference` tag, plus a seam test. Before-run 37140652545 (red).
- FIX ROUND 5 at a4d344df: dual APPROVE.
- 8fff3f8f: pure merge of main 47124a4d (#326). Tree 4404649b equals `git merge-tree` output. FIX ROUND 6: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/315#issuecomment-5971968229. Dual APPROVE at 8fff3f8f.

## mobile#339 — copy sweep + repo-wide voice guard (OR-115-4)
- f0958f16: 87 copy files plus src/__tests__/copyVoice.guard.test.ts. Guard failing-before on main: run 37141142501 (copyVoice.guard 2 failed; all else passed).
- 20d47950: escaped the apostrophe in DeleteAccountScreen.tsx:79. 275d1b50: main merge (#326, clean).
- 8165ca95: repinned 20 copy assertions; the Roman celebration test now asserts no "!". 3/3 green.
- FIX ROUND 1: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/339#issuecomment-5972032809
- **Open: Sol B-339-1 (B).** Some rewrites assert outcomes that are not known:
  - communityEventsApi.ts:235-238: a 500 is reported as "nothing was changed".
  - authErrorMessage.ts:156,224 and authFailure.ts:98-117: an unknown signup result is reported as "Your account was not created".
  - ChallengeProgressSheet.tsx:205-213 and ReportMessageSheet.tsx:53-57: catch-alls say "not saved" / "not sent".
  - Fix: reword those sites so they do not claim a server outcome (e.g. "could not be confirmed"; "check X, then try again"), keep them impersonal, and add failing-before tests. Full text: ops/aud-115/B-MOB-A/pr339_sol_r1.md.
- Operator decision: the hashed P0 consent strings stay ALLOWED until the next consent version bump (mobile + backend #607).

## mobile#331 — Roman conversations (WAITING under PAUSE)
- Round 2 at c621770f (FIX ROUND 2: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/331#issuecomment-5971975848). Added src/services/sessionFence.ts. Failing-before 37141908923: 7 failed / 4 passed.
  - Closed per both lenses: B-331-7 (first interleavings), B-331-8, C-331-8.
- Open at c621770f: Sol A-331-7 round 2 (BLOCK) and Opus B-331-9 (RC). Same defect: a late 401 from the old generation starts a refresh while a sign-in or sign-out write is still in flight, which leaves a mixed token pair or brings back the old session.
- **Pushed 5b58a121** (no FIX ROUND comment yet; 3/3 green). Changes:
  - Session writers hold the fence for the whole native write and move the generation at call time and again when the write lands.
  - `sessionWritesSettled()` runs before token reads and before a refresh starts.
  - A 401 for an old-generation request never starts or joins a refresh: an unbound request gets its original 401; a bound one gets AccountChangedError.
  - The refresh-failure sign-out holds the fence as kind 'signout' and ends the session when it releases.
  - New tests: Sol's held-401 + in-flight B refresh-token write, and a request during the landing write.
  - Failing-before (c621770f + spec): https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37143771302 — exactly the 2 new tests fail, 9 pass.
- **Local only, NOT pushed: cd37225** on branch agent/clinic/roman-chats-mobile in repos/growth-project-mobile. Patch copy: ops/aud-115/B-MOB-A/331-round3-wip.patch.
  - The legacy AsyncStorage->SecureStore migration of a session key now runs under the fence and never overwrites a newer value (Opus fix step 1).
  - Two more tests: Opus's access-write-in-flight case, and Opus P2 (sign-out removal in flight). 13/13 pass locally.
- Next builder:
  1. Push cd37225 and merge main.
  2. Run the one-job lane on c621770f + the spec (`ci_lane.sh mobile <wt> ci/<LANE>-331-r3-before src/services/__tests__/sessionFence.refresh.test.ts`). Expect the 4 new tests red.
  3. Post FIX ROUND 3 mapping Sol A-331-7 r2 and Opus B-331-9, then READY FOR AUDIT when green, and update the PR body.

## CI / cleanup
- ci/* branches deleted after use. The run URLs stay valid.
- Superseded full ci.yml run 37141886560 was cancelled.
- Worktrees B-MOB-A-1..4, 331b, 331c, 611 and 611b removed. No uncommitted work was lost: #331's extra commit is in the local branch and in the patch file.

## Operator decisions needed
1. Merge #315 and backend #611 together, after #611 is dual APPROVE. Both are BEHIND main (merge-only).
2. Reword the hashed P0 consent at the next consent version bump; then delete the 3 ALLOWED guard entries (#339).
3. Assign the resume of #331 (push cd37225, then FIX ROUND 3) and of #339 (B-339-1) after the pause.

## HANDOFF
- Finished: #326 (merged) and #315 (dual APPROVE at 8fff3f8f). #611 is READY FOR AUDIT at 5eac8f21, green, with before-run 37144067930.
- Open:
  - #339: Sol RC B-339-1 at 8165ca95. Copy must not claim server outcomes it cannot know.
  - #331: Sol BLOCK / Opus RC at c621770f. The fix is pushed at 5b58a121; local cd37225 is still to push; FIX ROUND 3 is not posted yet.
- Notes and lens texts: ops/aud-115/B-MOB-A/ (pr331_sol_r2.md, pr331_opus_r2.md, pr339_sol_r1.md, fr*_*.md, 331-round3-wip.patch).
