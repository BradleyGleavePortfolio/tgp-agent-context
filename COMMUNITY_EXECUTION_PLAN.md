# Community execution plan

## Existing code assessment

### Backend messaging

- Backend direct messaging lives in `src/messaging/client-messaging.controller.ts`, `src/messaging/coach-messaging.controller.ts`, `src/messaging/messaging.dto.ts`, `src/messaging/messaging.module.ts`, and `src/messaging/messaging.service.ts`.
- `src/messaging/client-messaging.controller.ts:24-39` documents the current model as one assigned coach thread per client, with basic text access free and voice upload protected by entitlement.
- `src/messaging/client-messaging.controller.ts:40-43` mounts `@Controller('messages')` for `student` users behind `JwtAuthGuard` and `RolesGuard`.
- `src/messaging/client-messaging.controller.ts:47-52` exposes `GET /messages` for the client's coach thread.
- `src/messaging/client-messaging.controller.ts:55-64` exposes `POST /messages` for client text or voice messages.
- `src/messaging/client-messaging.controller.ts:70-78` exposes `POST /messages/voice-upload` and gates it with `ClientEntitlementGuard`.
- `src/messaging/client-messaging.controller.ts:80-87` exposes read marker and unread count endpoints.
- `src/messaging/coach-messaging.controller.ts:25-30` explains the split coach route design and existing backward-compatible coach API.
- `src/messaging/coach-messaging.controller.ts:31-35` mounts `@Controller('coach')` for coach users behind `JwtAuthGuard` and `RolesGuard`.
- `src/messaging/coach-messaging.controller.ts:38-45` exposes `GET /coach/clients/:client_id/messages`.
- `src/messaging/coach-messaging.controller.ts:51-62` exposes `POST /coach/clients/:client_id/messages`.
- `src/messaging/coach-messaging.controller.ts:68-84` exposes coach voice upload URL creation.
- `src/messaging/coach-messaging.controller.ts:86-97` exposes read marker and unread count endpoints.
- `src/messaging/messaging.dto.ts:26-52` defines `CreateMessageVoiceDto` with URL, duration, size, and MIME validation.
- `src/messaging/messaging.dto.ts:62-74` defines `CreateMessageDto`; message body is optional when voice metadata is supplied and capped at 4000 characters.
- `src/messaging/messaging.dto.ts:95-110` defines signed voice-upload request constraints.
- `src/messaging/messaging.service.ts:142-144` resolves `SUPABASE_VOICE_BUCKET`, falling back to `voice-notes`.
- `src/messaging/messaging.service.ts:149-174` validates voice note size, duration, MIME type, and signed URL shape.
- `src/messaging/messaging.service.ts:188-203` enforces that a message has text, voice metadata, or both.
- `src/messaging/messaging.service.ts:213-240` asserts that submitted voice URLs are inside the configured Supabase bucket.
- `src/messaging/messaging.service.ts:400-499` implements coach sends, client ownership checks, block checks, `CoachMessage` creation, Realtime ping, push notification, audit log, analytics, plan-tracking materializer, and AI context invalidation.
- `src/messaging/messaging.service.ts:501-576` implements client sends, assigned-coach validation, block checks, `CoachMessage` creation, coach Realtime ping, coach push notification, audit log, and AI context invalidation.
- `src/messaging/messaging.service.ts:589-667` creates signed voice upload URLs through Supabase Storage.
- Reusable: authorization, assigned-coach checks, block checks, voice metadata rules, push routing, audit events, analytics hooks, and Realtime invalidation pings.
- Broken for Community: the implementation is hardwired to two-party coach-client `CoachMessage` rows; it does not support cohort channels, Lab posts, events, challenges, or member-to-member DM defaults.
- Landmine: `src/messaging/messaging.service.ts:614-623` uses a forbidden double-cast pattern around Supabase signed upload methods; do not copy that into Community code.
- Landmine: `src/api/messagesApi.ts:137-150` on mobile sends `parent_message_id`, but backend `CreateMessageDto` at `src/messaging/messaging.dto.ts:62-74` does not declare it, so threaded replies can fail under strict validation.

### Mobile messaging

- Client messaging UI lives in `src/screens/client/MessagesScreen.tsx`, with shared bubbles in `src/components/messaging/MessageBubble.tsx`, `src/components/messaging/MessageActionSheet.tsx`, and `src/components/messaging/ReportMessageSheet.tsx`.
- Coach messaging UI lives in `src/screens/coach/MessagesScreen.tsx` and `src/screens/coach/ClientMessagesScreen.tsx`.
- `src/api/messagesApi.ts:9-21` provides moderation helpers for report, block, unblock, and list-blocked flows.
- `src/api/messagesApi.ts:77-90` defines reply input types that include `parent_message_id`.
- `src/api/messagesApi.ts:137-150` posts thread replies to `/messages`.
- Reusable: message composer patterns, report/block sheets, optimistic bubble rendering, unread badge conventions, and push deep-link handling.
- Broken for Community: all current screens assume one direct thread; none model channel membership, cohort feeds, Lab posts, event states, or challenge progress.
- UI constraint: code may continue to use `student`, but every label, empty state, action sheet, toast, push title, and screen copy must say `client` or the user's chosen display name.

### Coach media

- Coach media backend lives in `src/coach-media/coach-media.module.ts`, `src/coach-media/coach-media.service.ts`, and `src/coach-media/supabase-storage.provider.ts`.
- `src/coach-media/coach-media.module.ts:4-10` wires `STORAGE_PROVIDER` to `SupabaseStorageProvider` and provides `CoachMediaService`.
- `src/coach-media/coach-media.module.ts:32-37` registers controllers and Mux webhook providers.
- `src/coach-media/coach-media.service.ts:4-11` describes the PDF Supabase signed upload path and video Mux direct upload path.
- `src/coach-media/coach-media.service.ts:26-31` states media is scoped to coach ownership and never public by default.
- `src/coach-media/coach-media.service.ts:31-42` documents signed URL rules.
- `src/coach-media/coach-media.service.ts:45` says media uses soft deletion rather than hard deletion.
- `src/coach-media/coach-media.service.ts:143-204` creates a signed PDF upload and row record.
- `src/coach-media/coach-media.service.ts:251-315` creates a Mux direct upload and row record for video.
- Reusable: Community classroom posts and event replays should reuse coach-media signed upload, owner checks, media asset rows, and Mux webhook reconciliation.
- Broken for Community: Community voice notes are wired in messaging service, not in the coach-media adapter; do not assume the media adapter covers voice.
- Landmine: `src/coach-media/supabase-storage.provider.ts:82`, `src/coach-media/supabase-storage.provider.ts:132`, `src/coach-media/supabase-storage.provider.ts:176`, and `src/coach-media/supabase-storage.provider.ts:213` use forbidden double-cast patterns around Supabase Storage methods.

### Realtime pattern

- Mobile Realtime lives in `src/services/realtime.ts`.
- `src/services/realtime.ts:1-21` states the architecture: Supabase Realtime Broadcast sends lightweight pings only; REST remains source of truth; polling is the fallback.
- `src/services/realtime.ts:28-43` creates a Supabase client from public env values with persistence disabled and `eventsPerSecond: 5`.
- `src/services/realtime.ts:56-98` subscribes to `messages:{userId}` and listens for `new-message` broadcast pings.
- Backend Realtime lives in `src/supabase/supabase.service.ts`.
- `src/supabase/supabase.service.ts:18-22` creates the service-role Supabase client with a WebSocket transport.
- `src/supabase/supabase.service.ts:43-83` broadcasts `new-message` to `messages:{userId}` with an empty payload and removes the channel after sending.
- Reusable: Community should keep the same ping-only design; mobile should fetch details over REST after a ping.
- Broken for Community: current channel naming is per user only; cohort chat, event state, moderation, and challenge updates need separate channel namespaces.
- Landmine: `src/supabase/supabase.service.ts:21` uses a broad transport cast; avoid repeating that pattern in new Community Realtime code.
- Landmine: `src/services/realtime.ts:78-81`, `src/services/realtime.ts:84-88`, and `src/services/realtime.ts:92-96` suppress failures too quietly; Community handlers should log redacted diagnostics and move to polling.

### Voice bucket

- The integration inventory says `SUPABASE_VOICE_BUCKET` is provisioned and associated with `src/messaging/messaging.service.ts`.
- The storage adapter in `src/coach-media/supabase-storage.provider.ts` is wired for coach media, not for voice notes.
- `src/messaging/messaging.service.ts:142-144` directly chooses the voice bucket.
- `src/messaging/messaging.service.ts:589-667` directly creates voice upload URLs through `supabase.storage.from(bucket)`.
- Reusable: Community voice notes should either factor a typed voice-storage provider out of messaging or add a typed method to the existing Supabase service.
- Broken for Community: if Community calls coach-media for voice, it will miss the existing entitlement, MIME, duration, and bucket checks.

### Notifications

- Backend notification code lives in `src/notifications/README.md`, `src/notifications/notification-category.enum.ts`, `src/notifications/notification-kind.ts`, `src/notifications/notifications.service.ts`, scheduler files, and emitter files.
- `src/notifications/notification-category.enum.ts:12-19` defines `COACH_DIRECT` for direct coach messages and session reminders.
- `src/notifications/notification-kind.ts:18-19` defines `MESSAGE_RECEIVED`.
- `src/notifications/notifications.service.ts:29-35` defines push payload shape including category.
- `src/notifications/notifications.service.ts:42-49` defines notification creation input.
- `src/notifications/notifications.service.ts:90-97` defaults message push on, message email off, and in-app on.
- `src/notifications/notifications.service.ts:128-134` shows booking preference defaults.
- `src/notifications/notifications.service.ts:276-545` contains notification creation, preference checks, rate limiting, coach push, and user push.
- `src/notifications/notifications.service.ts:647-664` builds Expo push payloads.
- Mobile push channels live in `src/notifications/push-channels.ts`.
- `src/notifications/push-channels.ts:6-10` documents the channel/category split.
- `src/notifications/push-channels.ts:26-40` defines the channel IDs.
- `src/notifications/push-channels.ts:52-65` registers push channels.
- `src/notifications/push-channels.ts:69-80` makes coach messages high importance on Android.
- `src/notifications/push-channels.ts:121-141` registers the iOS `COACH_DIRECT` category actions.
- Reusable: Community notification categories should extend the existing preference and channel system instead of bypassing it.
- Broken for Community: current categories do not distinguish cohort mentions, Lab posts, events, challenge reminders, coach ack nudges, or moderation alerts.
- Landmine: notification defaults must avoid Slack-style noise; default cohort chatter push should be off or digest-only unless the user opts in.

