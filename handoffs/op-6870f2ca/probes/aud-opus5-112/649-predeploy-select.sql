-- backend #649 pre-deploy check (READ-ONLY; SELECT only). Run against production before the deploy that carries
-- 20270224000000_build_week_day1_consultation_copy. It simulates the four UPDATEs and the post-condition guard.
-- GO only when: day1_rows = 1, item_old, focus_old, narrative_old, artifact_old all true, guard_would_raise = false,
-- diagnostic_text_left = false, migration_recorded = 0, unfinished_migrations = 0. role_bypasses_rls must be true when
-- run as the role release_command uses (BuildWeekDay has FORCE RLS; a filtered UPDATE would make the guard raise).
-- (day1_rows = 0 is also safe: every UPDATE and the guard match nothing.)
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
