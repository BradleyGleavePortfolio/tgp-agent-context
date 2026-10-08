Done: Roman entry preserves the You-menu root, chat has Back in every state, and returning clients no longer get the first-meeting introduction; not done: full CI and independent audit; tests ran: failing-first and green runs of RomanChatNav (7), RomanGreetingHistory (4), and HomeHeaderActions (9).

## Tier header
- Tier: T1, bounded mobile navigation and greeting-state fix.
- Why: restore normal stack navigation and choose existing greeting copy from existing history metadata.
- T4 trigger scan: no changes to authentication, authorization, tenancy, consent, data deletion, credentials or money; uses the existing account-bound history client unchanged.
- T3 trigger scan: no backend/API schema, prompt, safety or quota changes; no new dependencies.
- Bounded T1: one nested-navigation parameter, one shared header control, and a history lookup for greeting selection.
- Canonical builder: CF-ROMAN-NAV-128, agent 128.
- Parent owner: operator agent 128.
- Acceptance evidence: 20 targeted assertions pass; all three files ran individually through `/home/user/workspace/ops/heavy.sh`. Failing-first: 7 nav tests failed for missing Back, 4 greeting tests failed because history was ignored, and the Home test failed for missing `initial:false`.
- Promotion triggers: any required auth/consent/API-contract/safety change goes to the operator; none needed here.

## What changes for coaches/clients
Opening Roman from Home keeps the You menu underneath chat, instead of making chat the stack root. A labelled 44 pt Back control is present in ready/loading/offline/error/unavailable states, for clients and coaches. The existing introduction appears only when no earlier chat exists and today's session is empty; history-read failure uses existing returning copy without blocking chat.

Owner STOP received at 15:27 PDT: this PR is intentionally DRAFT. Implementation and local proofs are complete; CI and lenses remain for the next operator. No merge, deployment or production change.

## B/U list
- B: none.
- U1: a client who opens Roman from Home before opening You loses normal access to the You menu until restart. Fixed with `initial:false` and header Back.
- U2: a returning client opening an empty daily session sees Roman introduce himself again. Fixed by checking the existing bound history list before opening today's chat.

## Routes/actions before -> after
| Label/action | Before | After |
|---|---|---|
| Home Roman avatar | MoreTab / RomanChat, potentially sole root | Same destination; `initial:false` preserves MoreIndex |
| Home Message coach | Messages | Unchanged |
| Home Notifications | NotificationCenter | Unchanged |
| You Roman row | RomanChat | Unchanged |
| Chat Back | Missing | Current stack `goBack`, 44 pt labelled control |
| Conversations header | RomanConversations | Unchanged |
| Draft edit | Controlled input; clear prior send error | Unchanged |
| Send | Send current draft; preserve draft on failure | Unchanged |
| Send again | Retry current draft | Unchanged |
| Older messages | Load older page on list end | Unchanged |
| Offline/error Try again | Reload session/messages | Unchanged |
| Unavailable | State without futile retry | Unchanged |
| Allow AI help / refusal retry | Consent grant/retry; stored turn not repeated automatically | Unchanged |
| Contact support / copy reference | Support entry / copy reference | Unchanged |
| Daily-cap OK | Clear modal/error | Unchanged |
| History deletion | Erasure event drops held session and opens a fresh one | Unchanged |

Parity proof: `RomanChatNav.test.tsx` checks Back/history across every load phase, reload eligibility, and client/coach message editing, send, retained failed-send draft, send-again and older-message handlers. `HomeHeaderActions.test.tsx` checks flag gating and Roman/message/bell destinations. Consent, cap and deletion handlers are not edited.

## Truthful-copy / design sweep
- No new user-facing claims, counts, promises or consent copy. `romanVoice.ts` is untouched; the history result selects its existing first/returning variants.
- Failed history read never guesses a first meeting.
- New Back icon colour comes from `useTheme().colors.textPrimary`; 44 pt target; outline icon; no new palette literals, decoration or spring animation.
- Existing avatar, all routes, all six labelled tabs, composer and states remain.
- READMEs updated: `src/screens/roman/README.md` and `src/components/README.md`.
- Open-PR overlap: #515 also changes the HomeHeaderActions test expectation. Based on main; the shared-test change is one minimal expectation line. No changes to its home-card work or to other Roman-copy files.
