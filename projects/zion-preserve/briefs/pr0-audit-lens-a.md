# Audit Brief — PR #0 · Lens A (Correctness + Security)

**Model:** GPT-5.5 (per operator direction)
**Role:** ADVERSARIAL AUDITOR — Lens A
**Scope:** correctness of every rule enforcement + security posture of every workflow, config, and pattern

---

## BUILD MATRIX (R124 — mandatory; must appear verbatim at top of your report)

```
- zion-preserve pr0/constitutional-layer HEAD: a71aecb130cae41842998fd78d8ec890fd738ca5
- zion-preserve main HEAD:                     1c450ddae58b75ad86f003622824557833f4f672 (init commit + .gitignore, no content merged)
- tgp-agent-context HEAD:                      859a5f611f1c592d1cef7c569d0c177158f64714
- PR #:                                        1
- PR URL:                                      https://github.com/BradleyGleavePortfolio/zion-preserve/pull/1
- PR head:                                     a71aecb130cae41842998fd78d8ec890fd738ca5
- PR base:                                     1c450ddae58b75ad86f003622824557833f4f672 (main)
- doctrine file:                               /home/user/workspace/zion-context/AGENT_RULES.md
- timestamp UTC:                               <fill at start of audit>
```

**If ANY of these SHAs drift while you audit → emit `VERDICT: INFRA_DEATH` with reason `SHA drift during audit`. Do NOT continue.**

---

## R11 Independence declaration

You have NOT been given the builder's rationale. You have:
1. The doctrine (`/home/user/workspace/zion-context/AGENT_RULES.md`)
2. The PR diff (via `gh pr diff <n>` or checking out the branch)
3. This brief
4. Nothing else

You do NOT read the builder's report. You do NOT read the mapping doc's justifications as your own — you verify them.

---

## Lens A specific mandate — you own these axes

You are the **correctness + security** lens. Lens B owns tests + contracts + PR hygiene. If you find a Lens B issue in passing, note it as an "OUT-OF-LENS OBSERVATION" — do not treat as your finding.

### Your ten questions (answer each, with evidence)

