# CHECKLIST — The Pilot's Cheat Sheet

**Purpose:** Grep-able quick-reference for every R-rule. Read THIS before every commit, push, dispatch, or merge. Full rule text lives in `AGENT_RULES.md` — this file is the cockpit checklist.

**Updated:** 2026-06-19 — covers R0-R126.
**Owner:** Bradley Gleave <bradley@bradleytgpcoaching.com>

---

## ⚡ BEFORE EVERY COMMIT

```
[ ] R3   Identity:        git config user.email = bradley@bradleytgpcoaching.com
[ ] R3   Identity:        git config user.name  = Bradley Gleave
[ ] R3   Message scrub:   no AI/Claude/Computer/Agent/Co-Authored-By/Opus tokens
[ ] R75  Cast tokens:     no @ts-ignore / as any / as unknown as / as never in diff
[ ] R109 Banned literals: no "Coming soon" / TBD / placeholder / mock / fake in diff
[ ] R109 Silent catch:    no .catch(()=>null|undefined|{}) in diff
[ ] R110 Secrets:         gitleaks protect --staged --redact exit 0
[ ] R111 Unused:          no unused imports/locals (tsc + ESLint)
[ ] R112 Lint clean:      npm run lint exit 0
[ ] R114 Floating ver:    no ^/~/* in package.json; lockfile present
[ ] R119 Crypto:          no md5/sha1/des/3des/rc4 in diff (unless // crypto-allowed:)
```

One-liner: `npm run lint && npm run typecheck && gitleaks protect --staged --redact && git diff --cached | grep -E '^\+' | grep -E '(@ts-ignore|as any|as unknown as|as never|Coming soon|placeholder|mock|fake|md5|sha1|\.catch\(\(\)=>(null|undefined|\{\}))' && echo "FAIL" || echo "PASS"`

---

## ⚡ BEFORE OPENING A PR

```
[ ] R100.A3 LOC:           net src LOC ≤ 400 (count infra files) — or [LOC-EXEMPT: <reason>] in title
[ ] R100.A1 Test ratio:    test:src ratio ≥ 2.0 — or [TEST-EXEMPT: <reason>] in title
[ ] R116 Coverage:         changed-files line coverage ≥ 80% — or [COVERAGE-EXEMPT: <reason>]
[ ] R117 Assertions:       every it()/test() has expect() — ESLint catches
[ ] R123 No empty pass:    no .skip() without test/QUARANTINE.md entry
[ ] R81  Conv commits:     title is feat:|fix:|ci:|docs:|chore:|refactor:|test:|perf:|build:
[ ] R76  Exception form:   if any [*-EXEMPT:] marker, body has R76 Exception Request block
[ ] R125 Self-grade:       if PR adds CI gate, this PR PASSES that gate
[ ] R124 Build matrix:     PR body has BUILD MATRIX block with all SHAs
```

---

## ⚡ BEFORE DISPATCHING A SUBAGENT

```
[ ] Type:                  codebase = AUDIT ONLY; general_purpose = fixer; etc.
                           NEVER codebase to BUILD features (operator pivot #1)
[ ] R10  Brief content:    PR diff + file paths + lens charter + R100 preamble + R109
[ ] R10  No pre-fill:      no hints, no hypotheses, no expected findings
[ ] R16  Verdict line:     brief states "end with VERDICT: CLEAN|FINDINGS|REFUSAL|INFRA_DEATH"
[ ] R13  Checkpoint:       brief specifies handoffs/<wave>/audit-reports/in-progress/...md
[ ] R124 BUILD MATRIX:     brief contains BUILD MATRIX block (backend SHA, ctxrepo SHA, PR head)
[ ] R126 Ledger entry:     append predicted verdict to handoffs/<wave>/dispatch-ledger.jsonl
[ ] R6   No daemons:       brief forbids background processes, requires foreground pushes
```

---

## ⚡ BEFORE MERGING A PR

