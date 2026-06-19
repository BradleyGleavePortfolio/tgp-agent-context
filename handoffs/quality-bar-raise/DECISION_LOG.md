# Wave H — Quality Bar Raise Decision Log

Append-only log of decisions made during the Wave H rollout (H1-H6 hyperscaler infra).
Format: each entry has Context / Options / Choice / Why / Reversibility.

---

## 2026-06-18 PM — Wave H authorized + plan written

**Context.** Operator approved all 6 H-waves (H1-H6) after reviewing the "what hyperscalers do that we don't" gap analysis. Operator added the PROD_READINESS_TEST idea (codified as R100).

**Options considered for ordering.**
1. Ship all 6 waves tonight in parallel — rejected (Wave 4 collision risk, R14 violation).
2. Ship none tonight, queue all behind Wave 4 — rejected (10-hour window is too valuable to waste on configs).
3. Ship H1 + H2 tonight (config + CI only, no Wave 4 collision), queue H3-H6 — CHOSEN.

**Choice.** Plan documented in /QUALITY_BAR_RAISE_JOB.md (commit forthcoming). H1 + H2 dispatch tonight in parallel; H3-H6 queued for after Wave 4 lands.

**Why.** H1 and H2 are pure-additive (configs, CI workflows, scripts) — no runtime code paths touched, no migrations, no Wave 4 collision. The other waves either touch services (H4, H6), require external provisioning (H3, H5), or both. Better to do them sequentially with full audit cycles.

**Reversibility.** High. Every wave is a separate PR; any wave can be reverted independently. R102 branch protection activation is the only one-way door, and that's gated on operator approval (D-H2-2) and lands AFTER Wave 4.

**Open operator decisions before each wave dispatches.** See per-wave "Operator decision points" in QUALITY_BAR_RAISE_JOB.md (D-H1-1 through D-H6-5).

---

## 2026-06-18 ~22:00 PT — D-H1-1 + D-H1-2 resolved (H1 finalized)

**Context.** H1 PR #455 needed two unresolved decisions before merge.

