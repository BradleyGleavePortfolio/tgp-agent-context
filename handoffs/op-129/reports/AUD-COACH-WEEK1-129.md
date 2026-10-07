# AUD-COACH-WEEK1-129: the coach's first week (auditor, agent 129, read-only)

Status: DONE 16:30 PDT 10-07 (cut short by the operator's 16:24 credit order). Method: FW-AUD-128. No code pushed, no PRs, no comments.
Code: mobile main e634d19e, backend main fd190078 (none of the cited backend files changed since c3324d4a). Production was probed only
with unauthenticated GETs. Reproductions are two throwaway jest tests in my own detached worktree
/home/user/workspace/wt/AUD-COACH-WEEK1-129-mobile (uncommitted, never pushed).
Open PRs checked for overlap (local git diff of their head branches): m#514 touches src/services/api.ts (so the B1 job avoids that
file), and m#513 touches AIBudgetTutorialModal (U2 job avoids it). No open PR fixes any finding below.

## (1) B list

### REPRODUCED
| id | one-sentence story | where (file:line, handler, API path) | proof | smallest fix |
|---|---|---|---|---|
| B1 | A new coach, or the App Store reviewer on the review coach account, opens Settings > Subscription > Billing & access and the whole app is replaced by "Something went wrong". | Backend GET /coach/billing/status, MobileCoachBillingController.getStatus (src/billing/mobile-coach-billing.controller.ts:43-64), returns `{status, plan_tier, current_period_end, cancel_at_period_end, trial_end}` (`status: 'unprovisioned'` for every coach with no CoachSubscription row). Mobile reads `state` (src/services/api.ts:1096-1103, :1145, no mapping); `STATE_COPY[s.state]` is undefined and `copy.tone` throws (src/screens/coach/CoachBillingScreen.tsx:224-231). The only error boundary is app-wide (App.tsx:249). The row shows for every coach (src/screens/coach/settings/BillingSection.tsx:39-50). | Jest render `src/screens/coach/__tests__/AUDCOACHWEEK1129.billing.test.tsx`, 3/3 pass: both real backend bodies (`unprovisioned`, `active`) render "Something went wrong" in the real ErrorBoundary; the body the screen assumes (`{state:'none'}`) renders "No subscription". Existing tests mock `{state}` (CoachBillingScreenAndroidPolicy.test.tsx:57), so CI never saw it. | In CoachBillingScreen load(), normalize the body (`status` -> `state`; `unprovisioned`/unknown -> `none`; `current_period_end` -> `currentPeriodEnd`; `trial_end` -> `trialEndsAt`) and guard `STATE_COPY[s.state] ?? STATE_COPY.none`. Same PR: the `none` line becomes "Coaching clients needs no coach subscription." (owner 10-06 19:23 removed coach tiers). |

### CODE-ONLY
| id | one-sentence story | where (file:line, handler, API path) | smallest fix |
|---|---|---|---|
| B2 | A coach taps Roman in Settings ("Ask for a brief, a client read, or the next step."), asks how a client's week went, and gets an answer built from no client data at all: a refusal at best, invented numbers at worst. | Entry copy src/screens/coach/SettingsScreen.tsx:663-670 (route RomanChat, surface "coach", CoachNavigator.tsx:536-539). Roman turn handler RomanService (src/roman/roman.service.ts:1019): `grounded = session.surface === 'client' && caller.role === 'student'`; tools are student-only (:1604); the coach framing (src/roman/roman.prompts.ts:127-128) has no client data and no "never invent a number" rule (that rule exists only in the client tools contract, :105-111). | Sub-label -> "Ask about programming, nutrition or running your practice."; one line in `surfaceFraming('coach')`: "You cannot see any client's data here. If asked about a client, say so and point the coach to that client's page." The operator may downgrade to U; it is graded B as a false capability claim. |

## (2) U list

