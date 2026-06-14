# R79 — Run All Repo Pin Tests Before Opening PR

**Status:** Active
**Codified:** 2026-06-14 (overnight, after L7 v3-2 mobile PR #248 CI failure)
**Severity:** CI-gating

## The Rule

Before opening any PR, the builder MUST run a focused sweep of the repo's
exhaustive-pin / doctrine tests against their slice. A targeted
`testPathPattern` for ONLY the slice's files (the pattern most subagents
default to) does NOT execute these pins, because the pins live in
repo-global doctrine test files.

## Why This Rule Exists

A "doctrine pin" is a test file that scans the entire repo (or a glob like
`src/**/*.{ts,tsx}`) and asserts an invariant. Examples:

- `src/__tests__/quietLuxuryDoctrine.test.ts` (mobile) — bans `fontWeight: '700'`
  / `'800'` in shipped screens; bans "Coming Soon" placeholder copy
- `test/community/realtime/posthog-event-names.spec.ts` (backend) — pins exact
  shape and length of `COMMUNITY_TELEMETRY_EVENTS` (see R78)
- `__tests__/communityChallengesFlagOff.test.ts` (mobile) — pins flag-gating
  shape of `CommunityNavigator.tsx` ternaries

When a builder runs only `testPathPattern='[Cc]lassroom|[Ll]esson'`, doctrine
pins on unrelated paths are skipped — but they DO run in CI and trip. The L7
v3-2 mobile slice tripped:

```
FAIL src/__tests__/quietLuxuryDoctrine.test.ts
  ● does not use fontWeight 700 or 800 in shipped screens or components
    + "screens/community/CommunityLessonDetailScreen.tsx"
```

because `CommunityLessonDetailScreen.tsx` used `fontWeight: '700'` for the
lesson title — fine for the slice's own tests but a violation of repo doctrine.

## What Builders Must Do

Before opening any PR:

### 1. Run the doctrine-pin sweep (mobile)

```bash
npm test -- --testPathPattern='(quietLuxuryDoctrine|FlagOff|doctrine|pin)' --runInBand
```

If any doctrine pin trips, fix YOUR code (not the pin). The pin is the
source of truth.

### 2. Run the doctrine-pin sweep (backend)

```bash
npm test -- --testPathPattern='(posthog-event-names|broadcast-event-names|rls.*pin|doctrine)' --runInBand
```

### 3. Targeted slice tests AFTER doctrine sweep

```bash
npm test -- --testPathPattern='<slice-name>' --runInBand
```

The slice tests are NOT a substitute for the doctrine sweep.

### 4. Full-suite local run (preferred when sandbox allows)

If memory + time allow, run the full suite once before opening PR:

```bash
NODE_OPTIONS=--max-old-space-size=8192 npm test -- --runInBand
```

This is the only way to be sure CI will be green. If full-suite is not
feasible (sandbox memory), the targeted doctrine sweep above is the minimum.

## Known Doctrine Pins (non-exhaustive)

### Mobile (`growth-project-mobile`)

- `src/__tests__/quietLuxuryDoctrine.test.ts`
  - `fontWeight: '700'` / `'800'` banned in shipped screens
  - `"Coming Soon"` / `"In Development"` / `"Planned"` banned
- `__tests__/communityChallengesFlagOff.test.ts` — flag-gating navigator shape
- `__tests__/communityClassroomFlagOff.test.ts` — flag-gating navigator shape (added v3-2)

### Backend (`growth-project-backend`)

- `test/community/realtime/posthog-event-names.spec.ts` — `COMMUNITY_TELEMETRY_EVENTS`
  exhaustive pin (see R78)
- RLS floor guard — separate CI job, runs against migration set

## Subagent Briefing

Every builder brief MUST include in its gates checklist:

> "Run the doctrine-pin sweep BEFORE opening the PR (R79):
> ```
> npm test -- --testPathPattern='(quietLuxuryDoctrine|FlagOff|doctrine|pin|posthog-event-names)' --runInBand
> ```
> Then run the slice-targeted tests. Slice-targeted tests do NOT cover doctrine pins."

Builder brief template must include this in Gate 2.

## Related Rules

- **R0** — hectacorn quality bar (pins are quality infrastructure)
- **R52** — push every 2 min (rapid feedback when doctrine trips)
- **R77** — lane scope discipline (the fix is in YOUR file, not the pin)
- **R78** — pinned telemetry tables update in same slice PR
