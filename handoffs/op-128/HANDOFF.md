# Operator agent 128 to agent 129: handoff

Written 2026-10-07, 15:35 PDT, by operator agent 128. The owner stopped the session at 40.5k of 45k credits.
GitHub main wins over anything written here. Verify every head, verdict and run on GitHub before acting on it.
At 15:31 the shared GitHub token hit its API rate limit, so the PR states below are as of 15:30.

## 1. Read first, in this order

1. `TGP_SOURCE_OF_TRUTH.md` (root of tgp-agent-context): A1, the A2 overrides, A3 and A6. A6.10 holds the owner's decisions of
   2026-10-07. The LAST occurrence of a heading wins.
2. Supporting documents: `AGENT_RULES.md`, `OPERATOR_STANDING_ORDERS.md`, `LIVE_STATE.md`, `FLAGS_LAUNCH_LEDGER.md`,
   `MERGE_DEPENDENCY_GUIDE.md`, `MODEL_ROUTING.md` and `DECISION_LOG.md`.
3. `handoffs/op-127/HANDOFF.md` and `handoffs/op-127/AGENT_128_PROMPT.md`. Every rule agent 128 ran under still applies.
4. This folder (`handoffs/op-128/`):
   - `AGENT_129_NOTES.md`: the owner's words today, quoted exactly, plus the iOS steps and the audit fix lists.
   - `STOPPED_HALFWAY.md`: every audit and job that stopped early.
   - `ops/`: `_COMMON_128.md` (the shared agent rules), `JOBS128.md` (every job entry, including CLIENTFIX-128) and `FLEET.md` (the timeline).
   - `reports/`: one report per agent.
   - `scripts/`: `merge_if_dual.sh`, `approve_deploy.sh`, `fleetscan.sh`, `resolve.py`, `heavy.sh` and `link_deps.sh`.
     Copy the scripts to `/home/user/workspace/ops128/` and `/home/user/workspace/ops/`, and recreate `ops/lanes128/` from `ops/`.

## 2. Owner rules that matter most

- **Commits:** as Bradley Gleave, bradley@bradleytgpcoaching.com, with no AI co-author.
- **Public repos:** never put secrets, private customer records or the clinic partner's name in them. Never name the clinic partner anywhere.
- **Supabase** `rpyfdsgxxltzutgqeouk`: SELECT only, unless the owner approves a specific write. No spending money.
- **Deploys:** only through `fly-deploy.yml`, at the current main exact SHA, after main CI, CodeQL and SBOM are green. Release Please always fails; ignore it.
  - The owner has given standing approval for production gate approvals (`approve_deploy.sh <run> <secs>`).
  - Use `migrations=apply-migrations` only when prisma changed.
- **Flags:** change only via `.github/fly-env-desired-state.json` plus `fly-env-sync.yml`.
  - Steps: plan and approve; read the plan; apply with `confirm=SET deploy_staged=true` and approve; verify "declared present; Fly Deployed", then check the behaviour.
  - Never run fly-secrets-set.
- **Merges:**
  - T3/T4 PRs need both lenses (Claude Opus 5.5 and GPT-6.1 Sol) at the exact head.
  - Merge only with `merge_if_dual.sh <repo> <n>`.
  - A same-head REQUEST CHANGES must be fixed.
  - PRs over 1,500 lines auto-fail; target under 800.
- **Scope:** B-grade findings only, each with a one-sentence user story. Edge cases are "C (edge, deferred to 10k clients)".
- **Copy:** no first person (Roman excepted), no exclamation marks, no emojis, no generic errors.
  - The six redo rules apply; rules 4 and 6 win over rule 5.
  - Theme colours only.
  - Every design PR needs a parity table and a test.
- **Owner messages:**
  - Start with "Launch path: N/7 steps done | merged today | deployed today | open decisions | credits used /45k".
  - End with "Your next step: ..." or "Nothing needed from you."
  - Plain words, numbered decisions each with a recommended default, coaches and clients first.
  - No risk sections and no terminal commands.
  - Times only from `TZ=America/Los_Angeles date`.
- **Credits:** the owner reports them; never predict them. Above about 8 agents, ask for the number every 15 minutes.
  - For pacing only: about 40 agents used about 12k between 14:25 and 14:44.

## 3. Production right now

