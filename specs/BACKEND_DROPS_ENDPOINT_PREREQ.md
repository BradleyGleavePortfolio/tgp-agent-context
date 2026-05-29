# PREREQ: buyer-facing drops endpoint (discovered by PR-13)
PR-13 (mobile Deliverables, #210) built against a typed contract for an endpoint that DOES NOT YET EXIST on the backend:
  GET /v1/checkout/purchases/:purchaseId/drops
Expected response: buyer's ScheduledDrops (delivered + upcoming) with display_title, display_caption, status, fire_at, asset_type, and a materialised asset ref/link for delivered ones. Server-side filter recommended: status IN ('pending','due','fired') + delivered (exclude 'failed' from buyer).
ACTION: The mobile Deliverables screen is non-functional until this lands. Fold this endpoint into a backend PR — natural home is PR-15 (PurchaseUnpackScreen + thank-you also needs buyer drop data) OR a small dedicated backend PR before PR-15. Owner + buyer scoped (buyer can only see their own purchase's drops). MUST match the typed contract PR-13 defined (see PR13_BUILD_REPORT.md).
