# OPERATOR_DECISIONS_LOG.md — durable cross-cutting decisions

**Append-only.** Every operator ruling that applies to multiple A-items, or that changes a previously-locked decision, goes here. Item-specific decisions live in the per-A-item spec stub under "Operator decisions (locked)".

Format: `YYYY-MM-DD · short-id · category · ruling (verbatim where possible)`

---

## 2026-06-19 · DISSOLUTION · ranking · Bucket B dissolved into Bucket A

**Verbatim:**
> "bucket B actually is actually 3/4 of the most important things to do - alongside import tooling"
> "Yes, dissolve Bucket B into Bucket A - just get rid of Bucket B"

**Effect:** Old B1 (Re-engagement+Dunning), B2 (Team QA), B3 (White-label) promoted to A3, A4, A5 respectively. Bucket A is now 13 items. The letter B is retired — do not reuse for future buckets.

**Authoritative location:** `roadmap/TGP-MASTER-PLAN-v2.md` §0.1 (post-dissolution table).

---

## 2026-06-19 · KILL · scope · AI video form analysis killed

**Verbatim:**
> "AI video form analysis - not that important right now"

**Effect:** v1 §2.4 → Bucket F1. Substrate (Mux + Anthropic) reusable for D1 video replies. Revisit only if a premium-tier customer explicitly asks.

---

## 2026-06-19 · SCOPE-EXPAND · A13 · money-flow is an engine, not a tracker

**Verbatim:**
> "Coach staff commission tracking - this needs expanded - not just a tracker/ on off switch, but a fuul 'How do you want the money to flow?' feature set"
> "Subcoach A pays me 4% of all money, SC B only pays me 200/mo flat on the 1st"

**Effect:** A13 builds a configurable `MoneyFlowRule` engine (percent / flat / hybrid / custom-date), not a binary tracker.

---

## 2026-06-19 · SCOPE-EXPAND · A12 · referrals bidirectional + first-payment shirt

**Verbatim:**
> "Referral tracking engine - client to client, coach to coach - For coach-coach referrals, i want a popup that states 'Your referral jsut processed their first payment! Here's a gift from us →' and its a free TGP shirt!"

**Effect:** A12 supports client↔client and coach↔coach. First-payment trigger fires celebration popup + free TGP shirt fulfillment.

---

## 2026-06-19 · SCOPE-EXPAND · A8 · lead funnel is 7-step hyperscaler chain

**Verbatim:**
> "Automated lead-to-client onboarding flow - this includes the custom landing page... I want this to be hyperscaler qquality flow - TGP create your landing page → put link in bio → client can do a gyues checkout → superlink to download — auto assinged to them → auto assigned the package they bought on the web page"

**Effect:** A8 welds 7 primitives into one funnel: TGP-built landing → bio link → guest checkout → superlink → install → auto-assign coach → auto-assign package → Day-1 Win.

---

## 2026-06-19 · SCOPE-EXPAND · A9 · role-gated 2-tab inbox

**Verbatim:**
> "Unified coach inbox - yes, split by client shit and team shit - if subcoach or solo coach, just client shit"

**Effect:** A9 ships role-gated 2-tab split. Sub-coaches and solo coaches see Clients tab only. Head coaches see both Clients and Team tabs.

---

## 2026-06-19 · SCOPE-CUT · A5 · white-label IN/OUT

**Verbatim:**
> "White-label - super important, but only to colors + name/logo work, nothing huge - also should be a side flow, not the default"

**Effect:**
- **IN:** colors + name + logo only; opt-in side flow; clean, luxurious, dead-simple upload
- **OUT:** app-store-per-tenant, full per-tenant DB partition beyond RLS, custom domain (already exists)

---

## 2026-06-19 · SCOPE-EXPAND · C3 · Admin Control Room as TGP biz war room

**Verbatim:**
> "Admin Control Room - medium/low - needs every single coach and their financial data roleld into a clean web UI + per person search and profiles - like a war room for all of TGP as a biz"

**Effect:** C3 is web-first (not mobile-screen-only). Every coach as a row, searchable. Per-coach financial drill-down. Per-person search across coaches + clients + applicants.

---

## 2026-06-19 · RANK · D1 async video replies are coach-side, low effort, ship UI

**Verbatim:**
> "Async video replies - replies to videos?" → (clarification) "NICE — yes, ship the UI, low effort"

