# Lane B-EXPORT-3 (agent 112) — Claude Opus 5.5 builder: account deletion + data export (backend #608, #636; mobile #327; T4)

App Store 5.1.1(v) blocker (in-app account deletion) and "Download my data must work" (owner 10-01 12:51).
Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes111/B-EXPORT-2.md and
/home/user/workspace/ops/reports/B-EXPORT-2-111.md (plan of record and what round 2 did); EVERY AUDIT comment on backend #608
(Opus APPROVE, Sol REQUEST CHANGES at 4e926b35), #636 (Sol + Opus REQUEST CHANGES at 7883337f; stacked on #608's branch) and
mobile #327 (Opus APPROVE, Sol REQUEST CHANGES at 7e643f9b). Owner 10-01 20:32 + OR-110-1: account deletion erases Roman/AI
chats (RomanMessage, RomanSession) — keep that in the erasure manifest. Single support address Bradleyapple1031@gmail.com.
Do (one pass, no ping-pong; each finding closed with a failing-before test):
1. #608 @ 4e926b35: close every Sol A/B (and cheap Cs); merge backend main 3bd6215b (merge commit, no rebase; register env names
   per #624; migration prefix 20270220000000 must sort after main's latest 20270216000000 — it does).
2. #636 @ 7883337f: close every A/B from both lenses (migration stays 20270221000000); merge the updated #608 branch into it.
3. #327 @ 7e643f9b: close Sol's B finding(s) + cheap Cs; merge mobile main 2c17c241 (merge commit).
4. Known deletion follow-ups (fix if small and in scope, else list): C-608-2, C-313-5, recipes a deleted user created are left
   behind, a saved bookmark blocks delete, export omits created recipes.
Plan of record after your round: dual approval of #636 -> operator merges #636 into #608's branch -> #608 dual delta -> merge #608,
then #327 (a #327 build needs #608/#636 deployed).
Tests via heavy.sh (targeted jest --runInBand; tsc once per repo per round). PR bodies: tier header + fix-round tables. Never merge,
dispatch workflows or touch production. Report: /home/user/workspace/ops/reports/B-EXPORT-3-112.md. Final answer (<400 words).
