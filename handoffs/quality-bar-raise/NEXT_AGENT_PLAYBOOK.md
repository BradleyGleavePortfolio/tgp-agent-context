# Next Agent Resume Playbook

**Written:** 2026-06-19 00:45 PDT by Agent 47 (parent orchestrator) at session end.
**Purpose:** Step-by-step resume sequence for the next agent picking up Wave H.

---

## STEP 0 — Required reading (DO NOT SKIP, in this exact order)

You are walking into a Wave-H endgame session. Read these BEFORE touching any tool that mutates state. Use grep where noted to avoid token blowout.

### 0.1 — Dashboard (90 seconds, full read)
- `/tmp/ctxrepo/operator-meta/CHECKLIST.md` (192 lines) — pilot's cheat sheet. R-rule index, gate definitions, banned-token regex, verification commands. Memorize the gate.

### 0.2 — Current state (5 minutes, full read)
- `/tmp/ctxrepo/handoffs/quality-bar-raise/HANDOFF.md` — what landed, what's open, who owns what.
- `/tmp/ctxrepo/handoffs/quality-bar-raise/SELF_IMPROVEMENT.md` — anti-patterns from prior agents. Read all of it. The mistakes here will be YOUR mistakes if you skip.
- `tail -80 /tmp/ctxrepo/handoffs/quality-bar-raise/DECISION_LOG.md` — last decisions in order.

### 0.3 — Rules (grep on demand, do NOT full-read)
- `/tmp/ctxrepo/AGENT_RULES.md` is 1437 lines. NEVER read top-to-bottom.
- Grep targets you WILL need:
  - `grep -n "^## R0\|^## R3\|^## R16\|^## R75\|^## R100\|^## R108\|^## R109" /tmp/ctxrepo/AGENT_RULES.md` — gate-critical rules
  - `grep -n "^## R11[0-9]\|^## R12[0-6]" /tmp/ctxrepo/AGENT_RULES.md` — R110-R126 hyperscaler block
  - `grep -n "BUILD MATRIX\|UNENFORCED_RULES\|dispatch-ledger" /tmp/ctxrepo/AGENT_RULES.md` — meta-rule enforcement hooks

### 0.4 — Audit templates (grep on demand)
- `/tmp/ctxrepo/audit-templates/` — read the specific template the moment you need it. Do not pre-read all of them.

### 0.5 — Audit reports for the 3 active PRs
- `/tmp/ctxrepo/handoffs/quality-bar-raise/audit-reports/in-progress/H2-456-FIXER-c795c112.md` — H2 fixer verdict, 27/31 resolved.
- Any new audit reports landed since `da8c650` (`ls -lt /tmp/ctxrepo/handoffs/quality-bar-raise/audit-reports/`).

### 0.6 — Design doctrine (grep on demand, 109KB)
- `/tmp/ctxrepo/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` — luxury design doctrine. NEVER full-read. Grep by feature: `grep -n -i "haptic\|skeleton\|empty state\|error state" <file>`.

### 0.7 — Wave 4 boundary (READ ONLY, 30 seconds)
- `ls /tmp/ctxrepo/handoffs/overnight-2026-06-19/` — Wave 4's territory. You may READ these for context. You MUST NEVER write here, touch PRs #449/#451/#452/#453/#454, or mutate crons `72667351`, `ba50785d`, `bac2d173`.

### 0.8 — Do NOT read (token traps)
- The full backend repo source. Use targeted grep / read-by-file-path only when a specific audit finding points there.
- AGENT_RULES.md top-to-bottom.
- Any audit report from Wave 1-3 unless directly referenced.
- All `quality-references/*.md` files. They are reference, not required reading.

---

## STEP 1 — Zero-state bootstrap (verify or recover)

You may be resuming in a FRESH sandbox with nothing on disk. This sequence assumes zero state and bootstraps fully. Each verification command MUST pass before proceeding to the next.

### 1.1 — Auth
```bash
# All git/gh operations REQUIRE api_credentials=["github"]
gh auth status 2>&1 | head -5
# Expect: "Logged in to git-agent-proxy.perplexity.ai as ..."
```

