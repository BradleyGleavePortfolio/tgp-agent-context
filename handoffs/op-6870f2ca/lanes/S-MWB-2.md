# Lane S-MWB-2 (agent 112) — Claude Opus 5.5 builder: Programs fix round (backend #640 + mobile #328; T4/T3) + builder undo

Owner: 10-01 11:31 master workout builder ("Programs"): build once, reuse for everyone, auto-assign tools; 12:51 programs assign +
auto-assign; 10-02 09:53 "the Programs builder already is mostly built, just not accessible" -> reuse the June backend; MWB flags
live day 1. Spec: autosave AND undo.
Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes111/S-MWB.md + reports/S-MWB-111.md;
EVERY AUDIT comment on backend #640 (Opus BLOCK at 2ac6395f) and mobile #328 (Opus REQUEST CHANGES at dbd5ceb9).
PUSH HOLD: AUD-SOL-4 audits #640/#328 after #627/#321. Do not push to #640/#328 until its AUDIT comments are posted (poll gently);
code locally meanwhile, then fold Sol's findings in so ONE round closes both lenses.
Do: close every A/B from both lenses + cheap Cs (failing-before tests); merge backend main 3bd6215b / mobile main 2c17c241 (merge
commits; migration 20270223000000 stays); add the builder undo button (autosave + undo per spec); fix if small, else list:
sub-coach day access, June clone route 2nd-client 409, archive guard after #607 (merged soon). List the manifest flips needed
when #640 deploys (FEATURE_MWB_TEMPLATES, FEATURE_MWB_AUTOSAVE_UNDO + MWB_AUTOSAVE_LOCK_TOKEN_SECRET, FEATURE_NAMED_REGIMES;
then FEATURE_MWB_AI_LIVE_CREATE) — do not edit the manifest.
Tests via heavy.sh (targeted jest --runInBand; CI does tsc + full suites). Never merge, dispatch workflows or touch production.
Report: /home/user/workspace/ops/reports/S-MWB-2-112.md. Final answer (<400 words).
