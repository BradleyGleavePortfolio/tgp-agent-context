# Launch flag ledger (operator, 2026-10-01 11:55 PDT)

Owner asked 11:31: "Lets start flipping flags ON — pre-user but close to launch, its time?" Operator answer: yes, in waves.
A flag goes ON only when (1) its code is merged AND deployed, (2) its PR passed its audit tier, (3) it is part of the launch
scope, (4) it is set through the audited env-sync path (S-ENVTRUTH `fly-env-sync`, desired state checked in), never by hand.
Prod has no users yet, so each wave is verified end-to-end on the owner's account right after it flips.
Backend flags = Fly secrets (runtime, reversible in minutes). Mobile `EXPO_PUBLIC_FF_*` = baked into the binary via
`eas.json` profile `clinic` (Saturday 10-03 build); later changes ride OTA (#305) once it ships.

## Wave A — code already in prod, required by the guardrail flow (flip as soon as fly-env-sync is merged)
| Flag | Why | Note |
|---|---|---|
| FEATURE_COMMUNITY_SCHEMA / _API / _POSTS / _MESSAGES / _PUSH / _REALTIME (exact set mapped by S-ENVTRUTH from guards) | Community chat space is a guardrail step; all FEATURE_COMMUNITY_* are absent on Fly, so the community API is gated off in prod while the clinic mobile profile turns the Community tab ON | Report/block (#610) must be deployed before App Review uses community |
| BOOKING_REMINDERS_ENABLED (explicit true) | Session reminders for the Calendar section | Code default is on; make it explicit |

## Wave B — flips with its deploy, after dual approval
| Flag | Gate |
|---|---|
| AI consent ledger enforcement (#622) | ON at clinic deploy (operator ruling) |
| FEATURE_WEARABLES_INGEST_POST | #623 deployed + dual approval + #604 settled, then owner device pass |
| FEATURE_MWB_TEMPLATES, FEATURE_MWB_AUTOSAVE_UNDO, FEATURE_NAMED_REGIMES | Backend merged in June (MWB-1..3, #376/#381/#386); flip when the S-MWB Programs library lands; mobile EXPO_PUBLIC_FF_MWB_AUTOSAVE with it |
| GOOGLE_CLIENT_IDS (not a flag, but gates the Google button) | fly-env-sync |
| SIGNUP_ROLE_CHOICE_ENABLED | ON only if #597 + #306 dual-approved by Fri 10-02 12:00 PDT (D4); else false |

## Stay OFF for launch
| Flag | Reason |
|---|---|
| FEATURE_ROMAN_CHAT_ENABLED / EXPO_PUBLIC_FF_ROMAN_CHAT | D1: scripted Roman only in 1.0 |
| FEATURE_DUNNING_V2, FEATURE_BANK_PAYOUTS_V2, FEATURE_STRIPE_TREASURY_PAYOUTS | Money paths wait for S-FEE (#1 issue) |
| GOOGLE_CALENDAR_ENABLED, GOOGLE_MEET_ENABLED, FEATURE_GOOGLE_CALENDAR_SYNC, ZOOM_ENABLED | Native scheduling is the product; external sync optional later |
| EXPO_PUBLIC_FF_WEARABLE_AI_INSIGHTS | Operator ruling: wearables AI panel hidden |
| FEATURE_SCOUT_*, FEATURE_EXTENSION_PAIRING, EXTENSION_IMPORT, IMPORT_REVIEW | Bucket B importer paused |
| FEATURE_CONTRACTS_*, FEATURE_COMMUNITY_AI_TRIAGE, _VOICE_NOTES, _CHALLENGES, _EVENTS, _CLASSROOM_POSTS, LEADERBOARD_ENABLED | Not in clinic scope / not reachable until S-REACH decides; flip individually later |
| FEATURE_MWB_AI_LIVE_CREATE, DIAGNOSTIC_AI_ENABLED and other AI paths | R2b AI enforcement not accepted yet |

## Mobile clinic profile (locks Fri 10-02 18:00 PDT for the Saturday build)
Current `clinic` env: CLIENT_TUTORIAL, COMMUNITY_TAB, COMMUNITY_HALL, COMMUNITY_COHORTS, COACH_BRIEF = true. Final list is
set from the S-REACH reachability map + S-SCHED + #310 (consultation flag) + #317 (wearables) before the build.
