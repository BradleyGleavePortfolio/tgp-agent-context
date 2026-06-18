# TM-3 RE-AUDIT — LENS B (cycle) — gpt_5_5
SHA: 1f9778da | branch: feat/tm-3-public-browse | timestamp: 2026-06-18T07:51:00Z (approx)
PARENT AUDIT (at 1846b04a): 0 P0 / 0 P1 / 3 P2 / 3 P3
SUBAGENT ID: tm_3_re_audit_lens_b_gpt_5_5_mqj6zqhq

> **Persistence note (Agent 47):** This report is reconstructed verbatim from the subagent formal-return summary (the auditor's own /tmp/TM-3-re-audit-B-1f9778da.md was lost to sandbox eviction before push-to-remote could be added). All verdict + counts + findings + verification rows are direct quotes from the auditor.

## FINAL VERDICT
**FINDINGS_PRESENT — 0 P0 / 0 P1 / 1 P2 / 2 P3**

## COUNTS
P0: 0 / P1: 0 / P2: 1 / P3: 2

## FINDINGS

### P0
(none)

### P1
(none)

### P2
**B-CYCLE-P2-1** — The 404 service throws `NotFoundException({ kind: 'job_listing_not_found' })`, but the global `HttpExceptionFilter` reads only `message`/`error`/`code` — never `kind`. So the intended machine-readable identifier is **silently dropped** from the wire envelope, and the shape drifts from the house `{ error, message }` convention (cf. `checkout.service.ts`). No security leak (envelope is clean, 404 not 401/403), but a real contract/consistency defect with no HTTP-envelope pin test — the specs only assert the service-level body, not the normalized response.

### P3
**B-CYCLE-P3-1** — Cursor dev-secret fallback is correctly reasoned per the threat model but has no boot-time warning when unset in prod (parity nit with `MWB_AUTOSAVE_LOCK_TOKEN_SECRET`).

**B-CYCLE-P3-2** — `cta_listing_id === id` byte-for-byte guarantee is documented as a consumer-relied contract but not pinned by any test.

## CYCLE-LENS VERIFICATION (all 10 checks)
[v] Secret rotation is safe (old-secret cursors degrade to page 1, explicitly tested cross-env)
[v] Throttle is genuinely attached (global APP_GUARD — **no decorator-order bug**), anon buckets by IP
[v] Covering index `@@index([status, created_at, id])` matches the keyset exactly
[v] cta_listing_id deletion race → clean 404, window self-heals
[v] PII drop tests assert both negative (value scan) and positive (exact key-set lock) on all 3 surfaces
[v] Banned-token grep empty; doctrine pins intact (no shared files touched)
[v] No N+1 (single findMany/findFirst, no relation loads)
[v] Cursor design forward-compatible (HMAC versioning via env secret rotation works)
[v] Default-arm fallback rationale (drops unknown comp_type — fail-open documented)
[v] Error envelope shape contract (404 returned, body shape audited per B-CYCLE-P2-1)

## EMPIRICAL CONFIRMATION
Ran the suite live — **53/53 tests pass across 4 files**; mocks honor the published filter and assemble on real prototypes (low false-positive risk). The 3 fixer commits cleanly closed every parent P2/P3.

## SHA STABILITY CONFIRMATION
HEAD at start: 1f9778da
HEAD at end:   1f9778da
[v] STABLE — read-only audit, no code written or pushed
