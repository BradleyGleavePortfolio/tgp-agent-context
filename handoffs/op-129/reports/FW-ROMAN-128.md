# FW-ROMAN-128 — Roman in week one (FW-AUD-128 instance, read-only, agent 128)

Status (14:58 PDT 10-07): DONE. U1 verified against @react-navigation/core useNavigationBuilder.tsx:295 and native-stack tabPress (popToTop only when index > 0). Read-only: no code, no PRs, no comments, no Supabase reads.
Code traced: backend main 675242fd (detached worktree /home/user/workspace/wt/FW-ROMAN-128-backend), mobile main f240af37
(detached worktree /home/user/workspace/wt/FW-ROMAN-128-mobile). Store build = eas.json "clinic" (EXPO_PUBLIC_FF_ROMAN_CHAT=true,
CONSULTATION_ONBOARDING=true). Production backend flags: ROMAN_CHAT on; MEMORY/TOOLS/PLAYBOOK unset (off).
Open PRs touching this area, judged at their heads: m#506 @ 99c8fbea (DES-BC: AIGuideScreen, RomanConversation(s)Screen),
m#509 @ 675a6bd3 (DES-AY consultation look; consent wording/handlers unchanged), b#851 @ 36c7c454 (FLIP-TOOLS). Backend v1.1
internals (memory, tools, playbook, metering) are R11-INT-AUD-128's; not re-reported.

## Scope traced
- Entry: Home header Roman face (HomeHeaderActions.tsx:114-124) and You > "Roman" row (MoreScreen.tsx:219-229) -> MoreStack
  'RomanChat' (ClientNavigator.tsx:540-544, MoreStack headerShown:false :482-486).
- Chat: RomanChatScreen.tsx + useRomanChat.ts + romanApi.sendMessage (buffered SSE, 60 s abort :488). States: loading skeleton,
  unavailable/offline/error (RomanState), send-failed (draft kept), stored-no-reply, refusal (AiRefusalNotice -> AiConsentSheet),
  pool empty, rate-limited, daily cap pop-up (AiDailyCapModal, owner words). All present and wired.
- Backend turn: controller roman.controller.ts:97-187 (crisis check first; rate limit, consent, daily cap, pool skipped for crisis),
  streamAssistantTurn roman.service.ts:959+ (911/988 fixed templates, no model, no data, audit reason code only).
  Sessions are one per UTC day (openOrResumeSession roman.service.ts:254-302, day_key).
- No data yet: client_data with data_quality.missing; contract says "say so and how to fill it", never estimate
  (roman-guardrail.contract.ts:28-31). Degraded mode notice roman.prompts.ts:118-122. Honest by design.
- Crisis: emergency/self-harm share ai-crisis-router lists with the AI guide (/ai/chat crisis router answers before consent and
  quota too). Eating disorder / medical / injury are model + router hint + post-check (not fixed templates).
- Consent: consultation box 2 optional, unticked; v4 pinned text or server v5 copy (memory) with hash pins (aiConsent.ts).
  m#509 leaves consent wording and handlers unchanged.
- History/deletion: Settings > Roman > Roman and AI > Your conversations (list, open, delete one, delete all with typed DELETE);
  backend erases messages (roman-erasure.sweep.ts); chat screen drops an erased chat and opens a fresh one (useRomanChat.ts:166-185).
- Memory switch: RomanAiConsentScreen memorySwitchOf (:160-170) shows only with memory_on + pinned v5 copy -> hidden in production
  today (flag unset). Correct for the current state.
- Coachless client: no coach pool (poolCoachIdFor roman.service.ts:1563-1574 -> null), so pool-empty never shows; daily turn
  limit and spend cap still apply.

## (1) B list
None. No normal-day path found where money, private data, crisis routing, data loss or a core flow breaks. Crisis messages get the
911/988 template even with AI help off, daily cap reached or pool empty (controller :112-142).

