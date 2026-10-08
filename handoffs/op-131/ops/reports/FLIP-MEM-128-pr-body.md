**Merge and apply only after deploy 25 (which carries b#844 and b#845) is live.** Production today is deploy 24 (0d179edb): there, memory off still deletes Roman's notes and the policy lacks the b#844 text.

**Tier:** T4 (AI egress of client health and chat data; production flag).
**Why:** owner 14:25, decision 1 (verbatim): "turn on memory and the coach playbook as soon as the coach wording is live; recommended yes". Turns on Roman's memory (FEATURE_ROMAN_MEMORY). Every piece is merged on main 675242fd: R11-M4 notes writer b#832, R11-M5 memory block b#834, R11-C2B v5 consent b#835, R11-C2C memory off keeps notes b#845, policy text b#844; mobile m#461 (box 2 grants v5) and m#463 (Settings switch) on mobile main.
**T4 trigger scan:** PII/health data to the AI provider: yes (flag gate only, no code change). Consent: the flag also makes the server offer the v5 ('memory') copy. Money: no code change; existing metering applies. Auth, RLS/tenancy, credentials, destructive data, migrations: none.
**T3 trigger scan:** production config manifest; the CI manifest specs.
**Bounded T1:** none.
**Canonical builder:** FLIP-MEM-128 (agent 128, Claude Opus 5.5; job FLIP-MEM-PB-128).
**Parent owner:** operator agent 128. The operator merges and applies this after deploy 25 is live.
**Acceptance evidence:** precondition table below (file:line on main 675242fd); R11-INT-AUD-128 verdict MEMORY = GO after deploy 25; `test/ci/fly-env-manifest.spec.ts` 69/69, `test/roman/r11-seams.spec.ts` 21/21, `test/ci/fly-env-workflows.spec.ts` 15/15, `test/ci/fly-env-sync-behavior.spec.ts` 56/56 pass locally (heavy.sh).
**Promotion triggers:** none. No code changes. Kill = unset (the code default is off).

## What changes for coaches/clients
- Clients: the Roman tick in the consultation (box 2) and Settings > Roman AI now offer the memory wording (client-ai-v5). A client who allows it gets a Roman who remembers short notes from their own Roman chats (preferences, circumstances, what they said about their training) and uses them in later answers. Clients who agreed earlier (v4) stay without memory until they turn it on themselves; their consent is not presumed. Turning memory off stops Roman reading or writing notes and keeps the notes; deleting the account erases them.
- Coaches: nothing visible changes. Coaches never see Roman's notes. The notes writer is part of the client's own Roman use and draws on the head coach's monthly AI pool (small: Haiku, bounded by the platform background cap of 10 USD a day).
- The app works with today's build: the switch and box 2 show the v5 text only while the server sends `memory_on` and the v5 copy; older builds keep showing the v4 text and never grant v5 (memory stays inert for them).

## B/U list
- B: none in this PR. Ordering B from R11-INT-AUD-128: memory must not be applied before deploy 25 (see the line at the top).
- U (from R11-INT-AUD-128 U2, not in this PR): the memory augmenter reads a v4/memory-off client's notes from the database before the scope check drops them (`roman.service.ts:1031-1035`); nothing is sent or shown. Smallest fix: read `consentedClients(memory)` first and skip augmenters without it (~5 lines, FIX lane).
- C (edge, deferred to 10k clients): older app builds cannot grant v5, so memory stays off for them.
- C: the memory helper says notes come "from chats and logs"; the writer reads only chats (owner wording, true as a superset).

## Precondition check (main 675242fd)
| Precondition | Evidence |
|---|---|
| b#845 merged: memory off keeps notes | merged as 1427f124; `ai-consent.service.ts:304-306` (a v4 grant by a v5 holder appends the grant and keeps notes, unread without 'memory'); chat deletion keeps notes: `prisma/schema.prisma:8734` source_message onDelete SetNull |
| b#844 merged: policy names Roman's inputs | merged as e6b4ea47; `public-pages/trust-pages.html.ts:212`, `:269-271`, `:309`, `:433` (notes and summaries, kept until account deletion including while memory is off, deleting a chat keeps them) |
| b#850 R11-L3 (coach-method wording) | merged on main 9d23137d, not yet deployed. It concerns the coach playbook, not memory; the playbook flip is its own PR (#855) |
| m#461 + m#463 merged | mobile main 4185b9b2 contains 62bc9c34 (m#461) and 11d433bc (m#463); `src/api/aiConsentApi.ts:81`, `:183` read `memory_copy`; `src/components/ai/__tests__/AiConsentSheetMemory.test.tsx:84` |
| 'memory' scope only for client-ai-v5 | `ai-consent.service.ts:151-170` (grantScope / isMemoryGrant: a live v5 grant with the exact sha256); v5 offered only while the flag is on: `:265`, `:286-288` |
| Turn reads only with v5 | `roman.service.ts:1035` and `:1328-1344` (any applied block needs a live 'memory' grant, else every block is dropped and the send stays 'base'); egress gate re-checks v5 at send |
| Notes writer only for v5, only own chats | `roman-notes.writer.ts:63` (flag + provider), `:79-80` (consented 'memory' clients and their grant times), candidate query `:65-76` (own user turns in non-deleted client sessions) |
| Account deletion erases memory | `account-deletion.manifest.ts:243-245` (RomanClientNote, RomanClientSummary, RomanMemoryState) |
| Kill switch | `roman/memory/roman-memory.feature.ts:14-16` (only exact `true`); off = writer returns first (`roman-notes.writer.ts:63`), augmenter null (`roman-client-memory.augmenter.ts:75`), no v5 offer (`ai-consent.service.ts:286-288`) |
| Audit verdict | R11-INT-AUD-128 (14:27): MEMORY = GO after conditions (deploy 25 live). U2 optional |

## Diff (3 files, +6/-5)
- `.github/fly-env-desired-state.json`: `"FEATURE_ROMAN_MEMORY": "unset"` -> `"true"`, and its gates note.
- `docs/runbooks/launch-flags.md`: the FEATURE_ROMAN_MEMORY paragraph. The kill-switch table row stays as it is on purpose: it is generated from the code default (`unsetIs: off`, kill = unset) and `fly-env-manifest.spec.ts` fails if it changes (same as FEATURE_MWB_AI_LIVE_CREATE and b#851).
- `test/roman/r11-seams.spec.ts`: one assertion now expects `true` for FEATURE_ROMAN_MEMORY. Without it the flip fails CI. Merged with main c500847b (b#849, b#850, b#851 TOOLS): the assertion is now a list of declared-on flags (TOOLS, MEMORY); #855 needs the same one-line merge after this one.

Builder: agent 128 (FLIP-MEM-PB-128).
