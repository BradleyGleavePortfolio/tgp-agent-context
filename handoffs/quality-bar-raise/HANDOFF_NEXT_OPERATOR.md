# Wave H Endgame — Handoff to Next Operator

**Save point:** 2026-06-19 ~2:20 PM PDT (after R4 fixer cycle)
**Reason for cut:** Credit budget — 5k of 45k remaining; R5 dual-lens audit would exceed remaining budget.

---

## Bottom line

5 of 8 H4 split PRs merged. 3 PRs remain (H4.B, H4.D, H4.F) — all at R4-fixed heads with 10/10 CI green. Next operator picks up at **R5 dual-lens audit dispatch**.

H1, H2, H3, H5, H6, H4.H, branch protection, migration repair, R109 sweep, OPERATOR_ATTACH.md aggregation — all still pending downstream.

---

## State at save point

### Merged this session (7 PRs)
| Job | PR | Merge SHA |
|---|---|---|
| H1 | #455 | `b65266c7` |
| H2 | #456 | `ceaa759c` |
| H4.A | #458 | `86800008` (4 audit rounds) |
| H4.E learning-ledger | #460 | `fb8768d3` |
| H4.G1 reporter | #461 | `ff8a4e68` |
| H4.G2 operator-keys-generator | #462 | `210f4eb7` |
| H4.C stub-scanner | #463 | `8467c6f5` ← **current `main`** |

### Open PRs blocked on R5+
| PR | Job | R4 head | CI | R5 status |
|---|---|---|---|---|
| #464 | H4.B env-discovery | _(see "live heads" below)_ | _(see below)_ | NOT STARTED |
| #465 | H4.D provider-wiring | _(see "live heads" below)_ | _(see below)_ | NOT STARTED |
| #466 | H4.F auto-flipper (HIGH-RISK) | `c624492e8c24870f76ced2c82764e0c18ff13cd6` | 10/10 ✅ | NOT STARTED |

### Live heads (filled in at session end — see Appendix A below)
- **#464 R4 head:** _(pending H4.B fixer return — check `refs/heads/wip/h4b-env-discovery-fixer-r4-final-20260619`)_
- **#465 R4 head:** _(pending H4.D fixer return — check `refs/heads/wip/h4d-provider-wiring-fixer-r4-final-20260619`)_
- **#466 R4 head:** `c624492e8c24870f76ced2c82764e0c18ff13cd6` (confirmed)

### Long-running blocked items
| Item | Status | Blocker |
|---|---|---|
| H3 #459 | OPEN @ `82abaaf0` | Forward-migration repair (operator decisions pending) |
| H4.H orchestrator | NOT STARTED | Depends on H4.A-G merged |
| H5 (staging config + OPERATOR_ATTACH) | NOT STARTED | Brief ready; waits on H4.H |
| H6 | BLOCKED | TM-8 #449 still OPEN @ `d4a0eb0d` |
| Branch protection on `main` | BLOCKED | GitHub Free private repo — must be in OPERATOR_ATTACH |
| Migration repair | BLOCKED | 3 operator architectural decisions (see below) |
| R109 codebase sweep | NOT STARTED | After H4.H lands |
| OPERATOR_ATTACH.md aggregation | NOT STARTED | After all H jobs land |

---

## Operator decisions — RESOLVED 2026-06-19 (drive migration repair PRs with these)

