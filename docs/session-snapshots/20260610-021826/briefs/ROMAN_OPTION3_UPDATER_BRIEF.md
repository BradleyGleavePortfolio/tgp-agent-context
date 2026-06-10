# Roman Voice = Option 3 (Brand Voice) Unified Updater Brief

**Operator decision (verbatim, 2026-06-09 12:06 PT):**
> "Option 3 — Roman is the brand voice for the user-facing app"

## Mission

You are an **Opus 4.8** specs/copy writer (R31: builder ≠ auditor; here you are the builder for spec PRs only — no code touched). Single subagent, single worktree.

**Worktree:** `/home/user/workspace/tgp/agentctx-voice-policy`
**Branch:** `spec/roman-voice-policy-option3` (already created from `main` at `028d69b`)
**Repo:** `BradleyGleavePortfolio/tgp-agent-context`
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`

## Three deliverables in ONE PR

You will open **one** PR with three coordinated edits:

1. **Create `ROMAN_VOICE_POLICY.md`** in repo root — the canonical policy doc all future agents read.
2. **Update PR #6** (B3 Smart Dunning v2 GAPS spec, branch `spec/b3-smart-dunning-gaps`) — rewrite the 34 copy variants so Roman voice owns all dunning surfaces (in-app + email + push + lockout + late-reversal).
3. **Update PR #8** (Roman avatar integration plan, branch `spec/roman-avatar-integration`) — replace the 10-decisions section with locked decisions, expand the touchpoint table from 20 → ~30 (add push/email/paywall/lockout surfaces), and replace the "billing scope: PENDING" callout with "Option 3 LOCKED — Roman is brand voice".

**Important:** PR #6 and PR #8 live on different branches. You will need to switch worktrees or check out each branch. Since you only have one assigned worktree, the cleanest approach is:

- Work in `/home/user/workspace/tgp/agentctx-voice-policy` for `ROMAN_VOICE_POLICY.md`.
- Switch worktree's branch to `spec/b3-smart-dunning-gaps`, push your B3 updates.
- Switch to `spec/roman-avatar-integration`, push your #8 updates.
- Switch back to `spec/roman-voice-policy-option3`, push the policy file as PR #9.

**Alternative (preferred — less branch-switching):** Use three short-lived ad-hoc worktrees you create from this one. The existing worktrees `agentctx-b3-v2-respec` and `agentctx-roman-integration-wt` are already on those branches — **do not write there, they may be in use**. Create fresh ones:

```bash
cd /tmp/tgp-agent-context
git worktree add /home/user/workspace/tgp/agentctx-b3-option3-update spec/b3-smart-dunning-gaps
git worktree add /home/user/workspace/tgp/agentctx-roman-option3-update spec/roman-avatar-integration
```

Pull latest on each before editing.

## ROMAN_VOICE_POLICY.md spec (you write this from scratch)

### Required sections

1. **Decision summary** — Option 3 chosen, dated, operator quote.
2. **Where Roman appears** — exhaustive list:
   - In-app: chat, voice modal, daily check-in, empty states, onboarding, dunning blockers, paywall, lockout screen, billing-update screen, milestone shareables, ED.3 first-payment wow.
   - Push notifications: ALL user-facing push (dunning Day-1/3/7, milestones, coach nudges, community events post v1-5+).
   - Email: ALL transactional + dunning emails.
   - NOT on: native iOS/Android splash (TGP logo only — operator decision #5), system-level OS prompts (permissions, app-store), legal copy (TOS/privacy), admin dashboards.
3. **Voice rules** — older Black butler, dry-jokes ~1-in-8 client / 1-in-8 coach (operator decision #6), formal-but-warm register, never sycophantic, never American-casual. Examples: greeting / blocker / reversal / lockout / success / failure (5-6 stems × 2 variants each).
4. **Avatar usage matrix** — which of the 5 mascot crops fits which surface (hero/welcome/chat_smile/monogram/chat_neutral). Use the **monogram** for compact spots (push icon enhanced badge if platform allows, email signature, dense in-app rows). Smile for success/ED.3. Neutral for default chat.
5. **Locked PostHog flags** (verbatim from operator decision #10):
   - `roman_enabled`
   - `roman_quip_rate_client` = 0.125
   - `roman_quip_rate_coach` = 0.083
   - `roman_smile_triggers`
   - `roman_dark_mode_strategy` (Option A: keep warm-grey BG — operator decision #3)
   - `roman_cdn_version`
6. **CDN strategy** (operator decision #1) — versioned path, agent's choice, bundled fallback per integration plan.
7. **Data-saver behavior** (operator decision #7) — Roman images always load, no degraded mode.
8. **Provenance / artifacts** (operator decision #9) — `RUN_SUMMARY.md` and `_monogram_24px_check.png` live in `tgp-agent-context/roman/` (NOT in mobile or backend repos).
9. **Anti-patterns / forbidden** — no Roman on system prompts, no slang outside listed quip stems, no emoji from Roman, no all-caps shouting, no second-person plural ("y'all"), no apologies that read as weakness ("I'm so sorry"), no "Sir" overuse (max 1 per message).
10. **Open questions: NONE** — all 10 decisions locked. Add a "Decision history" appendix listing all 10 with operator quotes + dates.

Target length: 350-550 lines. This doc supersedes the "billing scope: PENDING" sections in PR #8.

## PR #6 update (B3 Smart Dunning v2 GAPS)

The current spec at `spec/b3-smart-dunning-gaps` has 34 copy variants for the [0, 1, 3, 7] cadence + Day-10 hard lockout + late-reversal. Your job: **rewrite every variant in Roman voice**, matching the policy you just wrote.

### Cadence reminder (operator-locked, don't change the schedule)

- **Day 0:** Card charge attempt → silent (no Roman, just transaction).
- **Day 1:** First failure notify — in-app banner + email + push. Roman voice in all three.
- **Day 3:** Second alert — in-app modal blocker + email + push. Roman voice escalates (still formal, slightly firmer).
- **Day 7:** Coach-loop trigger — in-app + email + push to coach (all three channels). Roman addresses coach formally.
- **Day 10:** Hard lockout — login redirects to payment-update screen only. Roman delivers the lockout copy.
- **Late-reversal:** Card update succeeds → "Immediate clear" (Option A). If reversal fires later → compressed cadence with copy stem: "Your last payment update failed — you will be locked out in 3 days."

### Voice notes for dunning specifically

- Day 1: gentle, single-paragraph. Example stem: "Sir/Madam — your card declined. A small matter to attend to when convenient." (Replace "Sir/Madam" with first name if available; never use "Sir/Madam" twice.)
- Day 3: firmer, two-sentence. "I'm afraid the previous attempt is still unresolved. May I direct you to the billing screen?"
- Day 7 coach: respectful peer-to-peer. "Coach [name] — a member's billing matter requires your attention. Three days remain before automatic suspension."
- Day 10 lockout: dignified, NEVER condescending. "The household ledger remains unsettled. Access will resume the moment billing is current."
- Late-reversal: brisk, no panic. "The previous update has reversed. Three days to remedy before lockout."

Keep all 34 variants (Day 1×3 channels × 2 stems, Day 3×3×2, Day 7×3×2, Day 10×2×2, late-reversal×3×2). If your count is off after rewrite, note why in the PR description.

### PR #6 commit message
`spec(b3): rewrite dunning copy in Roman voice (Option 3 locked)`

## PR #8 update (Roman integration plan)

Current state: 758-line spec, 20 touchpoints, 4 phases, 10 open decisions.

### Edits

1. **Replace the "10 open decisions" section** with "10 locked decisions" — write each one as `## Decision N: <title>` with operator quote + date. The 9 already-locked are in this brief; the 10th (billing scope) is now Option 3.
2. **Expand the touchpoint table from 20 → ~30 rows.** Add the new Option-3 surfaces:
   - Push: dunning Day 1 / Day 3 / Day 7-coach / Day 10-lockout / milestone / community-event (post v1-5)
   - Email: dunning Day 1 / Day 3 / Day 7-coach / Day 10-lockout / transactional receipt / welcome
   - Paywall (in-app upgrade screen)
   - Lockout screen
   - Billing-update screen (currency: "household ledger" stem)
