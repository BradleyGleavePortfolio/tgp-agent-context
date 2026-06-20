# AGENT_BOOTSTRAP.md — read this first, every time

**Effective:** 2026-06-19
**Owner:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Audience:** every operator, builder, fixer, auditor, planner spawned to work on TGP from operator 49 forward.

> If you are an agent waking up on a TGP task, **stop and read this file before doing anything else.** It will save you (and the operator) tens of thousands of credits per session. Every section below answers "what does the next agent need to know to not redo work."

---

## §0. Why this file exists

The TGP context repo is large (~200 docs across `roadmap/`, `plans/`, `audits/`, `applehealthkit/`, root-level handoffs). Without a bootstrap pointer, every agent re-discovers structure from scratch — burning 5–10k credits before producing any useful output. This file is the single entry-point that tells the next ~51 agents (operators 49–100, ish) what to read, in what order, and what NOT to redo.

The operator's working budget is finite. Every agent that skips this file and re-audits the repo is wasting it.

---

## §1. The four files that contain everything every agent needs

Read these in order. Do not skim. The pyramid below is the operational law of TGP — every other doc descends from these four.

| # | File | What it gives you |
|---|---|---|
| 1 | [`AGENT_RULES.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/AGENT_RULES.md) | The master doctrine. R1–R107. Sacred quality + audit + commit-identity + push-cadence rules. This is the constitution. **If something here conflicts with anything else in the repo, this wins.** |
| 2 | [`roadmap/TGP-MASTER-EXPANSION-PLAN.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-EXPANSION-PLAN.md) | Strategy. Decacorn vision, 5-stage waterfall, quality bar, App Store launch gate. Read once; re-read on any strategy question. |
| 3 | [`roadmap/TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) | **The feature ledger.** 13-item Bucket A (A1→A13), plus C/D/E/F. Operator rankings + scope expansions are locked here. **This is the answer to "what do we build next."** Operator dissolved old Bucket B into A on 2026-06-19; the letter B is retired. |
| 4 | [`plans/POST_H_LADDER.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/POST_H_LADDER.md) | The execution sequence. Tier 1 (infra) → Tier 5 (UX polish). Tier 4 is now keyed to A1–A13. Tells you what tier/lane your current work is in and what gates it must pass. |

That's it. Four files. ~3000 lines total. **You can do useful work on any TGP task with only these four loaded.**

Everything else in the repo is supporting evidence, audit history, or item-specific spec — only pull it when you're actually working on a thing that needs it.

---

## §2. The next layer (read on demand, not by default)