```
[ ] R14  Dual-CLEAN:       Lens A + Lens B both VERDICT: CLEAN on CURRENT head SHA
[ ] R14  CI green:         4/4 required checks pass (gh pr checks <#>)
[ ] R14  SHA stable:       head SHA unchanged for ≥5 minutes
[ ] R3   Identity sweep:   git log --format='%ae %an' main..HEAD | sort -u = one line
[ ] R75  Banned tokens:    net 0 in diff (full grep above)
[ ] R109 Banned literals:  net 0 in diff
[ ] R108 Env registry:     npm run readiness:check shows 0 unregistered
[ ] R122 Branch protect:   live config matches branch-protection.yml
[ ] R110-R120 Required:    all R110-R120 CI gates green where applicable
[ ] OPERATOR Auto-merge:   operator has explicitly authorized auto-merge for this wave
[ ] R124 SHA pinned:       audit reports reference current head SHA, not stale
```

If ANY box unticked: DO NOT MERGE. Pause, log, escalate per kill-switch list.

---

## ⚡ BEFORE CLOSING A SESSION

```
[ ] R6   Foreground push:  cd /tmp/ctxrepo && git status --short = empty
[ ] R6   Foreground push:  cd /tmp/backend && git status --short = empty
[ ] R124 SHAs recorded:    HANDOFF.md §2 has current head SHA per PR
[ ] R126 Ledger flushed:   dispatch-ledger.jsonl has return entries for all dispatches
[ ] Decision log:          DECISION_LOG.md has entry for this session's work
[ ] last_progress.txt:     ISO timestamp updated
[ ] Subagents:             none orphaned (cancel_subagent any abandoned)
[ ] Workspace:             /home/user/workspace files mirrored to ctxrepo if valuable
```

---

## 🚨 KILL-SWITCHES — STOP AND PUSH OPERATOR

