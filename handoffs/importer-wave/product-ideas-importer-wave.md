# Importer-wave product ideas — operator-endorsed

**Filed:** 2026-07-07 23:25 PDT (America/Los_Angeles).
**Operator endorsement (verbatim, 2026-07-07 23:25 PDT):** "your prior ideas overall for the product were great"
**Origin turn:** DARK_ROUTE_GUARD_ORDERING decision turn (Op 52 → successor handoff).
**Purpose:** R5 (never lose anything). These are product directions, not committed work. Candidates for `roadmap/specs/A02-import-tooling.md` amendment and the v0.4+ roadmap.

> **Scope note (2026-07-15, Op 55):** Billing is now an explicit **excluded** data family for v0.3 and v1.0 importer capture per operator directive (see `OPERATOR_HANDOFF.md` §0 and `current-state.json` `billing_scope_exclusion`). The billing references below (idea #2 "Reading billing"; idea #3 "Billing-gaps") are retained as historical brainstorming only and are **not** in scope — the importer must not capture, stage, log, reconstruct, or claim completion for billing data.

---

## 1. Pairing as a device-flow, not a password workaround
Code-only for v0.1. Lean into the Netflix / Spotify / GitHub-CLI device-flow familiarity: mobile shows the 6-digit code with a calm "Enter this on your computer's TGP extension" screen; last-4 + nonce anti-phishing echo on redeem; clear post-pair confirmation on the phone ("This desktop is now paired to your TGP account — you can close this window"). The pairing moment is a trust surface, not a form.

## 2. Import progress as a coach trust surface (mobile timeline)
Replace the bare spinner with a narrated timeline the coach watches on their phone while the desktop crawls: "Connected to TrueCoach → Reading clients (47) → Reading programs → Reading billing → Ready to review." Makes the ~2-min ETA feel intentional rather than slow. Enabled by PR #500's cross-device progress mirroring.

## 3. Post-import review/commit screen — don't silently write everything
After capture, show a clean diff grouped by Clients / Programs / Billing-gaps, with Roman/Maya-voiced suggested fixes for mismatches ("12 clients have no email — skip or flag?"), then a single "Commit to my roster" action. Converts the importer from "data moved" to "coach confident" — the actual go-to-market win.

## 4. Site-agnostic "watch-once, replay-forever" recorder — vNext, not this wave
The spec's north star: capture JSON as it loads on any site, no per-platform extractor code, 6× smaller maintenance surface. Right long-term architecture, but v0.4+ — do not stuff into the 5 in-flight PRs. Spec says "when to auto-run? NEVER" — every replay stays coach-clicked, so it never crosses the ToS line.

## 5. Wire importer commit into the M5 coach-led migration funnel
Per OPERATOR_DECISIONS_LOG (2026-06-26 M5 scope-floor ruling): the moment an ImportSession commits, Roman prompts the coach to fan out the super-loaded download link to every imported client across Resend email + SMS + push. Turns "I imported my roster" into "my clients are installing TGP" in one tap. Importer's real payoff: activating the migrated base, not just moving data in.

## 6. Open spec questions to resolve now
1. TrueCoach test account — does the operator have one, or do builders write blind against `go-truecoach` endpoint shapes?
2. Distribution — unpacked CRX for the first 5 coaches, then Chrome Web Store submission ($5 one-time)? Lower idiot index for the early cohort.

---

**R3 footer:** Committed as Bradley Gleave <bradley@bradleytgpcoaching.com>. Zero AI/Claude/agent/Co-authored-by tokens.
