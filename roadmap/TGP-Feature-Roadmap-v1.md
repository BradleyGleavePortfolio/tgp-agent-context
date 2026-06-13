# TGP Master Feature Roadmap
### The Growth Project — Complete Build, Gap & Gym Mode Strategy

---

## Executive Summary

TGP ("The Growth Project") is a B2B SaaS platform for fitness coaches, gyms, influencers, and info-sellers — designed to replace Trainerize, Everfit, and Mindbody simultaneously with a single, Apple-simple platform. The codebase is materially ahead of the market: core coaching infrastructure, team hierarchy, storefront, and business metrics are already built. What remains are the features that close the gap between a strong coaching tool and a full fitness operating system — adaptive programming autopilot, a unified inbox, gym membership management, marketplace discovery, and several high-leverage AI layers.

This document covers every outstanding item in full 5W1H detail: **What** it is, **Why** it matters, **Who** it serves, **Where** it lives in the product, **When** to build it, and **How** to build it.

---

## Section 1: Partially Built — Must Complete

### 1.1 Closed-Loop Adaptive Programming (Autopilot)

**What:** A true AI programming engine that adjusts a client's workout plan automatically based on real feedback — logged RPE, missed sessions, fatigue signals, HRV from wearables, and coach-set thresholds. Not AI-assisted (coach still edits) — fully autonomous until the coach intervenes.

**Why:** This is the single feature no competitor executes well. Trainerize and Everfit have "AI suggestions" but they're template swaps, not genuine adaptive loops. A closed-loop system means a coach running 100 clients sees each client's program evolve correctly without touching it weekly — that's 10+ hours per week returned to the coach.

**Who:** Every coach on TGP. Highest impact for coaches with 20+ clients.

**Where:** Extends the existing `adaptive_programming`, `workout`, `insights`, and `ai` modules already in the codebase. The foundation is verified present; the loop closure is missing.

**When:** Priority 1 — this is the feature that makes TGP credibly superior to Trainerize on the core coaching workflow. Build before marketplace launch.

**How:**
- Define feedback schema: after each session, client logs RPE (1–10), completion %, and optional notes
- AI reads trailing 2–4 weeks of RPE + completion data + wearable HRV/sleep signals
- Rule engine + LLM layer generates weekly program adjustment (volume, intensity, deload trigger)
- Coach receives a digest: "Here's what AI changed for 8 clients this week — review or approve all"
- Coach can override any individual adjustment with one tap
- Over time, coach feedback trains a per-coach model that learns their philosophy
- Stack: existing AI module + OpenAI function-calling or Claude tool-use for adjustment generation

---

### 1.2 Wearable Deep Integration (Complete What's Installed)

**What:** Full read pipeline from Apple Health, Google Fit, Garmin, Whoop, and Oura — surfacing HRV, sleep quality, resting heart rate, and recovery score directly into the coach dashboard and feeding the adaptive programming engine.

**Why:** Wearable data is the missing signal that makes adaptive programming genuinely intelligent. Without it, the AI is guessing at recovery. With it, TGP becomes the only coaching platform that makes wearable data *actionable* at the coach level — not just a personal stats screen.

**Who:** Clients who own wearables (Apple Watch penetration alone is >30% of active gym-goers). Coaches managing athletes and performance clients.

**Where:** Existing `wearable` module (installed but incomplete). Feeds into adaptive programming, coach brief, and client profile.

**When:** Build alongside adaptive programming — they are co-dependent for the full closed-loop story.

**How:**
- Apple Health: HealthKit SDK, background delivery for HRV, sleep, active energy, heart rate
- Google Fit: Fitness REST API, OAuth 2.0 scoped to body metrics
- Whoop / Oura / Garmin: webhook or polling integrations via their developer APIs
- Normalize all data into a unified recovery schema (score 0–100, sleep quality, HRV delta)
- Expose recovery score on the coach's client card — color coded: green/yellow/red
- Feed recovery score as a primary signal into the adaptive programming engine

---

### 1.3 Marketplace / Public Discovery Layer

**What:** A public-facing directory of TGP coaches, auto-published at account creation, where prospective clients can browse, filter by specialty, read verified reviews, and purchase a coaching package directly.

