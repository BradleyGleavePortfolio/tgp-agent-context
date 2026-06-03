# TGP Community Expansion — Centralized Product Plan

**Author:** Dynasia G
**Date:** 2026-06-02
**Status:** Plan only — not yet engineered
**Companion docs:**
- `_step0_deliverable.md` — integrations + backlog gap
- `_slack_skool_sentiment_research.md` — Slack/Skool user sentiment
- `_app_integrations_inventory.md` — 69-row catalog
- `EXHAUSTIVE_BACKLOG.md` — 150+ items, all 10 cycles

---

## 0. North star

**TGP Community = the place a client opens five times a day to feel seen, accountable, and forward-moving on their plan — without ever feeling like they are inside a Slack workspace or a noisy Facebook group.**

It is *not* a chat product. It is a **coaching loop with messaging primitives**, where every message, post, and reaction is a signal that informs the next coach action and the next client behavior.

The client's bottom-tab order (Bradley's stated priority) becomes:
1. **Home** — calm daily summary (today's workout, today's macros, the one prompt the coach left)
2. **Food** — meal logging
3. **Workout** — workout tracking
4. **Coach AI** — AI guide chat (Perplexity Sonar today)
5. **Community** — *this feature*

Plus a coach context that mirrors this on the coach side, with admin and member-health overlays.

---

## 1. Bradley's idea — verbatim

> Community tab — meant for 1:1 communication, channels, and "whole coach" chats.

This is correct and ships the 80%. The next sections expand each pillar with research-grounded improvements.

---

## 2. Improvements (my additions, before research)

### 2.1 Replace "channels" with **Spaces** — three fixed types, not infinite Slack channels

Slack's #1 complaint is channel sprawl ([Reddit r/Slack](https://www.reddit.com/r/Slack/comments/1hqbyoc/), [Capterra](https://www.capterra.com/p/135003/Slack/reviews/)). Skool's #1 strength is "few obvious tabs" ([BloggingX](https://bloggingx.com/skool-review/)). We resolve this by *not* letting members or coaches make arbitrary channels.

**The 3 Space types:**

| Space type | Who creates | Cardinality | Example |
|---|---|---|---|
| **The Lab** | Auto, one per coach | 1 per coach | "Coach Sara's Lab" — the whole-coach broadcast feed |
| **Cohort** | Coach, scoped to a program/cycle | Up to N per coach (config) | "12-Week Cut — Jan Wave", "Beginner Strength — Q1" |
| **Direct** | Anyone | 1 per pair / small group | 1:1 client↔coach, or small client pods |

A coach who wants more granularity uses **topic threads** inside a Cohort, not a new channel. This caps the visible surface at ~3 + (cohorts they belong to) + (DMs they have) — typically 5–15 items, never 50+.

### 2.2 Every message lives on a **timeline of the client's plan**, not in a chat blob

A message in Cohort or DM is tagged with one of: `general`, `check-in`, `workout-feedback`, `nutrition-feedback`, `form-check`, `event`, `win`. This tag is automatic when posted from a contextual surface (e.g. "send to coach" from the workout completion screen pre-tags `workout-feedback`).

The "Plan View" tab inside any Space lets coach and client *re-thread* a conversation by week, by workout, or by check-in. This is the **anti-Slack** move: messages don't disappear into a stream, they become artifacts of a coaching arc.

### 2.3 **The Lab** is a *post*, not a chat

The whole-coach broadcast is structurally different from cohort/DM. It is a Post-style feed (Skool/Geneva pattern), where:
- Coach posts a video / text / poll / event card
- Clients comment, react, share their progress in response
- Replies surface as threaded responses, not as a stream
- All posts have a configurable retention window (default: forever; coaches can set 30/90/365 days)