### Decision 1: `sub_coach` role — **Option D (lookup table)** — LOCKED
- Operator chose the hyperscaler-shaped fix: tear out the Postgres `coach_role` enum, replace with a `roles` lookup table.
- Rationale: operator is at zero users, so this is the cheap window for a one-way-door architectural change. Enums in Postgres are sticky (ADD VALUE works, REMOVE doesn't without a full column-type rewrite) — moving to a lookup table now avoids paying that cost later, every time a new role appears.
- Required migration shape (rough sketch — auditor verifies):
  1. `CREATE TABLE roles (id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, tier INT NOT NULL, permissions JSONB NOT NULL DEFAULT '{}')`
  2. Seed `head_coach`, `assistant_coach`, `sub_coach`, plus any other existing enum values
  3. Add `users.role_id INT REFERENCES roles(id)` (nullable first)
  4. Backfill `users.role_id` from `users.role` (enum) via JOIN on `roles.name`
  5. `ALTER COLUMN users.role_id SET NOT NULL`
  6. Drop `users.role` (enum column) AND drop the `coach_role` TYPE
  7. Rewrite RLS policies in `20260702000000_fix_workout_rls_coach_role` to reference `roles.tier` (e.g., `tier >= 10` for head, `tier >= 5` for assistant, `tier >= 1` for sub) or `roles.permissions ? 'manage_workouts'` (JSONB containment)
- DO NOT pick Option A (just ADD VALUE to enum) — operator explicitly chose Option D.
- DO NOT pick Option B (RLS rewrite without enum change) — doesn't solve the underlying problem.
- DO NOT pick Option C (defer) — operator wants this done in the repair PR.
- IMPORTANT: This is a meaningful migration. The repair PR should ship it as its own commit (or its own PR if Decision 3B applied), with the RLS rewrite as a follow-on commit referencing the new schema.

### Decision 2: `CREATE INDEX CONCURRENTLY` — **Option B (drop CONCURRENTLY)** — LOCKED
- Operator confirmed zero users → no traffic → no lock-contention risk.
- Replace `CREATE INDEX CONCURRENTLY ...` with plain `CREATE INDEX ...`.
- Result: fits inside Prisma's transaction wrapper, atomic rollback on failure (no orphaned invalid index), no `-- prisma-no-transaction` marker needed.
- DO NOT pick Option A (`-- prisma-no-transaction`) — introduces real failure mode (orphan invalid index needs manual cleanup) for zero benefit at this scale.
- DO NOT pick Option C (defer) — fix is trivial; ship it.

### Decision 3: bundling — **Option B (split by risk class)** — LOCKED
- Two repair PRs:
  - **PR-Safe:** the `CREATE INDEX` fix (Decision 2B). Mechanically simple, atomic, low audit surface.
  - **PR-Risky:** the `roles` lookup-table migration (Decision 1D) + the RLS rewrite. Higher audit surface — touches schema, RLS, and backfill. Audited under the full dual-lens R1-R126 doctrine.
- DO NOT pick Option A (one PR) — different failure modes deserve different audit eyes; mixing them invites the auditors to under-scrutinize the risky migration.
- DO NOT pick Option C (one PR per migration) — overkill, wastes audit cycles.

---

## Operating contract (binding for next operator)

### Identity rules
- **Prod repo (`growth-project-backend`):** Every commit author + committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. ZERO AI/Claude/Computer/Agent/Anthropic/Perplexity/OpenAI/GPT/Co-Authored-by tokens. NO FALLBACK EVER.
- **Context repo (`tgp-agent-context`) ONLY:** Operator-approved fallback `Claude Auditor <auditor@bradleytgpcoaching.com>` if the sandbox safety classifier blocks the Bradley identity (Opus 4.8 sometimes does). Operator will rewrite history post-merge. NEVER use this on `growth-project-backend`.

### Auto-merge gate (R14)
- Dual-lens CLEAN (Lens A Opus 4.8 + Lens B GPT-5.5)
- CI 10/10 green
- ≥5 min SHA stability

### Audit doctrine (binding — locked at R2)
- **Exhaustive:** "FIND ANY P0-P3 AT ALL, SEARCH EXHAUSTIVELY, THERE IS NO 'ENOUGH' UNLESS YOU FIND EVERYTHING" — not just close prior findings
- **R1-R126 coverage:** Every audit emits a DOCTRINE RULE COVERAGE table touching every rule (APPLIES+PASS / APPLIES+FAIL / N/A with reason)
- **Live-push agent sovereignty:** Every finding = one commit pushed immediately to `tgp-agent-context/handoffs/quality-bar-raise/audit-reports/`. Filename convention: `H4-split-{lensA,lensB}-R{N}-PR{number}-LIVE.md`. Survives auditor crashes.
- Full doctrine: `/home/user/workspace/audit_briefs/EXHAUSTIVE_AUDIT_DOCTRINE.md`

### Mixed-lens protocol
- Lens A = Opus 4.8 (depth, doctrine mapping, root cause)
- Lens B = GPT-5.5 (breadth, enumeration, pattern classes)
- "1 per HALF" — 2 audit agents total per round
- Take **union** of findings; both lenses must independently return CLEAN to advance

### LOC exemption convention
- H4 split PRs are test-harness only (`test/prod-readiness/*`) → 0 genuine prod LOC
- PR title gets `[LOC-EXEMPT]` marker via REST PATCH (CI A3 floor would otherwise fail on test-only diffs)

### Subagent limits
- Cap parallel subagents at 3-4 (6+ caused `npm ci` OOM)
- Use Opus 4.8 for fixers (depth)
- For audits: 1 Opus (Lens A) + 1 GPT-5.5 (Lens B) per half

### Session-end discipline (MANDATORY)
Before ending any session you MUST:
1. Write `/home/user/workspace/current-state.json` with the latest state (schema below).
2. If anything material changed (new PR head, new doctrine clause, new lesson learned), update `/home/user/workspace/HANDOFF_NEXT_OPERATOR.md`.
3. Push a copy of the handoff doc to `tgp-agent-context/handoffs/quality-bar-raise/HANDOFF_NEXT_OPERATOR.md` for durability outside the sandbox.
4. Append any new failure mode to `/home/user/workspace/LESSONS_FROM_PRIOR_INSTANCES.md` (create if missing).

The next instance's `START_HERE.md` flow REQUIRES `current-state.json` to exist and be fresh. A missing or stale state file means your handoff failed.

### State-update triggers (DURING session — MANDATORY)
Do NOT batch state updates to session end. Update `current-state.json` IMMEDIATELY at every one of these events:
- A PR merges (record `merge_sha`, move out of `open_prs`, into `merged_this_wave`)
- A fixer subagent returns with a new head SHA (update `open_prs[<num>].head` + `ci` + `stage` + `snapshot_ref`)
- An audit round completes (update `stage` to next round)
- A decision is locked (update `locked_decisions`)
- A blocker resolves or a new one appears (update `blockers`)
- `next_action` changes (update the one-sentence field)

Workflow for orchestrator receiving a subagent return:
1. Read return message
2. **Update `current-state.json` for that PR's entry** (one tool call: `read` then `write`)
3. Then proceed to next action

This converts the brittle "remember at end" obligation into many small writes that happen as work happens. By the time the session ends, the file is already current.

#### `current-state.json` schema (strict)
```json
{
  "as_of": "ISO-8601 UTC",
  "main_sha": "full SHA of growth-project-backend main HEAD",
  "open_prs": [
    {"num": 464, "name": "H4.B env-discovery", "head": "SHA", "ci": "10/10|N/M", "stage": "R{N}-{audit|fixer|merged}", "snapshot_ref": "wip/..."}
  ],
  "merged_this_wave": [{"num": 463, "merge_sha": "..."}],
  "locked_decisions": {"d1": "D", "d2": "B", "d3": "B"},
  "next_action": "single sentence describing what the next instance should do first",
  "blockers": ["short list of external blockers"],
  "credits_burn_estimate_remaining": "25-30k"
}
```

### Subagent self-update obligation (every fixer brief MUST include this clause)
Every fixer brief written for this wave (R5+, H4.H, H5, H6, migration repair) must end with:

```
N. Before replying, update /home/user/workspace/current-state.json:
   - read the existing file
   - modify the entry for this PR in open_prs (head, ci, stage, snapshot_ref)
   - write back
   - mention "current-state updated" in your reply
```

Rationale: subagents are deterministic about following briefs. Putting the state-write in the brief means the subagent updates its own PR entry before the orchestrator even sees the return message. Orchestrator still owns the global view, but per-PR state is self-maintained by the agent that just changed it.

### Repo essentials
- Test framework: **Jest** (NOT Vitest — repeated source of confusion)
- Backend access: PRIVATE repo `BradleyGleavePortfolio/growth-project-backend` via proxy `https://git-agent-proxy.perplexity.ai/...`
- Context repo: `BradleyGleavePortfolio/tgp-agent-context`
- All gh/git via `api_credentials=["github"]`

---

## R4 findings closed by R4 fixers (verification reference)

### PR #464 H4.B — F001 P2 (R59/R65/R109)
- **Root cause:** `collectStringConsts.countBindings` counted only `ts.isVariableDeclaration` — function parameters, arrow-function parameters, and catch-clause variables NOT counted toward fail-closed binding map
- **Effect:** false-positive env-var fabrication (mis-classifies dynamic `process.env[K]` reads as known-string-const reads when a same-named file-scope const exists)
- **Fix:** count `ts.isParameter` (with Identifier name) and catch-clause variables toward `bindingCounts`; any name with `bindingCounts > 1` drops from resolvable map (fail-closed)
- **Regression test cases:** function-param shadow, arrow-param shadow, catch-clause shadow, catch w/o file const, param w/o file const

### PR #465 H4.D — F001 P1-P2 (R30/R31/R40/R108)
- **Root cause:** Supabase JWT validator gated on `payload.role === "service_role"` but never validated header `alg`
- **Effect:** `alg=none` + crafted service_role payload classified WIRED (signature-bypass-class)
- **Fix:** parse JWT header (try/catch, size cap), reject if `alg` missing / `none` (case-insensitive) / not in allowlist `{HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384}` BEFORE role gate
- **Regression test cases:** alg=none, alg=NONE, alg=garbage, alg=HS256 ✓, alg=ES256 ✓, missing header, malformed header, alg=HS256+anon ✗

### PR #466 H4.F — F001 P1 + F002 P1 (HIGH-RISK)
- **F001 root cause:** YAML block-scalar chomping (`|-`, `|+`, `>-`, `>+`) and indentation (`|2`, `|2-`, etc.) indicators not matched by inline pass-f guard OR by `redactYamlBlockScalars` pass-h header regex
- **F001 effect:** header rewrote to `***` destroying the indicator → pass-h had no anchor → continuation lines holding the secret LEAKED on no-`secretValues` sinks (`flip()` RegistryParseError at line 1008; `flyArgvContext` at line 781)
- **F001 fix (DEFENSE-IN-DEPTH, R125):** BOTH enforcers extended to recognize `^[|>]([+-]?)([0-9]?)([+-]?)$` grammar; pass-f leaves header intact; pass-h anchors on the full grammar and redacts continuation lines
- **F002 root cause:** FLY_BIN cache stored only resolved path — same-path/different-inode replacement between cache and exec was not detected
- **F002 fix:** capture `{dev, ino, mtimeNs, size, mode}` at cache-fill; compare all 5 fields on every revalidation; throw `FlyBinIdentityMismatch` on any mismatch
- **Verification:** 243/243 prod-readiness tests pass (+20 new); 10/10 CI green

---

## Next operator's first steps (R5 dispatch)

### Prerequisite check (5 min)
```
date -u
gh pr view 464 --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid,mergeable,statusCheckRollup
gh pr view 465 --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid,mergeable,statusCheckRollup
gh pr view 466 --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid,mergeable,statusCheckRollup
```
Expected: all 3 mergeable, 10/10 success. If anything regressed, do NOT proceed — investigate first.

### Write R5 audit brief
Template: `/home/user/workspace/audit_briefs/H4_SPLIT_AUDIT_HALF_B_R4_BRIEF.md`

Required updates:
1. Bump round to R5 throughout
2. Update "current heads" to the SHAs in Appendix A below
3. Update "R4 findings to verify closed" with the 4 findings above (F001 #464, F001 #465, F001 #466 YAML, F002 #466 FLY_BIN)
4. Keep all binding clauses (exhaustive sweep, R1-R126 coverage, live-push agent sovereignty, Claude-identity fallback for tgp-agent-context only)
5. Save to `/home/user/workspace/audit_briefs/H4_SPLIT_AUDIT_HALF_B_R5_BRIEF.md`

### Dispatch 2 R5 auditors (1 per lens)
- Lens A: `general_purpose` subagent, model `claude_opus_4_8`, objective points at R5 brief
- Lens B: `general_purpose` subagent, model `gpt_5_5`, objective points at R5 brief
- Cap subagents at 2 (audit) — fixers (if needed) can be 3 parallel after

### Loop until BOTH lenses CLEAN
- If findings: write R5 fixer briefs (`/home/user/workspace/audit_briefs/H4{B,D,F}_FIXER_R5_BRIEF.md`), dispatch fixers, re-audit R6
- Continue Rn until CLEAN on all 3 PRs

### Merge sequence (after dual CLEAN + 5-min stability)
```bash
# Title patch — A3 LOC floor
gh api repos/BradleyGleavePortfolio/growth-project-backend/pulls/464 -X PATCH \
  -F title='[LOC-EXEMPT] H4.B env-discovery (test-harness only)'

gh pr merge 464 --repo BradleyGleavePortfolio/growth-project-backend --squash \
  --subject 'feat(test-prod-readiness): env-discovery (H4.B)' \
  --body '...'
# Repeat for 465, 466
```

### After all 3 merged
1. **H4.H orchestrator + CI builder** — brief at `/home/user/workspace/audit_briefs/` (write fresh; depends on A-G merged)
2. **R109 codebase sweep** after H4.H lands
3. **H5 builder** — staging config + OPERATOR_ATTACH.md (brief at `/home/user/workspace/audit_briefs/H5_BUILDER_BRIEF.md`)
4. **Migration repair PR** — gated on 3 operator decisions above
5. **H3 #459 retrigger CI + audit + merge** — once migrations green
6. **H6 builder** — gated on TM-8 #449 merging
7. **Aggregate OPERATOR_ATTACH.md** — branch protection, identity-history rewrite, etc.

---

## Key file paths (no need to re-derive)

| Purpose | Path |
|---|---|
| Audit doctrine (binding) | `/home/user/workspace/audit_briefs/EXHAUSTIVE_AUDIT_DOCTRINE.md` |
| Rules R1-R126 | `/home/user/workspace/doctrine/AGENT_RULES.md` |
| R4 audit brief (template for R5) | `/home/user/workspace/audit_briefs/H4_SPLIT_AUDIT_HALF_B_R4_BRIEF.md` |
| R4 fixer briefs (templates for R5 if needed) | `/home/user/workspace/audit_briefs/H4{B,D,F}_FIXER_R4_BRIEF.md` |
| R4 audit live reports (context repo) | `tgp-agent-context/handoffs/quality-bar-raise/audit-reports/H4-split-{lensA,lensB}-R4-PR{464,465,466}-LIVE.md` |
| R4 fixer reports | `/home/user/workspace/audit-reports/H4{B,D,F}-fixer-r4-report.md` (H4.F confirmed written; others pending fixer return) |
| H4 split plan | `tgp-agent-context/handoffs/quality-bar-raise/H4_SPLIT_PLAN.md` |
| H5 builder brief | `/home/user/workspace/audit_briefs/H5_BUILDER_BRIEF.md` |

## Files read during this session segment (post-compaction)

Everything the previous instance opened to rebuild context. Next operator should follow the **reading order** below, not this raw list.

### Read via `read` tool
- `/home/user/workspace/audit_briefs/H4B_FIXER_R3_BRIEF.md` (template for R4 fixer briefs)

### Read via `bash` (directory listings, grep)
- `/home/user/workspace/audit-reports/` (ls)
- `/home/user/workspace/audit_briefs/` (ls)

### Read via `gh` API on `tgp-agent-context`
- `commits` (last 10) — confirm live-push state
- `handoffs/quality-bar-raise/audit-reports/H4-split-lensA-R4-PR464-LIVE.md` (Lens A full)
- `handoffs/quality-bar-raise/audit-reports/H4-split-lensB-R4-PR465-LIVE.md` (Lens B full)
- `handoffs/quality-bar-raise/audit-reports/H4-split-lensB-R4-PR466-LIVE.md` (Lens B NEW FINDINGS)

### Read via `gh pr view` on `growth-project-backend`
- PR #464 / #465 / #466 — headRefOid + mergeable + statusCheckRollup

### NOT re-read this segment (referenced via compaction memo only)
- `EXHAUSTIVE_AUDIT_DOCTRINE.md`, `H4_SPLIT_AUDIT_HALF_B_R4_BRIEF.md`, `H4{D,F}_FIXER_R3_BRIEF.md`, R3 fixer/audit reports, `H4-split-lensB-halfB-R4.md`, `H5_BUILDER_BRIEF.md`, `AGENT_RULES.md`, `H4-split-lensA-R4-PR{465,466}-LIVE.md`, `H4-split-lensB-R4-PR464-LIVE.md`

### Recommended reading order for next operator (5–10 min to full context)
1. **This file** (`HANDOFF_NEXT_OPERATOR.md`) — full state + locked decisions
2. `EXHAUSTIVE_AUDIT_DOCTRINE.md` — binding audit rules (exhaustive, R1-R126, live-push)
3. `H4_SPLIT_AUDIT_HALF_B_R4_BRIEF.md` — template for the R5 audit brief
4. `H4{B,D,F}_FIXER_R4_BRIEF.md` (3 files) — templates for R5 fixer briefs if needed
5. `audit-reports/H4{B,D,F}-fixer-r4-report.md` — confirm what was actually shipped
6. R4 LIVE.md files in `tgp-agent-context` — line-level evidence, skim only
7. `AGENT_RULES.md` — reference only, look up specific R-rules as they come up

## What a fresh Perplexity instance also needs (gaps to close before next operator starts)

The items below are NOT in workspace files and would slow down or block a fresh instance. Resolve before the next operator picks up, or paste into their first prompt.

### Critical context that must be in the next operator's first prompt
1. **Operating mandate verbatim:** `"now - goal is to merge ALL h jobs and never stop, ok? QUALITY>SPEED AND COST THOUGH"` — sets the priority order.
2. **Live-push agent sovereignty (verbatim):** `"read the rules, then scan the PR for any bugs AT ALL, then file them, do another passover, summarize, hand to you + every time they make a finding, they update their report as an ongoing document and push it to github everytime they find something (multiple pushes, agent sovereignty in case they die)"` — required wording in audit briefs.
3. **Exhaustive doctrine (verbatim):** `"audits are never just 'make sure the LAST findings are gone' - they need to be 'FIND ANY P0-P3 AT ALL, SEARCH EXHAUSTIVELY, THERE IS NO 'ENOUGH' UNLESS YOU FIND EVERYTHING'"`.
4. **Claude-identity fallback scope (verbatim):** `"keep opus 4.8 - let them use claude identity for simple audit findings, then we can just clean it up at a later date - focus attention on depth and quality of audit for now"` — applies to `tgp-agent-context` ONLY; prod repo stays strict Bradley.
5. **API credentials handle:** all gh/git operations require `api_credentials=["github"]`. Prod repo URL goes through the proxy `https://git-agent-proxy.perplexity.ai/...` (replaces `https://github.com/`).

### Likely gaps in a fresh instance's working knowledge
- That **PR #466 is HIGH-RISK** because it owns the secrets-redaction defense-in-depth surface (R125) + the FLY_BIN exec gate. Audit/fixer briefs must call this out so the auditors and fixers don't under-scrutinize.
- That **H4 PRs are test-harness-only** (`test/prod-readiness/*`), so the `[LOC-EXEMPT]` title marker is genuine and required to pass the A3 LOC floor CI check.
- That **Opus 4.8's sandbox safety classifier blocks `git config user.email "bradley@..."` on `tgp-agent-context`** — the only repo where the Claude Auditor fallback is allowed. The classifier does NOT block this on the prod repo somehow (likely because the prod repo is private), but if it ever does, the fixer must STOP and escalate; no fallback on prod.
- That **the repo uses Jest, not Vitest** — a recurring source of failed dispatches.
- That **`npm ci` causes OOM with 6+ parallel subagents.** Hard cap at 3-4.
- That **branch protection on `main` is blocked by GitHub Free's private-repo limit** — must go in OPERATOR_ATTACH for the operator to fix manually; do not waste cycles retrying.

### Subagent budget reality check for next operator
- This session burned ~40k credits across 9 dual-lens audits (R1–R4) + 9 fixer cycles + 7 PR merges.
- R5 dual-lens audit alone is likely ~5-7k credits.
- R5 fixer cycle (if needed) ~3-5k credits per PR with findings.
- Subsequent merges, H4.H build, H5 build, migration repair PR each ~3-8k credits.
- **Recommend the next operator budget at minimum 25-30k credits to land H4.B/H4.D/H4.F + H4.H + H5 + migration repair**, more if any audit round produces findings beyond R5.

---

## Snapshot refs (R6 durability — survives PR force-pushes)

All R4 heads have snapshot refs pushed; you can always recover:
```
git ls-remote origin 'refs/heads/wip/h4*-fixer-r4-final-20260619'
```
Expected (after H4.B/H4.D fixers complete):
- `wip/h4b-env-discovery-fixer-r4-final-20260619` → _(filled in Appendix A)_
- `wip/h4d-provider-wiring-fixer-r4-final-20260619` → _(filled in Appendix A)_
- `wip/h4f-auto-flipper-fixer-r4-final-20260619` → `c624492e8c24870f76ced2c82764e0c18ff13cd6` ✅

---

## Patterns that work (don't rediscover)

- `[LOC-EXEMPT]` via REST PATCH on PR title (CI A3 floor would otherwise fail test-only diffs)
- Builder/fixer/auditor briefs at `/home/user/workspace/audit_briefs/`; subagent objective just says "read brief"
- `message_subagent` works for in-flight directive changes
- Identity sweep: `git log main..HEAD --pretty='%an %ae'` (all Bradley) + `git log main..HEAD --pretty='%s%n%b' | grep -iE 'claude|anthropic|openai|computer|agent|perplexity|gpt|co-authored-by'` (empty)
- `gh pr merge <num> --squash --auto=false --subject "..." --body "..."` (auto-merge off; manual after dual-CLEAN + 5min)
- All H4 PRs are test-harness only → `[LOC-EXEMPT]` is genuine, not a hack

---

## Patterns that DO NOT work (avoid)

- Single-lens audits (each lens misses ~30-40% of what the other catches)
- "Make sure last findings are gone" mindset — exhaustive sweep is mandatory
- Audits without R1-R126 coverage table
- Vitest assumptions — repo uses Jest
- 6+ parallel subagents (`npm ci` OOM)
- Trying `git config user.email "bradley@..."` on Opus 4.8 in `tgp-agent-context` — sandbox classifier blocks it; use Claude Auditor fallback for that repo ONLY
- Skipping the snapshot ref push (R6) — without it, force-pushes lose history

---

## Appendix A — Live state at session end (2026-06-19T22:10Z)

All three R4 fixers returned CLEAN with 10/10 CI. Save point achieved at the cleanest possible cut.

### #464 H4.B env-discovery
- R4 head SHA: `67ade350ed31369360bcbb7e1e9dc9ca40957178` ✅
- R4 snapshot ref: `wip/h4b-env-discovery-fixer-r4-final-20260619` @ `67ade350ed` ✅
- CI: 10/10 SUCCESS ✅
- Fixer report: `/home/user/workspace/audit-reports/H4B-fixer-r4-report.md`
- **IMPORTANT brief deviation to verify in R5:** the brief instructed adding an `isCatchClause` branch to `countBindings`. The fixer (correctly, per AST probe) determined that catch-clause variables in this TypeScript version are already `ts.VariableDeclaration` nodes whose parent is the `CatchClause` — so the existing `isVariableDeclaration` walk ALREADY counts them. Adding the brief's branch would double-count and violate R63/R65. The fixer therefore did NOT add the branch; instead implemented only the `ts.isParameter` arm. Regression tests still cover the catch-clause shadow case and pass. **R5 auditors must independently verify this deviation is correct** (probe: `try{}catch(K){env[K]} const K='QUX'` resolves to empty after the fix; if it resolves to `['QUX']`, the fixer was wrong).

### #465 H4.D provider-wiring
- R4 head SHA: `c5dd5bd97a29dce77f8e7afceb3025dd6250e4ec` ✅
- R4 snapshot ref: `wip/h4d-provider-wiring-fixer-r4-final-20260619` @ `c5dd5bd9` ✅
- CI: 10/10 SUCCESS ✅
- Fixer report: `/home/user/workspace/audit-reports/H4D-fixer-r4-report.md`
- Note: Lens A R3 was CLEAN on this PR; Lens B caught alg=none. R5 will re-verify both.

### #466 H4.F auto-flipper (HIGH-RISK)
- R4 head SHA: `c624492e8c24870f76ced2c82764e0c18ff13cd6` ✅
- R4 snapshot ref: `wip/h4f-auto-flipper-fixer-r4-final-20260619` @ `c624492e8c` ✅
- CI: 10/10 SUCCESS ✅
- Fixer report: `/home/user/workspace/audit-reports/H4F-fixer-r4-report.md`
- HIGH-RISK: R5 must give this PR extra scrutiny (secrets-redaction R125 surface + FLY_BIN exec gate).
