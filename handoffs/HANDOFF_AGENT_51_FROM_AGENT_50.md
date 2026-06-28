# Agent 51 — Handoff from Agent 50 (Op 50.5)

> **Provenance:** Authored by Bradley Gleave on behalf of Agent 50. Companion to `stash_docs/live_state.json` (read both). This document **explicitly supersedes** the tactical sections of the Op 49 / Op 50.5 sandbox-death handoff (`stash_docs/2026-06-27-op-50.5-next-agent-handoff.md` dated 2026-06-27 ~08:44 PDT) but does NOT obsolete its strategic M-series context.
>
> **Snapshot taken:** 2026-06-27 23:44 PDT (2026-06-28 06:44 UTC).

---

## TL;DR (read this in 30 seconds)

We pivoted into **M-NEW-LIVE first scout profile: TrueCoach**. The browser extension and NestJS ScoutModule are both **built, adversarially audited, and fixer-passed**. Every P0-P3 defect across both modules is closed. The single remaining gate before merge is the **R72 dual-lens re-audit** of the fixer output. Spawn it. If both lenses return CLEAR, push the ScoutModule into `growth-project-backend` as Bradley and let Fly's `release_command` run `prisma migrate deploy` on the staging app. Then flip the extension to prod and live round-trip.

---

## What is stale in the Op 49 handoff

The 2026-06-27 ~08:44 PDT handoff was written immediately after a sandbox-death. Its **strategic** content (M-NEW-LIVE proposal, M-floor doctrine, planner reconstruction recipe, autonomy mandate, doctrine bindings) is still correct and you should treat it as canonical.

What changed since:

| Topic | Op 49 said | Reality now |
|---|---|---|
| **M-NEW-LIVE status** | Proposal awaiting planner-reality-check re-rank | First scout profile (TrueCoach) is **built end-to-end and post-fixer** |
| **Backend identity** | Implied chef-built NestJS backend was the merge target | Chef backend was **never merged**. Real backend is `backend-spring-lake-3890` on Fly.io + Supabase, NestJS + Prisma + RLS |
| **Schema source of truth** | Whatever the chef branch shipped | The real 6717-line / 168-model `prisma/schema.prisma` in `growth-project-backend`. Local copy at `/home/user/workspace/tgp_schema.prisma` |
| **PR queue** | H6A / H6B / H6C audit chain on `wave-h6-*` branches; PR #491 / #493 in flight | All M-NEW-LIVE work lives in `/home/user/workspace/scout_module/` and `/home/user/workspace/extension_v0/`. **Nothing pushed yet.** Branch + PR for ScoutModule is your first push task once re-audit clears |
| **Audit posture** | R72 dual-lens on H6 only | R72 dual-lens is now **mandatory on every artifact** (operator caught me self-grading; codified retroactively for all prior work) |
| **Forbidden-model rule** | Implied | **R-META-4 codified in law:** `claude_opus_4_8` + `gpt_5_5` only. Sonnet, Gemini, Haiku forbidden as fixers or auditors |
| **M-plan re-rank** | Top priority | Still valid as a parallel track, but **NOT blocking** TrueCoach merge. TrueCoach proves the M-NEW-LIVE spine empirically |
| **H6 audit chain** | Active | Status unknown from this session — Op 49's H6A/H6B/H6C work was outside Op 50.5's scope. If operator asks, treat as paused until they redirect |

**Bottom line:** the Op 49 doc is your strategic compass; this doc is your tactical map.

---

## The whole story in one paragraph