### 1.2 — Clone repos (if missing)
```bash
ls /tmp/ctxrepo /tmp/backend 2>&1

# If ctxrepo missing:
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/tgp-agent-context.git /tmp/ctxrepo

# If backend missing:
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git /tmp/backend
```

### 1.3 — Set R3 identity (NON-NEGOTIABLE on both repos)
```bash
cd /tmp/ctxrepo && git config user.email "bradley@bradleytgpcoaching.com" && git config user.name "Bradley Gleave"
cd /tmp/backend && git config user.email "bradley@bradleytgpcoaching.com" && git config user.name "Bradley Gleave"

# Verify (both must print the exact pair):
cd /tmp/ctxrepo && git config user.email && git config user.name
cd /tmp/backend && git config user.email && git config user.name
```

### 1.4 — Sync to remote HEAD
```bash
cd /tmp/ctxrepo && git fetch --all --prune && git checkout main && git pull --ff-only
cd /tmp/backend && git fetch --all --prune && git checkout main && git pull --ff-only
```

### 1.5 — Verify ctxrepo doctrine state (gates the rest of the session)
```bash
# ctxrepo main must be at da8c650 or later (R110-R126 + CHECKLIST.md baseline)
cd /tmp/ctxrepo && git log --oneline -1
# Expect: da8c650 or descendant

# R126 must be present (proof the doctrine lift landed):
grep -c "^## R126" /tmp/ctxrepo/AGENT_RULES.md
# Expect: 1

# CHECKLIST.md must exist:
test -f /tmp/ctxrepo/operator-meta/CHECKLIST.md && echo "CHECKLIST.md OK" || echo "MISSING — STOP"

# All 3 Wave-H handoff docs must exist:
for f in HANDOFF.md SELF_IMPROVEMENT.md NEXT_AGENT_PLAYBOOK.md DECISION_LOG.md; do
  test -f /tmp/ctxrepo/handoffs/quality-bar-raise/$f && echo "$f OK" || echo "$f MISSING — STOP"
done
```

### 1.6 — Verify backend PR SHAs (state as of compaction)
```bash
# PR #455 H1 — should be CONFLICTING at 7a280b83 (never audited)
gh pr view 455 --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid,mergeable -q '.headRefOid + " " + .mergeable'
# Expect: 7a280b83... CONFLICTING (or newer if Wave 4 woke up)

# PR #456 H2 — should be MERGEABLE at c795c112 (fixer FIXES_COMPLETE)
gh pr view 456 --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid,mergeable -q '.headRefOid + " " + .mergeable'

# PR #457 H4 — should be MERGEABLE at 73bca17f (fixer CANCELLED mid-push, no verdict)
gh pr view 457 --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid,mergeable -q '.headRefOid + " " + .mergeable'
```

### 1.7 — Verify safety branch (orphan H4 tests preserved)
```bash
gh api repos/BradleyGleavePortfolio/growth-project-backend/branches/wave-h4-orphan-tests-snapshot-2026-06-19 -q .name
# Expect: wave-h4-orphan-tests-snapshot-2026-06-19
```

### 1.8 — Verify Wave 4 crons alive (READ ONLY)
```bash
pplx-tool list_crons <<'JSON'
{}
JSON
# Look for active: 72667351 (overnight 2:30 AM), ba50785d (heartbeat */15), bac2d173 (wake-up 7:00 AM).
# If any are missing or paused: STOP and notify operator. Do not recreate Wave 4 crons.
```

### 1.9 — Self-test: write a banned-token check against your own draft
```bash
# Before ANY commit you author, run this on your staged diff:
cd /tmp/<repo> && git diff --cached | grep -E '^\+' | grep -E '(@ts-ignore|as any|as unknown as|as never|Coming soon|\.catch\(\(\)=>(null|undefined|\{\}))'
# Output MUST be empty. If not, fix before committing.
```

If any verification in STEP 1 fails, STOP and write a panic note to `/tmp/ctxrepo/handoffs/quality-bar-raise/RESUME_PANIC.md` describing what failed, then notify operator. Do not proceed to STEP 2 with a degraded baseline.

