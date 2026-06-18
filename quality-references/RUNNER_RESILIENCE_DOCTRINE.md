# Runner Resilience Doctrine — Surviving Subagent-Provisioning Outages

**Owner:** Agent 46 (operator) · **Project:** TGP / The Growth Project
**Status:** ACTIVE doctrine · **Last updated:** 2026-06-18 (after the 8-failure ephemeral-provisioning outage)
**Audience:** the next operator. Read this the first time a wave of subagents starts dying at spawn.

---

## 0. The one-paragraph version

When subagents start failing at *startup* (clone-fail, sandbox-timeout, "paused sandbox not found"), the
problem is almost never your code, your repo, your auth, your wifi, or core Perplexity. It is the
**per-builder ephemeral-sandbox provisioning layer** flaking during boot/mount/egress. The correct
response is NOT to brute-force retry the whole wave — that burns credits fanning N agents into a degraded
layer. Instead: **(1) stop the fan-out, (2) fire ONE lightweight canary, (3) fan out only if the canary
survives.** And independent of outages, keep the **work-loss-prevention stack** always on so a dropped
sandbox costs *seconds*, not the task.

---

## 1. The metaphor first (per standing rule)

**Kitchen metaphor.** You're the head chef. Each dish (a TM feature) goes to a *line cook* (a subagent) at
their own station (an ephemeral sandbox). Tonight the building's power kept browning out — every time you
sent a cook to a fresh station, the burners wouldn't light (sandbox failed to provision). Three things kept
the kitchen from losing the whole night's service:

1. **Order tickets on the rail (OPERATOR_STATE.md on GitHub).** Every dish's full recipe is written on a
   ticket clipped to the rail, not held in a cook's head. A cook walks off mid-dish? The next cook reads the
   ticket and resumes. Nothing lives only in a station that can lose power.
2. **Plate-as-you-go (push-early-WIP).** Cooks plate partial progress to the pass constantly instead of
   holding a finished dish hostage at their station. If a burner dies, you lose the last 30 seconds of
   chopping, not the dish.
3. **Send a runner to test one burner before the rush (the canary).** When the power's flickering, you don't
   send all six cooks to all six stations at once. You send ONE runner to light ONE burner. If it lights,
   the brownout passed — fire the full line. If it doesn't, you wait, and you haven't wasted six cooks' time.

**Your POV (operator):** the "runner idea" = a cheap, read-only probe subagent you fire *before* committing
real work to the runner pool. The work-loss stack = GitHub state + early pushes so a lost runner is a
shrug, not a restart.

---

## 2. Root-cause triage — is this even an outage?

Before declaring an outage, rule out the cheap stuff (this is the exact ladder that worked tonight):

| Suspect | How to check (from YOUR sandbox) | Tonight's result |
|---|---|---|
| Disk full | `df -h /home/user/workspace` | 53% used / 9.3 GB free — fine |
| RAM | `free -h` | 7.6 GB free — fine |
| Network / GitHub egress | `curl -s -o /dev/null -w '%{http_code} %{time_total}s\n' https://github.com` | 200 / 43 ms — fine |
| Repo / auth | `gh api repos/<owner>/<repo> --jq .full_name` | OK |
| Your own clone speed | `time git clone --depth 1 <repo> /tmp/probe` | ~1 s — fine |

If all five are green **and subagents still die at spawn**, the fault is the **per-builder provisioning
layer**, not anything you control. That is the signal to switch from "debug" to "canary + ride it out."

**Stage-correlation check (do this once per outage):** note *which* lane survived. Tonight the **heaviest**
lane (TM-3) was the survivor and lighter lanes died — proving the flake was **stage-correlated**
(boot/mount/egress timing), **NOT workload-correlated**. Don't waste time "making the agents lighter"; that
won't help a boot-stage flake.

---

## 3. The Canary Protocol (the "runner" idea)

**Rule: canary-before-fanout.** Whenever the provisioning layer has shown ANY instability in the current
session, probe before you fan out.

**What a canary is:** one subagent, as lightweight and side-effect-free as possible. Ideal canary = a
read-only `codebase` subagent told to clone the target repo, print the head SHA, and exit. It exercises the
exact failing path (provision → mount → git fetch) without touching real work or burning a build.

**Decision rule:**
- Canary **survives** (clones + returns) → provisioning recovered → fan out the full wave immediately.
- Canary **dies at spawn** → layer still degraded → do NOT fan out. Wait (a short cooldown), then re-canary.
  Do not burn N real builders into a layer that just killed a no-op probe.

**Why one probe, not N retries:** firing the real wave into a degraded layer costs N × (provision attempt +
partial work + credits) per round. One canary costs ~one cheap probe and gives you a clean go/no-go.

**Liveness truth:** a subagent showing `"running, cannot interrupt"` is **NOT** proof it's alive and
progressing. Use **git + filesystem as the durable proxy**: branch head SHA + last-commit time, and the
presence of the expected `*_REPORT.md`. A branch unchanged **>3h** while its agent is "in-progress" = likely
zombie/loop → investigate → cancel + re-dispatch from its branch. A green branch simply awaiting the next
audit round is **normal** unless untouched >3h.

