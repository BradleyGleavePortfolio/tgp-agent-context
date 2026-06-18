# ⭐ START HERE — Ordered Read-List (get context-rich, fast)

Read in this order. Tiers 1–4 are in the context repo `BradleyGleavePortfolio/tgp-agent-context`
(one `git clone` gets all of it). Tier 5 lives at the root of the backend repo once you clone it.
The context repo also holds a large HISTORICAL archive (`SESSION_LOG_*`, `COMMUNITY_*`, `_audit_*`/
`_fixer_*` artifacts, `DEFERRAL_*`) — NOT needed to be Wave-3 work-ready. Skip it unless researching history.

**Tier 1 — Read first (orientation, ~10 min)**
1. `operator-meta/AGENT_47_HANDOFF.md` — THIS doc (current state, snapshotted SHAs, next actions).
2. `operator-meta/OPERATOR_STATE.md` — live lane board / source of truth (read at start of every sweep).
3. `operator-meta/R81_OPERATING_DOCTRINE.md` — core operating doctrine (R0+R81).
4. `operator-meta/AUTONOMY_CONTRACT.md` — what the operator is authorized to do autonomously.

**Tier 2 — Doctrine & rules (internalize before touching code)**
5. `operator-meta/ZOMBIE_AGENT_PROTOCOL.md` — stall detection + snapshot-before-cancel.
6. `quality-references/RUNNER_RESILIENCE_DOCTRINE.md` — canary-before-fanout + work-loss-prevention.
7. `quality-references/BUILDER_BRIEF_TEMPLATE_V2.md` — builder brief template (incl. PUSH-EARLY-WIP).
8. `quality-references/FIXER_BRIEF_TEMPLATE_50FAILURES_AWARE.md` — fixer brief template.
9. `quality-references/50_FAILURES_OF_AI_GENERATED_CODE.md` — banned-pattern / quality bible auditors enforce.

**Tier 3 — Current work plan (what to build next)**
10. `plans/TM_REBUILD_CHAIN_V2.md` — canonical wave plan (Wave 3 = TM-3 ∥ TM-5 ∥ TM-14 ∥ TM-W2; critical path).
11. `plans/TALENT_MARKETPLACE_SPEC.md` — full marketplace spec the TM lanes implement.
12. `plans/CONSUMER_MARKETPLACE_SPEC.md` — consumer-side spec (context for TM-3 public browse).

**Tier 4 — Mobile luxury doctrine (bind into EVERY mobile-facing brief + backend payload contract)**
13. `quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` — luxury doctrine (§5.1 7-step screen protocol).