---

## STEP 2 — Check Wave 4 boundary (do not cross)

```bash
# Wave 4 owns these PRs (READ ONLY for context, NEVER WRITE):
# #449, #451, #452, #453, #454
# State at handoffs/overnight-2026-06-19/

# Wave 4 crons (DO NOT MUTATE):
# 72667351, ba50785d, bac2d173

# Your work surface ONLY:
# handoffs/quality-bar-raise/
```

If you find yourself reading Wave 4 state for any reason other than "is the cron still running?" — STOP.

---

## STEP 3 — Get current Wave H PR state

```bash
for pr in 455 456 457; do
  gh pr view $pr --repo BradleyGleavePortfolio/growth-project-backend \
    --json headRefOid,mergeable,title,statusCheckRollup \
    --jq '"PR #'$pr': " + .headRefOid[0:8] + " " + .mergeable + " " + .title'
done
```

Expected at session end:
- **#455** `7a280b83 CONFLICTING WIP: Wave H1 — Quality bar raise: configs & policy files`
- **#456** `c795c112 MERGEABLE ci: H2 — CI workflows, branch protection, and PR hygiene tooling`
- **#457** `73bca17f MERGEABLE wave-h4: PROD_READINESS_BOARD — single test, whole-codebase truth`

If any SHA changed: ANOTHER AGENT IS RUNNING. Stop and check `last_progress.txt` for activity within last 10 min before doing anything else.

---

## STEP 4 — Decide what to do (decision tree)

### Branch A: H2 #456 needs dual re-audit on `c795c112`
The H2 fixer returned `VERDICT: FIXES_COMPLETE` but dual re-audit was never dispatched (credits exhausted). Path:

1. Read `handoffs/quality-bar-raise/audit-reports/in-progress/H2-456-FIXER-c795c112.md` for fixer's claims.
2. Dispatch dual `codebase` subagents (NOT parallel — sequential, one per lens) with brief containing:
   - `operator-meta/BRIEF_PREAMBLE_R100.md` verbatim
   - R10 (Audits Exhaustive) verbatim
   - R109 verbatim from AGENT_RULES.md lines 1091-1136
   - PR diff: `gh pr diff 456 --repo BradleyGleavePortfolio/growth-project-backend`
   - Lens charter (A = security/perf/data per R100; B = arch/test/observability/A1-A3)
   - **NO pre-filled findings**
   - R16 verdict line requirement
   - Checkpoint path: `handoffs/quality-bar-raise/audit-reports/in-progress/H2-456-Lens{A,B}-c795c112.md`
