# COACH-CONSULT-M-134 — coach consultation K0-K4, flow, chapters, routing (agent 134)

Builder: claude_opus_5_5. Worktree /home/user/workspace/wt/COACH-CONSULT-M-134-mobile.
Started 19:40 PDT 10-08. Status (22:35): DONE. m#620, m#621, m#622, m#636 all MERGED (each LN-OPUS-B-134 + LN-SOL-B2-134 APPROVE). B=2 (B-621-B2-1, B-621-1), U=2 (U-621-1, U-622-B2-1), all fixed. 8 Proposed items need the operator (defaults given).

PRs (split in three to stay under 800 lines each):
- m#620 `agent134/coach-consult-m-134-engine` → main: `src/lib/coachConsultation/**` (types, flow registry, draft, API + fallback), 568 lines.
- m#621 `agent134/coach-consult-m-134` → main (retargeted): `src/screens/coach/consultation/**` (flow, frame, registry, step contract, K0-K2) + coach README + draft `synced` flag, 791 lines.
- m#636 `agent134/coach-consult-m-134-share-link` → main, MERGED at 972b7110: U-622-B2-1 follow-up (`EmptyStateNoClients` share payload + 2 tests), 23 lines.
- m#622 `agent134/coach-consult-m-134-routing` → main (retargeted), MERGED at 6c26ab65: K3, K4, `steps/useAutoAdvance.ts`, registry lines, then (b046012e, after m#576 merged) `CoachWizardNavigator.tsx` + routing test + 2 legacy-test imports + navigation README, then (76c7f536) 86 K-LAND `EmptyStateNoClients` + look test + route-list test. 516 own lines.

## API

Written 19:58 PDT for COACH-CONSULT-M2-134 (K5-K8). Update 20:29: pushed. Engine = m#620 (`agent134/coach-consult-m-134-engine`),
screens + contract = m#621 on branch `agent134/coach-consult-m-134` (contains the engine). Stack your PR on it:
`git merge origin/agent134/coach-consult-m-134`, PR base `agent134/coach-consult-m-134`. Never edit `flow.ts`, `registry.ts` or
`CoachConsultationFlow.tsx`; your PR body lists the registry line(s) and I add them, or you add ONLY the marked lines in
`registry.ts` in your stacked PR (the operator decides; default: you add them in your stacked PR, nothing else in that file).

### Types (`src/lib/coachConsultation/types.ts`)

```ts
export type CoachStepId = 'K0' | 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6' | 'K7' | 'K8';
export type Specialty = 'fat_loss' | 'strength' | 'muscle' | 'beginners' | 'older' | 'sports'
  | 'mobility' | 'nutrition' | 'busy' | 'other';
export type ClientsToday = 'none' | '1_10' | '11_25' | '26_50' | '50_plus'; // BE vocabulary
export type CoachingTouch = 'close' | 'balanced' | 'light';
export type ProgrammingStyle = 'own' | 'templates' | 'help';

/** Everything the coach consultation saves. snake_case = the wire shape (same keys server side). */
export interface CoachConsultAnswers {
  display_name?: string;            // K1 required, trimmed 1-80
  business_name?: string;           // K1 optional, 0-80
  bio?: string;                     // K1 optional, 0-280
  specialties?: Specialty[];        // K2 optional, max 5
  clients_today?: ClientsToday;     // K3 required (gates K7: only when not 'none')
  coaching_touch?: CoachingTouch;   // K4 optional
  programming_style?: ProgrammingStyle; // K5 optional (M2)
  link_shared?: boolean;            // K6: true once copied or shared (M2). LOCAL ONLY, never sent (BE rejects unknown keys)
  import_choice?: 'show_me' | 'later'; // K7, only when featureFlags.extensionImport (M2). LOCAL ONLY
}

export interface CoachProgress { chapter: 1 | 2 | 3 | 4 | 5; position: number; count: number; total: 5 }
```

### Step component contract (`src/screens/coach/consultation/types.ts`)

```ts
export interface CoachStepProps {
  answers: CoachConsultAnswers;
  /** Merge a patch into the answers; the flow persists the local draft (debounced) on every call. */
  setAnswers: (patch: Partial<CoachConsultAnswers>) => void;
  /** Next visible step. On the last step (K8) it completes the consultation (server) and lands on Clients. */
  onNext: () => void;
  /** Previous visible step; null on K0. */
  onBack: (() => void) | null;
  /** Saves (local + server best effort) and leaves to the "paused" state. Shown on K1-K7 only. */
  onFinishLater: () => void;
  /** Chapter bar for K1-K7; null on K0 and K8 (no bar). */
  progress: CoachProgress | null;
  /** "Your practice · 4 of 5" for framed steps; "Your practice" on K0/K8. */
  eyebrow: string;
  /** Coach's first name from the cached user ("" when unknown). */
  firstName: string;
  /** K8 only: completion in flight (spinner on its button). A failed completion is shown by the flow itself
   *  (problem screen: specific title/body, "Try again", "Back"), so K8 needs no error UI. (20:12: completeError removed.) */
  completing: boolean;
}
```

