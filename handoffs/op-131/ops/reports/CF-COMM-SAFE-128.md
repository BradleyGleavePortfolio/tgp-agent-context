# CF-COMM-SAFE-128 (agent 129 CLIENTFIX, Claude Opus 5.5, T3 safety) — FW-COMM-128:FWC-SAFE-128

Status (16:38 PDT): STOPPED by operator (owner 16:35, credits). Both PRs pushed; READY not posted on either.
Two PRs (one per repo), branch agent129/cf-comm-safe-128 in both.

## Scope traced
- Row: self-harm report shows 988/911 (FW-COMM-128 U11); leaderboard names filtered (U10).
- Mobile main a1be6fb2: every community Report goes through src/components/community/SafetyMenu.tsx (posts, replies, wins, voice
  notes, challenges, DMs). "Report sent" body = COMMUNITY_REPORT_SENT_MESSAGE for every reason (SafetyMenu.tsx:96,
  communitySafetyApi.ts:77-78). No crisis line after "Self-harm or suicide".
- Backend main c3324d4a: POST /me/leaderboard/opt-in stores displayName raw (leaderboard.service.ts:216-235) and GET
  /me/leaderboard shows it to every opted-in peer (resolveDisplayName :362-374). No content filter.
- Mobile leaderboard screens catch every opt-in error as "Could not save ... Try again." (LeaderboardScreen.tsx:276-277,
  LeaderboardSettingsScreen.tsx:136-139, :155-156): a filtered name would loop on "Try again" unless the server reason is shown.
- Open PRs touching these files: none (git diff --name-only for all 16 board branches at 16:09; list in
  ops/work/CF-COMM-SAFE-128/open-pr-files-1609.txt).

## Plan (minimal)
- (DONE) Mobile: communitySafetyApi.ts adds COMMUNITY_REPORT_CRISIS_LINE + communityReportSentMessage(reason); SafetyMenu uses it
  (self_harm: crisis line first, then the unchanged 24-hour line). Leaderboard screens show contentRejectedMessage(err) when the
  server refuses a name (422 community.content.rejected), generic copy otherwise. READMEs: components/README.md, LEADERBOARD.md.
- (DONE) Backend: leaderboard.service.ts runs checkCommunityText (pure function, so leaderboard.module.ts needs no change) on displayName
  in setOptIn -> 422 { code: community.content.rejected, message: display-name copy }; a stored name that fails is never shown
  (derived "First L." instead). README src/leaderboard/README.md.

## Failing-first (local, on main source, 16:23-16:25)
- SafetyMenu.test.tsx: self-harm test FAILS on main (Report sent shows only the 24-hour line).
- leaderboardNameRejected.test.tsx (new): 3 rejection tests FAIL on main (generic "Could not save ..." shown); generic-failure
  control passes.

## B list
None proven (auditor graded both U; the self-harm crisis line is a safety-routing gap, fixed here).

## U list
- U11 (FW-COMM-128): no 988/911 on the self-harm Report sent confirmation. Fixing (mobile PR).
- U10 (FW-COMM-128): leaderboard display name unfiltered. Fixing (backend PR + mobile message wire-in).

## C one-liners
- Threats or violence report could also lead with 911 (the DM report sheet does); not in this row. C.
- A failed self-harm report (offline) shows no crisis line. C (edge, deferred to 10k clients).
- Account names (sign-up) are not filtered anywhere (community first names, leaderboard derived name). C (sign-up scope).

## PRs
- mobile: growth-project-mobile#529 @ eed587f00963afb7e8b3eec0c09b799e70cdfcdb, 210 lines (195+/15-), 9 files, CI pending, no READY yet.
  Body: ops/reports/CF-COMM-SAFE-128-mobile-pr-body.md. Local: SafetyMenu 14/14, communitySafetyApi 15/15, leaderboardNameRejected 4/4.
- backend: growth-project-backend#863 @ 381fdda0786c1484cadf1559cd287fc381a91d06, 81 lines (76+/5-), 3 files, CI pending, no READY yet.
  Body: ops/reports/CF-COMM-SAFE-128-backend-pr-body.md. Local: test/leaderboard.service.spec.ts 17/17 (2 failed on main first).

## Not fixed (needs operator)
None yet.

## HANDOFF
- Branch agent129/cf-comm-safe-128 in both repos; nothing unpushed. m#529 @ eed587f00963afb7e8b3eec0c09b799e70cdfcdb (210 lines, CI green/CLEAN at 16:37); b#863 @ 381fdda0786c1484cadf1559cd287fc381a91d06 (81 lines, CI still running at 16:37: build-and-test, CodeQL, rls/mwb live tests).
- Done: self-harm "Report sent" leads with 911 + 988 (SafetyMenu, every community surface); leaderboard display names filtered on save (422 community.content.rejected) and on read (fallback "First L."); mobile shows the server reason. Failing-first proven locally for both; targeted tests green.
- Left: post READY on m#529 now (text: ops/reports/CF-COMM-SAFE-128-mobile-ready.md), and on b#863 once its CI is green (text: CF-COMM-SAFE-128-backend-ready.md). First line exactly as in those files; re-check each head first. Then the lenses review.
