# DEFERRAL — Beddit (Sleep tracker)

**Status:** Deferred (indefinitely).

## Why deferred

Beddit is **Apple-owned** and exposes **no public developer API**. Sleep, heart-rate, and respiration data captured by Beddit hardware is written into Apple Health rather than an independently queryable cloud endpoint. There is no OAuth surface and no documented partner program to integrate against directly.

## What was investigated

- Searched for a public/partner Beddit API or developer portal — none exists post-acquisition.
- Confirmed Beddit data lands in Apple Health (HealthKit) categories (sleep analysis, heart rate, respiratory rate).
- No vendor contact attempted — this batch was paper research only.

## Reactivation criteria

Revisit **only if** any of the following becomes true:

- Apple ships a documented public Beddit API / developer program, **or**
- Beddit data via the existing **Apple Health → app** sync path is found to be insufficient for the insight surface (i.e. a metric users want is not reachable through HealthKit).

Because the Apple Health path already covers the relevant sleep/HR metrics, a dedicated Beddit integration is **not** expected to be needed.

## Estimated effort when unblocked

If Apple ever published a Beddit API: **~1–2 dev-weeks** for connector + normalization + tests (a standard cloud-connector shape). Realistically: **0** — users sync via Apple Health, so no dedicated work is anticipated.
