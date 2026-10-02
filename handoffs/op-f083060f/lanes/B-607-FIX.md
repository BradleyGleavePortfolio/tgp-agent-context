# Lane B-607-FIX (agent 110) — Claude Opus 5.5 builder: #607 INT-607-1 tenancy fix + #609 T4 readiness

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first, then /home/user/workspace/ops/reports/B-TRAIN-2-110.md (forward-merge
proof, INT-607-1) and ops/reports/btrain2/{607,609}-body.forward-merge.md (ready fix-round sections for the PR bodies).
State: backend #607 head d6ac47e8 (C05/C07 intake, onboarding completion, coach consultation view; migration
20270212000000_clinic_onboarding_intake; T4; dual-audited before the forward merge). #609 head 5fd61a1b (coach welcome message +
workout reminders; stacked on #607; migration 20270213000000; header says T3 -> re-grade T4: new tables + RLS + schedulers).
1. INT-607-1 (A, tenancy/privacy): #607's consultation-read rule in BOTH the API and the RLS SQL helper treats a bare coach_id on
   the client's coach as head-coach membership. Main's #597 requires an explicit membership row (guest checkouts created phantom
   sub-coaches). Apply main's exact membership rule in both places (edit #607's own unmerged migration in place; it is not deployed),
   with phantom-chain regression tests (API + live RLS test in the rls-live-tests job pattern): a phantom head coach must not read
   another coach's clients' screening answers; real head coach / assigned sub-coach / owner still can.
2. #609: register COACH_WELCOME_SCHEDULER_ENABLED, WORKOUT_REMINDERS_ENABLED, WORKOUT_REMINDER_CRON wherever main registers env names
   (env schema/validation, expected env manifest, docs; safe defaults OFF), add live RLS tests for #609's new tables, re-grade the
   tier header to T4, then merge #607's new head into #609 (no rebase; fast-forward push).
3. PR bodies: add the forward-merge section (from the btrain2 files) plus your fix-round table to each body, tier headers current.
   If any body edit is refused by a safety check, do not retry or work around it: put the text in your report and say so.
Never merge, never push main or other lanes' branches. Tests via heavy.sh (backend tsc alone, 3.5 GB heap). Report to
/home/user/workspace/ops/reports/B-607-FIX-110.md. Final answer (<400 words): heads, findings closed, tests, CI, risks.
