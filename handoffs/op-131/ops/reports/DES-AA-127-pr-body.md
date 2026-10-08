Tier: T2
Why: Shared DM presentation and small, state-driven client render/copy corrections; existing messaging contracts and handlers remain unchanged.
T4 trigger scan: No auth, tenancy, RLS, PII handling, credentials, payment or destructive-write changes. Existing report/block/delete handlers are frozen and retained.
T3 trigger scan: No new dependency, backend contract, migration, navigator or production flag.
Bounded T1: Visual changes alone are T1; grouped timestamp and honest loading/error/contact states make the combined PR T2.
Canonical builder: DES-AA-127, agent 128 (GPT-6.1 Sol).
Parent owner: operator agent 128.
Acceptance evidence: 40 targeted tests pass locally across seven files, each run separately through ops/heavy.sh. Failing-first client baseline: three intended failures with the client implementation reversed, followed by six passing client tests with it restored.
Promotion triggers: A needed auth, privacy, money, safety-routing or destructive-write change goes to the operator, not this builder.

## What changes for coaches/clients

The client thread is one quiet conversation: date overlines between hairlines, incoming Inter 16 pt messages directly on bone, outgoing messages with a forest hairline, grouped muted 13 pt timestamps, and a hairline composer with a square forest send button. Semantic colours replace the fixed palette in the owned UI. Coach threads inherit the shared message, pin and edit presentation without changing the coach screen or its behavior.

No pathway is removed. The coach name does not imply online presence. Empty conversations and failed loads no longer appear at the same time. Failed sends are not described as actively sending.

## B / U

- B1: A client could see an online dot whenever a coach name existed, falsely implying the coach was online; the unsupported dot is removed.
- B2: Report confirmation repeated an operational review-time promise rather than the confirmed action; the owned success line now states only that the report was submitted, with report handling unchanged.
- U1: "Pull to retry" described a tap-only action; copy and accessibility now name the actual retry.
- U2: Contact details could be tapped before the coach identifier existed; the affordance appears only when contact navigation can work.
- U3: The failed-send fallback said "Sending"; it now says "Not sent" without changing sending.
- U4: A failed initial load displayed an empty-conversation instruction; the instruction now requires a successful, empty state.

## Truthful sweep (before styling)

| Before file:line | What it said/showed | What was actually known | After |
|---|---|---|---|
| MessagesScreen.tsx:600 | Online dot for any coach name | Only name/id from profile, not presence | Remove unsupported dot (rule 1) |
| MessagesScreen.tsx:487 | "Your Coach" while loading | Coach relationship not yet known | "Messages" while loading |
| MessagesScreen.tsx:433 | Review within 24 hours and thanks | Server confirmed report submission; UI has no review timestamp | "Your report has been submitted." |
| MessagesScreen.tsx:191 | "Pull to retry" | Error control only responds to a tap | "Messages could not be loaded. Tap to try again." |
| MessagesScreen.tsx:596-603 | View contact with a chevron when coachId was absent | Navigation handler returned without doing anything | Disable and neutrally label until id exists (rule 2) |
| MessagesScreen.tsx:682 | "Sending" on legacy failed-send row | Send attempt had failed | "Not sent" |
| MessagesScreen.tsx:657 | Start-conversation instruction even on load failure | Conversation emptiness unknown on failure | Instruction only when no error |
| MessageBubble.tsx:82 | Hint lists reply, copy and report for every message | Available actions depend on ownership/deletion/pending state | Neutral "Long press for message actions." |

Real message bodies, dates, coach names, quoted messages, deleted/edited/pinned markers, read/sent receipts, mute durations and coachless-state instructions remain data-backed or instructional. They are retained. No fake attach/voice control was added: neither current screen has such an affordance.

## Routes/actions before -> after

