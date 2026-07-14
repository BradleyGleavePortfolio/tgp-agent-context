# PR #504 — Lens B Re-Audit (Fixer Round 1) — LIVE

- **Repo:** growth-project-backend
- **PR:** #504 — `feat(contract): freeze tgp-importer OpenAPI slice + truthful error envelope`
- **Head:** `c20651bb4783c9ae0fa3fef483f72a390cf208de` (confirmed OPEN via `gh`)
- **Base:** `main` `7b6a2438`
- **Prior head:** `31add499` (Lens B round-1 = FAIL: LENS-B-01 P1, LENS-B-02 P2)
- **Lens:** B (adversarial, R72 dual-lens). Written in isolation — Lens A's re-audit not read.
- **Mode:** AUDIT ONLY (isolated worktree `/tmp/pr504_lens_b_reaudit`).

## VERDICT: CLEAN — P0=0 P1=0 P2=0 P3=0

The fixer commit `c20651b` ("document reachable ValidationPipe 400 + JwtAuth 401 on
importer freeze") is decorators + regenerated artifact + tests only — **no runtime
behavior change**. Both prior Lens B findings are fully resolved and no new P0–P3
defects were introduced.

---

## Method

Diffed `HEAD~1..HEAD` (the fixer commit) and re-derived the full per-route response
matrix straight out of the committed artifact, then checked each documented status
against **actual runtime reachability** (global `ValidationPipe`, global filters, global
`APP_GUARD` chain, per-route decorators, and the throwing services). Ran the contract
suites live to confirm byte-identity is intact.

Artifact snapshot (all 7 routes, from `docs/contracts/importer-openapi.json`):

| Route | Documented responses |
|---|---|
| `POST /auth/extension/refresh` | 200, **400**, 401(code), 429 |
| `POST /extension/pair/init` | 201, 400(code?), **401**, 403, 404, 429 |
| `POST /extension/pair/status` | 200, **400**, **401**, 403, 404, 429 |
| `POST /extension/pair/redeem` | 200, 400(code?), 404, 410(code), 429, **500** |
| `POST /scout/ingest` | 202, 400, 401, 403, 404, 429 |
| `POST /scout/ingest/complete` | 200, **400**, 401, 403, 404, 429 |
| `POST /scout/progress` | 204, **400**, 401, 403, 404, 429 |

(**bold** = added by the fixer.) 7 paths / 17 schemas, **no dangling `$ref`, no unused
schema** — unchanged.

---

## Prior findings — status

### LENS-B-01 (P1) — ValidationPipe `400` completeness → **RESOLVED**

The four previously-missing routes now document `400 → ErrorEnvelope`:

- `auth/extension/refresh` — added directly (`auth.controller.ts`), plain envelope, no
  domain code. Correct: refresh's only domain error is the 401; a malformed body is a
  pure ValidationPipe 400.
- `extension/pair/status` — added directly. Correct: `PairStatusDto.code` uses the same
  `@Matches(/^[0-9]{6}$/)` as redeem (`extension-pair.dto.ts:48`), so the 400 is
  genuinely reachable — the exact inconsistency flagged in round 1.
- `scout/progress` and `scout/ingest/complete` — covered by a **class-level**
  `@ApiResponse({ status: 400 })` on `ScoutController` (`scout.controller.ts:28`), which
  applies to both handlers. Verified present on both in the artifact.

All 7 importer routes with a validated request DTO now advertise the ValidationPipe 400.
`scout/progress` returns 204 on success but still correctly documents the 400 for a
rejected body. **Resolved.**

### LENS-B-02 (P2) — `401` on authenticated `pair/init` & `pair/status` → **RESOLVED**

Both now carry `401 → ErrorEnvelope` (`extension-pair.controller.ts`), described as
"global JwtAuthGuard runs before role checks" — matching the real `APP_GUARD` order
(JwtAuthGuard → UserThrottlerGuard → RolesGuard, `app.module.ts:395`). Plain envelope
(no domain code) is correct for a guard rejection. `redeem` still correctly omits 401
(it is `@Public`). **Resolved.**

---

## Adversarial sweep — new defects

None found (P0–P3 = 0).

- **No over-documentation.** Every status the fixer added is genuinely reachable: 400 via
  the global `whitelist`+`forbidNonWhitelisted` ValidationPipe; 401 via the global
  JwtAuthGuard on the two authenticated pair routes; 500 via the redeem mint path
  (`redeem()` → `mintExtensionSessionForCoach()` throws
  `InternalServerErrorException('pair_redeem_session_mint_failed')`,
  `extension-pair.service.ts:160`). No phantom statuses.
- **Redeem 500 is the right, bounded call.** It is documented only on `redeem` (the one
  importer route with an explicit domain `InternalServerErrorException`); other routes'
  500s are truly-unexpected catch-alls and conventionally omitted. Consistent, not a new
  asymmetry.
- **Envelope fidelity preserved.** All added 400/401/500 point at the shared
  `ErrorEnvelope` (`getSchemaPath` `$ref`), not a bespoke shape. The README "Error bodies"
  claim ("Every importer 4xx/5xx references one of two shared schemas") is now actually
  true and complete, where round-1 it was false.
- **Freeze integrity intact.** `npx jest test/contracts/*` → **55/55 pass** (was 48; +7
  new presence assertions). The byte-identity drift test
  (`expect(serialized).toBe(committed)`) and the cold-subprocess cross-process determinism
  test both pass, so the committed artifact is not stale and reproduces byte-for-byte.
- **No `any`** introduced by the fixer; TS compiles (ts-jest suites green).
- **No runtime/logic change**, no schema count change, no new/removed route.

### Non-blocking observation (not a finding)

The 7 new spec assertions are `toBeDefined()` presence checks rather than full
envelope-shape assertions. This is adequately backstopped by the existing byte-identity
drift test (which locks the entire artifact) plus the retained per-status shape
assertions on the code-bearing responses, so it does not weaken the freeze. Optional
future hardening, not a defect.

---

## Resolution summary

- resolved_ids: **LENS-B-01**, **LENS-B-02**
- blocking_ids: (none)

VERDICT: CLEAN
