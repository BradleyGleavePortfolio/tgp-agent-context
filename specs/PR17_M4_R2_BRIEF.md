# PR-17 M4 R2 — Fix brief (single P1)

## Role
You are a FIXER (Opus 4.8). Work ONLY in worktree `/home/user/workspace/wt-pr17-m4` (branch `pr17/m4-push-confirm`). Commit identity R4 STRICT: `Dynasia G <dynasia@trygrowthproject.com>`, NO trailers, NO co-author lines. Push every ~2 min (R61). api_credentials=["github"] for git network ops.

## Rebase first
`git fetch origin main && git rebase origin/main` (origin/main now `34807cc`, includes M3). M3 only added `PushPromptSheet.tsx` — disjoint from M4's files — so expect a clean rebase. Force-push with-lease against your prior `1a929ae`.

## The one P1 to fix (from GPT-5.5 audit `audits/PR17_M4_AUDIT.md`)
`src/screens/coach/payments/contents/PushConfirmModal.tsx:105-109` — `canConfirm` (the gate enabling the Confirm button) only checks non-null `fireAt`, audience > 0, and not-submitting. The picker's `minimumDate` prevents PICKER-originated past dates, but the brief requires **defence-in-depth**: a past `fireAt` arriving via PROPS (e.g. M5 passes a stale/restored date, or a value crossing midnight) must NOT enable Confirm. Decision #6 (past dates BLOCKED) + UI-Bible error-prevention demand this be enforced at the gate, not only at the picker.

### Fix
- In the `canConfirm` computation, add a guard that `fireAt` is strictly in the FUTURE relative to "now" (use the same now/today basis the picker's `minimumDate` uses — be consistent about whether the rule is "future instant" vs "today or later"; the safest is: `fireAt` must be a valid Date AND `fireAt.getTime() > Date.now()`, OR if the product treats whole-day scheduling, `fireAt` >= start-of-today — MATCH whatever `minimumDate` semantics the picker already uses so the gate and picker agree exactly). Document which basis you chose in a code comment.
- Keep all existing gate conditions (non-null, audienceCount > 0, !submitting).
- When `fireAt` is in the past, Confirm stays disabled (same disabled styling already used for the other disabled states). Optionally surface a calm inline hint, but do not add new required props.
- Do NOT change the props contract. Do NOT touch any other file.

## Add a regression test
In `src/__tests__/PushConfirmModal.test.tsx`, add case(s): given a PAST `fireAt` prop (e.g. yesterday) with valid audience and not-submitting, Confirm is DISABLED and pressing it does NOT call `onConfirm`. Also assert a future `fireAt` still enables it (guard against over-correction). Keep all 14 existing tests green.

## Verify (run, report actual counts)
From the worktree (run `npm ci --no-audit --no-fund` if node_modules missing):
- `npx tsc --noEmit` → 0 errors
- `npx eslint` on the changed file(s) → 0 errors/warnings
- `npx jest src/__tests__/PushConfirmModal.test.tsx` → all pass (report counts; should be 14 + your new cases)

## Deliverables
- Push the fix. Append an R2 section to `specs/PR17_M4_BUILD_REPORT.md` in tgp-agent-context (the gate change + chosen now/today basis, new test, counts, post-fix SHA), commit (R4) + push to docs main after clean rebase.
- Report back: post-fix branch HEAD SHA, exact tsc/lint/test counts, and confirmation the props contract is unchanged. This is a fixer record, not a verdict — an independent GPT-5.5 auditor re-checks at your SHA.