The operator's pivot — "build a universal live mirror adapter that becomes the M-spine" — became concrete this session as a Chrome MV3 extension that scrapes TrueCoach via its JSON API + bearer token, plus a NestJS ScoutModule that takes that JSON and writes it into the **real production Prisma tables** (no parallel staging). The operator personally captured 4 batches of live TrueCoach API samples so the extractor was finalized against real shapes, not training-data guesses. The operator personally signed off the 16-entity-type field-by-field mapping table. The operator personally answered all 15 OPEN_QUESTIONS (most importantly OQ#11: coach-owned exercises are **HARD-SKIPPED in v1** because the global `ExerciseCatalogItem` table has no `coach_id` column — writing them would be a cross-coach leak). Then the operator caught me NOT adversarially auditing every artifact and codified mandatory R72 dual-lens audits on everything. I dispatched the audits: ScoutModule came back **BLOCKED** (5 P1, 5 P2, 6 P3), extension came back **SAFE-AS-INSTALLED-BUT-FIX-BEFORE-PROD** (2 P0, 3 P1, 4 P2, 3 P3). A single Opus 4.8 fixer pass closed all 22 defects. Final state: ScoutModule 300 tests / R74 ratio 1.9566 / largest prod 226 LOC / zero banned casts / zero forbidden tokens. Extension 96/96 tests / largest prod 337 LOC / `tsc --noEmit` exit 0. Both `FIXER_REPORT.md` files end `VERDICT: ALL_FIXED`. Operator was last seen waiting for the re-audit gate.

---

## State of the world (verified as of snapshot)

### Real TGP backend
- **App:** `backend-spring-lake-3890` on Fly.io (region SJC)
- **DB:** Supabase Postgres us-west-1, managed by Prisma
- **Stack:** NestJS + Prisma + JwtAuthGuard + RLS via `app.current_user_id()`
- **Prod URL:** `https://api.thegrowthproject.app`
- **Staging URL:** `https://api-staging.thegrowthproject.app`
- **Deploy mechanism:** Fly `release_command` runs `prisma migrate deploy` automatically on every deploy
- **Repo:** `growth-project-backend` (cloned at `/tmp/tgp_backend_probe` and `/tmp/tgp_backend_ref`)

### ScoutModule (`/home/user/workspace/scout_module/`)
- **Status:** post-fixer, awaiting re-audit
- **Tests:** 300 across 29 spec files
- **Prod LOC:** 2055 across 21 files, largest `scout.service.ts` at 226 LOC (R76 cap 400)
- **R74 ratio:** 1.9566 (operator waiver floor 1.74)
- **R75 banned casts:** 0
- **R0/R3 forbidden tokens:** 0
- **Key artifacts:**
  - `BUILD_REPORT.md` — post-fixer doctrine table
  - `FIXER_REPORT.md` — defect-by-defect closeout, ends `VERDICT: ALL_FIXED`
  - `ADVERSARIAL_AUDIT.md` — original audit that returned BLOCKED
  - `INSTALL_NOTES.md` — merge/deploy guide (`migrate deploy`, RLS gate for `ClientCondition`)
  - `prisma/schema.additions.prisma` — hand-merge target with `@@unique(..., map: ...)` matching migration SQL
  - `prisma/migration.sql` + `prisma/DOWN.md` (R82 reversible)
  - `src/scout/` — full NestJS module (controller, service, 5 handlers, 8 mappers, 2 services, 29 specs + 3 helpers)
- **Outstanding follow-ups (not blockers for v1 merge):**
  1. RLS policy for new `ClientCondition` table must land in a **separate reviewed PR** before any prod traffic touches the table (R125)
  2. `UserClaimService.claimImportedAccount()` is built but NOT wired into the existing invite-acceptance flow — integration step listed in `INSTALL_NOTES.md`
  3. Coach-owned `ExerciseCatalogItem` deferred to v2 (needs `coach_id` column or visibility scope before reversing the HARD-SKIP)

