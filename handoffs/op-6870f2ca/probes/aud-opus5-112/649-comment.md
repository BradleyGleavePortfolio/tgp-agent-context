AUDIT Claude Opus 5.5 — growth-project-backend#649 @ aa1da69ddf0929c52c1186cef845046d28411b93 — VERDICT: APPROVE

Lane AUD-OPUS-5 (operator 112). T3, single Opus lens (one repo, data-only migration). First AUDIT on this PR. A0 B0 C2.

**Scope read at the exact head:** one commit on top of f04289f9; 6 files (migration.sql, down.sql, seed JSON, two docs tables, one spec). No schema.prisma, workflow, `scripts/ci`, RLS or credential change. T4 trigger scan in the body is correct.

**Checks I ran**
- Every UPDATE is `"BuildWeekDay"` with `day_number = 1` plus the old-text guard (item title via `EXISTS ... ->> 'title'`, `focus_area =`, `strpos(narrative, ...) > 0`, `expected_artifact =`). No INSERT/DELETE/DDL, no other table. The item is rebuilt in place (`WITH ORDINALITY ... ORDER BY t.ord`), and `time_estimate_min` is kept. The original load (20260506020000 L81) has exactly the keys title/description/time_estimate_min, so `jsonb_build_object` drops nothing.
- **Real Postgres probe (PGlite, Postgres WASM) running the PR's own migration.sql / down.sql** on the 20260506020000 catalog (script and output under `ops/aud-opus5-112/pglite/` in the operator sandbox):
  - up: the database equals `prisma/seed-build-week.json` for all 7 days and every field; days 2-7 are untouched.
  - A second up is a no-op.
  - down: the original rows come back exactly, and Day 1 `action_items::text` is byte-identical to the original load (the em dash round-trips).
  - A second down is a no-op.
  - Drift cases: a changed `focus_area` or item title makes the post-condition RAISE. With no Day 1 row it passes and changes nothing.
- Post-condition guard (kept by OR-112-20) works. CI "Forward migrations apply cleanly" applied 20270224000000 on Postgres 15 with the seeded row, which proves the four UPDATEs took effect. "Reversible" passed, but it compares schema only, so the data inverse is proven by the spec plus the probe above.
- Copy: no first person, no "!", no emoji, no medical words. The copy is specific: it names the consultation, says it happens in the app, and gives the reason (coach tailors the plan). Docs (`docs/build-week.md`, `src/build-week/README.md`) match the seed.
- RLS: BuildWeekDay is FORCE RLS (20261213000000 L133-154). The app and migrate role is `service_role`/BYPASSRLS, and there is a `p_buildweekday_service_role_all` policy. If an UPDATE were filtered anyway, the guard would raise (fail closed).
- Local: `ops/heavy.sh npx jest test/build-week-day1-consultation-copy.spec.ts --runInBand` gave 11/11 PASS. The spec fails on main because the migration dir and the new seed copy are missing.
- CI at head: all 10 required checks plus Schema parity, Forward, Reversible SUCCESS.

**Findings**
- **C-649-1 (optional):** the post-condition (migration.sql L72-85) matches only `'%40-point diagnostic%'` in `action_items`/`narrative`. If production Day 1 had drifted (item title edited, description still "Work through the diagnostic form ..."), the migration passes and leaves diagnostic text (probe case 5). Minimal fix: use `ILIKE '%diagnostic%'` on all four fields, the same rule the seed spec applies (`/diagnostic/i`). The pre-deploy SELECT below covers this case (`diagnostic_text_left`).
- **C-649-2 (optional, docs):** `docs/build-week.md:15-16` says "Copy edits ship via a new migration — never an in-place UPDATE of the seeded rows", which reads as forbidding what this migration does. Reword to "... via a new data migration that UPDATEs the row; never edit 20260506020000 in place".

