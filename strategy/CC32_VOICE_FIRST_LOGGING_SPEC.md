# CC32_VOICE_FIRST_LOGGING_SPEC — Voice-First Logging ("Hey Roman")

> Standalone behavior spec for voice-driven logging of **workouts** (sets/reps/weight),
> **nutrition** (meals + macros), and **check-ins** (mood/sleep/weight/notes), inside the
> existing TGP coach app + client app. Source of truth for behavior; code references point
> at `growth-project-backend` (NestJS + Prisma) and `growth-project-mobile` (Expo / React Native).
>
> **Operator-confirmed decisions are locked in §0.** Everything below implements them. Where a
> value is the operator's to set, the spec is written to be **value-agnostic** (notably the
> AI-usage multiplier).

---

## 0. Locked operator decisions (do not relitigate in implementation)

| # | Decision | Locked value |
|---|----------|--------------|
| D1 | Wake-word **"Hey Roman"** | **iOS only**, via Apple's built-in `SFSpeechRecognizer` (on-device, free, low battery). Android is **tap-to-talk only** — no wake-word — until parity ships in a future cycle. The asymmetry is intentional; see §3 + §3.4 rationale. |
| D2 | Transcription engine | **OpenAI Whisper API** (`whisper-1`, **$0.006/min**), server-side, is the canonical transcript. **On-device Apple Speech is the offline fallback ONLY** — degraded accuracy, used solely when the device has no network. |
| D3 | Entity / number extraction | **GPT-4o-mini**, server-side, fed the raw transcript + a structured-output schema. OpenAI **structured outputs / JSON mode**. Schemas in §2.4. |
| D4 | Cost accounting | **Every** Whisper call **and every** GPT-4o-mini call is metered and withdrawn from the coach's **AI Budget**. The existing **raw-cost → coach-displayed-usage multiplier** (`{AI_USAGE_MULTIPLIER}`) **applies here too**. Withdrawal path is explicit in §2.6 + §4. Spec is **multiplier-agnostic**. |
| D5 | Surfaces | **All three**: workouts + nutrition + check-ins. |
| D6 | Trigger UX | "Hey Roman" wake word (**iOS**) **OR** a persistent **tap-to-talk** mic button on the workout / nutrition / check-in screens (**both platforms**). Tap-**and-hold** = push-to-talk; **tap-once** = hands-free utterance that auto-stops on **1.5s** of trailing silence. |

`{AI_USAGE_MULTIPLIER}` is a **placeholder** throughout this document. The operator sets the real
value in env / per-coach config (see §2.6 and §6). The implementing engineer **must not** hardcode
a number. The displayed cost is always `raw_openai_cost × {AI_USAGE_MULTIPLIER}`.

---

## 1. Purpose & scope

**Purpose.** Let a lifter / client log a set, a meal, or a daily check-in **by talking**, without
breaking flow mid-workout or mid-meal. A user mid-bench-press should be able to say
*"Hey Roman, 315 for 5"* and have a `WorkoutSetLog` written, confirmed in Roman's voice, and the
cost correctly withdrawn from the coach's AI budget — all in one breath.

**In scope (v1):**

- Single-utterance logging on three surfaces: **workouts**, **nutrition**, **check-ins**.
- iOS wake-word ("Hey Roman") + cross-platform tap-to-talk.
- Server-side Whisper transcription + GPT-4o-mini structured extraction.
- AI-budget metering of **both** OpenAI calls per utterance, through the **existing** metering service, with the **existing multiplier** applied.
- A new `VoiceLoggingEvent` audit/cost table.

**Out of scope (v1) — see §7 for the full non-goals list.** Continuous whole-session
transcription, coach-side voice messaging, and voice-driven UI navigation are explicitly **not** in v1.

---

## 2. Backend

### 2.1 New module — `src/voice-logging/`

