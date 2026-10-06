# Older open PRs, explained

TGP, checked 2026-10-06 10:50 PDT against GitHub and both main branches.

There are 55 older open PRs: 43 in backend, 12 in mobile. None of them is needed for the v1 launch. The reasons fall into four kinds:
- **Already done another way:** the same fix or feature reached main through a later PR, so this one is left over.
- **Not in v1:** the feature isn't on the day-1 list you approved on 10-05.
- **Too risky this week:** changing core libraries right before the store build means retesting the whole app.
- **Paperwork:** design notes, backlog entries or rules for how agents work, with no change to the product.

Closing any of them needs your OK. Nothing here needs to happen before Wednesday's build.

---

## 1. Automatic package updates (22 PRs)

GitHub's update bot (Dependabot) opens these on its own whenever a library the app uses releases a new version. Nobody asked for them. The goal is to stay current on libraries.

Why not now: a library change touches code all over the app, and several of these are major versions that need code changes. Doing them days before the store build means retesting everything. Security problems are handled separately: an automatic check blocks any serious known vulnerability, and that is the check fixed this morning. The plan for after launch: move them in small batches, one area at a time.

### Backend: the automated checks themselves (5, from June)

| PR | What it updates | Note |
|---|---|---|
| [471](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/471) | Release Please 4 to 5: the tool that drafts version numbers and release notes | Major version. That job already fails on main and isn't required. |
| [472](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/472) | "checkout" 4 to 7: the step that downloads the code in every automated check | Major version. If it breaks, every merge is blocked. |
| [473](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/473) | Size label 0.5.4 to 0.5.7: tags each PR as small, medium or large | Cosmetic. |
| [474](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/474) | "github-script" 8 to 9: runs small scripts inside the checks | Major version. |
| [475](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/475) | "upload-artifact" 4 to 7: saves files (test reports) from the checks | Major version. |

### Backend: server libraries (10, from 10-01)

| PR | What it updates | Note |
|---|---|---|
| [612](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/612), [618](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/618), [619](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/619), [621](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/621) | NestJS 11 to 12, the framework the whole backend is built on (testing, command line, web server, core) | A major upgrade. The four parts must move together, so merging one alone would break the server. This is its own project after launch. |
| [613](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/613) | Node type definitions | Developer-only, low risk, no benefit for launch. |
| [614](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/614) | ts-jest: the test runner helper | Small patch, tests only. |
| [615](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/615) | js-yaml 4 to 5: reads YAML settings files | Major version. Main deliberately pins 4.3.2 for the API docs tool. |
| [616](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/616) | AWS S3 client: file and photo storage | Minor, but it touches uploads. |
| [617](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/617) | PostHog: usage analytics | Minor. |
| [620](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/620) | Supabase client: database and login library | Minor, but it touches sign-in and sign-up, the worst thing to change on launch week. |

### Mobile (7, June and July)

| PR | What it updates | Note |
|---|---|---|
| [276](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/276), [286](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/286) | "checkout" and "setup-node" 6 to 7: steps in the automated checks | Check tooling only. |
| [278](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/278) | React Navigation: moves you between every screen | Touches every screen. |
| [279](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/279) | Sentry 7 to 8: crash reporting | Major version, and tied to the build settings. |
| [280](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/280) | Worklets 0.8 to 0.10: the animation engine | Must match the Expo version exactly; a mismatch can crash the app on launch. |
| [281](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/281) | Crisp: the support chat widget | Minor. |
| [282](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/282) | Four developer-only tools | Not in the app itself. |

---

## 2. The importer, called "Scout" (21 PRs)

**What it is:** a way for a coach who already uses another coaching app to bring their clients, workouts and history into TGP. A browser extension reads the other site, an AI works out how that site's data maps into TGP, and the server stores it. Imported clients appear on the coach's list before they sign up.

**The goal:** make switching to TGP painless for established coaches, which matters for growth.

**Why not v1:**
- It isn't on the day-1 list you approved on 10-05. The source of truth marks these PRs "not launch work".
- It is unfinished. Most of these are drafts, and most sit on a side branch (`integration/importer`), not main.
- Several are huge, between 4,000 and 11,000 lines.
- They change the security rules on client data tables, and they send outside data to an AI that costs money.
- Work on it stopped at the end of September. All its switches are off in production.