### Prisma messaging

- Prisma schema lives in `prisma/schema.prisma`.
- `prisma/schema.prisma:184-186` stores `expo_push_token` on `User`.
- `prisma/schema.prisma:202-204` connects `User` to sent and received `CoachMessage` rows.
- `prisma/schema.prisma:207-210` connects `User` to reports and blocks.
- `prisma/schema.prisma:215-216` connects `User` to `CommunityWin`.
- `prisma/schema.prisma:613-636` defines legacy `Message` with sender, recipient, content, attachment, read state, and direct-message indexes.
- `prisma/schema.prisma:1107-1153` defines `CoachMessage` with coach/client participant fields, optional voice metadata, read state, AI draft linkage, and coach/client time indexes.
- `prisma/schema.prisma:1155-1190` defines `MessageReport` tied to `CoachMessage`.
- `prisma/schema.prisma:1192-1209` defines `UserBlock`.
- `prisma/schema.prisma:1211-1232` defines `CoachNudge`.
- `prisma/schema.prisma:1235-1256` defines `CommunityWin`, an existing lightweight wins feed.
- `prisma/schema.prisma:891-966` defines `NotificationPreferences` including message-related preferences.
- Reusable: `MessageReport`, `UserBlock`, `NotificationPreferences`, and `CoachMessage` field choices inform Community modeling.
- Broken for Community: `Message`, `CoachMessage`, and `CommunityWin` are not a coherent Community domain; avoid bolting channels onto them.
- Landmine: legacy `Message` and `CoachMessage` overlap semantically; a migration must keep them separate and introduce new `Community*` tables.

### Community references

- Mobile imports `CommunityScreen` in `src/navigation/ClientNavigator.tsx:56` and `PrivateCommunityHubScreen` in `src/navigation/ClientNavigator.tsx:73`.
- `src/navigation/ClientNavigator.tsx:139` wraps Community in `ProtectedCommunityScreen`.
- `src/navigation/ClientNavigator.tsx:192` registers `Community` in `MoreStackParamList`.
- `src/navigation/ClientNavigator.tsx:218` registers `PrivateCommunityHub`.
- `src/navigation/ClientNavigator.tsx:427` mounts the current Community route.
- `src/navigation/ClientNavigator.tsx:453-454` gates the private hub route with `featureFlags.privateCommunityHub`.
- `src/screens/client/MoreScreen.tsx:58-60` links to the Community screen.
- `src/config/featureFlags.ts:52` defines `privateCommunityHub` from `EXPO_PUBLIC_FF_PRIVATE_COMMUNITY_HUB`.
- `src/config/featureFlags.ts:56` defines `communityVoiceNotes` from `EXPO_PUBLIC_FF_COMMUNITY_VOICE_NOTES` defaulting false.
- `src/screens/client/CommunityScreen.tsx` renders the existing `CommunityWin` feed.
- `src/screens/client/PrivateCommunityHubScreen.tsx:78-88` renders a flag-off preview state.
- `src/screens/client/PrivateCommunityHubScreen.tsx:124` titles the screen `Community`.
- `src/components/community/CommunityWinCard.tsx` is the current feed-card component.
- `src/hooks/useApi.ts:120-139` exposes `ApiCommunityWin` and `useCommunityFeed`.
- `src/db/communityDb.ts` and `src/db/database.ts:15`, `src/db/database.ts:181`, `src/db/database.ts:187` keep older local community tables and seeding comments.
- `src/services/wave11Adapters.ts` includes a stubbed private hub adapter that returns empty hub data.
- Reusable: navigation guard, card styling, old Community tab entry, and local feed cache concepts.
- Broken for Community: the private hub adapter is stubbed; the current Community feed is wins-only and does not match The Lab, cohorts, messages, events, or challenges.
- Landmine: old preview wording and stub comments must be replaced with real loaded, empty, error, and locked states before enabling flags.

### Scheduling primitives

- Scheduling code lives under `src/scheduling/**`.
- `prisma/schema.prisma:2673-2695` defines `SessionStatus` states for booking lifecycle.
- `prisma/schema.prisma:2704-2705` defines `VideoProvider` values including `stub`, `google_meet`, and `zoom`.
- `prisma/schema.prisma:2711-2713` defines `CalendarProvider` values including `stub` and `google_calendar`.
- `prisma/schema.prisma:2727-2750` defines `SessionType`.
- `prisma/schema.prisma:2755-2780` defines `CoachAvailability`.
- `prisma/schema.prisma:2781-2821` defines `CoachAvailabilityOverride`.
- `prisma/schema.prisma:2825-2878` defines `CoachingSession` with coach/client, status, start/end, video fields, calendar fields, idempotency, lifecycle timestamps, and indexes.
- `prisma/schema.prisma:2881-2895` defines `SessionParticipant`.
- `prisma/schema.prisma:2897-2942` defines `CalendarConnection` and Google watch fields.
- Reusable: event start/end, lifecycle timestamps, provider placeholders, calendar connection fields, idempotency keys, and participant modeling.
- Broken for Community: scheduling is built around one-to-one sessions; live calls are not yet a real group video system.
- Landmine: Mux supports video/replay assets, but group live-call infrastructure is not present; Community events must support external links or Mux replay before native live rooms.

### Coach brief

- Coach brief code lives in `src/coach/brief/**`.
- `src/coach/brief/coach-brief.service.ts` contains the existing aggregation and generation pattern for coach summaries.
- `src/coach/brief/coach-brief.scheduler.ts` schedules brief generation and push dispatch.
- `src/coach/brief/coach-brief.controller.ts` provides the coach-facing retrieval and preference API.
- `src/coach/brief/coach-brief.types.ts` centralizes brief payload types.
- Reusable: AI inbox triage should reuse the brief pattern of bounded aggregation, cached output, human review, and no autonomous send.
- Reusable: coach AI materializers already invalidate context on messaging writes through `src/messaging/messaging.service.ts:495-497` and `src/messaging/messaging.service.ts:575-576`.
- Broken for Community: current brief aggregation does not include cohort unread bursts, coach ack SLA, moderation risk, events, or challenge progress.
- Landmine: `src/coach/brief/coach-brief.scheduler.ts:132` and `src/coach/brief/coach-brief.scheduler.ts:166` use a forbidden scheduler cast; do not copy that test seam.

## Landmines

- Critical carry-forward 1: mobile HealthKit, Health Connect, and Samsung Health paths post to `/v1/wearables/samples/ingest`, but backend `src/wearables/samples/wearable-samples.controller.ts:49-56` only mounts `GET /v1/wearables/samples`.
- Critical carry-forward 2: eight cloud wearable connector folders exist under `src/wearables/connectors/*`, but `src/wearables/wearables.module.ts:70-77` imports only foundation modules and does not import the connectors.
- New landmine: `src/wearables/connectors/garmin/garmin.module.ts:28` and `src/wearables/connectors/whoop/whoop.module.ts:26` import `WearablesModule`; importing those modules back into `WearablesModule` creates a module cycle unless wrapped or refactored.
- New landmine: `src/wearables/connectors/oura/index.ts`, `polar/index.ts`, `wahoo/index.ts`, and `withings/index.ts` define a local `WEARABLE_CONNECTORS` symbol, while `src/wearables/connector-registry.ts:61` discovers the string token; importing those modules may still not register them.
- New landmine: `src/wearables/connectors/garmin/garmin.module.ts` and `src/wearables/connectors/whoop/whoop.module.ts` provide connectors but do not bind a connector definition to the registry token, so OAuth discovery can remain empty for those providers.
- New landmine: `src/wearables/connectors/strava/strava.module.ts:35-38` provides connector services but does not show a registry token contribution.
- New landmine: `src/api/messagesApi.ts:137-150` posts `parent_message_id`, but backend `src/messaging/messaging.dto.ts:62-74` does not accept that field.
- New landmine: `src/supabase/supabase.service.ts:21` and storage files listed above use forbidden broad or double-cast patterns that should not be copied.
- New landmine: mobile Realtime failure handling at `src/services/realtime.ts:78-96` is too quiet for Community launch diagnostics.
- Known naming landmine: backend roles and schema use `student`, but Bradley wants UI-visible copy to say `client`.
- Known test landmine: backend Jest CLI filter is `--testPathPatterns` plural; mobile Jest CLI filter is `--testPathPattern` singular.
- Known test landmine: backend `jest.config.js:4` has `roots: ['<rootDir>/test']`, so specs added under `src/` are not discovered.
- Known R0 landmine: current repos contain legacy forbidden cast, ignore, and swallowed-rejection patterns; every Community PR must fail review if it adds more.
- Known R0 landmine: current mobile tests and comments include banned placeholder launch wording; do not add assertions, comments, or docblocks with that wording.
- Build order rule: land the two wearables preflight patches before enabling wearable-aware Community prompts.
- Build order rule: land Community schema and RLS before any REST, Realtime, or mobile UI flags are enabled.

