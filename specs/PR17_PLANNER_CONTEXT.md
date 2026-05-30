# PR-17 EXPANSION — PLANNER CONTEXT (read this fully before planning)

You are a **PLANNER** (no code changes). Your job: survey the existing codebase foundation across both repos, identify what's broken/missing, and lay out a concrete, sequenced build plan + page/path layout for the **"edit-after-purchase → push to existing buyers"** feature line and the **coach content-authoring UI** it depends on. The operator (parent agent) will synthesize your plan and dispatch builder subagents.

## What the feature is
A coach edits or adds package content (a workout, meal plan, PDF, video, or auto-message) AFTER buyers have already purchased. Today, those existing buyers get NOTHING for content added/edited after their purchase — the fan-out engine only seeds ScheduledDrops at purchase time. PR-17 lets the coach **"push to existing"**: seed/refresh ScheduledDrops for already-entitled buyers, with a prompt each time (push-to-existing vs future-only).

## The 12 LOCKED product decisions (do not relitigate — design AROUND these)
**Semantics**
1. Audience = coach picks per-push: all buyers / active-only / a cohort.
2. fire_at = coach-chosen date (date picker).
3. Trigger = prompt EACH TIME content is added or edited (modal: "push to existing buyers" vs "future buyers only").
4. Coverage = new content + cadence edits + full edits all can trigger a push.
**Idempotency / safety**
5. Already-FIRED drops are IMMUTABLE. Coach gets an explicit "re-send updated version" option that creates a FRESH delivery (new drop), never mutates the fired one.
6. Past dates are BLOCKED — the date picker enforces today-or-later.
7. ALL drop scheduling happens in ONE atomic DB transaction, CHUNKED for large buyer counts. NO Stripe calls anywhere in this path (so no money-path risk; honors the rule: no sync Stripe HTTP inside a Prisma $transaction).
8. Double-push defense in depth = BOTH a UUID idempotency key (mutation header) AND the DB upsert-by-unique on `@@unique([client_purchase_id, content_id])`.
**UI / rollout**
9. Buyer notification = coach toggles per-push, default ON, reuses the existing `DRIP_RELEASED` notification kind.
10. Confirm UI = full preview: "delivers to N buyers on <date>" with count / date / notify-state.
11. NO feature flag — App Store ready, FULL PRODUCTION.
12. Entry point = USER DECISION: build the ENTIRE feature line thoroughly, including the missing coach content-authoring UI on mobile, then per-card "push" inline. This is priority #1 and must be done thoroughly.

