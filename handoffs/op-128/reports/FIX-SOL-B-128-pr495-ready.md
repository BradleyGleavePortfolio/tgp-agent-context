FIX ROUND 2 (DES-AH-127, agent 128, FIX-SOL-B-128) — growth-project-mobile#495 @ ed9dbbe1fa670c24139f3caf918061d6afcde105 — READY FOR AUDIT

Queue (b): both lenses approved 593005f123dee9039febf9ca7b360e27806a845c, but main caused a shared README conflict.

Delta is a merge of origin/main c00a2a5f4f056148af0158edbf6b71b145dc8bc2 with conflict resolution only. Kept main's ClientMacros entry and both ExerciseDetail/ExerciseLibrary entries in their existing Logging and planning table; see src/screens/client/README.md:40-42. No finding was skipped, and no new behavior was changed.

Merge-only evidence: all five owned source/test blobs exactly match the previously audited head; every file outside this PR's six paths matches the merged main tree. README differs from main only by the two owned exercise entries.

Parity: ExerciseLibraryRedo128.test.tsx passes 8/8 through heavy.sh, preserving search, all filters, metadata, pagination, detail navigation, retries, native video/fullscreen/PiP, GIF fallback and truthful empty/error media variants.

225 additions + 63 deletions = 288 changed lines. Required CI and CodeQL are green at this exact head; GitHub confirms no conflict. No PR merge, deployment, flags or production changes performed. Both lenses must re-attest this exact head before the operator merges.
