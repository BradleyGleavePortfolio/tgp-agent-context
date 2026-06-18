# TM-8 BUILDER BRIEF — Hirer Applicant Tracking (PII GATE)

## CRITICAL — PUSH-EARLY-WIP IS BINDING + PII GATE

Within your FIRST 5 minutes, you MUST commit + push to `origin/feat/tm-8-applicant-tracking`, open the PR, then push every ~5 min. Sandbox loss = unpushed work gone.

**THIS LANE CARRIES PII RISK.** Even on dual-CLEAN audit, **TM-8 will NOT auto-merge** — operator Bradley Gleave must sign off on PII handling before merge. PR body MUST contain `do-not-merge: pii-review`.

## ROLE & MODEL
You are the **Builder** for TM-8 under R64. Auditors run AFTER you push.

**Identity (R74 — mandatory):**
- `git -c user.name='bradley' -c user.email='bradley@bradleytgpcoaching.com' commit -m "..."`
- NO `Co-Authored-By`, NO "Generated with Claude", NO AI attribution anywhere
- Use `api_credentials=["github"]` for ALL git/gh commands

## WORKTREE
- **Branch:** `feat/tm-8-applicant-tracking` (NEW — create from main `918191ce`)
- **Worktree:** `/home/user/workspace/tgp/tm-8-tracking`
- Setup:
  ```bash
  mkdir -p /home/user/workspace/tgp
  cd /home/user/workspace/tgp
  git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git tm-8-tracking
  cd tm-8-tracking && git checkout main && git pull
  git checkout -b feat/tm-8-applicant-tracking
  ```

## FIRST PUSH (within 5 min)
1. Small visible change in your owned controller file (module-level doc comment).
2. Commit (R74 identity) + push.
3. Open PR:
   ```bash
   gh pr create --base main --head feat/tm-8-applicant-tracking \
     --title "TM-8: hirer applicant tracking (WIP, PII gate)" \
     --body $'WIP. PII operator-approval gate before merge.\nLane file ownership: applicant-tracking.*, candidate-card.dto, saved-search.*, pipeline-stage.*, + tests.\n\ndo-not-merge: pii-review'
   ```

## SCOPE & FILE OWNERSHIP (R71 — EXCLUSIVE)
You own:
1. `src/talent-marketplace/applicant-tracking.controller.ts` (NEW)
2. `src/talent-marketplace/applicant-tracking.service.ts` (NEW)
3. `src/talent-marketplace/applicant-tracking.dto.ts` (NEW — strict PII-allow-list)
4. `src/talent-marketplace/candidate-card.dto.ts` (NEW — PII-stripped projection)
5. `src/talent-marketplace/pipeline-stage.ts` (NEW — enum/state machine)
6. `src/talent-marketplace/saved-search.controller.ts` (NEW)
7. `src/talent-marketplace/saved-search.service.ts` (NEW)
8. `src/talent-marketplace/talent-marketplace.module.ts` (additive wiring ONLY)
9. NEW specs: `src/talent-marketplace/__tests__/applicant-tracking.*.spec.ts`, `saved-search.*.spec.ts`

**DO NOT touch** any other file. No schema changes. No migrations. No `common/`, no `auth/`.

## LOC CAP
**≤ 400 prod LOC** delta against `origin/main` (excluding spec files). If you approach the cap, the operator-preferred split is:
- **8a**: applicant-tracking (controller/service/dto + pipeline-stage + candidate-card) — merge first
- **8b**: saved-search + candidates-like-this + alerts — separate PR

For first dispatch, target 8a only and stub 8b as TODO comments referencing a follow-up issue.

## FUNCTIONAL SPEC

Per `plans/TM_REBUILD_CHAIN_V2.md` row TM-8:

> `ApplicantTracking`: shortlist, notes, pipeline stages (`new/screening/interview/offer/hired/passed`), saved searches, "candidates like this", new-applicant alerts. Per-listing scoped to the owning hirer.