**Why:** No coaching platform owns the discovery layer. Trainerize and Everfit require coaches to bring all their own clients. A marketplace means TGP can *generate* clients for coaches. 10,000 coach profiles = 10,000 Google-indexed pages with schema markup showing star ratings in search results — eventually dominating "find online fitness coach" searches.

**Who:** New coaches building their client base. Established coaches wanting inbound leads. Clients searching for a coach.

**Where:** Public web (SEO-indexed) + in-app discovery tab for existing TGP clients.

**When:** After adaptive programming and inbox are complete. Marketplace quality depends on coach profiles being rich — don't launch thin.

**How:**
- Auto-publish every coach profile at account creation; visibility governed by completeness score (photo, bio, specialty tags, at least one package listed)
- Coach profile fields: photo, name, specialty, certifications, years experience, client count served, average rating, available packages with prices
- Review system: only verified clients (active TGP coaching relationship) can leave reviews; time-weighted average so coaches can't coast on old reviews
- Stripe Connect checkout inline: prospective client buys a package, auto-splits 95% to coach / 5% to TGP (marketplace-discovered clients only)
- Coaches who bring their own clients via direct link pay 2% on platform sales — not the 5% marketplace fee
- SEO: each coach profile is a static-rendered page with JSON-LD schema (Person, Review, Offer types)
- Extend to gym listings: "Find a gym near you" alongside "Find a coach" — TGP owns fitness discovery entirely

---

## Section 2: Not Yet Built — Core Coaching Gaps

### 2.1 Unified Coach Inbox / Command Center

**What:** A single screen where a coach sees all client communication, check-in responses, flagged alerts, and pending approvals — sorted by urgency, not chronology.

**Why:** Coaches managing 30–100 clients across scattered message threads lose hours daily. No competitor has solved this. The inbox isn't just messages — it's the coach's operational cockpit: who needs attention, who submitted a check-in, who hasn't logged in 5 days, which program adjustments are pending approval.

**Who:** Any coach with 10+ active clients. Enterprise head coaches managing sub-coaches.

**Where:** New top-level tab in the coach app. Replaces the current scattered notification model.

**When:** Priority 2 — builds directly on existing client data; medium complexity.

**How:**
- Three-panel layout: sidebar (client list with urgency indicators), center (active conversation / check-in view), right panel (client quick stats: last login, current week progress, recovery score)
- AI triage layer: surfaces the 3–5 clients who need attention today, with a one-line reason ("Sarah hasn't logged in 4 days," "Mike's RPE is trending high — consider deload")
- Unified message types: SMS-style chat, check-in form responses, video replies, and system alerts all in one thread
- Bulk actions: approve all AI-generated program changes, send a broadcast to a client segment, mark all check-ins read
- Read receipts and "coach last seen" so clients know they're not being ignored

---

### 2.2 Team QA / Manager-Level Ops Layer

**What:** A head coach or gym manager can audit sub-coach quality — reviewing client check-ins their sub-coaches haven't responded to, flagging programs that haven't been updated, and seeing response time metrics per sub-coach.

**Why:** As TGP scales into enterprise gyms and large coaching teams, the head coach becomes a manager, not just a practitioner. Without QA tooling, head coaches can't enforce standards across 10 sub-coaches serving 500 clients. This is the feature that makes TGP viable for franchise gyms and large online coaching businesses.

**Who:** Head coaches with 3+ sub-coaches. Gym owners with staff trainers.

**Where:** Head coach dashboard — new "Team Ops" tab extending the existing team hierarchy module.

**When:** Priority 3 — builds on team hierarchy (already built). Medium effort.

**How:**
- Manager view: per-sub-coach metrics — average check-in response time, % of clients with programs updated in last 7 days, client satisfaction proxy (last rating + churn risk)
- Flagging: auto-flag any check-in unanswered for 48+ hours; head coach sees it and can intervene or reassign
- Program audit: head coach can view any sub-coach's client programs without sub-coach permission (owner-level access)
- Weekly ops digest: AI-generated summary of team performance — who's thriving, who needs support, which clients are at churn risk

---

### 2.3 AI-Generated Check-In Summaries

