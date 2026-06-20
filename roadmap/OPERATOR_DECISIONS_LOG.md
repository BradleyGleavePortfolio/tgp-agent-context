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