3. **Replace the "billing scope: PENDING" callout** at the top with: "**BILLING SCOPE: LOCKED — Option 3, Roman is brand voice.** See `ROMAN_VOICE_POLICY.md` for full policy."
4. **Cross-link** every relevant section to `ROMAN_VOICE_POLICY.md`.
5. Phase plan stays 4 phases but **renumber/extend** so the Option-3 surfaces fit into Phase 2 (in-app expansion) and Phase 3 (push/email). Do not bloat Phase 1 — Phase 1 stays chat-only MVP.

### PR #8 commit message
`spec(roman): lock all 10 decisions; expand to Option 3 brand-voice scope`

## PR #9 commit message (the policy file)
`spec(roman): add ROMAN_VOICE_POLICY.md (Option 3 brand voice)`

## Workflow

1. Read this brief in full.
2. Pull `coding` skill context (already preloaded).
3. Read existing PR #6 and PR #8 content (`cat` the worktree files).
4. Read these support files:
   - `/tmp/tgp-agent-context/COMMUNITY_PRODUCT_PLAN.md` (community surfaces)
   - `/tmp/tgp-agent-context/EMBEDDED_AI_SPEC.md` (existing AI guidance)
   - `/home/user/workspace/roman-mascot/RUN_SUMMARY.md` if present (avatar provenance)