## PR plan

### PR P0-0A

- Title: `wearables: restore on-device ingest route`.
- Branch: `fix/wearables-samples-ingest-route`.
- Scope: backend only, about 180 LOC.
- Files: `src/wearables/samples/wearable-samples.controller.ts`, `src/wearables/samples/dto/ingest-samples.dto.ts`, `test/wearables/samples-ingest.e2e-spec.ts`.
- Dependencies: none.
- Tests: e2e authenticated client can POST normalized samples; e2e coach cannot post for a foreign client; unit validates empty batch, bad date, bad enum, and batch cap.
- Rollout: `FEATURE_WEARABLES_INGEST_POST`, default false in production until mobile smoke passes; kill switch returns a typed disabled error.
- Audit: no placeholder launch wording; no forbidden casts; no ignored TypeScript errors; no swallowed rejection; non-spinner loading and error states in mobile smoke.

### PR P0-0B

- Title: `wearables: register cloud connectors`.
- Branch: `fix/wearables-cloud-connector-wiring`.
- Scope: backend only, about 140 LOC.
- Files: `src/wearables/wearables.module.ts`, connector module files that need token alignment, `test/wearables/connector-registry.spec.ts`.
- Dependencies: none, but merge after P0-0A if release queue needs one wearables patch at a time.
- Tests: registry lists Fitbit, Garmin, Oura, Polar, Strava, Wahoo, WHOOP, and Withings; each OAuth connector returns metadata; webhook controllers are mounted.
- Rollout: `FEATURE_WEARABLES_CLOUD_CONNECTORS`, default false; kill switch hides cloud connect buttons and rejects connect attempts.
- Audit: no module cycle; one canonical registry token; no broad casts; connector docs do not promise inactive providers.

### PR v1-1

- Title: `community: v1-1 schema workspace cohorts`.
- Branch: `feature/community-v1-schema`.
- Scope: backend Prisma and migrations, about 900 LOC including SQL policies.
- Files: `prisma/schema.prisma`, `prisma/migrations/*community*/migration.sql`, `test/community/rls/community-rls.spec.ts`, `test/community/schema/community-schema.spec.ts`.
- Dependencies: P0-0A, P0-0B only if wearable prompts are tested in the same environment.
- Tests: Prisma generate; migration up/down in disposable DB; RLS denial for foreign workspace; RLS allow for coach-owned workspace; message partition insert/read.
- Rollout: `FEATURE_COMMUNITY_SCHEMA`, default true after migration in staging, no user-facing switch.
- Kill switch: do not expose controllers until `FEATURE_COMMUNITY_API` is true.
- Audit: every new table has RLS policy, cross-tenant test, created/updated timestamps, and index comments.

### PR v1-2

- Title: `community: v1-2 backend module foundation`.
- Branch: `feature/community-v1-api-foundation`.
- Scope: backend Nest module, DTOs, guards, repositories, about 1300 LOC.
- Files: `src/community/community.module.ts`, `src/community/community.controller.ts`, `src/community/community.service.ts`, `src/community/community.repository.ts`, `src/community/dto/**`, `src/app.module.ts`, `test/community/community-foundation.e2e-spec.ts`.
- Dependencies: v1-1.
- Tests: membership bootstrap, workspace fetch, cohort list, today envelope, foreign cohort denial, role guard for `student` and coach.
- Rollout: `FEATURE_COMMUNITY_API`, default false in production; allowlist Bradley test coach account first.
- Kill switch: all `/community/**` and `/coach/community/**` routes return typed disabled responses.
- Audit: all workspace and cohort IDs derived or checked server-side; no UI-visible `student` string in response copy.

### PR v1-3

- Title: `community: v1-3 posts messages reactions`.
- Branch: `feature/community-v1-feed-messages`.
- Scope: backend posts, messages, DMs, reactions, moderation, about 1800 LOC.
- Files: `src/community/messages/**`, `src/community/posts/**`, `src/community/reactions/**`, `src/community/moderation/**`, `test/community/messages.e2e-spec.ts`, `test/community/posts.e2e-spec.ts`.
- Dependencies: v1-2.
- Tests: cohort message create/read; DM disabled by default; Lab post create by coach; client comment permission; reaction idempotency; report creates moderation action.
- Rollout: `FEATURE_COMMUNITY_MESSAGES`, `FEATURE_COMMUNITY_POSTS`, `FEATURE_COMMUNITY_DM`, default false.
- Kill switch: messages and posts become read-only with a clear disabled error; moderation remains enabled.
- Audit: rate limits on writes, body length validation, no row payloads broadcast, no member-to-member DM unless workspace flag permits it.

### PR v1-4

- Title: `community: v1-4 realtime push telemetry`.
- Branch: `feature/community-v1-realtime-push`.
- Scope: backend and mobile infra, about 1100 LOC.
- Files: `src/community/realtime/**`, `src/community/notifications/**`, `src/notifications/notification-category.enum.ts`, `src/notifications/notification-kind.ts`, `src/notifications/notifications.service.ts`, mobile `src/services/realtime.ts`, `src/notifications/push-channels.ts`, telemetry helpers.
- Dependencies: v1-3.
- Tests: broadcast ping contract; no PII in broadcast payloads; push preference default; digest route; PostHog event names.
- Rollout: `FEATURE_COMMUNITY_REALTIME`, `FEATURE_COMMUNITY_PUSH`, `FEATURE_COMMUNITY_TELEMETRY`, default false except telemetry in staging.
- Kill switch: disable Realtime and push while REST polling continues.
- Audit: no message body in broadcast or push payload where lock-screen privacy is enabled.

### PR v1-5

- Title: `community: v1-5 mobile client tab`.
- Branch: `feature/community-v1-mobile-client`.
- Scope: mobile client screens and API hooks, about 2200 LOC.
- Files: `src/screens/community/CommunityTabScreen.tsx`, `CommunityTodayScreen.tsx`, `CommunitySpaceScreen.tsx`, `CommunityThreadScreen.tsx`, `CommunityDmListScreen.tsx`, `CommunityDmThreadScreen.tsx`, `CommunityComposerScreen.tsx`, `src/components/community/**`, `src/api/communityApi.ts`, `src/navigation/ClientNavigator.tsx`, `src/config/featureFlags.ts`.
- Dependencies: v1-4.
- Tests: screen render tests, API contract tests, feature flag off route absence, empty states with actions, unread badge updates.
- Rollout: `EXPO_PUBLIC_FF_COMMUNITY_TAB`, `EXPO_PUBLIC_FF_COMMUNITY_HALL`, `EXPO_PUBLIC_FF_COMMUNITY_COHORTS`, `EXPO_PUBLIC_FF_COMMUNITY_DM`, default false.
- Kill switch: remove Community tab and deep-link route; old wins feed remains available only if explicitly routed.
- Audit: UI says `client`, no spinner-only empty states, no placeholder launch text, accessible touch targets.

### PR v1-6

- Title: `community: v1-6 coach admin inbox`.
- Branch: `feature/community-v1-coach-admin`.
- Scope: backend coach endpoints and mobile coach screens, about 1900 LOC.
- Files: `src/community/coach/**`, `src/screens/community/CoachCommunityHomeScreen.tsx`, `CoachCommunityInboxScreen.tsx`, `CoachCommunityLabScreen.tsx`, `CoachCommunityCohortsScreen.tsx`, `CoachCommunityCohortDetailScreen.tsx`, `CoachCommunityModerationScreen.tsx`, `src/components/community/coach/**`.
- Dependencies: v1-5.
- Tests: coach can create cohort; coach can invite/assign clients; coach inbox aggregates unanswered items; moderator actions hide content.
- Rollout: `FEATURE_COMMUNITY_COACH_ADMIN`, `EXPO_PUBLIC_FF_COACH_COMMUNITY`, default false.
- Kill switch: client UI remains read-only; coach admin routes hidden.
- Audit: destructive moderation actions require confirmation; no foreign coach access; audit log row for every moderation action.

### PR v2-1

- Title: `community: v2-1 plan context tags`.
- Branch: `feature/community-v2-plan-tags`.
- Scope: backend plan-context tagging plus mobile UI chips, about 1000 LOC.
- Files: `src/community/plan-context/**`, `src/community/messages/**`, `src/components/community/PlanTagChip.tsx`, `src/screens/community/CommunityThreadScreen.tsx`.
- Dependencies: v1-6.
- Tests: tag message to workout, meal, habit, and check-in; permission denial for foreign plan item; filter by plan tag.
- Rollout: `FEATURE_COMMUNITY_PLAN_TAGS`, default false.
- Kill switch: tags hidden; messages still readable.
- Audit: no plan IDs trusted from clients without ownership verification.

### PR v2-2

- Title: `community: v2-2 coach ack signals`.
- Branch: `feature/community-v2-ack-signals`.
- Scope: backend ack/read SLA and mobile status UI, about 850 LOC.
- Files: `src/community/ack/**`, `src/community/messages/**`, `src/components/community/CoachAckBadge.tsx`, `src/screens/community/CoachCommunityInboxScreen.tsx`.
- Dependencies: v2-1.
- Tests: seen, acked, replied transitions; SLA timer; badge state ordering; telemetry emission.
- Rollout: `FEATURE_COMMUNITY_ACKS`, default false.
- Kill switch: hide badges; keep underlying timestamps for analytics.
- Audit: badges never imply medical or emergency support.

### PR v2-3