A **new, self-contained** NestJS module at `src/voice-logging/`. This path is chosen specifically
so it **does not collide** with anything in the in-flight **v1-4**, **R2**, or **R3** worktrees —
no existing file under `src/wearables/`, `src/ai/`, `src/ai-credits/`, or the workout/nutrition/
check-in domains is edited except the **two additive registrations** noted in §2.7.

```
src/voice-logging/
├── voice-logging.module.ts
├── voice-logging.controller.ts        # 3 POST routes (§2.3)
├── voice-logging.service.ts           # orchestration + AI-budget withdrawal (§2.5, §2.6)
├── dto/
│   ├── voice-workout-set.dto.ts
│   ├── voice-nutrition-entry.dto.ts
│   └── voice-check-in.dto.ts
├── extraction/
│   ├── extraction.schemas.ts          # OpenAI structured-output JSON schemas (§2.4)
│   └── extraction.prompts.ts          # pinned per-surface system prompts
└── voice-logging.constants.ts         # surface enum, idempotency window, throttle limits
```

The service **depends on** (constructor injection only — no schema mutation, no edits to these):

- the **existing AI-usage-metering service** that already handles current AI-feature billing
  (in TGP today this is `CoachAIBudgetService` in `src/ai-credits/`, exposing the `canCharge()`
  pre-call gate and `recordUsage()` post-call accumulate; the implementing engineer confirms and
  wires the exact injected symbol — see §2.6);
- the existing Prisma models **`WorkoutSetLog`**, **`MealEntry`** (a.k.a. the nutrition meal-entry
  model), and **`CheckIn`** — written via the existing PrismaService, **unchanged**.

### 2.2 End-to-end flow (ASCII) — one set log

The canonical happy path for *"Hey Roman, 315 for 5"*:

```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ MOBILE (iOS)                                                               │
 │                                                                            │
 │  user: "Hey Roman, 315 for 5"                                             │
 │        │                                                                   │
 │        ▼                                                                   │
 │  SFSpeechRecognizer (on-device) detects wake-word "Hey Roman"             │
 │        │   (always-listening ONLY while on a logging screen — §3.1)       │
 │        ▼                                                                   │
 │  start audio capture → record buffer ("315 for 5")                        │
 │        │   auto-stop on 1.5s trailing silence (tap-once mode)             │
 │        ▼                                                                   │
 │  attach client_utterance_id (UUID) + client_app_version + context_hint    │
 │        │   context_hint = current exercise / screen (e.g. "bench_press")  │
 │        ▼                                                                   │
 │  POST /voice-logging/workout-set  { audio_b64|audio_url, ... }            │
 └────────┬───────────────────────────────────────────────────────────────┘
          │  (network)
          ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ BACKEND  (src/voice-logging/)                                              │
 │                                                                            │
 │  controller  → @Throttle default {ttl 60_000, limit 30}  (§2.8)            │
 │              → idempotency: dedup on client_utterance_id (5-min window §2.9)│
 │        │                                                                   │
 │        ▼                                                                   │
 │  voice-logging.service.handleWorkoutSet()                                  │
 │        │                                                                   │
 │  ┌─────┴───────────────────────────────────────────────────────────────┐ │
 │  │ 1. OpenAI Whisper (whisper-1)  ── transcript: "315 for 5" ──┐         │ │
 │  │      raw cost #1 (audio minutes × $0.006/min)               │         │ │
 │  │                                                              ▼         │ │
 │  │ 2. OpenAI GPT-4o-mini structured output                                │ │
 │  │      input: transcript + WORKOUT schema + context_hint                 │ │
 │  │      → { weight: 315, reps: 5, unit: "lbs", exercise_hint: "bench" }   │ │
 │  │      raw cost #2 (input+output tokens)                                  │ │
 │  └─────┬───────────────────────────────────────────────────────────────┘ │
 │        │                                                                   │
 │        ▼                                                                   │
 │  3. AI-BUDGET WITHDRAWAL  (BEFORE returning the parsed result — §2.6)      │
 │      raw_openai_cost_cents = cost#1 + cost#2                               │
 │      displayed_cost_cents  = raw_openai_cost_cents × {AI_USAGE_MULTIPLIER} │
 │      → call existing metering service: canCharge(coachId) gate            │
 │      → recordUsage(coachId, raw_openai_cost_cents)   [multiplier applied   │
 │                                                       inside metering]    │
 │        │                                                                   │
 │        ▼                                                                   │
 │  4. write WorkoutSetLog (existing Prisma model, unchanged)                │
 │        │                                                                   │
 │        ▼                                                                   │
 │  5. write VoiceLoggingEvent row (transcript, parsed, costs, latency §2.10)│
 │        │                                                                   │
 │        ▼                                                                   │
 │  return { ok: true, parsed: {weight:315,reps:5,unit:"lbs"}, log_id }       │
 └────────┬───────────────────────────────────────────────────────────────┘
          │
          ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ MOBILE                                                                     │
 │  show "315 lbs, 5 reps. Recorded." in Roman's voice (text v1; TTS v2 §6)  │
 │  [Edit] affordance to correct the parsed result (§3.3)                     │
 └──────────────────────────────────────────────────────────────────────────┘
```

