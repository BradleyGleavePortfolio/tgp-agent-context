Tier: T1 mobile presentation and truthful copy
Why: Calm, readable past conversations and Guidance without invented coach/training/connectivity claims.
T4 trigger scan: No auth, tenancy, PII transport, money, credentials or destructive-data behavior changes. Existing deletion confirmations and account binding are untouched.
T3 trigger scan: No contracts, endpoints, navigation, dependencies, consent gates, Roman memory switch or production flags changed.
Bounded T1: Three assigned screens, matching tests and only their existing README entries.
Canonical builder: DES-BC-127, agent 128
Parent owner: operator agent 128
Acceptance evidence: Targeted local Jest via ops/heavy.sh: conversations 41, transcript 19, guide 10, doctrine 30, copy voice 8, AI refusal surfaces 15 and daily cap surfaces 4 tests pass (127 total). Guide tests failed on the original screen before implementation.
Promotion triggers: Any proposed API preview, consent, memory, access or deletion behavior change goes to its owning lane.

## What changes for coaches/clients
- Past conversations use real dates/times/counts in hairline rows. Transcripts keep ROMAN / YOU labels, Roman's existing face and interruption notes, now with theme-colored Inter body text.
- Guidance replaces bubbles/GP initials and animated dots with speaker labels, quiet separators, text-link suggestions and a 44pt forest send action.
- Guidance no longer claims it was trained on a coach, has data ready before any request, is offline before context is fetched, or will automatically send a restored draft.
- Roman behavior, consent/refusal gates and Settings > Roman AI memory control (m#463) are frozen and unchanged.

## B / U list
- B1: A client opening Guidance on a normal connection sees “Working offline” merely because structured context has not yet been fetched. Removed unsupported footer.
- B2: A coachless client sees a claim about coach training and goals/logs/check-ins on hand. Replaced with neutral instructions and a coach label only when returned.
- B3: A failed offline send promises automatic delivery, but only restores the draft. Copy now describes the restored input.
- B4: A successful degraded reply is described as “offline mode”. Copy now says limited guidance for this reply.
- U1: Boxed rows/bubbles, unrelated GP chrome and repeating typing dots replaced with calm typography and hairlines.
- U2: Guide send/shortcuts have 44pt targets; status text is at least 13pt, transcript colors come from the active theme.

## Routes/actions before -> after
| Screen / label | Before -> after destination or effect |
| --- | --- |
| Conversations: Back | goBack -> unchanged |
| Conversations: dated row | RomanConversation with id, owner, binding, date, surface, count -> unchanged |
| Conversations: delete row | Permanent-delete sheet; Keep it or confirm -> unchanged |
| Conversations: Show older conversations / list end | loadMore(cursor) -> unchanged |
| Conversations: Delete all conversations | Typed DELETE confirmation; cancel or deleteAll -> unchanged |
| Conversations: Try again / Contact support | Existing mapped reload/delete retry and support reference/email fallback -> unchanged |
| Transcript: Back | goBack -> unchanged |
| Transcript: Show earlier messages | readMessages(cursor), prepend real messages -> unchanged |
| Transcript: Delete conversation | Permanent-delete sheet, cancel/confirm, notify list and goBack -> unchanged |
| Transcript: Try again / Contact support / Back to conversations | Existing failure-specific handlers -> unchanged |
| Guide: Today’s focus, Meal ideas, Recovery, Training notes | sendMessage(label) -> unchanged |
| Guide: Adjust my plan -> Plan adjustments | Same plan-question shortcut/send handler; neutral label no longer assumes an assigned plan or uses first person |
| Guide: message field, submit, Send message | Draft editing / sendMessage / local settled-turn persistence -> unchanged |
| Guide: consent/refusal actions | Existing AiRefusalNotice (Allow AI help, grant/retry, support/copy reference) -> unchanged component and callbacks |
| Guide: daily-cap close | Existing AiDailyCapModal onClose -> unchanged |

Rendered screen tests exercise list navigation/back/pagination/delete one/delete all/cancel/retry/support, transcript pagination/delete/back/error states, all five guide shortcuts and typed send/history. Shared consent/daily-cap components remain unchanged.
Existing consent/refusal and daily-cap integration tests were updated only at their guide composer selectors and pass unchanged behavioral assertions.

## Truthful sweep (pre-change locations)
| File:line | Unsupported copy | Actual state | Replacement |
| --- | --- | --- | --- |
| AIGuideScreen.tsx:345 | Message will send when connection returns | Draft restored; no auto-send subscription | Connection unavailable. The message remains in the input. |
| AIGuideScreen.tsx:353 | AI guidance is running in offline mode | Successful server reply has degraded=true | Limited guidance is available for this reply. |
| AIGuideScreen.tsx:361,384-385 | Trained on coach approach; goals/logs/check-ins on hand | Coach context may be absent; name does not prove training or prepared data | Returned name only: Coach · name. Empty guidance: Ask about training, food or recovery. |
| AIGuideScreen.tsx:388 | Working offline; generic replies until reconnect | contextReady starts false before a lazy request | Removed under rule 1: not a connection signal |
| AIGuideScreen.tsx:49,437 | Adjust my plan / Ask me anything | May have no plan; UI first person | Plan adjustments / Ask about training, food or recovery |

All true dates, counts, transcript contents, greetings and shared state-specific deletion/error/consent copy remain. No transcript text is invented.

## Bounded limitation
The existing list API returns metadata only (`RomanChatSummary`), not first-line text. This visual lane does not change that API or fetch every private transcript for previews. Real dates/counts stay visible; recommend deferring first-line previews to a separately owned API job if required. Neither export nor start-new exists on these past-conversation screens; none was removed or added.

## Documentation / validation
- Only the AIGuide row in client/README and Roman conversations paragraph in settings/README changed.
- No new dependency, lockfile edit, hex color, unsafe cast, global banner, animation, navigation change or production action.
- The existing Roman face is preserved, not a newly introduced photo.
- No device screenshot claimed; reference image reviewed, presentation verified in rendered screen tests.
- First CI passed lint/typecheck/guards and found stale Guide input selectors in integration tests; those four selector lines are updated. An unrelated wearable import-epoch test also failed in that run; no wearable files were edited.
