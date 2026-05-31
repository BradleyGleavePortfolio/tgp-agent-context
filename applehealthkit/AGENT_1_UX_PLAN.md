# AGENT 1 — HealthKit / Wearables Expansion: UX Plan

**Author:** Dynasia G <dynasia@trygrowthproject.com>
**Date:** 2026-05-30
**Role:** Agent 1 of 2 (UI/UX bible study → comprehensive UX plan). Agent 2 owns the coding/PR plan.
**Status:** Planning. Implementation pending UNIFIED_BUILD_PLAN synthesis by coordinator.

> **Citation convention.** Every design decision in this plan cites the section of the *Mobile App Design Intelligence — Exhaustive Agent Training* document (referred to as **the bible**) that justifies it, e.g. *[bible §4.5]*. Product-taste calls cite the CPO docs as *[CPO Taste §3]* (CPO_MASTER_HANDOFF_PART_2 §3 PRODUCT_TASTE), *[CPO Comms §4]* (confidence calibration), or *[CPO Brief §7]* (Simplicity Mandate). Scope locks cite *[HANDOFF]* or *[Scope]* (_healthkit_scope_refinement.md).

> **Source of truth for scope.** Two visual buckets — **Health & Fitness (H&F)** and **Sleep & Recovery (S&R)** — are PRIMARY, locked information architecture *[HANDOFF "Two Visual Buckets"]*, *[Scope §8]*. Taxonomy is **per-metric, not per-device**: a device that reports both workouts and sleep (Apple Watch, Garmin) places each metric in its correct bucket *[HANDOFF note line 72]*.

> **The North Star this UX serves.** Coaches billing $2–8K/mo need every notable wearable's health AND sleep data surfaced in a decacorn-quality experience that (1) tells the coach per-client what's going on + what to do, (2) tells the client what's going on + how to improve, (3) lives inside restrained-luxury mobile design *[HANDOFF "North Star"]*. The ICP is personal trainers with 10–40 clients, solo or 1 VA *[CPO Brief §2]*.

---

## Table of Contents

1. Information Architecture (Two Visual Buckets)
2. Data Brought In (Per Bucket, Per Provider)
3. Named Pages, Paths, Coach-Per-Client Views
4. Coach-Per-Client View (Detailed)
5. Client-Side View (Detailed)
6. Embedded AI Design (Both Sides)
7. Decacorn Design Doctrine Applied (Per Bible)
8. Anti-Patterns Avoided (From Bible)
9. Restrained Luxury Theme (Bucket-Differentiated)
10. Open Questions for Synthesis (Hand to Coordinator)

---

## 1. Information Architecture (Two Visual Buckets)

The single most important IA decision is that the expansion presents as **two visually distinct buckets**, not as one undifferentiated "health" surface. This is a locked user directive *[HANDOFF Directive 3]* and it is also the correct design call: it lets each bucket carry its own emotional target — energy for H&F, calm for S&R — which is impossible if both share one visual register *[bible §1.1, §5.1 Step 1]*.

### 1.1 Bucket A — Health & Fitness

- **What metrics.** Daily activity (steps, active energy, stand hours, exercise minutes), heart rate (resting, walking average, workout zones), VO2max / cardio fitness, workouts (type, duration, distance, pace, power, elevation, segments), training load / training readiness (Garmin), body composition (weight, body-fat %, lean mass, BMI), blood pressure (Withings), and — v2, optional — nutrition (MyFitnessPal) *[Scope §A]*, *[HANDOFF §A]*.
- **What surface.** A top-level destination, **`Fitness`**, that opens to a **scrubable activity surface** with the Apple-Watch three-ring model as the hero, followed by a vertically stacked, chunked set of metric cards (Activity, Heart, Workouts, Body, Fitness Trend). Each card is one cognitive chunk *[bible §4.3 chunking]*.
- **What visual identity.** Warm, energetic, motion-forward — Apple Fitness rings + Strava segments register *[bible §5.4 domain matrix: Fitness Tracking + Social Fitness]*, *[Scope §39]*. Warm accent (ember/amber gradient), faster motion easing, rings that fill with spark-on-close celebration *[bible §3.6]*. See §9 for tokens.
- **Core emotional goal.** Completion drive + competence *[bible §5.4]*. The user (or the coach reading the client) should leave feeling capable and that effort is visibly compounding *[bible §1.2 Behavioral, §3.7 competence feedback]*.

### 1.2 Bucket B — Sleep & Recovery

- **What metrics.** Sleep duration vs. need, sleep stages (awake / REM / light / deep), sleep efficiency, sleep onset + wake times, HRV (overnight), resting heart rate (overnight), respiratory rate, skin/body temperature deviation, blood oxygen, recovery score / readiness (Whoop recovery, Oura readiness, Garmin Body Battery, Polar Nightly Recharge), strain/load balance *[Scope §B]*, *[HANDOFF §B]*.
- **What surface.** A top-level destination, **`Recovery`**, that opens to a **single calm hero** — last night's recovery/readiness expressed as a **ring** *[bible §3.6 ring model: "recovery score = ring"]* — over a deep, low-luminance background, followed by chunked cards (Last Night, Sleep Stages, Recovery Drivers, Trends).
- **What visual identity.** Calm, deep, slow-breathing — Apple Health sleep + Calm-app register *[Scope §39]*, *[bible §2.2 Phantom CALM]*. Cool/dark gradient, slow motion easing (slow-breathing cadence), reduced contrast, generous negative space. See §9 for tokens.
- **Core emotional goal.** Self-knowledge + reassurance. Sleep data is anxiety-loaded; the bucket's job is to *modulate* the user's emotional baseline before delivering any deficit, applying Phantom's CALM framework *[bible §2.2 CALM]*, *[HANDOFF Quality Bar "Phantom CALM in S&R"]*.

### 1.3 Why the buckets are visually distinct (and how far)

The buckets must read as **two tiers of one premium system**, the way Revolut's Standard / Premium / Metal tiers are visually distinct expressions of one design language *[bible §2.3, §5.4 "tier-differentiated design quality"]*. They share the same skeleton — same spacing scale, same typographic ramp, same component vocabulary, same interaction grammar — so the user pays **zero re-learning cost** moving between them *[bible §4.7 consistency dividend]*. They differ only in **accent, motion cadence, and luminance**:

| Dimension | Health & Fitness | Sleep & Recovery |
|---|---|---|
| Emotional target | Energized, capable | Calm, reassured |
| Accent | Warm (amber→ember gradient) | Cool (indigo→slate gradient) |
| Background luminance | Light-to-mid (energetic) | Deep / dark (restful) |
| Motion cadence | Quick spring (~280ms) | Slow ease (~480ms, breathing) |
| Hero object | Activity rings | Recovery ring (single) |

This is restrained luxury, **not** two unrelated themes. Never cartoon, never playful *[Scope §39 "NEVER cartoon, NEVER playful"]*, *[CPO Taste §3]*. Distinction is achieved through **material and motion**, the Revolut lever, not through decoration *[bible §2.3 dark-mode-as-premium-signal]*.

### 1.4 Navigation: how the user moves between buckets

- **Tab cap is hard.** The mobile app already has a 4-tab `AppTabs` shell (Home, Clients/Programs, etc.) *[CPO Master Handoff §5 mobile nav graph]*. Apple HIG caps primary nav at 5 *[bible §4.3]* and CPO taste refuses any tab bar over 4 destinations *[CPO Taste §3 "Trainerize bottom-bar nav"]*. **Therefore the two buckets are NOT two new top-level tabs.** They live as a **segmented switcher inside a single Health destination**, preserving the tab cap.
- **The switcher.** At the top of the Health destination sits a two-segment control: **`Fitness` | `Recovery`**. This is one persistent, consistent control — the same component on both the client side and the coach-per-client side *[bible §4.7]*. It animates with a tier-appropriate cross-fade (warm→cool) so the bucket change is *felt*, reinforcing the visual distinction without a jarring context switch *[bible §1.2 Visceral, §2.3]*.
- **Why a segmented switcher beats two tabs.** Two buckets are conceptually peers, not siblings of Home/Clients. A segment control communicates "two views of one thing" (your health) rather than "two separate apps," which matches the per-metric (not per-app) taxonomy *[HANDOFF line 72]*. It also keeps Miller's 5±2 nav budget intact *[bible §4.3]*.

### 1.5 Default state on app open (anticipatory)

The product should open to the bucket the user most needs, not a neutral chooser — anticipatory UX surfaces the likely destination before the user navigates *[bible §4.6, §7.2 smart defaults]*.

