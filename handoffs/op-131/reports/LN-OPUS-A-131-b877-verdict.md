AUDIT Claude Opus 5.5 (LN-OPUS-A-131) — growth-project-backend#877 @ dc6149d74ee69ba7778585fb5602b4cdff8acb7f — VERDICT: APPROVE

Full review (T4 money copy + env manifest, 386 changed lines, CI 15/15 green + deploy-readiness-gate skipped, mergeable clean; dc6149d7 is a clean merge of main b72e2c45, tree identical to a fresh `git merge-tree`). Merge stays under the operator's HOLD (owner decision 10).

B: none.
U: none.

Checked (from the code):
- Pack wording matches what each build sells: src/ai-credits/client-purchase-policy.ts:48-53 says packs are sold only for `p2p-and-ai-credits` or `all` from iOS. Mobile main sends `p2p-only` from iOS store builds 6+ and `all` from Android (mobile src/config/purchaseSurfaces.ts:63-73, :98-100; src/services/api.ts:162-165), so iOS store and Android release coaches get the renewal sentence and are never told to buy a pack. No header (cron, web, old builds) gives the same safe default (:51).
- The global interceptor (ai-credits.module.ts:41) passes every non-HTTP context straight through (client-purchase-policy.ts:83), so WebSocket and scheduled work are untouched. Over HTTP it only sets the store (:87). The headers choose wording and never allow or refuse anything.
- Coach-only: Roman returns the unchanged client message first (src/roman/roman.service.ts:1693) and uses the new copy only for coaches (:1702); AI guidance picks it only for `pool.audience === 'coach'` (src/ai/ai.service.ts:529-530); the gateway path (ai-gateway.service.ts:292) is the coach-metered builder. Mobile detects pool-empty by code COACH_AI_BUDGET_EXHAUSTED / 402, not by text (mobile src/api/aiBuilderApi.ts:62, src/api/romanApi.ts:286, :592), so the new message breaks no detection.
- "They renew on <date>" is true: rollover always sets a positive base (src/ai-credits/ai-credits.constants.ts:83-89), and period_end is the first instant of the next period (client-purchase-policy.ts:66).
- Return links: the values are the exact links mobile's parser accepts (mobile src/screens/client/BrandedCheckoutWebViewScreen.tsx:159-182 with scheme com.growthproject.app, registered in app.json). The pack service uses them verbatim after any inline link (src/ai-credits/coach-ai-credit-pack.service.ts:104-113) and passes them to Stripe unchanged. The same scheme is already sent to Stripe by the client package checkout (src/checkout/checkout.controller.ts:32, :53). fly-env-sync is workflow_dispatch only, so main stays inert until the operator applies it.

C: the renewal date is the UTC day, so US coaches get credits back the evening before the stated date (edge, deferred to 10k clients).

agent 131
