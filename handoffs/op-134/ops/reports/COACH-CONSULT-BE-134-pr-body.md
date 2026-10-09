**Tier:** T4 (coach profile data, tenancy) — additive schema + three coach-scoped routes.
**Why:** decision 134-1 (owner 19:34): the coach consultation (prototype 77-85, K0-K8) goes into build 8 and is the ONLY onboarding for coaches. B02 (packages before the practice exists), B03 (coach questions too thin).
**T4 trigger scan:** tenancy — every handler passes `req.user.id` only, no path params, no body key can name another user (whitelist + forbidNonWhitelisted; `coach_id` in a body is a 400, tested). PII — the card fields are the coach's own business profile; deleted with the CoachProfile row by the existing account-deletion manifest (`CoachProfile.user_id: del`, `CoachOnboardingProgress.coach_id: del`); nothing is logged; analytics carries only vocabulary keys and a count. Money — none: no Stripe, package, subscription, invite-grant or flag code is called (tested). Auth — `@Roles('coach')` + `JwtAuthGuard` + `CoachGuard` (owner bypass as everywhere). Destructive data — none (additive columns, no backfill).
**T3 trigger scan:** migration (additive, catalog-only `ADD COLUMN`, newer than production's latest 20270406000000; `prisma migrate diff` main→branch prints exactly this SQL).
**Bounded T1:** README rows.
**Canonical builder:** COACH-CONSULT-BE-134 (agent 134). **Parent owner:** operator agent 134.
**Acceptance evidence:** `test/coach-consultation.service.spec.ts` 10/10 (local, heavy.sh); `test/roles-enforced.spec.ts` 2/2 (boots AppModule with the new controller); targeted `tsc` of the new files + module + spec against a client generated from this schema: clean; `eslint --max-warnings 0` on the new files: clean.
**Promotion triggers:** none (already T4).

## What changes for coaches and clients
- A new coach answers the consultation (K1 your card, K2 specialties, K3 clients today, K4 coaching touch, K5 programming style, K6 their link) and the answers are saved as they go, so "Finish later" resumes on the same step on any device.
- Finishing (K8) writes the card to the coach's profile and finishes onboarding, so the coach lands on Clients. Get paid, first package and invite stay optional next steps, never before (B02: profile first, money last).
- Clients see nothing new until a coach finishes: a half-typed card never reaches the invite preview.
- Coaches who already finished the old wizard are unaffected (their `completed_at` is kept).

## API (mobile contract; full text in the COACH-CONSULT-BE-134 report "## API")
| Route | Does |
|---|---|
| `GET /coach/consultation` | `{status, step, answers, photo_url, link:{code,url}, completed_at, updated_at}`; `not_started` answers are prefilled from the account (sign-up name, profile columns); never 404 |
| `PUT /coach/consultation` | partial save of any answer + `step` (K0-K8); keys not sent are kept; null/"" clears; 409 `CONSULTATION_COMPLETED` once finished |
| `POST /coach/consultation/complete` | optional final answers; requires `display_name` (1-80) and `clients_today`, else 400 `{error:"CONSULTATION_INCOMPLETE", missing}`; one transaction: `User.name`, CoachProfile card, `consultation_completed_at`, `completed_at ??= now`; idempotent |

Vocabularies (src/coach/consultation/coach-consultation.vocab.ts): specialties `fat_loss strength muscle beginners older sports mobility nutrition busy other` (max 5); clients_today `none 1_10 11_25 26_50 50_plus`; coaching_touch `close balanced light`; programming_style `own templates help`. Text: business name 80, headline 120, bio 280 (prototype maxlength), years 0-60.

Schema (additive): `CoachProfile.headline VARCHAR(120)`, `years_coaching INT`, `specialties TEXT[] DEFAULT '{}'`, `clients_today`, `coaching_touch`, `programming_style` (TEXT); `CoachOnboardingProgress.consultation_draft JSONB`, `consultation_completed_at TIMESTAMP`. Reused: `User.name`, `CoachProfile.business_name/bio/invite_code`, `UserProfile.avatar_url` (read-only `photo_url`; monogram in v1, decision D9), `InviteCodesService.getOrCreateDefaultForCoach` (same `/join/<code>` link as `GET /coaches/me/invite-link`).

## Prototype screens covered (backend side)
| Screen | Backend |
|---|---|
| 77 K0 Welcome | GET prefills the name for "Welcome, <name>" |
| 78 K1 Your card | display_name (required 1-80), business_name, bio (280), headline, years; photo read-only (D9) |
| 79 K2 Specialties | up to five keys |
| 80 K3 Clients today | required single key (gates K7 on mobile) |
| 81 K4 Coaching touch | optional key, stored for Roman coach context / cadence |
| 82 K5 Programming style | optional key, stored for the coach tutorial branch |
| 83 K6 Your personal link | `link.code` + `link.url` in every response |
| 84 K7 Import offer | no field (flag off); `step: "K7"` accepted |
| 85 K8 Practice ready | complete sets consultation_completed_at (the prototype's coach_onboarding_completed_at) and the app gate |

## B / U fixed
- B02 (backend half): onboarding can be completed with no money step; the app gate (`GET /coach/onboarding` `is_complete`) flips on consultation complete.
- B03 (backend half): every K1-K6 answer has a validated home.

## WHY / WHEN / WHO
- B02: the coach setup order lives in the mobile wizard (CoachWizardNavigator: practice basics, Get paid, First package, Invite, Ready), added in mobile commit ea2c72d1 (2026-10-03, "coach wizard navigator ... split W3 of m#329"). The backend wizard (`src/coach/coach-onboarding.service.ts`, commit 30d56601, 2026-05-06, "PTM Phase 1 + Phase 3-6 backend") only finishes after walking all six steps in order, so there was no profile-first way to finish.
- B03: the same backend wizard stores an opaque `step_data` blob per step and never writes the coach's card; `CoachProfile` had only business_name/bio/timezone, so specialties, clients today, coaching touch, programming style, headline and years had nowhere to live.

## Not in this PR (proposed to the operator)
- Invite preview card (`GET /invite/:code/preview`, src/invite-codes) showing specialties/headline (prototype "Code entry" card) — another lane's file.
- Roman coach context reading coaching_touch / programming_style (src/roman) — another lane's file.
- Coach photo upload (needs expo-image-picker on mobile + an upload route) — D9 says monogram in v1.

Not seen on a device (backend only). npm audit / unrelated main checks: see CI.

agent 134
