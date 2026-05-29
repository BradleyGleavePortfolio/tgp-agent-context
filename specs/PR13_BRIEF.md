# PR-13 BUILD BRIEF — Mobile "Deliverables" section (buyer-facing drip timeline)

**Repo:** growth-project-mobile (React Native / Expo). **Type: BUILD.**
**Branch:** `pr13/mobile-deliverables` off latest default.

## GOAL
Give the BUYER (client) a mobile view of what they purchased and what's been / will be delivered: a "Deliverables" section that lists their package's ScheduledDrops — delivered ones (tappable to the materialised asset) and upcoming ones (with when they unlock). This is the consumer surface for the drip engine PR-9/PR-10 deliver into. Apple-grade polish.

## CONTEXT TO READ FIRST (authoritative)
- /home/user/workspace/specs/PACKAGES_DRIP_FEED_MASTER_PLAN.md §1 (decisions) + §3 (ScheduledDrop, ClientPurchase, CoachPackageContent models — the fields the mobile UI renders: status delivered/pending/failed, fire_at, display_title, display_caption, asset_type, materialised_ref).
- /home/user/workspace/specs/PR1_BUILD_REPORT.md — the mobile checkout/purchase wiring PR-1 fixed: clientPaymentsApi.ts now hits real /v1/checkout/* routes, purchase status derived from GET /v1/checkout/purchases + real ClientPurchase columns. PR-13's Deliverables view reads purchase + drop data — reuse the SAME api client patterns PR-1 established; do NOT reintroduce dead/fabricated routes/fields.
- /home/user/workspace/specs/PR5_BUILD_REPORT.md — mobile surface unification (Surface B). Follow the established nav + screen conventions.
- /home/user/workspace/specs/PR6_BUILD_REPORT.md + PR8_BUILD_REPORT.md — the backend package + contents read endpoints (shapes the mobile may consume).

## BACKEND ENDPOINTS THE MOBILE NEEDS (verify they exist; if a buyer-facing drops list endpoint is MISSING, this is the key question)
The buyer needs to fetch THEIR drops for a purchase. Check the backend for an endpoint like `GET /v1/checkout/purchases/:purchaseId/drops` or `GET /v1/clients/me/deliverables` returning the buyer's ScheduledDrops (delivered + upcoming) with display_title/caption, status, fire_at, asset_type, and a link/ref to the materialised asset for delivered ones.
- IF such an endpoint EXISTS: consume it.
- IF it does NOT exist: this PR is mobile-only per scope, so DOCUMENT the gap clearly in the build report and STILL build the mobile UI against the best available existing endpoint (e.g. derive from GET /v1/checkout/purchases + whatever drop/asset data is exposed). Do NOT add a backend endpoint in this mobile PR (that would cross repos) — instead, if the needed read truly doesn't exist, flag it as a PREREQ for a follow-up backend PR and build the UI to a clean API contract you define (typed client) so wiring is trivial once the endpoint lands. Be explicit about which path you took.

## THE UI (Apple-grade, above Everfit)
- A "Deliverables" / "What's included" section on the buyer's purchase/package detail screen (and/or a dedicated screen reachable from their purchases list).
- Render a TIMELINE / grouped list:
  - Delivered drops: title, caption, asset-type icon (workout/meal/pdf/video/message), delivered date, TAPPABLE -> opens the materialised asset (route to the existing workout/meal/pdf/video/message viewer the app already has — reuse existing viewers, do NOT build new ones).
  - Upcoming drops: title, caption, "Unlocks {relative date}" (e.g. "Unlocks in 3 days" / "Unlocks May 31"), locked styling. on_completion/on_milestone (no fire_at) show as "Unlocks when you complete {X}" / "Unlocks at {milestone}".
  - Failed drops (if surfaced to buyer at all): handle gracefully — probably hide from buyer or show a neutral "coming soon"; do NOT show scary errors to the buyer (coach gets the COACH_ALERT). Document the choice.
- Empty state (no deliverables yet), loading state (skeletons), error state (retry). Pull-to-refresh.
- Match the app's existing design system (typography, spacing, colors, components) — reuse existing list/card/section components. NO new design language.

## CRITICAL CORRECTNESS
- Reuse existing api client patterns (PR-1) + existing asset viewers — do NOT fabricate routes/fields or build parallel viewers.
- Type everything (the drops list response, the asset refs).
- Relative-date formatting correct + timezone-safe (use the app's existing date util).
- Tappable delivered items navigate to the RIGHT existing viewer per asset_type.
- Don't crash on partial/missing data (a delivered drop whose materialised_ref the viewer can't resolve should degrade gracefully).
- Accessibility: labels, hit targets.

## SCOPE GUARDRAILS
- Mobile only. Buyer-facing Deliverables view. 
- Do NOT add backend endpoints (cross-repo). Do NOT touch coach authoring (that's PR-8 backend + a future coach mobile surface). Do NOT build media upload (PR-12), purchase-unpack/thank-you (PR-15), refund UI (PR-16).

## VERIFICATION
1. tsc / typecheck + lint pass. Expo bundles (or the project's RN build/typecheck command passes).
2. Tests (match the mobile repo's existing test approach — RTL/jest if present): renders delivered + upcoming + empty + loading + error states; tapping a delivered item navigates to the correct viewer per asset_type; relative-date formatting; graceful handling of missing materialised_ref; pull-to-refresh refetches.
3. Existing mobile tests pass.

## COMMIT / PR RULES (STRICT)
- `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`. NO Co-Authored-By / Generated trailers.
- Branch `pr13/mobile-deliverables`, PR against default, report PR URL.
- PR description: the Deliverables UI, which endpoint it consumes (or the documented gap + the typed contract it's built against), which existing viewers it routes to per asset_type, states handled, the failed-drop buyer-visibility choice, test results.

## DELIVERABLE
Report: (a) PR URL, (b) the screens/sections added, (c) which backend endpoint consumed OR the documented gap + typed contract + backend follow-up prereq, (d) which existing asset viewers routed to per asset_type, (e) states handled, (f) failed-drop buyer-visibility decision, (g) test results. Copy to /home/user/workspace/specs/PR13_BUILD_REPORT.md.