- **Backend:**
  - Deploy 26 (`87f4489b`, run 37695999540) succeeded at about 15:29; /readyz shows db up.
  - It carries b#856 (a Roman tools turn ends before the app gives up, and notes are read only with memory consent) and b#853 (prep guide source, and merged grocery items).
  - Backend main has since moved: b#854 merged at 15:30.
- **Flags:**
  - `FEATURE_ROMAN_TOOLS=true` since 15:04 (verified "Fly Deployed"). Not yet tried with a real client question.
  - `FEATURE_ROMAN_MEMORY` is merged as true in the desired state (b#854) but NOT applied. Plan run 37696669686 succeeded; read its output. If it shows exactly "1 to set" for FEATURE_ROMAN_MEMORY, apply and verify. Every condition is met: the owner said yes, the coach wording is live, and b#856 is deployed.
  - `FEATURE_ROMAN_PLAYBOOK` is unset; b#855 turns it on (see decision 2 in section 7).
- **Today's totals:** 92 PRs merged, 8 deploys.

## 4. Tonight: the iOS build at 23:00 PDT (the owner: "regardless")

The owner at 14:40: "the only thing between us and IOS submission is just a final APK build with all mobile UI updates, tester account creation, and thats it!" Cut tonight's builds from mobile main at 23:00 PDT.

1. Merge every dual-approved mobile PR before 23:00. Anything not merged ships as main has it.
2. **Build settings:**
   - `eas.json` has a production profile and no submit profile; add one, or upload through App Store Connect.
   - `app.json`: `com.growthproject.app`, version 1.0.0, buildNumber "6" (bump it; appVersionSource is local).
   - The App Store Connect key, signing and push key are already in Expo.
   - The Expo Free plan allows 15 iOS builds a month.
   - The Expo proxy setup (EXPO_TOKEN injected by the proxy; api.expo.dev only) is in the source of truth near line 4195.
3. Build the final APK with the workflow on `ci/APK-127-2` and the screenshots with `ci/SHOTS-127-2`. Never merge `ci/*` branches.
4. **Tester accounts:** the owner creates them. Ask him for both email addresses.
   - One coach.
   - One client of that coach with an ACTIVE package (food logging is paid-only), one meal plan and one workout.
5. Check Roman's tools and memory with the tester client, then submit to TestFlight.

## 5. Open PRs at 15:30 and what each needs

| PR | For clients and coaches | Needs |
|---|---|---|
| m#521 `0b10156d` | Workout autosave (owner 15:03): reopening goes straight back in; no delete option; leaving asks "Log this workout?" | CI, then the operator posts READY; T4, both lenses. Builder defaults (keep): an empty workout is cleared on leave; Finish and log after a tab press lands on Train. |
| m#523 `f75f5857` (draft) | The You tab no longer sticks on Roman chat; Back in every chat state; returning clients aren't greeted as new | CI, mark ready, operator READY, both lenses |
| m#522 `563b6657` (draft) | Profile shows the real saved values | A finisher: failing-first test, parity table, README, tests, CI, READY (see `reports/CF-PROFILE-128.md`) |
| m#502 `a83774e0` | Role choice and invite; signing in keeps the invite code | CI (likeliest failure: `InviteAndVerifiedVisual.test.tsx`), then FIX ROUND 2 READY, both lenses |
| m#520 `29d3de2a` | iPhone weigh-in above the number pad | Both lenses |
| m#519 `e84c1e4a`, m#518 `cd4a29d2`, m#513 `79e0760d` | Exercise library, sign-up email resend, coach credits line | Opus approved; Sol |
| m#506 `caa91063` | Roman conversations, truthful guidance banner | Both lenses |
| m#514 `d3a4f15d` | Prep guide | Sol REQUEST CHANGES: unknown source must not deny meal-plan origin; hide the week filter separately. Fix lane. |
| m#494 `3950c6eb` | Recipes, saved state | Opus approved; the latest Sol comment has findings (issuecomment 6047974476). Fix lane, then Sol. |
| m#490 `e9da3274` | Meal plan | A CI FAILURE at this operator README-merge head; fix, then both lenses |
| m#504 `431f65b8`, m#485 `6515839a` | Sign in, assigned workout | Re-review at these heads (README-merge only) |
| b#857 `daf0ad19` | Payment-email replies reach the coach | Opus approved; Sol; deploy after merge |
| b#855 `f92f6936` | Coach playbook on | READY and both lenses; merge after m#513 and decision 2 |

Merged at 15:30: b#854, m#517, m#515 and m#507. Ignore older PRs (dependabot, pre-127 drafts).

## 6. Launch list for agent 129: start all 73 at once, then 8 in wave 2 (81 jobs)

These are not 80 separate needs, because the work overlaps. Reviewers are standing lanes that review PR after PR (today Opus A posted 24
verdicts, Opus B 27 and Sol A 26), so 8 reviewers cover the 16 ready PRs and every new one. The 48 agents stopped at 15:24 were 41 builders
plus 7 reviewer and fixer lanes. New job entries are in `ops/JOBS129.md`; older ones are in `ops/JOBS128.md`. Explorers launch first.

### A. Explorers: use the app like real people and break it (3, launch first)

| # | Agent | Model | What it does | Entry |
|---:|---|---|---|---|
| 1 | EXPLORE-CLIENT-129 | Claude Opus 5.5 | A paid client's first two weeks: close the app mid-flow, wifi off, push links signed out, forgotten screens | JOBS129 `## EXPLORE-129` |
| 2 | EXPLORE-COACH-129 | Claude Opus 5.5 | A coach's first two weeks: Stripe Connect, packages, invites, building and assigning, messaging, payments | JOBS129 `## EXPLORE-129` |
| 3 | EXPLORE-SUBCOACH-129 | Claude Opus 5.5 | A sub-coach and head coach: assignments, what a sub-coach can see and do, removal | JOBS129 `## EXPLORE-129` |

### B. Reviewers (8)

| # | Agent | Model | What it does | Entry |
|---:|---|---|---|---|
| 4 | LN-OPUS-A3-129 | Claude Opus 5.5 | Reviews every READY PR at its head; loop until 22:45 | JOBS128 `## LN-OPUS-128` |
| 5 | LN-OPUS-B3-129 | Claude Opus 5.5 | Reviews every READY PR at its head; loop until 22:45 | JOBS128 `## LN-OPUS-128` |
| 6 | LN-OPUS-C3-129 | Claude Opus 5.5 | Reviews every READY PR at its head; loop until 22:45 | JOBS128 `## LN-OPUS-128` |
| 7 | LN-OPUS-D3-129 | Claude Opus 5.5 | Reviews every READY PR at its head; loop until 22:45 | JOBS128 `## LN-OPUS-128` |
| 8 | LN-SOL-A3-129 | GPT-6.1 Sol | Reviews every READY PR at its head; loop until 22:45 | JOBS128 `## LN-SOL-128` |
| 9 | LN-SOL-B3-129 | GPT-6.1 Sol | Reviews every READY PR at its head; loop until 22:45 | JOBS128 `## LN-SOL-128` |
| 10 | LN-SOL-C3-129 | GPT-6.1 Sol | Reviews every READY PR at its head; loop until 22:45 | JOBS128 `## LN-SOL-128` |
| 11 | LN-SOL-D3-129 | GPT-6.1 Sol | Reviews every READY PR at its head; loop until 22:45 | JOBS128 `## LN-SOL-128` |

### C. Fixers and finishers (3)

| # | Agent | Model | What it does | Entry |
|---:|---|---|---|---|
| 12 | FIX-OPUS-129 | Claude Opus 5.5 | Standing fix lane: m#514, m#494, m#490 (CI failure), then every new REQUEST CHANGES, T3/T4 first; until 22:30 | JOBS128 `## FIX-128` (standing) |
| 13 | FIX-SOL-129 | GPT-6.1 Sol | Standing fix lane, T1/T2 first; until 22:30 | JOBS128 `## FIX-128` (standing) |
| 14 | CF-PROFILE-FIN-129 | GPT-6.1 Sol | Finish draft m#522 (Profile shows real saved values) | JOBS129 |

### D. Client-side bug fixes: CLIENTFIX-128 (41, one PR each, READY by 21:30)

| # | Agent | Model | What it fixes for clients and coaches |
|---:|---|---|---|
| 15 | CF-SETTINGS-128 | Claude Opus 5.5 | Settings switches that do nothing: make them work or say exactly what they do |
| 16 | CF-TRAIN-TAB-128 | Claude Opus 5.5 | Train tab: true states and the calm design (not the live workout) |
| 17 | CF-HOME-START-128 | GPT-6.1 Sol | Home "Start" opens the right workout |
| 18 | CF-GUIDE-READ-128 | Claude Opus 5.5 | Clients can read their Coach Guidelines (today the button returns 403) |
| 19 | CF-REMIND-COPY-128 | GPT-6.1 Sol | Honest workout reminder copy (backend) |
| 20 | CF-BODY-J2-128 | Claude Opus 5.5 | Edit and delete a weigh-in (backend, T4) |
| 21 | CF-BODY-J3-128 | Claude Opus 5.5 | Honest sharing copy, including health-app data and coachless clients |
| 22 | CF-BODY-J4-128 | GPT-6.1 Sol | Report screen dates and states |
| 23 | CF-SHARE-GATE-128 | Claude Opus 5.5 | The four sharing switches gate every coach read (privacy, T4) |
| 24 | CF-INVITE-128 | GPT-6.1 Sol | A pending coach invite refreshes |
| 25 | CF-CONTACT-128 | GPT-6.1 Sol | Honest change-coach support copy |
| 26 | CF-CHECKIN-128 | GPT-6.1 Sol | Check-in without a package is explained, not silently refused |
| 27 | CF-SHARE-UI-128 | GPT-6.1 Sol | Sharing screen states |
| 28 | CF-TRUST-128 | GPT-6.1 Sol | Trust and Privacy copy |
| 29 | CF-DATA-COPY-128 | GPT-6.1 Sol | Data export, delete account and blocked users copy |
| 30 | CF-HELP-128 | GPT-6.1 Sol | Change email through a prefilled support email row |
| 31 | CF-COMM-BE-128 | Claude Opus 5.5 | Community posts and replies show author first names (backend) |
| 32 | CF-COMM-SAFE-128 | Claude Opus 5.5 | Self-harm reports show 988/911; leaderboard names filtered |
| 33 | CF-COMM-SPACE-128 | GPT-6.1 Sol | Community spaces states |
| 34 | CF-COMM-THREAD-128 | Claude Opus 5.5 | Threads: reactions, author, time, delete own post, Back |
| 35 | CF-COMM-WINS-128 | Claude Opus 5.5 | Wins screen redo and an honest privacy line |
| 36 | CF-FOOD-LOAD-128 | GPT-6.1 Sol | Food log loading and error states |
| 37 | CF-FOOD-WATER-128 | GPT-6.1 Sol | Water tracking fixes |
| 38 | CF-FAST-CALM-128 | Claude Opus 5.5 | Fasting screen redo |
| 39 | CF-FOOD-UNDO-BE-128 | Claude Opus 5.5 | Delete water and fast entries (backend) |
| 40 | CF-MONEY-PLANS-128 | Claude Opus 5.5 | Plans screens tell the truth |
| 41 | CF-MONEY-MEMBER-128 | Claude Opus 5.5 | Membership status shows the real state |
| 42 | CF-NOTIF-FG-128 | GPT-6.1 Sol | In-app banner for pushes while the app is open |
| 43 | CF-NOTIF-DIGEST-128 | Claude Opus 5.5 | Digest emails: right streaks and units; daily digest off by default |
| 44 | CF-ONB-TOUR-128 | GPT-6.1 Sol | Roman's tour says only true things |
| 45 | CF-ONB-LEAN-128 | GPT-6.1 Sol | Lean onboarding: no Day-1 repeat, code asked once, no check-in time step |
| 46 | CF-ONB-WIN-128 | GPT-6.1 Sol | First-day win |
| 47 | CF-ONB-NUDGE-128 | GPT-6.1 Sol | Onboarding nudges |
| 48 | CF-ROMAN-COPY-B-128 | Claude Opus 5.5 | Roman safety: fixed eating-disorder reply, no reintroductions, coachless copy (backend) |
| 49 | CF-ROMAN-COPY-M-128 | GPT-6.1 Sol | Roman app copy |
| 50 | CF-LOGPLAN-128 | Claude Opus 5.5 | "Log this meal" from the meal plan |
| 51 | CF-ONE-LIST-128 | Claude Opus 5.5 | One Grocery list (Shopping merged in) |
| 52 | CF-ALLERGY-128 | Claude Opus 5.5 | Real allergy filtering (backend, then mobile; T4 safety) |
| 53 | CF-MEAL-IMAGES-128 | Claude Opus 5.5 | No missing meal images; calm placeholder |
| 54 | CF-QA-THEME-128 | Claude Opus 5.5 | One hairline colour and one overline size across the app |
| 55 | CF-COACH-PAY-BE-128 | Claude Opus 5.5 | Coach refunds, pause and cancel recurring payments (backend, T4) |

### E. Mobile screens never started (3)

| # | Agent | Model | Screen | Entry |
|---:|---|---|---|---|
| 56 | DES-AQ-127 | as its entry says | Community messages | JOBS128 tranche-3 entry |
| 57 | DES-AZ-127 | as its entry says | Devices | JOBS128 tranche-3 entry |
| 58 | DES-P-128 | as its entry says | Progress, the full picture (after m#520 merges: same file) | JOBS128 `## DES-P-128` |

### F. Roman's intelligence (2 agents plus operator steps)

| # | Agent | Model | What it does | Entry |
|---:|---|---|---|---|
| 59 | ROMAN-GUARD-129 | Claude Opus 5.5 | A correct number no longer gets Roman's whole reply replaced | JOBS129 |
| 60 | PB-GAP-129 | Claude Opus 5.5 | At most one playbook rebuild per coach every 6 hours, before the playbook is turned on | JOBS129 |

Operator steps:
- Apply FEATURE_ROMAN_MEMORY (section 3).
- Merge m#513, PB-GAP-129 and b#855, then apply FEATURE_ROMAN_PLAYBOOK.
- Check tools and memory with the tester client.

### G. Auditors (9)

| # | Agent | Model | What it does | Entry |
|---:|---|---|---|---|
| 61 | AUD-FIN-ONB-129 | Claude Opus 5.5 | Finish onboarding audit's unchecked list | JOBS129 |
| 62 | AUD-FIN-MONEY-129 | Claude Opus 5.5 | Finish payments audit's unchecked list | JOBS129 |
| 63 | AUD-FIN-TRAIN-129 | Claude Opus 5.5 | Finish training audit (coach view of logs, Android back mid-workout, ...) | JOBS129 |
| 64 | AUD-FIN-BODY-129 | Claude Opus 5.5 | Finish body and health audit's unchecked list | JOBS129 |
| 65 | AUD-FIN-COACH-129 | Claude Opus 5.5 | Finish coach-link audit (booking reminders, coach AI vs sharing switches) | JOBS129 |
| 66 | AUD-FIN-FOOD-129 | Claude Opus 5.5 | Finish food audit (Home food/water card, paywall copy, coach view of food) | JOBS129 |
| 67 | AUD-FIN-DESIGN-129 | Claude Opus 5.5 | Finish design QA (vertical spacing, coach empty and loading states) | JOBS129 |
| 68 | AUD-COACH-WEEK1-129 | Claude Opus 5.5 | The coach's first week, never audited | JOBS129 |
| 69 | AUD-ORG-129 | Claude Opus 5.5 | Head coach and sub-coach roles and permissions | JOBS129 |

### H. Launch to-do (4 agents plus owner items)

| # | Agent | Model | What it does | Entry |
|---:|---|---|---|---|
| 70 | IOS-RELEASE-129 | Claude Opus 5.5 | Submit profile, build number, App Review notes, permission strings, deletion and sign-in checks; READY by 21:30 | JOBS129 |
| 71 | STORE-AUD-129 | Claude Opus 5.5 | Store listing, screenshots plan and privacy labels match what the app really does | JOBS129 |
| 72 | APK-FINAL-129 | GPT-6.1 Sol | Final APK from mobile main at 23:00 | JOBS129 |
| 73 | SHOTS-129 | GPT-6.1 Sol | App Store screenshots from mobile main at 23:00 | JOBS129 |

Owner items:
- Two tester accounts: a coach, and a client of that coach with an active package, one meal plan and one workout.
- Approval for the TestFlight submission.

### Wave 2 (8, launch as each predecessor merges)

- COACH-PAY-M-129: the coach payments screen, after CF-COACH-PAY-BE-128.
- QA-PRIM, QA-LIVE (after m#521), QA-SETTINGS (after CF-SETTINGS), QA-HABITS-CAL-COMM, QA-ROMAN-PROFILE, QA-COACH, QA-SHEETS (JOBS129 `## Wave 2`).

### How to launch

- **One objective per agent:** "You are <ID> for operator agent 129 in the TGP chain. Read <path>/_COMMON_128.md fully, then ONLY the
  entry '<entry>' in <path>/<JOBS file>; your row or instance is '<ID>'. GitHub via bash with api_credentials=["github"]. Never merge, deploy
  or change production. Report ops/reports/<ID>.md."
- **Builders** finish right after their READY comment. Lenses and fixers run as standing lanes.
- **Before launching:** rebuild the shared deps if the sandbox is new, and delete stale CLAIM comments (fleetscan.sh).
- **Load:** the sandbox has 2 CPUs; at 51 agents the load average reached 35 but nothing broke. Builders prove tests through CI when the heavy line is long.
- **GitHub:** poll at most once every 3 minutes per agent, because the shared token hit its rate limit at 15:31.

## 7. Decisions to ask the owner, each with its default

1. **Workout autosave details (m#521):** leaving with nothing logged clears the empty workout, and "Finish and log" after a tab press lands on Train. Default: keep both.
2. **Coach playbook:** add the 6-hour minimum gap between rebuilds (PB-GAP-129) before turning the playbook on. Default: yes.
3. **Exercise catalog:** the production catalog has 0 rows. m#519 already shows real exercises through the search, so no data write is needed. Default: no seed tonight.

## 8. Problems found today (B-grade) and where each stands

| Problem: the client or coach story | Where it stands |
|---|---|
| On iPhone, the keyboard hid Save, so a client could not log a weigh-in | m#520 |
| A client who left mid-workout came back to a closed workout | m#521 |
| The refund line promised coach refunds that do not exist | m#517 merged; CF-COACH-PAY-BE plus the payments screen are the real fix |
| A client's reply to a payment email went to noreply | b#857 |
| A new client who lost the sign-up email had no way to get another | m#518 |
| The client exercise library was empty | m#519 |
| The four sharing switches don't stop coach reads (privacy) | CF-SHARE-GATE, CF-BODY-J3 |
| Settings switches that do nothing; Profile shows "Not set"; Membership status wrong | CF-SETTINGS; m#522; CF-MONEY-MEMBER |
| The You tab stuck on Roman chat; the Roman tour over-promises | m#523; CF-ONB-TOUR |
| A self-harm report in community shows no 988/911 line | CF-COMM-SAFE |
| Meal plan and grocery not connected ("Add all" doubled, plans twice, saved recipes reopened unsaved) | b#853 merged, m#514, m#494; CF-LOGPLAN, CF-ONE-LIST |
| Missing meal images; no allergy filter (honest copy merged in m#505) | CF-MEAL-IMAGES; CF-ALLERGY |
| The playbook spends coach AI credits without saying so | m#513 (the owner keeps the coach pool) |
| Redone screens don't match each other (two hairline colours, five overline sizes) | CF-QA-THEME, then the second-wave QA rows |

**Process problems:**
- `fly-deploy.yml` failed once with "flyctl: command not found" at "Record currently running machines" (run 37691195804). A plain re-run at the same SHA worked.
- Nearly every screen PR conflicts in a README. Use `resolve.py`: the PR keeps its own entries and main keeps the rest. Commit as Bradley Gleave and comment "OPERATOR MAIN MERGE", asking for re-review.
- The shared GitHub token hits its API rate limit with many agents, as it did at 15:31. Keep polling to once every 3 minutes per agent.

## 9. Owner decisions made today (also in A6.10 and AGENT_129_NOTES.md)

- **Roman memory and coach playbook:** on "as soon as the coach wording is live". The playbook bills the coach's AI pool.
- **Meal planning:**
  - "Log this meal": yes.
  - One list: keep Grocery and cut Shopping, so eating healthy feels "SIMPLE AND EASY", with no missing images.
  - Allergy filtering: "absolutely neccesary".
- **Workouts:** autosave; returning opens the live workout; no delete option; leaving for another page asks to log or save.
- **Money:** coaches must be able to see payments per client, refund, pause and cancel. Payment emails reply to the coach.
- **Deferred and timing:** coach recipe writing comes after the iOS submission. The build cutoff is 23:00 PDT.