This eliminates the Skool complaint that "everything is one running thread" ([Mighty Networks comparison](https://www.mightynetworks.com/resources/skool-vs-circle)).

### 2.4 **Coach acknowledgement signals** — the explicit "seen" without full read receipts

The single most repeated Slack pain point: "did anyone see my message?" ([Reddit](https://www.reddit.com/r/Slack/comments/1hqbyoc/)). We solve it WITHOUT classic read receipts (which create anxiety on both sides):

- **`👀 Coach saw this`** — auto-appears when coach opens the thread for ≥3s
- **`💪 Coach acked`** — coach taps once to send a passive ack (auto-emoji)
- **`🎯 Coach replied`** — auto-promotion when coach types anything
- **Coach response SLA badge** — "Sara typically replies in 4h" — set per coach, surfaces on client side, manages expectation

These are coach-side-only signals. Client-side is private — coach does NOT see "client read your message at 2:14 AM."

### 2.5 **Time-locked content** — coach-released, no scrolling ahead

Sessions, lessons, events, and check-in prompts are time-released per-client on their program timeline. This eliminates "I scrolled to week 8 already" and makes the feed feel like a coach is dosing it. Skool's calendar-as-feed pattern, but personalized.

### 2.6 **The "today" object** — the universal home for everything happening for *me*

Every space has a per-client "Today" view that aggregates:
- Today's workout (linked from workout tab)
- Today's macros progress (linked from food tab)
- The 1 post / 1 event / 1 prompt from the coach today
- 0–3 cohort posts ranked by personal relevance (not chronological)

This is the **Calm Homepage** Bradley already specified for the home tab — replicated as a "what's mine today" inside Community. The two views share the same data engine.

### 2.7 **Opt-in challenges, not always-on leaderboards**

Skool leaderboards are praised when tied to perks, criticized when shallow ([BloggingX](https://bloggingx.com/skool-review/), [LinoDash](https://linodash.com/skool-review/)). We default to:
- **No public ranking visible by default**
- Coach creates a *Challenge* (7-day step streak, weekly compliance, photo-log streak, etc.)
- Members opt in; only opted-in members see the ranking
- Rewards are coach-defined (free week, merch credit, 1:1 call) — never platform-imposed

### 2.8 **Wearable-aware coach prompts**

Once Finding 1 is patched, every cohort post can include a tiny biometric callout: *"3 of you slept under 6h last night — take it easy on volume."* Coach can opt this in per-cohort. This is the moat — no Slack, no Skool, no Geneva can do this. It's why fixing the HK ingest gap before community launch matters.

### 2.9 **Coach AI as a first-class community participant**

Coach AI (Claude) can be:
- Tagged in a thread (`@coachAI`) for a quick form-check or macro-math
- Configured to auto-summarize a cohort's week ("3 PRs, 2 missed sessions, 1 nutrition win")
- Used by the coach to draft a reply they then edit (already exists in Coach Brief — extend to inline)

Critically: Coach AI never replies *as the coach* without coach approval. The model is "co-pilot in the thread," not "ghost-write the coach."

### 2.10 **No member-to-member DM by default in free programs**

DM spam is Skool's biggest member complaint ([YouTube](https://www.youtube.com/watch?v=EmBL03tWp7M)). Default rule: clients can DM the coach freely; client-to-client DM requires either (a) the coach enables it for the cohort or (b) both clients are at a cohort tier where DM is unlocked (gamification reward).

---

## 3. Refinement — what the research changes

After reading both pros and cons of Slack/Skool, the following ten implications get folded in:

| Implication (from research) | How the plan handles it |
|---|---|
| 1. 3 fixed spaces, not infinite channels | §2.1 — The Lab, Cohort, DM. No user-created channels. |
| 2. Explicit coach ack without full read receipts | §2.4 — `👀 saw / 💪 acked / 🎯 replied` |
| 3. Threads first-class on mobile | Threads get their own swipe stack on mobile (full-screen, not a side panel) |
| 4. Coach-configured notifications by program rhythm | §3.1 below |
| 5. No public leaderboard by default | §2.7 — opt-in challenges only |
| 6. Events as first-class feed objects | §3.2 below |
| 7. Classroom + community as a single loop | §3.3 below — lessons are pinned posts inside cohorts |
| 8. Intent-driven search | §3.4 below |
| 9. DM spam protection | §2.10 |
| 10. Coach admin controls before customization | §3.5 below |

### 3.1 Notification model — coach-configured, member-tweakable

Three default modes, set by **coach per cohort**:
- **Daily Pulse** — one batched 7am/7pm digest. The plan-aware default for habit/nutrition cohorts.
- **Live Cohort** — real-time for cohort + DM; muted for The Lab. Default for active training blocks.
- **Quiet Cohort** — push only for: (a) @mentions, (b) coach posts, (c) urgent events. Default for taper/recovery weeks.

Members can override (`More like daily pulse`, `Less for this thread`) but **cannot** disable coach DMs. Coaches can set "do not disturb" hours that auto-quiet *both* sides — protects coach from 3am crisis pings and protects client from coach's late-night replies if they don't want them.

### 3.2 Events — first-class feed object with five states

Every event has a card that travels through five states:
1. **Scheduled** — created, RSVP open, visible in Today + Calendar
2. **Tomorrow** — auto-promoted, push reminder, "8 of 12 RSVP'd"
3. **Live** — entry button at top of Community tab, recording starts
4. **Replay** — Mux replay attached to the event card, transcript pending
5. **Reflected** — coach posts an "event recap" with attendance + 1-sentence summary

Replay state is permanent and discoverable in Plan View by week. This kills the Skool/Slack problem where "the call yesterday was great but no one can find it now."

### 3.3 Classroom-as-coaching-loop

Course lessons are not a separate tab. They are **pinned posts** inside the cohort, with:
- Video lesson (Mux, already wired)
- Inline `Mark complete` button → triggers a coach-customizable follow-up prompt
- Inline `Discussion` thread auto-created when first comment is added
- Inline quiz/checkin form (no quiz infra yet — Cycle 2)

This collapses Skool's "Classroom + Community" two-tab pattern into a single feed where the lesson IS the post.

### 3.4 Intent-driven search ("find" not "search")

Top of every Space, the search bar reads: **"What are you looking for?"**

Four big tap-shortcuts below:
- `My plan` — opens latest workout/nutrition assignment
- `Coach answer` — searches all coach replies to you ever
- `Recipe` — searches food posts + cohort recipe shares
- `Workout` — searches exercise library + past workout discussions

Free text falls back to Postgres FTS first; we add Meilisearch only when a single workspace passes ~20k messages.

### 3.5 Coach admin scaffolding (before customization)

Coach-facing community admin includes from day one:
- **Member health dashboard** — last active, message count this week, engagement score, churn risk (already in PR #264)
- **Cohort templates** — pre-built welcome flow, week-1 prompts, week-12 graduation
- **Topic templates** — coach-saved post drafts: "weekly check-in", "compliance celebration", "form check Friday"
- **Access control** — paid tier → which cohorts a client lands in, auto-grad on plan end
- **Moderation** — soft-mute (hides member's posts from feed but they can still post — kindest way to deal with sales spammers), hard-remove, report queue

No custom domains, no white-label, no custom CSS in v1. We earn those in v2 — Skool's mistake was leading with branding before earning trust.

---

## 4. Stress test — what breaks at scale or under abuse

### 4.1 Scale failure modes

| Failure | Trigger | Mitigation |
|---|---|---|
| **Realtime channel storm** | One cohort with 200 members all online during a live event → Supabase Realtime channel saturation | Shard cohort channels by event; fall back to push for non-live participants; rate-limit subscriptions per user (max 25 concurrent channels) |
| **Postgres write contention** on hot cohort | 50 clients posting simultaneously to "leg day Monday" | Move reactions to a separate counter table with periodic aggregation; batch insert posts behind a 100ms debounce on mobile |
| **Search collapses** at 100k+ messages per workspace | Coach with 3 cohorts × 100 clients × 12 weeks × ~30 msgs/wk = 108k msgs | Pre-emptive: build Meilisearch adapter behind a feature flag at v1; flip when first coach crosses 50k |
| **Push delivery lag** during live coach reply rush | Coach replies to 30 DMs in 5 minutes | Use Expo push priority field; collapse stale messages into "Sara replied to 4 of your threads" digest after 90s |
| **Mux storage cost spike** from voice notes + video posts | A single cohort posts 200 photos + 50 video reactions per week | Voice notes go to Supabase Storage (cheaper); video posts capped at 60s default + Mux per-coach budget alert at 80% |
| **Database row explosion** in messages table | Year 1 reaches 10M+ rows | Partition messages table by month from day one; archive >12mo to cold storage |

### 4.2 Abuse vectors

| Vector | Defense |
|---|---|
| **DM sales spam** (Skool's #1 member complaint) | §2.10 — DM-to-clients gated; report flow + soft-mute; coach-configurable spam keyword block |
| **Coach impersonation** (member changes display name to "Sara Coach") | Verified coach badge on every message + display-name-change cool-down + coach-name reservation per workspace |
| **Form-check photo abuse** (NSFW or non-fitness content posted) | All photo posts run through a moderation pre-check; coach review queue for first 3 posts of every new client |
| **Mass tagging / @everyone** | Default: @everyone restricted to coach role; clients can only @ within thread participants |
| **Doxxing / harassment in DMs** | Report → soft-mute → coach review; block list per client; "leave this DM" always available |
| **Off-platform recruitment / pyramid scheme** | Trust & safety lexicon scan on first 50 messages; auto-flag for coach review |
| **Brigading from one cohort into another** | Cohort membership is private; no cross-cohort search; coach can disable cohort-discoverability entirely |
| **Account sharing** (one paid seat, family of 3 using it) | Existing device-fingerprint signal in PostHog; surfaces in member-health dashboard; coach action, not platform action |

### 4.3 Coach burnout / overhead vectors

| Problem | Mitigation |
|---|---|
| Coach feels obligated to reply to every message at all hours | "Sara replies M–F, 8am–6pm PT" displayed on The Lab + DM banner; @mentions outside hours queue silently |
| Coach drowning at 100+ clients | AI inbox triage (FH.8) auto-sorts into: "urgent", "win to celebrate", "form check", "general", "no-action-needed" |
| Coach forgets to send weekly check-in | Cohort template auto-prompts coach on Sunday: "Your weekly check-in for *Cut Wave Jan* is ready to review and send" |
| Coach can't tell who's silently churning | Engagement score (PR #264) surfaces "Last week: 3 clients went quiet" on The Lab |

### 4.4 Product-shaped failure modes

| Failure | Why it could happen | Counter |
|---|---|---|
| Community becomes a chatroom — people post, coach can't keep up, vibe dies | We ship messaging primitives without the plan-anchoring | Plan View + tag system (§2.2) makes EVERY message into a coaching artifact, not a chat |
| Quiet cohorts feel dead, vibrant cohorts intimidate | No middle gear | Coach AI summary of the week + "what's coming up" event card provide structure even when human posting is low |
| Clients churn because they can't find their plan in the noise | Plan/calendar buried | "Today" view + intent search shortcut (§3.4 `My plan`) |
| Coach feels their content is competing with member posts | Open feed model | The Lab is *coach-only-post* by design; cohort feed is shared |

---

## 5. Premium UI plan — keeping it rewarding to use

The visual/interaction principles below sit on top of the existing TGP design system (assumed: SF Pro on iOS, system default on Android, tasteful animation, no skeuomorphism). We borrow what's premium from Apple Fitness, Linear, Things 3, Strava, and Stripe — not from Slack, Skool, or Discord.

### 5.1 Three calming layers

1. **Background canvas** — `bg-paper` (warm off-white in light, near-black with 2% warm tint in dark). Never pure white, never pure black. Solves the "Slack feels harsh and corporate" critique.
2. **Cards** — `bg-elevated` (subtle 4% lift), 16px rounded, no border — shadow only (`shadow-sm`). Each message bubble, post card, and event card uses the same primitive.
3. **Accents** — coach's chosen accent color (default: TGP signal-blue). Used sparingly: coach name, coach reactions, ack badges. Never used as a fill — outlines and text only.

### 5.2 Motion language

- **Slide-up** — opening a thread, opening a DM (200ms ease-out, spring damping)
- **Fade-in stagger** — feed cards load with 60ms stagger; max 5 cards animated, rest snap in
- **Heart pulse** — emoji reactions get a quick scale-pulse (Apple-style)
- **Coach reply animation** — coach reply slides in from below with a subtle accent-color underline flash; the *single* moment of celebration in the UI

### 5.3 Reward moments — what makes it feel "earned"

| Moment | What happens | Why it's rewarding |
|---|---|---|
| Coach replies to your DM | Push hits, opening the app shows your thread first, coach name pulses with accent | Slack-style "did anyone see this?" anxiety → resolved instantly |
| Cohort posts a win | Win card shows the client's progress photo + 1-line caption, reactions auto-suggested ("Proud of you", "Inspired") | Skool's leaderboard high without the comparison anxiety |
| You complete a workout | "Coach Sara saw this" appears within minutes (auto-ack) + Mux-tracked watch-time on coach's view tells coach who actually opened replay | Closing the loop — no message goes into a void |
| Event start | Top of Community tab gets a non-dismissable "Live now: Form Check Friday — Join" bar | Skool praises events-as-first-class; we extend with "your coach is live, walk in" |
| Hit a streak | Subtle confetti in the workout card, NOT a leaderboard ping | Recognition without performative competition |
| Coach acks your check-in | `💪 Sara` chip slides up; tapping it shows the exact message Sara saw | Acknowledgement without surveillance |

### 5.4 Typography hierarchy

- **Coach name in cohort posts** — semibold, accent color, 17pt
- **Post body** — regular, 17pt, max 320 chars before "read more"
- **Inline ack badges** — 13pt, all-caps tracking, muted gray unless coach
- **Time stamps** — relative ("2h ago"), 13pt, very muted, never bold

### 5.5 The "calm homepage" pattern, repeated everywhere

The home tab will be the "calm summary" pattern Bradley specified. The same pattern repeats inside Community:
- Top: today's coach prompt (if any), or The Lab newest pinned
- Middle: 1 cohort card (the most relevant one), with newest activity
- Bottom: 1 event card (next event or live now)

If the user wants more, they scroll. The default is 3 things to look at. Compare to Slack opening a 47-channel sidebar on cold start.

### 5.6 Coach-side visual layer

The coach app is allowed to be denser. Coaches are pros doing work — they get:
- **Inbox view** of all DMs across cohorts, sorted by urgency / unack'd / time
- **Cohort dashboard** with member-health grid (color-coded by engagement)
- **Live event console** with attendance ticker
- **Compose drawer** that drafts a post → AI assist → review → publish (single screen)

The visual language stays the same — just denser layout, more keyboard shortcuts, multi-pane on tablet.

---

## 6. UI / UX management strategy — how this stays a "one place" experience

### 6.1 Navigation hierarchy

```
Client app (bottom tab order):
├── 🏠 Home          → today's calm summary
├── 🍎 Food          → meal logging
├── 💪 Workout       → workout tracking
├── ✨ Coach AI      → AI guide
└── 👥 Community     → THIS feature
        ├── (default) Today view (per-cohort summary + The Lab card + event card)
        ├── The Lab (coach's broadcast feed)
        ├── Cohorts (1 tab per cohort the client is in)
        ├── DMs (1:1 with coach + opt-in member-to-member)
        └── 🔍 Find (intent-driven search)

Coach app:
├── 🏠 Home          → coach brief (already exists)
├── 👥 Community     → coach view of THIS feature
│   ├── Inbox (all DMs unified)
│   ├── The Lab (coach.s broadcast feed)
│   ├── Cohorts (admin + post + member-health)
│   ├── Events (schedule + live console + recaps)
│   └── 🔍 Find
├── 📊 Clients       → roster, plans, billing
└── ⚙️ Settings
```

### 6.2 State management — single source of truth

- All messages, posts, events, reactions live in Postgres
- Mobile reads through React Query with Supabase Realtime invalidation
- Offline queue (already partial in mobile `src/offline/database.ts`) extends to drafts + reactions + read-position updates
- Push from Expo carries `community.event_kind` so cold-start navigation can deep-link directly into the thread

### 6.3 Permissions / role model

| Role (current codebase) | Capabilities in Community |
|---|---|
| `student` (client in Bradley's vocabulary) | Post in cohort feed, DM coach, react, RSVP, opt into challenges |
| `coach` | All of above + post in The Lab + cohort admin + moderation + DM any of their clients |
| `assistant_coach` | All client capabilities + reply in cohort threads, no Lab post, no moderation by default |
| `owner` | Cross-cohort moderation, billing-tier enforcement |

### 6.4 Coach onboarding to Community

First-time coach flow:
1. **Pick your Lab name (or use the default "The Lab")** (default: "Coach [Firstname]'s Lab")
2. **Pick your accent color** (5 presets + custom hex behind a coach-tier flag)
3. **Set your reply hours** ("M–F 8a–6p PT")
4. **Choose default notification mode** (Daily Pulse / Live Cohort / Quiet Cohort)
5. **Pick a cohort template** (12-Week Cut, Beginner Strength, Habit-First, Custom)
6. **Auto-create welcome post** in The Lab (editable)

This entire flow targets <90 seconds. Skool's mistake was making creators do nothing before the first post; we lean toward "do a tiny bit of setup so the first message has a frame."

### 6.5 Client onboarding to Community

First-time client lands in Community:
1. Sees their coach's Lab post (pre-written welcome)
2. Sees their assigned cohort with a coach-pinned "start here" post
3. Sees coach's reply-hours badge
4. Sees the "Today" card with their first workout + first event
5. A non-dismissable tip overlay: *"Tap @ to mention your coach. Tap 🔍 to find anything."*

Zero forced tour. Onboarding is contextual hints, not a 4-step modal.

### 6.6 Telemetry & instrumentation (PostHog, already wired)

Track from day one:
- `community.tab.opened`
- `community.cohort.viewed`
- `community.message.sent` (with `tag` enum)
- `community.coach.acked` (and time-to-ack distribution)
- `community.post.created` / `community.post.viewed`
- `community.event.rsvp` / `community.event.attended` / `community.event.replayed`
- `community.challenge.joined` / `community.challenge.completed`
- `community.search.executed` (with intent enum)
- `community.dm.escalated` (member used the "tell coach this is urgent" button)
- `community.moderation.report`
- `community.churn_signal.fired` (7d silent, etc.)

These feed Coach Brief and existing engagement scoring (PR #264) so Community drives the same retention loop as the rest of the app.

---

## 7. Open product questions (need Bradley input)

1. **Member-to-member DM**: default off in free tier, on in paid? Or coach-controlled? My recommendation: coach-controlled, defaults to off.
2. **Coach pricing tiers**: should Community be a Pro-tier feature, or available to all coaches with limits (e.g. 1 cohort on free)? My recommendation: 1 cohort + The Lab + unlimited DM on free; multi-cohort, events, challenges, AI inbox on Pro.
3. **Live calls**: pick Daily.co or punt to v2? My recommendation: punt to v2; ship voice-notes + replay-only events in v1 to validate the loop without integrating live video.
4. **Voice transcription**: ship in v1 or v2? My recommendation: v2. Voice notes themselves ship v1 (we already have `SUPABASE_VOICE_BUCKET`).
5. **Public discoverability**: should there be a "find a coach" surface (like Skool's directory)? My recommendation: separate feature, not part of Community. ME21 in backlog already covers it.
6. **Per-cohort cap**: hard limit on members per cohort? My recommendation: soft warning at 50, hard cap at 100 — past that the feed becomes a Slack workspace.

---

## 8. Sequencing — what ships when

### v1 — Foundation (4–6 PRs, ~3 weeks)
- Schema: `community_workspaces`, `community_cohorts`, `community_memberships`, `community_messages`, `community_posts`, `community_reactions`, `community_events`, `community_challenges`
- Realtime channels per cohort + per DM (Supabase Realtime, already wired)
- Mobile: Community tab, The Lab, 1 cohort, DM with coach, basic post + reaction + reply
- Push routing for `@mention`, `coach.reply`, `event.live`
- Coach onboarding flow (§6.4)
- Telemetry baseline

### v2 — The coaching loop (3–4 PRs, ~2 weeks)
- Plan View (§2.2) — re-thread messages by week / workout / check-in
- Coach ack badges (§2.4)
- Events as first-class feed object (§3.2) — RSVP, replay attach
- AI inbox triage (FH.8) for coaches
- Cohort templates + topic templates (§3.5)

### v3 — Retention engine (3–4 PRs, ~2 weeks)
- Opt-in challenges (§2.7)
- Classroom-as-pinned-posts (§3.3)
- Voice notes (Supabase Storage, mobile capture, playback UI)
- Wearable-aware coach prompts (§2.8) — *after Finding 1/2 are fixed*
- Intent-driven search (§3.4) — Postgres FTS first

### v4 — Scale + premium (timing TBD)
- Meilisearch flip when first workspace passes 50k messages
- Live video (Daily.co adapter) — replaces ME18 stub
- Voice transcription (Deepgram / Whisper)
- Coach branding tier (custom domain, white-label app submission via EAS)

---

## 9. Success metrics (the only ones that count)

| Metric | Target by month 3 of v1 launch |
|---|---|
| % of paying clients who open Community ≥3×/week | ≥60% |
| Median time from client message → coach ack (during reply hours) | <2h |
| Coach NPS for Community-as-tool | ≥40 |
| Client churn rate in cohorts WITH Community vs without (within same coach) | -25% relative |
| Active cohort posts per coach per week (median) | ≥5 |
| Cohort message volume per active client per week (median) | 3–10 (target the engagement-not-overwhelm range) |
| % of events with attendance ≥50% of RSVPs | ≥70% |

If we land these, Community is the retention moat. If we land 3/7 we are a Skool clone with extra steps. We will know by month 3.