- Title: `community: v2-3 event objects`.
- Branch: `feature/community-v2-events`.
- Scope: backend event lifecycle, RSVP, mobile event screens, about 1600 LOC.
- Files: `src/community/events/**`, `src/screens/community/CommunityEventDetailScreen.tsx`, `src/screens/community/CoachCommunityEventsScreen.tsx`, `src/components/community/EventCard.tsx`, scheduling integration tests.
- Dependencies: v2-2.
- Tests: five-state machine; tomorrow transition job; live transition; replay attach; reflected transition; RSVP permissions.
- Rollout: `FEATURE_COMMUNITY_EVENTS`, `EXPO_PUBLIC_FF_COMMUNITY_EVENTS`, default false.
- Kill switch: events render as read-only cards; event write endpoints disabled.
- Audit: external video links validated; no native live-room promise until provider chosen.

### PR v2-4

- Title: `community: v2-4 AI inbox triage`.
- Branch: `feature/community-v2-ai-triage`.
- Scope: backend AI aggregation and coach review UI, about 1400 LOC.
- Files: `src/community/ai-triage/**`, `src/coach/brief/**` shared helpers, `src/screens/community/CoachCommunityInboxScreen.tsx`, `src/components/community/coach/AiTriageCard.tsx`.
- Dependencies: v2-3.
- Tests: triage summary generation, no autonomous send, source IDs attached, cache invalidated on new message, disabled-state fallback.
- Rollout: `FEATURE_COMMUNITY_AI_TRIAGE`, default false.
- Kill switch: hide AI cards; human inbox stays available.
- Audit: AI output never posts without coach confirmation; prompt excludes unrelated tenant data.

### PR v3-1

- Title: `community: v3-1 challenges`.
- Branch: `feature/community-v3-challenges`.
- Scope: backend challenge models and mobile challenge UI, about 1600 LOC.
- Files: `src/community/challenges/**`, `src/screens/community/CommunityChallengeDetailScreen.tsx`, `src/components/community/ChallengeCard.tsx`, `src/components/community/ChallengeProgressSheet.tsx`.
- Dependencies: v2-4.
- Tests: join, progress, completion, leaderboard opt-in, cohort-only visibility, moderation on challenge comments.
- Rollout: `FEATURE_COMMUNITY_CHALLENGES`, `EXPO_PUBLIC_FF_COMMUNITY_CHALLENGES`, default false.
- Kill switch: challenge tab hidden; active challenge progress remains readable.
- Audit: gamification cannot shame clients; defaults are participation-focused, not public failure-focused.

### PR v3-2

- Title: `community: v3-2 classroom posts`.
- Branch: `feature/community-v3-classroom-posts`.
- Scope: media-backed posts, pinned lessons, release locks, about 1500 LOC.
- Files: `src/community/classroom/**`, `src/coach-media/**` typed reuse, `src/screens/community/CommunityClassroomScreen.tsx`, `src/components/community/LessonCard.tsx`.
- Dependencies: v3-1.
- Tests: signed upload, media access by membership, release time lock, pinned ordering, replay card access.
- Rollout: `FEATURE_COMMUNITY_CLASSROOM_POSTS`, default false.
- Kill switch: hide classroom section; media URLs expire normally.
- Audit: media asset access must check coach workspace and cohort membership.

### PR v3-3

- Title: `community: v3-3 voice notes`.
- Branch: `feature/community-v3-voice-notes`.
- Scope: voice upload provider extraction and mobile composer, about 1200 LOC.
- Files: `src/community/voice/**`, `src/messaging/messaging.service.ts` typed extraction, `src/screens/community/CommunityComposerScreen.tsx`, `src/components/community/VoiceNoteComposer.tsx`.
- Dependencies: v3-2.
- Tests: signed upload URL; bucket assertion; duration/size/MIME limits; entitlement gate if required; Realtime ping after send.
- Rollout: `FEATURE_COMMUNITY_VOICE_NOTES`, `EXPO_PUBLIC_FF_COMMUNITY_VOICE_NOTES`, default false.
- Kill switch: hide microphone affordance; text send remains available.
- Audit: no copied forbidden double-cast from messaging; audio privacy copy says who can listen.

### PR v3-4

- Title: `community: v3-4 search prompts`.
- Branch: `feature/community-v3-search-wearables`.
- Scope: search indexing, wearable-aware prompts, coach suggestions, about 1800 LOC.
- Files: `src/community/search/**`, `src/community/wearable-prompts/**`, `src/screens/community/CommunityFindScreen.tsx`, `src/components/community/WearablePromptCard.tsx`.
- Dependencies: v3-3, P0-0A, P0-0B.
- Tests: search only returns membership-visible rows; wearable prompt generated only for opted-in clients; prompt source sample IDs recorded; disabled connector fallback.
- Rollout: `FEATURE_COMMUNITY_SEARCH`, `FEATURE_COMMUNITY_WEARABLE_PROMPTS`, default false.
- Kill switch: hide search bar and wearable prompts; Community remains functional.
- Audit: no health data leaks in cohort posts; client consent and coach ownership checked before prompt generation.

## Schema design

### Schema principles

- Code role name stays `student`; UI copy maps it to `client`.
- Every table uses `workspace_id` to make tenant filtering explicit.
- Every new table gets RLS in the same migration that creates it.
- Server writes derive `workspace_id`, `coach_id`, and membership status; clients do not provide trusted tenant scope.
- All user-generated text has length validation, soft-delete state, and moderation hooks.
- `CommunityMessage` is range-partitioned monthly by `created_at` from the first migration.
- Reactions use a polymorphic target plus composite message target columns to avoid brittle cross-partition FKs.
- Events use the five states `scheduled`, `tomorrow`, `live`, `replay`, and `reflected`.
- Challenge participation is separate from challenge definition.
- Event RSVP is separate from event definition because attendance and reminders are per member.

### Prisma models

