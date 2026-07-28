# IPO Product Decision Filter

**Status:** Preserved executive product doctrine. **Not** a numbered R-rule — it is recorded here verbatim so it cannot be lost (R15/R64), pending separate formal rule governance and a `DECISION_LOG.md` entry by the operator.

**Applies to:** every product call — features, scope cuts, architecture, pricing, copy, rollout, deprecation.

---

## Operator's words (verbatim)

> "How can I get the good without the bad? Is this what a hyperscaler would do? How would Elon make this better? IS THIS AN IPO PRODUCT OR A MVP DISGUISED?"

---

## The four questions (mandatory, in order)

Every product decision must answer all four **in writing** before build starts. An unanswered question is a `REVISE`.

### 1. Good without the bad

Name the upside. Name the downside and the **second-order** harm — what this does to the next feature, the on-call rotation, the support queue, the data model, and the user who already depends on today's behaviour. Then design so the upside survives and the harm is eliminated, not merely accepted or deferred. "Acceptable tradeoff" is not an answer until you have shown that the harm cannot be designed out.

### 2. Is this what a hyperscaler would do

Compare the decision against hyperscaler-grade patterns in all five dimensions:

- **Reliability** — failure modes, retries, idempotency, graceful degradation, blast radius.
- **Security** — authz at every boundary, least privilege, PII handling, secrets, audit trail.
- **UX** — empty/loading/error states, latency budget, accessibility, no dead ends.
- **Observability** — can we prove it works in production without asking a user?
- **Scalability** — behaviour at 10× and 100× data and traffic, and cost curve.

A gap in any dimension must be closed or explicitly filed with an owner and a date.

### 3. How would Elon make this better

Apply the five-step method **in this order** — the order is the method:

1. **Question the requirement.** Trace it to a named user or business need. Unowned requirements are deleted, not built.
2. **Delete.** Remove unnecessary process, steps, layers, and complexity. Deleting the *wrong* thing is the failure mode — see the quality bar in §4.
3. **Simplify and optimise** what survives deletion.
4. **Accelerate** cycle time — only after 1–3, never before.
5. **Automate** — last. Automating an unquestioned, unsimplified process cements the waste.

### 4. IPO product or MVP disguised

Reject any proposal that is an MVP wearing IPO clothing: demo-grade paths, hardcoded happy cases, silent failures, missing states, untested edges, or "we'll harden it later."

**The quality bar — what may and may not be cut:**

| May be cut | May **not** be cut |
| --- | --- |
| Complexity | Required functionality |
| Layers, indirection, premature abstraction | User-visible completeness |
| Process and ceremony | Quality |
| Scope that no user asked for | Safety |
| | Acceptance criteria |

Deletion under §3.2 is authorised against the left column only. A "simplification" that lands in the right column is a scope cut in disguise and must be rejected or escalated to the operator.

---

## Decision record template

Copy this into the PR body, brief, or `DECISION_LOG.md` entry for the decision.

```markdown
### Decision: <one line>
Date: <YYYY-MM-DD> · Owner: <name>

**Evidence** — what we actually know, with links (data, audit, user report, code path).
Not "we think"; cite the source.

**Tradeoffs** — upside, downside, second-order harm, and how the harm is designed out.
(Q1)

**Hyperscaler comparison** — reliability / security / UX / observability / scalability.
State the pattern matched, or the gap + owner + date. (Q2)

**Complexity removed** — requirements questioned, steps/layers/process deleted,
what was simplified. Confirm nothing in the may-not-cut column was touched. (Q3)

**Functionality preserved or enhanced** — the user-visible behaviour and acceptance
criteria that still hold, and how they were verified (not assumed). (Q4)

**Quality-bar test** — IPO-grade or MVP disguised? Name the evidence that settles it.
(Q4)

**Decision: BUILD | REVISE | KILL**
- BUILD — all four questions answered, quality bar met.
- REVISE — a question is unanswered or a gap is open. State what must change.
- KILL — requirement has no owner, or the upside cannot survive without the harm.
```

---

*Owner:* Bradley Gleave <bradley@bradleytgpcoaching.com>
*Recorded:* 2026-07-28
