# PR-17 M2 — BUILD REPORT

**Builder:** Dynasia G · **Date:** 2026-05-30
**Repo:** growth-project-mobile (RN/Expo) · **Branch:** `pr17/m2-contents-screen` off `origin/main` (HEAD `7e20cff`, contains merged M1).
**PR:** #213 — <https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/213>
**Final HEAD SHA:** `00c214f06cc0cfffe158cd6bb3c5e6f87e40dc87`

> This is a builder report, NOT a verdict (R1 §4). An independent gpt_5_5 auditor re-checks at the PR head SHA above.

---

## Scope delivered (EXACTLY M2 — the authoring shell, not the push UI)

A coach content-authoring screen that LISTS package contents + ADD / EDIT / REMOVE, plus the nav wiring to reach it. The per-row "Push to existing" affordance is a **placeholder seam only** — M3/M4/M5 own the push flow. Reorder intentionally omitted (clean seam; M1 client exposes `reorder`).

---

## Files owned (created / edited)

| Piece | File:line | Notes |
|-------|-----------|-------|
| Authoring screen (NEW) | `src/screens/coach/payments/CoachPackageContentsScreen.tsx` (1–470) | list/loading/empty/error + add/edit/remove + push placeholder |
| Attach/edit form (NEW) | `src/screens/coach/payments/contents/ContentAttachForm.tsx` (1–532) | asset + cadence segmented pickers, progressive disclosure, default `immediate` |
| Nav route type | `src/navigation/CoachNavigator.tsx:201-202` | `CoachPackageContents: { packageId: string; title?: string }` in `SettingsStackParamList` |
| Nav screen registration | `src/navigation/CoachNavigator.tsx:417-421` | `<SettingsStack.Screen name="CoachPackageContents" component={CoachPackageContentsScreen} />` |
| Nav import | `src/navigation/CoachNavigator.tsx:29` | `import CoachPackageContentsScreen …` |
| Edit-screen nav button | `src/screens/coach/payments/CoachPackageEditScreen.tsx:466-481` | "Manage content" → `navigate('CoachPackageContents', {packageId, title})`, mirrors subscribers button at the original `:469` |
| Screen test (NEW) | `src/__tests__/CoachPackageContentsScreen.test.tsx` (1–230) | RTL mount + nav/wiring source guards |

### Screen requirements mapping (§3.2 + UI Bible)
- **Header with package title** — `CoachPackageContentsScreen.tsx:294-308` (falls back to "Package content").
- **`list(packageId)` with loading/empty/error** — `:84-99` (load), `:269-322` (renderBody). Warm empty copy *"No content yet — add the first piece"* at `:305`.
- **Row content** — display_title (fallback asset_type) + asset_type + human cadence label: `:207-260` (`renderRow`); labels from `assetTypeLabel`/`cadenceLabel` in `ContentAttachForm.tsx:74-96`.
- **Per-row "Push to existing" PLACEHOLDER** — affordance `:233-242`; hook `onPushPress` + `TODO(M5)` at `:185-200`. No push modal built.
- **Add → ContentAttachForm → attach + idempotency key → refresh** — `openAdd :101-105`, `handleAttach :117-140` (passes `generateIdempotencyKey()`), `closeForm`+`load` on success.
- **Edit → patch** — `openEdit :107-111`, `handlePatch :142-167`.
- **Remove → remove** — `handleRemove :169-200` (confirm Alert, destructive).
- **Cadence advanced behind disclosure, default `immediate`** — `ContentAttachForm.tsx:124,300-360` (disclosure collapses back to `immediate`).

---

