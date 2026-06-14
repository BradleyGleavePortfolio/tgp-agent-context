# R78 — Pinned Telemetry Table Must Be Updated In Same Slice PR

**Status:** Active
**Codified:** 2026-06-14 (overnight, after L7 v3-2 build-and-test failure)
**Severity:** CI-gating

## The Rule

When a slice adds, removes, or renames any `community.*` (or other pinned-table)
PostHog telemetry event, the pinned event-name test that enumerates the table
exhaustively MUST be updated in the same slice PR. The new constant additions
and the test pin update ship together.

## Why This Rule Exists

The community telemetry pin lives at:

```
test/community/realtime/posthog-event-names.spec.ts
```

It uses `expect(COMMUNITY_TELEMETRY_EVENTS).toEqual({...})` plus a
`toHaveLength(N)` check. This is intentional — the pin is the firewall that
catches:

1. Silent renames that break analytics funnels downstream
2. Drift between §9 of a builder brief and the runtime constant
3. Accidental additions that bypass review (every new event must be visible
   in the diff against the pinned shape)

When a slice adds events without updating the pin, build-and-test fails with:

```
Expected length: <baseline>
Received length: <baseline + N new>
```

and a clear `+` diff of the new event names. The L7 v3-2 classroom slice hit
this on PR #396 (build-and-test): the slice added 3 events
(`classroomLessonPublished`, `classroomLessonScheduled`,
`classroomMediaUploadIssued`) to `COMMUNITY_TELEMETRY_EVENTS` but did not
update the pin from 6 → 9 events.

## What Builders Must Do

Before opening any community-slice PR that introduces telemetry events:

1. Add the events to `src/community/community-events.ts`
   (`COMMUNITY_TELEMETRY_EVENTS`).
2. Update `test/community/realtime/posthog-event-names.spec.ts`:
   - Add each new event to the `toEqual({...})` shape, preserving alphabetical
     OR slice-grouped ordering as documented in the test header.
   - Bump the `toHaveLength(N)` expectation.
   - Refresh the doc comment at the top of the file to reflect the new
     baseline + the slice that added events.
3. Run `npm test -- --testPathPattern=posthog-event-names` locally and confirm
   green BEFORE opening the PR.

## Adjacent Pinned Tables

The same convention applies to any other exhaustive-pin test in the repo.
Known examples (non-exhaustive):

- `test/community/realtime/posthog-event-names.spec.ts` — community telemetry
- `test/community/realtime/broadcast-event-names.spec.ts` (if present) —
  realtime broadcast events
- Channel-name pins, RLS policy pins, feature-flag pins

When in doubt: grep for `toHaveLength` on a constant import in `test/`
before opening a PR that touches the corresponding constant.

## Subagent Briefing

Every v3+ community-slice builder brief MUST include a §9.x line:

> "After adding new telemetry events to community-events.ts, update the
> §9 pinned event-name test (`posthog-event-names.spec.ts`) and run
> `npm test -- --testPathPattern=posthog-event-names` locally. Per R78,
> the pin update is part of the slice PR — not a follow-up."

This must also appear in `BUILDER_BRIEF_TEMPLATE_V2.md` under the gates
checklist.

## Related Rules

- **R0** — hectacorn quality bar (pins are quality infrastructure, not noise)
- **R52** — push every 2 min; rapid feedback when the pin trips
- **R77** — lane scope discipline; the pin update IS in scope when adding
  events
