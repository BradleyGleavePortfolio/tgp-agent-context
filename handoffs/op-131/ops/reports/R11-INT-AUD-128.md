# R11-INT-AUD-128 — Roman v1.1 with all switches on (read-only audit, agent 128)

Status (14:27 PDT 10-07): DONE. Read-only: no code, no PRs, no comments, no Supabase reads.
Code traced: backend main 675242fd (detached worktree /home/user/workspace/wt/R11-INT-AUD-128-backend), mobile main c00a2a5f
(git show only). Production = deploy 24 = 0d179edb (fly-deploy run 37680177041, success 13:11 PDT). Main adds #843 #844 #845 #846
#847 #848, so these are NOT live yet (deploy 25 pending). Open: b#849 R11-T3-FU, b#850 R11-L3, b#851 FLIP-TOOLS.
Flags assumed: FEATURE_ROMAN_TOOLS = FEATURE_ROMAN_MEMORY = FEATURE_ROMAN_PLAYBOOK = 'true'. The only companion values are
FEATURE_ROMAN_CHAT_ENABLED (already true), FEATURE_AI_CONSENT_LEDGER_ENABLED (already true), ROMAN_DAILY_COST_CAP_USD (unset = 100)
and ROMAN_BACKGROUND_DAILY_COST_CAP_USD (unset = 10) (src/common/env-validation.ts:2196-2245).

## Scope traced
(1) One client turn (roman.service.ts:959-1251)
- Order: chat flag -> SafetyRouter (crisis = fixed template, no model, no data) -> base consent gate :1016 -> coach-pool check :1021
  -> grounding bundle -> augmenters :1031-1032 -> memory-scope rule :1035 (memoryScopeOf :1328-1344: any applied block needs a live
  client-ai-v5 'memory' grant, else every block is dropped and the send stays 'base') -> tools turn :1039 -> one system prompt :1041.
- Prompt order (roman.prompts.ts:138-187): voice contract, guardrail contract, surface, session state, TOOLS + ANSWER CONTRACT (tools
  turn only), client_data, client_memory (<= 2,500 chars, newest notes first, whole lines; roman-client-memory.augmenter.ts:28-35,
  :116-123), coach_method, subject context. Each augmenter 1.5 s timeout (roman.constants.ts:160); a failure drops only its block.
  Payload bound 100k tokens, oldest history trimmed first (roman.service.ts:1715, :1739-1759).
- Tool loop (roman-tool-loop.ts): <= 3 tool rounds + 1 final no-tool call, <= 6 calls, 3 s per tool, 12,000 chars per result,
  25 s wall checked before each call (roman-tool.types.ts:62-68; loop :127-131). Every call goes through the egress gate with the
  same subject (roman.service.ts:1289-1320). Tools read only the caller's own rows; past Roman chats exclude deleted chats
  (roman-extra-history.ts:178); bookings never select coach_notes_md (roman-timeline.reader.ts:632-645).
- Metering: daily reservation 4 x (payload bound + 72k) for a tools turn (roman.service.ts:1062-1068); coach pool must cover
  4 worst-case calls for a client when tools are on (:1594-1601); settle + coach-pool debit on every path that spent tokens
  (:1070-1078, :1645-1680). Pool = the client's head coach (:1563-1574). Correct pool.
- Reply check: post-check with tool facts (roman.service.ts:1196-1201). Errors: pool empty = 402 pop-up before the turn is stored;
  daily cap = pop-up; provider error/timeout with no text = 503 ROMAN_MODEL_UNAVAILABLE with a specific server message
  (:1181-1194); a failed tool = is_error result and Roman says he cannot see that data (roman.prompts.ts:100-102).
(2) Notes writer (roman-notes.writer.ts): every 10 min, <= 25 clients; only live v5 grants (:79-80); reads only the client's own user
  turns after max(watermark, grant time) in non-deleted client chats (:105-115); no_consent moves the watermark, so turns from a
  memory-off period are never read later. Prompt forbids medical inference, logged numbers, contacts, other people; validator drops
  contacts/unsafe text (roman-notes.schema.ts:46-64). Chat deletion keeps notes (source_message_id onDelete SetNull,
  prisma/schema.prisma:8734). Account deletion erases RomanClientNote/Summary/MemoryState (account-deletion.manifest.ts:243-245) and
  CoachPlaybook/Source (:190-192). Client export includes notes and summaries (data-export.service.ts:1452-1464).
