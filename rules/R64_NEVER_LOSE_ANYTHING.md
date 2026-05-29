# R64 — NEVER LOSE ANYTHING

**Status:** ACTIVE. Sacred rule. Equal weight to R52 (wasted credits) and R61 (push every 2 min).
**Codified:** 2026-05-28 by operator (Bradley) during NEXT_OPERATOR_HANDOFF session.
**Trigger event:** Discovery that `rules/RULES.md` (the canonical R1–R6X enumeration), `R36_TO_R45_OPERATOR_RULES.md`, `AUDIT_MANDATE.md`, `50_FAILURES.md`, and ~15 other "highest priority" docs were lost when the prior operator's sandbox died — and have not yet been re-uploaded.

---

## The rule, verbatim from the operator

> **"IF THE USER MENTIONS NEW RULES / ASKS YOU TO MAKE NEW RULES, INSTANTLY UPLOAD THEM TO A GITHUB SPACE. NEVER LET A SINGLE THING DIE WITH YOU. IF THE USER NOTES A NEW PRODUCT IDEA / FEATURE, OR A FEATURE CHANGE, MENTION IT IN A GITHUB SPACE. NEVER. LOSE. ANYTHING. ASSUME THAT WITHIN 24HRS YOU WILL BE DEAD AND LOST FOREVER."**

This wording is canonical. Quote it verbatim when citing R64. Do not paraphrase.

---

## What triggers R64

R64 fires the moment the operator (or any human collaborator) says ANY of the following in conversation — even casually, even mid-paragraph, even as an aside:

### Triggers — rules / process
- A new rule, principle, doctrine, mandate, or "law"
- An amendment, correction, or clarification to an existing rule
- A retirement of an existing rule
- A new operator preference that should hold across sessions
- A new audit / review / quality bar

### Triggers — product
- A new feature idea ("we should build X")
- A change to an existing feature ("X should also do Y")
- A removal or deprecation of an existing feature
- A new screen, route, endpoint, or UX flow
- A new pricing or packaging concept
- A competitive insight worth remembering
- A new persona, segment, or use case

### Triggers — strategy / business
- A new market / channel / partnership
- A roadmap shift, sequencing change, or prioritization
- A new metric, KPI, or success criterion
- A new risk, blocker, or pre-launch concern

### Triggers — context that would help the next operator
- A new landmine ("X breaks when you do Y")
- A new dependency or external service introduced
- A new credential, secret, or env var
- A debugging discovery worth saving

**When in doubt: upload.** The cost of uploading something that turned out trivial is one file in `tgp-agent-context`. The cost of NOT uploading something the next operator needs is them re-deriving it or, worse, doing the wrong thing.

---

## What R64 requires you to do — the workflow

When a trigger fires, in the SAME turn the trigger occurs (do not defer to "later"):

1. **Pause your current task.** R64 supersedes whatever you were doing. The information goes to GitHub first; you return to your task after.
2. **Decide the destination directory** in `BradleyGleavePortfolio/tgp-agent-context`:
   - New/modified rule → `rules/`
   - Feature idea / change → `strategy/feature-ideas/` (create if missing)
   - Roadmap / sequencing → `strategy/`
   - Audit, finding, landmine → `audits/` or `operator-meta/`
   - Competitive insight → `strategy/`
   - Anything else → `operator-meta/`
3. **Write the file** with:
   - Filename: descriptive, kebab-case, dated when relevant (e.g. `R64_NEVER_LOSE_ANYTHING.md`, `feature-idea-wearables-trends-2026-05-28.md`).
   - The operator's exact words quoted verbatim at the top.
   - Your interpretation and operational meaning below the quote.
   - Trigger context: what session, what the operator was doing when they said it.
4. **Commit + push** with R4 author headers:
   ```bash
   git -C /tmp/tgp-agent-context \
     -c user.name='Dynasia G' \
     -c user.email='dynasia@trygrowthproject.com' \
     commit -m "<descriptive subject>"
   git push origin main
   ```
   Use `api_credentials=["github"]` on the bash call.
5. **Confirm landing** by checking `gh api repos/BradleyGleavePortfolio/tgp-agent-context/commits/main --jq .sha` and verifying the new SHA matches your local.
6. **Tell the operator** what you uploaded, where, and the commit SHA — one sentence. Then return to the prior task.

