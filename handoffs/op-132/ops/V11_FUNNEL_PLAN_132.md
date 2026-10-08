# V11 FUNNEL PLAN (V11-FUNNEL-PLAN-132, agent 132 planner, read-only), 2026-10-08 14:00 PDT

Pillar: the coach's web landing page (customizable: VSL video, images), info collection and TGP account creation, guest checkout
(Stripe), automatic assignment of the buyer to the coach, then "download TGP" with a QR code on desktop.
Code read at backend main cd0f90ed, re-checked at 63441690 (b#887 AUDIT-FIX-132 merged; it changed only package.json and the lock
file), and at mobile main edf36a88, re-checked at a3a1c18e (m#572 CLINIC-APK and m#574 TEAMPROFILE merged). All reads used
`git show origin/main`.
Labels: "from the code" = read at those heads; "seen live" = a public GET to production at 13:46 PDT (no writes, no login).
Applies addendum A-E (owner 13:45): PART A = the owner's idea exactly as stated; PART B = my extra ideas, pitched separately.

## 0. One-screen summary (plain words)

**The owner's flow:** landing page -> collect info / TGP account creation -> checkout -> download TGP (QR code on desktop). The
buyer is assigned to the coach automatically, with the package they bought.

**What exists (from the code):**
- Landing pages: the backend part is finished and live, with no switch: a builder API, a public page, a lead form, CRM sync, view
  analytics and custom domains (src/landing-pages). But the app has **no screen to make a page**, and there is **no video (VSL) section**.
- Payment: Stripe checkout inside the app works, but only for a client who is already linked to the coach (a stranger gets
  PACKAGE_COACH_NOT_CONNECTED). The backend for web guest checkout exists (src/storefront), but **its card page on the web was never
  built**. The code expects a "Next.js storefront" at joingrowthproject.com, and no repo or DNS exists for it.
- Automatic assignment: built inside guest checkout. When payment succeeds, the backend creates the account, links the coach, delivers the
  package contents and tells the coach. Nobody can reach it, because nobody can pay on the web.
- Download: /download/ios and /download/android say "not on the App Store / Google Play yet" (seen live). No web page has a QR code.

**What is broken today (seen live):**
1. The Buy button on a landing page sends the visitor to `app.trygrowthproject.com/v1/packages/public/join/<token>`, which returns
   404 "Cannot GET".
2. The package share link (Settings > Packages > package > Share) is `app.trygrowthproject.com/p/<token>`. It shows a 404 on a
   computer and on an iPhone. The iPhone app-link list (AASA) covers only /join, /invite and /billing/update-card.
3. The welcome email's "Activate your account" link has no return address in the code. Supabase then falls back to the web root,
   which shows "page isn't available" (the owner saw the same fallback on 10-06 12:45).
4. A stranger cannot buy inside the app either: the in-app checkout refuses anyone who is not already linked to the coach.

**PART A (the owner's idea, 10 PRs, 4 waves, all behind 2 new switches that stay off until both lenses and the owner say yes):**
GATES (switch and web addresses) -> PAGE (VSL + photos, the fixed flow, doctrine styling, no dead button) and EDITOR-M (the coach's
"Your page" screen in the app) -> START (step 2: name, email, password, 6-digit email code = TGP account made before payment),
WELCOME (step 4: "You're in", download buttons, QR code on a computer, a /get page that sends each phone to the right store),
SHARE (package links work on the web and on iPhone) -> PAY (hosted Stripe checkout for a verified buyer from a published page) and
ASSIGN (payment success links the coach and the package in one step: idempotent and audited, with a backstop when Stripe's webhook
is lost) and MEDIA-M (video and photo pickers) -> E2E (the whole flow tested in CI). About 5,300 lines in total, every PR under 800.

**Top decisions (section A8):** D-F1 Stripe-hosted checkout (default) instead of building our own card page. D-F2 the account at
step 2 is email + password + a 6-digit email code (default; the app's sign-in stays the same). D-F3 the VSL comes from a YouTube or
Vimeo link (default, free); uploads use the coach media library already on Mux (usage may cost, so it needs the owner's yes).
D-F4 the address is app.trygrowthproject.com/c/<handle> (default, free). D-F7: the funnel goes live only when the App Store and Google
Play listings are live. Without them, step 4 would be a new dead end.

**PART B (optional, pitched separately):** Roman drafts the coach's page; Roman answers buyer questions on the page; activation
analytics (paid -> first workout); one calm follow-up email for an unfinished checkout; Day 1 on the web; team routing on the page;
verified results with client consent; a "runs on TGP" referral footer.

---

# PART A: the owner's idea, exactly as stated

Owner 13:36 (verbatim parts): "The webpage - guest checkout - auto assingment flow is bulletproof and functional / The landing page
has customization optionality (VSL pages, images placed in) - but it should always follow a basic flow - landing page -> Collect info
/ TGP Account Creation -> checkout -> download TGP with qr code to scan in case their on desktop". A08 (roadmap/specs/A08-lead-funnel.md)
adds: auto-assign must not double-assign on retry; lead-created, coach-assigned and package-assigned emit audit events; rate-limit
lead submission; an end-to-end test in CI.

## A1. Inventory against the goal (code wins over specs; A08 says "MOSTLY built", which is true only for the backend pieces)

| Piece of the flow | State | Where (backend main cd0f90ed / mobile main edf36a88) | Production switch |
|---|---|---|---|
| Landing page builder API (list/create/edit/publish/unpublish/delete, analytics, leads, max 6 pages) | built and on, **no UI** | src/landing-pages/landing-pages.controller.ts (`v1/coach/landing-pages`, @Roles coach/owner), landing-pages.service.ts | none (always on) |
| Public page render (server HTML), view beacon, lead form (3/min/IP + 100/day/page), CRM sync (HubSpot, Mailchimp, ActiveCampaign, GoHighLevel, webhook) | built and on | landing-pages.public.controller.ts (`/p/:coachSlug/:pageSlug`, `/leads`, `/view`), landing-pages.html.ts, lead-rate-limiter.service.ts, crm/* | none |
| Custom domains (Host routing, DNS verify) | built and on (needs LANDING_CNAME_TARGET; no coach UI) | custom-domain.controller.ts, custom-domain.service.ts, dns-verifier.ts | none |
| Section kinds: hero (image), before_after, testimonials, pricing, faq, lead_form (name/email/phone/goal), offer_stack, guarantee, problem_solution, mechanism, trust | built | section-schemas.ts:213-225 | none |
| **VSL video section; free image/gallery section** | **not built** | no `video` kind in section-schemas.ts | n/a |
| Landing page Buy button | **built but broken** (seen live: 404) | landing-pages.public.service.ts:126-141 builds `STOREFRONT_BASE_URL or app host` + `/v1/packages/public/join/<token>?lp=`; that path exists only under /api | STOREFRONT_BASE_URL not in the manifest; code default https://joingrowthproject.com has no DNS |
| Web guest checkout API (PaymentIntent, or a subscription with default_incomplete for recurring; resume, recovery link, 7-day cookie, IP limits, idempotency, PII scrub, reconciliation) | built and on (API only) | src/storefront/storefront-public.controller.ts (`/api/v1/packages/public/join/:token[/checkout...]`), guest-checkout.service.ts (2,179 lines) | none |
| **Web card page for guest checkout (Stripe.js)** | **not built** (the code comments say "storefront SSR layer", Next.js) | none in any repo (`gh repo list`: no storefront repo) | n/a |
| Info collection before payment | partly built: lead form = CRM lead only, no account | dto/lead-submit.dto.ts, CoachLandingLead | none |
| **TGP account creation before checkout (web)** | **not built**. Guest checkout creates the account only after payment (Supabase createUser, email unconfirmed, invite link) | guest-checkout.service.ts:1395-1440, :1985-2010 | n/a |
| Auto-assign the buyer to the coach + deliver package contents + coach push + welcome email (guest path) | built, unreachable | guest-checkout.service.ts:1500-1760 (User upsert role student coach_id, ClientPurchase, PurchaseFanoutService.onPurchaseEntitled, coach notification, Resend welcome email) | RESEND_API_KEY present (SoT 3393) |
| Same for the in-app checkout (Stripe Checkout Session, Connect destination, subscription; a pending ClientPurchase is written when the session is created) | built and on, **only for clients already linked to the coach** | src/checkout/checkout.service.ts:300-380, :438, :656, subscription-plan.ts:130-137 (PACKAGE_COACH_NOT_CONNECTED), checkout-webhook-handler.service.ts:643, :1114, :1408 (fan-out) | FEATURE_DUNNING_V2=true; BILLING_ENFORCEMENT unset |
| Backstop when Stripe's webhook is lost | built for web guest PaymentIntents only; **none for Checkout Sessions** | src/storefront/lost-webhook-reconcile.service.ts (kill switch CHECKOUT_RECONCILE_DISABLED) | not in the manifest (unset = runs) |
| Thank-you page (after payment) | built; **no download buttons, no QR**; looked up by Stripe Checkout `session_id` on ClientPurchase | src/storefront/thank-you.service.ts:59-60, thank-you.html.ts:42-52 | none |
| Welcome email | built; its "Activate your account" invite link has no redirectTo (lands on the web root "not available" page; SoT 7978); gold #C9A84C buttons, radius 8, weight 600 (against the doctrine) | guest-checkout.service.ts:2050-2096 | n/a |
| Download pages | built (placeholders: "not on the App Store / Google Play yet", seen live) | src/public-pages/public-pages.controller.ts:43-55; APP_STORE_URL / PLAY_STORE_URL point at them (.github/workflows/fly-secrets-set.yml:142-143) | env, not the manifest |
| **Device-aware download link + QR code on web** | **not built** (no QR library in the backend; mobile has one: src/lib/qrMatrix.ts, src/vendor/toqr) | n/a | n/a |
| Universal links / app links | built for /join/*, /invite/*, /billing/update-card (AASA seen live); Android filter also claims /p | src/invite-landing/well-known.controller.ts; mobile app.json intentFilters | APPLE_TEAM_ID set (AASA live) |
| Package share link /p/<token> | **built but broken on web and iPhone** (seen live 404; not in AASA) | mobile src/utils/packageShare.ts:9-13, CoachPackageEditScreen.tsx:548-566; backend share-link.service.ts:241-248 builds `${STOREFRONT_BASE_URL}/join/<token>` (another dead or wrong address) | n/a |
| In-app package page from a share link (PackageCheckout) | built (client More tab; deep link only; only connected clients can buy) | mobile RootNavigator.tsx:263-268, PackageCheckoutScreen.tsx | n/a |
| First sign-in after an outside purchase: coach sharing sentence, recorded on the tap (shown whenever the client has a coach and no sharing decision yet) | built | mobile src/lib/coachSharingFirstSignIn.ts, LeanQ1GoalScreen.tsx:44 (B-SHARE-GUEST-127); backend src/consent/coach-sharing-first-sign-in.service.ts:60-73 | n/a |
| Invite codes with QR in the app (free/prepaid package codes) | built and on | mobile InviteCodes -> CoachCodesEntry, components/coach/CodeQr.tsx | FEATURE_COACH_CODE_TOOLS=true |
| Coach setup checklist (first package, get paid, invite share card with QR) | built | mobile src/components/coach/setup/* (CoachSetupScreen) | n/a |

Not counted (no production write, no customer record): how many published landing pages exist. The /p -> /c redirect in PAGE keeps
any existing link working, so the count does not change the plan.

## A2. The flow after v1.1 (what the buyer, the coach and the client see)

1. **Landing page** (web) `https://app.trygrowthproject.com/c/<coach-handle>` (or `/c/<handle>/<page>`). It shows the coach's hero
   photo and headline, the VSL video (tap to play, poster image, never autoplays with sound), photos, offer, packages, FAQ and
   testimonials the coach wrote. Packages are quiet rows. Picking one shows the screen's ONE forest button: "Start".
2. **Collect info / TGP account** (web) `/c/<handle>/start?package=<id>`: first name, email, password (a new account), phone or goal only
   if the coach turned them on. The page shows one plain sentence about what the coach will see in the app, plus terms and privacy
   links -> "Continue". A 6-digit code arrives by email -> "Verify". An existing TGP email is asked for its password instead (or the
   code). The account now exists and the email is proven. If the account is already linked to a different coach, nothing is charged
   (D-F5).
3. **Checkout** (Stripe-hosted page; Apple Pay / Google Pay / Link if the owner turns them on): email prefilled, renewing or one-time as
   the package says. When payment succeeds, the coach is linked, the package contents are delivered and the coach gets a push, all in one
   step that is safe to run twice.
4. **Download TGP** `/welcome?session_id=...`: "You're in. <Coach> has your plan." On a phone: one button for this phone's store.
   On a computer: a QR code ("Scan with your phone's camera") that opens `/get`, which sends iPhone to the App Store, Android to the
   Android download (D-F7), and anything else to both links. Below: "Sign in with j***@gmail.com and the password you chose."
5. **App** (exists): sign in -> already linked to the coach, the plan is in place -> the first onboarding screen shows the coach sharing
   sentence (B-SHARE-GUEST-127) -> Day 1. No invite code, no activation step.

## A3. Pathway placement (addendum A; Rule 6: no pathway or function cut)

| Who | Piece | Where it lives | Taps from home | What it replaces |
|---|---|---|---|---|
| Coach | "Your page" (create, edit, publish, link, Share, QR, preview) | Settings tab > "Your page" (new row above Packages) > CoachPage screen; also a row "Publish your page" in the existing CoachSetup checklist | 2 (Settings tab, row) | Nothing (today there is no entry; the backend API has no screen) |
| Coach | VSL and photos | CoachPage > Video / Photos rows > the coach media library picker or a YouTube/Vimeo link field | 3 | Hero image URL only (backend) |
| Coach | Package share link | unchanged: Settings > Packages > package > "Share package link" | 3 + share | Same button; its link now works on the web and on iPhone |
| Coach | New client from the page | coach push from ASSIGN ("New client from your page") + the Clients list (the client appears linked) | 0 | Manual invite code for web buyers |
| Buyer | Steps 1-4 | web: /c/<handle> -> /c/<handle>/start -> code -> Stripe -> /welcome (desktop QR -> /get) | 5 taps landing to download (Start, Continue, Verify, Pay, Download) | Today: Buy -> 404 dead end |
| Client | First open | Login (email + password) -> Lean or consultation onboarding with the coach sharing sentence -> Day 1 | same as today's in-app join, minus code entry | Invite-code paste or the stuck "Activate" email |

Routes and actions, before -> after (every one keeps a working destination):

| Route / button | Before | After |
|---|---|---|
| `GET /p/:coachSlug/:pageSlug` | renders the page | 301 to `/c/:coachSlug/:pageSlug` (renders the same page); Android stops opening the app for landing pages, because /c is not an app link |
| `GET /p/:coachSlug/:pageSlug/checkout?tier=` (Buy) | 302 to a 404 | 302 to `/c/.../start?package=` when FEATURE_COACH_FUNNEL is on; when off, the button reads "Join in the app" and opens `/signup` (exists) |
| `POST /p/.../leads`, `POST /p/.../view`, custom-domain `/`, `/checkout`, `/leads`, `/view` | work | unchanged (same handlers also mounted under /c) |
| `GET /p/:shareToken` (web) | 404 | package page with "Start" (same flow); iPhone opens the app when installed (AASA adds /p/* and excludes /p/*/*) |
| `/api/v1/packages/public/join/:token` + checkout/resume/recovery + thank-you | API live, no web page uses it | unchanged (kept for the in-app share view and old links) |
| Package share button (CoachPackageEdit) | link 404s on web/iPhone | same button, working link |
| `/join/:code`, `/invite/:code`, `/download/ios`, `/download/android`, `/signup`, `/verified` | work | unchanged; new `/get` and `/welcome` |
| Welcome email "Activate your account" | lands on "not available" | funnel buyers: no activation link (they already chose a password); old guest path: redirectTo `/verified` (exists) |

## A4. Design (addendum B): rules every PR names

Sources: mobile docs/QUIET_LUXURY_DOCTRINE.md, src/theme/README.md, docs/HAPTICS.md, docs/SKELETON_LOADERS.md, docs/dark-mode.md,
docs/share-card.md, ENGINEERING_RULES.md, and the screen redo rules (_COMMON_131 lines 280-310). Owner: "LUXURIOUS, SIMPLE, MENTALLY
DELOADING, AND CALM!". Web pages follow the same doctrine.
- Doctrine 1 + 5 (web and app): bone #F5EFE4 page, ink #1A1A18 text, ONE forest #2C4A36 primary action per screen (the single
  accent), Cormorant Garamond weight <= 500 for display titles only, Inter for everything read or tapped, radius 4, hairlines rather
  than boxes, shadows no larger than lg, motion 400 ms with deceleration. The welcome email moves from gold radius-8 weight-600
  buttons to the same rules.
- Doctrine 2 + redo rule 2: no dead buttons. The Buy button never points at a missing page; a package that cannot be bought (coach not
  connected to Stripe) shows "Not open for sign-ups yet" with no button.
- Doctrine 3 + 4: the success page says "You're in." No confetti, no "Congrats!", no exclamation marks, no emoji, no countdown timers or
  fake scarcity on landing pages.
- Redo rule 1 (honest copy): every sentence on the pages is true at that moment. The coach writes the testimonials and numbers on
  their own page, and the editor shows the plain rule "Only post results your clients agreed to share". TGP adds no claims.
- Redo rule 3 says "no photos or illustrations" for TGP's app chrome. The coach's own VSL and photos are the owner's explicit
  requirement for the coach's page. They sit in a calm frame: one video, poster, tap to play, captions if the coach gives them
  (D-F10 confirms).
- App screen: HAPTICS mediumImpact() only on Publish (the primary CTA), selection() on chip selects; SKELETON_LOADERS skeleton while the page loads;
  semantic tokens only (dark-mode.md); the share sheet follows share-card.md conventions; a parity table in each mobile PR; README rows
  in src/screens/coach/README.md, src/navigation/README.md and docs/reachability.md (doctrine 8).

## A5. PR plan (IDs FUNNEL-<NAME>-132; worktrees /home/user/workspace/wt/<ID>-<repo>; branches agent132/<id-lower>)

Tiers per SoT A3: money, auth, tenancy, PII/health = T4 (Claude Opus 5.5 builder + both lenses). Switches: FEATURE_COACH_FUNNEL
(backend; unset = off) gates steps 2-4 and the "Start" button. EXPO_PUBLIC_FF_COACH_PAGE (mobile; off) gates the "Your page" row.
Both stay off until both lenses and the owner say yes.

| # | ID | Repo | Tier | Goal (plain words) | Main files | Failing-first tests | Size | Depends on |
|---|---|---|---|---|---|---|---:|---|
| 1 | FUNNEL-GATES-132 | backend | T4 config | Declare the switch and the new public web addresses up front, so no later PR touches the shared config files | src/common/env-validation.ts (FEATURE_COACH_FUNNEL rule), .github/fly-env-desired-state.json ("unset" + gate text), docs/runbooks/launch-flags.md, src/main.ts setGlobalPrefix exclude list ('c/:coachSlug', 'c/:coachSlug/:pageSlug', '.../start', '.../verify', '.../pay', 'p/:shareToken', 'welcome', 'get') | manifest spec rejects a FUNNEL flag without a gate; `GET /c/x` reaches the page router (404 page), not the /api 404 JSON | ~200 | FLAG-TOOL-132 (b#884) and ROMAN-GATES-132 merged (same two files); AUDIT-FIX-132 merged |
| 2 | FUNNEL-PAGE-132 | backend | T3 (public page, coach input) | The coach's page carries a VSL and photos, always ends in the basic flow, follows the doctrine, and has no dead button | src/landing-pages/section-schemas.ts (new `video`: youtube-nocookie / player.vimeo / the coach's own Mux playback id; new `gallery`: up to 8 coach media images), landing-pages.html.ts (doctrine styles, CSP frame allow-list), landing-pages.service.ts (publish needs >= 1 bookable package; `public_url` in the response), landing-pages.public.controller.ts (/c routes, 301 from /p/:coach/:page, the Buy target rule) | an unlisted video host is refused; every text field is escaped (script, quotes); publish without a package is refused; /p/coach/page -> 301 /c; Buy never points at /v1/packages/public/join; switch off -> "Join in the app" | ~650 | 1 |
| 3 | FUNNEL-START-132 | backend | T4 auth + PII | Step 2: collect info and create or find the TGP account, proving the email with a 6-digit code before any payment | new src/landing-pages/funnel-start.controller.ts + funnel-start.service.ts + funnel-start.html.ts, landing-pages.module.ts (register), CheckoutCookieService reuse (signed 30-min funnel cookie, HttpOnly, SameSite=Lax); code hash in Redis 10 min, 5 tries; Supabase admin createUser(email, password, email_confirm false) then updateUserById(email_confirm true) after the code; User row upsert (role student, no coach; an account that never pays is a normal coachless account, FEATURE_COACHLESS_HOME=true); CoachLandingLead row (existing table, no migration); guest welcome email invite link gets redirectTo /verified | wrong code x5 locks for 10 min; code reuse refused; an existing email never gets a second account; an account linked to another coach stops with plain words (D-F5); no password or code in logs; rate limits per IP + page | ~750 (split A form+account / B code if > 800) | 1 |
| 4 | FUNNEL-WELCOME-132 | backend | T4 PII (masked email) | Step 4: "You're in", the right store button, a QR code on a computer, and /get sends each phone to its store | src/public-pages/public-pages.controller.ts (`/welcome`, `/get`), new src/public-pages/welcome.html.ts, new src/common/qr/ (the MIT QR encoder the mobile app already vendors in src/vendor/toqr), thank-you.service.ts lookup reuse | an unknown session_id shows a calm "not found" page; the email is masked; iPhone UA -> APP_STORE_URL, Android -> PLAY_STORE_URL, desktop -> QR SVG pointing at /get; no client JS | ~450 | 1 |
| 5 | FUNNEL-SHARE-132 | backend | T3 | Package share links work everywhere: a web package page with "Start", the iPhone opens the app when installed, and share_url is the real address | src/share-link/share-link.service.ts:241-248 (share_url = app host /p/<token>), src/invite-landing/well-known.controller.ts (AASA components: exclude /p/*/*, include /p/*), new src/storefront/package-page.controller.ts + package-page.html.ts, storefront.module.ts | AASA includes /p/* and excludes /p/*/*; `GET /p/<token>` renders the coach and package with plain terms; a bad token -> calm 404; share_url never uses joingrowthproject.com | ~450 | 1 |
| 6 | FUNNEL-PAY-132 | backend | T4 money | Step 3: a verified buyer from a published page gets a Stripe-hosted checkout for a package on that page, renewing or one-time | src/checkout/checkout.service.ts (funnel context: landing_page_id + verified buyer with no coach or the same coach), subscription-plan.ts (this context only; the coach-connection rule is unchanged everywhere else), new src/landing-pages/funnel-pay.controller.ts, landing-pages.module.ts | no funnel cookie -> 403; a package not on that page -> 404; buyer linked to another coach -> refused, no session; idempotency key per attempt; ClientPurchase.landing_page_id set (column exists, pr14 migration); success_url /welcome, cancel_url back to the page | ~550 | 1, 3 (cookie, module file) |
| 7 | FUNNEL-ASSIGN-132 | backend | T4 tenancy + money | Payment success links the buyer to the coach and delivers the package in the same transaction, exactly once, with audit events, even when Stripe's webhook is lost | src/checkout/checkout-webhook-handler.service.ts (checkout.session.completed with funnel metadata: attach coach_id only if null and role student; fan-out; coach push "New client from your page"), AuditLog rows via AuditService.write (lead_created / coach_assigned / package_assigned); new src/checkout/funnel-reconcile.service.ts + checkout.module.ts (every minute: pending funnel ClientPurchases older than 2 min -> stripe.checkout.sessions.retrieve -> the same idempotent path; kill switch CHECKOUT_RECONCILE_DISABLED reused) | duplicate webhook -> one purchase, one coach link, one push; existing coach never re-parented; refund path unchanged; a paid session with no webhook is assigned by the sweep, and a later webhook is a no-op | ~650 | 1 (disjoint files from 6; both off behind the switch) |
| 8 | FUNNEL-E2E-132 | backend | T2 (tests) | One CI test walks the whole flow: page -> start -> code -> pay (Stripe mocked) -> webhook -> coach + package linked -> welcome page | new test/e2e/funnel.e2e-spec.ts (+ fixtures) | the test itself, run twice for idempotency | ~400 | 2-7 |
| 9 | FUNNEL-EDITOR-M-132 | mobile | T3 | The coach builds and publishes the page in one calm screen, then copies, shares or shows the QR code | new src/screens/coach/page/CoachPageScreen.tsx, src/api/landingPagesApi.ts, CoachNavigator.tsx (SettingsStack route), SettingsScreen.tsx (row), CoachSetupChecklist.tsx (row), featureFlags (EXPO_PUBLIC_FF_COACH_PAGE), READMEs + docs/reachability.md | parity table; flag off -> no row; publish refused shows the API reason in plain words; QR encodes public_url; no dead button (every row opens something real) | ~750 | none for text sections (today's API); m#572 and m#574 are already merged |
| 10 | FUNNEL-MEDIA-M-132 | mobile | T3 | Pick the VSL (a link or a video from the coach media library) and photos for the page | src/screens/coach/page/* (pickers), reuse the coach media upload already used for package contents | an unlisted video link is refused before saving; the upload shows progress and failure calmly; nothing is published until Publish | ~450 | 2, 9 |

Total about 5,300 lines. Not in scope: custom-domain UI (code exists; D-F4 keeps it off), Next.js storefront (dropped; D-F1).

## A6. Waves (no two PRs in flight share a file) and overlaps

- Wave 0 (before this pillar): FLAG-TOOL-132 (b#884, open; touches only `.github/fly-env-desired-state.json`) and ROMAN-GATES-132
  merge first, because GATES edits the same `.github/fly-env-desired-state.json` and `src/common/env-validation.ts`. AUDIT-FIX-132
  (b#887), m#572 and m#574 are already merged. EDITOR-M adds EXPO_PUBLIC_FF_COACH_PAGE to src/config/featureFlags.ts,
  config/expected-env.json and eas.json. These are shared with any other v1.1 mobile PR that adds a flag, so the operator runs
  those one at a time.
- Wave 1: FUNNEL-GATES-132 (backend) || FUNNEL-EDITOR-M-132 (mobile).
- Wave 2: FUNNEL-PAGE-132 || FUNNEL-START-132 || FUNNEL-WELCOME-132 || FUNNEL-SHARE-132 (disjoint files: PAGE edits the existing
  landing files; START adds new files + landing-pages.module.ts; WELCOME is in src/public-pages + src/common/qr; SHARE is in
  share-link, invite-landing and storefront). Merge PAGE before START if both are green together (START's page links to PAGE's /c).
- Wave 3: FUNNEL-PAY-132 (after START: shares landing-pages.module.ts) || FUNNEL-ASSIGN-132 || FUNNEL-MEDIA-M-132.
- Wave 4: FUNNEL-E2E-132. Then the flip (operator, after both lenses and the owner say yes, and after the store listings are live,
  D-F7): EXPO_PUBLIC_FF_COACH_PAGE in a build, FEATURE_COACH_FUNNEL=true via fly-env-sync, then one real purchase of a low-priced
  package on the owner's own coach account, refunded afterwards (owner action: real money).
- Open PRs (gh, 14:05): b#882-b#886 touch none of the funnel files, except b#884 (the manifest above). b#885 touches
  src/checkout/coach-client-payments.service.ts and dunning-v2, which are not funnel files.
- Roman v1.1 (ops/V11_PLAN_132.md): shared files are only env-validation.ts and fly-env-desired-state.json (ROMAN-GATES-132). Funnel
  PRs add no migration (prisma/schema.prisma stays with ROMAN-ACTIONS/OUTREACH) and do not touch app.json (ROMAN-PHOTO-M-132).
  Other pillars: TEAMS (sub-coach routing on the page is PART B6), REFERRAL (footer is PART B8). IMPORTER and CHURN: none.

## A7. Ready-to-paste JOBS132 entries

```
## FUNNEL-GATES-132 (Claude Opus 5.5, backend, T4 config; one PR; wave 1 after b#884 + ROMAN-GATES-132 merge)
Worktree /home/user/workspace/wt/FUNNEL-GATES-132-backend, branch agent132/funnel-gates-132 (off backend main). LEFTHOOK=0.
Plan /home/user/workspace/ops/V11_FUNNEL_PLAN_132.md row 1. Declare FEATURE_COACH_FUNNEL in src/common/env-validation.ts (closed set
'true'; unset = off) and in .github/fly-env-desired-state.json as "unset" with gate text (flip only after FUNNEL-E2E-132 is green, both
lenses and the owner say yes, and the store listings are live, D-F7). Add the main.ts exclude entries listed in row 1. Failing-first: the manifest spec and a route test
(GET /c/x hits the page router). Never apply the manifest. READY. End.

## FUNNEL-PAGE-132 (Claude Opus 5.5, backend, T3; one PR; wave 2)
Worktree /home/user/workspace/wt/FUNNEL-PAGE-132-backend, branch agent132/funnel-page-132. LEFTHOOK=0. Plan row 2 and A3/A4.
Add `video` and `gallery` section kinds (allow-list: youtube-nocookie.com/embed, player.vimeo.com/video, the coach's own Mux
playback id), the publish rule (>= 1 bookable package), /c routes with 301 from /p/:coach/:page, and the Buy target rule (switch on:
/c/.../start; off: "Join in the app" -> /signup). Doctrine styles in landing-pages.html.ts (A4). Failing-first tests from row 2. READY. End.

## FUNNEL-START-132 (Claude Opus 5.5, backend, T4 auth + PII; one PR, split A/B if > 800; wave 2)
Worktree /home/user/workspace/wt/FUNNEL-START-132-backend, branch agent132/funnel-start-132. LEFTHOOK=0. Plan row 3, A2 step 2.
New funnel-start.* files: form (first name, email, password, optional phone/goal per page), 6-digit code (hash in Redis, 10 min,
5 tries), Supabase admin create or find, email_confirm only after the code, signed 30-min funnel cookie, CoachLandingLead row. Stop
with plain words when the account is linked to another coach. Also: guest welcome-email invite link gets redirectTo
https://app.trygrowthproject.com/verified. Never log codes, passwords or emails. Failing-first tests from row 3. READY. End.

## FUNNEL-WELCOME-132 (Claude Opus 5.5, backend, T4 PII; one PR; wave 2)
Worktree /home/user/workspace/wt/FUNNEL-WELCOME-132-backend, branch agent132/funnel-welcome-132. LEFTHOOK=0. Plan row 4, A2 step 4.
/welcome?session_id= (thank-you lookup reuse, masked email, "You're in." copy, doctrine), /get (user-agent -> APP_STORE_URL or
PLAY_STORE_URL; desktop shows both + QR), server-rendered SVG QR from a vendored MIT encoder (same as mobile src/vendor/toqr, with its
LICENSE). No client JS. Failing-first tests from row 4. READY. End.

## FUNNEL-SHARE-132 (Claude Opus 5.5, backend, T3; one PR; wave 2)
Worktree /home/user/workspace/wt/FUNNEL-SHARE-132-backend, branch agent132/funnel-share-132. LEFTHOOK=0. Plan row 5.
share_url = https://app.trygrowthproject.com/p/<token> (match mobile src/utils/packageShare.ts); AASA components exclude /p/*/* then
include /p/*; web package page at GET /p/:shareToken with "Start" (switch on) or "Join in the app" (off). Failing-first tests from
row 5. READY. End.

## FUNNEL-PAY-132 (Claude Opus 5.5, backend, T4 money; one PR; wave 3 after FUNNEL-START-132 merges)
Worktree /home/user/workspace/wt/FUNNEL-PAY-132-backend, branch agent132/funnel-pay-132. LEFTHOOK=0. Plan row 6.
Funnel context in checkout.service.ts: verified funnel cookie + published page + package on that page + buyer with no coach or the
same coach -> Stripe Checkout Session (Connect destination, renewing or one-time as today), customer_email prefilled, metadata
{landing_page_id, funnel: true}, success_url /welcome?session_id={CHECKOUT_SESSION_ID}. The coach-connection rule stays unchanged for
every other caller. No new Stripe product, no fee change. Failing-first tests from row 6. READY. End.

## FUNNEL-ASSIGN-132 (Claude Opus 5.5, backend, T4 tenancy + money; one PR; wave 3)
Worktree /home/user/workspace/wt/FUNNEL-ASSIGN-132-backend, branch agent132/funnel-assign-132. LEFTHOOK=0. Plan row 7.
On checkout.session.completed with funnel metadata, in one transaction: attach coach_id (only if null and role student), mark the
pending ClientPurchase paid, run PurchaseFanoutService.onPurchaseEntitled, and write AuditLog rows (AuditService.write: lead_created / coach_assigned / package_assigned).
Push the coach after commit. Duplicate events are a no-op. New funnel-reconcile.service.ts: every minute, pending funnel purchases
older than 2 min -> stripe.checkout.sessions.retrieve -> the same path (CHECKOUT_RECONCILE_DISABLED is the kill switch).
Failing-first tests from row 7. READY. End.

## FUNNEL-E2E-132 (Claude Opus 5.5, backend, T2 tests; one PR; wave 4)
Worktree /home/user/workspace/wt/FUNNEL-E2E-132-backend, branch agent132/funnel-e2e-132. LEFTHOOK=0. Plan row 8.
One e2e spec for the whole flow with Stripe and Supabase mocked; replay the webhook twice; assert one coach link, one purchase,
delivered contents, 3 audit events, the welcome page. READY. End.

## FUNNEL-EDITOR-M-132 (Claude Opus 5.5, mobile, T3; one PR; wave 1)
Worktree /home/user/workspace/wt/FUNNEL-EDITOR-M-132-mobile, branch agent132/funnel-editor-m-132. Plan row 9, A3, A4.
CoachPageScreen behind EXPO_PUBLIC_FF_COACH_PAGE: status, link (public_url, falls back to /p/<coach>/<page> until FUNNEL-PAGE-132
merges), Copy / Share / QR (CodeQr reuse), sections in the fixed order, packages picker, Publish (mediumImpact), Preview (opens the
web page). Entry: Settings > "Your page" and a CoachSetup checklist row. Mobile redo rules: parity table, truthful sweep, README row,
reachability row. Failing-first tests from row 9. READY. End.

## FUNNEL-MEDIA-M-132 (Claude Opus 5.5, mobile, T3; one PR; wave 3 after FUNNEL-PAGE-132 + FUNNEL-EDITOR-M-132 merge)
Worktree /home/user/workspace/wt/FUNNEL-MEDIA-M-132-mobile, branch agent132/funnel-media-m-132. Plan row 10.
Video row (a YouTube/Vimeo link, or the coach media library if D-F3 allows uploads) and Photos row (up to 8) reusing the package-content
media upload. Failing-first tests from row 10. READY. End.
```

## A8. Owner decisions (recommended defaults)

| # | Decision | Default | Why |
|---|---|---|---|
| D-F1 | Checkout engine on the web | Stripe-hosted Checkout through the existing in-app checkout path (PAY + ASSIGN). Drop the never-built Next.js storefront | No card form for us to build or secure. 3-D Secure, Apple Pay, Google Pay and Link come with Stripe's hosted page, with nothing extra to build. Reuses the live renewing billing and dunning |
| D-F2 | Account at step 2 | email + password + 6-digit email code (the app's sign-in is unchanged) | Proves the email before money moves. The buyer signs in on the phone with what they just typed. Alternative: email code only, plus "email me a code" sign-in in the app (one more T4 mobile PR) |
| D-F3 | VSL source | the coach's YouTube or Vimeo link in a privacy-enhanced embed (free); uploads from the TGP media library only with the owner's yes | Mux is live for coach video (SoT 3392), but views add Mux usage (cash) |
| D-F4 | Web address | app.trygrowthproject.com/c/<handle> | Free and live. A short domain (for example tgp.fit) costs cash. Coach custom domains (code exists) stay off for v1.1: each needs its own TLS certificate on Fly, which may cost cash (not checked) |
| D-F5 | Buyer already linked to a different coach | stop at step 2 with plain words and the support link; no charge | Today's backend rule records the purchase but keeps the old coach, so the client would pay one coach and see another |
| D-F6 | Wallets on Stripe's page | the owner turns on Apple Pay, Google Pay and Link in the Stripe dashboard (free) | One-tap checkout from Instagram (the rivals' strongest point) |
| D-F7 | When the funnel may go live, given that step 4 needs a real download | FEATURE_COACH_FUNNEL flips only after the App Store and Google Play listings are live. APP_STORE_URL and PLAY_STORE_URL then point at the real listings. A direct Android APK link (m#572 added an APK build profile) only if the owner says yes | The download pages say "not yet" today (seen live). Flipping earlier would make step 4 a dead end, the exact failure the owner wants gone |
| D-F8 | Optional phone / goal fields at step 2 | off by default; the coach can turn on each | Collect the least personal data (goal text can carry health detail) |
| D-F9 | Who sends the 6-digit code | Resend (already used for welcome emails) | No new vendor. The codes add email volume on the existing Resend account; check its plan limit before the flip, and any upgrade is the owner's yes |
| D-F10 | Coach photos/VSL on the web page | allowed, inside the calm doctrine frame (A4) | The owner asked for VSL and images; TGP's own chrome keeps "no photos" |

Store rules: the purchase happens on the web, outside the app. Inside the iPhone app nothing new is sold. Every package stays
one-to-one coaching with a named coach (owner ruling 2026-10-01 13:37). Packages have no service-type field (mobile client README),
so a landing page sells only what the app already sells. That fits Guideline 3.1.3(d), "real-time person-to-person services between
two individuals (for example ... fitness training)" ([App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)).
The coach app shows and shares the coach's own page: the coach is the seller there, not a buyer. The client app gets no link to the
web checkout, so PART A adds no external purchase link and the US link rules for digital goods do not come into play. No tricking
app review. If group or digital-only products are ever sold on these pages, the store rules need a fresh review (owner decision).
Health data: step 2 only shows the coach-sharing sentence. The consent is
recorded in the app on the first sign-in (existing B-SHARE-GUEST-127; the backend shows it to any client with a coach and no
sharing decision yet, src/consent/coach-sharing-first-sign-in.service.ts:60-73). No health data is collected on the web unless the coach turns
on the optional goal field. No money is spent by any PR. The only cash items are the owner's choices in D-F3/D-F4/D-F9 and the
owner's own test purchase.

## A9. Rivals (addendum C) and how PART A makes TGP superior, not a prettier copy

| Rival | What they do well | Where they fall short |
|---|---|---|
| Everfit | Packages with a sales page and checkout ([Everfit payment](https://everfit.io/payment/)), with video and images on the coach's public profile ([public profile packages](https://help-marketplace.everfit.io/en/articles/9402550-add-packages-to-your-public-profile)) | After paying, the buyer is "prompted to log in or create a new account to activate and link the package to their profile" ([purchase process](https://help.everfit.io/en/articles/5719215-understanding-the-purchase-process)). That extra step can be lost |
| ABC Trainerize (Trainerize Pay) | Product links and checkout ([Trainerize Pay](https://www.trainerize.com/blog/introducing-trainerize-pay/)); product automation assigns the trainer, starts the program and emails download instructions ([product automation](https://help.trainerize.com/hc/en-us/articles/360039663852-Automating-Content-Delivery-with-Product-Automation)) | Payments are an add-on: "$10/month" on Grow and Pro, included with the Business Add-On and in Studio ([FAQ](https://resources.trainerize.com/faq)). The buyer is left with an email to find the app |
| PT Distinction | Pre-made packages: after sign-up the client is "automatically added" and gets the coaching "completely automated" ([5-minute packages](https://www.ptdistinction.com/blog/create-an-automated-pre-made-package-in-under-5-minutes)); sign-up forms and a mini-site ([features](https://www.ptdistinction.com/features)) | "a welcome email with their login details". People who did not pay become "inactive users" in a "marketing email group" (same page) |
| Stan Store | One link in the bio, with one-tap checkout inside the store ([Stan](https://www.stan.store/)) | "$29/mo" Creator, "$99/mo" Creator Pro ([HowSociable review](https://howsociable.com/reviews/stan-store)); no training delivery after the sale |
| Kajabi | Funnel templates: opt-in -> value pages with a headline and video -> checkout + emails ([funnel templates](https://help.kajabi.com/en/articles/17175213-funnel-templates)) | No training plan or workout logging after the sale (from the funnel pages read) |

How TGP is superior with PART A alone:
1. **No dead step and no activation step.** The account is made and proven before payment, and payment itself links the coach and
   the plan, exactly once. Everfit makes the buyer activate after paying; Trainerize and PT Distinction send an email to act on.
2. **Desktop to phone in one scan.** The QR code opens the right store. The phone app opens already linked to the coach, with the
   plan in place.
3. **Included, not an add-on.** TGP earns through its 2% take rate on client payments (SoT line 1713; payout rule at line 4620),
   with no page or payments fee. Trainerize charges for payments, and Stan charges $29 or $99 a month (table above).
4. **Honest by construction.** No fake timers, no invented claims, one calm action per screen. The page is about the coach's
   result, not hype.
5. **One system after the sale.** The same account gets Roman, the plan, the coach's messages and the progress data. Stan has no
   training delivery after the sale.

## A10. TGP's proposition (addendum D)

SoT A7.5: "the fitness platform for the post-AI world"; "A coach brings the brand and the coaching; TGP runs everything else";
"Zero-friction conversion from a social post: link, landing page, checkout, training, with no dead step in between" (G1). PART A
builds that rail exactly. AI-native means Roman takes over at the first open (Day 1, plan, macros, coach chat) for every buyer the page
brings. The page itself stays the coach's words. AI on the page itself is PART B (B1, B2), pitched separately.

---

# PART B: my additional ideas (optional; nothing here is in PART A)

| # | Idea (plain words) | Why it makes TGP superior | Rival gap it exploits | Size | Cost | Depends on |
|---|---|---|---|---|---|---|
| B1 | **Roman drafts the coach's page.** From the coach's packages, programs and bio, Roman writes a first draft of every section in the coach's voice. The coach edits and taps Publish; testimonials and numbers come only from what the coach pastes | A page in minutes that describes what the coach really delivers (grounded in the real program), not template filler | Kajabi offers "proven copy ... just fill in the blanks" ([Kajabi funnels](https://www.kajabi.com/features/funnels)). None of the fitness rival pages read here drafts from the coach's own programs (not a full audit) | 2 PRs (backend draft via the existing AI gateway; mobile "Draft with Roman" button) | AI tokens on the existing key (cash per use) -> owner decision; can draw from the coach AI credit budget | PART A PAGE + EDITOR-M |
| B2 | **Ask Roman on the page.** A visitor asks "Is this right for a beginner?" Roman answers only from the coach's page and package facts, never gives medical advice, and offers "Ask <coach>" (creates a lead with the question) | Answers at 2 a.m. without the coach, in a calm voice, and hands warm leads to the coach | Eden pitches "an AI that coaches every buyer for you, one-on-one, in your voice, at midnight" ([Eden vs Stan](https://eden.so/vs/stan/)), but it teaches courses, not training plans with a live coach. The fitness rivals' sales pages read here have no pre-sale assistant | 2-3 PRs (public endpoint with strict limits, page widget, coach lead view) | AI tokens (owner decision), abuse limits | PART A, Roman safety filters |
| B3 | **Sales that train.** The coach sees, per page and per Instagram post (utm), page views -> started -> paid -> opened the app -> first workout logged | Measures real starts, not just checkouts, so the coach fixes the real drop-off | Kajabi lists "analytics" with its funnels ([Kajabi funnels](https://www.kajabi.com/features/funnels)). No rival in this plan ties a sale to the first workout | 2 PRs (backend rollup on CoachLandingPageView + purchases + first log; a section on "Your page") | none | PART A |
| B4 | **One calm follow-up.** A buyer who verified the email but did not pay gets one plain email the next day with a resume link; the coach sees "started, not finished" with one tap to message | Recovers sales without drip spam, true to the calm doctrine | PT Distinction parks them in marketing email groups ([PT Distinction](https://www.ptdistinction.com/blog/create-an-automated-pre-made-package-in-under-5-minutes)) | 1-2 PRs (reuse checkout-recovery.service.ts) | Resend emails (existing vendor; flag at volume) | PART A START |
| B5 | **Day 1 on the web now.** If the buyer cannot install yet, they start Day 1 in the browser (plan, first meal log, message the coach) with the same account | No buyer is lost at the install step (SoT G1: "web sign-up / web app conversion not built") | PT Distinction already gives clients "access through both your web portal and mobile apps" ([5-minute packages](https://www.ptdistinction.com/blog/create-an-automated-pre-made-package-in-under-5-minutes)). TGP would match that and add Roman and the coach chat on the web. Stan and Kajabi have no training | 4-6 PRs (react-native-web exists; native-only modules excluded) | none (existing hosting) | PART A; large |
| B6 | **Team routing on the page.** A head coach's page assigns each buyer to a sub-coach by rule (round-robin, set share, or the buyer picks by schedule) | The owner's growth ladder (SoT A7.5 stage 2) in the sales flow itself | Trainerize product automation assigns the trainer set on the product ([product automation](https://help.trainerize.com/hc/en-us/articles/360039663852-Automating-Content-Delivery-with-Product-Automation)) | 2-3 PRs | none | V11-TEAMS-PLAN-132 (team entitlement, routing schema) + PART A ASSIGN |
| B7 | **Results that cannot lie.** A "Client results" section shows a real client's dated progress numbers only with that client's in-app consent, labelled "shared with permission" | Proof the buyer can trust; TGP becomes the trust symbol of online coaching (SoT G7) | On the rival pages read for this plan, testimonials are text the coach types (a reading of those pages, not a full audit). TGP can back the proof with real logs, with consent | 2 PRs (T4 privacy: consent ledger + page section) | none | PART A PAGE; consent ledger (exists) |
| B8 | **"Coaching runs on TGP" footer.** A quiet footer link on every page carrying the coach's referral code | Every page recruits coaches for free, cutting TGP's cost to acquire coaches | Not researched for rivals. The value comes from TGP's own referral plan: coaches recruited for free | 1 PR | none | V11-REFERRAL-PLAN-132 |

Recommended PART B order if the owner wants any: B3 (no cost, makes every page better), B4, B1, B6, then B7. B2 costs AI tokens and
needs abuse limits; B5 is large (4-6 PRs).

---

## Proposed (needs operator), each with a default

- P1. Read-only Fly Env Truth run to learn production STOREFRONT_BASE_URL (the code default has no DNS). Default: after FUNNEL-SHARE-132
  the value no longer matters for share links; set it to https://app.trygrowthproject.com in a later env PR.
- P2. Supabase Redirect URLs: confirm https://app.trygrowthproject.com/verified is listed (tgp://verified was added 10-06 12:48).
  Default: the owner adds it in the dashboard (free) before FUNNEL-START-132 merges.
- P3. Update roadmap/specs/A08-lead-funnel.md status after v1.1 (docs only). Default: the operator does it with the state reconcile.