| When you need… | Read this |
|---|---|
| Per-A-item scope detail | [`roadmap/specs/A##-*.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/tree/main/roadmap/specs) — one stub per A-item. **Update yours as you work** (R4/R5: never lose). |
| Non-negotiable cross-cutting rules (RLS tiers, idempotency, audit events, voice) | [`roadmap/DOCTRINE_INVARIANTS.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/DOCTRINE_INVARIANTS.md) — the ~100-line checklist that applies to every line of code, regardless of feature. |
| Operator decisions already locked (don't re-ask) | The "Operator decisions (locked)" section in each A-item spec stub. If your question is answered there, the answer is final unless the operator explicitly reopens it. |
| Consumer Marketplace details (A10) | [`plans/CONSUMER_MARKETPLACE_SPEC.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/CONSUMER_MARKETPLACE_SPEC.md) (operator-locked 2026-06-16) |
| Talent Marketplace details | [`plans/TALENT_MARKETPLACE_SPEC.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/TALENT_MARKETPLACE_SPEC.md) + [`plans/TM_REBUILD_CHAIN_V2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/TM_REBUILD_CHAIN_V2.md) |
| Roman P4 close-out details (A1) | [`plans/ROMAN_P4_OPTION_C_EXPLAINED.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/plans/ROMAN_P4_OPTION_C_EXPLAINED.md) |
| Quality bar / decacorn frame | [`PRODUCT_DOMINANCE_PLAYBOOK_DIGEST_2026-05-28.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/PRODUCT_DOMINANCE_PLAYBOOK_DIGEST_2026-05-28.md) |
| Audit cycle mechanics | AGENT_RULES.md §3 (R10–R16) + R65 + R72 |
| Repo norms (branch naming, commit format) | AGENT_RULES.md R3 (commit identity), R15 (GitHub is source of truth), R6 (push cadence) |
| Code-side audit baseline (50 failures) | `quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` (in the product repos) |

---

## §3. What you MUST NOT redo

The operator has paid for the following decisions already. Re-doing any of them wastes credits and frustrates the operator. **If you find yourself about to do any of these, stop and re-read the linked doc instead.**

- **DO NOT re-audit the backend or mobile codebase** to discover what's built. That was done 2026-06-19. The result is in `TGP-MASTER-PLAN-v2.md` §1 (per-item "What's built") + §6 (PROD inventory).
- **DO NOT re-rank A1–A13.** The order is operator-locked as of 2026-06-19. Bucket B was dissolved into A on the same date; items B1/B2/B3 are A3/A4/A5.
- **DO NOT re-scope items the operator already expanded.** The 6 scope expansions (lead funnel 7-step, role-gated inbox, bidirectional referrals + shirt, money-flow engine rules, white-label cut, admin war-room) are locked in v2 §2.
- **DO NOT propose new buckets or new A-items.** If something genuinely needs adding, write it as a candidate in `roadmap/OPERATOR_QUESTIONS_PENDING.md` (create the file if it doesn't exist) and ask the operator before acting.
- **DO NOT reopen the kill list.** F1 (AI video form analysis) is dead. The Mux+Anthropic substrate is reusable for D1 video replies.
- **DO NOT recompute the priority pyramid.** Infra → Security → Observability → Features → UX polish. POST_H_LADDER tiers map to this. The pyramid is set.

---

## §4. What you MUST do, every session, no exceptions

1. **Identify your current A-item or tier-lane** before writing any code. If you can't say "I am working on T4.A_ which is the _____ lane and my spec stub is at `roadmap/specs/A##-*.md`", stop and ask the operator.
2. **Read your A-item spec stub** (`roadmap/specs/A##-*.md`) including the "Previous-operator working notes" section. Appending notes is mandatory; overwriting is forbidden.
3. **Append your working notes to that stub** before ending your session — even a 5-line "I touched X, hit issue Y, suggested Z" is enough. R4/R5 sacred: never lose operator work.
4. **Commit as the operator** (R3): `Bradley Gleave <bradley@bradleytgpcoaching.com>`. No AI/agent tokens, ever.
5. **Push within 2 minutes** of completing any meaningful artifact (R15: GitHub is the only source of truth). Sandbox-only files are forbidden.
6. **Use audit cycle verbatim** if your work is a code PR (R14: builder → Lens-A audit → Lens-B audit → fixer → re-audit → both CLEAN → merge). No shortcuts.
7. **Pass DOCTRINE_INVARIANTS.md checklist** before declaring any A-item "done" (RLS, idempotency, audit events, voice, motion, etc.).

---

## §5. Operator decisions log — the durable history

When the operator makes a ruling that future agents need to honor, it goes into:

- The relevant **A-item spec stub** under "Operator decisions (locked)" — for item-specific rulings.
- **`roadmap/OPERATOR_DECISIONS_LOG.md`** (append-only, dated) — for cross-cutting rulings that apply to many items.
- **AGENT_RULES.md** (operator-signed commit only) — for rulings that become new rules.

If you're an agent who just got a ruling from the operator, your responsibility is to write it down in one of these three places before ending your session. **An undocumented operator ruling is worse than no ruling — it forces the next agent to re-ask.**

---

## §6. How to handle uncertainty

- **If the operator's intent is unclear:** ask the operator via the conversation, then write the answer into the appropriate doc.
- **If two docs conflict:** AGENT_RULES.md wins; then v2 ledger; then POST_H_LADDER; then everything else.
- **If you don't know which A-item your work belongs to:** ask the operator. Don't pick.
- **If you find a bug or gap in a sacred doc (AGENT_RULES, v2, POST_H_LADDER):** flag in `roadmap/OPERATOR_QUESTIONS_PENDING.md` (create if missing). Do NOT silently edit.
- **If credits are running low:** push checkpoint commits immediately (R6/R7), update your spec stub with where you are, and stop. The next agent will pick up from your stub.

---

## §7. Quick reference card

```
WHAT TO BUILD      → TGP-MASTER-PLAN-v2.md §0.1 (Bucket A: A1→A13)
HOW TO SEQUENCE    → POST_H_LADDER.md (Tier 1→5, Tier 4 = A1→A13)
QUALITY BAR        → AGENT_RULES.md R1 (decacorn) + R107
NEVER LOSE         → AGENT_RULES.md R4, R5, R6, R15
AUDIT CYCLE        → AGENT_RULES.md R10–R16, R72
COMMIT IDENTITY    → AGENT_RULES.md R3 (Bradley Gleave <bradley@bradleytgpcoaching.com>)
PER-ITEM SCOPE     → roadmap/specs/A##-*.md
CROSS-CUTTING NON-NEGOTIABLES → roadmap/DOCTRINE_INVARIANTS.md
```

If you internalize the eight rules in this card and the four files in §1, you are operating at par for TGP.

---

**End of bootstrap.** Now go read AGENT_RULES.md if you haven't, then the v2 ledger, then your A-item spec stub. Welcome.
