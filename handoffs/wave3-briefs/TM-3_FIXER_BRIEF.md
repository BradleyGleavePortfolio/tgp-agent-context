# TM-3 FIXER BRIEF — clear all P2/P3 audit findings to dual-CLEAN_NO_FINDINGS

**Lane:** TM-3 public listing browse + SEO JSON-LD (`PublicListingController`)
**PR:** #434
**Branch:** `feat/tm-3-public-browse`
**Worktree:** `/home/user/workspace/tgp/backend-tm-3-fix`
**Starting head SHA:** `1846b04af4f30b7ccc96eec3971051de4374dd60`
**Operator:** Bradley Gleave
**Role:** FIXER (not builder, not auditor). Address the specific audit findings below; do NOT redesign the lane.
**Audit reports to honor:**
- `/home/user/workspace/audit-reports/TM-3-audit-A-1846b04.md` (Lens A — Correctness/Security/RLS)
- `/home/user/workspace/audit-reports/TM-3-audit-B-1846b04.md` (Lens B — Tests/Contracts)

---

## R81 + operator directive — what success looks like

Operator quote (binding):
> "we dont merge until we are clear of P0-P3's entirely"

Per **R81 §Severity inclusion** (quoted verbatim from canonical rule):
> "P3 (style, comments, naming smells, missing docstrings) MUST be fixed before merge under R81 — this is stricter than the historical 'P0-P2 must be fixed; P3 may be deferred' pattern."

Therefore the goal of this fixer pass is to clear EVERY P2 and P3 in BOTH audit reports so the next dual-GPT-5.5 re-audit returns CLEAN_NO_FINDINGS on both lenses.

---

## Findings to resolve (in priority order)

### From Lens A (`TM-3-audit-A-1846b04.md`)

**A-P2-1 — No controller spec test-locks `@Public()` + `@Throttle`** [BLOCKER]
- File to add: `src/talent-marketplace/__tests__/public-listing.controller.spec.ts`
- Assert: `Reflect.getMetadata(IS_PUBLIC_KEY, PublicListingController)===true` (use `import { IS_PUBLIC_KEY } from '<correct path — grep src for IS_PUBLIC_KEY>'`)
- Assert: throttle metadata present with `ttl=60000`, `limit=60` (use `Reflect.getMetadata('__throttler__:default', PublicListingController)` or whatever the canonical key is — grep the codebase for the existing pattern in other controller specs that test `@Throttle`)
- Assert: handler-level absence of `@Roles()` — controller is public-by-decorator, NOT by ungated route

**A-P2-2 — JSON-LD "PII-free" spec is partially tautological** [BLOCKER]
- File: `src/talent-marketplace/__tests__/job-posting-jsonld.spec.ts` lines 68-80
- Current spec feeds a clean fixture and asserts no PII keys appear — true by construction
- Fix: add a NEW `it()` that cast-injects rogue PII fields (`hirerEmail`, `applicantEmail`, `hirer_id`, `owner_id`) onto the fixture (use `as unknown as PublicListingDetailDto & {...}` IS BANNED — use `Object.assign(detail(), {hirerEmail: 'test@x.com', hirer_id: 'h1'}) as PublicListingDetailDto`)
- Then call `buildJobPostingJsonLd()` and assert the serialized JSON-LD does NOT contain those values OR keys
- This proves the BUILDER drops unknown keys, not just that the type system enforces input shape

**A-P3-1 — Cursor not HMAC-signed (documentation/follow-up)** [BLOCKER under R81]
- Operator directive is "P3s must be fixed". Two paths:
  - (a) Add HMAC signing to the cursor (`public-listing.cursor.ts`): sign the `{created_at|id}` payload with a per-env secret, append `|<hmac>`, verify on decode, reject mismatched. Use `crypto.createHmac('sha256', process.env.PUBLIC_LISTING_CURSOR_SECRET || 'dev-only-fallback').update(payload).digest('base64url').slice(0,16)`. Reject tampered → degrade to page 1, never throw.
  - (b) Add a small spec asserting tamper-rejection: hand-craft a base64url payload with a `Date.parse`-able prefix and a `|<random-id>` and assert it is REJECTED.
- **Recommended:** path (a) + path (b). Cursor secret env var must be added to `.env.example` if one exists.

