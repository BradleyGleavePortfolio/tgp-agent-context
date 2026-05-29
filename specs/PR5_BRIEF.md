# PR-5 BUILD BRIEF — Kill Surface A; unify on Surface B + one API client

**Repo:** growth-project-mobile (React Native / Expo). **Pillar 1. Type: SUPERSEDE.**
**Branch:** `pr5/unify-package-surface` off latest default (now has the merged PR-1 checkout fix — pull latest first).

## CONTEXT — two parallel coach package surfaces exist (B1/B2 from the hunt)
The app currently has TWO coach-side package management surfaces and TWO API clients, with disagreeing vocabularies; only one is actually reachable:
- **Surface A (LIVE, reachable):** `CoachPackagesScreen.tsx` — reached via `CoachNavigator.tsx:406-417` and `SettingsScreen.tsx:235-238`. Uses `coachPaymentsApi.ts`.
- **Surface B (orphaned but wired, MORE COMPLETE):** `payments/CoachPackages*Screen.tsx` (the sectioned editor family). Uses `packagesApi.ts`. Reached via `SettingsScreen.tsx:520-523` (a second, different entry).

Per master plan decision #11 (supersede) and PR-5: **kill Surface A, unify everything on Surface B + one API client.** Surface B is the foundation the later Deliverables editor (PR-13) builds on.

## DO (verify all paths/line numbers against current code first — they shift)
1. **Make Surface B the single reachable coach package surface.** Repoint the live navigation entry (`CoachNavigator.tsx:406-417` and the `SettingsScreen.tsx:235-238` entry) to Surface B's screen(s). Remove the duplicate/second Surface B entry (`SettingsScreen.tsx:520-523`) so there is exactly ONE entry to ONE surface.
2. **Delete Surface A** (`CoachPackagesScreen.tsx` and any Surface-A-only child screens/components that become unreferenced). Remove dead imports/routes from the navigator. Do NOT delete anything still referenced by Surface B or elsewhere — grep references before deleting each file.
3. **Unify on ONE API client.** Surface B uses `packagesApi.ts`. Migrate any package-CRUD methods that only existed on `coachPaymentsApi.ts` over to `packagesApi.ts` (or confirm Surface B already covers them). HOWEVER: `coachPaymentsApi.ts` likely ALSO contains coach EARNINGS / PAYOUT / Stripe-Connect-onboarding methods that are NOT package CRUD. Those must NOT be lost — RE-HOME them to the appropriate existing client (the plan calls it `coachEarningsApi`; if that exists use it, else move them to the most appropriate existing earnings/billing client, or keep a slimmed `coachPaymentsApi` that ONLY holds earnings/payout if no better home exists). The goal: package CRUD lives in ONE client; earnings/payout survive intact. Inspect `coachPaymentsApi.ts` fully and categorize every method before moving anything.
4. Fix `BillingSection.tsx` and any other consumer that imported Surface A or the moved methods, so everything still compiles and the earnings/payout UI still works.
5. **B4 note (resolved by supersede):** Surface A's API (`packagesApi.ts` DTO whitelist ~304-353) silently dropped `trial_days`/`features`. Since we're unifying on Surface B, just ensure the unified create/update path does NOT silently drop fields the editor collects — if Surface B's editor collects a field, the client must send it. Don't add new fields, just don't drop existing ones.

## SCOPE GUARDRAILS
- This is a SUPERSEDE/unify PR. Do NOT add the Deliverables section (PR-13), do NOT add draft/publish UI (that's backend PR-6 + later), do NOT add new features. Just collapse two surfaces into one, preserve earnings/payout, keep everything compiling and behavior-equivalent for the surviving surface.
- Mobile only. No backend.
- Preserve all earnings/payout/Connect-onboarding functionality — losing it is a P0.

## VERIFICATION
1. tsc --noEmit + eslint pass.
2. jest passes; update/relocate tests that referenced Surface A or moved API methods.
3. Grep the whole repo after deletion: ZERO remaining references to the deleted Surface A screen/components/routes. ZERO broken imports.
4. Manually trace (in code) that: (a) the coach package management entry now lands on Surface B, (b) there's exactly one such entry, (c) earnings/payout screens still resolve their API methods.

## COMMIT / PR RULES (STRICT)
- `git -c user.name='Dynasia G' -c user.email='dynasia@trygrowthproject.com' commit ...`. NO Co-Authored-By / Generated trailers.
- Branch `pr5/unify-package-surface`, PR against default, report PR URL.
- PR description: what was deleted, the nav repoint, the full method-by-method categorization of coachPaymentsApi (package-CRUD → moved where; earnings/payout → re-homed where), and verification.

## DELIVERABLE
Report: (a) PR URL, (b) files deleted, (c) nav entries before→after, (d) per-method categorization + new home for each, (e) any consumer fixes, (f) test/grep results. Copy to /home/user/workspace/specs/PR5_BUILD_REPORT.md.
