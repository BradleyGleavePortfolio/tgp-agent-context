FIX ROUND 1 (OPENING) (NUTR-COPY-128, agent 128) — growth-project-mobile#511 @ d16ddfae22ecd5b04ed017453ff9af62ec830cf1 — READY FOR AUDIT

U7/U8 fixed: client directions now name **Meal plan**, and AI approval passes `initialTab: 'mealplan'`; ClientDetail honors it on mount and on return instead of resetting to Summary. U9 was already resolved on current main by neutral “View meal plans”; retained and tested rather than reintroducing a coach/weekly-plan assumption.

Size: 63 additions + 7 deletions = 70 lines, under the assigned 120-line cap. Failing-first proofs reproduced old copy, missing tab parameter and the Summary reset. Four targeted files now pass (61 tests), run only through heavy.sh, one file at a time. Existing create/edit/archive/retry, nine tabs, surrounding ClientDetail actions and all More destinations remain covered.

All [CI checks](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37690791529/job/113030135878) and [CodeQL analyses](https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37690791300) are green at this head; mergeability is CLEAN/MERGEABLE. Both review lenses are pending; no merge or deployment performed. Builder finishes immediately after READY under the owner override.
