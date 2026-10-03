# TGP Sub-Manager Handoff: six PRs to merge-ready (sub-manager 114-S)

Issued by operator agent 114 at 2026-10-02 18:25 PDT. Everything here was checked live on GitHub at 18:15–18:20 PDT.
Copy in the repo: `tgp-agent-context/handoffs/op-114/TGP-SubManager-Handoff-114S.md`.

This document is written for a session that knows nothing about TGP. Read it top to bottom once, then work from Section 6 (the loop) and Section 4 (your PR cards).

---

## 0. The 60-second version

- **You are sub-manager 114-S**, a second Computer session working under **operator agent 114**. Owner: Bradley.
- **Your job:** take exactly six PR sets (Section 4) from their current stage to **merge-ready**. Merge-ready means:
  - both required audits say APPROVE at the exact current head;
  - all required checks are green at that head;
  - GitHub shows the PR as CLEAN (up to date with main, no conflicts).
- **How:** you grade, route, verify and record. Claude Opus 5.5 builder subagents write the fixes. Two independent audit subagents (one Claude Opus 5.5, one GPT-6.1 Sol) review every head.
- **Agent 114 is the only one who merges**, deploys, flips flags, changes settings, and talks to Bradley about decisions. You never merge.
- **Channel:** GitHub. You write PR comments and one status file (`handoffs/op-114/SUB_STATUS.md`). You read the operator's file (`handoffs/op-114/OPERATOR_NOTES.md`) every loop.
- **Bar:** hyperscaler quality. Wall-clock time is the #1 resource, and quality still outranks the date. Get it right the first time, with no audit ping-pong.

---

## 1. Chain of authority and what you may do

| You MAY | You may NEVER |
|---|---|
| Clone repos, create worktrees, read anything | Merge a PR, enable auto-merge, close or reopen PRs |
| Launch up to **4 concurrent subagents** (Section 5) | Push to `main`, or push to any branch not listed in Section 4 |
| Have your builders push commits to the head branches of **your** PRs: fix rounds, merges of `origin/main`, conflict fixes | Use GitHub's "Update branch" on PRs that aren't yours, or touch any PR in Section 7 |
| Edit the PR body of your PRs (tier header, Fix round table) | Dispatch any `workflow_dispatch` workflow (deploy, flags, secrets), touch production, Fly, Supabase, Stripe or Expo |
| Re-run a failed CI job on your PR **once** for the known flake (Section 8) | Change branch protection, repo settings, flags or env manifests |
| Post PR comments: AUDIT verdicts, FIX ROUND notes, READY FOR OPERATOR MERGE | Start an EAS build or update (Expo Free; spending money is forbidden) |
| Write **only** `handoffs/op-114/SUB_STATUS.md` in tgp-agent-context | Edit `LIVE_STATE.md`, `LAST_OPERATOR_STATE.md`, `OPERATOR_NOTES.md` or any other context file |
| Ask the operator questions with `NEEDS OPERATOR:` lines | Message Bradley first. If Bradley talks to you, answer him directly and end with "Your next step: …" or "Nothing needed from you." |

One writer per PR: from now on, only your builders push to your six PR branches. Agent 114 never pushes to them; it only merges.

---

## 2. Law, mentality and routing (binding)

Read these files from `BradleyGleavePortfolio/tgp-agent-context` (main) before launching anything:
1. `AGENT_RULES.md`: rules G01–G22. **This is the law and outranks everything else, including this document.**
2. `MODEL_ROUTING.md`: T0–T4 grading. Every one of your PRs is **T4**. T4 means two independent audits (Claude Opus 5.5 and GPT-6.1 Sol) at the exact head, and Claude Opus 5.5 builders.
3. `handoffs/op-c67c61cf/AGENT_BRIEF_COMMON.md`: the subagent common brief. Use its sections "Governing rules", "Sandbox limits", "Git and GitHub", "PR body contract", "Audit contract", "Reports" and "Final answer". Its "Facts at 16:20" section and its references to "operator agent 113" are stale. The operator is now **agent 114**, and you are its sub-manager.