- **Client side default:** the **last-viewed bucket**, UNLESS a "most-actionable" signal fires (a fresh overnight sync with a notable recovery drop, or a closed-rings-eligible day). If most-actionable fires, that bucket leads, with the other one-tap away. This is the "surface the likely next action" rule *[bible §4.6, §7.7 Layer 1]*.
- **Coach side default:** the **client list** (the coach's actual job is triage across clients), then within a client detail, the bucket flagged by the coach AI as having the highest-confidence actionable observation *[bible §4.6]*. See §4.
- **No empty chooser screen.** A "pick a bucket" interstitial would be a Hick's-Law tax and a permission-front-style friction point *[bible §4.4, §5.5 Anti-Pattern 1/2]*.

### 1.6 Per-metric bucket assignment (canonical)

The ingestion layer maps every provider-native metric to a canonical metric, and every canonical metric to exactly one bucket. Where a metric is physiologically relevant to both (e.g. resting HR), it has a **primary bucket** and may appear as a **read-only contextual reference** in the other (never duplicated as an editable/owning card). Primary assignment table:

| Canonical metric | Bucket | Notes |
|---|---|---|
| Steps / distance | H&F | |
| Active energy / move | H&F | Ring 1 |
| Exercise minutes | H&F | Ring 2 |
| Stand hours | H&F | Ring 3 |
| Workouts (all modalities) | H&F | type, duration, pace, power, HR zones, segments |
| VO2max / cardio fitness | H&F | |
| Training load / readiness (Garmin) | H&F (load) | readiness shows as S&R reference |
| Body composition (weight, BF%, lean) | H&F | |
| Blood pressure (Withings) | H&F | |
| Workout heart rate / zones | H&F | |
| Resting heart rate | S&R (primary) | shown as reference in H&F Heart card |
| HRV (overnight) | S&R | |
| Sleep duration vs need | S&R | |
| Sleep stages (REM/deep/light/awake) | S&R | |
| Sleep efficiency / onset / wake | S&R | |
| Respiratory rate | S&R | |
| Blood oxygen (overnight) | S&R | |
| Skin/body temperature deviation | S&R | |
| Recovery / readiness score | S&R | hero ring (Whoop/Oura/Garmin Body Battery/Polar) |
| Strain / load balance | S&R | recovery context |
| Nutrition (MyFitnessPal) | H&F (v2) | optional |

> **HRV lives in S&R, steps live in H&F** — the example assignments called out in the task brief are honored here. Resting HR is dual-relevant but its *primary* home is S&R (it is read overnight and is a recovery driver), with a read-only reference chip in the H&F Heart card.

---

## 2. Data Brought In (Per Bucket, Per Provider)

Real, live connections (OAuth / SDK), not display-only, is a locked directive *[HANDOFF Directive 4]*, *[Scope §46]*. This section defines **what the UX displays per provider**; Agent 2 owns the API/SDK/OAuth/rate-limit mechanics (PROVIDER_MATRIX).

### 2.1 Bucket A providers (Health & Fitness)

| Provider | Auth surface | Primary canonical metrics displayed |
|---|---|---|
| Apple HealthKit | iOS native on-device permission | steps, active energy, exercise/stand, HR, VO2max, workouts, body comp |
| Health Connect / Google Fit | Android native permission | Android equivalent of above |
| Garmin Connect | OAuth (Garmin Health API) | workouts, running dynamics, VO2max, training load/readiness, body comp |
| Fitbit | OAuth (Fitbit Web API) | steps, HR, exercise, body comp |
| Strava | OAuth (Strava API v3) | workouts, segments, pace/power, elevation |
| Polar | OAuth (Polar AccessLink) | HR training, workouts |
| Samsung Health | Samsung Health SDK | workouts, steps, body composition |
| Wahoo | OAuth (Wahoo Cloud API) | cycling/running workouts, power |
| Withings | OAuth (Withings API) | body composition, blood pressure |
| Peloton | partner API | workouts, output |
| MyFitnessPal | OAuth (v2, optional) | nutrition |

### 2.2 Bucket B providers (Sleep & Recovery)

| Provider | Auth surface | Primary canonical metrics displayed |
|---|---|---|
| Oura Ring | OAuth (Oura Cloud API v2) | sleep stages, HRV, readiness, body temp, resting HR |
| Whoop | OAuth (Whoop API v1) | recovery score, strain, sleep, HRV |
| Eight Sleep | OAuth (Eight Sleep API) | sleep stages, bed temp, sleep quality |
| Withings Sleep Analyzer | OAuth (Withings API) | sleep stages, respiratory, snoring |
| Apple Watch sleep | via HealthKit | sleep stages, duration |
| Samsung Galaxy Watch sleep | via Samsung Health | sleep stages, sleep score |
| Garmin sleep + Body Battery | via Garmin Connect | sleep stages, Body Battery (recovery) |
| Fitbit sleep | via Fitbit Web API | sleep stages, sleep score |
| Polar sleep + Nightly Recharge | via Polar AccessLink | sleep, Nightly Recharge (recovery) |
| Beddit | via HealthKit | sleep stages, duration |

> **Provider parity rule.** Every provider in a bucket connects through **one identical connection pattern** (see §3.6). The UI must never expose that, say, Oura uses webhooks and Whoop uses polling — that complexity is absorbed server-side per Testler's Law *[CPO Brief §7]*, *[bible §4.1, §7.2 hide the work]*. The user sees: provider logo, connection status, last-sync freshness, disconnect — identical for all 20+ providers. This directly prevents the Inconsistency Tax *[bible §5.5 Anti-Pattern 5]*.

### 2.3 Canonical metric schema per bucket

The ingestion layer normalizes every provider's native payload into **one canonical schema per bucket**, so the UI renders the metric, not the provider *[Scope §37 "abstract device → metric type → bucket"]*. This is also what makes deduplication possible when a client has overlapping providers (Apple Watch + Garmin both reporting HR) *[Scope §75]*.

**H&F canonical schema (per metric sample):**
```
{
  metric: "steps" | "active_energy" | "exercise_minutes" | "stand_hours"
        | "workout" | "vo2max" | "resting_hr" | "workout_hr_zones"
        | "training_load" | "body_weight" | "body_fat_pct" | "lean_mass"
        | "blood_pressure" | "nutrition_kcal",
  value: number | structured,        // workout = { type, duration, distance, pace, power, elevation, hr_zones[] }
  unit: canonical_unit,              // smart-default to user locale [bible §4.4]
  timestamp: ISO8601,                // server-authoritative time [CPO Brief R16]
  source_provider: enum,
  confidence: "device" | "derived",
  dedup_group: hash                  // collapses overlapping providers
}
```

**S&R canonical schema (per night / per metric):**
```
{
  metric: "sleep_duration" | "sleep_need" | "sleep_stage_breakdown"
        | "sleep_efficiency" | "sleep_onset" | "wake_time"
        | "hrv_overnight" | "resting_hr_overnight" | "respiratory_rate"
        | "spo2_overnight" | "temp_deviation" | "recovery_score"
        | "readiness_score" | "strain",
  value: number | structured,        // sleep_stage_breakdown = { awake, rem, light, deep } minutes
  unit: canonical_unit,
  night_of: date,                    // the night the sleep belongs to (server-resolved)
  source_provider: enum,
  confidence: "device" | "derived",
  dedup_group: hash
}
```

### 2.4 Per-provider data freshness display

Freshness is a **trust signal**, and in a trust-dependent domain polish-as-trust converts directly *[bible §2.2, §2.3]*, *[Scope §40 "Revolut polish-as-trust"]*. Every connected provider carries a freshness state, surfaced consistently:

- **Synced** — `Synced 2h ago` (relative, humanized). Default state.
- **Syncing** — animated, non-blocking shimmer on the affected cards; never a full-screen spinner *[bible §7.2 in-behavior invisibility, §1.2 Visceral "spinner with personality"]*.
- **Stale** — `Last synced yesterday` with a soft, non-alarming amber chip. Stale ≠ error.
- **Reconnect needed** — token expired; warm, action-oriented chip: `Reconnect Oura to keep your recovery current` (Stripe-quality error: says what's wrong AND what to do) *[CPO Taste §3 Stripe]*, *[bible §2.2 "treat error states as trust-building"]*.
- **Error** — backend sync failure; sympathetic copy, never `Something went wrong` *[bible §2.2 error anti-pattern]*.

Freshness appears (a) on each provider row in Connections, and (b) as a single roll-up chip at the top of each bucket (`All sources current` / `1 source needs attention`) so the user gets one chunked status, not 20 statuses *[bible §4.3 chunking]*.

---

## 3. Named Pages, Paths, Coach-Per-Client Views

Full screen inventory. Paths are expressed as mobile route names consistent with the existing Expo `RootStack → AppTabs` graph *[CPO Master Handoff §5]*. Each screen lists its **one-sentence purpose** (the "one thing" test *[bible §4.8]*) and **primary action** *[bible §5.1 Step 2]*.

### 3.1 Shared / connection screens

| Screen | Path | One-sentence purpose | Primary action |
|---|---|---|---|
| Connections Hub | `AppTabs/Settings/Connections` | Where users see and manage every health data source. | Connect a new source |
| Add Source (provider picker) | `.../Connections/Add` | Where users choose which wearable/app to connect. | Tap a provider |
| Provider OAuth Sheet | `.../Connections/Add/:provider` | Where the user authorizes one provider. | Authorize |
| Connection Detail | `.../Connections/:provider` | Where the user sees one source's status, freshness, and scope. | Reconnect / Disconnect |

### 3.2 Client-side bucket screens

| Screen | Path | One-sentence purpose | Primary action |
|---|---|---|---|
| Health (bucket shell) | `AppTabs/Health` | Where a client sees their own health, split into Fitness / Recovery. | Switch bucket / open a metric |
| Fitness Overview | `AppTabs/Health?bucket=fitness` | Where a client sees today's activity rings + fitness cards. | Open a metric detail |
| Recovery Overview | `AppTabs/Health?bucket=recovery` | Where a client sees last night's recovery ring + sleep cards. | Open a metric detail |
| Metric Detail | `AppTabs/Health/metric/:metricId` | Where a client explores one metric's trend and drivers. | Scrub the trend / act on the insight |
| Client AI Insight (panel) | embedded on Overview + Metric Detail | Where a client gets one actionable self-coaching insight. | Take the suggested action (CTA) |

### 3.3 Coach-side per-client screens

| Screen | Path | One-sentence purpose | Primary action |
|---|---|---|---|
| Client List | `AppTabs/Clients` | Where a coach triages all clients by what needs attention. | Open a client |
| Client Detail | `AppTabs/Clients/:clientId` | Where a coach sees one client's status across both buckets. | Switch bucket / open metric / act on AI |
| Client Fitness View | `.../:clientId?bucket=fitness` | Where a coach reads one client's fitness. | Open a metric detail |
| Client Recovery View | `.../:clientId?bucket=recovery` | Where a coach reads one client's recovery. | Open a metric detail |
| Client Metric Detail | `.../:clientId/metric/:metricId` | Where a coach inspects one client metric + anomaly context. | Act on the AI suggestion |
| Coach AI Panel | embedded on Client Detail + Client Metric Detail | Where a coach gets one diagnosis + a draftable message. | Review & approve message |
| Message Draft Approval | `.../:clientId/message/draft/:draftId` | Where a coach approves/edits/sends the AI-drafted message. | Approve & send |

### 3.3a Concrete screen layouts (top-to-bottom, per pane)

Layouts below are expressed as vertical stacks. Each obeys Miller's ≤5 primary chunks per pane *[bible §4.3]* and the Screen Design Protocol *[bible §5.1]*. Indentation shows nesting; `[hero]`, `[card]`, `[panel]`, `[chip]` are the shared component vocabulary (§9.3).

**Fitness Overview** (`AppTabs/Health?bucket=fitness`) — emotional target: *capable*.
```
[switcher]  Fitness | Recovery                         (warm-active)
[chip]      All sources current · Synced 2h ago        (freshness roll-up §2.4)
[hero]      Activity Rings (Move / Exercise / Stand)    (Apple ring model §7.5)
              └ spark-on-close celebration; haptic
[card 1]    Heart        — resting HR (ref chip), walking avg, workout zones
[card 2]    Workouts     — last workout: type, duration, pace/power, segment
[card 3]    Body         — weight, body-fat %, trend arrow
[card 4]    Fitness Trend— VO2max / cardio fitness, scrubable glow-drag chart §7.4
[panel]     Client AI    — collapsed: one-line observation (expand for full §6.2)
```
Primary path: glance rings → (optional) open one card → act on AI CTA. ≤5 primary chunks (rings + 4 cards), AI panel is progressively disclosed so it does not count against the cap *[bible §4.5]*.

**Recovery Overview** (`AppTabs/Health?bucket=recovery`) — emotional target: *reassured*; CALM throughout *[bible §2.2]*.
```
[switcher]  Fitness | Recovery                         (cool-active, slow cross-fade)
[chip]      All sources current                        (calm, low-contrast)
[hero]      Recovery Ring (single)                      (recovery = ring §7.5)
              └ reassuring copy first: "You're recovering" then the number
[card 1]    Last Night   — time asleep vs need, sleep efficiency
[card 2]    Sleep Stages — awake / REM / light / deep (plain-language labels §6.4)
[card 3]    Recovery Drivers — HRV, resting HR (overnight), respiratory rate
[card 4]    Trends       — 7/30/90d recovery + sleep, slow-reveal chart
[panel]     Client AI    — CALM-tinted, observation → norm → intervention → CTA
```
Deep/dark background, ~480ms breathing motion, deficits framed gently (§7.3).

**Coach Client Detail** (`AppTabs/Clients/:clientId`) — Linear-grade density *[CPO Taste §3]*.
```
[header]    Client name · avatar · last-active                (bucket-tint dot)
[switcher]  Fitness | Recovery     (opens to AI-flagged most-actionable bucket §4.2)
[hero]      Bucket hero (rings or recovery ring), client's values
[band]      Anomaly Band — anomalies / trends / cohort (coach-only §4.3)
[panel]     Coach AI — collapsed headline; expand: obs+hypothesis+draft+confidence
              └ [Review message] → Message Draft Approval §4.5
[cards]     Same chunked metric cards as client view (read context)
```

**Client List** (`AppTabs/Clients`) — triage surface, sorted by actionability *[bible §4.6]*.
```
[search]    Find a client                                (Revolut predictive §2.3)
[row]       avatar · name · ONE most-actionable line · ≤3 glance stats · tint dot
[row]       …sorted: highest-confidence, highest-impact anomalies first
```
Lead with one insight line per client, never a tile grid *[CPO Taste §3 Coach Brief precedent]*.

**Connections Hub** (`AppTabs/Settings/Connections`) — one pattern for 20+ providers (§3.6).
```
[chip]      2 sources need attention                     (chunked roll-up §2.4)
[group]     Fitness sources                               (chunk 1 §4.3)
              └ [row] logo · name · freshness chip · chevron   (× N)
[group]     Recovery sources                              (chunk 2)
              └ [row] logo · name · freshness chip · chevron   (× N)
[cta]       + Connect a new source                        (primary action)
```

### 3.4 Per-screen state design (empty / loading / error)

Apple cognitive de-load requires the design to **never break the user's flow** — errors resolve without ceremony, momentum is preserved *[bible §7.2 error prevention, §7.7 Layer 2]*. State design is treated as a core feature, not afterthought *[bible §5.5 Anti-Pattern 7]*.

**Empty states** (a connected source exists but no data yet, or no source connected at all):

- *No source connected:* a warm, value-first prompt — `Connect a wearable to see your recovery` with the value shown before the ask (mirror Duolingo "show the payoff before the effort") *[bible §2.1, §5.2 Screen 4]*. Demoable, not embarrassing *[CPO Taste §3 conference test; Trainerize fails empty states]*.
- *Source connected, awaiting first sync:* a skeleton of the real layout (ghost rings + ghost cards), not a spinner — so the user sees the shape of what's coming *[bible §1.2, §7.2]*. Copy: `Pulling your last 30 days from Oura…` (names the backfill window so the wait is explained) *[Scope §73]*.

**Loading states:**

- Bucket open is **optimistic**: render cached last-known data instantly from React Query cache, then shimmer-refresh in place *[CPO Master Handoff §5 React Query]*, *[bible §7.7 Layer 1 "everything already current"]*. Never block the bucket on a network round-trip.
- Per-card shimmer only on the cards actually refreshing; the rest of the page stays interactive *[bible §7.2 foreground simplicity]*.

**Error states:**

- *Sync error:* card keeps showing last-known data + a small `Last synced yesterday` chip; the error is a soft chip, not a takeover *[bible §2.2 error-as-trust]*.
- *Token expired:* inline reconnect affordance on the affected bucket roll-up; one tap to the OAuth sheet (Fogg facilitator — reduce steps) *[bible §7.4 facilitator]*.
- *AI insight unavailable:* the panel collapses gracefully to a single line (`Not enough data yet for an insight`) rather than showing a broken/empty panel — the panel is small by design (§6), so its absence is invisible *[bible §4.5 progressive disclosure, §5.5 Anti-Pattern 4]*.

### 3.5 Coach path (canonical traversal)

`Client List → Client Detail → bucket switcher (Fitness | Recovery) → Client Metric Detail → Coach AI Panel → Message Draft Approval → send`. Every hop is one tap; the primary path is completable without engaging any secondary control *[bible §4.4 primary path, §5.1 Step 5 "3 taps or fewer"]*.

### 3.6 Connection management (per-provider OAuth, status, freshness)

**One interaction pattern for all 20+ providers** *[bible §4.7, §5.5 Anti-Pattern 5]*, *[Scope §38]*:

1. **Connections Hub** lists connected sources grouped into two chunks: *Fitness sources* and *Recovery sources* (chunking keeps the list within Miller's budget even at 20+ providers) *[bible §4.3]*. Each row: provider logo, name, freshness chip, chevron.
2. **Add Source** opens a provider grid, also chunked by bucket, with a search field at top (Revolut "autosuggest / predictive search across all features" — users should never need to hunt) *[bible §2.3 navigation principle]*.
3. **Provider OAuth Sheet** is a single-purpose sheet: provider brand header, a one-line plain-language statement of what data we'll read and into which bucket (`We'll read your sleep and recovery from Oura`), and one **Authorize** button *[bible §2.2 CALM Clarity, §4.4 one decision per screen]*. **Contextual permission** — this is only ever reached when the user has chosen to connect, never front-loaded *[bible §5.5 Anti-Pattern 1]*, *[CPO Brief R28]*.
4. **Connection Detail** shows status, last-sync, the bucket(s) this source feeds, granted scopes, and **Reconnect / Disconnect**. Disconnect uses friction proportional to consequence and names the consequence (`Disconnecting Oura will stop new recovery data. Your history stays.`) — Apple "possible but never accidental" *[CPO Taste §3 Apple; account-deletion copy precedent]*.

---

## 4. Coach-Per-Client View (Detailed)

The coach's job is triage across 10–40 clients, then deep diagnosis on the one that needs it *[CPO Brief §2 ICP]*. The view is built around **Linear-grade density without clutter** — every cell earns its place *[CPO Taste §3 Linear]*.

### 4.1 How a coach sees all their clients (Client List)

- The list leads with **one primary signal per client**, not a tile grid — the CPO precedent ("lead with one primary insight: 'Maria is 2 sessions behind plan,' not a tile grid") applies directly *[CPO Taste §3 concrete call, Coach Brief]*.
- Each client row: avatar, name, and **one most-actionable line** generated by the coach AI (e.g. `Recovery down 18% this week` or `Closed all rings 6/7 days`). Rows are **sorted by actionability** (highest-confidence, highest-impact anomalies first) — anticipatory UX surfacing the work *[bible §4.6, §7.7 Layer 4]*.
- A small bucket-tint dot on each row indicates whether the actionable signal is Fitness (warm) or Recovery (cool), so the coach pre-reads the domain before tapping *[bible §1.2 Visceral, §4.7 color semantics]*.
- Miller cap: at most one primary line + at most 3 secondary glanceable stats per row; everything else is one tap deeper *[bible §4.3, §4.8 80/20]*.

### 4.2 Drilling into ONE client's H&F and S&R buckets (Client Detail)

- Client Detail opens to the **bucket the coach AI flagged as most actionable** for this client (default-state anticipation) *[bible §4.6]*, with the **`Fitness | Recovery` segmented switcher** at top — the identical control the client uses, so the coach builds one mental model *[bible §4.7]*.
- Within each bucket the coach sees the same chunked metric cards the client sees, **plus a coach-only anomaly band** (see §4.3). Visual register still follows the bucket (warm Fitness / cool Recovery) so the coach feels the domain shift *[§9; bible §2.3]*.
- One-sentence purpose holds: *"This screen is where a coach reads one client's [bucket]."* *[bible §4.8 one-thing test]*.

### 4.3 Pattern recognition surface (anomalies, trends, cohort comparisons)

This is competence feedback for the coach — surfacing **real change**, not vanity counts *[bible §3.7, §7.6]*. The anomaly band sits directly under the bucket hero:

- **Anomalies:** deviations from the client's own baseline (`Deep sleep down 40% vs their 30-day average`). Baseline-relative, framed as observation *[bible §3.7 "faster than 78% who started the same month"]*.
- **Trends:** directional movement over a chosen window (7/30/90d), shown as a scrubable Revolut-style chart (see §7) *[bible §2.3 tactile data]*.
- **Cohort comparisons:** the client vs. the coach's anonymized client cohort (`HRV in the bottom quartile of your clients`), engineered like Strava's local, winnable comparison — a cohort the coach can actually move, not a global leaderboard *[bible §3.2 local/winnable]*. Cohort comparisons are **coach-only**; clients never see ranked comparisons against other clients (no competitive rankings in a health context) *[bible §5.4 Health Tracking: "no competitive rankings"]*.

### 4.4 Coach AI panel placement (small, restrained, action-oriented)

- The coach AI panel is a **small card**, placed *below* the anomaly band on Client Detail and on Client Metric Detail — never a full-screen chat *[Scope §94 "small panel… NOT a full chat"]*, *[HANDOFF §coach-side]*.
- It is **progressively disclosed**: collapsed to a one-line headline observation by default; tap to expand the full structure (observation + hypothesis + suggested message + confidence) *[bible §4.5 progressive disclosure, §4.3 "small part of the page"]*.
- Restrained luxury: it adopts the active bucket's accent at low saturation, uses the shared type ramp, and carries no mascot, no badge, no playful motion *[CPO Taste §3]*, *[Scope §39]*. Polish here is core, not afterthought — insights design IS the feature *[bible §5.5 Anti-Pattern 7]*.

### 4.5 One-tap message-draft approval flow

The flagship coach interaction, taken from the user's own example *[HANDOFF Directive 5 coach example]*:

1. Coach AI panel shows: **observation** (`Lacking deep-wave sleep this week`) → **hypothesis** (`Possibly sleeping with lights on`) → **suggested message draft** (`Hey, I saw your sleep data this week — do you sleep with lights on?`) → **confidence** (`Fairly sure (70%)`).
2. Coach taps **Review message** → Message Draft Approval screen with the draft pre-filled, fully editable.
3. Coach can **Approve & send**, **Edit then send**, or **Dismiss**. **Never auto-send** *[HANDOFF §coach-side "Never: auto-send"]*, *[Scope §122]*.
4. Sending routes through the **existing MessagesModule** *[CPO Master Handoff §5]* — no new messaging surface (avoids complexity drift) *[CPO Brief §7 anti-pattern watch]*.
5. The send completion gets a real closure micro-interaction (`Sent to Maria` with a brief confirming animation), not an empty confirmation *[bible §5.5 Anti-Pattern 4, §5.1 Step 6]*.

---

## 5. Client-Side View (Detailed)

The client's emotional target is **self-knowledge + competence**, delivered without anxiety *[bible §5.4 Health Tracking, §2.2 CALM]*. The bucket pages ARE the home for the client AI *[HANDOFF Directive 5 "live on the new pages"]*.

### 5.1 Default landing for the client

- Opens to the **last-viewed bucket**, unless the most-actionable signal overrides (fresh overnight recovery drop, or a closable-rings day) — anticipatory default *[bible §4.6, §7.7 Layer 1]*. See §1.5.
- The bucket opens directly into its hero (rings for Fitness, recovery ring for Recovery) — 1–2 taps to the core surface, no chooser, no re-auth visible *[bible §7.7 Layer 1 "in motion within 3 seconds"]*.

### 5.2 Client AI panel placement (small, restrained, actionable)

- A **small card** on the bucket Overview (below the hero + primary cards) and on Metric Detail — never dominant, never a chat *[Scope §107 "small panel… NOT a full chat"]*, *[HANDOFF §client-side]*.
- Collapsed to a single observation line by default; expands to observation + norm comparison + intervention + CTA *[bible §4.5]*.
- In the **S&R bucket the panel inherits CALM**: cool low-saturation accent, slow reveal, copy that reassures before it informs (`You're close — about 45 min under your sleep need`) *[bible §2.2 CALM]*.

### 5.3 Closure design after viewing insights (forward hook)

Every insight session ends in an explicit, forward-looking closure — the emotional deposit that funds the next session, never a streak obligation *[bible §7.7 Layer 3 forward hook, §5.1 Step 7]*:

- After the client acts on (or dismisses) an insight, the panel resolves to a **forward hook**: `We'll check your REM tomorrow morning` or `You're 12% closer to your weekly move goal`. Natural, not urgent *[bible §7.7 "not urgently… naturally"]*.
- If the insight included a CTA (set a bedtime alarm, log mood, browse a sleep mask), completing it triggers a proportionate micro-celebration, then the forward hook *[bible §5.1 Step 6/7]*. This is the Strava closure model — design the memory, not just the moment *[bible §7.5, §7.7 Layer 3]*.

---

## 6. Embedded AI Design (Both Sides)

The embedded AI is the strategic heart of this expansion and is explicitly required on BOTH the coach and client sides, as a **small part** of the page *[HANDOFF Directive 5]*, *[Scope §80]*. Full prompt/schema/guardrail mechanics belong to Agent 2 / EMBEDDED_AI_SPEC; this section defines the **visual + interaction design** and the **language constraints**.

### 6.1 Coach AI panel — visual treatment & fields

- **Visual treatment.** Small card, bucket-tinted at low saturation, shared type ramp, no mascot/badge/playful motion *[CPO Taste §3]*, *[Scope §39]*. Collapsed = one-line observation; expanded = the four fields below. Polish is treated as core feature *[bible §5.5 Anti-Pattern 7]*.
- **Fields shown** (output schema, coach side) *[HANDOFF §architecture output schema]*:
  - **Observation** — what the data says (`Deep sleep down 40% vs baseline this week`).
  - **Hypothesis** — why it might be happening (`Possibly light exposure or late caffeine`). Coach-only field.
  - **Suggested message** — a ready-to-send draft (`Hey, noticed your deep sleep dipped — anything change in your evenings?`).
  - **Confidence** — calibrated label + % (see §6.3).
  - *(source_metrics shown as small tappable chips that deep-link to the metric detail, so the coach can verify the claim — Stripe "errors that teach / honesty" applied to AI)* *[CPO Taste §3 Stripe]*.
- **Interactions.** Tap to expand; tap a source chip to verify; **Review message** → approval flow (§4.5); dismiss collapses the panel for this sync cycle.

### 6.2 Client AI panel — visual treatment & fields

- **Visual treatment.** Same small-card system, bucket-tinted, CALM in S&R *[bible §2.2]*.
- **Fields shown** (output schema, client side) *[Scope §100, §120]*:
  - **Observation** — `Your REM came in at 15% of total sleep`.
  - **Norm comparison** — `Recommended is 20–25%` (compare to scientific norm, never to other people) *[bible §5.4 "no competitive rankings"]*.
  - **Intervention** — a specific, low-friction next action (`A sleep mask + a 'go to bed' alarm can help`) *[HANDOFF client example]*.
  - **CTA** — one-tap where appropriate (set bedtime alarm, log mood, view a recommended product). Fogg ability: the action must be ≤3 taps from the panel *[bible §7.4 ability imperative]*.
  - **Confidence** — calibrated label (§6.3).
- **Interactions.** Tap to expand; tap CTA to act; acting → micro-celebration → forward hook (§5.3).

### 6.3 Confidence-calibration display

The AI uses the **operator-comms confidence scale** as its public, user-facing calibration — this is a direct lift of the CPO confidence vocabulary into the product surface so the AI never overclaims *[CPO Comms §4]*, *[HANDOFF "Confidence calibration", Scope §113]*:

| Label | Probability | When the AI uses it |
|---|---|---|
| **I think** | ~50% | Single noisy signal; alternative is silence. Pairs with what would raise certainty. |
| **Fairly sure** | ~70% | Reasoning sound; a key assumption unverified (names it). |
| **Confident** | ~85% | Key path verified; not full coverage. |
| **Certain** | ~95% | Full coverage on the relevant metric surface. |
| **Verified** | 100% | A measured fact quoted from the data (e.g. exact sleep minutes). Only used when quoting the number. |

Display rules: the label renders as a small, **unobtrusive** chip on the panel (`Fairly sure · 70%`), never a loud badge. Default to the weaker word and earn the stronger one with evidence *[CPO Comms §4 "default to the weaker word"]*. The chip color is neutral, never green-for-good (confidence is not endorsement) *[bible §4.7 color semantics]*.

### 6.4 NEVER-medicalize language constraints (with concrete examples)

The AI must phrase everything as **observation + suggestion**, never diagnosis or treatment *[HANDOFF §coach-side "Never medicalize", Scope §115]*. Concrete constraints:

| Forbidden (medicalized) | Required (observation + suggestion) |
|---|---|
| "You have sleep apnea." | "Your blood oxygen dipped several times overnight — worth mentioning to a doctor if it continues." |
| "This indicates AFib / arrhythmia." | "Your overnight heart rate looked irregular on 2 nights this week." |
| "You're overtrained and need rest." | "Your recovery has trended down 3 days running — you might ease today's intensity." |
| "This will cure your insomnia." | "A consistent bedtime often helps sleep onset — want to set a wind-down alarm?" |
| "You are depressed / your HRV proves stress." | "Your HRV is below your usual range this week." |
| "Diagnosis: low deep sleep disorder." | "Deep sleep was lighter than your average this week." |

Hard rules enforced in copy review: **no diagnosis nouns** (apnea, arrhythmia, insomnia, depression, disorder), **no treatment/cure verbs**, **no "you have/you are [condition]"**, and any blood-oxygen/heart-irregularity observation **must** append the soft clinician-referral suffix. These mirror the bible's "treat error states / sensitive moments as trust-building, never alarming" principle applied to health language *[bible §2.2]*, and the CPO refusal to overclaim *[CPO Comms §4]*.

### 6.5 Approval workflow for coach-side message sending

As detailed in §4.5: **never auto-send** *[Scope §122]*; coach always reviews; sending routes through the existing MessagesModule *[CPO Master Handoff §5]*; an audit log records every insight shown and every message sent (for trust/debugging) *[Scope §123]*. The approval screen names the recipient and the send is a real closure moment *[bible §5.1 Step 7]*.

---

## 7. Decacorn Design Doctrine Applied (Per Bible)

### 7.1 Don Norman's 3 levels *[bible §1.2]*

- **Visceral (color/typography/space).** First-50–200ms judgment. H&F warm energetic gradient + Recovery deep calm gradient must read "premium, careful team" instantly *[bible §1.2 Visceral, §2.3]*. Type ramp, motion easing, and material (gradient depth, ring rendering) carry this. The two buckets each produce a distinct, intentional first-glance feeling (§1.3, §9).
- **Behavioral (interaction feedback).** Competence engineering — scrubable charts respond under the finger, ring closes with spring physics + haptic, segment switch cross-fades, every sync resolves without blocking *[bible §1.2 Behavioral, §2.3 tactile data, §7.2]*. The user (and coach) feels capable because the product responds correctly to intent.
- **Reflective (competent + cared-for).** After using this, does the client feel *both* competent (I understand my recovery and what to do) and cared-for (my coach is watching, the app is on my side)? The forward-hook closures (§5.3), the calm framing of deficits (§6.4), and the coach's human-approved messages (§4.5) are all engineered so the answer is yes — moving users into the reflective/identity layer ("I sleep better now") *[bible §1.2 Reflective, §7.8]*.

### 7.2 Apple cognitive de-load *[bible §4.1–4.8]*

- **Smart defaults.** Auto-detect provider type and **auto-assign each metric to its bucket** via the canonical map (§1.6) — the user never picks a bucket *[bible §4.4 smart defaults, §7.2]*. Units/timezone inferred from locale + server-authoritative time *[bible §4.4]*, *[CPO Brief R16]*. Default landing bucket inferred from history (§1.5).
- **Progressive disclosure.** Each bucket overview shows only primary cards; advanced metrics (e.g. respiratory rate, temp deviation, HR-zone breakdown) live one tap deeper in Metric Detail *[bible §4.5, 20% rule]*. The AI panel is itself progressively disclosed (collapsed → expanded) *[bible §4.5]*.
- **Miller's 5±2 caps per pane.** Each bucket overview caps at ≤5 primary chunked cards; the client-list row caps at 1 primary + ≤3 secondary stats; the OAuth sheet is one decision *[bible §4.3]*, *[CPO Brief §7]*. Provider lists are chunked by bucket to stay within budget even at 20+ providers (§3.6).

### 7.3 Phantom CALM applied to S&R *[bible §2.2 CALM]*

Sleep data is anxiety-loaded *[HANDOFF Quality Bar]*. The S&R bucket applies CALM at every deficit moment:
- **C — Clarity:** plain language, no jargon (`light sleep` not "N1/N2"); norms stated plainly.
- **A — Animation:** slow-breathing motion cadence (~480ms eases) that lowers the emotional baseline *before* a deficit is shown.
- **L — Light feedback:** warm reassurance at each step (`You're close` before the gap number).
- **M — Mascot presence:** **TGP has no mascot and will not add one** (restrained luxury, never playful) *[CPO Taste §3, Scope §39]*. The "presence" role is filled instead by the **calm, low-saturation, always-current recovery hero** and by the **coach's human-approved outreach** (§4.5) — the felt sense of "someone is with me through this" without a cartoon character. This is a deliberate adaptation of CALM's M to a restrained-luxury brand *[bible §2.2; constrained by CPO Taste §3]*.

### 7.4 Revolut tactile data + tier-differentiated polish in H&F *[bible §2.3]*

- **Tactile data:** the H&F trend charts use the Revolut **glow-drag** interaction — slow finger drag illuminates data points under a soft cursor; data the user has touched feels like *their* data *[bible §2.3 drag-to-explore]*. Workout cards render with material depth.
- **Tier-differentiated polish:** the two buckets are the "tiers" — same system, differentiated material/motion/luminance (§1.3, §9), exactly the Revolut Standard/Premium/Metal model *[bible §2.3, §5.4]*.

### 7.5 Apple Watch ring model where appropriate *[bible §3.6]*

- **H&F:** the activity three-ring (Move/Exercise/Stand) is the Fitness hero, with spark-on-close celebration and present-tense "close it today" framing (not loss-aversion) *[bible §3.6]*.
- **S&R:** **recovery/readiness score = a single ring** *[HANDOFF Quality Bar "Apple Watch ring model"; task §7]*. The open-loop closure drive is repurposed for recovery: a partially-filled ring communicates "almost recovered" with the same gestalt-of-incompleteness pull, but framed gently (recovery is not a chore to complete) *[bible §3.6]*.

### 7.6 Strava principle — design the activity, not the app session *[bible §7.5]*

Success is **better sleep and better recovery in the real world**, not dashboard opens *[HANDOFF Quality Bar "outcome not vanity"; bible §7.1, §7.5]*. Every feature must make the real behavior more likely to start, more rewarding in-context, or richer in memory afterward *[bible §7.5]*. The client AI's CTAs (set a bedtime alarm) lower activation energy for the *real* behavior; closures make the memory richer (§5.3).

### 7.7 Fogg ability/motivation/prompt for habit-loop interventions *[bible §7.4]*

- **Ability first.** Every client-AI intervention must be completable in ≤3 taps from the panel (set alarm, log mood) — reduce ability friction before adding motivation *[bible §7.4 ability imperative, §7.8]*.
- **Prompt typing.** Time-aware nudges use the right Fogg prompt: **Spark** for disengaged clients (`Your recovery's been climbing — see what's working`), **Facilitator** for high-motivation/low-ability moments (pre-fill the bedtime alarm), **Signal** for active clients (`Last night's recovery is in`) *[bible §7.4 prompt table]*. Notifications are budgeted, one per day max, sent at the client's historically highest-engagement time *[bible §7.7 Layer 4]*, *[CPO Taste §3 notification carpet bomb]*.

### 7.8 Outcome metrics, not vanity *[bible §7.1, §7.6]*

Instrument and surface **real change**, not opens:

| Vanity (refuse) | Outcome (track + surface) |
|---|---|
| Bucket opens / sessions | Sleep-quality change over 30 days |
| AI panel views | Recovery-score trend (client baseline) |
| "Streak of checking recovery" | Habit-completion rate of accepted interventions |
| Coach dashboard opens | Client behavior change after coach outreach |

For every feature, the team writes both an engagement metric and an outcome metric; if it can't name the outcome metric, the feature isn't designed *[bible §7.1 outcome audit, §7.6]*.

### 7.9 Master Checklist applied (bible §5.1 + §6.2)

Applying the **Screen Design Protocol §5.1** and the **Master Checklist §6.2** to this expansion:

**Emotional Design** *[bible §6.2]*
- Emotional target defined per bucket (Fitness: capable; Recovery: reassured) — §1.1/§1.2.
- Every confirmation has a micro-interaction (message sent, CTA done, ring close) — §4.5, §5.3, §7.5.
- Peak moment designed (ring close in H&F; "all sources current + good recovery" in S&R) — §7.5.
- Explicit closure state with forward hook — §5.3.
- No mascot/character; CALM-M adapted to restrained luxury — §7.3.
- Every S&R anxiety moment has CALM treatment — §7.3.

**Behavioral Gamification** *[bible §6.2]*
- Target behavior defined in observable terms (workouts/week; sleep-quality change) — §7.8.
- Mechanic produces the real behavior, not a proxy — §7.6, §7.8.
- S-curve: active mechanics kept ≤4 (rings + competence trend + forward hook; **no points, no badges, no leaderboard for clients**) — §8.
- Any streak has forgiveness AND must map to a real outcome metric — §8.
- Competence signal present (trend vs. own baseline; recovery improving) — §4.3, §7.8.
- Competition (coach cohort only) is local + winnable; clients get none — §4.3.

**Cognitive Simplicity** *[bible §6.2]*
- Cognitive-load audit per screen; D-class elements removed — §3.4, §7.2.
- ≤5 actionable elements visible without scrolling per pane — §7.2.
- Primary path completable without secondary controls — §3.5.
- Progressive disclosure for advanced metrics + AI panel — §7.2, §6.
- Smart default in every non-trivial flow (bucket auto-assign, default landing) — §7.2.
- Interaction patterns consistent (one switcher, one connection pattern) — §1.4, §3.6.
- One-sentence description per screen — §3.
- New-user navigable in <3 min — §3.5, §5.1.
- Anticipatory element present (most-actionable default) — §1.5.

**Screen Design Protocol §5.1** is applied to each named screen in §3 (emotional target → primary path → load audit → Miller → Hick smart default → emotional confirmation → peak/end state).

---

## 8. Anti-Patterns Avoided (From Bible §5.5)

| Anti-pattern | How this UX avoids it | Cite |
|---|---|---|
| **Empty Confirmation** | Message-sent, CTA-completed, and ring-close all get dedicated micro-interactions + forward hooks; no static "done" text. | *[bible §5.5 AP4]* §4.5, §5.3 |
| **Permission-Front Onboarding** | HealthKit/OAuth requested **contextually**, only when the user chooses to connect a source — never at app open. | *[bible §5.5 AP1]*, *[CPO Brief R28]* §3.6 |
| **Inconsistency Tax** | **One** connection-management pattern and **one** bucket-switcher used across all 20+ providers and both sides (coach/client). | *[bible §5.5 AP5, §4.7]* §1.4, §3.6 |
| **Gamification Mismatch** | No badge/streak unless it maps to a real outcome metric; rings drive real activity, recovery ring frames real recovery; no client leaderboards. | *[bible §5.5 AP6, §7.6]* §7.8 |
| **Polish as Afterthought** | Insight design, state design, and the AI panels are treated as **core features** designed in parallel with function, not polish added at the end. | *[bible §5.5 AP7]* §3.4, §6 |
| **Feature Dump First Screen** *(bonus)* | No capabilities tour; features surface when relevant (empty-state value prompts, contextual connect). | *[bible §5.5 AP2]* §3.4 |
| **Unescapable Streak** *(bonus)* | No client streaks at launch; if added, forgiveness + outcome-mapping required. | *[bible §5.5 AP3, §3.4]* §8 |

> **Gamification stance (explicit).** For clients, the launch set is intentionally minimal: activity rings (completion drive) + competence trend + forward-hook closure. **No points, no badges, no leaderboards for clients** — health is a "no competitive rankings" domain *[bible §5.4]*, and the S-curve warns that >3–4 mechanics reverses engagement *[bible §3.3]*. Coach-side cohort comparison is the only ranked surface and it is local/winnable and coach-only (§4.3).

---

## 9. Restrained Luxury Theme (Bucket-Differentiated)

The theme is **one premium design language expressed in two tiers**, the Revolut tier-differentiation model *[bible §2.3, §5.4]*. Shared tokens guarantee zero re-learning cost *[bible §4.7]*; bucket accents guarantee each bucket's distinct emotional target *[bible §1.2, §5.1 Step 1]*.

### 9.1 H&F visual identity

- **Mood:** warm, energetic, motion-forward — Apple Fitness rings + Strava segments *[bible §5.4]*.
- **Accent:** subtle warm gradient (amber → ember), used on rings, primary CTAs, active segment.
- **Background:** light-to-mid luminance (energetic, daytime).
- **Motion:** quick spring (~280ms), spark-on-ring-close celebration *[bible §3.6]*.
- **Charts:** Revolut glow-drag, scrubable, material depth *[bible §2.3]*.

### 9.2 S&R visual identity

- **Mood:** calm, deep, slow-breathing — Apple Health sleep + Calm app *[Scope §39]*, *[bible §2.2 CALM]*.
- **Accent:** subtle cool/dark gradient (indigo → slate), low saturation.
- **Background:** deep / dark (restful, nighttime); dark-mode-as-premium-signal *[bible §2.3]*.
- **Motion:** slow ease (~480ms), breathing cadence; reveals are gentle, never abrupt.
- **Hero:** single recovery ring; reduced contrast; generous negative space.

### 9.3 Shared design tokens

| Token | Value / principle |
|---|---|
| **Spacing scale** | One consistent 4pt-based scale across both buckets *[bible §4.7]* |
| **Typography scale** | One type ramp (display / title / body / caption); weight communicates hierarchy, identical in both buckets *[bible §4.7 typography hierarchy]* |
| **Motion easing** | Shared easing *family*; buckets differ only in *duration* (H&F quick, S&R slow) — same curve language, tier-differentiated tempo *[bible §2.3, §4.7 animation easing]* |
| **Color semantics** | Identical in both buckets: one color = primary action everywhere; destructive, disabled, success consistent; accents are decorative-only and never carry semantic meaning *[bible §4.7 color semantics, §5.5 AP5]* |
| **Component vocabulary** | Same card, chip, switcher, AI panel, freshness indicator components — re-skinned by bucket accent, never re-built *[bible §4.7]* |
| **Iconography** | One restrained, consistent icon set; never cartoon, never playful *[CPO Taste §3, Scope §39]* |

### 9.4 Brand guardrails (hard)

- **NEVER cartoon, NEVER playful** — restrained, premium, calm-confident *[Scope §39, CPO Taste §3]*.
- No mascot (the bible's mascot lever is deliberately declined; CALM-M re-routed — §7.3).
- The fitness-conference-demo-proud test applies to every screen: would you be proud to demo this to a 20-year-veteran skeptic on a 60-inch screen? *[CPO Taste §3 conference test]*.
- Density target: Linear-grade — every cell earns its place; if it looks busy, it is busy *[CPO Taste §3 Linear]*.

---

## 10. Open Questions for Synthesis (Hand to Coordinator)

These are the items I could not lock alone, flagged with calibrated confidence *[CPO Comms §4]*.

### 10.1 Design tradeoffs I couldn't fully resolve

1. **Tab vs. switcher (Confident · 85%).** I recommend the buckets as a **segmented switcher inside one `Health` tab**, not two new tabs, to preserve the 4-tab cap *[CPO Taste §3, bible §4.3]*. The residual risk: the user directive says "split the *pages* into two buckets visually" *[Scope §6]* — a coordinator may read "pages" as "tabs." If a true tab split is required, we'd need to demote an existing tab into a "More"/Hub (Revolut Hub model) *[bible §2.3]* to stay ≤5. **Needs a coordinator call.**

2. **CALM-M with no mascot (Fairly sure · 70%).** I routed the CALM "Mascot presence" requirement *[bible §2.2]* into the calm hero + human coach outreach instead of adding a character, because restrained-luxury forbids playful mascots *[CPO Taste §3]*. This is a defensible adaptation but it is the one place where two source doctrines (bible CALM vs. CPO taste) are in tension. **Confirm the no-mascot adaptation is acceptable.**

3. **Client gamification floor (Confident · 85%).** I deliberately ship clients **no points/badges/leaderboards**, only rings + competence trend, per the health "no competitive rankings" rule and the S-curve *[bible §5.4, §3.3]*. If product wants more engagement mechanics, that's a deliberate S-curve risk to take knowingly. **Confirm minimal gamification is acceptable.**

4. **Dual-provider dedup display (Fairly sure · 70%).** When a client has Apple Watch + Garmin both reporting HR/sleep, the UX shows one deduped value but I have not specified *which source wins* or whether the user can pick a preferred source per metric. I lean toward an auto "best source" default with an advanced per-metric override behind progressive disclosure *[bible §4.5]*. **Needs a data-precedence rule (overlaps with Agent 2).**

### 10.2 Data/UX dependencies needing Agent 2's coding-plan answer

- **Canonical schema shape (blocking).** The bucket UIs render the canonical schema (§2.3), not provider payloads. The UI cannot be finalized until Agent 2 confirms the foundation PR's canonical metric schema + the `dedup_group` and `night_of` resolution rules. **The foundation PR must land first** *[HANDOFF Build Locks, Scope §78]*.
- **Freshness/webhook capability per provider.** The freshness chip states (§2.4) assume some providers push (webhooks) and others poll. Agent 2's PROVIDER_MATRIX determines the *real* freshness granularity per provider; copy ("Synced 2h ago") must match actual sync cadence, or it becomes a lying indicator.
- **Insights endpoint shape.** The AI panels (§6) consume the `{observation, hypothesis, suggested_action, suggested_message_draft, confidence_level, source_metrics[]}` schema *[HANDOFF §architecture]*. Agent 2 owns the endpoint, caching (6h), and audit log; the panel's collapsed/expanded design assumes that exact field set.
- **MessagesModule integration.** The approval flow (§4.5) routes through the existing MessagesModule *[CPO Master Handoff §5]*. Agent 2 must confirm the draft→send hook exists or is in scope; **note the unaudited IDOR hunch on MessagesModule** *[CPO Master Handoff §6.2]* — any new message path must be RLS/ownership-checked.
- **Server-authoritative time + RLS.** All timestamps server-authoritative *[CPO Brief R16]*; all new health tables need RLS from day one given the 50-table RLS crisis and App-Store-reviewer probing of health apps *[CPO Brief §5]*. PHI-adjacent health data raises the bar.

### 10.3 Recommended PR sequence (UX-readiness perspective)

From a UX-readiness standpoint, the order that unblocks the most design fastest *[bible foundation-first; HANDOFF Build Locks]*:

1. **Foundation PR** — canonical schema + ingestion abstraction + bucket mapping (§1.6, §2.3). *Unblocks everything; no UI can be final without it.*
2. **Connection management UI** — Connections Hub + Add Source + OAuth sheet + freshness (§3.6). *One pattern; can be designed/built against the schema before all connectors exist; lets QA connect at least HealthKit + Oura early.*
3. **Per-provider connectors** — parallel, file-disjoint, one PR each (Agent 2's domain). *UI is provider-agnostic, so connectors land behind the already-shipped connection UI.*
4. **Bucket UI — Fitness** then **Recovery** (independent PR streams to avoid rebase collisions per Scope §44). *Build H&F first (simpler metrics, ring model is well-trodden); Recovery second (CALM + recovery-ring needs more design care).*
5. **Embedded AI foundation** (insights service, schema, caching, audit log) — Agent 2.
6. **Coach AI panel** → **Client AI panel** → **message-draft→approval flow** (last, depends on MessagesModule + insights). *The flagship interaction (§4.5) lands last because it depends on the most upstream pieces.*

> Rationale for H&F-before-S&R: H&F leans on the well-understood Apple ring model *[bible §3.6]* and lighter emotional stakes; S&R requires the full CALM treatment *[bible §2.2]* and the recovery-ring adaptation, which benefits from H&F's component vocabulary already being shipped (zero re-learning, faster build) *[bible §4.7]*.

---

## Appendix A — Screen Design Protocol Walkthroughs (bible §5.1)

The bible mandates running the 7-step Screen Design Protocol before any screen ships *[bible §5.1]*. Below it is applied to the four highest-stakes screens in this expansion. Each step: (1) emotional target, (2) primary path, (3) cognitive-load audit, (4) Miller, (5) Hick + smart default, (6) emotional confirmation, (7) peak + end state.

### A.1 Recovery Overview (client) — the most anxiety-loaded screen

1. **Emotional target:** *reassured, then informed.* The user leaves feeling "I understand last night and I'm okay" — not "I failed at sleep" *[bible §5.1 Step 1, §2.2 CALM]*.
2. **Primary path:** glance the recovery ring → (optional) read one driver → (optional) act on the AI CTA. The 70–80% path is *glance the ring and feel oriented* *[bible §4.4]*.
3. **Cognitive-load audit:** hero + 4 cards + 1 collapsed AI panel. No decorative dividers, no vanity counters; every element earns its place *[bible §4.2 D-class removal]*. Advanced metrics (SpO2, temp deviation) are NOT on this pane — they live in Metric Detail *[bible §4.5 20% rule]*.
4. **Miller:** 5 primary chunks (ring + 4 cards). AI panel progressively disclosed, off the cap *[bible §4.3]*.
5. **Hick + smart default:** the deduped "best source" is pre-selected; the user never picks a provider to see their recovery (smart default) *[bible §4.4]*. No competing CTAs on the pane.
6. **Emotional confirmation:** acting on a CTA (e.g. set a wind-down alarm) yields a small confirming animation + forward hook (§5.3) *[bible §5.1 Step 6]*.
7. **Peak + end state:** peak = "recovering well" days render the ring at full with a gentle (not loud) glow; end state is the forward hook `We'll check your REM tomorrow` *[bible §5.1 Step 7, §7.7 Layer 3]*.

### A.2 Message Draft Approval (coach) — the flagship trust moment

1. **Emotional target:** *confident control.* The coach leaves feeling "I sent something thoughtful, in my voice, on purpose" *[bible §5.1 Step 1]*.
2. **Primary path:** read the draft → Approve & send. Edit and Dismiss are visible but de-emphasized *[bible §4.4 primary path]*.
3. **Cognitive-load audit:** recipient header + editable draft + confidence chip + 3 actions. Nothing else *[bible §4.2]*.
4. **Miller:** 3 actions (Approve & send / Edit / Dismiss) — well within budget *[bible §4.3]*.
5. **Hick + smart default:** the draft is pre-filled (the AI did the work); the default action (Approve & send) has the strongest visual weight *[bible §4.4 smart default, §7.4 facilitator]*.
6. **Emotional confirmation:** `Sent to Maria` with a brief confirming animation — never an empty static confirmation *[bible §5.5 AP4, §5.1 Step 6]*.
7. **Peak + end state:** peak = the send moment; end state returns the coach to Client Detail with the AI panel now showing `Message sent · awaiting reply` (closure + forward hook) *[bible §5.1 Step 7]*.

### A.3 Provider OAuth Sheet — the contextual-permission moment

1. **Emotional target:** *safe and clear.* "I know exactly what I'm sharing and why" *[bible §2.2 CALM Clarity]*.
2. **Primary path:** read the one-line data statement → Authorize *[bible §4.4]*.
3. **Cognitive-load audit:** brand header + one plain-language statement + one button. Zero jargon, zero scope-list overwhelm on the first screen (scopes are one tap deeper) *[bible §4.5, §2.2]*.
4. **Miller:** 1 decision *[bible §4.3 onboarding 1 concept]*.
5. **Hick + smart default:** reached only when the user already chose this provider — contextual permission, never front-loaded *[bible §5.5 AP1]*, *[CPO Brief R28]*.
6. **Emotional confirmation:** on grant, a warm `Oura connected — pulling your last 30 days` (names the backfill so the wait is explained) *[bible §2.1 show-the-payoff, §2.2]*.
7. **Peak + end state:** end state routes back to Connections Hub with the new source showing a `Syncing…` shimmer, not a dead screen *[bible §7.2]*.

### A.4 Client List (coach) — the triage surface

1. **Emotional target:** *in command.* "I can see at a glance who needs me today" *[bible §5.1 Step 1, CPO Taste §3 Linear]*.
2. **Primary path:** scan the top of the actionability-sorted list → open the client that needs attention *[bible §4.6]*.
3. **Cognitive-load audit:** one most-actionable line + ≤3 glance stats per row; no tile grid, no filler cells *[CPO Taste §3 Everfit density refusal]*.
4. **Miller:** per-row chunk ≤ 4 items (insight + 3 stats); the list itself is scannable because rows are uniform *[bible §4.3]*.
5. **Hick + smart default:** default sort is actionability (the AI decides order), so the coach's first tap is usually correct — anticipatory *[bible §4.6]*.
6. **Emotional confirmation:** opening a client is instant (optimistic cache) so the coach never waits *[bible §7.7 Layer 1]*.
7. **Peak + end state:** the peak is finding the one client who needs help; the list is a means, not a destination — Strava principle, the value is the coaching action it enables, not time in the list *[bible §7.5]*.

---

## Appendix B — Metric Detail deep-dive (both sides)

Metric Detail (`AppTabs/Health/metric/:metricId` client; `.../:clientId/metric/:metricId` coach) is where progressive disclosure pays off — it holds the depth that the Overview panes deliberately hide *[bible §4.5]*.

```
[header]    Metric name · current value · unit (locale smart-default §4.4)
[chart]     Scrubable trend (glow-drag in H&F; slow-reveal in S&R) §7.4
              └ window toggle: 7d | 30d | 90d (one chunk, not 3 buttons fighting)
[stat row]  baseline · best · vs-baseline delta  (competence feedback §3.7)
[card]      Drivers / context (e.g. for sleep: bedtime consistency, late caffeine)
[panel]     AI insight scoped to THIS metric (collapsed by default §6)
[source]    Source chips — which provider(s) reported this; dedup note if overlapped
```

- **Competence, not vanity.** The stat row surfaces *real change* against the user's own baseline (`+8% vs your 30-day average`), the Peloton/Garmin competence-feedback model *[bible §3.7]*, never a streak count *[bible §7.6]*.
- **Tactile data.** The chart is the Revolut glow-drag in H&F (energetic) and a slow-reveal in S&R (calm) — same interaction grammar, tier-differentiated tempo *[bible §2.3, §4.7]*.
- **Verify-the-AI.** Source chips let the user/coach trace any AI claim back to the underlying provider data — Stripe honesty applied to AI *[CPO Taste §3, §6.1]*.
- **Scope override (open question 10.1.4).** If multiple providers overlap, an advanced "preferred source" control lives behind one tap here, not on the Overview *[bible §4.5]*.

---

## Appendix C — Copy library (restrained-luxury voice)

Voice = calm-confident, plain-language, never playful, never alarming *[CPO Taste §3, Scope §39, bible §2.2]*. Reference samples that downstream builders must match:

| Moment | Copy | Why |
|---|---|---|
| Empty (no source) | `Connect a wearable to see your recovery` | value-first, payoff before effort *[bible §5.2]* |
| First sync | `Pulling your last 30 days from Oura…` | explains the wait, names backfill *[bible §7.2]* |
| Stale | `Last synced yesterday` | soft, not error *[bible §2.2]* |
| Reconnect | `Reconnect Oura to keep your recovery current` | says what + what-to-do *[CPO Taste §3 Stripe]* |
| Disconnect | `Disconnecting Oura stops new recovery data. Your history stays.` | names consequence, Apple friction-proportional *[CPO Taste §3]* |
| Sleep deficit (client) | `You're close — about 45 min under your sleep need` | reassure before inform, CALM *[bible §2.2]* |
| Recovery good | `You're recovering well — a good day to push` | competence + forward orientation *[bible §3.6]* |
| Coach observation | `Deep sleep down 40% vs baseline this week` | baseline-relative, observation-only *[bible §3.7, §6.4]* |
| Sent | `Sent to Maria` | real closure, not "Action complete" *[bible §5.5 AP4]* |
| Blood-oxygen note | `Your blood oxygen dipped a few times overnight — worth mentioning to a doctor if it continues` | never-medicalize + soft referral *[§6.4]* |

---

## Appendix D — Notification & habit-loop strategy (Fogg + outcome-first)

Notifications are the prompt half of Behavior = Motivation × Ability × Prompt *[bible §7.4]*. They are **budgeted, max one per day, sent at the user's historically highest-engagement time**, and never duplicated — refusing the Slack carpet-bomb anti-pattern *[CPO Taste §3, bible §7.7 Layer 4]*.

### D.1 Client notifications (by Fogg prompt type)

| Trigger | Prompt type | Copy | Rationale |
|---|---|---|---|
| Overnight sync done, recovery good | **Signal** (motivation+ability high) | `Last night's recovery is in` | active user, no manipulation needed *[bible §7.4]* |
| Recovery trending up after a slump | **Spark** (motivation low) | `Your recovery's climbing — see what's working` | emotionally resonant re-engagement, never shaming *[bible §7.4]* |
| Intervention available, low effort | **Facilitator** (ability low) | `One tap to set tonight's wind-down alarm` | pre-fills the action, reduces ability friction *[bible §7.4]* |
| New workout auto-detected | **Signal** | `Your run synced — nice work` | competence acknowledgement *[bible §3.7]* |

No loss-aversion or streak-threat notifications (`You haven't checked your sleep in 3 days`) — those drive opens, not outcomes, and trip the streak-trap *[bible §3.4, §7.6]*.

### D.2 Coach notifications

- **Budgeted digest, not per-event.** One daily digest: `3 clients need attention today` linking into the actionability-sorted Client List — not one push per client anomaly *[CPO Taste §3 carpet-bomb refusal]*.
- **High-confidence escalation only.** A real-time push fires only for a `Certain`/`Verified` *[§6.3]* high-impact anomaly (e.g. sustained overnight HR irregularity) so the channel stays trusted *[bible §7.7 Layer 4]*.

### D.3 The habit loop this builds

Trigger (time-aware prompt) → Action (≤3-tap intervention) → Variable-magnitude reward (real recovery/fitness improvement, which varies naturally) → Investment (the client's accumulating baseline + the coach relationship) *[bible §3.5 Hooked, §7.4]*. The reward engine is **anticipatory** (better sleep is coming), not anxiety-based (don't lose your streak) — the engine that recharges rather than depletes *[bible §3.5]*.

---

## Appendix E — Accessibility, internationalization & edge cases

Decacorn quality includes the cases most teams skip. These are part of the floor, not polish *[bible §5.5 AP7, CPO Taste §3 conference test]*.

### E.1 Accessibility

- **Color is never the only signal.** Bucket accents (warm/cool) are decorative; status is always carried by text + icon as well, so color-blind users and the semantic color system both hold *[bible §4.7 color semantics]*. Ring progress carries a numeric label, not just arc fill.
- **Motion sensitivity.** The breathing/slow-reveal S&R motion and the H&F spring respect the OS reduce-motion setting; celebrations degrade to a static state without losing the closure meaning *[bible §4.7, §7.7]*.
- **Dynamic type.** The shared type ramp (§9.3) scales with OS text-size; cards reflow vertically (already a vertical stack) so no truncation — explicitly refusing the Trainerize label-truncation failure *[CPO Taste §3]*.
- **Contrast.** S&R's deep/dark background must still clear contrast minimums for body text; low-luminance is achieved with desaturated accents, not by dropping text contrast *[bible §2.3 dark-mode-as-premium]*.

### E.2 Internationalization

- **Units are a smart default, never a question.** Distance, weight, and temperature units infer from locale; the user is never asked to pick *[bible §4.4 smart defaults, CPO Brief §7]*. An override lives in advanced settings only.
- **Relative time is localized.** `Synced 2h ago` localizes; absolute timestamps are server-authoritative to avoid client-clock drift on freshness *[CPO Brief R16]*.

### E.3 Edge cases (designed, not deferred)

| Edge case | Design response | Cite |
|---|---|---|
| Client connects zero providers | Value-first empty state per bucket; coach sees `No data sources connected` with a one-tap `Invite to connect` | *[bible §5.2]* §3.4 |
| Provider returns partial night (no stages) | Show duration; stage card shows `Stages unavailable from this source` — honest, not a broken chart | *[bible §2.2]* |
| Two providers disagree on the same metric | Dedup to best-source default; Metric Detail discloses the conflict + lets coach/client see both | *[Scope §75]* §Appendix B |
| Backfill still running on first open | Skeleton layout + `Pulling your last 30 days…`; bucket is interactive with whatever has landed | *[bible §7.2]* §3.4 |
| Token expires mid-session | Soft reconnect chip on the affected bucket; last-known data stays visible | *[bible §2.2]* §3.4 |
| Client revokes data sharing | Coach view shows `Sharing paused by client` — never silently shows stale data as current | *[CPO Comms §4 honesty]* |
| AI has insufficient data | Panel collapses to `Not enough data yet for an insight` — invisible by design | *[bible §4.5, §5.5 AP4]* §3.4 |

---

*End of Agent 1 UX Plan. Companion: AGENT_2_CODING_PLAN.md (pending). Synthesis: UNIFIED_BUILD_PLAN.md (coordinator).*
