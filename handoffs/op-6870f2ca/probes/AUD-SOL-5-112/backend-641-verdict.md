AUDIT GPT-6.1 Sol — growth-project-backend#641 @ 563e3f80f913dd2a2b4efa5099d5e5944dabb19d — VERDICT: REQUEST CHANGES

Third independent lens, AUD-SOL-5 / operator 112. **Open A/B/C: 0/4/4**, including the inherited findings below; **two additional B findings** in this comment.

### Inherited dispositions, not duplicate findings

B-641-1 and B-641-2 remain open, and C-641-1 through C-641-4 remain optional; close these together with the new findings in one fix round, using [the existing Opus exact-head audit](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/641#issuecomment-5960027984).

### Additional findings

**B-641-3 — Currency-blind totals are labelled USD.** `src/coach-money/coach-money.service.ts:312,336-366` selects currency but neither scopes nor groups either ledger query by it, while `foldTotals:214-253` adds raw cents together and the response unconditionally says `usd`; supported package currencies include EUR/GBP/AUD/CAD in `src/packages/packages.dto.ts:27-31`. ([Summary/query evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/coach-money/coach-money.service.ts#L300-L366), [fold evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/coach-money/coach-money.service.ts#L214-L253), [allowed currencies](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/packages/packages.dto.ts#L27-L31))

An independent probe calling the candidate service with USD 9,800 cents and EUR 9,800 cents returns `currency: usd, net_cents: 19600`; that is not a truthful money amount. **Minimal fix:** explicitly group or filter every money total, comparison, and recurring amount by validated currency and return consistent currency metadata, without inventing an FX rate; add single-non-USD and mixed-currency regression cases. ([Affected exact-head implementation](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/coach-money/coach-money.service.ts#L300-L410))

**B-641-4 — Quarterly/weekly/multi-year subscriptions produce false MRR.** `src/coach-money/coach-money.service.ts:379-384,406-410` reads only the mutable package interval, ignores `interval_count`, divides yearly amounts by 12, and treats everything else as monthly, despite `src/packages/packages.dto.ts:37-45` allowing week/month/year and a count of more than one. ([MRR evidence](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/coach-money/coach-money.service.ts#L369-L410), [supported cadence](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/packages/packages.dto.ts#L37-L45))

The independent quarterly fixture returns 12,000 MRR cents for a USD 120 charge every three months, instead of 4,000. **Minimal fix:** normalize the actual subscription billing cadence, including interval count and the recurring component of mixed billing, with explicit rounding; retain immutable purchase/subscription cadence rather than silently changing MRR when a package is edited; test quarterly, weekly, and multi-year cases. ([Calculation under test](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/coach-money/coach-money.service.ts#L379-L410))

### Verification

All ten required checks are green at this head, including Schema parity; the read endpoints use authenticated coach identity, seller/payee-scoped queries, and explicit output selects rather than exposing payment secrets. ([Exact head](https://github.com/BradleyGleavePortfolio/growth-project-backend/commit/563e3f80f913dd2a2b4efa5099d5e5944dabb19d), [controller](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/coach-money/coach-money.controller.ts), [service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/563e3f80f913dd2a2b4efa5099d5e5944dabb19d/src/coach-money/coach-money.service.ts))

Local commands, run only through `/home/user/workspace/ops/heavy.sh`, at this exact detached head:

- `npx prisma generate` — passed, worktree-private client.
- `npx jest --runInBand --forceExit test/coach-money.service.spec.ts test/coach-connect.service.spec.ts test/talent-marketplace-connect-adapter.service.spec.ts` — **3 suites / 44 tests passed**.
- `npx jest --config /home/user/workspace/ops/evidence/AUD-SOL-5-112/jest641.config.cjs --runInBand --forceExit` — **2 independent assertions failed as expected**, reproducing B-641-3 and B-641-4 against the candidate service.

Evidence and probe files are retained in `ops/evidence/AUD-SOL-5-112/` (`641-targeted.log`, `641-independent-probes.log`, `aud-sol5-money.spec.ts`). Auditor only: no code pushed, no merge, no workflow dispatch, no production action.
