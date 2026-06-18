# TM-9 BUILDER BRIEF — Job-Hunter Tooling

## CRITICAL — PUSH-EARLY-WIP IS BINDING

Within your FIRST 5 minutes, commit + push to `origin/feat/tm-9-job-hunter-tooling`, open the PR, then push every ~5 min. Sandbox loss = unpushed work gone.

## ROLE & MODEL
You are the **Builder** for TM-9 under R64. Auditors run AFTER you push.

**Identity (R74 — mandatory):**
- `git -c user.name='bradley' -c user.email='bradley@bradleytgpcoaching.com' commit -m "..."`
- NO `Co-Authored-By`, NO "Generated with Claude", NO AI attribution anywhere
- Use `api_credentials=["github"]` for ALL git/gh commands

## WORKTREE
- **Branch:** `feat/tm-9-job-hunter-tooling` (NEW — create from main `918191ce`)
- **Worktree:** `/home/user/workspace/tgp/tm-9-jobhunter`
- Setup:
  ```bash
  mkdir -p /home/user/workspace/tgp
  cd /home/user/workspace/tgp
  git clone https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git tm-9-jobhunter
  cd tm-9-jobhunter && git checkout main && git pull
  git checkout -b feat/tm-9-job-hunter-tooling
  ```

## FIRST PUSH (within 5 min)
1. Small visible change in your owned controller file (module-level doc comment).
2. Commit (R74) + push.
3. Open PR:
   ```bash
   gh pr create --base main --head feat/tm-9-job-hunter-tooling \
     --title "TM-9: job-hunter tooling (WIP)" \
     --body 'WIP. Applicant portfolio/showcase, app-status tracking, specialty-matched alerts. Off main 918191ce. Wave 4 lane.'
   ```

## SCOPE & FILE OWNERSHIP (R71 — EXCLUSIVE)
You own:
1. `src/talent-marketplace/job-hunter.controller.ts` (NEW)
2. `src/talent-marketplace/job-hunter.service.ts` (NEW)
3. `src/talent-marketplace/job-hunter.dto.ts` (NEW)
4. `src/talent-marketplace/portfolio-showcase.ts` (NEW — portfolio model + validators)
5. `src/talent-marketplace/application-status.ts` (NEW — status enum + transitions, reuses semantics from existing Application state machine)
6. `src/talent-marketplace/specialty-alerts.service.ts` (NEW)
7. `src/talent-marketplace/talent-marketplace.module.ts` (additive wiring ONLY)
8. NEW specs: `src/talent-marketplace/__tests__/job-hunter.*.spec.ts`, `portfolio-showcase.spec.ts`, `application-status.spec.ts`, `specialty-alerts.spec.ts`

**DO NOT touch** any other file. No schema changes. No migrations. No `common/`, no `auth/`.

## LOC CAP
**≤ 340 prod LOC** delta against `origin/main` (excluding spec files).

## FUNCTIONAL SPEC

Per `plans/TM_REBUILD_CHAIN_V2.md` row TM-9:

> Applicant portfolio/showcase (sample programs, intro video, results), application-status tracking, specialty-matched alerts, tasteful profile-strength nudges.

**Endpoints:**
- `GET /v1/talent-marketplace/me/applications` — applicant reads own applications + statuses (paginated, keyset cursor).
- `GET /v1/talent-marketplace/me/portfolio` — read own portfolio showcase.
- `PUT /v1/talent-marketplace/me/portfolio` — update own portfolio (sample programs JSON refs, intro video URL, headline results — bounded fields).
- `GET /v1/talent-marketplace/me/alerts` — list specialty-matched listing alerts (recent listings matching applicant's saved specialty/location preferences).
- `POST /v1/talent-marketplace/me/alerts/preferences` — set alert preferences.
- `GET /v1/talent-marketplace/me/profile-strength` — return `{ score: 0-100, nudges: [{kind, message}] }` — tasteful nudges only, no dark patterns.

**Guard:** Applicant-reads/writes-own only. JWT/session subject must equal owner.

**Application-status enum** in `application-status.ts`:
```ts
export const APPLICATION_STATUSES = ['submitted','under-review','interview','offer','hired','passed','withdrawn'] as const;
```
Reuse same labels as the old state machine (operator notes in spec: "reuses `Application` status enum semantics from old state machine").

**Cursor:** Mirror `application-cursor.ts` (TM-5) pattern.

## PII DISCIPLINE
- `/me/*` endpoints return applicant's OWN data — full PII OK to applicant themselves.
- Portfolio sample-program content: validate URLs are HTTPS, cap field sizes, reject inline base64 blobs (DoS guard).
- Intro video URL: allow-list scheme (`https://`) and length cap (1024 chars).
- Profile-strength `nudges`: must be tasteful (CALM, not anxiety-inducing). Whitelist of allowed nudge messages — no free-form text that could leak server state.

## ERROR ENVELOPE CONTRACT (binding)
```ts
{ error: <HTTP-reason-phrase>, message: <human>, code: <discriminator> }
```
NOT `{ kind }`.

## BANNED TOKENS (P0 fail)
`@ts-ignore`, `as any`, `as unknown as`, `as never`, `.catch(()=>undefined)`, `Coming soon`.

## TESTS YOU MUST ADD
- `job-hunter.controller.spec.ts` — owner-only guard, cross-applicant read 403.
- `job-hunter.service.spec.ts` — pagination cursor invariants, portfolio update validation, profile-strength score deterministic.
- `portfolio-showcase.spec.ts` — URL allow-list, size caps, base64 rejection.
- `application-status.spec.ts` — terminal states (hired/passed/withdrawn), transition matrix.
- `specialty-alerts.spec.ts` — preference match deterministic, no PII in alert payload.

## BUILD COMMANDS
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
NODE_OPTIONS=--max-old-space-size=4096 npm test -- --runInBand --testPathPatterns='job-hunter|portfolio-showcase|application-status|specialty-alerts'
NODE_OPTIONS=--max-old-space-size=4096 npm test -- --testPathPatterns='(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names|roles-enforced)' --runInBand
```

## CI EXPECTATIONS
4 checks: `build-and-test`, `rls-floor-guard`, `rls-live-tests`, `mwb-3-live-tests`.

Manual trigger if needed:
```bash
gh workflow run ci.yml --repo BradleyGleavePortfolio/growth-project-backend --ref feat/tm-9-job-hunter-tooling
```

## DELIVERABLE
Report `handoffs/wave4-builders/TM9_REPORT.md` with final SHA, files, LOC, tests, CI status.

bradley@bradleytgpcoaching.com
