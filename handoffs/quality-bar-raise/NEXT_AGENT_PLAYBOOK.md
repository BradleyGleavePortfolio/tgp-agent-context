# Next Agent Resume Playbook

**Written:** 2026-06-19 00:45 PDT by Agent 47 (parent orchestrator) at session end.
**Purpose:** Step-by-step resume sequence for the next agent picking up Wave H.

---

## STEP 0 — Read these in order (do not skip)

1. `/tmp/ctxrepo/AGENT_RULES.md` — R0-R109 (focus on R0, R3, R6, R10, R14, R16, R75, R100, R108, R109)
2. `/tmp/ctxrepo/handoffs/quality-bar-raise/HANDOFF.md` — this session's final state
3. `/tmp/ctxrepo/handoffs/quality-bar-raise/SELF_IMPROVEMENT.md` — anti-patterns to avoid
4. `/tmp/ctxrepo/handoffs/quality-bar-raise/DECISION_LOG.md` — tail last 50 lines for context

---

## STEP 1 — Verify sandbox state (or recover)

```bash
# Are repos present?
ls /tmp/ctxrepo /tmp/backend 2>&1

# If ctxrepo missing:
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/tgp-agent-context.git /tmp/ctxrepo
# api_credentials=["github"]

# If backend missing:
git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git /tmp/backend
# api_credentials=["github"]

# Set git identity (R3, NON-NEGOTIABLE):
cd /tmp/ctxrepo && git config user.email "bradley@bradleytgpcoaching.com" && git config user.name "Bradley Gleave"
cd /tmp/backend && git config user.email "bradley@bradleytgpcoaching.com" && git config user.name "Bradley Gleave"

# Update both:
cd /tmp/ctxrepo && git fetch --all --prune && git pull
cd /tmp/backend && git fetch --all --prune
```

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
