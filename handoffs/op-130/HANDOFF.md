# Operator agent 130 HANDOFF (stopped 19:4x PDT 10-07 on the owner's word: credits 44k/45k used)

## State (verified on GitHub)
- Production backend = main 80cebd11 (deploy 32, run 37718087590, 19:32, /health + /readyz ok). Deploy 31 (19:16) applied
  migration 20270404000000_recipe_declared_allergens. Deployed today: 14. Merged today: 136. Launch path 6/7.
- Mobile main 4e9116b5. All four iOS build PRs merged: #26 m#543, #27 m#541, #28 m#539, #33 m#533. iOS build 7 NOT cut.

## iOS build (owner's time; owner's TestFlight approval)
- `eas build -p ios --profile clinic --auto-submit --non-interactive` from mobile main (ascAppId 6765847915, buildNumber 7).
- The owner DECLINED the Expo token form at 19:42: the owner cuts the build, or gives agent 131 the token in the secure form.
  Agent tooling: eas-cli with build/fetch.js patched so only api.expo.dev uses the proxy agent; EXPO_TOKEN=proxy-injected (SoT ~4244).

## Merge holds
- b#871 (failed-payment copy, dual approved): only after the owner's yes.
- b#872 (coach AI respects sharing): unposted Sol B in reports/LN-SOL-B-130-b872-verdict.txt (cached today/history coach briefs
  return named health details after sharing is revoked; coach-brief.service.ts:1724-1725, 2014, 2096-2109). Needs a FIX ROUND and
  both lenses at the new head.
- m#537 (settings): dual approved at 6e4ca3c1 but conflicts after m#543; merge-main round, then lens check.

## Open PRs
- Backend: b#855 (playbook switch-on; FIX-OPUS was preparing), b#865 (SHARE-GATE, Sol RC), b#870 (CREDIT-REFILL rollover fix,
  Sol RC), b#873 (coach Roman honesty, READY 19:33).
- Mobile: m#542 (Train tab, both RC; Opus fix = `initial: false` in openInMoreTab), m#544 (allergy, Opus APPROVE), m#545 (coach
  payments screen, flag off, Opus APPROVE).
- Builders stopped mid-work (see branches/reports): CREDIT-METER-130 (per-call rounding, additive migration), CREDIT-PAY-130
  (refill buttons; merge only after owner yes), COACH-ROMAN-ROW-130 (coach Settings Roman row copy), COACH-ROW-SCRUB-130 (waits
  b#865), FAST-CALM-FIN-130 (waits m#537).

## Roman playbook sequence
Steps 1-2 done (b#867 deployed 19:16, m#513 merged 19:16). Left: b#855 merged after it merges main -> fly-env-sync apply -> tester
check. Roman memory check with the tester still owed.

## Owner decisions open (defaults)
Failed-payment copy b#871 (yes); iOS build time (23:00); refills on iPhone (US App Store shows packs, Stripe checkout in Safari;
Android hidden; Roman offers packs only where buyable); Stripe Dashboard check (live webhook with checkout.session.completed and
.expired; production has 0 processed Stripe events ever); Supabase Apple provider (off) and Google redirect tgp://auth/callback;
tester accounts, privacy labels, TestFlight approval; playbook 6-hour limit counts charged failed attempts (yes); coach refunds:
warn before a full refund, no buttons for sub-coaches, clients told when their plan is paused or cancelled (yes); no-coach screen
wording (keep new); unused pack credit carries over (yes); roman-post-check fix (yes).

## Credit refills (owner's lane 38)
Quote = checkout = credit = face value; TGP hard cost = face / 3.125. B1 fixed in b#870; B2 per-call rounding (up to 6.25x) in
CREDIT-METER-130; B3 no shipped build can buy a refill (CREDIT-PAY-130). 0 purchases ever. Report: reports/CREDIT-REFILL-130.md.
