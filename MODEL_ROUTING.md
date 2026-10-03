> **Canonical model routing for TGP. Effective 2026-09-30 17:05 PDT by owner directive** ("Replace the document in github for model slicing and tiering with this one with corrected model names - updated for latest, best AI model usage"). It replaces the earlier T0-T4 doctrine (Luna/Terra/Sonnet 5/Opus 5/Fable 5.1 table), whose archived copy remains at `tgp-private-evidence/execution/64e33dc7/handoff/owner-inputs/` as history only. Source document: [governance/TGP_T0-T4_Model_Routing.docx](governance/TGP_T0-T4_Model_Routing.docx). Audit independence and evidence rules stay in [AGENT_RULES.md](AGENT_RULES.md).
>
> Routing: T0 GPT-6 Luna; T1 GPT-6 Luna; T2 GPT-6.1 Sol; T3 Claude Opus 5.5; T4 Claude Opus 5.5 + GPT-6.1 Sol. Kimi K3 is bounded parallel overflow only.

------------------------------------------------------------------------

**T0-T4**

**PR / Slice Grading & AI Model Routing Doctrine**

*A deterministic system for grading engineering work and assigning the correct coding agent*

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>PRIMARY OBJECTIVE</strong></p>
<p>Minimize expected wall-clock time to a correct, integrated customer outcome. Credit usage is secondary. The tier controls the default builder. No operator may downgrade a task merely because it 'looks easy' or because a cheaper model is available.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**CLASSIFY FIRST. ROUTE SECOND. EXECUTE THIRD.**

**1. Core Rule**

Every PR and every independently executable slice MUST be graded T0, T1, T2, T3, or T4 before implementation begins. The grade is based on consequence, ambiguity, system reach, and irreversibility — not diff size, estimated LOC, or subjective importance.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>MAX-TIER RULE</strong></p>
<p>A task receives the HIGHEST tier triggered by any material part of the change. A 2-line authorization change is T4. A 300-line isolated presentation component may still be T1. Size never lowers consequence.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**1.1 Canonical builder routing**

| **Tier** | **Canonical builder** | **Reasoning** | **Typical work** | **Substitution rule** |
|----|----|----|----|----|
| **T0** | GPT-6 Luna | Low | Non-behavioral / mechanical | No stronger model by default; stronger allowed only if bundled with higher-tier parent work. |
| **T1** | GPT-6 Luna | Medium | Formally bounded implementation | Kimi K3 may be used as bounded parallel overflow; no downgrade below canonical for critical-path work. |
| **T2** | GPT-6.1 Sol | High | Meaningful product behavior within established architecture | No cheaper primary substitute solely for credit savings. |
| **T3** | Claude Opus 5.5 | XHigh | Shared architecture / high-entropy engineering | Parent ownership stays Claude Opus 5.5 even if bounded child tasks are delegated downward. |
| **T4** | Claude Opus 5.5 + GPT-6.1 Sol | High | Critical correctness boundaries | No downward substitution. Strongest available equivalent may replace only by explicit doctrine update. |

**Important:** Model names above are the current proposed routing policy for TGP. If the tool stack changes, update this table explicitly; do not let individual agents invent local substitutions.

**2. Definitive PR / Slice Grading Procedure**

Grade the work by running the following decision tree in order. The first applicable higher-tier trigger wins. If uncertain between two tiers, choose the higher tier until evidence proves the lower classification.

1.  STEP 1 — T4 trigger scan. Does the change alter a critical correctness boundary? If YES: T4. Stop grading.

2.  STEP 2 — T3 trigger scan. Does the change require system-boundary, ownership, architecture, lifecycle, or cross-domain design decisions? If YES: T3.

3.  STEP 3 — T2 trigger scan. Does it create/change meaningful runtime product behavior or require nontrivial debugging/engineering judgment inside an established architecture? If YES: T2.

4.  STEP 4 — T1 boundedness test. Does it change runtime behavior, but satisfy EVERY bounded-task criterion? If YES: T1.

5.  STEP 5 — T0 test. If it changes no runtime behavior, no contracts, no persisted data, no privilege, and is mechanically reversible/verifiable: T0.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>NO AVERAGING</strong></p>
<p>Do not average risk across a PR. If 95% is T1 and 5% touches payout ledger correctness, the PR is T4 unless the T4 piece is separated into its own slice.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**3. T4 — Critical Correctness Boundary**

T4 is defined by consequence, not difficulty. Any material error can expose customers, money, secrets, tenant boundaries, irreversible data, or recovery guarantees.

- Authentication, authorization, session trust, permission evaluation, role/ownership enforcement.

- RLS, tenancy isolation, cross-tenant access, organization boundaries.

- Credentials, secrets, signing keys, token handling, cryptographic trust.

