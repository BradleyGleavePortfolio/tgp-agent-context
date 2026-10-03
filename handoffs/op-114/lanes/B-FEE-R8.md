# B-FEE-R8 — Claude Opus 5.5 builder (T4, money), operator agent 114
Read: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (Governing rules, Sandbox limits, Git and GitHub, PR body contract, Reports, Final
answer), /home/user/workspace/ops/_BUILD_COMMON.md, then /home/user/workspace/ops/lanes114/_COMMON_114.md (wins on conflict).
Report: /home/user/workspace/ops/reports/B-FEE-R8-114.md. You are the only writer on backend #627 (branch agent/clinic/s-fee-coach-net).
Lane B-RECUR-BE owns #654 (stacked on this branch) and merges your new head itself; never push to #654.

backend #627 (S-FEE coach payout = price - actual Stripe fee - 2%) @ 7c29d98121d931af04d68038f97aec601589e6a2.
Sol APPROVE at this head (issuecomment-5964131926, 0/0/1). Opus REQUEST CHANGES 0/1/2 (issuecomment-5964167264):
B-627-9 — "absent" is not proof of non-execution while another worker's create is in flight. The sweeper calls attempt(row.id) with no
charge fence (purchase-split-handler.service.ts:262) while inline settlement takes the charge lock (charge-settlement.service.ts:1997);
worker B can read the marker during worker A's in-flight create, get `absent`, hit attempts >= max_attempts and markFailed(final)
(transfer-orchestrator.service.ts:335-337); markFailed (:879-887) and recordPosted (:447) are unconditional `update where {id}`.
Result: a paid transfer marked failed + a repay alert -> the operator could pay the coach twice. Opus probe (2 orderings, both
reproduce): /home/user/workspace/ops/aud-opus-114/627-probe.spec.ts.
Fix (do it right once; both lenses re-audit):
 (a) A marker younger than an in-flight window (>= Stripe client timeout + margin; derive it from the configured Stripe timeout, e.g.
     5 min) means in flight: do not send, do not fail, schedule a re-check.
 (b) All outcome writes are CAS: markFailed / scheduleRecheck use where {id, status:'pending', stripe_transfer_id:null} (and the
     attempts value you claimed); recordPosted never regresses a row or depends on a stale snapshot; a lost CAS re-reads and reconciles.
 (c) Consider fencing the sweeper with the same per-charge lock the inline path takes (if it is cheap and deadlock-free); state why or
     why not.
 Tests: both probe orderings as permanent tests that fail before and pass after; plus young-marker hold, old-marker lookup, CAS loss.
Also: merge origin/main (now 12e1b03b, #645 merged) with a merge commit. The required "npm audit" check fails repo-wide on
GHSA-vfj7-8cjw-p6xm (operator ruling OR-114-2; a separate T4 PR fixes main) — do not touch the lockfile or the audit workflow for it.
Every other required check must be green. Post "FIX ROUND 8 (B-FEE-R8, agent 114) — growth-project-backend#627 @ <full sha>" with the
finding -> change -> commit -> test table; update the body; end with READY FOR AUDIT. Final answer (<300 words).