3. Classify verdict per R16. If dual-CLEAN + operator authorizes auto-merge (open Q #1) → merge. Else CYCLE per R109.

### Branch B: H4 #457 needs assessment first (fixer cancelled)
The H4 fixer was cancelled mid-push at `73bca17f`. No verdict report exists. Path:

1. Read all commits between `0f3f1ffd` and `73bca17f`:
   ```bash
   gh pr view 457 --repo BradleyGleavePortfolio/growth-project-backend --json commits --jq '.commits | .[] | .oid[0:8] + " " + .messageHeadline'
   ```
2. Run banned-token sweep on current diff:
   ```bash
   cd /tmp/backend && git fetch origin && git checkout quality-bar-h4-prod-readiness
   git diff origin/main..HEAD | grep -E '^\+' | grep -E '(@ts-ignore|as any|as unknown as|as never|Coming soon|\.catch\(\(\)=>(null|undefined|\{\}))' | head -20
   # MUST be empty
   ```
3. Check the orphan tests on safety branch `wave-h4-orphan-tests-snapshot-2026-06-19`:
   ```bash
   git fetch origin wave-h4-orphan-tests-snapshot-2026-06-19
   git log origin/wave-h4-orphan-tests-snapshot-2026-06-19 --oneline -5
   ```
   These 894 LOC of tests (env-discovery, provider-wiring, registry-loader, stub-scanner) were valuable work — decide whether to cherry-pick into PR #457 or into a mini-PR after Hybrid chunking.
4. If tests still pass and diff is R109-clean → dispatch dual re-audit on `73bca17f` (same brief structure as Branch A but `Lens{A,B}-73bca17f.md`).

### Branch C: H1 #455 unaudited and CONFLICTING
Lowest priority unless operator answers yes to "dispatch H1 audit tonight" (open Q #4). Path:

1. Rebase: `git checkout quality-bar-h1-config && git rebase origin/main` — resolve conflicts.
2. Push force-with-lease.
3. Dispatch dual audit.

### Branch D: R109 sweep (post-Wave-H)
After H1/H2/H4 are dual-CLEAN, run the R109 backend-wide sweep:

1. Scan for banned phrases in user-visible paths (routes/, components/, emails/, push/, copy/).
2. Scan for silent catches.
3. Scan for fake-data imports in prod bundles.
4. For each finding: identify entry point → R109 SCOPE path → GPT-5.5 planner using `quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` → Opus 4.8 builder(s).

---

## STEP 5 — Operator yes/nos to get before autonomous mode

These 6 are blocking. Until answered, default to PAUSE + ask:

1. **Auto-merge authority** for H1/H2/H4 on dual-CLEAN + 4/4 CI + SHA stable ≥5 min?
2. **CYCLE cap = 3** confirmed (in R109), or tighter (1)?
3. **Start H3 (observability)** if H1/H2/H4 land before 5 AM PDT?
4. **Dispatch H1 #455 audit tonight**, or hold?
5. **R109 sweep timing** — right after H4 dual-CLEAN, or after Hybrid mini-PR chunking?
6. **R109 SCOPE path autonomy** — dispatch GPT-5.5 planner without operator OK if <3000 LOC, or always ask?

---

## STEP 6 — After each PR cycle closes (retro)

Append to `handoffs/quality-bar-raise/RETROS.md` per `SELF_IMPROVEMENT.md` §1 template.

---

## STEP 7 — Going idle / ending session

Before ending:
1. `git add -A && git commit -m "wave-h: SAFETY SNAPSHOT — session end <ISO>"` in BOTH `/tmp/ctxrepo` and `/tmp/backend`
2. Push both
3. Update `HANDOFF.md` §2 with current PR SHAs
4. Update `DECISION_LOG.md` with what you did this session
5. Verify: `cd /tmp/ctxrepo && git status --short` is empty; `cd /tmp/backend && git status --short` is empty
6. Send in_app notification with summary

---

## CRITICAL REFERENCE COMMANDS

```bash
# R3 identity check (per PR):
cd /tmp/backend && git checkout <branch> && git log --format='%h %ae %an' main..HEAD \
  | grep -v 'bradley@bradleytgpcoaching.com Bradley Gleave' \
  && echo "FAIL R3" || echo "PASS R3"

# Banned-token sweep (must return 0):
cd /tmp/backend && git diff main..HEAD | grep -E '^\+' \
  | grep -E '(@ts-ignore|as any|as unknown as|as never|Coming soon|\.catch\(\(\)=>(null|undefined|\{\}))' \
  | wc -l

# R109 banned-phrase sweep (broader, must return 0 on net additions):
cd /tmp/backend && git diff main..HEAD | grep -E '^\+' \
  | grep -iE '(coming soon|tbd|stay tuned|lorem ipsum|placeholder|mock|fake|dummy|sample data|todo:|fixme:|xxx:)' \
  | wc -l

# R108 readiness check:
cd /tmp/backend && npm run readiness:check  # must show 0 unregistered

# CI rollup:
gh pr checks <PR#> --repo BradleyGleavePortfolio/growth-project-backend
```

---

## KILL-SWITCH TRIGGERS (immediate PUSH)

Send `send_notification(channels=["push"])` and HALT for any of:
- Same finding survives 3 fixer cycles
- Banned token net positive in any diff
- Wave-4 boundary crossed
- R3 identity drift
- >50% subagents INFRA_DEATH
- `last_progress.txt` >90 min stale
- Any open Q above blocks all forward branches

---

**Good luck. Read the rules. Chunk small. Self-grade hard. Push often.**
