# Builder Brief — PR #0: ZION.PRESERVE Constitutional Layer

**Model:** Opus 4.8 (per R15 — fixers/builders use Opus-class, never Sonnet)
**Role:** BUILDER-OF-RECORD for the remainder of PR #0
**Dispatch time (UTC):** 2026-07-01T04:00:00Z (approx)

---

## BUILD MATRIX (R124 — mandatory)

```
- zion-preserve HEAD (branch pr0/constitutional-layer): 55abad5817bfeafb628bc91919261efbbd3c1fe3
- zion-preserve HEAD (branch main):                    (empty repo)
- tgp-agent-context HEAD:                              859a5f611f1c592d1cef7c569d0c177158f64714
- doctrine file:                                       /home/user/workspace/zion-context/AGENT_RULES.md  (1,495 lines, 134 numbered rules R1–R137 with R127–R129 skipped)
- timestamp (ISO 8601 UTC):                            2026-07-01T04:00:00Z
```

---

## Operator context (verbatim, do not paraphrase)

1. "always follow AGENT-RULES.md to a tee" — this is LAW.
2. Project renamed: **ZION.PRESERVE** (was Aegis Alpha). Repo `BradleyGleavePortfolio/zion-preserve` (private). Python module `zion_preserve`. Solidity class `ZionPreserveVault`.
3. Chain: **Base** (mainnet + Sepolia). Perps venue: **Hyperliquid** (mainnet + testnet). Solidity 0.8.35. Python 3.14.6.
4. Operator approved dispatching Opus as builder and GPT-5.5 as dual auditors. Operator's exact permission for the Sonnet-authored draft on the branch: "just allow the hand written document - it sjsut words."

---

## PRIOR WORK ALREADY ON THE BRANCH (accept as base, do not rewrite)

Branch `pr0/constitutional-layer` at SHA `55abad5817bfeafb628bc91919261efbbd3c1fe3` contains **12 files, all Sonnet-drafted, all R3-clean**. Operator has waived the R15 provenance concern for these files. **Accept them as your base.** You may propose small corrections in your own commit if you find a doctrine violation — but do NOT rewrite wholesale.

Files present on the branch:

| Path | Rules addressed | Sonnet-noted concerns |
|---|---|---|
| `AGENT_RULES_ZION_MAPPING.md` | R131 exercise applied to all 134 rules; 2 R131 challenges raised (R70, R87) | Verify verdicts are correct against the actual rule text. |
| `.github/PULL_REQUEST_TEMPLATE.md` | R101 | Verify every checkbox maps to a real rule. |
| `.github/CODEOWNERS` | R122 | — |
| `prod-switches.yml` | R108 | Verify schema matches the R108 rule text. |
| `.gitleaks.toml` | R110 | Verify custom regexes actually match what they claim to match. |
| `lefthook.yml` | R104 | Note: the `switch-registry-check` hook has a stub fallback until `scripts/deploy-readiness.py` lands in PR #1. Documented behaviour, not a violation. |
| `.github/workflows/ci.yml` | R71 umbrella + R3 + R101 + R108 + R124 checks | — |
| `.github/workflows/secrets-scan.yml` | R110 | — |
| `.github/workflows/codeql.yml` | R103, R118 | — |
| `.github/workflows/sast.yml` | R118 | The semgrep image digest is a **placeholder** (`sha256:2f8fc9b9...`). You MUST replace with a real, verified digest OR fall back to `pip install semgrep==<pinned>` on `ubuntu-latest`. |
| `.github/workflows/iac-security.yml` | R120 | — |
| `.github/workflows/banned-tokens.yml` | R75, R112 | Verify the grep patterns behave correctly on realistic Python + Solidity diffs. |

---

## OWNS scope (R18 — you do not exceed this)

You OWN, and you may only add or modify, the following:

1. **README.md** — the repo's front door. Sections: project purpose (one paragraph), doctrine link (points at both `AGENT_RULES_ZION_MAPPING.md` in this repo AND `tgp-agent-context/AGENT_RULES.md` upstream), technology stack (locked list from operator: Solidity 0.8.35, Python 3.14.6, uv, Foundry, Base, Hyperliquid), repo structure (planned monorepo layout), status ("PR #0 — constitutional layer; no code yet"), links to the mapping doc + decision log + PR template. **NO code snippets, NO how-to-build sections, NO Getting Started — this repo cannot be built yet.**

2. **DECISION_LOG.md** — append-only journal per R4/R107. First entries capture: (a) the initial repo decisions (chain, perps venue, language versions, license, mono-vs-poly repo, project rename), (b) the PR #0 approach (constitutional layer first, dual-audited before any Solidity or Python), (c) the two R131 challenges raised (R70 wallet-key recovery translation, R87 WCAG N/A-in-v1), (d) operator's "just allow the hand written document" decision, (e) the builder handoff from Sonnet to Opus at SHA `55abad5`.

3. **`.github/workflows/switch-registry-check.yml`** — the CI gate that verifies `prod-switches.yml` completeness. For PR #0 it's a stub (no Python code exists to scan yet), but it MUST be syntactically valid and MUST print a `::notice::` explaining it's a PR-#0 stub. From PR #1 onward it invokes `scripts/deploy-readiness.py`.

4. **`.github/workflows/pr-size.yml`** — R105 PR-size labeler using `pascalgn/size-label-action@v0.5.5` (or the current verified version — pin to a SHA per R95). `size/XL` blocks merge without the `r23-override` label.

5. **`.github/workflows/r3-identity-guard.yml`** — a **dedicated** required check for R3. Separates R3 enforcement from `ci.yml` so it can be a required-status-check on its own under branch protection.

