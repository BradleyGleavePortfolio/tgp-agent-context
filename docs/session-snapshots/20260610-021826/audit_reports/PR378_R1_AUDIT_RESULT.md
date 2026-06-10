# PR #378 R1 Audit — Verdict Summary

**PR:** #378 `feat/roman-phase-1-chat` · Head `1aaf6d44` · Base `6c4f618c` (MWB-1 #376)
**Auditor:** GPT-5.5 R1 (READ-ONLY) · **Date:** 2026-06-10

## VERDICT: CLEAN (DIRTY-MINOR on 2 brief-conformance P2s)

Ship-ready. The PR is genuinely additive, the RLS is HECTACORN-grade and verified live
via pg_catalog, the voice contract is baked verbatim with no emoji, the feature flag is
default-OFF returning 404 on every route, and the gates re-run green (tsc 0, eslint 0,
53/53 non-RLS tests, zero DROP in the 4772-line migration diff). The two P2s are
brief-conformance gaps, not security defects, and the surface is flag-dark.

## Counts
- **P0:** 0 · **P1:** 0 · **P2:** 3 · **P3:** 3
- Tests: 77 claimed = 77 actual (19+15+13+6+24). No `.skip`/`.only`/`xit`.
  - 53/53 unit+integration PASS live in audit sandbox.
  - 24 RLS well-formed; migration RLS state verified via catalog; suite blocked only by
    a `service_role` TRUNCATE grant limitation in the throwaway DB (not a code defect).

## Top issues
1. **P2-1** Rate limit throws `ForbiddenException` (HTTP **403**), but brief §3 requires
   **429**. Body is correct (`ROMAN_RATE_LIMIT` + `retryAfterSeconds`); status is wrong.
   `src/roman/roman.service.ts:292`.
2. **P2-2** SSE disconnect aborts the read loop but does not pass the `AbortSignal` into
   `anthropic.messages.stream(...)` → upstream provider stream may be orphaned. Brief §7
   "no orphan" not demonstrably met. `src/roman/roman.service.ts:375-386`.
3. **P2-3** Session `:id` not UUID-validated (brief §9) — but moot: IDs are `cuid`, and
   owner-scoped `findFirst` 404s unknown ids. Reconcile brief (cuid≠uuid), not code.
4. **P3-1** Builder's "zero MWB-1 lines touched" is imprecise — committed diff includes
   cosmetic `prisma format` realignment of the `User` relation block (not MWB-1 region).
5. **P3-2/3** `subject_context_json` (`Json?`) only read when `typeof==='string'`;
   RLS-helper search_path is `''` (stricter than brief's wording — informational).

## Recommendation
Merge-eligible as-is given flag-OFF. Address P2-1 (429) and P2-2 (forward AbortSignal to
the SDK) before Phase 2 wires the mobile UI / flips the flag. Ensure CI runs the RLS
suite against the repo's Supabase-shaped Postgres (service_role granted on fresh tables)
to convert the 24 RLS tests from "verified-by-catalog" to "executed-green".