| PR | What it is | Why it's waiting |
|---|---|---|
| [522](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/522) (July) | Fix: the importer silently threw away the second batch of data in an import | Already done another way: main's rule already includes the missing field. Can be closed. |
| [525](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/525) (Sept, draft) | A large "reliability repair" bundle from an earlier agent: startup checks, diagnostics, readiness checks, honest importer status wording (4,500 lines) | Built on a repair branch, never reviewed, stale since 09-18. Main got its own readiness checks since. |
| [526](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/526) (draft) | Importer setup recovery: if an import setup fails halfway, it resumes safely | On hold since 09-18. Importer only. |
| [527](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/527) (draft) | Changes the rules agents work under: removes the PR size limit and test-count quotas | A process change, not a product change. It needs your decision, not a merge. |
| [528](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/528) (draft) | Importer "ledger": a table recording where each imported item came from | Labelled "not reviewed, not merge-ready" by its own author. |
| [529](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/529) (draft) | The next piece on top of 528: source tracking and paging | Depends on 528. |
| [574](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/574) | Test-only update for importer security tests | Importer side branch only. |
| [577](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/577) (draft) | Shows imported people (not yet signed up) on the coach's client list | Importer only. |
| [580](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/580) | A script that lists which server keys are missing, without showing their values | Mostly done another way: the server settings tool used this week (env sync) already checks every declared setting. |
| [581](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/581) | Design note: how the importer learns another site's layout once and reuses it | Paperwork. |
| [582](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/582) (draft) | Database queries for checking a pilot import, with private details hidden | Importer pilot only. |
| [583](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/583) (draft) | A script comparing live database security rules with what they should be | Useful tooling, but built on the importer branch. The 10-05 security review of main covered this by hand. |
| [584](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/584) | An automated job that writes production server secrets from an approved list | Already done another way, and unsafe to add. The current rule is to change settings only through env sync and never run the secrets-writing job. |
| [587](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/587) | Importer database change: imported people can own workouts, weight logs, habits and check-ins before they sign up; new security rules on 8 tables (4,357 lines) | The riskiest kind of change (client data security). Importer only. |
| [589](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/589) (draft) | Proof that an import got everything before it is called "complete" (5,900 lines) | Importer only. |
| [590](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/590) (draft) | Design note: which kinds of data the importer must bring over | Paperwork. |
| [591](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/591) (draft) | The AI "learning" part: reads the other site's structure, checks the AI's answers, blocks tricks hidden in that content (11,446 lines) | Huge and unfinished. Importer only. |
| [592](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/592) (draft) | The gateway to the AI for imports, with a daily spending cap (placeholder $20 a day) and an off switch | Importer only; spends money. |
| [593](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/593) | Tightens a database security rule so a coach can only create workout assignments for their own clients | See the note below: it contains a small real tightening that also applies to main today. |
| [594](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/594) | Design note: when an import may be called "complete" | Paperwork. |
| mobile [302](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/302) (draft) | App wording for when an import finds nothing usable | Importer only. |

**Note on 593.** Today's database rule lets a signed-in coach write a workout assignment if they name themselves as the coach. It doesn't also check that the client is theirs. Abusing it would take going around the app with that coach's own login and knowing another client's internal ID. The app itself always checks properly, so normal use is safe. The fix in 593 can't land alone because it is built on 587. I recommend agent 124 checks whether this is actually reachable on main and, if it is, moves just that one rule over as a small PR. The same applies to meal plan assignments.

---

## 3. The earlier Roman upgrade (5 PRs, from 09-30)

**What it was:** a five-part upgrade of Roman, the AI coach:
- [598](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/598): switch from a retired AI model that made Roman reply with nothing, and show an honest error instead of a blank.
- [601](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/601): record the user's permission before their data goes to the AI company, which Apple requires.
- [602](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/602): give Roman the client's own plan, targets and coach notes for each reply, and only that client's.
- [603](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/603): safety rules (calorie floor, referral and emergency replies).
- [605](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/605): a test suite that grades Roman on 30 sample conversations (12,600 lines).

**Why we wouldn't do it:** already done another way. Earlier agents rebuilt the same work as smaller PRs that landed on main:
- Roman now uses a current model.
- The AI permission record is on main.
- Roman's per-client context and safety checks are on main.
- This week's 911 and 988 crisis fixes are live.

What never landed is the 30-conversation grading suite (605) and a Roman health-check page (in 598). Both are worth redoing after launch, but they aren't needed to launch.

---

## 4. Custom exercises (5 PRs, from June)

**What it is:** lets a coach (a yoga teacher, for example) create their own exercise that isn't in TGP's catalog, with a name, instructions and their own photo or video, and reuse it in workouts.
- Backend: [427](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/427) storage and security rules; [428](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/428) the server endpoints (stacked on 427).
- Mobile: [264](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/264) the data layer; [265](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/265) the screen where coaches create the exercise. Both are stacked on 262.
- Mobile [262](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/262): a June rebuild of "undo" in the workout builder.

**The goal:** coaches outside standard gym training can build their own programs.

**Why not v1:**
- It isn't on the day-1 list.
- The code is four months behind main and was built on June's version of the app.
- It adds user-uploaded video, which brings storage costs and the need to review uploads.
- Undo (262) is already done another way: the workout builder on main has undo.

A good candidate for after launch, rebuilt fresh on current main.

---

## 5. The other two

| PR | What it is | Why it's waiting |
|---|---|---|
| backend [491](https://github.com/BradleyGleavePortfolio/growth-project-backend/pull/491) (June) | Adds your "data capture" plan to the backlog: recording app events from day one for later benchmarking and franchise reports | Paperwork, with no code. It could be merged any time as a note, but it doesn't change the product. |
| mobile [283](https://github.com/BradleyGleavePortfolio/growth-project-mobile/pull/283) (July) | Fix: an invite code opened from a link while signed in never reached the Home screen banner | Already done another way: main stores the code under one key now. Can be closed. |

---

## Suggested cleanup after launch

1. **Close the ones done another way:**
   - Roman 598, 601, 602, 603.
   - 522, 584, mobile 262 and mobile 283.
   - Keep 605's grading suite as an idea to redo.
2. **Keep, but leave parked:** the importer branch and custom exercises, until you decide when those features come.
3. **Package updates:** a few at a time after launch, NestJS 12 as its own project.
4. **Agent 124:** check the 593 assignment rule on main and port it if it is reachable.

One unrelated thing found while checking: the coach daily brief still names a retired AI model, so it always falls back to its plain written summary instead of the AI version. It doesn't crash. It's a small follow-up for after launch.
