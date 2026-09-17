## BUILD MATRIX
- backend HEAD: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD: 9b4f55d34b78dfe051b3ab5ca1366cc2bab078ab
- importer input HEAD: 093b6b01c29123361b043ddd0f36cd4c578cffe2
- mobile main / unchanged inspection HEAD: a5933fd6de5616493de75f0db907098b149b955c
- mobile PR #289 head: 22354984d9e3af0deb2d32271ce9ab5e5accb92a
- mobile PR #289 actual slice base: a5933fd6de5616493de75f0db907098b149b955c
- mobile PR #290 head: ed0342e976bfd2992755d85afb1678bd135c327a
- mobile PR #290 actual slice base: 4be69b90583e0ba8f5394a94db6e494b5cf86730
- mobile PR #291 head: d2f0d31c6898f8642153df7a53644c1f38f26114
- mobile PR #291 actual slice base: ed0342e976bfd2992755d85afb1678bd135c327a
- mobile PR #292 head: 340886776e3af0c22b97aae666b1b0f331820f5f
- mobile PR #292 actual slice base: d2f0d31c6898f8642153df7a53644c1f38f26114
- brief timestamp (ISO 8601 UTC): 2026-09-17T18:39:05.847Z
- inspection timestamp (ISO 8601 UTC): 2026-09-17T18:45:53.308213Z

# M5 prerequisite readiness

**Blocked for implementation.** C1 must **land and freeze before M5 begins**, not merely expose a draft API; this is preparatory readiness, not a clean-release claim or an R14 audit. [Binding ruling, final clause](CONFLICT_INVENTORY.json)

Evidence convention: the adjacent [machine-readable conflict inventory](CONFLICT_INVENTORY.json) contains exact commit ancestry, every per-PR and cumulative changed path, base/head blob IDs, zero-context hunk coordinates, and `source_evidence` records with frozen SHA, path, line range and quoted text. Unless noted otherwise, mobile line references below use PR292; navigation/common files are unchanged from frozen main. GitHub heads/draft state are parent-supplied; “actual slice base” means local object ancestry, not independently fetched PR base metadata.

## 1. Exact dependency and conflict reconciliation

**The declared linear stack is stale at PR289 → PR290.** PR290's parent and merge-base with final PR289 are `4be69b90583e0ba8f5394a94db6e494b5cf86730`, the **first** PR289 commit; final PR289 is not an ancestor of PR290, PR291 or PR292. [Inventory: `prs`, `ancestry_reconciliation`](CONFLICT_INVENTORY.json)

```text
a5933fd main
└─4be69b9 original PR289
  ├─8f0b584521d21f71679256a3d6840f306bde7a11
  │ └─ba3fd409594ba4dd1812743b1c25b3d4d2641661
  │   └─2235498 final PR289
  └─ed0342e PR290
    └─d2f0d31 PR291
      └─3408867 PR292
```

The three missing PR289 amendments touch `.github/pull_request_template.md`, `README.md`, `package.json`, `package-lock.json`, and `src/config/__tests__/declaredDependencies.test.ts`; landing PR292 alone would omit those amendments, including the direct Node-types declaration and strengthened dependency guard. [Inventory: missing commits and exact blob/hunk changes](CONFLICT_INVENTORY.json)

### Per-PR changed files — actual slice-base → head, not misleading adjacent-tip subtraction

