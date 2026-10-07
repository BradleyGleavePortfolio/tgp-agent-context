# FIN-T1B-128 (agent 128) — finish backend#843 R11-T1b, then AIB-INJ-128

## Scope traced
- b#843 branch agent127/r11-t1b-127, was a000be7b (CONFLICTING with main 0d179edb after #842 R11-W1).
- Worktree /home/user/workspace/wt/FIN-T1B-128-backend. Merged origin/main (merge commit 109b9037, local).
  Conflict only in src/roman/tools/roman-read-tools.ts (header comment + imports); resolved keeping BOTH
  #842 personal_baselines (import burnedFacts/readBaselines, schema, definition, case, method) and #843 extra kinds.

## B list
(none)

## U list
- U1 (AIB-INJ) injury-filtered seed rows reach the model as id only -> b#848.

## C one-liners
(none)

## PRs
- b#843: pushed merge 109b9037b16f4df6fff46adb2b89dd1ed5143d20 (377 lines: +363/-14). Local: roman-read-tools 10/10,
  roman-extra-history 3/3, roman-baselines 19/19. CI green (15 success, 1 skipped). READY comment posted 13:52.
  VERDICTS @ 109b9037: Opus LN-OPUS-C-128 APPROVE, Sol LN-SOL-D-128 APPROVE (B: none). MERGED 14:06 (main 3c2664b6).
- b#848 AIB-INJ-128: head 8970098e64e159821f0b54e9ffb7e0040dcd9b75 (+111/-1). Failing-first on main: 1/3 fail; fixed 3/3;
  aib-names-127 8/8, aib2 10/10. CI green 14:04; READY comment posted 14:05.
  VERDICTS @ 8970098e: Opus LN-OPUS-A-128 APPROVE, Sol LN-SOL-B-128 APPROVE. MERGEABLE vs main 3c2664b6 (no overlap).

## T4 check b#843 (after merge)
- run(): role !== 'student' or no caller.id -> not_allowed (roman-read-tools.ts:211).
- Subject = caller.id only: at.id = caller.id; extra history queries filter user_id/author_id = callerId; chats also session.user_id.
- Strict zod (z.strictObject) on all 4 tools incl. personal_baselines; unknown key -> bad_input, content-free detail.
- health_day: per-day aggregation of HEALTH_METRICS only (no HEART_RATE stream metric in the list).
- Clamp: fitToolJson max_result_chars + truncated; per-source CAP 1000 / SAMPLE_CAP 12000 -> capped -> truncated.
- Numbers computed in code (aggregation, lbs conversion, hours).
- Note: lefthook pre-commit runs full tsc (OOM on shared box); used LEFTHOOK=0 for the AIB-INJ commit, CI runs tsc.

## Not fixed (needs operator)
(none)

## HANDOFF
- b#843 MERGED 14:06 (both lenses APPROVE at 109b9037).
- b#848 AIB-INJ-128 @ 8970098e64e159821f0b54e9ffb7e0040dcd9b75: CI green, both lenses APPROVE, MERGEABLE with main 3c2664b6. Ready for operator merge.
- FLIP-TOOLS-128: withdrawn by operator 14:13 before any work; nothing started.
- Worktrees left in place: wt/FIN-T1B-128-backend, wt/AIB-INJ-128-backend.
- Tooling note: backend lefthook pre-commit runs a full-project tsc that runs out of memory on the shared box; commit with LEFTHOOK=0 (CI runs tsc). Prettier already fails on main's versions of these files and CI has no prettier step.
