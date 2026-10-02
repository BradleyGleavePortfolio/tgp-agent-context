# Annex lane A3-MSG-CORE — Claude Opus 5.5 builder, T3/T4 (messaging core: one inbox + Telegram-grade polish)
Read /home/user/workspace/ops/lanes113/annex/_BUILD_COMMON.md and /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. Put "Builder: TGP annex lane A3-MSG-CORE" in every PR body. Report: /home/user/workspace/ops/reports/A3-MSG-CORE-annex.md and a line in tgp-agent-context handoffs/annex/STATUS.md.

Owner verdict 10-01 13:00 (Telegram-grade messaging, items 1 and 5): one inbox (canonical 1:1 is CoachMessage); Telegram polish
everywhere: full emoji reactions, swipe-reply, typing and presence, read state, mentions, pins, mute, edit/delete, message search,
offline queue (send while offline, retry with idempotency, ordered). Community core backend #610 merged (53b6d472) and deploys now;
mobile #314 (report/block/moderation UI) is being fixed by agent 113's lane B-UGC-7 — do NOT edit #314's files until #314 merges
(check `gh pr view 314 -R BradleyGleavePortfolio/growth-project-mobile`); start with the backend and the mobile pieces outside #314's files.
Plan your PRs as a small stack of reviewable slices (each <~800 lines where possible): (1) backend inbox unification + read state +
edit/delete + pins + mute + search (Postgres FTS, RLS-tested), (2) realtime typing/presence (existing FEATURE_COMMUNITY_REALTIME path),
(3) mobile thread polish (reactions picker, swipe-reply, mentions, edit/delete, pins, mute, search UI, offline queue). Expose a
renderer slot for rich cards and an attachment slot for photos (lanes A4 and A6 plug in). Blocking both ways and report parity must
hold for every new surface. 60fps lists, optimistic UI, Apple-level interactions. Tests failing-before; RLS live tests in CI.