**Ordering invariant:** the AI-budget withdrawal (step 3) happens **before** the `{ ok, parsed }`
response is returned. A failure to charge is not silently swallowed — see §2.6 for the
pre-call-gate vs. post-call-record semantics and the budget-exhausted path.

### 2.3 Endpoint shapes

All three routes live on `@Controller('voice-logging')` and are auth-guarded with the same JWT /
role pattern used elsewhere (`JwtAuthGuard`); the subject is the calling user, and the coach billed
is that user's owning coach.

| Route | Surface | Writes |
|-------|---------|--------|
| `POST /voice-logging/workout-set`   | workouts   | `WorkoutSetLog` |
| `POST /voice-logging/nutrition-entry` | nutrition  | `MealEntry` |
| `POST /voice-logging/check-in`       | check-ins  | `CheckIn` |

**Request body (all three, `.strict()` — unknown keys rejected):**

```jsonc
{
  "audio_url": "https://…",        // OR audio_b64 (exactly one required)
  "audio_b64": "…base64…",         // OR audio_url
  "client_app_version": "3.12.0",  // for server-side capability gating / debugging
  "context_hint": "bench_press",   // current exercise / meal slot / check-in field; nullable
  "client_utterance_id": "uuid",   // idempotency key (§2.9)
  "captured_offline": false        // true ⇒ device used Apple Speech fallback transcript (§2.11)
}
```

**Success response:**

```jsonc
{ "ok": true, "parsed": { /* surface-specific, §2.4 */ }, "log_id": "…" }
```

**Failure response** (empty transcript, extraction miss, or budget exhausted):

```jsonc
{ "ok": false, "reason": "EMPTY_TRANSCRIPT | EXTRACTION_FAILED | AI_BUDGET_EXHAUSTED | INVALID_AUDIO",
  "transcript": "315 for"   // partial transcript when we have one, so mobile can pre-fill keyboard entry (§3.4)
}
```

`ok: false` is always a **typed reason**, never a swallowed error or an empty string. The mobile
failure UI (§3.4) keys off `reason` and uses `transcript` to pre-fill manual entry.

### 2.4 Structured-output extraction schemas

GPT-4o-mini is called with OpenAI **structured outputs / JSON mode**, one pinned schema per surface.
The model receives `{ raw_transcript, context_hint }` and must return **only** the schema shape.

**Workouts** → write `WorkoutSetLog`:

```jsonc
{ "weight": 315, "reps": 5, "unit": "lbs", "exercise_hint": "bench_press" }
// unit ∈ {"lbs","kg"}; exercise_hint is the model's best guess, reconciled against context_hint
```

**Nutrition** → write `MealEntry`:

```jsonc
{ "food_items": ["chicken breast", "white rice"], "portions": ["6 oz", "1 cup"] }
// food_items[i] pairs with portions[i]; macros are derived downstream by the existing
// nutrition pipeline — voice logging does NOT invent macros.
```

