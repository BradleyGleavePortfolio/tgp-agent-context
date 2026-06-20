# DOCTRINE_INVARIANTS.md — non-negotiables that apply to every A-item

**Effective:** 2026-06-19
**Owner:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Audience:** every agent building any A-item or any code in TGP.

> This is the consolidated checklist of cross-cutting rules that apply to EVERY line of code, regardless of which A-item you're working on. If a rule is in `AGENT_RULES.md`, this doc points at it — it does not replace it. This doc is the single page you should be able to scan in 60 seconds before opening a PR.

Authority hierarchy: AGENT_RULES.md (R1–R107) > TGP-MASTER-PLAN-v2.md > POST_H_LADDER.md > this file (synthesis only).

---

## §1. Quality bar (R1, R2, R107)

- **R1 (decacorn quality):** Every decision passes the "what would Apple/Notion/Google do?" test. Not "looks pretty" — *correctness of the next decision*.
- **R2:** R1 means "ship correctly," never "ship fast." Velocity excuses are forbidden.
- **R107 (operator voice):** No exclamation points in user-facing copy. No emoji unless operator explicitly requested. Maya voice on operator messaging surfaces. Roman voice in celebration moments only.

**Anti-patterns (P0 release blockers per R1):** permission-front onboarding, feature-dump first screen, unescapable streaks, empty confirmation, inconsistency tax, gamification mismatch, polish-as-afterthought.

---

## §2. Never-lose (R3, R4, R5, R6, R7, R15)