(3) Playbook: cron every 6 h (playbook-builder.scheduler.ts:36), <= 20 head coaches per run, rebuild only when the source digest
  changes (playbook-builder.service.ts:49-53, :158); sources scrubbed (playbook-scrub.ts), client material only from v5 clients
  (FLIP-PB-128 trace, re-checked); output validated against names/quotes; coach-method block only for a 'memory' holder.
(4) Memory off (= v4 grant by a v5 holder), Roman withdrawal, v4-only: withdrawal refuses before any read (roman.service.ts:1016);
  v4/memory-off: blocks dropped before send (:1328-1344), notes writer skips (:79-80), playbook excludes them. One deviation: U2.
(5) Logs: counts, codes, hashes, session ids only (rg over src/roman/{memory,playbook,tools,augment,background}); no note text.
(6) Coach never sees notes/chats/playbook in the app: only RomanService, the augmenters, the writer/builder and data export read those
  tables (rg). The head coach's own data export contains their active playbook (data-export.service.ts:1466-1468; disclosed in b#850).
(7) Mobile: reply is one buffered body with a 60 s abort (mobile src/api/romanApi.ts:486-488); memory switch m#463 shows only while
  the server sends memory_on + v5 copy (RomanAiConsentScreen.tsx:160-170); consultation box 2 grants v5 while memory is on.

## B list
- B1 (blocks PLAYBOOK; still open on main, fix in open b#850 R11-L3): an ordinary coach's programs, guidelines, meal plans and (for
  memory clients) messages and session notes go to Anthropic every 6 h while the live privacy policy/terms do not say so
  (FLIP-PB-128 B1; trust-pages.html.ts). Smallest fix: merge + deploy b#850.
- B2 (blocks PLAYBOOK; coach money, operator mail 14:41): an ordinary coach's AI credits drop every time Roman rebuilds their playbook
  (up to 4 times a day), while the only coach-facing text lists "workouts, meal plans, briefs, client chat" as what uses credits
  (mobile AIBudgetTutorialModal.tsx:94, :112) and the coach cannot see the playbook at all. See "Playbook metering" below.
- B3 (blocks TOOLS until b#849 merges; from R11-T3-FU-128 B1): an earlier day's figure stated as "today" passes the reply check
  when the sentence also says "your usual"/"last month" (roman-post-check.ts:336, :374, :417); tools put many more past-day
  numbers in front of Roman. Fix: b#849 @ 4b491b5e (READY).
- Ordering (not new code): MEMORY must not be set before deploy 25. Production 0d179edb lacks b#845, so memory off there still
  DELETES notes, and lacks b#844's policy text.

## U list
- U1 (TOOLS): a 3-round tools turn can run past the app's 60 s abort (25 s wall is checked only before a call, roman-tool-loop.ts:127,
  so the last round plus the final call can add ~30 s). The app then closes the request, the server aborts the loop, no reply is
  stored, the tokens are still debited, and the client reads "No connection to Roman right now." Smallest fix: backend
  turn_wall_ms 25_000 -> 15_000 (roman-tool.types.ts:66, one line, no app build). (FLIP-TOOLS-128 says the reply is still saved;
  that is wrong for this path.)
- U2 (MEMORY, privacy hygiene, not visible): the memory augmenter reads a v4/memory-off client's notes from the database before the
  scope check drops them (roman.service.ts:1031-1035); nothing is sent or shown. Smallest fix: read consentedClients(memory) first and
  skip augmenters without it (~5 lines).

## C one-liners
- Coach-pool and daily reservations are not atomic with the debit across concurrent turns. C (edge, deferred to 10k clients)
- Red lines are prompt rules only; post_check.red_lines is not enforced (roman-turn-augmenter.ts:43-48). C (edge, deferred to 10k clients)
- Two machines firing the same cron may build one coach twice (bounded by the $10/day ceiling). C (edge, deferred to 10k clients)
- Older installed app builds cannot grant v5, so memory stays inert for them. C (edge, deferred to 10k clients)
- Memory helper says notes come "from chats and logs"; the writer only reads chats (owner wording). C

