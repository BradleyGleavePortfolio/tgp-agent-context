# Coach Onboarding — Parallel "Connect Bank Account" Option

**Operator decision (2026-06-09):** In coach onboarding, surface "Connect Bank Account" as a PARALLEL option alongside "Connect Stripe Account". Both must be available; coach picks one (or both later from Settings).

## Why this isn't in PR #374

PR #374 (bank-payout Phase A backend) already ships the API surface:
- `POST /me/payout-methods/financial-connections/session` — returns FC client secret
- `POST /me/payout-methods/financial-connections/complete` — exchanges FC session → creates `external_account` on coach's Stripe Connect Custom account → persists `PayoutMethod` row
- `GET /me/payout-methods`, `POST /me/payout-methods/:id/default`, `DELETE /me/payout-methods/:id`

What's missing is the **mobile coach onboarding UX hook** that exposes "Connect Bank" as a parallel choice during the wizard (currently the wizard has 6 stub-ish steps and `CoachConnectScreen.tsx` only handles Stripe Express).

## Scope — Phase A.1 (mobile)

New track, dispatched AFTER PR #374 (backend) merges and AFTER v1-5/v1-6 community work clears the mobile priority lane.

### Mobile work
- **New step (or modal) in `CoachWizardNavigator`**: "Payout setup" with two cards side-by-side:
  - **Stripe Account (Express)** — status quo, opens existing Stripe Express onboarding URL.
  - **Connect Bank Account** — opens Stripe Financial Connections widget (`@stripe/stripe-react-native` `collectBankAccountToken` or FC sheet) → on success calls `POST /me/payout-methods/financial-connections/complete` with the `fcSessionId`.
- **Result screen**: shows linked payout method(s); if both present, lets coach mark one as default.
- **Settings/Payments parity**: add the same picker in `CoachConnectScreen` so coaches who finished onboarding can add a bank later.
- **Feature flag**: `FEATURE_BANK_PAYOUTS_V2_UI` (mobile) default OFF; gate the new step + Settings entry.
- **Tests**: jest + RTL coverage for picker render, FC happy-path mock, error path, idempotent re-link.

### Backend follow-ups (likely none, verify in audit)
PR #374 surface looks sufficient. If audit reveals a gap (e.g., onboarding-completion endpoint doesn't accept "bank linked" as a substitute for "Stripe Express done"), file as Phase A.2.

## Priority slot

Per standing instructions: community lane (v1-5 → v1-6 → v2.x) is top priority. This goes AFTER v1-6 merges, parallel with MWB-2 or Roman Phase 1, depending on builder availability. Operator can re-rank.

## Dispatch checklist (for future use)
- Worktree off latest main once PR #374 + v1-5/v1-6 are merged.
- Opus 4.8 builder, GPT-5.5 auditor.
- `preload_skills=["coding"]`.
- Brief author: orchestrator.
