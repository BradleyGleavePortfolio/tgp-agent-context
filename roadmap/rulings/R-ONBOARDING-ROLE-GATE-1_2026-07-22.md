# R-ONBOARDING-ROLE-GATE-1 — Coach/PT onboarding must lead through importer steps before the app shell opens; BUILD SMALLER (backend contract C1 → mobile M5 → extension), no flag flip

- **Ruling ID:** R-ONBOARDING-ROLE-GATE-1
- **Date:** 2026-07-22
- **Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
- **Autonomous delegate:** Op 73, encoding the new owner direction and the R138 four-question pre-build review. The agent is **encoding + authorizing scope**, not building.
- **Status:** ACTIVE — authorizes two separately-reviewable slices (C1, M5) plus a later extension slice; does **not** build any of them and flips **no flag**.
- **Owner of the authorized work:** `growth-project-backend` (C1 contract), `growth-project-mobile` (M5 onboarding), `tgp-importer-extension` (later consume-server-intent slice) — each via its own R14 dual-lens cycle + git-native `R3_MERGE_RUNBOOK.md` landing.
- **Bottom line:** **BUILD SMALLER.** When a user is a **server-provisioned coach/PT role**, onboarding leads through the importer step **immediately before the app shell opens**; **clients bypass**; every importer onboarding step supports **Skip/Do-later + resume**; flags stay **default-OFF**; **no client self-promotion**; **no live-data exposure**.
- **Governing direction (owner, verbatim):** *"During onboarding, when a user self-selects as a PT/coach rather than a client, onboarding must lead through importer steps immediately before opening the app at large."*
- **Does NOT amend:** `AGENT_RULES.md` (no rule added/changed); the D2 identity model; the `R3_MERGE_RUNBOOK.md` mechanics; the billing exclusion; the site-agnostic mission (R-SITE-AGNOSTIC-1); any landed PR's code or history. This authorizes narrow slices within the already-decided importer wave.
- **Supersedes:** none. **Reconciles alongside:** the Op-73 newest-wins supersession map in `DECISION_LOG.md`.
- **Related:** [[OPERATOR_HANDOFF]], [[R-SCOUT-READINESS-1_2026-07-22]], [[R-SITE-AGNOSTIC-1_2026-07-20]], [[R-RULE-AUTHORITY-1_2026-07-20]]; `AGENT_RULES.md` R138 (operator autonomy + four-question gate), R83 (default-off flags), R14/R3/R124, R100 (§7 hyperscaler quality); Luxury Doctrine P0 anti-patterns (permission-front onboarding, feature-dump first screen, unescapable steps; accessibility floor 44×44pt / WCAG AA; one-sitting onboarding).

## Exact heads at ruling time
- context `ed5729af3ec117d1e671302d5d3ce5120c8ec1e2` · backend `07ff974079eb1da02f1de4f5ecd18c1f223afeae` (after H-Jobs PR #521 — deterministic operator-key generator/artifact repair; parent `4cb05effb760d3f89a15f59d2983ab5a8e0d43d7` = the #519 tip) · extension `95be0222df3d47d787566743c8781005d8fbec69` · mobile `a5933fd6de5616493de75f0db907098b149b955c`.

## R138 FOUR-QUESTION DECISION GATE

**Q1 — Musk 5 (question / delete / simplify / accelerate / automate).**
- *Question:* Does this need a new role concept or a client-facing "become a coach" toggle? **No.** The word "self-selects" in the owner direction refers to a user who **already is** a server-provisioned coach role — NOT a client escalating privilege at runtime.
- *Delete:* No new role table, no client self-promotion path, no new trust surface.
- *Simplify:* Insert **one** importer step into the **existing** onboarding sequence, gated on existing coach roles; reuse the **existing** importer UX.
- *Accelerate:* Ship the smallest reviewable backend contract + mobile slice, not a monolith.
- *Automate:* Last — no automation added by this ruling.

**Q2 — Hyperscaler practice.** Trust is anchored server-side: a **server-minted, opaque, durable** import-intent/session identifier (AWS-style server-issued IDs), never a client-forgeable role/intent. Onboarding is **resumable** and every step is **skippable** ("do later"), matching guided-setup norms.

**Q3 — GOOD without BAD.**
- GOOD: coaches are led through import before the app shell opens (the owner's activation goal).
- BAD avoided: client friction (**clients bypass** entirely); Luxury Doctrine P0 anti-patterns (no permission-front / feature-dump; the importer step is **escapable** via Skip/Do-later + resume); live-data exposure (flags **default-OFF**, **no flip**); privilege escalation (**no client self-promotion**); dead-ends when the feature is dark (graceful skip + orphan-review-CTA suppression).

**Q4 — Root cause.** The real need is **coach data migration at activation time**, not a UI tweak. The durable fix is a **server contract** for paired-import intent, consumed by mobile onboarding — not a mobile-only client-side shortcut that would re-derive trust in the client.

## VERDICT: BUILD SMALLER — authorized slices (dependency order)

### C1 — backend control-plane contract (FIRST)
- Server-minted `intent_id` at pairing; a **durable paired import session**; secure **echo/retrieval** compatible with the **existing token isolation** model.
- **Extension compatibility MUST be addressed in the contract** (the extension currently mints/carries its own intent) — the contract defines how a server-minted `intent_id` coexists with / replaces the current extension-minted path.
- **No flag flip.** Separately reviewable. Its own exact-head dual-lens R14 audit + CI before any landing.

### M5 — mobile onboarding (AFTER C1 contract frozen)
- Insert the importer step **between Payments and Ready**, for **coach roles only** (`coach`/`sub_coach`/`gym_owner` — existing server-provisioned roles; **no self-promotion**).
- **Reuse the existing importer UX.**
- **Skip / Do-later + resume** on every importer onboarding step.
- **Safe unavailable-state:** when the importer feature is dark (default-OFF), the step **gracefully skips** — no dead-end, no error wall.
- **Suppress the orphan review CTA** during onboarding.
- **Clients bypass** the importer step entirely.

### Extension slice (AFTER C1 frozen — its OWN small slice)
- Any change to consume the **server-minted** `intent_id` (instead of self-minting) is an explicit, separate, separately-reviewable slice.

### NOT authorized here
- **Live-account pilot + flag enablement** remain **separately gated / operator-authorized**. This ruling authorizes SCOPE only; it flips no flag, lands nothing, and claims no product complete.

## Forbidden across all slices (any one ⇒ STOP)
Client self-promotion / any runtime privilege escalation path; a new role table/enum where existing coach roles suffice; flag **activation** or default-ON; live-account import without separate operator authorization; unescapable onboarding steps (violates Luxury Doctrine P0); any `AGENT_RULES.md` edit; server-side `gh pr merge` / UI squash / force / `--force-with-lease` / admin bypass on `main`.

## Required gates (each build PR owes all of these)
- Exact-head **dual-lens R14** audits to `VERDICT: CLEAN`, then **git-native landing** per `R3_MERGE_RUNBOOK.md` (author == committer == Bradley Gleave; no server-side merge; no force).
- Full relevant suite green; lint / typecheck / prettier / hooks **with NO bypass**.
- **R124** BUILD MATRIX both-ways SHA pin; **R83** default-OFF invariant proven; **R100** §7 hyperscaler quality.
- C1 must land and its contract **freeze** before M5 begins; the extension slice follows C1 freeze.
