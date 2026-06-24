# HANDOFF — Operator 49 → Operator 50

**Wave 1: COMPLETE.** Backend main: `02812619023d79f09952ffcf768bf6496a61f737`.

## What Wave 1 closed (Operator 49 portion)

| PR | Name | Merge SHA | Notes |
|----|------|-----------|-------|
| #464 | H4.B env-discovery | `1892622018` | R5 dual-lens CLEAN |
| #465 | H4.D provider-wiring | `9bf6d66f` | R5 dual-lens CLEAN |
| #466 | H4.F auto-flipper | `02812619` | R5a→R5c NOT_CLEAN (gate env-source drift, both lenses converged) → R5d fixer (single-source via `opts.env` threading) → R5e dual-lens CLEAN both |

## STANDING RULES (still active, do not change)

1. **READ EVERY DOCUMENT IN FULL. DO NOT SKIM.**
2. **R3 commit identity:** author AND committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`. NO Claude/AI/Anthropic/Co-authored-by/Assistant tokens.
3. **R72 dual-lens:** Lens A = Opus 4.8 (depth), Lens B = GPT-5.5 (breadth); both must independently CLEAN.
4. **R82:** NEVER Sonnet for fixers/builders/planners. Opus 4.8 for fixers/Lens A. GPT-5.5 for Lens B.
5. **R-live-push:** push every commit immediately.
6. **STRICT zero-finding doctrine.** Every audit finding must close, no followup-PR escape.
7. **Auto-merge rule:** dual-lens adversarial CLEAN → squash-merge automatically.
8. **"check"** = status + zombie detection.
9. **Adversarial auditor mandate:** find ANY AND ALL problems, not "was last problem fixed."

## NEW RULES ESTABLISHED THIS SESSION (locked)

### 10. Subagent sandbox extraction — HARD RULE
**"IF YOU END A SUBAGENT, YOU PULL EVERYTHING OUT OF ITS SANDBOX FIRSTTTTTTT!!!!"**

Every subagent objective MUST contain: "MANDATORY PRE-TERMINATION OUTPUT RULE: Write final output to `/home/user/workspace/` BEFORE terminating. NEVER `/tmp` inside sandbox — that filesystem is lost on termination." This is enforced because a fixer once died with code on disk but in its sandbox, work lost.

### 11. Choice workflow
When a choice arises:
1. Research LIVE what hyperscalers (AWS/GCP/Stripe/Twilio/etc.) do.
2. If one option is clearly viable / what hyperscalers do → do it, don't ask.
3. If multiple are viable → ask in this exact format:

```
Option 1 — XYZ — WHAT x,y,z HYPERSCALERS WOULD DO
Explanation of solution
Clear kitchen/airport metaphor

