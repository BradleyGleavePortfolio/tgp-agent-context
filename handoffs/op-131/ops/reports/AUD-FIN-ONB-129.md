# AUD-FIN-ONB-129 (AUD-FIN-129 instance, agent 129) — finish FW-ONB-128 "Not checked" list
Auditor: Claude Opus 5.5, read-only. Started 16:06 PDT 10-07. Status: DONE 16:31 PDT.
Scope = FW-ONB-128 "Not checked" list only (that report is not repeated). Production reads: unauthenticated GETs and aggregate
SELECTs (Supabase connector, project FITNESS TGP); no personal data printed; one side effect disclosed under B2.
Code: mobile main a1be6fb2, backend main c3324d4a (re-fetched 16:07, equal to wt/RO-*). Own throwaway worktree:
/home/user/workspace/wt/AUD-FIN-ONB-129-mobile (detached at a1be6fb2, never pushed).

## Proven B (top)
B1 (new, App Store + sign-up) — Sign in with Apple fails for every iPhone user. Story: a new client on iPhone taps the Apple button
on Create account (or Log in), approves the Apple sheet and is told "Sign in with Apple didn't go through. Please try again, or use
your email instead."; an App Review tester who does the same rejects the build (Guideline 2.1; 4.8 requires a working equivalent
when Google sign-in is offered).
- REPRODUCED (read-only GET 16:13 PDT): `GET https://rpyfdsgxxltzutgqeouk.supabase.co/auth/v1/authorize?provider=apple` -> 400
  `{"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}` (same call for google -> 302 to
  accounts.google.com). Production `GET /api/auth/signup-policy` -> `"providers":["email","google","apple"],"apple_signin_enabled":true`.
  SELECT: auth.identities has 0 apple and 0 google identities (5 email).
- CODE path: mobile `src/components/AppleSignInButton.tsx:34-44` shows the button on every iOS device (does not read the policy);
  `src/screens/auth/CreateAccountScreen.tsx:1452-1453` and `LoginScreen.tsx:580`; `src/utils/appleAuth.ts:239` POST /auth/apple;
  backend `src/auth/auth.controller.ts:224` -> `auth.service.ts:1229-1240` `supaClient.auth.signInWithIdToken({provider:'apple'})`;
  Supabase refuses id-token sign-in for a disabled provider -> 401 "Apple auth failed — Supabase rejected the token" -> mobile
  `authErrorMessage.ts:107-115`. Backend advertises Apple from APPLE_AUDIENCES alone (`auth.service.ts:950-957`), so the policy is true
  while Supabase is off. SoT A8.6 still lists "Apple Sign-in key" as an open owner to-do.
- Smallest fix (owner, Supabase dashboard, free, no code, no build): Authentication > Sign In / Providers > Apple: Enabled on, Client IDs
  = `com.growthproject.app` (the native id-token flow needs no secret key). Then one Apple sign-up on a device. Must be done before the
  23:00 build goes to review. Not doable by agents (production config).