| Trigger | Action |
|---|---|
| Same finding survives 3 fixer cycles | STUCK + PUSH + FINDING_STUCK.md |
| Banned token net positive in diff | BLOCK MERGE + PUSH + BANNED_TOKEN_LEAK.md |
| Wave-4 boundary crossed (PRs #449/#451/#452/#453/#454 or handoffs/overnight-2026-06-19/) | REVERT + PUSH + BOUNDARY_BREACH.md |
| R3 identity drift (any non-Bradley commit) | FORCE-REVERT + PUSH + IDENTITY_DRIFT.md |
| >50% subagents return INFRA_DEATH | HALT DISPATCH + PUSH + INFRA_WALL.md |
| last_progress.txt >90 min stale | PUSH + PANIC.md |
| R124 SHA drift mid-audit | VERDICT: INFRA_DEATH on that audit + RESTART |
| External decision required (provider, pricing, PII, legal) | PAUSE that branch + PUSH |
| LOC estimate >3000 src for one SCOPE feature | PAUSE + propose split + PUSH |

PUSH = `send_notification(channels=["push"], title=..., body=...)`. In-app only is INSUFFICIENT for any of the above.

---

## 🎯 DECISION HEURISTIC (top-to-bottom, stop at first match)

1. Is this Wave 4 surface? → STOP, not my job.
2. Is this a user-visible stub / silent failure / removed entry point? → R109 SCOPE path (GPT-5.5 planner → Opus 4.8 builder). NEVER cycle.
3. Is this a mechanical CI/scanner/lint fix? → CYCLE allowed (cap 3).
4. Does this finding survive 3 cycles? → STUCK + PUSH operator.
5. External decision needed? → ESCALATE + PUSH.
6. LOC estimate >400 src? → CHUNK before building.
7. Adding a CI gate? → run it on self FIRST (R125).
8. Adding a string? → check ban-lists (R75 + R109) first.
9. About to dispatch codebase subagent to BUILD? → STOP. Build it yourself.
10. Unsure? → ask operator. Cheaper than guessing wrong.

---

## 🔑 R-RULE INDEX (one-liner each)

| R# | Headline |
|---|---|
| R0 | Decacorn quality — would Apple/Notion/Google do this? |
| R3 | Every commit signed bradley@bradleytgpcoaching.com / Bradley Gleave |
| R6 | Foreground pushes only — NO daemons |
| R10 | Audits exhaustive — produce findings operator doesn't have |
| R11 | Auditor independence — no pre-filled briefs |
| R13 | Deliverable = full report + R100 checklist + checkpoint to in-progress/ |
| R14 | Merge gate: dual-CLEAN + 4/4 CI + SHA stable ≥5min + R3 |
| R16 | Every subagent return ends with VERDICT line or STUCK escalation |
| R75 | Zero net banned cast tokens (@ts-ignore, as any, as never, etc.) |
| R76 | Exception requests filed inline in PR body |
| R81 | Conventional Commits for PR titles |
| R100 | PROD_READINESS_BOARD; A1 test:src ≥2.0; A2 cast ban; A3 LOC ≤400 |
| R104 | No `any` / lazy casts in TS code |
| R108 | Every new env var registers in prod-switches.yml or CI fails |
| R109 | No half-ass: no stubs, no silent failures, no removed entry points — BUILD the feature |
| R110 | Secrets scanning pre-commit + CI (gitleaks) |
| R111 | No unused imports/locals (tsc + ESLint) |
| R112 | Strict typing teeth (ESLint enforces R75/R104) |
| R113 | CVE thresholds block (HIGH/CRITICAL >7 days old) |
| R114 | No floating versions (~/^/* banned in package.json) |
| R115 | SBOM per PR build (CycloneDX, retained ≥30d) |
| R116 | Diff coverage ≥80% on changed files |
| R117 | Every test has expect() (ESLint enforced) |
| R118 | SAST required (Semgrep + CodeQL, HIGH/CRITICAL blocks) |
| R119 | No deprecated crypto (md5/sha1/des/3des/rc4) |
| R120 | IaC security misconfig scanning (checkov on workflows + Dockerfile + fly.toml) |
| R121 | GIT_SHA embedded in every artifact + /api/version endpoint |
| R122 | Branch protection enforced (reviews + status + CODEOWNERS + no force-push) |
| R123 | No empty-pass tests (--passWithNoTests=false; .skip() requires QUARANTINE entry) |
| R124 | Every audit/dispatch records exact SHAs (BUILD MATRIX block) |
| R125 | Every R-rule has 3 enforcers (law + CI gate + audit lens); else UNENFORCED_RULES.md |
| R126 | Every dispatch JSONL-logged with predicted vs actual verdict (self-improvement data) |

---

## 📂 CANONICAL FILE PATHS

| What | Path |
|---|---|
| The rules | `/tmp/ctxrepo/AGENT_RULES.md` |
| This checklist | `/tmp/ctxrepo/operator-meta/CHECKLIST.md` |
| Audit brief preamble | `/tmp/ctxrepo/operator-meta/BRIEF_PREAMBLE_R100.md` |
| Audit checklist template | `/tmp/ctxrepo/operator-meta/R100_AUDIT_CHECKLIST_TEMPLATE.md` |
| Unenforced rules ledger | `/tmp/ctxrepo/operator-meta/UNENFORCED_RULES.md` |
| Design doctrine (R109 SCOPE) | `/tmp/ctxrepo/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` |
| Master plan H1-H6 | `/tmp/ctxrepo/QUALITY_BAR_RAISE_JOB.md` |
| Decision log | `/tmp/ctxrepo/handoffs/quality-bar-raise/DECISION_LOG.md` |
| Final handoff | `/tmp/ctxrepo/handoffs/quality-bar-raise/HANDOFF.md` |
| Self-improvement loop | `/tmp/ctxrepo/handoffs/quality-bar-raise/SELF_IMPROVEMENT.md` |
| Resume playbook | `/tmp/ctxrepo/handoffs/quality-bar-raise/NEXT_AGENT_PLAYBOOK.md` |
| Audit reports in-flight | `/tmp/ctxrepo/handoffs/quality-bar-raise/audit-reports/in-progress/` |
| Backend tree | `/tmp/backend` |
| Backend repo URL | `https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git` |
| Ctxrepo URL | `https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/tgp-agent-context.git` |

---

**This file is the dashboard. AGENT_RULES.md is the law book. Read this every action. Read the law book on demand.**
