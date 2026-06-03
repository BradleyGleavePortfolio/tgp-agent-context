# DEFERRAL — Peloton (Connected fitness / workouts)

**Status:** Deferred.

## Why deferred

Peloton offers **no official public API** for workout export. The only data access available today is via undocumented, internal endpoints used by Peloton's own clients. Building on those would require **reverse-engineering** the private API, which **risks Peloton's Terms of Service** and is fragile — endpoints, auth, and payloads can change without notice and break the connector silently.

## What was investigated

- Confirmed there is no published Peloton developer program or OAuth integration for third-party workout export.
- Reviewed the reverse-engineering path (unofficial endpoints): rejected on ToS-risk and durability grounds.
- Evaluated the indirect path: Peloton → Apple Health → app. Peloton writes workout/heart-rate data to Apple Health, so much of the value is already reachable through the existing HealthKit sync.
- No vendor contact attempted — paper research only.

## Reactivation criteria

Revisit when **either**:

- Peloton ships an **official public OAuth integration** for workout export, **or**
- The **Apple Health export path** is determined to be insufficient for a metric users specifically want (and a sanctioned access route exists).

We will **not** ship a reverse-engineered Peloton connector.

## Estimated effort when unblocked

With an official OAuth API: **~2–3 dev-weeks** (OAuth connector + workout normalization + dedup + tests). Via Apple Health only: **~0**, already largely covered.