6. **Corrections to the 12 Sonnet-drafted files** — only where you find a concrete doctrine violation, formatting error, or verifiably wrong regex/pattern. Every correction ships in its own commit with message `fix(pr0): <one-line description> [R<rule>]`. Do NOT stylistically rewrite; operator has waived that.

7. **`docs/runbooks/wallet-key-recovery.md`** — the R70 translation runbook stub. First-pass content: three geographic locations (offline metal + password manager + sealed envelope with family), SLIP-39 3-of-5 shards, monthly restore drill schedule on Base Sepolia (signing a $0.01 test tx from a restored key). Stub is fine; PR-#1 fleshes out the drill script.

8. **`handoffs/wave-0/dispatch-ledger.jsonl`** — the R126 telemetry ledger. Append your own dispatch entry (this brief SHA-256, timestamp, model, expected_verdict) as the first row.

You do NOT own:

- Any file under `contracts/`, `bot/`, `scripts/` — that's PR #1+ scope.
- Any change to `AGENT_RULES_ZION_MAPPING.md` beyond a listed correction (operator has explicitly kept the Sonnet draft).
- Branch protection on `main` — that's the operator's action; you write the doc but do NOT run `gh api` to apply it.
- Merging the PR — R14 requires dual auditor CLEAN cycle first. You OPEN the PR only.

---

## Doctrine verification checklist (R17)

Before writing anything, empirically verify each of these against the doctrine file at `/home/user/workspace/zion-context/AGENT_RULES.md`:

- [ ] R101 rule text lists every checkbox required in the PR template
- [ ] R108 rule text specifies the `prod-switches.yml` schema
- [ ] R110 rule text names gitleaks (or an equivalent) explicitly
- [ ] R124 BUILD MATRIX format is the verbatim template in the mapping doc
- [ ] R125 defense-in-depth (rule text + CI gate + audit lens) — confirm every rule enforced by PR #0 has all three
- [ ] R16/R78 verdict-line format is `VERDICT: CLEAN | VERDICT: FINDINGS | VERDICT: REFUSAL | VERDICT: INFRA_DEATH`

Read the full text of any rule you're enforcing — do not enforce from summary.

---

## Execution rules (R3 + R4 + R6 + R14 + R18)

1. **Every commit** uses inline flags:
   ```
   git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m "..."
   ```
   Zero AI/Claude/Computer/Agent/Opus/Anthropic tokens in message, author, committer, or co-authored-by.

2. **Push every 2 minutes** minimum. Named checkpoints:
   - `ckpt: pr0-readme`
   - `ckpt: pr0-decision-log`
   - `ckpt: pr0-workflows-remaining`
   - `ckpt: pr0-runbook`
   - `ckpt: pr0-corrections` (if any)
   - `ckpt: pr0-ready-for-audit`

3. **Foreground only** (R6). No `nohup`, no `&`, no `sleep && push` background loops.

4. **Do NOT self-approve** and do NOT open with a merge intent. Open the PR against `main` with title `PR #0 — Constitutional layer (rule mapping + governance + CI stubs)`. Body uses the PR template. Populate BUILD MATRIX.

5. **Stop conditions:**
   - If any doctrine violation found in the base 12 files that you can't correct in <100 LOC, HALT and return the finding.
   - If ANY external tool (gh, git, python) fails 3× in a row, HALT and return `INFRA_DEATH`.
   - When your OWNS scope is complete AND the PR is open, HALT and return the PR URL + head SHA + BUILD MATRIX.

6. **LOC budget for your work:** ≤400 prod LOC (R23/R76). PR-#0-total including my draft is already ~330 LOC of prod-ish material (yaml/md/toml). Keep your additions under 200 LOC to stay under cap comfortably.

---

## Output on completion

You return, in your final response, this exact structure:

```
## PR #0 Builder Report

### BUILD MATRIX
- zion-preserve pr0/constitutional-layer HEAD: <sha>
- zion-preserve main HEAD: (empty repo — no main commits yet)
- tgp-agent-context HEAD: 859a5f611f1c592d1cef7c569d0c177158f64714
- PR # opened: #<n>
- PR URL: https://github.com/BradleyGleavePortfolio/zion-preserve/pull/<n>
- timestamp UTC: <ts>

### Files owned + shipped
- <list every file you added, with LOC counts>

### Corrections to Sonnet base (if any)
- <list every commit with sha + rule reference + one-line justification, or write "none">

### R131 challenges introduced by builder (if any)
- <list, or "none">

### Doctrine verifications performed
- <list, empirically confirmed against AGENT_RULES.md>

### Known deferrals (with tracking issue links per R20)
- <list, or "none">

### Ready for dispatch
- Lens A (correctness+security) brief: /home/user/workspace/zion-context/briefs/pr0-audit-lens-a.md
- Lens B (tests+contracts+PR hygiene) brief: /home/user/workspace/zion-context/briefs/pr0-audit-lens-b.md
```

You do not write the audit briefs — the parent agent does that after your report lands.

---

## Reference files (read-only)

- `/home/user/workspace/zion-context/AGENT_RULES.md` — the doctrine, 1,495 lines, LAW
- Repo state via `bash` with `api_credentials=["github"]`:
  ```
  cd /tmp && git clone https://github.com/BradleyGleavePortfolio/zion-preserve.git
  cd zion-preserve && git checkout pr0/constitutional-layer
  ```
- GitHub connector for PR creation via `gh` CLI (also under `api_credentials=["github"]`).

Go.
