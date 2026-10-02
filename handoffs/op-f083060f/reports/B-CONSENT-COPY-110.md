# B-CONSENT-COPY (agent 110) — AI-chat retention truth (T4 consent copy) + #326 + #611

Builder: Claude Opus 5.5. Status: IN PROGRESS. Never merged, never pushed main, no flags or workflows touched.

## Context read
- AGENT_BRIEF_COMMON.md, lane file, CONSENT_D2_CONTRACT.md, AGENT_RULES.md, LIVE_STATE.md.
- AUD-OPUS-2 verdicts: backend #626 (R-626-1), mobile #310 (B-310-6, C-310-11), mobile #326 (B-326-1/2, C-326-1..3).
- Sol verdict on mobile #326 (B-326-1..4). Every AUDIT comment on backend #611 (Sol x2, Opus x1) and the B-COPY fix round.

## Facts found on main (backend 7a6cfd82, mobile 0b7f197)
- Box-2 server copy `client-ai-v3` says chats are "kept for 180 days" (src/ai-consent/ai-consent.constants.ts:34).
- No Roman/AI-chat purge job or retention env exists on backend main (rg for retention/180/purge in src, env-validation, .env.example).
- `DELETE /roman/sessions/:id` is a SOFT delete on main (sets deleted_at; messages stay). So "kept until you delete them" would be
  false unless the client delete erases the transcript (OR-110-1). Fixed in the backend PR (see below).
- #607 (open, other lane) accepts only `consult-consent-v2` by default (`DEFAULT_CONSULT_CONSENT_COPY_VERSION`).
