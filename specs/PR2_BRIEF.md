# PR-2 BUILD BRIEF — Handle Stripe `transfer.failed` (P0-c)

**Repo:** growth-project-backend (NestJS). **Pillar 2 (harden infra). Type: FIX.**
**Branch:** `pr2/handle-transfer-failed` off the default branch.

## THE BUG (P0-c) — `transfer.failed` is silently dropped
In `src/billing/billing.service.ts` (~lines 372-373) the Stripe webhook handler swallows the `transfer.failed` event — it has no case/branch, so a failed Stripe Connect transfer (head-coach ↔ sub-coach revenue split payout) fails INVISIBLY. Note: `payout.failed` IS already handled in the same area — use it as the pattern/template for how this repo persists status and notifies.

When a `transfer.failed` event arrives we must:
1. **Persist the failure** — locate the ConnectTransfer (or equivalent transfer-record model) row that corresponds to the failed transfer (match on the Stripe transfer id / the relevant metadata) and set its `status = 'failed'` (and capture failure reason / Stripe failure_code/message if the model has fields for it). Inspect the actual model name + fields before coding — do not assume `ConnectTransfer` exists verbatim; find the real model the splits/transfer flow writes.
2. **Alert the coach** — emit a `COACH_ALERT` notification (use the existing NotificationsService / notification-kinds enum; if a suitable `COACH_ALERT` kind already exists reuse it, otherwise add one additively following the existing kind-registration pattern). The alert should tell the affected coach a payout transfer failed and (if available) the amount + which client/purchase, so they can act.
3. **Structured log** — log the failure at error/warn level with the transfer id, amount, coach id, and Stripe failure reason, matching the repo's logging conventions.

## RELATED — refund/dispute handler
The plan references `refund-dispute-handler.service.ts`. Check whether the transfer-failure path should also be reflected there (e.g. if a transfer failure should mark a split/ledger entry). Only touch it if the existing code clearly expects it; otherwise keep this PR focused on the webhook case + persistence + alert.

## SCOPE GUARDRAILS (do NOT exceed)
- FIX ONLY. Do NOT add drip-feed, new commerce models, schema for packages content, etc. — those are later PRs.
- A new notification KIND (additive enum value + default pref) is acceptable if `COACH_ALERT` doesn't already exist.
- Keep the diff tight: the webhook case + status persistence + coach alert + log. No broad refactors.
- Idempotency: Stripe can replay `transfer.failed`. Make the handler idempotent — re-processing the same event must not double-alert or corrupt status (follow the repo's existing webhook-idempotency pattern, the same one `payout.failed` uses).

## VERIFICATION REQUIRED before you report done
1. Confirm the real transfer-record model name + fields and the real notification-kind registration pattern by reading the existing `payout.failed` handling.
2. Run the repo's typecheck/build + lint. MUST pass.
3. Run existing billing/webhook tests. Add a focused unit test for the `transfer.failed` branch (assert status persisted + coach alert fired + idempotent on replay) following the repo's existing test patterns for webhook handlers.
4. If a Prisma migration is needed for a new notification kind / status enum, generate it additively and confirm it doesn't alter existing data.

## COMMIT / PR RULES (STRICT)
- Commit identity MUST be: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`
- NO "Co-Authored-By" and NO "Generated with" trailers. None.
- Branch `pr2/handle-transfer-failed`, open a PR against the default branch, report the PR URL.
- PR description: the bug, the model/fields touched, the notification kind used/added, idempotency approach, and how you verified.

## DELIVERABLE
Report back: (a) PR URL, (b) the transfer model + fields changed, (c) the notification kind used/added, (d) idempotency approach, (e) typecheck/test results. Write a copy of your summary to /home/user/workspace/specs/PR2_BUILD_REPORT.md.
