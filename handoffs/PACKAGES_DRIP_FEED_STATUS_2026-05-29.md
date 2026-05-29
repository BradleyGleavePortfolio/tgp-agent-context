# Packages & Drip-Feed Engine — Build Status & Operator Handoff
**As of:** 2026-05-29 ~10:30 PDT · **Owner agent:** CPO operator agent · **Mode:** autonomous overnight build, auto-merge authorized this session when Auditor-CLEAN of P0/P1/P2.

> Single source of truth for "what's shipped, what's next, and how to continue." Pairs with `specs/PACKAGES_DRIP_FEED_MASTER_PLAN.md` (the plan + 12 locked decisions + schema + 18-PR sequence).

---

## TL;DR
- **14 of 18 PRs merged** (all Auditor-CLEAN of P0/P1/P2). **PR-15 in flight** (both halves built + under independent audit at time of writing).
- The feature turns a TGP "package" from a price-tag-that-delivers-nothing into a **content-agnostic deliverables engine**: coaches attach workouts / meal plans / PDFs / videos / auto-messages to a package; every checkout (in-app, guest, web) fans that content out on a **coach-authored drip schedule**.
- All three GitHub repos are **PRIVATE** (set 2026-05-29): `growth-project-backend`, `growth-project-mobile`, `tgp-agent-context`.

---

## Repos
| Repo | Purpose | Visibility |
|---|---|---|
| `BradleyGleavePortfolio/growth-project-backend` | NestJS backend (the engine, webhooks, endpoints) | PRIVATE |
| `BradleyGleavePortfolio/growth-project-mobile` | React Native / Expo app (coach editor + buyer screens) | PRIVATE |
| `BradleyGleavePortfolio/tgp-agent-context` | Plans, briefs, build reports, audits, session logs (THIS repo) | PRIVATE |

Git proxy clone base: `https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/<repo>.git`. GitHub ops via `gh` CLI. Commit identity: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'` — NO Co-Authored-By / Generated trailers.

---

## Merged PRs (14/18) — coach & client impact + the engineering one-liner

