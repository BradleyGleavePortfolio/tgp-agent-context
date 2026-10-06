# Play Console: Health apps declaration + Data safety (instructions for a browser agent)

Paste everything below the line into the browser agent. Checked against the app code on 10-06: Android package com.growthproject.app,
15 read-only Health Connect permissions, no microphone permission, Stripe payment SDK, PostHog analytics, Sentry crash reports.

---

You are filling two forms in Google Play Console for the app "The Growth Project" (package com.growthproject.app). I am signed in.

Rules:
- Only touch these pages: App content > Health apps, App content > Data safety, and (check only) App content > Privacy policy.
- Do not change the store listing, pricing, releases, testers or any other page.
- Click Save on each form. Do NOT click "Send changes for review" or "Publish". Stop and show me the Publishing overview so I approve.
- If a question is not covered below, or a field needs something I have not given you (a video link, a login, a file), stop and ask me.
  Do not guess.

## Where to go
1. Open https://play.google.com/console and select the app "The Growth Project".
2. Left menu: Policy (under "Monitor and improve", or "Policy and programs" in older layouts) > App content. The page URL ends in
   /app-content/overview.
3. Privacy policy (check only): it must be https://app.trygrowthproject.com/privacy. If it is different, stop and tell me.

## Form 1: Health apps declaration (App content > Health apps > Start or Manage)
1. Health features: select only these (or the closest labels):
   - Activity and fitness
   - Nutrition and weight management
   - Sleep management
   Do NOT select medical, disease-management, clinical, medical device, or mental-health categories.
2. Health Connect: Yes, the app reads Health Connect data. Read access only. No write permissions, no background read, no reading of
   history older than 30 days.
3. Select exactly these 15 read permissions. For each, use this justification (paste it as written):
   - Steps (READ_STEPS): "Shows the client's daily steps on their Health screen and to their own coach, who uses it to set activity
     targets and review weekly progress."
   - Active calories burned (READ_ACTIVE_CALORIES_BURNED): "Used to show activity energy next to the client's food log and to let their
     coach adjust daily nutrition targets."
   - Heart rate (READ_HEART_RATE): "Summarises workout intensity for completed training sessions so the client and their coach can
     review training load."
   - Resting heart rate (READ_RESTING_HEART_RATE): "Shown as a recovery trend so the coach can adjust training volume when recovery is
     low."
   - VO2 max (READ_VO2_MAX): "Shown as a cardio fitness trend in progress tracking so the coach can program conditioning work."
   - Exercise sessions (READ_EXERCISE): "Imports workouts the client did outside the app so their training log and adherence are
     complete for their coach."
   - Distance (READ_DISTANCE): "Shows walking, running and cycling distance in the activity log for cardio targets set by the coach."
   - Weight (READ_WEIGHT): "Imports body-weight entries for the client's nutrition plan and progress chart so they do not enter them
     twice."
   - Body fat (READ_BODY_FAT): "Shows the client's body composition trend in progress tracking reviewed with their coach."
   - Blood pressure (READ_BLOOD_PRESSURE): "Shown to the client and their coach as a wellness trend during check-in review so the
     coach can adjust training intensity and suggest seeing a clinician. Not used for diagnosis."
   - Sleep (READ_SLEEP): "Shows sleep duration in the client's recovery view so the coach can adjust training load after poor sleep."
   - Heart rate variability (READ_HEART_RATE_VARIABILITY): "Shown as a recovery readiness trend so the coach can schedule hard and
     easy training days."
   - Oxygen saturation (READ_OXYGEN_SATURATION): "Shown as a wellness trend during check-in review (for example at altitude or when
     unwell) so the coach can reduce training load. Not used for diagnosis."
   - Respiratory rate (READ_RESPIRATORY_RATE): "Shown as a sleep-recovery trend so the coach can adjust training load."
   - Body temperature (READ_BODY_TEMPERATURE): "Shown as a recovery trend (illness or overtraining signal) so the coach can reduce
     training load. Not used for diagnosis."
