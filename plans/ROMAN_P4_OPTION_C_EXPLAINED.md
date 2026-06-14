# Roman P4 Option C — plain-English explainer

**Audience:** Operator + any future agent picking up Roman P4 cold.
**Reference architecture:** `ROMAN_ED3_REWRITE_PLAN.md` (the technical version).
**Author:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Created:** 2026-06-13

## What we're building

Two final polish moments in Roman P4 on the coach side of the app:

- **ED.3 — First Payment Wow:** When a coach gets paid by a new client for the very first time ever, show a celebratory moment ("You just landed your first client — $X coming in"). Exactly once, forever.
- **ED.4 — Progress Chart animations:** A polished animation pass on the existing coach progress/earnings chart. Visual only, no data-shape changes.

ED.4 is uncontroversial mechanical work. ED.3 is the design-careful one.

## Why the existing #242 mobile code isn't safe

PR #242 currently counts purchases on the mobile client: when the coach opens the home screen, the app reads the `ClientPurchase` table directly and checks if the count is exactly 1. If yes, show the celebration.

Three problems:

1. **It can fire twice.** Coach opens app on phone A while a refund is in flight from phone B — count flickers 1 → 0 → 1, celebration may re-trigger.
2. **It races Stripe webhooks.** If the webhook hasn't landed yet but mobile is polling, celebration appears 30 seconds late on whatever unrelated screen happens to be open.
3. **It leaks sensitive data into the mobile client.** Reading `ClientPurchase` from the coach's phone means granting row-level read access to a table the phone otherwise doesn't need.

## Options A and B (rejected)

- **A:** Client-side counting — what's in #242 today. Rejected for above 3 reasons.
- **B:** Add `first_payment_seen_at` column on the coach profile, set from webhook, read from mobile. Simpler than C but lacks idempotency under webhook retries.

## Option C — the picked path

### Step 1: New tiny table on the backend

A new Prisma model `CoachFirstPaymentNotification`. Stores `coach_id`, `client_purchase_id`, `created_at`. Has a `UNIQUE` constraint on `coach_id` — the database **physically refuses** to ever store a second row for the same coach. "Exactly once" is enforced by the DB, not by code logic.

### Step 2: Stripe webhook does the detection

When the backend receives a "payment succeeded" event, inside the **same DB transaction** that records the purchase, the webhook handler asks:

> "Is this coach's count of successful purchases (excluding this one) equal to zero?"

If yes, INSERT a row into `CoachFirstPaymentNotification`. If the webhook retries (Stripe retries 3-5 times by design), the second INSERT hits the UNIQUE constraint and silently no-ops. No code branching for "is this a retry?" — the DB handles it.

### Step 3: Backend emits a notification

Right after the INSERT succeeds, the backend uses the existing notifications module (which already powers Roman P1-P3) to push a notification of a new kind: `NotificationKind.FIRST_PAYMENT`. Payload includes dollar amount + client name. The notifications module already handles delivery, retries, and ordering.

### Step 4: Mobile subscribes to the notifications stream

The mobile app on the coach's phone has a `useNotifications()` hook that listens to all notification kinds. We add a handler for `FIRST_PAYMENT`: when one arrives, show the celebration screen.

### Step 5: Existing PR #242 trimmed ~80%

The mobile code reading `ClientPurchase` directly gets deleted. Replaced with a ~50-line subscriber to the notification stream. The visually polished celebration UI itself stays. ED.4 chart animations stay. Result: PR #242 keeps roughly 80% of its mobile code; the dangerous 20% is gone.

## Why this is "exactly once" forever

- DB UNIQUE constraint → exactly one notification row ever exists per coach
- Notification module → at-least-once delivery, but the mobile UI dedupes by notification ID
- Mobile UI → idempotent: re-displaying the same notification ID is impossible because it's consumed on first display

Stripe can retry the webhook 1000 times, the coach can use 5 phones, the mobile app can be killed mid-render — celebration shows exactly once across the coach's lifetime.

## What ships where

- **NEW backend PR** (~150-250 LOC): `CoachFirstPaymentNotification` model + migration, webhook detector logic, `NotificationKind.FIRST_PAYMENT`. Behind feature flag `FEATURE_ROMAN_FIRST_PAYMENT`.
- **Refactored PR #242** (mobile): drops `ClientPurchase` reads, adds notification subscriber, keeps existing celebration UI + ED.4 chart animation. Behind `EXPO_PUBLIC_FF_ROMAN_FIRST_PAYMENT`.
- **Both default-off.** Killable from server side instantly.

## Operator quick-reference for tradeoffs

| Concern | Option A (current #242) | Option C (this plan) |
|---|---|---|
| Idempotency under webhook retry | ❌ depends on client logic | ✅ DB UNIQUE constraint |
| Race vs Stripe webhook timing | ❌ can fire late on wrong screen | ✅ notification arrives when ready, UI handles cleanly |
| Sensitive data on mobile | ❌ ClientPurchase RLS surface | ✅ only notifications surface |
| LOC delta on existing PR #242 | n/a | -200 mobile +50 mobile +200 NEW backend |
| Visible to user | celebration may flicker / fire twice | celebration shows exactly once forever |
| Killable from server | requires app update | feature flag flip |
