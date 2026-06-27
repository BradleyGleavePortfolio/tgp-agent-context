# H6A PR #493 Audit — Lens A (Opus 4.8)
**Auditor:** Lens A (claude_opus_4_8)
**PR:** BradleyGleavePortfolio/growth-project-backend#493
**HEAD SHA:** 5a37ce8b12a1c67e918b38ead8a9326320895fd8
**Base SHA:** 185444e4326e61fd964c18498a3805533bd85152
**Date:** 2026-06-27
**Charter:** scope discipline, anti-padding, R86 math, migration reversibility, REVOKE coverage, erasure-token crypto, prisma drift, scope-creep flag, banned-cast investigation, build-and-test investigation, PR body completeness

## Executive summary

This PR does NOT ship the LOCKED D-H6-1 substrate. It ships a *different* 13-column table than the operator locked: it renamed five contractual columns (`actor_user_id`→`actor_id`, `actor_role`→`actor_type`, `entity_type`→`resource_type`, `entity_id`→`resource_id`, `ip_inet`→`ip_address`), added a column the spec never authorized (`tenant_id`), and silently dropped a column the spec required (`user_agent`). The substrate is supposed to be the contractual foundation that H6C and BL-DATA-CAPTURE compose against verbatim; it is not, and the H6C canonical wrap pattern (`actorUserId`, `entityType`) will not compile against this `AuditLogContext`. Worse, the security architecture eats itself: the migration `REVOKE`s UPDATE from `app_runtime`, but `AuditLogService.redactPii()` — the GDPR Art. 17 path this very PR ships — issues `UPDATE`s through the ordinary app Prisma client (not a service-role client, despite a comment claiming otherwise), so right-to-erasure will throw `permission denied` against a correctly-migrated database, and the only test that "proves" erasure works mocks the database away. Four CI gates are red and three of them are genuine PR defects (banned `@ts-expect-error` without an issue ref, a stale migration-count snapshot, and a test-density marker mismatch); the fourth (reversibility) is a known CI-harness URI bug, not a down.sql defect. The crypto is competent on the basics (keyed HMAC-SHA256, boot-time fail-fast) but truncates to 64 bits and is deterministic-by-design, which leaves a stable cross-row pseudonym after "erasure" that undercuts the Art. 17 claim. This is BUILDER-BLOCKED with multiple BLOCKER-class findings.

## Findings

### F1 — Substrate ships the WRONG 13-column shape (D-H6-1 contract break)
- **Severity:** BLOCKER
- **Doctrine cite:** D-H6-1 (LOCKED 13-col shape), R0/R1 (ship correctly), H6A brief §1.1 / briefing pack §2
- **File + line:** `prisma/migrations/20261226000000_create_audit_log/migration.sql:43-56`; `prisma/schema.prisma:6743-6756`; `src/audit-log/audit-log.types.ts:34-58`
- **Observation:** D-H6-1 and the H6A builder brief §1.1 lock the column set as `id, created_at, actor_user_id, actor_role, action, entity_type, entity_id, before_state, after_state, request_id, ip_inet, user_agent, reason`. The shipped table is `id, tenant_id, actor_id, actor_type, action, resource_type, resource_id, before_state, after_state, reason, request_id, ip_address, created_at`. Five columns renamed away from the locked names, `tenant_id` added (never in the D-H6-1 list), and `user_agent` **omitted entirely**. The migration comment openly admits the deviation ("D-H6-1 names roles admin_role and app_runtime ... we honor the LOCKED intent"). Renaming a LOCKED contract is not "honoring intent"; it is redefining the contract. H6C's brief canonical wrap (`actorUserId: ctx.userId`, `entityType: 'User'`) cannot satisfy this PR's `AuditLogContext` (`actorId`, `resourceType`), so the downstream slice will not compile against the substrate it is supposed to consume.
- **Required fix:** Either (a) restore the LOCKED D-H6-1 column names and add `user_agent`, or (b) obtain an explicit operator amendment in `OPERATOR_DECISIONS_LOG.md` re-locking the new shape (tenant-scoped + renamed) AND update H6A/H6B/H6C briefs to match before any downstream slice dispatches. Silence is not authorization to redefine a LOCKED decision.
- **Evidence:** migration.sql:44 `tenant_id uuid NOT NULL`, :45 `actor_id uuid NULL`, :46 `actor_type text NOT NULL`; brief §1.1 lists `actor_user_id`, `actor_role`, `entity_type`, `entity_id`, `ip_inet`, `user_agent`. No `user_agent` appears anywhere in the migration or model.

