# Operator standing orders (read by every operator, agent 116 and later, before the first move)

Every operator starts at TGP_SOURCE_OF_TRUTH.md (owner order 2026-10-05 12:30 PDT; earlier: agent 116 started at handoffs/op-115/HANDOFF_AGENT_116.md).

Owner-set orders that outlive any one operator session. Newest first. AGENT_RULES.md is the law, the EXECUTE doctrine is the mentality,
MODEL_ROUTING.md is the method; this file lists standing owner orders that sit on top of them. Each order points to its source.

## 0. PR size: 1,500 lines is the automatic fail (owner, 2026-10-04 12:33 PDT) — replaces the 3,000 limit in section 1
- Verbatim: "I want to grandfather all active PR's - but I want any PR over 1500 lines to autofail, replacing the old 3k LOC rule".
- Any PR opened after 12:33:16 PDT 2026-10-04 over 1,500 changed lines (same counting) fails automatically: never routed to audit;
  lenses answer REQUEST CHANGES "SIZE FAIL (over 1,500 lines)"; the builder splits it. No SIZE ASSESSMENT step any more.
- Grandfathered: every PR open at that moment (governance/PR_SIZE_GRANDFATHERED_2026-10-04.md). Operator default: they keep the
  3,000 ceiling they were built under. Builders check their diff size before opening a PR and before every push.

## 1. PR size gate (owner, 2026-10-03 11:02 PDT) — MODEL_ROUTING.md section 8.2, DECISION_LOG.md (SUPERSEDED by section 0 for new PRs)
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

## Amendment 2026-10-03 21:15 PDT — merge-only refresh exception (owner)
A pure main merge where every PR file stays byte-identical does not need new lens verdicts: the operator posts a MERGE-ONLY TREE CHECK and the prior dual verdicts carry over. Exact conditions and exclusions: MERGE_DEPENDENCY_GUIDE.md rule 12. Everything else that moves a head still needs new verdicts at the exact head.

## Amendment 2026-10-04 12:33 PDT — PR size: 1,500 lines is the automatic fail (owner)
Owner, verbatim: "I want to grandfather all active PR's - but I want any PR over 1500 lines to autofail, replacing the old 3k LOC rule".
Any PR opened after 12:33:16 PDT 2026-10-04 that exceeds 1,500 changed lines (additions + deletions; lockfiles, generated files and
snapshots excluded; tests count) fails automatically: no audit, lens verdict REQUEST CHANGES "SIZE FAIL (over 1,500 lines)", the builder
splits it. This replaces the 3,000 line hard limit and the 1,500 line SIZE ASSESSMENT. Every PR open at that moment is grandfathered
(list: governance/PR_SIZE_GRANDFATHERED_2026-10-04.md); operator default: grandfathered PRs keep the 3,000 ceiling they were built under.
New pieces target under ~800 lines of non-test source.
