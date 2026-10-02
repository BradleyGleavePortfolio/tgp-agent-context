# Lane B-R2B-2 (agent 110) — Claude Opus 5.5 builder (T4: AI consent enforcement, cross-repo contract)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first (owner facts 20:38, decisions 20:32), then the D2 contract
/home/user/workspace/ops/CONSENT_D2_CONTRACT.md and every verdict on backend #626. Builder: push only to your PR branches.
1. backend #626 @ 9551d2c8 (R2b gateway enforcement). Close Opus B-626-2: Roman's in-stream SSE error event must stay exactly
   {code, message} (mobile main's strict parser rejects extra fields); the reference ID stays in the X-Request-ID header. Add a
   contract test that pins the event shape against the mobile parser's accepted keys. Optionally close C-626-4 (community AI
   triage failure shows an empty inbox -> explicit "triage unavailable" state) if small. Merge current main first (merge commit).
2. NEW mobile PR (Opus launch-blocker decision 21:05, OR-109-2): mobile does not handle `ai_consent_required` or
   `ai_egress_blocked`. Today the AI Guide shows "I'm offline at the moment" and Roman shows "That request did not complete".
   Map both codes (HTTP status + machine code, both in non-stream responses and Roman's in-stream error event) to specific copy:
   - ai_consent_required: say AI features are off because the client has not allowed them, with a working action that opens the
     AI consent setting (box 2 of the D2 consent; the settings toggle from mobile #310 if merged, else the existing consent API
     route) and explains that the coach still sees their data normally.
   - ai_egress_blocked (503): contact-support action showing the reference (request ID), per OR-109-2.
   Cover Roman chat, AI Guide, coach AI drafts/brief and any other AI surface. Plain warm copy, no emojis/exclamation marks,
   never "Something went wrong" alone. Tests for each surface and code, plus the strict SSE parser still rejecting unknown keys.
   Grade: T4 (consent + cross-repo contract). One PR onto mobile main.
Report to /home/user/workspace/ops/reports/B-R2B-2-110.md. Final answer (<400 words): heads, dispositions, tests, CI, risks.