---

## 4. The Work-Loss-Prevention Stack (always on, outage or not)

This is the layer that makes a dropped runner a non-event. Two mechanisms, both mandatory:

### 4a. OPERATOR_STATE.md on GitHub = pre-baked context handoff
The durable lane board lives in the **context repo** (`tgp-agent-context`, `operator-meta/OPERATOR_STATE.md`),
**not** in the ephemeral workspace. READ it at the start of every sweep; UPDATE + commit (R74) at the end of
every material change. Because it's on GitHub, a full sandbox reset loses *nothing* — the next operator (or
the next you, after a reset) reconstructs full state in one `git clone`.

### 4b. Push-early-WIP = plate-as-you-go
Every builder is briefed (see `BUILDER_BRIEF_TEMPLATE_V2.md` → "🛟 PUSH-EARLY-WIP MANDATORY") to push a
**compiling** WIP and open its PR **early**, before the feature is complete. Proven twice tonight: TM-3's
sandbox dropped, but because it had already pushed skeleton `7e01bd77` (4/4 CI green) and opened PR #434, the
loss was **seconds of re-dispatch**, not the whole feature. A builder that holds everything until "done" and
then dies takes the work with it.

### 4c. Hand-build fallback
If the spawner re-fails persistently and a lane is critical-path, YOUR sandbox is healthy and can build by
hand. A clean backend clone for this lives at `/tmp/gpb` (re-clone if reset). Recon map for fast hand-builds:
- TM-10 Connect adapter: `src/talent-marketplace/connect-adapter.service.ts`
- TM-4 idempotency ledger: `src/talent-marketplace/marketplace-idempotency.service.ts`
- Webhook convention: `src/payouts-v2/payouts-v2-webhook.controller.ts`
- Stripe sig verify: `src/billing/stripe-signature.ts`
- TM module: `src/talent-marketplace/talent-marketplace.module.ts`
- `@Public()` decorator: `src/common/decorators/public.decorator.ts`

---

## 5. Should the canary be a recurring scheduled task? (the open product choice)

**Recommendation: NO — keep it in-session, not on a recurring schedule.** Honest tradeoff:

- A **standing scheduled canary** costs a little credit **every run, forever**, to guard against an event
  that tonight was a **rare, hours-long one-off**. It only earns its keep if you expect spawn-flakiness to
  be **frequent** (say, multiple nights a week).
- The **in-session canary-before-fanout doctrine** (§3) already fully covers a rare outage at **zero
  standing cost** — you only probe when you've actually seen instability, which is exactly when it's worth it.

**Tripwire to revisit:** if you hit subagent-provisioning outages on **3+ separate sessions within ~2 weeks**,
the flakiness is no longer a one-off — at that point a cheap automated CI-driven canary that pauses the
dispatcher before a fan-out becomes worth its recurring cost. Until then: in-session canary only.

---

## 6. Operator runbook — copy/paste sequence when spawns start dying

```
1. Triage (§2): df -h ; free -h ; curl github ; gh api repo ; time git clone  → all green?
2. If green + still dying → declare provisioning outage. STOP fanning out.
3. Note which lane (if any) survived → confirm stage- vs workload-correlation (§2).
4. Fire ONE read-only canary subagent (clone + print head SHA + exit). (§3)
5. Canary dies → short cooldown → re-canary. Do NOT fan out.
6. Canary survives → fan out the full wave as audited Opus 4.8 builders, each in its OWN
   isolated worktree (metadata.repo_url), each briefed with PUSH-EARLY-WIP.
7. Sweep via git proxy, NOT "running" status: head SHA + last-commit-time + *_REPORT.md.
   Unchanged >3h while "in-progress" = zombie → SNAPSHOT (commit+push its worktree to its
   branch) BEFORE cancel, then re-dispatch from the branch.
8. Update OPERATOR_STATE.md (R74) + this file if doctrine evolved.
```

---

## 7. Hard rules referenced above (so this doc stands alone)

- **Snapshot-before-cancel:** ALWAYS commit + push a zombie's worktree to its branch BEFORE cancelling it.
  Never delete a runner's work without snapshotting first.
- **Isolated worktrees:** every subagent uses its OWN isolated worktree via `metadata.repo_url`.
- **R74 commits:** `-c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com'`, NO
  Co-Authored-By, NO "Generated with".
- **Roles:** Builder/Fixer/Planner = Opus 4.8; Auditors = DUAL GPT-5.5; NEVER Sonnet.
- **Fly Deploy CI** fails every commit (paused staging) — SUPPRESS, not a real gate.
- **GitHub via `gh`/`git` CLI** (`api_credentials=["github"]`), NEVER browser_task on GitHub.

---

*This document is the durable record of the "runner/canary" resilience idea plus the existing work-loss-
prevention stack, written so the next operator inherits it without re-deriving it under fire.*
