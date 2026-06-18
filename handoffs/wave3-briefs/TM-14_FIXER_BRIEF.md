# TM-14 FIXER BRIEF — clear Lens B P2/P3 findings to dual-CLEAN_NO_FINDINGS

**Lane:** TM-14 Stripe Connect `account.updated` webhook
**PR:** #436
**Branch:** `feat/tm-14-connect-account-updated-webhook`
**Worktree:** `/home/user/workspace/tgp/backend-tm-14-fix`
**Starting head SHA:** `d5a611d9ade4abaaab39d281925797a7ee6c73d7`
**Operator:** Bradley Gleave
**Role:** FIXER. Lens A returned CLEAN. Lens B returned FINDINGS_PRESENT (3 P2 + 3 P3). Resolve every Lens B item; do NOT regress Lens A.
**Audit reports:**
- `/home/user/workspace/audit-reports/TM-14-audit-A-d5a611d.md` (Lens A — **CLEAN_NO_FINDINGS** structurally; 1 informational P3 about TM-10 AbortController/Stripe scope — OUT OF LANE, do NOT fix)
- `/home/user/workspace/audit-reports/TM-14-audit-B-d5a611d.md` (Lens B — 0/0/3/3 to clear)

---

## R81 + operator directive — bar

Operator quote (binding):
> "we dont merge until we are clear of P0-P3's entirely"

Per **R81 §Severity inclusion**: P3s MUST be fixed before merge. Therefore every finding below is in scope.

Per **R77** (lane scope discipline): the Lens A informational P3 about `connect-adapter.service.ts:131-150` is PRE-EXISTING TM-10 code, OUT OF LANE, do NOT touch.

---

## Findings to resolve

### Lens B P2 — 3 items

**B-P2-1 — Malformed-body test does not isolate the controller's JSON guard** [BLOCKER]
- File: `test/talent-connect-webhook.spec.ts:311-329`
- Current test asserts 400 + service-not-reached for a signed non-JSON body, but its own comment concedes the global body parser may reject the bytes BEFORE the controller runs
- Fix: rewrite this test (or add a new one alongside) to TARGET the controller's post-signature `JSON.parse` guard (`talent-connect-webhook.controller.ts:66-70`) directly
- Two acceptable approaches:
  - (a) Feed a body the global parser passes through (use a valid `Buffer` representing bytes the parser accepts as-is) but that `JSON.parse` rejects — e.g. a Stripe-signed body that's an empty string, or contains a JSON.parse-breaking sequence after the parser's content-type sniff allows it through
  - (b) Add a direct controller-level unit test that constructs the controller, stubs the parser/middleware chain, and exercises the controller method directly with a non-JSON `rawBody` after signature verification passes
- Either approach must prove "controller verified signature THEN rejected the JSON" — not "a 400 happens somewhere"
- Risk: low. Existing test stays (it asserts a useful behavior); just add the missing coverage.

**B-P2-2 — Migration `payload jsonb` column absent vs. brief's stated contract** [OPERATOR DECISION NEEDED — STOP AND ASK]
- File: `prisma/migrations/20261220000030_marketplace_connect_event/migration.sql`
- The original brief listed `payload jsonb` as an expected column; the shipped table omits it (storing only derived `onboarding_completed` boolean + identifiers)
- Auditor said: "deliberate, defensible design choice... the chosen shape is arguably better for PII posture"
- **DO NOT** add the `payload jsonb` column without operator confirmation — PII implications
- **DO**: write to `BLOCKERS.md` the question: "Operator: TM-14 migration omits `payload jsonb` column from `marketplace_connect_event`. Lens B flagged this as contract-divergence-from-brief. The omission improves PII posture (no raw Stripe Account blob stored). Do you want me to (a) keep the omission and update the brief / add an ADR documenting the decision, or (b) add the column?"
- This finding is the ONE legitimate operator-decision blocker in this lane. Document it, leave the migration as-is, and proceed with the OTHER fixes — do not block your push timeline waiting on the operator. Treat option (a) as the working assumption and add an inline migration comment + an ADR file (`docs/decisions/<date>-tm-14-no-raw-payload-storage.md`) explaining the decision. If the operator overrides, that's one extra migration.

**B-P2-3 — No spec asserts `processed_at` default / row timestamp** [BLOCKER]
- File: `test/talent-connect-webhook.spec.ts`
- Add a one-line assertion to the existing "persists + processed once" test (around line 159-178) that the persisted row has a `processed_at` field of type Date and within the last few seconds
- Example: `expect(row.processed_at).toBeInstanceOf(Date); expect(Date.now() - row.processed_at.getTime()).toBeLessThan(5000);`
- This locks the audit-trail timestamp contract

### Lens B P3 — 3 items

