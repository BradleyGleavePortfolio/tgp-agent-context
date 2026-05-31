# H4 Storefront Join-Token Throttle — FIX R3 (PR #338)

**Branch:** `hygiene/H4-storefront-token`
**Old SHA (audited R3):** `580ac6cfb172232e2a77750012dbd0f21e6af38b`
**New SHA (after rebase):** `5a0aa376d48e45cf547ecdbb5a22f560edb90a68`
**Base:** `origin/main` @ `a344ec4d47b4a3503707253ccf93335807a6af2e`
**Author:** `Dynasia G <dynasia@trygrowthproject.com>` — no trailers on any commit.

## What R3 audit flagged (the ONLY open issue)
- **P2 ×1 — write-set boundary / base mismatch.** `git diff origin/main..580ac6cf --stat`
  returned 10 (later 19) files instead of the three authorized H4 files. Root cause: the
  branch's H4 commits were stacked on an **old** merge-base (`19e51b0`) while `origin/main`
  had advanced to `a344ec4`. The two-dot range `origin/main..580ac6cf` therefore surfaced
  unrelated landing-pages / packages / drip-dispatcher / meal-plan / test churn that belonged
  to `main`'s forward progress — NOT to the H4 fix. The fix commit itself was already correctly
  scoped to the three H4 files; only the branch-vs-`origin/main` comparison was ambiguous.
- R2 functional findings (P1 throttler isolation, P1 Redis-down fail-open, P2 wording) were
  **already verified CLOSED by the R3 audit**. No functional change was required in this round.

## Fix applied: REBASE ONLY
The three H4 commits were rebased cleanly onto current `origin/main` (`a344ec4`):

```
git fetch origin main
git rebase origin/main        # 3/3 applied, ZERO conflicts
```

The rebase is a pure base-shift. The three H4 files are **byte-identical** between the old
audited SHA `580ac6c` and the new HEAD `5a0aa37` (verified via `git diff 580ac6c HEAD -- <file>`
→ no diff on any of the three). No code logic changed; only the parent chain was refreshed so the
PR compares cleanly to `origin/main`.

New commit chain (`origin/main..HEAD`):
- `5a0aa37` fix(H4): isolate token throttler + Redis-down graceful path (R2 P1/P2)
- `33a1453` hygiene(H4): add IP-wide throttle layer on GET join/:token to bound distinct-token enumeration (#7)
- `aca6368` hygiene(H4): composite (token,IP) throttle on GET join/:token

## Write-set verification (P2 now CLOSED)
`git diff origin/main..HEAD --name-only` →
```
src/storefront/storefront-public.controller.ts
src/throttler/throttler.config.ts
test/storefront-public.controller.spec.ts
```
Exactly the three parent-authorized H4 files (per `specs/HYGIENE_H4_STOREFRONT_TOKEN_BRIEF.md`
WRITE-SET AMENDMENT). `git diff origin/main..HEAD --stat`: 3 files, 890 insertions / 4 deletions.
No `drip-dispatcher`, `package-contents`, `real-meal-plans`, `landing-pages`, or `coach-messaging`
files appear in the range anymore. `test/rate-limit.spec.ts` is NOT in the H4 write-set (unchanged);
it is only exercised as part of the focused throttle gate below.

## Tests (focused H4 gate — re-run against the rebased tree)
Command (per R3-audit working equivalent; literal `yarn jest` is unavailable in this repo):
```
NODE_OPTIONS=--max-old-space-size=1536 ./node_modules/.bin/jest \
  --runTestsByPath test/storefront-public.controller.spec.ts test/rate-limit.spec.ts \
  --runInBand --verbose
```
Result: **Test Suites: 2 passed, 2 total — Tests: 77 passed, 77 total** (32.5s). Green.

## Author / trailer hygiene
All three commits authored by `Dynasia G <dynasia@trygrowthproject.com>`; `git log --format='%(trailers)'`
returns empty for each; no `Co-authored-by` / `Signed-off-by` / tool-generated trailers present.

## Net effect
- P2 write-set/base-mismatch: **CLOSED** (branch now diffs to exactly the 3 H4 files vs current `origin/main`).
- R2 functional fixes: unchanged and still proven (byte-identical H4 files + 77/77).
- Branch force-pushed with `--force-with-lease` (`580ac6c...5a0aa37`).