**Check-ins** → write `CheckIn`:

```jsonc
{ "mood": "good", "sleep_hours": 7.5, "weight_lbs": 198.4, "notes": "felt strong, slight knee niggle" }
// any field may be null when the utterance didn't mention it.
```

If the model returns a schema-valid-but-empty payload (e.g. all-null for the relevant surface),
the service treats it as `EXTRACTION_FAILED` (typed) rather than writing an empty log.

### 2.5 Service orchestration — `voice-logging.service.ts`

For each surface the service runs the same six-stage pipeline:

1. **Idempotency check** on `client_utterance_id` (§2.9). If a settled result exists in the 5-min window, return it verbatim — no second OpenAI spend.
2. **Whisper** transcription (`whisper-1`). Records `openai_cost_cents += whisper_cost`. Empty / non-speech transcript → `{ ok:false, reason:'EMPTY_TRANSCRIPT' }` (still meters the Whisper call — see §2.6 note on metering even on extraction miss).
3. **GPT-4o-mini** structured extraction against the surface schema. Records `openai_cost_cents += extraction_cost`.
4. **AI-budget withdrawal** (§2.6) — happens **before** any success response.
5. **Write the domain log** (`WorkoutSetLog` | `MealEntry` | `CheckIn`) via existing Prisma model.
6. **Write `VoiceLoggingEvent`** (§2.10) and return `{ ok, parsed, log_id }`.

The service surface is small and explicit, e.g.:

```ts
handleWorkoutSet(userId, dto):    Promise<VoiceLoggingResult>
handleNutritionEntry(userId, dto): Promise<VoiceLoggingResult>
handleCheckIn(userId, dto):        Promise<VoiceLoggingResult>
```

### 2.6 AI-budget withdrawal path (the load-bearing requirement)

**Every Whisper call and every GPT-4o-mini call is metered and withdrawn from the coach's AI
budget, with the existing multiplier applied.** This is mandatory and is wired through the
**existing** AI-usage-metering service — voice logging does **not** invent its own billing.

In TGP today the metering owner is **`CoachAIBudgetService`** (`src/ai-credits/`), with:

- `canCharge(coachId)` — **pre-call gate**; throws **`402 AI_BUDGET_EXHAUSTED`** when the
  coach's displayed usage has hit the included allowance.
- `recordUsage(coachId, rawCostCents, …)` — **post-call accumulate**; increments
  `CoachAIBudget.used_cost_cents` by the **raw** cost. The **displayed** figure the coach sees is
  always computed as `used_cost_cents × VALUE_MULTIPLIER` — i.e. **the multiplier lives inside the
  metering service / table config, not in voice-logging code.** This is exactly the behavior the
  operator confirmed: voice logging supplies **raw** OpenAI cost; the existing system applies the
  multiplier. Here `VALUE_MULTIPLIER` **is** the operator's `{AI_USAGE_MULTIPLIER}`.

**`voice-logging.service.ts` MUST call into this metering service before returning the parsed
result.** Concretely:

```
gate (pre-OpenAI):   canCharge(coachId)         → 402 AI_BUDGET_EXHAUSTED if exhausted
                                                   (return { ok:false, reason:'AI_BUDGET_EXHAUSTED' })
… run Whisper + GPT-4o-mini, accumulate raw_openai_cost_cents …
record (post-OpenAI): recordUsage(coachId, raw_openai_cost_cents)   ← BOTH calls' cost, summed
return:               { ok, parsed, log_id }   ← only after recordUsage resolves
```

