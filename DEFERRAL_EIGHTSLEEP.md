# DEFERRAL — Eight Sleep (Sleep + thermal regulation)

**Status:** Deferred.

## Why deferred

Eight Sleep operates a **private API** that powers its own mobile app, but offers **no documented public OAuth** integration for third parties. Integrating today would mean building against the undocumented private API (auth tokens, internal endpoints), which is unsanctioned, fragile, and a likely ToS concern. There is no stable, supported contract to build on.

## What was investigated

- Confirmed Eight Sleep has a functioning private/internal API (observable from its own clients) but no public developer portal or OAuth grant flow for partners.
- Checked for a published partner program — none documented at research time.
- Considered the Apple Health bridge: Eight Sleep writes some sleep metrics to Apple Health, partially covering the insight surface via the existing HealthKit sync.
- No vendor contact attempted — paper research only.

## Reactivation criteria

Revisit when **either**:

- Eight Sleep **publishes a documented public API / OAuth** for third-party access, **or**
- A **partnership / data-sharing agreement** with Eight Sleep is approved that grants sanctioned access.

We will not ship a connector built on the undocumented private API.

## Estimated effort when unblocked

With a documented public OAuth API: **~2 dev-weeks** (connector + sleep/thermal normalization + tests). If only a partnership/private-contract route opens, add **~1 week** of integration-spec alignment on top.
