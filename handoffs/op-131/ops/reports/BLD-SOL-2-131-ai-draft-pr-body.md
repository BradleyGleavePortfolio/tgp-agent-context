Tier: T1
Why: A screen-local confirmation retains unsaved draft edits and removes internal provenance without changing draft APIs.
T4 trigger scan: none; authorization, privacy, AI charging, saved payloads and approval/rejection mutations are unchanged.
T3 trigger scan: none; existing native-stack removal hook, no shared primitive or lifecycle ownership change.
Bounded T1: YES; one review screen, existing dirty state, bounded leave/success/failure cases.
Canonical builder: GPT-6 Luna; bounded slice assigned to GPT-6.1 Sol by operator agent 131.
Parent owner: operator agent 131.
Acceptance evidence: failing-first native-stack tests, then 10/10 new guard/action tests, 16/16 coach AI contract tests, 4/4 draft review tests and 30/30 doctrine tests pass locally.
Promotion triggers: changing backend draft persistence, assignment/rejection semantics, privacy controls or AI charging.

## What changes for coaches/clients

Back or native removal asks “Discard edits?” while workout draft edits are unsaved. Keep editing retains them; Discard continues the original navigation action without saving or rejecting. Successful saves, approvals and explicit rejections clear the guard; failures keep edits protected.

The footer retains all review actions without the model name, token counts or dollar cost. The reject prompt asks for a reason without promising that future drafts improve.

## B/U list

- B-AI-DRAFT-KEEP-131-1 — seen in a test: a coach edits a workout draft and presses Back; unsaved changes disappear without confirmation. Fixed with `usePreventRemove` (native-stack compatible).
- U-AI-DRAFT-KEEP-131-1 — seen in a test: internal model, token and cost provenance competes with the review actions. Removed, including its stale doc comment and unused style.
- U-AI-DRAFT-KEEP-131-2 — seen in a test: the rejection prompt promises future improvement. Replaced with a neutral reason instruction.

## Routes/actions before -> after

| Label/action | Before | After |
|---|---|---|
| Back / native removal | Remove draft screen | Same original action, confirmed only while unsaved edits exist |
| Keep editing / Discard | Not present | Retain local edits / resume removal without save, approval or rejection |
| Week notes / day focus / exercise name and notes | Edit local payload | Unchanged |
| Sets / Reps / RIR / RPE | Edit local payload | Unchanged |
| Save edits | Existing edit endpoint; clear dirty on success | Unchanged; no discard prompt after success, guard retained after failure |
| Approve draft | Existing approve endpoint and ClientDetail destination | Unchanged; successful approval clears the guard |
| Cancel / Discard and approve / Save and approve | Existing dirty-approval options | Unchanged and reachable |
| Reject draft | Open reason modal | Unchanged; neutral instruction |
| Rejection reason / Cancel / Reject / modal close | Edit reason, close modal or reject through existing endpoint | Unchanged; successful rejection returns without an extra discard prompt |
| Model / token / dollar-cost footer | Internal provenance | Removed by AI-DRAFT-KEEP-131 assignment, not a route/action |
| Try again | Retry draft loading | Unchanged |

## Testing

- Before fix at fresh main `5dbab278`: 5 expected failures in `aiWorkoutDraftKeep131.test.tsx` (Back, native removal, failed-save Back, reject instruction and provenance); 3 passing control cases.
- After fix: the final file — 10/10 pass, with a real navigation container and native stack.
- Covers keep/discard, untouched draft, save payload, failed save, save-and-approve, discard-and-approve, rejection success/failure, ClientDetail params, hidden provenance and all editable fields/review buttons.
- `coachAi.test.tsx` — 16/16 pass.
- `aiMealPlanDraftReview125.test.tsx` — 4/4 pass, including workout approval route-id parity.
- `quietLuxuryDoctrine.test.ts` — 30/30 pass.
- Full-project typecheck/lint/full suite are CI-owned; local runs were one targeted file at a time through `ops/heavy.sh`.

## Truthful sweep / documentation

- No persistence or learning promise added; the prompt states the local unsaved-edit consequence and the rejection-reason requirement.
- All payload fields and review actions remain; only explicitly assigned internal provenance is removed.
- No new first-person copy, exclamation marks, emojis, generic errors or colours.
- Updated `src/screens/coach/README.md`.
- Fresh branch from `origin/main` after BROADCAST-KEEP-131 READY; no broadcast commits in this PR.
- No dependency, lockfile, backend, flag or production changes.

agent 131