Rules you will hit most often:
- **G01 / claims bind to evidence.** Never say "done", "fixed" or "approved" without a link to the commit, the green check at the exact head, or the AUDIT comment. Use the claim ladder exactly: implemented → tested → reviewed → merge-eligible. Everything after merge-eligible (merged, deployed, flag on, device-verified) is the operator's.
- **A changed head means new evidence.** Approvals attach to one 40-character SHA. Any push, including a merge of main, needs the lenses to attest the new head. A clean main merge needs a delta check only: confirm the merge commit and conflict resolutions, and that nothing else changed.
- **Gates fail closed.** Block on material findings. APPROVE only with zero A and zero B findings.
- **Builders never audit their own change. Auditors never push code.**
- **Commit identity does not matter** (owner ruling). Commit with `git -c user.name="TGP Sub-Manager 114-S" -c user.email="agent@tgp.invalid" commit ...`. Never stop, ask or comment about author or signing. Never falsify provenance, approvals or test results.
- **Product rules:**
  - Personal training only, no medical claims.
  - Never name the clinic partner anywhere (say "clinic partner"), and never commit the coach welcome-message text.
  - `tgp-agent-context` is PUBLIC.
  - Shipped UI copy is Quiet Luxury: no emojis, no exclamation marks, plain warm words, no "we/us" in client-facing error copy.
  - **No generic errors ever.** Every failure says what happened and gives a working next action. Unknown failures show a short reference and a support path, and report to Sentry without personal data.
- **Owner standing bar (verbatim):** "ANYTHING LESS THAN HYPERSCALER QUALITY IS A DAY 1 BLOCKER / WALL CLOCK TIME IS KEY #1 RESOURCE / DO IT RIGHT, DO IT SMOOTH - SMOOTH IS FAST / I WANT MORE, NOT LESS FUNCTIONALITY IF THE CHOICE ARISES" and "I WANT A PRISTINE USER EXPERIENCE, AMAZING AHA MOMENTS, AND APPLE LEVEL UI SIMPLICITY AND SCREEN FLOWS".

Mentality (EXECUTE doctrine): act like an owner for your six PRs. Decide, delegate, prove, audit, remediate, re-audit, record, continue. Escalate only real decisions (Section 9), never chores. Avoid permission theater, process theater, green-check delusion (green CI is not an audit) and false certainty.

---

## 3. Glossary (you have no memory, so these terms are defined here)

- **Head:** the PR's current commit SHA. **Exact head** means the full 40-character SHA.
- **Lens:** one independent auditor model. **L-OPUS** is Claude Opus 5.5 and **L-SOL** is GPT-6.1 Sol. T4 needs both lenses to APPROVE at the same head.
- **Round:** one builder push that answers audit findings. **Round N** is the Nth fix round on that PR.
- **Delta audit:** a lens re-checks only what changed since its own last verdict (`git diff <old>..<new>`). It first confirms each of its prior findings is closed with code and a test, then hunts for new defects in the delta.
- **Findings:** IDs look like `B-326-2` (severity-PR-number). A = blocker, B = must fix before merge, C = optional.
- **BEHIND:** main moved ahead. Both repos require branches to be up to date (strict), so the builder merges `origin/main` into the branch (a merge commit, never a force-push) and both lenses delta-attest.
- **DIRTY:** merge conflict with main. The builder resolves it in a merge commit, and both lenses delta-attest the resolution.
- **Stacked PR:** its base is not `main`. Stacked PRs get no CI.

Stages used below:

| Stage | Meaning |
|---|---|
| **S1** | Builder work needed: CI red and/or open A/B findings, or a conflict |
| **S2** | Fix pushed, CI green, waiting on audits |
| **S3** | Audits running |
| **S4** | Merge-ready: post the READY signal |
| **S5** | Merged by the operator: you're done with that PR |

---

## 4. Your six PR sets (state at 2026-10-02 18:20 PDT)

All six are **T4**. Re-read each PR live before acting, because heads may have moved.