**Effect:** D1 is coach-records-video-reply-to-client (Loom-style in a check-in/message thread), NOT client-uploads-form-video (that's the killed F1).

---

## 2026-06-19 · PARK · E1 cross-pillar fitness + wealth

**Verbatim:**
> "Cross-pillar (Fitness + Wealth) - park for now, long term play"

**Effect:** Substrate (`coach/cross-pillar/`, `BothPillarsScreen`, etc.) stays. No new work.

---

## 2026-06-19 · PARK · gym mode + door hardware + class forecasting

**Verbatim:**
> "Door hardware - behind gym mode"
> "AI class demand forecasting - throw behind gym mode"

**Effect:** All gym-mode items (E2 forecasting, E3–E10 gym-mode 4.1–4.8 including door hardware) deferred to Stage 4A/B/D/E per Master Plan.

---

*Append new operator decisions below this line.*

---

## 2026-06-26 · DOCTRINE · anti-padding · tests target real failure modes — EXTENDED to all future waves

**Verbatim (2026-06-26, on H6):**
> "im ok without massive filel rtests - but ACTUALLY GOOD tests shoul;d be made?"
> "Yes for H6 only"
> "Yes — two tests + R86 - but, if u had an IDEA for a great, non-filler 3rd test, then sure - but I think the two are fine"

**Verbatim extension (2026-06-26, Op 50.5 autonomous-mode dispatch):**
> Q: "Does the H6 anti-padding doctrine extend to all of A2/M-series (and forward), or is it still H6-only?"
> A: "Extend to all future waves"

**Effect:** R74/R86 anti-padding doctrine is now the DEFAULT POSTURE for every wave going forward. Tests target real failure modes only. Ratio-padding (constructor/getter/factory coverage purely to clear R74 1.0) is REJECTED EVERY TIME, regardless of wave. Every PR ships with an explicit R86 exception note in the body when ratio < 1.0, naming the real failure modes covered and what was rejected as padding. Builders default to 2 named tests + R86 note unless the slice genuinely has 3+ distinct real failure modes worth named coverage. Operator may still escalate to mandated padding on a case-by-case basis via explicit `[TEST-EXPAND]` instruction — silence = anti-padding holds.

**Authoritative location:** This log + every builder brief in `audit_briefs/`. Template `quality-references/BUILDER_BRIEF_TEMPLATE_V2.md` to be amended in a follow-up PR.

---

## 2026-06-26 · AUDIT-POSTURE · auto-merge OFF; angry-adversarial-ruthless audits gate every merge

**Verbatim (2026-06-26, on Op 50.5):**
> "auto-merge OFF everywhere - I want all agents to auto-merge on auditors dual CLEAN of any P0-P3's automatically"

**Verbatim extension (2026-06-26, H6C trigger question):**
> "wait for H6A AND H6B to get dual clean verdicts (clear of ANY P0-P3's - make sure your audits are ANGRY ADVERSARIAL RUTHLESS AUDITS - not 'did the last problems get fixed' but truly ripping for ANY issues) - once H6A AND H6B are dual cloean and merged, launch H6C and assses if anything can start alongside it from your to-do lsit"

**Effect:** No PR uses GitHub auto-merge. Every PR is gated on **dual-lens adversarial audit** (R72: Opus 4.8 Lens A + GPT-5.5 Lens B). Audit posture is ANGRY, ADVERSARIAL, RUTHLESS — auditors look for ANY new P0/P1/P2/P3 issue in the entire diff, not just verification that prior-flagged issues are fixed. Both lenses must return CLEAN before merge. Downstream slices in a wave do NOT dispatch until upstream slices in the same wave merge when cross-imports exist (e.g., H6C waits for H6A AND H6B merge). When upstream/downstream have zero cross-imports, parallel dispatch off main is allowed.

**Authoritative location:** This log; R72 dual-lens audit doctrine in `quality-references/`. Auditor system prompts to be updated in a follow-up PR.

---

## 2026-06-26 · SCOPE-EXPAND · A2 / M5 · multi-channel coach-led migration with Roman AI super-loaded link

**Verbatim (2026-06-26, A2 invite provider question):**
> "we use resend - but this should be sent as sms, email, phone push notif if possible, smart dunnin, and migrating coaches should automatically get prompted to send a link to download thats super-laoded (roman AI prompts this upon client ingest) (auto assigns clients to them and skips purchase path options) -> should be dead simple and"

**Effect:** A2 / M5 transactional email provider is **Resend** (locked). M5 expands from a single email send into a multi-channel coach-led migration funnel:

- **Channels:** Resend (email) + SMS (provider TBD — Twilio default unless operator overrides) + push notification (Expo push token to existing TGP app installs if client already has the app)
- **Smart dunning:** failed-delivery retry across channels (email bounces → SMS retry → push retry); cadence configurable per coach
- **Coach prompt:** upon ImportSession commit, Roman AI surfaces a coach-side prompt to send the super-loaded link to imported clients (Roman voice: warm, decisive, brief)
- **Super-loaded download link:** single URL that, when opened by an imported client:
  1. Auto-assigns the client to the migrating coach
  2. Skips the package/purchase path (client lands directly inside the coach's TGP workspace, no checkout step)
  3. Triggers a Day-1 Win sequence equivalent to T4.A8's onboarding hand-off
- **UX bar:** dead simple — one tap for the coach to fan out invites across all 3 channels; one tap for the client to land inside TGP

**Slices affected:** M5 expands; new sub-slices M5.A (SMS adapter), M5.B (Push adapter), M5.C (smart dunning fan-out), M5.D (Roman AI prompt + super-loaded link generator + auto-assign). Updated planner brief required after the M-plan reality check returns.

**Open operator decisions surfaced:**
- SMS provider — Twilio default unless overridden. Alternatives: AWS SNS, Resend SMS (newly launched 2026), MessageBird. Operator answer pending.
- Super-loaded link auto-assign vs T4.A8 7-step funnel: M5.D bypasses steps 3-5 (guest checkout, App-Store superlink, package auto-assign). Default assumption: M5.D is an alternate flow for migration imports specifically, NOT a replacement of A8.

**Authoritative location:** This log; `roadmap/specs/A02-import-tooling.md` to be amended.

---

## 2026-06-26 · REALITY-CHECK · A2 · Trainerize export reality narrows the lane substantially

**Verbatim (2026-06-26, Trainerize schema question):**
> Q: "How do we acquire the Trainerize 2026 export schema?"
> A: "real export sample - does that even exist?"

**Reality discovered (sources: [Trainerize Help Center](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize), [Trainerize transfer-data article](https://help.trainerize.com/hc/en-us/articles/26458988419220-Can-I-Transfer-Programs-or-Other-Data-from-One-Account-to-Another), [Assistant Coach data-portability audit 2026-04-13](https://assistantcoach.fit/blog/data-portability-fitness-coaching-software/), [CoachRx migration article 2026-05-04](https://intercom.help/coachrx/en/articles/14890425-migrating-clients-to-coachrx-with-bulk-csv-import-truecoach-trainerize-bridge)):**

- Trainerize CSV export = ONLY 4-5 fields: first name, last name, email, phone number, trainer name
- NO client history, NO programs, NO training progress, NO workout logs, NO check-ins, NO measurements
- Workouts/programs saveable as PDF ONLY — NOT structured data
- Trainerize Open API exists ("hire an expert") but no public schema for programs
- Same trivial roster CSV as 2021 — there is no "2026 export schema" of substance

**Effect on A02 acceptance criteria:**
- AC #1 ("Trainerize CSV importer handles 2026 export format") — TRIVIAL; ships as 4-5-field roster import
- AC #4 ("Program format conversion preserves set/rep/RPE structure") — **UNACHIEVABLE from Trainerize CSV/PDF**. Pivot options: (a) AI-assisted manual rebuild from PDF screenshots/uploads, (b) Trainerize Open API engagement (Trainerize-side hire-an-expert), or (c) reframe scope as competitor program conversion for platforms that DO export structured (TrueCoach 15-field CSV + workout text files; CoachRx structured exports; Assistant Coach JSON+CSV bundle).
- AC #5 ("Billing migration creates Stripe Connect plans at parity") — Trainerize sub data NOT exported. Coach must hand-enter or use the new M5.D Roman-AI prompt flow to walk through each client.

**Effect on M-series:**
- M2 (Trainerize CSV adapter) — TRIVIALIZED to ~120 prod LOC, 5-field roster
- M4 (Trainerize JSON adapter) — LIKELY KILLED; no JSON export exists
- M8/M9 (WorkoutProgram + WorkoutPlan converters from Trainerize) — UNACHIEVABLE as currently specced
- NEW slice candidate: **TrueCoach + CoachRx + Assistant Coach adapters** (broader hyperscaler-grade competitor import)
- NEW slice candidate: **AI-assisted manual program rebuild** consuming PDF/image uploads (uses Roman voice + Coach AI budget per T3.B economics cap)

**Authoritative location:** This log + `audit_briefs/M_PLAN_REALITY_CHECK.md` (in flight 2026-06-26 23:46 PDT). `roadmap/specs/A02-import-tooling.md` to be amended after reality check returns.

---

## 2026-06-26 · AUTONOMY-MODE · Op 50.5 autonomous H6-finish + M-series build-out

**Verbatim (2026-06-26):**
> "finish H6 - all your to-dos, M1A-MXX autonymously - if chocies come up - 1.) reserahc what a hyeprscaler would do - default to highest standard EVEN IF it changes scope - jsut change your plan accordingly  2.) If its a product direction decision, build around it + file it in detail following my metaphoric format for options/choices + move on as much a spossible, even finishing other PR's without merging"

**Effect:** Operator delegates autonomous execution of the H6 finish + M1.α through M11 lane to the dispatcher (Sonnet 4.6 main loop). Decision protocol locked:

1. **Implementation-detail choices** (libraries, patterns, layer counts) → research hyperscaler default → adopt highest standard → adjust plan accordingly → no operator prompt
2. **Product-direction choices** (channels, scopes, user-visible flows, irreversible architectural commitments) → file in this log in the operator's verbatim+effect format with 2-3 metaphoric options + hyperscaler-default flagged → build around the default → keep moving → operator can override async via `OPERATOR_DECISIONS_LOG.md` amendment or chat correction
3. **PRs may stack without merge** — downstream builders dispatch as soon as upstream PRs are open, NOT only on merge, when zero cross-imports verified. When cross-imports exist, builders dispatch only on upstream MERGE per operator's H6C ruling.
4. **Audits remain dual-lens adversarial and gate every merge** — autonomy applies to dispatch + brief-writing + decision-filing, NOT to merging. Operator merges manually on dual-CLEAN.

**Authoritative location:** This log; `current-state.json` for in-flight state.

---

## 2026-06-26 · DOCTRINE · M-series scope floor · M5 expansion is the BARE MINIMUM depth-of-thought per M-slice

**Verbatim (2026-06-26, 23:50 PDT, on Op 50.5 autonomous run):**
> "ok, work autonymously from now on - take my M5 scope expansion a smy BARE MINIMUM scope and thuroughness per M job - got it? If anything, that M5 scope is TOO SMALL AND DUMB"

**Effect:** The M5 multi-channel coach-led migration scope (Resend + SMS + push + smart dunning + Roman AI prompt + super-loaded auto-assigning link + dead-simple UX) is the **floor** for every M-slice in A2 going forward, not a one-off expansion. Every M-slice (M1.α through M11 and any new slices the reality check surfaces) MUST be planned with at minimum:

1. **Multi-channel / multi-surface where applicable** — not "ship to one channel and call it done" (e.g., M1.β preview/commit should surface in coach mobile + web + Roman-AI-prompted modal)
2. **Smart fallback chains** — if any pipeline step can fail (API call, parse, network, provider), there must be a documented fallback (retry, alternate provider, alternate channel, alternate UX path) — not a thrown error to the user
3. **Roman AI surfaces** — wherever a coach makes a decision, Roman AI prompts/assists/proposes the default action (warm, decisive, brief voice; uses Coach AI Budget per T3.B caps)
4. **Dead-simple UX** — one-tap or one-screen where possible; never multi-modal-wizard-of-doom; matches Stillwater quiet/standard/peak primitives from T5.A
5. **Hyperscaler-grade resilience** — idempotent, audit-event-emitting (consumes H6-α `withAuditLog`), RLS-correct, observable (Datadog spans), and reversible (R82-style undo path where state mutation is involved)
6. **Anti-padding tests** target the real failure modes of each new channel/fallback/surface (2 named tests is still the default per the 2026-06-26 anti-padding ruling above; if a slice has 5 real failure modes worth distinct named tests, ship 5)

**Sentinel:** If a planner brief or builder brief for any M-slice could be summarized as "ship X and stop", it's TOO SMALL AND DUMB. Expand before dispatch. Specifically:
- M1.β is NOT "preview + commit endpoints" — it's preview + commit + Roman-AI inline-suggestion overlay on the field-mapping UI + multi-format file upload (CSV/XLSX/JSON) + transactional rollback with coach-visible diff
- M2/M3/M4 adapters are NOT "parse and return rows" — each adapter is parse + heuristic header detection + AI-assisted field-mapping suggestions + per-row validation + per-row error annotation + suggested-fix prompts surfaced to the coach
- M10 (billing migration) is NOT "create Stripe Connect plan" — it's detect-existing-sub + propose-equivalent-plan + Roman-AI coach prompt to confirm/edit + atomic creation + idempotency + dispute audit trail
- M11 wizard is NOT "UI shell" — it's mobile + web + Roman-AI hand-holding + per-step progress + abort-and-resume + first-import celebration popup + Day-1 Win sequence chain

**Authoritative location:** This log. All M-series briefs must reference this ruling in their "Scope floor compliance" section. Reality check report (`audit_briefs/M_PLAN_REALITY_CHECK.md`, in flight) will be re-evaluated against this floor.