**What:** Instead of reading every client check-in reply, the AI reads all submissions and surfaces a prioritized digest: the 3 clients who need immediate attention, common themes across all clients this week, and suggested responses for routine check-ins.

**Why:** A coach with 50 clients reviewing 50 check-ins every Sunday is unsustainable. This is the leverage feature — it doesn't replace the coach's judgment, it compresses the time required to exercise it.

**Who:** Any coach running weekly or biweekly check-ins (the majority).

**Where:** Coach inbox / check-in review screen. AI summary panel appears above the raw submissions.

**When:** Build alongside the unified inbox — they share the same data layer.

**How:**
- On check-in submission, AI reads the response + client history + recent data
- Classifies urgency: routine (on track), watch (minor concerns), urgent (injury, motivation crisis, major life event)
- Generates a one-paragraph summary per client and a suggested coach response (editable, not auto-sent)
- Surfaces weekly themes: "7 clients mentioned feeling tired this week — possible program fatigue"

---

### 2.4 AI Video Form Analysis

**What:** Clients upload a short workout video (squat, deadlift, press); AI scores their form on a 0–100 scale, flags specific issues with timestamped callouts, and suggests corrections. Coach reviews, adds their note, and sends back.

**Why:** No major coaching platform has this natively. It's the highest "wow factor" feature for client acquisition — coaches can literally say "upload your squat video and get AI feedback within minutes." It also dramatically increases perceived coaching value for remote clients who miss in-person feedback.

**Who:** Every client. Highest impact for remote/online coaching clients.

**Where:** Client-side: video upload in the session log. Coach-side: video review queue with AI annotations.

**When:** Priority 4 — requires third-party API integration; medium-high effort.

**How:**
- Use a computer vision API (e.g., ymove.app REST API at ~$0.25/analysis, or build on MediaPipe Pose Estimation)
- Client records 15–30 second video in-app; uploads to secure storage (S3)
- AI processes: identifies exercise type, tracks joint angles frame-by-frame, compares to biomechanical benchmarks
- Output: score, 2–3 flagged issues with timestamps, corrective cue suggestions
- Coach receives notification: "Client uploaded squat video — AI score: 67/100. Review and send feedback?"
- Coach adds voice note or text annotation before sending to client

---

### 2.5 Native Nutrition / Meal Plan Module

**What:** Coach builds and assigns meal plans natively in TGP — macro targets, daily meal templates, food swap suggestions — without clients needing a separate app like MyFitnessPal or Cronometer.

**Why:** Every competitor uses a separate app for nutrition. Coaches and clients hate the context-switching. Owning nutrition keeps the client entirely within TGP's ecosystem — more data, more stickiness, harder to leave.

**Who:** Nutrition-forward coaches. Every client who tracks food.

**Where:** New "Nutrition" tab in both coach and client app. Feeds into coach brief and adaptive programming (calories in vs. training load).

**When:** Priority 5 — high build effort, but a major retention driver.

**How:**
- Coach sets macro targets (protein/carbs/fat) per client, adjustable by training day vs. rest day
- Client logs meals via food search (USDA FoodData Central API — free, 300k+ items) or barcode scan
- AI layer: end-of-day summary — "You hit protein target but were 400kcal under — consider a pre-bed snack"
- Coach sees nutrition compliance score alongside workout compliance in the client card
- Meal plan templates: coach builds reusable plans (e.g., "Bulking Week 1") and assigns to clients

---

### 2.6 Reusable Smart Check-In Forms

