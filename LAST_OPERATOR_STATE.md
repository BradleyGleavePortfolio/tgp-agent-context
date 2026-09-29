# LAST OPERATOR STATE
Updated: 2026-09-29 17:35 UTC (#590 r7 authoring)

Operator: Computer (Claude Opus 5.5), executive orchestrator, session x44 (EXECUTE given by owner 2026-09-29).
Mission: progress the AI-assisted self-learning importer toward the north star. Owner directive (2026-09-29):
finish every in-flight PR through review → fix → re-review, all nine in parallel, update this file at every
round finish per PR; start no new PRs; no pilot until everything is done.

Supersedes the 2026-09-20 state (preserved in git history). Commit identity is irrelevant (owner directive).

## Owner decisions recorded 2026-09-29
- D1 `complete` = ALL client records and ALL coaching records from the site are in TGP (no narrowing).
- D4 No unsupported families: anything reachable moves (messages, food logs, check-ins, habits, body metrics,
  notes, forms, photos/files, sessions, ...) — native where TGP has a model, otherwise a preserved record.
- D5 Partial runs show per family what came vs what did not; clickable in the extension UI and on mobile,
  from one server projection.
- D6 Extension backend origin = https://backend-spring-lake-3890.fly.dev (`tgp.coach` is unregistered).
- V1 pilot platform = the owner's own account on the owner-chosen platform; no pilot until all done.

## Executive decisions (orchestrator)
- MAIN-world replay: one Start authorizes only the tab origin; cross-origin data APIs are replayed from the
  authorized page's MAIN world; credentials stay on device, run-scoped, memory-only.
- Executive reset (after learn record r4 failed two T4 re-reviews): completeness closure is DEFERRED to a
  later record — until then no package type has run-level closure, learned runs settle `partial` with gap
  `completeness_not_proven` (false `complete` impossible by construction); per-family source counts stay
  provable. V1 memory is per coach; cross-coach reuse (north star) is a later slice (L2g) with quorum rules.
  One run-status projection (families[] / not_moved[] / gaps[]) owned by the learn record.
- S8-D3: harness fixes (fixture pre-delete; 23505 DETAIL assertions) authorized as correctness fixes; the
  pre-existing ClientWorkoutAssignment↔WorkoutPlan RLS recursion (42P17) is fixed inside #587.

## Bases
backend main `3a9369b9`, integration/importer `d6cf9eb6`; mobile main `adf3f2b9`; extension main `efb3fd18`.
Production backend unchanged (old main); nothing deployed this session.

## CHECKPOINT MODE (owner, 2026-09-29 09:02 PDT: 35k/45k credits used)
Directive: bring all nine PRs to a safe checkpoint. Every running builder/fixer was told to finish its current
round, push (single non-force), and mark unclosed items OPEN in its PR body. No new review rounds are launched
after this point; the next operator starts with the delta reviews listed in each row. No new PRs.

## In-flight PRs (round status)
| PR | Slice | Tier | Head | Round | Status |
|---|---|---|---|---|---|
| backend #581 | learn-and-remember record | T4 | f4459fe2 (r5) | CHECKPOINT: r6 needed | r5 reviews: R581-A3 REQUEST CHANGES (2A/3B) + R581-B3 REQUEST CHANGES (0A/8B; no false-complete path found; structure holds). NEXT: r6 author closes reviews/out/R581-A3.md + R581-B3.md (remove destination.kind from LearnedProposalV1; align slice text with merged L2a/#591/#592; round-2 match rule; template_absent; origin base case; C0 per family), then two delta reviews |
| backend #590 | FAM-0 all families record | T4 | ac1218d1 (r6) | r7 authoring | … r6 → R590-A5 (2A/5B) + R590-B5 (0A/6B) REQUEST CHANGES (redaction heuristics not converging: Luhn/ABA false positives ~10%, bearer charset, key aliases, re-screen claim, partner-origin rule not deterministic). Executive restructure: one versioned shared rules file + CI acceptance corpus (FAM-P1), context-gated payment detection at ingest, rules_version + re-screen job, deterministic partner-origin capture rule → r7 authoring |
| backend #591 | L1-core learn contract/validators/prompt (pure) | T4 | debce080 (r2) | CHECKPOINT: delta review next | R591-A (2A/3B) + R591-B (2A/6B) → r2 pushed: contract v2, family label (no AI destination; unsupported_coaching_data deleted), origins/parentEdge/idScope, device pagination signals + positive proof for none, next_url confinement as contract data, stored-package re-validation, stable reuse key; learn suites 255/255, tsc 0. OPEN: nonGetDataOrigins (r5 field) not added pending L0 r6; reused-parser specs not re-run; X2 must re-copy fingerprint vectors. NEXT: two delta reviews 3a684671..debce080 after L0 r6 |
| backend #592 | L1-gw fail-closed importer.mapping AI capability | T4 | df330304 (r2) | CHECKPOINT: delta review next | R592-A (3A/4B) + R592-B (6B) → r2 pushed: SpendLedger port + advisory-locked PG reserve-before-call (fail closed), allow-listed caller metadata, kill switch per attempt, prices>0, single tool_use, conservative token estimate, readonly schema + validation errors returned, 90 s default, env keys registered; 70 tests. OPEN: real-PG proof of advisory-lock contention (in-memory double only); C1/C8 at r1 posture; CI at df330304 unobserved. NEXT: two delta reviews 52196217..df330304 + real-PG contention spec |
| backend #588 | L2a SourceRegistryProvider | T3+2nd lens | f6dcee55 (r2) | MERGED | R588-A/B → r2 → R588-C APPROVE; real-PG proof ACCEPT run 36592070591 (133/42/95); squash-merged into integration/importer as 249fd0d4 |
| backend #589 | L3 per-family replay evidence | T4 | 61b0d251 (r2) | CHECKPOINT: delta review next | R589-A (3A/2B) + R589-B (2A/2B) → r2 pushed: closure deleted (no path to run-level complete), per-family source_count only, r4 StepEvidenceV1, fan-out bound; N1–N5 fail 15/16 on fe38821, pass on head. OPEN: L2 must consume evaluateCoverageDetailed().families; StopReason lacks positive value for proven style none (L0 r6). NEXT: two delta reviews of fe388210..61b0d251 |
| backend #587 | S8-D3 person-owned schema + RLS | T4 | bb95cbf4 (r2) | CHECKPOINT: delta review next | r2 pushed: 61bdadbb CWA↔WorkoutPlan cycle fix (SECURITY DEFINER helper, reversible), bb95cbf4 harness fixes (a)(b) + live cycle-fix block; local 423/423, reversibility 12/12; `gh pr checks 587` at bb95cbf4 (16:35 UTC) all pass incl. person-owned-rls-live-tests and build-and-test. OPEN: PR body still shows round-1 table (closure edit blocked by safety check — apply from reviews/S8D3_PR587_FIX_ROUND_20260929.md); owner item: assignment_coach_manage lacks client-tenancy check (pre-existing); re-merge base 249fd0d4. NEXT: two delta reviews 4abed784..bb95cbf4 |
| extension #35 | X1 origin authorization (+ Fly origin) | T4 | bd1684ae (r3) | CHECKPOINT: delta review next | R35-A (1A/3B) + R35-B (3B) → r3 pushed: 1df6eaf all A/B closures (recheck around Network.enable; nonce/tab/origin-bound pending Start, either-order claim; revocation fences; startup grant sweep; main-frame-only teardown; executeScript only), bd1684a OD-API-ORIGIN (Fly origin, exact-host, retired-domain scan); vitest 2102 pass, package ok. OPEN: real-Chrome browser-load proof (no Chrome binary; proof script still models r1 collector, needs rewrite); multi-origin out of scope. NEXT: two delta reviews 142501a2..bd1684ae |
| mobile #300 | R1 Roman status binding | T2 | 8565cc51 (r4) | MERGED | R300-A → r2 → R300-A2 → r3 → R300-A3 → r4 → R300-A4 APPROVE (no A/B; CI green on exact head) → squash-merged to mobile main as 360fdc74 on owner authorization (09:41 PDT) |

Merged this session: backend #588 (L2a) → integration/importer 249fd0d4 (integration/importer not promoted to main); mobile #300 (R1 Roman status) → mobile main 360fdc74.

## Owner decisions 2026-09-29 09:52 PDT (binding for next rounds)
- D8 corridor fix APPROVED: `assignment_coach_manage` must apply the same coach-client tenancy check the app applies (tightening only). Queued as the FIRST new PR when work resumes (small T4 RLS slice, two reviews).
- D9 (P1) popup carries exactly one Start button; everything else is status. Resolves the north-star wording conflict.
- D10 (P2/OQ-1) billing and payment history MOVE (preserved, coach-visible). Owner wants per-client next payment date carried so the coach misses no payments. Design note (not started): map to a coach-visible schedule (next due date, amount, interval, source status); moving the date does not move the live charge (Everfit keeps charging via the coach's connected Stripe account until canceled there; card data cannot be copied). Proposed V1: schedule + reminders + timed TGP checkout whose first charge lands on the carried due date, then coach cancels at the source. Needs a billing-handoff slice; L0 r6 and FAM-0 r5 must change billing from gap/excluded to moved.
- D11 (P3) registrable-domain fallback: not now; later slice.
- D12 (P4) media storage spend APPROVED; reuse the existing S3-compatible storage.
- D13 (P5) Chrome Web Store: later.
- D14 (P6) third-party/partner data reachable through the coach's session MOVES and is USED ("all data possible moved over, and used, everything possible"). FAM-0/L0 must drop the exclude-by-default. Still bounded by: no credentials stored, no logging into partner services, only what the coach's own session can reach.

## Not started (by owner direction: no new PRs)
L1 service/route, L2b per-coach memory store + pin, projection slice, X2 rework (#38, must rebase on X1 and
adopt new key-admission rules), X2b engine counters, X3 extension server-mode learn path, X4 popup detail,
R2 Roman gaps, FAM-n native families, preserve destination, completeness-closure record, L2g cross-coach
reuse, branch protection for backend/mobile, V1 proofs.

## Pending owner items
P1 popup carries the one Start (authorize) and is otherwise status-only (north-star wording conflict);
P2 billing under D1 (recommend preserve read-only / disclosed); P3 origin fallback (registrable-domain
permission only if MAIN-world replay proves infeasible); P4 media storage spend (est. small per coach);
P5 Chrome Web Store; P6 third-party service data default (excluded + disclosed unless it carries the site's
own credential); FAM-0 OQ-1..OQ-7 (billing, client visibility of preserved records, media caps, media host,
AI context from imported history, profile fill on join, unclassified family); email/billing storage reversal.

## Evidence
Review reports and briefs live in the operator sandbox (/home/user/workspace/reviews/out/*.md); summaries
are mirrored in PR bodies. Publish to tgp-private-evidence at session end.
