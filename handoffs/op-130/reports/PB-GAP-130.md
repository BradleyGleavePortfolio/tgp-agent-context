# PB-GAP-130: limit playbook rebuilds (agent 130, Claude Opus 5.5, T4 backend)

Status (18:42 PDT): READY posted on b#867 @ 07ae8dff436ac42ea2fa3b7641701349cc2f1ed9 (comment 6050428927, 18:41). CI 16/16 green, merge state CLEAN, 92 lines. Builder done; no verdicts awaited.

## Scope traced
- Entry: FIX_PLANS_130_131 PB-GAP-130 -> JOBS129 PB-GAP-129. A coach's playbook rebuild is skipped while that coach's last successful build is under 6 hours old, including the run 3 minutes after each restart. m#513's copy must stay true. Failing-first test required. Merge before b#855.
- Recon 130 row: start now. At most one rebuild per coach every 6 hours, boot run included. b#855 waits for this merge and its deploy.
- Code on main d6065661:
  - `src/roman/playbook/playbook-builder.scheduler.ts:22-29`: boot run 3 min after boot.
  - `:36`: cron `0 */6 * * *` UTC. Both paths call `runOnce` -> `buildFor`.
  - `playbook-builder.service.ts:154-158` (main): the only guard was the source digest, so a coach with changed material was rebuilt and charged (payer = head coach's pool, `:171-177`) on every boot run.
  - Only the builder writes CoachPlaybook (statuses active | superseded, one active per coach), so the active row's `built_at` is the last successful build.
- Production runs one Fly machine (SoT A6 capacity note; fly.toml min_machines_running = 1).

## Change (b#867)
- `playbook-builder.service.ts:58-69`: `PLAYBOOK_REBUILD_MIN_INTERVAL_MS` (6 h) and `builtTooRecently()`. Ages are counted in whole minutes because the 6-hourly run starts a few ms after the hour by a varying amount, and a millisecond compare would randomly skip scheduled rebuilds.
- `:74`: new outcome `too_recent`.
- `:173-176`: after the digest check, an active playbook under 6 h old gives `too_recent`. No reserve, no provider call, no write. Keyed on the resolved head coach, the same row the write supersedes.
- Scheduler header comment updated (`:4-6`).
- Tests, `test/roman/r11-playbook-builder.spec.ts`:
  - 3 new specs: under 6 h waits and 6 h builds; 1 ms short waits and 10 ms past builds; end-to-end boot run 3 min after a restart gives `{coaches:1, outcomes:{too_recent:1}}`.
  - The existing v1 -> v2 spec now builds v2 at +6 h.
- Size: 3 files, 86 insertions / 6 deletions at commit time.

## Failing-first evidence (seen in a test)
- Tests-only change on main d6065661 (18:27 PDT, heavy.sh): 3 failed, 10 passed. Each new spec got Received "built" where "too_recent" was expected (rebuilt at +3 min, at 5 h 59 min, and on the boot run 2 h 03 min after a build).
- With the fix (18:28 PDT): 13/13 pass. ESLint clean on both changed source files.

## m#513 copy check
"Refreshes run a few times a day, only when something new was added": a coach gets at most one successful refresh per 6 h (at most 4 per calendar day) and only on a digest change, so "a few times a day" holds. FIX-OPUS-130 owns the "only when something new was added" reword.

## B list
- None open. Fixed here: LN-OPUS-B-128 m#513 background (no per-coach minimum interval). From the code; failing-first proven in a test.

## U list
- None.

## C one-liners
- C (edge, deferred to 10k clients): two machines firing the same cron can build one coach twice (one machine in production; 10 USD/day ceiling).
- C: a coach inside the 6 h still has its sources read each run (reads only, as today).

## Proposed (needs operator)
1. Failed but charged attempts are not limited. The entry says "last successful build", so an invalid or empty draft, or a model error without an HTTP status, is charged (`playbook-builder.service.ts:210-215` settles the reply before the checks at `:229-238`; `:222-226` settles the worst case on a non-HTTP error) and retried on the next run, boot runs included. A coach whose drafts keep failing pays a few cents per run, up to 4 cron runs plus one per deploy a day, bounded by the 10 USD/day background ceiling.
   - Smallest fix: in `buildFor`, also skip when the coach's last `roman.playbook` AiRequestAudit row with a non-zero settle is under 6 h old (about 15 lines plus 1 spec).
   - Default: not blocking b#855; follow-up T4 PR (Claude Opus 5.5) if a lens rates it U or above.

## PRs
| PR | head | lines | CI | READY | verdicts |
|---|---|---|---|---|---|
| backend#867 | 07ae8dff436ac42ea2fa3b7641701349cc2f1ed9 | 92 (86+/6-) | green 16/16 (CI run 37713327407) | yes, 18:41 (comment 6050428927) | Opus: -, Sol: - (not awaited) |

PR body: /home/user/workspace/ops/reports/PB-GAP-130-pr-body.md. READY text: /home/user/workspace/ops/reports/PB-GAP-130-ready-comment.md.

## HANDOFF
- State: b#867 (branch agent130/pb-gap-130, worktree /home/user/workspace/wt/PB-GAP-130-backend), head 07ae8dff436ac42ea2fa3b7641701349cc2f1ed9.
  - Based on main d6065661; CI green; READY posted 18:41 PDT.
  - Nothing uncommitted; nothing merged, deployed or flagged.
- Next (operator):
  1. Both lenses review b#867 at 07ae8dff.
  2. Merge, then deploy backend.
  3. FIX-OPUS-130 finishes m#513's copy (it must stay true with this rule: at most one successful refresh per coach per 6 h).
  4. Merge m#513.
  5. b#855 merges origin/main (it currently conflicts), sets FEATURE_ROMAN_PLAYBOOK "true", cites b#867 + its deploy + the m#513 merge.
- On a REQUEST CHANGES at 07ae8dff: FIX-OPUS-130 fixes on branch agent130/pb-gap-130 (merge origin/main, never rebase or force-push).
  - Then posts `FIX ROUND 2 (PB-GAP-130, agent 130, <FIX ID>) — growth-project-backend#867 @ <sha> — READY FOR AUDIT`.
- Tests to run on any change: `cd /home/user/workspace/wt/PB-GAP-130-backend && /home/user/workspace/ops/heavy.sh npx jest test/roman/r11-playbook-builder.spec.ts` (13/13).
- Open decision: "Proposed (needs operator)" item 1 (failed but charged attempts). Default: not blocking b#855.
