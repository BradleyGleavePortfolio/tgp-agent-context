# R4 Fixer Brief — Wave-2 (50-Failures-aware)

You are an **Opus 4.8 fixer**. Your job: fix the Bradley Law violation(s) flagged by R3 across the assigned PR, then ALSO sweep for related 50-Failures patterns before pushing.

## NEW LAW (Bradley directive — supersedes prior interpretation)

The pattern `.catch(() => undefined)`, `.catch(() => null)`, `.catch(() => {})`, `catch(e) {}`, `catch(e) { console.log(e) }` — anywhere on any error path — is a **P1 Bradley Law violation**. It does not matter if it's a "best-effort" secondary write inside an outer catch. Swallowing exceptions silently is exactly what Bradley forbids.

This is canonically documented in **#36 of "The 50 Failures of AI-Generated Code at Enterprise Scale"** (full doc at `/home/user/workspace/_50_failures.md`, severity 🔴 CRITICAL): *"Every caught error must be logged with context and either surfaced to the user or retried with exponential backoff."*

## Correct pattern for secondary writes inside an outer catch

```ts
try {
  // primary work that threw
} catch (err) {
  // Mark the connection in error state — best effort, but NEVER silent.
  try {
    await prisma.wearableConnection.update({
      where: { id: conn.id },
      data: { lastError: redactErrorMessage(err), updatedAt: new Date() },
    });
  } catch (markErr) {
    // Log with full context (no PII). The outer error still rethrows below.
    this.logger.error(
      { event: 'wearable_error_marking_failed', provider: 'polar', conn_id: conn.id, error_class: markErr?.constructor?.name, redacted_message: redactErrorMessage(markErr) },
      'Failed to mark wearable connection as errored',
    );
  }
  throw err; // outer error MUST still propagate
}
```

Key rules:
- The inner failure is **logged with structured context** (not swallowed silently)
- The outer error **still rethrows** (no silent 200)
- Never `console.log(e)` only — use the project's structured logger
- Never `.catch(() => undefined)` — always at minimum a structured `logger.error` call inside the catch

## Sweep for these 50-Failures patterns in the diff before pushing

Open `/home/user/workspace/_50_failures.md` and treat each as a checklist. The most likely-relevant for wearable connectors:

- **#1 Hardcoded Secrets** 🔴 — no API keys, tokens, secrets in source. .env only.
- **#3 SQL Injection** 🔴 — Prisma is safe, but verify no `$queryRawUnsafe` with string interpolation.
- **#5 IDOR** 🔴 — every query scoped by `userId`/`teamId` from auth context, never from request body.
- **#8 Missing Input Validation** 🔴 — strict Zod everywhere at API boundary; no `.passthrough()`, no `.optional()` on required fields.
- **#10 Vulnerable Deps** 🔴 — don't add new deps without justification.
- **#12 Secrets in Error Messages** 🟠 — always `redactErrorMessage()` before persisting `last_error` or logging.
- **#17 Fake Test Coverage** 🟠 — tests must actually exercise the failure mode (e.g. iOS noop test must fail against old code).
- **#28 Race Conditions** 🔴 — webhook idempotency must be reservation-first (upsert/createMany skipDuplicates), not check-then-act.
- **#29 Missing Idempotency on Payment Endpoints** 🔴 — same applies to webhook ingest: `dedup_key` unique constraint.
- **#33 No Error Boundaries** 🟠 (mobile only) — every async UI path renders a real error state.
- **#34 No Logging or Observability** 🟠 — structured logs with `event`, `provider`, `conn_id`, no PII.
- **#35 Missing API Timeout Handling** 🔴 — external HTTP calls must have `signal: AbortSignal.timeout(N)`.
- **#36 Silent Failures** 🔴 — THIS PR's specific R3 finding.
- **#44 No DB Transactions for Multi-Step** 🔴 — multi-row writes use `prisma.$transaction`.
- **#46 Missing DB Validation** 🟠 — Prisma `@check`/unique/required constraints match the Zod layer.
- **#50 No Graceful Degradation** 🟠 — provider 5xx → exponential backoff retry, not silent drop.

For each match in your PR's diff, fix it. For each that doesn't apply or is already handled, no action needed — but you must have looked.

## Workflow

1. Read `/home/user/workspace/_50_failures.md` (skim — you only need to remember the categories above).
2. Read your assigned R3 audit file (path given in your task).
3. Re-checkout your PR's branch at its R2 head. Do NOT rebase.
4. Fix every R3 P0/P1/P2 finding.
5. Sweep the PR diff for any 50-Failures pattern in the list above. Fix any matches.
6. Run all gates (same as R2 brief). All must PASS.
7. Push to same branch. Commit author `Dynasia G <dynasia@trygrowthproject.com>`, empty body, no trailers.
8. Save a summary JSON to workspace: `{pr, new_head_sha, r3_fixes:[...], sweep_findings:[...], gate_results:{...}}`.

## Auth & repo paths

- `bash` with `api_credentials=["github"]` for git network ops
- Backend: `/home/user/workspace/repos/growth-project-backend`
- Mobile: `/home/user/workspace/repos/growth-project-mobile`
- Use an **isolated git worktree** — parallel agents move shared HEAD

Return JSON: `{"pr":N,"old_head_sha":"<R2-sha>","new_head_sha":"<R4-sha>","r3_fixes_applied":[...],"sweep_findings":[...],"gate_results":{...},"ready_for_r5_audit":true}`
