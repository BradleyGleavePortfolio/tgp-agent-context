# AUD-OPUS-MOB-CORE (agent 115 lens, Claude Opus 5.5) report

Queue: /home/user/workspace/ops/lanes115/q/AUD-OPUS-MOB-CORE.txt (mobile #325 #326 #315 #305 #317 #331 #335 + additions).
Probes/notes: /home/user/workspace/ops/aud-115/AUD-OPUS-MOB-CORE/.

## Verdicts

### mobile#325 @ 7566d38f4eb15a5f6bd8c3491bf17dbc6a8931e8 — APPROVE (A0/B0/C1)
- T4 delta from own RC at 268ed81b. B-325-4 closed (869426fb: 5 first-person fallbacks -> "the app"; table-driven voice guard
  14 outcomes x 2 audiences + all coded maps; fails before). Merge of main 4f1d74d8 pure (merge-tree == head tree 994844b1).
- Whole-PR added-lines grep: no we/us/our (only 'en-US'), no "!", no generic errors.
- C-325-8 (optional): voice-guard EMOJI class misses U+2B50/U+1F004; use \p{Extended_Pictographic} in the OR-115-4 repo-wide guard.
- Integration: clean with #326/#315/#317; app.json adjacent-hunk conflict with #305 (keep both; second to merge resolves).
- CI at head: 4/4 pass (run 37098411257: 446 suites / 6244 tests).
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/325#issuecomment-5971610639
- Gate: pair with backend #634 (OR-112-13); merge after #634 deploy.

### mobile#326 @ 7c5626ed732b2287dd7437a69794de8d11b7d08f — APPROVE (A0/B0/C0)
- Delta from own APPROVE 4ae5210d: pure merge of main 4f1d74d8 (merge-tree == tree b850b946) + test-only seam spec.
  Reference tag survives #327 URL-credential scrub. CI before-runs 37140649836/37140651300 red; head run 37140328911 443/6142 pass.
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/326#issuecomment-5971742750

### mobile#315 @ a4d344df8fe1d7e763999dc30214ab7b0abdc69e — APPROVE (A0/B0/C0)
- Delta from own APPROVE 0ef94ddf: pure merge (ac8c0a0d) + captureErrorWithoutPii reference tag (8-hex generated id) + seam test.
  Before-run 37140652545 red; head run 37140457075 green. Clean merge-tree with #326 7c5626ed.
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/315#issuecomment-5971748459

### mobile#317 @ 7174daa88a67c6d8028b2c741fd4d1d76d5b3c8b — APPROVE (A0/B0/C0)
- Delta from own APPROVE cfa99ce3: pure merge 4f1d74d8 (9119a12c) + B-317-11 attempt-epoch fence on on-device import/resume,
  per-attempt busy state; C-317-a..d closed. Before-run 37141124980 red (17 fail); head run 37141169059 green.
- BEHIND main 47124a4d (clean merge-tree); clean with #305 d7f41e5b.
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5971856663

### mobile#315 @ 8fff3f8f3829aab4079973b38428e2d266bc3f3b — APPROVE (A0/B0/C0)
- Merge-only delta from a4d344df: pure merge of main 47124a4d (#326) (merge-tree == tree 4404649b); both reference-tag rules present.
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/315#issuecomment-5971995991

## mobile#331 @ c621770f262f3b04e734f3c34fde8342e51ca84c — REQUEST CHANGES (A0/B1/C0)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/331#issuecomment-5972101193
- My prior findings B-331-7 and C-331-8 are closed. Sol's B-331-8 path (fenced refresh-failure sign-out, push-token PATCH skipped) was checked for deadlocks: none found.
- **New finding B-331-9.** The refresh captures its generation when the 401 arrives (`api.ts:406`), but the generation is bumped when a write is called, not when it lands (`sessionFence.ts:67`). A stale 401 that arrives while a sign-in or sign-out write is in flight therefore commits A's refreshed access token. This was proven in a CI lane, [run 37143283737](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37143283737): P1 (credential swap to B) and P2 (A resurrected after sign-out) both fail at the head; the same-session control passes.
- **Fix rule:** count in-flight unfenced session writes; `holdSessionFence` and `readTokenForRequest` refuse while the count is above zero; start the refresh only when the failing request's `_sessionGeneration` equals the current generation.
- The probe spec is at `ops/aud-115/AUD-OPUS-MOB-CORE/331-r2-probe.test.ts`, on branch `audit/AUD-OPUS-MOB-CORE/331-r2-inflight` (delete at lane end).

## mobile#305 @ 178f640155b464905e07bb0ea53f5688ba90afce — APPROVE (A0/B0/C0)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/305#issuecomment-5972110905
- B-305-12 is closed: the ExpoContext integration is removed; `ota_updates` is allowlisted; `scrubOtaContexts` runs on both send paths; the before run 37141910832 failed. C-305-13 is closed. Merge 178f640 is pure (merge-tree 89b075f0).

## mobile#317 @ 82137c312e957cb05eedeaebf86fcd95029f2bde — APPROVE (A0/B0/C0)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5972118238
- Delta from 7174daa8: a pure merge of 47124a4d (merge-tree 22c50c7d), plus C-317-b r2. The refresh failure is now logged as a closed error class, and stale failures are silent. The before run 37142129659 failed.

## mobile#335 @ 641fe8914853cca6a2dab76ac90230bbcd525504 — APPROVE (A0/B0/C1)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/335#issuecomment-5972139245
- First full T4 audit from this lens. Sol's A-335-1, B-335-2 and C-335-3 are closed. A-335-1 was checked against the real posthog-react-native 4.45.14 autocapture walk. Not persisted: `meta.persist` is false and `shouldDehydrateQuery` honours it. Route params do not reach PostHog or Sentry.
- C-335-4 (optional): the `none` copy asserts nothing is on file, but `none` also covers the uniform no-access 404.

## mobile#341 @ 7c791bb39979eb16481ce71a85de652b41368a3a — REQUEST CHANGES (A0/B1/C1)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/341#issuecomment-5972160274
- **B-341-1.** `src/screens/notifications/NotificationPreferencesScreen.tsx:210-221`: concurrent saves are not serialised. A failed save restores a stale snapshot, and a late response overwrites newer toggles, so a delivery switch can show the opposite of the server value. This is the same class as B-312-2, already closed in the settings screen.
- **C-341-2.** A load failure renders a blank screen (`:200`, `:255`).

## mobile#317 @ d0407b625e1d2bc63ebe9d063296bc85461842ed — APPROVE (A0/B0/C0)
- Comment: https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/317#issuecomment-5972163241
- A pure merge of main 367e6c4: merge-tree ec754f15 equals the head tree. "Typecheck, lint, test" was still in progress when posted.

## HANDOFF
- **Stopped** on operator 115 PAUSE (11:25 PDT). LENSES_MAY_END exists.
- **Verdicts, latest head per PR:**

| PR | Head | Verdict | A/B/C |
|---|---|---|---|
| #325 | 7566d38f | APPROVE | 0/0/1 |
| #326 | 7c5626ed | APPROVE (merged) | 0/0/0 |
| #315 | 8fff3f8f | APPROVE | 0/0/0 |
| #305 | 178f6401 | APPROVE (since merged into main 367e6c4) | 0/0/0 |
| #317 | d0407b62 | APPROVE, merge-only | 0/0/0 |
| #331 | c621770f | REQUEST CHANGES | 0/1/0 |
| #335 | 641fe891 | APPROVE | 0/0/1 |
| #341 | 7c791bb3 | REQUEST CHANGES | 0/1/1 |

- **Open findings:**
  - **B-331-9.** The session fence ignores session-key writes that are still in flight. Probe: run 37143283737. Probe spec: ops/aud-115/AUD-OPUS-MOB-CORE/331-r2-probe.test.ts.
  - **B-341-1.** Preference-save race.
  - C-341-2, C-335-4 and C-325-8 are optional.
- **Queue state:** #339 is still owed a full audit; it was not READY when last listed. Merge-only heads not in this queue (backend #634, #647; mobile #328) are not this lens's.
- **Cleanup:** the audit branch audit/AUD-OPUS-MOB-CORE/331-r2-inflight is deleted (the run stays); worktree wt/AUD-OPUS-MOB-CORE-331 is removed.