```prisma
enum CommunityCohortStatus {
  draft
  active
  archived
}

enum CommunityMembershipRole {
  coach
  assistant
  student
}

enum CommunityMembershipStatus {
  invited
  active
  muted
  removed
}

enum CommunityMessageScope {
  cohort
  dm
}

enum CommunityMessageKind {
  text
  voice
  system
}

enum CommunityPostScope {
  hall
  cohort
}

enum CommunityPostType {
  text
  lesson
  replay
  poll
  win
}

enum CommunityReactionTargetType {
  message
  post
  comment
  event
  challenge
}

enum CommunityEventState {
  scheduled
  tomorrow
  live
  replay
  reflected
}

enum CommunityEventRsvpStatus {
  going
  maybe
  declined
  attended
  missed
}

enum CommunityChallengeStatus {
  draft
  active
  completed
  archived
}

enum CommunityModerationTargetType {
  message
  post
  reaction
  event
  challenge
  member
}

enum CommunityModerationStatus {
  open
  reviewed
  actioned
  dismissed
}

model CommunityWorkspace {
  id                    String              @id @default(uuid()) @db.Uuid
  coach_id              String              @db.Uuid
  name                  String              @db.VarChar(120)
  slug                  String              @unique @db.VarChar(80)
  description           String?             @db.Text
  dm_enabled_default    Boolean             @default(false)
  hall_enabled          Boolean             @default(true)
  events_enabled        Boolean             @default(false)
  challenges_enabled    Boolean             @default(false)
  max_cohort_members    Int?                @db.Integer
  created_at            DateTime            @default(now()) @db.Timestamptz(6)
  updated_at            DateTime            @updatedAt @db.Timestamptz(6)
  archived_at           DateTime?           @db.Timestamptz(6)

  coach                 User                @relation(fields: [coach_id], references: [id], onDelete: Cascade)
  cohorts               CommunityCohort[]
  memberships           CommunityMembership[]
  posts                 CommunityPost[]
  events                CommunityEvent[]
  challenges            CommunityChallenge[]
  moderation_actions    CommunityModerationAction[]

  @@index([coach_id, archived_at])
  @@index([created_at])
  @@map("community_workspaces")
}

model CommunityCohort {
  id                    String              @id @default(uuid()) @db.Uuid
  workspace_id          String              @db.Uuid
  name                  String              @db.VarChar(120)
  description           String?             @db.Text
  status                CommunityCohortStatus @default(active)
  starts_at             DateTime?           @db.Timestamptz(6)
  ends_at               DateTime?           @db.Timestamptz(6)
  capacity              Int?                @db.Integer
  sort_order            Int                 @default(0)
  created_at            DateTime            @default(now()) @db.Timestamptz(6)
  updated_at            DateTime            @updatedAt @db.Timestamptz(6)
  archived_at           DateTime?           @db.Timestamptz(6)

  workspace             CommunityWorkspace  @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  memberships           CommunityMembership[]
  posts                 CommunityPost[]
  events                CommunityEvent[]
  challenges            CommunityChallenge[]

  @@unique([workspace_id, name])
  @@index([workspace_id, status, sort_order])
  @@index([workspace_id, archived_at])
  @@map("community_cohorts")
}

model CommunityMembership {
  id                    String              @id @default(uuid()) @db.Uuid
  workspace_id          String              @db.Uuid
  cohort_id             String              @db.Uuid
  user_id               String              @db.Uuid
  role                  CommunityMembershipRole @default(student)
  status                CommunityMembershipStatus @default(active)
  dm_enabled            Boolean?            
  notify_level          String              @default("digest") @db.VarChar(32)
  joined_at             DateTime?           @db.Timestamptz(6)
  last_read_message_at  DateTime?           @db.Timestamptz(6)
  created_at            DateTime            @default(now()) @db.Timestamptz(6)
  updated_at            DateTime            @updatedAt @db.Timestamptz(6)
  removed_at            DateTime?           @db.Timestamptz(6)

  workspace             CommunityWorkspace  @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  cohort                CommunityCohort     @relation(fields: [cohort_id], references: [id], onDelete: Cascade)
  user                  User                @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([cohort_id, user_id])
  @@index([workspace_id, user_id, status])
  @@index([user_id, status])
  @@index([cohort_id, status, role])
  @@map("community_memberships")
}

model CommunityMessage {
  id                    String              @default(uuid()) @db.Uuid
  created_at            DateTime            @default(now()) @db.Timestamptz(6)
  workspace_id          String              @db.Uuid
  cohort_id             String?             @db.Uuid
  scope                 CommunityMessageScope
  dm_key                String?             @db.VarChar(160)
  recipient_user_id     String?             @db.Uuid
  sender_id             String              @db.Uuid
  kind                  CommunityMessageKind @default(text)
  body                  String?             @db.VarChar(4000)
  voice_url             String?             @db.Text
  voice_duration_ms     Int?                @db.Integer
  voice_mime_type       String?             @db.VarChar(80)
  voice_size_bytes      Int?                @db.Integer
  plan_context_type     String?             @db.VarChar(40)
  plan_context_id       String?             @db.Uuid
  plan_week_start       DateTime?           @db.Date
  parent_message_id     String?             @db.Uuid
  parent_message_at     DateTime?           @db.Timestamptz(6)
  coach_seen_at         DateTime?           @db.Timestamptz(6)
  coach_acked_at        DateTime?           @db.Timestamptz(6)
  coach_replied_at      DateTime?           @db.Timestamptz(6)
  visibility            String              @default("active") @db.VarChar(24)
  deleted_at            DateTime?           @db.Timestamptz(6)
  updated_at            DateTime            @updatedAt @db.Timestamptz(6)

  sender                User                @relation("community_message_sender", fields: [sender_id], references: [id], onDelete: Restrict)
  recipient             User?               @relation("community_message_recipient", fields: [recipient_user_id], references: [id], onDelete: Restrict)

  @@id([id, created_at])
  @@index([workspace_id, created_at])
  @@index([cohort_id, created_at])
  @@index([dm_key, created_at])
  @@index([recipient_user_id, created_at])
  @@index([sender_id, created_at])
  @@index([workspace_id, plan_context_type, plan_context_id])
  @@index([workspace_id, visibility, created_at])
  @@map("community_messages")
}

model CommunityPost {
  id                    String              @id @default(uuid()) @db.Uuid
  workspace_id          String              @db.Uuid
  cohort_id             String?             @db.Uuid
  author_id             String              @db.Uuid
  scope                 CommunityPostScope
  type                  CommunityPostType   @default(text)
  title                 String?             @db.VarChar(160)
  body                  String?             @db.Text
  media_asset_id        String?             @db.Uuid
  event_id              String?             @db.Uuid
  pinned_at             DateTime?           @db.Timestamptz(6)
  release_at            DateTime?           @db.Timestamptz(6)
  expires_at            DateTime?           @db.Timestamptz(6)
  visibility            String              @default("active") @db.VarChar(24)
  created_at            DateTime            @default(now()) @db.Timestamptz(6)
  updated_at            DateTime            @updatedAt @db.Timestamptz(6)
  deleted_at            DateTime?           @db.Timestamptz(6)

  workspace             CommunityWorkspace  @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  cohort                CommunityCohort?    @relation(fields: [cohort_id], references: [id], onDelete: Cascade)
  author                User                @relation(fields: [author_id], references: [id], onDelete: Restrict)

  @@index([workspace_id, scope, pinned_at, created_at])
  @@index([cohort_id, created_at])
  @@index([workspace_id, release_at])
  @@index([workspace_id, visibility, created_at])
  @@map("community_posts")
}

model CommunityReaction {
  id                    String              @id @default(uuid()) @db.Uuid
  workspace_id          String              @db.Uuid
  target_type           CommunityReactionTargetType
  target_id             String              @db.Uuid
  target_created_at     DateTime?           @db.Timestamptz(6)
  user_id               String              @db.Uuid
  reaction              String              @db.VarChar(32)
  created_at            DateTime            @default(now()) @db.Timestamptz(6)

  workspace             CommunityWorkspace  @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  user                  User                @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([target_type, target_id, user_id, reaction])
  @@index([workspace_id, target_type, target_id])
  @@index([user_id, created_at])
  @@map("community_reactions")
}

model CommunityEvent {
  id                    String              @id @default(uuid()) @db.Uuid
  workspace_id          String              @db.Uuid
  cohort_id             String?             @db.Uuid
  created_by_id         String              @db.Uuid
  title                 String              @db.VarChar(160)
  description           String?             @db.Text
  state                 CommunityEventState @default(scheduled)
  starts_at             DateTime            @db.Timestamptz(6)
  ends_at               DateTime?           @db.Timestamptz(6)
  live_url              String?             @db.Text
  replay_media_asset_id String?             @db.Uuid
  reflected_at          DateTime?           @db.Timestamptz(6)
  created_at            DateTime            @default(now()) @db.Timestamptz(6)
  updated_at            DateTime            @updatedAt @db.Timestamptz(6)
  canceled_at           DateTime?           @db.Timestamptz(6)

  workspace             CommunityWorkspace  @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  cohort                CommunityCohort?    @relation(fields: [cohort_id], references: [id], onDelete: Cascade)
  created_by            User                @relation(fields: [created_by_id], references: [id], onDelete: Restrict)
  rsvps                 CommunityEventRsvp[]

  @@index([workspace_id, state, starts_at])
  @@index([cohort_id, starts_at])
  @@index([starts_at])
  @@map("community_events")
}

model CommunityEventRsvp {
  id                    String              @id @default(uuid()) @db.Uuid
  workspace_id          String              @db.Uuid
  event_id              String              @db.Uuid
  user_id               String              @db.Uuid
  status                CommunityEventRsvpStatus
  reminded_at           DateTime?           @db.Timestamptz(6)
  created_at            DateTime            @default(now()) @db.Timestamptz(6)
  updated_at            DateTime            @updatedAt @db.Timestamptz(6)

  event                 CommunityEvent      @relation(fields: [event_id], references: [id], onDelete: Cascade)
  user                  User                @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([event_id, user_id])
  @@index([workspace_id, user_id, status])
  @@index([workspace_id, status, reminded_at])
  @@map("community_event_rsvps")
}

model CommunityChallenge {
  id                    String              @id @default(uuid()) @db.Uuid
  workspace_id          String              @db.Uuid
  cohort_id             String?             @db.Uuid
  created_by_id         String              @db.Uuid
  title                 String              @db.VarChar(160)
  description           String?             @db.Text
  status                CommunityChallengeStatus @default(draft)
  starts_at             DateTime?           @db.Timestamptz(6)
  ends_at               DateTime?           @db.Timestamptz(6)
  metric_key            String?             @db.VarChar(80)
  target_value          Decimal?            @db.Decimal(12, 2)
  unit                  String?             @db.VarChar(40)
  leaderboard_enabled   Boolean             @default(false)
  created_at            DateTime            @default(now()) @db.Timestamptz(6)
  updated_at            DateTime            @updatedAt @db.Timestamptz(6)
  archived_at           DateTime?           @db.Timestamptz(6)

  workspace             CommunityWorkspace  @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  cohort                CommunityCohort?    @relation(fields: [cohort_id], references: [id], onDelete: Cascade)
  created_by            User                @relation(fields: [created_by_id], references: [id], onDelete: Restrict)
  participants          CommunityChallengeParticipation[]

  @@index([workspace_id, status, starts_at])
  @@index([cohort_id, status])
  @@map("community_challenges")
}

model CommunityChallengeParticipation {
  id                    String              @id @default(uuid()) @db.Uuid
  workspace_id          String              @db.Uuid
  challenge_id          String              @db.Uuid
  user_id               String              @db.Uuid
  progress_value        Decimal             @default(0) @db.Decimal(12, 2)
  completed_at          DateTime?           @db.Timestamptz(6)
  last_logged_at        DateTime?           @db.Timestamptz(6)
  created_at            DateTime            @default(now()) @db.Timestamptz(6)
  updated_at            DateTime            @updatedAt @db.Timestamptz(6)

  challenge             CommunityChallenge  @relation(fields: [challenge_id], references: [id], onDelete: Cascade)
  user                  User                @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([challenge_id, user_id])
  @@index([workspace_id, user_id])
  @@index([challenge_id, progress_value])
  @@map("community_challenge_participations")
}

model CommunityModerationAction {
  id                    String              @id @default(uuid()) @db.Uuid
  workspace_id          String              @db.Uuid
  target_type           CommunityModerationTargetType
  target_id             String              @db.Uuid
  reported_by_id        String?             @db.Uuid
  actor_id              String?             @db.Uuid
  status                CommunityModerationStatus @default(open)
  reason                String              @db.VarChar(80)
  notes                 String?             @db.Text
  action                String?             @db.VarChar(80)
  created_at            DateTime            @default(now()) @db.Timestamptz(6)
  resolved_at           DateTime?           @db.Timestamptz(6)

  workspace             CommunityWorkspace  @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  reported_by           User?               @relation("community_reporter", fields: [reported_by_id], references: [id], onDelete: SetNull)
  actor                 User?               @relation("community_moderator", fields: [actor_id], references: [id], onDelete: SetNull)

  @@index([workspace_id, status, created_at])
  @@index([target_type, target_id])
  @@index([reported_by_id, created_at])
  @@map("community_moderation_actions")
}
```

### Partition SQL

