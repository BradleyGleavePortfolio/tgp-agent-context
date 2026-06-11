# UI/UX Findings — Thread Log

Append entries chronologically. Each entry: timestamp, what was audited, verdict, follow-up.

---

## 2026-06-10 — THREAD STARTED

**Trigger:** Dynasia requested a new thread under `tgp-agent-context` for UI/UX findings, seeded with the three reports below.

**Seeded reports:**

1. **`reports/01_v1-6_mobile_UX_DESIGN_audit_PR-231.md`** — v1-6 mobile coach community UX/design audit
   - Auditor: fresh `gpt_5_5` (UX/design lane), driven by the Mobile App Design Intelligence Doctrine (115KB, 1394 lines, supplied by operator 2026-06-10 17:34 PDT)
   - Verdict: **NEEDS_REVISION**
   - Top blocker: empty-state copy/crop sourced from local `COACH_EMPTY_COPY` constants, not the operator-locked backend Roman Voice Policy v2 payload. Avatar present, but copy is hardcoded — violates the face+voice contract.

2. **`reports/02_v1-6_mobile_CODE_audit_PR-231.md`** — v1-6 mobile coach community code audit
   - Auditor: fresh `gpt_5_5` (code lane, R31 builder ≠ auditor)
   - Verdict: **DIRTY** (4/13 gates passed)
   - Top blockers: payload-driven empty states missing, required surfaces missing, moderation stub, env example missing, `npm run tsc` script absent.

3. **`reports/03_external_audit_main_branch_2026-06-10.md`** — External audit of currently-shipped main-branch coach screens
   - Source: external auditor (verbatim, Dynasia-supplied)
   - Scope: `growth-project-mobile` main @ `76b1a48a`
   - Verdict: **6.5/10** — 10 specific findings spanning all coach screens
   - 🔴 High (3): hardcoded `paddingTop: 60` across 10+ screens, 9-tab horizontal scroll in `ClientDetailScreen`, 3 overlapping invite-flow screens in `SettingsScreen`
   - 🟡 Medium (5) / 🟠 Low-Med (2)

**Validation notes (orchestrator):**
- The 10 main-branch findings were spot-checked against the repo and confirmed real on main HEAD `76b1a48a`. PR #230 (safe-area pack, merged 2026-06-10 02:51 UTC) only added `StatusBarBand` + push-banner inset and did NOT migrate the `paddingTop: 60` literals.
- Screen inventory captured at `inventory/SCREEN_INVENTORY.md` — 145 total `*Screen.tsx` on main (53 coach, 53 client, 37 auth/applicant/other, 2 entitlement wrappers).

**Doctrine accretion (started today):**
- Every empty state in the mobile app, on every Roman-voiced surface, MUST source copy and crop from the backend `{ text, avatar_crop, surface_key, voice_variant }` payload — never from local `*EMPTY_COPY` constants. This is locked by operator decision 2026-06-10 ("Empty states — that idea is good, as long as it has his image/face as well, so it's clear ROMAN is speaking").
- The doctrinal reference for visual/UX work is the Mobile App Design Intelligence Doctrine (Master Checklist §6.2, Anti-Pattern Reference §5.5, Screen Design Protocol §5.1). Future UX audits should cite section numbers from this document.

**Open follow-ups (not yet dispatched):**
- **FU-1** — PR #231 round-trip: fresh Opus 4.8 fixer to address both Report 01 and Report 02 findings in a single pass. Brief to be written when orchestrator returns to this thread.
- **FU-2** — Main-branch UX cleanup (Report 03): the 10 findings span ~10 screens. Likely needs to be sequenced as 2-3 PRs (safe-area migration, IA cleanup, copy/visual polish). Awaiting operator triage.
