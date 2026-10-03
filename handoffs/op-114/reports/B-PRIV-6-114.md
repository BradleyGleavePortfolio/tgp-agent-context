# B-PRIV-6 (agent 114) — backend #611 fix round 6

Head 1af96efa0ac3bcfc67b4685d96c71b779c1df365 (branch agent/clinic/policies/p7q2k9xb). Prior head fda3afad.
- f9cc9107: pure merge of origin/main 53b6d472 (tree db272622 = merge-tree).
- 1af96efa: docs(privacy) split restore runbook -> T4 follow-up issue #662 (B-611-5, B-611-6) + Sentry §6 to mobile #330 (C-611-9).
- Follow-up issue: https://github.com/BradleyGleavePortfolio/growth-project-backend/issues/662 (T4, carries Sol's counterexample, design rules, required tests, interim rule).
- PR body: tier header now T4 (privacy/deletion guarantees named; vendor doc out of Bounded T1); ship-order bullet updated; Fix round 6 table; Owner questions section.

## Dispositions
- B-611-5: CLOSED by split (OR-114-1). Doc §1.2 holds only the requirement + pointer; no SQL/steps/replay.
- B-611-6: CLOSED: tier T4 in header; restore slice split to #662.
- Policy truth: public pages promise no restore; backup six-month wording unchanged and true given Supabase 7-30 day windows + proposed 90-day dump cap (owner Q4). deploy-runbook already states no demonstrated restore / forward-only recovery. Split is adequate; procedure correction not needed.
- Opus C-611-9: CLOSED (mobile #330 merged; §6 id only).
- B-611-1: operator publication hold, unchanged.

## Tests
- Fail-before: heavy.sh npx jest --runInBand --ci test/privacy-restore-split.spec.ts with doc/README from fda3afad -> 3 failed, 1 passed.
- After: heavy.sh npx jest --runInBand --ci test/privacy-restore-split.spec.ts test/trust-pages.spec.ts test/help-delete-account.spec.ts test/help-pages.spec.ts test/public-pages.spec.ts -> 5 suites, 94 passed. eslint clean on new spec.

## Open risks / operator decisions
- REPO-WIDE: `npm audit (high+critical, whole graph)` FAILS at 1af96efa (and on #608, b-recur): new high advisory GHSA-vfj7-8cj… on `braces` via micromatch <- danger (devDependency); `npm audit fix --force` proposes danger@7.0.19 (breaking). Not caused by #611; fixing needs a package-lock change builders must not make (same finding as B-EXPORT-5-114). Recommended: one operator-owned dependency PR on main (override `braces` to a patched version, or evaluate the danger change), then #611 merges main again.
- Publication hold (B-611-1) unchanged: publish only after #608 + mobile #313 are live and the owner questions below are answered.
- Mobile #315 Trust Center "180 days" text (off limits for this lane, owned by 114-S) must not ship alongside these pages.
- #662 (restore without resurrection) is unbuilt T4 work; until it lands no production restore is a planned recovery route.
## OWNER QUESTIONS

These come from the #611 body, the audit comments and the policy text. #611 should not go live until each one is answered. Every question has a recommended default and says what the published text will say under each answer.

1. **Do you approve the new "Deleting your account" paragraph on the Privacy Policy?** Fix rounds 4 and 5 rewrote it to list exactly what is kept after deletion: payment records the law requires; security and audit logs; one deletion record (a random reference, the date and the result); a closed-account record with no name, contact details or profile (only an internal account number, the account type, and the dates it was opened and closed); the sign-in provider's account ID while its removal is retried; and then a one-way code for 30 days.
   - **Recommended default:** approve as written. Both audit lenses checked it against the deletion code (#608).
   - **If yes:** the paragraph is published as it stands.
   - **If no:** send your edits. Each change is checked against #608 again before publication, and nothing is published until then.

2. **Does TGP have a zero-data-retention (ZDR) agreement with Anthropic, and do its API terms rule out training on your data?** The policy says providers delete their copies, and "We do not use your data to train AI models." Anthropic's public terms say API inputs and outputs are deleted within 30 days. Items its safety systems flag can be kept for up to 2 years, and data can be kept longer where the law requires it.
   - **Recommended default:** no ZDR. Add one sentence: "Anthropic deletes what it receives within 30 days, except where its usage policy or the law requires it to keep it longer."
   - **If ZDR is in place (and the models in use are ZDR-eligible):** the text stays as it is. The agreement date goes in the procedures document (§3).
   - **If there is no ZDR:** the sentence above is added to the Privacy Policy and to the consumer health policy's deletion section.

3. **Is Mux (coach video upload and playback) live at launch?** The deletion code deletes Mux videos, but neither policy names Mux.
   - **Recommended default:** not live at launch, and kept off.
   - **If not live:** the text stays as it is.
   - **If live:** "Mux — hosting and playback of videos your coach uploads" is added to the Privacy Policy provider list and to the consumer health policy recipients before publication.

4. **Which Supabase plan does production use, is point-in-time recovery (PITR) on, and how long is the backup window? Will you adopt the limits for our own database dumps?** The policies say backups are "never kept beyond six months after a confirmed deletion request", and Washington's RCW 19.373.040 requires that. Supabase keeps backups for 7 days (Pro), 14 days (Team) or up to 30 days (Enterprise), and the PITR window is 7, 14 or 28 days. The pre-deploy `pg_dump` copies are ours, and nothing deletes them automatically.
   - **Recommended default:** Pro, with PITR at 7 days or daily backups at 7 days. Adopt the dump limits: delete each dump 30 days after its deploy is verified, never keep one longer than 90 days, and check the stored dumps monthly.
   - **If the window is 30 days or less and the dump limits are adopted:** the backup sentence stays as written and is true.
   - **If the dump limits are not adopted:** the six-month promise cannot be kept for our own dumps. Either stop taking dumps, or the backup wording changes before publication (and the RCW requirement still applies).
   - **Separate note:** no tested restore procedure exists. Any restore must re-apply deletions and AI-consent withdrawals before the app reads the data (follow-up #662). Until that is built, a restore is not a recovery option.

5. **What plans and settings are Stripe, Sentry, Resend and PostHog on?** These settle whether "we tell our service providers so they delete their copies" and the six-month backup limit hold for each provider.
   - **Recommended default:** Stripe redaction jobs are available. Sentry is on Team (90 days). Resend keeps data 30 days. PostHog session recording is off, and you delete each person from PostHog within 30 days of the deletion finalizing.
   - **If the default holds:** the text stays as it is.
   - **If Stripe redaction jobs are not available:** the Stripe Customer is deleted instead, and the procedures document records that Stripe keeps a deleted Customer for its own records. The policy already says Stripe keeps the payment records the law requires, so it does not change.
   - **If PostHog session recording is on:** the PostHog bullet becomes "PostHog — product analytics and session recordings."
   - **If any of these keeps data longer than six months and you will not delete people from it by hand:** the processor-deletion sentence changes before publication.

## CI at 1af96efa
10/11 required pass (build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, community-live-tests, CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity). npm audit FAILS repo-wide (braces advisory; see Open risks). mergeStateStatus BLOCKED (npm audit + publication hold).
FIX ROUND 6 comment: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/611#issuecomment-5964241995 (ends READY FOR AUDIT). Body updated (T4 header, Fix round 6 table, owner questions, READY FOR AUDIT).

## HANDOFF
- #611 head 1af96efa0ac3bcfc67b4685d96c71b779c1df365, READY FOR AUDIT by both lenses (Sol to verify B-611-5/-6 closure by split; Opus C-611-9).
- Operator: land a dependency fix for the braces advisory on main, then #611 needs one more merge of main (any builder lane) and a green npm audit before merge.
- Follow-up T4 issue #662 (restore without resurrection) needs a builder + both audit lenses; no production restore until it lands.
- Owner questions above (5) gate publication. Not messaged to the owner.
- Worktree /home/user/workspace/wt/B-PRIV-6-1 removed; working notes in /home/user/workspace/ops/bpriv6-114/.
