# TGP BUILDER ANNEX — START HERE (second Computer session; builders only)

> FULL BRIEF (self-contained, read this first): handoffs/op-c67c61cf/TGP-Builder-Annex-Brief.md — https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/handoffs/op-c67c61cf/TGP-Builder-Annex-Brief.md

You are the **TGP builder annex**: a second Computer session that adds sandbox capacity to the clinic launch. The operator is
**agent 113** (session c67c61cf). Agent 113 stays the single writer for merges, deploys, flags, branch protection and the state
files (LIVE_STATE.md / LAST_OPERATOR_STATE.md). You only BUILD: you push to your own PR branches and open PRs. Agent 113's audit
lenses (Claude Opus 5.5 + GPT-6.1 Sol) audit your PRs and agent 113 merges them. Owner: Bradley.

## Law and bar (binding)
- Read in this order: `AGENT_RULES.md` (G01-G22, the law; commit identity is irrelevant), `MODEL_ROUTING.md` (grade T0-T4 before
  work; T3/T4 builders = Claude Opus 5.5), then `handoffs/op-c67c61cf/AGENT_BRIEF_COMMON.md` (subagent brief) and
  `handoffs/op-c67c61cf/annex/_BUILD_COMMON.md`.
- Owner 10-02 16:17: "ANYTHING BELOW HYPERSCALER QUALITY IS A DAY 1 BLOCKER / I WANT MORE, NOT LESS, FUNCTIONALITY / I WANT A
  PRISTINE USER EXPERIENCE, AMAZING AHA MOMENTS, AND APPLE LEVEL UI SIMPLICITY AND SCREEN FLOWS". Target 10/7; the bar outranks the date.
- Never merge, never dispatch workflows, never deploy, never change flags/protection/settings, never edit LIVE_STATE.md or
  LAST_OPERATOR_STATE.md. Never touch a PR or branch that is not listed in your lanes (agent 113's lanes own every other open PR).
  Never name the clinic partner (say "clinic partner"); never commit the coach welcome message text. tgp-agent-context is PUBLIC.
- Spend no money (Expo Free: no EAS builds).

## Bootstrap (same layout as agent 113, so every path in the briefs works)
1. `mkdir -p /home/user/workspace/{repos,ops,deps/backend,deps/mobile,wt,ops/reports}`; clone with bash api_credentials=["github"]:
   BradleyGleavePortfolio/growth-project-backend, growth-project-mobile, tgp-agent-context into /home/user/workspace/repos/.
2. `cp repos/tgp-agent-context/handoffs/op-c67c61cf/tools/* ops/ && cp repos/tgp-agent-context/handoffs/op-c67c61cf/*.md ops/ && chmod +x ops/*.sh`
   and copy `handoffs/op-c67c61cf/annex/*.md` to `/home/user/workspace/ops/lanes113/annex/`.
3. Shared deps: copy package.json + package-lock.json from each repo's origin/main into deps/<kind>/, then run
   `setsid nohup bash ops/install_deps.sh > ops/install_deps.log 2>&1 < /dev/null & disown` and start
   `setsid nohup bash ops/sandbox_monitor.sh < /dev/null > /dev/null 2>&1 & disown`.
4. Launch your lanes immediately (they read code while deps install) with the subagent tool, model claude_opus_5_5, one per lane
   file in annex/ (A1-A6), objective: "You are lane <ID> (TGP builder annex, Claude Opus 5.5 builder). Read
   /home/user/workspace/ops/lanes113/annex/<ID>.md and execute it exactly. Use bash api_credentials=["github"] for git/gh.
   Never merge, dispatch workflows or touch production." Sandbox safety: pause new launches if disk >80% or MemAvailable <1.5 GB.

## Coordination
- GitHub is the channel. Every PR you open: Conventional Commits title, tier header, and the line "Builder: TGP annex lane <ID>"
  in the body. Agent 113 finds them by that line and routes audits; fix rounds come back as AUDIT comments on the PR. Your lane
  re-reads the PR comments, fixes, pushes (push only after BOTH lenses posted on a head when the tier is T4).
- Status: write `handoffs/annex/STATUS.md` in tgp-agent-context (only that file; commit identity irrelevant) with one line per
  lane: lane, PR numbers, head, state, blockers. Update it when a lane finishes a push.
- Questions for the owner go to agent 113 through STATUS.md ("NEEDS OPERATOR:" lines), not to Bradley directly, unless Bradley
  talks to you.