| PR | Exact files (`M` modified, `A` added) | Preserve / dependency |
|---|---|---|
| 289 — 6 files | M `.github/pull_request_template.md`; M `.github/workflows/ci.yml`; M `README.md`; M `package-lock.json`; M `package.json`; A `src/config/__tests__/declaredDependencies.test.ts` | Zod declaration, final Node-types declaration, deterministic CI install and AST-based dependency guard; preserve **all four commits**, not only `4be69b9`. |
| 290 — 5 files | M `.env.example`; A `src/config/__tests__/importFlags.test.ts`; M `src/config/featureFlags.ts`; M `src/hooks/__tests__/useReconstructCounts.test.tsx`; M `src/hooks/useReconstructCounts.ts` | Independent review-read switch, both flags default OFF, pairing independent of review. |
| 291 — 15 files | M `docs/importer/MOBILE_IMPORT_DECISION.md`; M `src/analytics/events.ts`; M `src/api/__tests__/extensionPairApi.test.ts`; M `src/api/extensionPairApi.ts`; M `src/hooks/__tests__/useExtensionPairing.test.tsx`; M `src/hooks/useExtensionPairing.ts`; A `src/services/__tests__/api.correlation.test.ts`; M `src/services/__tests__/authActions.test.ts`; M `src/services/api.ts`; M `src/services/authActions.ts`; A `src/storage/__tests__/importPairingMirror.test.ts`; A `src/storage/importPairingMirror.ts`; A `src/utils/__tests__/correlation.test.ts`; A `src/utils/correlation.ts`; M `src/utils/idempotency.ts` | Preserve user-keyed mirror/validation, restore-as-waiting, single-flight/expiry/unknown defenses, correlation and sign-out cleanup; **not** proof of durable paired intent or crash-safe pre-response retry. |
| 292 — 3 files | M `src/components/coach/ExtensionPairingPanel.tsx`; A `src/components/coach/__tests__/ExtensionPairingPanel.a11y.test.tsx`; M `src/components/coach/__tests__/ExtensionPairingPanel.test.tsx` | Digit-separated screen-reader code, bounded scaling/shrink-to-fit, copy control/results, support-reference rendering; uses PR291's hook support reference. |

All file/status entries above are from [exact object diffs in `prs[].slice_changes`](CONFLICT_INVENTORY.json).

**Text overlap:** all six pairwise intersections of these *slice* file sets are empty; amended PR289 versus the later branch also has zero common changed paths relative to `4be69b9`. This is **not a tested merge-conflict result**—no merge/rebase/simulation ran. Comparing final289 directly with PR290 instead yields ten changed paths, five of them reversions of omitted PR289 amendments, not five extra PR290 edits. [Inventory: pairwise overlaps and `declared_predecessor_to_head_changes`](CONFLICT_INVENTORY.json)

**Contract overlap despite disjoint files:** PR290's flags control PR291 pairing and PR292 reconstruction rendering; PR291's `PairingState.supportReference` feeds PR292; shared Axios/correlation/idempotency changes affect every mobile caller; M5 necessarily revisits the PR291 hook/storage/API and PR292 panel/tests. [Flags:364–392; hook:73–95; panel:66–103; interceptor:93–118](CONFLICT_INVENTORY.json)

**Recommended landing order:** parent/integrator preserves final289, reconciles and re-pins later heads, then lands **289 → 290 → 291 → 292**, with their own required gates; M5 starts only after both this prerequisite integration and C1's landed freeze. Read-only review of each slice and C1 can proceed in parallel; these current heads cannot be treated as independently landable full snapshots, and M5 must not compete with prerequisite fixes for mobile files. Extension-consumer coding is a separate post-C1-freeze lane, not researched here. [Ancestry inventory; ruling:35–63](CONFLICT_INVENTORY.json)

## 2. Actual wizard and server-role matrix