B2 (new, sign-up/sign-in) — Continue with Google never returns to the app. Story: a new client taps "Continue with Google" on Create
account (or Log in), picks a Google account, and lands on a web page that says "Page not available ... The link may have expired or
the coach paused this page"; closing it leaves them signed out with no message, so Google sign-up and sign-in never complete.
- REPRODUCED (read-only GET + SELECT 16:13-16:25 PDT): `GET .../auth/v1/authorize?provider=google&redirect_to=tgp%3A%2F%2Fauth%2Fcallback`
  (the exact URL `src/utils/googleAuth.ts:113-121` builds; the 302's Location carried redirect_to unchanged, so the value was sent) -> 302 to Google; the OAuth state Supabase stored for it
  (`SELECT provider_type, referrer FROM auth.flow_state` for that one row) has `referrer = https://backend-spring-lake-3890.fly.dev`,
  i.e. Supabase refused `tgp://auth/callback` (not on its Redirect URLs allow-list) and fell back to the Site URL.
  `GET https://backend-spring-lake-3890.fly.dev/` -> 404 "Page not available / Coach landing page / This page isn't available. The
  link may have expired or the coach paused this page." auth.identities: 0 google identities ever.
- CODE path: `CreateAccountScreen.tsx:1428-1446` shows the Google button because production signup-policy says
  `google_signin_enabled: true`; `googleAuth.ts:124-131` waits for a redirect to `tgp://auth/callback` that never comes, the user
  closes the sheet, `result.type !== 'success'` -> "Sign-in was cancelled" -> treated as a cancel (nothing shown,
  `CreateAccountScreen.tsx:845-851`).
- Smallest fix (owner, Supabase dashboard, free, no code): Authentication > URL Configuration > Redirect URLs: add `tgp://auth/callback`
  (exact). Same list should hold `tgp://verified` and `tgp://reset-password` (see CODE-ONLY CO-2 below). Then one Google sign-up on a device.
- Side effect disclosed: this one GET made Supabase write one unused OAuth state row (auth.flow_state, provider google, no user, 16:13);
  it holds no personal data and expires unused. No other write was made; no further authorize calls were sent.

## Answers to the four "Not checked" items
1. Google / Apple sign-up for clients: both are offered (production signup-policy lists email, google, apple) and both are broken in
   Supabase config: B1 (Apple provider off) and B2 (Google return URL not allowed). Nobody has ever signed in with either (0 identities).
   Confirmation email text: not readable with the tools allowed (it lives in Supabase Auth > Emails; the connector has no auth-config
   read). Facts read: all 5 production auth users are email users and all 5 are confirmed; custom SMTP via Resend was saved 10-06 (SoT).
   The confirmation link's return address is CO-2 below.
2. Consultation chapters one by one: W1, P0, G1-G2, B1-B4, L1-L2, T1-T4, S1-S3b, N1-N5, P8, C1 (`src/lib/consultation/definitions.ts`)
   traced for copy and saves (PUT /me/onboarding per chapter, POST /me/onboarding/complete). One finding (CO-1). Unreachable today (item 3).
3. Production coaches with an active clinic program set: none (R-3). So every new client, invited or not, gets the lean flow; the
   consultation, its Roman consent boxes and its Roman tour are seen by nobody today.
4. Home's coachless slot and the code sheet after a code is entered: traced and rendered (R-4, R-5). Join works: the slot refetches and
   disappears, the welcome says who the coach is, then routes to the coach thread (Home stack "Messages"), the 1:1 coaching screen on
   iOS (MoreTab > ClientPackages) or the plan sheet on Android. Production has no featured-coach config, so a coachless client sees only
   "Enter a coach code" and no way to find a coach (R-4, owner action).

## REPRODUCED findings (read-only GET / SELECT, or throwaway jest render in wt/AUD-FIN-ONB-129-mobile, never pushed)
| id | grade | finding | evidence |
|---|---|---|---|
| R-1 | B1 | Sign in with Apple fails for everyone (see top) | GET /auth/v1/authorize?provider=apple -> 400 "provider is not enabled"; signup-policy apple_signin_enabled true; 0 apple identities |
| R-2 | B2 | Continue with Google never returns to the app (see top) | auth.flow_state referrer = Site URL for redirect_to tgp://auth/callback; GET / -> 404 "Page not available" |
| R-3 | fact (decides item 2) | No coach has a clinic program set: ClinicProgramSet 0 rows (0 active, 0 usable); ClientOnboardingIntake 0 rows; live clients 1 (0 coachless), coaches/owners 2 | aggregate SELECT (counts only), this audit |
| R-4 | U (owner config) | No FeaturedCoachConfig row, so coachless Home = default title "Enter coach code for coaching and programs" + "Enter a coach code" only: no featured coach, no offer, no Roman card (day-1 scope A6.1 names "featured coach") | SELECT (0 rows), this audit + backend `featured-coach.service.ts:142-155` default + jest render PASS 16:29: banner shows only that title and "Enter a coach code"; no offer, no Use code, no Roman card |
| R-5 | ok | After a code: slot refetches GET /coachless/home and hides; welcome copy per state; Message -> navigate('Messages'); iOS Choose a plan -> navigate('MoreTab',{screen:'ClientPackages'}); Android -> plan sheet | jest render PASS 16:29 (2/2): after Join GET /coachless/home is called again and the banner is gone; welcome "Alex Rivera is now your coach." + "Alex Rivera has no plan to buy in the app yet. Send a message to get started." -> navigate calls `[["Messages"]]`; coach with plans -> "Next, choose a plan from Alex Rivera." -> iOS `[["MoreTab",{"screen":"ClientPackages"}]]`, Android plan sheet, no navigate. Routes exist: `ClientNavigator.tsx:422` (Home stack Messages), `:578` ClientPackages, `:760` MoreTab |

## CODE-ONLY findings (traced; file:line, handler, API path)
| id | grade | finding | trace | smallest fix |
|---|---|---|---|---|
| CO-1 | U (becomes a B the day a clinic set is seeded) | Consultation N2 says "So nothing suggested is something you avoid." No suggestion filtering exists (ALLERGY-128; CF-ALLERGY-128 is building recipe filtering on declared allergens only), so this is a false food-safety promise | mobile `src/lib/consultation/definitions.ts:440-441` (N2 why); answers saved by PUT /me/onboarding -> backend `src/onboarding/consultation-answers.ts:419` -> `UserProfile.dietary_restrictions` slugs | why line -> "So your coach knows what you avoid." (one line + its test) |
| CO-2 | U, likely B for reset (cannot prove read-only) | The other two Supabase return addresses are probably also off the allow-list (B2 shows `tgp://` entries are not accepted): confirmation link `emailRedirectTo = SUPABASE_REDIRECT_URL or 'tgp://verified'`, password reset `redirectTo 'tgp://reset-password'`. If refused, Supabase confirms the email and then shows the Site URL 404 "The link may have expired" page (false, after a success); a reset link never reaches the app, so the new password cannot be set | backend `src/auth/auth.service.ts:567-573` (POST /auth/register signUp), `:1493-1499` (POST /auth/resend-verification), `:1511` forgotPassword `resetPasswordForEmail(... redirectTo:'tgp://reset-password')` (POST /auth/forgot-password); SUPABASE_REDIRECT_URL is not in `.github/fly-env-desired-state.json` (value on Fly unknown) | owner adds `tgp://verified` and `tgp://reset-password` to the same Redirect URLs list (harmless if present); optional: set SUPABASE_REDIRECT_URL to `https://backend-spring-lake-3890.fly.dev/verified` (the HUNT-01-124 landing page, live: GET /verified -> "Email confirmed") |
| CO-3 | C | Apple button ignores the policy (`AppleSignInButton.tsx:34-44` only checks the device); backend advertises google/apple from env alone (`auth.service.ts:949-957`), not from Supabase's provider state, so the policy cannot warn the app | as stated | none now (owner config is the fix) |
| CO-4 | C | Consultation answer options in first person ("I haven't followed a program", "I've trained on and off", `definitions.ts:253-254`); they are the client's own answers, unreachable today | as stated | later DES pass |

## C one-liners
- C (edge, deferred to 10k clients): `patchUserCache` does not notify mounted `useCurrentUser` hooks (`lib/userCache.ts:178-195`,
  `hooks/useCurrentUser.ts:65-112`), so already-mounted screens keep "no coach" until remount; the Home slot itself is correct
  because it follows the server refetch.
- C: invite grants that need the onboarding agreement can never activate (no mobile path grants `onboarding.agreement`), but
  FEATURE_CONTRACTS_ENABLED is unset in production so every grant activates at once (`invite-grant.service.ts:204-221`); matters only if
  contracts are switched on.

## Cross-area (one line each)
- FW-ROMAN: with no consultation reachable (R-3), the Roman/memory consent (owner 10:18: memory rides in box 2) is never asked at
  onboarding; check that the first Roman chat asks it and grants client-ai-v5 now that FEATURE_ROMAN_MEMORY is on.
- FW-ACCOUNT: CO-2 reset-password return address (same owner screen as B2).

Throwaway test: `/home/user/workspace/wt/AUD-FIN-ONB-129-mobile/src/components/coachless/__tests__/AUDFINONB129.throwaway.test.tsx`
(detached worktree at a1be6fb2, never committed or pushed; run through ops/heavy.sh, PASS 2/2 in 6.7 s).

## Proposed fix jobs (file-disjoint from CLIENTFIX-128 claims and from every open PR on the board at 16:06)
| job | who / tier | exact change | notes |
|---|---|---|---|
| OWNER-SUPA-AUTH-129 (B1 + B2 + CO-2) | owner, Supabase dashboard, no code, free | Auth > Providers > Apple: Enabled, Client IDs `com.growthproject.app`. Auth > URL Configuration > Redirect URLs: add `tgp://auth/callback`, `tgp://verified`, `tgp://reset-password` (exact). | ~10 minutes. Then on the iOS build: one Apple sign-up, one Google sign-up, one password reset. Must be before the 23:00 build goes to App Review. |
| OWNER-FEATURED-129 (R-4) | owner, in the app (owner account, Featured coach editor `screens/coach/featured/FeaturedCoachEditorScreen.tsx`, PUT /admin/featured-coach) | pick the featured coach, the code, the offer line and package | Without it a coachless client sees only "Enter a coach code" (A6.1 day-1 scope names the featured coach). |
| ONB-N2-COPY-129 (CO-1) | GPT-6.1 Sol, T1 mobile, ~15 lines | `src/lib/consultation/definitions.ts:441` why -> "So your coach knows what you avoid."; one assertion in a new `src/lib/consultation/__tests__/n2Copy.test.ts` | Not urgent while R-3 holds (nobody reaches it); launch before any clinic set is seeded. Tell CF-ALLERGY-128 if its PR touches N2. |

## Not fixed (needs operator / owner), each with a recommended default
1. B1 + B2 (+ CO-2): owner dashboard change above. Default: owner does it before the 23:00 cut. It is server-side config, so it also
   fixes any build already in review; no code change or new build is needed, and no code fallback is recommended.
2. Featured coach config (R-4). Default: owner sets it tonight (owner account, in the app).
3. Consultation reachability (R-3): no clinic program set exists, so the consultation is dark for everyone. Default: leave dark for
   launch (lean flow is the onboarding; matches FW-ONB-128 D1), seed only after CO-1 is fixed.

## HANDOFF
Done. All four FW-ONB-128 "Not checked" items are answered above. New Bs: B1 (Apple off in Supabase), B2 (Google return URL refused),
both owner dashboard fixes, both proven by read-only GET/SELECT. Us: R-4 (no featured coach), CO-1 (N2 food promise, latent), CO-2
(verify/reset return URLs, likely; cannot prove read-only). Nothing built, no PRs, no comments, no production writes except the one
disclosed OAuth state row. A fresh agent: after the owner changes the dashboard, re-run the two GETs in B1/B2 (Apple authorize should
302 to appleid.apple.com; a new flow_state row for google should show referrer `tgp://auth/callback`) and do one device sign-up each;
launch ONB-N2-COPY-129 when a slot is free. Throwaway worktree wt/AUD-FIN-ONB-129-mobile may be removed by the operator.
