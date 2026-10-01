# Lane AUD-SOL2 — GPT-6.1 Sol independent audit lens, agent 109 wave 2

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first (audit contract, sandbox limits). You are an auditor: never push
code, never merge, never touch production. One verdict comment per PR at its exact head (re-check the head right before
posting). Append each result to /home/user/workspace/ops/reports/AUD-SOL.md as you go (it holds wave-1 results).

1. Backend #625 (P0: production schema drift — production DB lacks tables ListItem, Recipe, SavedRecipe, UserPreferences
   and columns User.archived_at, UserProfile.{bio, weight_unit, meals_per_day, water_goal_oz, calorie_display,
   onboardingCompleted}, NotificationPreferences.{daily_checkin_enabled, weekly_summary_enabled, new_client_alerts};
   "column User.archived_at does not exist" breaks every signup/login in production). T4. Builder lane B-DRIFT may still be
   pushing: before auditing, wait until /home/user/workspace/ops/reports/B-DRIFT.md exists or the PR body has its final
   fix-round/tier header, then audit the head at that moment. Evidence: /home/user/workspace/ops/prod_schema_drift_20261001.json
   (operator's read-only diff of prod vs schema.prisma). Judge: completeness vs schema.prisma (every model/column/enum/index/FK
   the app reads), additive and idempotent SQL (IF NOT EXISTS, no data loss, no table rewrite/long locks on User), defaults
   and nullability matching Prisma, RLS on new public tables consistent with existing policy, down.sql safety, the parity gate
   (would it have caught this; is it honest), and whether migrate deploy order on Fly can fail mid-way.
2. Mobile #306 @ a81a6c8 (role choice at signup + owner 13:28 open-signup copy + error mapping, T4 authorization). Prior
   findings: Sol B-306-1/2/3, C-306-4; Opus B-306-1, C-306-1..4 — builder report /home/user/workspace/ops/reports/B-306.md
   (Opus C-306-1 is only partly fixed: attempts with no email still match by sign-in method for 30 minutes — judge it).
   Owner rules: open signup for every role, codes optional, coachless client is first-class, no generic or vague errors.
3. Then wait for messages from the operator with further items (expect #622 delta after it is updated onto main).
Final answer: per PR verdict, head, A/B/C counts, one-line reason for any non-APPROVE.