**Tier 5 — In-repo engineering rules (root of `growth-project-backend` after you clone it)**
14. `AGENT_RULES.md` + `ENGINEERING_RULES.md` — repo-specific coding rules.
15. `RLS_INVESTIGATION_LOG.md` — RLS context (critical for TM-5's PII/RLS gate).
16. `BACKLOG.md` + `CHANGELOG.md` — what's done / what's queued.

---

# AGENT 47 HANDOFF — Emergency Snapshot @ 2026-06-17 18:34 PDT

You are **Agent 47**, Bradley Gleave's operator for **TGP / The Growth Project**, running **R0+R81 doctrine**.
Agent 46's sandbox was being lost; this is the emergency handoff. Everything durable is on GitHub. Read this,
then read `operator-meta/OPERATOR_STATE.md` and `quality-references/RUNNER_RESILIENCE_DOCTRINE.md` in the
context repo (`BradleyGleavePortfolio/tgp-agent-context`).

---

## 0. FIRST 5 MINUTES (do this immediately)

```bash
# Re-clone context repo (workspace is ephemeral)
cd /tmp && rm -rf ctxrepo && git clone --depth 1 https://github.com/BradleyGleavePortfolio/tgp-agent-context.git ctxrepo
cat /tmp/ctxrepo/operator-meta/OPERATOR_STATE.md
cat /tmp/ctxrepo/quality-references/RUNNER_RESILIENCE_DOCTRINE.md
# Verify live backend state
gh pr list --repo BradleyGleavePortfolio/growth-project-backend --state open \
  --json number,title,headRefName,mergeable
```

GitHub access = `gh`/`git` CLI with `api_credentials=["github"]`. NEVER browser_task on GitHub.

---

## 1. WHAT JUST HAPPENED (so you don't repeat it)

- Wave 3 (TM-3 ∥ TM-5 ∥ TM-14) was dispatched as Opus 4.8 builders.
- The **per-builder ephemeral-provisioning layer** had an outage earlier (8 consecutive spawn failures).
  Recovered via canary-before-fanout. Root cause was NOT our code/repo/auth/network — see RESILIENCE doctrine.
- The 3 Wave-3 builders were then **cancelled** during the emergency. **Before cancel, all their
  in-progress work was snapshotted + pushed** (snapshot-before-cancel rule). NO WORK WAS LOST.

## 2. SNAPSHOTTED WAVE-3 STATE (all pushed — RESUME these, don't restart from scratch)

| Lane | Branch | Snapshot SHA | Files present | Status |
|---|---|---|---|---|
| **TM-3** public browse + SEO | `feat/tm-3-public-browse` | `54c84ea` | skeleton + 3 test files (`__tests__/public-listing.service.spec.ts`, `.cursor.spec.ts`, `job-posting-jsonld.spec.ts`) | PR **#434** (WIP). Was 4/4 CI green at skeleton; verify CI on new SHA. |
| **TM-5** apply + pre-coach | `feat/tm-5-apply-precoach` | `af118f6` | `apply.controller.ts`, `apply.service.ts`, `apply.dto.ts`, `apply-fit.ts`, `application-cursor.ts` + module wiring | **NO PR yet.** Branch was unpushed before snapshot. **⚠️ PII OPERATOR SIGN-OFF GATE before merge.** |
| **TM-14** Connect webhook | `feat/tm-14-connect-account-updated-webhook` | `d6d5672` | `talent-connect-webhook.controller.ts`, `.service.ts`, migration `20261220000030_marketplace_connect_event/`, schema + adapter edits, spec | **NO PR yet.** Branch was unpushed before snapshot. |

**These are WIP snapshots, not audited/complete.** For each: re-dispatch an Opus 4.8 builder to FINISH from
the branch (objective: "resume from existing branch HEAD, complete remaining scope, push"), then run the
audit loop. Do NOT start from a blank branch — the scaffolding is already there.

## 3. SCOPE REMINDERS PER LANE (LOC caps are CODE lines only)

- **TM-3 ≤300:** `GET /listings` + `/listings/:id` `@Public()`; faceted filter; keyset tuple pagination
  (`parseTupleCursor`/`buildTupleCursor`); PII-free `PublicListingDto` allow-list; JobPosting JSON-LD builder;
  luxury compact-card payload contract for mobile TM-M2.
- **TM-5 ≤390:** Pre-coach account + Applicant profile + `POST /listings/:id/apply`; behind TM-6 anti-bot
  gate; TM-4 ledger idempotency (P2002 race → recover, not 500); two-way fit (one chip); my-applications
  tuple pagination; PII allow-list DTOs; luxury emotional-confirmation payload for mobile TM-M5.
- **TM-14 ≤170:** Stripe Connect `account.updated` webhook mirroring `src/payouts-v2/payouts-v2-webhook.controller.ts`
  sig-gate (`verifyStripeSignature`/`resolveStripeWebhookSecrets` from `src/billing/stripe-signature.ts`,
  rawBody gate, 400 on bad sig); reuse TM-10 `TalentConnectAdapter` (`onboarded = charges_enabled &&
  payouts_enabled`); event-id idempotency via TM-4 ledger; append-only; polling stays as fallback.
- **TM-W2** (after TM-3 greens): Next.js SEO job page + schema.org JobPosting JSON-LD, ≤380 LOC.

## 4. LIVE GITHUB TRUTH

**Backend `growth-project-backend` — main @ `d04f0c7c`.** MERGED: TM-0 #423, TM-1 #425, TM-4 #430,
TM-10 #431, TM-2 #432, TM-6 #433. Wave 3 in flight = the 3 snapshotted branches above.
- Lane A (custom exercise): #427 (`feat/coach-custom-exercise-data`, MERGEABLE) → base of #428
  (`feat/coach-custom-exercise-api`, was CONFLICTING — needs rebase). Mergeable when operator ready.
- Open issues: #429 (P3), #424 (R82 umbrella), #422 (R82 grandfather).

**Mobile `growth-project-mobile` — main @ `0e6a127b`.** #262 (CONFLICTING, needs rebase), #264→#262,
#265→#264 (MERGEABLE), dependabot #266–#270 (some MERGEABLE/CLEAN). #247 MERGED, #246 CLOSED.

## 5. THE BINDING DOCTRINE (do not violate)

- **≤400 prod LOC/PR** (code only; excl tests/migrations/comments/blanks). Per-lane caps in §3.
- **R74 commits:** `-c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com'`, NO
  Co-Authored-By, NO "Generated with".
- **Roles:** Builder/Fixer/Planner = **Opus 4.8** (`claude_opus_4_8`); Auditors = **DUAL GPT-5.5**
  (`gpt_5_5`); **NEVER Sonnet**. `codex_codebase` NOT available → use `codebase` model=`gpt_5_5`.
- **Banned in src/ (incl __tests__) = P0:** `@ts-ignore`, `as any`, `as unknown as`, `as never`,
  `.catch(()=>undefined)`, "Coming soon". (`@ts-expect-error` + `as {concrete shape}` OK.)
- **Audit loop:** builder done → dual GPT-5.5 audit (A=correctness/security/RLS, B=tests/contracts), each in
  its OWN isolated worktree (`metadata.repo_url`), pinned to head SHA → Opus 4.8 fixer on findings →
  **MANDATORY re-audit** (audited SHA must == head) → **merge only on true dual-CLEAN + CI green**.
- **Auto-merge pre-authorized** when BOTH auditors return CLEAN_NO_FINDINGS.
- **TM-5 extra gate:** do NOT merge without **operator PII sign-off** (it touches applicant PII/RLS).
- **Fly Deploy CI fails every commit** (paused staging) — SUPPRESS, not a real gate.
- **Every subagent uses its OWN isolated worktree.** **Snapshot-before-cancel** any zombie (commit+push to
  its branch BEFORE cancelling).
- Squash-merge: `gh pr merge <N> --squash --repo BradleyGleavePortfolio/growth-project-backend`.
- Build: `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit`; jest `--testPathPatterns` (plural).
  Migrations dated `> 20261220000020`. Node v20, prisma 6.

## 6. STANDING USER RULES (verbatim, binding)

1. Work via the rules/flows codified. 2. Give product-direction choices in simple terms/metaphors
(CLEAN metaphor FIRST — kitchen/airport — THEN user POV). 3. Keep working autonomously, keeping GitHub
updated cleanly for the next operator. Plus: KYC/anti-bot = BUILD IN-HOUSE. Mobile luxury doctrine: bind
`MOBILE_APP_DESIGN_INTELLIGENCE.md` into every mobile UI brief AND into backend payload contracts that feed
mobile screens.

## 7. KEY ARTIFACTS (all in context repo)

- `operator-meta/OPERATOR_STATE.md` — durable lane board (read at start of every sweep, update R74 at end).
- `quality-references/RUNNER_RESILIENCE_DOCTRINE.md` — canary-before-fanout + work-loss-prevention stack.
- `quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md` — luxury doctrine (§5.1 7-step protocol).
- `quality-references/BUILDER_BRIEF_TEMPLATE_V2.md` — has PUSH-EARLY-WIP mandatory section.
- `plans/TM_REBUILD_CHAIN_V2.md` — canonical wave plan. Wave 3 = TM-3∥TM-5∥TM-14∥TM-W2; Wave 4 =
  TM-7/8/9 + TM-M2/TM-W5. Critical path: TM-0→TM-1→TM-5→TM-12→TM-13.

## 8. NEXT ACTIONS FOR YOU (Agent 47)

1. Verify the 3 snapshot branches' CI; confirm nothing was lost (diff against §2 file lists).
2. Re-dispatch FINISH builders for TM-3 / TM-5 / TM-14 from their existing branches (Opus 4.8, isolated
   worktrees, PUSH-EARLY-WIP). Watch the provisioning layer; if spawns die → canary-before-fanout (§ doctrine).
3. Run the audit loop per lane; merge on dual-CLEAN. TM-5 needs operator PII sign-off too.
4. After TM-3 greens → dispatch TM-W2.
5. Update OPERATOR_STATE.md (R74) after each material change.
