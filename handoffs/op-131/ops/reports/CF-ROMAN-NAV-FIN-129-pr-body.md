## Tier header
- Tier: T1, bounded mobile navigation and greeting-state fix.
- Why: restore normal stack navigation and select existing greeting copy from existing history metadata.
- T4 trigger scan: no changes to authentication, authorization, tenancy, consent, data deletion, credentials or money; uses the existing account-bound history client unchanged.
- T3 trigger scan: no backend/API schema, prompt, safety or quota changes; no new dependencies.
- Bounded T1: one nested-navigation parameter, one shared header control, and a history lookup for greeting selection.
- Canonical builder: CF-ROMAN-NAV-128; finisher CF-ROMAN-NAV-FIN-129, agent 129.
- Parent owner: operator agent 129.
- Acceptance evidence: fresh current-main failing-first proof and 20 passing merged-head tests cover RomanChatNav (7), RomanGreetingHistory (4), and HomeHeaderActions (9), run one file at a time through `ops/heavy.sh`; details below.
- Promotion triggers: any required auth/consent/API-contract/safety change goes to the operator; none needed here.

Done: Roman entry preserves the You-menu root, chat has Back in every state, returning clients no longer get the first-meeting introduction, and current main is merged with both sides' intent preserved; not done: independent exact-head audits; tests ran: see acceptance evidence below.

## What changes for coaches/clients
Opening Roman from Home keeps the You menu underneath chat instead of making chat the stack root. A labelled 44 pt Back control is present in ready/loading/offline/error/unavailable states for clients and coaches. The existing introduction appears only when no earlier chat exists and today's session is empty; a failed history read uses existing returning copy without blocking chat.

Resumed by agent 129 after the previous operator stopped. Main's Home-child-card documentation is retained alongside the Roman navigation documentation. No merge to main, deployment or production changes.

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
| Coach Settings Roman row | RomanChat with coach surface | Unchanged |
| Chat Back | Missing | Current stack `goBack`, 44 pt labelled control in every load phase |
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

Parity proof: `RomanChatNav.test.tsx` checks Back/history across every load phase, reload eligibility, and client/coach editing, send, retained failed-send draft, send-again and older-message handlers. `HomeHeaderActions.test.tsx` checks flag gating and Roman/message/bell destinations. Consent, cap and deletion handlers are not edited.

## Acceptance evidence
- Original head `f75f5857d036cd28c5c36dca24be3c12c54f8d3d`: [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37696399072/job/113049090674) and both CodeQL analyses passed.
- Original builder's failing-first proof: all 7 navigation tests fail for missing Back, all 4 greeting tests fail for history being ignored, and 1 Home test fails for missing `initial:false`; the same three targeted files then pass all 20 tests.
- Fresh failing-first proof at current main `a1be6fb25538b02e961fd379a0d86d71d610ad7a`: HomeHeaderActions 1 failed / 8 passed (missing `initial:false`); RomanChatNav 7 failed (missing Back); RomanGreetingHistory 4 failed (history ignored and returning clients marked as first encounter).
- Fresh proof at merged head `7e909c35e8192a383f4b7b8e50272ccdf7062057`: HomeHeaderActions 9 passed, RomanChatNav 7 passed, RomanGreetingHistory 4 passed, all exit 0.
- Each file ran separately through `/home/user/workspace/ops/heavy.sh` using `npx --no-install jest <file> --runInBand --ci --forceExit` after shared dependencies became READY. Test logs are saved under `ops/reports/CF-ROMAN-NAV-FIN-129-*-before.log` and `*-after.log`; force-exit notices are reported rather than hidden.
- Exact merged-head CI is green: [Typecheck, lint, test](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37701040917/job/113064280530), [CodeQL actions](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37701040942/job/113064280511), [CodeQL JavaScript/TypeScript](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37701040942/job/113064280755) and [CodeQL result](https://github.com/BradleyGleavePortfolio/growth-project-mobile/runs/113064409865).
- No full local suite, full-project typecheck or lint; full-project validation belongs to PR CI.

## Truthful-copy / design sweep
- No new user-facing claims, counts, promises or consent copy. `romanVoice.ts` is untouched; history selects its existing first/returning variants.
- Failed history read never guesses a first meeting.
- New Back icon colour uses `useTheme().colors.textPrimary`; labelled 44 pt target, outline icon and no press animation.
- Existing avatar, all routes, all six labelled tabs, composer and states remain.
- READMEs updated: `src/screens/roman/README.md`, `src/components/README.md`, `src/navigation/README.md` and root `README.md`.
- Nearby mobile #506 (Roman conversations redo) is still open. This PR deliberately leaves conversation list/transcript screens, their styles/copy/handlers, history APIs and `romanVoice.ts` untouched; the only history lookup is existing metadata for greeting selection. No visual redo or unrelated runtime edits were added during finishing.

agent 129