### REPRODUCED
| id | finding | where | proof | fix |
|---|---|---|---|---|
| U1 | Package checkout links do not work. The app never mints a share token, so "Share link" never appears; if a token exists, the shared link is a 404. | No mobile call to POST /v1/coach/packages/:id/share-link (backend share-link.controller.ts:51); button gated on `shareToken` (CoachPackageEditScreen.tsx:906); URL built as https://app.trygrowthproject.com/p/<token> (src/utils/packageShare.ts:9-13). The backend's own link is `${STOREFRONT_BASE_URL}/join/<token>` (share-link.service.ts:236-251), which the app ignores; the code's fallback host joingrowthproject.com does not resolve. | Jest `src/__tests__/AUDCOACHWEEK1129.package.test.tsx` R2a (a package as the backend returns it after an in-app create shows no Share link) and R2b (with a token the shared url is `https://app.trygrowthproject.com/p/tok_123`). GET https://app.trygrowthproject.com/p/abcDEF123xyz -> 404 JSON "Cannot GET /p/abcDEF123xyz" (16:10 PDT); the live apple-app-site-association claims only /join/*, /invite/*, /billing/update-card. | No change before launch, because the button is already hidden and coaches sell through invite codes plus in-app plans. Making links work is NEW (polish 5). |
| U3 | The archive alert names a control that does not exist: "To stop new sales while keeping existing clients, use Take off sale instead." The button reads "Unpublish package". | CoachPackageEditScreen.tsx:502 vs :869-882 | Same jest file, R3 (alert body captured; no "Take off sale" text on screen; "Unpublish package" present). | "...use Unpublish package instead." |

### CODE-ONLY
| id | finding | where | fix |
|---|---|---|---|
| U2 | A coach never sees the AI-credit balance or any warning. Story: a coach whose clients chat with Roman a lot learns the shared pool is empty only when Roman and Ask AI stop. | AIBudgetMount (meter 60%, tutorial 80%, banner 95%, pause 100%) is mounted only in legacy CoachHomeScreen (CoachHomeScreen.tsx:249), route "Dashboard" (CoachNavigator.tsx:390), which nothing navigates to; the first coach tab is ClientsStack (CoachNavigator.tsx:689). The backend sends no AI-budget push (nothing in src/ai-credits). Ask AI warns only after the fact ("AI credits for this month are used up", aiBuilderCopy.ts:40-45). m#513's playbook-cost line is in AIBudgetTutorialModal, so it never shows either. | One calm "AI credits" row in Settings > Payments: percent left plus reset date from useAIBudget (GET budget), text only on store builds (credit packs stay hidden). |
| U4 | Archiving a package that has clients tells the coach to do something the app cannot do: 409 "End their access and cancel any subscriptions before archiving." | Backend PackagesService.archive, DELETE /v1/coach/packages/:id (src/packages/packages.service.ts:706-713); shown by CoachPackageEditScreen.tsx:516-521 via errorMessage. | Mobile maps PACKAGE_HAS_ACTIVE_SUBSCRIBERS to: "Clients still have this package. Unpublish it to stop new sales; contact support to end a client's plan." The real fix (coach end/cancel) is the routed CF-COACH-PAY-BE-128 / COACH-PAY-M-129. |

## Known and already routed (not re-reported)
- Coach refunds, pause, cancel and payments per client: none in the app (ClientDetailScreen has no payments section; Money lists
  charges with no client filter). Routed: CF-COACH-PAY-BE-128 + COACH-PAY-M-129 (owner 14:58).
- Client refund line: m#517 merged. Payment-email replies: b#857 merged (backend main fd190078).

## C one-liners
- Settings has three invite rows (Invite Codes, Bulk invite clients, Invites & email): rule-5 polish (polish 7).
- The zero-clients share text reads "Join me on Growth Project. Use code X" with no link (InviteCode rows carry no deep_link_url,
  src/ui/empty-states/EmptyStateNoClients.tsx:118-121): C.
