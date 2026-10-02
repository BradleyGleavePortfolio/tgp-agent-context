# Lane S-WEAR (agent 111) — Claude Opus 5.5 builder: wearables mobile fix round (mobile #317; T4 health data) — day-1

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; prompt v5 section 4.3 item 9 (wearables: connect Apple Health or Health
Connect, import 30 days, health and sleep views; NON-NEGOTIABLE: one person's phone data must never upload into another account —
Sol A-317-1 was exactly that; D3: onboarding health prefill moves to 1.0.1; the wearables AI insight panel stays hidden; owner 12:51:
on at day 1 — fix, audit, flip FEATURE_WEARABLES_INGEST_POST + FEATURE_COMMUNITY_WEARABLE_PROMPTS, and wire the orphaned coach
wearable-prompts screen; known v1 limits: no background sync, later edits not re-synced) and section 12 item 10 ("Health Connect
returns after it + Play health declaration") in /home/user/workspace/repos/tgp-agent-context/handoffs/op-f083060f/TGP-Operator-Prompt-v5-Agent-111.md.
Backend #623 (wearables ingest) is MERGED on main. Read EVERY AUDIT comment on mobile #317 (Sol BLOCK, Opus REQUEST CHANGES at
c7e35d84) and any 109/110 report mentioning #317 or S14 in /home/user/workspace/ops/reports/ and /home/user/workspace/repos/tgp-agent-context/handoffs/.
Do (one pass, no ping-pong):
1. mobile #317 @ c7e35d84 (branch agent/clinic/s14-wearables-mob; DIRTY): merge mobile main e3986e89+ (merge commit, no rebase);
   close every A/B from both lenses and cheap Cs, each with a failing-before test; account binding on every read/upload path
   (sign-out/sign-in as a different user on the same phone must never upload the first user's data — prove it with tests);
   Health Connect returns after it (restore the Android path the audits allow) and list what the Play health declaration needs
   in your report (owner action, do not file anything); wire the orphaned coach wearable-prompts screen so it is reachable.
2. If the backend needs a small change for any of this, open a small backend PR (register env names per #624; no migration unless
   the operator assigns a prefix — next free 20270224000000).
3. List the exact launch-flag manifest entries needed (FEATURE_WEARABLES_INGEST_POST, FEATURE_COMMUNITY_WEARABLE_PROMPTS) and any
   EXPO_PUBLIC flags for the clinic EAS profile; do not edit the manifest.
Tests via heavy.sh (targeted jest --runInBand; tsc once per repo per round). Never merge, dispatch workflows or touch production.
Report: /home/user/workspace/ops/reports/S-WEAR-111.md. Final answer (<400 words).
