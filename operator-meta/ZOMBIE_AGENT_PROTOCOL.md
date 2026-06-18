> **Note:** Content is also reflected in /AGENT_RULES.md. This file remains active for backward compatibility with running crons.

# Zombie Agent Protocol — R81 Operating Doctrine §X

**Owner:** Bradley Gleave
**Author:** Operator R81-current
**Date:** 2026-06-16
**Status:** AUTHORITATIVE — incorporate into next revision of `R81_OPERATING_DOCTRINE.md` as §14
**Read alongside:** `operator-meta/R81_OPERATING_DOCTRINE.md`, `handoffs/HANDOFF_R81_WAVE_1_5.md`, `handoffs/HANDOFF_R81_WAVE_1_5_ADDENDUM_PR_ACCOUNTING.md`

---

## §1 — Definition

A **zombie agent** is a subagent whose process has terminated (cancelled, credit-exhausted, timed-out, completed-but-summary-lost, or evicted by compaction) but whose **work product still exists somewhere the current operator cannot see by default**:

- A `/tmp/` worktree with uncommitted changes
- A pushed branch with no PR opened
- An open PR with no audit dispatched
- A workspace file (`/home/user/workspace/audit-work/...`) never migrated to `ctx/`
- A commit on a branch the handoff doc doesn't mention
- An audit doc filed locally but never pushed to `tgp-agent-context`
- A subagent return summary that mentioned work but got compacted away

The agent is dead. The work is alive. The operator doesn't know.

**This is the single highest-velocity failure mode in this codebase right now** because:
- R81 doctrine requires high parallelism (dual auditors, separate fixers, architect+builder splits)
- Each cancellation, credit-exhaust, or compaction is a potential zombie
- The handoff chain has already proven brittle (compaction flattened R80→R81-current attribution silently)

---

## §2 — How zombies are created (the actual mechanisms)

### 2.1 — User-initiated cancellation
Operator or user calls `cancel_subagent`. The subagent stops. **But:**
- Any commits it pushed before cancel are still on the remote branch
- Any worktree files it wrote are still in `/tmp/`
- Any workspace files it wrote are still in `/home/user/workspace/`
- If a PR was opened, the PR is still open
- The cancellation return tells you "cancelled" but does not list residual artifacts

