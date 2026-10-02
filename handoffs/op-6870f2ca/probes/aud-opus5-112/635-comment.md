AUDIT Claude Opus 5.5 — growth-project-backend#635 @ 9c5ae5efec13807a62bc39d40800b66e6bbeade9 — VERDICT: APPROVE

Lane AUD-OPUS-5 (operator 112). T4 DELTA audit from my APPROVE at `c2688010` ([5959942798](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635#issuecomment-5959942798)). I read Sol's RC [5960268631](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635#issuecomment-5960268631) and fix round 3 [5960866087](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/635#issuecomment-5960866087). Result: A0 B0 C3 (C-635-4 carried, C-635-5 and C-635-6 new).

**Delta c2688010..9c5ae5ef**
- Fix `5d1bf809` touches 7 files: `src/roman/{roman.service,roman-chats.controller,roman-chats.query (new),roman.constants,roman.dto}.ts`, `test/roman/roman-chats.controller.spec.ts` and `docs/roman-chat-deletion.md`.
- `9c5ae5ef` merges main `f04289f9` (#607), and the merge is pure. `git merge-tree --write-tree 5d1bf809 f04289f9` gives `a5812ca3c524153d819b07e9a77fa061ce85e086`, which equals the head tree, so there are no hand edits.
- The delta has no change to `src/ai-consent`, the ledger, consent copy or version, any migration, schema, workflow or dependency.

**Sol's findings at c2688010**
- **B-635-4: CLOSED.** `deleteSession` and `deleteAllSessions` now wrap the whole operation (`progress.stage` read / erase / count). Coded HttpExceptions pass through, including the 404, the verified-erase 503 (its tx rolled back) and the bound-hit 503. Everything else goes to `eraseFailure`, which logs and Sentry-captures `safeDiagnostic`, never ORM text. It answers 503 `ROMAN_ERASE_INCOMPLETE` with no `cause`, so the filter keeps the coded body.
  - The single-delete copy is honest about what is known: a read failure says "not changed", and an erase-tx failure says "could not confirm ... Deleting it twice is safe".
  - Mobile #331 `romanChatsCopy.ts:161-167` maps this code to neutral copy, so its wording holds for both cases.
- **B-635-5: CLOSED.** `GET /roman/sessions` takes a plain-object `@Query()`, which the global ValidationPipe does not validate. `parseListSessionsQuery` validates it as strictly as the old DTO:
  - only the keys cursor, limit and surface are allowed, each as a single string;
  - `limit` must match `^\d{1,3}$` and be 1..100;
  - `surface` must be client or coach;
  - `cursor` may be at most 64 characters;
  - an own-property `__proto__` key is rejected as unknown.
  
  Each case gets a coded 400 with copy that is specific and gives a next step, and the service is never called. `ROMAN_SESSIONS_QUERY_INVALID` is documented in `docs/roman-chat-deletion.md` and is already mapped by mobile #331 (`romanChatsApi.ts:164`).
- **C-635-4 (carried, optional):** deferral accepted. The fix needs `sub_coach` in `AppRole`/RolesGuard, an app-wide auth change. Route it to a separate PR.

**The new tests fail before and pass after.** In my worktree I put `roman.service.ts`, `roman-chats.controller.ts` and `roman.dto.ts` back to c2688010, kept the head's constants and query module, and ran the head's `roman-chats.controller.spec.ts`:
- 18 new cases FAIL: the 12 B-635-5 query cases and 6 of the 7 B-635-4 real-service cases. The two delete routes return uncoded 500s, as Sol reported.
- The 404/204 control passes.

At the head, `ops/heavy.sh env CI=false npx jest --runInBand --forceExit --runTestsByPath test/roman/{roman-chats.controller,roman.service,roman-erasure.sweep,roman.controller}.spec.ts` plus Sol's unmodified probe (`backend635-independent-http-errors.spec.ts`) gives **5 suites / 121 tests PASS**. The wire output matches: `503 ROMAN_ERASE_INCOMPLETE` "could not confirm ...", the delete-all copy, and `400 ROMAN_SESSIONS_QUERY_INVALID`.

**No regression in consent or retention:** the delta touches no consent, ledger, egress or retention code. Erase semantics are unchanged: per-row commits, idempotent repeat, verified erase, the cap is kept, and the sweep is untouched. Existing codes are stable (`ROMAN_SESSION_NOT_FOUND` 404, `ROMAN_ERASE_INCOMPLETE` 503, `ROMAN_CURSOR_INVALID` 400), and one code is new.

**CI at head:** 10/10 required checks are SUCCESS.
- build-and-test, run 37060221245:
  - attempt 1 failed only `test/ci/release-evidence-gate.spec.ts`, which has nothing to do with Roman;
  - attempt 2 passed 657 suites / 11,432 tests.
- The Roman live erase spec (real Postgres, mwb-3-live-tests job) passed 11/11, including the NOBYPASSRLS control.

**New findings (optional)**
- **C-635-5:** every unexpected delete failure creates two Sentry events. One is the sanitized diagnostic from `eraseFailure` (`roman.service.ts:417-432`, tags op/stage, but no `request_id`). The other is the filter's 5xx capture of the 503 (`http-exception.filter.ts:73-81`, which has `request_id`). Support cannot join the root cause to the user's reference ID. Minimal fix: set `request_id` on the Sentry isolation scope in RequestIdMiddleware (or pass it to `eraseFailure`), or skip the filter capture for already-reported codes.
- **C-635-6 (comments only):** two code comments no longer match the code.
  - `roman.constants.ts:76` says `ROMAN_ERASE_INCOMPLETE` means "nothing of that chat was removed", but that is now false for the unconfirmed case and for delete-all.
  - The `ROMAN_ERROR_SESSIONS_QUERY_INVALID` comment (L82) says "The message names the parameter and the accepted values", but the unknown-parameter copy names neither.
  
  Separately, line 8 of the tier header still points to "Acceptance evidence (head c2688010)", although a section for 9c5ae5ef exists at L53.

**Tier header:** T4 is correct (consent copy and version, destructive erase), and the fix-round 3 table is present with commits and tests.

**Outside this diff / merge**
- main requires up-to-date branches (strict) and is now `5d1f224a` (#644, diagnostic quiz off). `git merge-tree --write-tree 9c5ae5ef 5d1f224a` is clean (tree `e193eb50bee1e97246f5639f074573f0d7b553f2`), and #644 touches no Roman, consent or migration file. A pure update-branch carries this APPROVE if the merge tree equals e193eb50 and the 10 required checks are green.
- Release boundary unchanged: deploy #635 before any mobile build that carries #310/#326 (client-ai-v4). Mobile #331 is the delete UI. "Or your account" needs #608 live, and Roman export coverage stays with B-EXPORT.
