# Roman Backlog — Empirical Re-verification (2026-06-14)

**Method:** ripgrep against `growth-project-backend@b19fee89f6` and `growth-project-mobile@ce14bbe768` (post-Wave-2-merge HEADs).
**Trigger:** Operator pushback that several "remaining" items in OPEN_ISSUES_2026-06-09 may already be done or superseded. Re-audit done file-by-file.
**Author:** Bradley Gleave <bradley@bradleytgpcoaching.com>

---

## Cycle H corrected ledger

| ID | OPEN_ISSUES claim | Empirical reality | Verdict |
|---|---|---|---|
| **ED.1** | "AI Butler Identity (Roman) — ships FIRST. Spec first." | **SHIPPED in production.** Backend: full `src/roman/` module — `roman.module.ts`, `roman.service.ts`, `roman.controller.ts`, `roman.prompts.ts` (exports `ROMAN_VOICE_CONTRACT` verbatim per spec §0/§1), `roman-feature.guard.ts`, `anthropic-client.provider.ts`, `roman/voice/` subdir. Mobile: `src/components/community/romanVoice.ts`, `src/lib/roman/copy.ts` covers §2.3–§2.12 surfaces, `coachVoice.ts`, `CoachRomanEmptyState.tsx`, `MonogramBadge.tsx` (the "face"). Trademark/domain concern (SD.2) resolved-in-practice by shipping. | ✅ DONE |
| **ED.2** | "Completion Drive rings — 3 arcs (check-in / brief / review) + deep-link routing" | **Ring tech ✅, named widget ❌.** Ring components exist and are battle-tested: `src/components/CalorieRing.tsx`, `src/screens/client/wearables/cards/ThreeRingHero.tsx` (with `ThreeRingHero.test.tsx`), `RecoveryRingHero.tsx`, used in `HealthFitnessScreen.tsx` + `ProgressScreen.tsx`. **However:** these are wearable/calorie rings. The specific coach-side "check-in arc + brief arc + review arc + deep-link routing" widget the spec describes does NOT exist. | 🟡 PARTIAL — small mobile-UI lane: reuse `ThreeRingHero`-style component, bind to check-in/brief/review domain signals, wire deep-link routing |
| **ED.3** | "First Payment Wow Screen — Supabase realtime trigger, particle burst, MMKV once-only gate" | **SHIPPED in Wave-2.** Option C path. Backend `CoachFirstPaymentNotification` model + Stripe webhook detector landed #395 @ `adc066bd3f`. Mobile celebration UI + notification subscriber landed #242 @ `f2dde9b3f0`. `NotificationKind.FIRST_PAYMENT` is in production. Both flag-gated default-off. | ✅ DONE |
| **ED.4** | "Client Progress Chart Animation — Victory Native XL draw-in + haptic scrubber + auto PR flagging" | **SHIPPED in #242 @ `f2dde9b3f0`** (P4 ED.4 chart animations). | ✅ DONE |
| **ED.5** | "Onboarding Polish — step transitions, Stripe Connect card flip, package creation permanence markers" | **Functional flow ✅, polish layer ❌.** `OnboardingStep1.tsx`–`OnboardingStep10.tsx`, `OnboardingResults.tsx`, `LeanQ2ExperienceScreen.tsx`, `LeanQ3IntentScreen.tsx`, `LeanQ5Screen.tsx` all present. Stripe Connect flow present. But: no card-flip animation, no permanence markers, no transition polish pass landed. | 🟡 PARTIAL — animation/transition pass needed on existing screens |
| **ED.6** | "Coach-Is-Watching Micro-Signal — competence pill ('Your coach reviewed this in 2 hours.')" | **NOT shipped.** Single grep hit (`profileCompletion.ts:105`) is a comment using the word "reviewed", not a competence pill. No component, no binding. | ❌ NOT STARTED — small component + last-review-timestamp binding |

---

## Coach Brief v2 corrected ledger

| Sub-feature | Empirical reality | Verdict |
|---|---|---|
| Coach Brief v1 surface | `src/screens/coach/CoachBriefScreen.tsx` + `CoachBriefScreenRoman.test.tsx` exist | ✅ DONE |
| Roman P3 voice on Coach Brief (§2.3) | `src/lib/roman/copy.ts` has §2.3 default/celebration/error variants, shipped in #241 | ✅ DONE |
| Sub-coach infrastructure | `TeamManagementScreen.tsx`, `SubCoachDetailScreen.tsx`, `SubCoachInviteModal.tsx`, `ClientReassignModal.tsx`, `api/subCoachApi.ts` all present. Head coach can invite sub-coaches, manage seats, reassign clients. Tier-gated (Scale+). | ✅ DONE (as plan-tier seat mgmt) |
| **Sub-coach → head-coach escalation for briefs specifically** | The sub-coach plumbing is for plan tier + seat management, NOT for brief escalation routing. No "escalate this brief to head coach" path found. | ❌ NOT STARTED |
| **Per-coach voice variants** | `roman/copy.ts` is single-voice (one Roman). No per-coach voice token table or override layer. | ❌ NOT STARTED |
| **Brief replay** | No replay capability found. `CoachBriefScreen.tsx` shows current brief only. | ❌ NOT STARTED |
| **Cross-Brief streaks** | No streak counter spanning multiple briefs found. | ❌ NOT STARTED |

---

## Net Roman backlog (actually remaining work)

1. **ED.2 — 3-arc check-in/brief/review router widget** (small mobile lane)
2. **ED.5 — Onboarding polish pass** (animation/transition lane across existing onboarding screens + Stripe Connect card flip)
3. **ED.6 — Coach-Is-Watching competence pill** (small component + binding)
4. **Coach Brief v2 features** — brief replay, cross-brief streaks, per-coach voice variants, sub-coach→head-coach brief escalation (mid-size feature; needs explicit spec before dispatch)

**Removed from backlog (already shipped):** ED.1, ED.3, ED.4, base Coach Brief v1 + voice, sub-coach team management.

---

## Recommended sequencing post-Wave-2

After L9 v3-4 (search + wearable) ships:

- **Lane M1 (small):** ED.6 competence pill — 1-day mobile lane, no backend
- **Lane M2 (small):** ED.2 3-arc router widget — 2-day mobile lane, reuses existing ring components, possible 1 backend endpoint for unified check-in/brief/review counts
- **Lane M3 (medium):** ED.5 onboarding polish pass — single mobile lane touching ~5 onboarding screens
- **Lane M4 (large):** Coach Brief v2 — requires fresh spec brief (replay storage model, streak persistence model, per-coach voice overrides). Backend + mobile. Recommend operator writes the spec before this is dispatched.

Update OPEN_ISSUES_2026-06-09.md to mark ED.1/ED.3/ED.4 as DONE; reword ED.2/ED.5 to reflect partial state; keep ED.6 + Coach Brief v2 as fresh.
