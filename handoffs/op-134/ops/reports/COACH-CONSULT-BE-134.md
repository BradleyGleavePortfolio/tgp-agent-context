# COACH-CONSULT-BE-134 — K0-K8 coach consultation backend (B02 B03, decision 134-1)

Builder: claude_opus_5_5, agent 134. Worktree /home/user/workspace/wt/COACH-CONSULT-BE-134-backend, branch agent134/coach-consult-be-134
(off backend main e261ce5e). Started 19:40 PDT.

## Status
- 19:55 API contract posted below (for COACH-CONSULT-M-134 / M2-134).
- 20:25 PR b#894 opened (branch agent134/coach-consult-be-134). First CI run: "Banned cast tokens (R75)" failed on 5 `as any` in my
  spec, "danger" failed on the PR title (needs Conventional Commits; it falls back to the latest commit subject, so the "[134]" title
  stays and the latest commit is conventional). Fixed with typed doubles (no banned tokens; check-r75 local: net -5).
- 20:32 head 27d39f34421543d9124b5e721ac033cf6d93ac10, 797 changed lines (790+ / 7-). Local (heavy.sh):
  test/coach-consultation.service.spec.ts 10/10, test/roles-enforced.spec.ts 2/2, targeted tsc (new files + module + spec, client
  generated from the branch schema into /tmp) clean, eslint clean, `prisma migrate diff` main->branch = the migration SQL.
