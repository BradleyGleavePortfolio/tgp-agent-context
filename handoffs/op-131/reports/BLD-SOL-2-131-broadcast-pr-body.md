Tier: T1
Why: A screen-local confirmation protects unsent broadcast text without changing sending or storage.
T4 trigger scan: none; no authorization, privacy, money or persisted-data mutation changes.
T3 trigger scan: none; existing native-stack removal hook, no shared abstraction or contract change.
Bounded T1: YES; one screen, explicit leave/send cases, existing API and navigation.
Canonical builder: GPT-6 Luna; bounded slice assigned to GPT-6.1 Sol by operator agent 131.
Parent owner: operator agent 131.
Acceptance evidence: failing-first real native-stack Back/close tests, then 5 guard tests and 11 existing broadcast tests pass locally.
Promotion triggers: changing broadcast persistence, delivery, authorization or shared navigation contracts.

## What changes for coaches/clients

Back or close asks “Discard this message?” while any text remains. Keep editing retains the text; Discard continues the original navigation action without sending. Empty/cleared messages leave directly. Successful sends/schedules return without a discard prompt; failures retain both text and guard.

## B/U list

- B-BROADCAST-KEEP-131-1 — seen in a test: a coach types a message and presses Back or closes the composer; the unsent text disappears without confirmation. Fixed with `usePreventRemove` (native-stack compatible).
- U: none.

## Routes/actions before -> after

| Label/action | Before | After |
|---|---|---|
| Back / close / native removal | Remove composer immediately | Same original action, confirmed when text remains |
| Keep editing / Discard | Not present | Keep local text / continue removal, never send |
| Message / first-name placeholder | Edit text | Unchanged |
| All clients / Tag / Package / Program | Select audience and preview count | Unchanged |
| Send now / Schedule / Start later | Choose timing | Unchanged |
| Date / Time / Done | Choose send time | Unchanged |
| Does not repeat / Daily / Weekly / Monthly | Set recurrence | Unchanged |
| Weekdays / month day / time of day | Set repeat details | Unchanged |
| Send / Schedule / Start repeating | Confirm, create, refresh list, go back | Same API/payload and destination, no discard prompt after success |
| Failed send / schedule | Retain form and explain refusal | Same, with leave guard still active |
| Broadcasts unavailable | Existing server-gated state | Unchanged |

## Testing

- Before fix at main `842eb059`: `broadcastLeaveGuard131.test.tsx` — 3 expected failures (Back, close and Back after failed send), 2 passing control cases.
- After fix: the same file — 5/5 pass, using a real `NavigationContainer` and native stack.
- `broadcasts.test.tsx` — 11/11 pass (send now, recurring/tag payload, refusal, server gate, list and entry).
- CI owns full-project typecheck, lint and full-suite checks.
- Local logs saved in operator report folder.

## Truthful sweep / documentation

- New copy describes the local-text consequence only; no promised persistence, audience count, successful delivery or recovery.
- No first-person copy, exclamation marks, emojis, generic errors or new colours.
- No screen, pathway, existing field or backend dependency removed.
- Updated `src/screens/coach/README.md`.
- No dependency, lockfile, backend, flag or production changes.

agent 131