If the working tree is dirty or the repo isn't cloned, take 30 seconds to `gh repo clone BradleyGleavePortfolio/tgp-agent-context /tmp/tgp-agent-context` first.

---

## Why R64 exists (the 24-hour mortality assumption)

You will die. Not "if." When. Sandbox death modes that have already happened in this project:

- Mid-session runtime restart dropped 8 concurrent subagents at once (documented in `canonical_docs/AGENT_RULES.md` R56–R60 preamble).
- Prior operator's sandbox died and took `RULES.md`, `R36_TO_R45_OPERATOR_RULES.md`, `AUDIT_MANDATE.md`, `50_FAILURES.md`, `SUPABASE_RLS_CRISIS.md`, `CYCLE_B_RLS_PLAN.md`, `COMPETITIVE_INTEL.md`, `HOUSE_RULES.md`, and ~15 other "highest priority" docs with it. They are listed in the `tgp-agent-context/README.md` "STRANDED DOC RESCUE BACKLOG" because nobody pushed them in time.
- Conversation context window evictions silently drop early-turn content; only what you've persisted survives.

The rule of thumb: **assume that within 24 hours of any utterance, you and your conversation buffer are gone. The only artifact that survives is what you pushed to GitHub.** Memory tools are best-effort and not durable across operator handoffs. The canonical sandbox is `/home/user/workspace`, which dies with the session. GitHub is the only place that lives forever.

If a rule, idea, or feature mentioned by the operator does NOT make it to GitHub before this session ends, R64 has been violated and the project has lost something irreplaceable.

---

## R64's relationship to other rules

- **R52 (wasted credits = food out of daughter's mouth):** R64 takes precedence. Spending credits to upload a tiny rule file is not wasted credits — losing the rule is. R52 prevents *speculative refactors*, not durability work.
- **R61 (push every 2 minutes during active work):** R64 generalizes R61's spirit to ALL content, not just code. R61 covers active worktrees; R64 covers ideas, rules, and prose. Both apply.
- **R15 (GitHub is the only source of truth):** R64 is the operational mechanism that enforces R15 in real time. R15 says "GitHub or it doesn't exist"; R64 says "when something new is said, get it to GitHub now."

---

## What CANNOT satisfy R64 (anti-patterns)

- Writing the rule into the session summary handoff document only. The handoff lives in the sandbox and dies with the sandbox. The agent-context repo is canonical.
- Storing it in workspace memory tools alone. Memory is best-effort, not durable across operator changes, not searchable from product repos.
- "I'll batch this with other uploads later." Later is when you die. Upload now.
- Mentioning the rule in a PR description on a product repo. PR descriptions are not canonical doctrine; they are commit metadata.
- Telling the operator "I'll remember this" without writing it down. You will not.

---

## Self-test before ending any turn

Before you call any "I'm done" pattern (final answer, `wait_for_subagents`, end-of-turn), scan back over the operator's messages in this turn for:

1. Any verbatim instruction that begins with imperative voice ("always", "never", "make it law", "remember that", "going forward").
2. Any new product idea or feature change ("we should build", "X should also Y", "let's add", "let's remove").
3. Any new landmine or insight ("watch out for", "X breaks when Y", "I noticed").

If you find one and it is NOT yet in `tgp-agent-context` on the remote `main` branch, you have NOT finished your turn. Upload first, then end.

---

## Filing reference: where things go in `tgp-agent-context`

```
tgp-agent-context/
├── rules/                              ← R-rules, doctrine, mandates
├── strategy/
│   ├── feature-ideas/                  ← R64 destination for new product ideas
│   ├── COMPETITIVE_INTEL.md
│   ├── SUPABASE_RLS_CRISIS.md
│   └── TGP_PRODUCT_VISION.md
├── handoffs/                           ← session-ending operator briefings
├── audits/                             ← code/UX/security audit reports
├── design/                             ← design doctrine, intelligence docs
├── operator-meta/                      ← landmines, dedup notes, sprint logs
└── scripts/                            ← agent tooling (autopush etc)
```

When creating a file in a subdir that doesn't exist yet (e.g. `strategy/feature-ideas/`), create the directory in the same commit.

---

— Codified per operator directive, 2026-05-28 21:42 PT