- 20:46 CI all green at 27d39f34 (deploy-readiness-gate skipped, as on every PR). READY posted
  (https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/894#issuecomment-6073854376). Waiting for verdicts
  (poll every 180 s, up to 90 minutes).
- 20:55 both lenses APPROVE at 27d39f34: AUDIT Claude Opus 5.5 (LN-OPUS-D-134) B=0 U=0; AUDIT GPT-6.1 Sol (LN-SOL-D-134) B=0 U=0.
  Merge state CLEAN. Opus confirmed the mobile wire keys in COACH-CONSULT-M-134 "## API" match this DTO and vocabulary.

## API

All routes: `@Roles('coach')` + `JwtAuthGuard + CoachGuard` (role coach, or owner), mounted at `/coach/consultation`. No path params: every read and write
is keyed on `req.user.id` only, so a coach reads/writes only their own profile (tenancy). No SubscriptionGuard, no Stripe, no package
check anywhere: completing the consultation never requires money (B02: profile first, money last).

### What already exists (reused, unchanged)
| Need | Existing | Used how |
|---|---|---|
| Display name | `User.name` | prefill; written on complete |
| Business name | `CoachProfile.business_name` | prefill; written on complete |
| Bio ("how do you help people", K1) | `CoachProfile.bio` | prefill; written on complete (max 280, prototype maxlength) |
| Photo | `UserProfile.avatar_url` | READ-ONLY `photo_url` in the card (null = monogram, decision D9). Mobile has no image picker; a photo upload is "Proposed (needs operator)" |
| Personal link (K6) | `CoachProfile.invite_code` + `GET /coaches/me/invite-link` (lazy-creates the profile) | the consultation response carries `link: {code, url}` from the same service, same `/join/<code>` URL |
| Gate the app routes on | `GET /coach/onboarding` → `is_complete` (RootNavigator) | `POST /coach/consultation/complete` sets `CoachOnboardingProgress.completed_at` (if not already set), so every build routes the coach to the coach app after K8; the old money steps are never forced (B02) |

### New columns (additive, migration `20270408000000_coach_consultation`, newer than production's latest 20270406000000)
- `CoachProfile.headline` VARCHAR(120) NULL — one-line card headline (optional)
- `CoachProfile.years_coaching` INTEGER NULL — 0-60 (optional)
- `CoachProfile.specialties` TEXT[] NOT NULL DEFAULT '{}' — K2
- `CoachProfile.clients_today` TEXT NULL — K3
- `CoachProfile.coaching_touch` TEXT NULL — K4
- `CoachProfile.programming_style` TEXT NULL — K5
- `CoachOnboardingProgress.consultation_draft` JSONB NULL — the resumable draft (answers + last step)
- `CoachOnboardingProgress.consultation_completed_at` TIMESTAMP NULL — set by complete (the prototype's "coach_onboarding_completed_at")

### Vocabularies (server-enforced; unknown value = 400)
- `specialties` (K2, 0-5, unique): `fat_loss` Fat loss, `strength` Strength, `muscle` Muscle gain, `beginners` Beginners, `older` Older adults,
  `sports` Sports performance, `mobility` Mobility, `nutrition` Nutrition habits, `busy` Busy professionals, `other` Something else
- `clients_today` (K3, REQUIRED at complete): `none` None yet, `1_10` 1 to 10, `11_25` 11 to 25, `26_50` 26 to 50, `50_plus` More than 50
- `coaching_touch` (K4, optional): `close` Close guidance, `balanced` Balanced, `light` Light touch
- `programming_style` (K5, optional): `own` I write my own, `templates` I adapt templates, `help` I'd like help building them
- `step` (resume point): `K0` `K1` `K2` `K3` `K4` `K5` `K6` `K7` `K8`

### Field rules (strings are trimmed; "" on an optional field = null)
| Field | Type | Draft (PUT) | Complete |
|---|---|---|---|
| `display_name` | string | 0-80 chars | REQUIRED, 1-80 |
| `business_name` | string or null | 0-80 | optional |
| `headline` | string or null | 0-120 | optional |
| `bio` | string or null | 0-280 | optional |
| `years_coaching` | int or null | 0-60 | optional |
| `specialties` | string[] | 0-5 known keys, deduped | optional |
| `clients_today` | key or null | known key | REQUIRED |
| `coaching_touch` | key or null | known key | optional |
| `programming_style` | key or null | known key | optional |
| `step` | K0-K8 | optional | — |
Any other body key = 400 (global whitelist + forbidNonWhitelisted).

### Response shape (all three endpoints return it)
```json
{
  "status": "not_started | in_progress | complete",
  "step": "K3",                       // last saved step for resume, null if none
  "answers": {
    "display_name": "Jordan Reyes",
    "business_name": "Reyes Strength", "headline": null, "bio": null, "years_coaching": null,
    "specialties": ["strength", "fat_loss"],
    "clients_today": "none", "coaching_touch": null, "programming_style": null
  },
  "photo_url": null,                  // read-only; null = monogram (D9)
  "link": { "code": "GP-RS7K2Q", "url": "https://app.trygrowthproject.com/join/GP-RS7K2Q" },
  "completed_at": null,               // ISO string once complete
  "updated_at": "2026-10-08T20:05:00.000Z"
}
```
- `not_started`: no draft saved yet; `answers` is PREFILLED from what the account already has (User.name, CoachProfile business_name/bio/
  headline/years/specialties/K3-K5 columns), so K1 opens with the name typed at sign-up.
- `in_progress`: `answers` = the saved draft; `step` = where to resume.
- `complete`: `answers` = the saved profile columns (for K8's summary and any later "edit your card").

### Endpoints
1. `GET /coach/consultation` → 200 the shape above. Never 404 (creates nothing except the lazily created invite code, same as
   `GET /coaches/me/invite-link`).
2. `PUT /coach/consultation` body: any subset of the fields above plus optional `step`. Merges into the draft (fields not sent are kept),
   saves `step`, returns the shape. Nothing client-facing changes until complete (the invite preview never shows a half-typed card).
   409 `{error:"CONSULTATION_COMPLETED"}` once complete. A bad value or an unknown key is the standard Nest 400
   (`{statusCode:400, message:[...], error:"Bad Request"}` from the global ValidationPipe).
3. `POST /coach/consultation/complete` body: optional final subset of the same fields (lets the mobile local-first fallback sync every
   answer in one call). Merges, validates the required fields (`display_name`, `clients_today`), then in ONE transaction writes
   `User.name`, the CoachProfile columns, `consultation_completed_at = now` and `completed_at = completed_at ?? now` on
   CoachOnboardingProgress (row upserted). Returns the shape with `status: "complete"`. Idempotent: a second call returns the saved state
   (200) and changes nothing. 400 `{error:"CONSULTATION_INCOMPLETE", missing:["display_name"|"clients_today"]}`.
   Never touches Stripe, packages, invites or flags.

### Mobile notes (for COACH-CONSULT-M-134)
- Routing: unchanged gate. New coach → `GET /coach/onboarding` is `is_complete:false` (or 404 → start) → mount the consultation. After
  `POST /coach/consultation/complete`, `is_complete` is true, so the coach lands on the coach app (K-LAND / ClientsStack, D13); Get paid,
  first package and invite stay optional next steps (Overview checklist), never before.
- Until this PR is deployed the three routes 404 on production: keep answers locally and sync with one `POST .../complete` (it accepts
  every answer) when the route answers; fall back to the existing `/coach/onboarding` start/steps/complete if it 404s.
- K6 can use `link` from any of the three responses, or the existing `GET /coaches/me/invite-link`.
- K7 (import) has no backend field: skipped while the importer flag is off; `step` accepts `K7` for when it turns on.

## Findings (B / U / C)
- B02 (backend half, fixed in b#894, from the code): `CoachOnboardingService.completeWizard` finishes only at step 6 after walking
  every step in order, and the mobile wizard puts Get paid and First package at steps 2-3; there was no profile-first finish.
- B03 (backend half, fixed in b#894, from the code): `CoachProfile` had nowhere for specialties, clients today, coaching touch,
  programming style, headline or years; the old wizard's step 1 answers stayed in the opaque `step_data` blob and never reached the profile.
- C (edge, deferred to 10k clients): two concurrent PUTs from two devices are last-write-wins on the draft.
- C (edge, deferred to 10k clients): a sign-up name longer than 80 characters is kept as the prefill; complete accepts it unchanged.

## Proposed (needs operator)
1. Invite preview card shows specialties + headline (prototype "Code entry" card: monogram, name, business, specialties):
   `src/invite-codes/invite-codes.service.ts` `previewExactCode` select + return `specialties`, `headline`. Not my file. Default: a
   small follow-up PR by whoever owns src/invite-codes after b#894 merges.
2. Roman coach context reads `coaching_touch` / `programming_style` (K4 "feeds Roman coach context and the default check-in
   cadence"): src/roman/** is not my file. Default: next Roman wave.
3. Coach photo (D9): monogram in v1; a photo needs expo-image-picker (new mobile dependency) and an upload route. Default: after build 8.
4. Old-wizard partial answers (`step_data["1"].practice_name/focus`) are not used as the consultation prefill (free-text labels, not
   the K2 vocabulary). Default: leave; production has very few coaches mid-wizard.

## HANDOFF
- PR: growth-project-backend#894 "[134] B02 B03 K0-K8: coach consultation backend", branch agent134/coach-consult-be-134,
  head 27d39f34421543d9124b5e721ac033cf6d93ac10, 797 changed lines, CI green, mergeable CLEAN, dual APPROVE at this head.
- Operator next: merge b#894 (merge loop), then deploy backend; the migration 20270408000000_coach_consultation is additive
  (catalog-only ADD COLUMN, down.sql present). Mobile COACH-CONSULT-M-134 / M2-134 use the "## API" above; until the deploy the
  routes 404 on production and mobile falls back to local answers + one POST /coach/consultation/complete.
- Nothing half-done, nothing unpushed. Scratch files (not committed, git-ignored): worktree dist/ccbe134/ (temp schema with a /tmp
  client output, tsconfig for the targeted typecheck, main schema copy) and /tmp/ccbe134/client (generated client). The shared
  deps/backend Prisma client was NOT regenerated.
- Open items: "Proposed (needs operator)" 1 (invite preview specialties/headline, src/invite-codes) and 2 (Roman reads K4/K5,
  src/roman). Items 3-4 need no action (defaults stand).
- Copy of the PR body: /home/user/workspace/ops/reports/COACH-CONSULT-BE-134-pr-body.md.

# COACH-CARD-134 (WAVE 1e, given 20:58 PDT after b#894 merged)
## Status
- 21:08 backend PR b#897 opened (branch agent134/coach-card-be-134 @ cc6495ba5580d4899aa774ec606e21de8b957b75, 264 lines):
  invite preview headline + specialties; Roman coach.coaching_style (K4/K5) with the never-the-coach instruction. Local tests green
  (body: /home/user/workspace/ops/reports/COACH-CARD-134-be-pr-body.md). CI pending. Mobile card next (owner check: no open PR among
  m#579 m#581 m#621 m#622 m#623 touches src/screens/auth/RoleSelectionScreen.tsx or CreateAccountScreen.tsx, checked with gh pr diff --name-only).
- 21:16 mobile PR m#630 opened (branch agent134/coach-card-134 @ 56fb2fa4a0765ffec11da5027da251dbca3996f9, 179 lines incl. a
  `git merge origin/main`): new src/components/invite/InviteCoachCardDetails.tsx under "You will be paired with ..." in
  RoleSelectionScreen + CreateAccountScreen; InvitePreview type gains optional headline/specialties. Local 4/4 + 82/82 + 20/20,
  targeted tsc clean (body: /home/user/workspace/ops/reports/COACH-CARD-134-m-pr-body.md). b#897 CI: all green except build-and-test running.
- 21:22 b#897 first CI: build-and-test failed only on test/e2e-saas-smoke.spec.ts (exact preview shape, from the code); fixed and
  pushed 902b9ca1097c74f625fcdce176804d6a024229ce (266 lines). 21:30 m#630 CI green, READY posted.
- 21:35 m#630 lenses: Opus B-630-1 and Sol B-630-SOL-D-134-1, both body-only (missing P4 parity table + "Not seen on a device",
  my miss). Body fixed at the same head; FIX ROUND 2 posted 21:36.
- 21:38 b#897 CI green at 902b9ca1; READY posted. Waiting for verdicts on both (poll every 180 s).
- 21:41 m#630 dual APPROVE at 56fb2fa4 (Opus + Sol, after the body-only FIX ROUND 2).
- 21:41 b#897 verdicts at 902b9ca1: REQUEST CHANGES from both. B-897-1 = B-897-SOL-D-134-1 (from the code): the preview read only
  `headline`, but the shipped mobile K1 saves `bio`, so real coaches showed no card line. B-897-SOL-D-134-2 (Opus: U-897-1): valid
  per-row InviteCode invites returned null/[]. Fixed in 79a422da788617ae1bb918aa0df832b98b0e3a10 (headline else bio; per-row invite
  resolves its coach's profile; 2 new tests). 316 changed lines.
- 21:56 b#897 CI green at 79a422da; FIX ROUND 2 posted.
- 22:01 b#897 dual APPROVE at 79a422da (Opus B=0 U=0, C: a 280-character bio can be the card line; Sol B=0 U=0). Both COACH-CARD-134
  PRs are ready for the operator merge.
- 22:02 operator: proposal 1 YES (coach-code sheet card), proposal 2 DEFERRED to agent 135. b#897 merged.
- 22:05 b#898 opened (backend, branch agent134/coach-code-card-134 @ 765dd23c3ae009e7301a6339f193a2f2036b1010, 82 lines): the coachless
  coachCard (check / redeem / featured coach) adds headline (else bio) + specialties via the shared publicCoachCardFields in
  coach-consultation.vocab.ts (invite-codes now uses it too). Body: COACH-CODE-CARD-134-be-pr-body.md.
- 22:08 m#637 opened (mobile, branch agent134/coach-code-card-134 @ be853f88c32b9d454fc2088c18a4dd15d7497a61, 91 lines): CoachCodeSheet
  renders InviteCoachCardDetails under "Coach: {name}"; CoachCardSchema gains the two optional fields. Body (with parity + device
  sections): COACH-CODE-CARD-134-m-pr-body.md.
- 22:18 CI green on both at those heads; READY posted on b#898 and m#637. Waiting for verdicts.
## API (b#897)
GET /invite/:code/preview -> valid branch adds `headline: string | null` (K1 headline, else K1 bio), `specialties: string[]` (K2 keys,
max 5); `null` / `[]` when unset; same for CoachProfile codes and per-row InviteCode invites.
## Proposed (needs operator) — COACH-CARD-134
1. `/coachless/coach-code/check` (src/coachless/coach-code-lookup.service.ts; the Settings "Add a coach code" sheet and the coachless
   Messages sheet) has its own coach card without headline/specialties. Default: same two fields in a small follow-up by the
   coachless owner, rendered with InviteCoachCardDetails.
2. Live Roman eval item G38 ("asked 'are you my coach', Roman says he is Roman and names the coach"): live runner only, needs the
   operator's ROMAN_LIVE_EVAL run. Default: add to the next live eval.
3. C (edge): the K4/K5 style is the head coach's; a client delegated to a sub-coach still gets the head coach's style. Default: leave.

## HANDOFF — COACH-CARD-134
- m#630 (mobile, branch agent134/coach-card-134, head 56fb2fa4a0765ffec11da5027da251dbca3996f9): CI green, dual APPROVE. Operator: merge.
- b#897 (backend, branch agent134/coach-card-be-134, head 79a422da788617ae1bb918aa0df832b98b0e3a10): CI green, dual APPROVE after
  FIX ROUND 2 (B-897-1, B-897-SOL-D-134-1, B-897-SOL-D-134-2 / U-897-1 fixed). Operator: merge, then deploy; m#630 shows the
  fields once the backend is live (absent fields render as today; either merge order is safe).
- Device check still owed (nothing seen on a device): the invite box with a long card line (up to 280 characters via the bio
  fallback) and five specialties at 360 pt Android and a small iPhone.
- b#897 and m#630 MERGED. Follow-up (operator YES): b#898 + m#637 (branch agent134/coach-code-card-134 in both worktrees); next:
  CI green, READY posted 22:18; waiting for verdicts -> fix any B (one push, CI green, FIX ROUND 2 line).
- DEFERRED to agent 135 (operator 22:02): live Roman eval item "never claims to be the coach" (G38-style: the client asks "are
  you my coach?", Roman says he is Roman and names the coach). The unit/eval-harness test
  test/roman/eval/roman-coach-style-134.eval.spec.ts covers the prompt; the live runner needs the Roman eval harness PR b#605
  (not merged) and an operator ROMAN_LIVE_EVAL run.
- Nothing half-done, nothing unpushed.
- Scratch (git-ignored, not committed): wt/COACH-CARD-134-backend/dist/ccard134 (schema copy with /tmp client output, targeted
  tsconfig), /tmp/ccard134/client; wt/COACH-CARD-134-mobile/dist/ccard134/tsconfig.json.