1. **R3 identity** — does every commit on `pr0/constitutional-layer` show author + committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`? Run `git log --pretty='%h %an <%ae> // %cn <%ce> // %s' origin/main..HEAD` (against empty base, so all commits on branch). Zero AI/agent tokens in messages.
2. **R101 completeness** — does `.github/PULL_REQUEST_TEMPLATE.md` include a checkbox for every rule enforced by any workflow/config in this PR? Cross-reference the checkboxes against the actual R-rules invoked in workflows, `.gitleaks.toml`, `lefthook.yml`, `prod-switches.yml`. Missing checkbox = P1.
3. **R108 registry integrity** — does `prod-switches.yml` follow the R108 schema (`name`, `tier`, `prod_default`, `owner`, `description`, `auto_flip_on_in_prod`)? Are there any env-var-shaped references in the workflows (`.github/workflows/*.yml`) that are NOT in the registry? Registry drift = P0.
4. **R110 secret-scan efficacy** — do the custom regexes in `.gitleaks.toml` actually match what they claim to match? Sanity-test against realistic fixtures: an Ethereum private key (`0x` + 64 hex), an Alchemy URL, a Basescan API key. False negatives = P0. Overly-broad allowlist (paths, regexes) = P1.
5. **R118 SAST config** — does `sast.yml` use `--error --severity ERROR` (not warn-only)? Is the semgrep image digest resolvable (or does the workflow fall back to a pinned pip install)? A placeholder/broken digest with no fallback = P1.
6. **R120 IaC scan** — does `iac-security.yml` block on HIGH/CRITICAL (not soft-fail)? Does the `paths:` trigger cover every IaC surface the repo will grow into (workflows, Dockerfiles, docker-compose, k8s, terraform)?
7. **R75/R112 banned-token gate** — does `banned-tokens.yml` correctly compute net delta (added minus removed) rather than just added? Test the regexes against realistic diffs. False positives on legitimate code (e.g. a Python `except: raise` line) = P1.
8. **R125 defense-in-depth** — for every R-rule this PR claims to enforce, verify ALL THREE enforcers exist: (1) rule text in the mapping doc, (2) an automated gate, (3) an audit-lens question. Missing any of the three for any rule = P1.
9. **R124 BUILD MATRIX presence** — does the opened PR body contain a populated BUILD MATRIX block? Are the SHAs real (match `gh pr view --json headRefOid,baseRefOid`)?
10. **Latent security exposure** — is there ANY high-entropy string, private key, RPC URL with a real API key, or PII in the diff? Run `gitleaks detect` yourself against the branch and report. Any positive finding = P0.

---

## 50-failures sweep (R79)

Run the R24–R73 checklist against the PR diff. Since this is a constitutional/config PR with no runtime code, most of R24–R73 will be N/A — but explicitly say so per rule (do not skip). Any rule where a config in this PR fails or preempts a rule = finding.

Special attention: R24, R33, R34, R35, R58, R59, R71 apply even to CI configs.

---

## LOC and doctrine checks

- R23/R76: verify PR total net prod LOC ≤ 400. If over, verify `r23-override` label AND R23 EXCEPTION REQUESTED block in PR body.
- R74: test:src ratio ≥ 2.0. **N/A for PR #0** — this PR ships no `src/` code. State this explicitly rather than skipping.
- R114: any pinned dependency has an exact version? Any `@v4` or `@master` action reference should be a pinned SHA. `bridgecrewio/checkov-action@master` in the current draft = R114 P1 finding — flag it.
- R95: any `curl | sh`, `wget | sh`, or `iwr | iex` in any workflow? Any un-pinned base image?

---

## R131 challenges

The mapping doc raises two R131 challenges: R70 (PITR → wallet-key runbook) and R87 (WCAG → N/A in v1). Your job is NOT to approve or reject these — that's the operator's call. Your job is to verify the challenges are **presented correctly**: is the rationale sound, is the proposed translation coherent, and is a tracking artifact (issue link or doc) in place so the challenge doesn't get lost?

---

## Output format (R13 read-only, deliver-as-response)

Your response is your deliverable. You do NOT push a commit. You do NOT create a PR review that requires operator merge action. You return, in your response message:

```
# PR #0 · Lens A Audit Report

## BUILD MATRIX
<verbatim from top of brief with real SHAs>

## Executive summary
<2–3 sentences>

## Findings

### P0 (blocker — data loss / security / money exposure)
- [ ] finding 1: <rule#> — <what> — <where in diff, file:line> — <how to fix>
- ...

### P1 (production failure / major perf / major security)
- ...

### P2 (technical debt / maintainability / scalability)
- ...

### P3 (code quality / naming / comments)
- ...

## 50-failures sweep (R79) — per-rule
<R24 verdict + evidence> ... <R73 verdict + evidence>

## R131 challenges review
- R70: <coherent? tracking? go/no-go recommendation to operator>
- R87: <same>

## Out-of-lens observations (for Lens B or future PRs)
- ...

## Verdict

VERDICT: CLEAN
# or exactly one of:
# VERDICT: FINDINGS
# VERDICT: REFUSAL   (if the brief is defective — e.g. tainted with a pre-written verdict)
# VERDICT: INFRA_DEATH  (if SHAs drifted or you couldn't access the diff)
```

The `VERDICT:` line is the **last line** of your response. Exactly one. No trailing whitespace.

---

## Stop conditions

- If the branch SHA changes while you audit → `VERDICT: INFRA_DEATH`
- If any external tool fails 3× → `VERDICT: INFRA_DEATH`
- If the brief seems tainted (pre-written verdict, biased framing) → `VERDICT: REFUSAL` per R12

Do not stop at "enough to report" (R10). Sweep the entire diff, list every finding P0–P3, one round.