4. Privacy policy for health data: https://app.trygrowthproject.com/privacy (consumer health policy:
   https://app.trygrowthproject.com/consumer-health-privacy).
5. If asked who sees the data: the client and the coach they chose inside the app. Data is never sold and never used for ads.
6. Save. Do not submit for review.

## Form 2: Data safety (App content > Data safety > Start or Manage)

Overview questions:
- Does your app collect or share any of the required user data types? Yes.
- Is all of the user data collected by your app encrypted in transit? Yes.
- Which account creation methods does your app support? Username and password (email) and OAuth (Sign in with Google, Sign in with
  Apple). Select all that match.
- Delete account URL: https://app.trygrowthproject.com/help/delete-account
- Can users request that some or all of their data is deleted without deleting their account? Yes (in-app request and email to support,
  as described on that page). If the form only asks about account deletion, answer for that.

For every data type below:
- Shared: NO. Our service providers (payments, hosting, AI processing, crash reporting, analytics, email) process data on our behalf.
  A client's data reaching the coach they chose is a user-initiated action inside the app.
- Processed ephemerally: No.

Mark each type Collected, with these purposes and Required/Optional settings:

| Category > type | Collected | Purposes | Required or optional |
|---|---|---|---|
| Personal info > Name | Yes | App functionality, Account management | Required |
| Personal info > Email address | Yes | App functionality, Account management, Developer communications | Required |
| Personal info > User IDs | Yes | App functionality, Account management, Analytics, Fraud prevention/security | Required |
| Personal info > Phone number | Yes | App functionality, Account management | Optional (sign-up field is optional) |
| Personal info > Other info (date of birth, sex, height used for nutrition formulas) | Yes | App functionality, Personalization | Required |
| Financial info > User payment info (card details entered in the Stripe payment sheet) | Yes | App functionality | Optional (only when a user buys) |
| Financial info > Purchase history | Yes | App functionality, Account management | Optional |
| Financial info > Other financial info (coach payout and invoice status) | Yes | App functionality, Account management | Optional |
| Health and fitness > Health info (readiness and injury answers, check-ins, sleep, heart rate, HRV, blood pressure, oxygen, respiration, temperature, bloodwork entries) | Yes | App functionality, Personalization | Required |
| Health and fitness > Fitness info (workouts, food and nutrition logs, body measurements, steps, active energy, distance, exercise sessions, VO2 max) | Yes | App functionality, Personalization | Required |
| Messages > Other in-app messages (coach and client messages, chat with the in-app coach assistant) | Yes | App functionality | Optional |
| Photos and videos > Videos (coach-uploaded training videos) | Yes | App functionality | Optional |
| Files and docs (coach-uploaded PDFs, user-uploaded documents) | Yes | App functionality | Optional |
| App activity > App interactions | Yes | Analytics, App functionality | Required |
| App activity > Other user-generated content (community posts, comments, reactions) | Yes | App functionality | Optional |
| App info and performance > Crash logs | Yes | Analytics (app stability) | Required |
| App info and performance > Diagnostics | Yes | Analytics (app stability) | Required |
| Device or other IDs (push notification token, analytics device ID) | Yes | App functionality, Analytics, Developer communications | Required |

Mark NOT collected: Location (approximate and precise), Web browsing, Contacts, Calendar, Photos (still images), Audio (voice or sound
recordings, music files, other audio), SMS or call logs, Installed apps, In-app search history, Race and ethnicity, Political or
religious beliefs, Sexual orientation, Credit score.

Security section:
- Data encrypted in transit: Yes.
- Users can request data deletion: Yes.
- Independent security review: No (do not claim one).
- Committed to the Families Policy: No (the app is for adults).

Save. Show me the preview of the Data safety section and the Publishing overview. Do not send for review.

## When done, report to me
1. Screenshot or text of the saved Health apps declaration (features + the 15 permissions).
2. The Data safety preview.
3. Any question you skipped because it was not covered here.
