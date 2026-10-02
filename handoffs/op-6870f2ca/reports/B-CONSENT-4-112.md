# B-CONSENT-4 (agent 112): report
Builder: Claude Opus 5.5, T4 lane. I did not merge, dispatch a workflow, change protection or touch production. Every push went only to the four PR branches.

## 1. backend #635: fix round 3 (operator scope addition, highest priority)
- **Head:** `9c5ae5efec13807a62bc39d40800b66e6bbeade9`, from c2688010: fix `5d1bf809`, then a merge of main f04289f9 (#607). [Fix-round comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635#issuecomment-5960866087); the PR body has the Fix round 3 table.
- **B-635-4 FIXED.** Both delete routes now cover every stage. Before any write, the error says "not changed". After a transaction failure, it says "could not confirm ... Deleting it twice is safe". A delete-all failure gets the retry copy. All return 503 `ROMAN_ERASE_INCOMPLETE`, and Sentry receives the sanitized diagnostic. Coded 404 and the verified 503 pass through unchanged.
- **B-635-5 FIXED.** The list query is now checked by the route itself in `src/roman/roman-chats.query.ts`, which returns 400 `ROMAN_SESSIONS_QUERY_INVALID` or `ROMAN_CURSOR_INVALID` with a next step. `ListSessionsQueryDto` is removed.
- **C-635-4 DEFERRED.** `AppRole` has no `sub_coach`, so this needs an app-wide auth change. I recommend a separate PR.
- **Tests:**
  - `heavy.sh env CI=false npx jest --runInBand --forceExit --runTestsByPath` on 7 Roman suites plus module-graph: 7 suites pass, 1 skipped (live). 135 tests pass, 11 skipped.
  - Failing-before proof: Sol's AUD-SOL probes (ops/aud-sol3-112) failed 3 of 3 at c2688010 and pass 3 of 3 unmodified now.
  - New spec cases: 7 inject real-service failures, 11 check coded validation.
  - eslint 0. R75 OK.
- **CI:**
  - At 5d1bf809, CI fully passed.
  - At 9c5ae5ef, `build-and-test` failed in exactly one test: `test/ci/release-evidence-gate.spec.ts:367`, which this PR does not touch. It passes locally (43/43) and on main. The same spec flaked on #629 (AUD-OPUS-111).
  - **Operator: re-run the failed job.**
- Codes for the S-ROMAN-CHATS sibling are in `ops/reports/B-CONSENT-4-to-S-ROMAN-CHATS.md` and `docs/roman-chat-deletion.md`.

## 2. mobile #326
- **Head:** `16e7e97ca2035c303a4321a60bc550a9d90d9e85`. I retargeted the base to main and merged main 2c17c241.
- **Proof:** the tree equals main plus #326's own diff (25 files, +2830/-19). The v4 pins are byte-equal with #635.
- **Tests:** 9 suites, 166 tests pass. All 4 CI checks pass and the PR is MERGEABLE. [Comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/326#issuecomment-5960968318)

## 3. mobile #315
- **Head:** `de1c79aa5904ae9600181587cd163e1259e43882`. Commit 3260719 merges main and resolves the TrustCenter conflict. Commit de1c79a changes the Roman line to "kept until you delete them or your account".
- **Tests:** 12 of 12 pass. The new test fails on the old line. CI is green. [Comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/315#issuecomment-5960973980)
- Delta audits are needed, because the earlier approvals were at d9c2e669.

## 4. backend #611
- **Head:** `fda3afadacf4d684b1579f7f818dab2af3a49dea`. It includes merges of main 3bd6215b and f04289f9, fix `fd0595b2` and docs commit `fda3afad`. [Comment](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611#issuecomment-5960937709)
- **B-611-2 FIXED.** The policy now separates three items: the closed-account record (no expiry), the provider ID kept while removal is retried, and a one-way code kept for 30 days.
- **C-611-8 FIXED.** A client in the grace period stays on the coach's roster.
- **Tests:** 5 suites, 97 tests pass. With the source change removed, 3 tests fail. R75 OK.
- **Procedures document:** `docs/privacy/vendor-deletion-and-backups.md`. It covers Supabase backups and PITR, our own dumps, restoring without bringing back deleted data, Fly, Anthropic, Stripe, Expo, Sentry, Resend, PostHog, Crisp and Mux. Items I could not confirm are marked UNVERIFIED.
- The publication hold stays until #608 is live.

## Owner/operator decisions (my recommended default)
1. Approve the changed #611 deletion wording (yes, it matches #608).
2. Fill the §9 table: Supabase plan and PITR window, Anthropic ZDR, Stripe redaction, Sentry, Resend and PostHog plans, Fly log stream, and whether Crisp and Mux are live. Do this before publishing.
3. Adopt the dump limits: delete 30 days after deploy, 90 days maximum.
4. Add Mux to the policy vendor list if it is live.
5. Mobile Sentry sends the user's email. Send only the id.
6. sub_coach chat access: open a separate auth PR, or leave it deferred.
7. Follow-up so the help page and mobile `KEPT_RECORDS` list the closed-account record.
8. The #315 policy-link failure message is generic. Make it specific in a follow-up.

## HANDOFF FOR AGENT 113 (written 13:40 PDT 2026-10-02)
I finished every assigned item. Nothing is NOT STARTED and there is no WIP branch. I removed all my worktrees (bc4-326, bc4-315, bc4-611, bc4-635, /tmp/bc4chk), unlinking their node_modules symlinks first; deps/ is untouched.

| PR | Branch | Head | CI | Findings | Next step |
|---|---|---|---|---|---|
| backend #635 | agent/clinic/ai-consent-copy-v4 | `9c5ae5efec13807a62bc39d40800b66e6bbeade9` | All green except `build-and-test`. It has one failure: `test/ci/release-evidence-gate.spec.ts:367` ("REQUIRED_ENVIRONMENT selects which environment is checked"). This PR does not touch that spec. It passes locally (43/43) and on main, the fix commit 5d1bf809 passed the full CI, and the same spec flaked on #629. CI run 37060221245 | B-635-4 and B-635-5 closed; C-635-4 deferred (sub_coach is not an AppRole) | Re-run the failed build-and-test job, then route delta audits by Opus and Sol at this head. Gates mobile builds. |
| backend #611 | agent/clinic/policies/p7q2k9xb | `fda3afadacf4d684b1579f7f818dab2af3a49dea` | All required checks pass | B-611-2 and C-611-8 closed; vendor deletion and backup procedures doc added | Route audits. The owner approves the changed deletion wording and fills the doc's section 9 UNVERIFIED table. Merge only after #608 is live (publication hold). |
| mobile #326 | agent/clinic/ai-consent-errors-mobile (base now main) | `16e7e97ca2035c303a4321a60bc550a9d90d9e85` | All 4 checks pass, MERGEABLE | Retarget and merge done; v4 pins equal #635's | Route delta audits at the new head. |
| mobile #315 | agent/clinic/policies/m3v8r1tz | `de1c79aa5904ae9600181587cd163e1259e43882` | All 4 checks pass, MERGEABLE | Merge of main and the Roman line done | Route delta audits (the earlier approvals were at d9c2e669). Ship with or after #611. |

The S-ROMAN-CHATS sibling should map the codes in `ops/reports/B-CONSENT-4-to-S-ROMAN-CHATS.md`. `ROMAN_SESSIONS_QUERY_INVALID` is new.
Open owner decisions: items 1 to 8 above.
