# Merge readiness dossier — 2026-06-14 03:02 PDT

**Status:** Five PRs OPEN, all CI green, awaiting Bradley merge.
**Updated:** 2026-06-14 03:02 PDT (after L7 v3-2 landed both PRs green)
**Supersedes:** `MERGE_READINESS_2026-06-14.md`

## TL;DR

| Order | PR | Lane | Repo | HEAD | Title | CI |
|-------|----|------|------|------|-------|-----|
| 1 | [#307](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/307) | L1 | backend | merged | zod 4 bump | ✅ MERGED 07:49 UTC |
| 2 | [#394](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/394) | L6 | backend | merged | drip-fire-at extraction | ✅ MERGED 07:48 UTC |
| 3 | [#200](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/200) | L2 | mobile | f523b50 | async-storage 2→3 | ✅ all green |
| 4 | [#395](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/395) | L4 | backend | db58be5d | Roman P4 backend | ✅ all green |
| 5 | [#242](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/242) | L5 | mobile | ed6d226 | Roman P4 ED.3+ED.4 | ✅ all green |
| 6 | [#396](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/396) | L7 | backend | 2c749efc | community v3-2 classroom backend | ✅ all green |
| 7 | [#248](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/248) | L7 | mobile | d32b225 | community v3-2 classroom mobile | ✅ all green |

## Recommended merge order

The agent groups by dependency, not strict chronology. Merges 1–2 already
happened. Of the five OPEN PRs:

### Group A — independent dependency bumps (merge any order)

- **Mobile #200** — `@react-native-async-storage/async-storage` 2.2.0 → 3.1.1.
  Resolved via file-local `jest.mock` overrides (imessageDmRoutes path swap,
  haptics jest.fn() shims, secureStorage stateful Map-backed shims). 19/19
  tests passed locally.

### Group B — Roman P4 (merge backend FIRST, then mobile)

- **Backend #395** — `CoachFirstPaymentNotification` (gated FIRST_PAYMENT emit
  on Stripe webhook). Must land first so the mobile listener has a payload to
  receive.
- **Mobile #242** — ED.3 First Payment Wow + ED.4 Progress Chart animations.
  Includes the RNTL v14 timing fixes (`await act()` pattern) applied across
  three test files after L5's over-extension into RNTL migration (case study
  for R77).

### Group C — Community v3-2 classroom posts (merge backend FIRST, then mobile)

- **Backend #396** — coach lessons, media tiles with signed URL handoff,
  release lock, cohort-scoped RLS, pinned ordering. 1819 LOC slice + 773 LOC
  of tests (68 specs). Backend pin (`posthog-event-names.spec.ts`) updated
  6 → 9 events (R78 codified after CI tripped on the original 6-pin).
- **Mobile #248** — student surface (list + detail), flag-gated entry point
  (`EXPO_PUBLIC_FF_COMMUNITY_CLASSROOM_POSTS` default OFF), 835 LOC tests (31
  specs). Defense-in-depth flag guard on the screen even when route would not
  register. Quiet-luxury doctrine fix applied (`d32b225`) — `fontWeight: '700'`
  → `'600'` on lesson title to clear `quietLuxuryDoctrine.test.ts` (R79
  codified after the pin tripped).

**Flag default-off on both sides** — merging both PRs ships no user-visible
behavior change until Bradley flips `FEATURE_COMMUNITY_CLASSROOM_POSTS`
(backend) and `EXPO_PUBLIC_FF_COMMUNITY_CLASSROOM_POSTS` (mobile) on.

## Pinned-table protocol

Two rules codified during L7 execution:

- **R78** — pinned telemetry tables (e.g. `posthog-event-names.spec.ts` /
  `COMMUNITY_TELEMETRY_EVENTS`) must update in the same slice PR when the
  slice adds events.
- **R79** — builders must run the repo-wide doctrine-pin sweep BEFORE opening
  PRs, not just slice-targeted tests. `testPathPattern='[Cc]lassroom'` does
  NOT exercise repo-global doctrine tests (quiet-luxury, flag-off, telemetry).

Both backported into `V3_3_BUILDER_BRIEF.md`, `V3_4_BUILDER_BRIEF.md`, and
`BUILDER_BRIEF_TEMPLATE_V2.md`.

## Authorship verification

All 25+ commits across these 5 PRs authored as `Bradley Gleave
<bradley@bradleytgpcoaching.com>` via inline `-c` flags. Zero AI attribution,
zero co-author trailers. Per R74.

Spot-check:

```
gh api /repos/BradleyGleavePortfolio/growth-project-backend/pulls/396/commits \
  | jq -r '.[] | "\(.sha[:8]) \(.commit.author.name) <\(.commit.author.email)>"'
```

Should return only `Bradley Gleave <bradley@bradleytgpcoaching.com>` on every
line.

## Next-wave plan (after L7 merges)

- **L8 v3-3 voice notes** — dispatch IMMEDIATELY after Bradley merges both
  L7 PRs (community.module.ts collision protocol requires v3-2 on main first).
- **L9 v3-4 search + wearable** — dispatch after L8 PRs merge.

Both lanes will use the updated v3-3/v3-4 briefs that carry R78+R79.

## Agent posture while waiting

The agent is in a probe loop (15-min cycles via `pause_and_wait`) checking
for Bradley's merges. No further work is being dispatched until L7 lands,
to honor R52 (avoid losing work) and the community.module.ts collision
protocol.
