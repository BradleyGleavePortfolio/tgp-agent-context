# B3 Smart Dunning v2 — Backend Builder Brief

**You are Opus 4.8. R31: builder. No auditor work, no fixer work, no `sonnet` references.**

## Mission

Build B3 Smart Dunning v2 on the backend: a 4-attempt cadence `[Day 0, Day 1, Day 3, Day 7]` with a **Day-10 hard lockout** and a **late-reversal handler**. All copy is Roman voice (Option 3 locked). v1 dunning (~90% built in PR #281) is your foundation; **you are filling gaps, not rebuilding**.

## Worktree & branch

- Worktree: `/home/user/workspace/tgp/backend-b3-v2-builder`
- Branch: `feature/b3-smart-dunning-v2` (already created off `origin/main` at `f9b3c05`)
- Repo: `BradleyGleavePortfolio/growth-project-backend`
- Author: `Dynasia G <dynasia@trygrowthproject.com>`
- Commits: title-only, no body, no emoji, no trailers
- Use `api_credentials=["github"]` for `gh` CLI

## Read FIRST — ground truth (in order)

1. `/tmp/tgp-agent-context/_spec_b3-smart-dunning-gaps_*.md` if present; otherwise check out branch `spec/b3-smart-dunning-gaps` of `BradleyGleavePortfolio/tgp-agent-context` (PR #6) — that's the canonical B3 v2 spec, just updated with locked Roman copy by the unified updater (`d194405bcf833a28d2c90c4e2231095edfcfe5a2`). Quickest read:
   ```bash
   git -C /tmp/tgp-agent-context fetch origin spec/b3-smart-dunning-gaps
   git -C /tmp/tgp-agent-context show origin/spec/b3-smart-dunning-gaps:<spec-filename>.md > /tmp/B3_SPEC.md
   ```
2. `/tmp/tgp-agent-context/ROMAN_VOICE_POLICY.md` on branch `spec/roman-voice-policy-option3` (PR #9, SHA `ffc8624e`):
   ```bash
   git -C /tmp/tgp-agent-context fetch origin spec/roman-voice-policy-option3
   git -C /tmp/tgp-agent-context show origin/spec/roman-voice-policy-option3:ROMAN_VOICE_POLICY.md > /tmp/ROMAN_VOICE.md
   ```
3. Backend v1 dunning (your foundation). Grep for existing modules:
   ```bash
   cd /home/user/workspace/tgp/backend-b3-v2-builder
   rg -ln "dunning|StripeWebhook|invoice\.payment_failed|charge\.failed" src
   ```
   Treat anything that exists as authoritative — **do not rewrite v1**. Add v2 gap files alongside.

## Scope — what to build

### 1. Cadence engine `[0, 1, 3, 7]`

- Day 0: silent charge attempt; on failure, mark `dunningState=ACTIVE` and schedule next steps.
- Day 1: first notify — in-app banner + email + push. Roman voice.
- Day 3: blocker — in-app modal (blocks billing screen entry to feature flows; not full lockout yet) + email + push. Roman voice.
- Day 7: coach-loop trigger — in-app + email + push to coach. All three channels (operator-locked).
- Day 10: terminal hard lockout — see §3.

State machine fields (suggest, adjust if v1 already has them):
- `dunningState`: `INACTIVE | ACTIVE | LOCKED | RECOVERED`
- `dunningAttemptCount`: 0-4
- `dunningFirstFailureAt`: timestamp
- `dunningLockoutAt`: nullable timestamp (set when state→LOCKED)
- `dunningLastReversalAt`: nullable

If v1 already has the field names, **reuse them; do not introduce shadow fields.**

### 2. Late-reversal handler (Option A — immediate clear)

- On successful card update / payment retry success → IMMEDIATELY clear `dunningState=RECOVERED`, restore access if locked.
- If Stripe later reverses (`charge.dispute.created`, `invoice.payment_failed` on a recovery charge, etc.) → re-enter `ACTIVE` on a **compressed cadence**: 3 days to remedy before re-lockout (Day-1 + Day-2 nudge + Day-3 lockout). Copy: "Your last payment update failed — you will be locked out in 3 days." (Roman stem from spec.)

### 3. Day-10 hard lockout

- Login → redirect to payment-update screen only. No other routes accessible (community, workouts, programs, chat: all 403 / "Locked").
- Backend enforcement: middleware or guard that checks `dunningState=LOCKED` and returns `403 LOCKED_DUNNING` for all non-billing routes.
- **Allowed routes when LOCKED:** `/billing/*`, `/auth/logout`, `/auth/refresh`, health checks, and any chat route that ONLY talks to Roman (the assistant explains the lockout). Confirm with the spec exactly which chat routes are allowed.
- Unlock automatically on `dunningState=RECOVERED`.

### 4. Notification dispatchers

- In-app: existing pubsub / WebSocket (v1-4 realtime if available; otherwise existing channel). Roman copy from spec.
- Email: existing transactional pipeline (likely SendGrid/Resend per v1). Roman copy from spec.
- Push: Expo Push (FCM wired by PR #228 — confirmed). Roman copy from spec.
- All three on Day 1, Day 3, Day 7-coach, Day 10. **Day 0 silent.**

### 5. Telemetry (PostHog)

Lock these event names (do not invent variants):
- `dunning.attempt.failed` (Day 0 charge fail)
- `dunning.notify.sent` (props: `day`, `channel`, `recipient_role`)
- `dunning.blocker.shown`
- `dunning.coach.notified`
- `dunning.lockout.entered`
- `dunning.recovered` (props: `via=card_update|retry|manual`)
- `dunning.reversal.detected`
- `dunning.lockout.exited`

Plus the locked Roman flags from policy:
- `roman_enabled`, `roman_quip_rate_client=0.125`, `roman_quip_rate_coach=0.083`

### 6. Feature flag

All B3 v2 code paths behind `FEATURE_DUNNING_V2` — **default OFF**. v1 path remains the active default until operator flips. R66 / merge gate.

## Hard gates (R66 — full-suite-before-PR)

1. **Zero schema mutation** in any path not gated by `FEATURE_DUNNING_V2`. Baseline check: print `prisma/schema.prisma` SHA before and after, document in PR body if changed (changes ARE allowed in v2 — but must be additive, nullable, defaulted, no destructive migrations).
2. **Entitlement guards pin** — 17/17 untouched. Grep verify.
3. **Cadence math unit tests** — 100% coverage of state transitions: `INACTIVE→ACTIVE→…→LOCKED`, `ACTIVE→RECOVERED→ACTIVE` (reversal), `LOCKED→RECOVERED`.
4. **Lockout middleware tests** — confirm all non-billing routes 403 when LOCKED; billing/auth/health/Roman-chat allowed.
5. **Copy assertions** — at minimum one test per channel × day that asserts the rendered string contains a known Roman stem (e.g. "household ledger" for Day-10).
6. **No new deps** unless absolutely required and approved in PR description with `SKIP-BECAUSE`-style justification.
7. **No `sonnet` references.**
8. **R70 fail-fast lane** — 15/15.

## Workflow

1. Read the 3 ground-truth docs.
2. Map v1 modules; build the gap list.
3. Implement in this order:
   a. Schema additions (additive, nullable, defaulted)
   b. State machine + service
   c. Lockout guard middleware
   d. Notification dispatchers (Roman copy from spec)
   e. Late-reversal handler
   f. Telemetry events
   g. Feature flag wiring
   h. Tests for each layer
4. **Push every state change** (R64). At minimum after schema, after state machine, after each dispatcher, after middleware, after tests.
5. **R67:** Update `/tmp/tgp-agent-context/handoffs/dispatch.json` with dispatch + completion entries. Commit + push journal.
6. Open PR via `gh pr create` against `main`. Title: `feat(billing): B3 smart dunning v2 — 4-attempt cadence + day-10 lockout + late-reversal`. Body: scope summary, gate results, flag-off proof, test counts.
7. Return JSON summary.

## Deliverables (final message)

```json
{
  "pr_url": "...",
  "head_sha": "...",
  "files_changed": 0,
  "tests_added": 0,
  "schema_changed": true|false,
  "additive_only": true,
  "flag_default_off": true,
  "roman_copy_stems_referenced": ["household ledger", "..."],
  "r66_full_lane": "pass",
  "r70": "pass"
}
```

I (orchestrator) then dispatch a fresh GPT-5.5 R1 auditor.

## Anti-scope (do NOT do)

- Do NOT touch v1 dunning logic except to read it.
- Do NOT change Stripe webhook routing (only ADD handlers).
- Do NOT add a 5th attempt or change the cadence numbers.
- Do NOT use any cadence copy that isn't from `/tmp/B3_SPEC.md`.
- Do NOT enable the feature flag by default.
- Do NOT touch v1-4 community files.