| PR | # | Repo | What it means for coaches / clients | Engineering one-liner |
|---|---|---|---|---|
| PR-1 | 208 | mobile | Clients: in-app checkout actually works (was hitting dead routes, swallowing real 404s) | Rewired clientPaymentsApi→/v1/checkout/*, POST→GET confirm, fixed isNotConfigured |
| PR-2 | 313 | backend | Coaches: alerted when a payout transfer fails | transfer.failed handler + ConnectTransfer.status='failed' + COACH_ALERT |
| PR-3 | 314 | backend | (foundation) | Additive schema: is_sellable, CoachPackageContent, ScheduledDrop, PurchaseFanout, CoachMediaAsset, ClientAssetGrant |
| PR-4 | 315 | backend | (foundation) | PurchaseFanoutService no-op + wired all 3 entitlement hook points inside the tx |
| PR-5 | 209 | mobile | Coaches: one clean package surface instead of two | Killed Surface A, unified on Surface B + one API client |
| PR-6 | 317 | backend | Coaches: draft/publish packages, richer pricing (one-time / recurring / both) | Package reads + draft/publish + duration_periods + pricing config (decision #1) |
| PR-7 | 316 | backend | (foundation) | AssignableAssetResolverRegistry + 4 resolvers |
| PR-8 | 318 | backend | Coaches: attach/reorder deliverables with per-cadence rules | Contents endpoints + zod discriminated-union per cadence; per-package advisory-lock for display_order (CLEAN after 3 rounds) |
| PR-9 | 319 | backend | Clients: buying actually delivers content; immediate items land at checkout | Real fan-out body + webhook tx atomicity across all 3 paths (CLEAN R2) |
| PR-10 | 320 | backend | Clients: future content auto-releases on schedule with push + in-app alerts; coaches alerted on permanent failure | DripDispatcherCron 1-min + per-type dispatch + retry/backoff + COACH_ALERT (CLEAN R2) |
| PR-11 | 321 | backend | Clients: content can unlock when they finish a workout or hit a milestone | on_completion/on_milestone trigger glue (CLEAN R1) |
| PR-12 | 322 | backend | Coaches: upload PDFs + videos; only paying clients get access | CoachMediaAsset upload (Supabase PDF + Mux video), signed playback, webhook tx idempotency (CLEAN R2) |
| PR-13 | 210 | mobile | Clients: a Deliverables timeline (unlocked + upcoming) | Buyer Deliverables screen, flag-gated, typed against the drops contract (CLEAN R2) |
| PR-14 | 323 | backend | Coaches: sell subscriptions on the web (not just one-time); landing-page revenue attribution works | Guest storefront recurring + one-time+recurring combo + landing_page_id propagation (CLEAN R2 after a money-bug P0) |

**Audit rigor note:** every PR was built by an Opus 4.7 builder, then audited by a SEPARATE gpt_5_5 auditor against the 50-Failures gate, fixed until CLEAN of P0/P1/P2, then merged. Multi-round PRs: PR-1 (3), PR-8 (3), PR-7/9/10/12/13/14 (2). PR-14's R1 caught a genuine money-taken-nothing-delivered P0 (recurring guest webhook never routed to conversion) — fixed in R2.

---

## IN FLIGHT — PR-15 (spans BOTH repos; built, under audit)
- **PR-15A #324 (backend):** `GET /v1/checkout/purchases/:purchaseId/drops` (the buyer-drops endpoint that unblocks PR-13's mobile screen) + `COACH_NEW_PURCHASE` notification + SSR thank-you parity. Builder reported 299 suites / 3597 tests; +22 new. **Status: independent audit running.**
- **PR-15B #211 (mobile):** `PurchaseUnpackScreen` ("here's what you just got + what's coming") + flip Deliverables to the live endpoint + extracted shared DropRow/routeForDrop. Builder reported 139 suites / 1514 tests; +30. **Status: independent audit running.**
- **Endpoint contract shipped by 15A** (mobile must match exactly):
  ```json
  { "drops": [ { "id","asset_type","asset_id","asset_revision_id","cadence_kind",
                 "display_title","display_caption","fire_at","fired_at","status","materialised_ref" } ] }
  ```
  Auth = JwtAuthGuard, buyer owns the purchase (IDOR→404). Filter status IN (pending,due,fired). Order COALESCE(fired_at,fire_at,created_at) ASC.

---

## Remaining PRs (next operator: build in this order)
| PR | Title | Repo(s) | Brief written? |
|---|---|---|---|
| PR-15 | Buyer drops endpoint + PurchaseUnpackScreen + SSR thank-you + COACH_NEW_PURCHASE | backend + mobile | YES (`specs/PR15_BRIEF.md`) — in flight |
| PR-16 | Refund/cancel → cancelPendingForPurchase from refund/dispute/sub-deleted handlers | backend | NO — write first |
| PR-17 | Edit-after-purchase "push to existing" (decision #2): apply to pending drops only, "future buyers only" copy | backend + mobile | NO — write first |
| PR-18 | Polish pass (works through `specs/PR18_POLISH_BACKLOG.md`) | backend + mobile | NO — write first |

---

## How to continue the build (the mandatory pipeline)
Per PR:
1. Write `specs/PR{n}_BRIEF.md` (scope, exact files, decision refs, test bullets, scope guards).
2. Spawn **Builder** = codebase subagent, `claude_opus_4_7`, repo_url in metadata, preload `coding`; objective references the brief + "pull latest default first". Builder writes `PR{n}_BUILD_REPORT.md`.
3. Spawn **Auditor** = codebase subagent, `gpt_5_5` (NEVER the builder), reads `specs/AUDITOR_BRIEF_COMMON.md`, writes `PR{n}_AUDIT.md`, VERDICT CLEAN/NOT CLEAN, does NOT modify code.
4. If NOT CLEAN → `message_subagent` the SAME builder with precise fixes → re-audit (`_R2`,`_R3`) until CLEAN of P0/P1/P2.
5. Merge: `gh pr merge {n} --repo BradleyGleavePortfolio/<repo> --squash --delete-branch`.
6. Push artifacts to this repo same turn (R64): copy brief→specs/, build report→builds/, audit(s)→audits/, commit + push.

**Parallelism:** backend and mobile PRs (different repos) build + audit in PARALLEL. Same-repo PRs are SEQUENTIAL (one worktree per repo).
**CRITICAL LESSON:** never `rm -rf` a repo clone while a subagent is active — it deletes their live worktree and FAILS them. Branch work pushed to remote is always safe.

---

## The 12 locked operator decisions (LAW — full text in `specs/PACKAGES_DRIP_FEED_MASTER_PLAN.md` §1)
1. Billing per package (one-time / recurring / both; weekly/monthly/yearly). 2. Edits-after-purchase: per edit, new-only OR push-to-existing. 3. Default cadence: immediate. 4. Guest checkout in scope. 5. Asset storage: Supabase behind StorageProvider. 6. Video: Mux HLS, dual-attach. 7. Poll cadence: 1-min cron. 8. Immediate delivery inline at checkout. 9. Drop alerts: push + in-app. 10. Failure: retry+backoff then alert coach. 11. Supersede-vs-fix per case. 12. Auto-merge authorized THIS session when Auditor-CLEAN.

---

## Key files in this repo
- `specs/PACKAGES_DRIP_FEED_MASTER_PLAN.md` — THE plan (decisions, schema §3, hook points §5, 18-PR sequence §6).
- `specs/AUDITOR_BRIEF_COMMON.md` — the 50-Failures audit gate + severity scale.
- `specs/PR{n}_BRIEF.md`, `builds/PR{n}_BUILD_REPORT.md`, `audits/PR{n}_AUDIT.md(+_R2/_R3)`.
- `specs/PR18_POLISH_BACKLOG.md` — accumulated non-blocking P3s for the final pass.
- `specs/BACKEND_DROPS_ENDPOINT_PREREQ.md` — the prereq folded into PR-15A.
