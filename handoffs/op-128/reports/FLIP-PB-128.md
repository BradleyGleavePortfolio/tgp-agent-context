# FLIP-PB-128 — FEATURE_ROMAN_PLAYBOOK flip (agent 128, second job of FIN-T3-128)

Status (13:50 PDT): preconditions checked on main 1427f124 (= deploy 24 0d179edb + b#845, which touches only consent/deletion files).
PARKED (operator 13:47): the coach-disclosure wording goes to FIN-L2-128 as a separate policy PR; the playbook turns on together with memory later.
RESULT: ONE precondition fails (truthful privacy/terms text for coaches) -> NO PR opened, per the entry. Gap and smallest fix below.
No worktree created, nothing pushed, fly-env-sync never run.

## Scope traced (file:line on main)
1. Slices merged and deployed (deploy 24 = 0d179edb):
   - Schema + migration: prisma/schema.prisma:2760 CoachPlaybook, :2783 CoachPlaybookSource; prisma/migrations/20270402000000_coach_playbook.
   - Signals: src/roman/playbook/playbook-signals.service.ts; sources: playbook-sources.ts; builder: playbook-builder.service.ts;
     scheduler: playbook-builder.scheduler.ts; registered in src/roman/roman.module.ts:28-31, :67-72.
   - Coach-method augmenter: roman.module.ts:33-34, :60 (ROMAN_COACH_METHOD_AUGMENTER).  PASS
2. Consent gates:
   - Collector: memory-scope (client-ai-v5) grants read once, playbook-sources.ts:132-135; coach messages and private session notes only
     for those clients (:180, :194); signals limited to them (:245 -> playbook-signals.service.ts:204; empty list = no client rows).
   - Builder: no consented client but a client row in the ledger -> stops before spend (playbook-builder.service.ts:160); send subject
     clientDataSubject(consented,'coach','memory') else coach_own_scope (:161-163); egress gate re-checks at send (:182).
   - Turn: coach-method block only for a 'memory' holder (roman.service.ts:1035, :1321-1327).  PASS
3. Background cost cap: <= 20 head coaches per run, 500 scanned, 4,096 output tokens (playbook-builder.service.ts:49-53, :280);
   every build reserved before the call, payer = head coach pool (:171-177), settled after (:190-206); platform background ceiling
   ROMAN_BACKGROUND_DAILY_COST_CAP_USD default 10 USD/UTC day (roman.constants.ts:154, roman-background-spend.ts:82-88, advisory lock :135),
   pool check (:112-116). The only model call in src/roman/playbook is :182, after admission.  PASS
4. Kill switch: exact 'true' only (roman-playbook.feature.ts); off = no boot timer (scheduler :22-23), tick returns before any read (:38),
   runOnce/buildFor return first (builder :131, :150), augmenter null (roman-coach-method.augmenter.ts:112). Tests:
   test/roman/r11-playbook-builder.spec.ts:107, :198; test/roman/r11-coach-method.spec.ts:103.  PASS
5. Coaches never see the playbook: no controller or route reads CoachPlaybook (rg over src). NOTE: the coach's own data export includes
   their active playbook sections and red lines (src/data-export/data-export.service.ts:344-356, :1466-1468, :1547; README:89), labelled
   "owner D5" in code. Decision item below.  PASS with note
6. Privacy text (b#831 R11-L1) describes coach-method learning truthfully:  FAIL (for coaches)
   - Client side is truthful: src/public-pages/trust-pages.html.ts:270 matches the owner-approved v5 consent paragraph
     (src/ai-consent/ai-consent.constants.ts:98-108).
   - Coach side is missing or false:
     a. :285 Service providers says Anthropic gets data for "Roman and coach AI drafts, after you agree". With the flag on, every 6 hours
        a coach's guidelines, program and template names, meal plans (and, for memory clients, their messages and private session notes)
        go to Anthropic under the coach's own scope (playbook-builder.service.ts:163). The coach never agreed and is never told.
     b. Terms :585: coach content is licensed only "to host and display it as required to operate the service"; building an AI profile
        of the coach's methods from it is outside that licence.
     c. Consumer health page :438 and :459 list Anthropic's purposes as Roman's replies and coach AI drafts; client data used to learn
        the coach's methods (session notes, targets and profile counts in the signals) is not named there (WA consumer-health policy).

## B list
- B1 (flip blocker, legal/false claim): an ordinary coach with FEATURE_ROMAN_PLAYBOOK on has their programs, guidelines, meal plans and
  (for memory clients) messages and session notes sent to Anthropic to build a method profile, while the privacy policy tells them
  Anthropic only gets data "after you agree" and the terms license their content only to host and display it.

## U list
- None.

## C one-liners
- Two Fly machines firing the same 6-hourly cron can both build the same coach before either commits (double spend, bounded by the
  10 USD/day ceiling). C (edge, deferred to 10k clients)
- Red lines are prompt rules only; the reply post-check does not read post_check.red_lines yet (roman-turn-augmenter.ts:43-48). Extra
  defence on a guarded path. C (edge, deferred to 10k clients)

## Not fixed (needs operator)
1. B1 smallest fix (T3 legal copy, one PR on src/public-pages/trust-pages.html.ts + test/trust-pages.spec.ts; best added to b#844 R11-L2
   or right after it merges, since #844 edits the same file):
   - :270 "Roman and AI": add one coach sentence, e.g. "If you coach on TGP, Roman learns your coaching methods from your guidelines,
     programs, templates and meal plans and, for clients who allow Roman's memory, from your messages to them and your private session
     notes. Anthropic processes this to write a summary of your methods that shapes Roman's advice to your clients. The summary is not
     shown in the app; it is included in your data export and deleted with your account."
   - :285 Anthropic bullet: add "learning a coach's methods from the coach's own content and, for clients who allow Roman's memory, the
     coach's messages and session notes".
   - :438 and :459: add "to learn your coach's methods (without identifying you), if you allow Roman's memory".
   - Terms :585: licence also covers processing coach content, including with our AI provider, to operate Roman.
   - Bump POLICY_LAST_REVIEWED (:35). Then re-run this flip job.
2. Sequencing (recommended default: flip PLAYBOOK in the same window as FEATURE_ROMAN_MEMORY, not before). Today no client can hold a
   'memory' (v5) grant while FEATURE_ROMAN_MEMORY is unset (ai-consent.service.ts header :13-31), so with PLAYBOOK alone every build
   uses coach-only content and no client turn ever gets the block (roman.service.ts:1321-1327): coach pool credits spent, zero client effect.
3. Data export shows the coach their own playbook (data-export.service.ts:344-356, code says "owner D5"), while owner 11:22 (10-05) says
   coaches never see it. Recommended default: keep it in the export (legal right of access; not an app screen) and record D5 in SoT A6.

## PRs
- None (precondition 6 fails).

## HANDOFF
- When the B1 copy is merged (and the owner/operator picks the sequencing in item 2): new worktree
  `git -C /home/user/workspace/growth-project-backend worktree add -b agent128/flip-pb-128 /home/user/workspace/wt/FLIP-PB-128-backend origin/main`,
  change only .github/fly-env-desired-state.json:53 "FEATURE_ROMAN_PLAYBOOK": "unset" -> "true", its gates note (:135) and
  docs/runbooks/launch-flags.md:143 (+ the :206 paragraph); run `/home/user/workspace/ops/heavy.sh npx jest test/ci/fly-env-manifest.spec.ts`;
  title "chore(flags): turn on Roman's coach playbook (FLIP-PB, T4)"; evidence = sections 1-6 above.
