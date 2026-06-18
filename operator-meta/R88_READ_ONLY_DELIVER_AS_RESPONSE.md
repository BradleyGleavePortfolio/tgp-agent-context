# R88 — Read-Only, Deliver-As-Response Audit Pattern

**Status:** ACTIVE (codified 2026-06-18 after TM-9a Lens A returned a principled refusal that crystallized the right pattern)
**Supersedes:** prior implicit "auditor pushes own report" model that R85 v3 already deprecated
**Pairs with:** R72 (independent auditors), R74 (commit identity), R85 v3 (checkpoint pushes), R87 (refusal IS a finding)

## The pattern

An auditor sandbox is ephemeral and identity-bound. Asking the auditor to *push* their own findings under `bradley@bradleytgpcoaching.com` creates two problems:

1. **Circular authorization** — the auditor is being asked to sign a commit as the operator before the operator has read the verdict. That isn't auditor independence; it's operator-by-proxy.
2. **Loss on infra death** — if the sandbox dies between writing the report and pushing it, all audit work is lost. Wave 4 lost ~80% of audits this way in a single afternoon.

R88 says: **the auditor's deliverable is the report content in the response message, not a pushed commit.**

## Required auditor workflow (verbatim for briefs)

1. Clone ctxrepo and backend to scratch dirs in the sandbox. Read-only operations only on backend; ctxrepo is read for context.
2. Audit per your lens charter using full read access to repo state, CI logs, prior findings.
3. Write your full report to `/tmp/ctxrepo/handoffs/audit-reports/in-progress/<task>-<lens>-<sha>.md` as a checkpoint — this is durability insurance per R85 v3, not your deliverable.
4. **Deliver the full report content as the text of your final response message.** Not a summary, not a link — the actual report body. The operator reads it in the conversation and decides what to push.
5. If you make any commits during your work (e.g., checkpoint pushes per R85 v3), they must be signed `bradley@bradleytgpcoaching.com` per R74 with no AI/Claude/Computer/Agent/Co-Authored tokens.

## Why this is correct (the hyperscaler frame)

Apple, Google, and Notion do not have outside auditors push their own findings to production trunk before the company reads them. Auditors deliver written reports; reviewers integrate. R88 mirrors that.

It also gives us a real disaster-recovery property: even if the sandbox dies mid-audit, the partial report in `in-progress/` is recoverable, and a returned response with the full text is durable in the conversation history regardless of sandbox state.

## What this is NOT

- NOT a license to skip the in-progress checkpoint write — keep doing that per R85 v3.
- NOT a license to deliver a short summary instead of the report. Full findings, full evidence, full verdict, in the response.
- NOT a relaxation of R72. Auditor independence and refusal authority are unchanged.

## Brief preamble snippet (paste into all audit briefs)

> Per R88, your deliverable is the full report content in your response message. Write a checkpoint to `/tmp/ctxrepo/handoffs/audit-reports/in-progress/<task>-<lens>-<sha>.md` per R85 v3 for durability, but do NOT push the final report yourself. Operator pushes after review. This avoids circular authorization and preserves your work if the sandbox dies.

## Provenance

This pattern was proposed by the TM-9a Lens A auditor (GPT-5.5 instance) on 2026-06-18 after correctly identifying the authorization circularity in the prior dispatch model. The auditor's refusal IS a finding per R87 and the pattern they proposed is now binding doctrine.
