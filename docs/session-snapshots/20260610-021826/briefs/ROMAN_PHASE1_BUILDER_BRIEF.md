# BUILDER BRIEF — Roman Phase 1: Chat MVP Backend

**Cycle:** Roman track, Phase 1 of 3 (per TODO #19/#24)
**Repo:** `BradleyGleavePortfolio/growth-project-backend`
**Base:** `origin/main` @ `b966088`
**Branch:** `feat/roman-phase-1-chat` (already created)
**Worktree:** `/home/user/workspace/tgp/backend-roman-phase1`
**Author:** `Dynasia G <dynasia@trygrowthproject.com>`
**Commit style:** title-only commits (no body)
**Model:** Opus 4.8 (R31: Sonnet 4.6 FORBIDDEN as runtime)

---

## 0. Context — what Roman is

Roman is TGP's single AI persona — Alfred-from-Batman archetype, dignified, composed, never gushing, no emoji, no exclamation except one per session on milestones. Full voice contract at:

`/home/user/workspace/tgp/agentctx-roman-identity/strategy/AI_BUTLER_ROMAN_IDENTITY_SPEC.md`

**Read §0 (identity), §1 (voice contract), §1.4 (forbidden moves), §1.5 (dry-humour allowance) before writing the system prompt.**

Phase 1 builds the **chat MVP backend** — the persistent session + message store + streaming endpoint. Phase 2 (mobile UI) and Phase 3 (push/email) follow.

This phase ships **flag-OFF by default**. Mobile UI is not wired yet.

---

## 1. Scope

### IN scope (this PR):
1. **Prisma models** (additive only — DO NOT modify any existing model):
   - `RomanSession` — one per (userId, surface) where surface ∈ {`client`, `coach`}; tracks session start, last activity, message count, optional `subjectContextJson` (e.g. brief context)
   - `RomanMessage` — role ∈ {`user`, `roman`}, content, token counts, model id, createdAt, FK to session, optional `parentMessageId` for branching
   - Indexes: `(userId, surface, createdAt DESC)` on session, `(sessionId, createdAt)` on message
2. **NestJS module** `src/roman/`:
   - `roman.module.ts` (registered in `app.module.ts` behind `FEATURE_ROMAN_CHAT_ENABLED` env flag — default `false`)
   - `roman.controller.ts` — REST endpoints under `/roman`:
     - `POST /roman/sessions` — open or resume session (idempotent on (userId, surface) day-key)
     - `GET /roman/sessions/:id/messages?cursor=&limit=` — paginated, newest first
     - `POST /roman/sessions/:id/messages` — submit user turn → returns assistant stream
     - `DELETE /roman/sessions/:id` — soft-delete (sets `deletedAt`)
   - `roman.service.ts` — session/message CRUD + Anthropic call wrapper
   - `roman.prompts.ts` — system prompt builder (loads voice contract §1 as the system message; accepts surface ∈ {client, coach} for surface-specific framing)
3. **Streaming**: server-sent events from `POST /roman/sessions/:id/messages`. Use `@nestjs/common` `Sse` decorator with an Observable. Persist assistant turn on stream completion (or partial-with-`interrupted` flag if client disconnects).
4. **Auth**: every endpoint requires the existing `JwtAuthGuard` + `SubscriptionGuard`. Roman is gated as **available to all signed-in users on any tier** (free + pro) — but rate-limited (see §3).
5. **RLS** on both new tables — `userId = app.current_user_id()` for SELECT/INSERT, OWNER bypass. Use existing helper pattern from `app.*` functions (see PR #268 spec for the canonical pinned-search-path pattern).
6. **Feature flag**: `FEATURE_ROMAN_CHAT_ENABLED` in `.env.example`. When false, the controller routes return 404 (mount controller conditionally OR return 404 in a guard).
7. **Tests**:
   - Unit: `roman.service.spec.ts` — session open/resume, message append, soft-delete, surface routing
   - Unit: `roman.prompts.spec.ts` — system prompt MUST include voice contract anchors (dignified/composed/no-emoji/no-exclamation rules), MUST NOT leak the spec doc verbatim (summarized)
   - Integration: `roman.controller.spec.ts` — 4 endpoints × auth required × flag-off → 404 × flag-on → 200
   - Integration: `roman-streaming.spec.ts` — SSE happy path + client-disconnect → `interrupted=true` persisted
   - RLS: `test/rls/roman-rls.spec.ts` — 12+ tests: user A cannot read user B's sessions/messages, OWNER can, anonymous role denied

### OUT of scope (defer, document in PR body):
- Mobile UI (Phase 2)
- Push/email notifications (Phase 3)
- Tool use / function calling
- Image input
- Multi-language (English only for now)
- Coach Brief assembly (separate feature; this is just the chat surface)
- Roman as background-task author (e.g. composing emails)

---

## 2. Voice contract enforcement (technical)

The system prompt MUST encode the voice contract such that ANY response satisfying it. Required content (you may rephrase, but every rule below must be present):

```
You are Roman, the single AI persona of The Growth Project (TGP).

# IDENTITY
- One Roman. Shared across all users. Never "your assistant Roman" — just "Roman."
- He/him. Modelled on Alfred from Batman: dignified manservant, cold/calm/classy/wise.
- First person ("I will…"), never third person, never "we" on behalf of the company.

# VOICE CONTRACT (HARD RULES)
- Dignified, composed, measured. Never gushing, never patronising, never slangy.
- Short complete sentences. Stop when done.
- Avoid contractions by default. Use "I will" not "I'll", "it is" not "it's".
- Contractions ARE permitted inside a rare dry quip (the softening IS the joke).
- Precise, slightly elevated vocab. Banned: synergy/leverage/circle back/bandwidth.
- Banned hype words: amazing/incredible/awesome/epic/insane/game-changer.
- NO emoji. Ever.
- NO exclamation points, with one exception: a single exclamation per session on a genuine milestone.
- Banned fitness-bro: crushing it/let's go/beast mode/grind/let's get it.
- Banned Gen-Z: slay/bet/no cap/rizz/lowkey/vibe/it's giving.

# DRY HUMOUR
- Roughly 1 message in 8 may carry a single dry quip. Most carry none.
- Never two quips in a row.
- Always at his own expense OR at the absurdity of the situation. NEVER at the user's expense.
- Straight-faced delivery. One clause, no fanfare.

# FAILURE TONE
- Own the failure without grovelling. State the fact, state the remedy, stop.
- Right: "That request did not complete. I will try again."
- Wrong: "Oops!" / "My bad" / "Sorry about that!"
- At most one measured "My apologies." per real failure.
```

Track in session metadata: `quipsInSession` counter (so the model can self-rate-limit the quip allowance), `exclamationUsedInSession` boolean.

---

## 3. Rate limit & budgets

- **Per-user**: 50 user-turns per 24h on free, 500 on pro. Reject 429 with `{code: "ROMAN_RATE_LIMIT", retryAfterSeconds}` past cap.
- **Per-message context window**: max 30 prior turns included in API call (slice tail). Older turns summarized into a single system "earlier in this session: …" line via Anthropic — but DEFER summarization to Phase 1.1 (Phase 1 ships simple tail-slice).
- **Token tracking**: persist `promptTokens` + `completionTokens` on each message for future budgeting.

---

## 4. Anthropic integration

- Use `@anthropic-ai/sdk` (already in `package.json`).
- Model: `claude-3-7-sonnet-20250219` for Phase 1 (cost-efficient default; document in PR body that Roman may upgrade to opus for milestone moments in Phase 1.1).
- Inject via existing `AnthropicService` if one exists, else create `src/roman/anthropic-client.provider.ts` with DI token `ROMAN_ANTHROPIC_CLIENT`.
- Read API key from `ANTHROPIC_API_KEY` env (already used elsewhere).
- Stream via SDK's native streaming.

---

## 5. RLS pattern (HECTACORN QUALITY)

Both new tables get full RLS. Migration must:
1. Enable RLS: `ALTER TABLE "RomanSession" ENABLE ROW LEVEL SECURITY;` (and `RomanMessage`)
2. Create policy `roman_session_owner_read` — `USING ("userId" = app.current_user_id())`
3. Create policy `roman_session_owner_write` — same predicate, FOR INSERT WITH CHECK
4. Service-role (OWNER) bypasses all policies — standard pattern
5. `RomanMessage` policies join through session.userId

Cite the policies in a header comment within `migration.sql`. Test all policies in `test/rls/roman-rls.spec.ts` with:
- User A inserts session → User B SELECT returns 0 rows
- User A inserts session → User A SELECT returns 1 row
- OWNER (service role) SELECT returns all
- Anonymous role SELECT raises (no policy match)
- INSERT with mismatched userId → policy violation
- 6+ more permutations covering RomanMessage chain

---

## 6. Gates (must all pass before opening PR)

- [ ] `./node_modules/.bin/prisma format` clean
- [ ] `./node_modules/.bin/prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` produces only the additions (no surprise drops)
- [ ] `npx tsc --noEmit` clean
- [ ] `npx eslint .` clean
- [ ] All new tests pass + module graph + RBAC + guard suites still pass (lane test: same suites we ran for #374/#375 — `pnpm/npm test -- --testPathPattern="roman|module-graph|rbac|guards"`)
- [ ] No existing test file modified except `app.module.spec.ts` if needed for module-graph

---

## 7. PR body requirements

Must include:
- Scope IN / OUT
- Voice contract enforcement explanation (link to spec doc)
- RLS table (each policy, each predicate, citation)
- Rate-limit numbers + rationale
- Feature flag default + how to enable in dev
- Test inventory with pass count
- Cross-references: Roman spec doc, this brief
- 4+ sources for design decisions (Anthropic streaming docs, NestJS SSE, Supabase RLS docs, Postgres RLS reference)

---

## 8. Workflow

1. `cd /home/user/workspace/tgp/backend-roman-phase1`
2. Confirm `git rev-parse HEAD` = `b966088…`
3. `npm install --no-audit --no-fund` (verify deps already from main are installed)
4. Implement scope §1 in logical commits (title-only)
5. Run all gates §6
6. `git push -u origin feat/roman-phase-1-chat`
7. `gh pr create --repo BradleyGleavePortfolio/growth-project-backend --base main --title "feat(roman): Phase 1 chat MVP backend — sessions, messages, SSE streaming, RLS (FEATURE_ROMAN_CHAT_ENABLED off)" --body-file PR_BODY.md`
8. Append to `/tmp/tgp-agent-context/handoffs/dispatch.json`
9. Save result to `/home/user/workspace/ROMAN_PHASE1_BUILDER_RESULT.md`

**STOP if:**
- Any conflict with existing module-graph
- Any existing model modified
- Test count drops anywhere

Return: PR number, head SHA, test pass count, RLS test count, gate status.
