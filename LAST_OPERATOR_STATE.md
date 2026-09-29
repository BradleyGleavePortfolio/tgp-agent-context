# LAST OPERATOR STATE
Updated: 2026-09-29 16:45 UTC

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

## In-flight PRs (round status)
| PR | Slice | Tier | Head | Round | Status |
|---|---|---|---|---|---|
| backend #581 | learn-and-remember record | T4 | a3b26066 (r4) | r5 authoring | r3: A+B REQUEST CHANGES; r4: A2 (7A/3B) + B2 (5A/9B) REQUEST CHANGES → executive reset → r5 in progress |
| backend #590 | FAM-0 all families record | T4 | 21eb9d2e (r2) | r2 delta review | r1: R590-A (4A/3B), R590-B (2A/9B) REQUEST CHANGES → r2 → R590-A2 (6 open) + R590-B2 (0A/5B) REQUEST CHANGES → r3 authoring (projection: no destination field; one NotMovedReason enum) |
| backend #591 | L1-core learn contract/validators/prompt (pure) | T4 | 3a684671 | r2 fix | R591-A (2A/3B) + R591-B (2A/6B) REQUEST CHANGES (built to r3 grammar; `none` pagination proof weak; stored-package parse; reuse key sparsity) → r2 fix running (v2 digest/proposal, no AI destination field, no unsupported families) |
| backend #592 | L1-gw fail-closed importer.mapping AI capability | T4 | 52196217 | r1 review | built, CI green; R592-A, R592-B running |
| backend #588 | L2a SourceRegistryProvider | T3+2nd lens | f6dcee55 (r2) | r2 delta review | r1: R588-A (1B), R588-B (2B) REQUEST CHANGES → r2 → R588-C APPROVE (all B closed). Real-PG proof run proof/run/x44-l2a-r2-1540 (pins 133/42/95) pending → then land |
| backend #589 | L3 per-family replay evidence | T4 | fe388210 | r2 fix | R589-A (3A/2B), R589-B (2A/2B) REQUEST CHANGES; reshaped per reset |
| backend #587 | S8-D3 person-owned schema + RLS | T4 | 4abed784 | fix r1 → r2 | reversibility check fixed; RLS live tests: harness fixes + CWA recursion fix authorized |
| extension #35 | X1 origin authorization (+ Fly origin) | T4 | 142501a2 | r3 fix | R35-A (1A/3B), R35-B (3B) REQUEST CHANGES |
| mobile #300 | R1 Roman status binding | T2 | 3890a7b8 (r3) | r4 fix | R300-A → r2 → R300-A2 (2B) → r3 → R300-A3 REQUEST CHANGES (P2 mount closed; live-region nesting + in-flight refresh state open) → r4 fix running (announceForAccessibility, no live regions) |

Nothing merged this session. No PR is audit-cleared.

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
