Tier: T1 mobile presentation and bounded route wiring.
Why: Make Community Today calm and factual without cutting any available route.
T4 trigger scan: None; no auth, tenancy, consent, PII persistence, money, secrets or destructive-data changes.
T3 trigger scan: None; existing navigation targets and production API contract only.
Bounded T1: Two owned screens, their tests and module README; no navigator, shared voice helper, flags, dependencies or lockfile changes.
Canonical builder: DES-AK-127, agent 128.
Parent owner: operator agent 128; owner screen-redo decisions of 2026-10-07.
Acceptance evidence: Tests-only CI head 5c0010ee passed lint/typecheck and failed seven expected assertions in the two touched-screen suites; failing-first run https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680706319. Final implementation head 01ffe9146f9580fcba2f2ba2291f7eb7a41363fd has all four checks green, including lint/typecheck/full tests: https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37681554443. Once shared deps became READY, targeted Today (10), shell/leaderboard (5) and coach-message (5) tests passed locally, one file at a time through heavy.sh. 307 changed lines (237 additions + 70 deletions).
Promotion triggers: Any auth, tenancy, privacy, money or backend-contract change goes to the operator rather than this lane.

## What changes for coaches/clients

A serif local-date heading, factual text rows separated by hairlines, small-caps section labels, and an existing-composer shortcut as the single forest primary action. Community segments become underlined text, preserving their labels and unread counts. Loading, failed and truly empty responses remain distinct. Find/Classroom get flag-gated links to already registered routes.

The Today contract has no author display name, post body, post timestamp or engagement count. Those are omitted, not invented; cohort counts and event/challenge dates come from the response. No backend changes are needed.

## B/U list

- B1: An ordinary client opening Today sees a pinned community post attributed to “your coach” even though the response does not establish that relationship. Replace with “Pinned post”.
- B2: An ordinary client with Hall disabled taps “Visit the Hall” and actually opens messages. Label the real fallback; omit it when no message destination can work.
- B3: An ordinary coachless client with no membership is promised that a coach will place them in a cohort. Replace the inherited broad/promise empty copy with facts about this response.
- U1: Initial Today loading previously rendered only a heading; provide an accessible loading state.
- U2: Calm text-first hierarchy, token typography, real dates and underlined segments.

## Truthful sweep

| Before file:line | Unbacked claim | Actual data | Replacement |
|---|---|---|---|
| CommunityTodayScreen.tsx:194 | From your coach | Pinned author ID only; may not match the client's coach | Pinned post |
| CommunityTodayScreen.tsx:136 | Nothing waiting today | Only cohort/event/pinned/challenge summary, not inbox or all community activity | No updates in Today |
| CommunityTodayScreen.tsx:134 via EmptyState/romanVoice | Coach will place you in a cohort | no_membership can occur without a coach | A community space is not available for this account. |
| CommunityTodayScreen.tsx:142 | Visit the Hall | Hall-off handler opens messages | Visit the Hall / Messages / Send your coach a message, matching flags and coach state |

True cohort names/counts, post/event/challenge titles, “Your cohort”, “Upcoming event”, “Challenge”, retry instruction and existing coach-message label remain unchanged. The shared romanVoice file is untouched. Removal of the inherited broad empty-body promises is under rule 1; removal of an unavailable fallback is under rule 2. No photograph/monogram is needed on the factual Today empty surface.

## Routes/actions before -> after

| Screen | Label / element | Before destination/effect -> after |
|---|---|---|
| Shell | Today | Embedded Today -> same |
| Shell | Hall | Embedded hall feed -> same, Hall flag |
| Shell | Cohorts | Embedded cohort feed -> same, Cohorts flag |
| Shell | Challenges | Embedded discovery -> same, Challenges flag |
| Shell | Messages | Embedded inbox -> same, DM flag |
| Shell | Leaderboard | Leaderboard -> same, coach required |
| Shell | Community safety | CommunitySafety -> same, always present |
| Shell | Find | Registered CommunityFind route -> direct existing-route link, Search flag |
| Shell | Classroom | Registered CommunityClassroom route -> direct existing-route link, Classroom flag |
| Today | Your cohort | CommunitySpace(cohort, cohortId) -> same |
| Today | Pinned post | CommunityThread(postId) -> same |
| Today | Upcoming event | CommunityEventDetail(eventId) or Hall/message fallback -> same |
| Today | Challenge | CommunityChallengeDetail(challengeId) or Hall/message fallback -> same |
| Today | Empty Hall action | CommunitySpace(hall) -> same |
| Today | Empty community-message fallback | CommunityDmList -> same, accurately labelled |
| Today | Empty coach-message fallback | Home > Messages -> same, coach required |
| Today | No-membership coach-message action | CommunityDmList if DMs on; otherwise Home > Messages -> same |
| Today | Try again | today.refetch -> same |
| Today | New post | Composer reachable via Hall -> direct CommunityComposer(mode:post) shortcut when enabled response confirms workspace and Hall enabled |

The parity tests render both touched screens and invoke every listed segment/route handler. Existing coach-message/error tests remain part of the acceptance evidence.

## Design and documentation

- Theme colors only; bone background, no cream cards or shadows; Cormorant for date/summary, Inter for reading/tapping.
- Minimum 44-point tap targets; monochrome tabular counts; outlined safety/ranking icons; no new animation, photo or illustration.
- All six client tabs and their navigator are untouched.
- Corresponding module documentation: `src/screens/community/README.md`.
- No new dependency, lockfile, API, flag or production change.