## Playbook metering (operator mail 14:41)
- Pool: each build reserves and debits the HEAD COACH's monthly AI pool: payer {kind:'coach', coachId: head}
  (playbook-builder.service.ts:171-177) -> pool pre-check roman-background-spend.ts:110-120 -> debit on settle :217-233
  (head coach via :239-243). Model claude-sonnet-5-5 at $2/$10 per Mtok (anthropic-client.provider.ts:74).
- Cost cap: per build <= ~45-50k input bytes (sources capped at 40,000 chars, playbook-sources.ts:37) + 4,096 output tokens
  (playbook-builder.service.ts:52) = worst ~14 cents actual (~44 cents as displayed, x3.125, ai-credits.constants.ts:22-25); typical
  ~4-5 cents actual. Up to 4 builds per coach per day (cron 6 h, only when sources change): worst ~56 cents/day, ~$17/month actual
  against a $40 actual ($125 displayed) base pool. Platform-wide: all background work (notes + playbook) <= $10/UTC day
  (roman.constants.ts:154, roman-background-spend.ts:152); <= 20 coaches per run.
- What a coach sees: only the Coach Home meter going down (AIBudgetMount, CoachHomeScreen.tsx:249) and the tutorial copy listing
  "workouts, meal plans, briefs, client chat" (AIBudgetTutorialModal.tsx:94, :112). Nothing names the playbook; no usage breakdown.
  If the pool runs out, their clients' Roman gets the pool-empty pop-up sooner.
- Option A (one honest line on the credits screen): add "and Roman learning your coaching methods" to both tutorial strings (+ test).
  ~10-20 lines, mobile, T3 copy; reaches coaches only after a new app build; tells coaches about a feature they cannot open.
- Option B (platform pool, coach credits untouched): add payer {kind:'platform'} to RomanBackgroundPayer
  (roman-background-spend.ts:39-41), skip the pool pre-check and debit for it (:110-120, :211-233), pass it at
  playbook-builder.service.ts:173; spend stays bounded by the $10/day background ceiling. ~15 lines src + ~30 lines tests, backend
  only, works with the current app, T4 money -> Claude Opus 5.5.
- RECOMMENDED DEFAULT: B. The meter and its copy stay true without an app build, clients' Roman is never cut off by background work,
  and the platform cost is capped at $10/day. Notes writer (payer client -> head coach pool, roman-notes.writer.ts:143, Haiku, worst
  ~5 cents/run, typical <1 cent) is the client's own Roman use and fits "client chat"; keep it on the coach pool.

## Per-flag GO / NO-GO
| Flag | Verdict | Conditions / evidence |
|---|---|---|
| TOOLS | GO after conditions | Deploy 25 live (reply check #846, T1b #843, policy #844) and b#849 merged first (B3); then b#851. Own-data-only tools, 4-call budget, metered to the right pool, egress-gated (scope traced above). Recommend U1 one-liner with it. |
| MEMORY | GO after conditions | Deploy 25 live (b#845 keeps notes on memory off; b#844 text). v5-only reads/writes, chat deletion keeps notes, account deletion erases, coach never sees. Needs an app build with m#463 + C2B for anyone to grant v5. U2 optional. |
| PLAYBOOK | NO-GO | B1 (b#850 unmerged) and B2 (billing undisclosed; fix B recommended). Also only useful with MEMORY on (block needs the 'memory' scope). |

## Not fixed (needs operator)
1. B2: pick A or B (default B) and route to Claude Opus 5.5 (T4 money) before FLIP-PB.
2. Flip order: deploy 25 (with #849) -> TOOLS (#851) -> MEMORY -> b#850 merged+deployed and B2 fixed -> PLAYBOOK.
3. U1: roman-tool-loop wall 25 s -> 15 s (roman-tool.types.ts:66), FIX lane, T3/T4 (Opus).
4. Owner decision: existing v4 clients stay memory OFF until they tap the switch (consent cannot be presumed). Default: keep.
5. Owner decision noted by FLIP-PB-128: the head coach's data export contains their playbook (disclosed by b#850). Default: keep.

## HANDOFF
Audit complete; nothing pushed. Re-check only if b#849/#850/#851 change or deploy 25 lands. Worktree
/home/user/workspace/wt/R11-INT-AUD-128-backend is detached at 675242fd, read-only use.
