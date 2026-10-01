**Tier:** T4 (privacy / consent enforcement). This PR adds the one server gate that decides whether a client's data may leave for an AI provider. Every client-data AI path now depends on it.
**Why:** CONSENT_D2_CONTRACT: "Any server path that sends a client's data to Anthropic must require that client's box-2 grant" (purpose `client_ai_processing`, processor `anthropic`, version `client-ai-v3`). R2a (#622) added the ledger. This PR (R2b) enforces it at every send. Owner rule 10-01 13:34: refusals carry a stable machine code plus a calm message that says what is needed.
**T4 trigger scan:**
- Privacy / consent: yes. This is the enforcement point for box 2. It fails closed: a ledger read error counts as no grant. It reads the live grant on every send, with no cache, so a revocation takes effect on the next send. That includes a send between retries and before a repair pass.
- Authorization / tenancy: yes. The gateway gets a new tenancy pre-flight for client ids named in the payload: owner is allowed, a coach needs a roster or open sub-coach assignment, otherwise 404 `client_not_found`. Before this, coach-ai-execution drafts had no tenancy check before reaching the provider.
- PII: refusals never name the client and never say whether other clients consented. Community triage drops posts from authors who have not consented before building the prompt.
- Payments: no. Migration: no. Flags: none flipped and none added.
**T3 trigger scan:**
- Cross-repo contract for mobile: 403 `{code:'ai_consent_required', message}` and 503 `{code:'ai_egress_blocked', message, requestId}`. Roman SSE writes an error event with the same code (and `requestId` when present). The mobile app should map `ai_consent_required` to the Settings > Privacy ("Roman and AI") action, and `ai_egress_blocked` to a contact-support action that shows the `requestId` reference (it is a server defect, never a consent prompt).
- Behaviour change: `/ai/chat` no longer uses Perplexity. Client data goes to Anthropic only, because box 2 names Anthropic.
- Depends on the R2a ledger reader (`hasClientAiConsent` / bulk read) at `fcb984f2`.
**Bounded T1:** `src/ai/README.md` (egress rule for new AI call sites).
**Builder/owner:** Claude Opus 5.5 (lane B-R2B, builder; does not audit this change). Owner: operator. Needs two independent audits (GPT-6.1 Sol and Claude Opus 5.5) plus green CI after retarget to main.
**Acceptance evidence:** see "Test evidence" and "Fix round 1" below, and CI at the head SHA. #622 is merged and this PR targets main, so CI runs on the head.
**Promotion triggers:** any AI SDK value import, SDK client construction, or provider call outside `src/ai-egress`; any SDK request that does not force `maxRetries: 0`, or any send that bypasses `sendGated`; any cache of grant state; any client-data path declared as a no-client-data exemption; any processor other than Anthropic for client data; any refusal text that names a client or reveals another client's consent.

---

## Inventory: every server path that calls an AI provider

| Path | Provider | Client data carried | Which client | Gating before | Gating now |
|---|---|---|---|---|---|
| Roman `streamAssistantTurn` (POST /roman/sessions/:id/messages) | Anthropic (stream) | Student: their own chat. Coach/owner: their own text | Student = self | FEATURE_ROMAN_CHAT_ENABLED (default off) | Student needs their own box-2 grant. Pre-check before the message is stored and before SSE headers, then rechecked at send. Coach/owner: `coach_own_scope` exemption |
| `AiService.chat` (/ai/chat) | Perplexity, else Anthropic | Caller's own context | Caller (self) | Keys only | Perplexity branch removed. Caller's grant is checked before quota is reserved and again at send. Fix round 1: context is own-data only (no coach private session notes, no roster-peer wins) |
| `CoachAIService`: workout program, meal plan, insight (via AnthropicAdapter) | Anthropic | Client context | `input.clientId` after the ownership check | ANTHROPIC_API_KEY | That client's grant is checked at send, including each retry and the repair pass |
| Weekly insight cron | Anthropic (CoachAIService) | Per-client context | Each client | CRON_COACH_AI_INSIGHT | Per-client grant. Clients without consent are skipped, not failed |
| Coach AI state boot probe | Anthropic | None (fixed "ping") | none | Key | `health_probe` exemption |
| Coach brief, solo/sub-coach | Anthropic | Aggregate counts over the roster | Roster | COACH_BRIEF_ENABLED | Counts are rebuilt over consented clients only, and the prompt notes "N of M". With none consented, the deterministic narrative is used and nothing is sent |
| Coach brief, head-coach | Anthropic | Business metrics only (no per-client fields) | none | COACH_BRIEF_ENABLED | `coach_business_metrics` exemption. A test pins the context keys |
| Churn-intervention draft | Anthropic | One client: name, risk factors, mood/energy | That client | Key | Grant is checked after the roster check and before claim. A refusal at send marks the row `draft_failed` and returns the refusal |
| AI gateway `invoke` → AnthropicProviderAdapter (callers: /ai/gateway/invoke, coach-ai-execution drafts, MWB live-create, community triage, wearable insights) | Anthropic (stub by default) | Varies | subjectUserId, self, payload client ids, `dataClientIds` | AI_GATEWAY_PROVIDER (stub default) | `deriveGatewayDataSubject` builds the subject, then tenancy pre-flight (non-stub), then grant for every id. The stub path sends nothing |
| Community AI triage | Anthropic (gateway) | Post previews from many authors | Each author | FEATURE_COMMUNITY_AI_TRIAGE (off) | Posts from authors without consent are dropped before the prompt. Consented ids go in `dataClientIds`. The freshness key includes a hash of the consented set |
| Wearable insights | Anthropic (gateway) | Client wearable samples | Subject | none (cache hit came before the LLM) | Grant is checked **before** the cache read, so a revoked client never gets a cached AI insight |
| First-win message | Perplexity | Fixed enum label only | none | none | `fixed_template` exemption. A test proves only the four fixed prompts are sent |
| Diagnostic AI roadmap (public) | Perplexity | De-identified prospect scores | none (prospect, not a client) | DIAGNOSTIC_AI_ENABLED | `deidentified_prospect_scores` exemption. A no-PII test proves it (owner decision below) |

Materialisers make no AI calls.

## Design

- `src/ai-egress/` is the only module that holds SDK clients or calls providers (`anthropicMessagesCreate`, `anthropicMessagesStream`, `perplexityChatCreate`, plus `createAnthropicClient` / `createPerplexityClient`). It is a @Global module mounted in AppModule.
- Fix round 1: call sites hold opaque `AnthropicHandle` / `PerplexityHandle` values (frozen, no own properties, private constructor). The SDK client behind a handle lives in a module-private WeakMap that only the gate reads, so there is no `messages` / `chat` surface to alias outside `src/ai-egress`. ESLint `no-restricted-imports` (CI `npm run lint`) rejects AI SDK value imports outside `src/ai-egress`.
- Fix round 1: SDK auto-retry is off on every client and forced to `maxRetries: 0` on every request. `sendGated` owns the retries (up to `AI_EGRESS_MAX_RETRIES` = 2, same retryable rule as the SDK, honours `retry-after`) and re-reads the live grant before each attempt.
- `assertMaySend(subject, processor, surface)`:
  - The subject is either `clientDataSubject(ids, audience)` or `noClientDataSubject(reason)`, with a closed reason list: health_probe, fixed_template, coach_own_scope, coach_business_metrics, deidentified_prospect_scores.
  - Client data to any processor other than Anthropic is refused with 503 `ai_egress_blocked`. So is a client subject with no ids, or an unknown exemption.
  - Grants are read live on every call: one id uses `hasClientAiConsent`, many ids use bulk reads in chunks of 200. Any read error is treated as no grant.
- `consentedClients(ids)` is the filter used by multi-client paths (brief, triage, cron).
- Refusal contract:
  - 403 `{code:'ai_consent_required', message}`.
  - Coach message: "This client hasn't allowed AI help yet. They can turn it on in their app under Settings > Privacy."
  - Client message: "You haven't allowed AI help yet. You can turn it on in Settings > Privacy."
  - Paths that fall back on provider errors rethrow refusals (`isAiEgressRefusal`), so a refusal is never hidden as a generic failure.
- Template authoring with no client data needs no consent. Each such path declares an exemption, and a test proves its prompt carries no client data.

## Test evidence (local, through ops/heavy.sh)

- `npx tsc --noEmit -p tsconfig.json`: 0 errors.
- `npx jest --runInBand` on the 24 changed spec files (listed in the report): 24 suites passed, 420 tests passed. Coverage includes grant, no grant, revoked, and ledger error for every inventoried client-data path, plus the exemption proofs.
- `npx jest --runInBand` on the 36 other specs that import the touched modules: 36 suites passed, 467 tests passed.
- DI and boot specs: `npx jest --runInBand test/module-graph.spec.ts test/openapi-spec.spec.ts test/roles-enforced.spec.ts test/contracts/importer-contract.spec.ts test/coach-brief.controller.spec.ts test/dunning-v2-lockout-guard.e2e.spec.ts test/diagnostic-prompt-doctrine.spec.ts test/ai/coach-ai.controller.spec.ts test/wearables/wearables-module.integration.spec.ts`: all passed.
- Guard: `test/ai-egress/ai-egress-guard.spec.ts` fails if any production file outside `src/ai-egress` has an AI SDK value import or require, `new Anthropic/OpenAI`, or a direct `messages.create/stream` or `chat.completions.create` call. It also checks package.json against an allow-list of AI SDKs. It includes negative and positive self-tests.
- `node scripts/check-r75.js --mode=range --base=fcb984f2 --head=HEAD`: OK. `as any` is net -5; every other token is net 0.
- eslint on changed files: clean, except a no-control-regex error in `test/coach-brief.service.spec.ts` that already exists at the base (same line, unchanged). prettier was applied to new files and to files that were prettier-clean at the base.

## Open risks / decisions

1. Deploying R2b while FEATURE_AI_CONSENT_LEDGER_ENABLED is off fails closed on every client-data AI path. The brief falls back to the deterministic narrative, and /coach/ai/*, Roman (students) and wearable AI insights return 403 `ai_consent_required`. **Recommended:** flip the ledger flag with the R2b deploy or just before it.
2. The public diagnostic sends de-identified prospect scores to Perplexity without box 2. These are prospects, not clients. **Owner decision; default:** keep the exemption.
3. Head-coach brief business totals are treated as non-client data. Roman coach-surface free text is treated as the coach's own scope. **Default:** keep both.
4. Triage silently leaves out posts from authors who have not consented. The gateway tenancy pre-flight may return 404 for coach-ai-execution draft requests about clients outside the roster that used to reach the stub. **Default:** accept both as intended.

## Fix round 1 (audits at 360d8705; head now 9551d2c8)

Merged origin/main (53b625d2, #599) into the branch with a merge commit (4db7b9b0), no force push. All fixes are in 9551d2c8.

| Finding | What changed | Commit | Test that proves it (fails on 360d8705) |
|---|---|---|---|
| A-626-1 (Sol, BLOCK) SDK retries resend after withdrawal | SDK auto-retry off on every client and forced to `maxRetries: 0` per request, including injected clients and caller-supplied options. `AiEgressService.sendGated` owns the retry loop and calls `assertMaySend` before every attempt. Streams are retried only before the response opens (`withResponse()` inside the gate). The adapter, which has its own loop, passes `{ retries: 0 }`. | 9551d2c8 | `test/ai-egress/ai-egress-retry.spec.ts`: real SDKs over an in-memory transport. First request withdraws consent and fails with 500 / 429 / connection error, for create and stream: exactly 1 HTTP request, then `ai_consent_required`. Also covers: a client built with `maxRetries: 5` still sends once per grant read; a live grant retries with one grant read per attempt; give-up after 2 retries; 400 not retried; Perplexity. On 360d8705 the suite fails (no handle / retry API); Sol's probe is the behavioural reproduction there. |
| A-626-2 (Sol, BLOCK) self-only chat sends peer content and private coach notes | `ClientAIContextService`: the next-session read selects only `start_at, title` (no `coach_notes_md`). Community wins are filtered to `user_id = caller`, and the prompt label is `my_recent_wins`. `coach_note` is removed from the type. | 9551d2c8 | `test/ai/client-ai-context-self-only.spec.ts`: real AiService → ClientAIContextService → AnthropicAdapter → AiEgressService, with only the SDK replaced. The sent request has no private note and no peer win, keeps the caller's own win, and every context read is scoped to the caller. On 360d8705: 3 failed (the request carried `note: PRIVATE_...` and the peer's win). |
| B-626-1 (Sol) 503 has no recovery action | `ai_egress_blocked` message: "AI help is turned off for this request because of a problem on our side. Your account and privacy settings are fine. Contact support at <support email> and include the reference shown with this message so we can fix it." HTTP responses already carry `requestId` through HttpExceptionFilter. The Roman SSE error event now carries `requestId` too. | 9551d2c8 | `test/ai-egress/ai-egress-policy-copy.spec.ts` (on 360d8705: failed on the old copy); `roman-streaming.spec.ts` "B-626-1" (SSE event `{code, message, requestId}`). |
| C-626-1 (Opus) guard is source text, not a boundary | Call sites receive opaque handles, never SDK clients. The factories and the Roman DI provider return handles. The gate refuses anything that is not a bound handle with 503 `unbound_handle` before sending. ESLint `@typescript-eslint/no-restricted-imports` for `@anthropic-ai/sdk(/*)` and `openai(/*)` outside `src/ai-egress` (type-only imports allowed). The source guard is kept. | 9551d2c8 | `ai-egress-guard.spec.ts` "AI provider capability boundary": ESLint (repo config) errors on value imports in `src/roman`, `src/first-win` and `src/coach`, and allows `import type` and `src/ai-egress`. Handles expose nothing. Factories and the DI provider return handles. A forged handle gets 503 with nothing sent. Every send goes through `sendGated` with `maxRetries: 0`. On 360d8705: suite fails (no handles). |
| C-626-2 (Opus) AI output stored before withdrawal is still served | Not changed (justified). The contract governs sending client data to a processor. Withdrawal stops every future send at the next attempt, and that is now true across retries too. Output already returned to the coach or client is their record (drafts, briefs, chat history). Deleting or hiding it is a retention decision, not an egress one. Cached AI views are already keyed on the consented set (triage) or checked before the cache read (wearables). | none | n/a. **Recommend** the privacy copy say "turning this off stops new AI use; past AI replies stay in your history". |
| C-626-3 (Opus) triage empty with no reason after a mid-flight withdrawal | `generateForCoach` re-runs the consent filter once when the gateway refuses with `ai_consent_required` (first or repair invoke), then triages the remaining consented authors. Bounded to one re-filter. | 9551d2c8 | `ai-triage.service.spec.ts` "C-626-3" (2 tests: re-filtered and non-empty; a second refusal is not retried again). On 360d8705: 2 failed. |

**Fix-round evidence (local, through ops/heavy.sh):**
- `npx tsc --noEmit -p tsconfig.json`: 0 errors. This needed `NODE_OPTIONS=--max-old-space-size=3584`, because the default 2.5 GB cap in heavy.sh ran out of memory on the merged tree.
- `npx jest --runInBand` over 62 suites: 62 passed, 924 tests passed. The run covered every changed spec, all `test/ai/` and `test/ai-egress/`, roman, triage, churn, coach-brief, first-win, diagnostic, module-graph, openapi-spec, roles-enforced, importer-contract, e2e-saas-smoke, cross-tenant-isolation, plus the 36 related specs.
- Old-head proof: the new specs were copied onto a 360d8705 worktree and run with `npx jest --runInBand` (5 suites). All 5 failed: 6 assertion failures (A-626-2 ×3, B-626-1 ×1, C-626-3 ×2), and the A-626-1 / C-626-1 suites failed to compile against the old API.
- `npx eslint` on changed files: 0 errors. `npx eslint "src/**/*.ts"` (what CI runs): 0 errors. prettier was applied to the new and owned files.
- `node scripts/check-r75.js --mode=range --base=360d8705 --head=HEAD`: OK. `as never` is net -11, `as any` net -2, `as unknown as` net -1; every other token is net 0. package.json and the lock file are unchanged.
