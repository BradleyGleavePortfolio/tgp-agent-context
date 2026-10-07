Tier: T1 mobile
Why: Bounded community presentation and small truthful/loading/focus fixes in three assigned screens.
T4 trigger scan: No auth, tenancy, RLS, money, credentials, destructive data or backend changes. Existing safety/report/block handlers are unchanged.
T3 trigger scan: No new API, dependency, route, navigator, flag or platform integration.
Bounded T1: Three screens, two existing test files and only those screens' alphabetical entries in the existing community README (operator 13:51 clarification); below 400 total changed lines.
Canonical builder: DES-AL-127, agent 128.
Parent owner: Operator agent 128.
Acceptance evidence: Local failing-first screen suite: 4 failed / 15 passed before implementation; current screen suite 22 passed; prerequisite/feed suite 12 passed; coach-message parity 5 passed; unchanged safety component suite 12 passed; post-refresh doctrine 30 passed; Roman truthful-copy guard 2 passed; targeted five-file ESLint clean. All runs through ops/heavy.sh, one Jest file at a time.
Promotion triggers: Any request to add attachment upload, author post deletion, moderation policy, access changes or backend behaviour is routed to the operator, not silently included.

## What changes for coaches/clients
Community has a serif space name and neutral description, readable Inter text, unfilled post rows and reply hairlines. Post composition stays on the bone page with hairline inputs, a real body-character limit and one forest Post action. Reply failures are no longer labelled empty, the first-reply action focuses the existing input, and a published post returns to the feed within 300 ms. Coach-message instructions appear only when a coach exists.

## B/U list
- B1: A member whose replies fail to load is told “No replies yet”, hiding a real failure; show a specific retryable load state instead.
- B2: A coachless member sees a coach-placement promise and a message-your-coach instruction despite having no coach; show neutral workspace absence and conditional coach guidance instead.
- U1: First-reply button ran an empty handler; now focuses the existing ComposerInput handle.
- U2: Calm typography, hairline hierarchy, outline pinned icon and forest primary action replace boxed feed chrome.
- U3: Forced 900 ms success wait becomes 300 ms with factual “Post published.” copy.
- U4: Composer prerequisite failures now explain the disabled submission and expose the existing workspace refetch.

## Routes/actions before -> after
| Screen / label | Before destination or effect | After |
|---|---|---|
| Space / Try again (prerequisite) | Parent retry or community/me refetch | Same |
| Space / Try again (post feed) | posts.refetch | Same |
| Space / Send your coach a message | Home -> Messages, only with coach_id | Same |
| Space / Be the first to post | CommunityComposer, mode post | Same |
| Space / New post | CommunityComposer, mode post | Same |
| Space / Post title/body row | CommunityThread, same postId; pending optimistic post disabled | Same |
| Space / Post safety menu | Same post target, author/viewer/coach identifiers -> existing Report/Block menu | Same, no nesting inside post navigation |
| Space / Voice Record | CommunityVoiceComposer, target hall, same flag gate | Same |
| Space / Voice play, older notes, retry, report/block/delete own voice note | Existing VoiceNotesSection handlers and gates | Same component and props, untouched |
| Thread / Post safety menu | Same target and identifiers, blocked callback goBack | Same |
| Thread / Comment safety menu | Same target and identifiers -> existing Report/Block menu | Same |
| Thread / Each reaction | react.mutate with postId, emoji and active | Same |
| Thread / Be the first to reply | Dead empty callback | Wired to focus; rule 2 |
| Thread / Reply input / Send | Same 2,000-character limit and addComment mutation; rejected draft restored | Same |
| Thread / Try again | Not previously present | Added comments.refetch |
| Composer / Post title/body | Same title 200, body 20,000 limits | Same; Inter, hairline inputs |
| Composer / Publish (now Post) | Same createPost mutation, same title/body payload, confirmation then goBack | Same effect, 300 ms confirmation |
| Composer / Message body / Send | Same 4,000-character limit, sendDm mutation then goBack | Same |
| Composer / Try again | Not previously present | Added community/me refetch |
| Composer / Rejected text or send failure | Same describeCommunityFailure and retained field draft | Same |
| All / Native back gesture/navigation | Existing navigator | Untouched |

Screen parity is exercised in communityScreens.test.tsx and CommunitySpaceScreen.test.tsx; report/block/delete voice behaviour is covered by the unchanged SafetyMenu tests. Attachments and own-text-post deletion do not exist on these three screens at the traced base; no pathway was removed and no unsupported/destructive operation was invented.

## Truthful sweep (base file:line)
| Location | Before | What is actually known | Replacement |
|---|---|---|---|
| CommunitySpaceScreen.tsx:212-214 | noCohorts stem: “Your coach will place you in one”, “No cohort yet” | community/me reports no workspace, not promised placement or a coach | “No community space yet” / “No community space is available.”; coach message action still conditional |
| CommunityThreadScreen.tsx:65,116-118 | A replies error selected “No replies yet” and threadEmpty copy | Failed query is not evidence of zero replies | Distinct loading / specific failure with retry / genuine empty states |
| CommunityComposerScreen.tsx:96 | postPublished: “Well said. The Hall has it now.” and dry praise variant | A post mutation succeeded; no quality judgment is known | “Post published.” |
| CommunityComposerScreen.tsx:167-168 | “Your coach has not opened a community space yet… Message your coach…” | Workspace absent; the member may have no coach and cause is not known | “No community space is available, so this cannot be shared.”; Home instruction only with coach_id |
| Space / Hall and cohort empty stem bodies | Personalized pressure to start conversation | Successful zero-post query | Keep the true title and functional first-post action; remove unnecessary quip/avatar decoration |

Other factual labels, counts, errors and input prompts stay word for word except “Publish” -> “Post”, a shorter label for the same effect.

## Documentation and boundaries
Updated all three owned files' module documentation and their own entries in the community README, which arrived in the final main refresh. Entries are alphabetical before the existing Today text, not appended, following the operator's 13:51 README clarification. No other screen's documentation was changed.
No screenshots/on-device claim: acceptance here is source inspection, rendered component tests and CI.
No merge, deployment, store build, production write, spending, flags or backend changes.
