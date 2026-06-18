# TM-5 — Fixer Brief R1 (first fixer pass after dual audit)

- **PR:** #435 — feat: TM-5 apply funnel + pre-coach account + applicant profile
- **Parent SHA:** `c7298ae101906e431cde248f5e1e7560b4b645a1`
- **Branch:** `feat/tm-5-apply-precoach`
- **Repo:** `https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git`
- **Context repo:** `https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/tgp-agent-context.git`
- **Audit input:**
  - Lens A (exhaustive): `handoffs/audit-reports/TM-5-audit-A-c7298ae1.md` — FINDINGS_PRESENT (P0/P1/P2/P3 = 0/0/2/3)
  - Lens B (cycle): `handoffs/audit-reports/TM-5-audit-B-c7298ae1.md` — CLEAN (Lens B observation list overlaps Lens A P2-2 + P3-1)
- **Auditors used:** dual GPT-5.5 per R72
- **Model:** Opus 4.8 (`claude_opus_4_8`)
- **Subagent type:** `codebase`

---

## R74 — Identity (binding)

All commits and pushes MUST use exactly:

```
Author:    Bradley Gleave <bradley@bradleytgpcoaching.com>
Committer: Bradley Gleave <bradley@bradleytgpcoaching.com>
```

No "AI", "Claude", "Computer", "Agent", co-author trailers, or AI-generated/-assisted footers anywhere in the commit message or trailers. Grep your commits for: `grep -iE 'AI|Claude|Computer|Co-Authored|Agent'` — must be empty.

---

## Findings to fix

### P2-1 — HTTP envelope drops `kind`; clients cannot read machine-readable error codes

**Files:**
- `src/talent-marketplace/apply.service.ts` — 6 throw sites:
  - L65  `throw new NotFoundException({ kind: 'job_listing_not_found' })`
  - L90  `throw new ConflictException({ kind: 'apply_in_flight' })`  ← retryable signal
  - L127 `throw new NotFoundException({ kind: 'applicant_not_found' })`
  - L141 `throw new NotFoundException({ kind: 'applicant_not_found' })`
  - L317 `throw new ConflictException({ kind: 'apply_conflict' })`
  - L328 `throw new ConflictException({ kind: 'apply_replay_corrupt' })`
- `src/filters/http-exception.filter.ts` L43–48 — reads only `message`/`error`/`code` off the exception body; never reads `kind`.

**Required fix:**

Replace `{ kind: X }` with the global filter contract `{ error: <human-readable>, message: <human-readable>, code: X }` at all 6 sites. This matches the convention already used elsewhere (e.g. `invite_code_invalid_format`) and is the contract the global `HttpExceptionFilter` already serializes.

Suggested mapping (preserve current kind value as the new `code`):

| Line | New body |
|------|----------|
| L65  | `{ error: 'Job listing not found', message: 'Job listing not found', code: 'job_listing_not_found' }` |
| L90  | `{ error: 'Apply already in flight', message: 'A submission for this application is already in progress; retry shortly.', code: 'apply_in_flight' }` |
| L127 | `{ error: 'Applicant profile not found', message: 'Applicant profile not found', code: 'applicant_not_found' }` |
| L141 | `{ error: 'Applicant profile not found', message: 'Applicant profile not found', code: 'applicant_not_found' }` |
| L317 | `{ error: 'Apply conflict', message: 'Apply conflict', code: 'apply_conflict' }` |
| L328 | `{ error: 'Apply replay corrupt', message: 'Apply replay corrupt', code: 'apply_replay_corrupt' }` |

**Pin tests:** Add one HTTP-envelope assertion (E2E via `supertest` or a filter-level unit) pinning that `code` survives serialization for at least `apply_in_flight` (the retryable case). Verify it matches exactly the same envelope pattern landed by TM-3 R2 fixer (commits `d488c60b` + `d2b3dd2f` on `feat/tm-3-public-browse`) so both lanes converge on one contract.

---

### P2-2 — Missing `(applicant_user_id, listing_id)` uniqueness on `Application`

**Files:**
- `prisma/schema.prisma` `model Application` (around L6582–6602; currently only `idempotency_key String? @unique`)
- `src/talent-marketplace/apply.service.ts` `runApply` L249 and catch around L106–119

**Required fix:**

1. Add `@@unique([applicant_user_id, listing_id])` to `model Application` in `prisma/schema.prisma`.
2. Create a new Prisma migration with a date strictly greater than `20261220000020`. Recommended: `prisma/migrations/20261220000031_application_applicant_listing_unique/migration.sql`. Migration body must add the composite unique index (`CREATE UNIQUE INDEX IF NOT EXISTS ...` or `ALTER TABLE ... ADD CONSTRAINT ...`) and be idempotent.
3. Broaden the P2002 catch in `apply.service.ts` (around L109–115) to also recognize the new composite constraint failure. On composite-unique P2002: route into the existing `recoverConfirmation` idempotent path so distinct-key duplicate submissions for the same (account, listing) replay the original confirmation instead of creating a duplicate.
4. Pin behavior in `apply.service.spec.ts`: add a test where two distinct `idempotency_key` values arrive for the same (account, listing) and assert: exactly **one** `Application` row created, second call returns the recovered confirmation (same `application_id`), no error visible to the client.

