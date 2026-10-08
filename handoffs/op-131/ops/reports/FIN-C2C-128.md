# FIN-C2C-128 (Claude Opus 5.5, builder, T4 consent) — agent 128

Started 13:11 PDT 10-07.

## Scope traced
- backend#845 (agent127/r11-c2c-127 @ b8883e82): diff reviewed. ai-consent.service.ts: the v4-over-v5 delete-first path, `eraseMemory`
  and its 503 are removed; manifest helpers `ROMAN_MEMORY_MODELS` / `romanMemoryErasureEntries` / `eraseRomanMemory` removed (no other
  users on main 0d179edb). Tests: ai-consent-memory-default.spec.ts (memory tables' writes throw and count; off keeps notes; on again
  in scope; full withdrawal keeps notes; non-v5 v4 grant touches nothing); roman-memory-erasure.spec.ts runs the real
  executeErasureManifest (client's notes/summaries/state go, nobody else's). 4 files +157/-122 = 279 lines. Branch is 7 behind main,
  no conflicts, branch protection not strict -> chose re-run of the cancelled community-live-tests job (cheapest) over a merge push.
- mobile#463 (agent127/r11-c2b-127-switch @ 7e67482a): merged origin/main d0875d26 (clean, no conflicts; #461/#459 lines drop out).
  Copy in src/screens/settings/RomanAiConsentScreen.tsx said turning memory off deletes notes (helper, confirm body, done notice) and the
  Turn off button was styled destructive. No separate delete-notes control exists anywhere in src (rg).

## B list
- B1 (false customer-facing claim, owner ruling 11:46) mobile#463: helper "Turn off to stop and delete them", confirm "the notes he has
  about you are deleted", notice "his notes about you are deleted". Once b#845 is live this is false. Fixed: owner helper verbatim;
  off confirm/notice true on both backends (neither "deleted" nor "kept").
- B2 (backend#845, owner ruling) memory off deleted notes — fixed in #845 by agent 127, verified by review.

## U list
- U1 mobile#463: Turn off was a destructive (red) alert button; nothing is deleted now -> default style.

## C one-liners
- none.

## PRs
- backend#845: head b8883e82ccc5a6d6eeff2dd20c46d98f0d3f8bfd (unchanged), 279 lines. community-live-tests re-run 13:11 -> SUCCESS 13:16;
  all 15 checks green (deploy-readiness-gate skipped). Both specs PASS in build-and-test log. FIX ROUND 1 (OPENING) READY posted 13:17
  (issuecomment-6046058613). Verdicts at b8883e82: Sol APPROVE 13:19, Opus APPROVE 13:20 (B none). DONE.
- mobile#463: merged origin/main (62f1fe6f), tests-first 6791b948, fix 4b10158406eaae139b73e64ee63b920a7a3ad229, pushed 13:19.
  5 files +374/-124 = 498 lines vs main. PR body rewritten (tier header, compat note, parity table, truthful sweep, B/U).
  Copy: helper = owner wording; off confirm "Roman stops keeping and using notes about you. Roman and AI stay allowed. You can turn
  it on again at any time."; notice "Roman's memory is off. Roman no longer uses his notes about you." (true on deploy 23 and on #845).
  Turn off no longer destructive style. Not run locally (deps/mobile not READY). CI at 4b101584: Typecheck, lint, test SUCCESS
  (RomanAiMemoryOffer PASS), CodeQL SUCCESS. FIX ROUND 2 READY posted 13:27 (issuecomment-6046223761). Verdicts at 4b101584: Sol APPROVE 13:30, Opus APPROVE 13:30. DONE.

## Not fixed (needs operator)
- Ordering (both lenses): merge/deploy b#845 and the policy text (b#844, FIN-L2-128) before FEATURE_ROMAN_MEMORY is set. Checked: the
  server v5 paragraph (backend src/ai-consent/ai-consent.constants.ts L102-104) says chats keep notes and account deletion removes them;
  it never says memory off deletes them, so no backend copy change is needed.
- Privacy policy trust-pages.html.ts L270/L271/L433 settings-delete wording: owned by FIN-L2-128 (b#844) per JOBS128.

## HANDOFF
- Mobile worktree /home/user/workspace/wt/FIN-C2C-128-mobile (branch agent127/r11-c2b-127-switch).
- DONE 13:31: both PRs dual APPROVE at current heads; operator merges. (Old next step, kept for history: mobile#463 CI green at 4b101584 -> post `FIX ROUND 2 (R11-C2C-127, agent 128) — growth-project-mobile#463 @ <sha> — READY FOR AUDIT`;
  then poll both PRs every 5 min up to 75 min for AUDIT Claude Opus 5.5 / AUDIT GPT-6.1 Sol at the exact heads.
