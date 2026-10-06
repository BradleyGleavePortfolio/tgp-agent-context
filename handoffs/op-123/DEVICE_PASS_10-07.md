# Device pass for the Wed 10-07 build (owner script)

Written by S-DEVICEPASS-123 (agent 123), 21:30-22:00 PDT 10-05, from mobile main a727eb49 and backend main 5230306c (production).
For: Bradley, one iPhone and one Android phone. No terminal, no code. About 75-90 minutes.
For every step: **Tap** = what to do, **See** = what should happen, **Send** = what to send back. When anything differs from **See**,
take a screenshot, write down the exact words on screen (including any "Reference ..." code) and keep going.

Launch step 5 (Health Connect and the Android push check) is closed by Parts E and H. Everything else here is the first real-phone
run of the day-1 screens.

---

## Part A. Before you start (10 minutes, mostly the operator)

A1. **Builds.**
- iPhone: install the 10-07 build from TestFlight (production build).
- Android: install the 10-07 Android build made with the **clinic** build profile. Only that build has Health Connect. The store
  (production) Android build deliberately leaves Health Connect out and says "Health Connect is coming to Android in an update."
  If you see that sentence in Part E, you have the wrong Android build: tell the operator and skip Part E.
- **Send:** the build number from each phone (Settings inside the app, or the TestFlight / Play listing).

A2. **Three switches the operator turns on for this pass** (operator decision; recommended default: on now, because production has
only your own accounts, and they can be turned straight off again):
- coach Codes screen (FEATURE_COACH_CODE_TOOLS),
- coach Broadcasts (FEATURE_COACH_BROADCASTS),
- no-coach Home (FEATURE_COACHLESS_HOME).
If they are still off you will see the old "Invite Codes" screen in Part B3, no Broadcasts button in Part H, and no banner on the
client Home in Part C. That is not a failure. Write "switch off" next to the step and move on.

A3. **Your featured-coach offer.** The client Home banner and Roman's card show exactly what is saved here. Either you save it in
the app (Part B2, only if the Featured coach editor made it into the build) or you send these values to the operator, who saves
them for you before Part C:
- Code: for example GP-BRADLEY (letters, numbers and dashes only)
- Package: the name of the one plan clients should land on
- Banner title (up to 120 characters), for example "Train with TGP's top coach"
- Offer line (up to 200 characters), for example "Bradley Gleave has slots open this month."
- Roman's pitch (up to 400 characters). Suggested wording: "Sir/Ma'am, just so you're aware, TGP's top coach has available
  slots. Enter code GP-BRADLEY and join for $X. Interested?"
- Accepting new clients: yes. Roman card: on.

A4. **Sign in with Apple should now work** (server Apple settings fixed 10-05 22:36). If it fails, send the exact message. Old note: (the server's Apple check was still
failing at 19:55 tonight). Test it anyway in C2; if it fails, use email to create that test account and carry on.

A5. **What you need:**
- A Google account that is NOT the one on your coach account (for the Android test client).
- The Apple ID on the iPhone (you will use "Hide My Email", so it makes a fresh test client).
- On Android: the Health Connect app (built into Android 14 and later; on older phones install "Health Connect" from the Play Store)
  and something that writes steps into it (Samsung Health, Google Fit or the phone's own step counter). Walk a few hundred steps
  before Part E.
- **Do not pay.** Every purchase step stops at the payment sheet. A completed payment is a real charge to a real card.

**Accounts used below**
| Name here | Phone | How it is made |
|---|---|---|
| Coach (you) | iPhone | your normal coach sign-in |
| Client A | Android | new, "Continue with Google" (C1) |
| Client I | iPhone | new, "Sign in with Apple" (C2) |

---

## Part B. Coach screens on the iPhone (15 minutes)

B1. **Tap:** open the app, sign in to your coach account the way you normally do.
**See:** the coach tabs along the bottom: Overview, Clients, Programs, Messages (speech bubble), Settings, and Team if your
account is a head coach. There should be no Community tab for coaches in this build (coach community is off in this build).
**Send:** pass/fail; tell us if a Community tab appears.

B2. **Featured coach editor (only if it is in the build).** **Tap:** Settings, then look for "Featured coach". Fill in the values
from A3 and save.
**See:** a saved confirmation; reopening the screen shows your values.
**Send:** where you found it, a screenshot after saving. If it is not there, write "not in build" and make sure the operator has your
A3 values.

B3. **Codes screen.** **Tap:** Clients tab, then the "Invite codes" button at the top.
**See:** a screen titled **"Codes"** with "Create code", "Bulk invite from a list", and each code showing Share, QR, Rotate,
Who joined, Turn off. (A screen titled "Invite Codes" with "Create new invite code" is the old screen: the switch in A2 is off.)
- **Tap:** Create code, then Create. **See:** the new code appears at the top of the list.
- **Tap:** QR on that new code. **See:** a QR code with "Scanning opens The Growth Project with this code filled in.", plus
  "Share QR image", "Share link", "Close". Point the Android phone's camera at it. **See:** it offers to open The Growth Project (or
  the store if the app is not installed). Note exactly what opens.
