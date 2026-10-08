**merge only after b#850 and PB-POOL-128 are merged and deployed**

R11-INT-AUD-128 verdict for PLAYBOOK today: NO-GO, because of B1 (b#850, the coach-method policy wording, was not merged; it is now merged on main 9d23137d but not yet deployed) and B2 (playbook builds draw the coach's AI credits without telling the coach; fix = PB-POOL-128, the platform pays). This PR is opened now so it is audited and ready; it must not be merged or applied before both are merged and deployed, and it should be applied with or after FEATURE_ROMAN_MEMORY (FLIP-MEM-128).

**Tier:** T4 (AI egress of coach content and, for memory clients, coach messages and session notes; production flag).
**Why:** owner 14:25, decision 1 (verbatim): "turn on memory and the coach playbook as soon as the coach wording is live; recommended yes". Turns on the coach playbook (FEATURE_ROMAN_PLAYBOOK). Merged on main 675242fd: R11-P3b-1 source collector b#833, R11-P3b-2 builder and schedule b#837, R11-P4 coach method in the turn b#836.
**T4 trigger scan:** PII to the AI provider: yes (flag gate only, no code change). Money: background builds are metered; who pays changes with PB-POOL-128 (not in this PR). Auth, RLS/tenancy, credentials, destructive data, migrations: none.
**T3 trigger scan:** production config manifest; the CI manifest specs; legal copy dependency (b#850).
**Bounded T1:** none.
**Canonical builder:** FLIP-PB-128 (agent 128, Claude Opus 5.5; job FLIP-MEM-PB-128).
**Parent owner:** operator agent 128. Merge order: deploy 25 -> FLIP-MEM -> b#850 and PB-POOL-128 merged and deployed -> this PR.
**Acceptance evidence:** precondition table below (file:line on main 675242fd); `test/ci/fly-env-manifest.spec.ts` 69/69 and `test/roman/r11-seams.spec.ts` 21/21 pass locally (heavy.sh).
**Promotion triggers:** none in this PR. PB-POOL-128 is T4 money and routes to Claude Opus 5.5.

## What changes for coaches/clients
- Coaches: every 6 hours, and only when their material changed, Roman writes a private summary of a head coach's methods from their guidelines, programs, templates and meal plans and, for clients who allow Roman's memory, from the coach's messages to them and private session notes. The coach does not see the summary in the app; it is in the coach's own data export and is deleted with the account. Once PB-POOL-128 is in, these builds do not use the coach's AI credits.
- Clients: for clients who allow Roman's memory, Roman's advice follows their coach's way of working (for example the coach's usual exercise swaps). Clients without memory get today's Roman.
- No app change is needed.

## B/U list
- B1 (blocks merge; R11-INT-AUD-128 B1 / FLIP-PB-128 B1): with the flag on, a coach's content goes to Anthropic every 6 h while the live privacy policy and terms do not say so. Fix: b#850 merged (9d23137d); still needs to be deployed.
- B2 (blocks merge; R11-INT-AUD-128 B2): each build reserves and debits the head coach's monthly AI pool (`playbook-builder.service.ts:171-177`, payer `{kind:'coach'}`), while the only coach-facing credits text lists "workouts, meal plans, briefs, client chat" (mobile `AIBudgetTutorialModal.tsx:94`, `:112`). Fix: PB-POOL-128 (platform payer, coach credits untouched, bounded by the 10 USD/day background cap), not yet opened.
- U: none.
- C (edge, deferred to 10k clients): two machines firing the same 6-hourly cron can build one coach twice (bounded by the 10 USD/day ceiling).
- C (edge, deferred to 10k clients): red lines are prompt rules only; the reply check does not read `post_check.red_lines` (`roman-turn-augmenter.ts:43-48`).

## Precondition check (main 675242fd)
| Precondition | Evidence |
|---|---|
| Slices merged | `prisma/schema.prisma` CoachPlaybook / CoachPlaybookSource (migration 20270402000000_coach_playbook); `src/roman/playbook/*` registered in `roman.module.ts` |
| Consent scope ('memory' = client-ai-v5 only) | collector reads 'memory' grants once and uses client material only for those clients (`playbook-sources.ts:132-135`); builder stops before spend on an unsafe ledger and sends under `clientDataSubject(consented,'coach','memory')` or `coach_own_scope` (`playbook-builder.service.ts:160-163`); egress gate re-checks at send (`:182`); turn block only for a 'memory' holder (`roman.service.ts:1035`, `:1328-1344`) |
| Cost cap | <= 20 head coaches a run, rebuild only when the source digest changes (`playbook-builder.service.ts:49-53`, `:158`); 4,096 output tokens; sources capped at 40,000 chars (`playbook-sources.ts:37`); platform background ceiling ROMAN_BACKGROUND_DAILY_COST_CAP_USD default 10 USD/UTC day (`roman.constants.ts:154`, `roman-background-spend.ts:152`) |
| Pool | today the head coach's pool (`playbook-builder.service.ts:171-177`) = B2; PB-POOL-128 pending |
| Coach-method wording (b#850) | merged on main 9d23137d, not deployed = B1 open until deploy |
| b#844, b#845 | merged (e6b4ea47, 1427f124); deploy 25 pending |
| m#461 + m#463 | on mobile main (62bc9c34, 11d433bc); needed for any client to hold 'memory', without which the block never applies |
| Kill switch | `roman-playbook.feature.ts:14` (only exact `true`); off = no boot timer and tick returns first (`playbook-builder.scheduler.ts:23`, `:38`), builder returns first (`playbook-builder.service.ts:131`, `:150`), augmenter null (`roman-coach-method.augmenter.ts:112`) |
| Coach never sees it in the app | no controller reads CoachPlaybook; the coach's own data export includes it (`data-export.service.ts:1466-1468`), disclosed by b#850 |
| Audit verdict | R11-INT-AUD-128: PLAYBOOK = NO-GO until B1 and B2 are fixed; only useful with MEMORY on |

## Diff (3 files, +6/-5)
- `.github/fly-env-desired-state.json`: `"FEATURE_ROMAN_PLAYBOOK": "unset"` -> `"true"`, and its gates note (names both blockers).
- `docs/runbooks/launch-flags.md`: the FEATURE_ROMAN_PLAYBOOK paragraph. The kill-switch table row stays as it is on purpose (generated from the code default; `fly-env-manifest.spec.ts` pins it).
- `test/roman/r11-seams.spec.ts`: one assertion now expects `true` for FEATURE_ROMAN_PLAYBOOK. Merged with main c500847b (b#851 TOOLS): the assertion is now a list of declared-on flags (TOOLS, PLAYBOOK); after #854 merges this needs a one-line merge adding MEMORY.

Builder: agent 128 (FLIP-MEM-PB-128).
