# OPERATOR_DECISIONS_LOG — Op 50.5 Appendix

**Append target:** `roadmap/OPERATOR_DECISIONS_LOG.md` in `tgp-agent-context`
**Operator:** Bradley Gleave
**Date:** 2026-06-27
**Op:** 50.5 (M-NEW-LIVE spine ratification + M4 kill)

---

## D-7 — M4 KILL + M2/M3/M8/M9 ABSORB

**Status:** LOCKED

**Operator authorization:** "FUCK THEIR C&D" / "WE ARE BETTER AND FASTER" (2026-06-27)

**Decision:**
- **M4 (Trainerize per-vendor adapter): KILLED.** Trainerize export-API surface is roster-only-data; no value justifies a dedicated per-vendor adapter when the scout-substrate can drive Trainerize as a configuration profile.
- **M2 (TrueCoach adapter), M3 (CoachRx adapter), M8 (PT Distinction adapter), M9 (FitSW adapter): ABSORBED into M-NEW-LIVE.** Each becomes a scout-profile (YAML/JSON config + reconciliation rules + selector map) consumed by the generic M-NEW-SUBSTRATE runner. NO per-vendor TypeScript code.
- **M1 (alpha CSV import): REPURPOSED.** M1 becomes the scout-result reconciler + dedupe engine (consuming scout-mirror data, not raw CSVs). Raw-CSV import path remains for non-scout-supported platforms as a thin fallback.