## (2) U list
- U1 (navigation, highest value). A new client taps Roman's face on Home before ever opening the You tab: React Navigation 7
  mounts MoreStack with RomanChat as its ONLY route (no `initial: false`, HomeHeaderActions.tsx:116), and RomanChatScreen has no
  back control (header = avatar, title, conversations icon, RomanChatScreen.tsx:270-278). On iPhone there is no back and no swipe;
  tapping You again shows Roman chat (tab re-press pops to top = same screen). Profile, Settings, Membership, sign out, Roman and AI
  settings stay unreachable until the app is restarted. Fix: `navigation.navigate('MoreTab', { screen: 'RomanChat', initial: false })`
  (MoreScreen.tsx:295 already does this) + a visible Back (arrow-back, goBack) in the chat header like RomanConversationsScreen.tsx:336.
- U2 (copy). Roman reintroduces himself every day: isFirstOpen = today's session empty (useRomanChat.ts:144), and sessions are per UTC
  day, so on day 2-7 the client reads "Good day. My name is Roman. Ask about training, food or recovery at any time." again, and the
  "Welcome back, <name>" variant (romanVoice.ts:71-75) is almost never seen. Fix: first open = no earlier chats (GET /roman/sessions
  limit 1 via romanChatsApi, or a per-user local "met Roman" key set after the first reply).
- U3 (honest copy, coachless). A client with no coach is told about a coach they do not have:
  emergency template "your coach would want to hear from you in Messages" (backend safety-router.ts:172); medical/injury post-check
  repairs "Message your coach" and the post-check REQUIRES the word coach in every medical/injury reply (roman-post-check.ts:306-310,
  :648-653, :710); router hints "offer to help them message their coach" (safety-router.ts:220,:227,:236); client framing "the person
  training under a coach" (roman.prompts.ts:131); mobile daily cap "Your coach is in Messages any time" (aiDailyCap.ts:140);
  refusal "Your coach still sees your training information as usual" (aiRefusal.ts:155) and the consent sheet's same line
  (AiConsentSheet.tsx:114). For a coachless client "Messages" is the choose-a-plan screen. Fix: has_coach-aware variants
  (backend ctx.coach.has_coach already exists; skip the coach requirement at :710 when has_coach is false; emergency template
  neutral: "Once you are safe, let someone you trust know, and I will be here."); mobile: coach line only when the user has a coach.
- U4 (false promise). Chat load states say Roman will retry by himself: offline "I will try again once it returns"
  (romanVoice.ts:122) and error "That request did not complete. I will try again." (romanVoice.ts:91, also lib/roman/copy.ts:356).
  Nothing retries (RomanState only has a Try again button; no NetInfo/AppState listener). Fix: "Tap Try again when you are back
  online." / "That request did not complete. Tap Try again."
- U5 (copy contradicts app). Roman sends clients to "the Today tab" (roman.prompts.ts:121, roman-post-check.ts:656,
  roman-context.errors.ts:10,:15). The client tabs are Home, Train, Food, Calendar, You, Community. Fix: "Home".