| Screen / action | Before destination or effect | After destination or effect | Evidence |
|---|---|---|---|
| Client / Back (loading, connected, coachless) | goBack | Same | Client V2 parity; coachless render |
| Client / coach header | ContactView with coach id/name/role | Same when id exists; disabled before that | Client V2 parity |
| Client + coach / block entry | ContactView, where block remains | Same route, unchanged contact screen | Client + coach V2 contact assertions |
| Client / Send | Legacy or v2 send; reply id and failure key preserved | Same handler | Client V2 send/reply/retry tests |
| Client / failed v2 send, Send again | Long press, same client-message key | Same | Existing failed-send test |
| Client / Load older | messagesApi.list before oldest timestamp | Same | Client V2 paging test |
| Client / load-error row | Refetch thread | Same, accurately labelled | Client error/retry test |
| Client + coach / Copy | Clipboard.setStringAsync | Same | Client + coach parity tests |
| Client + coach / Reply, cancel | ReplyComposer target, clear target | Same | Client + coach parity tests |
| Client + coach / report, close, reasons, details, submit | ReportMessageSheet and messagesModerationApi | Same; only client's post-success sentence changes | Client parity + existing coach moderation integration |
| Client + coach / Edit, cancel, save | Existing edit sheet and v2 PATCH | Same | Client + existing coach V2 edit tests |
| Client + coach / Pin, unpin | Existing v2 pin routes | Same | Client unpin + existing coach pin tests |
| Client + coach / Delete for everyone | Existing confirmation and DELETE | Same | Client + existing coach V2 deletion tests |
| Client + coach / pinned row | Jump to loaded pin; older-message guidance otherwise | Same | Client pin-row interaction + existing coach test |
| Client + coach / mute, durations, unmute | Existing mute menu and v2 PUT | Same | Client duration + shared menu/coach V2 coverage |
| Client / coach code, sheet close, attach, plan | Existing CoachCodeSheet and coaching plan route | Same | Existing coachless tests |
| Client / Contact support | MoreTab -> SupportInbox | Same | Existing coachless test |
| Coach / Back, client header, send | goBack, ContactView, existing send | Same; coach file untouched | New coach parity + existing coach send tests |
| Shared bubble / parent quote | onPressParent when provided | Same | New shared bubble test |

No route or functional control was removed. The only removed visual element was unsupported online presence (rule 1). Timestamps collapse within a same-sender, same-day, short group; individual Edited/Pinned/Deleted/Pending metadata and receipts remain.

## Documentation and constraints

Client and shared-component READMEs updated. No dependencies, lockfiles, backend, production, navigator or tab changes. No new hex colours, assertion escapes or empty catch handlers. Six labelled client tabs remain. Dark stays hidden, and shared message rendering is exercised against light/dark semantic tokens.

## Test results

| Targeted file | Local result |
|---|---|
| MessagesScreenV2 | 6 pass; main-client baseline first had 3 intended failures / 3 passes |
| MessageBubble | 2 pass (light/dark semantic palette and parent/long-press actions) |
| ClientMessagesScreenV2 | 7 pass |
| ClientMessagesScreen.integration | 3 pass (report submission, block hydration/filtering) |
| MessagesScreenNoCoach | 5 pass |
| MessagesScreenCache | 7 pass |
| quietLuxuryDoctrine | 10 pass |

412 changed lines (300 additions, 112 deletions), including tests and docs. Main merged into the assigned branch again under the operator's README-conflict rule; the Messages entry is edited in place and the new messaging-component entry sits inside the matching module table, not at the end. No device build, production change or deployment.

## Not fixed (needs operator)

The untouched report sheet still states a 24-hour review promise; the backend's report-alert service documents that operational promise and emails support, but this thread UI cannot establish the actual review timing. Default recommendation: operator confirms the operational SLA or routes a narrowly scoped copy-only change without changing emergency/report/block behavior. [Report sheet](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/main/src/components/messaging/ReportMessageSheet.tsx), [report-alert service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/main/src/report-alerts/report-alert.service.ts).

Legacy failed-send retry behavior is outside this frozen send surface; this PR corrects its status copy only. Default recommendation: separate bounded messaging fix if legacy retry is required. [Existing send path](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/main/src/screens/client/MessagesScreen.tsx).