**Endpoints (8a scope):**
- `GET /v1/talent-marketplace/listings/:id/applicants` — paginated (keyset cursor), hirer reads only own listing's applicants. Returns CandidateCard (PII-stripped projection).
- `GET /v1/talent-marketplace/applicants/:applicantId` — full detail (PII-redacted unless explicit unlock). Hirer scope enforced.
- `PATCH /v1/talent-marketplace/applicants/:applicantId/stage` — move through pipeline (`new` → `screening` → `interview` → `offer` → `hired` | `passed`). Body: `{ stage, note? }`.
- `POST /v1/talent-marketplace/applicants/:applicantId/notes` — append hirer-private note.
- `POST /v1/talent-marketplace/applicants/:applicantId/shortlist` — toggle shortlist flag.

**Guard:** Hirer-reads-only-own-listing-applicants. **REUSE `TeamSubCoachAssignment` predicate** for head-coach scope (per spec). Do NOT define new RLS — operate within the existing predicates from TM-1.

**Pipeline stages enum** in `pipeline-stage.ts`:
```ts
export const PIPELINE_STAGES = ['new','screening','interview','offer','hired','passed'] as const;
export type PipelineStage = typeof PIPELINE_STAGES[number];
```
With transition rules — e.g. `passed` is terminal; `hired` flows into TM-12 auto-flip (just mark stage; do NOT implement flip).

**Cursor:** Mirror `application-cursor.ts` (TM-5) pattern. base64 of `created_at|id`, tamper detection, cap 50.

## PII GUARDRAILS (extra-strict — auditor A will verify each)

1. **No raw email/phone/SSN/IP in logs.** Audit every `console.*` / logger call.
2. **CandidateCard projection** must NEVER include: applicant email, phone, full birthdate, address, IP, payment info. ONLY: first name, last initial, city/region (coarse), specialty/credentials, fit-score, application-status, application-created-at.
3. **Full applicant detail endpoint** must require explicit hirer-unlock action AND log access for audit. Even unlocked, redact: full DOB → year only, phone → last 4, email → domain only UNLESS the applicant has accepted contact.
4. **Hirer-private notes** never returned to applicant. RLS scope: write hirer-only, read hirer-only (no cross-hirer leakage on shared applicant).
5. **Error messages**: never echo applicant PII. Use opaque codes like `APPLICANT_NOT_FOUND` not `Applicant john@example.com not in your tracked list`.

## ERROR ENVELOPE CONTRACT (binding)
```ts
{ error: <HTTP-reason-phrase>, message: <human>, code: <discriminator> }
```
NOT `{ kind }`. Global `HttpExceptionFilter` drops legacy envelopes silently.

## BANNED TOKENS (P0 fail)
`@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `Coming soon`.

## TESTS YOU MUST ADD
- `applicant-tracking.controller.spec.ts` — hirer-scope guard (own listing 200, other hirer 403, applicant role 403).
- `applicant-tracking.service.spec.ts` — pipeline transitions valid + invalid (e.g. `hired → new` rejected), PII redaction in CandidateCard projection (no email/phone fields present), note append RLS isolation.
- `pipeline-stage.spec.ts` — terminal-state enforcement, transition matrix.
- `saved-search.spec.ts` — stub for 8b (skipped tests OK if 8b TODO).

## BUILD COMMANDS
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
NODE_OPTIONS=--max-old-space-size=4096 npm test -- --runInBand --testPathPatterns='applicant-tracking|pipeline-stage|saved-search|candidate-card'
NODE_OPTIONS=--max-old-space-size=4096 npm test -- --testPathPatterns='(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names|roles-enforced)' --runInBand
```

## CI EXPECTATIONS
4 checks must pass: `build-and-test`, `rls-floor-guard`, `rls-live-tests`, `mwb-3-live-tests`. Fly Deploy ignored.

If CI doesn't auto-trigger in 2 min:
```bash
gh workflow run ci.yml --repo BradleyGleavePortfolio/growth-project-backend --ref feat/tm-8-applicant-tracking
```

## DELIVERABLE
Report file `handoffs/wave4-builders/TM8_REPORT.md` with: final SHA, files added, LOC count, test results, CI status, list of PII guardrails enforced.

bradley@bradleytgpcoaching.com
