# M-IMPORTER-EXTENSION v1 — First Vertical Slice Build-Plan

> **MISSION-FRAMING CORRECTION (2026-07-15, Op 54).** This document is the **build-plan for the FIRST VERTICAL SLICE** (TrueCoach on a Chrome MV3 host), **not** the product mission. An earlier version of this doc mistook that slice for the whole product. The canonical product mission is **site-agnostic, browser-agnostic, autonomously-learning acquisition + deterministic TGP reconstruction + luxury UI** — see **`roadmap/M-IMPORTER-PRODUCT-MISSION_v1.md`** (verbatim operator correction at its top). On any mission-framing question, that doc governs and this one is subordinate. The per-platform extractor tables and the Chrome MV3 specifics below are **the first proving slice + optional specialization**, never the product boundary. TrueCoach is the first *proving adapter*, not the product.

**Status:** ACTIVE build-plan for the first vertical slice (subordinate to `M-IMPORTER-PRODUCT-MISSION_v1.md` on mission framing). Replaces M-NEW-LIVE substrate + onboarding + reconciler + profile-truecoach briefs — all SHELVED via ruling #9.
**Owner:** Bradley Gleave (R0/R3)
**Adopted:** 2026-06-27 (Op 50.5); mission-framing corrected 2026-07-15 (Op 54)
**LOC budget:** ~2,100 prod LOC for the Day-1 slice; per-platform extractor budgets below are *optional specialization*, not a product-completeness requirement.

---

## 0. One-sentence metaphor (applies to every site + every browser host)

**"The coach is the key. The extension is just the hand that turns it."**
We never see the password. We never relay the MFA code. We only ride the session the coach already opened in their own browser tab, with their finger on the trigger. This trust model is **site-agnostic and browser-agnostic** — it holds for any competitor site the authorized user can reach, on any browser host, not just TrueCoach on Chrome.

## 1. Hyperscaler precedent (R-META-2)

This pattern — browser-extension-as-data-bridge under the user's own session — is exactly how the following ship in production:

- **1Password / Dashlane / Bitwarden:** content script in user's tab reads DOM forms and posts to vendor backend via user's cookie. No password sharing. ~75M+ MAUs combined ([Chrome Web Store — 1Password](https://chromewebstore.google.com/detail/1password-%E2%80%93-password-mana/aeblfdkhhhdcdjpifhhbdiojplfjncoa)).
- **Honey (PayPal) / Rakuten:** coupon extensions read cart DOM in user tab and POST to vendor backend. Acquired by PayPal for $4B. Same trust model ([PayPal acquisition press](https://newsroom.paypal-corp.com/2020-01-06-PayPal-Completes-Acquisition-of-Honey)).
- **Grammarly:** content script reads text DOM in user's session, posts to backend. 30M DAU ([Grammarly company page](https://www.grammarly.com/about)).
- **Plaid Link (pre-API era):** originally screen-scraped bank sites under user session with explicit user click. Now powers 8000+ apps with permissioned access. Pattern is industry-validated.

**What hyperscalers do NOT do:** server-side credential storage + headless replay of customer logins (the M-NEW-LIVE substrate path). That model is what triggers C&Ds and MFA-relay liability. The extension model sidesteps both because the bytes only leave the platform inside the coach's own logged-in tab, with their click as the audit anchor.

## 2. Architecture (final)

```
┌──────────────────────────────────────────────────────────────┐
│  TGP web app (app.tgp.coach)                                 │
│  - "Import from another platform" button                     │
│  - Modal: 6 platform tiles (TrueCoach, Trainerize, ...)      │
│  - POST /api/import/intents → returns intent_id              │
│  - Opens platform login URL in new tab with ?tgp_intent=<id> │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼ (new tab, coach logs in normally)
┌──────────────────────────────────────────────────────────────┐
│  Platform tab (e.g. app.truecoach.co)                        │
│  - Coach completes login (incl. MFA if enabled)              │
│  - Extension's content script detects logged-in state        │
│  - Injects floating banner: "Start transferring to TGP?"     │
│  - On click: extension calls platform's internal API         │
│    using coach's existing session cookies                    │
│  - Streams data → POST https://api.tgp.coach/api/scout/ingest│
│    Auth: coach's TGP session cookie (separate origin)        │
└──────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│  TGP backend                                                 │
│  - /api/import/intents (POST, GET)                           │
│  - /api/scout/ingest (POST, idempotent by intent_id+entity)  │
│  - event_log table (~80 LOC, replaces H6A substrate)         │
│  - clients/workouts/etc. tables (existing)                   │
└──────────────────────────────────────────────────────────────┘
```

## 3. What this DELETES (vs. M-NEW-LIVE)

| Killed | LOC saved | Reason |
|---|---|---|
| H6A substrate (PR #493) | ~600 | Replaced by 80-LOC `event_log` table |
| H6B circuit breakers (PR #494) | ~1000 | Inline try/catch ~30 LOC in ingest |
| M-NEW-SUBSTRATE.A-.F | ~2380 | No server-side credential storage needed |
| M-NEW-ONBOARDING (full) | ~520 | Reduced to ~80 LOC extension install prompt |
| M-NEW-RECONCILER | ~250 | Reduced to ~150 LOC idempotent upsert |
| M-NEW-PROFILE-TRUECOACH | ~500 | Reduced to ~200 LOC `extractors/truecoach.ts` |
| D-H6-6 PII crypto-shredding | (entire decision) | No credentials/cookies at rest |
| pgcrypto + KMS + DEK rotation | — | Out of scope |
| Session pool, MFA relay, device-trust | — | Out of scope (coach handles all auth in their tab) |
| **Net reduction** | **~5250 LOC** | **~2100 LOC budget remaining** |

## 4. Component LOC budget

| Component | LOC | File(s) |
|---|---|---|
| `manifest.json` (MV3) | 40 | `extension/manifest.json` |
| `background.js` (service worker) | 200 | `extension/background.js` |
| `content-script.ts` (banner + tab detect) | 250 | `extension/content/main.ts` |
| `popup.html` + `popup.ts` (status UI) | 150 | `extension/popup/*` |
| `extractors/truecoach.ts` | 250 | per verification report |
| `extractors/coachrx.ts` | 350 | per verification report |
| `extractors/mypthub.ts` | 700 | per verification report |
| `extractors/trainerize.ts` | 500 | per verification report |
| `extractors/ptdistinction.ts` | 900 | hybrid path |
| `extractors/fitsw.ts` | 1200 | hybrid path |
| `/api/scout/ingest` (TGP backend) | 200 | `api/scout/ingest.ts` |
| `/api/import/intents` (TGP backend) | 100 | `api/import/intents.ts` |
| `event_log` table + migration | 80 | `migrations/...sql` |
| **Total (extension + backend)** | **~4920** | (Day-1 path TrueCoach only: ~1270 LOC) |

NOTE: Total exceeds the 2100 LOC headline because the headline assumed Day-1 (TrueCoach only). Full 6-platform coverage is ~4900 LOC over the week — still ~50% of the killed M-NEW-LIVE budget.

## 5. Day-1 scope (operator self-test target — the FIRST PROOF, not the product)

> This Day-1 scope is the **first end-to-end proof** (§3.2 of `M-IMPORTER-PRODUCT-MISSION_v1.md`): one site (TrueCoach) + one browser host (Chrome MV3) chosen to prove the whole pipeline. It is a vertical slice; it does not define or bound the product. The engine it exercises is already the site-agnostic, host-injected kernel.

Only the following ship Day-1:
1. `manifest.json` + `background.js` + `content-script.ts` + `popup`
2. `extractors/truecoach.ts` (250 LOC — uses `/proxy/api` bearer token from verified `go-truecoach` reverse-engineering)
3. `/api/scout/ingest` + `/api/import/intents` + `event_log` table
4. TGP modal with TrueCoach tile only (other 5 grey + "coming soon")

**Acceptance:** Operator (Bradley) installs unpacked extension, clicks "Import → TrueCoach" in TGP, logs into his own TrueCoach test account, clicks Start banner, sees his clients appear in TGP `clients` table within 60s.

## 6. Per-platform verification summary

| Platform | Feasibility | Path | MFA Risk | LOC | Notes |
|---|---|---|---|---|---|
| TrueCoach | HIGH | `/proxy/api` bearer | LOW | 250 | go-truecoach reverse-eng confirmed |
| CoachRx | HIGH | `/api/v1/*` + CSRF | LOW | 350 | Rails session cookie + CSRF token |
| MyPTHub | HIGH | `api.mypthub.net` bearer | MEDIUM | 700 | `auth/check2fa` present — handle MFA prompt in coach's tab |
| Trainerize | MEDIUM | Studio/Enterprise API or DOM | LOW | 500 | Cloudflare bot mgmt — pace requests |
| PT Distinction | MEDIUM | Hybrid (Laravel session + DOM) | LOW | 900 | No documented bulk export |
| FitSW | MEDIUM | Hybrid (`/api/auth/` + DOM) | LOW | 1200 | Pure DOM fallback may dominate |

## 7. ToS posture (R-META-3 doctrine: "FUCK THEIR C&D")

All 6 platforms' ToS prohibit "automated means," "scraping," "robots." **The extension model materially reduces this exposure vs. server-side credential replay because:**

1. Every byte moves inside the coach's own authenticated session, initiated by a human click.
2. We never store or transmit the coach's platform credentials.
3. Pattern is industry-validated by 1Password/Honey/Grammarly without C&D outcomes.
4. The audit anchor is the coach's click event — same legal footing as them manually copy-pasting data.

**This is not "safe." It is "defensible."** Operator accepts this risk per session message #2.

## 8. Auth model (critical security claim)

- **TGP side:** extension is authenticated to `api.tgp.coach` via the coach's TGP session cookie. The coach must be logged into TGP in another tab for ingest to succeed. Extension never sees a TGP password.
- **Platform side:** extension reads platform's own session cookies via `chrome.cookies` API (host_permissions scoped to platform domains only). Cookies never leave the coach's machine to anywhere except (a) the platform itself, and (b) extracted data fields to TGP.
- **No credentials at rest anywhere.** No KMS. No pgcrypto. No DEK rotation. (D-H6-6 is moot.)

## 9. R-META-4 compliance

Builder: **Opus 4.8 only** (claude_opus_4_8). Auditor: **GPT-5.5 only** (gpt_5_5). No Sonnet. No Gemini. No Haiku. Codified.

## 10. R-META-1 first-principles check

| Question | Answer |
|---|---|
| Question the requirement: Why does TGP need historic platform data? | To onboard a coach in one sitting without losing their existing clients/programs. |
| Delete the part: Can we skip import entirely? | No — operator says this is core go-to-market. |
| Delete the part: Can the coach just paste a CSV? | Only TrueCoach + CoachRx have decent CSVs. Trainerize, MyPTHub, PT Distinction, FitSW do not. Extension is the only universal answer. |
| Simplify what remains: server-side import? | NO — that's the 5000-LOC substrate we just killed. |
| Accelerate cycle time: Day-1 vs week-1? | Day-1 = TrueCoach (operator-testable). Week-1 = all 6. |
| Automate last: when to auto-run? | NEVER. Always requires coach's banner click. Idiot index stays low. |

## 11. Open questions for operator

1. **TrueCoach test account:** Does operator have one, or should builder write blind against go-truecoach's documented endpoint shapes and sample HTML?
2. **Chrome Web Store publish:** Submit to public store ($5 one-time) or distribute unpacked CRX during early onboarding? Recommend: unpacked for first 5 coaches, then submit. Lower idiot index.
3. **Extension UI brand:** Match TGP visual identity (recommend) or generic neutral?

## 12. Next actions (after this spec is approved)

1. Push this spec to `tgp-agent-context` repo as `roadmap/M-IMPORTER-EXTENSION_v1.md`
2. Append ruling #9 to OPERATOR_DECISIONS_LOG
3. Spawn Opus 4.8 builder with Day-1 scope (section 5) only
4. Operator self-test
5. Iterate platforms 2-6 in priority order: CoachRx → MyPTHub → Trainerize → PT Distinction → FitSW

---

**R0/R3 footer:** All commits authored AND committed by `Bradley Gleave <bradley@bradleytgpcoaching.com>`. Zero AI/Claude/agent/Co-authored-by tokens. Ever.
