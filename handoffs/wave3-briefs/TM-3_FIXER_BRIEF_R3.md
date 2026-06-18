# TM-3 R3 FIXER BRIEF — clear NEW-B-CYCLE-P3-1 (stale `{kind:...}` fixture/comment)

**SHA**: `06649f9798d5af714030585aac6cd60858b9f5a2`
**Branch**: `feat/tm-3-public-browse`
**PR**: #434
**Model**: claude_opus_4_8
**Subagent type**: codebase
**R74 identity**: `bradley <bradley@bradleytgpcoaching.com>` — no AI names, no Co-Authored-By.

## Why this exists
TM-3 dual re-audit at `06649f97`: Lens A CLEAN; Lens B raised **1 P3** (NEW-B-CYCLE-P3-1). R81 §Severity is binding: P3 MUST be fixed before merge. No carve-out. This is a 3-line cosmetic cleanup.

## The defect
The R2 envelope migration updated `service.ts` to throw `{error,message,code}` and added a real-app HTTP wire pin. But `src/talent-marketplace/public-listing.controller.spec.ts` still has the OLD `{kind:...}` fixture + a doc-comment that contradicts the shipped contract. The test passes functionally (it only asserts error-identity propagation + 404 status, never inspects the body), but the stale fixture/comment is documentation drift that re-opens the very confusion B-CYCLE-P2-1 closed.

## Exact required edits

**File**: `src/talent-marketplace/public-listing.controller.spec.ts`

### Edit 1 — doc comment (around L27–L29)
Old:
```ts
//   4. DELEGATION + STATUS — handlers forward to the service unchanged; an
//      unpublished/unknown id surfaces the service's NotFoundException (404,
//      {kind:'job_listing_not_found'}) — never a 401/403, which would leak the
//      existence of the gate to an anon caller.
```
New:
```ts
//   4. DELEGATION + STATUS — handlers forward to the service unchanged; an
//      unpublished/unknown id surfaces the service's NotFoundException (404,
//      {error:'Not Found',message:'Job listing not found',code:'job_listing_not_found'})
//      — never a 401/403, which would leak the existence of the gate to an anon caller.
```

### Edit 2 — test fixture + comment (around L139–L145)
Old:
```ts
    it('propagates the service 404 (unpublished/unknown id) as-is — never 401/403', async () => {
      // The service throws NotFoundException({kind:'job_listing_not_found'}) for a
      // draft/closed/missing id. The controller adds no auth layer, so an anon
      // caller sees a 404 (resource hidden), never a 401/403 (gate revealed).
      const notFound = Object.assign(new Error('nf'), {
        getStatus: () => 404,
        getResponse: () => ({ kind: 'job_listing_not_found' }),
      });
```
New:
```ts
    it('propagates the service 404 (unpublished/unknown id) as-is — never 401/403', async () => {
      // The service throws NotFoundException({error,message,code:'job_listing_not_found'})
      // for a draft/closed/missing id. The controller adds no auth layer, so an anon
      // caller sees a 404 (resource hidden), never a 401/403 (gate revealed).
      // Wire-shape pin lives in __tests__/public-listing.controller.http.spec.ts.
      const notFound = Object.assign(new Error('nf'), {
        getStatus: () => 404,
        getResponse: () => ({
          error: 'Not Found',
          message: 'Job listing not found',
          code: 'job_listing_not_found',
        }),
      });
```

## Constraints
- **NO other changes** to any file. Cosmetic-only cleanup. Do not touch service, cursor, http.spec, jsonld, dto, controller.
- **No banned tokens** introduced: `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `Coming soon`.
- **Local gates must pass** before push:
  - `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit`
  - `NODE_OPTIONS=--max-old-space-size=4096 npm test -- --runInBand --testPathPatterns='public-listing.controller'`
  - Doctrine sweep: `npm test -- --testPathPatterns='(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names|roles-enforced)' --runInBand`
- Commit message: `TM-3: clean up stale {kind} fixture/comment in controller spec (NEW-B-CYCLE-P3-1)`
- Body brief: cite the audit finding ID and that the wire contract lives in `__tests__/public-listing.controller.http.spec.ts`.
- Push to `feat/tm-3-public-browse`. Force-push NOT required (additive).
- Identity grep verification before push:
  ```
  git log --pretty='%an <%ae> | %s%n%b' origin/feat/tm-3-public-browse..HEAD | grep -iwE 'AI|Claude|Computer|Co-Authored|Agent' && echo FAIL || echo IDENTITY_OK
  ```
  Use `-w` (word boundary) to avoid false-positives on substrings.

## After push
- If CI doesn't auto-trigger within 2 min, fire manual workflow_dispatch:
  ```
  gh workflow run ci.yml --repo BradleyGleavePortfolio/growth-project-backend --ref feat/tm-3-public-browse
  ```
- Wait for all 4 required CI checks green: `build-and-test`, `rls-floor-guard`, `rls-live-tests`, `mwb-3-live-tests`.
- Then 5-min SHA stability.
- Then dispatch dual GPT-5.5 re-auditors (R72).
- On dual-CLEAN: auto-merge per operator authorization (R74-clean squash, `gh pr merge 434 --squash --delete-branch`).

## Out of scope
- DO NOT modify the wire HTTP pin (`__tests__/public-listing.controller.http.spec.ts`) — it is correct.
- DO NOT touch `service.ts`, `cursor.ts`, `service.spec.ts`, `cursor.spec.ts`, jsonld, dto, or controller.ts.
- DO NOT rebase or change any other branch.

## Return contract
Subagent must return:
- Final SHA pushed.
- Confirmation of local gates green (tsc, jest pattern, doctrine sweep).
- Identity grep output (`IDENTITY_OK`).
- Push log.
