**Tier:** T4 (Roman's reply safety check: which of the client's own food and health numbers a reply may quote).
**Why:** b#846 U1 (Opus lens, ops/reports/LN-OPUS-A-128.md): a correct figure for today in a sentence that also says "your usual", "your baseline" or "last month" gets Roman's whole reply replaced by the targets paragraph. R11-T3-FU #849 fixed the clause that itself says "today"; a clause that names no day still followed the sentence (earlier days only). FEATURE_ROMAN_TOOLS is on since 15:05, so "usual" answers from personal_baselines are live.
**T4 trigger scan:** AI output safety guardrail: yes (the reply post-check). PII/health data: no new data read or sent; only which facts already in the turn may validate a quoted number. Money, auth, RLS/tenancy, credentials, destructive data, migrations, flags: none.
**T3 trigger scan:** none (no prompt, tool, API or schema change).
**Bounded T1:** none.
**Canonical builder:** ROMAN-GUARD-129 (agent 129, Claude Opus 5.5).
**Parent owner:** operator agent 129.
**Acceptance evidence:** failing-first: the new spec `test/roman/roman-post-check-day-claim.spec.ts` on unchanged main c3324d4a: 9 failed / 7 passed (every "accepted" shape red, every guard green); with the fix 16/16. Local (heavy.sh, one file at a time): r11-t3-fu-post-check 16/16, roman-guardrails-rb121 117/117, eval/roman-golden.eval 37/37, roman-c2-rmn3-fixes 28/28, roman-guardrails-round2 36/36, roman-launch-hardening 58/58, roman-guardrails 25/25, roman-rmn2-fixes 6/6, roman-guardrails-wiring 11/11, r11-tool-loop 6/6. eslint clean on both files. CI at the head.
**Promotion triggers:** none. Pure function, no state; kill = revert.

## What changes for coaches/clients
- Clients: when Roman says, for example, "Today you have logged 780 kcal and 60 g protein, both under your usual" or "You are at 60 g protein, under your usual 110 g", and those are the client's real numbers, the client now gets that answer instead of a canned paragraph restating their targets. A number that is not in the client's data is still replaced, and a number put on the wrong named day ("Yesterday, you logged 780 kcal" when 780 is today's) is still replaced.
- Coaches: nothing changes.

## How the check now decides the day (src/roman/guardrails/roman-post-check.ts, dayClaimOf)
- A sentence with no earlier-day phrase: today (unchanged).
- The number's own clause has a time word: the closest one decides (unchanged from #849), except "your normal / usual / typical / baseline", which is a comparison, not a day: a number it decides may match today's or earlier days' facts.
- No time word in the number's clause: the last real day named before it decides, and earlier days stay strict ("Yesterday you logged 1850 kcal and 60 g protein" is still rewritten). "Your usual" never decides another clause. If nothing before names a day, the number may match today's or earlier days' facts.
- A pure relaxation of main: every number main accepts is still accepted (each new fact set contains main's), and only real figures main rejected are now accepted. A figure in neither today's nor earlier days' data is still rewritten.

## B / U
- B: none.
- U1 (b#846, Opus lens): fixed here.
- C: "Compared with last month, you are at 780 kcal." (a day phrase before the number, used as a comparison) still decides earlier days. C (edge, deferred to 10k clients)

Size: 152 changed lines (129+/23-), 2 files.
