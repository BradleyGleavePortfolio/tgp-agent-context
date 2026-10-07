# Notes for operator agent 129 (from agent 128, written 15:03 PDT 2026-10-07; GitHub main wins, verify every head)
Read with: TGP_SOURCE_OF_TRUTH.md A1/A2/A3/A6, handoffs/op-127/HANDOFF.md, ops/_COMMON_128.md + ops/JOBS128.md (this folder),
STOPPED_HALFWAY.md (this folder: every unfinished agent, PR and report), ops/FLEET.md (minute-by-minute operator log).

## Owner's words today that set your first hours (verbatim)
- 14:39: playbook "pull it from the coachs AI pool"; "Log this meal": "yes!"; coach recipe writing: "lets get IOS submission tonight, this tmrw";
  lists: "grocery lsit is what to buy this week, shopping lsit is just useless no? Its the same thing - merge them/ cut one and keep one. Also
  make sure the whole meal prep and shopping lsits makes eating healthy SIMPLE AND EASY, not a pain in the ass system to use that has missing
  images for meals or weird bugs!"; allergy filtering: "absolutely neccesary!"
- 14:40: "the only thing between us and IOS submission is just a final APK build with all mobile UI updates, tester account creation, and thats it!"
- 14:58: "coaches HAVE to be able to issue refunds - they hsopuld see per client payments and be able to pause reccuring payments, cancel
  payments, make refunds, ect." / payment email replies: "coaches can read it no?" / empty exercise library "wtf!?!" / no resend of the
  sign-up email "WTF!?!" / "why is all of this basic shit so broken? NOTATE FOR AGENT 129 and get to work fixing this broken BULLSHIT!"
- 14:58: allergy filtering, "Log this meal", single grocery list, sign-up email resend, rest of the audit fixes: "nope agent 129 needs to
  finish this asap!"
- 14:58: "Build cutoff: cut tonight's builds from mobile main at 11pm PDT seattle time"
- 14:58 (mid-workout): "it should cancel it if you exit the screen/app, and it should just give an option that deletes the mid session
  workout!" Agent 128 read this as: never lose the workout on leaving; deleting is its own clearly named action (job TRAIN-GATE-128).
  Confirm with the owner if the PR's behaviour is questioned.

## Your priority list, in order
1. Tonight's iOS submission (cutoff 23:00 PDT mobile main): merge every dual-approved mobile PR before 23:00; then from that exact main:
   iOS store build on Expo (free plan only; App Store Connect key, signing and push key are already in Expo per SoT A6.5; eas.json has no
   submit profile; app.json ios.buildNumber is 6 and appVersionSource is local, so bump buildNumber in a PR first), TestFlight upload,
   final APK (copy .github/workflows/apk-127.yml from branch ci/APK-127-2 to a new ci/APK-129-1 branch, set APP_SHA/APP_SHORT; never merge
   ci/*), App Store screenshots (branch ci/SHOTS-127-2 workflow, re-run on final main). Tester accounts: the owner creates them (coach +
   client of that coach with an ACTIVE package, because food and fasting are paid-only; one meal plan and one workout assigned).
   EXPO: SoT line ~4195 describes the proxy setup used for the Android build (EXPO_TOKEN proxy-injected; api.expo.dev only).
2. FIXWAVE-128 PRs (owner-ordered, see JOBS128.md): WEIGH-KB (iPhone Log weight), TRAIN-GATE (workout survives leaving the app),
   ONB-RESEND (resend sign-up email), MONEY-MAIL (payment email replies reach the coach), EXLIB (exercise library shows real exercises;
   production ExerciseCatalogItem = 0 rows), REFUND-COPY (interim honest refund line). Review, fix, merge before 23:00.
3. Coach payment controls (owner 14:58): per-client payments list, refund (full/partial), pause/resume and cancel recurring payments, for
   coaches. T4 money: Opus builder, dual lenses, under 800 lines per PR (backend endpoints coach-scoped + Stripe on the platform account
   with transfer reversal; mobile coach screen). Then switch the refund line back to "your coach handles refunds" once true.
4. Allergy filtering (owner: "absolutely necessary"): design input in reports/ALLERGY-128.md (shared allergen list, author-declared
   allergens on recipes and meal templates, hide only on a declared match, label undeclared, keep the "check ingredients" line, never
   keyword guessing). Backend + mobile.
5. "Log this meal" (owner YES): job NUTR-LOGPLAN-128 in reports/NUTR-AUD-128.md (Opus; after mobile#490 merges).
6. One grocery list (owner: merge or cut Shopping), simple and easy meal prep, no missing meal images: reports/NUTR-AUD-128.md + the
   merged prep fixes (b#853 NUTR-BE, FIX-500-128 mobile).
7. The rest: every fix-job row in reports/FW-*.md and reports/DESIGN-QA-128.md (STOPPED_HALFWAY.md section F).

## Roman (owner: memory on by default; decision 14:25 "turn on memory and the coach playbook as soon as the coach wording is live")
- Deploy 25 (c7caffff, 14:54) is live with every R11 fix and the coach-method wording (b#850).
- FEATURE_ROMAN_TOOLS: b#851 merged; fly-env-sync plan run 37692653210 started 14:58 (then apply, then verify in-machine value + a real
  answer). If agent 128 did not finish apply/verify, do it.
- R11-FIX b#856 (tools loop 50 s deadline + consent-first notes read): READY 15:01, 225 lines (operator recommends accepting the size).
- FEATURE_ROMAN_MEMORY: PR from FLIP-MEM-PB-128 (check b#854/b#855). Goes on after review; only clients on builds with the new consent box
  can grant it (tonight's build brings it to iOS).
- FEATURE_ROMAN_PLAYBOOK: owner keeps billing on the coach pool; needs mobile#513 (coach credits line; has an Opus REQUEST CHANGES) merged,
  then the playbook flag PR.

## Production and process facts
- Production backend: deploy 25 = c7caffff (run 37691740962; the first try 37691195804 failed on "flyctl: command not found" after a green
  setup-flyctl step; a plain retry worked).
- Merged today by 15:01: 83. Deployed today: 7.
- Owner 14:33: drain to about 10 agents; owner 14:44 credits 29k/45k; owner 14:58 ordered the fix wave anyway.
- Sandbox: 2 CPUs, 8 GB; ops/heavy.sh has 2 slots; load climbs to 8-9 when 20 agents start together (memory stays fine).
