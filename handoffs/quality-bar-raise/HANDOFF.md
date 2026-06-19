# Wave H Quality Bar Raise — Final Handoff

**Author:** Agent 47 (parent orchestrator)
**Written:** 2026-06-19 00:42 PDT (session ending — credits exhausted)
**Status:** Wave H mid-flight, H2 dual-CLEAN-pending-re-audit, H4 fixer cancelled mid-push, R109 codified
**Audience:** Next agent (or operator) picking this up

**READ THIS FIRST.** Then read `NEXT_AGENT_PLAYBOOK.md` for the exact resume sequence, then `SELF_IMPROVEMENT.md` for how to avoid the mistakes this session made.

---

## 0. The TL;DR (60 seconds)

- Three PRs open: **H1 #455** (CONFLICTING, never audited), **H2 #456** (MERGEABLE, fixer done, needs re-audit), **H4 #457** (MERGEABLE, fixer cancelled mid-push, needs assessment).
- **R109 "No Half-Ass" was added tonight** to AGENT_RULES.md — read it before doing anything.
- **Wave 4 is OFF-LIMITS** — three crons own PRs #449/#451/#452/#453/#454. Don't touch.
- **The Mobile App Design Intelligence doc is at `/tmp/ctxrepo/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md`** — this is the brief for any GPT-5.5 planner you dispatch under R109 SCOPE path.
- **4 operator yes/nos** are blocking autonomous orchestration (§6 below).

---

## 1. Step-0 Onboarding (read in this exact order)

1. `/tmp/ctxrepo/AGENT_RULES.md` — R0-R109, single source of truth. Latest commit `7f7386d` added R109.
2. `/tmp/ctxrepo/QUALITY_BAR_RAISE_JOB.md` — Wave H1-H6 master plan (commit `354e49e`).
3. `/tmp/ctxrepo/handoffs/quality-bar-raise/DECISION_LOG.md` — 229 lines, Q1-Q10, every decision logged with timestamp + operator quotes.
4. `/tmp/ctxrepo/handoffs/quality-bar-raise/SELF_IMPROVEMENT.md` — anti-patterns and retro loop (read before dispatching anything).
5. `/tmp/ctxrepo/handoffs/quality-bar-raise/NEXT_AGENT_PLAYBOOK.md` — exact resume sequence.
6. `/tmp/ctxrepo/handoffs/quality-bar-raise/audit-reports/in-progress/` — 4 audit reports + 1 fixer report:
   - `H2-456-LensA-58a5f1a2.md` (12 findings, original)
   - `H2-456-LensB-58a5f1a2.md` (19 findings, original)
   - `H4-457-LensA-0f3f1ffd.md` (17 findings, original)
   - `H4-457-LensB-0f3f1ffd.md` (19 findings, original)
   - `H2-456-FIXER-c795c112.md` (27/31 resolved, 1 deferred F-A09 GPG, 3 dedup)
7. `/tmp/ctxrepo/operator-meta/BRIEF_PREAMBLE_R100.md` + `R100_AUDIT_CHECKLIST_TEMPLATE.md`
8. `/tmp/ctxrepo/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` — design doctrine for R109 SCOPE planning