## UI BIBLE principles (binding for all coach-facing UI in this feature)
The coach push flow is a HIGH-STAKES, money-adjacent, irreversible-feeling action. Apply:
- **Emotional target**: coach leaves feeling "in control / reassured" — they safely pushed updated content to N buyers.
- **CALM framework** for high-stakes: Clarity (full preview "delivers to N buyers on <date>"), Animation (≥300ms confirmation micro-interaction), Light feedback (haptic on confirm), Mascot/warm presence. Warm closure copy ("Update sent to N buyers" / "Your buyers are getting the update") NOT "Action complete".
- **Hick's Law**: ONE primary path per screen; smart default preselected (notify ON, safe audience default). De-emphasize secondary options.
- **Miller's Law**: ≤5 actionable elements visible without scrolling in the confirm modal (count, date, audience, notify toggle, primary CTA — cancel is tertiary).
- **One concept per moment**: the push decision is its OWN modal, not buried inside the edit form. Sequence: edit content → on save, prompt push-vs-future-only → if push, confirm-preview modal → success closure.
- **Error prevention not reporting**: past-date picker disabled (#6); already-fired drops immutable with explicit "re-send updated version" (#5); the wrong action is HARDER than the right one.
- **Anti-Pattern 4 (Empty Confirmation)**: the success state gets a dedicated celebration/closure micro-interaction, never static text.
- **Progressive disclosure**: audience scoping (all/active/cohort) visible but the safe default is preselected; advanced not foregrounded.
- **Consistency**: reuse the repo's existing modal/sheet, button, color-token, and gesture vocabulary. Brand = quiet luxury: cream #F5EFE4, forest #2C4A36, charcoal, Cormorant Garamond / Inter, NO emoji.
- **One-sentence screen test**: each new screen describable in one clause ("This is where the coach authors package content" / "...pushes an update to existing buyers").

## CODEBASE FOUNDATION — confirmed findings (verify + extend these)
Repos cloned at `/home/user/workspace/repos/{growth-project-backend,growth-project-mobile,tgp-agent-context}`. GitHub account `BradleyGleavePortfolio`, all 3 repos PRIVATE. Use `bash` with `api_credentials=["github"]` for gh/git.

### Backend (NestJS + Prisma + Stripe) — `growth-project-backend`, branch main @ 3f7ab76
- `src/packages/purchase-fanout.service.ts` (760 lines) — **THE core engine to reuse.**
  - `onPurchaseEntitled(purchase, ctx, tx)` seeds ScheduledDrops at purchase time: loads `coachPackageContent` (removed_at null), computes `fire_at` per cadence via `computeFireAt`, bulk `createMany({ skipDuplicates: true })` keyed on `@@unique([client_purchase_id, content_id])`, then materialises due-now drops INLINE in the tx.
  - `computeFireAt(kind, payload, purchaseTime, now)` — immediate→now; relative_to_purchase→purchaseTime+offset_days; fixed_calendar→release_at (past→now); on_completion/on_milestone→null. **The push-to-existing backfill must reuse this exact function** so existing buyers get correct fire_at relative to THEIR purchase time.
  - `cancelPendingForPurchase(clientPurchaseId, reason, tx?)` (PR-16) — set-based UPDATE of pending/due→canceled; idempotent; optional tx. A model for the set-based, tx-accepting, idempotent style PR-17's push method should mirror.
  - DRIP_RELEASED alert staging (`pendingAlerts`/`flushAlerts`) + COACH_NEW_PURCHASE pattern — reuse DRIP_RELEASED for buyer notify (#9).
- `src/packages/package-contents.controller.ts` (110 lines) — `@Controller('v1/coach/packages/:id/contents')`, guards JwtAuthGuard + CoachOrOwnerGuard + SubscriptionGuard, roles coach/owner. Endpoints: GET list, POST attach, PUT reorder, PATCH :contentId, DELETE :contentId (soft-delete). **This is where the push trigger (#3) hooks in** — on attach (new content) and patch (edit/cadence change).
- `src/packages/package-contents.service.ts` — attach/patch/reorder/softDelete; zod per-cadence-kind validation; pg_advisory_xact_lock for display_order integrity; auto_message body contract. Patch is all-or-nothing on cadence.
- `prisma/schema.prisma` — `model ScheduledDrop`: id, client_purchase_id (FK→ClientPurchase, cascade), content_id (snapshot ref, NOT FK), asset_type, asset_id, asset_revision_id, cadence_kind, cadence_payload Json, display_title, display_caption, fire_at, fired_at, status (pending|due|fired|skipped|failed|canceled), attempt_count, materialised_ref, failure_reason, locked_at, next_retry_at, alert_dispatched_at, created_at, updated_at. Constraints: `@@unique([client_purchase_id, content_id])`, indexes on (status,fire_at), (client_purchase_id,status), (status,next_retry_at,fire_at).
  - **KEY INSIGHT**: because of the @@unique guard, a buyer who purchased BEFORE a content row was added has NO drop for it. Push-to-existing = create those MISSING drops (and, for #5 "re-send", create a fresh delivery for already-fired ones via a different mechanism since the unique pair already exists — RESOLVE THIS: re-send needs a fresh row but the pair is taken; investigate options e.g. a re-send sequence/version column, a separate "manual_push" drop variant, or a nullable discriminator in the unique key — propose the cleanest additive schema change).
- `src/packages/drip-dispatcher.cron.ts` — 1-min cron, claims pending/dispatching, retry/backoff. The pushed drops flow through this same cron. Verify the cron will pick up backfilled pending drops correctly.
- Tests: 3,609 backend. PR-16 merged (16/18). All prior PRs Auditor-CLEAN.

### Mobile (React Native / Expo) — `growth-project-mobile`, branch main @ 0b83c75, App Store id6765847915 LIVE
- **THE GAP**: there is NO coach content-authoring screen and the contents endpoints are NOT wired into the mobile API client.
  - `src/api/packagesApi.ts` — `coachPackagesApi` has list/get/create/update/archive/subscribers/earnings ONLY. NO contents (attach/patch/list/reorder) methods. Has `idemHeaders(key?)` → `{ headers: { 'Idempotency-Key': ... } }` and `generateIdempotencyKey()` — reuse for #8. Note `toBackendIntervalFields` interval mapping precedent.
  - `src/screens/coach/payments/CoachPackageEditScreen.tsx` (636 lines) — edits PACKAGE-level fields only (price, billing interval, share, archive). NOT contents.
  - `src/screens/coach/payments/CoachPackageSubscribersScreen.tsx` (291 lines) — wires `coachPackagesApi.subscribers(packageId)`, renders honest subscriber states (active/past_due/canceled/trialing). A candidate host for a package-level push and the buyer-count source for the preview.
  - `src/screens/coach/payments/CoachPackagesListScreen.tsx` — list.
  - Buyer-side drip consumer EXISTS: `src/screens/client/DeliverablesScreen.tsx`, `src/screens/client/deliverables/dropRow.tsx` (PR-13/15B) — buyers already see dripped content; pushed drops must render correctly here.
- Tests: 1,521 mobile.

## YOUR PLANNING DELIVERABLE — write to `/home/user/workspace/PR17_EXPANSION_PLAN.md`
Produce a concrete, build-ready plan covering:
1. **Foundation audit**: What exists and is sound to build on. What is BROKEN or missing as-is (e.g. mobile contents API not wired, no authoring screen, the re-send-vs-unique-key conflict, any cron/fanout edge that breaks under backfill). For each broken/missing item: how to fix it and what to build on top.
2. **Backend work breakdown**: exact new endpoint(s) (path, verb, guards, body, idempotency), the new push/backfill service method (reusing computeFireAt + set-based + chunked + atomic, no Stripe), the schema change needed for #5 "re-send" (additive migration proposal), how attach/patch trigger the prompt (#3), audience scoping query (all/active/cohort #1), notify reuse (DRIP_RELEASED #9). Cite file:line.
3. **Mobile work breakdown**: the full content-authoring UI to build (list contents, attach, edit cadence — wire the contents API client), the per-card push entry point (#12), the push-vs-future-only prompt modal, the CALM confirm-preview modal (#10), audience picker (#1), date picker with past-date block (#6), notify toggle (#9), success closure. Map each to UI Bible principles. Cite the existing screens/components/tokens to reuse.
4. **Page/path layout**: navigator routes + screen files to add, where they hang off existing navigation, and the new API client methods.
5. **Sequenced PR plan**: break the work into PRs/work-units sized for the pipeline. For EACH unit specify: repo, branch name, exact files touched, dependencies/ordering, and CRITICALLY **which units can run in PARALLEL (NON-OVERLAPPING files) vs which must be sequential**. Backend foundation likely must precede mobile wiring. Flag any file two units would both touch (forbidden for parallel).
6. **Risks & R1 watchpoints**: idempotency, atomicity, no-Stripe-in-tx, IDOR/tenant-scope on the new endpoint, the immutable-fired-drop invariant, scope-creep boundaries.

Be concrete and cite file:line throughout. Do NOT write code. Verify findings against the actual repos before trusting this summary.