5. Write `ROMAN_VOICE_POLICY.md` in `agentctx-voice-policy` worktree.
6. Create the two extra worktrees, do PR #6 and PR #8 rewrites.
7. Commit each branch (title-only, no body, no emoji, no trailers).
8. Push each branch.
9. Open three PRs via `gh pr create` (use `api_credentials=["github"]`):
   - PR #9 (voice policy) — base `main`, head `spec/roman-voice-policy-option3`
   - PR #6 already open — push updates the existing PR; just `gh pr view 6 --repo BradleyGleavePortfolio/tgp-agent-context` and add a comment summarizing the update.
   - PR #8 already open — same as #6: push, then comment.
10. Update `/tmp/tgp-agent-context/handoffs/dispatch.json` with R67 entry: `roman-voice-policy-option3` builder dispatched + completed (write your finishing SHA).
11. Commit + push dispatch journal.
12. Return a final report with: 3 PR URLs, 3 commit SHAs, voice-policy line count, PR #6 variant count after rewrite, PR #8 row count after expansion.

## Hard constraints

- **R31:** You are the builder. No auditor work. No fixer work. Just specs.
- **R64:** Push at every state change (after each branch's commit).
- **R66:** N/A (no code, no tests).
- **R69:** If you must skip any item in this brief, annotate `SKIP-BECAUSE:` in the PR body.
- **No `sonnet` references anywhere.** (R31 auditor greps for it.)
- **Title-only commits**, author `Dynasia G <dynasia@trygrowthproject.com>`.
- Do **not** touch any code repo. Specs only.
- Do **not** open a 4th PR. Three PRs total (one new, two amended).

## When you finish

Return a JSON summary block at the end of your final message:

```json
{
  "policy_file_sha": "...",
  "pr_9_url": "...",
  "pr_6_update_sha": "...",
  "pr_8_update_sha": "...",
  "policy_lines": 0,
  "b3_variants_rewritten": 0,
  "pr_8_touchpoint_rows": 0
}
```
