# TM-3 FIXER BRIEF — Round 2 (Lens B FINDINGS)

**Target SHA (parent):** `1f9778da` on `feat/tm-3-public-browse` (PR #434)
**Audit verdict source:** dual GPT-5.5 re-audit @ `1f9778da`
- Lens A: **CLEAN_NO_FINDINGS** (0/0/0/0)
- Lens B: **FINDINGS_PRESENT** (0/0/**1 P2 + 2 P3**)

**Mission:** clear the 1 P2 + 2 P3 from Lens B to reach dual-CLEAN_NO_FINDINGS. Then both lenses re-audit.

---

## Binding rules

- **R0** — Decacorn / hyperscaler quality. Ask: "what would Apple, Notion, or Google ship?"
- **R74** — every commit MUST use `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com'`. No AI names anywhere.
- **R77** — preflight typecheck + tests before declaring done.
- **R79** — doctrine pins (FlagOff, roles-enforced, posthog-event-names, quietLuxuryDoctrine) MUST stay green.
- **R81** — zero P0-P3 findings before merge.
- **V2 resilience push cadence** — first push within 5 minutes of starting work, then every ~5 minutes or per logical chunk. Visible WIP beats black-box.

## Banned tokens (P0 fail in src/ + __tests__/)

`@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `Coming soon`. Allowed: `@ts-expect-error <reason>` + narrow concrete casts.

## Build commands

```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
NODE_OPTIONS=--max-old-space-size=4096 npm test -- --runInBand
# Doctrine sweep
npm test -- --testPathPatterns='(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names|roles-enforced)' --runInBand
```

Required CI checks: `build-and-test`, `rls-floor-guard`, `rls-live-tests`, `mwb-3-live-tests`. Fly Deploy ignored.

---

## Findings to clear (verbatim from Lens B re-audit)

### B-CYCLE-P2-1 — 404 envelope drops `kind` field (HTTP contract drift) — **MANDATORY**

**Verbatim:**
> The 404 service throws `NotFoundException({ kind: 'job_listing_not_found' })`, but the global `HttpExceptionFilter` reads only `message`/`error`/`code` — never `kind`. So the intended machine-readable identifier is silently dropped from the wire envelope, and the shape drifts from the house `{ error, message }` convention (cf. `checkout.service.ts`). No security leak (envelope is clean, 404 not 401/403), but a real contract/consistency defect with no HTTP-envelope pin test — the specs only assert the service-level body, not the normalized response.

**Required fix (pick option A or option B, document the choice in commit body):**

- **Option A (preferred — match house convention):** change `NotFoundException` to use the `{ error, message, code }` shape consumed by `HttpExceptionFilter`. Set `code: 'job_listing_not_found'` so the machine-readable id survives to the wire.
- **Option B (extend filter):** add `kind` pass-through to `HttpExceptionFilter` AND backfill it on the other house-convention sites for consistency. (Higher blast radius — not preferred.)

**Required pin test:** add an HTTP-envelope spec to `src/talent-marketplace/__tests__/public-listing.controller.spec.ts` (or a new `public-listing.controller.http.spec.ts`) that issues a real Nest request through the global `HttpExceptionFilter` and asserts:
- status === 404
- body === `{ error: 'Not Found', message: 'Job listing not found', code: 'job_listing_not_found' }` (or the chosen shape)
- no extra keys (negative assertion)

### B-CYCLE-P3-1 — Boot-time warning when `PUBLIC_LISTING_CURSOR_SECRET` unset in prod — **MANDATORY**

**Verbatim:**
> Cursor dev-secret fallback is correctly reasoned per the threat model but has no boot-time warning when unset in prod (parity nit with `MWB_AUTOSAVE_LOCK_TOKEN_SECRET`).

**Required fix:** in `public-listing.cursor.ts` (or the module's `OnModuleInit` if it has one), emit a single `console.warn` (or use the project's Nest `Logger`) at boot if `process.env.NODE_ENV === 'production'` and `process.env.PUBLIC_LISTING_CURSOR_SECRET` is unset:
```
[TM-3] PUBLIC_LISTING_CURSOR_SECRET is unset in production — falling back to dev cursor secret. Pagination integrity is preserved (filter applied independently) but rotate before public launch.
```
Follow `MWB_AUTOSAVE_LOCK_TOKEN_SECRET`'s pattern in `mwb-autosave/...` for tone and call site.

**Required test:** a spec that mocks `NODE_ENV='production'` + unset secret and asserts the warn was emitted exactly once.

### B-CYCLE-P3-2 — Pin test for `cta_listing_id === id` byte-for-byte — **MANDATORY**

**Verbatim:**
> `cta_listing_id === id` byte-for-byte guarantee is documented as a consumer-relied contract but not pinned by any test.

**Required fix:** add to the existing card key-set lock spec (`public-listing.service.spec.ts` or controller spec) an assertion: `expect(card.cta_listing_id).toBe(card.id)` AND the same for the detail shape. Single-line guarantee; failing the byte-for-byte check fails the build.

---

## Out of scope (do NOT touch)

- The Lens A "below-P3 observations" (cursor dev-secret threat model, `detail()` findFirst without `select`) — graded below the P3 bar by Lens A with explicit reasoning.
- The `kind` -> `code` rename is allowed ONLY in the new TM-3 NotFoundException site. Do NOT refactor other 404 sites in this PR.
- Any other lane (TM-5, TM-14). Touch only TM-3 files.

## Acceptance criteria (preflight before formal return)

- [ ] `npx tsc --noEmit` clean
- [ ] `npm test -- --runInBand` all suites pass
- [ ] Doctrine sweep green
- [ ] `grep -rn '@ts-ignore\|as any\|as unknown as\|as never\|\.catch(()=>undefined)\|Coming soon' src/ test/` — 0 hits across TM-3 lane files
- [ ] HTTP-envelope pin test asserts exact body shape (positive + negative key set)
- [ ] Prod-misconfig warn test asserts single emission
- [ ] `cta_listing_id === id` byte-for-byte test pinned on card + detail
- [ ] All commits R74-clean (`Bradley Gleave <bradley@bradleytgpcoaching.com>`)
- [ ] CI green on final pushed SHA
- [ ] Worktree clean before formal return

When done, print the final pushed SHA + confirm CI green + zero banned-token grep hits. Formally return.

## Push cadence (V2 resilience — non-negotiable)

1. First push within 5 minutes of starting (even WIP — partial spec OK).
2. Subsequent pushes every ~5 min or per logical chunk.
3. Final push after full suite green.

## Git auth

Use `api_credentials=["github"]` on every git command.
Remote: `https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git`

---

**Codified by Agent 47 — 2026-06-18 00:52 PDT (Wave 3 cycle 28, fixer-pass-2)**
