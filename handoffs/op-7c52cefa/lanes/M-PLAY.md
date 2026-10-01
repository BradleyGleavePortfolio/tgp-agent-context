# Lane M-PLAY — Android closed-test build without Health Connect (mobile, T2; builder GPT-6.1 Sol, one Sol audit unless the scan finds T3/T4)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly.
Why: Google Play makes every Health Connect permission go through a declaration and review. Mobile main app.json
requests 18 android.permission.health.* reads, including READ_HEALTH_DATA_IN_BACKGROUND, plus
com.samsung.android.hardware.sensormanager.permission.READ_ADDITIONAL_HEALTH_DATA and the react-native-health-connect
plugin. Wearables mobile #317 is not approved yet. The owner is starting the 14-day closed test (12 testers) now, so the
first Android build must not declare Health Connect. Health Connect comes back in a later test update with the
declaration once #317 passes audit.
Deliver (one PR against mobile main):
1. A build-time switch (env TGP_ANDROID_HEALTH_CONNECT, default OFF) through app.config.(js|ts) that reads app.json.
   When OFF it removes every android.permission.health.* entry and the Samsung permission, drops the
   react-native-health-connect plugin, adds those names to android.blockedPermissions (libraries can merge them back
   into the manifest), and sets extra.healthConnectEnabled=false. iOS (HealthKit) stays exactly as it is.
2. At runtime on Android with healthConnectEnabled=false, every Health Connect entry point is hidden or shows a specific
   "Health Connect is coming to Android in an update" message. No dead buttons, no generic errors, no native-module
   crash when the module is not linked (guard imports).
3. eas.json: production and preview profiles set TGP_ANDROID_HEALTH_CONNECT=0 explicitly. Do not touch versionCode
   (4), package (com.growthproject.app), or iOS settings.
4. Proof: `npx expo config --type introspect` output for android permissions with the switch OFF and ON (run through
   /home/user/workspace/ops/heavy.sh; no prebuild, no npm install); unit tests for the config transform and the
   runtime guard; tsc, eslint, targeted jest --runInBand.
Tier header with T3/T4 trigger scan. Coordinate in the PR body with mobile #317 (it must keep working when the switch is ON).
Report /home/user/workspace/ops/reports/M-PLAY.md + final answer (head, tests, CI). Never merge.
