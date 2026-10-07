# DES-BC-127 — Roman conversations and AI guide

## Scope traced
- Read common brief (including FINISH-after-READY override), the last DES-BC-127 entry, A1 / A2 overrides / A6, design audit sections, guide acceptance rules and ai-guide target.
- Own worktree: `/home/user/workspace/wt/DES-BC-127-mobile`, branch `agent128/des-bc-127`, based on mobile main `c00a2a5f`.
- Exact screens: RomanConversationsScreen, RomanConversationScreen, AIGuideScreen, their tests, and only their existing README entries.
- Frozen: Roman behavior, consent gates, memory switch, hooks, shared copy, API, navigation.
- List endpoint exposes dates/counts/surface only, not first lines. Do not invent previews or fetch private transcript pages just for styling.

## B list
- B1: A client opens Guidance on a normal connection and sees “Working offline” because structured context has not yet been fetched.
- B2: A coachless client opens Guidance and sees unsupported claims about a coach-trained assistant holding their goals, logs and check-ins.
- B3: A client whose send fails offline sees a promise of automatic sending although the implementation only restores a draft.
- B4: A client receives a degraded server reply and sees “offline mode” although a successful network request returned it.

## U list
- Conversation rows and error states use boxed surface fills; guide messages use bubbles, an unrelated GP avatar and small status copy.
- Guide quick prompts and send target need 44pt comfort; neutral speaker labels and theme colors needed in past transcript.

## C one-liners
- First-line conversation previews require an API change outside this visual-only lane; retain real dates/counts.

## PRs
- [Mobile PR #506](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/506), `style(roman): calm conversations and truthful guidance`.
- Local targeted tests pass: conversations 41, transcript 19, guide 10, doctrine 30, copy voice 8, AI refusal surfaces 15 and daily cap surfaces 4 (127 total).
- Failing-first proof: guide suite failed 9/9 against the unchanged original screen before implementation.
- Targeted eslint: 0 errors, 2 pre-existing hook dependency warnings; after main merge guide tests remain green.
- Main merged cleanly at `f240af37`; only own README entries differ from main.
- Current head `477334381f66c3ae80a68c011c58ceedbd321990`, 329 changed lines (185 additions / 144 deletions), 10 files.
- First CI run 37689525434: lint/typecheck/guards pass; tests fail from stale guide placeholder selectors (7 tests in two shared test files) and one unrelated ConnectProviderSheet.importEpoch test. CodeQL green.
- Updating only AIGuide test selectors in aiRefusalClientSurfaces/aiDailyCapSurfaces; no consent/cap logic or other screen clauses changed. Unrelated wearable test is outside exact scope and is not edited.
- Guide integration selectors fixed and both targeted suites pass. Latest fetched main merged without conflict; other README entries preserved. Final batch pushed; CI pending.
- Second CI run 37690326640 and CodeQL run 37690326589 started; GitHub reports MERGEABLE at exact head (14:36 PDT).
- Final verification 14:41 PDT: full Typecheck/lint/test CI and all CodeQL checks SUCCESS at `477334381f66c3ae80a68c011c58ceedbd321990`; GitHub MERGEABLE. `git merge origin/main` is already up to date; working tree clean.
- [FIX ROUND 1 (OPENING) READY comment](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/506#issuecomment-6047421190) posted at that exact head.
- Verdicts: Opus pending / Sol pending. No audit waiting under the top override; no merge, deploy or production change performed.

## Not fixed (needs operator)
- `src/api/romanChatsApi.ts:63` exposes metadata-only `RomanChatSummary`, so requested first-line previews cannot be implemented truthfully without changing the frozen/out-of-scope API/hook. Recommended default: accept real dates/counts for this visual PR; if previews remain mandatory, route a separate API job. No launch blocker added.

## HANDOFF
- FINISHED immediately after READY. PR #506 remains open at `477334381f66c3ae80a68c011c58ceedbd321990`, 329 lines, all CI green, no conflict, audits pending.
- Operator can assign the two lenses at this exact head; FIX lane handles findings and any later conflicts. Builder does not wait or start another job.
- A pre-commit merge was safely rejected because another screen's main README changed; subsequent committed merges succeeded and preserved other screen entries.
- First-line preview limitation is the sole operator routing item: default to real dates/counts; a separate API job is needed only if previews are mandatory.
- Prepared PR body and READY comment saved alongside this report. Notify line written to `ops/lanes128/notify/DES-BC-127.txt`.
