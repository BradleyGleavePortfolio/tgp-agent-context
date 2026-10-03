# Operator standing orders (read by every operator, agent 116 and later, before the first move)

Owner-set orders that outlive any one operator session. Newest first. AGENT_RULES.md is the law, the EXECUTE doctrine is the mentality,
MODEL_ROUTING.md is the method; this file lists standing owner orders that sit on top of them. Each order points to its source.

## 1. PR size gate (owner, 2026-10-03 11:02 PDT) — MODEL_ROUTING.md section 8.2, DECISION_LOG.md
- HARD LIMIT (owner 11:26 PDT): any PR over 3,000 changed lines is an automatic fail ("a huge waste of credits and extends wasted
  rounds"). Never route it to audit; lenses answer REQUEST CHANGES "SIZE FAIL" without reviewing; the builder splits it. Builders check
  their own diff size before opening a PR and before every push. PRs open on 2026-10-03 are grandfathered.
- Any PR over 1,500 changed lines is a liability and a slow-down. At its FIRST READY FOR AUDIT (before the first full audit), the
  operator posts a SIZE ASSESSMENT on the PR: source / tests / migrations / docs lines, the logical seams, the coupling, and KEEP or
  SPLIT with the reason. Re-assess if a fix round pushes a PR past 1,500.
- SPLIT into stacked PRs when each piece can merge safely alone (compiles, passes CI, has its own tests, inert or flag-gated until the
  last piece lands); target under ~800 lines of non-test source per piece. KEEP an atomic invariant or a PR whose audits have
  converged. Be honest in the assessment: say what Musk (delete the part before optimizing it), Bezos (two-way doors) and Huang
  (speed of light: review throughput is the floor) would do, and do that unless a rule forbids it.
- Prevention beats splitting: grade and size slices before building (MODEL_ROUTING section 8); every builder brief states the budget.
- Lane sizing (owner question 2026-10-03 11:23 PDT on context and error risk): a builder works one PR at a time, in a chain of at most
  3 tightly related PRs (same domain, ideally a backend PR and its mobile pair); a lens queue stays within one context budget; every
  agent keeps its report file current so a fresh agent can take over when one nears its context limit. Merged or approved PRs with
  no open work need no builder; finished agents end instead of waiting.

## 1a. Merge dependencies (owner, 2026-10-03 11:34 PDT) — MERGE_DEPENDENCY_GUIDE.md
- Before planning a wave, read MERGE_DEPENDENCY_GUIDE.md: draw the dependency graph, build in merge order, merge immediately and
  refresh one PR at a time, avoid stacks, keep a small merge crew (one builder, one Opus, one Sol) alive until the train is empty.

## 2. Agent count and spend (owner, 2026-10-02 19:05 and 2026-10-03 10:52 PDT)
- STOP-AND-DRAIN until the owner says exactly "SCALE 2" (or explicitly bumps the count): launch no agents, never re-task a finished
  one. A one-time bump does not end the drain. Never pay to go faster without the owner's word (no EAS builds, no paid CI or plans).

## 3. Quality, speed, scope (owner, 2026-10-01 / 10-02)
- Hyperscaler quality or it is a day-1 blocker; wall clock is resource #1; do it right, do it smooth; more functionality, not less;
  pristine Apple-level UX; recurring packages are the most critical item (never one-time-only).
- GitHub CI is the parallel engine (owner 2026-10-03: "use github CI lanes for speed"): proofs and probes run in CI lanes
  (handoffs/op-115/ci-lane/), never as full local suites.

## 4. Communication
- Every message to the owner ends with "Your next step: ..." or "Nothing needed from you." Escalate decisions, not chores.
  No emojis, no exclamation marks, no first person in product copy, no generic errors. Never name the clinic partner in any repo.
