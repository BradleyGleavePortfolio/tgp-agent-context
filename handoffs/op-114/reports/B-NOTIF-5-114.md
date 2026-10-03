# B-NOTIF-5 (agent 114) — backend #647 + #648

## Status log
- 19:08 #647: merged origin/main 12e1b03b (06eba9bb); commit 260044e4 (C-647-3 stored 24 h body names the date; R75 `as never` net -14 via cronJob helper). Pushed to fix/notif-reminder-local-time-once. CI pending.
- Verified prior B-NOTIF-4 commit 2987ad95 (no FIX ROUND comment existed): zone provenance (timezone_source/updated_at, PUT /notifications/timezone), claim generation fence (start_at key + FOR SHARE re-read), C-647-2 required Prisma. Targeted jest: 6 suites 69/69 after updates.
- Migration prefix note: #647 uses 20270301000000 (kept per OR-113-4) but annex reserved 20270301-06 and #652/#657 also use 20270301000000. Operator decision needed.

## Next
- #648: merge fixed #647 + main, durable push outbox (quiet hours OR-113-5, event dedupe, deadline, receipts, twin provenance).


- 19:40 #647 head fc750ef9 (merged main 2e3094b9). #648 head c63354a4 (merged fixed #647 + main): durable PushOutbox (migration 20270307000000_push_outbox_quiet_hours — PREFIX NEEDS OPERATOR CONFIRMATION; annex reserved 0301-0306), quiet hours, dedupe/collapse, deadlines, durable receipts, push_twin provenance. Local jest: push-delivery 22/22, 7 suites 79/79, 18 suites earlier pass. Local tsc OOMs (sandbox); CI is the verifier. WIP copy also at wip/B-NOTIF-5-push-outbox.
- Next: wait CI on both heads, then FIX ROUND comments + PR bodies + READY FOR AUDIT.
- 19:33 PR bodies updated on #647 (fix round 3 table + tier header) and #648 (fix round 2 table + tier header). CI queued/running on fc750ef9 / c63354a4. #608 manifest seam: PushOutbox.user_id will need an erasure-manifest entry (erase; FK cascade from User) once #608 is on main.
- Next command: `gh pr checks 647; gh pr checks 648` then post FIX ROUND comments.
- 19:50 #608 merged (ec911328). #647 merged main -> df4eb80b (manifest specs 17/17, no new user-id columns). #648 merged -> 16294f44 with PushOutbox manifest entry (coverage spec failed before: "PushOutbox.user_id"; now 101/101 across 6 suites). #647 was all-green at fc750ef9 before the main move.
- 20:20 #647 FIX ROUND 3 + READY posted (df4eb80b all green). #648 16294f44: build-and-test failed on Jest worker OOM in unrelated community-message-shape.live.spec (12113 tests passed, tsc ok); reran failed job once.

- 20:35 #648 FIX ROUND 2 + READY posted (16294f44 all 11 required green after one OOM-flake rerun). Worktrees removed.

## Final state
- #647 head df4eb80bb966133c80049e2071b939f700940106 — CLEAN, 11/11 required green. FIX ROUND 3: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/647#issuecomment-5964902576
- #648 head 16294f44b8738698408b6e8c672574c055cdaab8 — CLEAN, 11/11 required green. FIX ROUND 2: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/648#issuecomment-5964973570
- WIP mirror branch: wip/B-NOTIF-5-push-outbox (older de2a78fc; superseded by the PR branch).

## HANDOFF
- Both PRs READY FOR AUDIT (dual lens). Merge order: #647, then #648 (contains #647).
- Closed: #647 Opus B-647-1, C-647-2, C-647-3; Sol B-647-1, B-647-2; R75 CI red. #648 Opus/Sol B-648-1, Sol B-648-6, B-648-7, Opus C-648-2, C-648-4 (OR-113-5 quiet hours), C-648-5; C-648-3 backend half (sessionId in push data).
- Operator decisions: (1) migration prefixes: #647 keeps 20270301000000 (OR-113-4; also used by #652/#657, distinct names) and #648 took 20270307000000 (first after annex 0301-0306) — confirm. (2) Mobile follow-ups: PUT /notifications/timezone on sign-in/foreground; SessionDetail tap target; Quiet hours screen payload mapping. (3) OWNER: FCM V1 key for Android (pushes recorded provider-not-configured until then). (4) Follow-up: move pushToUser/pushToCoach senders onto the outbox.
- Local tsc OOMs in the shared sandbox; CI build-and-test is the verifier.