- PII, health/sensitive data controls, privacy enforcement, deletion/export guarantees.

- Money correctness: balances, fees, payouts, refunds, disputes, settlement, ledgers, reconciliation.

- Destructive or irreversible data mutation; production deletion; irreversible migrations.

- Backup/restore, disaster recovery, canonical source-of-truth recovery.

- Security enforcement, trust policy, privileged production actions.

**T4 grading examples**

- Change a Stripe/Adyen fee calculation by one line → T4.

- Change tenant scoping in a repository query → T4.

- Modify account deletion semantics → T4.

- Rename a CSS class in the payments screen without changing behavior → not T4; classify normally.

**4. T3 — Shared Architecture / High-Entropy Engineering**

T3 applies when the implementation cannot be fully specified without first deciding system boundaries, ownership, lifecycle, contracts, or multi-subsystem behavior.

- Creates or materially changes a shared abstraction or platform primitive.

- Changes a contract consumed by multiple major domains.

- Spans backend + mobile + importer and requires deciding authoritative ownership.

- Changes lifecycle, idempotency, replay, retry, reconciliation, or concurrency semantics across components.

- Requires choosing where state authority lives.

- Introduces a new infrastructure primitive or changes a core shared service boundary.

- Root cause / blast radius is not initially known and requires broad repository archaeology.

- A fix in one subsystem can invalidate assumptions in multiple other subsystems.

**T3 examples**

- Decide whether importer run state is authoritative in extension, backend, or mobile → T3.

- Replace a shared event/retry model consumed by multiple domains → T3.

- Architect a new cross-repo contract and migration path → T3.

**5. T2 — Meaningful Product Behavior**

T2 is normal substantial engineering: meaningful behavior changes inside an already-established architecture. The worker may decide HOW to implement the accepted behavior, but should not redefine the system's fundamental ownership or contract model.

- New user-visible feature behavior using existing platform patterns.

- Nontrivial state transitions contained inside one established subsystem.

- Multi-file implementation requiring judgment but no new shared architecture.

- Debugging where root cause is unknown but expected to remain local.

- New endpoint behavior inside an existing service pattern.

- Importer reconstruction for an already-defined entity model.

- Moderate refactor contained within one subsystem.

- Mobile/backend integration using established interfaces.

**6. T1 — Formally Bounded Implementation**

T1 exists only when the work changes runtime behavior AND all bounded-task requirements are satisfied before dispatch.

| **Criterion** | **Required condition** | **If false** |
|----|----|----|
| **Outcome bounded** | One explicit behavioral outcome is stated. | NOT T1 — promote and re-grade. |
| **Surface bounded** | Expected subsystem/module and likely implementation area are identified. | NOT T1 — promote and re-grade. |
| **Contract bounded** | Inputs, outputs, invariants, and failure behavior are already known. | NOT T1 — promote and re-grade. |
| **Dependency bounded** | No new cross-system dependency or architecture must be invented. | NOT T1 — promote and re-grade. |
| **Decision bounded** | Product and architectural decisions are already made; worker executes them. | NOT T1 — promote and re-grade. |
| **Blast-radius bounded** | Failure stays local and is cleanly reversible. | NOT T1 — promote and re-grade. |
| **Verification bounded** | Objective pass/fail checks can prove the requested behavior. | NOT T1 — promote and re-grade. |
| **Privilege bounded** | No auth, tenancy, credentials, PII, money, destructive, or other T4 boundary. | NOT T1 — promote and re-grade. |
| **Data bounded** | No irreversible migration or reinterpretation of existing persisted data. | NOT T1 — promote and re-grade. |
| **Discovery bounded** | A competent worker does not need broad repository archaeology to discover what should be built. | NOT T1 — promote and re-grade. |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>FORMAL DEFINITION OF BOUNDED</strong></p>
<p>A task is bounded only when ALL ten criteria above are true. 'Small', 'easy', 'few files', 'low LOC', 'obvious to me', or 'probably safe' are NOT boundedness criteria.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**T1 examples**

- Add an already-defined field to a DTO and propagate it through known consumers with explicit tests → T1.

- Implement adapter B using adapter A as the mandated pattern, with fixed inputs/outputs → T1.

- Update deterministic generated client types and known call sites after an already-approved contract change → T1.

- Investigate why identities collide and decide the correct identity model → NOT T1; likely T3.

**7. T0 — Mechanical / Non-Behavioral**

T0 is work that cannot alter runtime product behavior and is mechanically verifiable and reversible.

- Documentation, comments, spelling/grammar, formatting.

- Purely cosmetic non-behavioral UI changes where interaction/accessibility semantics are unchanged.

- Deterministic rename with validated references and no public-contract change.

