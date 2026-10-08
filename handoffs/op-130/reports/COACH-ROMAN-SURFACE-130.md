# COACH-ROMAN-SURFACE-130 — coach Roman states what it can do (agent 130)

Worker: COACH-ROMAN-SURFACE-130 (Claude Opus 5.5, T3 backend prompt). Branch agent130/coach-roman-surface-130,
worktree /home/user/workspace/wt/COACH-ROMAN-SURFACE-130-backend. Source: reports/AUD-COACH-WEEK1-129.md B2 (backend half).
Plan: FIX_PLANS_130_131.md C1 #7; owner decision 2 default = reword (no client read built).
Recon 130: waits for ROMAN-COPY-B-FIN-130 (agent129/cf-roman-copy-b-128) to merge: same function surfaceFraming, adjacent lines,
and the same pinned prompt-hash block in test/roman/r11-seams.spec.ts.

Status: 19:20 PDT — #866 merged 19:16 (main 80cebd11); merged into my branch cleanly; PR b#873 opened at 0b7aa108; CI running.

## Scope traced (from the code, base main 272dc8ef / d6065661)
- Entry: mobile coach Settings row "Ask for a brief, a client read, or the next step." (mobile SettingsScreen.tsx:663-670, the mobile
  half is CF-COACH-SETTINGS-AI-129, not this lane) opens RomanChat with surface "coach".
- POST /roman/sessions: roman.controller.ts:70 calls openOrResumeSession(caller, dto.surface) with no subject context, so a coach
  session never carries one.
- Turn: roman.service.ts:1019 `grounded = session.surface === 'client' && caller.role === 'student'`: no client bundle, no memory or
  coach-method augments, no tools (toolsTurnOf(grounded && bundle)) on the coach surface. Coach Roman sees only the coach's own
  messages in today's session.
- Prompt: roman.prompts.ts:127-128 coach framing = "addressing a coach ... never reveal another coach's or client's private data":
  nothing says it has no client data, nothing forbids invented numbers (that rule exists only in ROMAN_ANSWER_CONTRACT :111 and the
  client REPLY CONTRACT, both client-only).
- Reply check: roman-post-check.ts:759-763 grounding checks run only with a context or contextUnavailable; the coach surface passes
  neither, so only the calorie floor applies. Nothing catches an invented client number on a coach turn.
- Version: PROMPT_VERSION 'roman-client-v4' (guardrails/roman-guardrail.contract.ts:19) is the client contract version; coach turns
  record it in the ledger (roman.service.ts:1234) and log lines (:988, :1241) although the coach prompt never carries that contract.
- Coach app pointer is real: tab "Clients" (mobile CoachNavigator.tsx:724-727) -> ClientDetail with Logs / Plan / Progress /
  Workouts tabs (mobile ClientDetailScreen.tsx:293-301).

## B list
- (pending grade) B2 backend half, from the code: a coach opens Roman from Settings, asks how a client's week went, and Roman, which
  sees no client data, can answer with made-up figures; no prompt rule and no reply check stops it. Auditor allows a U grade.

## U list
- none yet

## C one-liners
- C (edge, deferred to 10k clients): the prompt builder still accepts a coach subjectContext (never set by any caller today); if a
  caller ever passes one, the coach framing must be revisited.

## Fix (b#873, branch agent130/coach-roman-surface-130 @ 0b7aa108, 122 changed lines)
- src/roman/roman.prompts.ts: surfaceFraming('coach') now states what coach Roman does (programming, nutrition, running the practice),
  that it sees only what the coach writes in the chat (no client data, client list, schedule or payments), points to the client's
  page in Clients, and adds "Never state a number you were not given" (scoped to figures about a client or the practice). New
  ROMAN_COACH_PROMPT_VERSION 'roman-coach-v1' + romanPromptVersionOf(surface). Client prompt byte-identical.
- src/roman/roman.service.ts: the ledger metadata, the model-call log line and the fixed-template log line (now in
  fixedSafetyReply after #866) record romanPromptVersionOf(session.surface): coach turns roman-coach-v1, client turns unchanged
  roman-client-v4. The unused PROMPT_VERSION import is gone.
- Version choice: PROMPT_VERSION is the client contract's version ('roman-client-v4'); bumping it would change every client prompt
  for a coach-only change, so the coach prompt gets its own version instead (the plan's "prompt version bump").
- Tests: roman.prompts.spec (one case), roman-launch-hardening.spec (two cases: a coach model turn sends the rules and its ledger +
  log say roman-coach-v1 while a client turn keeps PROMPT_VERSION; a coach fixed-template turn logs roman-coach-v1),
  r11-seams coach_plain hash re-pinned (client hashes unchanged).
- Failing-first (seen in a test, on main): reports/COACH-ROMAN-SURFACE-130-prompts-before.log (1 failed / 19 passed),
  reports/COACH-ROMAN-SURFACE-130-launch-hardening-before.log (1 failed). The predecessor's branch does not change the coach line
  or the coach hash, so the result on its branch is the same.
- Template-log failing-first (seen in a test): reports/COACH-ROMAN-SURFACE-130-template-log-before.log (a coach session logged
  roman-client-v4).
- Final, on main 80cebd11 + branch: prompts 20/20, launch-hardening 60/60, r11-seams 22/22, guardrails-wiring 11/11,
  r11-coach-method 11/11, roman.service 51/51, golden eval 37/37, roman-copy-b-128 7/7, roman-streaming 36/36, roman-guardrails
  25/25 (logs reports/COACH-ROMAN-SURFACE-130-*-final.log). Targeted eslint clean.
- PR body draft: reports/COACH-ROMAN-SURFACE-130-pr-body.md.

## PRs
- b#873 https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/873 @ 0b7aa108aea612f82e7c4844cbfa775bbb63520f,
  122 lines (108+/14-), CI pending, READY not yet posted.

## Proposed (needs operator)
- none yet