```sql
CREATE TABLE community_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  workspace_id uuid NOT NULL REFERENCES community_workspaces(id) ON DELETE CASCADE,
  cohort_id uuid NULL REFERENCES community_cohorts(id) ON DELETE CASCADE,
  scope text NOT NULL,
  dm_key varchar(160) NULL,
  recipient_user_id uuid NULL REFERENCES users(id) ON DELETE RESTRICT,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  kind text NOT NULL DEFAULT 'text',
  body varchar(4000) NULL,
  voice_url text NULL,
  voice_duration_ms integer NULL,
  voice_mime_type varchar(80) NULL,
  voice_size_bytes integer NULL,
  plan_context_type varchar(40) NULL,
  plan_context_id uuid NULL,
  plan_week_start date NULL,
  parent_message_id uuid NULL,
  parent_message_at timestamptz NULL,
  coach_seen_at timestamptz NULL,
  coach_acked_at timestamptz NULL,
  coach_replied_at timestamptz NULL,
  visibility varchar(24) NOT NULL DEFAULT 'active',
  deleted_at timestamptz NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at),
  CHECK ((scope = 'cohort' AND cohort_id IS NOT NULL AND dm_key IS NULL) OR (scope = 'dm' AND cohort_id IS NULL AND dm_key IS NOT NULL))
) PARTITION BY RANGE (created_at);

CREATE TABLE community_messages_2026_06 PARTITION OF community_messages
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE community_messages_2026_07 PARTITION OF community_messages
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE community_messages_default PARTITION OF community_messages DEFAULT;

CREATE INDEX community_messages_workspace_created_idx ON community_messages (workspace_id, created_at DESC);
CREATE INDEX community_messages_cohort_created_idx ON community_messages (cohort_id, created_at DESC);
CREATE INDEX community_messages_dm_created_idx ON community_messages (dm_key, created_at DESC);
CREATE INDEX community_messages_recipient_created_idx ON community_messages (recipient_user_id, created_at DESC);
CREATE INDEX community_messages_sender_created_idx ON community_messages (sender_id, created_at DESC);
CREATE INDEX community_messages_plan_idx ON community_messages (workspace_id, plan_context_type, plan_context_id);
```

### RLS plan

- Enable RLS on all 11 logical tables in the initial migration.
- `community_workspaces`: coaches select and update their own workspace; active members select the workspace through membership; inserts are service-only or coach-owned bootstrap.
- `community_cohorts`: coaches manage cohorts in their workspace; active members select cohorts where they have membership; archived cohorts remain visible only to coaches unless content history is required.
- `community_memberships`: coaches manage memberships in their workspace; students select their own active memberships; students cannot update role or status.
- `community_messages`: coaches select all workspace messages; students select cohort messages only for active memberships and DM messages only where sender or recipient matches; inserts require active membership or permitted DM pair.
- `community_posts`: coaches manage Lab and cohort posts; students select released Lab posts for their workspace and released cohort posts for active cohorts; students create only allowed comments or client posts if enabled.
- `community_reactions`: users can select reactions for visible targets; users can insert or delete their own reaction only when target is visible.
- `community_events`: coaches manage workspace events; students select events for active cohorts or Lab scope; RSVP does not grant event visibility.
- `community_event_rsvps`: users manage their own RSVP; coaches select all RSVP rows in their workspace.
- `community_challenges`: coaches manage; students select active challenges in their cohorts; archived challenge read depends on membership history.
- `community_challenge_participations`: users manage their own progress; coaches select workspace progress; leaderboard queries only expose opted-in rows.
- `community_moderation_actions`: reporters can create reports and select their own report status; coaches select and resolve workspace actions; students never see moderator notes.
- Partition note: parent-table RLS policies must be validated against every child partition in tests; monthly partition creation job must apply indexes and verify inherited policies.

## API surface

- `GET /community/me` — `CommunityController`, `JwtAuthGuard`, roles `student` or coach; returns workspace, membership, flags, and unread counts for the signed-in user.
- `GET /community/today` — `CommunityController`, `JwtAuthGuard`, roles `student` or coach; returns Today objects across cohorts, events, challenges, and pinned posts.
- `GET /community/workspaces/:workspaceId` — `CommunityController`, `JwtAuthGuard`; returns a workspace summary if membership or coach ownership is valid.
- `GET /community/cohorts` — `CommunityCohortsController`, `JwtAuthGuard`; lists visible cohorts for the signed-in user.
- `GET /community/cohorts/:cohortId` — `CommunityCohortsController`, `JwtAuthGuard`; returns cohort detail, membership state, and unread counts.
- `GET /community/cohorts/:cohortId/messages` — `CommunityMessagesController`, `JwtAuthGuard`; paginates cohort messages.
- `POST /community/cohorts/:cohortId/messages` — `CommunityMessagesController`, `JwtAuthGuard`; creates a cohort message.
- `POST /community/cohorts/:cohortId/messages/:messageId/read` — `CommunityMessagesController`, `JwtAuthGuard`; advances read marker.
- `POST /community/cohorts/:cohortId/messages/:messageId/ack` — `CommunityMessagesController`, `JwtAuthGuard`, coach role; records coach ack.
- `GET /community/dms` — `CommunityDmController`, `JwtAuthGuard`; lists permitted DM threads.
- `GET /community/dms/:threadKey/messages` — `CommunityDmController`, `JwtAuthGuard`; paginates a permitted DM thread.
- `POST /community/dms/:threadKey/messages` — `CommunityDmController`, `JwtAuthGuard`; creates a DM if workspace and membership allow it.
- `GET /community/posts` — `CommunityPostsController`, `JwtAuthGuard`; paginates Lab or cohort posts.
- `POST /community/posts` — `CommunityPostsController`, `JwtAuthGuard`, coach role by default; creates Lab or cohort post.
- `GET /community/posts/:postId` — `CommunityPostsController`, `JwtAuthGuard`; returns visible post detail.
- `PATCH /community/posts/:postId` — `CommunityPostsController`, `JwtAuthGuard`, coach role; updates post metadata or content.
- `DELETE /community/posts/:postId` — `CommunityPostsController`, `JwtAuthGuard`, coach role; soft-deletes a post.
- `POST /community/posts/:postId/comments` — `CommunityPostsController`, `JwtAuthGuard`; creates a post comment backed by message-like moderation rules.
- `POST /community/reactions` — `CommunityReactionsController`, `JwtAuthGuard`; adds or replaces a reaction.
- `DELETE /community/reactions/:reactionId` — `CommunityReactionsController`, `JwtAuthGuard`; removes the caller's reaction.
- `GET /community/events` — `CommunityEventsController`, `JwtAuthGuard`; lists visible events.
- `POST /community/events` — `CommunityEventsController`, `JwtAuthGuard`, coach role; creates an event.
- `PATCH /community/events/:eventId` — `CommunityEventsController`, `JwtAuthGuard`, coach role; updates event fields or state.
- `POST /community/events/:eventId/rsvp` — `CommunityEventsController`, `JwtAuthGuard`; creates or updates RSVP.
- `POST /community/events/:eventId/replay` — `CommunityEventsController`, `JwtAuthGuard`, coach role; attaches replay media and moves event to replay.
- `POST /community/events/:eventId/reflect` — `CommunityEventsController`, `JwtAuthGuard`, coach role; marks event reflected.
- `GET /community/challenges` — `CommunityChallengesController`, `JwtAuthGuard`; lists visible challenges.
- `POST /community/challenges` — `CommunityChallengesController`, `JwtAuthGuard`, coach role; creates a challenge.
- `PATCH /community/challenges/:challengeId` — `CommunityChallengesController`, `JwtAuthGuard`, coach role; updates challenge lifecycle or copy.
- `POST /community/challenges/:challengeId/join` — `CommunityChallengesController`, `JwtAuthGuard`; joins an active challenge.
- `PATCH /community/challenges/:challengeId/progress` — `CommunityChallengesController`, `JwtAuthGuard`; updates caller progress.
- `GET /community/search` — `CommunitySearchController`, `JwtAuthGuard`; searches visible posts, messages, events, and challenges.
- `POST /community/reports` — `CommunityModerationController`, `JwtAuthGuard`; creates a moderation action for visible content.
- `GET /coach/community/inbox` — `CoachCommunityController`, `JwtAuthGuard`, coach role; returns coach queue of unread, unacked, and AI-triaged items.
- `GET /coach/community/moderation` — `CoachCommunityController`, `JwtAuthGuard`, coach role; lists moderation actions.
- `POST /coach/community/moderation/:actionId/resolve` — `CoachCommunityController`, `JwtAuthGuard`, coach role; resolves a moderation action.
- `POST /coach/community/onboarding` — `CoachCommunityController`, `JwtAuthGuard`, coach role; creates workspace, cohorts, and default settings.
- `GET /coach/community/member-health` — `CoachCommunityController`, `JwtAuthGuard`, coach role; returns cohort engagement and risk signals.

## Realtime design

- Keep current rule: Realtime broadcasts invalidation pings only; REST remains the source of truth.
- Never broadcast message body, health data, event notes, moderation notes, or user profile data.
- Use channel `community:user:{userId}` for personal counters, DM pings, membership changes, and cross-screen invalidations.
- Use channel `community:cohort:{cohortId}:messages:{shard}` for active cohort message pings.
- Use channel `community:workspace:{workspaceId}:hall` for Lab post pings and pinned-post changes.
- Use channel `community:event:{eventId}` for event state transitions, replay attached, and reflection complete.
- Use channel `community:challenge:{challengeId}` for challenge state and aggregate progress pings.
- Use channel `community:moderation:{workspaceId}` for coach-only moderation queue pings.
- Broadcast event `community.message.created` with `entityId`, `scope`, `cohortId`, `version`, and `occurredAt`.
- Broadcast event `community.message.updated` for soft delete, ack, read marker side effects, and moderation changes.
- Broadcast event `community.post.created` for Lab and cohort posts.
- Broadcast event `community.post.updated` for pin, release, edit, delete, and replay attachment.
- Broadcast event `community.reaction.changed` for count invalidation.
- Broadcast event `community.event.state_changed` for scheduled, tomorrow, live, replay, and reflected transitions.
- Broadcast event `community.challenge.progress_changed` for aggregate progress invalidation.
- Broadcast event `community.moderation.action_created` for coach queues.
- Broadcast event `community.membership.changed` for added, removed, muted, or notification-level changes.
- Mobile subscribes to personal channel at app start when authenticated.
- Mobile subscribes to one cohort channel only when the cohort screen is focused.
- Mobile subscribes to Lab channel only when the Community tab or Lab screen is focused.
- Mobile subscribes to event or challenge channels only on detail screens.
- Mobile unsubscribes on blur and falls back to polling if subscription fails.
- Shard cohort channels by `hash(userId) % shardCount` for high-volume cohorts.
- Start with `shardCount = 1`; bump to 4 when a cohort exceeds 250 active members or 20 messages per minute.
- Keep a max of 25 active Realtime channels per device; beyond that, use personal channel plus polling.
- Server batches reaction count pings with a 1-second debounce to avoid notification storms.
- Push notifications are separate from Realtime; inactive users receive push or digest according to preferences.

