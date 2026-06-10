# PR #229 v1-5 Mobile R1 DIRTY → Fixer Brief (MINOR)

**You are the Opus 4.8 fixer (R31). R1 audit returned DIRTY but all 3 issues are minor. Only Gate 7 is a real fix; Gates 2 & 9 are brief-drift.**

## Repo & branch
- Repo: `BradleyGleavePortfolio/growth-project-mobile`
- Worktree: `/home/user/workspace/tgp/mobile-community-v1-5` (builder's worktree; pull latest)
- Branch: `feature/community-v1-mobile-client` (PR #229, head `a6dec0f`)
- Base: `2883b22`

## Read first
- Audit report: `/home/user/workspace/tgp/mobile-v1-5-audit/AUDIT_R1_PR_229_REPORT.md`

## REAL FIX (Gate 7 — `sonnet` token in test file)

The audit flagged 3 newly-added `sonnet` occurrences in `src/navigation/__tests__/communityFlagOff.test.ts` at lines 10, 98, 116. The forbidden-token rule (R0-R70 — no `sonnet` references in code) was intended to block accidental Sonnet 4.6 model references in product code. The test file uses `sonnet` in a context that is unrelated to AI models — but it still trips the grep.

### Inspect the lines first
Open `src/navigation/__tests__/communityFlagOff.test.ts` and look at lines 10, 98, 116. Determine the actual intent of each occurrence:
- If `sonnet` was used as a metaphor/code-name unrelated to anything meaningful, rename to a neutral word (e.g., `quiet`, `silent`, `off`, `default`).
- If it was a misunderstanding (the dev thought they had to reference Sonnet for some reason), just remove it.
- Preserve test semantics — only change the string/identifier.

Suggested rename: replace `sonnet` → `silent` everywhere in that file (preserves the "silent default OFF" intent).

After rename, run:
```
npx jest src/navigation/__tests__/communityFlagOff.test.ts
```
Expect: same pass count as before (the test file currently passes; nothing functional should change).

Also re-scan to confirm zero `sonnet` matches in new lines:
```
git diff 2883b22..HEAD -- '*.ts' '*.tsx' | grep -in '^+.*sonnet' | grep -v '^+++'
```
Expect: zero matches.

## OUT OF SCOPE (do NOT fix — brief drift)
- **Gate 2 (scope):** `src/api/__tests__/communityApi.test.ts` and `src/hooks/__tests__/useCommunity.test.tsx` are legitimate test files for the community work. The brief's allowlist was incomplete. Leave them.
- **Gate 9 (ESLint command):** The brief's command included `src/community` which doesn't exist; auditor's supplemental ESLint over actual paths returned 0 errors + 5 warnings. Leave the source untouched.

If you have spare budget AFTER the Gate 7 fix is committed and pushed, you MAY:
- Address any of the 5 ESLint warnings reported in the supplemental check (purely cosmetic; not required).

## Process
1. Pull branch: `git -C /home/user/workspace/tgp/mobile-community-v1-5 fetch origin && git checkout feature/community-v1-mobile-client && git pull --ff-only origin feature/community-v1-mobile-client`
2. Apply Gate 7 rename in `src/navigation/__tests__/communityFlagOff.test.ts`.
3. Re-run the focused file, verify pass.
4. Re-run new-line `sonnet` scan, verify zero.
5. Commit: title-only, author `Dynasia G <dynasia@trygrowthproject.com>`. Suggested: `test(community): rename forbidden-token reference in flag-off test`
6. Push: `git push origin feature/community-v1-mobile-client` (no force needed).
7. Comment on PR #229 with the fix summary via `gh pr comment 229 --body-file /tmp/pr229_fix_comment.md`. If safety classifier blocks, save the comment to `/tmp/pr229_fix_comment.md` and tell the orchestrator.
8. Append journal entry to `/tmp/tgp-agent-context/handoffs/dispatch.json`.

## Hard rules
- Opus 4.8 runtime.
- Title-only commits, author Dynasia G.
- `api_credentials=["github"]` for gh.

End your return message with: head SHA + status: FIXED_READY_FOR_RE_AUDIT | PARTIAL.
