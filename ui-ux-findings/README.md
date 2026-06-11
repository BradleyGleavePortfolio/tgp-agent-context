# UI / UX Findings Thread

**Owner:** Dynasia G (CPO, TGP)
**Started:** 2026-06-10 (PDT)
**Purpose:** Persistent log of every UI/UX audit, finding, fix, and decision across `growth-project-mobile` and any future mobile clients. Survives across orchestration sessions.

---

## What lives in this thread

- `reports/` — every audit report, in chronological order, preserved verbatim:
  - `01_*` — v1-6 mobile coach community UX/design audit (PR #231, doctrine-driven)
  - `02_*` — v1-6 mobile coach community code audit (PR #231)
  - `03_*` — External audit of currently-shipped main-branch coach screens (10 findings)
  - `04_*` — External three-tier teardown (whole-app, 35 findings across Tier 1 Horrific / Tier 2 Mid / Tier 3 Room-to-Dominate)
  - …future reports appended as `05_*`, `06_*`, etc.
- `inventory/SCREEN_INVENTORY.md` — full list of every `*Screen.tsx` on `growth-project-mobile` main, snapshotted on thread start so we can re-snapshot later and diff.
- `THREAD_LOG.md` — running journal: who audited what, when, verdict, follow-up dispatches, fix PRs.

---

## Scope coverage at thread start (2026-06-10)

**Mobile screens on main:** 145 (53 coach + 53 client + 37 auth/applicant/other + 2 entitlement wrappers)
**Mobile main HEAD at snapshot:** `76b1a48a87b1f67a4ced35c4a10d742454346360`
**Doctrine reference (operator-supplied 2026-06-10):** `Mobile-App-Design-Intelligence-Exhaustive-Agent-Training.docx` — extracted to `/home/user/workspace/DESIGN_INTELLIGENCE_DOC_PLAINTEXT.md` in the current orchestrator session. Future sessions should re-attach.

**Open PRs touching UI as of thread start:**
- PR #231 — v1-6 mobile coach community UI (6 new `CoachCommunity*Screen.tsx`, FACE+VOICE empty states) — currently DIRTY/NEEDS_REVISION per reports `01_` and `02_`.
- PR #230 — Android EW3 P1 safe-area pack — MERGED 2026-06-10 02:51 UTC (added `StatusBarBand` + push-banner inset; did NOT migrate hardcoded `paddingTop: 60` literals on main).

---

## The three seed reports (read in this order)

### Report 03 — External audit of main (the brutal roast)
File: `reports/03_external_audit_main_branch_2026-06-10.md`
Verdict: **6.5/10** — solid bones, 10 specific surface-level issues.
- 🔴 High: hardcoded `paddingTop: 60`, 9-tab ClientDetailScreen, 3 overlapping invite screens.
- 🟡 Medium: mislabeled radius tokens, `TouchableOpacity` vs `HapticPressable` inconsistency, Cormorant Garamond on RiskBoard, choppy financial hierarchy on CoachEarnings, permanent privacy banner on ClientsList.
- 🟠 Low-Medium: fragile 47% metric grid, clinical empty-state copy on CoachHome happy path.

### Report 01 — v1-6 mobile coach community UX/design audit (PR #231)
File: `reports/01_v1-6_mobile_UX_DESIGN_audit_PR-231.md`
Verdict: **NEEDS_REVISION**
Top blocker: the operator-locked face+voice contract — every empty state renders `<RomanAvatar />` BUT copy/crop are local `COACH_EMPTY_COPY` constants instead of backend-payload-sourced `{ text, avatar_crop, surface_key, voice_variant }` from Roman Voice Policy v2.
Other UX concerns: equal-weight home actions, visible destructive controls on every member row, dense moderation decisions, error states masquerading as empty/all-clear states, long-press inbox behavior is undiscoverable.

### Report 02 — v1-6 mobile coach community CODE audit (PR #231)
File: `reports/02_v1-6_mobile_CODE_audit_PR-231.md`
Verdict: **DIRTY** (4/13 gates passed)
Top blockers: backend-driven Roman empty-state payloads not wired (the codified version of Report 01's top finding), missing required surfaces, moderation stub, env example, `npm run tsc` script missing.

---

## Threaded follow-ups (decided 2026-06-10 by orchestrator)

The audit reports above are **inputs**. The dispatch decisions live in the parent build journal at `../COMMUNITY_BUILD_JOURNAL.md`. Specifically:

- PR #231 will round-trip with a fresh Opus 4.8 fixer once the operator approves the fix list (this thread's reports are the brief inputs).
- Report 03 (external main-branch roast) is **not** yet dispatched to a fixer — the operator may choose to triage the 10 findings, prioritize a subset, and request fixer PRs against `growth-project-mobile/main` later.

---

## How to add to this thread

When a new UI/UX audit completes (orchestrator or user-supplied):

1. Save the verbatim report to `reports/NN_<slug>.md` (next number).
2. Add a one-line summary + link to `THREAD_LOG.md` with the date.
3. If the audit triggers a fixer dispatch, journal that in the parent `COMMUNITY_BUILD_JOURNAL.md` (this thread is a context library, not a dispatch journal).
4. If the audit identifies a doctrinal pattern worth promoting (e.g., "every screen must use `useSafeAreaInsets`"), add it to `THREAD_LOG.md` under "Doctrine accretion."

---

## Why this thread exists

The user explicitly requested a dedicated UI/UX findings thread so:
- Future audits can be cross-referenced without re-discovering the same issues.
- Sibling agents picking up mobile work can see what's already been flagged and what's still open.
- The operator (Dynasia) has one canonical place to read every audit produced across all orchestration sessions.

If you are reading this from a future session: read the three seed reports first, then `THREAD_LOG.md`, then the inventory.
