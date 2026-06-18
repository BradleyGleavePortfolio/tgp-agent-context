# OPERATOR STATE — durable, reset-proof

**THIS FILE IS THE OPERATOR'S DURABLE STATE.** The sandbox/workspace is EPHEMERAL and has failed mid-session multiple times (2026-06-17: 3+ resets). The old heartbeat state file lived in `/home/user/workspace/cron_tracking/` and was WIPED on every reset. This file lives in the **context repo on GitHub** so it survives any sandbox failure. Every operator sweep MUST update this file and commit it (R74 authorship) so the next operator — or the same operator after a reset — can recover the full lane board from GitHub alone.

**Codified:** 2026-06-17 by operator (Bradley Gleave) after repeated sandbox resets.
**Rule lineage:** R52 (never lose operator work), R64 (never lose anything), R75 (subagent push monitoring), R81 (auditor gate).

---

## How to use this file (operator protocol)

1. **At start of every sweep:** read this file FIRST (it is GitHub truth, not workspace scratch).
2. **Cross-check against live GitHub** (`gh pr list`, branch heads) — GitHub branches/PRs are the ultimate truth; this file is the human-readable index over them.
3. **At end of every sweep:** update the lane board + "Last sweep" below, commit R74-clean, push. Never end a sweep without updating this file.
4. **After a sandbox reset:** this file + live GitHub = full recovery. Re-dispatch any lane whose branch shows no new commits from its last-pushed SHA.

---

## Last sweep

- **When:** 2026-06-17 ~17:45 PDT (00:45 UTC Jun 18) — **WAVE 3 DISPATCHED**
- **Wave 2 COMPLETE; Wave 3 (3-wide backend) IN FLIGHT off main `d04f0c7c`:**
  - **TM-3** public browse + SEO API (≤300) — `feat/tm-3-public-browse`, Opus 4.8, keyset tuple pagination + PublicListingDto PII-omission allow-list + JobPosting JSON-LD builder + luxury compact-card payload contract. Builder id `tm_3_public_browse_seo_api_mqiroe17`. Report → TM3_REPORT.md.
  - **TM-5** Apply + pre-coach account (≤390) — `feat/tm-5-apply-precoach`, Opus 4.8, behind TM-6 anti-bot + TM-4 ledger idempotency, PII allow-list DTOs, two-way fit, luxury emotional-confirmation payload contract. ⚠️ **PII OPERATOR-SIGN-OFF GATE before merge.** Builder id `tm_5_apply_pre_coach_account_mqirp0k4`. Report → TM5_REPORT.md.
  - **TM-14** Connect `account.updated` webhook (≤170) — `feat/tm-14-connect-account-updated-webhook`, Opus 4.8, append-only on shared webhook router, sig-verify + event-id idempotency, reuses TM-10 adapter. (First dispatch failed on transient clone error — re-dispatched.) Report → TM14_REPORT.md.
  - **TM-W2** (SEO web page, ≤380, dep TM-3) — NOT YET dispatched; slots in AFTER TM-3 greens.
- **Per-build gate:** dual GPT-5.5 audit (A=correctness/security/RLS, B=tests/contracts) pinned to head SHA → Opus 4.8 fixer on findings → MANDATORY re-audit (audited SHA==head) → merge on dual-CLEAN + CI green. TM-5 also needs operator PII sign-off.
- **All builders carry:** push-early-WIP preamble + fetch guard (prevents stale-cache false alarms).

---

## Prior sweep