**Example from this thread:** The Phase 2 PR1 fixer (#417 follow-up) was cancelled mid-cycle. It had already pushed F1-F5 commits and the PR was open with CI green. Without my doctrine doc explicitly calling it out, the next operator would have to discover PR #417 themselves.

### 2.2 — Credit exhaustion
Subagent runs out of credits mid-task. It returns a partial/empty result. **But:**
- Whatever it had committed/pushed before exhaustion remains
- It does not get a chance to write a "here's where I left off" summary

**Example from this thread:** Two W1.5-A3 builder spawns credit-exhausted. Both left zero code commits (verified) but each spent real effort that the operator doesn't have receipts for in the conversation.

### 2.3 — Compaction eviction
Long sessions auto-compact. The summary preserves selected facts but **loses fine-grained subagent return values**. The next operator (or the same operator after compaction) cannot scroll back to read what a subagent reported.

**Example from this thread:** The compaction that triggered this session lost attribution between R80's backfill work and R81-current's narrow work. User caught it; I had to reconstruct from `ctx/audits/` and the supplied confession doc.

### 2.4 — Wide-browse / batch tool completion-without-readback
Tools like `wide_browse` write results to a JSON file but the operator must explicitly read that file. If the operator forgets to read it, the data is zombie-equivalent.

### 2.5 — Background cron termination
Cron-spawned background agents do work but their summaries are not in the foreground conversation. If a cron run wrote files into `cron_tracking/<id>/`, those are zombies until the operator reads them.

### 2.6 — Sandbox-only work that never reached `git push`
The most insidious form: a subagent did the work in its worktree, wrote files, **ran tests**, but never executed `git push`. The work dies when the sandbox is reclaimed.

---

## §3 — The detection checklist (run this FIRST on every operator pickup)

This is what the next operator must do **before claiming the state is understood.** Run all of these in order. Each finds a different zombie class.

### 3.1 — GitHub-side sweep (find pushed-but-untracked work)

```bash
# All open PRs across both repos — any PR not mentioned in HANDOFF is suspect
gh pr list --repo BradleyGleavePortfolio/growth-project-backend --state open --limit 50 \
  --json number,title,headRefName,headRefOid,createdAt,updatedAt,statusCheckRollup
gh pr list --repo BradleyGleavePortfolio/growth-project-mobile --state open --limit 50 \
  --json number,title,headRefName,headRefOid,createdAt,updatedAt,statusCheckRollup

# All branches updated in the last 7 days — any branch not tied to an open PR or merged is suspect
gh api repos/BradleyGleavePortfolio/growth-project-backend/branches --paginate \
  --jq '.[] | select(.name != "main") | {name, sha: .commit.sha}'
gh api repos/BradleyGleavePortfolio/growth-project-mobile/branches --paginate \
  --jq '.[] | select(.name != "main") | {name, sha: .commit.sha}'

# Recent commits on main that aren't tied to a known merged PR
gh api repos/BradleyGleavePortfolio/growth-project-backend/commits --paginate \
  --jq '.[0:30] | .[] | {sha: .sha[0:8], msg: .commit.message | split("\n")[0], date: .commit.author.date}'

# Recent commits on tgp-agent-context main (audit docs and handoffs land here)
gh api repos/BradleyGleavePortfolio/tgp-agent-context/commits --paginate \
  --jq '.[0:30] | .[] | {sha: .sha[0:8], msg: .commit.message | split("\n")[0], date: .commit.author.date}'
```

**Red flags:**
- An open PR whose `headRefOid` is NOT mentioned in the latest handoff doc
- A branch whose tip commit is newer than the handoff doc's last update
- A commit on `main` whose message doesn't match a known merged PR
- An audit doc commit on `tgp-agent-context` for a PR you don't recognize

### 3.2 — Workspace-side sweep (find files written but not pushed)

```bash
# Anything under audit-work that's not mirrored in tgp-agent-context yet
ls -la /home/user/workspace/audit-work/outputs/ 2>/dev/null
ls -la /home/user/workspace/audit-work/briefs/ 2>/dev/null

# All markdown files in workspace root and one level down (operator scratchpads)
find /home/user/workspace -maxdepth 2 -name '*.md' -type f -printf '%T+ %p\n' 2>/dev/null | sort -r | head -30

# All cron_tracking dirs — each holds state from background runs
ls /home/user/workspace/cron_tracking/ 2>/dev/null
for d in /home/user/workspace/cron_tracking/*/; do
  echo "=== $d ==="
  ls -la "$d" 2>/dev/null | head -5
done
```

**Red flags:**
- A `.md` file in workspace whose filename matches a PR or wave (e.g. `W1_5_A3_*`, `PR417_*`) — likely an output that should have been pushed to `ctx/`
- A `cron_tracking/<id>/` dir with files dated newer than the last operator handoff
- Any file under `audit-work/` whose name doesn't appear in `ctx/audits/` or `ctx/briefs/` on `tgp-agent-context`

### 3.3 — Sandbox-side sweep (find stranded worktrees)

```bash
# All /tmp/ worktrees from prior subagent sandboxes
ls -d /tmp/*/.git 2>/dev/null | xargs -I {} dirname {}

# For each one, check for uncommitted or unpushed work
for wt in /tmp/*/; do
  if [ -d "$wt/.git" ]; then
    echo "=== $wt ==="
    cd "$wt" || continue
    git status --short 2>/dev/null
    git log --branches --not --remotes --oneline 2>/dev/null | head -5
    echo
  fi
done
```

**Red flags:**
- A worktree with `git status` output (uncommitted changes never preserved)
- Unpushed commits (`git log --branches --not --remotes`) — these die when the sandbox is reclaimed
- A worktree whose branch name matches a wave/PR but isn't on the remote

**Caveat:** R81-current's sandbox may not have R80's worktrees (different session, different VM). The sweep is still valuable because *current-session* zombies are the most common ones.

### 3.4 — `ctx/audits/` reconciliation (find audits filed but not in handoff)

```bash
gh api repos/BradleyGleavePortfolio/tgp-agent-context/contents/ctx/audits --jq '.[] | .name' | sort
gh api repos/BradleyGleavePortfolio/tgp-agent-context/contents/ctx/briefs --jq '.[] | .name' 2>/dev/null | sort
```

Cross-reference every audit doc against the handoff's PR ledger. Any audit doc for a PR the handoff doesn't list → zombie audit.

### 3.5 — Backfill ledger reconciliation

```bash
gh api repos/BradleyGleavePortfolio/tgp-agent-context/contents/ctx/BACKFILL_LEDGER.md \
  --jq '.content' | base64 -d
```

Confirm the ledger's "audited" column matches the actual files in `ctx/audits/`. A row marked "audited" without a corresponding file is a zombie record. A file without a ledger row is a zombie audit.

### 3.6 — Conversation-history sweep (find evicted-turn references)

```bash
ls /home/user/workspace/current_session_context/turns/ 2>/dev/null | head -20
grep -rEl 'subagent|PR #[0-9]+|cancelled|credit' /home/user/workspace/current_session_context/turns/ 2>/dev/null
```

If turns are evicted, grep them for subagent IDs, PR numbers, "cancelled", "exhaust" — any mention of incomplete work that the current operator hasn't seen.

### 3.7 — Subagent ID audit

The handoff doc and `ctx/audits/` filenames sometimes reference subagent IDs (e.g. `audit_pr_200_r81_backfill_mqeouild`). Search both repos for these IDs:

```bash
grep -rE 'subagent[_-]?id|audit_pr_|fix-pr-|builder_|architect_' /home/user/workspace/ 2>/dev/null | head -20
```

Any subagent ID that appears in a workspace file but NOT in a `ctx/` file is a zombie's footprint.

---

## §4 — The verification matrix (do this for every zombie candidate found)

When §3 surfaces a candidate, run this matrix to decide what to do:

| Question | If YES | If NO |
|----------|--------|-------|
| Is the work committed to a remote branch? | Move to Q2 | Investigate — may be stranded in sandbox or workspace; recover if possible, otherwise mark lost |
| Is there an open PR for the branch? | Move to Q3 | Open PR or document why no PR (e.g. it was merged already — verify SHA) |
| Has the PR been audited per R81 (dual GPT-5.5)? | Move to Q4 | Dispatch dual auditors NOW before any merge action |
| Is the audit doc filed in `ctx/audits/` on `tgp-agent-context`? | Move to Q5 | Push the audit doc with R74 identity |
| Does the handoff doc mention this PR/branch by SHA? | Done — confirmed | Add to next handoff addendum |

---

## §5 — Recovery procedures by zombie class

### 5.1 — Uncommitted worktree work
If `git status` shows changes in a `/tmp/` worktree:
1. Inspect the diff: `git diff` and `git status`
2. If the changes are valuable: commit with R74 identity, push to a new branch named `recovery/<wave>-<short-desc>`, open PR
3. If not valuable or duplicative: document the loss in an addendum, then delete the worktree

### 5.2 — Pushed branch with no PR
1. Check the branch tip: `git log -1 origin/<branch>`
2. If CI is green and the work matches a known wave: open the PR with a recovery note explaining the zombie origin
3. If the work is orphaned (no longer fits the plan): document in `ctx/audits/ABANDONED_BRANCHES.md` with rationale, then delete the remote branch

### 5.3 — Workspace files not in `ctx/`
1. Read the file to understand its role (audit, brief, plan, scratchpad)
2. Determine target directory in `tgp-agent-context`:
   - Audit reports → `ctx/audits/<wave>/`
   - Builder/fixer briefs → `ctx/briefs/<wave>/`
   - Architect resolutions → `ctx/architecture/<wave>/`
   - Operator scratchpads with reusable doctrine → `operator-meta/`
3. Copy, commit with R74, push
4. After confirming push success, delete the workspace file (R52/R64 compliance)

### 5.4 — Open PR with no audit
1. Run dual GPT-5.5 audit per R81 (`correctness/security` + `tests/contracts` in parallel)
2. File both audit docs to `ctx/audits/<wave>/`
3. Present verdict to operator before any merge action

### 5.5 — Audit filed but PR untracked
1. Add the PR + audit to the next handoff addendum's PR ledger
2. Cross-reference to `BACKFILL_LEDGER.md` and update if needed

### 5.6 — Subagent return summary lost to compaction
1. Grep `current_session_context/turns/` for the subagent ID
2. If found: read the turn file and reconstruct the work product
3. If not found: treat as fully zombie — run §3 sweeps to find residual artifacts

---

## §6 — Prevention (operator habits going forward)

These are HABITS for the next operator, enforced as doctrine. Adopt them or zombies will keep accumulating.

### 6.1 — Never cancel a subagent without reading the latest cron_tracking / turn / workspace state first
Before `cancel_subagent`, run a quick `git status` + `ls workspace/audit-work/` to capture what the agent has produced so far. If you cancel without this, you can't recover its work.

### 6.2 — Every subagent objective must end with "FINAL ACTIONS: push all commits, push all docs to tgp-agent-context, list every file written"
Force the subagent to do its own R52/R64 push *before* it returns. Then its return summary tells you exactly what landed where.

### 6.3 — After every subagent completes, run `git status` in any worktree it owned
If `git status` is non-empty, the subagent left work behind. Either re-dispatch or commit yourself with R74 identity.

### 6.4 — Every handoff doc must have a §Attribution table with operator + PR + commit SHA + branch
This is the single most important anti-zombie habit. Compaction can erase context but the table preserves attribution.

### 6.5 — Run the §3 detection checklist at the START and END of every operator session
Start-of-session: discover inherited zombies. End-of-session: confirm you don't leave any for the next operator.

### 6.6 — Cron heartbeat reports must include a "zombie risk" line
Each hourly heartbeat should explicitly state: *"Zombie risk: NONE / LOW / MEDIUM / HIGH — open worktrees: <count>, unpushed branches: <count>, workspace audit files unmigrated: <count>."* If any number > 0, escalate.

---

## §7 — Live zombie hunt findings (executed 2026-06-16 17:20 PDT)

The checklist was actually run. Findings below are LIVE STATE, not theoretical.

### 7.1 — Catastrophic handoff drift detected

My own `HANDOFF_R81_WAVE_1_5_ADDENDUM_PR_ACCOUNTING.md` (commit `0702c86`) is **already stale**. While I was writing it, the previous operator(s) continued doing work I was unaware of. Live state:

**PRs merged AFTER my last handoff write that I missed:**
- **PR #417** — MERGED at `0b7622ee` (2026-06-16 20:28Z) — I had documented this as OPEN. It was already merged when I wrote the addendum.
- **PR #420 (W1.5-A3.1)** — MERGED at `849ee47` (2026-06-16 22:02Z) — I had documented A3 as "not started." It was built and merged.
- **PR #421 (W1.5-A4)** — MERGED at `81d96dd` (2026-06-16 23:55Z) — A whole new wave I had zero knowledge of.
- **PR #401** — MERGED at `b6cb4cfb` (2026-06-16 23:56Z) — Just minutes ago.
- **PR #405** — MERGED at `28c5f757` (2026-06-16 22:08Z) — Roman ED with R81 cleanup, completely unmentioned.

**PRs currently OPEN that my handoff never mentioned:**
- **PR #414** — `feat/me-feature-flags-endpoint` (CI ?)
- **PR #413** — R81 rebuild of #395+#402 with N1 push-throttle fix (CI all 4 green)
- **PR #412** — R81 rebuild of #326 (CI ?)
- **PR #403** — R81 cleanup of #401 (CI all 4 green)
- **PR #183** — Phase-11 talent marketplace (open since May, way outside R81 scope)
- **Mobile PR #262** — `chore/db-drop-coach-direct-enabled-column` — listed as MERGED 2026-05-21 — possibly stale data, verify

### 7.2 — Doctrine doc path errors

My doctrine bundle (`96f6eb7`) and addendum (`0702c86`) reference paths that DON'T EXIST:
- I wrote `ctx/audits/` and `ctx/briefs/` — neither exists on `tgp-agent-context`
- The actual audit doc convention is **root-level** (e.g. `_audit_HK_5b_R1_code_GPT55.md`) or **feature-subdirectory** (e.g. `applehealthkit/expansion/_audit_HK_5a_R1_code_GPT55.md`)
- All R52/R64 migration instructions in my handoff are wrong on path

### 7.3 — Workspace zombie file inventory (the REAL count)

Not 8 files as I claimed. Actual count under `/home/user/workspace/audit-work/outputs/` = **~180 files** including:
- `POST_MERGE_PR249/250/251/252/253/254/326/395/396/397/398/400_AUDIT_*` — R80 backfill audit outputs, never pushed to `tgp-agent-context` root
- `PR249/250/251/252/253/254/326/398/399/400/401_AUDIT_2026-06-14.md` — primary R81 audits
- `PR262/263_REAUDIT_*` — re-audits for mobile rebuild
- `PR403/405_REAUDIT*` — multi-round re-audits  
- `PR412/413/414_REAUDIT_*` — R81 rebuild PR audits
- `W1_5_A1/A2/A3_*` — wave 1.5 audits (correctness, tests-contracts, final, fixer reports, scope resolutions)
- `PR_263_FINAL_FINAL_GPT55_AUDIT.md` (note: "FINAL_FINAL") — multi-round re-audit

Under `/home/user/workspace/audit-work/briefs/`:
- `CANONICAL_AUDIT_BRIEF.md`
- `W1_5_A2_FIXER_BRIEF.md`
- `W1_5_A3_BUILDER_BRIEF.md`

### 7.4 — Sandbox worktrees confirmed clean (after fetch)

Initial sweep flagged `/tmp/wave-1-5-planning-push/` as having unpushed commits. **False alarm:** the commits ARE on the remote — my initial `git log --branches --not --remotes` ran before `git fetch`, so it didn't know the remote had advanced past them. After `git fetch`, all 7 local commits verified as ancestors of `origin/wave-1-5-planning` (tip `81d96dd`).

**This itself is a zombie protocol lesson:** ALWAYS `git fetch` first before running the `--not --remotes` check, or you'll get false positives.

Other worktrees scanned: `/tmp/a3-arch`, `/tmp/audit-pr263-final`, `/tmp/backend-survey`, `/tmp/ctx-survey`, `/tmp/ctx-synth`, `/tmp/handoff-push`, `/tmp/tgp-agent-context` — all clean (no uncommitted changes, no unpushed commits after fetch).

### 7.5 — Backfill ledger does NOT exist at expected path

`gh api repos/BradleyGleavePortfolio/tgp-agent-context/contents/ctx/BACKFILL_LEDGER.md` returns 404. My handoff and addendum both reference `ctx/BACKFILL_LEDGER.md` as authoritative. **Either it lives elsewhere or it never existed.** Next operator MUST locate it via:

```bash
gh api repos/BradleyGleavePortfolio/tgp-agent-context/git/trees/main?recursive=1 \
  --jq '.tree[] | select(.path | test("backfill|ledger"; "i")) | .path'
```

If truly missing, R80's mental model of "the ledger" was a working doc that never got pushed — itself a zombie.

---

## §8 — Specific zombie hunt for the next operator picking up THIS thread

Run these commands first. They are tailored to known suspected zombies in the current state:

```bash
# 1. Verify PR #417 is still open and CI green
gh pr view 417 --repo BradleyGleavePortfolio/growth-project-backend \
  --json number,state,mergeable,statusCheckRollup,headRefOid,headRefName

# 2. Check for any other open PRs not mentioned in HANDOFF §21 or addendum
gh pr list --repo BradleyGleavePortfolio/growth-project-backend --state open --json number,title,headRefName
gh pr list --repo BradleyGleavePortfolio/growth-project-mobile --state open --json number,title,headRefName

# 3. Confirm doctrine bundle + addendum landed
gh api repos/BradleyGleavePortfolio/tgp-agent-context/commits/main \
  --jq '{sha: .sha[0:8], msg: .commit.message | split("\n")[0]}'
# Expect tip == 0702c86 (addendum) or newer

# 4. Workspace zombie sweep — the known 8 files
ls -la /home/user/workspace/audit-work/outputs/ /home/user/workspace/audit-work/briefs/

# 5. Check for any /tmp/ worktrees with unpushed work (probably empty in fresh sandbox)
for wt in /tmp/*/; do
  if [ -d "$wt/.git" ]; then
    cd "$wt" && echo "=== $wt ===" && git status --short && git log --branches --not --remotes --oneline | head -3
  fi
done

# 6. Verify BACKFILL_LEDGER matches reality
gh api repos/BradleyGleavePortfolio/tgp-agent-context/contents/ctx/BACKFILL_LEDGER.md --jq '.content' | base64 -d | grep -E '^\|' | head -25
```

If any of those return unexpected results, **stop and investigate before doing any new work.**

---

## §9 — The metaphor (coach-to-client)

Imagine a gym where ten trainers rotate through. Each trainer sometimes sets a barbell down mid-set and walks out (cancellation), or their shift ends mid-rep (compaction), or they get pulled into a fire drill (credit exhaustion).

The plates stay loaded. The bar stays on the rack. The next trainer walks in cold and **doesn't know which bars are warm.** If they assume every bar is empty, they get crushed by an unexpected load. If they treat every bar as suspect, they waste a whole shift inventorying.

The zombie protocol is the inventory sheet on the wall: *before you touch any new weight, walk the floor and check every rack.* It takes ten minutes. It prevents the next operator from getting steamrolled by R80's or R81-current's leftover plates.

**Run §3 first. Always. Every time you pick up the thread.**

---

**End of protocol.**