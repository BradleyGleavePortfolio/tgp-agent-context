TIER: T4 (coach profile data on a public endpoint; Roman prompt context)
JOB: COACH-CARD-134 (WAVE 1e, decision 134-1), backend points 1 and 2. Lenses: SLICE D (LN-OPUS-D-134 + LN-SOL-D-134).
BUG IDS: B03 (consultation answers collected but unused), 134-1.

## What
1. **Invite preview carries the coach card.** `GET /invite/:code/preview` (valid branch) now also returns
   `headline: string | null` (K1 headline, else the K1 `bio` the shipped K1 screen saves) and `specialties: string[]` (K2 keys,
   known vocabulary only, at most five, coach's order). Coaches who never did the consultation get `null` / `[]`. CoachProfile
   codes: no new query (the row is already read). Valid per-row `InviteCode` invites: one `coachProfile.findUnique` by the
   validated coach's `user_id` (select headline, bio, specialties) inside the existing fail-closed try. `{valid:false}` is
   unchanged. One `InvitePreview` type replaces the two copies of the shape.
2. **Roman reads the coach's style.** For a coached client whose current coach is live, `client_data.coach.coaching_style`
   carries the K4 coaching touch and K5 programming style as plain phrases (e.g. `"close guidance, frequent check-ins"`,
   `"writes their own programs"`), only when the coach set at least one. The read rides the existing `user.findUnique`
   (nested `coach.coach_profile` select of the two columns), so the query count is unchanged. When present, one instruction
   line is added next to the clearance instruction: Roman works in that style, is Roman and not the coach, never says he is
   their coach, never speaks for the coach, and leaves program changes to the coach. Coachless clients, coaches who skipped
   K4/K5, and soft-deleted coaches: the context and the prompt are byte-for-byte unchanged (tested).

## Mobile contract (COACH-CARD-134 mobile PR reads this)
```
GET /invite/:code/preview -> { valid: true, coach_id, coach_name, business_name, branding: { accent_color, logo_url },
                               headline: string | null, specialties: Array<'fat_loss'|'strength'|'muscle'|'beginners'|'older'|
                               'sports'|'mobility'|'nutrition'|'busy'|'other'> } | { valid: false }
```

## Tests (local, heavy.sh, one file at a time)
- test/roman/eval/roman-coach-style-134.eval.spec.ts (new, R8 eval harness: real RomanService + context builder, stub model): 7/7
- test/invite-codes.service.spec.ts 32/32 (new: card fields, unknown keys dropped, cap 5, trim; bio-only K1 profile; valid per-row
  invite carries its coach's card; null-safe on the old cases), invite-code-typed-case 6/6, invite-attach-reliability 22/22,
  auth-signup-role-choice 71/71
- test/e2e-saas-smoke.spec.ts 21/21 (exact preview shape updated with the null-safe fields; first CI run caught it),
  test/coach-sharing-at-join.spec.ts 9/9, test/roman/roman-client-context.spec.ts 20/20, test/roman/eval/roman-golden.eval.spec.ts 37/37
- Targeted tsc (changed files + specs, Prisma client generated from this schema) clean; eslint clean (one pre-existing warning);
  check-r75 staged: no positive token change.

## WHY / WHEN / WHO
- WHY the preview lacked the fields: `previewExactCode` was written in Phase 1C (b4208221, 2026-04-26, "Phase 1A/1B/1C OWNER
  role, CoachProfile, authz, invites (#52)") with name, business and branding only; the K1/K2 columns arrived in b#894
  (2026-10-08, COACH-CONSULT-BE-134) and nothing returned them.
- WHY Roman did not see them: the client context's coach select (802ae6a3, 2026-10-03, "client context service ... (split 2/2
  of #665)") reads id, name, role and deleted_at only; K4/K5 did not exist then.
- WHO: agent 134 (COACH-CONSULT-BE-134 builder, now COACH-CARD-134).

## Not in this PR
- `/coachless/coach-code/check` (src/coachless, the Settings "Add a coach code" sheet) has its own coach card; not named in
  the entry. Proposed in the report.
- Live model eval: no model, prompt contract or guardrail change; the new instruction is data-scoped like the clearance line.
  A live G38 ("never claims to be the coach") is proposed in the report.

agent 134
