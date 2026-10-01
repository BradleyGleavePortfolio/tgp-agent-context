# Google Play setup checklist: TGP Fitness (Android)

Package: `com.growthproject.app`. Account type: personal, so you need 12 testers opted in for 14 days in a row before you can apply for production.

## Tonight (you)

1. **Create the app.** Play Console → Create app.
   - Name: TGP Fitness
   - Default language: English (United States)
   - Type: App. Price: Free.
   - Tick the two declarations.
2. **Testers.**
   - Testing → Closed testing → Create track (name it "Founders").
   - Testers tab → Create email list → add 12 or more Gmail addresses → Save.
   - Copy the opt-in link and send it to every tester.
   - Each tester must open the link, tap "Become a tester", install from Play and keep it installed for 14 days.
3. **Store listing** (Grow → Store presence → Main store listing):
   - App name: TGP Fitness
   - Short description (68 of 80 characters): Personal training with your coach: workouts, food logs and messages.
   - Full description: the text in the "Full description" section below.
   - App icon: `tgp-play-icon-512.png` (attached)
   - Feature graphic: `tgp-play-feature-graphic-1024x500.png` (attached)
   - Phone screenshots: 2–8 portrait screenshots from your Samsung once the new build is installed. I will list which screens to capture.
   - Category: Health & Fitness. Contact email: Bradleyapple1031@gmail.com
4. **Policy → App content.** Answer each card:
   - **Privacy policy:** https://app.trygrowthproject.com/privacy
   - **Ads:** No ads.
   - **App access:** "All or some functionality is restricted". I will send a demo client login and a demo coach login after the sign-up fix is live. Leave this card for now.
   - **Content rating:** answer honestly.
     - Users can talk to each other: yes (coach messaging, community).
     - Users can buy things in the app: yes (coaching packages).
     - Shares location: no.
     - No violence, sexual content or gambling.
   - **Target audience:** 16–17 and 18+ only (the terms say 16+). Do not tick any under-13 group.
   - **News app:** No. **Government app:** No. **Financial features:** none.
   - **Health apps declaration:** fitness, workouts, nutrition and weight tracking, coaching. Not a medical device, no diagnosis or treatment.
   - **Data safety:** use the table below.
   - **Account deletion:**
     - In-app: clients go to More → Settings → Delete my account; coaches go to Settings → Delete my account.
     - Web URL: https://app.trygrowthproject.com/help/delete-account. This page is being built now in PR #611, so leave the card until I confirm it is live.

## Data safety answers

| Data type | Collected | Shared with third parties | Why |
|---|---|---|---|
| Name, email, user IDs | Yes | No (service providers don't count as sharing) | Account, coaching |
| Health info, fitness info | Yes | No | Personal training plan, logs, check-ins |
| In-app messages | Yes | No | Coach messaging, community |
| Photos | Only if the user uploads them | No | Progress and profile photos |
| Purchase history | Yes | No | Coaching packages (Stripe handles card details) |
| App interactions, crash logs, diagnostics | Yes | No | Analytics (PostHog), crash reports (Sentry) |
| Device or other IDs | Yes | No | Push notifications |

- Data is encrypted in transit: Yes.
- Users can ask for their data to be deleted: Yes.
- Roman (AI) is optional. With the user's permission, their data is processed by Anthropic as a service provider.

## Things I am handling before the first upload

1. **Health Connect.** The current Android build asks for 18 Health Connect permissions, including background reads. Google makes you fill in a separate declaration for every permission, and that adds review time.
   - First closed-test build: ships without Health Connect so review is fast and your 14-day clock starts.
   - Health Connect comes back in a test update once the wearables PR passes audit, with the declaration filled in. That is well before production.
2. **Production build (.aab).** I build it on Expo Free (versionCode 4) after today's sign-up fix is deployed. You upload it to the Founders track under Create new release.
3. **Account deletion web page** (PR #611) and **demo logins**: I'll send them when they're ready.

## Full description

Personal training, with room for real life.

TGP Fitness brings your training plan, daily logs and coach conversation into one considered space.

Start with a consultation about your goals, experience, routine and training preferences. Review your nutrition targets and the plan prepared for your start.

Follow your workouts and record each session. Keep food and water logs alongside your targets. Review your progress over time, and message your coach when you need a little direction.

Roman is an AI assistant powered by Anthropic. Before AI processing, you will see what information is shared and be asked for permission. Your personal-training coach remains your human point of contact.

TGP Fitness supports a personal-training service. It does not diagnose or treat conditions, provide medical advice, or function as a medical device.

For people aged 16 and older.

## After 14 days

Dashboard → Apply for production. Google asks how you recruited testers, what feedback you got and what you changed. Keep a short note of tester feedback as it comes in. Google's guide: [Apply for production access](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).
