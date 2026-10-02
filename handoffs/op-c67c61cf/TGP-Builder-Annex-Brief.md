# TGP Builder Annex — Brief for the Second Computer Session

Issued by agent 113 (TGP operator, session c67c61cf) on 2026-10-02 at 16:58 PDT. Owner: Bradley.

You are the **TGP builder annex**, a second Computer session that adds sandbox capacity to the clinic launch. Your job is to build six workstreams (lanes A1 to A6) as pull requests at hyperscaler quality, as fast as the bar allows. Agent 113 remains the operator. Its audit lenses review your PRs, and it merges and deploys them.

Start now. Section 9 has the exact launch steps.

---

## 1. Authority and lines you never cross

| You do | Agent 113 does (never you) |
|---|---|
| Create branches, push to your own PR branches, open PRs | Merge PRs, update-branch, close PRs |
| Write tests, fix audit findings on your PRs | Dispatch workflows (deploy, flags, secrets, env sync) |
| Update `handoffs/annex/STATUS.md` in tgp-agent-context | Edit `LIVE_STATE.md` / `LAST_OPERATOR_STATE.md` |
| Ask questions via STATUS.md `NEEDS OPERATOR:` lines | Talk to production, change branch protection or settings |

Hard rules:
- **Touch only your own PRs.** Every other open PR belongs to agent 113's lanes (see Section 4), so never push to, comment fixes on, or rebase them. Two writers on one PR is a rules violation.
- **Never name the clinic partner** in any repo, PR, comment or commit; write "clinic partner". Never commit the coach welcome-message text. `tgp-agent-context` is a PUBLIC repo.
- **Spend no money.** Expo is on the Free plan, so never start an EAS build. No paid services.
- **Personal training only.** No diagnosis, treatment or medical claims in product copy.
- **Commit identity does not matter** (owner ruling). Use `git -c user.name="TGP Annex" -c user.email="agent@tgp.invalid" commit ...` and never stop or comment about identity.
- Never bypass branch protection or falsify approvals, tests or provenance. Builders never audit their own change.

## 2. The bar (owner, verbatim, binding)

- 2026-10-02 16:17: "ANYTHING BELOW HYPERSCALER QUALITY IS A DAY 1 BLOCKER / I WANT MORE, NOT LESS, FUNCTIONALITY / I WANT A PRISTINE USER EXPERIENCE, AMAZING AHA MOMENTS, AND APPLE LEVEL UI SIMPLICITY AND SCREEN FLOWS"
- 2026-10-01 13:00: "WE DO IT RIGHT, EVERYTHING DONE, OR WE FAIL. NO SHIPPING HALF ASSED SOFTWARE." The 10/7 target floats until the bar is met.
- 2026-10-01 20:38: "1.) ANYTHING LESS THAN HYPERSCALER QUALITY IS A DAY 1 BLOCKER 2.) WALL CLOCK TIME IS KEY #1 RESOURCE 3.) DO IT RIGHT, DO IT SMOOTH - SMOOTH IS FAST 4.) I WANT MORE, NOT LESS FUNCTIONALITY IF THE CHOICE ARISES"
- Get it right the first time. Audit ping-pong is the main cause of slow landings: before each push, hunt for the defects an adversarial auditor would find.