| # | PR set | Head now | Round | Stage | Immediate next action |
|---|---|---|---|---|---|
| 1 | mobile #305: OTA updates (expo-updates) | `279dd8e3` | R4 pushed + operator main merge | S2 | Full dual re-audit |
| 2 | mobile #317: Apple Health / Health Connect | `cf387e88` | S-WEAR-3 round pushed | S2 | Sol re-audit + Opus delta |
| 3 | mobile #326: AI-consent errors on every AI surface | `16e7e97c` | R2 (Sol RC 0/1/0) | S1 | Builder round 3, then Sol + Opus delta |
| 4 | mobile #315: trust-center policy links | `d545f5b6` (DIRTY) | R3 (Sol RC 0/1/0) | S1 | Builder round 4 (conflict + B-315-1), then dual |
| 5 | backend #634 + mobile #325: booking lifecycle (pair) | `bb6f3ea8` / `268ed81b` | #634 R2 pushed; #325 needs a main merge | S2 / S1 | Dual re-audit #634; main merge + dual delta on #325 |
| 6 | backend #651: live Roman grounding | `33a86da4` | R0 (never audited, CI red) | S1 | Builder fixes two test type errors, then first full dual audit |

### Card 1: mobile #305 `feat(release): expo-updates OTA (fingerprint runtime; clinic, production and preview channels)`

https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305

- **Tier:** T4. Re-graded up from T3 because the release guard handles a credential, and it changes a dependency (expo-updates).
- **Head:** `279dd8e3`. This is round 4 at `ba912944` plus agent 113's merge of main `aae30ac0`.
- **CI:** 3/3 required checks green. CLEAN.
- **Last verdicts**, both at `92c25ec8`:
  - Opus REQUEST CHANGES: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305#issuecomment-5961013415
  - Sol REQUEST CHANGES, 0/4/3: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305#issuecomment-5961255965
- **Round 4 note:** https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305#issuecomment-5963397471. It claims to close:
  - B-305-5: rollout guard
  - B-305-6: OTA source maps to Sentry, plus update-id tags
  - B-305-8: no values in diagnostics
  - B-305-9: real-value checks reusing #333
  - Anti-brick: updates apply only on cold start, never mid-session
- **Do:** run a full re-audit by both lenses at the current head. Each lens re-verifies its own findings and then hunts for new defects, including the main-merge resolution.
- **Rulings in force (OR-113-8), not yours to change:**
  - C-305-7: keep iOS buildNumber "6"; the owner confirms in App Store Connect.
  - C-305-2: on-device checks are a hard gate before the first clinic or production publish. These belong to the operator.
  - C-305-3: EAS Owner/Admin/Developer roles stay owner-only.
- **Never** run `eas update` or `eas build`.
- **Neighbours:** #317 and #325 also touch `app.json`. Whichever merges second keeps both changes.

### Card 2: mobile #317 `fix(wearables): S14 [T4] Apple Health / Health Connect connect, 30-day import, health and sleep views`

https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317

- **Head:** `cf387e88`, which already includes main `aae30ac0`.
- **CI:** green. CLEAN.
- **Last verdicts**, both at `58c2d53f`:
  - Opus APPROVE: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961091995
  - Sol REQUEST CHANGES, A0/B3/C2: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5961170156
- **Open Sol findings** the S-WEAR-3 round claims to close:
  - B-317-6: closing or unmounting during identity capture must cancel Connect.
  - B-317-7: Health Connect must not read further pages or types after logout.
  - B-317-8: cloud connect must honour failure status and code, and keep the support reference.
  - C-317-5: the Samsung source and ACTIVITY_RECOGNITION are removed or blocked, leaving only the 15 Health Connect reads.
  - Also in the round: per-state permission copy, and no re-prompt after the user revokes access.
- **The record is the PR body's Fix round table.** There is no FIX ROUND comment, so have the builder-of-record note this. If the table is missing, post a FIX ROUND comment summarising commits `92035929`, `f2edbdef` and `cf387e88`.
- **Do:**
  - Sol re-audits at the current head.
  - Opus runs a delta `58c2d53f..<head>`.
