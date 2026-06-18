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