**Migration safety:** the index will fail if duplicate rows already exist in any environment. Production has not yet shipped this PR, so the index can be added safely. Migration must be wrapped to skip cleanly if the constraint already exists.

---

### P3-3 — Inconsistent string-field trimming in `updateOwnProfile` / `runApply`

**Files:** `src/talent-marketplace/apply.service.ts` L143–157 (`updateOwnProfile`) and L229–230 (`runApply`).

**Required fix:**

Trim all free-text string fields consistently: `headline`, `bio`, and array entries in `specialties`, `certifications` (per-entry trim), and `sample_program_url`. Names already trimmed; bring others to parity. Update `apply.service.spec.ts` "only provided fields are written, trimmed" test (L156 region) to also assert trim on headline / bio / one specialty entry.

---

### Lens A P3-1, P3-2 — NO CODE CHANGE

- **P3-1 (unsigned cursor):** owner-scoped, no IDOR. The file header comment already flags this for hoist-once-TM-3-lands. Do **not** change in this fixer pass — track to a follow-up PR after TM-3 merges (TM-3 ships the signed-cursor helper). Lens B also recorded this as a non-blocking observation.
- **P3-2 (anonymous email-account minting):** explicit operator-sign-off concern, not a code defect. Anti-bot is the agreed control. The operator PII sign-off (binding gate on this PR) is the right place to record acknowledgement. Do **not** change code.

Note both decisions in your formal return so the auditors and operator can confirm.

---

## Build + test gates (MUST pass before formal return)

Run all of these from the worktree root:

```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
NODE_OPTIONS=--max-old-space-size=4096 npm test -- --runInBand
NODE_OPTIONS=--max-old-space-size=4096 npm test -- --testPathPatterns='(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names|roles-enforced)' --runInBand
```

Banned-token grep MUST be empty over your diff:

```bash
git diff --name-only origin/main...HEAD | grep -E '^(src|test)/' | xargs -r grep -nE '@ts-ignore|as any|as unknown as|as never|\.catch\(\(\)=>undefined\)|Coming soon' || echo CLEAN
```

Required CI checks (must be green on the head SHA before formal return):
- `build-and-test`
- `rls-floor-guard`
- `rls-live-tests`
- `mwb-3-live-tests`

(Fly Deploy ignored per R64.)

---

## Worktree + push protocol

1. Clone the backend mirror fresh into `/tmp/tm5-fix` (do not reuse stale worktrees).
2. Check out `feat/tm-5-apply-precoach` at `c7298ae1`.
3. Make commits as needed. Each commit message must be ≤72 chars on subject, body wrapped at 72 cols, and free of all banned-identity tokens (see R74 above).
4. Push to remote BEFORE attempting to formally return:
   ```bash
   git push origin feat/tm-5-apply-precoach
   ```
5. Verify final remote SHA with `git rev-parse origin/feat/tm-5-apply-precoach` and include that exact SHA in your formal-return summary.
6. Do NOT rebase onto current `main` (`96d7f464`) yet — the operator's loop handles rebase as a separate step after the lane is dual-CLEAN.

---

## Formal return contract

In your final summary, return ALL of the following so the operator can dispatch dual GPT-5.5 re-auditors immediately:

- Final remote SHA on `feat/tm-5-apply-precoach`
- List of commits added with their subject lines
- Local `tsc --noEmit` result
- Local `npm test -- --runInBand` result (full suite + the doctrine sweep)
- Banned-token grep result over your diff
- A line each on:
  - P2-1: how the envelope contract was changed and which spec pins it
  - P2-2: schema, migration filename + date, P2002 catch broadening, spec pin
  - P3-3: which fields are now trimmed and which spec pins it
  - P3-1 + P3-2: explicit "no code change, tracked per brief" acknowledgement
- Any deviations from this brief, with rationale
- Confirmation that all commits pass `grep -iE 'AI|Claude|Computer|Co-Authored|Agent'` empty

---

## Out of scope (do NOT touch)

- `talent-marketplace.module.ts` reconciliation with TM-3 / TM-14 (handled by operator at rebase step after lane is dual-CLEAN)
- Anything outside `src/talent-marketplace/**`, `prisma/schema.prisma`, `prisma/migrations/20261220000031_*`, `test/**` matching TM-5
- Doctrine-pin files (already passing — verified by Lens A item #11)
- PostHog wiring (TM-5 has none by design)