- **R3 (operator identity):** Every commit `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Author AND committer. No AI/agent tokens.
- **R4:** Never lose operator work or time. Anything paid for stays.
- **R5:** Never lose anything (artifacts, decisions, audits, rulings).
- **R6 (push cadence):** Foreground commits, push within 2 minutes of completing any meaningful artifact. No daemons.
- **R7 (subagent push monitoring):** If you spawn subagents, monitor their push cadence. Zombie work = R4/R5 violation.
- **R15 (GitHub as source of truth):** Sandbox-only files are forbidden. Every artifact lives on GitHub.

---

## §3. Audit cycle (R10–R16, R65, R72)

- **R14 (merge gate, verbatim):** Builder → Lens A audit → Lens B audit → Fixer (if non-CLEAN) → re-audit → both CLEAN → merge. No shortcuts, no "trust me" merges.
- **R10:** Audits MUST be exhaustive. No "looks good to me" verdicts.
- **R11:** Auditor independence. Auditor cannot also be builder for same PR.
- **R12:** Auditor brief-refusal is a valid outcome. If a brief is incoherent, refuse and escalate.
- **R13:** Read-only deliver-as-response audit pattern. Audit output is the verdict, not the fix.
- **R16:** Auditor verdict line — STUCK classifier. Every audit ends with a one-line verdict.
- **R65 + R72:** Dual-lens R72 exhaustive cycle. Lens A (Opus 4.8) + Lens B (GPT-5.5) on every audit.

**Dispatch model (POST_H_LADDER):** Builder = Opus 4.8. Auditor = Opus 4.8 Lens A + GPT-5.5 Lens B. Fixer = Opus 4.8 (NEVER Sonnet — R82 violation). Re-audit dual-lens until both CLEAN.

---

## §4. Security (R24–R36, the "end-the-company" rules)

Every PR must clear these or it does not merge:

- **R24:** Zero secrets in source or git history.
- **R25:** RLS enabled with explicit policies on every Supabase table. No exceptions.
- **R26:** No raw SQL with string concatenation/interpolation. Parameterized queries only.
- **R27:** No unsanitized output paths (XSS).
- **R28:** IDOR-proof. Every authenticated endpoint joins to the requesting user/tenant.
- **R29:** Rate limiting on auth + paid-external-API endpoints.
- **R30:** JWT hygiene (issuer, audience, expiry, no `none` algorithm, etc.).
- **R31–R36:** see AGENT_RULES.md — covers CORS, CSRF, headers, secrets-in-logs, etc.

---

## §5. RLS tier-1 financial doctrine (applies hard to A13, also A8, A12)

**Money-movement code is RLS tier 1.** That means:

- Every read of financial state filters by `app.current_user_id()` or `app.current_team_id()`.
- Every write to money tables emits an audit event (`AuditEvent` row with actor_user_id, target, before/after).
- Every transfer is idempotent — re-running the same scheduler row produces no double-charge.
- Every operation is dispute-traceable — given a `PaymentIntent` or `Transfer` id, you can reconstruct who initiated it, when, under which rule, with which idempotency key.
- Tests MUST include: (a) cross-tenant read attempt → denied, (b) duplicate write attempt → idempotent no-op, (c) audit-event presence assertion.

**A13 money-flow engine specifically:** `MoneyFlowRule` rows are tier-1 RLS, head_coach_id and sub_coach_id both gated, all rule executions write `SplitLedgerEntry` audit-traced.

---

## §6. Idempotency invariants

Every operation that crosses an external boundary (Stripe, Mux, OAuth callback, push notification, fulfillment provider, AI provider) MUST:

- Carry an idempotency key on the request.
- Be retry-safe: re-running with same key produces same effect, never duplicates.
- Have a corresponding `*IdempotencyKey` table row (pattern from `WorkoutBuilderIdempotencyKey`, `SubCoachMutationIdempotency`).
- Have a test that simulates double-fire and asserts single-effect.

**A-items where this bites hardest:** A2 (importers — re-import same file), A3 (dunning retry), A7 (autopilot re-run for same week), A8 (lead funnel auto-assign), A12 (referral first-payment trigger), A13 (money-flow scheduler).

---

## §7. AI cost gating (R-flows-through-T3.B)

Every AI call (Claude, GPT, Whisper, embedding) MUST:

- Flow through Coach AI Budget (`ai-credits/`, `CoachAIBudget`, `UserAIQuota`).
- Land within the T3.B AI usage economics cap: **$40 floor / 3.125× multiplier / $125 ceiling** per coach/month.
- Be cost-traceable (model, input tokens, output tokens, cost in cents → `AiSpendLog` or equivalent).
- Be cancellable on budget exceed (graceful degradation, not crash).

**A-items where this matters:** A3 (AI-suggested drafts), A7 (autopilot writes), A9 (AI triage), A11 (check-in summaries), A12 (celebration popup is non-AI — exempt).

---

## §8. UX / motion / accessibility

- **Motion:** All transitions ≤300ms. No bouncy springs unless explicitly designed by Stillwater.
- **Accessibility:** All interactive elements have accessible labels; minimum tap target 44×44pt; text contrast meets WCAG AA.
- **Empty states:** Every empty state is an onboarding moment (R1 anti-pattern: "feature-dump first screen" violates).
- **Error states:** Every error has a recovery path. No dead-ends.
- **Loading states:** ≤500ms shows skeleton, ≥500ms shows progress, ≥3s shows estimate. Never a bare spinner indefinitely.

---

## §9. Anti-badge-theater doctrine (applies hard to A12, C2)

**Loyalty/referral/reward features must pass the anti-badge-theater test:**

- Genuine outcome > vanity gamification. A badge for "logged in 7 days" is theater; a badge for "client hit 5 PRs in a quarter" is signal.
- Rewards are personal by default. Leaderboards opt-in, not opt-out.
- No proxy-behavior rewards (rewarding the metric instead of the outcome).
- Operator review required before any new reward type ships.

---

## §10. Voice / copy

- **Maya voice** on operator-facing messaging surfaces (coach inbox, daily brief, error copy). Calm, direct, never effusive.
- **Roman voice** in celebration moments (referral popup A12, badge celebration A10, Day-1 Win). Bold, vivid, but never gimmicky.
- **No exclamation points** in non-celebration UI copy (R107). Operator-stated rule.
- **No emoji** unless operator explicitly requested for that surface.
- **No marketing hype** in product copy. State what the thing does, not how amazing it is.

---

## §11. The pre-PR checklist

Before opening any PR, verify:

- [ ] R3: commit identity is `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- [ ] R15: pushed to GitHub (not sandbox-only)
- [ ] R25: RLS policy in place if touching Supabase tables
- [ ] R28: endpoint joins to authenticated user/tenant
- [ ] R29: rate limit in place if auth-touching or external-API-touching
- [ ] §5: if touching money, audit event emitted + idempotent
- [ ] §6: if crossing external boundary, idempotency key + test
- [ ] §7: if AI call, flows through Coach AI Budget
- [ ] §8: motion ≤300ms, a11y labels, recoverable errors
- [ ] §10: voice/copy correct, no exclamations, no unrequested emoji
- [ ] R22: ran repo pin/doctrine tests
- [ ] R23: LOC soft cap respected (or [LOC-EXEMPT] justified)
- [ ] R14: scheduled for dual-lens audit cycle (Lens A + Lens B)

If any box is unchecked, the PR is not ready to open. Going through this list takes 2 minutes; fixing post-audit takes hours.

---

**End of doctrine invariants.** Cross-cutting rules; every A-item inherits these regardless of scope. Item-specific scope lives in the per-A-item spec stubs at `roadmap/specs/`.