- Verified fine: Stripe Connect return and refresh pages (GET /api/v1/connect/onboarding/return|refresh -> 302 to tgp://...); checkout
  refuses while the coach cannot take charges (checkout.service.ts:299, subscription-checkout.service.ts:282); pricing lock and its
  alert (packages.service.ts:589-646); check-in "Mark reviewed" for the coach of record (check-ins.service.ts:94-115); Command Center
  mock data off (commandCenterApi.ts:25); coach sign-up role choice on (auth.service.ts:85, default true); credit packs hidden in store
  builds (purchaseSurfaces.ts:87-95).

## (3) Dead-button table
| Screen | Control | Result |
|---|---|---|
| Settings | Billing & access | crashes the whole app (B1) |
| Settings | Roman "Ask for a brief, a client read, or the next step" | opens chat; the claim is false (B2) |
| Package editor | Share link | never shown (no token minted); with a token it shares a 404 link (U1) |
| Package editor | Archive package (with clients) | 409 asks for an action the app lacks (U4); alert names "Take off sale" (U3) |
| Package editor | Save, Make live, Unpublish package, Preview as buyer, View subscribers | work |
| Payouts | Continue with Stripe, Open Stripe dashboard | work |
| Clients (zero clients) | Share code, Copy code | work; text has no link (C) |

## (4) First-week polish (ranked)
1. FIX: Billing & access opens, and says coaching needs no subscription (B1).
2. FIX: Coach Roman states what it can do, and its prompt forbids claims about clients (B2).
3. FIX: one calm AI-credits line (percent left, reset date) in Settings > Payments (U2).
4. FIX: the archive copy names the real control and a real next step (U3, U4).
5. NEW: working package checkout links: mint through POST :id/share-link, share the backend's share_url, set STOREFRONT_BASE_URL to a
   live web host and claim it in the AASA. Recommended default: after the iOS submission (invite codes plus in-app plans work today).
6. NEW (already routed): payments per client, refund, pause, cancel (CF-COACH-PAY-BE-128 / COACH-PAY-M-129).
7. FIX: one "Invite clients" row holding Codes, Bulk invite and Email delivery (rule 5). Recommended default: after the 23:00 cut.

## (5) Proposed fix jobs (file-disjoint from each other and from open PRs; each under 400 lines)
| job | model / tier | files | lines | fixes |
|---|---|---|---|---|
| CF-COACH-BILLING-129 | Claude Opus 5.5 (money surface), T2 mobile | src/screens/coach/CoachBillingScreen.tsx; new src/screens/coach/__tests__/CoachBillingScreen.backendShape.test.tsx (failing first with the real backend bodies); src/screens/coach/README.md row | about 90 | B1 |
| CF-ROMAN-COACH-SURFACE-129 | Claude Opus 5.5, T3 backend prompt | src/roman/roman.prompts.ts (surfaceFraming 'coach' line); its existing prompt spec (add one case) | about 25 | B2 (backend half) |
| CF-COACH-SETTINGS-AI-129 | Claude Opus 5.5 (AI pool money + Roman copy), T3 mobile | src/screens/coach/SettingsScreen.tsx (Roman sub-label; "AI credits" row in Payments via useAIBudget); new src/screens/coach/__tests__/SettingsScreen.aiCredits.test.tsx; src/screens/coach/README.md row only if CF-COACH-BILLING-129 has merged (else skip README) | about 150 | B2 (mobile half), U2 |
| CF-PACKAGE-ARCHIVE-COPY-129 | GPT-6.1 Sol, T1 mobile | src/screens/coach/payments/CoachPackageEditScreen.tsx (alert copy :502; map PACKAGE_HAS_ACTIVE_SUBSCRIBERS in the archive catch); one new test file | about 40 | U3, U4 |

## Not fixed (needs operator)
- Launch the four jobs above (B1 first: the reviewer can reach it on the review coach account tonight).
- Owner decision for polish 5 (default: after submission) and polish 7 (default: after the 23:00 cut).

## Scope traced
Coach Settings rows (Payments, Subscription, Roman, invites); CoachBillingScreen; packages create/edit/publish/unpublish/archive and the
pricing lock (backend update/archive); checkout links (mobile packageShare, backend share-link and storefront, live AASA); Stripe
Connect screen and return pages; checkout Connect guard; AI budget surfaces and Ask AI credit copy; coach Roman surface (prompt,
grounding, tools); check-in review; invite-code lists and the zero-clients share; Command Center mock flag; role choice flag.
Not checked (time): coach messaging screens, meal plan assignment from client detail (NUTR-AUD-128 covered the plans), AI builder
assign to client, booking setup, broadcasts.

## HANDOFF
- Report final. No branch, no commit, no PR, no comment. Throwaway tests (keep uncommitted, never push):
  /home/user/workspace/wt/AUD-COACH-WEEK1-129-mobile/src/screens/coach/__tests__/AUDCOACHWEEK1129.billing.test.tsx and
  .../src/__tests__/AUDCOACHWEEK1129.package.test.tsx (re-run: `cd <worktree> && /home/user/workspace/ops/heavy.sh npx jest <file>`).
  A fix builder can copy the billing test's two backend bodies as its failing-first case.
- A fresh auditor can continue with the "Not checked" list above.