- Generated metadata refresh when generation logic is unchanged.

- Test-description cleanup that does not alter assertions or runtime fixtures.

**Disqualifiers:** runtime behavior, schema/contract change, persisted data, privilege, build/release semantics, security, money, or any unclear behavioral consequence.

**8. Grade Slices Before PRs — Then Grade the PR**

A PR can contain multiple slices, but each slice must be independently graded first. The PR's grade equals the highest slice grade it contains.

- If a T4 slice can be cleanly separated from otherwise T1/T2 work, split it. This keeps expensive audit/model requirements focused.

- Do NOT split purely to hide coupling. If two slices share one invariant or must land atomically, grade the combined unit at the higher tier.

- If a supposedly T1 slice discovers a higher-tier concern during implementation, stop that slice, record the trigger, and re-grade before continuing.

**8.1 Required grading record for every slice**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>TIER HEADER — REQUIRED</strong></p>
<p>Tier: T#<br />
Why: [one-sentence consequence/complexity rationale]<br />
T4 trigger scan: [none / exact trigger]<br />
T3 trigger scan: [none / exact trigger]<br />
Bounded T1: [YES/NO + failed criteria if applicable]<br />
Canonical builder: [model]<br />
Parent owner: [model/operator if delegated]<br />
Acceptance evidence: [specific tests/checks/user outcome]<br />
Promotion triggers: [what would force re-grade]</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**8.2 PR size gate (owner directive 2026-10-03)**

Owner (verbatim): "anything over 1500 lines becomes a liability one day and a slow-down. Splitting the PR into logical pieces can, in some cases, alleviate this problem."

