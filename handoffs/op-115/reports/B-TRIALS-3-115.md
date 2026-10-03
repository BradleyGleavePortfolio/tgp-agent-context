# B-TRIALS-3 (agent 115) — backend #656 fix rounds 4-5 + mobile #338 fix round 2 + card-removed truth

## Scope
1. backend #656 — fix rounds for GPT-6.1 Sol REQUEST CHANGES @079e9e39 (0/5/1) and @b9939d02 (0/4/1). Must compose with #654 either order.
2. mobile #338 — Opus raised C only (C-338-2, C-338-3); closed in fix round 2.
3. Backlog: card removed mid-trial still showed "will charge" and sent no notice — folded into #656 (same defect as B-656-5).

## PR state (exact heads)
| PR | Head | Checks | Verdicts | Next step |
|---|---|---|---|---|
| backend #656 | 86223987ec94511f2a146b62d99f87ed1b2758a8 (FIX ROUND 5 + merge of main d23fa317) | 11/11 green, CLEAN; FIX ROUND 5 + READY FOR AUDIT posted (issuecomment-5972340703) | Sol RC @b9939d02 (0/4/1) answered by round 5; Opus full audit still owed (no Opus verdict on #656 yet) | Sol re-audit + Opus audit at 86223987 (queues AUD-SOL-MONEY / AUD-OPUS-MONEY already list backend#656) |
| mobile #338 | 48b5e6b5434fc5db207dcb14d97e5208a3d4b16f | 3/3 green | Sol APPROVE @48b5e6b5 (0/0/1 C-338-1 narrowed); Opus APPROVE @9cf66146 (prior head; Opus delta for ed51047 + merge owed) | waits (operator PAUSE); Opus delta check; merge paired with #656 (OR-112-13) |

## #656 fix round 4 (head b9939d02)
| Finding | Change | Commit | Test |
|---|---|---|---|
| B-656-1 durable second-trial cancel | `PackageTrialConflict` owed row on the webhook tx; leased, bounded, backed-off settle + 5-min sweep; owed row vetoes access on later events; active after every cancel failed -> superseded + alert | 4b3d380d | b-trials-3-fix-round B-656-1 |
| B-656-2 exclusive fenced delivery | per-channel lease token/expiry, fenced completion, 30 s transport bound, per-attempt email key | 4b3d380d, b9939d02 | B-656-2 |
| B-656-3 short trial lost the notice | notice at trial start inside window + 10-min reconciler | 4b3d380d | B-656-3 |
| B-656-4 push ignored mute | prefs re-read at delivery; muted -> suppressed; billing email still sent | 4b3d380d | B-656-4 |
| B-656-5 + backlog card removed | `ClientPurchase.card_on_file`; will_charge needs a real card; no-card copy; access kept | 4b3d380d | B-656-5 |
| C-338-2 server copy said "0 days" | "remove the trial" | b9ad7b7c | C-338-2 copy test |
Before: run 37141922666 (compile failure on 079e9e39). After: run 37141941739 + 11/11 PR checks at b9939d02.

## #656 fix round 5 (head 86223987)
| Finding | Change | Commit | Test |
|---|---|---|---|
| B-656-3 narrowed (page starvation) | keyset paging (trial_ends_at,id), cap 50 pages, cursor resume | f936a112 | "full first page ... 20 due trials" (+ pins: ties, concurrent sweeps) |
| B-656-5 narrowed (failed read -> "no card") | tri-state card authority; unknown -> no record / no send, retried | f936a112, 282dd239 | two delivery/record tests |
| B-656-6 alert gate shared | separate `billed_alerted_at` receipt | f936a112 | failing -> billed alert; concurrent alert sweeps |
| B-656-7 Error.name in logs | `trial-diagnostics.ts` closed lists everywhere new | f936a112 | 3 canary tests |
| C-656-1 composed acceptance with #654 | owed by the second PR to merge (body "Integration owed" item 4) | — | operator decision |
Before: run 37144505127 (8 failed / 31 passed, behavioural). After: run 37144528941 (tsc + 4 suites, 96/96).

## #338 fix round 2 (head 48b5e6b5)
| Finding | Change | Commit | Test |
|---|---|---|---|
| C-338-3 deploy-order hardening | create omits trial_days with no trial; edit sends it only when changed | ed51047 | packageTrial / screen / paymentsApi |
| C-338-2 $0 + trial | already refused on device (pinned); server copy fixed in #656 | ed51047 | screen pin |
Before: mobile run 37141962868 (4 failed / 44 passed). After: mobile run 37141974517 green; PR 3/3 green.

## Notes
- Migration `20270313000000_package_trial_truth` (lane prefix); additive; down.sql reverses it. `PackageTrialConflict` holds no user id (no #608 manifest entry).
- Composition: `git merge-tree` vs #654 @317301b5: 5 additive conflicts (schema, billing.service, webhook handler, email.service, email.types); vs #641: clean; vs #628: 4 files. Migrations 20270225/20270228/20270311/20270313 share only `ClientPurchase.trial_days` (IF NOT EXISTS).
- Client UI for `no_charge_reason` / `not_eligible` belongs to mobile #334 (B-RECUR-3); no mobile code reads purchases[].trial today.
- Full ci.yml dispatches 37141593371, 37141648670 (backend) and 37141838209, 37141855713 (mobile) were cancelled per CI lane v2.

## HANDOFF
- backend #656 @86223987ec94511f2a146b62d99f87ed1b2758a8: 11/11 green, CLEAN, FIX ROUND 5 + READY FOR AUDIT posted. Owed: Sol re-audit, Opus full audit. If a lens requests changes, the next round is the operator's call (this lane ends per the 11:25 PAUSE).
- mobile #338 @48b5e6b5434fc5db207dcb14d97e5208a3d4b16f: Sol APPROVE at head; Opus APPROVE at 9cf66146, delta owed. Waits per PAUSE. Merge together with #656 (OR-112-13), after #656 deploys if a coach will set a trial.
- Operator decisions: (1) C-656-1: composed #654+#656 acceptance is done by whichever of the two merges second (integration items 1-4 in #656 body); (2) Stripe Dashboard: add `customer.subscription.trial_will_end` to the webhook endpoint.
- Cleanup done: all six ci/B-TRIALS-3-* branches deleted (backend 4, mobile 2); node_modules unlinked; worktrees wt/B-TRIALS-3-1 and wt/B-TRIALS-3-2 removed. CI run URLs stay valid.