Option 2 — XYZ — WHAT x,y,z HYPERSCALERS WOULD DO
Explanation of solution
Clear kitchen/airport metaphor (SAME style, SAME situation as Option 1, different solution)
```

### 12. Dependabot auto-merge
Auto-merge after dual-lens adversarial CLEAN.

### 13. Backlog work order (LOCKED)
- **PHASE 1 — MAJORS FIRST, solo** (no parallel lanes in same repo): `@nestjs/core`, `axios`, `@types/node 26`, `fast-check 4`, expo group. Each gets dual-lens adversarial → CLEAN → auto-merge → next major. Backend majors can run parallel to mobile majors (different repos), never two backend majors at once.
- **PHASE 2 — Minor/patch parallel lanes:** Lane A (backend, one PR at a time) + Lane B (mobile, one PR at a time), dual-lens, auto-merge, next. Never two PRs in same repo simultaneously.
- **PHASE 3 — Track 1 P1 bugs** from R81-backfill audit issues (backend #406/#407, mobile #258/#260).
- **PHASE 4 — File new P2 issues** from this session's audits (see below).

### 14. Expo version flag
User said "66→67" but mobile `package.json` has `expo "~56.0.11"`. **Needs clarification before Phase 1 expo bump.**

## ADVERSARIAL AUDIT FINDINGS (need to be filed as new issues)

Third-party reporter pattern this session: ~75% false-positive / inflated-severity rate. Always verify before filing.

| Finding | Repo | Severity | Title | Audit Report |
|---------|------|----------|-------|--------------|
| R2-Claim-2 | mobile | P2 | `refreshEntitlement` never called on purchase-completion path (CheckoutReturnScreen). In-app webview means AppState bg→fg re-check never fires; stale `inactive` gate persists. Reporter mis-attributed to `handleSubscribe`. | `/home/user/workspace/r2_claims_audit_report.md` |
| R1-P0-3 | mobile | P2 (down from P0) | macro target | `/home/user/workspace/p0_claims_audit_report.md` |
| R1-P0-7 | backend | P2 (down from P0) | failed-resend body-match | `/home/user/workspace/p0_claims_audit_report.md` |
| R3-Claim-1 | mobile | P2/P3 | RootNavigator `bootstrapAuth` concurrency guard absent (self-converging) | `/home/user/workspace/r3_claims_audit_report.md` |

REFUTED outright (do NOT file): R1-P0-1 (cache stale), R1-P0-2 (polling bomb), R1-P0-5 (empty idempotency), R2-Claim-3 (ProtectedScreen infinite spinner — provider always wraps), R3-Claim-3 (foodLogQueue race — no production caller).

## BACKLOG INVENTORY (the "~28 other audit findings" user referenced)

73 audit reports total. R81-backfill open issues:

**Backend (20 findings, 2 P1):**
- #406 (1 P1 / 2 P2 / 1 P3)
- #407 (1 P1 / 0 P2 / 0 P3)
- #408 (0 / 4 / 2)
- #409 (0 / 3 / 1)
- #410 (0 / 3 / 2)

**Mobile (38 findings, 4 P1):**
- #256 (0 / 3 / 2)
- #257 (0 / 4 / 2)
- #258 (2 / 6 / 2)
- #259 (0 / 3 / 1)
- #260 (2 / 4 / 3)
- #261 (0 / 2 / 2)

Phase 3 target: 6 P1s total (2 backend + 4 mobile).

## OPERATOR 50 IMMEDIATE NEXT ACTIONS

1. **Clarify expo version with user** before any expo bump.
2. **File the 4 new P2 issues** in the table above (mobile/backend repos).
3. **Begin Phase 1 — Majors solo.** First pick a major (suggest `@nestjs/core` first since backend audit infrastructure is warm). Spawn fixer (Opus 4.8) → dual-lens R5 → auto-merge.
4. Backend Phase 1 majors can run in parallel with a mobile Phase 1 major (different repos). Never two backend majors at once.

## INFRASTRUCTURE NOTES

- **Disk:** 20G total. ~7G free recommended baseline. Zombie clones (`/tmp/growth-project-backend-*`) can accumulate to 14G+ — `df -h /home/user` + `ls -d /tmp/growth-project-backend-* | wc -l` regularly.
- **Subagent dispatch pattern:** `subagent_type="codebase"`, `metadata='{"repo_url": "https://github.com/BradleyGleavePortfolio/<repo>"}'`, `preload_skills=["coding"]`, `model="claude_opus_4_8"` for fixer/Lens A, `model="gpt_5_5"` for Lens B.
- **STEP 0 force-sync block** required in every coding subagent objective: `git fetch + checkout + reset --hard origin/<branch>` with required-SHA verify.
- **R75 grep** and **lefthook** (NEVER `--no-verify`) required.
- **Coding subagents cannot be messaged mid-run** (must `cancel_subagent` first or wait).
- **Auto-merge command:** `gh pr merge <num> --repo BradleyGleavePortfolio/<repo> --squash --delete-branch --auto`. The `--auto` flag merges instantly once CI passes (use when checks still in progress).

## KEY ARTIFACTS IN /home/user/workspace/

- `KNOWN_BUGS_AND_OVERDUE_WORK.md` (registry, 167 lines)
- `current-state.json` (this handoff's snapshot — copy to `tgp-agent-context/handoffs/quality-bar-raise/`)
- `HANDOFF_OP_50.md` (this file)
- `p0_claims_audit_report.md`, `r2_claims_audit_report.md`, `r3_claims_audit_report.md`
- `r5d_fixer_diff.patch`, `r5d_fixer_status.md`, `r5d_artifacts/` (mutation discrimination evidence)
- `r5e_lens_a_verdict.md`, `r5e_lens_b_verdict.md` (both CLEAN)
- `audit_briefs/H4_PR466_R5d_FIXER_BRIEF.md`

---

**Operator 49 signing off. Wave 1 closed. PR #466 merged at `02812619` after R5d single-source-the-gate fix + R5e dual-lens CLEAN.**