Layout primitive for every framed step: `CoachStepFrame` (`src/screens/coach/consultation/CoachStepFrame.tsx`):
`{ progress, eyebrow, headline, sub?, onBack, onFinishLater?, footer?, children, testID }` = Screen (safe-area-context
insets) + ScreenTopBar (back chevron, "Finish later") + 5-segment bar + overline + Headline h1. Footer = ONE PrimaryButton
and at most one TextLink (Skip / Later). Update 20:29: use the token-rounded parts exported from `CoachStepFrame.tsx`:
`ChoiceChip { label, selected, onPress, testID?, single?, capped? }` (pill), `ChoiceRow { label, sub?, selected, onPress,
testID? }` (hairline radio row; K5 = the K4 pattern, `steps/K4CoachingTouch.tsx` in PR 3), `Field { label, value, onChange,
maxLength, multiline?, autoCapitalize?, testID? }` (radius.input). Roman: `RomanLine` from `src/screens/consultation/components`.
Test ids: `coach-consult-<K>` (screen), `coach-consult-<K>-cta`, `coach-consult-finish-later`.
Update 20:34: single-choice auto-advance hook `useAutoAdvance(onNext)` (STEP_MS 280, cancelled on leave) and the K4 radio
pattern are in m#622 (`agent134/coach-consult-m-134-routing`). For K5 stack on that branch to reuse them (default), or on
`agent134/coach-consult-m-134` and copy the 20-line hook into your step.

### Flow registry (`src/lib/coachConsultation/flow.ts`, owned by M-134)

Order K0 K1 K2 K3 K4 K5 K6 K7 K8. Chapters: K1=1, K2=2, K3=3, K4+K5=4 (positions 1 and 2 of 2), K6(+K7)=5; K0 and K8
unframed. K7 visible only when `featureFlags.extensionImport` and `clients_today !== 'none'` (off in v1: bar stays 5).
A step with no registered component is skipped (so PR 1/2 run end to end before K5-K8 land: K4 -> complete).
Registry (`src/screens/coach/consultation/registry.ts`):

```ts
export const STEP_COMPONENTS: Partial<Record<CoachStepId, React.ComponentType<CoachStepProps>>> = {
  K0: K0Welcome, K1: K1Card, K2: K2Specialties, K3: K3ClientsToday, K4: K4CoachingTouch,
  // COACH-CONSULT-M2-134: K5: K5ProgrammingStyle, K6: K6PersonalLink, K7: K7ImportOffer, K8: K8PracticeReady,
};
```

### Save / resume / complete (mobile side; backend per COACH-CONSULT-BE-134 "## API")

- Local draft per user: AsyncStorage `coach_consult_v1:<user id>` = `{ v: 1, answers, step, updatedAt }`; written on every
  answer change and step change; resume opens the saved step (K0 when none). Purged after completion.
- Server draft (BE contract read 20:02): `GET /coach/consultation` on open (prefill / resume; newer of local and server wins),
  `PUT /coach/consultation` (wire keys only: display_name, business_name, bio, specialties, clients_today, coaching_touch,
  programming_style, step) at each step change and Finish later, best effort; 404/405 = not deployed: local draft only.
- Complete (K8 "Show me around", or the last registered step): `POST /coach/consultation/complete` with every wire answer
  (BE sets CoachOnboardingProgress.completed_at). If it 404s (BE not deployed yet): `advanceWizardTo(6, { coach_consultation:
  answers })` + `POST /coach/onboarding/complete` (today's production backend; answers kept in step_data["6"]). Then
  `authEvents.emit()` -> coach app,
  initial tab ClientsStack (86 K-LAND). Money steps (Get paid, first package, invite) are NOT in the flow: they stay as
  optional next steps on the Overview checklist (CoachSetupChecklist -> Settings > Coach setup / Packages), B02.

## Proposed (needs operator)

1. Finish later opens a paused screen ("Your place is kept.", Continue setting up, Sign out) instead of the prototype's
   K-LAND, because the coach app opens only after completion (RootNavigator gate, not my file). Default: paused screen.
2. After the consultation the coach lands on Clients (86 K-LAND, CoachNavigator initial tab ClientsStack); Get paid, first
   package and invite stay on the Overview checklist as optional next steps (B02), not as extra screens. Default: as built.
3. 86 K-LAND: superseded (U-621-1): delivered in m#622 by restyling `EmptyStateNoClients` (Roman neutral, "No clients yet.",
   "Share my link"). The roster header above it (REDO-COACH-133: date, "Clients", count, push card, privacy line, search) is
   kept instead of the shot's "Your roster" + serif "Clients". Default: keep today's header.