**D-H1-1 — security.txt contact host.** Operator quote: "no clue → make it up; email bradley@bradleytgpcoaching.com". CHOSEN: `https://api.thegrowthproject.app` for the production API hostname (derived from operator's already-owned `thegrowthproject.app` domain). Email kept as bradley@bradleytgpcoaching.com per R3 identity.

**D-H1-2 — Renovate mode.** Operator quote: "Renovate active vacuum cleaner mode". CHOSEN: patch + minor auto-merge enabled for BOTH devDependencies AND production dependencies, with required CI green. Major bumps still require operator review.

**Choice.** Both committed to H1 branch as commit `7a280b83` "wave-h1: D-H1-1 + D-H1-2 resolved" and pushed to `quality-bar-h1-configs`. PR #455 now ready for dual audit gate.

**Reversibility.** High. Renovate config is a single YAML knob; security.txt host is a single line.

---

## 2026-06-18 ~22:30 PT — Mid-session pivot: skip subagents for build work

**Context.** Operator observed prior codebase-subagent attempt on H2 created a polluted branch (multiple stale subagent commits, contradicting commit signatures, and incomplete work). Operator quote: "skip subagents and have me build H1 (done) + H2 + H4 directly with my own tools".

**Choice.** All H-wave BUILD work (H1, H2, H4) executed by parent agent directly via bash + edit + write tools, no codebase subagents. Codebase subagents formally off-limits for the remainder of this session. Subagents may still be used for AUDITS (R14 dual-audit gate) because audits require independent eyes per R10.

**Why.** Build phase needs deterministic file authorship + clean git history. Audit phase needs adversarial independence. Different goals → different tooling.

**Reversibility.** N/A — operational guideline, not a code change.

---

## 2026-06-18 ~22:45 PT — H2 build complete + pushed

**Context.** H2 = CI workflows + branch protection + PR hygiene per QUALITY_BAR_RAISE_JOB.md.

**Q1-Q4 + Q6A resolved during build:**
- **Q1 (migration reversibility)** — Operator: "Grandfather clause for migration reversibility". CHOSEN: pre-existing irreversible migrations are exempt; new migrations must include a down() or grandfather note in the PR.
- **Q2 (versioning at pre-launch)** — Operator: "Pre-Launch - zero rev, zero users → 0.x.x". CHOSEN: release-please-manifest seeded at `0.1.0`; will flip to `1.0.0` on public GA.
- **Q3 (protected branches script verification)** — Operator: "check and verify this for me, I have no idea". CHOSEN: script written per GitHub Pro REST API docs; documented that it must run from operator's local machine against github.com (proxy lacks GitHub Pro for private repo protection).
- **Q4 (enforce_admins)** — Operator: "Yes, bouncer cards owner too → enforce_admins: true". CHOSEN: branch protection script sets `enforce_admins: true`.

**Files shipped to `quality-bar-h2-ci-workflows` (2 commits, SHA `58a5f1a2`):**
- 6 workflows: migration-dry-run, sbom, release-please, pr-checks-watcher, r100-quality-gate, danger
- scripts/setup-branch-protection.sh
- .release-please-config.json + .release-please-manifest.json (start 0.1.0)
- .github/CODEOWNERS (default owner @BradleyGleavePortfolio/bradley)
- dangerfile.js (R107 soft markers: Conventional Commits, body-has-Why, >400-LOC warn, banned-cast tokens warn, prisma without README warn)

**Open dependency.** r100-quality-gate.yml depends on H4 landing first (npm script `readiness:check` doesn't exist on main yet).

**Reversibility.** High. Workflows can be reverted as a single PR. Branch protection script is opt-in (operator runs from local).

---

## 2026-06-18 ~23:00 PT — Q5 + Q6B resolved; R108 codified

**Context.** H4 build needed scanner architecture choices and an open question about env var registration enforcement.

**Q5 (scanner strategy)** — Operator: "Smart smoke + context-aware + recursive learning". CHOSEN: stub-scanner uses (a) hard pattern list (BLOCK_SHIP), (b) exempt-zone allowlist for legitimate definers (env-validation.ts), (c) learning ledger of fingerprinted operator adjudications (recursive learning).

**Q6 Part A** — Operator: "100's though" → scan codebase + propose registry entries. CHOSEN: Python script combined ENV_RULES from src/common/env-validation.ts (86 entries) + grep of `process.env.*` across src/ (126 new entries) → 212 total in prod-switches.yml.

**Q6 Part B — NEW RULE.** Operator quote (verbatim): "MAKE THIS A RULE AND ENFORCE IT!" — every new env var must register in prod-switches.yml or CI fails. **Codified as R108 in `AGENT_RULES.md` commit `c5977e9`**: "every new env var must register in prod-switches.yml or CI FAILS. No exceptions, no warn-only."

**Reversibility.** Medium. R108 is a doctrine rule (durable). Removing it requires explicit operator approval.

---

## 2026-06-18 ~23:15 PT — Q7-Q10 resolved during H4 build

**Q7 (provider list)** — Operator: "dozens of providers - wearables, mail, apple, sms, whisper → needs list made". CHOSEN: 12 providers seeded in provider-wiring.ts: Apple Sign-in, Google OAuth, Stripe, OpenAI, Anthropic, Resend (email), Mux (video), Oura, WHOOP, Sentry, PostHog, Expo push. Whisper TBD — not surfaced as a separate provider yet; will be added once a transcription path is wired.

**Q8 (test runtime budget)** — Operator: "20 min budget OK". CHOSEN: 20-minute soft ceiling. Current runtime ~9s, ~130x headroom.

**Q9 (auto-flip + STUB handling in prod)** — Operator: "auto-flip ON in prod if OFF; STUB/NOT_WIRED → don't ship + add to 'Operator keys needed' doc". CHOSEN: auto-flipper.ts honors `auto_flip_on_in_prod: true` for ON|OFF switches only; never flips MUST_SET / STUB_ALLOWED. STUB providers emit `OPERATOR_KEYS_NEEDED.md` and produce verdict `NEEDS_OPERATOR` (blocks ship without operator action).

**Q10 (H4 partition)** — Operator: "make H4 into H4.A and H4.B and do both tonight, together". CHOSEN: H4.A (foundation: env scanner + stub scanner + registry + R108) and H4.B (provider wiring + auto-flip + operator-keys-generator + recursive learning ledger) shipped together as a single PR #457.

**Reversibility.** High. All H4 files are additive; revert deletes the spec and modules.

---

## 2026-06-18 ~23:35 PT — H4 build complete + pushed; PRs #456 + #457 open

**Context.** H4 fully built locally, committed in 6 logical chunks, pushed.

**H4 PR #457 (`quality-bar-h4-prod-readiness`, SHA `0f3f1ffd`) — 6 commits:**
- `cf440249` seed prod-switches.yml (1,296 lines, 212 switches)
- `6e12f720` scanner modules (8 files under test/prod-readiness/, ~1,000 LOC)
- `e309f7f5` learning ledger seed (11 fingerprints: 1 false_positive + 10 tracked_debt)
- `c12de551` orchestrator spec (test/deploy-readiness.spec.ts, 209 lines, 6 assertions)
- `22a32b06` dep + script wiring (js-yaml + 3 npm scripts)
- `0f3f1ffd` OPERATOR_KEYS_NEEDED.md (auto-generated initial snapshot)

**Test result.** 6/6 PASS in 8.73s, verdict `NEEDS_OPERATOR` (correct: surfaces 1 unset MUST_SET + 12 provider STUBs).

**H2 PR opened.** #456 — title "wave-h2: CI workflows + branch protection + PR hygiene (R102 R106 R107)".
**H4 PR opened.** #457 — title "wave-h4: PROD_READINESS_BOARD — single test, whole-codebase truth (R100 R104 R108)".

**Dual audits dispatched per R14:**
- H2 Lens A (security/perf/data) on SHA `58a5f1a2`
- H2 Lens B (arch/tests/observability) on SHA `58a5f1a2`
- H4 Lens A on SHA `0f3f1ffd`
- H4 Lens B on SHA `0f3f1ffd`

All briefs embed BRIEF_PREAMBLE_R100.md + AGENT_RULES R10 + R6 + R3 + R13 verbatim. NO pre-filled findings. R16 verdict line required.

**Reversibility.** High. PRs are independent and can be closed without merging.

---

## 2026-06-18 23:54 PT — H2 #456 dual audit verdicts (R16 classification)

**Context.** Both Lens A + Lens B returned for H2 PR #456 at SHA `58a5f1a2`.

**H2 Lens A: VERDICT: FINDINGS** — 12 findings (P0=0, P1=2, P2=4, P3=6)
- F-01 P1: `release-please-action@v4` not SHA-pinned + `contents:write` (supply-chain on main)
- F-02 P1: All 6 new workflows use mutable version tags (`@v6`, `@v8`, `@v5`, `@v4`)
- F-03 P2: pr-checks-watcher missing concurrency group → TOCTOU duplicate comments
- F-04 P2: `require_code_owner_reviews: false` defeats CODEOWNERS
- F-05 P2: `${{ ... }}` inline expression in shell heredoc (expression injection)
- F-06 P2: `@cyclonedx/cdxgen@10` major-only pin + `--no-audit`
- F-07/F-08/F-10/F-11/F-12 P3: swallowed error in dangerfile; mutable npx pins; missing GH_REPO format check; listComments no pagination; no job timeouts
- F-09 P3: commits not GPG-signed (pre-existing repo-wide gap, not regression)

**H2 Lens B: VERDICT: FINDINGS** — 19 findings (P0=0, P1=3, P2=5, P3=11)
- F-01 P1: Test:Src ratio = 0.00 (R100.A1 requires ≥ 2.0); no shellcheck/actionlint/danger-dry-run documented
- F-02 P1: Net LOC = 757 (R100.A3 cap = 400); CI gate passes vacuously because scope excludes infra files
- F-03 P1: migration-dry-run.yml reversibility check is existence-only despite header promising forward→down→forward execution
- F-04 P2: r100-quality-gate.yml has 400-600 warning band exiting 0 (softens A3); scope misses infra files
- F-05 P2: dangerfile.js §5 async IIFE may never execute before Danger flushes
- F-06 P2: setup-branch-protection.sh full PUT destroys pre-existing settings
- F-07 P2: sbom.yml `security-events: write` unused (no SARIF upload)
- F-08 P2: sbom.yml header claims DT submission; no code implements it
- F-09 P3: PR title + commit messages violate Conventional Commits (Danger's own check would fail this PR)
- F-10-F-19 P3: various — missing pin SHAs, undocumented infra exclusions, BREAKING CHANGE footer not detected, .h2-status.txt stale file committed, etc.

**Stuck classifier (AGENT_RULES R16).** Both ended with explicit `VERDICT: FINDINGS`. Not STUCK, not REFUSAL, not INFRA_DEATH. Per R14: NO MERGE until cycle-back resolves all P0-P3.

**Overlap between lenses:** F-02 (Lens A) and F-16 (Lens B) report the same SHA-pinning gap. F-08 (Lens B) overlaps the spirit of F-06 (Lens A) on cdxgen. These count once when consolidated.

**Notable cross-audit observation:** Both lenses flagged the SAME class of "CI gate measures the wrong scope" issue — Lens A via missed action pinning + missing concurrency; Lens B via R100.40 (same-bug-everywhere) on r100-quality-gate scope + dangerfile.js touched set. Both point at the same architectural flaw: infra files are unchecked by infra gates.

**Decision.** Hold action until H4 audits return so fixes can be batched (SHA-pinning fix is identical across both PRs). Mark for fixer dispatch after H4 verdicts in.

**Reversibility.** N/A — classification.

---