**A-P3-2 — Comment/implementation drift on sort key vocabulary** [BLOCKER under R81]
- Files: `public-listing.service.ts:20` and `public-listing.cursor.ts`
- Replace any `published_at` references in comments/JSDoc with `created_at` (the actual sort key)
- Add an inline comment explaining why `created_at` is used (nullable `published_at` would break keyset ordering)

**A-P3-3 — `compensationSummary` default arm unreachable** [BLOCKER under R81]
- File: `public-listing.service.ts:159-160`
- Current default arm is dead code (enum is exhaustive)
- DO NOT remove (auditor said: "removing it would make a future enum addition silently fall through")
- INSTEAD: add an inline `// eslint-disable-next-line @typescript-eslint/no-unused-vars` or a `/* istanbul ignore next */` + a comment explaining "future-proofing for enum growth; intentionally unreachable today"
- OR add a tiny test that exercises this via a type cast — e.g., a unit test that calls a small helper directly with an invalid type to confirm fallback string

### From Lens B (`TM-3-audit-B-1846b04.md`)

**B-P2-1 — Detail DTO no exact-key-set assertion** [BLOCKER]
- File: `src/talent-marketplace/__tests__/public-listing.service.spec.ts`
- Current: card has `Object.keys(card).sort()` exact-set lock at line ~114
- Fix: add equivalent `expect(Object.keys(res.listing).sort()).toEqual([...detailKeys].sort())` for the detail DTO around the existing detail test at lines 252-254
- The detail keys are: `id`, `slug`, `title`, `compensation_summary`, `compensation_type`, `compensation_terms`, `published_at`, `created_at`, `description`, `expectations`, `cta_listing_id` (verify against `PublicListingDetailDto`)

**B-P2-2 — No controller spec; HTTP status-code contract unverified** [BLOCKER]
- Same file as A-P2-1 above (`public-listing.controller.spec.ts`)
- Add HTTP-level assertions (use NestJS testing module + supertest if available, OR direct controller method invocation with mocked service):
  - `GET /talent-marketplace/public/listings` → 200 OK
  - `GET /talent-marketplace/public/listings/:id` with valid UUID but unpublished → 404 `{kind:'job_listing_not_found'}`
  - `GET /talent-marketplace/public/listings/:id` with non-UUID id → 400 (from `ParseUUIDPipe`)
  - Assert NO 401/403 ever (public surface)
- Grep `test/` for "supertest" — if not used in repo, follow the controller-test pattern of an existing public controller test (e.g., look for any `.controller.spec.ts` that asserts decorator metadata)

**B-P2-3 — JSON-LD PII assertion partially tautological** [BLOCKER]
- Resolved by A-P2-2 fix above (rogue-key injection test). Verify the new test covers this finding too — both lenses flagged the same code path.

**B-P3-1 — Cursor tamper-rejection: uncovered shape** [BLOCKER under R81]
- Resolved by A-P3-1 (HMAC signing) — once HMAC is in place, hand-crafted tuples are rejected outright. Add the explicit test case the auditor wanted: "syntactically-valid hand-crafted cursor is REJECTED" (post-HMAC) and add a doc comment to `public-listing.cursor.ts` explaining the threat model.

**B-P3-2 — Doc/comment drift between cursor key and exposed timestamp** [BLOCKER under R81]
- Same as A-P3-2 — fix once, satisfies both audits.

**B-P3-3 — `cta_listing_id` duplicates `id` byte-for-byte** [BLOCKER under R81]
- File: `public-listing.dto.ts:86-87` + `public-listing.service.ts:110`
- Auditor said it's a "deliberate contract field" used by TM-M2/TM-W2 consumers — DO NOT REMOVE
- Fix: add JSDoc to the DTO field explaining "intentionally duplicates `id` to give the CTA layer a stable, semantically-named handle; consumers MAY rely on this contract"
- This converts the P3 from "redundancy" to "documented contract"

---

## Hard rules — quote these in your final summary

**R0 — DECACORN QUALITY**: Apple/Notion/Google would not ship a public surface without controller-level auth-boundary tests. The fix is correct under R0.

**R52 — push every 2 min** (operator verbatim 2026-06-13): "Make sure code is pushed every 2 min/done in github live". After EVERY commit, immediately `git push origin feat/tm-3-public-browse` using `api_credentials=["github"]`.