### F2 — GDPR erasure path is architecturally blocked by the immutability design it ships alongside
- **Severity:** BLOCKER
- **Doctrine cite:** D-H6-1 (REVOKE UPDATE/DELETE), D-H6-4 (GDPR Art. 17), 50-Failures #36 (silent failure), R1
- **File + line:** `src/audit-log/audit-log.service.ts:78-94` (`redactPii`); `prisma/migrations/.../migration.sql:106-107` (REVOKE)
- **Observation:** The migration `REVOKE UPDATE, DELETE ON audit_log FROM app_runtime`. `AuditLogService.redactPii(userId)` performs `this.prisma.auditLogEntry.update(...)` in a loop. The method comment claims it "Runs via the privileged service-role client because the table REVOKEs UPDATE from app_runtime" — but the code uses the **same injected `this.prisma`** instance; there is no service-role escalation anywhere in the file. If `app_runtime` is the runtime principal (as the migration intends), every `UPDATE` raises `permission denied`, so right-to-be-forgotten fails closed against a correctly-migrated DB. The substrate cannot perform the one privileged operation it exists to perform. The redact-pii spec does not catch this because it injects a Prisma double (`prisma-test-double.ts`) that never enforces grants.
- **Required fix:** Route `redactPii` through an explicitly privileged client (service_role / a dedicated erasure role that retains UPDATE), and add a live-DB test under the role-switched session proving (a) `app_runtime` UPDATE is denied and (b) the erasure path's privileged client succeeds. Do not rely on the mocked spec.
- **Evidence:** service.ts:84 `await this.prisma.auditLogEntry.update(...)`; comment at service.ts:74-76; migration.sql:107 `REVOKE UPDATE, DELETE ON audit_log FROM app_runtime;`.

### F3 — `redactPii` erasure is non-atomic and N+1 (partial-erasure GDPR hazard)
- **Severity:** MAJOR
- **Doctrine cite:** 50-Failures #44 (no tx for multi-step), #28 (race), D-H6-4
- **File + line:** `src/audit-log/audit-log.service.ts:79-92`
- **Observation:** Erasure does a `findMany` then iterates per-row `update` calls with NO enclosing `$transaction`. A failure mid-loop leaves some of a user's rows tokenized and others with plaintext PII intact — a partially-completed right-to-erasure, which is itself a compliance breach (the user was told they were erased; they were not). It is also N round-trips for N rows.
- **Required fix:** Wrap the erasure in a single `$transaction` and use a bulk `updateMany` / single raw UPDATE keyed by `actor_id = $1`, so erasure is all-or-nothing.
- **Evidence:** service.ts:79 `findMany`; service.ts:83-90 per-row `update` loop with no transaction wrapper.

### F4 — `withAuditLog` signature deviates from the LOCKED D-H6-5 contract
- **Severity:** MAJOR
- **Doctrine cite:** D-H6-5 (same-transaction synchronous audit writes), H6A brief §7
- **File + line:** `src/audit-log/audit-log.service.ts:54-72`; brief §7 / §83
- **Observation:** The brief specs `withAuditLog<T>(tx: Prisma.TransactionClient, args, op): Promise<T>` — the **caller** owns the transaction and passes `tx` in, so the audit row shares the caller's already-open transaction. The implementation is `withAuditLog<T>(ctx, fn)` and opens its OWN `this.prisma.$transaction(...)` internally, handing `tx` to `fn`. A call site that already runs inside an outer transaction (the common case for a multi-step mutation) will now nest a second transaction, defeating the single-transaction double-entry guarantee D-H6-5 exists to provide. This is a contract deviation that H6C's canonical pattern (`prisma.$transaction(async (tx) => withAuditLog(tx, args, () => tx.user.update(...)))`) cannot use as written.
- **Required fix:** Adopt the brief's `withAuditLog(tx, args, op)` caller-provided-tx signature, or obtain an operator amendment to D-H6-5. Reconcile with the H6C wrap pattern before H6C dispatches.
- **Evidence:** service.ts:54 `async withAuditLog<T>(ctx: AuditLogContext, fn: AuditedFn<T>)`; brief line 83 `withAuditLog<T>(tx: Prisma.TransactionClient, args: AuditLogArgs, op: () => Promise<T>)`.