- **Tap:** Share QR image. **See:** the share sheet with a picture of the QR code. Send it to yourself in Messages and check it.
- **Tap:** Rotate on that code. **See:** it gets a new code; the old one is no longer listed as active.
- **Tap:** Turn off on it. **See:** a confirmation "Turn off GP-...?", then it shows as turned off.
- Do NOT rotate or turn off your featured code from A3.
**Send:** pass/fail per bullet, a screenshot of the Codes list and the QR sheet, and what the camera scan opened.

B4. **Roman for coaches.** **Tap:** Settings, Concierge section, "Roman" ("Ask for a brief, a client read, or the next step."). Type
"Give me a brief on my week" in "Message Roman" and tap Send.
**See:** a reply within about 10 seconds. If an "Allow AI help" sheet appears, tap "Allow AI help" and send again.
**Send:** pass/fail, a screenshot of the reply, anything that reads wrong.

B5. **Tap:** Settings, sign out. (The iPhone becomes Client I next.)

---

## Part C. Sign-in and the no-coach Home (15 minutes)

C1. **Google sign-in, Android.** **Tap:** open the app, "Continue with Google", pick the spare Google account from A5. If asked
"Already have an account?", tap "I am new, create an account". Choose **"I'm here to train"**.
**See:** the client first-day screens, then the client Home. If a notifications screen appears, tap allow.
**Send:** pass/fail; exact words of any error.

C2. **Apple sign-in, iPhone.** **Tap:** "Sign in with Apple" (on Create account), choose "Hide My Email", then "I'm here to train".
**See:** the client first-day screens, then the client Home. Expected today (A4): "Sign in with Apple didn't go through." If so,
screenshot it, then create Client I with email and password instead.
Also check: on the iPhone sign-in screen both "Sign in with Apple" and "Continue with Google" are offered (App Store rule).
**Send:** pass/fail, screenshot of any error.

C3. **No-coach Home, both phones.** **Tap:** the Home tab (house icon) on each client.
**See:**
- A banner with your banner title, your offer line, your name and photo, your package and price, a button **"Use code GP-..."** and
  **"Enter a coach code"**.
- A card marked **"FROM ROMAN"** with your pitch text word for word, and **"Enter the code"** and **"Not now"**.
**Send:** a screenshot of the Home on each phone. Check every word of the pitch, the price and the photo.

C4. **"Not now", iPhone.** **Tap:** "Not now" on Roman's card. Close the app fully and reopen it.
**See:** the card is gone and stays gone; the banner stays.
**Send:** pass/fail.

C5. **Wrong code, Android.** **Tap:** "Enter a coach code", type GP-ZZZZZZ.
**See:** "That code does not match a coach. Check the spelling, or ask the coach to send it again." Join stays unavailable.
**Send:** pass/fail.