**Read-only pre-deploy SELECT (OR-112-20).** Run it against production before the deploy that carries #649, ideally as the role `release_command` uses. GO only if `day1_rows = 1`, `item_old`/`focus_old`/`narrative_old`/`artifact_old` are all true, `guard_would_raise = false`, `diagnostic_text_left = false`, `migration_recorded = 0`, `unfinished_migrations = 0`, and `role_bypasses_rls = true`. `day1_rows = 0` is also safe: nothing matches.
```sql
WITH d AS (
  SELECT * FROM "BuildWeekDay" WHERE "day_number" = 1
), sim AS (
  SELECT
    CASE
      WHEN jsonb_typeof(d."action_items") = 'array'
       AND EXISTS (SELECT 1 FROM jsonb_array_elements(d."action_items") AS e(elem)
                   WHERE e.elem ->> 'title' = 'Complete the 40-point diagnostic')
      THEN (SELECT jsonb_agg(CASE WHEN t.elem ->> 'title' = 'Complete the 40-point diagnostic'
                                  THEN jsonb_build_object('title', 'Complete your consultation', 'description', 'Work through your consultation in the app from start to finish so your coach can tailor your plan. Honest answers only. This becomes the baseline every later week is measured against.',
                                                          'time_estimate_min', t.elem -> 'time_estimate_min')
                                  ELSE t.elem END ORDER BY t.ord)
            FROM jsonb_array_elements(d."action_items") WITH ORDINALITY AS t(elem, ord))
      ELSE d."action_items"
    END AS action_items,
    CASE WHEN d."focus_area" = 'Diagnostic + Baseline' THEN 'Consultation + Baseline' ELSE d."focus_area" END AS focus_area,
    replace(d."narrative",
            'The 40-point diagnostic, the starting body weight, and the income baseline together form the snapshot',
            'Your consultation, the starting body weight, and the income baseline together form the snapshot') AS narrative,
    CASE WHEN d."expected_artifact" = 'Diagnostic + baseline snapshot: weight, income, hours, and a 100-word success statement.'
         THEN 'Consultation + baseline snapshot: weight, income, hours, and a 100-word success statement.'
         ELSE d."expected_artifact" END AS expected_artifact
  FROM d
)
SELECT
  (SELECT count(*) FROM d) AS day1_rows,
  (SELECT bool_and(jsonb_typeof(d."action_items") = 'array'
                   AND EXISTS (SELECT 1 FROM jsonb_array_elements(d."action_items") AS e(elem)
                               WHERE e.elem ->> 'title' = 'Complete the 40-point diagnostic')) FROM d) AS item_old,
  (SELECT bool_and(d."focus_area" = 'Diagnostic + Baseline') FROM d) AS focus_old,
  (SELECT bool_and(strpos(d."narrative", 'The 40-point diagnostic, the starting body weight, and the income baseline together form the snapshot') > 0) FROM d) AS narrative_old,
  (SELECT bool_and(d."expected_artifact" = 'Diagnostic + baseline snapshot: weight, income, hours, and a 100-word success statement.') FROM d) AS artifact_old,
  EXISTS (SELECT 1 FROM sim
          WHERE sim."action_items"::text ILIKE '%40-point diagnostic%'
             OR sim."focus_area" ILIKE '%diagnostic%'
             OR sim."narrative" ILIKE '%40-point diagnostic%'
             OR sim."expected_artifact" ILIKE '%diagnostic%') AS guard_would_raise,
  EXISTS (SELECT 1 FROM sim
          WHERE concat_ws(' ', sim."action_items"::text, sim."focus_area", sim."narrative", sim."expected_artifact")
                ILIKE '%diagnostic%') AS diagnostic_text_left,
  (SELECT count(*) FROM "_prisma_migrations"
    WHERE "migration_name" = '20270224000000_build_week_day1_consultation_copy') AS migration_recorded,
  (SELECT count(*) FROM "_prisma_migrations"
    WHERE "finished_at" IS NULL AND "rolled_back_at" IS NULL) AS unfinished_migrations,
  current_user AS run_as,
  (SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname = current_user) AS role_bypasses_rls;
```
The PGlite probe ran this SELECT on the original catalog, after up, and on every drift case, and it predicted the guard each time. If the guard fires in production anyway, the release fails, and Prisma records 20270224000000 as failed. Later deploys then stop with P3009 until the operator fixes the row and runs `prisma migrate resolve --rolled-back 20270224000000_build_week_day1_consultation_copy`.

**Outside this diff / merge notes**
- main requires up-to-date branches (`strict: true`), and main moved to 5d1f224a (#644). That commit touches no migration or Build Week file. `git merge-tree --write-tree 5d1f224a aa1da69d` is clean with tree `a70f3fa13d5fb35a0bddd99aa046778a9d167521`. After update-branch, this APPROVE carries over without re-audit if the new merge commit's tree equals a70f3fa1 and the required checks plus the migration checks are green at the new head.
- Prefix 20270224000000 sorts after the still-open lower prefixes (#627 0210, #610 0211, #609 0212/0213, #628 0215, #608/#636 0220/0221, #634 0222, #640 0223). If #649 deploys first, those apply later out of lexical order. `migrate deploy` applies pending migrations by name, and the objects are disjoint (same as C-607-6), so this is informational. I found no open-PR spec that asserts it holds the newest prefix.
- No mobile screen renders `/build-week/days` copy today (mobile only shows build_week notification types), so the new copy reaches API consumers only. Rollback re-advertises the quiz, so roll back only together with #644 (as the PR states).