## Mobile screen tree

- `src/screens/community/CommunityTabScreen.tsx` — top-level client Community tab with Today, The Lab, cohorts, DMs, events, and challenges modules.
- `src/screens/community/CommunityTodayScreen.tsx` — focused Today object list for workouts, events, challenges, unread coach items, and pinned posts.
- `src/screens/community/CommunitySpaceScreen.tsx` — Lab or cohort feed surface.
- `src/screens/community/CommunityThreadScreen.tsx` — cohort message thread.
- `src/screens/community/CommunityDmListScreen.tsx` — permitted DM list and request state.
- `src/screens/community/CommunityDmThreadScreen.tsx` — DM message thread.
- `src/screens/community/CommunityFindScreen.tsx` — search and filters across visible Community content.
- `src/screens/community/CommunityEventDetailScreen.tsx` — event detail, RSVP, live state, replay, and reflection.
- `src/screens/community/CommunityChallengeDetailScreen.tsx` — challenge progress, participation, and cohort activity.
- `src/screens/community/CommunityComposerScreen.tsx` — shared message/post composer route.
- `src/screens/community/CommunityClassroomScreen.tsx` — pinned lessons, media, and replay collection.
- `src/screens/community/CoachCommunityHomeScreen.tsx` — coach Community dashboard.
- `src/screens/community/CoachCommunityInboxScreen.tsx` — coach triage queue for unread, unacked, and AI-suggested responses.
- `src/screens/community/CoachCommunityLabScreen.tsx` — The Lab post management.
- `src/screens/community/CoachCommunityCohortsScreen.tsx` — cohort list and creation.
- `src/screens/community/CoachCommunityCohortDetailScreen.tsx` — cohort membership, settings, and feed controls.
- `src/screens/community/CoachCommunityEventsScreen.tsx` — event management and lifecycle.
- `src/screens/community/CoachCommunityModerationScreen.tsx` — reports and moderation action queue.
- `src/components/community/CommunityCard.tsx` — shared elevated card container.
- `src/components/community/CommunityFeedList.tsx` — paginated feed list with skeleton, empty, and error states.
- `src/components/community/CommunityPostCard.tsx` — Lab and cohort post card.
- `src/components/community/CommunityMessageBubble.tsx` — cohort and DM bubble, adapted from current messaging bubble.
- `src/components/community/CommunityComposer.tsx` — text composer, attachment affordances, plan tags.
- `src/components/community/CommunityReactionBar.tsx` — reaction counts and add/remove action.
- `src/components/community/PlanTagChip.tsx` — workout, meal, habit, and check-in context chip.
- `src/components/community/CoachAckBadge.tsx` — seen, acked, replied state.
- `src/components/community/EventCard.tsx` — five-state event summary card.
- `src/components/community/ChallengeCard.tsx` — challenge summary and progress card.
- `src/components/community/VoiceNoteComposer.tsx` — voice capture and upload UI behind flag.
- `src/components/community/WearablePromptCard.tsx` — coach-reviewed wearable-aware prompt.
- `src/components/community/coach/AiTriageCard.tsx` — AI triage suggestion with approve/edit/dismiss.
- `src/components/community/coach/ModerationActionCard.tsx` — moderation queue item.
- Navigation: move Community out of `src/screens/client/CommunityScreen.tsx` into the new tree while keeping compatibility route aliases during rollout.
- API: add `src/api/communityApi.ts` with typed methods for all endpoints and no direct fetches from screens.
- State: add `src/hooks/community/useCommunityHome.ts`, `useCommunityMessages.ts`, `useCommunityPosts.ts`, `useCommunityEvents.ts`, and `useCommunityChallenges.ts`.
- Copy: every screen uses `client` in UI strings, even where payload fields are named `student`.

## Feature flags

- `FEATURE_COMMUNITY_SCHEMA` — backend env, default true after migration, not user-facing.
- `FEATURE_COMMUNITY_API` — backend env, default false.
- `FEATURE_COMMUNITY_MESSAGES` — backend env, default false.
- `FEATURE_COMMUNITY_POSTS` — backend env, default false.
- `FEATURE_COMMUNITY_DM` — backend env, default false; default workspace setting also false.
- `FEATURE_COMMUNITY_REALTIME` — backend env, default false.
- `FEATURE_COMMUNITY_PUSH` — backend env, default false.
- `FEATURE_COMMUNITY_TELEMETRY` — backend env, default true in staging and false in production until QA.
- `FEATURE_COMMUNITY_COACH_ADMIN` — backend env, default false.
- `FEATURE_COMMUNITY_PLAN_TAGS` — backend env, default false.
- `FEATURE_COMMUNITY_ACKS` — backend env, default false.
- `FEATURE_COMMUNITY_EVENTS` — backend env, default false.
- `FEATURE_COMMUNITY_AI_TRIAGE` — backend env, default false.
- `FEATURE_COMMUNITY_CHALLENGES` — backend env, default false.
- `FEATURE_COMMUNITY_CLASSROOM_POSTS` — backend env, default false.
- `FEATURE_COMMUNITY_VOICE_NOTES` — backend env, default false.
- `FEATURE_COMMUNITY_SEARCH` — backend env, default false.
- `FEATURE_COMMUNITY_WEARABLE_PROMPTS` — backend env, default false.
- `FEATURE_WEARABLES_INGEST_POST` — backend env, default false until preflight is verified.
- `FEATURE_WEARABLES_CLOUD_CONNECTORS` — backend env, default false until connector registry tests pass.
- `EXPO_PUBLIC_FF_COMMUNITY_TAB` — mobile env, default false.
- `EXPO_PUBLIC_FF_COMMUNITY_HALL` — mobile env, default false.
- `EXPO_PUBLIC_FF_COMMUNITY_COHORTS` — mobile env, default false.
- `EXPO_PUBLIC_FF_COMMUNITY_DM` — mobile env, default false.
- `EXPO_PUBLIC_FF_COACH_COMMUNITY` — mobile env, default false.
- `EXPO_PUBLIC_FF_COMMUNITY_EVENTS` — mobile env, default false.
- `EXPO_PUBLIC_FF_COMMUNITY_CHALLENGES` — mobile env, default false.
- `EXPO_PUBLIC_FF_COMMUNITY_CLASSROOM` — mobile env, default false.
- `EXPO_PUBLIC_FF_COMMUNITY_VOICE_NOTES` — mobile env, already exists and remains default false.
- `EXPO_PUBLIC_FF_COMMUNITY_SEARCH` — mobile env, default false.
- `EXPO_PUBLIC_FF_COMMUNITY_WEARABLE_PROMPTS` — mobile env, default false.
- `EXPO_PUBLIC_FF_PRIVATE_COMMUNITY_HUB` — legacy mobile flag; keep read-only until replaced, then remove after migration.
- PostHog remote flag `community_tab` mirrors mobile env for targeted beta.
- PostHog remote flag `community_coach_admin` targets Bradley and internal coaches first.
- PostHog remote flag `community_realtime` enables cohort pings per workspace after load testing.
- Kill switch rule: backend env flags win over PostHog flags.
- Kill switch rule: disabled features must render actionable locked, empty, or error states, not indefinite spinners.

## Telemetry

- `community.tab.opened` — Community tab opened.
- `community.today.viewed` — Today module viewed.
- `community.workspace.viewed` — workspace viewed.
- `community.cohort.viewed` — cohort viewed.
- `community.dm.opened` — DM thread opened.
- `community.message.sent` — message created.
- `community.message.failed` — message create failed.
- `community.message.read` — read marker advanced.
- `community.message.tagged` — plan context tag attached.
- `community.coach.seen` — coach saw a client message.
- `community.coach.acked` — coach acknowledged a client message.
- `community.coach.replied` — coach replied after client message.
- `community.post.created` — post created.
- `community.post.viewed` — post viewed.
- `community.post.pinned` — post pinned.
- `community.reaction.added` — reaction added.
- `community.reaction.removed` — reaction removed.
- `community.event.created` — event created.
- `community.event.rsvp` — RSVP changed.
- `community.event.attended` — attendance recorded.
- `community.event.replayed` — replay viewed.
- `community.event.reflected` — event marked reflected.
- `community.challenge.created` — challenge created.
- `community.challenge.joined` — challenge joined.
- `community.challenge.progress_logged` — progress logged.
- `community.challenge.completed` — challenge completed.
- `community.search.executed` — search submitted.
- `community.dm.escalated` — DM or report escalated to coach.
- `community.moderation.report` — report submitted.
- `community.moderation.action` — moderation action resolved.
- `community.churn_signal.fired` — risk or churn signal emitted.
- `community.notification.sent` — push or digest generated.
- `community.notification.opened` — notification opened.
- `community.voice.upload_started` — signed voice upload requested.
- `community.voice.sent` — voice message sent.
- `community.ai_triage.generated` — AI triage card generated.
- `community.ai_triage.applied` — coach used AI triage output.
- `community.wearable_prompt.generated` — wearable prompt generated.
- `community.wearable_prompt.sent` — coach sent wearable-aware prompt.
- Required properties: `workspace_id`, `cohort_id` when present, `role`, `surface`, `feature_flag_state`, and `request_id`.
- Prohibited properties: raw message body, health metric values, voice URLs, moderation notes, token values, and email addresses.

