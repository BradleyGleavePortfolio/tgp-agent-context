# L11 — Roman ED.2: 3-arc check-in / brief / review router widget

**Lane:** mobile-only (single backend `GET` endpoint if needed; see §Backend)
**Base mains:** backend `1fb04fbf`, mobile `18764542`
**Branch (both repos):** `feature/roman-ed2-three-arc-router`
**Flags (default OFF):**
- mobile: `EXPO_PUBLIC_FF_ROMAN_THREE_ARC_ROUTER`
- backend: `FEATURE_ROMAN_THREE_ARC_COUNTS` (only if backend endpoint shipped)

---

## What this is

A small Roman-voiced widget on the **Coach Home** surface that shows three completion arcs side-by-side — one per coaching pillar — with deep-link routing on tap.

| Arc | Domain signal | Numerator | Denominator | Tap deep-link |
|---|---|---|---|---|
| **Check-ins** | Today's client check-ins reviewed by this coach | `count(CheckIn.coachReviewedAt IS NOT NULL AND date_trunc('day', coachReviewedAt) = today)` | `count(CheckIn.submittedAt IS NOT NULL AND date_trunc('day', submittedAt) = today)` | `CoachHome → CheckInsInbox` (existing) |
| **Brief** | Coach Brief opened today | 1 if `CoachBrief.openedAt IS NOT NULL AND date_trunc('day', openedAt) = today`, else 0 | 1 | `CoachHome → CoachBrief` |
| **Review** | Client messages reviewed today | `count(ConversationReview.coachReviewedAt = today AND coachId = me)` | `count(Conversation` with new client messages today `)` | `CoachHome → Messages` |

Three arcs filling toward 100% complete = the coach's day is done. This widget reuses the `ThreeRingHero` visual primitive that already ships in the client wearables surface (`src/screens/client/wearables/cards/ThreeRingHero.tsx`).

---

## Surfaces

- **NEW component:** `src/components/coach/CoachThreeArcRouter.tsx`
- **NEW hook:** `src/hooks/useCoachThreeArcCounts.ts` (TanStack Query)
- **Mounted in:** `src/screens/coach/CoachHomeScreen.tsx` (both solo + headcoach variants — guard the mount with `featureFlags.romanThreeArcRouter`)
- **Roman voice copy:** add to `src/lib/roman/copy.ts` under `romanDailyRingsCelebration` / `romanDailyRingsEncouragement` (single stem each, straight register; e.g. `"Three rings closed. The day's work is done."`)

## Backend

The mobile widget needs **one new authenticated coach endpoint** returning today's counts:

```
GET /coach/home/daily-rings
→ {
    checkIns: { reviewed: number, submitted: number },
    brief:    { opened: boolean },
    review:   { reviewed: number, totalConversations: number }
  }
```

- Add `CoachHomeController.dailyRings` under `src/coach/coach-home.controller.ts` (new file is fine; or extend an existing thin `coach-home` module).
- Class-level `@Roles('coach')` + `@UseGuards(JwtAuthGuard, CoachGuard)` (**lesson from L10/R80** — never ship a coach handler without role decoration; the `roles-enforced.spec.ts` pin will catch it).
- Flag-gate behind `FEATURE_ROMAN_THREE_ARC_COUNTS` (env default OFF). When flag is OFF, return zeroed shape so mobile renders empty rings gracefully.
- Service composes the three counts using existing repositories — DO NOT add new Prisma models. Re-use `CheckInsService` (check-ins arc), `CoachBriefService` (brief arc — read `openedAt`), and `MessagingService.coachReviewForClient` aggregated across the coach's roster (review arc).
- Cache the response for 30s (light in-memory or query-level), since it's polled on Coach Home focus.

## Deep-link routing

- Tap on check-ins arc → `navigation.navigate('CheckInsInbox')`
- Tap on brief arc → `navigation.navigate('CoachBrief')` (today's brief)
- Tap on review arc → `navigation.navigate('Messages')` (with `filter: 'unreviewed'`)

Routes already exist in `CoachNavigator.tsx`; we just wire `onPress` handlers per arc.

---

## Visual reference

Reuse `ThreeRingHero` proportions; place inline on the Coach Home above-the-fold (between the greeting and the action queue). Single hairline divider above + below. Each arc gets a small-caps label below it (`CHECK-INS`, `BRIEF`, `REVIEW`) — three words, no abbreviations.

No accent celebration animation. The Roman voice line below the rings updates copy when 3/3 close — that IS the celebration.

---

## Tests (required before PR open)

### Mobile
- `src/components/coach/__tests__/CoachThreeArcRouter.test.tsx` (10+ cases)
  - All three rings render in correct order
  - Each ring numerator/denominator displays correctly
  - Tap on each arc fires the right `navigation.navigate` call
  - 3/3 state renders Roman celebration copy, not encouragement copy
  - Hidden when flag is OFF (defensive — the screen also gates, but pin the component)
  - **L8/L10 learning:** use `await render(...)` pattern (RNTL v14)
- `src/screens/coach/__tests__/coachHomeThreeArcFlagOff.test.tsx` — pin: when flag is OFF, the component is not in the tree (R79 doctrine sweep family).
- Update `src/__tests__/quietLuxuryDoctrine.test.ts` glob if needed.

### Backend
- `test/coach-home-daily-rings.controller.spec.ts` — class-level @Roles assertion, flag-on/off paths, zero-row safety, no-leak across coaches.
- `test/roles-enforced.spec.ts` MUST pass (CoachHomeController will use class-level @Roles, no allowlist entry needed).

---

## Required rules (verbatim)

- **R0** ban-scan: `git diff main...HEAD | grep -E '(@ts-ignore|as any|as unknown as|\.catch\(\(\)\s*=>\s*undefined\)|Coming soon)'` must return empty.
- **R52** push every ~2 min; first push uses `git push -u origin feature/roman-ed2-three-arc-router`.
- **R74** every commit `Bradley Gleave <bradley@bradleytgpcoaching.com>` (inline `-c` flags; verify with `git log -1 --format='%an <%ae>'`).
- **R77** lane scope: DO NOT touch the Wearables 3-ring component or any client surface. Coach side only.
- **R78** no new telemetry events expected → pin untouched. If you DO add events, update the pinned table in the SAME PR.
- **R79** run the full doctrine sweep on mobile before opening the PR.
- **R80** if you hit a test failure on code you didn't touch, verify against `origin/main` before claiming "pre-existing". Fix small main-red regressions in-lane.

## L8/L10 learnings (encode in tests)
- RNTL v14: `await render(...)`, `await renderHook(...)`.
- AsyncStorage in tests: `import AsyncStorage from '@react-native-async-storage/async-storage'` — NEVER `require()`.
- TanStack Query v5 post-mutation: `await waitFor(() => expect(result.current.data?.id).toBe(...))`.
- Theme token is `semanticColors.bgSurface` (not `surface`).
- Any new coach controller MUST carry class-level `@Roles('coach')` — the `roles-enforced.spec.ts` pin will fail otherwise.

## PR conventions
- Branch (both repos): `feature/roman-ed2-three-arc-router`
- Backend PR title: `feat(roman): ED.2 three-arc router daily counts endpoint (backend) — FEATURE_ROMAN_THREE_ARC_COUNTS off`
- Mobile PR title: `feat(roman): ED.2 three-arc router widget (mobile) — EXPO_PUBLIC_FF_ROMAN_THREE_ARC_ROUTER off`
- PR body lists scope, feature flags, tests added, R-rule compliance.

Do NOT merge. Parent handles the merge train.