## Reuse citations honored (consistency principle)
- `useTheme()` → `{ colors }` (forest `#2C4A36` / cream `#F5EFE4`) — both new files; **no hardcoded hex** (test-guarded).
- `HapticPressable` (`src/components/HapticPressable.tsx`) — per-row action buttons in the screen.
- haptics `lightTap`/`mediumTap`/`warningTap` (`src/utils/haptics.ts`).
- Primary-button `TouchableOpacity` style — patterned on `CoachPackageEditScreen.tsx:397-411`.
- Segmented-`TouchableOpacity` picker — patterned on `CoachPackageEditScreen.tsx:62-67/345-368` (asset + cadence pickers).
- Modal precedent `<Modal animationType="slide" presentationStyle="pageSheet">` — `PackageSelectionSheet.tsx:343-354` (the attach form sheet).
- Idempotency: `generateIdempotencyKey()` (`src/utils/idempotency.ts:36`) on attach/patch/remove (decision #8). NO new design dependency. NO emoji.

---

## The push-action placeholder seam left for M5
`CoachPackageContentsScreen.tsx:185-200` — `onPushPress(content)` is a single `useCallback` no-op hint (light haptic + "coming soon" Alert) marked `TODO(M5): open PushPromptSheet → PushConfirmModal`. The per-row affordance (`:233-242`) is rendered but un-wired. The file imports NO `PushPromptSheet`/`PushConfirmModal` (forbidden M3/M4 files). M5 can wire the seam without restructuring the screen.

---

## Deviations / assumptions
- **Asset reference input.** The attach form collects `asset_id` as a free-text "Asset reference" field rather than a live asset-browser picker — a richer asset browser is out of M2's minimal scope (§6.11 "minimal — list/attach/edit-cadence/push, nothing more") and the backend zod validates the id. Asset-type is locked in edit mode (immutable once attached).
- **Cadence payload.** Only `relative_to_purchase` collects a value (`offset_days`, 0–365) to keep the form ≤5 elements (Miller's Law); other kinds send an empty payload for the backend per-kind schema to default/validate. `fixed_calendar` date entry is deferred (M4 owns the datetimepicker dependency — forbidden here).
- **Reorder omitted** by design (brief allows; clean seam — rows render in `display_order`, M1 `reorder` available later).
- HEAD SHA verified locally; the `origin/<branch>` ref read returned a benign naming error after a clean push (branch pushed + tracking set successfully; PR #213 created from it).

---

## Verification (real, actual counts)
- **Typecheck** — `npx tsc --noEmit` → **0 errors** (exit 0).
- **Lint** — `npx eslint` on the 5 owned/edited files (incl. test) → **0 errors, 0 warnings** (exit 0), `--max-warnings=99999` (repo convention).
- **Tests** — `npx jest src/__tests__/CoachPackageContentsScreen.test.tsx` → **Test Suites: 1 passed; Tests: 11 passed, 0 failed**.
  - Source guards (7): route-type registration, `<Screen>` registration + import, edit-screen "Manage content" nav, push placeholder seam (no PushPromptSheet/PushConfirmModal), warm empty copy / no "No data", no hardcoded hex, idempotency-key usage.
  - RTL mount (4): rows render from `list`, warm empty state, "Add content" opens the form, attach submit calls `attach('pkg1', body, 'test-idem-key-0001')` — asserts the **Idempotency-Key** flows through.
- `npm ci` run (node_modules was absent).

---

## Final pointers for the auditor
- **PR:** #213
- **HEAD SHA:** `00c214f06cc0cfffe158cd6bb3c5e6f87e40dc87`
- **Branch:** `pr17/m2-contents-screen` (base `main`).

---

## R2 — Audit remediation (2× P1 in ContentAttachForm)

Audited SHA `00c214f` was NOT CLEAN. Fixed both P1 findings. Touched ONLY `src/screens/coach/payments/contents/ContentAttachForm.tsx` and a NEW test `src/__tests__/ContentAttachForm.test.tsx`. Did NOT touch the parent screen (chose the in-child `useEffect` approach, not `key=` remount, so `CoachPackageContentsScreen.tsx` is untouched — M5 inherits it clean), did NOT modify `src/api/packageContentsApi.ts`, did NOT add the M4 datetimepicker dependency.

### P1 #1 — edit-form state never re-synced (could corrupt metadata)
- **Fix:** added a `useEffect` keyed on `content?.id`, `content?.updated_at`, and `visible` that re-seeds EVERY local form field from the current `content` (edit mode → row values) or to the safe defaults (`content` null → add mode), and clears any stale error. The parent keeps ONE `ContentAttachForm` instance mounted and only flips `content`/`visible`, so the prior `useState`-only initializers never re-ran; `handleSubmit` therefore patched from stale/default state and could wipe title/caption + reset cadence to `immediate`.
- **File:line:** `src/screens/coach/payments/contents/ContentAttachForm.tsx:165` (the `useEffect`; deps at `:193`). Import of `useEffect` at `:27`.

### P1 #2 — cadence picker exposed kinds that submit invalid empty payloads
- **Approach chosen:** the PREFERRED minimal fix — collect the required field per exposed kind and validate it is present before submit (error-prevention, UI Bible), so every visible cadence option builds a backend-valid `cadence_payload`. No kinds hidden. No datetimepicker dependency added (M4 owns the rich picker; `fixed_calendar` uses a simple ISO/text entry with a `TODO(M4)` seam).
- **Backend contract verified** against `growth-project-backend/src/packages/package-contents.dto.ts` `CADENCE_PAYLOAD_SCHEMAS` (all `.strict()`): `immediate` → `{}` (strict-empty, OK); `relative_to_purchase` → `{ offset_days }` int ≥0 (already collected); `fixed_calendar` → `{ release_at }` ISO 8601 **required**; `on_completion` → `{ depends_on_content_id? }` **optional** (so `{}` is valid); `on_milestone` → `{ milestone_key }` non-empty string **required**.
- **Fix:** `buildCadencePayload` now builds `{ release_at }` for `fixed_calendar` (validates non-empty + `Date.parse` not NaN) and `{ milestone_key }` for `on_milestone` (validates non-empty); returns a null payload + inline message when missing so Save is blocked. `immediate`/`on_completion` keep `{}`. Added two new inputs in the advanced disclosure: `content-attach-release-at` (ISO text) and `content-attach-milestone-key`.
- **File:line:** `buildCadencePayload` at `src/screens/coach/payments/contents/ContentAttachForm.tsx:195` (`fixed_calendar` branch `:217`, `on_milestone` branch `:228`); new inputs at `:478` and `:495`.

### New tests
`src/__tests__/ContentAttachForm.test.tsx` (9 cases, RTL, mounts the form directly):
- P1 #1 (4): seeds fields from an existing row; patch body reflects EDITED (not stale) values; does NOT wipe untouched title/caption; add→edit→different-row→back-to-add all re-seed correctly on the SAME mounted instance.
- P1 #2 (5): one per exposed cadence kind asserting a backend-valid `cadence_payload` is built — `immediate`→`{}`, `relative_to_purchase`→`{offset_days}`, `fixed_calendar`→`{release_at}` (and Save blocked + inline error when empty), `on_completion`→`{}`, `on_milestone`→`{milestone_key}` (and Save blocked + inline error when empty).

### Verification (real, actual counts)
- **Rebase:** `git fetch origin main && git rebase origin/main` → already up to date (`origin/main` = `7e20cff`), no conflicts.
- **Typecheck:** `npx tsc --noEmit` → **0 errors** (exit 0).
- **Lint:** `npx eslint src/screens/coach/payments/contents/ContentAttachForm.tsx src/__tests__/ContentAttachForm.test.tsx --max-warnings=99999` → **0 errors, 0 warnings** (exit 0).
- **Tests:** `npx jest` on both M2 suites → **Test Suites: 2 passed; Tests: 20 passed, 0 failed** (11 existing kept green + 9 new). New suite alone: 9 passed. node_modules already present (no `npm ci` needed).

### Final pointers for the SHA-pinned re-audit
- **PR:** #213
- **Branch:** `pr17/m2-contents-screen` (base `main`).
- **Final HEAD SHA:** `79bc74925600767081127d07eb69e32623947ff9` (pushed; remote `git ls-remote` confirms `refs/heads/pr17/m2-contents-screen` = `79bc749`).