## Risk register

- 1. Cross-tenant data leak. Severity high, likelihood medium. Mitigation: RLS on every table, server-side workspace derivation, integration tests for foreign workspace denial, no Realtime row payloads.
- 2. Notification overload. Severity high, likelihood high. Mitigation: digest defaults for cohort chatter, opt-in mentions, quiet hours, per-cohort mute, rate caps, and sentiment-informed copy.
- 3. Coach burnout. Severity high, likelihood high. Mitigation: ack states, AI triage, inbox prioritization, batch actions, and default DM off.
- 4. Wearable prompt privacy leak. Severity high, likelihood medium. Mitigation: require client consent, coach ownership, sample-source IDs, no metric values in cohort posts, and PR dependency on wearables preflight.
- 5. Realtime cost spike. Severity medium, likelihood high. Mitigation: ping-only payloads, focused subscriptions, sharded cohort channels, polling fallback, and load thresholds.
- 6. Schema partition complexity. Severity medium, likelihood medium. Mitigation: raw SQL migration, monthly partition job, default partition, partition tests, and observability on insert failures.
- 7. DM abuse or spam. Severity high, likelihood medium. Mitigation: member-to-member DM default off, report/block flows, rate limits, coach visibility controls, and moderation queue.
- 8. Mobile scope creep. Severity medium, likelihood high. Mitigation: replace old Community screens gradually, strict v1/v2/v3 flags, API hooks before screens, and a screen inventory freeze per PR.
- 9. AI trust failure. Severity high, likelihood medium. Mitigation: AI never sends autonomously, source-backed cards, prompt isolation, coach confirmation, and clear audit logs.
- 10. Live events expectation gap. Severity medium, likelihood medium. Mitigation: v1 events support external links and replay state; native group video is a separate decision after provider selection.

## Bradley questions

- Should member-to-member DMs be off for all workspaces by default, coach-approved per cohort, or available only after a coach invites both members?
- Which pricing tier includes Community: all paid clients, a higher coaching tier, or coach-configurable add-on?
- Are live calls in v1 just event cards with external links, or must TGP own the live video room experience?
- Is voice transcription required in v1, v2, or not until there is a clear coaching workflow?
- Should any Community surface be publicly discoverable, or is everything private to coach workspaces and invited clients?
- What are the first launch cohort caps for member count, message volume, and event attendance?

## Preflight patches

### Ingest route diff

```diff
diff --git a/src/wearables/samples/dto/ingest-samples.dto.ts b/src/wearables/samples/dto/ingest-samples.dto.ts
new file mode 100644
--- /dev/null
+++ b/src/wearables/samples/dto/ingest-samples.dto.ts
@@
+import { z } from 'zod';
+import {
+  WearableMetricBucket,
+  WearableMetricType,
+  WearableProvider,
+} from '@prisma/client';
+
+export const IngestSampleSchema = z.object({
+  connectionId: z.string().uuid(),
+  provider: z.nativeEnum(WearableProvider),
+  metric: z.nativeEnum(WearableMetricType),
+  bucket: z.nativeEnum(WearableMetricBucket),
+  value: z.number().finite(),
+  unit: z.string().min(1).max(40),
+  startAt: z.coerce.date(),
+  endAt: z.coerce.date(),
+  sourceTz: z.string().max(80).nullable().optional(),
+  sourceRecordId: z.string().max(180).nullable().optional(),
+  rawRef: z.string().max(500).nullable().optional(),
+}).strict().refine((sample) => sample.startAt <= sample.endAt, {
+  message: 'startAt must be before or equal to endAt',
+  path: ['endAt'],
+});
+
+export const IngestSamplesBodySchema = z.array(IngestSampleSchema).min(1).max(2000);
+
+export type IngestSamplesBody = z.infer<typeof IngestSamplesBodySchema>;
```

```diff
diff --git a/src/wearables/samples/wearable-samples.controller.ts b/src/wearables/samples/wearable-samples.controller.ts
--- a/src/wearables/samples/wearable-samples.controller.ts
+++ b/src/wearables/samples/wearable-samples.controller.ts
@@
 import {
   BadRequestException,
+  Body,
   Controller,
   Get,
+  Post,
   Query,
   Request,
   UseGuards,
 } from '@nestjs/common';
@@
 import { WearableSamplesService } from './wearable-samples.service';
 import { GetSamplesQuerySchema } from './dto/get-samples.query';
+import { IngestSamplesBodySchema } from './dto/ingest-samples.dto';
+import { IngestionService } from '../ingestion/ingestion.service';
@@
 export class WearableSamplesController {
-  constructor(private readonly svc: WearableSamplesService) {}
+  constructor(
+    private readonly svc: WearableSamplesService,
+    private readonly ingestion: IngestionService,
+  ) {}
@@
   async getSamples(
@@
     return SamplesResponseSchema.parse(payload);
   }
+
+  @Roles('student')
+  @UseGuards(JwtAuthGuard)
+  @Throttle({ [THROTTLER_NAMES.DEFAULT]: { ttl: 60_000, limit: 20 } })
+  @Post('ingest')
+  @ApiOperation({ summary: 'Ingest normalized on-device wearable samples' })
+  @ApiResponse({ status: 201, description: 'Accepted normalized sample batch.' })
+  async ingestSamples(
+    @Request() req: AuthedRequest,
+    @Body() rawBody: unknown,
+  ): Promise<{ inserted: number; skipped: number }> {
+    const parsed = parseOrThrow(IngestSamplesBodySchema, rawBody);
+    const samples = parsed.map((sample) => ({
+      ...sample,
+      userId: req.user.id,
+      sourceTz: sample.sourceTz ?? null,
+      sourceRecordId: sample.sourceRecordId ?? null,
+      rawRef: sample.rawRef ?? null,
+    }));
+    return this.ingestion.ingest(samples);
+  }
 }
```

- Add e2e test under `test/wearables/samples-ingest.e2e-spec.ts` because backend Jest currently only discovers `test/`.
- Test command: backend uses the plural path-pattern flag.
- Required negative tests: unknown field, empty array, array above cap, foreign `userId` ignored, invalid date order, and unauthenticated request.

### Connector import diff

```diff
diff --git a/src/wearables/wearables.module.ts b/src/wearables/wearables.module.ts
--- a/src/wearables/wearables.module.ts
+++ b/src/wearables/wearables.module.ts
@@
-import { Module } from '@nestjs/common';
+import { Module, forwardRef } from '@nestjs/common';
 import { IngestionService } from './ingestion/ingestion.service';
 import { ProviderHttpClient } from './http/provider-http-client';
 import { ConnectionsModule } from './connections/connections.module';
 import { OauthModule } from './oauth/oauth.module';
 import { InsightsModule } from './insights/insights.module';
 import { SamplesModule } from './samples/samples.module';
 import { PreferencesModule } from './preferences/preferences.module';
 import { MaintenanceModule } from './maintenance/maintenance.module';
+import { FitbitModule } from './connectors/fitbit/fitbit.module';
+import { GarminModule } from './connectors/garmin/garmin.module';
+import { OuraModule } from './connectors/oura/oura.module';
+import { PolarModule } from './connectors/polar/polar.module';
+import { StravaConnectorModule } from './connectors/strava/strava.module';
+import { WahooModule } from './connectors/wahoo/wahoo.module';
+import { WhoopModule } from './connectors/whoop/whoop.module';
+import { WithingsModule } from './connectors/withings/withings.module';
@@
   imports: [
     ConnectionsModule,
     OauthModule,
     InsightsModule,
     SamplesModule,
     PreferencesModule,
     MaintenanceModule,
+    FitbitModule,
+    forwardRef(() => GarminModule),
+    OuraModule,
+    PolarModule,
+    StravaConnectorModule,
+    WahooModule,
+    forwardRef(() => WhoopModule),
+    WithingsModule,
   ],
@@
     PreferencesModule,
     MaintenanceModule,
+    FitbitModule,
+    GarminModule,
+    OuraModule,
+    PolarModule,
+    StravaConnectorModule,
+    WahooModule,
+    WhoopModule,
+    WithingsModule,
   ],
 })
 export class WearablesModule {}
```

```diff
diff --git a/src/wearables/connectors/garmin/garmin.module.ts b/src/wearables/connectors/garmin/garmin.module.ts
--- a/src/wearables/connectors/garmin/garmin.module.ts
+++ b/src/wearables/connectors/garmin/garmin.module.ts
@@
-import { Module } from '@nestjs/common';
+import { Module, forwardRef } from '@nestjs/common';
 import { WearablesModule } from '../../wearables.module';
@@
-  imports: [WearablesModule],
+  imports: [forwardRef(() => WearablesModule)],
```

```diff
diff --git a/src/wearables/connectors/whoop/whoop.module.ts b/src/wearables/connectors/whoop/whoop.module.ts
--- a/src/wearables/connectors/whoop/whoop.module.ts
+++ b/src/wearables/connectors/whoop/whoop.module.ts
@@
-import { Module } from '@nestjs/common';
+import { Module, forwardRef } from '@nestjs/common';
 import { WearablesModule } from '../../wearables.module';
@@
-  imports: [WearablesModule],
+  imports: [forwardRef(() => WearablesModule)],
```

- Also align all connector modules to import `WEARABLE_CONNECTORS` from `src/wearables/connector-registry.ts`, not from local symbol definitions.
- Add registry tests that instantiate Nest with `WearablesModule` and assert eight providers are discoverable.
- Add webhook routing tests for Fitbit, Garmin, Oura, Polar, Strava, Wahoo, WHOOP, and Withings.
- Test command: backend uses the plural path-pattern flag.
