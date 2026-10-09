## [134] 133-11: coachless flagged screenings alert the house account (in-app, existing coach alert path)

Job NEST-TOKENS-134, PR 2 (agent 134). Owner decision 133-11: a coachless client's flagged screening alerts the owner's house coach account. T4: health flag routing. Backend only. No schema change, no flags, no new sender.

### What changes for users (from the code)
- **Before:** a client with no coach who finished the consultation with a screening yes, an injury flag or a coach-review program had `screening_flagged_at` recorded and the extra-care selection applied, and **no one was told** (CONSULT-ALL-BE-133 P5).
- **Now**, in the same fenced completion transaction, the house account gets an in-app `coach_alert` Notification row. The house account is the live coach or owner account that holds the active `is_house` ClinicProgramSet that the completion used (decision 133-10: the owner's own coach account).
  - Body: "A client without a coach finished their consultation and was flagged for extra care." The body has no screening details and does not say "your coach".
  - Payload: `{ type: 'onboarding_screening_review', client_id, coachless: true }`.
- **What the house account still cannot do: read the intake.** `canCoachRead` needs a coach on the client, so the alert tells the owner that a flag exists and nothing more. No cross-tenant health data is exposed.
- **Unchanged:**
  - Coached clients: their own coach is alerted, with the same body and payload as before. That includes a coached client on the house programs (decision 133-3): the coach is alerted, never the house account.
  - Coachless clients with no flag get no alert.
  - A replayed completion alerts once.
- **Delivery is in-app only:** the same `tx.notification.create` path, and no DB trigger fans Notification rows out to push. On the phone, a `coach_alert` row has no `actionScreen` (mobile `notificationsNormalize`), so tapping it opens nothing.
- **Production today** (SELECT): no `ClinicProgramSet` rows, so nothing changes until the house seed runs (operator steps in CONSULT-ALL-BE-133).

### WHY / WHEN / WHO
- **Root cause:** a gap by design, not a regression. b#890 (CONSULT-ALL-BE-133, a7bf9ee1, merged 2026-10-08 17:59) let coachless clients complete the consultation. It deliberately alerted no one and left the choice to the owner (P5). The owner answered with decision 133-11.
- Bug IDs: decision 133-11. Related: P5 in CONSULT-ALL-BE-133.

### Changes
- `src/onboarding/onboarding.service.ts`: the alert recipient is `coach.id`, else the house set's `coach_id` when `source === 'house'`. Adds a coachless body constant.
- `test/onboarding.service.spec.ts`:
  - The coachless screening-yes test now expects exactly one alert to the house account, with no screening words and no "your coach", and confirms that `canCoachRead(house, client)` stays false.
  - New test: a replayed coachless completion alerts once.
  - Existing tests keep coached alerts unchanged and keep the coached-on-house alert going to the coach only.

### Evidence (seen in a test)
- **This branch:** `heavy.sh npx jest test/onboarding.service.spec.ts --runInBand` gives 84/84 (main has 83; one test changed, one added).
- **On main:** the changed test fails, because main records no notification for a coachless flag.
- **Lint:** eslint is clean on the touched src file.

### Proposed (needs operator)
- **Let the owner read a coachless flagged intake.** Today it cannot be read through the API, by design. Default: no, keep it as it is. Opening it would be a T4 tenancy change that needs its own decision.

### Not seen
Not seen on a device.

agent 134
