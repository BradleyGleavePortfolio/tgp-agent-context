# Step 0 — TGP Integrations Inventory + Backlog Gap Analysis

**Author:** Dynasia G
**Date:** 2026-06-02
**Backend HEAD:** `659e0ccc74c47f9c985a26b582987253ec9fdb40`
**Mobile HEAD:** `4b7587e47694d1640b1484d1a2a38d40f307afac`
**Backlog source:** `EXHAUSTIVE_BACKLOG.md` (150+ items, 10 cycles + parked + far-horizon)
**Inventory source:** `_app_integrations_inventory.md` (69 cataloged rows across 17 categories, both repos read in full)

---

## 🚨 Two critical findings that must be addressed before community work ships

### Finding 1 — HK mobile ingest is BROKEN end-to-end
- Mobile clients `healthKitSyncService.ts`, `healthConnectIngestApi.ts`, `samsungHealthSyncService.ts` POST to **`/v1/wearables/samples/ingest`**.
- Backend has only `GET /v1/wearables/samples`. **No POST route exists at that path.**
- The HK arc we just closed (PR #355–362, merged through `659e0ccc`) shipped read + insight surfaces but never wired the ingest controller. Mobile writes will silently 404.
- Owner verification: backend grep confirms zero `@Post('samples/ingest')` decorator across `src/wearables/**`.

### Finding 2 — Eight cloud wearable connectors are dead code in production
- `src/wearables/connectors/{oura,fitbit,garmin,whoop,polar,strava,wahoo,withings}/*` exist with full controllers, webhook handlers, and OAuth code.
- **None of them are imported by `WearablesModule` or `AppModule`.** Registry is empty. OAuth start, webhook POST, and backfill jobs will all 404 in production despite the source being committed.
- This is a pre-existing landmine, not a regression from the HK arc.

**Recommended sequencing:** Patch both before launching community. Cloud wearables are a *retention input* to the community feature (HRV-aware coach prompts, recovery-driven check-ins). A community that promises "biometric-aware coaching loops" while the ingest pipe is dark is a credibility risk.

---

## Part A — What the app CAN integrate with today (live and wired)

Authoritative count: 69 cataloged integration rows across 17 categories. The list below is the **live + working** subset.

### Auth / identity (4 live)
- **Supabase Auth** — email/password, JWT verification via JWKS, Admin SDK for user ops.
- **Sign in with Apple** — `/auth/apple`, JWKS verifier + audience check, hands to Supabase.
- **Google sign-in** — `/auth/google`, mobile OAuth + backend recent-auth verification.
- **Local biometric** — `expo-local-authentication`, `expo-secure-store` (device-local app lock).

### Database / storage (3 live + 2 local)
- **Supabase Postgres** via Prisma (primary DB).
- **Supabase JS Admin** (service-role + Realtime channels — *Realtime is already used for message ping signals in `src/services/realtime.ts`*).
- **Supabase Storage** — signed PDF uploads (`SUPABASE_MEDIA_BUCKET`) + voice attachments (`SUPABASE_VOICE_BUCKET`).
- Mobile-local: `expo-sqlite` offline cache, AsyncStorage persistence.

### Payments (4 live Stripe surfaces)
- **Stripe Billing + Subscriptions + Customer Portal** — REST API, no Stripe npm SDK installed.
- **Stripe Checkout / PaymentSheet** — hosted checkout + mobile PaymentSheet via `@stripe/stripe-react-native`.
- **Stripe Connect Express** — coach onboarding, account/login links, transfers, refunds, disputes.
- **Stripe automatic tax** — flag enabled on Connect Checkout; explicitly disabled for AI credit packs.

### Wearables — on-device read (3 live, ingest BROKEN — see Finding 1)
- Apple HealthKit, Android Health Connect, Samsung Health (via Health Connect).
- Read paths: live. Backend insight/aggregate read: live. **Sample write-back to backend: NOT WIRED.**

### AI / LLM (3 live providers)
- **Perplexity Sonar** (`sonar-pro`) — via `openai` package with `baseURL: https://api.perplexity.ai`. Powers AI Guide, diagnostic roadmap, first-win.
- **Anthropic Claude** (`claude-sonnet-4-6` + `claude-3-5-sonnet-20241022`) — coach brief, weekly insights, churn intervention, AI Gateway.
- **AI Gateway** — capability-gated layer with stub provider default + Anthropic real provider.

### Notifications / email / support (4 live)
- **Expo Push** via `expo-server-sdk` — single push surface; no direct APNs/FCM.
- **Resend email** — primary transactional transport (with `log` fallback for dev).
- **Crisp Chat SDK** — in-app support inbox.

### Analytics / observability (2 vendors + 1 internal)
- **Sentry** (backend `@sentry/node`, mobile `@sentry/react-native`).
- **PostHog** (backend `posthog-node`, mobile `posthog-react-native` — incl. feature flags).
- Internal Prometheus-style `/metrics` endpoint.

### Media (1 live)
- **Mux Video** — direct uploads, asset processing, signed playback URLs, webhooks at `/v1/webhooks/mux` and `/v1/webhooks/coach-media/mux`.

### Nutrition / exercise (2 live)
- **USDA FoodData Central** — `https://api.nal.usda.gov/fdc/v1`, key-gated.
- **ExerciseDB via RapidAPI** — `exercisedb.p.rapidapi.com`, with internal seed fallback.

### CRM outbound (5 live adapters, per-coach config)
- HubSpot, GoHighLevel, Mailchimp, ActiveCampaign, generic signed webhook (Zapier/n8n-compatible).
- All store config encrypted per-coach. SSRF guards on generic webhook.

### Infrastructure (4 live)
- **Fly.io** hosting (backend), with deploy/secrets/logs GitHub workflows.
- **Expo EAS** (mobile build/submit/OTA).
- **Redis / Upstash** — rate limiting + cache (`ioredis`, throttler-storage-redis).
- **Local KMS** — encrypted CRM configs and tokens (AWS KMS reserved, not wired).

### Webhooks received (3 live + 1 feature-gated + 1 stub)
- Stripe `/v1/webhooks/stripe`, Mux `/v1/webhooks/mux` + `/v1/webhooks/coach-media/mux`, Google Calendar `/webhooks/google-calendar` (feature-gated), scheduling stubs.

---

## Part B — Code present but NOT live (dead/stub/deferred)

| Status | Items |
|---|---|
| **Dead code (no module import)** | Oura, Fitbit, Garmin, WHOOP, Polar, Strava, Wahoo, Withings cloud connectors |
| **Stub/placeholder** | Google Calendar scheduling adapter, Google Meet adapter, Zoom adapter + webhook |
| **Reserved env, no SDK** | S3 export bucket, AWS KMS, SendGrid, Postmark, OpenAI direct API |
| **Explicitly deferred** | Peloton, Eight Sleep, Beddit, MyFitnessPal (deferral docs on tgp-agent-context) |

---

## Part C — Not present in code anywhere (gap categories)

- **No SMS provider** (no Twilio, no MessageBird, no AWS SNS).
- **No direct APNs/FCM** — push is Expo-only. *(This may matter for community: Expo push delivery can lag, and "coach replied" is a latency-sensitive notification class.)*
- **No maps/location** (no Mapbox/Google Maps SDK).
- **No Calendly, Daily.co, agora.io, LiveKit, Twilio Video** — live calling/video meetings have no real backend.
- **No Nutritionix / OpenFoodFacts / wger / exrx** — alternatives to USDA + ExerciseDB.
- **No Cloudflare Stream** — Mux is the only video CDN.
- **No LaunchDarkly / Statsig** — feature flags are env-based + PostHog only.
- **No BullMQ / external queue** — landing-page CRM processor is in-process cron.

---

## Part D — Gap analysis vs the 150-item backlog (community-relevant subset)

This is **not** "everything missing" — it's the items that intersect with the community expansion plan. The full backlog has 150+ items across 10 cycles; what follows is the social/communication/retention slice.

### Items directly enabling the community feature (UNBUILT)

| ID | Title | Status today | What it requires from integrations |
|---|---|---|---|
| **BL.1** | Private Community Hub | Backlog (Section 7) | Realtime channels (have ✅), Supabase Storage (have ✅), push (have ✅), media via Mux (have ✅) |
| **BL.2** | Community Voice Notes | Backlog | Supabase Storage `SUPABASE_VOICE_BUCKET` is already provisioned (have ✅); needs audio capture + waveform UI |
| **ME13** | Client-Side Social Feed / Accountability Layer (lightweight, NOT Facebook) | Pending | Realtime (have ✅), reactions, photo posts, Mux for video posts (have ✅) |
| **ME18** | In-App Live Session Booking + Video Calls (replaces Calendly + Zoom) | Pending | **MISSING**: real-time video provider. Zoom/Meet adapters are stubs. Daily.co / LiveKit / agora would need integration. |
| **ME20** | Gamification Layer for Clients (streaks, badges, opt-in leaderboards) | Pending | Internal-only; no external integration required |
| **FH.4** | TGP Brain Trust — gated community of top-100 coaches with private Slack + monthly AMAs | Far-horizon | Same as BL.1 + tier-gating logic |
| **FH.7** | Whisper-class transcription for client voice messages → action items | Far-horizon | **MISSING**: speech-to-text provider (no Whisper, Deepgram, AssemblyAI). Anthropic/Perplexity cannot transcribe audio natively in our current adapters. |
| **FH.8** | Coach-side AI inbox triage (categorize, surface urgents, draft replies) | Far-horizon | Have ✅ (Claude + Perplexity already wired for coach AI) |
| **CC27** | AI Clone of PT (Dynasia's ask) | Backlog | Have ✅ (Claude) — needs persona + voice cloning if voice is desired (voice cloning = MISSING integration: ElevenLabs/Play.ht) |

### Items adjacent to community (retention loop, not feed itself)

| ID | Title | Status | Integration needs |
|---|---|---|---|
| ME14 | Photo Meal Logging with AI Macro Estimation | Pending | Have ✅ (Claude vision) |
| ME16 | Progress Photo Transformation Timeline | Pending | Have ✅ (Supabase Storage + Mux) |
| ME24 | Automated Client Win Stories — auto-generated shareable graphics | Pending | Have ✅ (Mux + Storage); image-composition is internal |
| CC26 | Real-Time AI Form Check | Backlog | **MISSING**: real-time video inference; pose detection (no MediaPipe / TensorFlow Lite wired) |
| CC29 / EW6 | Biometric-Adaptive Programming + Wearable Integration | Backlog | **Critical**: depends on Finding 1 + Finding 2 being patched first |
| ME17 | Engagement Scoring + Churn Prediction (mobile surface) | Backend partial (#264) | Have ✅ |

### What the backlog calls out but the integrations layer can't yet support

1. **Live group video / 1:1 video calls** (ME18, BL.1 group calls): Zoom/Meet adapters are stubs. **Decision needed: pick a provider** (Daily.co easiest fit; LiveKit if we want self-hosted; agora for low-latency global; Mux just released live streaming — could co-locate). Recommend Daily.co for fastest path; the company has a SOC2-ready React Native SDK and a simple JWT-token flow.
2. **Voice-to-text transcription** (BL.2 search-by-content, FH.7 action items): no provider wired. Recommend Deepgram (fastest, cheapest at scale) or OpenAI Whisper API (better quality, slightly slower). Anthropic SDK does not support audio input.
3. **Voice/TTS generation** (CC27 AI Clone if voice is in scope): ElevenLabs is the obvious pick; alternative is OpenAI TTS.
4. **Push delivery SLA** (community needs sub-30s "coach replied" pings): Expo Push is fine for normal traffic but has known delivery lag spikes. **Action: add a Sentry breadcrumb on push enqueue → ack so we have a real SLO**.
5. **Search at scale** (Slack #1 complaint): Postgres `ILIKE` will not survive once channels have 10k+ messages. We don't have Algolia, Typesense, Elastic, or Meilisearch. **Decision needed**: Postgres full-text (free, "fine" up to 100k messages per workspace), or Meilisearch (cheap, fast, self-hosted, the right pick for cohort sizes <100k members).

---

## Part E — What's "newly buildable" given current integrations

If we draw a line under what we have today, here's what the community feature can ship WITHOUT any new integration:

✅ Real-time text channels, 1:1 DMs, whole-coach broadcast (Supabase Realtime + Postgres)
✅ Photo + short-video posts and replies (Mux + Supabase Storage already do this for coach media)
✅ Voice notes for messages (`SUPABASE_VOICE_BUCKET` exists; just needs mobile capture + playback)
✅ Push for "@coach", "@me", and configurable digest pings (Expo Push)
✅ Reactions, threads, mentions (pure Postgres)
✅ Coach-side moderation tools (RLS + admin endpoints)
✅ Events / calendar surface with RSVP (Google Calendar exists for the coach side; client side is a Postgres surface — *no external dependency needed for "view & RSVP"; Google sync is bonus*)
✅ Course / classroom integration ("classroom + community" Skool pattern) — coach media + Mux already cover video lessons
✅ AI-summarized "what you missed" digest (Claude + Perplexity already in Coach Brief and weekly insights — same pattern reusable)
✅ Engagement scoring + churn-risk surfacing in community context (ME17 backend partial via PR #264)

❌ Live group video calls without integrating Daily.co / LiveKit / Zoom-real
❌ Voice note transcription / "search inside audio" without Whisper-class provider
❌ Real-time form-check / pose-detection without on-device ML or live video inference
❌ Per-program SMS reminders (no SMS provider)

---

## Part F — Recommended pre-community integration patches (cheap, high leverage)

| Patch | Effort | Why |
|---|---|---|
| Fix `/v1/wearables/samples/ingest` POST route (Finding 1) | 1 PR, ~150 lines | Mobile is silently dropping HK writes |
| Import 8 cloud wearable modules into `WearablesModule` (Finding 2) + smoke-test Oura first | 1 PR + 1 OAuth dev-test | Unblocks CC29 biometric-adaptive coaching, FH.9 recovery score, ME18 "your coach knows you slept badly today" community prompts |
| Add Daily.co adapter for live calls (replaces Zoom/Meet stubs) | 1 connector module + token endpoint | Unblocks ME18 + BL.1 group calls. Daily.co has a free tier good for dev. |
| Add Deepgram (or Whisper) adapter for voice-note transcription | 1 connector + 1 job worker | Unblocks BL.2 voice search + FH.7 voice-to-action-items |
| Add Meilisearch (or wire Postgres full-text first, Meilisearch later) | Postgres tsvector takes 1 PR; Meilisearch takes 1 PR + 1 docker service | Slack's #1 complaint is search. We MUST land this before community grows past pilot. |
| Add SLO instrumentation on Expo Push enqueue→ack | 1 PR | We need to know if push is slow before users start expecting "coach just replied" pings |

---

## Part G — Next steps in this plan

1. ✅ Step 0 (this doc) — DONE.
2. → Step 1: Improve Bradley's community idea (1:1 + channels + whole-coach feed) with the cross-product insights from Slack/Skool research.
3. → Step 2 already complete (research file at `_slack_skool_sentiment_research.md`).
4. → Step 3: Refine with research.
5. → Step 4: Stress-test (abuse vectors, scale failure modes, coach overhead).
6. → Step 5: Premium UI integration plan.
7. → Step 6: Centralized plan + UI/UX management strategy.
8. → Step 7: Planner subagent — assess existing code, produce execution plan.
9. → Step 8: Commit BOTH this doc and the planner output to `tgp-agent-context` so they survive sandbox death.
