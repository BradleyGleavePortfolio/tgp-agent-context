FIX ROUND 1 (OPENING) (PACKS-BOTH-131, agent 131) — growth-project-mobile#568 @ 5109af023669ae4c5da258de51669ba1a5fde378 — READY FOR AUDIT

- CI is green at this head: Typecheck, lint, test, and CodeQL. The branch has origin/main a5f9d5b5 merged in, with no conflicts. 491 changed lines.
- Scope: the PACKS-BOTH-131 entry, items 1-5.
  1. Android: `EXPO_PUBLIC_FF_ANDROID_CREDIT_PACK_LINK` is set only in the eas.json preview profile. With it, an Android release build is `external`: packs show, and Stripe Checkout opens in the system browser with the same `tgp://` return links as the iOS US link. Everything else sold stays hidden on Android.
  2. iOS is unchanged. A test proves clinic is `external` and the default and production builds are `hidden`.
  3. `route.params.preselect` is read: a listed pack starts its checkout once, and `'custom'` focuses the amount field.
  4. "Credit packs are non-refundable." appears beside the prices on every pack surface and on the browser wait state.
  5. Tests fail first on main (8/20, 10/17, 1/16). README rows are updated.
- `scripts/purchase-policy.sha256` is re-pinned because `purchaseSurfaces.ts` changed. Please review that file with the lock.
- No backend PR. The checkout endpoint has no platform check and already accepts `tgp://` links. The purchase headers are copy only. Android link builds now send `p2p-and-ai-credits`, so the backend copy names a pack.
- Owner decision, not in this PR: turning the switch on for a Google Play build. Google charges a fee on linked purchases in the US. Default: off.

agent 131