> **Registry gotcha — do not skip this (lesson from the wearables-insights wave).** TGP's gateway
> only enforces budget for capabilities present in **`COACH_AI_METERED_CAPABILITIES`**
> (`src/ai-credits/ai-credits.constants.ts`). A prior insights PR silently **bypassed** the budget
> because its capability strings were missing from that set. Voice logging must register its
> capability identifiers (suggested: `voice_log.workout`, `voice_log.nutrition`, `voice_log.check_in`)
> in that set, **or** call `recordUsage` directly with the raw cost — whichever the implementing
> engineer confirms is the live billing seam. **If you route through the gateway, the capability
> string MUST be in the metered set, or every voice utterance is free and the budget is a lie.**

**Metering on extraction miss:** even when Whisper returns an empty transcript or GPT-4o-mini fails
to extract, the **OpenAI calls already happened and cost money**, so their raw cost is still
recorded via `recordUsage`. We never give away spend for free; the user simply gets `ok:false`.

**Idempotent replays do NOT re-meter** — a deduped utterance (§2.9) returns the prior settled
result without a second OpenAI call and therefore without a second withdrawal.

### 2.7 Prisma — one new table only, no FK alter on existing tables

**The only schema change is a new `VoiceLoggingEvent` table.** No column is added to, and no FK is
altered on, `WorkoutSetLog`, `MealEntry`, `CheckIn`, `CoachAIBudget`, or any other existing model.
The migration is a **pure additive CREATE TABLE**.

```prisma
model VoiceLoggingEvent {
  id                  String   @id @default(uuid())
  user_id             String   // the logging user (client)
  coach_id            String   // the coach whose AI budget is charged
  surface             VoiceLoggingSurface  // WORKOUT | NUTRITION | CHECK_IN
  transcript          String   // Whisper output (or Apple Speech fallback transcript)
  parsed              Json     // the GPT-4o-mini structured result (or null on miss)
  openai_cost_cents   Int      // RAW summed OpenAI cost (Whisper + GPT-4o-mini)
  displayed_cost_cents Int     // openai_cost_cents × {AI_USAGE_MULTIPLIER}, snapshotted at write time
  latency_ms          Int      // end-to-end server latency for the utterance
  created_at          DateTime @default(now())
}

enum VoiceLoggingSurface { WORKOUT NUTRITION CHECK_IN }
```

`displayed_cost_cents` is snapshotted on the row for auditability, but **the authoritative budget
ledger remains `CoachAIBudget`** — `VoiceLoggingEvent` is an event/audit log, not a second source of
truth for the balance. No `user_id` / `coach_id` foreign-key constraints are added to avoid touching
existing tables; they are plain string columns matching the audit-table pattern already used by
`AiRequestAudit`.

### 2.8 Throttling

Per-user abuse cap on every voice-logging route:

```ts
@Throttle({ [THROTTLER_NAMES.DEFAULT]: { ttl: 60_000, limit: 30 } })
```

30 utterances / 60s / user — comfortably above a fast lifter rattling off a superset, well below an
abusive loop. This is a **second** cost guard layered under the AI-budget gate (§2.6): the throttle
bounds request rate; the budget bounds dollar spend.

### 2.9 Idempotency

The client generates a **`client_utterance_id` (UUID)** per utterance and sends it on the request.
The backend **dedups within a 5-minute window**: if a settled result already exists for that
`client_utterance_id`, the prior `{ ok, parsed, log_id }` is returned verbatim — **no second OpenAI
call, no second domain-log write, no second budget withdrawal.** This protects against retries on
flaky mobile networks (the audio upload is the most likely thing to time out and retry). Outside the
5-minute window the id is treated as new.

### 2.10 `VoiceLoggingEvent` write

Written on **every** settled utterance — success **and** typed failure — capturing `transcript`,
`parsed` (null on miss), `openai_cost_cents`, `displayed_cost_cents`, `latency_ms`, `surface`,
`user_id`, `coach_id`. This is the provenance + cost audit trail (mirrors how `AiRequestAudit`
records every gateway invoke).

### 2.11 Offline fallback transcript (D2)

