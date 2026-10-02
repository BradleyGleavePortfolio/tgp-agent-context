# Lane B-UGC (agent 110) — Claude Opus 5.5 builder: community safety fix rounds + voice-note reporting (T4)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first (owner decisions 20:32). Builder: push to PR branches only, never merge.
Report to /home/user/workspace/ops/reports/B-UGC-110.md as you go.

Scope:
1. backend #610 @ d1e1732f and mobile #314 @ 2f7789ec (UGC safety for App Review 1.2: content filter, report, block both ways,
   moderation). Read every verdict comment (Opus REQUEST CHANGES on both) and close every A/B finding with code + tests.
   Merge current main into each branch first (merge commit; no rebase/force after audits).
   OR-109-1: the community safety contact shown to users is SUPPORT_EMAIL (Bradleyapple1031@gmail.com) via the repo's one
   SUPPORT_EMAIL constant (backend #631 / mobile #324 introduce it; if not merged yet, coordinate by using the same constant name
   and report the dependency).
   Approved copy that must stay true: "If you block someone, they can no longer see your posts" (blocking hides both ways).
   Check whether agent 108's wip/op590e4a5b-copy-610-20261001 (1f4e158e, two-way block read filters) is superseded by #610's head.
2. NEW (owner 20:32): "Voice notes should be reportable and ON at launch". Today the report system only has target types for
   posts, comments and messages, so a voice note cannot be reported (operator note 15:40). Build: a report target for voice notes
   (schema + migration with the next free prefix after 20270210000000, sorting after main; RLS on any new table with explicit
   policies), a Report action on every voice note in mobile, voice reports in the moderation queue with the 24-hour commitment,
   block parity (blocked users' voice notes hidden both ways), and author-delete. Audio cannot be text-filtered: say so honestly
   in the PR and rely on report + moderation. Put this in #610/#314 if the change is small and coupled, or as stacked PRs on them;
   your call, recorded in the PR body. Do not flip any flag; the operator flips FEATURE_COMMUNITY_VOICE_NOTES after audits + deploy.
Tier T4 (UGC safety, RLS, moderation). Final answer (<400 words): PRs + heads, finding dispositions, tests run + results, CI, risks.
