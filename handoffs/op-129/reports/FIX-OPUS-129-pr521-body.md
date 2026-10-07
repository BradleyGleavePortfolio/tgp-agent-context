Tier: T4 (client entitlement gate, `src/entitlements/*`) + T1 live-workout behaviour
Why: FW-TRAIN-128 B1 plus the owner's 15:03 10-07 correction. A paying client who left the app mid-workout (text, song, YouTube) came back to a "Resume workout?" prompt with "Start Fresh" first, or on weak gym signal to "Choose a Plan", and could not finish the workout until signal returned.
T4 trigger scan: entitlement gate (client-side mirror only). Backend `ClientEntitlementGuard` unchanged and still answers every paid call with 402; first-fetch failure still fails closed; a confirmed inactive result or any 402 still gates. No auth, RLS, PII, money, credential or destructive-data change.
T3 trigger scan: none (no API, schema, migration, flag or dependency change; works against current production backend).
Bounded T1: ActiveWorkoutScreen restore/leave paths, one tab-press guard in ClientNavigator, README row.
Canonical builder: TRAIN-GATE-128 (Claude Opus 5.5, agent 128)
Parent owner: FW-TRAIN-128 J1 / FIXWAVE-128
Acceptance evidence: failing-first tests below. Local targeted runs (heavy.sh, one file each): entitlementGateKeepsWorkout 5/5, restAlertQuietFinish127 21/21, ActiveWorkoutScreen.persistence 40/40, workoutLogging2126 11/11, workoutSync124.screen 8/8, romanP3FlagOffFinishWorkout 4/4, copyVoice.guard 8/8, protectedScreenFailClosed 6/6. On main, the in-flight re-check test fails (spinner swaps the workout out), the weak-signal test fails (paywall), and the reopen test fails (Resume prompt). FIX ROUND 2 (FIX-OPUS-129): restAlertQuietFinish127 26/26 at 0d278929; with the 0b10156d screen and navigator the three new cases fail (Leave and Back keep a draft with notes and an edited set; ActiveWorkout has gestureEnabled: false). workoutSync124.screen 8/8, ActiveWorkoutScreen.persistence 40/40, entitlementGateKeepsWorkout 5/5, clientTabLabels 1/1, romanP3FlagOffFinishWorkout 4/4.
Promotion triggers: none.

## What changes for coaches/clients
- Clients: the live workout autosaves (unchanged, every change) and now stays open when the app goes to the background and comes back, including while the entitlement re-check runs or fails on weak signal. Only a confirmed inactive result (or a 402 from the server) shows the plan/coach gate.
- Clients: opening the workout screen with an unfinished workout goes straight back into it (its own name, coach assignment and sets). No prompt, no "Start Fresh", no "Discard" anywhere (owner 15:03: "We should NOT have options to delete it").
- Clients: leaving the workout screen (Android back, the top-left Leave button) or pressing another tab with sets logged asks "Log this workout?" with "Keep training" or "Finish and log" (runs the normal Finish save, online or queued). On iPhone the swipe-back from the left edge is off on the live workout (native-stack cannot hold it for the question; without this the workout vanished but stayed open and could not be reopened); the Leave button is the way out. With nothing entered (no ticked set, no notes, no edited set), leaving the screen closes it and releases the empty session; notes or edited sets typed before the first ticked set are saved and the workout reopens with them. A tab press with nothing logged just opens the tab and the workout stays open in Train.
- Coaches: nothing changes.

## B / U
- B1 (FW-TRAIN-128): a paid client mid-workout who glances at another app comes back to a reset prompt or, on weak signal, to "Choose a Plan" and cannot finish. Fixed: `ProtectedScreen` keeps children while `checking`/`unavailable` once `confirmedActive` (new, set only by a server "active", cleared by "inactive", any 402 and every identity change).
- Owner correction 15:03: delete options removed from the return path and the screen; leave asks to log or keep training.

## Routes/actions before -> after (ActiveWorkout)
| Label | Before | After |
|---|---|---|
| Restore prompt "Resume" | adopts saved session | automatic on open (no prompt) |
| Restore prompt "Start Fresh" | deleted saved session | REMOVED (owner-ordered, 15:03) |
| Top-left X "Discard workout" -> "Discard" | deleted session, goBack | REMOVED (owner-ordered); same position is now "Leave workout" (chevron) -> "Log this workout?" Keep training / Finish and log; nothing ticked -> goBack (draft with notes/edits saved; untouched session released) |
| Back (Android) | left screen silently (session kept) | asks "Log this workout?" when sets are logged; nothing ticked: a draft with notes/edits is saved and kept, an untouched one is released |
| iOS swipe-back from the left edge | left screen silently (session kept) | off on this screen (`gestureEnabled: false`, ClientNavigator): native-stack cannot hold it for the question; Leave (same edge, top-left) asks instead |
| Tab press to another tab | switched tab silently | asks "Log this workout?" when sets are logged; else switches |
| Finish -> "Finish Workout?" Cancel / Finish | save, goBack / WorkoutMain | unchanged |
| Add Exercise, Swap, Add Set, rest +30s / Skip, notes, Watch video | unchanged | unchanged |
Parity proven in `restAlertQuietFinish127.test.tsx` ("leaving a live workout never deletes it" + existing parity block) and `workoutSync124.screen.test.tsx`.

Truthful sweep: new copy "Log this workout?", "N sets logged so far. Finish to save them, or keep training. Unfinished sets will not be saved." states the live count; no first person, no exclamation marks, no emojis. Icon is an outline chevron from the theme colour.

Notes: no open PR edits these files (m#515 touches only `DunningBanner.tsx`); main merged in. "Finish and log" after a tab press saves and lands on the Train tab (the normal Finish destination), not the tapped tab.

FIX ROUND 2 (FIX-OPUS-129, agent 129): B-521-SOL-1 (Sol 6048765704) a draft with notes or edits and no ticked set is kept on Leave/Back (ActiveWorkoutScreen.tsx askBeforeLeaving); B1 (Opus 6048842804, also AUD-FIN-TRAIN-129) iOS swipe-back off on ActiveWorkout (ClientNavigator.tsx). The two choices stay exactly "Keep training" / "Finish and log".
