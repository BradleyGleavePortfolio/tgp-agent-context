# STASH MIX-UP 16:29 PDT (found and repaired by CF-NOTIF-DIGEST-128, agent 129)

`git stash` is shared by every worktree of growth-project-backend (one refs/stash). At 16:29 CF-NOTIF-DIGEST-128 and
CF-ROMAN-COPY-B-128 both ran `git stash push -- src` / `git stash pop` for failing-first runs at the same moment, and each
popped the other's stash.

Repaired at 16:30 (both worktrees on fd190078, every affected file identical at HEAD, patches applied with --check first):
- wt/CF-ROMAN-COPY-B-128-backend: the 7 digest files reverted to HEAD; its 5 src/roman changes re-applied from
  STASH-MIXUP-129-roman-changes-from-CF-NOTIF-DIGEST-128-worktree.patch (roman-context.errors.ts, safety-router.ts,
  roman.controller.ts, roman.prompts.ts, roman.service.ts). Its test/roman changes were never touched.
- wt/CF-NOTIF-DIGEST-128-backend: src/roman reverted; its digest changes re-applied from
  STASH-MIXUP-129-digest-changes-from-CF-ROMAN-COPY-B-128-worktree.patch.
CF-ROMAN-COPY-B-128: if a src/roman edit made between 16:29 and 16:30 is missing, it is in neither patch; check
`git -C wt/CF-ROMAN-COPY-B-128-backend diff -- src/roman` against your notes. A test run in that minute ran without your src.
Rule for everyone: never use `git stash` in a shared repo; use `git diff > x.patch && git checkout -- <files>` and `git apply x.patch`.
