# BUILD BRIEF — PR-17 M2: coach content-authoring screen + nav

Repo: growth-project-mobile (RN/Expo). Branch: `pr17/m2-contents-screen` (ALREADY CREATED at your worktree). Depends on M1 (MERGED — `src/api/packageContentsApi.ts` exists with the full typed `coachPackageContentsApi`).

## Your worktree (isolated; main repo READ-ONLY)
`/home/user/workspace/wt-pr17-m2` — branch `pr17/m2-contents-screen` off fresh `origin/main` (HEAD `7e20cff`, contains M1).

## Read first (fully)
- `/home/user/workspace/repos/tgp-agent-context/specs/PR17_EXPANSION_PLAN.md` — **§3.2 (M2 authoring screen), §4 (page/path layout — exact nav edits), §5 (file-overlap flags)**, plus §1.1 (mobile reuse citations) and §6.11 (scope-creep boundaries).
- `/home/user/workspace/UI_BIBLE.txt` — the design canon. M2 must follow it: quiet-luxury brand (cream `#F5EFE4`, forest `#2C4A36`, Cormorant/Inter, NO emoji), Hick's Law (one primary path + safe default), Miller's Law (≤5 elements per moment), progressive disclosure (advanced cadence options behind a disclosure; safe default `immediate`), consistency (reuse existing primitives), warm copy.
- The M1 API client: `/home/user/workspace/wt-pr17-m2/src/api/packageContentsApi.ts` — consume `coachPackageContentsApi` (list/attach/patch/reorder/remove; types PackageContent, AttachContentBody, CadenceKind, ContentAssetType). Do NOT modify this file.

## Scope — EXACTLY M2 (NOT the push UI)
M2 builds the authoring shell: a screen that LISTS package contents and lets the coach ADD/EDIT/REORDER/REMOVE content, plus the nav wiring to reach it. It also places a per-row "Push to existing" affordance, but the PUSH PROMPT and CONFIRM MODAL are M3/M4 (separate new files) and the final wiring is M5. So M2's per-row action should be a placeholder/no-op hook (e.g. an `onPushPress(content)` callback prop or a TODO-marked handler) that M5 will wire — do NOT implement the push modal here.

Files you OWN (create/edit ONLY these):
- `src/screens/coach/payments/CoachPackageContentsScreen.tsx` (NEW) — the authoring screen. **M5 will also edit this file later — so keep it cleanly structured; do NOT pre-build the push modal wiring (that's M5).**
- `src/screens/coach/payments/contents/ContentAttachForm.tsx` (NEW) — asset picker + cadence picker + title/caption attach form (progressive disclosure on advanced cadence).
- `src/navigation/CoachNavigator.tsx` — add the route (M2 OWNS this file alone per §5):
  - In `SettingsStackParamList` (~`:199`): `CoachPackageContents: { packageId: string; title?: string }`
  - In `SettingsStackNavigator()` (~`:407-413`): `<SettingsStack.Screen name="CoachPackageContents" component={CoachPackageContentsScreen} />`
- `src/screens/coach/payments/CoachPackageEditScreen.tsx` — add ONE "Manage content" nav button → `navigate('CoachPackageContents', {packageId, title})` (mirror the subscribers-button pattern at `:469`). Minimal edit, just the button + handler.

FORBIDDEN: do NOT create `PushPromptSheet.tsx` / `PushConfirmModal.tsx` (those are M3/M4). Do NOT modify `src/api/packageContentsApi.ts` (M1 owns it). Do NOT add the datetimepicker dependency (that's M4). Do NOT build cohort-management UI, analytics, or a feature flag (§6.11). Do NOT touch any backend file.

## Screen requirements (§3.2 + UI Bible)
*One-sentence screen test:* "This is where the coach authors package content."
- Header with package title; loads contents via `coachPackageContentsApi.list(packageId)` (handle loading / empty / error states — empty state uses warm copy, not "No data": e.g. "No content yet — add the first piece").
- Each content row shows `display_title` (fallback to asset_type), the asset_type, and a human cadence label; a per-row overflow/action including **"Push to existing"** (decision #12 per-card entry point) wired only to the placeholder hook for now.
- "Add content" primary action → opens `ContentAttachForm` (asset picker + cadence picker + optional title/caption). On submit calls `coachPackageContentsApi.attach(packageId, body, key)` with a generated idempotency key, then refreshes the list. Cadence advanced options behind a disclosure; safe default `immediate` (Hick's/progressive disclosure).
- Edit a row → `coachPackageContentsApi.patch`; remove → `coachPackageContentsApi.remove`; (reorder optional for M2 — if included, use `coachPackageContentsApi.reorder`; otherwise leave a clean seam).
- **Reuse primitives (consistency):** `useTheme()` from `src/theme/ThemeProvider.tsx` → `{ colors }` (forest `#2C4A36`, cream `#F5EFE4`); `HapticPressable` (`src/components/HapticPressable.tsx`); haptics `src/utils/haptics.ts` (`lightTap`/`mediumTap`); the primary-button `TouchableOpacity` style pattern from `CoachPackageEditScreen.tsx:397-411`; the segmented-`TouchableOpacity` pattern from `CoachPackageEditScreen.tsx:62-67` for the asset/cadence pickers; modal precedent `PackageSelectionSheet.tsx:343-354` if the attach form is a sheet. NO new design dependency. NO emoji.

## Tests (real, repo convention)
Add a screen test (co-located `__tests__` or `src/__tests__/`), RTL mount mocking `@react-navigation/native`, `useTheme`, and a partial mock of `../../api/packageContentsApi` (jest.fn() on list/attach/patch/remove). Assert: list renders rows, empty state copy, "Add content" opens the attach form, attach calls the API with an Idempotency-Key, the nav button on the edit screen navigates to `CoachPackageContents`. Source-grep guard for the nav registration. Run REAL `npx tsc --noEmit` (or the repo typecheck script), lint, and `npx jest` for the new test(s). `npm ci` if node_modules absent. Report actual counts.

## Process
1. `cd /home/user/workspace/wt-pr17-m2` (pull main first if not current).
2. Build per the brief/§3.2/§4. Commit as `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'` — NO Co-Authored-By / Generated trailers. Push every ~2 min (R61).
3. Open PR vs `main` titled `PR-17 M2: coach package contents authoring screen + nav`.
4. Write `/home/user/workspace/repos/tgp-agent-context/specs/PR17_M2_BUILD_REPORT.md`: file:line per piece, the reuse citations honored, the push-action placeholder seam left for M5, any deviations, actual tsc/lint/test counts, final HEAD SHA + PR number. Commit + push to docs repo main (rebase docs first).
5. Report the PR number and final HEAD SHA in your return message so an independent audit can be SHA-pinned.

This is builder-only: your report is NOT a verdict (R1 §4). An independent gpt_5_5 auditor re-checks at your PR head SHA.
