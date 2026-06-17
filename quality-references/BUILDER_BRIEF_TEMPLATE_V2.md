# Builder Brief Template V2 — self-auditing edition

**Codified:** 2026-06-13 by operator (Bradley Gleave). Replaces prior ad-hoc builder briefs.
**Purpose:** Cut audit cycles from R1→R2→R3 average down to R1→R2 average (or R1-CLEAN where possible) WITHOUT lowering the quality bar. Same auditor checks, run twice — once by builder before push, once by auditor as independent verification.

## When to use this template

EVERY builder brief and EVERY fixer brief, on EVERY repo (`growth-project-backend`, `growth-project-mobile`, `tgp-agent-context`, `tgp-platform-site`, `tgp-finance-app`, `top-track`, `new-website`).

Copy this file when starting a new build brief. Replace `{{PLACEHOLDERS}}` with PR-specific content. Do NOT delete any of the gate sections — they are non-negotiable.

---

# {{PR_NUMBER}} Builder Brief — {{ONE_LINE_SCOPE}}

## Repo + branch
- Repo: `{{ORG/REPO}}`
- Branch: `{{BRANCH_NAME}}` (base: `main` @ `{{MAIN_SHA}}`)
- {{NEW_PR | PR #N at head SHA Y}}

## Bradley R0 LAW (re-stated every brief — at all times)

Operator directive (verbatim, 2026-06-13): *"every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + my email"*

- Author EVERY new commit with inline `-c` flags. NEVER `git config --global`:
  ```bash
  git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
    commit -m "..."
  ```
- NO co-author trailers (`Co-Authored-By`), NO `Generated-By`, NO assistant attribution. Title + optional descriptive body, no trailers.
- NO "Coming soon" strings in production code, comments, test titles, regex assertions, or docblocks. The literal substring `coming soon` (case-insensitive) MUST NOT appear in the additions diff in ANY form, including negation references like `/coming soon/i`.
- NO `@ts-ignore`, NO `@ts-nocheck`, NO `as any`, NO `as unknown as X`, NO `as never as X`, NO bare `as never`.
- NO `.catch(()=>undefined)`, NO `.catch(()=>null)`, NO `.catch(()=>{})`, NO `catch(e){}`, NO `catch(e){ console.log(e) }`.
- NO spinner-only empty states. NO spinner-only error states. Every async UI path renders a real error boundary with a real recovery affordance.
- `@ts-expect-error` with a one-line justification IS allowed.

## Mandatory training docs (read before any code is written)

- `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` — the 50 failure modes. You sweep your own diff against this list BEFORE push (see "Self-audit gate 3" below). Skim once; refer back as needed.
- `/tmp/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` — required ONLY for mobile UI work.
- Any PR-specific plan doc cited below.

## Plan doc + technical scope

{{PASTE_PR_SPECIFIC_PLAN_REFERENCES_AND_TECHNICAL_SPEC_HERE}}

Pre-computed thresholds the builder must hit (NOT discovered during build):

- WCAG AA contrast targets:
  - Normal text (< 18pt or < 14pt bold): ≥ **4.5:1**
  - Large text (≥ 18pt or ≥ 14pt bold): ≥ **3.0:1**
  - UI components (borders, icons against adjacent color): ≥ **3.0:1**
- Webhook idempotency: unique constraint + catch on `P2002` (Prisma) or `23505` (raw Postgres) — NEVER `SELECT`-then-`INSERT` (race condition)
- External HTTP calls: MUST have `signal: AbortSignal.timeout(N)` — never unbounded fetch
- Multi-row writes: MUST be inside `prisma.$transaction([...])` or `prisma.$transaction(async (tx) => ...)`

{{ADD_PR_SPECIFIC_NUMERIC_THRESHOLDS}}

## OWNS (files you may modify)

{{ENUMERATE_OWNED_PATHS}}

## DO NOT TOUCH (other workstreams own these)

{{ENUMERATE_FORBIDDEN_PATHS}}

## Workflow

```bash
# 1. Fresh checkout (isolated worktree to prevent parallel-agent collision)
cd /tmp && rm -rf {{WORKTREE_NAME}}
git clone https://git-agent-proxy.perplexity.ai/{{ORG/REPO}}.git {{WORKTREE_NAME}}
cd {{WORKTREE_NAME}}
{{git checkout -b BRANCH | gh pr checkout N}}

# 2. Install + baseline
npm ci
npx tsc --noEmit 2>&1 | tee /tmp/{{PR_ID}}_baseline_tsc.txt
npm test 2>&1 | tee /tmp/{{PR_ID}}_baseline_tests.txt
```

### 🛟 PUSH-EARLY-WIP — MANDATORY (R52 / sandbox-failure survival)

**Codified 2026-06-17 by operator (Bradley Gleave) after repeated sandbox resets wiped end-of-task-only work.** The sandbox is EPHEMERAL and has failed mid-task multiple times. The pushed branch on GitHub is the ONLY durable copy of your work. An agent that does all its work and pushes once at the end LOSES EVERYTHING if the sandbox dies first. TM-10 #431 survived a fatal sandbox crash *because it had already pushed* — that is the standard.

**Rules (non-negotiable):**

1. **Push a WIP commit as SOON as you have anything that compiles** — a skeleton service, a DTO file, even a single passing test. Do NOT wait for the feature to be "done."
2. **Push again after every logical commit thereafter.** Target: never hold more than ~20-30 min of un-pushed work. Treat each push as a savepoint against a blackout.
3. **Open the PR EARLY** (as soon as the branch has its first pushed commit) so the work is visible + recoverable even if you die before "done." Mark it `[WIP]` in the title if not finished; the operator/auditor knows WIP ≠ ready-to-merge.
4. **Never push a commit that breaks `tsc --noEmit` for the affected scope.** Compile-clean WIP only. R52: don't lose work; R-quality: don't broadcast broken work either. If you can't get a clean compile yet, commit the smallest compiling subset and keep the rest staged.
5. **First push command:**
   ```bash
   git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
     commit -m "{{type}}({{scope}}): WIP scaffold — {{message}}"
   git push -u origin {{BRANCH_NAME}}
   # then immediately: gh pr create --draft (or [WIP] title) so it's recoverable
   ```
6. **Subsequent pushes:**
   ```bash
   git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' \
     commit -m "{{type}}({{scope}}): {{message}}"
   git push
   ```

**Recovery contract:** if a sandbox failure kills you mid-task, the operator re-dispatches from your LAST PUSHED commit on GitHub — not from zero. The more often you pushed, the less is re-done. Push-early is how a blackout costs seconds instead of the whole task.

---

## 🚨 Self-audit gates — RUN ALL THREE BEFORE DECLARING DONE

These are the SAME gates the auditor will run. The point of running them yourself first is NOT to skip the audit — the auditor still runs them independently. The point is that 50% of historical DIRTY verdicts were caused by the builder not running these. Run them. Paste the output in your final report.

### Gate 1 — R0 ban scan on additions-only diff (must return EMPTY)

```bash
git fetch origin main
git diff origin/main..HEAD -- 'src/**' | grep '^+' | grep -v '^+++' | \
  grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|as\s+never\s+as|\bas\s+never\b|\.catch\(\s*\(\s*\)\s*=>\s*undefined\s*\)|\.catch\(\s*\(\s*\)\s*=>\s*null\s*\)|\.catch\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
```

If this prints ANY line, fix that line. Re-run. Do not push until empty. Do not declare done until empty.

For the test diff specifically, also confirm:
```bash
git diff origin/main..HEAD -- '**/*.test.*' '**/__tests__/**' | grep '^+' | \
  grep -niE 'coming soon'
```

### Gate 1b — Pinned tables (R78)

If your slice adds or removes any entry in a pinned table-shape test
(e.g. `test/community/realtime/posthog-event-names.spec.ts` for community
telemetry events), update the pin in the SAME PR. Pins use
`expect(CONST).toEqual({...})` + `toHaveLength(N)`. Both must be updated.

Run locally first:
```
npm test -- --testPathPattern=<pin-name>
```

Known pins (non-exhaustive — grep `toHaveLength.*Object.keys` in `test/` for
the full list):
- `posthog-event-names.spec.ts` — `COMMUNITY_TELEMETRY_EVENTS`
- (others as introduced)

See `rules/R78_PINNED_TELEMETRY_TABLE_UPDATE.md`.

### Gate 2 — Build + lint + test gates (all must pass for the affected scope)

```bash
npx tsc --noEmit 2>&1 | tail -30                                # ZERO errors
npm run lint -- {{SCOPE_GLOB}} 2>&1 | tail -20                  # ZERO errors
npm test -- --testPathPattern='{{SCOPE_REGEX}}' 2>&1 | tail -40 # ZERO failing suites
```

Paste the tail of each into your final report.

### Gate 3 — 50-Failures sweep on YOUR diff

Open `/tmp/tgp-agent-context/quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`. Walk every category. Most likely to apply (PR-type-aware — skip categories that physically cannot apply, but DOCUMENT which you skipped and why):

🔴 CRITICAL (always check):
- **#1 Hardcoded Secrets** — no API keys, tokens, secrets in source. `.env` only.
- **#3 SQL Injection** — no `$queryRawUnsafe` with string interpolation. Prisma parameterised queries only.
- **#5 IDOR** — every query scoped by `userId`/`teamId`/`coachId` from auth context, NEVER from request body.
- **#8 Missing Input Validation** — strict Zod at every API boundary, no `.passthrough()`, no `.optional()` on required fields.
- **#10 Vulnerable Deps** — no new deps without justification.
- **#28 Race Conditions** — webhook/idempotency must be reservation-first (`INSERT … ON CONFLICT` / `createMany skipDuplicates` / `create` then catch P2002), never check-then-act.
- **#29 Missing Idempotency on Payment Endpoints** — applies to ANY webhook ingest. Unique constraint on `dedup_key` or equivalent.
- **#35 Missing API Timeout Handling** — every external HTTP call has `signal: AbortSignal.timeout(N)`.
- **#36 Silent Failures** — every caught error logged structured AND either surfaced/retried. No silent swallow.
- **#44 No DB Transactions for Multi-Step** — multi-row writes use `prisma.$transaction`.

🟠 HIGH (check unless physically impossible):
- **#12 Secrets in Error Messages** — `redactErrorMessage()` before any log or persisted error.
- **#17 Fake Test Coverage** — tests actually exercise the new code path (e.g., the failure test must fail against old code).
- **#33 No Error Boundaries** — every async UI path renders real error state.
- **#34 No Logging or Observability** — structured logs with `event`, identifier fields, no PII.
- **#46 Missing DB Validation** — Prisma constraints (`@unique`, `@@check`, `NOT NULL`) match the Zod layer.
- **#50 No Graceful Degradation** — provider 5xx → exponential backoff retry, not silent drop.

For each category in the relevant list above, in your final report mark:
- `APPLIED — <one-line description of how>`
- `N/A — <one-line reason this PR cannot trigger it>`

A bare `N/A` with no reason is treated as DIRTY by the auditor. Always justify.

### Gate 4 (mobile UI work only) — Contrast self-check

For every (foreground, background) color pair introduced or modified, compute the WCAG relative-luminance contrast ratio (use the formula at https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio, or run `node -e "..."` with a one-liner). Paste a table into your final report:

| Pair | Fg hex | Bg hex | Ratio | Min req | Verdict |
|---|---|---|---|---|---|
| ... | `#xxx` | `#xxx` | x.xx:1 | 4.5 | PASS/FAIL |

If ANY row is FAIL, fix the token before push. Do not push and let the audit catch it.

For dark-mode work specifically: every token used as foreground text or border MUST be made colorScheme-reactive when the surface beneath it is colorScheme-reactive. Static light-palette tokens on a reactive dark surface = guaranteed audit FAIL (see HK-5b R3 history).

---

## Final report (required — saved to workspace)

Save to `/home/user/workspace/{{PR_ID}}_REPORT.md`:

```markdown
# {{PR_ID}} Builder Report

## Files modified
- `path/one.ts` (+N -M)
- `path/two.tsx` (+N -M)

## Files created
- ...

## Commits authored (every one as Bradley Gleave)
| SHA | Message |
|---|---|
| abc1234 | feat(scope): ... |

## Gate 1 — R0 ban scan
Output: EMPTY ✅

## Gate 2 — Build + lint + test
- `tsc --noEmit`: 0 errors ✅
- `lint`: 0 errors ✅
- `test`: N/N passing ✅
(paste tail of each)

## Gate 3 — 50-Failures sweep
- #1 Hardcoded Secrets — N/A: this PR has no new env reads / no new constants
- #5 IDOR — APPLIED: every {{model}}.findMany scoped by req.user.id via {{file}}:L{{line}}
- #28 Race Conditions — APPLIED: unique constraint on {{table}}.{{column}}; P2002 caught at {{file}}:L{{line}}
(walk every CRITICAL + HIGH category — N/A with reason or APPLIED with file:line evidence)

## Gate 4 (UI only) — Contrast table
(if applicable)

## PR URL
https://github.com/{{ORG/REPO}}/pull/{{N}}

## Final HEAD SHA
xxxxxxx
```

If ANY gate failed and you couldn't resolve it: write `/home/user/workspace/{{PR_ID}}_BLOCKER.md` instead, with the specific gate failure + your options. Stop. Do NOT push speculative fixes.

---

## Auditor will run ALL of this again, independently

Self-audit gates exist to catch what the builder forgot to look at, NOT to replace the audit. The auditor still:
- Re-runs gates 1-4 from a fresh worktree
- Verifies every claim in your final report against actual file:line evidence
- Sweeps the full 50-Failures list independently (may flag things you marked N/A)
- For UI work, runs a fresh visual audit on every state

The audit's job is unchanged. Yours got harder. That's the trade.

## Auth

All git network ops use `api_credentials=["github"]` in your `bash` tool calls. `gh` CLI is pre-authenticated.

## Done criteria

- PR opened (NOT merged unless explicitly authorized — operator merges by default)
- CI green
- All 4 self-audit gates passed and pasted into final report
- Every NEW commit authored as `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- Final report at `/home/user/workspace/{{PR_ID}}_REPORT.md`
