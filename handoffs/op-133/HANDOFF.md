# Operator agent 133 — HANDOFF (2026-10-08, safe stop from 18:57 PDT)
Owner 18:53: "40k/45k used - stop-and-drain to zero starting now - let work finish as normal, start no new work".
Owner 18:57: "get all agents to a safe stop and update tgp source of truth with their handoff lcoations". No agent cancelled
(owner 18:26 "no cancel no agents ever"). Decisions: Source of Truth A6.13. Story: Source of Truth Part B, AGENT 133.

## State at 19:0x PDT (verify on GitHub first)
- Production backend = e261ce5e (deploy 7, 18:51: b#892), deploy 6 bf6f6a94 (18:31: b#890 + b#891, additive migration
  ClinicProgramSet.is_house). /health ok, /readyz db up. No flag changes by agent 133.
- Merged today 45 (agent 133: backend b#890 b#891 b#892; mobile m#577 m#583 m#584 m#585 m#586 m#587 m#588 m#589 m#591 m#593
  m#594 m#595 m#596 m#598 m#599 m#600 m#608 m#610 m#611). m#578 merged into its stacked base only (re-landed as m#587).
- NO build 8 yet. BUILD GATE (A6.13 item 10): every PR below merged, backend deployed, then Android clinic-apk + iOS clinic from a
  clean mobile main worktree with the owner's Expo token ("Expo access token (EAS builds)", not attached to the 133 session).

## Open PRs (all READY or in review at these heads unless noted; dual APPROVE at exact head, then ops/merge_if_dual.sh)
- m#580 @5bbf607b every new client to the consultation; lean flow never mounted; consultation + tutorial flags in every store
  profile (RootNavigator.tsx and eas.json pushed by agent 133 at 18:14 after agent 132 gave no answer). No verdicts yet.
- m#579 @f2facf5d consultation 03-36 to the prototype; m#581 (stacked on consult-parity-133) reveals 37-45: retarget to main after m#579.
- m#603 (base main) -> m#604 -> m#605 -> m#606 (stacked): the 7-beat tour. Merge in order, retarget each to main.
- m#590 @a06da58d every radius rounds, grey hairline, Haptics switch; m#607 stacked on it (radius.sm + nativeCardUpdate test,
  OK given by agent 133 holding agent 132's files): retarget to main after m#590.
- m#582 @cb675bbe lane-133 screens off react-native SafeAreaView. m#592 @baca8de0 Before Roman answers (B32). m#601 @9d65c99d Roman
  room (B30). m#602 @fdf12cf8 Roman prose + portrait (B27). m#597 @8113ab85 Food log page: HAS MERGE CONFLICTS (builder asked to
  merge main at 19:00; check). m#609 @ea9aba95 coach Settings. m#612 @6fa49b1e session detail + Community Today. m#613 @dd6fbe2b
  Privacy > Roman (prototype 74).
- Agent 132 leftovers (agent 132 out of credits 18:25; nobody has reviewed them): m#576 @22919982 coach setup edges (B01 B05 B06 B08
  B09 B10); b#888 @9f4d3753 coachless clients use every client feature (B23 B24; CodeQL check FAILING); b#889 @3c3eb99d no-store API
  cache (B07 B38).

## First moves for the next operator
1. Read this file, Source of Truth A6.13 and Part B AGENT 133, then handoffs/op-132/COORDINATION.md (last lines).
2. Re-launch lenses (Opus + Sol) on the open PRs above; merge with ops/merge_if_dual.sh; deploy backend merges with
   handoffs/op-131/ops/deploy_when_green.sh (apply-migrations only if prisma changed).
3. Start the not-started register items, worst first: B35-B37 the app never opens (Locked + endless spinner; START-HANG-132 never
   opened a PR); then the same Nest no-token bug in messaging.service.ts:146 (message safety) and :158, ai-approval.service.ts:105,
   login-throttle-reset.service.ts:90; ci.yml: add the two Roman live DB tests to mwb-3-live-tests.
4. House programs: seed only after the mobile coachless copy lands (133-9); steps in reports/CONSULT-ALL-BE-133.md; owner's own
   account is the house account (133-10); coachless flagged screenings alert the owner (133-11) — not built.
5. When the BUILD GATE is met: build 8 (Android + iOS), then device-check every merged screen at 360x800 and on an iPhone (nothing was
   seen on a device today).
6. Not started: coach consultation K0-K8 (prototype 77-85; agent 134's lane), sub-coach money options (133-15), lean-flow deletion
   (133-7, after the consultation runs end to end on both phones), small follow-ups listed in each report's HANDOFF.

## Handoff locations (each report ends with "## HANDOFF"; copies of /home/user/workspace/ops/reports/ in ops/reports/ here)
| Job | Agent | Report |
|---|---|---|
| CONSULT-ALL-BE-133 | Opus builder | ops/reports/CONSULT-ALL-BE-133.md |
| CONSULT-ALL-M-133 | Opus builder | ops/reports/CONSULT-ALL-M-133.md |
| CONSULT-PARITY-133 | Opus builder | ops/reports/CONSULT-PARITY-133.md |
| AUTH-ENTRY-133 | Opus builder | ops/reports/AUTH-ENTRY-133.md |
| TOUR-133 | Opus builder | ops/reports/TOUR-133.md |
| DS-PRIMITIVES-133 | Opus builder | ops/reports/DS-PRIMITIVES-133.md |
| ROMAN-CONTEXT-133 | Opus builder | ops/reports/ROMAN-CONTEXT-133.md |
| ROMAN-ROOM-133 | Opus builder | ops/reports/ROMAN-ROOM-133.md |
| REDO-AUDIT-133 | Opus auditor | ops/reports/REDO-AUDIT-133.md |
| REDO-FOOD-133 | Opus builder | ops/reports/REDO-FOOD-133.md |
| REDO-LIVE-133 | Opus builder | ops/reports/REDO-LIVE-133.md |
| REDO-PROGRESS-133 | Opus builder | ops/reports/REDO-PROGRESS-133.md |
| REDO-SETTINGS-133 | Opus builder | ops/reports/REDO-SETTINGS-133.md |
| REDO-HABITS-CAL-COMM-133 | Opus builder | ops/reports/REDO-HABITS-CAL-COMM-133.md |
| REDO-INSETS-133 | Opus builder | ops/reports/REDO-INSETS-133.md |
| REDO-DEVICES-133 | Opus builder | ops/reports/REDO-DEVICES-133.md |
| REDO-COACH-133 | Opus builder | ops/reports/REDO-COACH-133.md |
| LN-OPUS-A/B/C-133 | Opus lenses | ops/reports/LN-OPUS-A-133.md, LN-OPUS-B-133.md, LN-OPUS-C-133.md |
| LN-SOL-A/B/C-133 | Sol lenses | ops/reports/LN-SOL-A-133.md, LN-SOL-B-133.md, LN-SOL-C-133.md |
Lane files: ops/lanes133/ (_COMMON_133.md, JOBS133.md, roster133.json with every launch prompt, launched.json, notify/*.txt,
merge.log). Operator recon: ops/RECON133.md. Deploy log: ops/FLEET133-deploys.md. Prototype shots: /home/user/workspace/specs133/
(not in this repo).
