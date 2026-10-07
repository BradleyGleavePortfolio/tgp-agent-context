# _COMMON_127 — common brief for every agent 127 worker (read fully, then ONLY your entry in /home/user/workspace/ops/lanes127/JOBS127.md)

Operator: agent 127, 2026-10-07 from 09:24 PDT. Agents 126 and earlier are retired; no other operator or worker is running.
Owner 09:24 10-07 (verbatim): "lets start finishing all v1 blockers and romans increased intelligence asap. I also want the master workout
builder made and the AI workout building assistance feature done. Then i need a fresh APK build to test, tester accounts prepped, and
images of the app for apple store submission!" and "coach sharing - try to just sneak it in somehwere they already click accept".
Standing owner priorities: ordinary food/workout logging and the flow of money first ("TOP PRIOTY for the food and workout logging to be
kick ass, and for the flow of money to be BULLETPROOF"). AI workout builder: "world class ... Push it live and ON!"

Rules: TGP_SOURCE_OF_TRUTH.md on tgp-agent-context main (clone /home/user/workspace/tgp-agent-context). Read ONLY A1, the two OWNER
OVERRIDES at the top of A2 (EDGE-CASE FREEZE items 1-6, RUTHLESS SCOPE items 7-11) and A6, unless your entry names more. GitHub wins over
every SHA in this file.

## The product and the state (verified 09:20 PDT 10-07)
- TGP: a 1:1 personal-training platform. Coaches sell packages (recurring packages are the most critical item), schedule sessions,
  message clients, build programs and meal plans, get paid through Stripe Connect. Clients train, log food and workouts, log health data
  (Apple Health, Health Connect), chat with Roman (the AI coach persona), join the community and pay. Backend: NestJS + Prisma + Postgres
  (Supabase) on Fly. Mobile: React Native / Expo, iOS and Android; store builds use eas.json profile "clinic".
- Production = backend main bdc9d9116ee7 (deploy 20, run 37588630735, 00:43 10-07). Mobile main 5e3e9398 (m#453 merged 07:59).
- Merged overnight: b#809 AI workout generator, b#813 per-client context v2 + injury substitutions, b#815 subset Apply, m#452 assigned
  workout Start fix + contact card + notification settings + support copy, m#453 dead Mute switch removed + SELECTION_OVER_LIMITS copy.
- Open: b#823 revision 0 for new standalone workouts (Opus APPROVE @ ec96487a, needs Sol). b#820 + m#451 coach sharing (HELD; agent
  127 replaces them with the owner's 09:24 design, job B-SHARE-127).
- Production flags = backend .github/fly-env-desired-state.json on main ("unset" = name absent, code default applies). ON: community
  core (API/POSTS/MESSAGES/PUSH/REALTIME), MESSAGING_CORE_V2, COACHLESS_HOME, COACH_CODE_TOOLS, COACH_BROADCASTS, ROMAN_CHAT, ROMAN_ADJUST,
  AI consent ledger, DUNNING_V2, WEARABLES_INGEST_POST, MWB_TEMPLATES, MWB_AUTOSAVE_UNDO, NAMED_REGIMES, BOOKING_REMINDERS. OFF (unset):
  FEATURE_MWB_AI_LIVE_CREATE, AI_GATEWAY_*, FEATURE_ROMAN_MEMORY, FEATURE_ROMAN_PLAYBOOK, BILLING_ENFORCEMENT (owner removed coach
  subscription tiers 10-06 19:23), WORKOUT_REMINDERS_ENABLED, DMs, voice notes, Google Calendar/Meet, importer.
- Production data: very few users (auth.users 5); 0 workout plans; payment/ledger tables empty. Synthetic store-review accounts exist
  (a review coach and a review client). Never print their emails or any secret in a public place.
- Owner = Bradley Gleave (featured coach, code GP-BRADLEY). Never name the clinic partner anywhere (all repos are PUBLIC). Spend no money.

## What counts (binding: SoT A2 overrides 1-11)
- B (fix before launch): a normal user, on a normal day, hits: money wrong/lost/given away; private, health or payment data shown to the
  wrong person; safety/crisis routing miss; data loss; a reachable security hole; App Store / Play / legal failure; a false customer-facing
  claim; a core flow (sign up, sign in, pay, book, message, train, log food, coach payouts, coach sees client logs) that breaks or dead-ends.
  Every B has ONE plain sentence: how an ordinary user hits it and what goes wrong.
- U (fix if small and safe): happy-path defects that feel less than Apple-level: dead/mislabelled button, missing loading/empty/error
  state, generic error, wrong number, endless spinner, copy that contradicts the app, broken navigation. Product copy: no first person,
  no emojis, no exclamation marks, no generic errors.
- C: everything else. Edge cases (time zones, DST, races, retries, out-of-order webhooks, crash-mid-write, extreme volume, odd inputs, old
  builds, extra defence on guarded paths) get ZERO time. If noticed: one line "C (edge, deferred to 10k clients)".

## How you work
1. gh and git need bash with api_credentials=["github"]. Prefer REST (`gh api repos/BradleyGleavePortfolio/...`). For CI use
   `gh pr view N --repo ... --json statusCheckRollup` or `gh api repos/<o>/<r>/actions/runs/<id>/jobs`. Poll CI no faster than every 60 s.
   On 401 "Bad credentials" do not loop: keep work committed locally, write it in your report, tell the operator.
2. Read code in the READ-ONLY worktrees /home/user/workspace/wt/RO-backend (backend main bdc9d911) and /home/user/workspace/wt/RO-mobile
   (mobile main 5e3e9398). Never edit, check out or build in them, or in /home/user/workspace/growth-project-*.
3. To build: your own worktree with an ABSOLUTE path from origin/main:
   `git -C /home/user/workspace/growth-project-<repo> fetch -q origin main && git -C /home/user/workspace/growth-project-<repo> worktree add -b agent127/<job-lower> /home/user/workspace/wt/<JOB>-<repo> origin/main`
   Commit identity on EVERY commit: `git -c user.name="Bradley Gleave" -c user.email="bradley@bradleytgpcoaching.com" commit ...`, no AI
   co-author trailer. Verify with `git log -1 --format='%an <%ae> / %cn <%ce>'`.
4. Sandbox: 2 CPU / 7.9 GB shared by ~10 agents. Shared deps: /home/user/workspace/deps/{backend,mobile} (a READY file appears when the
   install finishes; until then read code and rely on PR CI). Link with `/home/user/workspace/ops/link_deps.sh <backend|mobile> <worktree>`;
   backend then `/home/user/workspace/ops/heavy.sh npx prisma generate` inside the worktree. Local runs ONLY through
   /home/user/workspace/ops/heavy.sh, ONE targeted jest file at a time. NEVER a full suite, NEVER full-project tsc or eslint locally.
5. PRs: based on main, each UNDER 800 changed lines (hard fail above 1,500: additions + deletions, tests count; lockfiles/generated/
   snapshots excluded). Check size before every push. Conventional Commits title. No new `as any` / `as unknown as` / `as never`, no
   empty `.catch(() => undefined)`. Tests that fail on main where behaviour changes (failing-first). No lockfile edits, no new
   dependencies. Migrations only if truly required: additive, timestamp newer than every existing one in prisma/migrations.
   Mobile changes must work against the CURRENT production backend (capability check or graceful fallback).
   PR body starts with the tier header (SoT A3 section 8.1): Tier, Why, T4 trigger scan, T3 trigger scan, Bounded T1, Canonical builder,
   Parent owner, Acceptance evidence, Promotion triggers. Then a "What changes for coaches/clients" section in plain words, then the
   B/U list with one-sentence user stories.
   Push, wait for PR CI green, then post ONE comment whose first line is exactly:
   `FIX ROUND 1 (OPENING) (<JOB>, agent 127) — growth-project-<repo>#<n> @ <full head sha> — READY FOR AUDIT`
   After a lens REQUEST CHANGES: fix only the Bs, push, CI green, comment `FIX ROUND <k> (<JOB>, agent 127) — ... @ <sha> — READY FOR AUDIT`.
6. Promotion (SoT A3 section 9): a GPT-6.1 Sol worker that finds a needed T4 change (auth, RLS/tenancy, PII, money, credentials,
   destructive data) does NOT build it: write it with file:line + smallest fix for the operator to route to Claude Opus 5.5.
7. Lens verdicts (lens jobs only): one comment per PR per exact head, first line exactly
   `AUDIT Claude Opus 5.5 (<JOB>) — growth-project-<repo>#<n> @ <full head sha> — VERDICT: APPROVE` (or REQUEST CHANGES), or
   `AUDIT GPT-6.1 Sol (<JOB>) — ...`. Bs first (each with the one-sentence user story, file:line, smallest fix), Cs as a one-line list.
   Never read the other lens's verdict for that head before posting yours. If the head moves while you work, stop and re-read.
   Time boxes: delta re-review 20 min, full PR 30 min. A size over 1,500 lines = REQUEST CHANGES "SIZE FAIL (over 1,500 lines)".
8. Never: merge; deploy; run fly-deploy.yml, fly-secrets-set.yml or fly-env-sync; change branch protection, settings, environments or
   production flags; write to production, Fly, Supabase, Stripe, Expo or EAS (read-only SELECTs only where your entry allows); start a
   store build; spend money; close PRs; push to or comment on PRs you did not open (lenses comment verdicts only); use a time you did not
   get from `TZ=America/Los_Angeles date`.
9. Report: /home/user/workspace/ops/reports/<JOB>.md, kept current. Sections: Scope traced, B list, U list, C one-liners, PRs opened
   (number, head, lines, CI), "Not fixed (needs operator)" with file:line + smallest fix, and a final "## HANDOFF" so a fresh agent can
   continue. When done write one line to /home/user/workspace/ops/lanes127/notify/<JOB>.txt:
   `done | PRs: <list or none> | B=<n> U=<n> | needs operator: <n>`.
10. Final answer to the operator, under 200 words: PR(s) + exact heads + line counts + CI state, top findings one line each, anything that
    needs an operator or owner decision (each with a recommended default).

## Mobile screen redo rules (owner 10:35 10-07, verbatim; binding on every DES job and every mobile PR from now on)
"HONEST COPY, NO DEAD BUTTONS, LUXURIOUS SIMPLE FEELING, ALL IMPORTANT INFO PRESENT, MENTALLY DELOADING, WIHTOUT CUTTING MOBILE PATHWAYS
OR LOOSING FUNCTIONALITY!"
1. Honest copy: every line states something true from the user's real data at that moment, or is neutral/instructional. Nothing invented.
2. No dead buttons: every tappable element does something real; anything that cannot work is wired or removed.
3. Luxurious, simple feeling: follow tgp-agent-context design-targets/mobile/CATALOG.md + images and the mobile design guide
   (quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md) as interpreted in ops/reports/DESIGN-AUD-127.md section (d).
4. All important info present: nothing a client or coach needs is removed or pushed behind extra taps.
5. Mentally deloading: one primary action per screen, calm hierarchy, fewer competing elements, secondary detail by progressive disclosure.
6. No pathway or function cut: list every route/button/action on the screens you touch before and after in the PR body, and prove parity
   in tests (navigation targets and handlers still reachable).