**Wave 4 (PRs #449/#451/#452/#453/#454) is OFF-LIMITS.** Three crons govern it. Touch nothing inside.

---

## 2. Current Wave H Progress (verified at write-time)

### Repo state
- **ctxrepo main:** `e37ce87` (HANDOFF will push this to one higher)
- **Backend main:** `e207cc02` (untouched since Wave H started)

### H1 #455 — `WIP: Wave H1 — Quality bar raise: configs & policy files`
- **Head:** `7a280b832c0e0749c92926f35973644d62e3fcee`
- **State:** CONFLICTING with main, **never audited**
- **Content:** D-H1-1 + D-H1-2 resolved, configs/policy files only
- **Outstanding decision:** Operator yes/no #4 — dispatch audit tonight, or hold?

### H2 #456 — `ci: H2 — CI workflows, branch protection, and PR hygiene tooling`
- **Audited SHA:** `58a5f1a2` → 31 findings (Lens A 12 / Lens B 19)
- **Current head:** `c795c112` (fixer pushed 10 commits across two sessions)
- **Mergeable:** MERGEABLE
- **Fixer verdict:** `VERDICT: FIXES_COMPLETE` (27/31 resolved, 1 deferred F-A09 GPG signing — needs operator key, can't rewrite published history; 3 dedup)
- **Title now has:** `[LOC-EXEMPT: …]` + `[TEST-EXEMPT: …]` markers
- **What fixer did:** SHA-pinned every workflow, fixed expression injection in migration-dry-run, real forward-down-forward parity check, pr-checks-watcher concurrency + pagination, sbom permission tightening + DT claim fix, r100-quality-gate hard-fail >400 LOC + infra file counting, dangerfile schedule()/deleted-files/breaking-change, **infra-lint workflow** (self-grading fix), branch-protection hardening (CODEOWNERS required, GH_REPO regex, destructive-PUT warning, single-maintainer bypass docs), `.h*-status.txt` ignored.
- **Verifications passed:** `actionlint .github/workflows/*.yml` exit 0; `shellcheck scripts/setup-branch-protection.sh` exit 0; banned cast tokens = 0; `node --check dangerfile.js` OK; R3 identity verified across all 10 commits.
- **Next:** Dual re-audit Lens A+B on `c795c112` per R14. NOT dispatched (credits exhausted).

### H4 #457 — `wave-h4: PROD_READINESS_BOARD — single test, whole-codebase truth`
- **Audited SHA:** `0f3f1ffd` → 36 findings (Lens A 17 incl 1 P0 / Lens B 19)
- **Current head:** `73bca17f02fb2efd55146030d784389621a06c02` (fixer pushed 13+ commits, then **CANCELLED mid-push**)
- **Mergeable:** MERGEABLE
- **Fixer verdict:** NONE — was cancelled mid-flight at 00:42 PDT. **NO fixer report exists.** State is unknown — fixer was actively making R109-aware fixes (registered the 6 missing FEATURE_* vars, fixed `--app` flag, NUL-probe binary detection, etc.) but did not produce a verdict report.
- **What's known to be done (from PR commit log):**
  - `89229a16` closed owner enum + min description length + name-prefix owners
  - `fde0cc51` stub-scanner NUL-probe + symlink loop guards
  - `678e82c3` AWS S3 either/or credential groups (static keys OR web-identity)
  - `83cd9d66` name reporter truncation/width magic numbers as exported constants
  - `73bca17f` enable `auto_flip_on_in_prod` on 3 boolean ON-default canary flags
  - (Plus earlier commits from /tmp/backend log showing register 6 FEATURE_* vars, --app flag fix, async beforeAll discipline, etc.)
- **What's unknown:** which audit findings remain unresolved, whether tests still pass, whether the R109 banned-phrase invariant holds in the diff.
- **Next:** Manual `npm test` + `git diff main..HEAD | grep ^+ | grep -E '(Coming soon|@ts-ignore|as any|as never|\.catch\(\(\)=>(null|undefined|\{\}))'` audit on current head, THEN dual re-audit if clean.

---

## 3. R109 Was Codified Tonight (the big change)

**File:** `/tmp/ctxrepo/AGENT_RULES.md` lines 1091-1136. Commit `7f7386d`.

**Headline:** Every user-visible path produces real value or a real, actionable error. Never blank, never silent, never fake. When the feature isn't built, you BUILD IT — never remove the entry point.

**Three banned outcomes** (P0 audit findings):
1. **Stubs visible to users** — `Coming soon`, `TBD`, `placeholder`, `mock`, `fake`, `Lorem ipsum`, `Math.random()` in prod, hardcoded `test@*` emails, blank lists without empty-state, char-concat bypass detection
2. **Silent failures** — no `.catch(()=>{})`, no swallowed promises, every catch must log + surface + actionable message
3. **Removed entry points as workaround** — hiding/tree-shaking/404-ing a CTA = banned, fix is to build the feature

**Six enforcement layers** (to be built in the R109 sweep):
1. Static scanner extension (banned-phrase registry, char-concat detection)
2. ESLint `no-silent-catch` rule
3. Empty-state contract on every list/grid/chart
4. Production-bundle fake-data scanner (no `*/mocks/*`, `*/fixtures/*` in prod chunks)
5. Runtime canary middleware (staging + 1% prod sample)
6. Feature-flag truth check (extends R108) — `FEATURE_*=false` means tree-shaken, not hidden

**SCOPE path** (when finding reveals missing feature):
1. Identify entry point
2. Dispatch GPT-5.5 planner with `quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` as brief
3. Planner produces user stories, UX spec (every state), API contract, data model, acceptance criteria, LOC estimate, chunking plan ≤400 LOC/PR
4. Dispatch Opus 4.8 builders chunked per plan
5. Each chunk passes R109 itself; user-facing entry only flips live when full feature is real

**CYCLE cap = 3** for mechanical fixes. **ESCALATE** on external decisions, >3000 LOC, or ambiguous requirements.

**Operator decision on in-flight H2/H4:** **(a) let them finish** mechanical scope (no user-facing stubs in their diff), then R109 sweep across backend as next job.

---

## 4. Hybrid Chunking Plan (Phase 2, after dual-CLEAN)

Operator chose **Option C Hybrid**: finish monoliths to dual-CLEAN to amortize fix work, then cherry-pick into mini-PRs, close monoliths unmerged.

### H2 → 3 mini-PRs (~280 LOC each)
1. **release-please + sbom + migration-dry-run**
2. **pr-checks-watcher + r100-quality-gate + infra-lint**
3. **CODEOWNERS + danger + branch-protection**

### H4 → 8 mini-PRs (src/test pairs, each ≤400 LOC src)
1. registry-loader (`prod-switches.yml` parser + schema)
2. env-discovery (bracket/destructure/const resolvers — closes R108 false-negatives)
3. stub-scanner (char-concat detection + NUL binary skip + symlink guards)
4. provider-wiring (OAuth scaffolds)
5. auto-flipper (`--app` flag, appliedFlips, file-lock)
6. learning-ledger
7. reporter + keys-generator (`OPERATOR_KEYS_NEEDED.md`)
8. deploy-readiness orchestrator

Close #456 and #457 unmerged with rationale link to mini-PR series.

---

## 5. Deferred Waves (DO NOT START WITHOUT OPERATOR)

- **H3 (Observability)** — Sentry + structured logs + tracing. Gate: H1/H2/H4 all dual-CLEAN + operator yes/no #3.
- **H5 (Staging env)** — DNS + Fly app + DB clone + smoke. **OPERATOR-SUPERVISED ONLY**. Requires Fly app creation auth.
- **H6 (Audit log + circuit breakers)** — Depends on TM-8 #449 PII decision.
- **R109 sweep** — Backend-wide scan + remediation of existing violations. NEW deferred wave from tonight.

---

## 6. Open Questions Blocking Autonomous Orchestration

These are NOT answered. Default to PAUSE + ask, not guess.

1. **Auto-merge authority** for H1/H2/H4 on `dual-CLEAN + 4/4 CI + SHA stable ≥5 min`?
2. **CYCLE cap = 3** confirmed (now in R109 text), or tighter (1)?
3. **Start H3** if H1/H2/H4 all land before 5 AM PDT, or hold for R109 sweep first?
4. **Dispatch H1 #455 dual audit tonight**, or hold for operator wake-up?
5. **NEW:** When does **R109 sweep** run — immediately after H4 fixer return, or as a follow-up after the 11 mini-PR chunking series?
6. **NEW:** Does R109 SCOPE path need operator approval before dispatching GPT-5.5 planner, or is autonomous OK if estimate <3000 LOC?

---

## 7. Operational Footnotes

### 7.1 Auth & credentials
- `api_credentials=["github"]` for all `git`, `gh`, `gh pr ...`
- `api_credentials=["pplx-tool:schedule_cron"]` for cron mutations
- Git identity (R3, non-negotiable): `bradley@bradleytgpcoaching.com` / `Bradley Gleave`. No AI/Claude/Computer/Agent/Co-Authored-By/Opus tokens. "Anthropic" allowed only as provider name in scanner code.

### 7.2 Cron registry (DO NOT DISRUPT)
- `72667351` — Wave 4 overnight retry @ 2:30 AM PDT (one-shot)
- `ba50785d` — Wave 4 heartbeat `*/15 * * * *`
- `bac2d173` — Wave 4 wake-up @ 7:00 AM PDT (one-shot)
- **No Wave H crons** — pending operator yes/no #1

If Wave H crons approved:
- Heartbeat `5,25,45 * * * *` PDT (offset from Wave 4's `*/15`)
- Wake-up `15 14 * * *` UTC = 7:15 AM PDT
- State dir: `/tmp/ctxrepo/handoffs/quality-bar-raise/overnight-2026-06-19/`

### 7.3 Eviction recovery
```bash
# ctxrepo:
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/tgp-agent-context.git /tmp/ctxrepo
# backend:
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git /tmp/backend
```
Both require `api_credentials=["github"]`.

### 7.4 Verification commands
```bash
# R3 identity:
cd /tmp/backend && git log --format='%h %ae %an' main..HEAD \
  | grep -v 'bradley@bradleytgpcoaching.com Bradley Gleave' \
  && echo "FAIL R3" || echo "PASS R3"

# Banned tokens net (must be 0):
git diff main..HEAD | grep -E '^\+' \
  | grep -E '(@ts-ignore|as any|as unknown as|as never|Coming soon|\.catch\(\(\)=>(null|undefined|\{\}))' \
  | wc -l

# R108 readiness:
npm run readiness:check  # 0 unregistered expected

# H2 own-medicine:
actionlint .github/workflows/*.yml
shellcheck scripts/**/*.sh
```

### 7.5 Active subagents
- `h2_456_fixer_opus_4_8_mqkl0b3t` — **COMPLETE** (VERDICT: FIXES_COMPLETE)
- `h4_457_fixer_opus_4_8_mqkl3may` — **CANCELLED** at 00:42 PDT mid-push, no verdict report

### 7.6 Mandatory audit-brief inclusions (when re-dispatch happens)
- `BRIEF_PREAMBLE_R100.md` verbatim
- R10 (Audits Exhaustive)
- R6 (Durability — foreground pushes, no daemons)
- R3 (Operator Identity)
- R13 (Deliverable = full report + R100 checklist + checkpoint to `handoffs/audit-reports/in-progress/`)
- **R109 (NEW) — check banned-phrase registry + silent-catch + entry-point removal**
- NO pre-filled findings. Brief gives PR diff + file paths + lens charter + R100 preamble + R109 only.

---

## 8. Quick-Reference Index

| Topic | Path |
|---|---|
| Rules R0-R109 | `/tmp/ctxrepo/AGENT_RULES.md` |
| Master plan H1-H6 | `/tmp/ctxrepo/QUALITY_BAR_RAISE_JOB.md` |
| Decision log | `/tmp/ctxrepo/handoffs/quality-bar-raise/DECISION_LOG.md` |
| Audit reports | `/tmp/ctxrepo/handoffs/quality-bar-raise/audit-reports/in-progress/` |
| R100 preamble | `/tmp/ctxrepo/operator-meta/BRIEF_PREAMBLE_R100.md` |
| R100 checklist | `/tmp/ctxrepo/operator-meta/R100_AUDIT_CHECKLIST_TEMPLATE.md` |
| **Design doctrine (R109 SCOPE)** | `/tmp/ctxrepo/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` |
| Self-improvement loop | `/tmp/ctxrepo/handoffs/quality-bar-raise/SELF_IMPROVEMENT.md` |
| Next-agent playbook | `/tmp/ctxrepo/handoffs/quality-bar-raise/NEXT_AGENT_PLAYBOOK.md` |
| Backend working tree | `/tmp/backend` |
| Backend repo | `https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git` |
| ctxrepo | `https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/tgp-agent-context.git` |

---

## 9. Kill-Switches (when to STOP and PUSH operator)

The next agent MUST PAUSE + send `send_notification(channels=["push"])` if ANY of these fire:

1. **Wave 4 boundary breach** — any read/write under `handoffs/overnight-2026-06-19/` or PRs #449/#451/#452/#453/#454 from Wave H code paths
2. **R3 identity drift** — any commit with a different email/name or banned token
3. **R109 net positive** — any banned-phrase added in a PR diff
4. **Cycle cap exceeded** — same finding survives 3 fixer cycles
5. **Infra wall** — >50% of dispatched subagents return INFRA_DEATH
6. **>90 min no progress** — `last_progress.txt` stale
7. **Operator decision required** — any of the 6 open questions above blocks forward motion

---

**End of HANDOFF. Read NEXT_AGENT_PLAYBOOK.md for resume sequence, SELF_IMPROVEMENT.md for what NOT to do.**