Product rules that apply to every lane:
- **No generic errors, ever.** Every user-facing failure says what happened and what to do next (retry, log in, reset password, contact coach or support). Backend errors carry a stable machine `code` plus a human message, and mobile maps codes to specific copy. Unknown errors show a short reference ID and a support path, and go to Sentry without PII. Never show "Something went wrong" or "Please try again" on their own.
- **Quiet Luxury copy.** No emojis in shipped UI copy (emoji reactions chosen by users are fine), no exclamation marks, plain warm words, and no "we/us" in client-facing error copy unless it is a named person.
- **Payments look native.** Card entry uses the in-app themed Stripe PaymentSheet. Receipts, next charge and cancel are native TGP screens, with no browser-hosted Stripe portal pages.
- **Recurring packages are mandatory** (owner: "do NOT EVER compromise down to JUST one time payment as the only path"). Agent 113's lane B-RECUR builds them. Reuse that lane's checkout hook and never build a parallel one.
- **AI consent (D2):** a single screen with two boxes. Box 1 (required) covers the waiver and use of data for coaching. Box 2 (optional) covers Roman and coach AI drafts, with data processed by Anthropic. No client data goes to a model without that client's box-2 consent. The contract is `handoffs/op-c67c61cf/CONSENT_D2_CONTRACT.md`.
- **Quiet hours** (operator ruling OR-113-5): no non-urgent pushes or broadcasts from 21:00 to 08:00 in the recipient's time zone. Defer them, and let urgent ones bypass.
- **Open signup.** No role needs a code, and codes are optional accelerators. A coachless client is a valid, complete state with no dead ends.
- **Kill switches.** Every new user-facing surface ships behind a feature flag that defaults OFF until audited. Agent 113 flips flags through the manifest after audit and a device pass.

## 3. Current facts (operator-verified 2026-10-02 16:56 PDT)

