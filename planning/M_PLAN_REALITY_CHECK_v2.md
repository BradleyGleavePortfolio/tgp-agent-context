# M-Plan Reality-Check v2 — M-NEW-LIVE Spine Re-rank

> **Provenance:** Adversarial M-plan reality check (GPT-5.5 angry-adversarial planner, Op 50.5 re-spawn) re-ranking the M-series (M1.α through M11) against the operator-proposed M-NEW-LIVE scout pivot. Cites primary vendor docs and ToS pages inline. Authored by Bradley Gleave per R3 (R3 makes Bradley the operator-of-record on all commits regardless of content origin). Companion source-index file: `planning/M_PLAN_REALITY_CHECK_v2_source_index.md`.

---



## Executive finding

M-NEW-LIVE is not clean as proposed. The right spine is **permissioned export-first reconstruction with a gated live scout substrate**, not a universal mirror adapter. Trainerize is the proof that the old plan is fantasy: its official export surface is only roster/contact data, it says there is no way to transfer data from one Trainerize account to another, and it says workout/program history and stats are not exported; its legal page also prohibits manual or automated monitoring/copying of the service and requires permission for third-party integrations ([Trainerize export help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize), [Trainerize transfer help](https://help.trainerize.com/hc/en-us/articles/26458988419220), [Trainerize legal terms](https://www.trainerize.com/legal.aspx)).

TrueCoach is the best first **export-assisted reconstructor** profile, not a blind cloud-browser scout: it exports client CSVs, workout text files, program PDFs/text paths, and can transfer a coach account to a Team with written permission, but its terms still require express prior written consent for automated retrieval, indexing, reproduction, database building, or mirroring of site content ([TrueCoach client export](http://help.truecoach.co/en/articles/5811721-how-to-export-clients), [TrueCoach workout export](http://help.truecoach.co/en/articles/3047247-exporting-workouts), [TrueCoach program export](http://help.truecoach.co/en/articles/2393507-printing-a-program), [TrueCoach coach transfer](https://help.truecoach.co/en/articles/2393629-transferring-coach-accounts), [TrueCoach terms](https://truecoach.co/terms/)).

CoachRx has the richest official migration surface among researched competitors: it publishes client CSV export, workout export, subscriptions/revenue export, custom client reports, and a bulk import bridge for TrueCoach, Trainerize, Bridge Athletic, Everfit, and other platforms; however, its own help center conflicts on export permissions, because one CSV article says coaches can export their own clients while a role matrix says export client data/report is Super Admin/Owner only ([CoachRx client CSV export](https://intercom.help/coachrx/en/articles/14473855-how-to-export-your-client-list-as-a-csv), [CoachRx data export](https://intercom.help/coachrx/en/articles/14077482-exporting-data-from-coachrx), [CoachRx custom reports](https://intercom.help/coachrx/en/articles/7172943-custom-client-reports), [CoachRx bulk CSV import](https://intercom.help/coachrx/en/articles/14890425-migrating-clients-to-coachrx-with-bulk-csv-import-truecoach-trainerize-bridge), [CoachRx roles matrix](https://intercom.help/coachrx/en/articles/6428167-coach-roles-permissions)).

Assistant Coach cannot be treated as if a full data export bundle exists today, because its current data export page says full data export is “Coming Soon” and lists client CSV, check-ins, meal/workout plans, goals/notes, and body measurements as planned CSV/JSON exports; it does, however, document a rich read-only AI integration surface and OAuth-scoped access for connected AI tools ([Assistant Coach data export](https://help.assistantcoach.fit/data-export/), [Assistant Coach AI overview](https://help.assistantcoach.fit/ai-integration/overview/), [Assistant Coach security](https://help.assistantcoach.fit/trust/security/)).

## M-NEW-LIVE spine analysis

Top-level decision: **MODIFY**.

The proposal’s false premise is that coach-visible data can safely replace vendor export surfaces. Several researched vendors either prohibit automated copying/monitoring, prohibit credential sharing, or do not explicitly permit delegated browser-session access; therefore “the coach can see it” is not enough to green-light a universal browser-side mirror architecture ([Trainerize legal terms](https://www.trainerize.com/legal.aspx), [TrueCoach terms](https://truecoach.co/terms/), [Everfit terms](https://everfit.io/tos/), [MyPTHub terms](https://www.mypthub.net/legal/terms-of-use/)).

The corrected spine is:

1. **M-NEW-SUBSTRATE** — `MigrationSession` + `migration_observations`, RLS Tier-1 by `coach_id + scout_session_id`, audit every write, PII redaction at observation time, raw TTL after commit.
2. **M-NEW-EXPORT-ASSISTED-PROFILES** — per-vendor ingestion from official exports first: TrueCoach CSV/TXT/PDF, CoachRx CSV/TXT/PDF, Everfit PDFs, MyPTHub support-requested reports, Trainerize roster CSV/PDF-only fallbacks.
3. **M-NEW-PERMISSIONED-SCOUT** — browser scout disabled per vendor until ToS/legal sign-off or explicit vendor written consent exists.
4. **M-NEW-COPILOT-FALLBACK** — coach-driven live co-pilot for MFA/CAPTCHA/device-trust or vendors where credential transfer is unsafe.
5. **M1.β Reconstructor + Roman overlay** — universal preview/commit diff, conflict surfacing, Roman-drafted welcomes/check-ins/day-1 plan, and M5.C super-loaded link trigger.

This preserves the M-NEW-LIVE value proposition while removing the legal/technical landmine of treating every vendor UI as a permitted machine-readable source.

## Door A–E verdicts

| Door | Final pick | Justification |
|---|---|---|
| Door A — runtime | **A3 hybrid, but cloud scout default only after vendor permission** | Browserbase can supply managed cloud sessions with included hours, concurrency, session duration, and minute-billed browser time, while E2B can supply per-second sandboxes for custom runs ([Browserbase billing plans](https://docs.browserbase.com/account/billing/plans), [E2B pricing](https://e2b.dev/pricing)). Local/co-pilot fallback is mandatory because official MFA/device-trust details are mostly UNKNOWN and several vendors warn against sharing credentials or account access ([Trainerize account security](https://help.trainerize.com/hc/en-us/articles/360025557932-How-to-Keep-Your-ABC-Trainerize-Account-Secure), [Everfit terms](https://everfit.io/tos/), [MyPTHub terms](https://www.mypthub.net/legal/terms-of-use/)). |
| Door B — credentials | **B2/B3 first; B1 only where OAuth/API or written consent exists** | Assistant Coach explicitly documents OAuth 2.1 connected AI access with separate tokens and read-only scope, making it the clean pattern to copy where available ([Assistant Coach security](https://help.assistantcoach.fit/trust/security/)). Delegated cookies/password-style handoff is legally unsafe for vendors whose terms require password confidentiality or prohibit third-party account access ([Everfit terms](https://everfit.io/tos/), [MyPTHub terms](https://www.mypthub.net/legal/terms-of-use/)). |
| Door C — stream vs batch | **C1 live streaming for parsed observations, batched raw payload commit under breaker limits** | Live progress is the Day-1 Win and supports coach trust, but the write path must be audit-logged, RLS-scoped, and circuit-broken because each migration can generate thousands of events. Raw browser artifacts should be minimized and TTL-governed because vendors expose client PII and health/fitness data in coach-visible pages and connected health surfaces ([OPEX privacy policy](https://www.opexfit.com/privacy-policy), [Assistant Coach privacy](https://help.assistantcoach.fit/trust/privacy/)). |
| Door D — intelligence ceiling | **D3 hybrid; D1 for launch, LLM only for normalization/disambiguation** | Deterministic recipes are required for repeatability and CI when vendors redesign UI; LLM assistance belongs in reconstruction, field disambiguation, conflict explanation, and Roman coach prompts. Pure LLM site operation is too flaky and too hard to defend under vendor ToS restrictions that distinguish permitted interfaces from unsupported automated access ([OPEX terms](https://www.opexfit.com/terms-and-conditions), [TrueCoach terms](https://truecoach.co/terms/)). |
| Door E — legal posture | **E1 with an E3 launch gate; E2 rejected** | Door E1 is not enough unless the default state for each vendor is disabled until ToS review, written permission, or explicit export/API path is documented. Ignoring ToS would be reckless because Trainerize, TrueCoach, and Everfit each restrict automated/manual copying or retrieval of site material in some form ([Trainerize legal terms](https://www.trainerize.com/legal.aspx), [TrueCoach terms](https://truecoach.co/terms/), [Everfit terms](https://everfit.io/tos/)). |

## Smallest viable first scout profile

Default: **TrueCoach Export-Assisted Reconstructor**.

Why: TrueCoach’s official export surface covers enough entities to prove end-to-end reconstruction without leaning on legally risky blind UI traversal: client CSV includes profile/status/compliance/location/timezone/phone/client type/client state/height/weight/unit preference/gender, workouts can be exported to text by date range, programs can be printed to PDF or exported to text by assigning to a client, and coach accounts can be transferred to a Team with written permission ([TrueCoach client export](http://help.truecoach.co/en/articles/5811721-how-to-export-clients), [TrueCoach workout export](http://help.truecoach.co/en/articles/3047247-exporting-workouts), [TrueCoach program export](http://help.truecoach.co/en/articles/2393507-printing-a-program), [TrueCoach coach transfer](https://help.truecoach.co/en/articles/2393629-transferring-coach-accounts)).

Coverage: roster/profile, compliance score, workout history by selected timeframe, program PDFs/text, and written-permission account transfer path. Billing remains out-of-scope unless the coach supplies Stripe/processor data separately, because the researched TrueCoach export docs do not publish a billing/subscription export surface.

Landmines: TrueCoach terms still restrict automated retrieval, indexing, database creation, and mirroring without express prior written consent, so the first profile must be framed as coach-uploaded exports plus optional written-permission co-pilot, not as an unattended live browser scout ([TrueCoach terms](https://truecoach.co/terms/)).

Runner-up: **CoachRx Export-Assisted Profile** because official docs expose client CSV, subscriptions/revenue CSV, workout text export, custom reports, and bulk import bridge behavior, but the roles/permissions conflict must be resolved before making it the first profile ([CoachRx client CSV export](https://intercom.help/coachrx/en/articles/14473855-how-to-export-your-client-list-as-a-csv), [CoachRx data export](https://intercom.help/coachrx/en/articles/14077482-exporting-data-from-coachrx), [CoachRx custom reports](https://intercom.help/coachrx/en/articles/7172943-custom-client-reports), [CoachRx roles matrix](https://intercom.help/coachrx/en/articles/6428167-coach-roles-permissions)).

## Source-data reality matrix

| Vendor | Official export/import surface found | Migration value | Legal posture for delegated/live scout |
|---|---|---|---|
| Trainerize | Basic roster/contact CSV; no history/program/training-progress transfer; workouts/programs can be saved as PDF but not directly transferred ([Trainerize export help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize), [Trainerize transfer help](https://help.trainerize.com/hc/en-us/articles/26458988419220)). | Roster-only fallback; program/history reconstruction requires manual/PDF/co-pilot path. | **PROHIBITED / high risk** for unattended scout because terms restrict manual/automated monitoring/copying and third-party integrations without permission ([Trainerize legal terms](https://www.trainerize.com/legal.aspx)). |
| TrueCoach | Client CSV, workout TXT, program PDF/TXT workaround, written-permission team transfer ([TrueCoach client export](http://help.truecoach.co/en/articles/5811721-how-to-export-clients), [TrueCoach workout export](http://help.truecoach.co/en/articles/3047247-exporting-workouts), [TrueCoach program export](http://help.truecoach.co/en/articles/2393507-printing-a-program), [TrueCoach coach transfer](https://help.truecoach.co/en/articles/2393629-transferring-coach-accounts)). | Best first export-assisted reconstructor. | **PROHIBITED unless express consent** for automated retrieval/mirroring/database creation ([TrueCoach terms](https://truecoach.co/terms/)). |
| CoachRx | Client CSV, workout exports, subscription/revenue CSV, custom reports, bulk import bridge; role docs conflict ([CoachRx client CSV export](https://intercom.help/coachrx/en/articles/14473855-how-to-export-your-client-list-as-a-csv), [CoachRx data export](https://intercom.help/coachrx/en/articles/14077482-exporting-data-from-coachrx), [CoachRx custom reports](https://intercom.help/coachrx/en/articles/7172943-custom-client-reports), [CoachRx bulk CSV import](https://intercom.help/coachrx/en/articles/14890425-migrating-clients-to-coachrx-with-bulk-csv-import-truecoach-trainerize-bridge), [CoachRx roles matrix](https://intercom.help/coachrx/en/articles/6428167-coach-roles-permissions)). | Richest official export surface; strong P1 profile after TrueCoach. | **UNCLEAR**; OPEX terms require use through publicly supported interfaces and prohibit collecting personal information without consent ([OPEX terms](https://www.opexfit.com/terms-and-conditions)). |
| Assistant Coach | Full data export is planned, not shipped; workout plan PDF export exists; AI integration can read rich coach-scoped data through approved connection ([Assistant Coach data export](https://help.assistantcoach.fit/data-export/), [Assistant Coach workout PDF export](https://help.assistantcoach.fit/workout-plans/pdf-export/), [Assistant Coach AI overview](https://help.assistantcoach.fit/ai-integration/overview/)). | Good future OAuth/AI integration pattern; bad current migration-source assumption. | **SILENT/UNCLEAR for delegated browser; PERMITTED for approved OAuth AI connection** because docs describe OAuth 2.1 read-only connected AI access and revocation ([Assistant Coach security](https://help.assistantcoach.fit/trust/security/), [Assistant Coach terms](https://assistantcoach.fit/terms)). |
| Everfit | Workout PDFs and form-response PDFs; client app can also print workouts as PDF ([Everfit workout PDF export](https://help.everfit.io/en/articles/5647484-how-to-export-or-print-workouts-as-pdfs), [Everfit client workout PDF](https://help.everfit.io/en/articles/5660236-client-app-print-workout-as-a-pdf), [Everfit form response PDF](https://help.everfit.io/en/articles/8012101-export-form-responses-as-pdf)). | PDF-assisted reconstruction only unless more docs emerge. | **PROHIBITED / high risk** because terms prohibit automatic access/copying and require credentials to remain confidential ([Everfit terms](https://everfit.io/tos/)). |
| MyPTHub | Nutrition report only by support request; workout print path from client web app; no structured full export found ([MyPTHub nutrition report](https://support.mypthub.net/hc/en-us/articles/22529663855249-Download-Nutrition-Report), [MyPTHub workout print](https://support.mypthub.net/hc/en-us/articles/7580877889425-Client-How-to-print-workout-on-the)). | Support-assisted/PDF fallback only. | **UNCLEAR but credential sharing prohibited** because terms require credentials to remain confidential and forbid disclosure to third parties ([MyPTHub terms](https://www.mypthub.net/legal/terms-of-use/)). |

## Per-slice re-rank

### M1.α — ImportSession substrate + SHA256 idempotency

- Slice verdict: **EXPAND**.
- Priority: **P0**.
- Reality-grounded scope: Replace narrow `ImportSession` with `MigrationSession` covering `export_upload`, `spreadsheet`, `browser_scout`, `copilot`, and `support_assisted` source modes; retain SHA256 idempotency for files and add observation-hash idempotency for live observations.
- M-NEW-LIVE relationship: Elevated; this is the required substrate for every migration path.
- Floor-check: Meets the M5 floor only if it adds coach-visible status, retry/resume/abort, Roman next-step prompts, audit-log events, RLS Tier-1, and PII redaction at observation time.
- Landmines: Raw observations can contain client health data and payment context, so raw TTL, encryption, RLS, and audit-volume circuit breakers are not optional; CoachRx privacy documents show health/fitness data can include steps, workouts, HRV, nutrition, resting heart rate, sleep, body sensor data, and coach communication context ([OPEX privacy policy](https://www.opexfit.com/privacy-policy)).
- Doors: Door A: hybrid runtime metadata; Door B: no stored passwords; Door C: stream parsed observations; Door D: deterministic schema; Door E: vendor-disabled default.

### M1.β — preview/commit + Roman + multi-format

- Slice verdict: **EXPAND**.
- Priority: **P0**.
- Reality-grounded scope: Build universal reconstruction preview/commit that consumes CSV/XLSX/TXT/PDF/JSON/observations, displays source evidence per field, shows conflicts, supports transactional rollback, and triggers Roman-drafted welcomes/check-ins/day-1 plan before M5.C send.
- M-NEW-LIVE relationship: Elevated; this is the trust gate between messy source data and canonical TGP records.
- Floor-check: Must be web + mobile, stateful, Roman-assisted, audit-logged, RLS-scoped, and one-tap to the super-loaded link after commit.
- Landmines: PDF/TXT program reconstruction is lossy; Trainerize documents PDF-only workout/program fallback and no transfer of program history/stats ([Trainerize export help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize), [Trainerize transfer help](https://help.trainerize.com/hc/en-us/articles/26458988419220)).
- Doors: Door A: source-agnostic; Door B: no credential dependency; Door C: live diff; Door D: hybrid LLM reconstruction; Door E: export-first safe path.

### M2 — Trainerize CSV adapter

- Slice verdict: **DEMOTE**.
- Priority: **P4**.
- Reality-grounded scope: Ship only a roster/contact importer and never imply program/history/check-in/billing import from Trainerize CSV.
- M-NEW-LIVE relationship: Becomes a fallback profile under export-assisted migration.
- Floor-check: As a standalone adapter it fails the M5 floor; it only passes if wrapped inside M1.β + M5.C/D with Roman prompts for missing data.
- Landmines: Trainerize official docs say client-list export is limited to basic contact fields and excludes workout/program history/stats, so any builder brief promising set/rep/RPE preservation from Trainerize CSV is wrong ([Trainerize export help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize), [Trainerize transfer help](https://help.trainerize.com/hc/en-us/articles/26458988419220)).
- Doors: Door A: no scout by default; Door B: upload CSV only; Door C: batch import; Door D: deterministic; Door E: no live scout without written permission.

### M3 — generic spreadsheet adapter

- Slice verdict: **KEEP + EXPAND**.
- Priority: **P1**.
- Reality-grounded scope: Spreadsheet is the legally safest universal fallback for non-platform coaches and for vendors whose ToS blocks delegated access.
- M-NEW-LIVE relationship: Survives as the escape hatch when vendor exports are weak or legal posture blocks browser scout.
- Floor-check: Must add AI-assisted column mapping, row-level validation, suggested fixes, coach-facing error summaries, undo, and M5.C/D activation after commit.
- Landmines: Spreadsheet data is arbitrary and dirty; validation must catch duplicate clients, invalid emails/phones, time zones, dates, plan names, and ambiguous billing status before commit.
- Doors: Door A: no browser runtime; Door B: no credentials; Door C: batch upload; Door D: deterministic + Roman mapping; Door E: cleanest legal posture.

### M4 — Trainerize JSON adapter

- Slice verdict: **KILL**.
- Priority: **P5**.
- Reality-grounded scope: Do not build; no official Trainerize JSON export was found, and Trainerize says program/workout data cannot be exported/transferred beyond PDF-style fallback ([Trainerize export help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize), [Trainerize transfer help](https://help.trainerize.com/hc/en-us/articles/26458988419220)).
- M-NEW-LIVE relationship: Replaced by Trainerize roster fallback plus optional permissioned co-pilot/PDF reconstructor.
- Floor-check: Impossible as scoped.
- Landmines: Building a fake adapter around an absent export format wastes the lane and creates downstream false confidence.
- Doors: Door A–E: closed.

### M5.A — multi-channel transactional notification substrate

- Slice verdict: **KEEP + EXPAND**.
- Priority: **P1**.
- Reality-grounded scope: Use Resend for email, Twilio for SMS, Expo for mobile push, Web Push with service workers/VAPID for browser push, and Twilio Voice for last-resort calls.
- M-NEW-LIVE relationship: Downstream activation engine triggered by commit and by failed/partial migration states.
- Floor-check: This is the floor; enforce idempotency, de-dup, delivery receipts, rate limits, templates, and channel preferences.
- Landmines: Resend supports `POST /emails`, required `from/to/subject`, and `Idempotency-Key` expiring after 24 hours; Twilio sends outbound messages through the Messages resource and outbound calls through the Calls resource with CPS queuing; Expo abstracts FCM/APNs; Web Push requires service worker registration, user permission, PushSubscription storage, and VAPID/application server keys ([Resend send email API](https://resend.com/docs/api-reference/emails/send-email), [Twilio Messaging API](https://www.twilio.com/docs/messaging/api), [Twilio Call resource](https://www.twilio.com/docs/voice/api/call-resource), [Expo push overview](https://docs.expo.dev/push-notifications/overview/), [web.dev push subscription guide](https://web.dev/articles/push-notifications-subscribing-a-user)).
- Doors: Door A: not relevant; Door B: provider API keys only; Door C: live delivery events; Door D: deterministic routing + Roman copy; Door E: consent/preferences required.

### M5.B — smart dunning state machine

- Slice verdict: **KEEP + EXPAND**.
- Priority: **P1**.
- Reality-grounded scope: Include migration-specific dunning states for invite not delivered, invite not opened, app not installed, profile incomplete, payment not configured, and coach action needed.
- M-NEW-LIVE relationship: Downstream of migration commit and M10 billing prompts.
- Floor-check: Must be stateful, multi-channel, Roman-assisted, observable, and reversible.
- Landmines: Twilio SMS and Voice introduce send/call status callbacks and rate/queue behavior that the state machine must ingest rather than pretending delivery is synchronous ([Twilio Messaging API](https://www.twilio.com/docs/messaging/api), [Twilio Call resource](https://www.twilio.com/docs/voice/api/call-resource)).
- Doors: Door A: provider-native transport; Door B: provider credentials; Door C: event-driven; Door D: rules + Roman tone; Door E: opt-out and consent.

### M5.C — super-loaded link flow

- Slice verdict: **KEEP + EXPAND**.
- Priority: **P1**.
- Reality-grounded scope: Signed link carries migration session, client, coach, target package, skip-purchase flag, assignment, expiry, and audit correlation; supports bulk resend and per-client rescue.
- M-NEW-LIVE relationship: The handoff after M1.β commit.
- Floor-check: Meets floor only if it works across email/SMS/push/web, auto-assigns, skips purchase where allowed, and exposes coach progress.
- Landmines: Web Push subscriptions are per browser/device and require user permission on each device, so push cannot be assumed for imported clients before app/web opt-in ([web.dev push subscription guide](https://web.dev/articles/push-notifications-subscribing-a-user), [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)).
- Doors: Door A: app/web link resolver; Door B: signed tokens not credentials; Door C: live status; Door D: deterministic; Door E: consent-aware.

### M5.D — Roman AI overlay at client ingest

- Slice verdict: **KEEP + EXPAND**.
- Priority: **P0/P1**.
- Reality-grounded scope: Roman drafts welcome message, first check-in, day-1 plan stub, missing-data questions, and client-specific caution cards from reconstructed source data.
- M-NEW-LIVE relationship: Integrated into M1.β and M11, not bolted on after import.
- Floor-check: Must be present at every human decision point.
- Landmines: Roman must cite source evidence inside the preview because source quality varies: Assistant Coach documents rich coach-visible profile/check-in/plan/goal/note data, while Trainerize export docs expose only roster-level data ([Assistant Coach AI overview](https://help.assistantcoach.fit/ai-integration/overview/), [Trainerize export help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize)).
- Doors: Door A: not runtime-bound; Door B: no vendor credentials; Door C: generated as observations normalize; Door D: LLM constrained by evidence; Door E: no hallucinated medical/health claims.

### M8 — program migration

- Slice verdict: **RESHAPE / ABSORB**.
- Priority: **P1/P2**.
- Reality-grounded scope: Rebuild as `ProgramReconstructor`, not Trainerize-specific converter; source inputs include TrueCoach TXT/PDF, CoachRx reports/text exports, Assistant Coach workout PDFs, Everfit workout PDFs, and manual uploads.
- M-NEW-LIVE relationship: Absorbed into reconstructor modules.
- Floor-check: Must preserve evidence, show confidence, ask coach to confirm ambiguous exercises/sets/reps/rest, and feed Roman day-1 plan drafting.
- Landmines: Trainerize and Everfit are PDF-heavy, TrueCoach offers TXT/PDF paths, and Assistant Coach provides PDF export for workout plans; none of those are equivalent to a clean canonical program API ([Trainerize transfer help](https://help.trainerize.com/hc/en-us/articles/26458988419220), [Everfit workout PDF export](https://help.everfit.io/en/articles/5647484-how-to-export-or-print-workouts-as-pdfs), [TrueCoach program export](http://help.truecoach.co/en/articles/2393507-printing-a-program), [Assistant Coach workout PDF export](https://help.assistantcoach.fit/workout-plans/pdf-export/)).
- Doors: Door A: export upload first; Door B: no credentials by default; Door C: batch evidence + live preview; Door D: hybrid parser/LLM; Door E: permissioned only.

### M9 — check-in/history migration

- Slice verdict: **RESHAPE / ABSORB**.
- Priority: **P2**.
- Reality-grounded scope: Build `HistoryReconstructor` for check-ins, measurements, reports, notes, and workout completion where official exports/reports expose them.
- M-NEW-LIVE relationship: Absorbed into reconstructor modules and degraded by vendor source quality.
- Floor-check: Must include source-evidence cards, partial-import warnings, coach confirmation, client privacy controls, and audit trail.
- Landmines: Trainerize excludes progress stats/body measurements/program adherence from export, CoachRx custom reports can include workout calendar, structural balance, consultation notes, intake forms, short-term plans, and long-term plans, and Assistant Coach’s full check-in export is planned rather than shipped ([Trainerize export help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize), [CoachRx custom reports](https://intercom.help/coachrx/en/articles/7172943-custom-client-reports), [Assistant Coach data export](https://help.assistantcoach.fit/data-export/)).
- Doors: Door A: export/report first; Door B: no stored credentials; Door C: batch with live progress; Door D: hybrid; Door E: conservative.

### M10 — billing migration

- Slice verdict: **RESHAPE**.
- Priority: **P2**.
- Reality-grounded scope: Build a billing planner that maps existing packages/subscriptions to Stripe Billing subscription schedules and plan equivalents; do not promise payment-method or subscription continuity unless current processor data and Stripe migration prerequisites exist.
- M-NEW-LIVE relationship: Separate sensitive module; should not ride the first scout profile.
- Floor-check: Must include Roman-proposed equivalents, coach confirmation, idempotency, audit trail, rollback/cancel path, and dunning handoff.
- Landmines: Stripe says third-party or in-house subscription migration requires setting up Billing, migrating customer/payment processor information, preparing source data, and recommends Subscription Schedules for future starts/review before billing; CoachRx exposes subscription/revenue CSV but Trainerize researched exports do not expose billing data ([Stripe import subscriptions](https://docs.stripe.com/billing/subscriptions/import-subscriptions), [Stripe migrate subscriptions](https://docs.stripe.com/billing/subscriptions/migrate-subscriptions), [CoachRx data export](https://intercom.help/coachrx/en/articles/14077482-exporting-data-from-coachrx), [Trainerize export help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize)).
- Doors: Door A: no live browser first; Door B: Stripe/processor-approved paths; Door C: batch review; Door D: deterministic mapping + Roman suggestions; Door E: high-compliance path only.

### M11 — end-to-end migration wizard + Day-1 Win

- Slice verdict: **KEEP + EXPAND**.
- Priority: **P1**.
- Reality-grounded scope: Rebuild as migration command center: choose source, legal status, upload/export instructions, optional co-pilot, live progress, preview/commit, activation, recovery, and Day-1 Win.
- M-NEW-LIVE relationship: Upgraded; the wizard is the shell around export-assisted and permissioned-scout modes.
- Floor-check: Must be mobile + web, stateful/resumable, Roman-guided, observable, and integrated with M5.C/D.
- Landmines: UI must not present disabled vendors as available live-scout targets when their ToS posture is prohibited/unclear; Trainerize, TrueCoach, Everfit, and MyPTHub legal posture forces the wizard to show safe modes by default ([Trainerize legal terms](https://www.trainerize.com/legal.aspx), [TrueCoach terms](https://truecoach.co/terms/), [Everfit terms](https://everfit.io/tos/), [MyPTHub terms](https://www.mypthub.net/legal/terms-of-use/)).
- Doors: Door A: mode selector; Door B: credentials only with approval; Door C: live progress; Door D: guided reconstruction; Door E: legal gate front-and-center.

### M-NEW-LIVE — live scout universal mirror adapter

- Slice verdict: **RESHAPE**.
- Priority: **P0 substrate, P2 vendor scouts**.
- Reality-grounded scope: Build the substrate now, but do not enable vendor-specific unattended scouts until legal gates pass and synthetic accounts exist.
- M-NEW-LIVE relationship: Becomes a controlled capability inside the broader migration spine, not the entire spine.
- Floor-check: Passes only with RLS, audit, redaction, raw TTL, health dashboard, co-pilot fallback, vendor permission matrix, profile CI, and M5 activation.
- Landmines: Browserbase and E2B costs are manageable, but ToS and credentials are the real blockers; Browserbase Developer includes 100 browser hours and charges overage at $0.12/hour, Startup includes 500 browser hours and charges overage at $0.10/hour, while E2B charges per second of running sandbox usage with published vCPU/memory rates ([Browserbase billing plans](https://docs.browserbase.com/account/billing/plans), [Browserbase pricing](https://www.browserbase.com/pricing), [E2B pricing](https://e2b.dev/pricing)).
- Doors: Door A: A3; Door B: B2/B3-first; Door C: C1 parsed stream + batched raw; Door D: D3; Door E: E1 with E3 gate.

## Slices to ADD

1. **M-NEW-SUBSTRATE — MigrationSession + observations**: required before any scout or reconstructor; includes RLS, audit, redaction, TTL, idempotency, resume/abort, and heartbeat.
2. **M-NEW-LEGAL-MATRIX — vendor permission and safe-mode registry**: runtime table that gates vendor modes as `export_only`, `copilot_only`, `scout_allowed`, or `disabled`; required because Trainerize/TrueCoach/Everfit legal posture is not clean for unattended scout ([Trainerize legal terms](https://www.trainerize.com/legal.aspx), [TrueCoach terms](https://truecoach.co/terms/), [Everfit terms](https://everfit.io/tos/)).
3. **M-NEW-PROFILE-CI — vendor profile tests + health dashboard**: required because UI changes break deterministic profiles.
4. **M-NEW-RECONSTRUCTOR — evidence-based normalization engine**: required to consume CSV/TXT/PDF/JSON/observations and expose field-level source evidence.
5. **M-NEW-COPILOT — live coach-driven fallback**: required for MFA/CAPTCHA/device-trust unknowns and credential-risk vendors.
6. **M-NEW-EXPORT-INSTRUCTIONS — guided export playbooks**: required because each vendor has different official export/report flows, such as TrueCoach email-delivered CSV/TXT exports, CoachRx reports, Everfit PDFs, and MyPTHub support-requested nutrition reports ([TrueCoach client export](http://help.truecoach.co/en/articles/5811721-how-to-export-clients), [CoachRx custom reports](https://intercom.help/coachrx/en/articles/7172943-custom-client-reports), [Everfit workout PDF export](https://help.everfit.io/en/articles/5647484-how-to-export-or-print-workouts-as-pdfs), [MyPTHub nutrition report](https://support.mypthub.net/hc/en-us/articles/22529663855249-Download-Nutrition-Report)).

## Slices to KILL

- **M4 Trainerize JSON adapter**: kill immediately because no official JSON export surface was found and official docs point to roster CSV/PDF limitations ([Trainerize export help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize), [Trainerize transfer help](https://help.trainerize.com/hc/en-us/articles/26458988419220)).
- **Any standalone Trainerize program/history converter**: kill as a promised structured import; replace with PDF/manual/co-pilot reconstruction.
- **Per-vendor adapters as full slices after substrate**: collapse into profile/config/reconstructor modules unless they require distinct legal/transport/billing infrastructure.

## Cross-cutting landmines

1. **Legal gating beats technical cleverness**: Trainerize, TrueCoach, and Everfit each restrict automated/manual copying/retrieval/monitoring in ways that block a default unattended scout posture ([Trainerize legal terms](https://www.trainerize.com/legal.aspx), [TrueCoach terms](https://truecoach.co/terms/), [Everfit terms](https://everfit.io/tos/)).
2. **Credential transfer is poisonous by default**: Trainerize says it will never ask for a password, Everfit says account credentials must remain confidential and not be shared, and MyPTHub says passwords/security information must not be disclosed to third parties ([Trainerize account security](https://help.trainerize.com/hc/en-us/articles/360025557932-How-to-Keep-Your-ABC-Trainerize-Account-Secure), [Everfit terms](https://everfit.io/tos/), [MyPTHub terms](https://www.mypthub.net/legal/terms-of-use/)).
3. **MFA/device-trust status is mostly UNKNOWN**: official docs found Trainerize payment SCA for European purchases but not login MFA, Trainerize account-security docs do not mention MFA/device trust/CAPTCHA, and Assistant Coach security docs describe OAuth tokens but not MFA ([Trainerize SCA help](https://help.trainerize.com/hc/en-us/articles/360033710571-What-is-Strong-Customer-Authentication-SCA), [Trainerize account security](https://help.trainerize.com/hc/en-us/articles/360025557932-How-to-Keep-Your-ABC-Trainerize-Account-Secure), [Assistant Coach security](https://help.assistantcoach.fit/trust/security/)). Verification step: test paid/sandbox accounts from clean cloud IP and local browser with vendor permission.
4. **PDF/TXT reality kills clean structured import assumptions**: Trainerize, TrueCoach, Everfit, and Assistant Coach all expose important workout/program data through PDFs/TXT in at least some paths, so reconstruction must be evidence-based and coach-confirmed ([Trainerize transfer help](https://help.trainerize.com/hc/en-us/articles/26458988419220), [TrueCoach program export](http://help.truecoach.co/en/articles/2393507-printing-a-program), [Everfit workout PDF export](https://help.everfit.io/en/articles/5647484-how-to-export-or-print-workouts-as-pdfs), [Assistant Coach workout PDF export](https://help.assistantcoach.fit/workout-plans/pdf-export/)).
5. **Billing migration cannot be hand-waved**: Stripe’s canonical path requires processor/customer/subscription preparation and Stripe recommends Subscription Schedules for reviewable future starts; only CoachRx among researched vendors clearly exposes subscription/revenue CSV ([Stripe import subscriptions](https://docs.stripe.com/billing/subscriptions/import-subscriptions), [Stripe migrate subscriptions](https://docs.stripe.com/billing/subscriptions/migrate-subscriptions), [CoachRx data export](https://intercom.help/coachrx/en/articles/14077482-exporting-data-from-coachrx)).

## Recommended build order

1. **Gate 0 — H6A + H6B + H6C**: audit logging, PII redaction, async/circuit-breakers, and RLS must merge before any observation table.
2. **P0 — M-NEW-LEGAL-MATRIX**: no builder can accidentally expose a prohibited vendor mode.
3. **P0 — M1.α expanded MigrationSession substrate**: source modes, idempotency, observation store, raw TTL, audit events, RLS Tier-1.
4. **P0 — M1.β Reconstructor preview/commit**: evidence-based canonicalization, Roman overlay, transactional commit, rollback.
5. **P0/P1 — TrueCoach export-assisted profile**: client CSV + workout TXT + program PDF/TXT playbook.
6. **P1 — M5.A/D then M5.C/B**: notification substrate and Roman prompt before smart dunning polish.
7. **P1 — M11 command center**: live progress around the now-working export-assisted profile.
8. **P1/P2 — CoachRx profile**: after resolving role-doc conflict.
9. **P2 — Program/history reconstructors for PDF/TXT-heavy vendors**: Everfit, Trainerize, Assistant Coach PDFs.
10. **P2 — M10 billing module**: Stripe schedules and processor-safe migration after non-billing migration is proven.
11. **P3+ — Permissioned unattended scouts**: only per vendor after legal sign-off, synthetic account, profile CI, and cost budget.

## Cost model

Browser runtime cost is not the blocker. Browserbase Developer costs $20/month for 100 browser hours with $0.12/hour overage, and Startup costs $99/month for 500 browser hours with $0.10/hour overage; because Browserbase bills browser time by the minute with the first minute rounded up, a 5-minute overage session is roughly $0.01 on Developer and a 30-minute session is roughly $0.06 ([Browserbase billing plans](https://docs.browserbase.com/account/billing/plans), [Browserbase pricing](https://www.browserbase.com/pricing)).

E2B pricing states sandbox usage is charged per second, with default compute rates of $0.000028/second for 2 vCPU and $0.0000045/GiB-second for memory; a rough 2 vCPU + 2 GiB default sandbox is about $0.133/hour, about $0.011 for 5 minutes, and about $0.067 for 30 minutes before plan minimums or extra services ([E2B pricing](https://e2b.dev/pricing)).

AWS EC2 On-Demand can run self-hosted Playwright with no long-term commitment and Linux per-second billing after a 60-second minimum, but the real cost is ops, proxy/IP reputation, browser fleet maintenance, and legal gating rather than raw compute ([AWS EC2 On-Demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/)).

Pricing conclusion: budget $0.01–$0.10 of raw browser compute for 5–30 minute managed sessions, plus productized overhead for retries, storage, audit writes, profile CI, logs, and human co-pilot time.

## Legal/ToS exposure summary

| Vendor | Posture | Why | Required gate |
|---|---|---|---|
| Trainerize | **PROHIBITED / high risk** | Terms restrict manual/automated monitoring/copying and third-party integrations without permission; export docs expose roster only ([Trainerize legal terms](https://www.trainerize.com/legal.aspx), [Trainerize export help](https://help.trainerize.com/hc/en-us/articles/31089834946324-What-Information-Can-Be-Exported-from-ABC-Trainerize)). | Export-only until written permission. |
| TrueCoach | **PROHIBITED unless consent** | Terms require prior written consent for automated retrieval/indexing/reproduction/database/mirroring behavior ([TrueCoach terms](https://truecoach.co/terms/)). | Export-assisted first; written permission for scout. |
| CoachRx | **UNCLEAR** | OPEX terms point users to publicly supported interfaces and restrict collecting personal information without consent ([OPEX terms](https://www.opexfit.com/terms-and-conditions)). | Use official exports/imports; legal review before scout. |
| Assistant Coach | **SILENT/UNCLEAR for browser; PERMITTED for approved OAuth AI** | Security docs describe OAuth 2.1 read-only connected AI access and revocation, while terms keep users responsible for account access ([Assistant Coach security](https://help.assistantcoach.fit/trust/security/), [Assistant Coach terms](https://assistantcoach.fit/terms)). | Prefer OAuth/approved connection. |
| Everfit | **PROHIBITED / high risk** | Terms prohibit automatic access/copying and prohibit sharing credentials or account access ([Everfit terms](https://everfit.io/tos/)). | PDF/export-only unless written consent. |
| MyPTHub | **UNCLEAR; credential sharing prohibited** | Terms require credentials to be confidential and not disclosed to third parties; no explicit bot clause found in reviewed terms ([MyPTHub terms](https://www.mypthub.net/legal/terms-of-use/)). | Support-assisted/export-only by default. |

## Research task coverage

- Trainerize export and ToS: covered with official export, transfer, legal, account-security, and payment-SCA pages.
- TrueCoach export and ToS: covered with official client export, workout export, program export, coach-transfer, and terms pages.
- CoachRx export/import and ToS: covered with official client CSV, data export, custom reports, bulk import, roles, OPEX terms, and OPEX privacy pages.
- Assistant Coach: covered with official data export, AI overview, workout PDF export, privacy, security, and terms pages.
- MyPTHub and Everfit: covered with official export/print/help pages and terms pages.
- Notification providers: covered with official Resend, Twilio Messaging, Twilio Voice, Expo Push, MDN Push API, and web.dev VAPID/application server key documentation.
- Stripe: covered with Stripe Billing subscription import and migration docs.
- MFA/device trust: official login-MFA/device-trust documentation remains sparse; mark vendor behavior UNKNOWN until paid/sandbox login tests and vendor-support confirmation.
- Browser-sandbox cost: covered with Browserbase, E2B, and AWS official pricing pages.

## Blockers and unknowns

1. **GitHub push blocker**: the required `gh api -X PUT` pattern with Bradley as author and committer and no AI/agent attribution was blocked by the platform safety classifier; workspace artifact is complete, but no GitHub SHA can be produced in this run.
2. **CoachRx permission conflict**: the client CSV article and roles matrix conflict on which coach roles can export data; verify with CoachRx support or a test account before building role assumptions ([CoachRx client CSV export](https://intercom.help/coachrx/en/articles/14473855-how-to-export-your-client-list-as-a-csv), [CoachRx roles matrix](https://intercom.help/coachrx/en/articles/6428167-coach-roles-permissions)).
3. **MFA/CAPTCHA/device-trust**: official docs did not provide enough current per-vendor login challenge data; verification requires controlled test accounts and vendor support confirmation.
4. **Assistant Coach full export**: current official page says export is coming soon, so any builder brief must not assume a shipped CSV/JSON bundle ([Assistant Coach data export](https://help.assistantcoach.fit/data-export/)).
5. **CoachRx DPA**: the DPA page exposed a download prompt but not clause text in the fetched content; legal review must fetch the actual DPA file before production use ([CoachRx DPA page](https://intercom.help/coachrx/en/articles/6005522-coachrx-data-processing-addendum)).

VERDICT: FINDINGS
