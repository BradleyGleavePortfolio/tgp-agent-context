# V11_REFERRAL_PLAN_132: coach-to-coach referrals with real rewards (V11-REFERRAL-PLAN-132, agent 132, 2026-10-08 14:00-14:40 PDT)

Basis: backend main cd0f90ed823d43dc8a9f0937554dc59fce7b6b94, mobile main edf36a8856f345086abdfe867aa2b1d6f32cb45a (m#569 merged 13:36),
read with `git show origin/main:<path>` in /home/user/workspace/wt/RO-backend and /home/user/workspace/wt/RO-mobile. Every status is
"from the code" at those heads unless it says otherwise. Read-only: no branches, PRs, comments, GitHub writes or Supabase queries.
Applies the operator addendum of 13:47 (owner 13:45): pathway placement, design doctrine, rivals, SoT A7.5, PART A / PART B.

## 0. One screen (plain words)

**What the owner asked for.** 13:36: "Refferal system is built and rewards for coach to coach refferals have real rewards to lead Cost
to acq user to slash for TGP". Earlier, locked in roadmap/specs/A12-referrals.md: "Referral tracking engine - client to client, coach to
coach - For coach-coach referrals, i want a popup that states 'Your referral jsut processed their first payment! Here's a gift from us
->' and its a free TGP shirt!". JOBS132: rewards that cost no cash first; client referrals only if cheap.

**What exists.** Nothing referral-specific: no referral table, no referral code or link, no reward, no popup, no dashboard
(A12 says "ZERO"; the code agrees). What does exist and is reused: coach self-sign-up (on), the 2% TGP take rate with a per-coach fee
row and a per-charge fee snapshot, an exactly-once "coach's first client payment" event, the public invite landing page (/join/:code),
deep links, the pending-invite-code pattern, on-phone QR, the share sheet, notifications, audit events.

**The key fact that shapes the reward.** Coaches pay TGP no subscription: the owner removed coach plans on 10-06 (mobile
BillingSection.tsx:13, 37-39; nothing sells Pro, fly-env gates text) and the business model is "a 2% take rate, not seat fees" (SoT
C1, owner 09-30 11:47). So "free months of the coach's TGP fee" means **time with no TGP fee on the coach's own client sales**. It costs
TGP no cash: TGP only gives up 2% of sales that the referrer and the new coach actually make. A gift is worth something only to a coach
who is really selling, which is also what makes it hard to game.

**PART A (the owner's idea, built to outstanding quality): 9 PRs + 2 optional, 6 waves.**
1. REFERRAL-SCHEMA-132 (b, T4): tables, row security, deletion and export entries, two switches (both off).
2. REFERRAL-CLAIM-132 (b, T4): each coach's code and link; a new coach applies a code; strict, honest eligibility rules.
3. REFERRAL-GIFT-132 (b, T4 money): when the referred coach's first client sale settles, both coaches get fee-free days; the fee code
   honours them; ends early if that first sale is refunded.
4. REFERRAL-NOTIFY-132 (b, T4 privacy): push and Notification Center line for the owner's "popup" moment; "seen" marker.
5. REFERRAL-LANDING-132 (b, T3): the public page https://app.trygrowthproject.com/r/<code> with app-store buttons and the code.
6. REFERRAL-OPS-132 (b, T4 money): Money screen data shows waived fees honestly; OWNER list and void for abuse.
7. REFERRAL-SCREEN-M-132 (m, T2): Settings > Business > "Refer a coach" (link, code, QR, share, statuses, totals) and
   "Referred by a coach?" (apply a code).
8. REFERRAL-LINK-M-132 (m, T2): the /r/<code> link opens the app and offers to apply the code after coach sign-up.
9. REFERRAL-GIFT-M-132 (m, T4 money copy): the calm gift sheet (the owner's popup, doctrine version) and the honest fee line on Money.
10-11 (optional, cheap): CLIENT-REFERRAL-132 (b, T4) + CLIENT-REFERRAL-M-132 (m, T2): a client invites a friend to their coach;
   attribution only, no TGP-funded client reward.

**Owner decisions (defaults in section A9).** D1 popup copy (doctrine bans "!" and first person; default "Your referral made their first
sale. A gift from TGP: ..."). D2 the shirt costs cash and a vendor: default not in v1.1. D3 gift sizes: referrer 90 fee-free days (up to
$250 of fees), new coach 60 days (up to $100); first sale of at least $50; claim within 30 days. D4 no cash rewards in v1.1. D5 gifts
already granted keep working if the program is switched off. D6 client referrals: attribution only. D7 what the referrer may see about
the new coach (first name, status, dates; never amounts). D8 no coach leaderboard in v1.1. D9 /r/* universal links ride the next native
build. D10 switch-on order.

**PART B (pitched separately, optional):** 8 ideas, all no-cash unless flagged: a referred coach can start from the referrer's setup,
a mentor channel, a no-cash partner tier for coaches with 5+ referrals, a calm referral moment after a coach's first $1,000 month, an
AI-written invite in the coach's voice (AI cost: owner decision), coach-funded client rewards, an opt-in referral list among coaches,
a cash partner program (owner decision).

---

# PART A: the owner's idea, exactly as stated

## A1. Inventory against the goal (from the code)

Production switches (.github/fly-env-desired-state.json at cd0f90ed): no referral switch exists. Related: SIGNUP_ROLE_CHOICE_ENABLED
"unset" = code default on (src/auth/auth.service.ts:85 reads `?? 'true'`); FEATURE_COACH_CODE_TOOLS "true"; BILLING_ENFORCEMENT "unset"
(gates text: "nothing sells the pro tier yet"); FEATURE_COACH_PAYMENT_ACTIONS not set (header Q7).

| Piece the goal needs | State | Where (backend unless "mobile") |
|---|---|---|
| Referral record (who referred whom, status, first payment, reward) | not built | `rg -i referr src prisma` has no referral model or module; only PTM outcome `referred` (schema.prisma:1892) and medical "referral" guardrail copy |
| Each coach's personal referral code / link | not built | CoachProfile.invite_code (GP-xxxx) is a CLIENT join code (auth.service.ts:297-370 creates it at coach sign-up); src/share-link is per-package sale links (share-link.service.ts) |
| Coach self-sign-up (where a referred coach arrives) | built and on | register / Google / Apple with intended_role coach -> createSignupUser writes role coach + CoachSubscription tier free, status active + audit (auth.service.ts:297-370) |
| Sign-up attribution field | partly built, not usable for rewards | User.signup_ref (schema.prisma:200), free text `^[a-z0-9_-]+$` (auth.dto.ts:62-69), written only by email register (auth.service.ts:618), never by Google/Apple; nothing reads it |
| TGP's fee (the reward currency) | built and on | 2% default (src/connect/fees/fee-policy.service.ts:21), per-coach FeePolicy override row with no time window, read by resolvePolicy(coachId) (fee-policy.service.ts:69), OWNER-only write upsertOverride (:169-170, schema.prisma:4449); settlement resolves the policy and snapshots platform_bps per charge (charge-settlement.service.ts:594-606; ChargeSettlement schema.prisma:4700) |
| Coach subscription / Pro months | built but off and unsold | CoachSubscription tier free/pro (migration 20260614000000), OWNER-only start-subscription (owner-billing.controller.ts:77), no self-serve upgrade (subscription.guard.ts:45 TODO); mobile Subscription row hidden: "coach plans were removed (owner 10-06)" (mobile src/screens/coach/settings/BillingSection.tsx:13, 37-39) |
| "First payment" trigger for the referred coach | built and on (for the coach's own notice) | CoachFirstPaymentService exactly-once emit (src/notifications/coach-first-payment.service.ts), called from checkout-webhook-handler.service.ts:591; server-trusted coach and client ids |
| Public landing page for a link | built and on for client invites only | src/invite-landing: GET /join/:code, /invite/:code SSR, store buttons, tgp:// button, one generic "invite unavailable" page (src/invite-landing/README.md:12-15); AASA paths /join/*, /invite/*, /billing/update-card (well-known.controller.ts:115-121); /api prefix excludes (main.ts:135-147). No /r/* |
| Mobile deep links and pending code | built (client invites) | prefixes tgp://, com.growthproject.app://, https://app.trygrowthproject.com (mobile RootNavigator.tsx:133); join route :194; Android intent filters /join, /invite/accept, /reset-password, /p, /billing/update-card (app.json:55-103); pending code with consent banner (src/lib/pendingInviteCode.ts); no deferred-install attribution (pendingInviteCode.ts:19-22) |
| QR on the phone, share sheet | built | mobile src/components/coach/CodeQr.tsx, setup/QrCode.tsx, src/lib/qrMatrix.ts, src/vendor/toqr; expo-sharing in ShareCardScreen (docs/share-card.md) |
| Referral analytics | partly built | mobile REFERRAL_SHARE_INITIATED / _CARD_SHARED / LINK_COPIED events (src/analytics/events.ts:97-100), client streak card only |
| Popup to the referrer | not built | doctrine forbids celebration overlays and "!" (mobile docs/QUIET_LUXURY_DOCTRINE.md sections 3-4): a calm sheet instead (D1) |
| Free TGP shirt | not built | needs cash, a print vendor and stored addresses (A12 "Open operator questions"): owner decision D2 |
| Coach referral dashboard | not built | none |
| Honest fee display while a gift applies | not built | mobile label hard-codes "TGP fee (2%)" (src/lib/money/moneyCopy.ts:196) and MoneyScreen.tsx:984; coach-money service returns no per-charge rate (`rg platform_bps src/coach-money` = none) |
| Client -> client referral | partly built | client share card + analytics only; coach invite codes with redeemer lists (InviteCodeRedeemersScreen); no "invited by which client" record |
| Owner tools (counts, void abuse) | not built | none |
| Row security pattern for new tables | built (pattern) | ENABLE + FORCE RLS, REVOKE ALL FROM anon, authenticated, service-role policy (prisma/migrations/20270402000000_coach_playbook/migration.sql:93-100) |
| Deletion and export coverage | built (enforced) | test/account-deletion/erasure-manifest-coverage.spec.ts fails on any new user-id column without a manifest entry |

## A2. The design in plain words

**Codes and links.** Every coach gets one code, minted the first time they open "Refer a coach": `CR-` plus 8 characters from an
alphabet without look-alikes (no 0/O, 1/I/L), case-insensitive, for example CR-7KQ2MX4P, and the link
https://app.trygrowthproject.com/r/CR-7KQ2MX4P. A GP- client code typed into the coach field gets its own plain message.

**Applying a code (the referred coach).** A coach applies a code within 30 days of creating the coach account and before their first
sale settles. Ways in: open the link with the app installed (the code waits on the phone and is offered with consent after coach
sign-up, the same pattern as pendingInviteCode.ts), or type or paste it in Settings > Business > "Referred by a coach?". No deferred
deep-link vendor (no cost).

**What counts as "processed their first payment".** The referred coach's first client sale of at least $50 that has settled (TGP made
the transfer), sold through their own Stripe account that has finished Stripe's identity checks, bought by someone who is neither coach,
and not refunded or disputed when checked. A scheduler checks every 5 minutes, so the moment is minutes after the sale, without
touching the payment webhook.

**The gifts (no cash).**
- Referrer: "No TGP fee on your sales for 90 days, up to $250 in fees." One gift per qualified referral. A new gift starts when the
  previous one ends; at most 12 months banked ahead.
- New coach (welcome): "No TGP fee on your first 60 days of sales, up to $100 in fees." Active from the moment the code is applied;
  the 60 days count from their first sale; the offer closes 180 days after applying if no sale happens.
- A gift covers sales made inside its window (charge time, not payout time). It never touches the head-coach share. When a gift ends,
  the normal 2% applies to new sales only; nothing is charged back.
- Ends early: if the qualifying first sale is refunded or disputed within 30 days, the referrer's gift ends that day (no charge-back).

**Rules that keep it honest (all server-side, each with its own error code and plain copy).** Only coaches; not your own code; one
referrer per coach, fixed once applied; the new coach must be new (account at most 30 days old, no settled sale yet); not a sub-coach
of the referrer's team; different email and different Stripe account from the referrer; the buyer of the qualifying sale is neither
coach. Caps bound the cost of any one gift.

**The owner's popup moment (doctrine version).** When the referrer's gift is granted: a push, a Notification Center line, and on the
next app open one calm sheet over the coach home (single fade, radius 4, no confetti): "Your referral made their first sale." /
"A gift from TGP: no TGP fee on your sales for 90 days, up to $250 in fees." Primary: "See your gift". Text action: "Close". Shown once.

**What each coach sees about the other.** The referrer sees the new coach's first name, status and dates ("Joined Oct 9", "First sale
made Oct 20", "Gift active until Jan 18", "Gift ended Nov 2: the first sale was refunded"). Never amounts, client counts or revenue.
The new coach is told this before applying the code.

**Money honesty.** While a gift applies, the Money screen shows the real fee and a note: "No TGP fee on sales made Oct 20 to Jan 18:
referral gift." The fee label stops saying "2%" when it was not 2%.

**Two switches, off until both lenses and the owner say yes.** FEATURE_COACH_REFERRALS (codes, claims, pages, screens, scheduler) and
FEATURE_REFERRAL_FEE_GIFTS (the fee waiver in settlement). The program can run for attribution first and turn gifts on after a money
check. The phone shows the rows only when the server says the program is on (no mobile build flag, no rebuild to switch).

**Store rules.** Gifts lower TGP's take on person-to-person coaching sold outside in-app purchase, which Apple allows for "fitness
training" between two individuals ([App Review Guidelines 3.1.3(d)](https://developer.apple.com/app-store/review/guidelines/)). A
referral code unlocks no app content or feature (3.1.1 bars "license keys ... QR codes" that unlock content), using the app never
requires a referral, rating, review or other store action (3.2.2(x)), and no gift depends on turning on push notifications, location
or tracking (5.1.2(i)). Nothing is sold in the app.

## A3. Pathway placement (addendum A; reachability from mobile docs/reachability.md)

Coach tabs today (reachability.md "Coach and sub-coach"): CommandCenter (home), Clients, Templates, Messages, Team (head coach only),
Community (flag off), Settings. Settings sections (mobile src/screens/coach/SettingsScreen.tsx:405-816): Profile, Owner (owner only),
Client Management, Payments, Coach Tools, Business (BillingSection.tsx), Security, Concierge, Privacy, Cross-pillar practice, Danger
zone, Support.

| Piece | Who | Where it lives | Taps from home | Replaces |
|---|---|---|---|---|
| Refer a coach row | coach, head coach (sub-coaches see it too; their referrals are their own) | Settings tab > Business > "Refer a coach" -> CoachReferrals | 2 | nothing (new row under Business profile) |
| CoachReferrals screen | coach | Settings stack route `CoachReferrals` | 2 | nothing |
| Referred by a coach? row + apply sheet | new coach inside the 30-day window, not yet applied | Settings tab > Business > "Referred by a coach?" -> sheet | 2 (3 to apply) | nothing; row disappears after applying or after the window |
| Pending-code offer | new coach who opened a /r/ link with the app installed | sheet over CommandCenter after coach sign-up, once | 0 | nothing |
| Gift sheet (owner's popup) | referrer with an unseen gift | sheet over CommandCenter on next open, once; push tap and Notification Center row open CoachReferrals | 0 (push: 1) | nothing |
| Fee note | coach with a gift in the period | Settings > Payments > Money (CoachMoney) and a charge's detail | 3 | the fixed "TGP fee (2%)" label becomes the true rate |
| Referral web page | anyone with the link | https://app.trygrowthproject.com/r/<code> > (store buttons or "Open in the app") > app CreateAccount (coach) > coach wizard (unchanged) | web step 1 of 4 | nothing |
| OWNER referral list | owner | API only in v1.1 (/api/v1/admin/referrals); an owner console screen is a later follow-up (Proposed, needs operator) | n/a | nothing |
| Client "Invite a friend" (optional wave) | client with a coach | More tab > "Invite a friend to train with <coach first name>" -> share sheet | 2 | nothing (new More row) |
| "Joined through a client invite" (optional) | coach | Clients > client detail > Summary, one line | 2 | nothing |

Routes and actions before -> after (rule 6 of tgp-agent-context/handoffs/op-131/ops/_COMMON_131.md:287-288; each mobile PR repeats its table with a parity test):

| Screen | Before | After |
|---|---|---|
| Settings > Business (BillingSection.tsx) | Business profile -> CoachTeamProfile | Business profile -> CoachTeamProfile (unchanged); Refer a coach -> CoachReferrals (when on); Referred by a coach? -> apply sheet (when eligible) |
| CommandCenter | all current actions (owned by #329/#332 history) | unchanged; plus at most one sheet per open, only on a tested condition (pending code, unseen gift), dismissible |
| CoachReferrals (new) | none | Share your link (native share sheet), Copy link, Show QR code (inline), How gifts work (inline expand), back |
| Money (MoneyScreen.tsx) and charge detail | labels and actions as today | same actions; fee label text and one note line only |
| More tab (optional wave) | current rows | current rows unchanged; plus "Invite a friend to train with <name>" for clients with a coach |

Nothing is removed or moved. No tab or navigator change. Web page step order: page -> install or open app -> create coach account ->
apply code (automatic offer or Settings row).

## A4. Design rules each PR follows (addendum B)

Sources: mobile docs/QUIET_LUXURY_DOCTRINE.md (QL), handoffs/op-131/ops/_COMMON_131.md mobile screen redo rules 1-8 (R1-R8), src/theme/README.md,
docs/HAPTICS.md, docs/SKELETON_LOADERS.md, docs/dark-mode.md, docs/share-card.md, ENGINEERING_RULES.md; owner: "LUXURIOUS, SIMPLE,
MENTALLY DELOADING, AND CALM!".
- Typography QL1 / R3: Cormorant Garamond (<= 500) only for the screen title and the one hero line ("Fees saved" number in tabular
  numerals); Inter for everything read or tapped; text >= 13 pt; overlines small caps in muted grey ("YOUR LINK", "COACHES YOU
  REFERRED").
- One primary action per screen R3/R5: CoachReferrals = forest "Share your link"; Copy and QR are text actions. Apply sheet = "Apply
  code". Gift sheet = "See your gift".
- No celebration QL3: the gift sheet is a plain sheet with one 400 ms fade (motion.duration.base), no confetti, spring, trophy, glow or
  badge. No exclamation marks or hype QL4 (D1 rewrites the owner's "!" and "from us"). Copy rule 14 (_COMMON_132.md:140): no first person.
- Restrained chrome QL5 / R3: bone page, hairline separators, radius 4 on sheets, forest single accent, monochrome statuses (words, no
  coloured chips), outline icons, 44 pt targets.
- No global chrome QL6: no banner or FAB; sheets only on a tested condition, once.
- Honest copy R1: every line from real data; empty list says "No coaches have joined with your link yet."; never promise a gift
  before it is granted; never claim exclusivity.
- No dead buttons R2 and no placeholders QL2: rows hidden while the server says the program is off.
- Loading and errors: Skeleton rows from src/ui/skeletons (SKELETON_LOADERS.md:47); QuietLoading / QuietError from
  src/ui/states/QuietStates (doctrine line 75: one calm sentence in ink, no red, icon or box) plus a plain "Retry" text action.
- Haptics (HAPTICS.md): selection() on Copy, success() when a code is applied.
- Dark-mode readiness R7: theme tokens only (useTheme), no hex literals.
- Share (share-card.md): expo-sharing / Share API with the link and one plain sentence; REFERRAL_LINK_COPIED and
  REFERRAL_SHARE_INITIATED analytics reused (events.ts:97-100) with `source: 'coach_referrals'`.
- Web page: same doctrine as the invite landing (escaped text, theme accent rules in src/invite-landing/README.md); no photos.
- README rule QL8: every PR updates the module README and docs/reachability.md rows it changes.

## A5. Best-in-class rivals and how TGP becomes superior (addendum C)

| Product | What it does well | Where it falls short |
|---|---|---|
| ABC Trainerize | "Refer for Credit": a credit equal to the referred trainer's first month's fee, applied to the next invoice, link under "Earn Free Months" in More ([Trainerize help](https://help.trainerize.com/hc/en-us/articles/211421283-Does-Trainerize-Have-a-Referral-Program)); cash affiliates at 15% recurring through PartnerStack, 90-day cookie ([affiliate page](https://www.trainerize.com/affiliate-program/)); counts a referral after 60 paid days ([agreement](https://resources.trainerize.com/referral-program-agreement)) | rewards a seat-fee payment, not the new trainer's business working; credit only offsets a fixed fee; payouts need a third-party vendor; partner credits "stop once they cover the full cost of your subscription" ([MyFitnessPal rewards FAQ](https://help.trainerize.com/hc/en-us/articles/41142514851220-ABC-Trainerize-x-MyFitnessPal-Rewards-Program-FAQ)) |
| Everfit | code, link or email invite; credit once the referral pays any subscription (no minimum); notice when a friend signs up ([Everfit help](https://help.everfit.io/en/articles/4436288-everfit-referral-program)); affiliates 10% for two years, PayPal ([affiliates](https://everfit.io/affiliates/)) | rewards a subscription payment, not a working business; the referral page sits behind a "$" button in the web dashboard's left menu |
| TrueCoach | flat $75 or a "wheel spin" for up to $1,000 of credit ([UpPromote](https://uppromote.com/affiliate-program-directory/truecoach/)); earned after the referral pays for 90 days, paid within 60 days of verification as account credit or by PayPal, W9 form above $599 a year ([terms](https://tsgfitness.referralrock.com/v2/9/terms)) | gamified wheel, third-party portal, tax paperwork, rewards the subscription not the coach's success |
| Kajabi | 100% of the first month as a bounty for 1-4 referrals, then 10-20% recurring by tier; payouts cover payments from about 60 days earlier ([Kajabi help](https://help.kajabi.com/en/articles/17175726-partner-program-overview), [FAQ](https://help.kajabi.com/en/articles/17175739-kajabi-partner-program-faqs)) | cash program built for affiliates and agencies; tiers and holds are complex |
| Stan Store | 20% recurring for as long as the creator stays subscribed, paid through Stripe or PayPal; referrer must keep a paid plan ([Stan help](https://help.stan.store/article/89-what-is-stans-referral-or-affiliate-program)) | cash cost on every renewal; paid ads are not allowed in the program; rewards end if the referrer cancels |
| Square (outside fitness; closest model) | both sides get free processing on up to $1,000 of sales over 180 days; earned when the referred business takes its first payment over $1; statuses "Waiting for sign up / Waiting for first payment / Complete"; share by QR from the point-of-sale app ([Square help](https://squareup.com/help/us/en/article/5209-square-s-referral-program), [terms](https://squareup.com/us/en/legal/general/payment-referral-terms)) | a $1 first payment is an easy bar; generic for all merchants; no coaching context |
| Dropbox (outside fitness) | double-sided reward in the product's own currency (storage), capped at 16 GB on Basic and 32 GB on paid plans, earned only after the friend installs the app, signs in and verifies their email ([Dropbox help](https://help.dropbox.com/storage-space/how-much-free-space)) | reward in a currency that does not grow the referrer's business |

**How TGP is superior, not a prettier copy.**
1. Paid in the currency of success. TGP's reward is its own 2% on the coach's sales, so a gift is worth more the better the coach does
   and costs TGP nothing when nothing is sold. Seat-fee credits (Trainerize, Everfit, TrueCoach) and cash commissions (Kajabi, Stan)
   cost the platform whether or not the new coach ever earns.
2. Triggered by activation, not sign-up. The gift fires on the referred coach's first real client sale (at least $50, settled,
   Stripe-verified seller, independent buyer), a stronger bar than Square's $1 and more meaningful than "paid a subscription".
3. Double-sided where it matters most: a new independent coach keeps every dollar of their first 60 days of sales.
4. No cash, no vendors, no tax forms, no third-party portal (PartnerStack, PayPal, Referral Rock all avoided).
5. Live, honest status inside the coach's own app, including fees saved in dollars; no wheel, no confetti.
6. In-person sharing by QR from the phone at gyms, courses and events (Square's point-of-sale pattern; none of the coaching rivals read offers it).
7. Hard to game by construction: Stripe identity checks on the new coach, an independent buyer, caps per gift, end-early on refunds.

## A6. TGP's proposition (addendum D, SoT A7.5 lines 1674-1700)

SoT A7.5: "TGP is the growth ladder for independent fitness operators" (line 1679); principles include "AI-native, not AI-added" (line 1690) and the
take-rate model (sub-coach teams free, owner 10-06 14:25: "When they scale, our take-rate grows with them", SoT line 1712). The referral program applies the same
alignment to acquisition: TGP pays for growth only out of growth. PART A uses no AI and claims none. The AI-native parts (AI drafts
shortening a new coach's time to first sale, an invite in the coach's own voice) are pitched in PART B so PART A stays exactly the
owner's idea.

## A7. PR plan

Contract pinned for all PRs (backend under /api):
- `GET /coach/referrals/me` -> `{ enabled, code?, link?, referrals?: [{ first_name, status: joined|first_sale|gift_active|gift_ended|void, joined_at, first_sale_at?, gift_ends_at? }], totals?: { joined, gifts_earned, fees_saved_cents }, active_gift?: { kind, ends_at, cap_cents, used_cents }, claim?: { eligible, deadline?, reason? }, unseen_gift?: { id, days, cap_cents } }`. `{ enabled: false }` and nothing else while the switch is off.
- `POST /coach/referrals/claim { code }` -> 200 `{ referrer_first_name, welcome_gift: { days, cap_cents } }` or 400 with one of REFERRAL_CODE_INVALID, REFERRAL_CLIENT_CODE, REFERRAL_SELF, REFERRAL_ALREADY_APPLIED, REFERRAL_WINDOW_CLOSED, REFERRAL_HAS_SALES, REFERRAL_SUB_COACH, REFERRAL_NOT_COACH; 5 per minute.
- `POST /coach/referrals/gifts/:id/seen` -> 204 (own gift only, else 404).
- `GET /referrals/:code/preview` (public, 30 per minute per IP) -> `{ valid, referrer_first_name?, business_name? }`; one generic answer for unknown, revoked or switched off.
- `GET /r/:code` (outside /api, SSR). OWNER: `GET /v1/admin/referrals`, `POST /v1/admin/referrals/:id/void { reason }`.
- coach-money: period summary adds `platform_fee_waived_cents` and `referral_gift: { active, ends_at } | null`; each charge adds `platform_bps`.

| # | ID | Repo | Tier (SoT A3) | Goal for coaches | Files (main ones) | New switches | Failing-first tests | Size | Depends on |
|---|---|---|---|---|---|---|---|---|---|
| 1 | REFERRAL-SCHEMA-132 | backend | T4 money, PII, row security | the records exist, private by default, deleted and exported with the account | prisma/schema.prisma (CoachReferralCode, CoachReferral, ReferralFeeGift, nullable ChargeSettlement.referral_gift_id), NEW migration + down.sql (RLS: ENABLE, FORCE, REVOKE anon/authenticated, service-role policy), src/account-deletion/account-deletion.manifest.ts, src/data-export/data-export.service.ts + README, src/common/env-validation.ts, .github/fly-env-desired-state.json (+ gates notes), docs/runbooks/launch-flags.md, NEW src/referrals/referrals.feature.ts, NEW src/referrals/README.md | FEATURE_COACH_REFERRALS, FEATURE_REFERRAL_FEE_GIFTS, both "unset" (only "true" is on) | manifest coverage passes for the three tables; anon/authenticated have no grant (migration text test); fly-env manifest spec; readers on only for "true" | about 400 | FLAG-TOOL-132 (b#884) merged; not in flight with ROMAN-GATES-132 (desired state, env-validation) or ROMAN-ACTIONS-132 (schema, manifest, export) |
| 2 | REFERRAL-CLAIM-132 | backend | T4 tenancy, money attribution | every coach has a code and link; a new coach applies one under strict rules | NEW src/referrals/{referrals.module,referrals.service,referrals.controller,referrals-public.controller,referral-code,referrals.dto}.ts, src/app.module.ts, NEW test/referrals/claim.spec.ts, me.spec.ts, preview.spec.ts | none | each error code above (own code, client code, 31-day-old coach, coach with a settled sale, second claim, sub-coach of the referrer, student); concurrent first GET mints one code; preview identical for unknown, revoked and switched off; /me never contains amounts or client counts (shape test); switch off -> `{enabled:false}` and claim 404 | about 700 | 1 |
| 3 | REFERRAL-GIFT-132 | backend | T4 money | the first real sale grants both gifts and the fee code honours them | NEW src/referrals/referral-gifts.service.ts (grant, stack, end early, void), NEW src/referrals/referral-qualifier.scheduler.ts (every 5 minutes), src/referrals/referrals.module.ts, src/connect/fees/fee-policy.service.ts (resolvePolicy(coachId, { at }) returns 0 bps and the gift id inside an active gift with room under the cap, only when FEATURE_REFERRAL_FEE_GIFTS is "true"), src/connect/fees/charge-settlement.service.ts (pass the charge's created time; conditional update of used_cents; store referral_gift_id) | none | sale inside a gift settles with platform_fee_cents 0 and coach net equal to the existing formula at 0 bps (payouts-v2/platform-fee.service.ts); sale after the window or past the cap -> 2%; two concurrent settlements overshoot the cap by at most one sale; refund of a gifted sale reverses 0 fee and the head-coach share as today; qualifying sale refunded within 30 days ends the referrer gift; buyer = referrer, same Stripe account, under $50, not settled -> no gift; two scheduler runs -> one gift (idempotency key); stacking starts the second gift at the first's end and stops at 12 months; fee switch off -> 2% with an active gift | about 750 (split 3a scheduler+gifts / 3b fee hook if over 800) | 2; check V11_TEAMS_PLAN_132.md for fee-policy.service.ts |
| 4 | REFERRAL-NOTIFY-132 | backend | T4 privacy (another coach's first name and sale event) | the referrer hears about it the moment it happens | src/notifications/notification-kind.ts (REFERRAL_JOINED, REFERRAL_GIFT_EARNED), src/notifications/README.md matrix, NEW src/notifications/emitters/referral.emitter.ts, src/notifications/notifications.module.ts, src/referrals/referrals.controller.ts (gift seen), src/referrals/referral-gifts.service.ts (emit after commit) | none | one push per gift (retry-safe); copy has no "!", no amount, no first person; push preferences and quiet hours respected; seen endpoint 404 for another coach's gift | about 350 | 3; not in flight with ROMAN-OUTREACH-132 (notification-kind.ts) |
| 5 | REFERRAL-LANDING-132 | backend | T3 public page | a link that works on any phone or computer | src/invite-landing/{invite-landing.controller,invite-landing.service,invite-landing.module,well-known.controller}.ts (AASA adds /r/*), src/main.ts (exclude 'r/:code'), src/invite-landing/README.md, docs/invite-landing.md | none | valid code -> page with escaped first name and business name, store buttons, tgp://r/<code>, the code with Copy; unknown, revoked or switched off -> the same generic page; AASA lists /r/*; rate limit | about 300 | 2; check V11_FUNNEL_PLAN_132.md (QR renderer, invite-landing) |
| 6 | REFERRAL-OPS-132 | backend | T4 money | the Money screen can tell the truth; the owner can see and stop abuse | src/coach-money/{coach-money.service,coach-money.controller}.ts (+ dto), NEW src/admin/referrals/{admin-referrals.controller,admin-referrals.module}.ts, src/app.module.ts | none | waived cents for a period with gifted sales; per-charge platform_bps; coach -> 403 on admin routes; void ends the gift, writes an audit row and is idempotent | about 450 | 3 |
| 7 | REFERRAL-SCREEN-M-132 | mobile | T2 | Refer a coach and Referred by a coach? | src/screens/coach/settings/BillingSection.tsx, src/screens/coach/SettingsScreen.tsx (wiring), NEW src/screens/coach/referrals/{CoachReferralsScreen,ApplyReferralSheet}.tsx, NEW src/api/referralsApi.ts, src/navigation/CoachNavigator.tsx (route), src/screens/coach/README.md, src/navigation/README.md, docs/reachability.md | none (server-driven) | rows hidden when `enabled:false`; parity: Business profile still opens CoachTeamProfile; skeleton, calm error (QuietError) with Retry, honest empty line; Share and Copy call the share sheet / clipboard with the link; QR renders the link; every claim error maps to its own sentence; no "!" | about 650 | 2 merged (contract), can build during 2 |
| 8 | REFERRAL-LINK-M-132 | mobile | T2 | tapping a /r/ link lands the code in the app | src/navigation/RootNavigator.tsx (linking route r/:code), app.json (Android intent filter /r), NEW src/lib/pendingReferralCode.ts, src/services/authActions.ts (clear on sign-out), CommandCenter screen file (one sheet mount), README rows | none | tgp://r/CR-... and https://app.trygrowthproject.com/r/CR-... store the code; offered once after coach sign-up with Apply / Not now; never shown to clients; cleared on sign-out | about 350 | 7, 5 (AASA) |
| 9 | REFERRAL-GIFT-M-132 | mobile | T4 money copy | the owner's moment, calm; the fee line is never wrong | NEW src/screens/coach/referrals/ReferralGiftSheet.tsx, CommandCenter screen file (sheet mount), push-tap routing file, src/lib/money/moneyCopy.ts, src/screens/coach/money/{MoneyScreen,MoneyChargeScreen}.tsx, src/api/coachMoneyApi.ts types, README rows | none | sheet once per unseen gift, both actions mark it seen; push tap opens CoachReferrals; fee label shows the true rate and the gift note when waived cents > 0, unchanged when 0; theme tokens only | about 450 | 4, 6, 8 (shares the CommandCenter file) |
| 10 (optional) | CLIENT-REFERRAL-132 | backend | T4 tenancy | a client's invite of a friend is remembered for the coach | prisma/schema.prisma + migration (ClientReferral), manifest, export, src/invite-codes/invite-codes.service.ts (attach records the inviting client from a signed token), coach client detail read | none (rides FEATURE_COACH_REFERRALS) | the coach sees "Joined through <first name>'s invite" only for two of their own clients; the inviting client sees only a count; forged or other-coach token ignored | about 400 | 1 merged; no other schema PR in flight |
| 11 (optional) | CLIENT-REFERRAL-M-132 | mobile | T2 | More > "Invite a friend to train with <coach>" | MoreScreen row, share helper, client detail summary line, README rows | none | row only for clients with a coach and the program on; parity of More rows; honest copy | about 350 | 10 |

### Waves (no two PRs in flight share a file)

| Wave | Start when | PRs | Exclusive files in the wave |
|---|---|---|---|
| 1 | FLAG-TOOL-132 merged and neither ROMAN-GATES-132 nor ROMAN-ACTIONS-132 in flight | 1 | schema, migration, manifest, export, env-validation, desired state, runbook, src/referrals/referrals.feature.ts |
| 2 | 1 merged | 2 (backend), 7 (mobile, against the pinned contract) | 2: new src/referrals/* + app.module.ts; 7: BillingSection, SettingsScreen, CoachNavigator, new referral screens |
| 3 | 2 merged (8 also after 7) | 3, 5, 8 | 3: fee-policy, charge-settlement, referral-gifts, scheduler, referrals.module; 5: invite-landing/*, well-known, main.ts; 8: RootNavigator, app.json, pendingReferralCode, authActions, CommandCenter |
| 4 | 3 merged | 4, 6 | 4: notification-kind, notifications module and README, emitter, referrals.controller, referral-gifts.service; 6: coach-money/*, admin/referrals/*, app.module.ts |
| 5 | 4, 6 and 8 merged | 9 | ReferralGiftSheet, CommandCenter, push routing, moneyCopy, Money screens, coachMoneyApi |
| 6 (optional) | 1 merged and no schema PR in flight | 10, then 11 | schema + invite-codes attach; MoreScreen |

Merge order: 1, 2, 7, 3, 5, 8, 4, 6, 9, then 10, 11. Switch-on order (D10): FEATURE_COACH_REFERRALS after 1-8 merge and the owner
tries a referral on two test coaches; FEATURE_REFERRAL_FEE_GIFTS after 3, 6 and 9 and one gifted test sale is checked line by line.
Overlap check (board 13:47): open b#882-b#887, m#573, m#575 touch none of these files except b#884 (desired state), which wave 1 waits
for. Roman v1.1 (/home/user/workspace/ops/V11_PLAN_132.md): shares desired state and env-validation with ROMAN-GATES-132, schema /
manifest / export with ROMAN-ACTIONS-132, notification-kind.ts with ROMAN-OUTREACH-132; app.module.ts may be touched by Roman PRs that
add modules. The operator re-checks V11_FUNNEL_PLAN_132.md (invite-landing, QR) and V11_TEAMS_PLAN_132.md (fee-policy, head-coach
split) at launch; those files were not written when this plan was.

## A8. Ready-to-paste JOBS132 entries

```
## REFERRAL-SCHEMA-132 (builder RF1, Claude Opus 5.5, backend, T4 money/PII/row security; one PR; time box 75 minutes)
Worktree /home/user/workspace/wt/REFERRAL-SCHEMA-132-backend, branch agent132/referral-schema-132 (off backend main). LEFTHOOK=0.
Waits for FLAG-TOOL-132 to merge; must not be in flight with ROMAN-GATES-132 or ROMAN-ACTIONS-132 (shared files): build now,
`git merge origin/main`, then open. PR 1 of /home/user/workspace/ops/V11_REFERRAL_PLAN_132.md section A7. Tables CoachReferralCode
(coach_id unique, code unique, revoked_at), CoachReferral (referrer_coach_id, referred_coach_id unique, code_id, status
claimed|qualified|gifted|void, claimed_at, first_sale_charge_id, first_sale_at, qualified_at, void_reason, voided_at, voided_by),
ReferralFeeGift (coach_id, referral_id, kind referrer|welcome, starts_at, ends_at, open_until, cap_cents, used_cents default 0, status
active|ended|void, ended_reason, idempotency_key unique, seen_at) and nullable ChargeSettlement.referral_gift_id. Migration + down.sql
with ENABLE/FORCE RLS, REVOKE ALL FROM anon, authenticated, service-role policy (pattern: 20270402000000_coach_playbook:93-100).
Manifest entries (gift and code rows of the deleted coach deleted; a surviving coach's gift keeps dates and amounts only), export
entries (own code, referrals made with first names and statuses, gifts). Switches FEATURE_COACH_REFERRALS and
FEATURE_REFERRAL_FEE_GIFTS: ENV_RULES (only "true" is on), "unset" rows and gates notes in .github/fly-env-desired-state.json
("off until both lenses and the owner say yes"), runbook rows. Failing-first tests listed in A7 row 1. Under 800 lines. READY. End.

## REFERRAL-CLAIM-132 (builder RF1 again after REFERRAL-SCHEMA-132 merges, Claude Opus 5.5, backend, T4 tenancy; one PR; 2 h)
Worktree /home/user/workspace/wt/REFERRAL-CLAIM-132-backend, branch agent132/referral-claim-132. PR 2 of A7. Endpoints and error codes
exactly as the pinned contract (A7 top). Codes CR- + 8 chars (no 0, O, 1, I, L), minted on first GET /coach/referrals/me with a
conditional insert (one code per coach under concurrency). Claim rules: caller role coach (not owner, not student), code active and not
own, account created at most 30 days ago, no ChargeSettlement for the caller, no existing CoachReferral, not a sub-coach of the
referrer (TeamSubCoachAssignment and SubCoachAssignment, read only), email differs (normalizeEmail, src/auth/email-normalize.ts). Claim creates the referral and the welcome gift (starts
now, open_until +180 days, ends_at null until the first sale) in one transaction with AuditEvent referral.claimed. Public preview: first
name and business name only, one generic invalid answer, throttled. Responses never carry amounts or client counts. Failing-first
tests in A7 row 2. Under 800 lines. READY. End.

## REFERRAL-GIFT-132 (builder RF2, Claude Opus 5.5, backend, T4 money; one PR, or 3a/3b if over 800 lines; 3 h)
Worktree /home/user/workspace/wt/REFERRAL-GIFT-132-backend, branch agent132/referral-gift-132; after REFERRAL-CLAIM-132 merges.
Scheduler every 5 minutes while FEATURE_COACH_REFERRALS is "true": a claimed referral qualifies on the referred coach's first
ChargeSettlement (coach_user_id = referred coach) with settled_at set, gross_cents >= 5000, refunded_cents 0 and
dispute_withdrawn_cents 0, whose ClientPurchase buyer is neither coach (id and email), seller's Connect account charges-enabled and
different from the referrer's. Then, idempotent (key referrer_gift:<referral id>): referrer gift
90 days, cap 25000 cents, starting at the later of now and the end of the referrer's last gift, refused beyond 365 days ahead; welcome
gift ends_at = first sale + 60 days, cap 10000 cents. End early: qualifying sale refunded or disputed within 30 days -> referrer gift
ended today (reason recorded), no charge-back. voidReferral(id, reason, actor) for the owner route. Fee hook: resolvePolicy(coachId,
{ at: charge created }) returns platform 0 bps and the gift id only when FEATURE_REFERRAL_FEE_GIFTS is "true" and an active gift covers
`at` with used_cents < cap; settlement adds the would-be 2% to used_cents with a conditional update and stores referral_gift_id; a lost
update falls back to the normal rate. Head-coach split untouched. List every resolvePolicy caller first (`rg -n resolvePolicy src`;
charge-settlement.service.ts:594 and :2080 at cd0f90ed) and pass `at` in each; if any path sets a Stripe fee before settlement, it
applies the gift the same way, with a test. AuditEvents referral.qualified, referral.gift_granted,
referral.gift_ended. Failing-first tests in A7 row 3. READY. End.

## REFERRAL-NOTIFY-132 (builder RF2 again after REFERRAL-GIFT-132 merges, Claude Opus 5.5, backend, T4 privacy; one PR; 90 minutes)
Worktree /home/user/workspace/wt/REFERRAL-NOTIFY-132-backend, branch agent132/referral-notify-132. Not in flight with
ROMAN-OUTREACH-132 (notification-kind.ts). Kinds REFERRAL_JOINED ("<first name> joined TGP with your link.") and REFERRAL_GIFT_EARNED
("Your referral made their first sale. A gift from TGP: no TGP fee on your sales for 90 days."), emitted after commit, once per row,
following push preferences and quiet hours; README matrix row; POST /coach/referrals/gifts/:id/seen. Copy: no "!", no first person, no
amounts. Failing-first tests in A7 row 4. READY. End.

## REFERRAL-LANDING-132 (builder RF3, Claude Opus 5.5, backend, T3 public page; one PR; 90 minutes)
Worktree /home/user/workspace/wt/REFERRAL-LANDING-132-backend, branch agent132/referral-landing-132; after REFERRAL-CLAIM-132 merges.
Read V11_FUNNEL_PLAN_132.md first: reuse its QR renderer if merged, else show the short link and the code. GET /r/:code SSR in
src/invite-landing (same escaping and accent rules), excluded from /api in main.ts, AASA /r/* in well-known.controller.ts. Page: one
Cormorant title "<first name> invited you to coach on TGP", one sentence on the welcome gift, App Store and Google Play buttons,
"Open in the app" (tgp://r/<code>), the code with Copy. Generic page for unknown, revoked or switched off. Failing-first tests in A7
row 5. READY. End.

## REFERRAL-OPS-132 (builder RF3 again after REFERRAL-GIFT-132 merges, Claude Opus 5.5, backend, T4 money; one PR; 90 minutes)
Worktree /home/user/workspace/wt/REFERRAL-OPS-132-backend, branch agent132/referral-ops-132. coach-money summary adds
platform_fee_waived_cents and referral_gift; charges add platform_bps (from ChargeSettlement). OWNER-only GET /v1/admin/referrals
(statuses, gifts, fees waived, counts) and POST /v1/admin/referrals/:id/void { reason } calling voidReferral. Failing-first tests in A7
row 6. READY. End.

## REFERRAL-SCREEN-M-132 (builder RF4, GPT-6.1 Sol, mobile, T2; one PR; 2 h)
Worktree /home/user/workspace/wt/REFERRAL-SCREEN-M-132-mobile, branch agent132/referral-screen-m-132 (off mobile main); may build
while REFERRAL-CLAIM-132 is in review, READY after it merges (contract in A7). Settings > Business rows "Refer a coach" and "Referred
by a coach?", CoachReferrals screen and ApplyReferralSheet exactly as A2/A3/A4 (one forest action "Share your link"; Copy and Show QR
code as text actions using CodeQr; statuses in words; fees saved in tabular numerals; skeleton; calm error). Mobile redo rules apply
(parity table, truthful sweep, README row, reachability row). Failing-first tests in A7 row 7. READY. End.

## REFERRAL-LINK-M-132 (builder RF4 again after REFERRAL-SCREEN-M-132 and REFERRAL-LANDING-132 merge, GPT-6.1 Sol, mobile, T2; 90 min)
Worktree /home/user/workspace/wt/REFERRAL-LINK-M-132-mobile, branch agent132/referral-link-m-132. Linking route r/:code for all three
prefixes, Android intent filter /r in app.json (ships in the next native build), NEW src/lib/pendingReferralCode.ts (same shape as
pendingInviteCode.ts, cleared on sign-out), one sheet after coach sign-up "Apply <first name>'s referral code?" with Apply / Not now.
Failing-first tests in A7 row 8. READY. End.

## REFERRAL-GIFT-M-132 (builder RF5, Claude Opus 5.5, mobile, T4 money copy; one PR; 2 h)
Worktree /home/user/workspace/wt/REFERRAL-GIFT-M-132-mobile, branch agent132/referral-gift-m-132; after REFERRAL-NOTIFY-132,
REFERRAL-OPS-132 and REFERRAL-LINK-M-132 merge. ReferralGiftSheet (A2 copy after the owner's D1 answer; single fade; radius 4), push tap
and Notification Center routing to CoachReferrals, Money label from per-charge platform_bps and the gift note. Failing-first tests in
A7 row 9. READY. End.

## CLIENT-REFERRAL-132 and CLIENT-REFERRAL-M-132 (optional, only if the owner says yes to D6; Claude Opus 5.5 backend T4, Sol mobile T2)
Worktrees /home/user/workspace/wt/CLIENT-REFERRAL-132-backend and /home/user/workspace/wt/CLIENT-REFERRAL-M-132-mobile, branches
agent132/client-referral-132 and agent132/client-referral-m-132. Scope in A7 rows 10-11. Backend first; no other schema PR in flight.
```

## A9. Owner decisions (recommended defaults)

| # | Decision | Default |
|---|---|---|
| D1 | The popup copy. The owner's words have "!" and "a gift from us"; the doctrine bans "!" (QL4) and first person (copy rule 14), and full-screen celebrations (QL3) | Calm sheet: "Your referral made their first sale." / "A gift from TGP: no TGP fee on your sales for 90 days, up to $250 in fees." Buttons "See your gift", "Close". |
| D2 | The free TGP shirt (cash for shirts and postage, a print vendor or hand shipping, stored addresses = PII) | Not in v1.1. If yes later: the owner ships by hand from an OWNER list with addresses kept only until shipped (1 backend + 1 mobile PR, T4 PII). |
| D3 | Gift sizes and bars | Referrer 90 days, cap $250 of fees; new coach 60 days from first sale, cap $100, offer open 180 days; first sale at least $50; claim within 30 days; end early on refund within 30 days; at most 12 months banked. Constants in code so a change is a small PR. |
| D4 | Any cash reward (rivals pay 10-30%, $75 flat, or one month's fee) | No cash in v1.1. Revisit with real numbers after 90 days (PART B idea 8). |
| D5 | Switching the program off | Stops new codes, claims and gifts; gifts already granted keep working until they end (a gift is a promise). The separate FEATURE_REFERRAL_FEE_GIFTS stays as the emergency stop for the fee code. |
| D6 | Client referrals | Optional wave 6: attribution only; no TGP-funded client reward; coach-funded rewards are PART B idea 6. |
| D7 | What the referrer sees | First name, status and dates only; the new coach is told before applying. |
| D8 | A12's "referral leaderboard" for coaches | Not in v1.1 (peer ranking; PART B idea 7, opt-in). |
| D9 | /r/* universal links need app.json and AASA changes | Ride the next native build (Android APK and iOS); until then "Open in the app" uses tgp://r/<code>. |
| D10 | Switch-on order | Program first (attribution), fee gifts after one checked test sale. |

No production writes, no new paid vendor, no Stripe changes. Health data is not involved.

---

# PART B: additional ideas, pitched separately (optional; none of this is in PART A)

| # | Idea in plain words | Why it makes TGP superior | Rival gap it exploits | Size | Cost | Depends on |
|---|---|---|---|---|---|---|
| 1 | "Start with my setup": when a code is applied, the new coach may copy the referrer's chosen programme template and package structure (with the referrer's yes) | turns a referral into a working business on day one; time to first sale drops | none of the rival programs read for this plan offers it | 2 PRs (b T4 tenancy, m T2) | none | PART A 2; MWB templates (FEATURE_MWB_TEMPLATES true) |
| 2 | Mentor channel: a 30-day DM thread between referrer and new coach, opt-in both sides | peer onboarding that software alone cannot give; raises activation | the rival programs read stop at the reward | 1-2 PRs | none | messaging core v2 (on) |
| 3 | Partner tier for coaches with 5+ qualified referrals: a "Partner" label in the doctrine's one tier accent (camel hairline, muted gold label) and a lower take rate, for example 1.5% for 12 months | rewards TGP's best acquisition channel in its own currency | Kajabi/Trainerize tiers are cash | 1-2 PRs (T4 money) | forgone fee only; pricing change = owner decision | PART A 3 |
| 4 | Referral moment: one quiet line in the coach home after a coach's first $1,000 month: "Know a coach who would like this? Refer a coach", at most once a month | asks at the moment of proof, not at random | rival links sit in menus (Trainerize More > "Earn Free Months", Everfit's "$" menu) | 1 PR (m T2) + 1 small read | none | PART A 7; coach-money |
| 5 | AI invite in the coach's own tone: an AI draft of the referral message for Instagram DM or text, which the coach edits and sends | AI-native (A7.5: "AI drafts give one coach the ..."): zero writing effort, the coach stays the author | none of the rival programs read drafts the invite | 1-2 PRs | AI tokens (cash, small): owner decision | coach AI drafts; some coach AI routes require tier pro today (src/ai/coach/coach-ai-execution.controller.ts:155) and Pro is unsold |
| 6 | Coach-funded client rewards: the coach chooses "a free week" or "$X off next month" for a client who brings a friend; applied on the coach's own Stripe plan | client referrals with real rewards that cost TGP nothing | Trainerize's Client Referrals banner tracks who referred whom, but the reward is left to the trainer ([Trainerize blog](https://www.trainerize.com/blog/client-referrals/)) | 3 PRs (T4 money, Stripe coupons on connected accounts) | none to TGP | PART A 10-11 |
| 7 | Opt-in referral list among coaches (monthly, first names and counts, no trophies) | A12 asks for a referral leaderboard; this is the calm, opt-in version | Kajabi's Partner Leaderboard sits inside a cash partner dashboard ([Kajabi help](https://help.kajabi.com/en/articles/17175735-become-a-kajabi-partner)) | 1-2 PRs | none | PART A 2; owner decision on peer ranking |
| 8 | Cash partner program for educators and certification bodies (rival example: TrueCoach offers ISSA coaches 3 months for $1 each, [ISSA blog](https://www.issaonline.com/blog/post/how-to-launch-a-successful-online-personal-training-business)), paid by Stripe Connect transfer, no new vendor | reaches coaches before they pick a platform | rivals rely on third-party affiliate tools | 2-3 PRs (T4 money, tax forms) | cash: owner decision | 90 days of PART A data |

---

## Sources read
- /home/user/workspace/tgp-agent-context/roadmap/specs/A12-referrals.md; SoT A3 (lines 338-420), A6 (1187-1235), A7.5 (1674-1712),
  C1 rows 09-30 11:47 and 10-06 14:25 (rg "take rate"); handoffs/op-131/ops/_COMMON_131.md:240-310.
- Backend at cd0f90ed: src/auth/auth.service.ts, auth.dto.ts, src/billing/*, src/connect/fees/fee-policy.service.ts,
  charge-settlement.service.ts, src/payouts-v2/platform-fee.service.ts, src/share-link/*, src/invite-landing/*, src/main.ts,
  src/notifications/coach-first-payment.service.ts, notification-kind.ts, src/account-deletion/account-deletion.manifest.ts,
  prisma/schema.prisma, prisma/migrations/20260614000000_coach_subscription_tier, 20270402000000_coach_playbook,
  .github/fly-env-desired-state.json.
- Mobile at edf36a88: docs/reachability.md, docs/QUIET_LUXURY_DOCTRINE.md, docs/share-card.md, docs/HAPTICS.md,
  src/screens/coach/SettingsScreen.tsx, settings/BillingSection.tsx, src/lib/money/moneyCopy.ts, screens/coach/money/MoneyScreen.tsx,
  src/lib/pendingInviteCode.ts, src/navigation/RootNavigator.tsx, app.json, src/analytics/events.ts.
- /home/user/workspace/ops/board/board.md (13:47), /home/user/workspace/ops/V11_PLAN_132.md, ops/reports/V11-FUNNEL-PLAN-132.notes.md.
- Web: the rival and Apple links cited in A2, A5 and PART B.
