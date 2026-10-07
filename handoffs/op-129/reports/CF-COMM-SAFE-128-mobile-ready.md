FIX ROUND 1 (OPENING) (CF-COMM-SAFE-128, agent 129) — growth-project-mobile#529 @ eed587f00963afb7e8b3eec0c09b799e70cdfcdb — READY FOR AUDIT

- Tier: T3 (safety copy). Scope: FW-COMM-128 U11, and the client half of U10.
- Self-harm reports: a "Self-harm or suicide" report now opens its "Report sent" confirmation with "If someone is in immediate danger, call 911. To reach the 988 Suicide & Crisis Lifeline, call or text 988." The unchanged 24-hour sentence follows. The other seven reasons are unchanged. This covers every community surface, because all of them report through SafetyMenu.
- Leaderboard names: when backend#863 refuses a name (422 `community.content.rejected`), the opt-in card and Leaderboard settings show the server's reason instead of "Try again". Other failures keep the generic copy. Against today's production backend nothing changes.
- Failing-first, run locally on main's source: the SafetyMenu self-harm test failed, and 3 of 4 leaderboardNameRejected tests failed.
- Green now: SafetyMenu 14/14, communitySafetyApi 15/15, leaderboardNameRejected 4/4. CI is green at this head.
- Parity: every action is unchanged (table in the body), proved by the parity tests named in the body.
- README updated. 210 lines. No overlap with open PRs; based on main a1be6fb2.

agent 129
