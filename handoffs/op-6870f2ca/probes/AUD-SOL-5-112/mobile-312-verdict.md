AUDIT GPT-6.1 Sol — growth-project-mobile#312 @ 90e78abe92ed94aea5f116fe630eb96c4c5f7b5a — VERDICT: REQUEST CHANGES

Third independent lens, AUD-SOL-5 / operator 112. **Open A/B/C: 0/2/2**, including inherited findings; **one additional B finding**, established by source-level concurrency analysis below.

### Inherited dispositions, not duplicate findings

B-312-1 remains open and C-312-2/C-312-3 remain optional; use [the existing Opus exact-head audit](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5960043718) for their original text and closure. The new preference still routes failures through the same catch, so the error-copy/reference/Sentry requirement is not closed. ([Failure path](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/90e78abe92ed94aea5f116fe630eb96c4c5f7b5a/src/screens/settings/NotificationPreferencesScreen.tsx#L190-L204))

### Additional finding

**B-312-2 — Concurrent preference writes can leave the visible switch opposite to the saved setting.** `src/screens/settings/NotificationPreferencesScreen.tsx:174-204` snapshots the whole preferences object, optimistically updates, awaits local persistence, and PATCHes without serialization or reconciliation; `:266-274` leaves the switch enabled during that request. ([Optimistic writes and rollback](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/90e78abe92ed94aea5f116fe630eb96c4c5f7b5a/src/screens/settings/NotificationPreferencesScreen.tsx#L174-L204), [interactive switch](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/90e78abe92ed94aea5f116fe630eb96c4c5f7b5a/src/screens/settings/NotificationPreferencesScreen.tsx#L266-L274))

A rapid off-then-on sequence admits two concurrent requests: if on commits first and the older off request commits last, the backend ends off while the optimistic UI remains on; neither success response reconciles the state. An older rejection can also restore the entire previous object and undo a newer successful change to a different category. ([Unsequenced request/snapshot evidence](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/90e78abe92ed94aea5f116fe630eb96c4c5f7b5a/src/screens/settings/NotificationPreferencesScreen.tsx#L174-L210))

**Minimal fix:** serialize writes per category or disable the affected switch while pending, reconcile with server truth after ambiguous failures, and roll back only the relevant latest operation rather than the whole captured object; add deferred/out-of-order off-on and cross-category rollback tests. ([Affected implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/90e78abe92ed94aea5f116fe630eb96c4c5f7b5a/src/screens/settings/NotificationPreferencesScreen.tsx#L174-L210))

### Scope and verification

Reviewed the seven-file candidate diff, timezone auth/zone cache, backend #609 preference contract, and carried merge: the `608470e` merge has a README-only conflict resolution, not a runtime conflict; the timezone stamp is user-and-zone scoped and failed patches are not cached. ([Carried merge](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/608470e76477dc3d5bbb398e2d69abd0bdf53e05), [timezone implementation](https://github.com/BradleyGleavePortfolio/growth-project-mobile/blob/90e78abe92ed94aea5f116fe630eb96c4c5f7b5a/src/services/timezoneSync.ts), [backend preference service](https://github.com/BradleyGleavePortfolio/growth-project-backend/blob/40616dcfa273501f1314890fa8966144b334cbdb/src/notifications/notifications.service.ts))

All three required checks are green at this exact head. ([Audited commit](https://github.com/BradleyGleavePortfolio/growth-project-mobile/commit/90e78abe92ed94aea5f116fe630eb96c4c5f7b5a))

Local command through `/home/user/workspace/ops/heavy.sh`:

`npx jest --runInBand --forceExit src/screens/settings/__tests__/NotificationPreferencesScreen.workoutReminders.test.tsx src/services/__tests__/timezoneSync.test.ts` — **2 suites / 13 tests passed**.

The additional deferred-request UI harness was attempted but had testing-library query/API errors and one timeout; **it did not yield a valid regression result and is not counted as a defect reproduction**. B-312-2 is a static finding, with the exact allowed interleaving documented above. Evidence, including unsuccessful harness logs, is retained in `ops/evidence/AUD-SOL-5-112/`; candidate source was not edited.

Release order remains backend #609 deployed before a build carries this preference, and no build carrying #310 until backend #635 is deployed. ([Existing release gates](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/312#issuecomment-5960043718))

No push, merge, dispatch, or production action.
