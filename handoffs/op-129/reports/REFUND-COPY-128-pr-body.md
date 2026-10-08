Tier: T1
Why: One truthful customer-facing refund sentence plus its regression test; no payment behaviour changes.
T4 trigger scan: No auth, tenancy, PII, credentials, money movement or destructive-data change.
T3 trigger scan: No payment handler, endpoint, eligibility, pricing, subscription or refund-control change.
Bounded T1: Only ClientPackagesScreen fine print and the existing purchase test.
Canonical builder: REFUND-COPY-128 (Sol, agent 128).
Parent owner: operator agent 128; FIXWAVE-128 assigned row.
Acceptance evidence: Single heavy.sh-targeted Jest run passed, 7/7 tests; new copy tested with and without a renewing plan. Failing-first static proof on unchanged main confirmed the new wording absent and the false coach-refund wording present; no extra Jest run under the explicit one-run limit.
Promotion triggers: Any refund execution/control, payment behaviour or access change must be separately routed; none included.

## What changes for coaches/clients
The client is told refunds are issued by The Growth Project team and how to ask through the existing You > Settings > Support path. The screen no longer says the coach can issue refunds. Coaches gain no new control in this PR.

## B/U list
- B1: A client asks their coach for a refund as the screen says, but the coach has no refund control and cannot issue it. Replaced the false line with the current issuer and real in-app support path.
- U: None in assigned scope.

## Routes/actions before -> after
Only static text changes; every route, condition and handler stays identical.

| Label/action | Before | After |
|---|---|---|
| Back | navigation.goBack, where a back entry exists | Unchanged |
| Enter coach code | Home > Messages, openCoachCode | Unchanged |
| Message your coach | Home > Messages | Unchanged |
| Pull to refresh / retry plans | load | Unchanged |
| Buy a plan | shared native purchase / PaymentSheet flow | Unchanged |
| View what's included | Deliverables with purchaseId/packageName | Unchanged |
| Update card (current plan / dunning) | UpdateCard with autostart | Unchanged |
| End my plan | Confirm and cancel at period end, or current overdue outcome | Unchanged |
| Keep my plan | Existing plan resume handler | Unchanged |
| Refresh plans | Existing YourPlansPanel reload | Unchanged |
| Email support / email fallback | Existing support email and fallback | Unchanged |

Parity evidence: the existing targeted test covers buying, ending plans, back, messages, coach-code entry, list retry, UpdateCard and Deliverables. No handler or route edits.

## Truthful sweep
- Replaced “refunds are handled by your coach” with “Refunds are issued by The Growth Project team; to ask, go to You > Settings > Support.”
- Settings already has a Support row that opens SupportInbox; this path does not depend on a renewing-plan list or the iOS-hidden Membership contact row.
- No refund eligibility, timing or outcome promised. Remaining copy is unchanged.
- No layout, color, theme or navigation changes.

## Scope / documentation
Based on current main c44763a1. Open m#473 touches nearby Membership/client documentation, not either modified file; m#499 is already merged. No overlap to resolve.

Documentation exception: the assigned owner row expressly requires “one line plus its test; no other change.” This static copy-only PR is doc-free; no README, endpoints or new pathways changed.

No merges, deploys or production changes.
