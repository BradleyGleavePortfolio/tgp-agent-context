# Next-Operator Onboarding — UPDATE 2 (2026-06-01 evening)

**Supersedes:** `NEXT_OPERATOR_ONBOARDING_2026-06-01.md` for current state. The original doc remains valid for read-list, technical brief, runbook, quality contract, and landmines — read it first if you haven't.

**Snapshot timestamp:** 2026-06-01 ~20:25 PDT (post-HK-3a closeout, audits in flight)

---

## TL;DR — Where We Are Right Now

- **HK-3a is COMMITTED, PUSHED, and OPEN as two PRs** (was uncommitted in the prior snapshot).
- **R1 audits are IN PROGRESS** — three parallel subagents (one Opus 4.8 visual, two GPT-5.5 code-depth).
- **HK-3b is OPEN but CI-RED**, awaiting HK-3a merge → rebase → CI re-run. This is expected and pre-planned (stub-then-rebase coordination strategy).
- **No merges have happened yet this session.** No fixes have been dispatched yet.

---

## Live PR State

### HK-3a Backend — PR #356
- URL: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/356
- Head SHA (40-char): `85d1111d1bb8becde8a2cbf680a6d127fe5cde46`
- Base SHA: `a73b02f21dffb711f5b6634abdf2ac5f52eec310`
- Branch: `hk/PR-HK-3a-fitness-bucket`
- Title: `PR-HK-3a: H&F bucket UI + samples API + WearablesShell`
- Label: `hk-phase-2a`
- Author: `Dynasia G <dynasia@trygrowthproject.com>` — title-only, no trailers
- Mergeable: `MERGEABLE` / `mergeStateStatus: UNSTABLE` (CI in progress, not failed)
- Local gates at push time: prisma ✓, tsc ✓, eslint ✓, jest 41 new passing, nest build ✓
- **Pre-existing main jest failures (17):** byte-for-byte identical via `git stash` — HK-3a adds ZERO regressions. Builder explicitly did NOT expand scope to fix unrelated scheduling/openapi/roles code.

### HK-3a Mobile — PR #224
- URL: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/224
- Head SHA (40-char): `bf465d9e316bcbe30ad02976abb12e6c3548f081`
- Base SHA: `3e447ab29683e5ef4a3124f00bc04b0fc8b66998`
- Branch: `hk/PR-HK-3a-fitness-bucket`
- Title: `PR-HK-3a: H&F bucket UI + samples API + WearablesShell`
- Label: `hk-phase-2a`
- Author: `Dynasia G`, title-only
- Mergeable: `MERGEABLE` / `UNSTABLE` (CI in progress)
- Local gates: tsc ✓, eslint ✓, jest 1965/1965 (177 suites), expo prebuild ios+android ✓

### HK-3b Mobile — PR #223 (unchanged from prior snapshot)
- URL: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/223
- Head SHA: `fb96d0d6ae15e97760fe9d412cfbf7177d6afda9`
- Branch: `hk/PR-HK-3b-stress-recovery`
- CI: RED — 18 `TS2307` errors, all imports of HK-3a-owned modules (`wearablesSamplesApi`, `useWearableSamples`, `useWearablePreference`, `FreshnessChip`, `RevolutGlowChart`). **This is expected.** Stubs were used during HK-3b build and are gitignored; real files land via HK-3a merge.
- All other local gates: tsc, eslint, jest 1964, both expo prebuilds, plain-language grep, CALM treatment audit — ALL ✓

---

## What the HK-3a Closeout Subagent Caught (CRITICAL — auditor must verify)

The closeout subagent (Opus 4.8) reported **one near-miss + three real bugs fixed**. The next operator should treat these as audit checkpoints:

### 1. The `.git/info/exclude` near-miss
`.git/info/exclude` (workspace-local, NOT `.gitignore`) was silently ignoring 8 HK-3a-owned mobile files:
- `src/charts/RevolutGlowChart.tsx`
- `src/screens/client/wearables/MetricDetailScreen.tsx`
- `src/screens/client/wearables/WearablesShell.tsx`
- `src/screens/client/wearables/components/FreshnessChip.tsx`
- `src/screens/client/wearables/components/ProviderOverlapChips.tsx`
- `src/api/wearablesSamplesApi.ts`
- `src/hooks/useWearableSamples.ts`
- `src/hooks/useWearableSamples.tsx`-equivalent / `useWearablePreference.ts`

A plain `git add` would have shipped a PR **missing these files while tests still passed locally** (because they existed on disk for the test runner). Subagent used `git add -f` to force-include all 8, then verified they're in the pushed commit.

**New landmine to add to runbook:** Always run `git check-ignore -v <new-file>` against worktree-local exclude rules before assuming `git add` is sufficient. Or just run `git ls-files --others --exclude-standard` and reconcile manually.

