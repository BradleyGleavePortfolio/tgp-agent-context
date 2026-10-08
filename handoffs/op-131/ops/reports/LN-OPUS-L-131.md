# LN-OPUS-L-131 (Claude Opus 5.5 lens, operator agent 131, round 2026-10-08, one review pass)

Ran 09:45-09:59 PDT. Scope from the launch message: m#562, m#567 and b#880 at their launch heads, plus m#566 if its READY was posted
by the time those three were done. It was: READY at 09:51 PDT; the third verdict was posted at 09:56. Each head was re-checked on GitHub
right before its claim and its verdict, and none moved. No Sol verdict was read before posting.

## Verdicts (one line each)
- b#880 @ c47f73ef68593586cbda948e326eb4950181bb51 (53 lines, CI green 15 + 1 skipped): APPROVE, 09:52, comment 6064803565. B=0 U=0.
- m#567 @ f1dc5ab009eb1291934377471914f32915daee3e (42 lines, CI green 4/4): APPROVE, 09:52, comment 6064804016. B=0 U=0.
- m#562 @ daa2557e6c5364481026adff79baf54b713c45de (401 lines, CI green 4/4): APPROVE, 09:56, comment 6064875086. B=0 U=0.
- m#566 @ 6edd77e9a931828861942c9f822117383593f65b (340 lines, CI green 4/4): APPROVE, 09:58, comment 6064916965. B=0 U=0.
Full verdict copies: ops/reports/LN-OPUS-L-131-{b880,m567,m562,m566}-verdict.txt.
Claims (09:46-09:56): b#880 6064712908, m#567 6064713333, m#562 6064808599, m#566 6064881670. No other Opus claim at any of these heads.

## Scope traced (all from the code)
- ALLERGY-CHOICES-131 (T4): the N2 validator and coach labels, then profileFieldsFromAnswers -> dietary_restrictions -> allergens.ts
  -> loadViewerAllergens. Every other dietary_restrictions reader passes the strings through (meal-plan prompt, AI context, Roman
  context). The profile DTO takes any string array (profile.service.ts:322). Production (652b07a8) already maps 'soy' and 'sesame'
  (allergens.ts:55-56), so the mobile chips hide recipes in any merge order. The mobile sheet scrolls, EditProfile keeps saved strings
  that have no chip, recipeAllergens.ts names both allergens, and the legacy OnboardingStep6 is not mounted.
- CHECKIN-GATE-131: the backend guards the whole /check-ins controller with ClientEntitlementGuard (client-check-ins.controller.ts:23-25).
  The mobile /checkout/entitlement read is the same purchase lookup minus the status filter, so it is never stricter on a normal day.
  The ProtectedScreen pass-through matches checkInAccessible. React Query is v5 (no stuck spinner). All three gate copy variants are true.
- INVITE-REFRESH-131: Attach stays explicit, and the coach preview is keyed by code (PendingInviteBanner.tsx:38). /invite/:code/preview
  is the existing public, throttled, read-only route. The invalidation key matches CoachlessHomeSlot.tsx:47.

## B list
none.

## U list
none.

## C one-liners
- b#880: the app's consultation N2 has no Sesame option yet (the builder's own follow-up, correctly held until b#880 deploys).
- m#567: "Soy" and "Sesame" break the "X Allergy" label pattern, on purpose (production maps those exact strings). A saved consultation 'soy' does not light the Edit Profile Soy chip; filtering is unaffected.
- m#562: on an inactive account the new line sits right above the gate title that says much the same. C (edge, deferred to 10k clients): /checkout/entitlement (checkout.service.ts:1092) lacks the guard's status filter and dunning-v2 grace branch (client-entitlement.guard.ts:47-66); this predates the PR and affects every ProtectedScreen surface.
- m#566: after a failed Attach the sharing sentence is hidden while Attach is still offered (PendingInviteBanner.tsx:128). Unchanged from main.

## Proposed (needs operator)
1. Fish allergy gap, outside this round's diffs (from the code). The Recipes allergy sheet (mobile src/components/AllergySafetyPrompt.tsx:49-62)
   has no fish chip, and consultation N2 (backend src/onboarding/consultation-answers.ts:238-254, mobile src/lib/consultation/definitions.ts
   about :447) has no fish choice. A fish allergy can only be saved from Edit Profile "No Fish" (EditProfileScreen.tsx:146). Default: next
   allergy round, add a "Fish" chip to AllergySafetyPrompt (production already maps 'fish', allergens.ts:53 at 652b07a8), and add 'fish' to N2
   backend first, then mobile, the same way as sesame.
2. Sequencing: the mobile N2 Sesame option (mobile src/lib/consultation/definitions.ts about :449, copy.ts AVOID about :195) must merge only
   after b#880 is deployed (today's backend refuses 'sesame' in N2). Default: launch it as a small follow-up job after the b#880 deploy.

## HANDOFF
- Done: all four PRs in my launch scope reviewed once at their READY heads; four APPROVE verdicts posted in the _COMMON format and signed
  "agent 131". Nothing is left for this lens. No code edits, merges, deploys, flag or production changes.
- Next for the operator: each of the four PRs still needs its GPT-6.1 Sol verdict at the same head before merge. b#880 and m#567 are
  independent, so either merge order is safe. Then items 1-2 above.
- If a builder moves any head, my APPROVE no longer counts there; a fresh Opus lens does a delta re-review (20 minutes).
- Scratch only: /tmp/lnL-backend and /tmp/lnL-mobile (--shared clones, push URLs disabled). The optional token file was not written.
