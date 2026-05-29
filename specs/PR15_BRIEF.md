# PR-15 BRIEF — Buyer drops endpoint + PurchaseUnpackScreen + SSR thank-you parity + COACH_NEW_PURCHASE

Pillar 1 (+ 2/3). Spans TWO repos → split into PR-15A (backend) and PR-15B (mobile). Different repos → build + audit in PARALLEL. A and B are contract-coupled: B consumes the endpoint A ships, against the typed contract PR-13 already froze (see PR13_BUILD_REPORT.md §c/§d).

PR title A: `PR-15A: Buyer drops endpoint + COACH_NEW_PURCHASE + SSR thank-you parity`
PR title B: `PR-15B: PurchaseUnpackScreen + flip Deliverables to live endpoint`
Branch A: `pr15/buyer-drops-and-purchase-notify` (backend). Branch B: `pr15/purchase-unpack-screen` (mobile).

---
## PR-15A — BACKEND (growth-project-backend)

### A1 — Buyer drops endpoint (THE PREREQ that unblocks PR-13's mobile Deliverables screen)
Add `GET /v1/checkout/purchases/:purchaseId/drops` to the checkout controller. It MUST match the contract PR-13 built against EXACTLY:

```
Auth:     JwtAuthGuard; req.user.id must own the ClientPurchase (purchase.client_id === req.user.id).
          IDOR guard: a buyer can ONLY see drops for their OWN purchase. Cross-user → 404 (NOT 403; no existence leak — mirror the requireOwned pattern used in coach-media.service.ts).
Response: { drops: Array<{ id, asset_type, asset_id, asset_revision_id, cadence_kind,
                           display_title, display_caption, fire_at, fired_at, status, materialised_ref }> }
Source:   ScheduledDrop where client_purchase_id = :purchaseId
Filter:   status IN ('pending','due','fired')  — exclude failed/canceled/skipped (those go to COACH_ALERT, never the buyer; master plan §1 #10).
Order:    COALESCE(fired_at, fire_at, created_at) ASC.
```

