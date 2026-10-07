# _COMMON_128 — common brief for every agent 128 worker (read fully, then ONLY your entry in /home/user/workspace/ops/lanes128/JOBS128.md)

Operator: agent 128, 2026-10-07 from 12:50 PDT. Agent 127 and all earlier operators are retired; their workers are stopped. You are one of up
to 25 concurrent workers sharing ONE sandbox (2 CPU, 7.9 GB) and ONE GitHub Actions runner pool. Be frugal with both.
Owner 13:02 10-07 (verbatim): "scale to 25 agents - I want all the PR's agent 127 left half done finished, and then all 30 screens on the next
to-do done and made LUXURIOUS, SIMPLE, MENTALLY DELOADING, AND CALM! execute".
Standing owner priorities: ordinary food/workout logging first ("TOP PRIOTY for the food and workout logging to be kick ass, and for the flow
of money to be BULLETPROOF"); the luxurious screen redo with honest copy; Roman's intelligence (memory ON by default); the AI workout builder.

Rules: /home/user/workspace/tgp-agent-context/TGP_SOURCE_OF_TRUTH.md (main). Read ONLY A1, the two OWNER OVERRIDES at the top of A2
(EDGE-CASE FREEZE items 1-6, RUTHLESS SCOPE items 7-11) and A6 (A6.10 = all owner decisions of 10-07), unless your entry names more.
GitHub wins over every SHA in this file.

## The product and the state (verified 13:05 PDT 10-07)
- TGP: a 1:1 personal-training platform. Coaches sell packages (recurring packages are the most critical item), schedule sessions, message
  clients, build programs and meal plans, get paid through Stripe Connect. Clients train, log food and workouts, log health data (Apple
  Health, Health Connect), chat with Roman (the AI coach persona), join the community and pay. Backend: NestJS + Prisma + Postgres (Supabase)
  on Fly. Mobile: React Native / Expo, iOS and Android; store builds use eas.json profile "clinic".
- Production = backend deploy 23 f73c6521 (11:22). Backend main 0d179edb (adds b#833 #834 #838 #835 #831 #840 #841 #839 #837 #842; deploy 24
  follows main CI). Mobile main d0875d26 (redo merged today: m#465 #466 #467 #468 #471 #472 #475 #476 #477 #478 #480; also #454 #455 #456).
- Production flags = backend .github/fly-env-desired-state.json on main ("unset" = name absent, code default applies). AI workout builder ON
  since 10:44 (FEATURE_MWB_AI_LIVE_CREATE, AI_GATEWAY_*). FEATURE_ROMAN_MEMORY, FEATURE_ROMAN_TOOLS, FEATURE_ROMAN_PLAYBOOK are unset (off).
- Production data: very few users; 0 real payments; synthetic store-review accounts exist (a review coach and a review client). Never print
  their emails or any secret anywhere. Owner = Bradley Gleave (featured coach). Never name the clinic partner anywhere: all repos are PUBLIC.
  Spend no money.

## What counts (binding: SoT A2 overrides 1-11)
- B (fix before launch): a normal user, on a normal day, hits: money wrong/lost/given away; private, health or payment data shown to the
  wrong person; safety/crisis routing miss; data loss; a reachable security hole; App Store / Play / legal failure; a false customer-facing
  claim; a core flow (sign up, sign in, pay, book, message, train, log food, coach payouts, coach sees client logs) that breaks or dead-ends.
  Every B has ONE plain sentence: how an ordinary user hits it and what goes wrong.
- U (fix if small and safe): happy-path defects below Apple level: dead/mislabelled button, missing loading/empty/error state, generic error,
  wrong number, endless spinner, copy that contradicts the app, broken navigation. Product copy: no first person (Roman's own "I" in his
  chat voice is the one exception), no emojis, no exclamation marks, no generic errors.
- C: everything else. Edge cases (time zones, DST, races, retries, out-of-order webhooks, crash-mid-write, extreme volume, odd inputs, old
  builds, extra defence on guarded paths) get ZERO time. If noticed: one line "C (edge, deferred to 10k clients)".

## How you work
1. gh and git need bash with api_credentials=["github"]. Always pass --repo / -R BradleyGleavePortfolio/<repo>. Prefer REST
   (`gh api repos/BradleyGleavePortfolio/...`). For CI: `gh pr view N -R ... --json statusCheckRollup` or
   `gh api repos/<o>/<r>/actions/runs/<id>/jobs`. Poll CI no faster than every 120 s (sleep 120 between polls). On 401 "Bad credentials"
   do not loop: keep work committed locally, write it in your report, tell the operator.
2. Read current code in the READ-ONLY worktrees /home/user/workspace/wt/RO-backend (main 0d179edb) and /home/user/workspace/wt/RO-mobile
   (main d0875d26). Never edit, check out, build or run anything in them, in /home/user/workspace/deps/*, or in
   /home/user/workspace/growth-project-* (except `git -C ... fetch` and `git -C ... worktree add`). For a newer main use
   `git -C /home/user/workspace/growth-project-<repo> fetch -q origin main` and `git -C ... show origin/main:<path>`.
3. Your own worktree, ABSOLUTE path:
   - New PR: `git -C /home/user/workspace/growth-project-<repo> fetch -q origin && git -C /home/user/workspace/growth-project-<repo> worktree add -b agent128/<job-lower> /home/user/workspace/wt/<JOB>-<repo> origin/main`
   - Finishing an existing PR: `git -C /home/user/workspace/growth-project-<repo> fetch -q origin <headRefName> && git -C /home/user/workspace/growth-project-<repo> worktree add -b <headRefName> /home/user/workspace/wt/<JOB>-<repo> origin/<headRefName>`
     then push to that same branch. Never force-push. To bring in main: `git merge origin/main` (no rebase).
   Commit identity on EVERY commit: `git -c user.name="Bradley Gleave" -c user.email="bradley@bradleytgpcoaching.com" commit ...`, no AI
   co-author trailer. Verify with `git log -1 --format='%an <%ae> / %cn <%ce>'`.
4. Shared deps: /home/user/workspace/deps/{backend,mobile}/node_modules; a READY file appears in /home/user/workspace/deps/<repo>/ when the
   install finishes (until then read code and rely on PR CI). Link with `/home/user/workspace/ops/link_deps.sh <backend|mobile> <worktree>`;
   backend then `/home/user/workspace/ops/heavy.sh npx prisma generate` inside your worktree. Local runs ONLY through
   /home/user/workspace/ops/heavy.sh (one global lock), ONE targeted jest file at a time, e.g.
   `cd <worktree> && /home/user/workspace/ops/heavy.sh npx jest src/screens/client/__tests__/X.test.tsx`. NEVER a full suite, NEVER
   full-project tsc or eslint locally (CI does those).
5. CI ECONOMY (25 agents share the runners): push only when your change is complete and its targeted tests pass locally; batch every fix
   into one push; never push WIP just to "see CI"; never re-run green jobs. A failing-first proof may be ONE tests-only push (or a local
   run on main recorded in your report). Backend: if a job sits on "Install postgresql-client" for more than 10 minutes, it is hung: you may
   `gh run cancel <run> -R ...`, wait until it is completed, then `gh run rerun <run> --failed -R ...` (your own PR's run only).
6. PRs: based on main, each UNDER 800 changed lines (hard fail above 1,500: additions + deletions, tests count; lockfiles/generated/snapshots
   excluded). Check size before every push. Conventional Commits title. No new `as any` / `as unknown as` / `as never`, no empty
   `.catch(() => undefined)`. Failing-first tests where behaviour changes. No lockfile edits, no new dependencies. Migrations only if truly
   required: additive, newer than every existing one. Mobile changes must work against the CURRENT production backend.
   PR body starts with the tier header (SoT A3 section 8.1): Tier, Why, T4 trigger scan, T3 trigger scan, Bounded T1, Canonical builder,
   Parent owner, Acceptance evidence, Promotion triggers. Then "What changes for coaches/clients" in plain words, then the B/U list.
   Mobile UI PRs also carry the parity table and the truthful sweep (see the redo rules below) and update the matching README
   (mobile docs/QUIET_LUXURY_DOCTRINE.md section 8).
7. When CI is green at your head, post ONE comment whose first line is exactly
   `FIX ROUND 1 (OPENING) (<JOB>, agent 128) — growth-project-<repo>#<n> @ <full head sha> — READY FOR AUDIT`
   (finishing an agent 127 PR: `FIX ROUND <k> (<JOB>, agent 128) — growth-project-<repo>#<n> @ <full head sha> — READY FOR AUDIT`, k =
   previous round + 1). Then STAY: poll the PR every 5 minutes (sleep 300) for up to 75 minutes for the two lens verdicts at that exact head
   ("AUDIT Claude Opus 5.5 (...)" and "AUDIT GPT-6.1 Sol (...)"). On a REQUEST CHANGES at your head: fix only its Bs (and a U if one line),
   push once, CI green, post `FIX ROUND <k+1> (<JOB>, agent 128) — ... @ <new sha> — READY FOR AUDIT` naming the findings fixed, and keep
   waiting. Done = both lenses APPROVE at your current head (the operator merges), or 75 minutes with no verdict (say so in your report).
8. Promotion (SoT A3 section 9): a GPT worker that finds a needed T4 change (auth, RLS/tenancy, PII, money, credentials, destructive data)
   does NOT build it: write it with file:line + smallest fix for the operator to route to Claude Opus 5.5.
9. Never: merge; deploy; run fly-deploy.yml, fly-secrets-set.yml or fly-env-sync; change branch protection, settings, environments or
   production flags; write to production, Fly, Supabase, Stripe, Expo or EAS; start a store build; spend money; close PRs; push to a branch
   you were not assigned; comment on PRs you were not assigned (lenses post verdicts and claims only); use a time you did not get from
   `TZ=America/Los_Angeles date`.
10. Report: /home/user/workspace/ops/reports/<JOB>.md, kept current. Sections: Scope traced, B list, U list, C one-liners, PRs (number,
    head, lines, CI, verdicts), "Not fixed (needs operator)" with file:line + smallest fix, and a final "## HANDOFF" so a fresh agent can
    continue. When done write one line to /home/user/workspace/ops/lanes128/notify/<JOB>.txt:
    `done | PRs: <list or none> | B=<n> U=<n> | verdicts: <opus>/<sol> @ <sha8> | needs operator: <n>`.
11. Final answer to the operator, under 200 words: PR(s) + exact heads + line counts + CI state + verdicts, top findings one line each, and
    anything that needs an operator or owner decision (each with a recommended default).

## Mobile screen redo rules (owner 10:35 + 13:02 10-07; binding on every DES job and every mobile PR)
Owner 10:35 (verbatim): "HONEST COPY, NO DEAD BUTTONS, LUXURIOUS SIMPLE FEELING, ALL IMPORTANT INFO PRESENT, MENTALLY DELOADING, WIHTOUT
CUTTING MOBILE PATHWAYS OR LOOSING FUNCTIONALITY!" Owner 13:02: "LUXURIOUS, SIMPLE, MENTALLY DELOADING, AND CALM!"
1. Honest copy: every line states something true from the user's real data at that moment, or is neutral/instructional. Nothing invented
   (counts, streaks, goals, schedules, praise, promises, a coach/plan/history/permission/feature the user may not have). State-driven variants,
   each tested. Nothing true to say = show nothing. Never claim exclusivity of access ("only you") — the platform owner account can read
   client logs; describe the client-coach sharing state instead.
2. No dead buttons: every tappable element does something real; anything that cannot work is wired or removed (removal cites rule 1 or 2).
3. Luxurious, simple, calm: "A23 layout + comfort rules" inside the existing brand (DESIGN-AUD-127 section (e) picks table):
   bone page #F5EFE4 with no cream card fills; hairline separators instead of boxes and shadows; one headline, one hero (number or sentence),
   ONE forest primary action per screen; small-caps letter-spaced overlines in muted grey; Cormorant Garamond (weight <= 500) only for titles,
   hero numbers and one-line summaries; Inter for everything read or tapped; text >= 13 pt (11 pt only for overlines and tab labels);
   tabular numerals for numbers that change; sentence case; outline icons; tap targets >= 44 pt; generous negative space; monochrome data
   (no category-coded chips, no red for "over" — say it in words); motion <= 300 ms for anything the user waits on, 400 ms only for passive
   fades; no particles, confetti, springs, trophies, gradients, glows, FABs or global banners (mobile docs/QUIET_LUXURY_DOCTRINE.md); no
   photos or illustrations; card/sheet radius 4. Reuse src/ui primitives (QuietBar src/ui/progress/QuietBar.tsx, FadeInView, HapticPressable,
   SkeletonScreen, CoachErrorState) before adding new ones.
4. All important info present: nothing a client or coach needs is removed or pushed behind extra taps.
5. Mentally deloading: one primary action per screen, calm hierarchy, fewer competing elements, secondary detail by progressive disclosure.
6. No pathway or function cut: list every route/button/action on the screens you touch before and after in the PR body (table
   "Routes/actions before -> after": label, destination or effect) and prove parity in a test (navigation targets and handlers reachable).
   Where rules 4/6 clash with rule 5, rules 4 and 6 win.
7. Dark-mode readiness: colours only from the theme (useTheme / semantic tokens), never the legacy fixed palette or new hex literals. Dark
   stays hidden for launch.
8. Owner decisions 11:26: six client tabs with labels stay (no tab or navigator change); forest green for every primary button (merged
   m#475); any Health goal shown uses the Starter goal constants (5,000 steps, 20 exercise minutes, 250 move kcal) labelled "Starter goal"
   when nobody set a target.
Design sources (read the parts your entry names): /home/user/workspace/tgp-agent-context/handoffs/op-127/ops/DESIGN-AUD-127.md (sections (c),
(d)A, (d)0, (d)1, (e)); /home/user/workspace/tgp-agent-context/design-targets/mobile/CATALOG.md and the folder images named in your entry
(view them with the read tool; they are the bar, not the blueprint; names and figures in them are fictional); the guide
/home/user/workspace/tgp-agent-context/quality-references/MOBILE_APP_DESIGN_INTELLIGENCE.md (sections 4.2-4.8, 5.1 step 6, 5.5, Part VII
Layer 2); mobile docs/QUIET_LUXURY_DOCTRINE.md and src/__tests__/quietLuxuryDoctrine.test.ts, truthfulCopy guard tests.

## Translating agent 127 entries (DES-JOBS-PASTE.md / JOBS127.md) for agent 128
Entries written for agent 127 apply as written, except: "ops/reports/DESIGN-AUD-127.md" = the tgp-agent-context path above;
"_COMMON_127" = this file; your branch is agent128/<job-lower>; you sign "agent 128"; reports go to /home/user/workspace/ops/reports/;
file:line references were checked on an older mobile main (8591058 / f71b425e) — re-check them on current main before editing.