**B-P3-1 — `missing_account_id` early-return branch uncovered** [BLOCKER under R81]
- File: `test/talent-connect-webhook.spec.ts`
- Add a spec exercising the path at `talent-connect-webhook.service.ts:57-63` (returns `processed=false, reason='missing_account_id'`)
- Test setup: feed a valid signature + valid JSON `account.updated` event whose `data.object` lacks a valid `acct_` id (e.g. `data.object.id = 'not_acct_xxx'` or `data.object.id` is undefined)
- Assert: HTTP 200, response body has `processed: false, reason: 'missing_account_id'`, no row inserted into `marketplace_connect_event`

**B-P3-2 — `incomplete caps → onboarding_completed=false` is good coverage [POSITIVE NOTE — NO ACTION]**
- Auditor flagged as a POSITIVE; no action required. Reference this in your return summary.

**B-P3-3 — Controller logs `this.logger.error` with static string on missing rawBody [NO ACTION]**
- Auditor said "no PII, fine. No action." — confirmed no-op.
- Under R81's strict reading: this is a P3 with "No action required" verdict — already clean. Note in return summary.

---

## Hard rules — quote these in your final summary

**R0 — DECACORN QUALITY**: A payments-adjacent webhook is highest-stakes. Apple/Notion/Google would not ship without controller-level JSON-guard coverage and explicit branch coverage on every early-return path. The fix is correct under R0.

**R52 — push every 2 min**: After EVERY commit, `git push origin feat/tm-14-connect-account-updated-webhook` using `api_credentials=["github"]`.

**R64 — never lose anything**: The ADR you write for the `payload jsonb` decision counts as a R64 upload — push to `tgp-agent-context` if it's a doctrine-level decision, or to the backend repo's `docs/decisions/` if it's lane-local. Either way, push.

**R65 — 50-failures sweep**: Webhook code is a hotspot for Failure #36 (Silent Failures). Verify the diff is clean on this category.

**R66 — full suite pre-push**: Mandatory before final push.

**R72 — exhaustive audit awareness**: Re-audit will re-sweep exhaustively.

**R74 — operator identity** (operator verbatim): "every single PR should say bradley@bradleytgpcoaching.com - no AI names - just bradley + m yemail". EVERY commit:
```bash
git -c user.name='Bradley Gleave' \
    -c user.email='bradley@bradleytgpcoaching.com' \
    commit -m "TM-14: <subject>"
```

**R75 — push discipline NON-NEGOTIABLE**: After EVERY single commit → immediate push. Silence = stalled = cancelled.

**R77 — lane scope discipline**: 7 owned files (run `git diff --name-only origin/main..HEAD`). The Lens A informational P3 about `connect-adapter.service.ts:131-150` is OUT OF LANE — DO NOT touch.

**R79 — doctrine-pin sweep**: Before final push:
```bash
npm test -- --testPathPatterns='(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names|roles-enforced)' --runInBand
```

**R81 — auditor gate**: Dual GPT-5.5 re-audit at new head SHA. Bar = CLEAN_NO_FINDINGS BOTH lenses. P3s block.

**BANNED TOKENS:** `@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `Coming soon`. The Lens-A audit confirmed your spec's TWO `@ts-expect-error` occurrences (lines 112 + 352) are narrowly justified for `FakePrisma`. Keep them; do not add new ones.

---

## Workflow

1. `cd /home/user/workspace/tgp/backend-tm-14-fix`
2. `npm ci` if node_modules missing
3. Implement B-P2-1 (controller JSON-guard isolation test) → commit → push
4. Write `BLOCKERS.md` for B-P2-2 (`payload jsonb` decision) + write `docs/decisions/2026-06-17-tm-14-no-raw-payload-storage.md` ADR → commit → push
5. Implement B-P2-3 (`processed_at` assertion) → commit → push
6. Implement B-P3-1 (`missing_account_id` spec) → commit → push
7. Run doctrine-pin sweep (R79) — fix anything that trips
8. Run lane-targeted tests: `npm test -- --testPathPatterns='talent-connect-webhook' --runInBand`
9. Run full suite (R66): `NODE_OPTIONS=--max-old-space-size=4096 npm test -- --runInBand`
10. Final push, then return.

## Return contract

Final summary MUST include:
1. **Final pushed head SHA** of `feat/tm-14-connect-account-updated-webhook`
2. **Per-finding resolution table**: finding ID (B-P2-1 etc.) → commit SHA → file → one-line description
3. **B-P2-2 status**: ADR file path + `BLOCKERS.md` content for operator review
4. **Rules-honored confirmation**: R0 / R52 / R64 / R65 / R66 / R72 / R74 / R75 / R77 / R79 / R81 / banned tokens
5. **CI status** of final SHA (all 4 required checks SUCCESS)
6. **Push timeline**: commit + push timestamp chronologically
7. **Lens A verification**: confirm no Lens A regression (run a quick mental pass against the Lens A checks: signature-before-side-effect, rawBody dep, DB idempotency, RLS service-role-only, no payload in logs, replay safety, adapter minimal/additive, migration date floor, schema additive)

**Model**: Opus 4.8 (`claude_opus_4_8`). Subagent type: `codebase`.
**Estimated effort**: 4-6 commits, ~80-150 LOC across mostly test files + 1 ADR markdown. Push after each.