4. 75 ROLE-C / 76 CREATE-C: `RoleChoice` ("I coach clients") and `CreateAccountScreen` ("Joining as a coach") already match;
   no delta. Default: no change.
5. The client consultation's chips/fields (`src/screens/consultation/components.tsx`) are not reused for the coach flow;
   the coach flow has its own token-rounded `ChoiceChip`/`ChoiceRow`/`Field`. Default: as built.
6. The legacy 5-step wizard stays in `CoachWizardNavigator.tsx` as a named export (unrouted, its tests kept) so the routing
   PR stays under 800 lines; removal in a follow-up. Default: keep unrouted until the operator assigns the removal.
   No app file imports it or navigates to its steps (route-list test in m#622, LN-SOL-C2-134 advisory).
7. Add `ConnectProviderSheet.importEpoch` ('sign-out while the sheet is still open, then the import fails') to the P15 flaky
   list (seen in CI on m#621 once; rerun passed). Default: treat like attemptFence (rerun, not a B).
8. C from LN-OPUS-B-134 kept: monogram ring is the border token, not the shot's warmer gold; the navigator's draft key falls
   back to "coach" only when the user cache is empty. Default: no change.

## Progress log

- 19:40 read P1-P12, my entry, prototype 75-81 + 86 (shots, notes, js/screens-app.js coach track).
- 19:58 "## API" posted (above).
- 20:02 API updated with COACH-CONSULT-BE-134 vocabulary ('none', LOCAL ONLY K6/K7 fields, server draft, complete + fallback).
- 19:50-20:06 sandbox stalled (shared load); resumed 20:06.
- 20:12 `completeError` removed from the step contract (the flow shows its own problem screen).
- 20:15 deps linked; jest one file at a time via heavy.sh; typecheck of the new files (scoped tsconfig) and eslint clean.
- 20:24 m#620 opened (engine, @ 495d2711). 20:28 m#621 opened (flow + K0-K2, @ f71389a6).
- 20:31 CI on m#620 and m#621: Typecheck fails ONLY on `src/navigation/__tests__/imessageDmRoutes.test.tsx(77,5) TS1117`
  (P14, main since m#609); tests did not run in CI. Locally all my test files and the guards pass.
- 20:33 m#622 opened as DRAFT (K3-K4, @ a348c956). m#576 still open (head 35507bf2, mergeable).
- 20:35 routing commit prepared and checked locally WITHOUT committing (patch script `COACH-CONSULT-M-134-routing-patch.py`;
  `coachConsultRouting.test.tsx` 3/3 with it applied; reverted). It waits for m#576.
- 20:42 m#617 merged. `git merge origin/main` into the engine branch, then down the stack; pushed: m#620 @ a9bbb790,
  m#621 @ 9f500c42, m#622 @ 7753e63f. CI running.
- 20:50 m#620 CI green; READY posted (issuecomment-6073885303). m#622 CI green (draft, routing pending).
- 20:53 m#621 CI failed ONLY on `src/screens/client/wearables/__tests__/ConnectProviderSheet.importEpoch.test.tsx`
  ('sign-out while the sheet is still open, then the import fails'), not my code (m#622, a superset of m#621, passed the
  same suite). Same family as P15's flaky ConnectProviderSheet test (that one is attemptFence; this is importEpoch).
  Ran `gh run rerun 37880573518 --failed`. Proposed (needs operator): add importEpoch to the P15 flaky list.
- 20:55 m#620 MERGED (LN-OPUS-B-134 APPROVE, LN-SOL-B2-134 APPROVE; B none, U none; C: fallback answers stay in wizard
  step_data until b#894 deploys; fallback walk fires STEP_COMPLETED events for steps not done). m#621 retargeted to main.
- 21:00 m#621 CI green after retarget; READY posted (issuecomment-6074012512).
- 21:00 m#576 MERGED. Routing branch: `git merge origin/main` (58e988e6), applied the prepared navigator edit as the LAST
  commit (b046012e): default export = `CoachConsultationFlow` (user from `readUserCache`, `importOn` = 
  `featureFlags.extensionImport`, onComplete = `persistWizardCompleteFlag` then `authEvents.emit()`, onSignOut =
  `signOut(user.id)`); old wizard renamed `CoachSetupWizard` (unrouted); `coachSetupRound2` and `CoachWizardEdges132` import
  it. Local: routing 3/3, coachSetupRound2 20/20, CoachWizardEdges132 19/19, coachSetup 17/17, coachDay1Hunt05 6/6,
  coachNavigation 5/5, guards pass, scoped tsc + eslint clean. Pushed; m#622 body updated.
- 21:10 LN-SOL-B2-134 REQUEST CHANGES on m#621 (B-621-B2-1: resume preferred the server's arrival-time `updated_at`, so a late
  step-entry save could replace newer K1 typing; C: a winning phone draft was merged with server answers, refilling cleared
  optionals). 21:20 LN-OPUS-B-134 REQUEST CHANGES (B-621-1: no Android back handler; U-621-1: 86 K-LAND not delivered; C: K2
  into a missing K3 at this head alone, monogram ring colour, "coach" draft-key fallback).
- 21:35 m#621 fix (f6cab246): phone draft records `synced`; unsynced phone draft wins, server wins only over a synced one; no
  merge; draft saves one at a time, latest last; `BackHandler` steps back (paused/problem → step, held while saving, K0 →
  system). `CoachConsultationFlow.test.tsx` 11/11 (4 new), coachConsultFlow 9/9, scoped tsc + eslint clean; trimmed to 791
  lines. CI green. FIX ROUND 2 READY posted (issuecomment-6074270676).
- 21:40 routing branch: merged m#621 fix (conflict in two seeded drafts resolved to K4), then 76c7f536: 86 K-LAND in
  `EmptyStateNoClients` + `emptyStateLook` (8/8) + route-list test (`coachConsultRouting` 4/4); ClientsListLookup124 18/18,
  EmptyState 17/17, InviteCtaWiring 6/6, romanCanonicalAssets 10/10, quietLuxuryDoctrine 34/34, truthfulCopy 20/20, copyVoice
  8/8, K3K4 4/4. m#622 body updated with the route list (LN-SOL-C2-134 advisory) and the 86 parity row.
- 21:50 m#621 FIX ROUND 2: LN-SOL-B2-134 APPROVE, LN-OPUS-B-134 APPROVE; m#621 MERGED. Routing branch merged origin/main
  (6c26ab65), pushed; m#622 retargeted to main and marked ready (15 files, +420/-96); routing 4/4, flow 11/11, look 8/8 locally.
- 22:02 m#622 CI green at 6c26ab65; READY posted (issuecomment-6074424726).

- 21:47 m#622: LN-SOL-B2-134 APPROVE (B none; U-622-B2-1: "Share my link" sends only the code when the invite row has no
  `deep_link_url`), LN-OPUS-B-134 APPROVE (B none, U none; C: kept roster header, K3 auto-advance without confirm). m#622
  MERGED 04:50Z at 6c26ab65. The U fix (dd0d9169) was pushed to the routing branch after the merge, so it moved to a new branch
  `agent134/coach-consult-m-134-share-link` (merged origin/main, 972b7110) and PR m#636. dd0d9169 stays on the merged
  routing branch unused (no force-push).
- 22:18 m#636 CI green; READY posted (issuecomment-6074613100).
- 22:35 m#636: LN-SOL-B2-134 APPROVE, LN-OPUS-B-134 APPROVE; MERGED. Lane done.

## HANDOFF

- Done. Merged: m#620 (engine), m#621 (flow + K0-K2), m#622 (K3-K4 + 86 K-LAND + routing), m#636 (Share my link carries a
  join link). Every new coach opens the coach consultation; Get paid, first package and invite stay optional after it (B02).
  Nothing open, nothing half-done. Last head 972b7110.
- Findings fixed: B-621-B2-1 (draft resume/order), B-621-1 (Android back), U-621-1 (86 K-LAND), U-622-B2-1 (share link).
- Open C (deferred by the lenses): gold monogram ring on K1; "coach" draft-key fallback when the user cache is empty; K3
  auto-advance without confirm; persistence-failure copy and unfenced save from an old mounted instance; kept roster header.
- Unused commit dd0d9169 sits on the merged branch `agent134/coach-consult-m-134-routing` (same change as m#636).
- For agent 135: K5-K8 (COACH-CONSULT-M2-134) build on main now; legacy `CoachSetupWizard` removal is a follow-up (Proposed 6).
- Proposed (needs operator): items 1-8 above, all with defaults.
