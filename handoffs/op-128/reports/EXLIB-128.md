# EXLIB-128 (FIXWAVE-128, agent 128) — client Exercise library shows real exercises

## Scope traced
- Mobile ExerciseLibraryScreen listed GET /exercise-catalog (ExerciseCatalogItem: 0 rows in prod) -> "No exercises match."
- Coach builder uses exerciseLibraryApi.search -> GET /exercises/search (ExerciseDB proxy; EXERCISEDB_API_KEY/HOST set on Fly per JOBS127 AIB-NAMES-127).
- Backend (read only) src/exercise-library/exercise-library.service.ts: q -> upstream name search; muscleGroup -> upstream bodyPart; equipment -> upstream equipment; filtered results capped at 100; equipment ignored beside muscleGroup when no q.
- Detail: exerciseCatalogApi.getDetail already falls back to /exercises/:id on catalog 404 (id column is text, so ExerciseDB ids 404 cleanly).
- Fix: new exerciseCatalogApi.browse maps /exercises/search into the catalog shape (shared fromLibrary helper, sentence-case names); filtered requests send limit=100 and both chips are applied client-side. Screen chip rows -> Body part + Equipment (values the live source answers). No production write needed.

## B list
none

## U list
- U2 (FW-TRAIN-128): empty exercise library in prod — fixed in m#519.

## C one-liners
- C (edge, deferred to 10k clients): backend caps a filtered search at the first 100 upstream results.

## PRs
- growth-project-mobile#519 head e84c1e4a1c9217ef3194227b877efb5e1601382f, 225 changed lines (+144/-81, 6 files), MERGEABLE. Local: failing-first 4 failed on main code; 23/23 pass with fix (3 files). CI: first push failed tsc (untyped test navigator), fixed in e84c1e4a; CI green at e84c1e4a. READY comment posted (issuecomment-6047957427). Verdicts: not waited for (owner 14:08 override).

## Not fixed (needs operator)
- none. The catalog seed run (backend scripts/seed-exercise-catalog.ts) is no longer needed for the library list.

## HANDOFF
Branch agent128/exlib-128, worktree /home/user/workspace/wt/EXLIB-128-mobile, head e84c1e4a. READY posted; builder finished per owner 14:08 override. Lens findings go to the FIX lane. Filters changed: Category+Muscle rows (dead, 0 rows) -> Body part row; equipment 'machine' -> 'leverage machine' (+kettlebell); parity table in PR body.
