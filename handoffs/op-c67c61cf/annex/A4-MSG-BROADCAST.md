# Annex lane A4-MSG-BROADCAST — Claude Opus 5.5 builder, T3/T4 (broadcasts + rich cards)
Read /home/user/workspace/ops/lanes113/annex/_BUILD_COMMON.md and /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. Put "Builder: TGP annex lane A4-MSG-BROADCAST" in every PR body. Report: /home/user/workspace/ops/reports/A4-MSG-BROADCAST-annex.md and a line in tgp-agent-context handoffs/annex/STATUS.md.

Owner verdict 10-01 13:00 items 6, 7, 9 (+ "bring more ideas that beat Telegram and Skool for coaching"): segmented, scheduled and
recurring broadcasts from the coach (segments: package, program, tag, activity, cohort; schedule with timezone; recurring rules;
preview; per-recipient delivery state; respects quiet hours 21:00-08:00 recipient zone (OR-113-5) and mute); rich cards (workout,
meal plan, booking, package, check-in) rendered in threads and broadcasts via lane A3's renderer slot (coordinate through PR
comments; if A3's slot is not merged yet, build the card components + backend card payloads first); member privacy (clients never
see other clients' identities in broadcasts unless in a group they joined). Backend: broadcast model + scheduler with lease
(CronLease pattern), idempotent fan-out, RLS. Mobile: composer, segment picker, schedule sheet, card components. Propose 2-3 extra
"beats Skool" ideas in your report with effort estimates (do not build them unasked). Tests failing-before.