C6. **Join with your code, Android.** **Tap:** Cancel, then "Use code GP-..." (the box is already filled), then "Join".
**See:** your photo, "Bradley ... is now your coach.", then a next step: "Choose a plan" (if your package is on sale),
"Done" ("Your plan with ... is active.") if the code includes a plan, or "Message ..." if there is nothing to buy.
Go back to Home: the banner and Roman's card are gone.
**Send:** the welcome screen screenshot and which button it showed. Do not tap "Choose a plan" yet (Part D).

C7. **Join with your code, iPhone.** Roman's card is hidden after C4, so **Tap:** "Use code GP-...", then "Join".
**See:** the same welcome screen as C6.
**Send:** pass/fail.

---

## Part D. Buying a plan (10 minutes, stop at the payment sheet)

D1. **iPhone, the "1:1 coaching" screen.** **Tap:** "Choose a plan" on the welcome screen (or More, Membership,
"VIEW COACHING PLANS").
**See:** a screen headed **"1:1 coaching with Bradley"** listing your plans with a price on each, and a button such as
"Subscribe for $X monthly", "Start free trial" or "Pay $X". This is the only place the iPhone sells anything (App Store rule
3.1.3(d)). On the iPhone the plan sheet from Android must NOT appear.
- **Tap:** the plan button. **See:** the Stripe payment sheet opens inside the app (no browser), showing the right amount, and
  for a trial, that nothing is charged today. **Tap:** close/cancel. Do not pay.
- Quick look around the iPhone client (Home, More, Membership, Roman): nothing else offers to sell anything (no AI credit packs,
  no program store, no tips, no website link in Membership). A locked feature should say "Your coach manages your access" with
  "Message your coach".
**Send:** screenshots of the 1:1 coaching screen and the payment sheet; any other place that sells something.

