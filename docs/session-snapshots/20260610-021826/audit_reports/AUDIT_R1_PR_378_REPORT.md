# AUDIT R1 — PR #378 Roman Phase 1 Chat MVP Backend

**Auditor:** GPT-5.5 R1 Auditor (READ-ONLY)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**PR:** #378 · Branch `feat/roman-phase-1-chat` · Head `1aaf6d44` · Base `6c4f618c` (MWB-1 #376)
**Worktree:** `/home/user/workspace/tgp/backend-roman-audit` (detached @ `1aaf6d44`, verified)
**Date:** 2026-06-10

## VERDICT: CLEAN (DIRTY-MINOR on two brief-conformance gaps — see P2s)

The PR is additive-only, the migration is non-destructive with HECTACORN-grade RLS,
the voice contract is baked verbatim with no emoji, the feature flag returns 404
default-off across all routes, and 53/53 unit+integration tests pass. tsc and eslint
are clean; the full from-empty migration diff contains **zero** DROP statements. Two
functional gaps against the *brief* (not security defects) keep this from a pure
CLEAN: rate-limit returns HTTP 403 not 429, and the session id is not UUID-validated
(IDs are cuid, so the check is moot but the brief's literal requirement is unmet).
The 24 RLS tests are well-formed and the migration RLS state is verified directly via
the pg catalog, but the suite could not be driven to green in the audit sandbox due to
a Postgres role-grant limitation (not a code defect).

---

## Gate results (re-run in worktree)

| Gate | Result | Evidence |
|---|---|---|
| Schema additivity (`git diff base..head -w`) | ✅ PASS | Only Roman enums/models + 2 User back-relations added; MWB-1 models untouched |
| MWB-1 lane files untouched | ✅ PASS | `git diff` of `src/workout-programs/ src/ai/coach-ai.service.ts src/ai/materializers/assign-workout.materialiser.ts` is EMPTY |
| Migration DROP scan (from-empty, 4772 lines) | ✅ PASS | Zero lines begin with `DROP `; no `DROP COLUMN/CONSTRAINT/DEFAULT/NOT NULL` |
| `prisma generate` | ✅ PASS | Client v6.19.3 generated clean |
| `prisma format` (Roman region) | ✅ PASS | Format touches ZERO Roman lines; churn is MWB-1 region only (left as-merged) |
| `tsc --noEmit` (full project) | ✅ PASS | Exit 0, no errors |
| `eslint src/roman test/roman test/rls/roman-rls.spec.ts` | ✅ PASS | Exit 0, clean |
| Roman unit+integration (`jest test/roman/`) | ✅ PASS | **53/53** (prompts 19 + service 15 + controller 13 + streaming 6) |
| RLS suite (`jest test/rls/roman-rls`) | ⚠️ UNVERIFIABLE IN SANDBOX | 24 tests well-formed; migration RLS state verified via pg_catalog; suite blocked by service_role TRUNCATE grant in throwaway DB |
| Anthropic key not hardcoded / not logged | ✅ PASS | env-only; no key in any log statement |
| Test count vs claim (77) | ✅ PASS | 19+15+13+6+24 = 77 exactly; no `.skip`/`.only`/`xit` |

---

## Findings

### R1-P0 (blocker) — NONE

### R1-P1 (must fix this PR) — NONE

### R1-P2 (functional minor / should fix)

**P2-1 — Rate limit returns HTTP 403, not 429 (brief §3 violation)**
`src/roman/roman.service.ts:292` throws `ForbiddenException` (HTTP 403) on cap
exhaustion. Brief §3 explicitly states: *"Reject 429 with `{code: 'ROMAN_RATE_LIMIT',
retryAfterSeconds}`"*. The structured body is correct (code + retryAfterSeconds), and
the in-code comments at `roman.service.ts:257` and `roman.controller.ts:95` even call
it a *"429-shaped Forbidden"* — acknowledging the mismatch. A mobile client written to
the conventional 429 contract (or keying on `Retry-After`/status) will not recognise
the limit. Fix: throw an `HttpException(body, HttpStatus.TOO_MANY_REQUESTS)` (or a
custom 429 exception). Low blast radius, flag is off, so not a P1.

**P2-2 — SSE disconnect aborts the read loop but does not propagate to the Anthropic SDK stream (possible upstream orphan)**
`src/roman/roman.service.ts:340-400`: on client disconnect the controller calls
`abort.abort()` and the service loop breaks on `opts.signal?.aborted`
(`roman.service.ts:383-386`). However, the `AbortSignal` is **not** passed into
`this.anthropic.messages.stream({...})` (`roman.service.ts:375-380`) — the SDK call
receives no `signal`/`{ signal }` option. Breaking the `for await` *may* trigger the
async-iterator's `return()` and tear down the socket, but this is not guaranteed across
SDK versions and the explicit cancel contract (brief §7: *"Cancel/disconnect path
closes the upstream provider stream — no orphan"*) is not demonstrably satisfied. Fix:
pass `{ signal: opts.signal }` to `messages.stream(...)` (the SDK supports it) so the
HTTP request to Anthropic is actively aborted. The streaming test
(`roman-streaming.spec.ts`) verifies persistence-on-disconnect but uses a fake client
that cannot detect an orphaned upstream, so this gap is untested.

**P2-3 — Session id route param is not UUID-validated (brief §9 literal check unmet — but moot)**
Brief §9 requires *"Session ID is UUID-validated."* The `:id` param in
`roman.controller.ts:68,86,144` is a raw `@Param('id') id: string` with no
`ParseUUIDPipe` / `@IsUUID`. In practice the IDs are Prisma `cuid()` (NOT UUIDs — see
`schema.prisma` `@default(cuid())`), so a UUID validator would be *wrong* here; any
unknown id simply 404s via `getOwnedSession`'s owner-scoped `findFirst`. No security
impact (RLS + service WHERE both scope by user_id). Flagged only because the brief's
literal requirement is unmet; recommend the brief be reconciled (cuid, not uuid) rather
than the code changed.

### R1-P3 (cosmetic)

**P3-1 — Builder's "zero MWB-1 lines touched" claim is imprecise**
The builder result states *"prisma format touches zero Roman lines… MWB-1's models left
exactly as merged."* That is true for the Roman region and the MWB-1 region. BUT the
committed schema diff (`base..head`) DOES include whitespace **re-alignment of the User
model relation block** (lines ~230-290: `coach_subscription`, `invoices`,
`contract_*`, `payout_*`, `messages_*`, etc.) and minor realignment in `CoachPackage`
and `ContractEnvelope` — regions unrelated to MWB-1. This is benign `prisma format`
output triggered by adding the two `roman_*` relations to `User`, and is purely
cosmetic, but it contradicts the "only MWB-1 region would reformat" framing. No
functional effect; net schema is format-stable in the Roman region.

**P3-2 — `subject_context_json` is `Json?` but only consumed when `typeof === 'string'`**
`roman.service.ts:362-365` passes `subjectContext` to the prompt builder only when
`typeof session.subject_context_json === 'string'`. The column is `Json?`
(`schema.prisma`), so a coach-brief object stored as JSON would be silently ignored
(treated as no context). Phase 1 never writes it via the controller (the
`openOrResumeSession` overload accepting `subjectContext` is not wired to a route), so
there is no live path today, but the type handling is inconsistent with the column
type. Document or normalise in Phase 1.1.

**P3-3 — RLS helper search_path differs from brief wording (repo is stricter — informational)**
Brief §2 expects new RLS functions pinned to `search_path = pg_catalog, public, app,
pg_temp` (pg_temp LAST). The Roman migration adds **no new functions** — it reuses the
canonical `app.current_user_id()` / `app.is_owner()` helpers, which in this repo are
pinned to `search_path = ''` (empty) via PR-RLS-FN (migration
`20261212000000_rls_helper_search_path`). Empty search_path is **stricter** than the
brief's pattern (every reference inside must be schema-qualified). The Roman migration
correctly relies on the hardened helpers. No action; the brief's wording predates the
empty-search-path hardening.

---

## Detailed verification

### 1. Schema additivity — ✅
`git diff -w base..head -- prisma/schema.prisma` semantic adds (whitespace-ignored):
- `enum RomanSurface { client coach }`
- `enum RomanMessageRole { user roman }`
- `model RomanSession` (cuid pk, user_id, surface, day_key, counters, soft-delete,
  voice-budget fields, `@@unique([user_id, surface, day_key])`, listing index)
- `model RomanMessage` (cuid pk, session_id, denormalised user_id, role, content, token
  cols, model_id, interrupted, parent_message_id, 3 indexes)
- `User.roman_sessions` / `User.roman_messages` back-relations (optional)
No existing model field removed/retyped. MWB-1 `WorkoutPlan`/`WorkoutProgram*` models
unchanged.

### 2. Migration safety — ✅
`prisma/migrations/20261216000000_add_roman_chat/migration.sql`:
- CREATE TYPE ×2, CREATE TABLE ×2, CREATE INDEX ×5, ADD FOREIGN KEY ×4 — all additive.
- No DROP / destructive ALTER on existing tables. FKs to `User` use `ON DELETE CASCADE`.
- `parent_message_id` self-FK uses `ON DELETE SET NULL` (safe).
- RLS: `ENABLE` + `FORCE` on both tables (verified live: `relrowsecurity=true`,
  `relforcerowsecurity=true`).
- Policies use `app.current_user_id()` / `app.is_owner()` — **not** `current_user`.
- BOTH `USING` and `WITH CHECK` present on SELECT/INSERT/UPDATE; service_role bypass via
  `FOR ALL ... USING(true) WITH CHECK(true)`.
- RomanMessage defence-in-depth: predicate requires `user_id = self` **AND** an `EXISTS`
  session-join `rs.user_id = self` (forged user_id OR foreign session both rejected).

### 3. MWB-1 untouched — ✅
Lane-file diff empty (R31 + non-collision rule satisfied).

### 4. Voice contract — ✅
`src/roman/roman.prompts.ts` `ROMAN_VOICE_CONTRACT` encodes verbatim: identity (one
Roman, he/him, Alfred, first-person), no-contraction default + quip exception, banned
hype/fitness-bro/gen-z/corporate registers, **NO emoji ever**, single-exclamation-per-
session ceiling, ~1-in-8 dry-quip + never-two-in-a-row, failure tone. No emoji present
in any prompt string. Live per-session budget (`exclamationUsed`, `lastTurnHadQuip`,
`quipsInSession`) surfaced. Matches `AI_BUTLER_ROMAN_IDENTITY_SPEC.md` §0/§1/§1.4/§1.5.
The prompt is the operative summary, not the full spec doc (verified: no mascot/operator
sections leak — prompts.spec.ts asserts this).

### 5. Feature flag — ✅
`RomanFeatureGuard.canActivate` throws `NotFoundException` (404, not 403) when
`isRomanChatEnabled()` is false. Guard applied at **controller class scope**
(`@UseGuards(JwtAuthGuard, RomanFeatureGuard)`, `roman.controller.ts:50`) → all 4 routes
covered. `isRomanChatEnabled` is ON only when env == `'true'` (case-insensitive, no
trim). Service re-checks the flag before any Anthropic call (defence-in-depth,
`roman.service.ts:346`). Tests prove off→404 and on→reachable, plus the full off-value
matrix (`'1'`,`'yes'`,`' true'`,`'TRUE '` all OFF).

### 6. RLS HECTACORN — ✅ (logic) / ⚠️ (sandbox execution)
24 tests cover: RLS enabled+forced, policy presence, owner-self read (positive),
cross-user IDOR (both directions, negative), owner reads all, anon zero, INSERT forged
user_id rejected, soft-delete own session, UPDATE foreign session = 0 rows, service_role
bypass, and 5 RomanMessage defence-in-depth permutations (forged user_id / foreign
session / both / mismatched-row SELECT invisible). No `.skip`. Real-Postgres design (no
mocks). Could not run to green here: `service_role` lacks TRUNCATE on the
test-harness-recreated tables in the throwaway DB (a grant/ownership limitation of the
audit sandbox, NOT a policy bug). Migration RLS state + all 7 policies verified directly
via `pg_catalog` query.

### 7. SSE streaming — ✅ with P2-2 caveat
`Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`,
`X-Accel-Buffering: no`, `flushHeaders()`. Emits `data: {json}\n\n`; error path writes
`event: error\ndata: {structured}\n\n` then `res.end()` (no raw stack — verified by
test). Disconnect handler wired via `req.on('close', () => abort.abort())` and removed
in `finally`. No unbounded buffer (streams delta-by-delta; only `acc` accumulates the
final persisted text, bounded by `max_tokens=1024`). **Caveat P2-2:** abort signal not
forwarded to the SDK stream call → possible upstream orphan.

### 8. Anthropic client — ✅
`anthropic-client.provider.ts`: key from `ConfigService.get('ANTHROPIC_API_KEY')` ??
`process.env`, never hardcoded, never logged. Returns `null` when unset (service emits
`ROMAN_UNAVAILABLE` rather than crashing boot). Model pinned:
`claude-3-7-sonnet-20250219` (`ROMAN_MODEL_PHASE_1`, no auto-bump).

### 9. DTO validation — ✅ with P2-3 note
`OpenSessionDto.surface` `@IsIn(['client','coach'])`; `SendMessageDto.content`
`@IsString @MinLength(1) @MaxLength(8000)` (bounded — DoS guard);
`ListMessagesQueryDto.cursor` `@IsString @MaxLength(64)`, `limit` `@IsInt @Min(1)
@Max(100)`. Global `forbidNonWhitelisted`. Session id not UUID-validated (P2-3, moot —
cuid).

### 10. Re-run gates — ✅ (see table). Test count 77 confirmed; no skips.

---

## Cross-check of builder claims

| Builder claim | Audit result |
|---|---|
| 77 tests (19+15+13+6+24) | ✅ Exact count confirmed; 53 non-RLS pass live, 24 RLS well-formed |
| Additive-only, no existing model modified | ✅ Confirmed (whitespace-only churn aside, P3-1) |
| Migration no DROP / no destructive ALTER | ✅ Confirmed (4772-line from-empty diff, zero DROP) |
| RLS ENABLE+FORCE both tables, defence-in-depth | ✅ Confirmed live via pg_catalog |
| Flag default-OFF, 404 not 403, all routes | ✅ Confirmed |
| Voice contract verbatim, no emoji | ✅ Confirmed |
| Anthropic key env-only | ✅ Confirmed |
| tsc / eslint clean | ✅ Confirmed |
| Rate limit "429" | ⚠️ Actually HTTP 403 (P2-1) |
| MWB-1 lane files avoided | ✅ Confirmed (empty diff) |