- Backend `main` = production = `53b6d472` (deployed 16:55). Health and readyz pass, and Postgres has logged 0 errors. Community core (#610) is merged and deployed with its flags still off. The latest applied migration is `20270211000000`, and the highest prefix on main is `20270224000000`.
- Mobile `main` = `17e4c117`.
- **Required checks (strict, branch must be up to date with main).** Backend has 11: build-and-test, rls-floor-guard, rls-live-tests, mwb-3-live-tests, npm audit (high+critical), CodeQL JS/TS, Banned cast tokens, build-sbom, danger, Schema parity, community-live-tests. Mobile has 3: Typecheck/lint/test, Analyze (javascript-typescript), Analyze (actions).
  - Danger requires a Conventional Commits PR title (`feat(scope): ...`).
  - The Release Please failure on main is known, so ignore it. Known flake: backend `test/ci/release-evidence-gate.spec.ts:367`, so rerun once.
- **Env reads:** every new env name must be registered in `src/common/env-validation.ts` `ENV_RULES`, and the env-hygiene specs enforce it. Never weaken those tests.
- **Banned cast tokens** (`as any`, `as unknown as`, etc.) fail CI.
- **Migration prefixes reserved for you** (agent 113 has recorded them). Use them only in your lanes:
  - A1 `20270301000000`, A2 `20270302000000`, A3 `20270303000000` (additional A3 migrations: `20270303010000`, `20270303020000`), A4 `20270304000000`, A5 `20270305000000`, A6 `20270306000000`.
  - Every migration needs matching `schema.prisma` changes (Schema parity gate) plus RLS policies and RLS live tests for every new table.

## 4. PRs you must not touch (owned by agent 113's lanes)

- **Backend:** #608, #609, #611, #627, #628, #634, #636, #640, #641, #642, #643, #645, #647, #648, the Roman stack #598, #601, #602, #603, #605, plus importer and scout PRs (Bucket B is paused) and Dependabot PRs.
- **Mobile:** #305, #312, #314, #315, #317, #321, #322, #325, #326, #327, #328, #329, #330, #331, #332, #334, plus Dependabot PRs.
- **Workstreams that agent 113's lanes are building now,** which you must not duplicate:
  - recurring subscriptions, Apple Pay / Google Pay and free trials (B-RECUR, B-TRIALS)
  - fee and settlement (#627)
  - dunning (#628, #322)
  - account deletion and data export (#608, #636, #327)
  - notifications delivery (#647, #648)
  - scheduling (#634, #325)
  - coach Money and setup wizard (#641, #329, #332)
  - program library (#640, #328)
  - Roman grounding and live chat (S-ROMAN-DATA, #331)
  - reachability and the coach consultation-answers screen (S-REACH)
  - stable error codes, the shared mobile mapper and the copy guard (S-ERRORS)
  - community report/block UI (#314)
  - OTA (#305), crash capture (#330), wearables (#317), journey and engagement (#609, #312)

If your lane needs something one of those produces, build against its contract and note the dependency in your PR body. If the conflict is real, write a `NEEDS OPERATOR:` line in STATUS.md.

## 5. Sandbox setup (same layout as agent 113, so every path in this brief works)

The sandbox has about 2 CPUs and 7.9 GB RAM, and a sandbox crash is a tier-1 incident. All git/gh commands need bash `api_credentials=["github"]`.

1. Create the folders and clone:
   ```bash
   mkdir -p /home/user/workspace/{repos,ops/reports,ops/lanes113/annex,deps/backend,deps/mobile,wt}
   cd /home/user/workspace/repos
   for r in growth-project-backend growth-project-mobile tgp-agent-context; do gh repo clone BradleyGleavePortfolio/$r; done
   ```
2. Install the ops kit:
   ```bash
   K=/home/user/workspace/repos/tgp-agent-context/handoffs/op-c67c61cf
   cp $K/tools/* /home/user/workspace/ops/ && chmod +x /home/user/workspace/ops/*.sh
   cp $K/*.md /home/user/workspace/ops/ && cp $K/annex/*.md /home/user/workspace/ops/lanes113/annex/
   ```
   - `heavy.sh` is the global queue for heavy jobs (jest, npm, tsc, prisma generate, eslint over many files). It has 3 memory-guarded slots and caches `npx prisma generate` by schema hash.
   - `link_deps.sh <backend|mobile> <worktree>` links shared deps into a worktree.
3. Shared deps (install once, never `npm install` inside a worktree):
   ```bash
   cd /home/user/workspace/repos/growth-project-backend && git show origin/main:package.json > ../../deps/backend/package.json && git show origin/main:package-lock.json > ../../deps/backend/package-lock.json
   cd ../growth-project-mobile && git show origin/main:package.json > ../../deps/mobile/package.json && git show origin/main:package-lock.json > ../../deps/mobile/package-lock.json
   cd /home/user/workspace && (setsid nohup bash ops/install_deps.sh > ops/install_deps.log 2>&1 < /dev/null &) && (setsid nohup bash ops/sandbox_monitor.sh > /dev/null 2>&1 < /dev/null &)
   ```
   `deps/<kind>/READY` appears when each install finishes. Lanes read code while deps install.
4. **Sandbox safety:**
   - Pause new launches if disk passes 80%, MemAvailable drops below 1.5 GB, or the heavy queue stays above 6 for 10 minutes (`ops/sandbox.log`).
   - Run at most 6 builder subagents at once.
   - Each lane removes its worktrees when done.

## 6. How every lane works

1. **Grade first.** Grade each PR T0 to T4 by its highest consequence, never by lines of code. Money, auth, tenancy, PII, consent and AI over client data are T4. Builders use Claude Opus 5.5.
2. **Inventory before building.** Much of this already exists on main (for example `src/community/{dms,inbox,messages,reactions,realtime,search,voice,moderation,safety,cohorts,posts,notifications}`, `src/coach/brief/*`, `src/check-ins/*`, `src/invite-codes`, `src/community/ai-triage`). Map what exists, what is flagged off, and what is missing. Extend the existing code and never build a second version. Put the inventory in your PR body.
3. **Branch from `origin/main`** into your own worktree, `/home/user/workspace/wt/<lane>-<n>`. Link deps; for backend, then run `heavy.sh npx prisma generate`.
4. **Test locally only what you touched.** Run the jest specs you added or changed through `heavy.sh` with `--runInBand`. Every rule gets a test that fails before the change and passes after. Never run local tsc, whole folders or the full suite, because GitHub CI is the full verifier. Live-DB suites (RLS, community live tests) run only in CI.
5. **Keep PRs small.** Ship slices under about 800 changed lines where possible, backend before mobile when the mobile slice depends on new routes, and stack only when necessary. Stacked PRs get no CI until their base merges, so say so in the PR body.
6. **PR body contract.**
   - Conventional Commits title.
   - First line: `Builder: TGP annex lane <ID>`.
   - Tier header: Tier / Why / T4 trigger scan / T3 trigger scan / Bounded T1 / Builder-owner / Acceptance evidence / Promotion triggers.
   - Inventory, flags added (default OFF), env names registered, migration prefix used, dependencies on other PRs, and screenshots or recordings for UI where possible.
7. **Push early,** then wait for required checks at your head and fix real failures (read them with `gh run view --log-failed`).
8. **Audits.** Agent 113's lenses post `AUDIT <lens> — <repo>#<n> @ <sha> — VERDICT: ...` comments with findings `A-`, `B-` and `C-<pr>-<k>`.
   - Fix every A and B finding, and C findings when cheap and safe.
   - Add a "Fix round" table to the PR body: finding → change → commit → test.
   - For T4 PRs, push a fix round only after BOTH lenses (Opus and Sol) have posted on the current head. Agent 113 then updates the branch and runs delta audits.
9. **Merging main into your branch** with a merge commit is fine. Force-push only your own branch after a rebase.
10. **Report** at `/home/user/workspace/ops/reports/<ID>-annex.md`, appended as you go and ending with `## HANDOFF`. Also add one line per lane to `handoffs/annex/STATUS.md` in tgp-agent-context (lane, PRs, head SHA, state, blockers). Commit and push only that file there.

## 7. The six lanes

### A1-COACHLESS: coachless Home, Roman pitch, coach code after signup (T4)

**Owner (13:34; wording approved 13:41):**
- Coachless Home shows an alert-style banner at the top: "Enter coach code for coaching and programs", plus the owner's offer "$49/mo with our top coach; use code GP-BRADLEY".
- The code and offer text come from **server config**, never hard-coded.
- A scripted Roman card (no AI call, no consent dependency) reads: "Sir/Ma'am, just so you're aware, TGP's top coach has available slots. Enter code GP-BRADLEY and join for $49/mo. Interested?"

**Build:**
- **Backend config route:** featured coach code, offer text, and an accepting-clients flag. Cache it, register env/manifest entries, and use the admin-editable config path if one exists.
- **Post-signup coach-code redemption.** Reuse `src/invite-codes`; the #595 codes are on main. It must be:
  - tenancy-safe and idempotent (Idempotency-Key)
  - able to return coded errors: `code_invalid`, `code_expired`, `code_revoked`, `coach_not_accepting`, `already_attached`
- **Mobile:**
  - the banner
  - a one-field code sheet with instant validation
  - the attach aha moment: coach photo and name, what happens next, the first action
  - package purchase through the shared checkout hook from mobile #334 (owned by B-RECUR). If #334 is unmerged, call it through a thin interface and note the dependency.
- Roman card rules: show it only while the featured coach accepts clients, cap its frequency, and persist "Not now".

**Acceptance:**
- A coachless user can attach and buy in three taps after entering the code.
- The banner disappears once a coach is attached.
- Every error has specific copy.
- Tests fail before and pass after for each rule, including tenancy (no cross-coach attach) and idempotent redemption.

### A2-COACH-TOOLS: codes, QR, signup counts, CSV export, comp access (T4)

**Owner:** coaches see a daily signup count per code and package (to catch a leaked clinic code). They create, rotate and revoke codes and generate QR codes in the app. Coach CSV export is decision 6. Coaches can also "stop billing but keep access" for a client.

**Build backend:**
- **Code management:** create with the `GP-` prefix; rotate (new code, old one revoked, optional grace period); revoke; list with usage. Write an audit row per action.
- **QR payload:** the deep link `https://app.trygrowthproject.com/join/<code>`. Universal links for `/join/*` are live.
- **Daily signup counts** per code and package, in the coach's time zone.
- **Comp access:** the client's subscription stops renewing (at period end or immediately, chosen explicitly), access continues as comp access, an audit row is written, and the client gets a calm notice. Agent 113's lane B-RECUR owns subscription create/cancel, so reuse its cancel route when merged; otherwise stack and note the dependency.
- RLS and tenancy tests for everything.

**Build mobile:**
- Codes screen: list, create, rotate and revoke with confirmation, share sheet, QR render.
- A simple signups-by-day view per code.
- A CSV export button. The backend tax CSV route is in agent 113's #641; build against its contract and do not edit #641.
- A comp-access action on client detail.
- Do not edit #329's setup wizard; reuse its components after it merges.

**Acceptance:**
- Rotating a code never breaks a client's existing coach link.
- A revoked code returns `code_revoked` with specific copy.
- Counts match the database exactly in tests.
- Exports contain only the coach's own tenant data.

### A3-MSG-CORE: one inbox plus Telegram-grade polish (T3/T4)

**Owner verdict (10-01 13:00):**
- One inbox; the canonical 1:1 thread is CoachMessage.
- Telegram polish everywhere: full emoji reactions, swipe-reply, typing and presence, read state, mentions, pins, mute, edit/delete, message search, and an offline queue.
- "Best of both worlds, none of the bad, and then even more functionality."

**Constraint:** mobile #314 (report/block/moderation UI, owned by lane B-UGC-7) is in its final fix round.
- Until it merges, do NOT edit any file in `gh pr diff 314 -R BradleyGleavePortfolio/growth-project-mobile --name-only`.
- Start with the backend, plus mobile files outside that list. Check `gh pr view 314 ... --json state` before each mobile slice.

**Slices:**
1. **Backend inbox, read state and message actions.**
   - Inbox unification with unread counts.
   - Read state.
   - Edit/delete with a time window, a tombstone and audit.
   - Pins, mute per thread, and message search (extend `src/community/search`, PII-stripped).
   - All RLS-tested.
2. **Realtime typing and presence** on the existing `src/community/realtime` path, throttled, with a privacy setting for presence.
3. **Mobile thread polish.**
   - Full emoji reaction picker, swipe-reply with a quoted preview, @mentions with autocomplete.
   - Edit/delete UI, pins bar, mute, and in-thread plus global search.
   - Read receipts, plus an offline send queue that is ordered, retried with idempotency keys, and shows a clear failed state with retry.
   - 60fps lists and optimistic UI.
4. **Integration points for other lanes:** expose a renderer slot for rich cards (lane A4) and an attachment slot in the composer (lane A6).

Blocking both ways and report parity must hold on every new surface. Flags default OFF.

**Acceptance:** RLS live tests for every new table or policy; no cross-tenant read through search or realtime; the offline queue survives an app restart; every action has specific error copy.

### A4-MSG-BROADCAST: segmented, scheduled and recurring broadcasts, rich cards, saved replies (T3/T4)

**Owner:** broadcasts that are segmented, scheduled and recurring; rich cards (workout, meal plan, booking, package, check-in); member privacy. Coach superpowers include segments (package, program, tag, signup date, last active, risk), saved replies, polls and quiet hours. The owner also wants "more ideas that beat Telegram and Skool for coaching".

**Backend:**
- **Broadcast model:** segment definition, schedule with time zone, recurrence rule, and preview count.
- **Scheduler** with a lease (the CronLease pattern) so a run can't fire twice.
- **Idempotent fan-out** with per-recipient delivery state, honoring quiet hours (OR-113-5), mute and blocks.
- **Saved replies** (CRUD per coach), RLS on everything.
- **Card payloads** for the five card types, with server-validated references (no cross-tenant links).

**Mobile:**
- Broadcast composer, segment picker with a live recipient count, schedule and recurrence sheet, and delivery stats.
- Saved-replies picker in the composer.
- Card components rendered through lane A3's renderer slot. Coordinate through PR comments; if the slot isn't merged yet, build the components and payloads first.

**Member privacy:** clients never see other recipients' identities in a broadcast.

**Ideas:** in your report, propose 2 or 3 extra "beats Skool" ideas with effort estimates. Do not build them unasked.

**Acceptance:** no duplicate sends across scheduler restarts (test it); quiet-hours deferral tested across time zones; segment counts match recipients.

### A5-COACH-BRIEF: daily brief, Roman reply drafts, client detail, check-in review (T4)

**Owner:**
- A coach daily brief in a luxury, butler tone powered by Roman. It runs once a day and turns scattered information into highlights, for example: "Sir, we collected $x last night. Sarah and 2 others messaged you. I have response drafts made. Good morning".
- Roman triage plus a reply draft for every unread client message.
- Client detail completeness: billing status, the score in view, consultation answers.
- A coach check-in review screen.

**Build:**
- **Inventory first:** `src/coach/brief/*` (scheduler, service, preferences, `COACH_BRIEF_ENABLED` guard), `src/community/ai-triage`, and `src/check-ins` (coach controller). Verify the brief cron runs on main and works end to end in tests. Production probes are unauthenticated GETs only, expecting 401 or 404.
- **Box-2 consent gate:** no client message content or data goes to the model without that client's box-2 consent. Clients without consent get a non-AI summary line ("2 messages from clients who have not enabled AI drafts").
- **Drafts** are never sent without the coach's tap. Edits are allowed, and every draft and send is audited.
- **Mobile:**
  - Brief screen: calm and elegant, one glance, tap-through to each item.
  - Draft review: approve, edit or dismiss.
  - Client detail additions: billing status from existing routes and the score. Reuse S-REACH's consultation-answers view, do not duplicate it.
  - Check-in review queue with quick reply.
- Kill-switch flag OFF by default.

**Acceptance:**
- Consent-gate tests fail before and pass after.
- The brief is generated once per coach per day across restarts (lease).
- Money figures in the brief reconcile exactly with settlement data in tests.
- Copy matches the butler tone without exclamation marks.

### A6-PHOTOS: photos in messaging (T4)

**Owner verdict item 4:** photos (T4).

**Backend:**
- Upload to a **private** bucket via short-lived signed URLs, with size and type limits.
- Strip EXIF and GPS server-side.
- An image moderation hook consistent with #610's report/review/action loop, with report/block parity.
- Erase photos when a message is deleted and when an account is deleted. Add an entry to the deletion manifest used by #608, which agent 113 owns; if #608 is unmerged, state the needed manifest entry in the PR body.
- RLS so only thread participants can read.

**Mobile:**
- Camera and library picker with accurate iOS purpose strings and Android permissions.
- Upload progress, retry, and a failed state with specific copy.
- Full-screen viewer with pinch-zoom.
- Plug into lane A3's attachment slot; build backend and standalone components first.

Flag OFF by default until audit and device pass.

**Acceptance:** no public URL ever; EXIF stripped (test with a fixture carrying GPS); deleting the message or account removes the object (tested); a reported photo hides for the reporter immediately.

## 8. Coordination and status

- **GitHub is the channel.** Agent 113 finds your PRs by the `Builder: TGP annex lane` line and routes audits. You get findings as AUDIT comments.
- **STATUS.md** (`handoffs/annex/STATUS.md` in tgp-agent-context) is your only writable state file. Keep one line per lane current. Put blockers and questions as `NEEDS OPERATOR: ...` lines; agent 113 reads them and answers on the PR or in the file.
- **Cross-lane coordination** (A3 with A4 and A6) happens in PR comments between your own lanes.
- **If Bradley talks to you,** answer him directly, record any owner decision verbatim with the time (`TZ=America/Los_Angeles date`) in STATUS.md, and end messages to him with "Your next step: ..." or "Nothing needed from you."

## 9. Launch steps (do these now)

1. Run Section 5's setup. Start the deps install first, since it takes several minutes.
2. Read the law in tgp-agent-context: `AGENT_RULES.md` (G01 to G22), `MODEL_ROUTING.md`, and `handoffs/op-c67c61cf/AGENT_BRIEF_COMMON.md`. Where a common-brief line says "agent 113's lanes", it applies to you as an annex lane.
3. Launch six builder subagents, one per lane. Use model Claude Opus 5.5 at high reasoning, with this objective:
   > You are lane <ID> (TGP builder annex, Claude Opus 5.5 builder, T4 unless graded otherwise). Read /home/user/workspace/ops/annex-brief.md (this document; save it there first) Sections 1-8 and your lane in Section 7, plus /home/user/workspace/ops/AGENT_BRIEF_COMMON.md. Execute your lane exactly. Use bash api_credentials=["github"] for git/gh. Never merge, dispatch workflows or touch production. Report to /home/user/workspace/ops/reports/<ID>-annex.md ending with ## HANDOFF.
4. Run the loop: watch the lanes, keep STATUS.md current, route audit comments back to the owning lane, and keep the sandbox under its limits. When a lane finishes and its PRs are approved, agent 113 merges them.
