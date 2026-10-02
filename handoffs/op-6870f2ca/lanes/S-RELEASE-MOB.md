# Lane S-RELEASE-MOB (agent 112) — Claude Opus 5.5 builder: OTA in the binary (mobile #305) + Sentry native init + release-env check (T3)

Owner 10-01 10:44 over-the-air updates approved; the clinic binary must carry expo-updates so later JS fixes ship without a store
review. Sentry native auto-init is off (pre-JS crashes invisible; found in the 10-01 Android crash hunt). Stay on Expo Free (no paid
EAS features). Never ship APK 14a58449.
Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; mobile #305 (base clinic/m2-core-polish, head 45787152) and its comments;
mobile main 2c17c241 app.config.*, eas.json (clinic profile), Sentry setup.
Do (each with tests where testable):
1. #305: retarget base to main and bring it to current main (merge commit; or re-cut cleanly from main on the same branch if the old
   base is obsolete — explain in the PR body); expo-updates configured for the clinic channel/runtimeVersion policy on Expo Free;
   update checks never block launch, never crash offline; document the OTA release procedure in the PR body (operator-run).
   expo-updates may be a new native dependency: shared deps lack it — mock in jest; any package.json change -> "DEP CHANGE" in your
   report at once.
2. Sentry native init (separate PR, Conventional Commits title): enable native crash capture for iOS/Android pre-JS crashes with no
   PII (no health data, no message content), DSN from existing config.
3. A pre-build `--release-env` check (script + test) that fails a release build when a required EXPO_PUBLIC_* value for the clinic
   profile is missing or a placeholder; list the values it checks.
Tests via heavy.sh (targeted jest --runInBand; CI does tsc + full suites). Never merge, build, dispatch workflows or touch production.
Report: /home/user/workspace/ops/reports/S-RELEASE-MOB-112.md. Final answer (<400 words).