The live coach entry is `RootNavigator.bootstrapAuth()` → `coach_wizard` → **`CoachWizardNavigator`**: GET `/coach/onboarding` incomplete enters the wizard; 404 attempts POST `/start`; other failures/start failure fall through to the coach shell. Payments = **`CoachWizardStep5`** (“Connect payments.”), Ready = **`CoachWizardStep6`** (“You're ready.”); insert a skippable importer interstitial at the current Step5 → Step6 edge, not in deprecated `OnboardingNavigator`, client Lean, or Day-1 onboarding. [Root:605–643, 814–829; wizard:201–294; deprecated navigator:1–11](CONFLICT_INVENTORY.json)

| Server role / ruling term | Frozen mobile Root behavior | Frozen server eligibility | Required reconciliation before M5 |
|---|---|---|---|
| `coach` | Coach wizard/shell | CoachGuard and pair init/status permit | Existing supported minimum. |
| `student` = client | Client onboarding/shell | Pair routes reject | Bypass importer completely. |
| `sub_coach` | Falls to unauthenticated | Exists in Role enum, but CoachGuard rejects; pair decorators exclude | Real mismatch, not fixed by a mobile allowlist. Parent needs an explicit backend/eligibility decision. |
| `owner` | Falls to unauthenticated | CoachGuard and pair decorators permit | Platform-admin role, not proof of `gym_owner` equivalence; require explicit policy for onboarding inclusion. |
| `gym_owner` | No recognized branch | Absent from Role enum | Do not invent enum or alias; reconcile the ruling terminology with server policy. |

Matrix evidence: [backend `prisma/schema.prisma`:25–35; `src/auth/coach.guard.ts`:9–16; pair controller:92–149; mobile Root:603–646, 728–737](CONFLICT_INVENTORY.json). RoleSelection is already client-only/server-managed for coach access; Roman's “have you coached before?” answer must not change privileges. [RoleSelection:27–33; Roman journey:15–17](CONFLICT_INVENTORY.json)

**Do not renumber backend steps to seven.** Its six steps are `profile/invite_code/first_invite/message_template/guidelines/confirm`, not the mobile labels, and Step6 currently calls `ensureWizardAtFinalStep(6)` then `/complete`; the importer should be a local interstitial with separate owned resume state unless a later frozen contract expressly changes this. The existing wizard's broader stub/data-capture mismatch is pre-existing, not authorization to rebuild it or billing. [Server wizard:15–55; mobile wizard:218–254](CONFLICT_INVENTORY.json)

## 3–4. Preserve the useful stack; repair these exact M5 seams

| Finding | Concrete evidence / consequence | Minimum future repair boundary |
|---|---|---|
| **Paired ≠ accepted Start/running** | Panel:179–207 says “still running” at delta zero and “since you started this import” at positive delta; tests:147–173 explicitly require those strings. Hook:201–205 only observed `paired`. [Panel/hook/test evidence](CONFLICT_INVENTORY.json) | Keep “Paired”; separately state that Start/execution is unverified until authoritative evidence exists. Replace false assertions, not the useful a11y/copy behavior. |
| **Roster/reconstruction ≠ intent results** | `useRosterReviewDelta`:45–58 subtracts roster lengths; reconstruction key:43–49 has family/coach/page-size but no intent, and API:26–40 sends family/limit/cursor only. Its entities are just UUID+family. [Roster, reconstruction and schema evidence](CONFLICT_INVENTORY.json) | Do not attribute unrelated roster additions, deduplicated existing records, or generic reconstructed entities to this run. Preserve page-local/stale/error defenses; don't expose them as an onboarding result summary. |
| **Orphan CTA / unavailable wall** | Panel hardcodes `ClientsStack → ClientsList` and unconditionally shows review when paired; Root mounts wizard instead of CoachNavigator. `unavailable` has no CTA. [Panel:92–95,179–237; Root:825–829](CONFLICT_INVENTORY.json) | Explicit onboarding mode/callback boundary suppresses orphan review and avoids result reads; wrapper always supplies Skip/Do-later/Continue, including dark/404/error states. Keep valid Settings entry behavior. |
| **Mirror is only pending-code durability** | `go()` clears mirror even at `paired` and `failed`; cancel erases it. Key is persisted only after successful init; no pre-response durable key exists. Tests:943–974 enshrine erasure; “replays persisted key after process death” test:1055–1067 only asserts expired, never retry/key reuse. [Hook:159–175,257–300; test evidence](CONFLICT_INVENTORY.json) | Preserve pending restoration but add C1-backed owned intent/decision resume. Skip must not call destructive cancel; process death before init reply needs an actually evidenced retry/retrieval strategy. No invented revoke API. |
| **User hydration/switch race** | `useCurrentUser` initially returns null and loads asynchronously; pairing hydration has no `userId` dependency and can mark hydrated with no owner. Late mint persists using the *current* `userIdRef`, not its captured initiating owner. Existing no-user test:834–843 expects waiting, not no request. [User hook:47–80; pairing:137–145,245–310,342–368](CONFLICT_INVENTORY.json) | Wait for authenticated owner; rehydrate/reset on identity change, bind pending work to owner/generation, ignore late responses, and prove storage/sign-out races. Immediate mocked user IDs do not cover real cold boot. |
| **Device continuation / resumable entry absent** | Import screen always starts at intro; `openLogin` opens the phone URL then mounts pairing. No saved decision/platform route is read at screen entry. Failure/cancel panel claims “Nothing was imported”/“No import was started” despite no server cancellation proof. [Entry:40–87,121–127; panel:219–237](CONFLICT_INVENTORY.json) | Reuse picker, HTTPS validation and pairing but explain desktop requirement before redirect; make a named resume entry restore the owned setup; unknown outcomes stay unknown. |

Retain existing unknown-status fail-closed handling, server-only expiry, background pause/foreground refresh, single-flight/stale-code guards, coarse telemetry, body-only status code submission and sign-out mirror sweep—but strengthen their identity/intent boundaries rather than rebuilding them. PR291 preserves these defenses; some already existed on main and are not new M5 deliverables. [Hook:186–243,376–401; API:31–39; auth cleanup:66–81](CONFLICT_INVENTORY.json)

## 5. Future dispatch OWNS, freeze inputs and acceptance

### One mobile writer after prerequisites; no overlapping mobile builders

This is a **proposed exact reservation**, not a coding dispatch; parent should freeze it after prerequisite heads/C1 contract are final.

| Owner/reservation | Files and boundaries |
|---|---|
| **M5 navigation/UI** | `src/navigation/CoachWizardNavigator.tsx`, `src/navigation/RootNavigator.tsx`, `src/navigation/CoachNavigator.tsx`, `src/screens/coach/SettingsScreen.tsx`, `src/screens/coach/ImportDataScreen.tsx`, `src/components/coach/ExtensionPairingPanel.tsx`; proposed new `src/screens/coach/CoachImportOnboardingScreen.tsx`. |
| **Same M5 writer: intent/resume adapter** | `src/api/extensionPairApi.ts`, `src/types/extensionImport.ts`, `src/hooks/useExtensionPairing.ts`, `src/storage/importPairingMirror.ts`; proposed new `src/storage/coachImportOnboarding.ts`; `docs/importer/MOBILE_IMPORT_DECISION.md`. Never hand-edit generated contract output. |
| **Conditional M5 reservation, no other simultaneous writer** | `src/analytics/events.ts`, `src/services/authActions.ts`; roster/reconstruction hook/API/schema files only if necessary for truthful shared-panel behavior, not to invent native-result support. |
| **Prerequisite integrator; exclude from ordinary M5 edits** | `package.json`, `package-lock.json`, CI/template/README/dependency guard, `.env.example`, `src/config/featureFlags.ts`, `src/services/api.ts`, `src/utils/correlation.ts`, `src/utils/idempotency.ts`. Consume final versions; request explicit ownership transfer for any necessary follow-up. |
| **C1 / extension / parent only** | Backend schema/API/migrations and frozen contract artifacts / importer source and manifest / context publications and activation authorization. No mobile implementation based on live C1 working changes. |

Existing collision paths and shared functions are recorded in [inventory `future_owns`, `prs[].slice_changes`, and source evidence](CONFLICT_INVENTORY.json).

**Freeze packet required from C1 owner:** landed backend SHA; exact schema/version/artifact SHA and permitted mobile request/response/error shapes; server-minted intent linkage and authenticated retrieval after code redemption/expiry; owner/role rules; token isolation; idempotency and retry semantics; default-dark behavior; compatibility statement for old clients/extension. Explicitly distinguish what C1 supplies from what remains unavailable (accepted Start, native results, revocation, desktop locator). Do not infer any of these from a draft or a client-generated UUID. [Ruling:35–51; current pair shapes:16–46; Roman journey:33,39–50](CONFLICT_INVENTORY.json)

**No-token-leak boundary:** mobile uses its own authenticated control-plane reads; never redeem the code or obtain extension bearer/refresh tokens, call extension writer routes, put pairing codes/tokens/customer data in shareable URLs, or send them to telemetry/logs/support references. The current pending mirror **does persist the six-digit pairing code in AsyncStorage**; do not repeat the hook header's contrary “never stored” claim—retain only an explicitly approved credential-storage boundary, and keep the future shareable locator non-authorizing. [Pair API:1–14,31–39; mirror:58–103; Roman journey:33](CONFLICT_INVENTORY.json)

### Minimum acceptance matrix — future tests, not run here

| Gate | Required assertion | Reserved tests |
|---|---|---|
| Routing / roles | Eligible coach Step5 → import → Step6; client bypass with zero pairing/read calls; unknown/unsupported roles never promoted; owner/sub_coach follow the approved freeze, not aliases; `/complete` still uses six server steps. | Proposed `src/navigation/__tests__/coachImportOnboardingRouting.test.tsx`; existing `src/navigation/__tests__/importDataFlagOff.test.ts`. |
| Decision / every-stage skip | No previous coaching / decline makes no pairing request; Skip/Do-later works during source selection, handoff, mint/wait, paired, expired, error and unavailable; completion does not erase postponed owned setup. | Proposed `src/screens/coach/__tests__/CoachImportOnboardingScreen.test.tsx`, `src/storage/__tests__/coachImportOnboarding.test.ts`. |
| Resume / crash / platform | Relaunch and Settings resume restore same owner+intent+source without duplicate init; crash before/after init reply, after redemption, and storage failure are honest; switching source never silently restores the wrong platform. | Existing `src/hooks/__tests__/useExtensionPairing.test.tsx`, `src/storage/__tests__/importPairingMirror.test.ts`, `src/screens/coach/__tests__/ImportDataScreen.test.tsx`; proposed decision tests. |
| User-switch isolation | Real asynchronous cold-user hydration; A→logout→B during hydration/init/status/storage write; no stale A display/write under B, no post-sign-out mirror resurrection; caches/progress/intent reset correctly. | Same hook/storage tests plus `src/services/__tests__/authActions.test.ts`. |
| Dark / independent review | Master OFF: graceful onboarding bypass, zero import requests; master ON/review OFF: pairing works with no reconstruction queries/listeners; backend-dark 404: bypass/recover, no wall; supported disable/unmount cancels future work and ignores late results. | Existing `src/config/__tests__/importFlags.test.ts`, hook and `useReconstructCounts.test.tsx`, navigation and wrapper tests; add behavioral tests, not only source regex checks. |
| Truthfulness / result limits | Paired without Start never says running; unknown/malformed/stale responses never success; unrelated roster additions yield no intent-result count; staged/generic entities never “all done”; no orphan onboarding review CTA. | Existing panel `.test.tsx`, `.reconstruct.test.tsx`, hook, `src/types/__tests__/extensionImport.contract.test.ts`, `src/api/__tests__/extensionPairApi.test.ts`. |
| Desktop / secure continuation | Explain supported computer/browser before source open; phone URL open is not handshake/readiness; missing/disabled/incompatible/wrong-profile extension remains unverified; phone-only can continue later; locator carries no credentials and requires authenticated ownership. | Entry/wrapper tests with controlled Linking/API outcomes; future separately authorized browser acceptance for the real bridge. No invented install destination. |
| A11y / telemetry | Preserve exact-code copy, failure honesty, digit-by-digit speech, 44pt copy target, polite live regions; exercise focus/order, large type, reduced motion and all skip/error controls; no sensitive values in events, error logs or handoff URLs. | Existing panel `.a11y.test.tsx`, `src/services/__tests__/api.correlation.test.ts`, `src/utils/__tests__/correlation.test.ts`; new wrapper behavioral tests. |

These gates close the concrete gaps above; current static flag tests only examine source placement/default resolution, and current panel tests intentionally mock the hook/roster, so they cannot establish a live wizard or native-result journey. [Flag tests:19–59; panel tests:137–194; retry test:1055–1067](CONFLICT_INVENTORY.json)

**Minimum authorized M5** is coach onboarding placement/reuse, safe default-dark skip, explicit postpone/resume, trustworthy C1-owned setup and honest desktop guidance. The importer manifest is MV3 with Chrome minimum 116, a service worker and popup—not evidence of a supported phone extension or an installed/enabled instance. A working authenticated desktop locator/install/capability flow must be supplied and verified before claiming seamless continuation; keep uncertainty actionable in the meantime. [Ruling:41–54; manifest:1–21; Roman journey:27–35](CONFLICT_INVENTORY.json)

**Later separately scoped work:** extension consume-server-intent/handshake/Start, autonomous execution, intent-scoped native-family reconciliation, verified result counts/date coverage/native record links, full phone-only execution, store/distribution verification, five-minute accepted-Start-to-native-results measurement and live activation/pilot. C1 pairing correlation or staged/reconstructed generic entities alone cannot satisfy those claims; do not rebuild them inside this small M5 slice. [Roman journey:22–25,39–52,54–81; review schema:21–48](CONFLICT_INVENTORY.json)

## 6. Resource/config findings and future test gates

- **Configured stack:** CI uses Ubuntu + Node **22.13**, `npm ci`; package scripts use Jest/jest-expo, `tsc --noEmit`, ESLint, config/release validation; React 19.2.3, RN 0.85.3, Expo ~56.0.12, TypeScript ~6.0.3, Jest ^29.7.0 and RNTL ^14.0.0-0 are declared. These are config observations, not installed-tree verification. [Final289 package:5–105; CI:9–45](CONFLICT_INVENTORY.json)
- **Lockfile:** final289 adds root Zod ^3.25.76 and @types/node ^25.9.1 declarations to manifest and lock without changing resolved package entries; later heads lack the final Node-types declaration. Do not install/re-resolve separately per lane or discard final289's lock. Node-types major 25 versus CI Node22.13 is a known type/runtime mismatch requiring explicit prerequisite-owner disposition, not an opportunistic M5 dependency bump. [Inventory exact lock diff; package:84–92; CI:18](CONFLICT_INVENTORY.json)
- **Demand:** the dependency guard reads the full `src` tree, root TS/TSX modules, tsconfig, lock and all workflow run scripts through the TypeScript parser; it is not an isolated importer-only check. Jest setup supplies native/worklets/storage/crypto mocks, so even targeted RN tests need the configured toolchain and setup. Parent should reserve one post-freeze install/test environment, serialize install/resource-heavy full suites, and record measured costs rather than assume RAM/time/disk estimates. [Guard:243–282,566–614; tsconfig:1–10; Jest setup:1–48](CONFLICT_INVENTORY.json)
- **No mobile contract-generation script is declared** in the package scripts, and none of PR289–292's changed paths is a generator/schema-output surface; C1 must identify canonical artifacts and generation procedure separately before consumption. No generator, native build, simulator, DB, browser, server or port was needed or used for this review. [Package:5–17; exact changed-path inventory](CONFLICT_INVENTORY.json)
- **Future validation:** prerequisite reconciliation + focused matrix above, relevant full suite, lint/typecheck/format/hooks, lock consistency and security/dependency checks, default-OFF invariant, R100 self-check and independent exact-head dual-lens R14 audits before git-native landing; keep ≤400 production LOC/test:src ≥2 or obtain explicit exception/split. Current CI runs `--passWithNoTests` and lint permits 99,999 warnings; these are not evidence that stricter binding gates are satisfied. Parent must resolve gate ownership separately, not silently change config in M5. [Ruling:59–63; CI:38–45; package:13; canonical rules read per brief](CONFLICT_INVENTORY.json)

## Inspection limits / stop

Read full exact task brief, canonical rule sections (including consolidated R100), the R100 redirect, 50-failures reference, binding ruling and Roman journey; inspected only frozen mobile main/PR289–292 objects, pinned context/importer configuration and relevant frozen backend role/onboarding/pair contracts. No live C1 working-tree API, extension-consumer seam re-review, other mobile PR research, source/config edits, ref movement, dependency installation, tests, generators, simulator, DB, browser, remote/GitHub operations, commits or subdelegation. No full 55-rule release checklist or clean-release conclusion is claimed: this lane is expressly a bounded readiness reviewer, not the final auditor.

**Parent action:** reconcile the missing final289 amendments and role/wizard contract mismatch; obtain landed C1 freeze; reserve one mobile owner for the listed shared seams; require the acceptance evidence before implementation can be considered ready. Stop here—M5 has not begun.

VERDICT: FINDINGS