**Rationale:**
The per-vendor adapter cost curve (estimated 1,200-2,000 prod LOC per vendor × 5 vendors = 6,000-10,000 LOC) loses to the generic-substrate curve (estimated 2,000-3,200 LOC for substrate + 200-400 LOC per vendor profile = 3,000-4,400 LOC at vendor #5) starting at vendor #2-3. The M-NEW-LIVE substrate also delivers 10× richer data (full client history, message threads, session notes) vs export-only data.

**Doctrine impact:**
- All M2/M3/M8/M9 builder briefs are obsolete. Do not dispatch.
- M1 brief must be rewritten against the scout-reconciler scope (see D-8).
- A2 migration planner brief must be rewritten against the scout-result schema (see D-8).

---

## D-8 — M-NEW-LIVE SPINE RATIFIED (with two operator constraints)

**Status:** LOCKED

**Operator authorization:** "either this works for every platform intelligently OR its useless to me - and it needs to be easily accessible for coaches at onboarding too" + "FUCK THEIR C&D - MFA + device-trust enforcement is rising fast in this sector? FUCK IT - WE ARE BETTER AND FASTER - Profile maintenance is forever? CLAUDE, COOK FOR ME AND MAKE NO MISTAKES!!!" (2026-06-27)

**Decision:** Adopt M-NEW-LIVE (universal AI scout mirror adapter) as the canonical import spine, replacing the per-vendor adapter approach. Two load-bearing operator constraints:

### Constraint 1: Generic substrate, not per-vendor code
The substrate MUST be a single configuration-driven runner. Vendor support = a scout-profile (declarative config). NO bespoke TypeScript per vendor. If a feature cannot be expressed as profile config (selectors, reconciliation rules, session-replay choreography, MFA/device-trust handling, export-assisted reconstruction recipes), it goes back to the substrate as a generic capability, not into a vendor-specific code branch.

### Constraint 2: Onboarding-UX is P0, not phase-3
The substrate ships in v0 with a coach-facing onboarding surface:
- Coach pastes credentials in onboarding wizard
- Coach picks platform from dropdown (drives profile selection)
- "Scout Now" button kicks substrate
- Operator-assist mode (Bradley can drive on white-glove onboarding calls; sees scout status live + can intervene on MFA challenges)
- Scout results land in coach's TGP dashboard with reconciliation diff view

### Spine structure (5 slices)

| Slice | Scope | Approx LOC | Authors |
|---|---|---|---|
| **M-NEW-SUBSTRATE** | Generic scout-runner: profile loader, selector engine, session pool, MFA/device-trust handling, reconciliation diff engine, audit substrate, kill-switch (default-ON per operator override) | ~2,400 prod LOC (multi-slice; will subdivide as M-NEW-SUBSTRATE.A through .D) | new |
| **M-NEW-ONBOARDING** | Coach-facing wizard + operator-assist surface; React/Next.js + tRPC | ~600 prod LOC | new |
| **M-NEW-PROFILE-TRUECOACH** | First scout-profile (config + reconstructor); reference implementation | ~300 prod LOC + ~400 config LOC | new |
| **M-NEW-RECONCILER** (was M1) | Scout-result reconciler + dedupe + conflict resolution | ~400 prod LOC | rewrite M1 |
| **M-NEW-SCHEMA** (was A2) | Scout-result schema + reconciliation tables migration | ~150 prod LOC | rewrite A2 |

### Kill-switch semantics (operator override)

- Default state: `scout_authorized=true` for ALL platforms (per operator "FUCK THEIR C&D").
- Hard cut per-vendor: operator sets `scout_authorized=false` in `OPERATOR_OVERRIDES` table → substrate immediately blocks new scout runs for that platform AND aborts in-flight runs at the next checkpoint.
- No soft-degrade. No grace period. If operator flips it off, scouting that vendor stops within ≤30s.
- Hot-reload: changes to `OPERATOR_OVERRIDES` propagate to the substrate via PG NOTIFY (≤2s latency target).

### MFA / device-trust posture

- Substrate handles 3 challenge classes: TOTP (coach enters code in onboarding wizard within 90s), SMS/email OTP (same flow), device-trust ("trust this device" cookies/tokens stored per-coach in session pool, rotated when invalidated).
- Profile-drift maintenance is acknowledged as a forever-cost; budgeted as ongoing engineering capacity, not as a per-deploy task.
- "Better and faster" = scout substrate is the moat. Adversarial vendor anti-bot is the cost of doing business.

### Doctrine impact
- M-NEW-LIVE spine supersedes the M1-M11 adapter ladder for platforms with scout-profile coverage.
- A2 schema gains: `scout_runs`, `scout_results`, `scout_diffs`, `operator_overrides`, `session_cookies` (encrypted-at-rest, tier-1 RLS per R125).
- All new tables get audit-log coverage per D-H6-1/D-H6-5 (this is why H6A must land before M-NEW-SUBSTRATE.A).
- R76 (≤400 prod LOC per slice) honored by splitting M-NEW-SUBSTRATE into ≥6 ordered slices (.A profile loader, .B selector engine, .C session pool + MFA, .D reconciliation diff, .E audit/kill-switch, .F onboarding wizard backend).

**Dependencies:**
- H6A audit-log substrate MUST land (PR #493 fixer cycle in progress).
- H6B circuit-breakers MUST land (PR #494 — covers vendor-side flakiness when scout runs against live platforms).
- H6C audit-log coverage on user-mutating routes MUST land.
- Only THEN does M-NEW-SUBSTRATE.A dispatch.

---

## D-H6-6 — Write-path PII representation (OPEN — operator decision required)

**Status:** OPEN (pending operator answer; surfaced from H6A PR #493 adjudication F4/F8 dispute)

**Question:** When the audit-log write path encounters PII in `before_state`/`after_state`:
- **Option A — Sentinel (current code):** Replace PII leaves with static `'[REDACTED:GDPR-ART-17]'`. Truly unlinkable. Forensic correlation across rows for the same user is impossible.
- **Option B — Deterministic token:** Replace PII leaves with keyed HMAC token `tok_<hex>`. Same plaintext → same token across rows → forensic correlation possible (admin can trace "all rows touching user X's email" even after erasure). But: durable pseudonym remains; offline brute-force possible if secret leaks.
- **Option C — Hybrid (recommended):** Write-path uses deterministic token (`tok_<hex>`) so audit forensics survive normal operations. On GDPR Art. 17 erasure invocation, **rotate the per-user salt** so subsequent reads of the same plaintext produce a DIFFERENT token — kills retroactive linkability of post-erasure events to the erased user.

**Adjudicator recommendation:** Option C (hybrid). Preserves forensic value during normal operation; satisfies Art. 17 by making the user truly unlinkable from any future post-erasure observation. Requires per-user salt table + erasure-time salt rotation. Costs ~80 additional LOC vs Option A.

**Required action:** Operator picks A/B/C. Locks into D-H6-6.

---

## D-H6-7 — H6A PR #493 fix scope (ADJUDICATED, not yet ratified)

**Status:** RECOMMENDED-PENDING-OPERATOR-RATIFY

The H6A adjudication doc (`audits/2026-06-27-H6A-PR493-ADJUDICATION.md`) lists 6 BLOCKERs that the fixer subagent must close before audit-clear. The 8th BLOCKER candidate (R82 reversibility CI) is de-escalated to INFRA-TICKET `BL-CI-REVERSIBILITY-PSQL` (down.sql verified correct; gate broken).

Operator may override the adjudication if they disagree.