- **After merge (operator's job, not yours):** release order OR-113-11, and the 8 device checks listed in the PR body.

### Card 3: mobile #326 `fix(ai): handle ai_consent_required and ai_egress_blocked on every AI surface`

https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/326

- **Head:** `16e7e97c` (round 2). BEHIND main.
- **Verdicts at `16e7e97c`:**
  - Opus APPROVE: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/326#issuecomment-5963155216
  - Sol REQUEST CHANGES, 0/1/0: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/326#issuecomment-5963424377
- **Open B-326-2 (partial).** The identity fence stops before the response is consumed or retried:
  - `src/components/ai/AiConsentSheet.tsx:236-264` checks only whether the component is still mounted after the grant await.
  - The reconciliation GET at `:206-234` has no originating-identity fence.
  - `grantAiChoiceAs` checks identity before dispatch, not after the grant settles.
  - Meanwhile `signOut` empties the synchronous user cache while authenticated screens are still mounted. A held grant can settle in that window, and `AiRefusalNotice.onGranted` then calls the old account's `onRetry`.
- **Builder round 3:**
  1. Merge `origin/main`.
  2. After every await (grant settle, reconciliation GET), and before `onGranted` / `onRetry`, check `sessionUserId() === uid` or a session epoch. A stale completion does nothing visible.
  3. Add a failing-before test: sign out or switch identity while the grant is in flight, and assert there is no retry and no state write.
  4. Update the Fix round table.
- **Then:** Sol re-audit and Opus delta.
- **Merge note:** backend #626 is already live, so #326 can merge as soon as it holds dual APPROVE.

### Card 4: mobile #315 `fix(trust-center): open the real privacy policy, link the consumer health policy, accurate disclosures`

https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/315

- **Head:** `d545f5b6` (round 3). DIRTY: conflicts with main.
- **Tier:** promoted to T4 (new Sentry egress).
- **Verdicts at `d545f5b6`:**
  - Opus APPROVE (T3 delta): https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/315#issuecomment-5961803979
  - Sol REQUEST CHANGES, 0/1/0: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/315#issuecomment-5963343453
- **Open B-315-1.** `src/screens/trustCenterLinkFailure.ts:82-87,104-118` sends the native exception's free-form `name` and `message` to Sentry extras. `sentrySafeText` strips only email-like text and URL query or fragment text, so names, phone numbers, IDs and health text can pass through.
- **Builder round 4:**
  1. Merge `origin/main` and resolve the conflicts.
  2. Transmit no free-form exception text. Send only a closed allowlist: event name, operation, an error-class enum, platform and a reference ID.
  3. Add a canary test: a synthetic personal-data string in the `Linking.canOpenURL` rejection must not appear in the report.
  4. Make sure the user-facing policy-link failure copy is specific, with what happened and a working next action (B-CONSENT-4 follow-up).
  5. Opus re-reviews at T4.
- **Then:** Sol re-audit and Opus delta.
- **Merge timing is the operator's call,** because backend #611 (the policy text) is in the operator's half. Post READY as usual.
- **Device checks (operator):** a forced failure report carries no user, and every policy link opens.

### Card 5: backend #634 + mobile #325 (one merge pair)

**#634** `feat(scheduling): S-SCHED-2 authoritative booking lifecycle, no double booking, assignment-gated reads, real booking push (T4)`: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634

- **Head:** `bb6f3ea8` (round 2, S-SCHED-5).
- **CI:** 11/11 required green. CLEAN. Includes main `53b6d472`.
- **Last verdicts**, both at `4d987916`:
  - Sol REQUEST CHANGES, 0/2/0: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5963066952
  - Opus REQUEST CHANGES: https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5963132495
- **Round 2 note:** https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/634#issuecomment-5963475871. It closes:
  - B-634-7: `parked` is allowed in the delivery-status CHECK inside migration `20270222000000`, which is unapplied (verified not in production `_prisma_migrations`).
  - B-634-2: paged catch-up.
- **Do:** both lenses re-audit at the current head.

**#325** `S-SCHED: native Calendar, coach controls, welcome call and lifecycle contracts`: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325

- **State:** DRAFT, BEHIND.
- **Dual APPROVE at `36f05bba`:**
  - Opus: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325#issuecomment-5960647810
  - Sol: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325#issuecomment-5960782021
- **Since then:** `268ed81b` merged main `f34b5b99` (https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325#issuecomment-5963289830), and main has moved again.
- **Do:**
  1. A builder merges current `origin/main`. Watch the `app.json` neighbours #305 and #317, and keep both sides.
  2. Both lenses delta-attest. A merge-only change gets a short delta.
  3. If #634's contract changes in its re-audit, #325 needs a real delta against it.
  4. Leave it as a draft. The operator marks it ready at merge time.

**Pair rules:**
- The operator merges #634 first, runs the read-only pre-deploy zero-row queries in #634's body, deploys, then merges #325.
- Ruling OR-113-9 stays: a 48-hour answer window that closes 1 hour before the start, a 30-minute minimum, and a quiet close (no notice) for requests that expired more than 24 hours ago.
- **The stacked follow-ups backend #653 and mobile #336 (auto-expiry) are NOT yours.** The operator retargets them after this pair merges.

### Card 6: backend #651 `feat(roman): data-aware live Roman turns: per-turn grounding, guardrails, daily spend cap, deterministic eval (T4)`

https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/651

- **Head:** `33a86da4`, from lane S-ROMAN-DATA (agent 113). Never audited.
- **CI:** red. `build-and-test` fails at Type-check:
  - `test/roman/roman-client-context.spec.ts(735,27)` TS2339: `aiRequestAudits` does not exist on the fake store type.
  - `test/roman/roman-launch-hardening.spec.ts(466,58)` TS2345: the logger mock's signature does not match.
- **Builder round 1:**
  1. Fix both test type errors properly: extend the fake store type and type the mock. Never use banned cast tokens (`as any`, `as unknown as` and similar), because the CI job "Banned cast tokens (R75 / R100.A2)" fails on them.
  2. Run the targeted Roman specs through `heavy.sh`, push, and wait for 11/11 green.
  3. Keep the tier header and acceptance evidence current.
- **Then:** the first FULL dual audit, reading the whole diff (33 files). Focus areas:
  - The box-2 AI-consent gate on every Roman path. Box 1 is required (waiver plus collection for coaching). Box 2 is optional (Roman and coach AI drafts, processed by Anthropic). Without box 2, there is no AI call.
  - Grounding scope: tenant isolation, so the client sees only their own data.
  - Guardrails and the safety router.
  - The daily spend cap. `ROMAN_DAILY_COST_CAP_USD` unset means 25 per day.
  - Every env read registered in `src/common/env-validation.ts` ENV_RULES.
  - The G17/G18 audit row records IDs only.
  - No transcript text in logs.
  - Owner ruling OR-113-12: no owner read of Roman transcripts.
  - Specific, never generic, failure copy.
- **Not yours:**
  - `src/coach/brief/coach-brief.service.ts:67` (a retired model ID) belongs to annex lane A5.
  - backend #655 and mobile #337 (approve-to-adjust) are separate.
- **After merge (operator only):**
  - Deploy.
  - Set `FEATURE_ROMAN_CHAT_ENABLED=true` via the env manifest. The owner approved live Roman chat for v1.0 at 16:34, and this needs the ANTHROPIC_API_KEY secret.
  - Close the superseded #602, #603 and #605.

---

## 5. Your team (max 4 concurrent subagents)

Model IDs for the subagent tool: Claude Opus 5.5 = `claude_opus_5_5`, GPT-6.1 Sol = `gpt_6_1_sol`. Don't use other models for these PRs; they're all T4.

| Lane | Model | Scope |
|---|---|---|
| **S-B1** (builder) | `claude_opus_5_5` | #651 round 1, then any later #651 rounds |
| **S-B2** (builder) | `claude_opus_5_5` | #326 round 3, then #315 round 4, then the #325 main merge, then any later rounds on #305, #317, #634 or #325 |
| **S-L-OPUS** (auditor) | `claude_opus_5_5` | Opus lens for all six sets, batched |
| **S-L-SOL** (auditor) | `gpt_6_1_sol` | Sol lens for all six sets, batched |

- Batch the audits: one Opus agent and one Sol agent each work through a queue. This has proven far cheaper and faster than one agent per PR.
- When an auditor's queue empties, it writes QUEUE EMPTY in its report and finishes. Re-task it by message; don't launch a new one.
- **Launch order, all at once** (they read code while dependencies install):
  - S-L-OPUS and S-L-SOL with queues #305 → #317 → #634.
  - S-B1 on #651.
  - S-B2 on #326.
- **One-strike promotion (routing doctrine):** if a builder's round fails audit on the same finding twice, stop that builder. Start a fresh `claude_opus_5_5` builder with both verdict links and an explicit failing-before test requirement, and note it in SUB_STATUS.

Objective template for builders (fill in the angle brackets):
> You are lane <S-B1|S-B2> (TGP sub-manager 114-S, Claude Opus 5.5 builder, T4). Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (sections Governing rules, Sandbox limits, Git and GitHub, PR body contract, Reports, Final answer; ignore its stale facts and treat "operator 113" as operator agent 114 via sub-manager 114-S) and /home/user/workspace/ops/op114/TGP-SubManager-Handoff-114S.md Card <n>. Task: <exact task from the card>. Repo <repo>, PR #<n>, current head <sha>. Work in your own worktree /home/user/workspace/wt/<lane>-<n>. Every finding you close gets a test that fails before and passes after. Run only targeted jest via /home/user/workspace/ops/heavy.sh. Merge origin/main with a merge commit (never force-push). Commit as `git -c user.name="TGP Sub-Manager 114-S" -c user.email="agent@tgp.invalid"`. Update the PR body Fix round table and post a "FIX ROUND <k> — <repo>#<n> @ <full sha>" comment. Wait for required checks at your final head (fix real failures; rerun the known flake once). Never merge, dispatch workflows, touch production, or edit any other PR. Use bash api_credentials=["github"] for git/gh. Report to /home/user/workspace/ops/reports/<lane>.md ending with "## HANDOFF". Remove your worktree when done.

Objective template for auditors:
> You are lane <S-L-OPUS (Claude Opus 5.5) | S-L-SOL (GPT-6.1 Sol)>, an independent adversarial T4 audit lens for TGP sub-manager 114-S. Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (Audit contract, Sandbox limits, Git and GitHub; ignore stale facts) and /home/user/workspace/ops/_AUD_COMMON.md, then the PR cards in /home/user/workspace/ops/op114/TGP-SubManager-Handoff-114S.md. Queue: <list of repo#n with current head and audit type: full / re-audit / delta from <sha>>. For each: re-read the head right before posting; read every prior AUDIT and FIX ROUND comment; decide your lens's prior findings (closed with code + test, or not), then hunt new defects (security, privacy, tenancy/RLS, idempotency, races, error paths, App Store rules, copy rules, test honesty). Post exactly one comment per PR per head, first line `AUDIT <lens> — <repo>#<n> @ <full 40-char sha> — VERDICT: APPROVE | REQUEST CHANGES | BLOCK`, findings with IDs `<A|B|C>-<n>-<k>`, file:line evidence and the minimal fix. APPROVE only with zero A and zero B. Green required checks at the exact head are evidence; targeted local tests only via heavy.sh. No pushes, merges or workflow dispatches. Skip anything waiting on CI or a builder and come back. Report to /home/user/workspace/ops/reports/<lane>.md ending with "## HANDOFF"; write QUEUE EMPTY when done.

---

## 6. The loop (run until all six sets are S5)

1. **Orient** (every 10–15 minutes, or whenever a subagent finishes):
   - Read `handoffs/op-114/OPERATOR_NOTES.md`. Its merge train, rulings and answers override this document.
   - Run `bash /home/user/workspace/ops/prcheck.sh backend 634 651` and `bash /home/user/workspace/ops/prcheck.sh mobile 305 315 317 325 326`.
   - Read new PR comments.
2. **Decide** per PR from its stage:
   - S1: a builder on it.
   - S2: queue both lenses.
   - S3: wait.
   - S4: post READY.
   - BEHIND or DIRTY: a builder merges main, then both lenses run a delta.
3. **T4 push rule:** after an audit round, the builder pushes the next fix round only after BOTH lenses have posted on the current head. Fold both verdicts into one round, with no ping-pong.
4. **Prove:** every closed finding has a failing-before test, and CI is green at the exact head.
5. **READY signal** (S4). When a PR has Opus APPROVE and Sol APPROVE at the same exact head, all required checks green at that head, and mergeStateStatus CLEAN, post this PR comment:
   ```
   READY FOR OPERATOR MERGE — <repo>#<n> @ <full sha>
   Opus APPROVE: <url> · Sol APPROVE: <url> · required checks: <k>/<k> green · mergeStateStatus: CLEAN
   Pair/sequencing note: <e.g. "#634 first, then #325" or "none">
   Device/release follow-ups for the operator: <list from the card or "none">
   ```
   Add the same line to SUB_STATUS.md.
6. **After any operator merge, your other PRs go BEHIND.** Bring them current only when they're next in the merge train (OPERATOR_NOTES.md) or already at S4. That saves delta rounds. Then a builder merges main, both lenses delta-attest, and you re-post READY.
7. **Record:** update SUB_STATUS.md on every stage change, using one row per PR set.
8. **Continue.** Never idle on one PR. Skip anything waiting on CI and work the rest of the queue.

---

## 7. Do-not-touch list

Everything not in Section 4 belongs to someone else. Never push to, comment fixes on, rebase or update these PRs:
- **Operator agent 114's six:**
  - backend #627 (coach payout) with mobile #321
  - backend #654 (recurring subscriptions)
  - mobile #334 (package payment sheet)
  - backend #608 (account deletion, with #636 composed in) with mobile #327
  - backend #611 (privacy policy)
  - mobile #314 (community safety), with follow-ups #650 and #652
- **Builder annex** (session 1f6fdf2e; PR body line "Builder: TGP annex lane"): backend #657, #658, #659, #660, and any A5/A6 PRs.
- **Everything else open:** backend #609, #628, #640, #641, #642, #643, #645, #647, #648, #653, #655, #656, #661, and the Roman stack #598/#601/#602/#603/#605. Mobile #312, #322, #328, #329, #331, #332, #335, #336, #337. The importer/scout PRs, and all Dependabot PRs.

**If one of your fixes seems to need a file another PR owns, stop.** Write `NEEDS OPERATOR:` in SUB_STATUS.md with the file and the reason.

---

## 8. Bootstrap (your sandbox is empty; do this first, about 5 minutes)

All `git`/`gh` calls go through bash with `api_credentials=["github"]`. Check first with `gh auth status`.

```bash
mkdir -p /home/user/workspace/{repos,ops/reports,ops/op114,deps/backend,deps/mobile,wt}
cd /home/user/workspace/repos
for r in growth-project-backend growth-project-mobile tgp-agent-context; do gh repo clone BradleyGleavePortfolio/$r; done
cd /home/user/workspace
cp repos/tgp-agent-context/handoffs/op-c67c61cf/tools/* ops/ && chmod +x ops/*.sh
cp repos/tgp-agent-context/handoffs/op-c67c61cf/AGENT_BRIEF_COMMON.md ops/
cp repos/tgp-agent-context/handoffs/op-c67c61cf/lanes113/_AUD_COMMON.md ops/
cp repos/tgp-agent-context/handoffs/op-114/*.md ops/op114/
for k in backend mobile; do git -C repos/growth-project-$k show origin/main:package.json > deps/$k/package.json; git -C repos/growth-project-$k show origin/main:package-lock.json > deps/$k/package-lock.json; done
setsid nohup bash ops/install_deps.sh > ops/install_deps.log 2>&1 < /dev/null & disown
setsid nohup bash ops/sandbox_monitor.sh < /dev/null > /dev/null 2>&1 & disown
df -h / ; grep MemAvailable /proc/meminfo
```

**Sandbox safety.** A sandbox crash is a tier-1 incident.
- 2 CPUs and about 7.9 GB RAM.
- Every heavy command (jest, tsc, eslint over many files, prisma generate, npm) goes through `/home/user/workspace/ops/heavy.sh`. Never wrap it in a short timeout.
- Never run `npm install` or `npm ci` in a worktree. Link the shared deps with `ops/link_deps.sh <backend|mobile> <worktree>`, and for backend then run `ops/heavy.sh npx prisma generate`.
- Run targeted jest only, with `--runInBand`. Leave full suites and tsc to GitHub CI, which is free and parallel.
- Pause new launches if disk is over 80%, MemAvailable is under 1.5 GB, or the heavy queue stays above 6 for 10 minutes.
- Remove finished worktrees right away.

**Required checks** (strict up to date on both repos):
- **Backend (11):**
  - build-and-test
  - rls-floor-guard
  - rls-live-tests
  - mwb-3-live-tests
  - npm audit (high+critical, whole graph)
  - CodeQL JS/TS (javascript-typescript)
  - Banned cast tokens (R75 / R100.A2)
  - build-sbom
  - danger
  - Schema parity (migrations match schema.prisma)
  - community-live-tests
- **Mobile (3):**
  - Typecheck, lint, test
  - Analyze (javascript-typescript)
  - Analyze (actions)
- **Ignore:** Release Please failures, and the non-required shellcheck on `scripts/s10-core-diff-gate.sh`.
- **Known flake:** `test/ci/release-evidence-gate.spec.ts:367`. Re-run the failed job once (`gh run rerun <run-id> --failed`). If it fails again, treat it as real.

**Other repo rules:**
- **Backend PR titles** must be Conventional Commits, or the Danger check fails.
- **Migrations:** none of your PRs should need a new one. If one does, stop and ask the operator for a prefix.
- **Env names:** every new env read must be registered in `src/common/env-validation.ts` ENV_RULES.
- **Dependencies:** if a branch changes `package.json` or the lockfile, stop and report to the operator.

---

## 9. Coordination with operator agent 114

- **You write** `tgp-agent-context/handoffs/op-114/SUB_STATUS.md`, and nothing else in that repo. Commit message: `status(114-S): <short>`. Pull and rebase before each push, because the operator writes nearby files.
- **The operator writes** `handoffs/op-114/OPERATOR_NOTES.md`: merge train order, rulings, answers to your questions, and "merged" confirmations. Read it every loop.
- **Escalate** with a `NEEDS OPERATOR:` line (one line, a recommended default first, and a link) only for:
  - a product or owner decision;
  - a needed change outside your six sets;
  - a new migration, env name or dependency;
  - lenses that disagree on a ruling, or a tier question;
  - anything touching production, money settings or branch protection;
  - a sandbox incident.
- **If the operator is silent for more than 45 minutes** on a blocking question, apply your recommended default only when it's reversible and inside your six sets, and record it as "applied default, operator may overrule". Otherwise keep working the other PRs.
- **When you post READY,** the operator merges or answers in OPERATOR_NOTES.md. You never merge, even if the operator is silent.

---

## 10. Done and final report

- **You're done when** each of the six sets is S5 (merged by the operator) or explicitly handed back in OPERATOR_NOTES.md.
- **Then:**
  - Remove all worktrees.
  - Write `/home/user/workspace/ops/reports/114-S-final.md`.
  - Update SUB_STATUS.md with a final table: PR, final head, merge SHA, verdict links, open C findings, follow-ups for the operator.
  - End the report with `## HANDOFF`.
- **If you run low on credits or are told to stop:**
  - Let running subagents finish their current item, and launch nothing new.
  - Record each PR's exact head, stage and next action in SUB_STATUS.md, so the operator or a successor can resume from GitHub alone.

GitHub is the source of truth: PR heads, AUDIT comments, FIX ROUND comments and checks. If anything here conflicts with live GitHub state, trust GitHub and note the difference in SUB_STATUS.md.
