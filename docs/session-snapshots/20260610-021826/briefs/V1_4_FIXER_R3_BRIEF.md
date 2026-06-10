# v1-4 Fixer R3 — Orphan Digest Comment Sentinel

**Single tiny issue. Single file edit. Single commit. No code logic changes.**

## Context

PR #370 (`feature/community-v1-realtime-push`, HEAD `aaa3d52`) shipped a fixer that resolved 5 of 6 R1 findings. R2 audit (`r2_audit_pr_370_mq70ek86`, GPT-5.5) returned DIRTY-MINOR on **one strict gate**: the orphan digest removal sentinel command must return zero results across `src test docs scripts`. Source/runtime constants are clean; two stale comment references remain in a test file.

## The exact problem

```bash
rg -n 'community\.digest\.queued|queueCommunityDigest|digestQueued' src test docs scripts
```

still returns:

```
test/community/realtime/posthog-event-names.spec.ts:8: * NOTE: community.digest.queued was removed in PR #370 as an orphaned event —
test/community/realtime/posthog-event-names.spec.ts:9: * it had no emitter (no queueCommunityDigest / no capture call anywhere). The
```

## Required fix

Edit `test/community/realtime/posthog-event-names.spec.ts` only. Reword the JSDoc/block comment (lines ~7-12 or wherever the NOTE block lives) so it:

1. **No longer contains the strings** `community.digest.queued`, `queueCommunityDigest`, or `digestQueued` (literal — even substring, even inside backticks).
2. **Still explains** why the test does not assert on a queued-digest constant. Use a paraphrase, e.g.:

```
/**
 * NOTE: An orphaned community digest event was removed in PR #370 — it had no
 * emitter (no producer function, no capture() call anywhere). The constant map
 * is therefore expected to omit it; this spec asserts the current set of six
 * telemetry events.
 */
```

That's the entire content change. Do not touch source files, do not touch other tests, do not bump deps, do not change imports.

## Verification (mandatory before commit)

Run these checks and paste output in your final report:

```bash
rg -n 'community\.digest\.queued|queueCommunityDigest|digestQueued' src test docs scripts
# Must return: 0 results (exit code 1 from rg)

npx tsc --noEmit
# Must pass

npx jest test/community/realtime/posthog-event-names.spec.ts --no-coverage
# Must pass

# Full-suite spot-check (R66)
npx jest --testPathIgnorePatterns='rls|openapi' --no-coverage 2>&1 | tail -20
# Must pass (same lane R2 audit used)

# R70 fail-fast lane
bash scripts/r70-fail-fast.sh 2>&1 | tail -5  # if it exists; else skip with SKIP-BECAUSE
```

## Commit + push

- Worktree: `/home/user/workspace/tgp/backend-v1-4-fixer-r3`
- Branch: `feature/community-v1-realtime-push` (HEAD before your edit: `aaa3d52`)
- Author: `Dynasia G <dynasia@trygrowthproject.com>`
- Commit (title-only, no body, no emoji, no trailers):
  ```
  fix: reword orphan digest comment to clear v1-4 audit sentinel
  ```
- Push: `git push origin feature/community-v1-realtime-push` (use `api_credentials=["github"]`)
- **R64:** push immediately after commit.

## Hard rules

- **R31:** You are fixer. Different agent from R2 auditor. Different worktree. ✅ (`backend-v1-4-fixer-r3`)
- **R67:** Update `/tmp/tgp-agent-context/handoffs/dispatch.json` with your dispatch + completion entry, commit + push that journal.
- **R69:** Annotate `SKIP-BECAUSE:` for anything in the verification checklist you skip.
- **No `sonnet` references.** R31 auditor greps for it.
- Do NOT amend `aaa3d52` — make a new commit on top.

## Deliverables (final-message format)

```json
{
  "fix_sha": "<new commit SHA>",
  "branch": "feature/community-v1-realtime-push",
  "sentinel_check": "0 results",
  "tsc": "pass",
  "jest_spec": "pass",
  "full_lane": "pass",
  "r70": "pass | SKIP-BECAUSE: <reason>"
}
```

Then I (the orchestrator) dispatch a fresh GPT-5.5 R3 audit (R31). If CLEAN → merge PR #370 → v1-4 SHIPS.
