**Tier:** T4 (AI egress of client health data; production flag).
**Why:** turns on Roman's read tools (FEATURE_ROMAN_TOOLS). All pieces are merged on main 675242fd: R11-T1 #840, R11-T2B #838, R11-W1 #842, R11-T1b #843, R11-T3 #846, policy text #844.
**T4 trigger scan:** PII/health data to the AI provider: yes (flag gate only, no code change). Money: no code change; the existing spend metering applies (checked below). Auth, RLS/tenancy, credentials, destructive data, migrations: none.
**T3 trigger scan:** production config manifest; the CI manifest specs.
**Bounded T1:** none.
**Canonical builder:** FLIP-TOOLS-128 (agent 128, Claude Opus 5.5).
**Parent owner:** operator agent 128. The operator merges and applies this only after deploy 25 is live (deploy 25 carries #843, #844, #846, #848 and R11-T3-FU #849, which is still in review).
**Acceptance evidence:** the precondition table below, with file:line on main 675242fd; `test/ci/fly-env-manifest.spec.ts` 69/69 and `test/roman/r11-seams.spec.ts` 21/21 pass locally (heavy.sh).
**Promotion triggers:** none. No code changes. Kill = unset (the code default is off).

## What changes for coaches/clients
- Clients: when a client asks Roman about their own past, for example "how did my bench press change", "what did I eat last Tuesday" or "how have I slept for three weeks", Roman can look it up in that client's own logs before he answers. He no longer has to say he cannot see that day. The app looks the same and nothing on mobile changes.
- Coaches: nothing changes. Coaches see none of this. Tool turns cost more AI credit from the coach's monthly pool (up to 4 model calls per turn instead of 1).

## B/U list
- B: none. U: none.
- C (edge, deferred to 10k clients): a turn with the full 3 tool rounds and long thinking could come close to the app's 60 s send timeout (mobile `src/api/romanApi.ts:488`; loop wall 25 s, `roman-tool.types.ts:66`). If it times out, the reply is still saved and the chat shows it when reloaded.

## Precondition check (main 675242fd)
| Precondition | Evidence |
|---|---|
| Tools only on student turns | `roman.service.ts:1018` grounded = client surface AND role student; `:1039` toolsTurn only when grounded with a bundle; `:1280-1281` flag + toolbox + provider; `tools/roman-read-tools.ts:211` any non-student caller gets not_allowed |
| Subject = caller only | `roman-tool-loop.ts:195` runs every tool for `deps.caller`, which is the session caller (`roman.service.ts:1300-1301`), never an id from the model; `roman-read-tools.ts:228` `at.id = caller.id`; strict zod inputs (`:54-58`), so a `user_id` key is bad_input; timeline `message` kind = this client's thread with the current coach only, `booking` never coach_notes_md (`memory/roman-timeline.reader.ts:607-665`) |
| Per-turn budget | `ROMAN_TOOL_LIMITS` (`roman-tool.types.ts:62-68`): 3 rounds, 6 calls, 12,000 chars a result, 25 s wall, 3 s a tool; last call is `tool_choice: none` (`roman-tool-loop.ts:127-128`) |
| Per-day budget, right pool | daily reservation covers every call: `(max_rounds+1) * roundBound` input and `(max_rounds+1) * max output` (`roman.service.ts:1060-1068`, `roundBound` includes 6 x 12,000 chars of tool results); coach-pool pre-check needs 4 worst-case turns for a student (`roman.service.ts:1597-1603`); one settle and one debit of the summed usage (`:1070-1078`, `roman-tool-loop.ts:141-145`) |
| No unmetered model call | every loop call goes through `egress.anthropicMessagesCreate` with the turn's subject (consent gate, `ai-egress.service.ts:333-345`, `roman.service.ts:1303-1319`); usage is summed; a failed call counts its full bound (`roman-tool-loop.ts:158-175`); refusal settles what was answered (`roman.service.ts:1146-1151`) |
| Result clamp | `roman-tool-loop.ts:198` `content.slice(0, max_result_chars)`; tools also cap their own JSON with `truncated` (`roman-read-tools.ts`, fitToolJson) |
| Reply check active | `postCheckRomanReply` runs on the loop's final text, with the past-day facts the tools returned (`roman.service.ts:1196-1201`, `withToolFacts` `roman-tool-loop.ts:222`); #849 (in review) refines it and ships in deploy 25 before this flag is applied |
| Policy names every data kind | `public-pages/trust-pages.html.ts:269` (food, water, habits, workouts and workout history, check-ins, bookings, wearable/health/sleep, coach messages, own posts) and `:269`/`:463` (fasting, earlier Roman chats, daily device health; never raw heart rate). This covers every kind in `ROMAN_READ_HISTORY_KINDS` (`roman-read-tools.ts:40-43`, `roman-extra-history.ts:19`) plus exercise_history, food_day and personal_baselines |
| Kill switch | `tools/roman-tools.feature.ts:14-16`: only exact `true`; unset = off; prompt sections added only when `tools` (`roman.prompts.ts:165`); flag-off turn = one stream with no tools field (`test/roman/r11-tool-loop.spec.ts:179`); `r11-seams.spec.ts` checks the flag values |
| Toolbox provided | `roman.module.ts:63-65` (`ROMAN_TOOLBOX` useExisting `RomanReadToolbox`) |
| No mobile change needed | the client still gets one delta and one done frame (`roman-tool-loop.ts:1-4`, `roman.service.ts:1242-1243`); mobile reads the reply as one buffered body (`src/api/romanApi.ts:470-488`); the box-2 consent copy says "your information is sent to Anthropic" and "only your own data is used" (mobile `src/lib/consultation/copy.ts:41-42`), and the tools keep both true |

## Diff (3 files, +5/-4)
- `.github/fly-env-desired-state.json`: `"FEATURE_ROMAN_TOOLS": "unset"` -> `"true"`, and its gates note.
- `docs/runbooks/launch-flags.md`: the FEATURE_ROMAN_TOOLS paragraph. The kill-switch table row stays as it is, on purpose: the row is generated from the code default (`unsetIs: off`, kill = unset) and `fly-env-manifest.spec.ts` fails if it changes. FEATURE_MWB_AI_LIVE_CREATE does the same.
- `test/roman/r11-seams.spec.ts`: one assertion now expects `true` for FEATURE_ROMAN_TOOLS. MEMORY and PLAYBOOK stay `unset`. Without this change the flip fails CI.

Builder: agent 128 (FLIP-TOOLS-128).