### 2. Three real test bugs the subagent fixed (NOT pre-existing)
- Jest `out-of-scope mock variable` — referenced outside of `jest.mock()` factory closure
- Animation-timing assumption in Recovery-switch test — used a fixed `setTimeout` that races on slow machines
- Two doctrine-flagged `"Coming soon"` strings in test titles (Bradley LAW even applies to test descriptions because they appear in CI output and screenshots)

All three are mobile-side and live in commit `bf465d9e…`. Audit should NOT find these again; if it does, escalate.

### 3. ESLint scope clarification
The subagent ran `eslint . --max-warnings=0` (stricter than each repo's CI lint gate `npm run lint`). The repo-CI gate passes; the stricter audit-only run finds pre-existing warnings in unrelated files. **My new files: zero issues under any scope.** Treat audit-only-lint warnings outside the PR's changed files as N/A.

### 4. expo prebuild cleanup
`expo prebuild` creates `/ios` and `/android` dirs + rewrites `package.json` scripts. Subagent ran both prebuilds for validation then `rm -rf ios android` and reverted `package.json` script edits. `node_modules` symlink kept out of commit. **Verify in the diff that none of these are in `bf465d9e…`.**

---

## R1 Audits — In Flight Right Now

Three parallel subagents launched at ~20:25 PDT. Each writes its verdict to `/home/user/workspace/`:

| Audit | Model | Subagent ID | Deliverable |
|---|---|---|---|
| HK-3a backend code-depth | GPT-5.5 | `audit_hk_3a_backend_mpw2qvlv` | `_audit_HK_3a_backend_R1_GPT55.md` |
| HK-3a mobile code-depth | GPT-5.5 | `audit_hk_3a_mobile_code_mpw2ridg` | `_audit_HK_3a_mobile_code_R1_GPT55.md` |
| HK-3a mobile visual/UX | Opus 4.8 (fresh) | `audit_hk_3a_mobile_visual_mpw2sc9x` | `_audit_HK_3a_mobile_visual_R1_Opus48.md` |

**R31/R32 satisfied:** Builder was Opus 4.8; backend + mobile code-depth audits are GPT-5.5 (different model class); mobile visual audit is Opus 4.8 but a **fresh subagent instance with no shared state** with the builder.

**Audit briefs encoded into the subagent objectives include:**
- Pin to SHA (R55)
- Cross-reference `_builder_brief_HK_3a.md`
- 50-failures sweep (#36 rethrow envelope, #29 webhook superRefine, canonical registry)
- HK-3b API surface contract verification (`wearablesSamplesApi`, `useWearableSamples`, `useWearablePreference`, `FreshnessChip`, `RevolutGlowChart` with `tone='cool'|'warm'`)
- Near-miss file verification (the 8 force-added files)
- Bradley LAW sweep (zero "Coming soon", zero spinner-only loading, zero silent catches, decacorn polish bar)

---

## Decision Tree — What to Do When Audits Return

```
For each of 3 audits:
  Read /home/user/workspace/_audit_HK_3a_<area>_R1_<model>.md

If ALL 3 verdicts == CLEAN:
  → Merge backend first (gh pr merge 356 --squash --match-head-commit 85d1111d1bb8becde8a2cbf680a6d127fe5cde46 --repo BradleyGleavePortfolio/growth-project-backend)
  → Then merge mobile (gh pr merge 224 --squash --match-head-commit bf465d9e316bcbe30ad02976abb12e6c3548f081 --repo BradleyGleavePortfolio/growth-project-mobile)
  → Proceed to HK-3b rebase (see below)

If ANY verdict == NEEDS_FIX:
  → Dispatch a single Opus 4.8 fixer subagent per affected repo
  → Fixer brief template: /home/user/workspace/_fixer_brief_R4_wave2_50FAILURES.md
  → Fixer must: pin to head SHA, fix every P0+P1+P2, commit as Dynasia G, push (refresh SHA), re-run all gates
  → Dispatch R2 audit (different model from R1 auditor that found the issue)
  → Loop until CLEAN
```

**Merge requirement:** `gh pr merge` **REQUIRES the full 40-char SHA** for `--match-head-commit`. Short SHA → `GitObjectID coerce` error. Always refresh via `gh pr view --json headRefOid` immediately before merge.

---

## HK-3b Rebase Plan (post-HK-3a merge)

After both HK-3a PRs are merged to main:

```bash
cd /home/user/workspace/repos/growth-project-mobile
git fetch origin
git checkout hk/PR-HK-3b-stress-recovery
git rebase origin/main
```

**Expected outcome:**
- HK-3a's real `wearablesSamplesApi`, `useWearableSamples`, `useWearablePreference`, `FreshnessChip`, `RevolutGlowChart` (with `tone` prop) are now on main
- The 8 stub modules HK-3b imports are now real
- The 18 TS2307 errors evaporate
- CI should go green on re-push

**Push:** `git push --force-with-lease origin hk/PR-HK-3b-stress-recovery`

**If TS2307 errors persist:** Audit gate verified HK-3b's import paths against HK-3a's export paths. If mismatch, that's a P0 found by the HK-3a mobile code-depth audit and should have been fixed before merge. If audit missed it: escalate to fix-loop on HK-3a.

**If `tone` prop on RevolutGlowChart is missing or wrong shape:** HK-3a mobile code-depth audit explicitly checks this. If audit missed it: same as above.

After CI green on HK-3b: dispatch R1 audits (Opus 4.8 visual + GPT-5.5 code-depth) on the rebased branch SHA.

---

## File-by-File Workspace Inventory (Current)

### New/updated artifacts this snapshot
- `/home/user/workspace/_audit_HK_3a_backend_R1_GPT55.md` — IN PROGRESS
- `/home/user/workspace/_audit_HK_3a_mobile_code_R1_GPT55.md` — IN PROGRESS
- `/home/user/workspace/_audit_HK_3a_mobile_visual_R1_Opus48.md` — IN PROGRESS

### Preserved from earlier (still authoritative)
- `/home/user/workspace/_builder_brief_HK_3a.md` (266 lines — HTTP contract)
- `/home/user/workspace/_builder_brief_HK_3b.md` (191 lines — CALM enforcement + plain-language grep)
- `/home/user/workspace/_HK_3b_report_back.md` (HK-3b subagent self-report)
- `/home/user/workspace/_50_failures.md`
- `/home/user/workspace/_uiux_paper.md`
- `/home/user/workspace/_fixer_brief_R4_wave2_50FAILURES.md`
- `/home/user/workspace/_auditor_brief_R1_wave2_BACKEND.md` + `_auditor_brief_R1_wave2_MOBILE.md`

### Worktrees (now committed — can be cleaned)
- `/tmp/wt-hk3a-backend` — branch already pushed; safe to delete to free disk (`/` at 93%) but only AFTER all audits complete (auditors may want local diff)
- `/tmp/wt-hk3a-mobile` — same

---

## Updated TODO (current state)

```
1. [completed]   Close out HK-3a: commit (Dynasia G), full suites, push, open PRs with hk-phase-2a label
2. [in_progress] Audit HK-3a (parallel: Opus 4.8 visual + GPT-5.5 code-depth on backend + mobile)
3. [pending]     Fix loop until HK-3a CLEAN; merge backend then mobile with full 40-char SHA
4. [pending]     Rebase HK-3b on new main (real HK-3a files replace stubs); push; verify CI green
5. [pending]     Audit HK-3b (visual + code-depth) on rebased branch
6. [pending]     Fix loop until HK-3b CLEAN; merge
7. [pending]     Commit all briefs + audits + fix dispatches to tgp-agent-context under R64
8. [pending]     Dispatch Phase 2b (HK-5a + HK-5b AI panels)
```

---

## Model Policy (LAW — repeat for emphasis)

> "audits need done by gpt5.5/opus 4.8's, depending on whether the task is more code depth or visual checks"
> "builder/fixers are opus 4.8 always, audits are opus 4.8/gpt5.5"
> Sonnet 4.6 is **NOT** allowed for build/audit/fix work.

- **Builders/fixers:** Opus 4.8 always
- **Audits — code-depth:** GPT-5.5 (preferred when builder was Opus 4.8 → R31/R32 separation)
- **Audits — visual/UX:** Opus 4.8 fresh instance (no shared state)
- **R31/R32:** Auditor ≠ builder. Different subagent instance minimum; different model class preferred.

---

## Commit Author (NO EXCEPTIONS)

```
Author:    Dynasia G <dynasia@trygrowthproject.com>
Committer: Dynasia G <dynasia@trygrowthproject.com>
Body:      empty (title-only)
NO Co-Authored-By, NO Generated-by, NO Claude/Anthropic mentions
```

Use: `git -c user.name="Dynasia G" -c user.email="dynasia@trygrowthproject.com" commit -m "<title>"`

---

## Auth Reminder

GitHub: `bash` with `api_credentials=["github"]`. Token injected as `$GITHUB_TOKEN`. Use `gh` CLI. Do NOT run `gh auth status` or print the token.

---

## When You Resume This Session

1. Check audit subagent statuses (3 IDs above). If still running: `wait_for_subagents`.
2. Read the 3 audit deliverables in `/home/user/workspace/_audit_HK_3a_*.md`.
3. Apply the decision tree above (all CLEAN → merge; any NEEDS_FIX → fixer).
4. Refresh head SHAs via `gh pr view --json headRefOid` before any merge.
5. Continue to HK-3b rebase as soon as HK-3a is fully merged.

The original onboarding doc (`NEXT_OPERATOR_ONBOARDING_2026-06-01.md`) remains valid for: GitHub read-list, technical brief, data-flow diagram, runbook commands, 10-point quality contract, landmines (add the `.git/info/exclude` landmine), lessons, quick-start. Read it before acting if you're cold-starting.
