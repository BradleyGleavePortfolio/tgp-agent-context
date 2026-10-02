# Lane S-SCHED-3 (agent 111) — Claude Opus 5.5 builder: scheduling fix round (#634 backend, mobile #325; T4)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes110/S-SCHED-2.md (objective) +
/home/user/workspace/ops/reports/S-SCHED-2-110.md + S-SCHED-110.md; prompt v5 scheduling rules (search "S-SCHED" and "booking" in
/home/user/workspace/repos/tgp-agent-context/handoffs/op-f083060f/TGP-Operator-Prompt-v5-Agent-111.md); EVERY AUDIT comment on
backend #634 @ dbc10b7b (Sol REQUEST CHANGES 0/4/1: B-634-1..4 with reproducible probes, comment 5955780870; Opus REQUEST CHANGES
0/4/5) and mobile #325 @ b0c02156 (Sol REQUEST CHANGES 0/1/2: B-325-1, comment 5955781501; Opus REQUEST CHANGES 0/2/5). Sol's probe
files are under /home/user/workspace/ops/evidence/AUD-SOL-111/ (634-*, 325-*) and Opus's notes under /home/user/workspace/ops/aud-opus-111/
if present — read them, turn each repro into a regression test. Backend #632 (booking reminders, BOOKING_REMINDERS_ENABLED must be
literal "on") is approved and about to merge; keep #634 consistent with it (merge main again after #632 lands if needed).
Close every A/B finding from both lenses in ONE pass (no ping-pong), each with a failing-before test, plus every cheap C. Both lenses
flagged the backend compound cursor; the mobile half pairs with it. Merge main first (backend main b9ee8e0a+; mobile main
e3986e89+) with merge commits, no rebase. Migration stays 20270222000000. PR bodies: fix-round table (finding -> change -> commit ->
test). Tests via heavy.sh (targeted jest --runInBand; backend tsc with NODE_OPTIONS=--max-old-space-size=3584 once per round).
Never merge, dispatch workflows or touch production. Report: /home/user/workspace/ops/reports/S-SCHED-3-111.md. Final answer (<400 words).