**What:** Coach builds check-in form templates once — questions, scales, and prompts — and the form auto-populates historical context on each submission (last week's answers, current program week, recent metrics).

**Why:** Trainerize and TrueCoach both lack this. Coaches currently rebuild forms manually or use Google Forms — a constant friction point. Smart forms that remember prior answers make check-ins faster for clients and richer in data for coaches.

**Who:** All coaches running structured check-in protocols (the majority).

**Where:** Check-in module — extends existing client communication infrastructure.

**When:** Medium priority — relatively low build effort, high coach satisfaction impact.

**How:**
- Form builder: drag-and-drop question blocks (1–10 scale, text, yes/no, photo upload)
- Templates: coach saves a form as a reusable template; assigns to one client or all clients
- Auto-populate: on submission, form prefills client's last answer for each question as a reference
- Recurring scheduling: set a check-in to auto-send every Sunday at 8am to a client segment
- AI summary triggers on submission (see 2.3)

---

### 2.7 Automated Lead-to-Client Onboarding Flow

**What:** A single, coach-configured flow that takes a prospective client from "I'm interested" to fully onboarded: intake form → e-sign waiver/contract → payment → first program assigned — zero manual steps from the coach.

**Why:** Most coaches lose leads between interest and payment because the process is fragmented across Typeform, DocuSign, and manual follow-up. A native onboarding flow closes this gap and makes the coach look premium and organized from day one.

**Who:** All coaches, especially those running high-ticket programs.

**Where:** Storefront / funnel engine (already built) — extend with intake form + e-sign + program auto-assignment.

**When:** Medium priority — directly extends existing storefront; medium effort.

**How:**
- Coach configures onboarding sequence: intake questions → contract (rich text editor with e-sign) → Stripe checkout → welcome message → program assignment
- E-sign: client types name + timestamp; stored as a PDF to their profile (legally sufficient in most jurisdictions for coaching contracts)
- After payment: coach gets notified; client gets welcome message + first program; all automated
- Coach can review intake responses before program assignment if they prefer semi-automated

---

### 2.8 Client Loyalty & Reward System

**What:** Coaches can configure milestone rewards for clients — hitting a 30-day streak, completing a transformation challenge, reaching a strength PR — that trigger in-app recognition and optional real rewards (discount code, free session).

**Why:** The 6-week churn cliff is real in fitness — clients who make it to 6 weeks stay significantly longer. Milestone recognition at weeks 2, 4, and 6 is proven to increase retention. This is the anti-gamification version: no points, no leaderboards — just genuine, coach-branded recognition.

**Who:** All clients. Highest impact on new clients in the first 8 weeks.

**Where:** Client app — milestone card appears in feed. Coach configures in their dashboard settings.

**When:** Medium-low priority — build after core workflow gaps are closed.

**How:**
- Coach defines milestone triggers: streak length, workout count, goal achievement, check-in consistency
- Reward types: in-app badge (custom image/text), push notification from the coach, auto-generated discount code for their storefront
- Coach can add a personal video message to a milestone (pre-recorded) that plays when the client hits the trigger
- All milestone events visible in coach's client timeline

---

### 2.9 Re-engagement Automations

**What:** If a client hasn't logged in for N days (coach-configurable), TGP sends an automated, coach-branded outreach message — not a generic platform notification, but a message that looks like the coach wrote it.

**Why:** Churn is almost always preceded by disengagement. A 5-day no-login is an early warning sign; a 14-day no-login is near-certain churn. Automated outreach at day 5 catches the client before they mentally quit.

**Who:** All clients. Critical for coaches with 30+ clients who can't manually monitor login activity.

**Where:** Coach automation settings + client notification system.

**When:** Medium priority — builds on existing churn prediction infrastructure.

**How:**
- Coach sets triggers: "If client hasn't logged in for 5 days, send Message A. If 10 days, send Message B"
- Message templates: coach writes their own voice; AI can suggest drafts
- Message delivery: push notification + in-app message thread
- Coach sees automation log: "Outreach sent to 4 clients this week — 2 re-engaged"
- Escalation: if day 14 and still no login, flag to coach for personal outreach

---

### 2.10 Migration / Import Tooling

**What:** A structured import pipeline that lets a coach migrate their entire client base from Trainerize, Everfit, or a spreadsheet into TGP — clients, programs, history, and billing — in under an hour.

**Why:** The #1 reason coaches don't switch platforms is switching cost. Eliminating migration friction converts the biggest segment of potential TGP users: established coaches on Trainerize with 20–100 existing clients. A smooth migration tool is a sales tool as much as a technical one.

**Who:** Coaches migrating from Trainerize, Everfit, or managing clients in spreadsheets.

**Where:** Onboarding flow for new coach accounts.

**When:** Build before major marketing push — it directly enables coach acquisition.

**How:**
- Trainerize export: CSV/JSON export from Trainerize; TGP importer maps fields to internal schema
- Client invite: after import, TGP sends branded invite emails to all imported clients — "Your coach [Name] has moved to TGP. Download the app to continue"
- Program import: parse Trainerize program export format; convert to TGP workout schema
- Billing migration: flag which clients had active subscriptions; prompt coach to set up equivalent Stripe plans
- Spreadsheet import: accept standard columns (name, email, start date, program) for coaches running manual operations

---

### 2.11 Referral Tracking Engine

**What:** Native referral link system — coach gives clients a unique link; when a referred prospect buys, the referring client gets an automatic reward (discount code, free week, cash credit).

**Why:** Word-of-mouth is the top acquisition channel for fitness coaches. Making it trackable and rewardable converts organic referrals into a managed growth program. No major coaching platform has this natively.

**Who:** All coaches. Highest impact for coaches with satisfied long-term clients.

**Where:** Coach storefront + client profile (referral link visible in client's settings).

**When:** Medium-low priority — medium build effort, directly extends existing storefront.

**How:**
- Each client gets a unique referral URL for their coach's storefront
- Stripe webhook: when a new purchase is made via referral link, system credits the referrer
- Reward types: storefront discount code, free coaching week (auto-extends subscription), or cash payout via Stripe Connect
- Coach dashboard: referral leaderboard, total referrals per client, total revenue attributed

---

### 2.12 White-Label Multi-Tenant Packaging

**What:** Large coaching businesses and franchise gyms can deploy TGP under their own brand — their logo, their app store listing, their domain — with TGP as the invisible infrastructure layer.

**Why:** This is the enterprise tier. A 50-location gym chain or a fitness media brand won't adopt a platform that puts TGP's brand above theirs. White-labeling unlocks the highest ACV (annual contract value) accounts.

**Who:** Gym chains, franchise operators, fitness influencers with large audiences, corporate wellness programs.

**Where:** Backend multi-tenant architecture; frontend theme configuration.

**When:** Low priority until 50+ coaches are live — this is a scale feature, not a launch feature.

**How:**
- Multi-tenant database partitioning: each white-label tenant has isolated data
- Theme configuration: logo, brand colors, font, app store metadata (requires separate Apple/Google developer account per tenant)
- Custom domain: tenant's web storefront runs on their domain (CNAME routing)
- Pricing: white-label tier billed at a flat monthly fee + revenue share, not per-coach seat

---

## Section 3: New Ideas — High Impact

### 3.1 Daily AI Coach Briefing

**What:** Every morning, the AI reads each client's data (load, sleep, HRV, recent sessions, check-in mood) and writes a plain-English coaching note with suggested adjustments. The coach reviews the briefing in under 2 minutes and approves, modifies, or dismisses.

**Why:** This is the "AI chief of staff" for coaches. Instead of logging into a dashboard and parsing data, the coach opens the app and sees: "Three things to do today. Mike needs a deload. Sarah just PRed — send her a message. Tom hasn't logged in 3 days." Massive time savings, zero data literacy required.

**Who:** All coaches. Transformative for coaches with 20+ clients.

**Where:** Coach home screen — the first thing seen on app open.

**When:** Build alongside unified inbox and check-in summaries — shares the same AI layer.

**How:**
- Morning cron job (6am in coach's timezone): AI reads all client data from past 7 days
- Generates a prioritized briefing: urgent items (injuries, no-login alerts, flagged check-ins), routine items (program updates due, milestone triggers), opportunities (client ready for progression)
- One-tap actions from briefing: send message, approve program change, log a note
- Briefing delivered as push notification + in-app card

---

### 3.2 AI Class Demand Forecasting (Gym Mode)

**What:** For gyms, AI analyzes historical attendance data and recommends schedule changes — "Adding a 6am Thursday class would fill 80% capacity based on your waitlist and member demand patterns."

**Why:** Gym operators currently make scheduling decisions by gut feel or manual analysis. AI demand forecasting is a feature no competitor offers and directly affects gym revenue (more classes = more revenue from the same fixed costs).

**Who:** Gym owners and operations managers.

**Where:** Gym Mode dashboard — "Schedule Intelligence" panel.

**When:** Build after core Gym Mode is live and attendance data is accumulating.

**How:**
- Data inputs: historical class attendance by slot, waitlist counts, member location/commute data, seasonal patterns
- ML model: time-series demand forecasting per time slot (start with heuristic rules, graduate to lightweight model)
- Output: weekly recommendations displayed as cards in ops dashboard
- Operator accepts recommendation → new class slot auto-added to calendar

---

### 3.3 Async Video Replies

**What:** Coach records a 30–60 second video response to a client's check-in — think Loom, but built natively into TGP. More personal than text; faster than a live call.

**Why:** Remote coaching's biggest weakness is perceived impersonality. A coach sending a 30-second video saying "I saw your check-in — here's what I'm thinking for next week" is dramatically more impactful than a text reply. Clients who receive video feedback churn at lower rates.

**Who:** All coaches. Especially high-ticket coaches whose clients expect premium service.

**Where:** Message thread in the unified coach inbox. Client sees it in their coaching feed.

**When:** Medium priority — build after inbox is live.

**How:**
- Coach taps "Video Reply" in a check-in thread; device camera opens within the app
- 60-second max recording; auto-transcribed (Whisper API) for searchability and accessibility
- Stored in S3 with client-scoped access; auto-expires after 30 days to manage storage costs
- Client receives push notification: "Your coach sent you a video message"

---

### 3.4 Progressive Overload Visualization

**What:** A clean strength curve chart for every tracked exercise — showing the client's 1RM estimate or working weight over time, with personal records highlighted.

**Why:** Seeing progress in a graph is one of the strongest retention drivers in fitness apps. Clients who can *see* they're getting stronger stay subscribed. No coaching platform visualizes this elegantly — they show raw logs, not the narrative arc of progress.

**Who:** All clients doing resistance training (the majority).

**Where:** Client app — exercise detail view + a dedicated "My Progress" screen.

**When:** Medium-low priority — relatively low build effort, high client satisfaction.

**How:**
- After each logged session, system calculates estimated 1RM (Epley formula: weight × (1 + reps/30))
- Time-series chart per exercise: x-axis = date, y-axis = estimated 1RM, PR markers highlighted
- "Strength Score" composite: weighted average across the client's top 5 tracked lifts, showing overall strength trajectory
- Coach sees same charts; can share a client's progress chart as a social-friendly image (marketing tool for the coach)

---

### 3.5 Coach Staff Commission Tracking

**What:** Head coach sets a commission percentage per sub-coach; TGP calculates and reports commission owed based on the sub-coach's client revenue each month, and optionally automates payout via Stripe Connect.

**Why:** Large coaching teams and gyms currently track this in spreadsheets. Automating commission calculation removes a major administrative burden and prevents disputes. It's also a key feature for recruiting sub-coaches — transparent, automated commissions are a selling point.

**Who:** Head coaches with paid sub-coaches. Gym owners with employed trainers.

**Where:** Head coach financial dashboard — extends existing team hierarchy and business metrics.

**When:** Medium-low priority — builds directly on existing Stripe Connect and team hierarchy.

**How:**
- Head coach sets commission rate per sub-coach (e.g., 70% of client revenue goes to sub-coach)
- Monthly: system calculates each sub-coach's earned revenue, applies commission rate, generates payout report
- Optional auto-payout: Stripe Connect sub-account per sub-coach; platform routes funds automatically
- Sub-coach sees their own earnings dashboard: revenue generated, commission earned, payout history

---

## Section 4: Gym Mode — Full Build Spec

### 4.1 Overview

**What:** A "Gym Mode" toggle at the account level that transforms TGP from a coaching platform into a full gym operating system — while keeping all coaching, AI, and storefront features available as upsells. The strategic goal: replace Mindbody + Trainerize simultaneously with a single platform at a price neither can match.

**The key architectural insight:** TGP currently is *coach-first* — every member belongs to a coach. A gym needs a *gym-first* model where some members are general members (no coach), some have coaches, and the gym owns the relationship with all of them.

---

### 4.2 Membership Creation System

**What:** The gym owner builds memberships from scratch — not pre-determined tiers. Like Shopify for gym products.

**Who:** Gym owners and admin staff.

**Where:** Gym Mode admin portal — "Memberships" section.

**When:** Priority 4 — core of Gym Mode. Build first within the Gym Mode workstream.

**How:**
- Name it anything: "Unlimited Access," "Morning Only," "Founding Member," "Student Plan"
- Set price + billing cadence: weekly, monthly, annual, or one-time
- Define what's included: class types accessible, facility zones, guest passes, PT sessions bundled
- Set access rules: time-of-day restrictions, location-specific (Branch A only), capacity limits
- Publish or draft: controls whether it's joinable by the public or staff-assigned only
- Archive old plans: existing members stay grandfathered; new signups can't select archived plans
- Technical: maps directly to Stripe Products + Prices API — each membership = one Stripe Product with one or more Prices (monthly/annual)

---

### 4.3 Billing Operations

**What:** Full billing lifecycle management for gym members.

**Who:** Gym owners, finance staff, and members managing their own accounts.

**Where:** Gym Mode admin portal (staff view) + member self-service portal.

**When:** Priority 4 — co-builds with membership creation.

**How:**
- Recurring auto-charge via Stripe Subscriptions (already in stack — mostly configuration + UI)
- Failed payment handling: automatic retry on days 3, 7, 14; member self-service link to update card; access suspended after final retry
- Membership freeze/pause: member pauses for up to 3 months; system resumes and charges automatically on resume date
- Prorated billing: join mid-month → charge only for remaining days; next month full price
- Coupons and discounts: staff creates discount codes (% or fixed amount, one-time or recurring)
- Comp memberships: staff grants free access for a set period (influencer partnerships, staff members, referral rewards)
- POS / in-person payments: Stripe Terminal integration for front-desk walk-in sign-ups and merchandise sales
- Daily revenue report: total charged today, upcoming renewals this week, outstanding balances

---

### 4.4 Class & Facility Scheduling

**What:** A fully configurable class calendar that members can book from the app.

**Who:** Gym members (booking) and gym staff/trainers (managing).

**Where:** Member app — "Classes" tab. Admin portal — "Schedule" management.

**When:** Priority 4 — core Gym Mode feature, high build effort.

**How:**
- Gym publishes weekly timetable: class name, instructor, time, location, capacity, class type
- Members book from the app's calendar tab; confirmation push notification sent
- Capacity limits + waitlist: class caps at configured max; overflow joins auto-waitlist, promoted automatically if someone cancels
- Cancellation windows: member can cancel up to N hours before (gym-configurable); late cancels trigger a fee or strike
- Recurring templates: set a standing class that repeats weekly; modify individual instances as needed
- Facility/equipment booking: reserve a court, a lane, a squat rack for a time slot
- Staff scheduling: who's teaching which class, shift visibility for staff members

---

### 4.5 Access Control

**What:** Members check in via QR code or Bluetooth; door access validates active membership before granting entry.

**Who:** All gym members (check-in). Front desk staff (kiosk mode).

**Where:** Member app (QR display). Gym hardware (door reader). Staff tablet (kiosk).

**When:** Priority 8 — hardware dependency makes this a later-phase Gym Mode feature.

**How:**
- QR code check-in: member opens TGP app → unique QR displayed → scanner reads it → access granted if membership active
- Bluetooth / NFC: member's phone pings door hardware (Kisi, Salto, or BLE beacon) automatically as they approach
- Front-desk kiosk mode: staff iPad at reception; member scans, staff confirms, walk-in signs up — all from one screen
- Tier-gated access: membership plan controls which zones/facilities the member can access — enforced at check-in
- Check-in log: every entry timestamped and stored; feeds attendance heatmap in the ops dashboard

---

### 4.6 General Member Account Type

**What:** A "general member" profile — no assigned coach, just billing + class booking + access.

**Who:** Gym members who don't have a personal coach.

**Where:** Member-facing app (simplified view). Admin portal (staff management).

**When:** Priority 4 — schema change required; medium effort.

**How:**
- Stripped-down client profile: name, photo, membership plan, billing info, class booking history, check-in log
- No program view (unless they upgrade to coached experience)
- Self-service portal: member updates payment method, views billing history, requests freeze, cancels — no staff involvement required
- Family/household accounts: one billing parent, multiple member profiles under one Stripe customer
- Coaching upsell: one-tap CTA in the member's app — "Upgrade to coached experience — browse coaches in your gym"

---

### 4.7 Staff Role Architecture

**What:** Granular staff roles so the right people have the right access.

**Who:** All gym staff.

**Where:** Gym Mode admin portal — "Team" settings.

**When:** Priority 4 — required before Gym Mode can be deployed to real gyms.

| Role | Access |
|------|--------|
| Front Desk | Check-in members, sign up walk-ins, process POS payments |
| Trainer | Their clients only, class management for their classes |
| Manager | All member data, scheduling, staff management — no billing settings |
| Owner | Full access including billing configuration, payout settings, reporting |

---

### 4.8 Gym Ops Dashboard

**What:** The ops intelligence layer that makes TGP's gym software smarter than every competitor.

**Who:** Gym owners and managers.

**Where:** Gym Mode admin portal — home screen.

**When:** Priority 4 — builds on existing business metrics engine; medium effort.

**How:**
- Daily revenue snapshot: charged today, upcoming renewals, failed payments requiring action
- Attendance heatmap: which hours and days are busiest (feeds AI class demand forecasting)
- Member health metrics: total active members, new signups this month, cancellations, net growth
- Churn risk panel: members who haven't checked in for 14+ days, flagged for re-engagement
- AI alerts: "Your Thursday 6am class has had a waitlist for 3 consecutive weeks — consider adding a second slot"
- Bulk communications: send SMS or push to all members, or a filtered segment
- E-sign waivers: digital liability waiver presented at account creation, signed and stored to member's profile

---

## Section 5: Competitive Moat Summary

| Feature Area | Trainerize | Mindbody/Glofox | TGP (With Roadmap) |
|---|---|---|---|
| Adaptive programming | Template swap only | None | True closed-loop AI autopilot |
| AI coach briefing | None | None | Daily AI briefing + inbox triage |
| Gym membership management | None | Core product | Full native (Gym Mode) |
| Marketplace / discovery | None | None | Coach + gym discovery, SEO-indexed |
| Video form analysis | None | None | AI-scored with timestamped feedback |
| Nutrition | None (3rd party) | None | Native module (roadmap) |
| Commission tracking | None | None | Native, automated via Stripe |
| Business metrics | Basic | Basic | Full LTV, churn, cohort analysis |
| Pricing model | Monthly seat fee | Monthly seat fee | No monthly fee + % of revenue |
| UX quality | Bloated | Bloated | Apple/Notion simple |

---

## Section 6: Build Priority Matrix

| Feature | Impact | Effort | Priority |
|---|---|---|---|
| Closed-loop adaptive programming | 🔴 Critical | High | 1 |
| Wearable deep integration | 🔴 Critical | Medium | 1 |
| Unified coach inbox | 🔴 Critical | Medium | 2 |
| Migration / import tooling | 🔴 Critical | Medium | 2 |
| Marketplace launch | 🔴 Critical | High | 3 |
| Daily AI coach briefing | 🟠 High | Medium | 3 |
| AI check-in summaries | 🟠 High | Low | 3 |
| Team QA / manager ops | 🟠 High | Medium | 4 |
| Gym Mode (billing + scheduling + member accounts + staff roles + ops dashboard) | 🟠 High | High | 4 |
| Onboarding flow + e-sign | 🟠 High | Medium | 4 |
| AI video form analysis | 🟠 High | Medium | 5 |
| Native nutrition module | 🟠 High | High | 5 |
| Re-engagement automations | 🟡 Medium | Low | 5 |
| Progressive overload charts | 🟡 Medium | Low | 6 |
| Smart check-in forms | 🟡 Medium | Low | 6 |
| Async video replies | 🟡 Medium | Low | 6 |
| Referral tracking engine | 🟡 Medium | Medium | 7 |
| Commission tracking | 🟡 Medium | Medium | 7 |
| Client loyalty / rewards | 🟡 Medium | Low | 7 |
| Gym Mode access control (hardware) | 🟡 Medium | High | 8 |
| AI class demand forecasting | 🟡 Medium | Medium | 8 |
| White-label multi-tenant | 🟢 Long-term | Very High | 9 |