### Extension v0 (`/home/user/workspace/extension_v0/`)
- **Status:** post-fixer, awaiting re-audit. **Already side-loaded** on operator's machine — currently safe because the OLD bundle points at `api.tgp.coach` which is NXDOMAIN. Operator must reload the patched build before pointing at any real backend.
- **Tests:** 96/96 across 7 files (was 75 claimed / 74 actual + 1 date-brittle failure before fix)
- **Build:** `tsc --noEmit` exit 0; `tsconfig.build.json` `exclude` globs now stop spec files compiling to stray `.js` siblings
- **Largest prod files:** `background.js` 337 LOC, `extractors/truecoach/extractor.ts` 319 LOC (R76 cap 400)
- **R75 / R0 / R3:** all clean
- **Key artifacts:**
  - `BUILD_REPORT.md` — post-fixer
  - `FIXER_REPORT.md` — defect closeout, ends `VERDICT: ALL_FIXED`
  - `RETROACTIVE_AUDIT.md` — original audit
  - `INSTALL_INSTRUCTIONS.md` — install + new "Switching staging ↔ production" section
- **Staging/prod switch:** edit `TGP_API_ORIGIN` in `extension/shared/protocol.ts`. Allow-list (`KNOWN_TGP_ORIGINS`) hard-codes both hosts and rejects anything else at module load.