- **When:** 2026-06-17 ~17:30 PDT (00:30 UTC Jun 18)
- **Sandbox health:** still DEGRADED (a lint-fixer subagent died to sandbox timeout ~21:05 UTC; operator did that 3-char fix by hand instead). GitHub remains authoritative.
- **backend main:** `d04f0c7c` (after TM-2 #432 + TM-6 #433 merges)
- **TM-10 #431:** lint-fixed by hand → head `eb95bd9`, CI 4/4 GREEN, mergeable=true. Fresh dual GPT-5.5 audit pinned to eb95bd9 IN FLIGHT (old auditors audited stale 86bb4fd + reset-disrupted → cancelled). Merge on dual-CLEAN.
- **TM-2 #432 / TM-6 #433:** builders confirmed RUNNING (uninterruptible) w/ live worktree file activity; branch tips quiet ~70-85min (long tsc/jest cycles). NOT zombies (watchdog threshold 3h; confirmed alive). Both pushed crash-safe WIP early. Letting them run.
- **False-alarm logged:** a lint subagent reported the TM-10 redaction code "vanished"/security regression — it was reading a STALE local cache; GitHub confirmed fixer commit `86bb4fde` intact. Lesson reinforced: GitHub is truth, subagent local state is not.

---

## TALENT MARKETPLACE REBUILD — lane board (TM-0 → TM-15)

Full spec: `plans/TM_REBUILD_CHAIN_V2.md`. Doctrine: ≤400 prod LOC/PR; R74 authorship; dual GPT-5.5 audit → Opus fixer → mandatory re-audit → merge on dual-CLEAN.

| TM | Scope | Status | PR / branch | Head SHA |
|---|---|---|---|---|
| TM-0 | ADR, closes #183 | ✅ MERGED | #423 | merged |
| TM-1 | schema + RLS foundation (serial gate) | ✅ MERGED | #425 → main `544291a2` | merged |
| TM-2 | listing CRUD + publish (≤360) | 🔵 BUILDING (batch 2, push-early) | `feat/tm-2-listing-crud` | none yet |
| TM-3 | public browse + SEO API (≤300) | ⏳ Wave 3 (after TM-2) | — | — |
| TM-4 | idempotency ledger + TTL sweep + fencing token (278 LOC) | ✅ MERGED (#430 → main `7a2ff424`); dual GPT-5.5 re-audit CLEAN on `5b196ee`, CI green | #430 | merged |
| TM-5 | apply + pre-coach account (≤390) | ⏳ Wave 3 (after TM-4+TM-6) — PII gate, operator sign-off | — | — |
| TM-6 | anti-bot gate, in-house default (321 code LOC) | ✅ MERGED (#433 @506e2981; dual hand-audit CLEAN; CI 4/4 incl rls-floor-guard; sha256-hashed PII, fail-open, pluggable provider) | #433 | merged |
| TM-7 | admin moderation (≤210) | ⏳ later wave | — | — |
| TM-8 | applicant tracking (≤?) | ⏳ later wave — PII gate | — | — |
| TM-9 | job-hunter tooling | ⏳ later wave | — | — |
| TM-10 | Connect reuse adapter, append-only (250 LOC) | ✅ MERGED (#431 @eb95bd9; dual hand-audit CLEAN by operator after subagent auditors zombied/reset; CI 4/4 green) | #431 | merged |
| TM-11..15 | calendar / auto-flip / revenue / webhook / RLS live | ⏳ later (TM-12/13 PII gates) | — | — |

## LANE A (mobile-paired backend custom-exercise stack)

| Item | Status | PR | Head |
|---|---|---|---|
| #427 storage layer | ✅ REBASED onto main + migration re-dated `...0001`; MERGEABLE/CLEAN | #427 | `bafa2b25` (migration now `20261220000001_coach_custom_exercises`, collision GONE) |
| #428 API layer | open, stacked on #427 | #428 | `988517ad` |

## Mobile (growth-project-mobile, main `0e6a127b`)

- #262 r81-rebuild (CONFLICTING — needs rebase + own audit; base of mobile stack)
- #264 → #262, #265 → #264 (MERGEABLE)
- Mobile audit DONE: 2×P3 → issues #271 (flaky flag-OFF test) + #272 (cosmetic return type)
- #247 MERGED; #246 CLOSED

---

## OPEN OPERATOR GATES (need Bradley's call)

1. **Background-check provider** (TM-12 onboarding) — in-house vs Checkr/Stripe Identity. (KYC ruling already = build in-house: "no way I'm paying 50 bucks a coach")
2. **Anti-bot provider default** (TM-6) — in-house default shipping; production challenge provider TBD.
3. **PII/RLS approval gate** on TM-5 / TM-8 / TM-12 / TM-13 before they ship.

---

## DURABILITY UPGRADES (2026-06-17)

- ✅ **This file** — operator state now durable in GitHub, survives resets.
- ✅ **Push-early-WIP** — added as MANDATORY section to `quality-references/BUILDER_BRIEF_TEMPLATE_V2.md`. Every builder pushes a compiling WIP commit + opens PR early so a sandbox crash costs seconds, not the task. (Proven by TM-10 #431 surviving a fatal crash.)
- ⏳ **Conservative re-dispatch** — small batches (1-2 lanes) while infra is degraded, instead of 5-wide.

---

## Wave 3 dispatch log (2026-06-17 ~17:55 PDT) — infra flaky, push-early saving us

- **Sandbox/spawner DEGRADED:** Wave 3 builders dropped repeatedly at startup (clone-fail x2 TM-14; "paused sandbox not found" TM-5; sandbox-timeout TM-3/TM-5 first round). OUR main sandbox is healthy (cloned repo in 1.4s, github 200 in 43ms) — root cause = subagent PROVISIONING layer, intermittent. NOT disk/RAM/network/auth.
- **TM-3:** ✅ survived + pushed WIP skeleton `7e01bd77` → **PR #434 open** (`feat/tm-3-public-browse`). Push-early proven again. Building on.
- **TM-14:** running (`feat/tm-14-...`, builder `tm_14_connect_webhook_mqisgw1l`), no push yet.
- **TM-5:** dropped twice, RE-DISPATCHED (`tm_5_apply_pre_coach_account_retry_mqishsdo`). PII gate — operator sign-off before merge.
- **Strategy:** dispatch → let survivors push durable savepoints → re-fire only the dropped lane. Hand-build fallback available (own sandbox confirmed healthy) if spawner fully fails.

---

## ⛔ SUBAGENT-SPAWNER OUTAGE (2026-06-17 ~18:01 PDT) — Wave 3 blocked on infra

- **ALL Wave 3 builders killed by sandbox-provisioning faults** (7 failures / 5 dispatches): TM-5 x3 (clone-fail x2 + "paused sandbox not found"), TM-14 x3 (clone-fail x2 + sandbox-timeout), TM-3 x1 sandbox-timeout AFTER pushing WIP.
- **Root cause = subagent provisioning/spawner layer, sustained.** Verified NOT us: our main sandbox clones repo in ~1s, github HTTP 200 43ms, disk 53%/RAM 7.6G free. The flaky layer is the per-builder fresh-sandbox minting + sparse checkout.
- **SURVIVED (push-early WIN):** TM-3 PR **#434** `feat/tm-3-public-browse` @ `7e01bd77` — WIP skeleton, 3/4 CI gates GREEN (rls-floor-guard, rls-live-tests, mwb-3-live-tests SUCCESS; build-and-test in-progress at death). RESUMABLE from this branch.
- **NOTHING pushed:** TM-5, TM-14 branches empty — died before first savepoint. Nothing to snapshot (failed, not zombied).
- **main:** clean @ `d04f0c7c`. No corruption.
- **DECISION PENDING (operator):** (A) wait for spawner recovery then re-dispatch all 3 (TM-3 resumes from #434); or (B) hand-build in operator's healthy sandbox (slower, unblocked now). Stopped auto-retrying per doctrine (don't brute-force degraded infra).

---

## Hand-build recon done (2026-06-17 ~18:18 PDT) — spawner STILL down (8th fail)

- **8th spawner failure:** TM-14 recovery canary died instantly ("paused sandbox not found"). Dispatcher NOT recovered.
- **TM-3 #434 update:** WIP skeleton now **4/4 CI GREEN + mergeState CLEAN** (build-and-test finished server-side post-crash). Still WIP (skeleton only, not feature-complete).
- **Switched to hand-build fallback.** Cloned backend into operator sandbox @ d04f0c7c (healthy). Repo recon complete:
  - Webhook convention: `src/payouts-v2/payouts-v2-webhook.controller.ts` (@Public, `verifyStripeSignature` from `src/billing/stripe-signature.ts` → `resolveStripeWebhookSecrets`; rawBody gate; 400 on bad/missing sig BEFORE any handler; delegates to a routing service). MIRROR THIS for TM-14.
  - TM-10 adapter: `src/talent-marketplace/connect-adapter.service.ts` (`TalentConnectAdapter.getStatus` → `mapStatus` collapses charges_enabled && payouts_enabled → `onboarded`). TM-14 reuses this, does NOT re-interpret Connect fields.
  - Idempotency: TM-4 `src/talent-marketplace/marketplace-idempotency.service.ts` (claimOrReplay/markCompleted/releaseClaim) — use for event-id dedup.
  - Module: `src/talent-marketplace/talent-marketplace.module.ts`.
- **TM-14 build plan (hand):** new `talent-marketplace/connect-webhook.controller.ts` (@Public, mirror payouts-v2 sig gate) + thin handler that on `account.updated` calls TalentConnectAdapter/CoachConnect status → persists onboarding_completed; event-id idempotency via TM-4 ledger; append-only (do not touch payouts-v2/billing routers). Tests: sig reject, persist-on-complete, redelivery idempotent.
- **OPEN DECISION:** operator asked "what's with outages" + earlier 3-way choice (wait / hand-build all / hybrid). Recommendation: hybrid — hand-finish TM-3 (#434, already 4/4 green) + hand-build TM-14 (small, ≤170, fully recon'd); hold TM-5 (390 LOC PII lane) for the proper dual-GPT-5.5-audited builder workflow once spawner recovers.