- U6 (copy contradicts app). Many strings send clients to "Settings > Privacy > Roman and AI" / "Settings > Privacy"
  (romanChatsCopy.ts:134, aiRefusal.ts:165, AiConsentSheet.tsx:115,:127, consultation copy.ts:367-402, backend
  trust-pages.html.ts:271,:482). After DES-S2 (m#481) the row sits in its own "Roman" group (SettingsScreen.tsx:437), not under
  "Privacy and data". The consultation footer (copy.ts:49) and box-2 text are hash-pinned, so do not edit those. Fix (no consent
  re-version): change the unpinned strings to "Settings > Roman and AI". Owner-free alternative: move the row into "Privacy and data".
- U7 (Guidance dead send, NOT fixed by m#506). After one dropped request in Guidance, isOffline stays true (only a successful send
  clears it, AIGuideScreen.tsx:210/:260) and the Send button is disabled while offline (:450; m#506 head :398 same), so Send stays
  dead until the client leaves the screen. Fix: drop `|| isOffline` from disabled (keep the banner) or clear isOffline on NetInfo
  reconnect/typing. Fold into m#506 (FIX-PR) since it owns the file.
- U8 (history and deletion, Guidance). Guidance keeps up to 50 turns on the phone (AsyncStorage gp_chat_<userId>, chatDb.ts:3-24)
  with no delete control (clearChatHistory is never called). Roman chats have full delete; Guidance has none. Fix: a "Clear
  Guidance history" text action, or see polish NEW-2.
- U9 (safety fallback, design gap; owner decision below). An eating-disorder message ("I have been making myself throw up after
  meals") is not a fixed template, so a client with AI help off (box 2 is optional), daily cap reached or the coach pool empty
  gets only the "AI help is off" / limit message and no pointer to a person (controller gates :131-142 apply; only 911/988 bypass).
- U10 (calm look). Roman chat still uses the legacy palette (colors.* in RomanChatScreen/RomanComposer/RomanMessageBubble/
  RomanTypingIndicator; rule 7) and the DES-M-127 "Guidance look" job was never built (no PR). Typing dots repeat.

Already fixed at open-PR heads (not re-reported): Guidance "Trained on your coach's approach", "I have your goals, recent logs, and
check-ins on hand", false "Working offline" footer, "Message will send when connection returns", "offline mode" banner, GP initials,
"Ask me anything..." (all m#506).

## C one-liners
- loadOlder is wired to onEndReached of a non-inverted oldest-first list (RomanChatScreen.tsx:326-327), so older pages load when the
  client is at the newest message (whole history pages in); works, wasteful. C
- "Send again" after stored-no-reply re-sends the draft, so the question appears twice in the thread. C
- A chat open across the UTC midnight keeps writing to yesterday's session until reopened. C (edge, deferred to 10k clients)
- Memory helper "notes from chats and logs" vs writer reads chats only (already R11-INT-AUD C). C

## (3) Dead-button table (client Roman surfaces, main f240af37)
| Screen | Element | Does | Verdict |
|---|---|---|---|
| Home header | Roman face | navigate MoreTab/RomanChat | Works; strands the You tab (U1) |
| You | Roman row | push RomanChat | Works; no visible back (U1) |
| You | Guidance row | push AIGuide | Works |
| Roman chat | Conversations icon | push RomanConversations | Works |
| Roman chat | Send | sendMessage | Works; disabled while sending/over cap |
| Roman chat | Send again (error row) | re-send draft | Works (C duplicate after stored-no-reply) |
| Roman chat | Try again (RomanState) | reload/open | Works; hidden for unavailable |
| Roman chat | Allow AI help (refusal) | AiConsentSheet grant -> retry | Works |
| Roman chat | Contact support (egress) | support inbox/reference | Works |
| Roman chat | Daily cap OK | close modal | Works |
| Roman chat | Back | none exists | Missing (U1) |
| Conversations | Back / row / Delete / Delete all / Show older / Try again / Contact support | as named | Work (m#506 parity table) |
| Transcript | Back / Show earlier / Delete conversation | as named | Work |
| Roman and AI | Allow / Withdraw / memory switch / conversations entry / back | ledger calls, route | Work; memory switch hidden while flag off (correct) |
| Guidance | Shortcuts / Send | sendMessage | Send dead after one network failure (U7) |
| Guidance | Delete history | none exists | Missing (U8) |

## (4) First-week polish, ranked
1. FIX — Roman entry never strands the You tab and always has a Back (U1). Two lines plus a header arrow.
2. FIX — Roman greets a returning client as returning, not with the first-meeting intro every day (U2).
3. FIX — Coachless-honest Roman: no "message your coach" / "your coach sees" for clients without a coach (U3), backend + mobile.
4. FIX — Honest load-state and navigation names: no auto-retry promise (U4), "Home" not "Today tab" (U5), "Settings > Roman and AI"
   (U6).
5. NEW — Eating-disorder fallback when the AI cannot answer (U9): a fixed, warm line pointing to their coach (if any), a physician or
   a trusted person when AI help is off / capped / pool empty. Recommended default: YES (backend only, deterministic, no data read).
6. NEW — One AI front door: "Guidance" (separate AI chat, no server history, no delete) sits beside Roman in the same You list.
   Recommended default: keep both for launch, add "Clear Guidance history" (U8); revisit merging Guidance into Roman after launch.
7. FIX — Calm Roman chat (DES-M-127 as written, U10) with the Back from item 1.
8. FIX — Guidance send never stays dead after one failed request (U7), folded into m#506.
(Carrying yesterday's conversation into today's reply is covered by FLIP-TOOLS past-chats tool + memory; no new job.)

## (5) Proposed fix jobs (file-disjoint from each other and from open PRs m#506, m#509, b#851)
- FW-ROMAN-NAV-128 (GPT-6.1 Sol, BUILDER, T1 mobile, ~120 lines): U1 + U2. Files: src/components/home/HomeHeaderActions.tsx
  (initial:false), src/screens/roman/RomanChatScreen.tsx (header Back, 44 pt, goBack; theme colours for the new control only),
  src/screens/roman/useRomanChat.ts (isFirstOpen from "no earlier chats": romanChatsApi list limit 1, fall back to false on error),
  tests: src/screens/roman/__tests__/RomanChatNav.test.tsx (failing first). Must not touch romanVoice.ts.
- FW-ROMAN-COPY-M-128 (Claude Opus 5.5, BUILDER, T3 consent-adjacent copy, mobile, ~150 lines): U3 mobile + U4 + U6 mobile.
  Files: src/components/roman/romanVoice.ts (:91, :122, :188 coach line only when has coach), src/lib/roman/copy.ts (:356),
  src/lib/ai/aiDailyCap.ts (:139-141 has-coach variant), src/lib/ai/aiRefusal.ts (:155, :165), src/components/ai/AiConsentSheet.tsx
  (:114-115, :127 strings only), src/screens/settings/romanChatsCopy.ts (:134), + their tests. Do NOT touch hash-pinned consent
  text (lib/consultation/copy.ts:41-49) or consultation copy (m#509 area). Has-coach signal: useCurrentUser coach id.
- FW-ROMAN-COPY-B-128 (Claude Opus 5.5, BUILDER, T3 safety/prompt copy, backend, ~200 lines): U3 backend + U5 + NEW-5 if the owner
  says yes. Files: src/roman/guardrails/safety-router.ts (:172 neutral close; :220/:227/:236 "if they have a coach"; optional ED
  fallback template), src/roman/guardrails/roman-post-check.ts (:306-310 fallback, :648-656 coachless variants + "Home", :710 skip
  coach requirement when !has_coach), src/roman/roman.prompts.ts (:121 "Home", :131 neutral framing),
  src/roman/context/roman-context.errors.ts (:10, :15 "Home"), src/roman/roman.controller.ts only if the ED fallback is approved,
  + specs. Bump PROMPT_VERSION per repo rule; check the eval harness fixtures.
- FIX-506-128 fold (FIX-PR lane, Claude Opus 5.5 per FIX-PR entry): U7 on m#506 (AIGuideScreen.tsx disabled condition) and, if the
  owner keeps Guidance, U8 "Clear Guidance history" (uses existing chatDb.clearChatHistory). ~40 lines inside m#506.
- DES-M-127 relaunch (GPT-6.1 Sol, T1 mobile) AFTER FW-ROMAN-NAV-128 merges (same RomanChatScreen.tsx): calm chat look as written.

## Cross-area (one line each, for the operator)
- FW-ONB/ACCOUNT: HomeScreen.tsx:338 navigate('MoreTab', {screen:'EditProfile'}) has the same missing `initial: false` (You tab then
  opens on Edit profile).
- FW-ACCOUNT: Guidance history (AsyncStorage gp_chat_<userId>) is not cleared on sign-out or account deletion.
- FW-MONEY: RootNavigator.tsx:1016/:1046, CoachlessHomeSlot.tsx:130, CheckoutReturnScreen.tsx:273 open MoreTab/ClientPackages without
  `initial: false` (check they have a Back).

## Not fixed (needs operator / owner)
1. Owner: NEW-5 eating-disorder fallback when AI cannot answer. Recommended default: yes, fixed template, backend only.
2. Owner: Guidance beside Roman. Recommended default: keep both for launch + clear-history control.
3. Operator: launch FW-ROMAN-NAV-128 first (largest user impact, smallest diff), then the two COPY jobs; DES-M-127 after NAV.

## HANDOFF
Audit complete; nothing pushed, no comments. Worktrees /home/user/workspace/wt/FW-ROMAN-128-{backend,mobile} are detached at
675242fd / f240af37 for read-only use. Re-check U7/U8 if m#506 changes; re-check U3/U5 line numbers if any Roman guardrail PR lands.