- Trigger: a PR whose diff exceeds 1,500 changed lines (additions + deletions; lockfiles, generated files and snapshots excluded; tests count and are reported separately).
- When: the operator assesses it at the FIRST READY FOR AUDIT after the builder's first push, before the first full audit starts, and again whenever a fix round pushes a PR past the trigger.
- How: the operator posts a SIZE ASSESSMENT comment on the PR: lines (source / tests / migrations / docs), the logical seams, the coupling between them, and a decision with its reason:
  - SPLIT when seams exist that can each merge safely on their own: every piece compiles, passes CI, carries its own tests, and is inert or flag-gated until the last piece lands. Shape: stacked PRs (each based on the previous piece's branch), each targeting under ~800 lines of non-test source, merged in order.
  - KEEP when the change is one atomic invariant (a partial merge would leave money, auth, privacy or data unsafe), or when its audits have already converged (dual APPROVE, or one narrow finding left). Verified audit state is value; do not destroy it to hit a number.
- Prevention: slices are sized at grading time (section 8) to land under the trigger; every builder brief states the size budget.
- Enforcement (least cost, per AGENT_RULES G22): the operator assessment above; a non-blocking Danger warning on PRs over 1,500 lines that links the assessment is a follow-up for the product repos after launch. No hard cap.
- Why (leader lenses the owner asked for): Musk, "the best part is no part": question the requirement and delete before you optimize or audit it. Bezos, two-way doors: small changes are cheap to review, merge and revert; giant PRs turn every merge into a one-way door. Huang, speed of light: review throughput sets the floor on cycle time, and a 10,000-line PR cannot converge in one round, so the gap between the floor and reality is paid in extra rounds.

**9. Mandatory Promotion Rules**

A lower-tier worker does not get unlimited retries. Because TGP optimizes for wall-clock time, unexpected ambiguity is a routing signal.

- A worker cannot identify the root cause after one focused attempt.

- The implementation requires changing an invariant not supplied in the brief.

- The worker proposes a new abstraction or shared dependency.

- Scope expands into another major subsystem.

- The existing code contradicts the accepted contract or architecture.

- The proposed fix is a workaround around an unresolved root cause.

- A T4 boundary is discovered.

- The acceptance test cannot be stated objectively without making a new product decision.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>ONE-STRIKE PROMOTION</strong></p>
<p>On the first material promotion trigger, stop repeating the same weak-agent attempt. Re-grade the slice and route it to the canonical higher tier. The goal is not to prove a cheap model can eventually solve it; the goal is to finish TGP faster.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**10. Higher-Tier Parent, Lower-Tier Children**

A T3 or T4 parent task does not require every line of implementation to be written by the parent model. The parent may decompose clearly bounded child slices and route those children independently.

| **Unit** | **Builder** | **Responsibility** |
|----|----|----|
| **Parent T3** | Claude Opus 5.5 | Decide authoritative importer lifecycle ownership and cross-repo contract. |
| **Child T2** | GPT-6.1 Sol | Implement backend lifecycle behavior under the approved architecture. |
| **Child T1** | GPT-6 Luna | Propagate the approved contract through named mobile consumers. |
| **Child T1 overflow** | Kimi K3 | Generate/extend fixtures and mechanical call-site updates under fixed contract. |

**Parent-retention rule:** The higher-tier parent retains architecture, integration, audit disposition, and final correctness ownership. Delegation of implementation does not delegate the parent decision.

**11. Kimi K3 / Parallel Overflow Policy**

Kimi K3 is used to increase concurrency, not to create arbitrary model-routing drift.

- Allowed: T0/T1 work that independently satisfies the formal boundedness test.

- Allowed: bounded child slices extracted from T2/T3 work after the parent has fixed the contract and acceptance criteria.

- Allowed: repository reconnaissance, dependency inventory, call-site mapping, fixture/test generation, and mechanical migrations.

- Not allowed: silently replacing the canonical T2/T3/T4 primary builder merely because credits are cheaper.

- Not allowed: making unresolved architecture, privilege, data-semantics, or product-direction decisions.

**12. Wall-Clock Optimization Rule**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>THE WALL-CLOCK RULE</strong></p>
<p>When choosing between models, agents, implementation strategies, audit depth, or parallel work, minimize expected elapsed time to a correct integrated customer outcome. Credit cost is secondary unless quality and expected completion time are materially equivalent.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Therefore: the critical path always receives its canonical model or a stronger explicitly authorized equivalent. Weaker/cheaper agents are valuable when they execute bounded work in parallel and do not create extra audit/fix/re-audit cycles.

**13. Fast Classification Matrix**

| **Question** | **T0** | **T1** | **T2** | **T3** | **T4** |
|----|----|----|----|----|----|
| **Runtime behavior changes?** | No | Yes, bounded | Yes | Yes | Maybe / yes |
| **Architecture decision needed?** | No | No | No major | Yes | Maybe |
| **Cross-system ownership changes?** | No | No | No | Yes | If security/money/data boundary |
| **Root cause known in advance?** | N/A | Yes | Not required | Often no | Not required |
| **All bounded criteria required?** | N/A | YES | No | No | No |
| **Auth/tenancy/PII/money/destructive?** | No | No | No | No unless escalates | YES |
| **Default builder** | GPT-6 Luna | GPT-6 Luna | GPT-6.1 Sol | Claude Opus 5.5 | Claude Opus 5.5 + GPT-6.1 Sol |

**14. Worked Grading Examples**

| **Example** | **Grade** | **Why** |
|----|----|----|
| Fix typo in README | **T0** | No runtime behavior; mechanically reversible. |
| Propagate approved \`entity_type\` field through three known DTO consumers | **T1** | Runtime change but outcome, contract, surface, dependencies, blast radius, and tests are bounded. |
| Add a new importer review screen using existing APIs and state model | **T2** | Meaningful user behavior inside established architecture. |
| Determine where importer completion authority belongs across extension/backend/mobile | **T3** | Cross-system ownership and lifecycle architecture decision. |
| Change payout reconciliation or cross-tenant query scoping | **T4** | Money or tenant-isolation correctness boundary. |
| 300-line isolated presentational component with fixed props and no state effects | **T1** | Large diff does not imply high tier; still formally bounded. |
| 2-line authorization conditional | **T4** | Tiny diff does not lower consequence. |

**15. Canonical Drop-In Policy**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>COPY INTO AGENT / OPERATOR RULES</strong></p>
<p>Every engineering PR and independently executable slice MUST be graded T0-T4 before implementation. Grade by the highest triggered consequence/complexity rule, never by LOC or subjective importance. T4 = auth/authorization/RLS/tenancy/credentials/PII/money/destructive/irreversible/security-critical correctness. T3 = shared architecture, cross-system ownership, lifecycle/contracts, or high-entropy root-cause work. T2 = meaningful product behavior inside established architecture. T1 = runtime-changing work that satisfies ALL formal bounded-task criteria. T0 = non-behavioral mechanical work only. Routing is normative: T0→GPT-6 Luna; T1→GPT-6 Luna; T2→GPT-6.1 Sol; T3→Claude Opus 5.5; T4→Claude Opus 5.5 + GPT-6.1 Sol. Kimi K3 may execute formally bounded parallel/overflow work but may not replace the canonical higher-tier primary builder merely to save credits. If a lower-tier worker encounters ambiguity, an unknown invariant, scope expansion, architecture creation, a T4 boundary, or one focused failed attempt without root cause, STOP and re-grade upward. The PR grade equals the highest slice grade it contains. Split higher-risk slices only when they are genuinely separable. Optimize for wall-clock time to a correct integrated outcome; credits are secondary.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**CLASSIFY BY CONSEQUENCE. ROUTE BY RULE. PROMOTE ON AMBIGUITY. OPTIMIZE FOR TIME.**
