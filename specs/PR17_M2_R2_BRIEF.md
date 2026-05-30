# FIX BRIEF R2 — PR-17 M2 audit remediation (2× P1 in ContentAttachForm)

Repo: growth-project-mobile. Branch: `pr17/m2-contents-screen` (PR #213). Audited SHA `00c214f` verdict NOT CLEAN.
Full audit: `audits/PR17_M2_AUDIT.md`. Everything else in M2 was VERIFIED CLEAN (scope, nav wiring, API calls + idempotency keys, loading/empty/error states, no M3/M4 bleed, UI-Bible basics) — DO NOT change those.

## The two findings to fix (both `src/screens/coach/payments/contents/ContentAttachForm.tsx`)

### P1 #1 — Edit-form state never re-syncs when the row changes (can corrupt metadata)
`ContentAttachForm.tsx:126` seeds local form state from the `content` prop ONLY in `useState` initializers. The parent (`CoachPackageContentsScreen.tsx:358`) keeps ONE `ContentAttachForm` instance mounted and just flips `content`/`visible`, so opening an EXISTING row for edit shows stale/default values, and `handleSubmit` (`:184`) patches from that stale state → pressing Save can WIPE the row's title/caption and reset cadence to `immediate`. This corrupts package content metadata on the advertised edit path.

**Required fix:** re-sync ALL form fields when the editing target or visibility changes. Add a `useEffect` keyed on `content?.id` AND `visible` (and `content?.updated_at` if helpful) that resets every local state field from the current `content` (or to the empty/defaults when `content` is null = add mode). Equivalent acceptable alternative: give the form a `key={content?.id ?? 'new'}` at the parent mount point so React remounts it per target (cleanest if state lives entirely in the child). Prefer whichever is least invasive to the existing structure; ensure BOTH add-mode (null content → defaults) and edit-mode (existing row → seeded values) are correct.

### P1 #2 — Cadence picker exposes options that submit invalid empty payloads
`ContentAttachForm.tsx:65` lists `fixed_calendar` and `on_milestone` as selectable cadence kinds, but `buildCadencePayload` (`:146`) returns `{}` for every non-`relative_to_purchase` kind. The backend requires `fixed_calendar.cadence_payload.release_at` (`package-contents.dto.ts:48`) and `on_milestone.cadence_payload.milestone_key` (`package-contents.dto.ts:70`), so selecting those + Save → guaranteed backend 400. Broken core authoring flow.

**Required fix — choose the approach that keeps M2 in scope (do NOT build a date picker dependency — that's M4):**
- Preferred minimal fix: collect the required field for each exposed cadence kind so the payload is valid:
  - `fixed_calendar` → a `release_at` input. Since the datetimepicker dependency is OUT of M2 scope (M4 adds it), use a SIMPLE text/ISO-date entry or a basic inline date field already available in the repo (check for an existing date input primitive; if none exists without the new dep, fall back to the alternative below). Build `cadence_payload = { release_at: <ISO string> }`.
  - `on_milestone` → a `milestone_key` text input. Build `cadence_payload = { milestone_key: <value> }`.
  - Validate the required field is present before enabling Save (error-prevention per UI Bible); show inline validation if empty.
- Acceptable alternative if a date input can't be done cleanly without the M4 datetimepicker: HIDE the cadence kinds whose required fields M2 can't yet collect (i.e. expose only `immediate`, `relative_to_purchase`, and any kind whose payload M2 can build validly), and leave a clean TODO seam noting `fixed_calendar`/`on_milestone` authoring lands with M4's date picker. This guarantees every visible option submits a valid payload. **Do NOT leave a visible option that submits `{}` for a kind the backend requires fields for.**
- For `relative_to_purchase` (already handled) and `immediate`/`on_completion` (no required payload) keep current behavior — but verify `on_completion` (if exposed) needs no required field per the backend DTO; if it does, apply the same rule.

VERIFY the backend DTO requirements yourself before deciding which kinds are safe to expose: read `package-contents.dto.ts` CADENCE_PAYLOAD_SCHEMAS in the mobile repo's counterpart contract / the M1 client types (`src/api/packageContentsApi.ts` CadenceKind) — only expose a kind whose required payload the form actually builds.

## Guardrails
- Touch ONLY `src/screens/coach/payments/contents/ContentAttachForm.tsx` and its test, plus minimal parent wiring in `CoachPackageContentsScreen.tsx` IF you choose the `key=` remount approach (keep that edit tiny — M5 also edits this file later, so keep it clean). Do NOT modify `src/api/packageContentsApi.ts`. Do NOT add the datetimepicker dependency (M4). Do NOT create PushPromptSheet/PushConfirmModal. Do NOT touch backend or nav beyond what's listed. NO emoji, NO hardcoded hex (use `useTheme()` colors). Follow UI Bible.

## Tests (real)
- Add an RTL test: open an EXISTING content row in the form and assert the seeded fields match that row (title/caption/cadence) and that the patch body reflects the EDITED values (not stale/defaults). Switching from add→edit→different-row re-seeds correctly.
- Add a test per exposed cadence option asserting the built `cadence_payload` is valid for the backend contract (required field present) — OR, if you hid the unsupported kinds, assert they are NOT in the visible options and the exposed ones build valid payloads.
- Keep the existing 11 cases green. Run REAL typecheck (`npx tsc --noEmit` or repo script), lint (eslint on changed files), and `npx jest` for the M2 tests. `npm ci` if node_modules absent. Report actual counts.

## Process
1. `cd /home/user/workspace/wt-pr17-m2`. `git fetch origin && git rebase origin/main` first (rebase if mobile main moved). If a real conflict appears, STOP and report.
2. Implement both P1 fixes. Commit as `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com'` — NO trailers. Push every ~2 min (R61); after rebase `git push --force-with-lease`.
3. Append an R2 section to `specs/PR17_M2_BUILD_REPORT.md`: the edit-resync fix (file:line), the cadence-payload fix/approach (file:line), the new tests, actual tsc/lint/test counts, final HEAD SHA. Commit + push to docs repo main (rebase docs first).
4. Report the FINAL HEAD SHA in your return message for the SHA-pinned re-audit.

Fixer-only: your report is NOT a verdict (R1 §4). An independent gpt_5_5 auditor re-checks at the post-fix SHA.
