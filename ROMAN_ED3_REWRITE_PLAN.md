# Roman ED.3 — First-Payment Surface Rewrite Plan (Option C)

**Status:** Operator-approved (Option C — "Apple-grade", backend emits first_payment notification, mobile subscribes to the notifications stream).
**Original PR:** #242 (mobile) — needs partial rewrite, NOT full redo.
**Why:** R7 audit returned DIRTY-CRITICAL — direct mobile reads of `ClientPurchase` table are a payment-correctness blocker. Apple's pattern is: never have the client tail the payment table directly; have the backend emit a domain notification when the payment is confirmed, and have the client react to the notification.

---

## Architecture (Option C)

### Backend (new PR — ~150-250 LOC)

**File: `src/checkout/checkout-webhook-handler.service.ts`**

Two callsites: `:439-506` and `:837-865` (both are the points where `ClientPurchase.status` flips from `pending` → `paid` / `processing` / a successful terminal status).

Immediately after that status flip and inside the same DB transaction, run:

```
count(ClientPurchase
       WHERE status IN successful_set
         AND coach_user_id = X
         AND id != current.id) == 0
```

If zero (i.e. this is the coach's **first** ever successful payment), `INSERT INTO CoachFirstPaymentNotification (coach_user_id, purchase_id, created_at)` with `UNIQUE(coach_user_id)` so it's idempotent under webhook retries.

Then emit via the existing notifications module so the client receives it as a normal real-time notification:

```
notificationsService.emit({
  kind: NotificationKind.FIRST_PAYMENT,
  recipient_user_id: coach_user_id,
  payload: { purchase_id, client_user_id, amount_cents, currency },
})
```

**File: `src/notifications/notification-kind.ts`**

Add `FIRST_PAYMENT = 'first_payment'` to the `NotificationKind` enum.

**New file: `src/notifications/emitters/first-payment-emitter.service.ts`**

Thin wrapper around the existing emitter that knows the FIRST_PAYMENT schema. Validates payload via Zod, calls the existing broadcast path. No new transport.

**Tests:**
- Webhook handler test: pending→paid with no prior successful purchases → 1 notification emitted, idempotent across retries (UNIQUE constraint).
- Webhook handler test: pending→paid with 1+ prior successful purchases → 0 notifications emitted.
- Webhook handler test: refund / chargeback / failed → 0 notifications.
- Emitter test: payload shape, Zod validation, no crash on missing optional fields.

**Roman copy:** Pull from `AI_BUTLER_ROMAN_IDENTITY_SPEC.md §2.6` (already drafted).

---

### Mobile (rewrite ON EXISTING #242 BRANCH — NOT from scratch — ~200 LOC delta)

**~80% of #242 is salvageable.** Keep:
- State machine (idle → armed → playing → completed → dismissed)
- Exactly-once latch (MMKV gate keyed on coach_user_id)
- MMKV gate
- The screen itself (`RomanFirstPaymentScreen.tsx`)
- ALL tests except the realtime-source test
- ALL of ED.4 (ProgressChartCard, detectPersonalRecord, ProgressScreen chart wiring — splits to its own PR)

**Replace ONLY** `useFirstPaymentRealtime.ts` → rename to `useFirstPaymentNotification.ts`:

- Subscribe to the existing notifications stream
- Filter for `notification.kind === 'FIRST_PAYMENT'`
- On first match, arm the state machine + flip the MMKV latch
- Drop the unused `romanFirstPaymentRequireBackendHistory` feature flag (it was a band-aid that's no longer needed)
- Fix stale `// INSERT INTO ClientPurchase ...` comments
- Update test file: mock the notifications stream emitter instead of direct realtime channel

**No new mobile RN package required** — uses the same notifications subscription the rest of the app already uses.

---

## Why this is "Apple-grade"

1. **Single source of truth.** Backend owns the "first payment" decision. Mobile never needs to know about `ClientPurchase` schema, status transitions, or retry/refund semantics.
2. **Idempotent.** `UNIQUE(coach_user_id)` on the notification table means duplicate webhooks emit zero duplicate notifications.
3. **Replayable.** If the client misses the live notification (offline at the moment of first payment), it's just another unread notification on the next app open — same as every other notification surface.
4. **Auditable.** Notifications are queryable forever; "did we send this user the first-payment surface?" is one SQL query away.
5. **No payment-correctness coupling.** Mobile never reads payment tables directly — Apple's pattern.

---

## Split: ED.4 → its own PR (operator approved)

ED.4 polish components from #242 (`ProgressChartCard.tsx`, `detectPersonalRecord.ts`, `ProgressScreen.tsx` chart wiring + tests) are independent of ED.3 / first-payment flow and were CLEAN in the R7 audit. They split off into their own small mobile PR for a fast clean win.

**Action:** Cherry-pick those files onto a fresh branch off main → open as a new PR → ship.

---

## Sequence

1. **NOW:** Open ED.4 split PR (small, fast, clean win).
2. **THEN:** Backend Option C PR (new emitter + notification kind + tests).
3. **THEN:** Mobile rewrite on #242 branch (replace one hook, drop the flag, fix comments, update one test). Force-push.
4. **THEN:** Fresh R31 audit on rewritten #242.
5. **MERGE** once CLEAN.

## R73 applicability
This rewrite is **mid-cycle** — R73 (mobile screen planner gate) does NOT apply retroactively. R73 starts from PR #393 merge SHA forward.

## Operator decisions captured
- Option C selected (verbatim: "Option C ... lets do that one!")
- ED.4 split approved (verbatim: "Split ED.4 polish into its own small mobile PR for a fast clean win")
- Full redo NOT needed (~80% salvageable) — clarified to operator in last exchange.