Field sourcing (verify against PR-3 schema + PR-9/PR-10 writes):
- `asset_type`, `asset_id`, `asset_revision_id`, `cadence_kind` — from ScheduledDrop / its CoachPackageContent snapshot. Use the snapshotted display fields if present (drops should carry a stable display_title/caption captured at seed time — confirm PR-9 seeded them; if display_title/caption are NOT columns on ScheduledDrop, derive them from the linked CoachPackageContent + asset, but prefer the snapshot to stay correct after coach edits).
- `materialised_ref` — the resolver's materialised reference (workout/plan → assignmentId; meal_plan → date; auto_message/pdf/video → per resolver). For NOT-yet-delivered (pending/due) drops this is null. Never fabricate (master-plan Rule 18).
- `display_caption` may be null.
- Return as an ENVELOPE `{ drops: [...] }` (PR-13's unwrap accepts both envelope and bare array, but ship the envelope).

Pagination: a single purchase's drop count is bounded (one per package content) — no pagination needed, but cap defensively (e.g. take 500) and document. No N+1: fetch drops + any needed asset joins in a single query / batched includes.

Status mapping: keep `pending`/`due`/`fired` as-is in the payload (the mobile maps fired→Delivered, pending|due→Upcoming). Do NOT collapse them server-side.

Buyer-visible only: filter at the SQL WHERE, not in JS, so failed drops never leave the DB.

Tests: owner sees their pending+due+fired drops in COALESCE order; failed/canceled/skipped excluded; cross-user purchaseId → 404; unknown purchaseId → 404; empty → `{ drops: [] }`; materialised_ref null for upcoming, populated for delivered workout/meal; no N+1 (assert query count or use a single findMany+include).

### A2 — COACH_NEW_PURCHASE notification
On a successful purchase entitlement (all 3 paths converge at PurchaseFanoutService.onPurchaseEntitled — see master plan §5), notify the SELLING coach that they have a new purchase. Add notification kind `COACH_NEW_PURCHASE` (+ prefs backfill, default ON for coaches — mirror how PR-10 added DRIP_RELEASED prefs; do NOT let it fall through to a default-off digest bucket, that was a PR-10 bug). Push + in-app (decision #9 style). Body: buyer display name (or "A new client" if guest-just-converted), package name, amount. Stage the alert IN the entitlement tx and FLUSH post-commit (the pattern PR-9 established for in-tx alert staging) so a rollback doesn't fire a phantom "new purchase". Idempotent: exactly one COACH_NEW_PURCHASE per purchase even on Stripe webhook replay (key off purchase id + a durable marker, like PR-9's DripResolverMarker pattern, or a unique notification idempotency key).

Tests: coach gets exactly one COACH_NEW_PURCHASE on entitlement; replay does not double-notify; rollback fires none; prefs OFF suppresses it; guest-converted purchase still notifies the coach.

### A3 — SSR thank-you parity
The web storefront SSR thank-you/return page must reach parity with the in-app PurchaseUnpackScreen content: show "here's what you just got + what's coming" — i.e. surface the buyer's drops (delivered immediate ones + upcoming) and a receipt summary. Find the existing SSR thank-you/return handler in the storefront (guest-checkout / storefront SSR — grep for the existing return/thank-you/success page). Render the same drop data (reuse the A1 query/service, buyer-scoped to the just-converted purchase) so web buyers see their deliverables timeline, not just "payment received". Keep it SSR (no client JS dependency). If the SSR thank-you currently shows only a generic success, upgrade it to list immediate-delivered items + upcoming schedule + receipt (amount, package, next charge date if recurring). Scope-guard: do NOT rebuild the whole storefront; extend the existing success/return template only.

Tests: SSR thank-you for a converted purchase renders the drop list (delivered + upcoming) and receipt; a purchase with only future drops shows the upcoming schedule; recurring shows next-charge.

### A scope guards
Do NOT change the fan-out engine logic, the cron, or media internals beyond reading their outputs. A2's alert staging reuses the existing post-commit flush. Additive only.

---
## PR-15B — MOBILE (growth-project-mobile)

### B1 — Flip Deliverables from contract-stub to LIVE
PR-13 shipped the Deliverables screen + `clientPaymentsApi.getPurchaseDrops` typed client, flag-gated behind `EXPO_PUBLIC_FF_DELIVERABLES` (default OFF in prod). Now that PR-15A ships the real endpoint:
- Verify the live endpoint response matches the frozen typed contract (PR13_BUILD_REPORT.md §c). If A had to deviate, reconcile the client types here.
- Keep the flag but document that it can be flipped ON in prod once 15A deploys (do NOT change the prod default in this PR unless explicitly safe — leave the rollout toggle to ops; flip the DEV default ON so it's testable). Keep the 404→error (NOT not_configured) and 501→not_configured mapping from PR-13.

### B2 — PurchaseUnpackScreen
Build the buyer-facing `PurchaseUnpackScreen` — the "here's what you just got + what's coming" moment shown right after a successful in-app purchase (decacorn/Apple-grade; this is the emotional payoff screen). Requirements:
- Shown after CheckoutReturnScreen / successful purchase confirm (wire the nav: on entitlement-confirmed, navigate to PurchaseUnpackScreen with the purchaseId).
- Fetches `getPurchaseDrops(purchaseId)`. Splits into "Unlocked now" (status='fired'/delivered immediate drops) and "Coming up" (pending/due upcoming) with unlock timing copy (immediate / on_completion / on_milestone / fire_at date — reuse PR-13's `upcomingCaption` helper if shared, else mirror it).
- Per-asset_type tappable destinations identical to PR-13's Deliverables table (workout→WorkoutAssignmentDetail{assignmentId:materialised_ref}, meal_plan→ClientDailyMealPlan{date}, auto_message→Messages, pdf/video non-tappable "Saved to your library"). Reuse PR-13's row component + routing helpers — do NOT duplicate; extract a shared DropRow/destination helper if PR-13 inlined it.
- Receipt summary header: package name, amount paid, recurring next-charge if applicable.
- States: loading skeleton, empty ("Your coach is setting things up" calm state), error retry banner, pull-to-refresh.
- A "Done"/"Go to my deliverables" CTA that lands on the Deliverables screen or home.
- Flag-gate consistent with PR-13's deliverables flag (same FF or a sibling) so it can't strand users if 15A isn't deployed: if the endpoint 501s/not_configured, show a graceful "purchase complete, deliverables coming" state instead of an error.

Tests (real RTL, not mocked-away): unlocked vs coming-up split; tappable/non-tappable per asset_type; missing materialised_ref → non-tappable (never navigates); recurring receipt shows next-charge; not_configured → graceful complete state; pull-to-refresh refetches; nav wiring from purchase-confirm into PurchaseUnpackScreen asserted.

### B scope guards
Reuse PR-13 components/types. No new viewers for pdf/video (those are non-tappable per Rule 18). Do not touch checkout payment logic (PR-1).

---
## Deliverables (both)
- A: branch `pr15/buyer-drops-and-purchase-notify`, PR vs default; write `/home/user/workspace/specs/PR15A_BUILD_REPORT.md`.
- B: branch `pr15/purchase-unpack-screen`, PR vs default; write `/home/user/workspace/specs/PR15B_BUILD_REPORT.md`.
- Each report: file:line of every change, the exact endpoint response shape A shipped (so B can reconcile), idempotency proof for COACH_NEW_PURCHASE, IDOR proof for the drops endpoint, and ACTUAL typecheck/lint/test counts (run them).
- Commit identity: `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'`. NO Co-Authored-By / Generated trailers.
- Pull latest default first (A builds on PR-1..14; B builds on PR-1..13 mobile).
