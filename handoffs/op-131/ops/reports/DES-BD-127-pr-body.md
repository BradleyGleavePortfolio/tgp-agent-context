Tier: T1 mobile UI/copy
Why: Four secondary reading screens need calm hierarchy and data-backed copy without losing actions.
T4 trigger scan: None. No auth, tenancy, money, credentials, destructive operations or permission changes.
T3 trigger scan: None. No backend, schema, contract, navigator or shared-component changes.
Bounded T1: Assigned screen presentation and truthful empty/error variants only; existing API calls, flags and handlers remain.
Canonical builder: DES-BD-127, GPT-6.1 Sol, agent 128.
Parent owner: Operator agent 128.
Acceptance evidence: Local failing-first education proof (3 failed, 4 passed); final targeted education, guidelines, path and timeline coverage (30 passed); copy voice guard (8 passed), doctrine/truthful surface guard (30 passed); scoped lint 0 errors, 4 pre-existing timeline warnings. Initial CI typecheck exposed a readonly imported flag in a test; its mutable Jest fixture is now used, and learning/timeline retest passed all 15 tests. All local runs use ops/heavy.sh.
Promotion triggers: Any change to permissions, API contracts, payment handling, navigation or shared trust components needs operator routing; none introduced.

## What changes for coaches/clients
Learn has monochrome article rows, recorded dates, readable metadata, real completion counts and quiet secondary lesson links. Timeline retains its four lanes and real dated events with neutral filters and explicit lane names instead of category-colored dots. Guidelines show their supplied title and Added date, not a made-up workout plan or update date. Path empty states no longer promise future AI suggestions or coach reviews. Each changed screen uses semantic theme colors, without cream card fills or new animation.

398 changed lines including tests and the two existing README entries. No new dependencies or lockfile edits. Six tabs, hidden dark launch mode and current production API contracts remain unchanged.

## B list
- B1: A client opening Learn sees every lesson labelled Featured even though lesson data has no featured status. Removed under rule 1.
- B2: A client reading guidelines sees an invented workout-plan title and Last updated date derived only from creation time. Show supplied title/fallback Guidelines and optional Added date.
- B3: A client opening Path is promised suggestions and coach review that the current adapter cannot provide. Neutral variants now describe only returned data.

## U list
- U1: Empty timeline copy falsely singles out weight logging despite four event lanes. It now describes the selected filters.
- U2: Category colors, small labels and filled boxes compete with reading. Hairlines, monochrome data, 44-point controls and Inter reading copy keep existing information/actions.
- U3: A path request failure previously escaped the loader. It now names the failed data and retains pull-to-refresh without falsely claiming empty suggestions.
- U4: Guidelines previously displayed raw exception text. It now names guidelines and gives a connection/retry instruction.

## Routes/actions before -> after
| Screen | Label/action before | Destination/effect before -> after |
|---|---|---|
| Learn | All / each category | Clear or toggle category filter -> same; role and selected state now explicit |
| Learn | Each lesson row | Open selected lesson detail -> same |
| Learn | Pull to refresh / Retry after load failure | Reload lessons and completion progress -> same |
| Lesson detail | Back arrow | Return to lesson list -> same, now labelled Back to lessons |
| Lesson detail | Watch lesson | Open provided video URL -> same, styled as secondary link |
| Lesson detail | Read article | Open provided article URL -> same, styled as secondary link |
| Lesson detail | Mark as Complete | Save server completion, update state/cache on success -> same, sentence-case Mark as complete; saving disabled state retained |
| Timeline | All / Body / Wins / Coach / Friction | Reset or toggle lane query -> same |
| Timeline | Pull to refresh | Reload first page -> same |
| Timeline | End-of-list paging | Fetch next cursor -> same |
| Timeline | Retry | Reload after API failure -> same |
| Path | Pull to refresh | Reload adapter payload -> same; existing feature gate unchanged |
| Coach guidelines | Back arrow | navigation.goBack() -> same, now labelled Back |
| Coach guidelines | Retry | Reload guideline request -> same |
| Learn | Featured badge (not tappable) | Removed under rule 1: no featured field backs the claim |

Native stack back and every navigator destination remain unchanged; no navigator files are edited. Render tests exercise both lesson links, list/detail/back/filter/completion/error, every timeline lane, refresh/paging/retry, guidelines back/retry and Path refresh/flag on/off/nonempty/error.

## Truthful sweep (original base-main line numbers)
| File:line | Unsupported original wording | Data actually available | Replacement |
|---|---|---|---|
| EducationScreen.tsx:139 | Ask your coach for a working link | Link-opening failure; coach relationship not known | The lesson video/article could not open. Try the link again. |
| EducationScreen.tsx:168 | n min read | Duration only, not media type | n min |
| EducationScreen.tsx:201 | Ask your coach to add it | No content or links; coach relationship not known | No lesson content or links are available. |
| EducationScreen.tsx:353 | Your coach hasn't published any lessons; future promise | Empty returned library, not coach state | No lessons available. Pull down to refresh. |
| EducationScreen.tsx:388 | Featured on every row | No featured status | Removed |
| EducationScreen.tsx:289 | Progress shown as 0 while loading/failed | Counts not yet loaded | Count/bar shown only after a successful nonempty load |
| TimelineScreen.tsx:224 | Timeline starts with first weight | Body, wins, coach and friction event lanes | No entries match these filters. |
| ClientPathCopilotScreen.tsx:68-69 | Preview-only / in development | Existing feature flag is off | Your path / Path suggestions are not available on this account. |
| ClientPathCopilotScreen.tsx:96 | AI summarises what you logged; your coach decides | Payload may be empty; no coach lookup | Suggestions and submitted progress. |
| ClientPathCopilotScreen.tsx:102-107 | Data not yet live | Payload is stale, which can include existing suggestions | Latest path data is unavailable. Pull down to refresh. |
| ClientPathCopilotScreen.tsx:118 | Log a few days and suggestions/coach response will follow | Current adapter returns no suggestions | No suggestions are available. |
| ClientPathCopilotScreen.tsx:137 | Submit a milestone and coach will sign off | No submitted rows, no submission action or coach lookup | No progress submissions are waiting for review. |
| CoachGuidelinesScreen.tsx:93-95 | Your Workout Plan / Last updated created_at | Guideline title, description and created_at | Supplied title or Guidelines; optional Added created_at |

All real titles, lesson content, completions, event dates/bodies and returned approvals/submissions remain. Milestones render only from returned events or submitted rows; none are seeded.

## Documentation and limits
CI follow-up: typecheck/lint passed and 9,098 tests passed; the sole Wave-11 path test needed semanticColors in its existing theme mock. That fixture is now updated and its targeted 26 tests pass.
Only the existing EducationScreen and CoachGuidelinesScreen README entries were edited, including notes for the two associated reading screens. Main was merged cleanly before push. No deployment, production change or merge is requested by this builder.
Shared AINote/VerifiedProgressRow retain their existing styles because they are outside this exact file list; no shared component was changed. Device screenshot validation is not claimed.