### F5 — INSERT path likely blocked by FORCE RLS unless app principal == service_role
- **Severity:** MAJOR
- **Doctrine cite:** R125 (RLS tier 1), D-H6-5, 50-Failures #36
- **File + line:** `migration.sql:78-80` (`FORCE ROW LEVEL SECURITY` + service-role-only INSERT policy); `service.ts:60` (`tx.auditLogEntry.create`)
- **Observation:** The table sets `FORCE ROW LEVEL SECURITY` and the only INSERT policy is `audit_log_service_role_write ... TO service_role`. `withAuditLog` inserts via the ordinary Prisma client. If the runtime principal is `app_runtime`/`authenticated` rather than `service_role`, the INSERT is denied by RLS and — with the fail-open valve OFF (the default) — every audited mutation rolls back. The migration also never sets `app.tenant_id` GUC that the `audit_log_tenant_isolation` SELECT policy reads, so tenant-scoped reads will return zero rows unless a caller sets it. Neither path is exercised by a live-DB test (all audit-log specs mock Prisma).
- **Required fix:** Confirm and document the exact runtime DB role; ensure the write path runs as a principal with the INSERT policy; add a live-RLS test (the brief's conditional `audit-log.rls.spec.ts`) proving INSERT succeeds, UPDATE/DELETE are denied, and tenant-scoped SELECT works with `app.tenant_id` set. The conditional third test was NOT added and the carried migration spec does not cover role-switched permission-denied (see F12).
- **Evidence:** migration.sql:79 `ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;`, :84-85 service_role INSERT policy; tenant policy at :71 reads `current_setting('app.tenant_id', true)`.

### F6 — Migration comment authorizes DELETE, directly contradicting D-H6-4 archive-never-delete
- **Severity:** MAJOR
- **Doctrine cite:** D-H6-4 (archive, never delete), R1 (correctness of shipped doctrine)
- **File + line:** `migration.sql:101-104`
- **Observation:** The §4 header comment reads: "Only the privileged retention-rotation role may DELETE, and only AFTER archiving rows older than 7 years." This contradicts D-H6-4 ("archive, never delete"), the docs (`docs/audit-log.md`: "It never deletes a row"), and the retention script's own never-delete guard. No such DELETE grant exists in the SQL either, so the comment describes a behavior that is both wrong-per-doctrine and unimplemented. A future operator reading this comment could grant DELETE believing it is sanctioned.
- **Required fix:** Delete the misleading clause; state plainly that no role is ever granted DELETE on `audit_log` (forward-only retention via in-place tokenization).
- **Evidence:** migration.sql:102-103 "Only the privileged retention-rotation role may // DELETE, and only AFTER archiving"; contradicted by docs/audit-log.md:100 "never deletes" and scripts/audit-log-retention-rotate.ts:62-74 guard.

### F7 — Erasure token: 64-bit truncation + determinism weakens the Art. 17 claim
- **Severity:** MAJOR
- **Doctrine cite:** D-H6-4 (GDPR Art. 17), R98, 50-Failures #1/#crypto, R1 (threat-model correctness)
- **File + line:** `src/audit-log/erasure-token.ts:55-58` (`erasureToken`), :41 (`ERASURE_TOKEN_RE`)
- **Observation:** `erasureToken` truncates HMAC-SHA256 to the first 16 hex chars = **64 bits**. Two threat-model problems: (1) **Collision** — 64 bits invites birthday collisions at ~2^32 distinct PII values, so two different plaintexts can map to the same token, silently corrupting cross-row correlation. (2) **Determinism = stable pseudonym** — because the token is a deterministic function of `(secret, plaintext)`, every audit row for the same erased email/phone keeps an identical token after "erasure," letting anyone with read access re-link all of a forgotten user's records, and confirm-guess a known plaintext if the secret ever leaks (64-bit space + low-entropy PII is brute-forceable offline). For GDPR Art. 17, leaving a durable linkable pseudonym is arguably not erasure. The brief did spec `hmac[:16]`, so this matches the brief letter — but the brief's primitive is itself weak and the briefing pack explicitly tasked Lens A to be ruthless here.
- **Required fix:** Use the full 256-bit HMAC digest (or at least 128 bits) to kill collisions; and document/justify the determinism tradeoff explicitly, or salt per-row for true unlinkability where correlation is not required. Escalate the primitive design to the operator since it touches a LOCKED decision.
- **Evidence:** erasure-token.ts:56 `createHmac('sha256', ...).update(plaintext).digest('hex')`; :57 `return \`tok_${digest.slice(0, 16)}\`;`.

### F8 — Two divergent redaction primitives that do not compose
- **Severity:** MAJOR
- **Doctrine cite:** R98, D-H6-4, 50-Failures (doc/impl drift)
- **File + line:** `erasure-token.ts:91-104` (`redactState`, write-path), :114-131 (`tokenizePiiState`, on-demand)
- **Observation:** The write-path `redactState` replaces PII leaves with the **static sentinel** `'[REDACTED:GDPR-ART-17]'`. The on-demand erasure `tokenizePiiState` replaces PII leaves with a **keyed token** `tok_…`. They are inconsistent and do not compose: after a normal audited write, the PII key already holds the static sentinel (not matching `ERASURE_TOKEN_RE`), so a later `tokenizePiiState` pass will run `erasureToken('[REDACTED:GDPR-ART-17]')` on the sentinel string itself, producing a meaningless token of a constant. The two paths were clearly written independently and never reconciled.
- **Required fix:** Decide one canonical erased representation. If write-path already strips PII to a static sentinel, on-demand erasure is largely redundant; if correlation across erasures matters, the write-path should also tokenize (not sentinel). Make `tokenizePiiState` a no-op on the static sentinel.
- **Evidence:** erasure-token.ts:32 `ERASURE_TOKEN = '[REDACTED:GDPR-ART-17]'`; :100 `out[k] = isPiiKey(k) ? ERASURE_TOKEN : ...`; :124 `out[k] = ... ERASURE_TOKEN_RE.test(v) ? v : erasureToken(String(v))`.

### F9 — `isPiiKey` over-matches via substring `.includes`, destroying audit facts
- **Severity:** MAJOR
- **Doctrine cite:** R98 (redact PII, preserve audit fact), D-H6-4, 50-Failures #36
- **File + line:** `erasure-token.ts:86-89` (`isPiiKey`)
- **Observation:** `isPiiKey` returns true if the lowercased key `=== pat || endsWith(pat) || includes(pat)`. The `.includes` clause over-redacts: a key like `token_count`, `email_verified`, `password_changed_at`, `address_validated`, or `card_brand` (non-PII metadata / booleans / counts) all match (`token`, `email`, `password`, `address`, `card`) and get nuked to the sentinel/token. This destroys forensically useful audit facts the brief explicitly wants preserved, and worsens F8's mis-tokenization. The comment claims "start narrow," but `.includes` is the broadest possible match.
- **Required fix:** Drop the `.includes` clause; match on exact key or `endsWith` only, with a tested allow-list for known-safe metadata keys (`*_count`, `*_verified`, `*_changed_at`, `*_brand`). Add a test asserting `token_count` survives and `email` is redacted.
- **Evidence:** erasure-token.ts:88 `return PII_KEY_PATTERNS.some((pat) => k === pat || k.endsWith(pat) || k.includes(pat));`.

### F10 — Banned-cast CI (R75) fails on `@ts-expect-error` lacking an issue ref
- **Severity:** BLOCKER (CI red; R75/R100.A2)
- **Doctrine cite:** R75 / R100.A2 (net banned-cast additions = 0), R0
- **File + line:** `test/audit-log/prisma-test-double.ts:23`
- **Observation:** The gate `Banned cast tokens (R75/R100.A2)` reports `@ts-expect-error +1 / Total net 1 / FAIL`. The gate's exemption regex is `EXEMPT_RE='@ts-expect-error.*#[0-9]{4,}'` — `@ts-expect-error` is only exempt when the SAME line carries a `#NNNN` (4+ digit) issue reference. The builder's line carries a prose justification but no issue number, so the gate counts it. The R0 brief text ("`@ts-expect-error` with a one-line justification IS allowed") is looser than what CI actually enforces; the builder followed the brief letter and still tripped the gate.
- **Required fix:** Append a tracking issue ref (e.g. `// @ts-expect-error #NNNN partial structural mock...`) to satisfy `EXEMPT_RE`, OR eliminate the `@ts-expect-error` by giving `asPrismaDouble` a properly-typed partial signature (`Pick<PrismaService, ...>` of the delegates actually used) so no suppression is needed. The latter is cleaner.
- **Evidence:** CI job 83799312861: `@ts-expect-error +1 -0 net +1`, `FAIL — R75 violation: this PR adds banned cast tokens (net +1)`; gate regex `EXEMPT_RE='@ts-expect-error.*#[0-9]{4,}'`.

### F11 — build-and-test CI fails: stale migration-count snapshot (PR-caused) + pre-existing ENOENT (base)
- **Severity:** BLOCKER (CI red) — split cause
- **Doctrine cite:** R0/R1, R82 append-only migration doctrine
- **File + line:** `test/roman-coach-reviewed-migration.spec.ts:223`; `test/partial-refund-decision-rls-migration.spec.ts:39`
- **Observation:** Two suites fail. (a) `roman-coach-reviewed-migration.spec.ts:223` — `expect(belowFloor).toHaveLength(KNOWN_BELOW_FLOOR_COUNT)` fails `Expected 146 / Received 149`: the migration-directory snapshot count is stale and the new `20261226000000_create_audit_log` directory contributes to the count drift. This is a real PR-caused break — adding a migration without updating the brittle count snapshot. (b) `partial-refund-decision-rls-migration.spec.ts:39` — `ENOENT ... 20261214000000_named_regimes_and_partial_refund_decision/migration.sql`: a pre-existing test referencing a migration file absent on this base (BL-MIGRATION-REBASELINE territory, consistent with "Schema parity deferred"). (b) is NOT this PR's fault; (a) IS. tsc --noEmit passed; all audit-log suites passed.
- **Required fix:** For (a), update `KNOWN_BELOW_FLOOR_COUNT` (or the floor logic) to account for the new migration, per that test's append-only contract. For (b), flag to the operator as a base-branch breakage outside H6A scope; do NOT paper over it inside this PR.
- **Evidence:** CI job 83799312842: `Test Suites: 2 failed, 12 skipped, 478 passed`; `roman-coach-reviewed-migration.spec.ts:223 Expected length 146 / Received 149`; `partial-refund-decision-rls-migration.spec.ts:39 ENOENT ... 20261214000000_named_regimes_and_partial_refund_decision/migration.sql`.

### F12 — Test-density CI (R74/R100.A1) fails: wrong exemption marker in title
- **Severity:** MAJOR (CI red)
- **Doctrine cite:** R74 / R100.A1 (test:src ≥ 2.0), R86 (anti-padding exception form)
- **File + line:** PR title; CI job 83799312845
- **Observation:** The density gate computes `src lines added: 352, test lines added: 619, ratio ≈ 1.75` and fails because there is no `[TEST-EXEMPT: <reason>]` token in the title. The title only carries `[LOC-EXEMPT: substrate-migration]`, which the LOC gate (R100.A3, passing) recognizes but the density gate (R100.A1) does NOT — the density gate looks specifically for `[TEST-EXEMPT: ...]`. This resolves the briefing-pack "paradox": 5 test files exist, ratio is a healthy 1.75 for an anti-padding slice, but the wrong marker is present. Per the anti-padding doctrine (operator-locked) the slice should NOT pad to 2.0; it should carry the `[TEST-EXEMPT]` marker + the R86 exception block. The marker is simply missing/mis-named.
- **Required fix:** Add `[TEST-EXEMPT: anti-padding-H6-real-failure-modes]` (or the gate's accepted form) to the PR title, and paste the R86 R74 exception block (from H6A brief lines 189-210) into the body. Do NOT add filler tests to reach 2.0.
- **Evidence:** CI job 83799312845: `ratio test:src ≈ 1.75`, `FAIL — test:src ratio below 2.0 and no [TEST-EXEMPT: <reason>] in title.`; live title contains `[LOC-EXEMPT: substrate-migration]` only.

### F13 — Reversibility CI (R82) red, but cause is a CI-harness URI bug, not down.sql
- **Severity:** MINOR (CI red, not a code defect) / INFRA
- **Doctrine cite:** R82 (migrations reversible)
- **File + line:** CI job 83799383998; `down.sql` (verified correct by inspection)
- **Observation:** The reversibility gate dies with `psql: error: invalid URI query parameter: "schema"` (exit 2) before it ever evaluates `down.sql`. The workflow passes a Prisma-style `DATABASE_URL=...?schema=public` to bare `psql`, and libpq rejects the `schema` query param. This is the known `BL-CI-REVERSIBILITY-PSQL` infra bug the brief itself references (brief line 183). Independent inspection of `down.sql` shows it faithfully reverses migration.sql operation-for-operation: drops all 5 policies, all 3 indexes (including `audit_log_actor_idx`), and the table; intentionally does not drop the shared roles (correct — role lifecycle is ops). The REVOKE grants and RLS enablement vanish with `DROP TABLE`. down.sql is correct; the gate is broken.
- **Required fix:** No change to down.sql required. Land the `BL-CI-REVERSIBILITY-PSQL` fix (strip `?schema=` before feeding psql, or use `PGDATABASE`/`-d`) so the gate can actually run. Re-run the gate after the infra fix to confirm forward→down→forward parity.
- **Evidence:** CI job 83799383998: `psql: error: invalid URI query parameter: "schema"`, `##[error]Process completed with exit code 2`; gate never reached the `diff -u` schema-parity step.

### F14 — Prisma model omits the partial actor index (schema drift)
- **Severity:** MINOR
- **Doctrine cite:** charter §3.7, R82 (schema/migration parity)
- **File + line:** `prisma/schema.prisma:6755-6756` vs `migration.sql:62-64`
- **Observation:** migration.sql creates THREE indexes: `audit_log_tenant_created_idx`, `audit_log_actor_idx` (PARTIAL: `WHERE actor_id IS NOT NULL`), and `audit_log_resource_idx`. The Prisma model declares only TWO `@@index` (tenant_created, resource). `audit_log_actor_idx` is absent from the model, and Prisma `@@index` cannot express the partial `WHERE` clause anyway. `prisma migrate diff` / schema-parity will flag the DB-has-index-model-doesn't drift. The dedicated Schema-parity CI check passes only because it is explicitly "deferred to BL-MIGRATION-REBASELINE" — the drift is real, just not currently gated.
- **Required fix:** Document the intentional partial index as a raw-SQL-only object (acceptable Prisma pattern), or add a non-partial `@@index([actor_id])` to the model and accept the slightly larger index. Note the divergence in `docs/audit-log.md` so the next `prisma db pull` doesn't "fix" it away.
- **Evidence:** migration.sql:63 `CREATE INDEX audit_log_actor_idx ON audit_log (actor_id) WHERE actor_id IS NOT NULL;`; schema.prisma has only `@@index([tenant_id, created_at(sort: Desc)]...)` and `@@index([resource_type, resource_id]...)`.

### F15 — Retention script uses `$queryRawUnsafe` with interpolation (violates its own Gate-3)
- **Severity:** MAJOR
- **Doctrine cite:** 50-Failures #3 (SQL injection), H6A brief Gate-3 ("No `$queryRawUnsafe` with interpolation"), R75-adjacent
- **File + line:** `scripts/audit-log-retention-rotate.ts:308, 332, 333` (`$queryRawUnsafe`); :47-52, :334-345 (interpolated SQL)
- **Observation:** The script issues `prisma.$queryRawUnsafe<AuditRow[]>(...)` three times, with SQL built via template-literal interpolation of `RETENTION_YEARS` and `BATCH_SIZE` (`INTERVAL '${RETENTION_YEARS} years'`, `LIMIT ${BATCH_SIZE}`). The interpolated values are numeric constants today, so there is no live injection, but `$queryRawUnsafe` is exactly the unsafe API the brief's own Gate-3 #3 forbids ("No `$queryRawUnsafe` with interpolation"). The cursor-paged query is parameterized for `$1/$2` (good) but still issued through `$queryRawUnsafe`.
- **Required fix:** Use `prisma.$queryRaw` (tagged template, parameterized) or pass the constants as bound parameters. Eliminate `$queryRawUnsafe` from the script.
- **Evidence:** retention script :308 `await prisma.$queryRawUnsafe<AuditRow[]>(SELECT_ELIGIBLE_SQL);`; :49 `INTERVAL '${RETENTION_YEARS} years'`, :52 `LIMIT ${BATCH_SIZE}`.

### F16 — Retention "never-delete" guard is theater; only checks one hardcoded string
- **Severity:** MAJOR
- **Doctrine cite:** D-H6-4 (archive-never-delete invariant), H6A brief §8 (construction-time guard)
- **File + line:** `scripts/audit-log-retention-rotate.ts:54-76` (`assertArchiveNeverDelete`, `AUDIT_LOG_SQL_STATEMENTS`)
- **Observation:** The guard regex-scans `AUDIT_LOG_SQL_STATEMENTS`, which contains only `SELECT_ELIGIBLE_SQL`. The SECOND, cursor-paged query (the inline template literal at :334) is NOT registered in that array, so the guard never sees it. And a `delete|truncate|update` regex over a string that begins with `SELECT` is trivially satisfied — it provides essentially zero protection while creating false confidence. The brief §8 wanted a guard that throws if any CODE PATH would issue DELETE/TRUNCATE; this checks one constant.
- **Required fix:** Either register every SQL statement the script can emit in the scanned set, or (better) enforce the invariant structurally — route all DB access through a read-only client/role that physically lacks DELETE/UPDATE, so a destructive statement fails at the database, not at a string regex.
- **Evidence:** retention script :51 `AUDIT_LOG_SQL_STATEMENTS: readonly string[] = [SELECT_ELIGIBLE_SQL];`; second query at :334-345 not included.

### F17 — Object Lock GOVERNANCE mode is bypassable; not a true 7-year immutable archive
- **Severity:** MINOR
- **Doctrine cite:** D-H6-4 (immutable archive intent), R1 (hyperscaler default)
- **File + line:** `scripts/audit-log-retention-rotate.ts:148-150`
- **Observation:** Archives are written with `ObjectLockMode: 'GOVERNANCE'`, which any principal holding `s3:BypassGovernanceRetention` can overwrite/delete. For a 7-year regulatory audit archive the implied requirement is true immutability, which only `COMPLIANCE` mode provides. The comment punts ("Compliance mode can be substituted by ops") — shipping the weaker default for compliance-critical data.
- **Required fix:** Default to `COMPLIANCE` mode (or make the mode a required, documented env decision with COMPLIANCE recommended). A bypassable lock on a GDPR/SOC2 audit archive is the wrong default.
- **Evidence:** retention script :148 `ObjectLockMode: 'GOVERNANCE'`.

### F18 — Retention script promises Glue catalog registration but never implements it
- **Severity:** MINOR
- **Doctrine cite:** H6A brief §8 ("updates AWS Glue catalog table"), 50-Failures (doc/impl drift)
- **File + line:** `scripts/audit-log-retention-rotate.ts` (header comment + docs) vs imports
- **Observation:** The brief §8 and `docs/audit-log.md` describe registering the partition with the AWS Glue catalog. The script imports only `S3Client, PutObjectCommand, HeadObjectCommand` and makes zero Glue SDK calls. The "Glue/Athena-style partition path" (:120) is just an S3 key naming convention, not catalog registration. Documented behavior is unimplemented.
- **Required fix:** Either implement Glue `CreatePartition`/`BatchCreatePartition`, or correct the brief/docs to state partitions are discovered via Athena partition projection on the S3 key layout (which is a legitimate alternative — but then say so).
- **Evidence:** retention script imports `from '@aws-sdk/client-s3'` only; header comment claims Glue registration; no `@aws-sdk/client-glue` import.

### F19 — Retention script LOC (203) exceeds the R86 exemption's stated arithmetic (167)
- **Severity:** MINOR
- **Doctrine cite:** R76 / R100.A3, R86 exception form
- **File + line:** `scripts/audit-log-retention-rotate.ts` (203 LOC) vs H6A brief R86 table (167)
- **Observation:** The R86 LOC exemption table in the H6A brief justifies the retention script at **167 LOC**; the shipped file is **203 LOC** (+36 over the justified figure). Several other per-file figures in the exemption table also undercount the as-shipped files (e.g. erasure-token brief=139 vs shipped 179; service brief=61 vs shipped 95). The exemption's per-file no-waste math is stale relative to the actual diff, so the operator-signed justification does not match reality. The LOC budget gate (R100.A3) still passes because the marker is recognized, but the exemption block (once pasted into the body) will misstate the numbers.
- **Required fix:** Recompute the R86 per-file table against the actual `git diff --numstat` and update the exemption block in the PR body to the true LOC. Justify the +36 in the retention script (or trim it).
- **Evidence:** brief lines 127/131/128 (167/139/61) vs PR file inventory (203/179/95).

### F20 — PR body is incomplete (R78 / R86 / threat model all missing)
- **Severity:** MAJOR
- **Doctrine cite:** R78 (audit/PR completeness), R86 (exception blocks required in body), charter §3.11
- **File + line:** PR #493 body
- **Observation:** The live body is two sentences plus `VERDICT: BUILDER-COMPLETE (pending final gates + body)`. It is missing: the R86 R76 exception block (per-file no-waste + split-feasibility), the R86 R74 exception block + the `[TEST-EXEMPT]` reasoning, the R82 reversibility statement, the REVOKE/append-only policy citation, and any erasure-token threat model. The body even admits it is unfinished ("pending final gates + body"). Note the builder's `VERDICT: BUILDER-COMPLETE` line is self-asserted and contradicted by 4 red CI gates.
- **Required fix:** Populate the body with both R86 exception blocks (from H6A brief), the reversibility + REVOKE statements, the erasure-token threat model (algorithm, key source, determinism tradeoff, the F7 truncation note once fixed), and D-H6-1/D-H6-5 references. Remove the premature BUILDER-COMPLETE verdict until CI is green.
- **Evidence:** live body: "WIP — carries forward H6 substrate... VERDICT: BUILDER-COMPLETE (pending final gates + body)".

### F21 — Scope discipline: retention script IS in scope (briefing-pack suspicion resolved)
- **Severity:** NIT (clears the suspicion, not a defect)
- **Doctrine cite:** D-H6-4, H6A brief §8
- **File + line:** `scripts/audit-log-retention-rotate.ts`
- **Observation:** The briefing pack §3.8 flagged the 203-LOC retention script as POSSIBLE scope-creep. The H6A builder brief §8 (lines 88-91) and the R86 exemption table (line 127) explicitly place the retention rotation script IN H6A scope under D-H6-4 ("the rotation script must exist at substrate creation so retention is enforceable from day 1"). So it is NOT scope-creep. The H6A→H6B→H6C split is otherwise clean: no circuit-breaker code (H6B), no ESLint rule or service wraps (H6C) appear in the diff. The scope boundary holds; the defects are within-scope quality issues (F15-F19), not scope bleed.
- **Required fix:** None for scope. (Fix the script's internal defects per F15-F19.)
- **Evidence:** H6A brief line 89 "writes to S3 Object Lock bucket ... DOES NOT DELETE"; diff contains no `src/circuit-breakers/`, no `eslint-rules/`, no service-file wraps.

## Charter coverage matrix
| Charter item | Status | Finding refs |
|---|---|---|
| 3.1 Scope discipline | ✅ | F21 (in scope; clean split) |
| 3.2 Anti-padding (R74/R86) | ⚠️ | F12 (wrong marker; ratio 1.75 honest, 5 files = 3 carried + 2 new, not padding) |
| 3.3 R86 LOC-exempt math | ❌ | F19 (stale per-file LOC), F20 (block missing from body) |
| 3.4 Migration reversibility | ⚠️ | F13 (CI red = harness URI bug; down.sql verified correct) |
| 3.5 REVOKE coverage | ❌ | F2 (erasure blocked by REVOKE), F5 (INSERT vs FORCE RLS), F6 (comment authorizes DELETE) |
| 3.6 Erasure-token crypto | ❌ | F7 (64-bit + determinism), F8 (divergent primitives), F9 (over-broad isPiiKey) |
| 3.7 Prisma schema drift | ⚠️ | F14 (partial actor index missing from model); F1 (column-shape divergence) |
| 3.8 Retention-rotate scope-creep | ✅ scope / ❌ quality | F21 (in scope), F15/F16/F17/F18 (quality defects) |
| 3.9 Banned-cast CI failure | ❌ | F10 (`@ts-expect-error` no `#NNNN`) |
| 3.10 build-and-test failure | ❌ | F11 (stale migration snapshot PR-caused + pre-existing ENOENT) |
| 3.11 PR body completeness | ❌ | F20 |

BLOCKER count: 4 (F1, F2, F10, F11). MAJOR: 11 (F3, F4, F5, F6, F7, F8, F9, F12, F15, F16, F20). MINOR/NIT: 6 (F13, F14, F17, F18, F19, F21).

## Disagreements with sibling lens
(Section empty on first emission; to be populated post-adjudication against Lens B / GPT-5.5.)

VERDICT: FINDINGS
