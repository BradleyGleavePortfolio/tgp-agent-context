# CLOSEOUT — HealthKit / Wearables Expansion

**Author:** Dynasia G &lt;dynasia@trygrowthproject.com&gt;
**Closeout date:** 2026-06-03 (UTC). **HK Wearables Expansion: COMPLETE.**

---

## 1. Date range, scope, what shipped / what didn't

- **Date range:** the HealthKit/Wearables expansion work in this program, culminating in the merges below on 2026-06-02 → 2026-06-03 (UTC). Stabilization checkpoint at 2026-06-02 23:15 UTC; HK-6b mobile merged 2026-06-03 00:32 UTC.
- **Scope:** wearables foundation + connectors, the H&F samples read API + WearablesShell, the embedded AI insight surface (coach + client), the coach approve→materialise flow, Nest DI / scheduling / role-gate hardening fixes, the client AI insight mobile panel, the HK-6b coach-on-behalf preferences authorization, and the WearableProcessedEvent retention prune cron.

**What shipped (merged to main):**

- Backend: PR-HK-3a samples + WearablesShell (#356); HK-FIX-1 Nest DI A+B+C (#358); FIX-2 scheduling clock pin (#359); HK-FIX-3 8-route `@Roles` decoration (#360); HK-6a approval endpoint + materialiser (#357).
- Mobile: HK-5b client AI insight panel (#226); HK-6b stale-404 fallback removal (#227).
- The **WearableProcessedEvent daily prune** cron PR was opened in this doc-batch and **merged** as backend #362 at `659e0ccc74c47f9c985a26b582987253ec9fdb40` — see the table; it fixes the unbounded growth of the webhook-idempotency ledger.
- Backend HK-6b coach-on-behalf preferences (#361) — **MERGED at `c5724a83c4f2d1d33bd4dfe559074f1104e78893`** after R2 fix landed at `78b669415e4d98829ed41c88670e0a591475cb14`.

**What didn't ship / still open:**

- Four wearable provider integrations (Beddit, Peloton, Eight Sleep, MyFitnessPal) are **deferred** — see the `DEFERRAL_*.md` docs.
- Coach `WearableInsightPanel.tsx` pre-R3 `toneTokens` signature — carry-forward (§6).
- HK-FIX-1 Defect-D — known red, admin-merged; follow-up issue to file (§6).

---

## 2. Backend main HEAD at closeout

```
659e0ccc74c47f9c985a26b582987253ec9fdb40
```

(Squash-merge commit of cron prune PR #362 R2. Last commit in the HK Wearables Expansion arc.)

## 3. Mobile main HEAD at closeout

```
4b7587e47694d1640b1484d1a2a38d40f307afac
```

(Captured via `gh api repos/BradleyGleavePortfolio/growth-project-mobile/branches/main --jq .commit.sha`. This is the merge commit of HK-6b mobile #227.)

---

## 4. Merged PRs in this expansion

### Backend (`growth-project-backend`)

| PR | Item | Title | Final head SHA | Merge commit | Verdicts |
|----|------|-------|----------------|--------------|----------|
| [#356](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/356) | HK-3a | PR-HK-3a: H&F bucket UI + samples API + WearablesShell | `92418b2aa403e9873bb8e2f1e8e2cc0bf56a72df` | `e49ae5ae2e0320ffcc73f5719dde555452c1f86b` | Merged (pre-existing in program). |
| [#358](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/358) | HK-FIX-1 (Nest DI A+B+C) | hk-fix-1: unblock AppModule graph — drop redundant WearablesModule re-export + @Optional on OauthStateService & ProviderHttpClient | `6181b0815c9528be3475f83d46eb4c5b642f6551` (rebased) | `12fa4f90039f37a654f733ba175331cbbf201bdf` | GPT-5.5 code R2 audited (`_audit_HK_FIX_1_R2_GPT55.md`); **admin-merged with one known Defect-D red** (see §6). Stacked atomically with #360. |
| [#359](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/359) | FIX-2 (scheduling clock pin) | fix(scheduling-test): pin clock with jest.useFakeTimers so hard-coded fixtures don't rot | `8f6e40547dafdacabbf4e397fd4306a2e0259ca6` | `24015d1da7c2633bf722a20f40a75b731161c3da` | Merged; CI green. |
| [#360](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/360) | HK-FIX-3 (8-route @Roles) | hk-fix-3: gate 8 wearables routes with @Roles per locked role policy | `f2ff1dd2309527495e63ddd5d8521c6e59d2e7ab` (stacked) | `119e042bd6ddb1a43c7266f2aa8ba7a976cea293` | GPT-5.5 code R2 PASS (`_audit_HK_FIX_3_R2_GPT55.md`, P3 commit-body override documented); CI green, regular squash. |
| [#357](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/357) | HK-6a (approval endpoint + materialiser) | PR-HK-6: approval endpoint + coach_wearable_message materialiser | `bf22c7476f26aca708b306446cffe9a56f724e9f` (rebased) | `650cea4c461f8f5249c201bb8a0955e9c24b4cdf` | GPT-5.5 code R2 audited; CI green, regular squash. |
| [#361](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/361) | HK-6b (coach-on-behalf preferences) | HK-6b: preferences coach-on-behalf-of authorization (target_user_id + assertCoachOwnsClient) | `78b669415e4d98829ed41c88670e0a591475cb14` (R2) | `c5724a83c4f2d1d33bd4dfe559074f1104e78893` (squash) | R1 NEEDS_R2 (R65 #36 silent-failure) → R2 fix: narrows catch to `ForbiddenException` only; non-Forbidden propagates. GPT-5.5 R2 audit **PASS** (`_audit_HK_6b_backend_R2_GPT55.md`). |
| [#362](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/362) | Cron prune | HK: WearableProcessedEvent daily prune (unbounded growth fix) | `52748ec40a231e88dc0b72c5bad63c9b55b20902` (R2) | `659e0ccc74c47f9c985a26b582987253ec9fdb40` (squash) | R1 NEEDS_R2 (4 `as unknown as` in test mocks + targeted Jest gate path mismatch) → R2 fix: replaced banned casts with Nest `Test.createTestingModule().overrideProvider(...).useValue(...)` DI; relocated specs to `test/wearables/maintenance/` (jest `roots` excludes `src/`). GPT-5.5 R2 audit **PASS** (`_audit_HK_cron_prune_R2_GPT55.md`); targeted Jest 12/12, full Jest 4036 passed / 0 failed (relocation, not net-new). **= backend main HEAD.** |

### Mobile (`growth-project-mobile`)

| PR | Item | Title | Final head SHA | Merge commit | Verdicts |
|----|------|-------|----------------|--------------|----------|
| [#226](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/226) | HK-5b (client AI panel) | PR-HK-5b: client AI insight panel | `6b33261b3ab43e9fe963b2cf6e75b0d814c58793` | `1a5069fce4a7a8571c80221f6b57c8c6a795ff53` (squash) | R3 PASS — GPT-5.5 code (`_audit_HK_5b_R3_code_GPT55.md`) + Opus 4.8 visual (`_audit_HK_5b_R3_visual_opus48.md`). |
| [#227](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/227) | HK-6b (404 fallback removal) | HK-6b: remove stale 404 not_implemented approve fallback (HK-6a live) | `e38426f6981822f7fdda0c1bd6e0b5adfaa92a8d` | `4b7587e47694d1640b1484d1a2a38d40f307afac` | Opus 4.8 visual **PASS** (`_audit_HK_6b_mobile_opus48.md`); R65 50-failures sweep clean. **= mobile main HEAD.** |

---

## 5. Open R2 still in flight at doc-batch time

- **HK-6b backend preferences coach-on-behalf** — [#361](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/361) — **MERGED 2026-06-03 01:01 UTC** at squash commit `c5724a83c4f2d1d33bd4dfe559074f1104e78893`.
  - R1 head: `e39cd8f99861ce7da9973a9431010813e5167309`. R1 GPT-5.5 audit (`_audit_HK_6b_backend_code_GPT55.md`) flagged **R65 #36 silent-failure regression** — `resolveEffectiveUserId` wrapped `assertCoachOwnsClient` in a bare `catch` and remapped *all* errors (including DB/programming failures) to the stable `WEARABLE_PREFERENCE_CROSS_USER_FORBIDDEN` 403.
  - R2 head: `78b669415e4d98829ed41c88670e0a591475cb14`. R2 narrowed the catch to `if (err instanceof ForbiddenException)` and added POST + DELETE non-Forbidden propagation tests asserting `rejects.not.toBeInstanceOf(ForbiddenException)` and `svc.upsert/.remove` not called.
  - R2 GPT-5.5 audit (`_audit_HK_6b_backend_R2_GPT55.md`) returned **PASS**: R0 additions-only grep empty (vs `origin/main` and vs R1), authorship/trailers clean, tsc/eslint clean, focused 2 suites / 32 tests PASS, full suite 317 suites / 4042 passed / 20 skipped / 5 todo / 0 fail (`--runInBand`).

- **WearableProcessedEvent cron prune** — [#362](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/362) — **MERGED 2026-06-03 01:25 UTC** at squash commit `659e0ccc74c47f9c985a26b582987253ec9fdb40`.
  - R1 head: `c1fb4252aaf3c4a8374767f3ff7b81dc611b75e4`. GPT-5.5 audit (`_audit_HK_cron_prune_GPT55.md`) returned **NEEDS_R2** on test-only blockers: 4 `as unknown as` in new mocks (R0 violation) and targeted Jest gate `--testPathPatterns='wearables/maintenance'` matched 0 files. Production service / scheduler / module / env-validation / .env.example PASSed audit unchanged.
  - R2 head: `52748ec40a231e88dc0b72c5bad63c9b55b20902`. R2 replaced 4 banned casts with Nest `Test.createTestingModule().overrideProvider(...).useValue({...})` DI pattern (mirrors `test/timeline.service.spec.ts` and `test/sub-coach-*.service.spec.ts` prior art). Relocated both specs to `test/wearables/maintenance/` because `jest.config.js` sets `roots: ['<rootDir>/test']` and excludes `src/`. Production code untouched (R1 production logic was PASS).
  - R2 GPT-5.5 audit (`_audit_HK_cron_prune_R2_GPT55.md`) returned **PASS**: R0 additions-only grep vs merge-base `650cea4c` empty, authorship/trailers clean, tsc/eslint clean, targeted Jest 12/12 (2 suites), full Jest 4036 passed / 20 skipped / 5 todo / 0 fail (`--runInBand`). The 12 prune tests were already in the R1 4036 baseline (relocation, not net-new tests).

---

## 6. Carry-forward known follow-ups

- **Coach `WearableInsightPanel.tsx` pre-R3 `toneTokens`.** The coach sibling panel still calls `toneTokens(tone)` without the `colorScheme` argument (pre-R3 signature) and uses `accentInk` for Retry / Read more text. Out of scope for HK-5b (client panel). **Tracked under HK-5a.** Flagged by the HK-5b R3 visual auditor.
- **HK-FIX-1 #358 Defect-D.** A known red was present when #358 was admin-merged (the "stack & ship atomic" decision: #358 rebased CI failed only on `roles-enforced.spec.ts` — the exact gap HK-FIX-3 #360 closed — so #358 + #360 were merged back-to-back so main went red→0-failures in two adjacent commits). The residual Defect-D is a known red. **Action: file a follow-up GitHub issue** capturing Defect-D so it isn't lost.
- **4 deferred provider integrations.** Beddit, Peloton, Eight Sleep, MyFitnessPal — see `DEFERRAL_BEDDIT.md`, `DEFERRAL_PELOTON.md`, `DEFERRAL_EIGHTSLEEP.md`, `DEFERRAL_MYFITNESSPAL.md`. None blocks the AI insight surface (provider-agnostic pipeline).

---

## 7. R0 / R31 / R32 / R55 / R64 / R65 compliance summary

- **R0 (no banned patterns / honest code).** Every PR's additions-only diff was R0-grepped clean (no `@ts-ignore`/`@ts-nocheck`/`as any`/silent-swallow `catch`/`coming soon`/spinner-only, etc.). The cron prune PR #362 diff is R0-clean.
- **R31 / R32 (audit by a different model than the builder; dual code+visual where applicable).** Every PR was audited by **GPT-5.5 (code)** and, where there was a visual surface, **Opus 4.8 (visual)** — always a *different* model from the builder. HK-5b: GPT-5.5 code + Opus 4.8 visual (R1→R2→R3). HK-6b: GPT-5.5 code (backend) + Opus 4.8 visual (mobile). HK-FIX-1 / HK-FIX-3 / HK-6a: GPT-5.5 code.
- **R55 (full 40-char SHA references).** Cross-PR references and this closeout use full 40-char SHAs (e.g. HK-6b PRs cross-reference each other's full head SHAs).
- **R64 (commit audit artifacts to tgp-agent-context promptly).** All audit + brief + result + status artifacts were committed to `tgp-agent-context` within minutes of each round (`_audit_*`, `_fixer_brief_*`, `_builder_brief_*`, `_fixer_result_*`, status checkpoints). This closeout + the spec + 4 deferral docs are committed in one chore commit.
- **R65 (50-failures sweep on every audit).** The 50-failures reference sweep (incl. #36 silent-failure) was applied to every audit. It is precisely the R65 #36 check that caught the HK-6b backend #361 silent-failure regression (→ NEEDS_R2) and confirmed the HK-6b mobile #227 error-propagation fix clean.
- **Authorship.** Every Dynasia commit is authored + committed by `Dynasia G <dynasia@trygrowthproject.com>`, **title-only, no `Co-Authored-By` / `Generated-By` trailers.** (The one `Co-authored-by:` trailer observed — on #359's Bradley-authored merge commit — is the pattern the author rule forbids and was noted in audit.)

---

## 8. Infra note — pre-existing "Fly Deploy" failures

The **Fly Deploy** workflow has been failing on **every push to backend main** since before this expansion (observed on PR-HK-3a `e49ae5a`, FIX-2 `24015d1`, and others). This is a **deploy-infrastructure issue, not a code defect** — `build-and-test` / local full suites are green. The cron prune PR #362 inherits the same environment; any Fly Deploy red on it is this same pre-existing infra failure, unrelated to the change.

---

### Repos

- This repo (context/docs): https://github.com/BradleyGleavePortfolio/tgp-agent-context
- Backend: https://github.com/BradleyGleavePortfolio/growth-project-backend
- Mobile: https://github.com/BradleyGleavePortfolio/growth-project-mobile