### Schema additions pending merge
- **Type:** additive only, nullable-defaulted, fully reversible (R82)
- **9 models** get `imported_from_platform`, `imported_source_id`, `imported_at` plus composite unique index named to match Prisma's generator (SCOUT-P1-5 fix)
- **`User`** also gets `imported_pending_claim Boolean @default(false)`
- **NEW model:** `ClientCondition` + `ClientConditionCategory` enum (goal | injury | limitation | equipment | note)
- **`ExerciseCatalogItem`:** NO new columns in v1 (OQ#11 RESOLVED)
- **Files:** `scout_module/prisma/{migration.sql, DOWN.md, schema.additions.prisma}`

---

## What you need to do next, in order

### Step 1 — Spawn the R72 dual-lens re-audit (NOT OPTIONAL)

Two parallel subagents:

```text
LENS A:
  model: claude_opus_4_8
  subagent_type: general_purpose
  objective: read scout_module/FIXER_REPORT.md and extension_v0/FIXER_REPORT.md.
             For each defect ID, verify the claimed fix is actually present in
             code AND the test that proves it passes. Then sweep both modules
             for any NEW defects introduced by the fixer pass. Severity P0-P3.
             Write to scout_module/RE_AUDIT_LENS_A.md and
             extension_v0/RE_AUDIT_LENS_A.md. End each with single VERDICT line:
             CLEAR or BLOCKED.

LENS B:
  model: gpt_5_5
  subagent_type: general_purpose
  objective: same as Lens A but with adversarial GPT-5.5 lens. Write to
             scout_module/RE_AUDIT_LENS_B.md and extension_v0/RE_AUDIT_LENS_B.md.
```

Both must return **CLEAR** before merge. If either returns BLOCKED, spawn a single Opus 4.8 fixer on the union of findings and loop.

### Step 2A — If dual CLEAR: ship it

1. Clone `growth-project-backend` (use `bash` with `api_credentials=["github"]`).
2. Create branch (suggested: `feat/scout-truecoach-v1` — confirm with operator if they want a different name).
3. Hand-merge:
   - `src/scout/` → into the repo's `src/`
   - `scout_module/prisma/schema.additions.prisma` → into the repo's `prisma/schema.prisma`
   - Add `ScoutModule` to `AppModule.imports`
4. Run `npx prisma format` and `npx prisma validate` locally if available.
5. Commit as **Bradley Gleave** (author AND committer — use `scripts/push_one.sh` pattern). Single VERDICT line in commit message.
6. Push branch, open PR with single VERDICT line at top of body and bottom.
7. Operator merges to `main`.
8. Fly auto-deploys to staging; `release_command` runs `prisma migrate deploy`.
9. **Separate reviewed PR**: RLS policy for `ClientCondition` table (per `INSTALL_NOTES.md` § "RLS Tier-1 updates required"). MUST land before any prod traffic.
10. Smoke test: operator reloads extension (still pointing at staging), runs the importer against his real TrueCoach account, verifies clients/workouts/regimes/sessions appear in the TGP coach UI immediately.

### Step 2B — If either lens BLOCKED

1. Spawn one Opus 4.8 fixer on the union of findings (same objective template I used — see `current_session_context/turns/` for the verbatim brief I sent the first fixer).
2. Re-spawn both lenses on the new fixer output.
3. Loop until both return CLEAR. **No defect downgrades. No deferrals without `DEFERRED.md` hard reasons.**

### Step 3 — Promote to prod

1. Edit `extension/shared/protocol.ts`: `TGP_API_ORIGIN = "https://api.thegrowthproject.app"`.
2. Operator reloads side-loaded extension at `chrome://extensions`.
3. Live round-trip with operator's TrueCoach account.
4. Verify in TGP coach UI.

### Step 4 — Fan out to remaining 5 scout profiles

Per the M-NEW-LIVE spine, profiles 2-6 are: **CoachRx, MyPTHub, Trainerize, PT Distinction, FitSW**.

**Same pattern, no shortcuts:**
1. **Capture-first sprint per profile** — operator captures live JSON shapes himself (he prefers this; he did it for TrueCoach in 4 batches via DevTools paste).
2. Fan out 5 Opus 4.8 extractor chefs in parallel ONLY AFTER each profile has captured samples.
3. Each profile gets its own adversarial audit → fixer → re-audit → merge cycle.
4. **R71 lane cap:** ≤5 concurrent subagents. Plan accordingly.

---

## Doctrine you must respect (do not relearn this the hard way)

Reproduced verbatim from `live_state.json` for redundancy.

- **R0/R3:** every commit and PR shows Bradley Gleave `<bradley@bradleytgpcoaching.com>` as author AND committer. Zero tokens of: `claude`, `anthropic`, `opus`, `sonnet`, `haiku`, `gemini`, `openai`, `gpt`, `llm`, `ai-generated`, `ai-assisted`, `copilot`, `co-authored-by`, "generated by", "assisted by".
- **R-META-1:** Musk first-principles. Question the requirement, delete the part, simplify, accelerate, automate last.
- **R-META-2:** Every operator-facing choice gets (1) hyperscaler research + (2) one-sentence metaphor.
- **R-META-3:** Operator is broke. Default to free-tier/zero-cost.
- **R-META-4 (IMMUTABLE):** `claude_opus_4_8` + `gpt_5_5` only as fixers/auditors. Sonnet, Gemini, Haiku **forbidden**.
- **R52:** push WIP, push early.
- **R71:** ≤5 concurrent subagent lanes.
- **R72:** **dual-lens audit on every artifact** (codified retroactively this session).
- **R74:** test:src ratio target ≥2.0; operator waiver floor 1.74.
- **R75:** zero `as any`, `as unknown as`, `@ts-ignore`, `@ts-nocheck`, `<any>` in prod code.
- **R76:** ≤400 prod LOC per file. Split if over.
- **R78:** single VERDICT line at top of every report and bottom of every PR body.
- **R82:** migrations additive, nullable-defaulted, fully reversible, DOWN.md in lockstep.
- **R86:** anti-padding. No filler tests.
- **R107:** ActivityEvent for every state-changing action.
- **R125:** RLS Tier-1 review for every new table before prod traffic.

---

## Things I would do differently if I were you

1. **Do NOT trust your own audit.** I spent hours self-grading. The operator caught it. The retroactive audit found 2 P0s and 3 P1s on code I had said was clean. **Always dispatch the dual-lens audit; never approve your own work.**
2. **Push WIP earlier.** Nothing in this session is on GitHub yet — every artifact lives in `/home/user/workspace/`. If this sandbox dies, everything (scout module, extension patches, all four FIXER/BUILD/INSTALL docs, 18 captured TrueCoach samples, 6717-line schema reference, mapping table) goes with it. **Your first push should happen the moment re-audit clears Step 1.**
3. **Use the push helper.** `/home/user/workspace/scripts/push_one.sh <repo> <remote_path> <local_path> <commit_msg>` sets author + committer to Bradley Gleave correctly and avoids R0/R3 violations.
4. **Respect autonomy mode but verify before irreversibles.** Operator is in autonomy mode. He explicitly does NOT want to be pinged for confirmation on routine decisions. He DOES want to be the one who merges PRs. Don't ask "should I…" for tactical choices; do ask for irreversibles (live prod round-trip, paid-tier signups).
5. **Capture-first works.** The TrueCoach extractor only got real because the operator pasted 4 batches of live API responses. Don't trust training-data guesses about any third-party platform's JSON shape. Operator has indicated he'll do the same DevTools-paste loop for CoachRx/MyPTHub/Trainerize/PT Distinction/FitSW.
6. **The chef trap:** the previous chef built a parallel NestJS backend that was never merged. I almost wrote ScoutModule against that ghost backend. **Always verify which backend is actually live via Fly.io / Supabase before writing migration code.**

---

## File pointers (quick reference)

```
/home/user/workspace/
├── stash_docs/
│   ├── live_state.json                                          ← machine-readable companion
│   ├── HANDOFF_AGENT_51_FROM_AGENT_50.md                        ← THIS FILE
│   ├── 2026-06-27-op-50.5-next-agent-handoff.md                 ← Op 49 doc (strategic, partially stale)
│   ├── 2026-06-27-op-50.5-sandbox-death.md                      ← Op 49 emergency stash
│   ├── 2026-06-27-M-plan-full-reconstruction.md                 ← M-series plan (still valid as parallel track)
│   └── M-NEW-LIVE-scout-proposal.md                             ← original pivot proposal (now executing)
├── scout_module/                                                ← NestJS module post-fixer
│   ├── BUILD_REPORT.md
│   ├── FIXER_REPORT.md                                          ← single VERDICT: ALL_FIXED
│   ├── ADVERSARIAL_AUDIT.md                                     ← original BLOCKED audit
│   ├── INSTALL_NOTES.md
│   ├── prisma/
│   │   ├── schema.additions.prisma                              ← hand-merge target
│   │   ├── migration.sql
│   │   └── DOWN.md
│   └── src/scout/                                               ← 21 prod + 29 spec files
├── extension_v0/                                                ← Chrome MV3 extension post-fixer
│   ├── BUILD_REPORT.md
│   ├── FIXER_REPORT.md                                          ← single VERDICT: ALL_FIXED
│   ├── RETROACTIVE_AUDIT.md                                     ← original SAFE-AS-INSTALLED audit
│   ├── INSTALL_INSTRUCTIONS.md                                  ← with new staging↔prod section
│   └── extension/                                               ← MV3 source (96/96 tests passing)
├── tgp_schema.prisma                                            ← real backend schema (6717 lines, 168 models)
├── MAPPING_TABLE.md                                             ← field-by-field, all 16 entity types
├── SCHEMA_DELTA.md
├── OPEN_QUESTIONS.md                                            ← all 15 RESOLVED (incl OQ#11)
├── INGEST_PLAN.md
├── SCOUT_MODULE_SPEC.md
├── truecoach_samples/                                           ← 18 captured JSON shapes (PII redacted)
├── tgp_importer_v0.zip                                          ← packaged extension
└── scripts/push_one.sh                                          ← R0/R3-compliant push helper
```

---

## Last thing

If the operator messages you mid-execution, **read it then continue autonomously unless he explicitly redirects**. He has stated the autonomy mandate plainly: keep moving, file decisions, finish PRs without waiting for human merge. "Check" in operator-speak means *check on subagents in flight*, not *stop*.

The architecture is sound. The strategy survived contact with reality. The blocker is process discipline — dispatch the re-audit, ship through the gate, then go capture the next platform.

— Agent 50, 2026-06-27 23:44 PDT