D2. **Android plan sheet.** **Tap:** on Client A, Home, then "Choose a plan" if still shown (or More, Membership, "VIEW COACHING
PLANS").
**See:** your package already selected, the price, the plan terms, then the payment sheet. Cancel. Do not pay.
**Send:** screenshots; pass/fail.

---

## Part E. Health Connect on Android (15 minutes; launch step 5)

E1. **Tap:** Client A, More (bottom right), "Connected devices" ("Apple Health, Health Connect and wearables").
**See:** a screen titled "Connections", "Manage the apps and devices that feed your health data.", with a Health Connect row
marked "Not connected", and a Samsung Health row that mirrors it.

E2. **Tap:** the Health Connect row, then Connect.
**See:** a sheet "Connect Health Connect" with: "When you continue, Health Connect asks for permission on this phone. The Growth
Project then brings in your last 30 days of Health Connect data, and new data each time you open Health, so your coach can
personalize your training, recovery, and check-ins. Nothing is read or shared until you allow it."
(Wrong build if it says "Health Connect is coming to Android in an update.")

E3. **Tap:** Continue. Android's own Health Connect permission page opens. Tap "Allow all", then Allow.
**See:** back in the app, the Health Connect row shows "Connected" with a last-synced time.
If the phone has no Health Connect, the button says "Get Health Connect" and opens the Play Store; install it and repeat.

E4. **Tap:** back to More, "Health and sleep". Look at Fitness, then Recovery.
**See:** steps (and any workouts, heart rate) for the last few days, and sleep under Recovery if the phone records it.
Open the Health Connect app (or Samsung Health) and compare: yesterday's steps and last night's sleep should match. Sleep must not
be doubled (for example 14 hours instead of 7).
**Send:** yesterday's steps and last night's sleep from both apps, and screenshots of the Fitness and Recovery screens.

E5. **Tap:** Connections, Health Connect, Disconnect, confirm.
**See:** the row goes back to "Not connected". Connect again (E2-E3) and it returns to "Connected".
**Send:** pass/fail; any message with a "Reference ..." code, word for word.

E6. (Optional, iPhone.) Same steps for **Apple Health** on Client I: More, Connected devices, Apple Health, Connect, allow in the
Apple Health sheet, then Health and sleep.
**Send:** pass/fail and the same step/sleep comparison.

---

## Part F. Roman for clients (10 minutes, Android)

F1. **Tap:** Client A, More, "Roman" ("Open a conversation with Roman"). Type "What should I focus on this week?" and Send.
**See:** an "Allow AI help" sheet the first time: tap "Allow AI help". Then a reply within about 10 seconds that makes sense for a
new client with no history (no invented numbers about you).
**Send:** screenshot; anything wrong or odd in tone.

F2. **Safety (please do these; they are fixed replies, not the AI).** Send each line on its own:
- "I want to hurt myself" -> **See:** a reply starting "I am sorry you are carrying this, and I am glad you said it here..." that
  says to call or text 988, and 911 if in immediate danger.
- "My chest hurts and my left arm is numb" -> **See:** "Please stop what you are doing and call 911 now, or your local emergency
  number..."
- "I'm going to kill this workout today" -> **See:** a normal training reply, NOT the 911 or 988 message.
**Send:** pass/fail per line, screenshots of all three.

F3. **Tap:** the conversations button in Roman's header (or Settings, "Your conversations with Roman").
**See:** "Your conversations with Roman" listing today's chat; opening it shows the messages.
**Send:** pass/fail.

---

## Part G. Community (10 minutes, both clients)

G1. **Tap:** the Community tab (people icon) on Client A.
**See:** tabs Today, Hall, Cohorts. On an empty Hall: "The Hall is quiet" and "Be the first to post".

G2. **Tap:** "Be the first to post" (or the new-post button), write "Test post from Android", post it.
**See:** the post appears in the Hall.
Known risk: a scout found tonight that a real coach may have no community space set up yet, so posting may fail. If it fails, copy
the exact words on screen; this is the most useful thing you can send from Part G.

G3. **Tap:** on Client I (iPhone), Community, Hall. **See:** the Android post. Comment "Test reply".
**See:** the comment shows on both phones.

G4. **Tap:** on Client I, the options button on the Android post ("Report or block ..."), Report, pick a reason, confirm. Then
options again, "Block ...", confirm.
**See:** a confirmation for the report; after the block, Client A's post disappears from Client I's Hall.
**Send:** pass/fail per step, screenshots, exact error words.

---

## Part H. Messages, Android push and Broadcasts (15 minutes)

Set up: on the iPhone, sign out of Client I and sign in as Coach. Android stays Client A.

H1. **Notifications on, Android.** **Tap:** Client A, Home. If a card says "Turn on notifications so you see messages and plan
updates from your coach.", tap "Turn on", then Allow. (If the first-day screens already asked and you allowed, the card is gone.)
Then open the phone's Settings, Apps, The Growth Project, Notifications.
**See:** notifications allowed, with categories "Coach Messages", "Reminders", "Milestones", "System".
**Send:** screenshot of that Android settings page.

H2. **Coach to client push.** Lock the Android phone. **Tap:** iPhone, Clients, open Client A, send "Test 1".
**See (Android, within about a minute):** a lock-screen notification titled "New message", "You have a new message. Open the app to
read it." It must NOT show your name or the message text. Tap it: the app opens on the messages screen with "Test 1".
**Send:** a photo or screenshot of the lock screen; how long it took; where the tap landed.

H3. **Client to coach push.** **Tap:** Android, Home, "Message Bradley", reply "Test 2". Lock the iPhone.
**See (iPhone):** a "New message" notification. If nothing arrives, check iPhone Settings, Notifications, The Growth Project. If the
app is not listed there, that is a known gap (the coach app never asks for notification permission on a fresh install); say so.
**Send:** pass/fail; whether the app was listed in iPhone Settings.

H4. **Broadcast now.** **Tap:** iPhone, Messages tab, the "Broadcasts" button at the top.
**See:** Scheduled, Recurring, Sent, and "New broadcast". (No Broadcasts button means the switch in A2 is off.)
**Tap:** New broadcast. Message: "Hi {first_name}, test broadcast". Send to: All clients (should count your 2 test clients).
When: Send now. Tap the review button. **See:** "Send to 2 clients now?" Tap Send.
**See (Android):** the message arrives in the coach thread with Client A's first name filled in (not "{first_name}"), plus a
"New message" push.
**Send:** screenshots of the confirm box and of the message on Android; pass/fail on the first name.

H5. **Broadcast later, then cancel.** **Tap:** New broadcast, any text, When: Schedule, pick a time 10 minutes ahead, Schedule.
**See:** it is listed under Scheduled. Cancel it and confirm. **See:** it moves to Sent as canceled, and nothing arrives on Android
10 minutes later.
**Send:** pass/fail.

H6. **Mute all.** **Tap:** Android, More, Settings, Notification settings, turn on "Mute all notifications". Coach sends "Test 3".
**See:** no push on Android (the message is still in the app). Turn "Mute all notifications" back off. Coach sends "Test 4": the
push arrives again.
(Known and being fixed: community replies still push while muted. No need to test that.)
**Send:** pass/fail for Test 3 and Test 4.

H7. **Who joined.** **Tap:** iPhone, Clients, "Invite codes", "Who joined" on your featured code.
**See:** both test clients listed.
**Send:** pass/fail.

---

## Part I. What to send back (copy, fill in, send to the operator)

```
DEVICE PASS 10-07 — Bradley
iPhone model + iOS version:            build number:
Android model + Android version:        build number:   (clinic build? yes/no)

A2 switches on during the pass? Codes yes/no, Broadcasts yes/no, No-coach Home yes/no
B1 coach sign-in / no coach Community tab:   pass/fail
B2 Featured coach editor:                     pass/fail/not in build
B3 Codes: create / QR / camera scan opened what / share QR / rotate / turn off:
B4 coach Roman:                               pass/fail
C1 Google sign-in (Android):                  pass/fail
C2 Apple sign-in (iPhone):                    pass/fail (error words)    Apple + Google both shown on iPhone: yes/no
C3 no-coach Home banner + Roman card (both):  pass/fail (wrong words?)
C4 Not now stays hidden:                      pass/fail
C5 wrong code message:                        pass/fail
C6/C7 join with code, which next button:      Android ____  iPhone ____
D1 iPhone "1:1 coaching with Bradley" + sheet, nothing else sells:   pass/fail
D2 Android plan sheet:                        pass/fail
E1-E5 Health Connect connect / data / disconnect:   pass/fail
E4 steps yesterday (TGP vs Health Connect): ____ vs ____   sleep last night: ____ vs ____
E6 Apple Health (optional):                   pass/fail
F1 Roman client reply:                        pass/fail
F2 988 / 911 / gym talk:                      pass/fail per line
F3 Your conversations with Roman:             pass/fail
G1-G4 Community view / post / reply / report / block:   pass/fail (error words)
H1 Android notification settings + 4 categories:   pass/fail
H2 coach -> Android push (generic text, tap lands on messages, time):   pass/fail
H3 client -> coach push on iPhone:            pass/fail (app listed in iPhone Settings? yes/no)
H4 broadcast now + first name filled:         pass/fail
H5 scheduled + cancel:                        pass/fail
H6 mute all stops push / unmute restores:     pass/fail
H7 who joined:                                pass/fail
Anything else that looked wrong, slow or confusing:
```
Attach every screenshot with the step number in the file name or message (for example "E4-fitness.png").

## Notes for the operator (not for the owner)
- Profile choice for Android matters: eas.json production has TGP_ANDROID_HEALTH_CONNECT=0; only the clinic profile builds Health
  Connect in (app.config.js). Part E needs the clinic-profile APK/AAB.
- A2 needs a flags PR + env sync before the pass, or the owner tests Parts B3, C3-C7, H4-H5, H7 against old screens. Recommended
  default: turn the three on for the pass (production holds only the owner's accounts), kill = unset.
- A3: the featured-coach config must exist before Part C (PUT /admin/featured-coach with the owner's values, or the W3-06 editor).
- Expected failures already known: Sign in with Apple until APPLE_AUDIENCES is fixed (A4); coach has no push permission ask on a
  fresh install (C-S-PUSH-3, H3); community push ignores Mute all (B-S-PUSH-1, not tested here); community posting may dead-end
  (S-E2E-CLIENT-123 B-E2E-1 candidate, G2).
- Part B2 text is generic because the W3-06 editor had no branch at 21:40; update the menu path once its PR lands.
