# PR-18 Polish Backlog (accumulated non-blocking P3s)

## From PR-8 (#318)
- softDelete leaves gaps in display_order (non-contiguous but non-duplicating — editor unaffected; optional re-compaction).
- DISPLAY_ORDER_TAKEN on a single-row patch move is a dead-end requiring /reorder for swaps (acceptable per brief; consider a swap-aware move).

## From PR-9 (#319)
- Narrow process-crash window between auto_message send-commit and materialised_ref stamp (acknowledged in resolver comment; strictly narrower than pre-fix). Consider a transactional outbox for sends.
- splits-outside-tx observability: rollback emits a warn naming SplitLedgerEntry/WorkoutBuilderIdempotencyKey/DripResolverMarker to reconcile — consider an automated sweeper/alert rather than manual runbook.
- `tx ?? this.prisma` cast loses some type safety.

## From PR-10 (#320)
- Slow-but-alive-worker + stale-cutoff reclaim race: buyer may get DUPLICATE push/in-app alerts (content still delivered exactly once). Consider alert-dedup keyed on (drop_id) / alert_dispatched_at check before sending, or lengthen stale cutoff vs max materialisation time.
- Concurrency test serialises at JS event loop, not real Postgres (production claim is sound; test coverage gap).

## PR-14 (guest recurring) P3s
- The new `retrieveSubscription` Stripe HTTP call in `convertGuestToUser`'s status-read lives under the outer `BillingService` `$transaction` on the PI-succeeded route. Consistent with the pre-existing Supabase HTTP in the same path and not incorrect, but the pre-resolve-before-tx pattern (A276-P1-3) should be extended to it. (R2 audit P3)
- Combo min/max guard error messages don't distinguish the one-time half from the recurring half (will confuse coaches whose recurring half falls below the Stripe floor).
