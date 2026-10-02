# D2 consent contract (operator ruling 2026-10-01; copy pending owner sign-off)

Owner ruling 09-30 16:31 #5 wanted one quick "I agree" box. Washington's My Health My Data Act (RCW 19.373) requires
separate consent for COLLECTION and for SHARING consumer health data, so the operator adopted D2(b): the SAME onboarding
screen (P0) shows TWO boxes. Speed is preserved (one screen, one extra tap for the optional box).

## Semantics
- Box 1 (REQUIRED to continue): personal-training waiver + collection and use of the client's information by
  The Growth Project and their coach for coaching. Recorded as the waiver acceptance (`pt-waiver-v1`) plus the
  coaching-consent copy version `consult-consent-v2` (the mobile P0 copy version; the server stores what was shown).
- Box 2 (OPTIONAL, unticked by default): Roman and the coach's AI drafts may use the client's information, processed by
  Anthropic. Recorded as the AI processing grant (purpose `client_ai_processing`, processor `anthropic`) with server copy
  version `client-ai-v3`. Not ticking box 2 never blocks onboarding, plan assignment, coach messaging, community,
  wearables, the scripted Roman tutorial, the welcome message or reminders.
- Any server path that sends a client's data to Anthropic must require that client's box-2 grant (enforcement is the
  remaining part of #601 / "R2b"; until it lands, those paths stay off in production).
- Withdrawal: box 2 can be granted or withdrawn at any time in Settings > Privacy ("Roman and AI"). Box 1 cannot be
  "withdrawn" while keeping an account; the screen points to Settings > Account > Delete account.
- Onboarding completion (`POST` complete in #607) requires box 1 only (`consent_missing` when the waiver/coaching consent
  is absent). It must NOT require box 2.

## Where each box is recorded (decoupled on purpose)
- Box 1 is recorded by the onboarding intake (backend #607): the P0 answer carries `copy_version: "consult-consent-v2"`
  and the agreement; #607 stores `disclaimer_version` / `disclaimer_accepted_at` before any other answer (consent-first,
  already built). #607 bumps its accepted default from `consult-consent-v1` to `consult-consent-v2`
  (`CONSULT_CONSENT_COPY_VERSIONS` override unchanged). #607 does NOT depend on #601 or R2a.
- Box 2 is recorded by the AI consent ledger, a new small PR split out of #601 ("R2a"):
  `GET /me/ai-consent` (status + current version + server copy text and sha256 for the AI paragraph and box label),
  `POST /me/ai-consent/roman` `{ version: "client-ai-v3", copy_sha256?, platform?, app_version?, locale? }` (grant; idempotent),
  `DELETE /me/ai-consent/roman` (withdraw; idempotent), with an append-only history and RLS (client reads own rows only;
  coaches cannot read Roman transcripts or consent internals beyond what the contract allows). Version mismatch ->
  409 CONSENT_VERSION_MISMATCH. R2a does NOT include the combined `POST /me/ai-consent/onboarding` waiver grant (the
  waiver lives in the intake) and does NOT include the enforcement on every AI path (that stays in #601 as "R2b").
  R2a exposes a narrow read interface (e.g. `hasClientAiConsent(userId)`) for R2b and any AI path to call.
- Mobile (#310): on P0 Continue (box 1 ticked) it saves P0 to the intake; if box 2 is ticked it then calls
  `POST /me/ai-consent/roman`. A failure of the box-2 call never blocks onboarding; it is retried once and otherwise
  left for Settings > Privacy, which shows the current state from `GET /me/ai-consent` and lets the client allow or
  withdraw. While the R2a endpoints are not deployed (404/503), the box-2 call is skipped silently and the Settings row
  says the choice is unavailable right now.
The R2a PR body is the final API contract; the #310 builder aligns to it.

## Copy (v2 — APPROVED by the owner 2026-10-01 09:07; implement exactly
before launch because the flag has never been on)

Screen title: Before we start

Paragraph 1: The Growth Project provides personal training and nutrition guidance only. We do not diagnose, treat, or give medical advice. Nothing in this app replaces the advice of a physician or other qualified health provider.

Paragraph 2: Exercise carries some risk of injury. You choose how hard to work, you stop if something hurts, and you take part at your own risk.

Paragraph 3: To coach you, The Growth Project and your coach collect and use what you share here: your profile, this consultation including the screening questions, your targets, food and workout logs, check-ins, any health, sleep or wearable data you choose to connect, your messages with your coach, and posts you write in the community. We use it only to provide your training. We never sell it. If you joined through a clinic, the clinic does not see it.

Box 1 label (required): I agree to the training waiver, and to The Growth Project and my coach collecting and using my information to coach me.

Paragraph 4: Roman, the assistant in this app, is powered by Anthropic, a third-party AI provider. If you allow it, your information is sent to Anthropic so Roman can answer your questions and your coach can use AI drafts about your training. Only your own data is used, never another client's, and never your coach's private notes. Your conversations with Roman are private from your coach, kept for 180 days, and you can delete them at any time.

Box 2 label (optional): Optional: I allow Roman and my coach's AI tools to use my information, processed by Anthropic.

Footer: Nothing is sent until you continue. You can change the optional choice at any time in Settings > Privacy. Roman's guided tour works either way.
