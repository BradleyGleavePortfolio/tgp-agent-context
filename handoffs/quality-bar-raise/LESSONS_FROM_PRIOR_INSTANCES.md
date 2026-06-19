# Lessons from prior Perplexity Computer instances

Append-only failure-mode log. Each entry one line. Next instance skims to avoid re-discovering.

## 2026-06-19 session (Wave H endgame, R1-R4)

- Vitest assumed by builders; repo is **Jest**. Mention this explicitly in every brief.
- 6 parallel subagents OOM'd `npm ci`. Hard cap at **3-4 parallel**.
- Opus 4.8's sandbox safety classifier blocks `git config user.email "bradley@..."` on `tgp-agent-context`. Fallback to `Claude Auditor <auditor@bradleytgpcoaching.com>` is approved for that repo ONLY. Never on prod repo.
- Audits without an R1-R126 coverage table miss P1 findings. Coverage table is **mandatory** in every audit brief.
- Single-lens audits miss ~30-40% of findings. **Always dual-lens** (Opus 4.8 + GPT-5.5), take union.
- Lens A (Opus 4.8) returned CLEAN on PR #465 R4 while Lens B (GPT-5.5) caught `alg=none`. **Always trust the union; never trust a single lens going CLEAN.**
- Live-push agent sovereignty: every finding = one commit pushed immediately. Auditors that batch lose work when sandbox kills them.
- `[LOC-EXEMPT]` PR title marker is **required** for test-harness-only PRs (`test/prod-readiness/*`); otherwise A3 LOC floor CI fails. Apply via REST PATCH right before merge.
- "Make sure last round's findings are gone" is wrong audit framing. The doctrine is **"find ANY P0-P3 at all, search exhaustively, no 'enough' until you find everything."**
- Sandbox disk can hit 100% during a fixer cycle. Fixers should clean regenerable `node_modules` caches from sibling clones before failing; never delete source/test/report/git-object data.
- Fixer briefs are sometimes factually wrong about the AST shape (e.g., the H4.B R4 brief claimed catch-clause variables were uncounted; they were actually already `ts.VariableDeclaration` in current TS). Briefs are starting points; fixers should AST-probe and deviate when needed, **documenting the deviation in the code header AND the fixer report**, so R{N+1} auditors can verify.
- Branch protection on `main` is blocked by GitHub Free's private-repo limit. Park it in OPERATOR_ATTACH and stop retrying.
- Compaction memos that include exact SHAs, branch names, snapshot refs, file paths, and verbatim operator quotes are dramatically more useful than narrative summaries. Write them dense.
- Brief templates compound — copy R{N-1} brief to R{N}, update placeholders. Saves writing time and prevents drift.
- Subagents are deterministic about following written briefs but unreliable about following instructions buried in objective strings. **Put obligations in briefs, not objectives.**
- The `pplx-tool` CLI was not needed for this wave; standard `gh` + git via `api_credentials=["github"]` covered all operations.
