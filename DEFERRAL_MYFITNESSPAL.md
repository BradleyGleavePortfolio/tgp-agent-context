# DEFERRAL — MyFitnessPal (Nutrition / food logging)

**Status:** Deferred.

## Why deferred

The MyFitnessPal API is **gated behind partner approval and a commercial agreement**. It is not a self-serve, sign-up-and-go developer API: access to nutrition/diary data requires being an approved partner under a negotiated contract (with associated commercial terms). Until that business agreement is in place, there is no legitimate, supported way to pull a user's MyFitnessPal nutrition data.

## What was investigated

- Confirmed MyFitnessPal's API access is partner-gated (application + approval + commercial agreement), not open self-serve.
- Reviewed whether nutrition data is reachable indirectly via Apple Health — coverage is partial and inconsistent for full food-diary detail, so it does not fully substitute for first-party API access.
- No vendor contact / partner application attempted — this batch was paper research only.

## Reactivation criteria

Revisit when:

- A **commercial / partner agreement** with MyFitnessPal (Under Armour) is **in place and approved**, granting sanctioned API access to the data we need.

A business-development decision gates this; it is not an engineering blocker once access is granted.

## Estimated effort when unblocked

Once partner access + credentials are granted: **~2–3 dev-weeks** (OAuth/partner-auth connector + nutrition normalization into our sample model + dedup + tests). Add lead time for the **business agreement itself**, which is outside the engineering estimate.