**R64 — never lose anything**: If anything new is discovered (rule, idea, landmine), upload to `tgp-agent-context` IN THE SAME TURN, R74-clean.

**R65 — 50-failures sweep**: Run the diff against `quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md`. Specifically watch for swallowed errors (`.catch(()=>undefined)` is BANNED P0).

**R66 — full suite pre-push**: Before the FINAL push, run `NODE_OPTIONS=--max-old-space-size=4096 npm test -- --runInBand` (or the closest feasible variant). Targeted runs alone are not sufficient.

**R72 — exhaustive audits**: Already done; this fixer clears everything they found. Re-audit will re-sweep.

**R74 — operator identity** (operator verbatim): "every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + m yemail". EVERY commit:
```bash
git -c user.name='Bradley Gleave' \
    -c user.email='bradley@bradleytgpcoaching.com' \
    commit -m "TM-3: <subject>"
```
NO `Co-Authored-By`. NO `Generated-with-Claude`. NO AI attribution anywhere.

**R75 — push discipline NON-NEGOTIABLE**: After EVERY single commit, the IMMEDIATE next action MUST be `git push origin feat/tm-3-public-browse`. Do NOT chain commits. Do NOT "save the push for after tsc passes". If you write the commit, push it before moving to the next file. Operator monitors push frequency as the primary health signal — silence = stalled = cancelled.

**R77 — lane scope discipline**: This lane OWNS the 9 files already touched (run `git diff --name-only origin/main..HEAD` to see them). Modifying any file outside that list requires operator authorization. Document scope questions in a workspace note and stop. Self-authorized scope expansion is a regression risk.

**R79 — doctrine-pin sweep before PR**: Before declaring done, run:
```bash
npm test -- --testPathPatterns='(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names|roles-enforced)' --runInBand
```
If any doctrine pin trips, fix YOUR code (not the pin).

**R81 — auditor gate**: Your fixes will be re-audited by dual GPT-5.5 at the new head SHA. The bar is CLEAN_NO_FINDINGS on BOTH lenses. P3s are blockers under R81.

**BANNED TOKENS (P0 fail in src/ + __tests__/):** `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `Coming soon`. Allowed: `@ts-expect-error <reason>` with explanation, and narrow concrete type casts (`as { specific: shape }`).

---

## Workflow

1. `cd /home/user/workspace/tgp/backend-tm-3-fix`
2. `npm ci` if `node_modules` is missing (verify with `ls node_modules | head -3`)
3. Read each finding in BOTH audit reports verbatim; map each to one or more files
4. Implement fixes in **small, focused commits** — one finding per commit if reasonable, max 2 findings per commit
5. **After EACH commit**: `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m "TM-3: <what changed>"` THEN IMMEDIATELY `git push origin feat/tm-3-public-browse` (with `api_credentials=["github"]`)
6. After all findings addressed: run the doctrine-pin sweep (R79)
7. Then run the lane-targeted tests: `npm test -- --testPathPatterns='(public-listing|job-posting-jsonld)' --runInBand`
8. Then run the FULL suite (R66): `NODE_OPTIONS=--max-old-space-size=4096 npm test -- --runInBand` — must be green
9. Final push, then return with summary listing: which finding → which commit SHA → final pushed SHA → CI run URL

## Return contract

Your final summary MUST include:
1. **Final pushed head SHA** of `feat/tm-3-public-browse`
2. **Per-finding resolution table**: finding ID (A-P2-1 etc.) → commit SHA → file(s) → one-line description
3. **Confirmation each rule was honored**: R0 / R52 / R64 / R65 / R66 / R72 / R74 / R75 / R77 / R79 / R81 / banned tokens
4. **CI status** of the final SHA (must be all 4 checks green — wait for them if running)
5. **Push timeline**: every commit + push timestamp in chronological order
6. **Any scope questions or blockers** — STOP and write them to a `BLOCKERS.md` rather than self-authorize

If you discover any rule violation in pre-existing code in your lane, fix it (R77 §"Inside OWNS, anything goes").

**Model**: Opus 4.8 (`claude_opus_4_8`). Subagent type: `codebase`.
**Estimated effort**: 5-9 commits, ~150-250 LOC across mostly test files + small prod adjustments (HMAC, JSDoc). Push after each.