When the mobile client had **no network**, it transcribes locally with Apple Speech and sends
`captured_offline: true` plus the device transcript. In that case the backend **skips the Whisper
call** (there was no server-side audio to transcribe, or audio is sent for later re-transcription per
operator choice) and runs GPT-4o-mini extraction on the device transcript. The `VoiceLoggingEvent`
records `openai_cost_cents` = the extraction cost only (no Whisper line). Degraded accuracy is
expected and the result is flagged to the user. **Apple Speech is the fallback ONLY** — online, the
canonical transcript is always Whisper.

---

## 3. Mobile UX (Expo / React Native)

### 3.1 iOS — wake-word, scoped to logging screens

- Uses `SFSpeechRecognizer` (Apple's on-device speech, free, low battery) via
  `expo-speech-recognition` (or the equivalent RN binding) for **wake-word "Hey Roman"** detection.
- **Always-listening is enabled ONLY while the user is on a logging-relevant screen** — the
  **Workouts**, **Nutrition**, or **Check-in** screens. It is **never** enabled globally, never in
  the background, and is **torn down on screen blur / unmount.** Leaving a logging screen stops the
  recognizer.
- On wake-word detection: start audio capture, show the recording affordance (§3.3), capture the
  utterance, then upload to the backend (§2.3). Wake-word detection is **on-device only** — the
  audio for the *utterance after* the wake word is what gets uploaded for Whisper.

**Privacy posture (state it plainly in-product and in the App Store privacy nutrition label):**
listening happens **on-device**, **only on logging screens**, **only to catch "Hey Roman"**, and the
recognizer is **off everywhere else in the app**. We do not stream a live mic to our servers; we
upload a single short utterance buffer per log. See §5 for retention.

### 3.2 Android — tap-to-talk only

- **No wake-word** on Android in this cycle (D1). The only trigger is the **mic button**.
- Visual: a persistent **mic button** on the Workouts / Nutrition / Check-in screens, with an
  **animated waveform** while recording.
- Parity (Android wake-word) is a **future cycle**, not v1. Document the asymmetry in the Android
  build notes so it is not mistaken for a bug.

### 3.3 Trigger gestures + confirmation UI (both platforms)

- **Tap-and-hold** the mic = **push-to-talk** (records while held, sends on release).
- **Tap-once** = **hands-free utterance**: records and **auto-stops on 1.5s of trailing silence.**
- While recording: animated waveform + a "listening…" state.
- **Confirmation:** the parsed result is read back **in Roman's voice** — **text first in v1**
  ("315 lbs, 5 reps. Recorded."), with **optional Roman TTS read-back deferred to v2** (open
  decision §6). An **[Edit]** affordance lets the user correct the parsed fields inline before
  it's considered final.

### 3.4 Failure UI

If `ok:false` (`EMPTY_TRANSCRIPT` / `EXTRACTION_FAILED`), the app **falls back to keyboard entry**
with the **(possibly partial) `transcript` pre-filled** so the user fixes a few characters instead
of retyping from scratch. `AI_BUDGET_EXHAUSTED` shows the coach-budget message and routes to manual
entry without implying the user did anything wrong. Failures are never silent.

---

## 4. Cost model (worked example)

| Item | Basis | Per-utterance |
|------|-------|---------------|
| **Whisper** (`whisper-1`) | $0.006 / min; avg set utterance ≈ 3–5 s | **≈ $0.0005** |
| **GPT-4o-mini** extraction | ≈ 300 input tokens + ≈ 50 output tokens | **≈ $0.00005** |
| **Raw OpenAI cost / utterance** | Whisper + extraction | **≈ $0.00055** |
| **Displayed cost to coach** | raw × `{AI_USAGE_MULTIPLIER}` | **$0.00055 × {AI_USAGE_MULTIPLIER}** |

**Fleet projection (raw, before multiplier):**

```
10,000 DAU × 5 utterances/day = 50,000 utterances/day
50,000 × $0.00055              = $27.50 / day raw OpenAI cost
                               ≈ $830 / month raw OpenAI cost   (before multiplier)
```

The **coach-displayed** figure (and therefore what is drawn down from each coach's AI budget) is the
raw figure **× `{AI_USAGE_MULTIPLIER}`** — set by the operator (§6). The spec deliberately does not
assume a multiplier value; the projection above is the **raw infrastructure** number the operator
multiplies.

---

## 5. Privacy + permissions

### 5.1 iOS Info.plist strings (copy in Roman's voice — ship verbatim)

```
NSSpeechRecognitionUsageDescription
  "Let me listen for 'Hey Roman' so you can log a set without putting the bar down.
   I only listen on your logging screens, never in the background."

NSMicrophoneUsageDescription
  "I use the mic to hear you call your sets, meals, and check-ins out loud.
   Your audio is used to transcribe what you said and then it's gone."
```

### 5.2 Android

- `RECORD_AUDIO` permission.
- **Requested at the first tap on the mic button — NOT at app launch.** No mic prompt until the
  user actually reaches for voice logging.

### 5.3 Audio retention

- **Raw audio bytes are deleted within 60 seconds of the transcript returning.** The audio buffer /
  uploaded blob is ephemeral.
- **Only the transcript + parsed result + cost row (`VoiceLoggingEvent`) are retained.** No raw audio
  is persisted. State this in the privacy label.

---

## 6. Open decisions for operator

| # | Decision | Notes |
|---|----------|-------|
| O1 | **Exact `{AI_USAGE_MULTIPLIER}` value** | Operator config (env / per-coach, same knob as today's `CoachAIBudget.VALUE_MULTIPLIER`). Spec is multiplier-agnostic. |
| O2 | **Gated entitlement (Pro tier only) or universal?** | If gated, gate at the controller via the existing entitlement guard; no other change. |
| O3 | **Ship Roman **TTS** read-back in v1, or text-only confirmation?** | v1 spec is text-first; TTS is wired as a v2 add-on (§3.3). |
| O4 | **Multilingual day-one or English-only?** | Whisper + GPT-4o-mini both support multilingual, but extraction prompts/schemas are tuned for English in v1. Operator decides launch locale set. |

---

## 7. Non-goals for v1 (do not let these creep in)

- **Continuous transcription** — logging a whole 45-minute workout in one long recording. v1 is
  **single-utterance** only ("315 for 5", "chicken and rice", "slept 7 hours, feel good").
- **Coach-side voice messaging** — voice logging is **client-side data entry**, not a voice channel
  between coach and client.
- **Voice-driven UI navigation** — "Hey Roman, open my meal plan" / arbitrary app commands are out.
  The wake word triggers **logging**, not navigation.

If any of these appears in implementation, it is **scope creep** and should be bounced back to the
operator.

---

## 8. Worktree-collision guarantee

This module is intentionally isolated so it can land alongside the in-flight **v1-4 / R2 / R3**
worktrees without conflict:

- **New code:** entirely under `src/voice-logging/` (no existing file edited).
- **New migration:** one additive `CREATE TABLE VoiceLoggingEvent` + the `VoiceLoggingSurface` enum.
  **No** column add / FK alter on `WorkoutSetLog`, `MealEntry`, `CheckIn`, `CoachAIBudget`, or any
  existing table.
- **Only additive registrations** outside the new module: register `VoiceLoggingModule` in the app
  module's imports, and (if routing budget through the gateway) add the voice-logging capability
  strings to `COACH_AI_METERED_CAPABILITIES` in `src/ai-credits/ai-credits.constants.ts` (§2.6) —
  additive set entries only, no existing capability edited or reordered.
- **Mobile:** new screens/components for the mic affordance + the iOS recognizer binding; no edit to
  existing logging-screen data paths beyond mounting the mic button.

---

*Owner:* Bradley Gleave
*Spec ID:* CC32 — Voice-First Logging
*Backend:* `growth-project-backend` (`src/voice-logging/`)
*Mobile:* `growth-project-mobile` (Expo / React Native)
*Status:* spec — pending operator sign-off on §6 open decisions
