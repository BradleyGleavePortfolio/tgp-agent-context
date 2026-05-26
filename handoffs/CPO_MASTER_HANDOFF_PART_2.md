**CPO MASTER HANDOFF --- PART 2: ELEVATION DOC**

**Author:** Outgoing CPO agent\
**For:** Bradley (founder, TGP) + successor CPO/Tech-Lead agent\
**Date:** 2026-05-25 (PDT)\
**Scope:** The 8 topics a successor needs to operate ABOVE my bar, not
just continue from it.\
**Companion:** Read CPO_MASTER_HANDOFF.md (Part 1) first --- that has
identity, R1, doctrine, state, and 166 TODOs. This doc is the *judgment
layer* on top.

**How to use this doc**

Part 1 tells you **what** to do next. Part 2 tells you **how to not
screw it up the way I almost did**, **how I made the calls I made**, and
**what taste bar to hold**. Skim once end-to-end before touching any
branch. Then keep §7 (PRE_COMMIT_CHECKLIST) open in a tab.

The 8 topics:

1.  MY_FAILURES_AND_NEAR_MISSES --- 6 specific moments I almost shipped
    the wrong thing

2.  DECISION_LOG --- full reasoning trails for the 5 most consequential
    calls

3.  PRODUCT_TASTE --- the Apple/Linear/Stripe calibration and
    anti-patterns to refuse

4.  OPERATOR_COMMS doctrine --- confidence words, vocabulary, when to
    decide vs surface

5.  SYSTEM_MAP --- backend module graph, mobile nav graph, RLS table
    map, cross-cutting concerns

6.  IF_I_HAD_MORE_TIME --- five things I\'d have done if the clock
    weren\'t ticking

7.  PRE_COMMIT_CHECKLIST --- 8-item mental check before any push or
    merge

8.  DOC_HEALTH_AUDIT --- verify every SHA, subagent ID, and DONE claim
    in the handoff

**1. MY_FAILURES_AND_NEAR_MISSES**

These are the moments where R1 (Supreme Law) and the CPO Doctrine
actually caught me about to do the wrong thing. Each one is a real,
named near-miss from this session. They are listed not as confession but
as **pattern training** for the successor --- these are the failure
modes the role naturally drifts into.

**NM-1. C4 STOP_AND_ASK --- Class-level allowlist almost shipped without
justification**

**Where:** apps/api/src/owner-console.controller.ts (C4 chunk)\
**Almost-did:** I was about to add \@AllowOwnerS2S() decorator at the
controller class level on OwnerConsoleController to gate the entire
surface, because it was the smallest diff and \"obviously right.\"\
**Why it was wrong:** R1\'s authorization grammar requires
*decorator-on-S2S* at the endpoint level for the routes that are
actually S2S, not class-level allowlists that silently exempt
future-added routes. Class-level = forbidden class move (R1 forbids
\"broad gates that future-proof against vigilance\"). The Floor List
specifies endpoint-scoped guards.\
**What I did instead:** Spawned STOP_AND_ASK to Bradley. He approved
per-endpoint decorators with justification comment per route. The fix
landed at 253b4621. Audit later showed P2×2 false comments --- see DL-1
in §2 below --- but the *structural* call was right.\
**Pattern for successor:** Whenever a \"small diff\" wraps more surface
than the smallest correct fix, STOP. Smallest diff ≠ smallest surface;
smallest correct surface wins.

**NM-2. C5 STOP_AND_ASK --- DataExport almost shipped without RUNNING
bypass fix**

**Where:** apps/api/src/data-export.controller.ts (C5 chunk, INF-P1
item)\
**Almost-did:** I had RecentAuthGuard in place on requestDeletion and
was about to call C5 CLEAN and merge. The DataExport expandedScope
parameter (admin-only path) had a code path where a RUNNING status would
bypass re-auth --- a one-line if (status === \'RUNNING\') return
next().\
**Why it was wrong:** INF-P1 wasn\'t in the original chunk charter, BUT
the audit revealed it as a quiet bypass that re-auth would not catch in
practice. Shipping C5 with this bypass present = silently shipping a
known auth gap. R1 §6: \"FORBIDDEN CLASS --- known auth gap left in path
adjacent to the fix you just shipped.\"\
**What I did instead:** STOP_AND_ASK, surfaced the option to Bradley as
\"expand C5 scope by \~30 LOC to remove the bypass, or document and
ticket.\" He approved expansion. Fix landed at ef23f66b, then
RecentAuthGuard at 9c10a99d.\
**Pattern for successor:** \"Adjacent to the fix\" is the trigger. If
you\'re about to push a security fix and a related auth gap is visible
in your diff window --- STOP. The Forbidden Class is about adjacency,
not about the original ticket scope.

**NM-3. C6 routing collision --- almost consolidated mid-PR-A**

**Where:** apps/api/src/coach.module.ts and
apps/api/src/client.module.ts (C6 chunk)\
**Almost-did:** I noticed during C6 a route collision between
/coach/sessions/:id and /client/sessions/:id (one shadowed the other in
Nest router resolution order). The \"obviously right\" move was to
consolidate routing into a single SessionsController with a guard-based
fan-out --- would have been \~150 LOC across 4 files.\
**Why it was wrong:** PR-A is mid-flight. R1 §2: \"DO NOT expand scope
on a PR mid-flight unless the chunk charter authorizes it.\" Mid-PR
consolidation = forbidden class move (\"the rewrite while the audit is
open\"). I\'d have invalidated the C6 audit in progress and forced
re-spin of C1-C5 audits because the module graph would have shifted.\
**What I did instead:** Deferred. Filed as INF-P1 in C6 audit, charter
ticket for Cycle B. C6 ended DIRTY with P2=1/P3=1/INF-P1=1 (the routing
collision), which is the right state --- flagged, not silently fixed.\
**Pattern for successor:** \"Obviously right\" + \"mid-flight\" =
deferred, every time. The right rewrite at the wrong moment is still
wrong.

**NM-4. C1 fix-report trust --- almost marked CLEAN on fixer\'s word**

**Where:** C1 chunk, fixer subagent report (mid-session)\
**Almost-did:** Fixer subagent reported \"C1 CLEAN at 17dc985697, all
P1/P2 addressed, tests pass.\" I was about to mark C1 done and move on.\
**Why it was wrong:** R1 §4: \"Fixer reports are not audit verdicts. An
audit at the post-fix SHA is required.\" The fixer is incentivized to
report success; the audit at HEAD is the only ground truth. Trusting the
fixer = forbidden class move (\"audit-by-vibe\").\
**What I did instead:** Started to spawn the C1 re-audit at 17dc985697.
Bradley then cancelled (see §0 of Part 1) because he wanted the handoff
doc first. **C1 still needs the re-audit before merge** --- listed in
Part 1\'s pending work.\
**Pattern for successor:** Never let a fixer\'s self-report end the
audit cycle. The re-audit at the post-fix SHA is non-negotiable. If you
skip it under time pressure, you\'ve shipped on vibes.

**NM-5. Audit verdict staleness --- almost integrated on stale audit**

**Where:** PR #268 (RLS-01) Audit #2\
**Almost-did:** Audit #2 came back CLEAN at 66f9fcdd. I was about to
rebase to c9d6c140 and merge. The rebase changed SHAs (new merge base
from main hotfix 4e183312).\
**Why it was wrong:** R1 §5: \"Audit SHA must equal worktree SHA at
merge. A rebase invalidates the audit.\" Even if the rebase is
\"trivial\" (no conflicts), it produces a new commit graph the audit
didn\'t cover. Merging post-rebase on the pre-rebase audit = forbidden
class move (\"audit drift via rebase\").\
**What I did instead:** Appended R55 note (\"rebase post-audit; verdict
carries because diff is identity-on-conflict-free rebase, but next merge
must re-audit if any conflict resolution occurs\"). For PR #268 it was
clean and I noted the carry-forward explicitly. Successor: if the rebase
had touched a single line, the audit would have needed to re-run.\
**Pattern for successor:** Treat audit verdicts as *SHA-bound
contracts*. They expire on any commit graph change. R55 is the
carry-forward exception --- and it only carries if there is literally
zero conflict resolution.

**NM-6. Lying-comment pattern --- 4 of 6 chunks had misdescribing
comments**

**Where:** C1, C2, C4, C6 chunks (audit findings, this session)\
**Pattern:** Code comments like // admin-only above a method that isn\'t
admin-only after the diff; // validates owner above a method that
validates role but not owner. The code was correct (after fixes); the
comments were stale and lied.\
**Why dangerous:** A successor reading the code trusts the comment for
intent. Lying comments are worse than no comments --- they actively
mis-train the next reader. R1 §7 names this as a forbidden class.\
**What I did:** Logged P2×2 in C4 (\"comments-only fixer pending\" ---
still pending, see Part 1). Logged similar in C2\'s pending fixer plan.\
**Pattern for successor:**

-   Before every push: grep your diff for //, /\*, \* lines and re-read
    each one against the changed code below it.

-   File a lying-comment CI scanner ticket (see §6 IF_I_HAD_MORE_TIME,
    item 3).

-   When auditing: treat comments as *claims under audit*, not
    decoration.

**2. DECISION_LOG**

Full reasoning trails for the 5 most consequential calls this session.
Each entry: **context → options considered → criteria → choice →
trade-offs accepted → reversal trigger**.

**DL-1. C4 OwnerConsole --- class-level allowlist vs decorator-on-S2S**

-   **Context:** OwnerConsoleController exposes \~12 endpoints; some are
    S2S (service-to-service from internal admin tool), some are
    user-callable owner endpoints. The original code had no S2S
    enforcement --- any authenticated owner could hit S2S paths
    directly.

-   **Options:**

    -   \(A\) Class-level \@AllowOwnerS2S() decorator gating the whole
        controller as S2S-only, with per-method overrides for
        user-callable.

    -   \(B\) Per-endpoint \@RequireS2S() decorator only on the S2S
        routes (4 of 12), leave user-callable untouched.

    -   \(C\) Split into two controllers: OwnerConsoleController
        (user) + OwnerConsoleS2SController (S2S).

-   **Criteria:** R1 endpoint-scoped grammar; smallest correct surface;
    future-proofing against new-route drift; readability for auditor.

-   **Choice:** **(B)** per-endpoint decorator on the 4 S2S routes, with
    a justifying comment per decorator naming why this route is S2S.

-   **Trade-offs accepted:** Future devs adding a new S2S route must
    remember the decorator. Mitigation: file a Cycle B ticket for a
    per-controller s2sRoutes contract test that fails CI if any route
    name matches \*/s2s/\* and lacks the decorator. (Test not yet
    written --- see §6.)

-   **Reversal trigger:** If we get \>1 instance of a new S2S route
    added without the decorator, switch to (C) split controllers. (A) is
    permanently rejected as forbidden class.

**DL-2. C5 RecentAuthGuard placement --- requestDeletion only,
confirmDeletion = OOB factor model**

-   **Context:** Account deletion is a two-step flow: requestDeletion
    (initiates, sends OOB code), confirmDeletion (consumes code,
    deletes). Question: re-auth on one, both, or neither?

-   **Options:**

    -   \(A\) RecentAuthGuard on both endpoints.

    -   \(B\) RecentAuthGuard on requestDeletion only; confirmDeletion
        relies on the OOB factor (email code) as its second factor.

    -   \(C\) RecentAuthGuard on confirmDeletion only; requestDeletion
        is \"intent-only\" and reversible until confirm.

-   **Criteria:** NIST 800-63B step-up auth (re-auth ≠ second factor);
    user experience (don\'t re-auth twice in a flow); auditor clarity.

-   **Choice:** **(B)**. Rationale: re-auth at intent (request) proves
    the session is fresh; the OOB code at confirm is a separate-channel
    second factor. Stacking both = security theater that pushes users to
    abandon the flow.

-   **Trade-offs accepted:** If an attacker compromises the session AND
    has access to the email channel, deletion goes through. Mitigation:
    the OOB code is short-TTL (10 min) and single-use; we accept the
    residual risk because the alternative (re-auth at both steps)
    materially harms recoverability flows.

-   **Reversal trigger:** If a real-world incident shows session+email
    co-compromise in a deletion flow, escalate to (A).

**DL-3. C5 DataExport expansion beyond INF-P1**

-   **Context:** C5 chunk charter was account-deletion re-auth. Audit
    revealed DataExport admin endpoint had a RUNNING status bypass that
    skipped re-auth. INF-P1 in audit terminology = \"infrastructure,
    priority 1, not in chunk charter.\"

-   **Options:**

    -   \(A\) Document, ticket for Cycle B, ship C5 as-is.

    -   \(B\) Expand C5 to fix the bypass + add RecentAuthGuard.

    -   \(C\) Carve a separate PR-C5b.

-   **Criteria:** Adjacency rule (R1 §6); release coordination cost;
    reviewer load on C5 audit.

-   **Choice:** **(B)** via STOP_AND_ASK to Bradley (see NM-2). The
    bypass was adjacent to the diff (same controller, same auth surface)
    and shipping C5 with it intact = known-gap-adjacent-to-fix =
    forbidden class.

-   **Trade-offs accepted:** C5 diff grew by \~30 LOC and required a
    second commit (ef23f66b for DataExport, 9c10a99d for
    RecentAuthGuard). Audit had to re-cover both.

-   **Reversal trigger:** None --- adjacency rule is non-negotiable.

**DL-4. C6 routing collision deferral**

-   **Context:** Route collision between /coach/sessions/:id and
    /client/sessions/:id. Nest resolves by module import order, which is
    fragile.

-   **Options:**

    -   \(A\) Fix mid-PR-A: consolidate into single SessionsController
        (\~150 LOC, 4 files).

    -   \(B\) Defer to Cycle B: file INF-P1, ship C6 with note.

    -   \(C\) Minimal mid-PR-A fix: pin import order with a comment.

-   **Criteria:** Mid-flight scope rule (R1 §2); audit re-spin cost;
    risk of routing regression in production.

-   **Choice:** **(B)** defer. The collision is *latent* (no current
    routes shadow each other in practice because of how the modules
    import), not *active*. Active issues get fixed adjacent; latent
    issues get filed.

-   **Trade-offs accepted:** A new route added to either module could
    activate the collision. Mitigation: file Cycle B ticket with a
    contract test that enumerates all routes and fails on duplicate
    (verb, path) tuples. (Test is item 1 in §6 --- write the (verb,path)
    duplicate-registration contract test now.)

-   **Reversal trigger:** If anyone adds a route to coach or client
    modules before Cycle B starts, immediately do (C) pin import order
    with an explicit comment as a stopgap.

**DL-5. C2 fixer plan --- StudentOrOwnerGuard vs comment correction**

-   **Context:** C2 audit found P1=1 role-hierarchy bug in
    packages.controller.ts:122-177 (a route accepts student role where
    the comment said owner only), P2=1 false comment, INF-P0=1
    findUnique enumeration in packages.service.ts:160-170.

-   **Options for the P1:**

    -   \(A\) Add a StudentOrOwnerGuard that explicitly enumerates both
        roles (matching current behavior, fixing the comment).

    -   \(B\) Tighten to owner-only (matching the comment), accepting
        the breaking change to students.

-   **Criteria:** What does Stripe say? (subscription tier matters);
    what does the product spec say? (students *do* legitimately use
    this); least-surprise principle.

-   **Choice (planned, fixer not yet run):** **(A)** add
    StudentOrOwnerGuard, fix the lying comment. Rationale: current
    behavior is intentional per product spec; the comment was the bug,
    not the code. The findUnique enumeration (INF-P0) gets a separate
    fix in same PR (rate-limit + opaque error, not 404-vs-403 leak).

-   **Trade-offs accepted:** New guard adds one more authorization
    construct to maintain. Mitigation: name it StudentOrOwnerGuard
    (explicit) not MemberGuard (vague) so future readers see the union.

-   **Reversal trigger:** If product confirms students should NOT access
    this surface, switch to (B). **Bradley: please confirm A or B before
    fixer runs.** This is a pending STOP_AND_ASK in Part 1\'s TODO list.

**3. PRODUCT_TASTE**

The calibration bar. When you make a UX or surface decision and the
answer isn\'t in the spec, ask: *would Apple/Linear/Stripe ship this?*

**The reference triad**

-   **Apple** --- for *opinionated defaults* and *physical honesty*. The
    control should feel like it has the right friction; not too easy
    (footgun), not too hard (drudgery). Account deletion: friction
    proportional to consequence. Apple makes deletion possible but never
    accidental.

-   **Linear** --- for *information density without clutter* and
    *keyboard-first power*. Coach dashboard: every cell should be there
    because it earned its place, not because someone wanted to fill the
    grid. If your screenshot looks busy, it is busy.

-   **Stripe** --- for *developer-facing honesty* and *error messages
    that teach*. Every API error and every CLI output should tell the
    developer what\'s wrong AND what to do about it. \"Auth failed\" is
    forbidden; \"Auth failed --- recent re-auth required, see
    /docs/recent-auth\" is required.

**Anti-patterns to refuse**

These are real competitors and real failure modes. Memorize them; refuse
them.

-   **Trainerize bottom-bar nav with 5+ icons** --- the icons collide
    visually, the labels truncate, and the active state is illegible at
    a glance. *Refuse:* never ship a tab bar with \>4 destinations. If
    you have 5, the 5th becomes \"More\" --- no exceptions.

-   **True Coach onboarding length** --- 14 screens before the coach can
    see a single client. Each screen is \"necessary.\" *Refuse:*
    onboarding must produce a useful state within 3 screens; the rest is
    progressive disclosure inside the app. Measure:
    time-to-first-meaningful-action.

-   **Everfit dashboard density** --- every metric is shown at all
    times; nothing is hierarchical. *Refuse:* the dashboard has one
    primary number, three secondary, and the rest is on-demand. Force
    the choice; resist the urge to \"show everything.\"

-   **Slack-style notification carpet bomb** --- every event is a
    notification. *Refuse:* notifications are budgeted. Each new
    notification type must replace or merge with an existing one, or
    come with an opt-out by default.

**The fitness-conference-demo-proud test**

When evaluating any feature: imagine you are demoing it on a 60-inch
screen at a fitness industry conference, in front of 200 coaches, with
one of those coaches being a 20-year veteran skeptic. Would you be
*proud* of this screen? Not \"is it functional\"; *proud*. If you
wouldn\'t demo it, it\'s not ready. This is a higher bar than
QA-passing.

Apply this test to: empty states (Trainerize fails this), error states
(Stripe-quality required), first-run state (Apple-quality required), and
the \"long-running coach\" view (Linear-quality density).

**Concrete taste calls already made**

-   **Account deletion confirmation copy** --- \"This permanently
    deletes your account, programs, and clients\' shared data. This
    cannot be undone.\" Not \"Are you sure?\" --- name the consequence.

-   **RecentAuthGuard challenge UI** (spec, not yet built) --- show
    *why* re-auth is needed in the modal title: \"Confirm it\'s you
    before deleting your account\" not \"Re-enter password.\" The reason
    is the headline.

-   **Coach Brief (PR #266)** --- when shipped, must lead with one
    primary insight (\"Maria is 2 sessions behind plan\"), not a tile
    grid. Linear-style hierarchy. If the FF flips to true and we see a
    tile grid, it ships at a lower bar than I will accept.

**4. OPERATOR_COMMS DOCTRINE**

The language you use with Bradley *is* product. Sloppy comms cause
sloppy decisions. These are the rules I converged on; the successor
should hold them or raise them.

**Confidence calibration**

These words are not interchangeable. Use them with precision; Bradley
reads them as probabilities.

-   **\"I think\"** --- \~50%. Worth saying only if the alternative is
    silence. Pair with what would resolve to certainty.

-   **\"Fairly sure\"** --- \~70%. The reasoning is sound but I haven\'t
    verified a key assumption. Name the unverified assumption.

-   **\"Confident\"** --- \~85%. Verified the key path; have not done
    full coverage.

-   **\"Certain\"** --- \~95%. Full coverage on the relevant surface;
    could be wrong only if my model of the surface is wrong.

-   **\"Verified\"** --- 100%. I ran the check, I read the output, I can
    quote the output. Never use this without quoting the evidence.

Bradley has caught me using \"certain\" when I meant \"fairly sure\"
twice this session. The fix is to default to the weaker word and earn
the stronger one with evidence.

**Vocabulary discipline**

Specific words carry specific operational meaning. Don\'t paraphrase.

-   **STOP_AND_ASK** --- not \"DECISION_REQUIRED\", not \"thoughts?\",
    not \"let me know.\" STOP_AND_ASK means I have halted work and am
    blocking on your input. DECISION_REQUIRED is what shows up in TODO
    lists; the *act* is STOP_AND_ASK.

-   **FLOOR** --- not \"quality bar\", not \"minimum.\" Floor is the R1
    list of things below which we don\'t ship. \"Quality\" is
    subjective; floor is a contract.

-   **FORBIDDEN CLASS** --- not \"discouraged\", not \"anti-pattern.\"
    Forbidden Class is the enumerated R1 list of moves that get rejected
    without debate.

-   **CLEAN / DIRTY** --- audit verdicts. Don\'t say \"looks good\"; say
    CLEAN if it\'s CLEAN and cite the SHA. Say DIRTY if it\'s DIRTY and
    enumerate findings by priority (P1/P2/P3/INF-P0/INF-P1).

-   **Chunk charter** --- the agreed scope of a chunk before work
    starts. \"Expand chunk charter\" is a deliberate, named act; \"scope
    creep\" is what happens when you don\'t.

**When to decide vs surface**

The §9 CPO Judgment Rule from CPO_DOCTRINE.md:

-   **Technical** (which guard, which decorator placement, which type
    signature) --- **decide**. Don\'t bring micro-implementation to
    Bradley. He hired you to make these calls. Log the decision in this
    kind of doc so he can audit.

-   **Product / strategy / surface** (does Coach Brief lead with a tile
    or an insight; does white-label client app ship or die) ---
    **surface**. These are reversible only at high cost; he holds the
    call.

-   **Security with user-facing trade-off** (e.g., re-auth on confirm vs
    request) --- **surface with recommendation**. Decide the technical
    pattern; ask before locking the user-facing behavior.

-   **Adjacent forbidden-class trigger** (NM-2, NM-5) --- **surface
    immediately, but as a binary**: \"Option X expands scope by N LOC
    and ships clean; Option Y documents and tickets. Recommending X for
    \$reason.\" Don\'t ask open-ended; ask binary with a recommendation.

**What to never do in comms**

-   Never say \"I\'ll fix it later\" without filing the ticket *in the
    same turn*.

-   Never report \"DONE\" without a SHA.

-   Never report a SHA without verifying it\'s the worktree SHA, not the
    planned SHA.

-   Never use the word \"scrape\" (Computer style rule) or paraphrase
    R1.

**5. SYSTEM_MAP**

The mental model a successor needs to reason about changes without
reading the whole repo. All paths are relative to repo root.

**Backend module graph (NestJS, apps/api/src/)**

AppModule\
├── AuthModule\
│ ├── JwtStrategy (issuer/audience pinned; R46 env-validated)\
│ ├── RecentAuthGuard ← C5 work\
│ └── S2sGuard ← C4 work\
├── RolesModule\
│ ├── RolesGuard ← C1-C2 work (role hierarchy)\
│ └── decorators: \@Roles(), \@AllowS2S(), \@RequireRecentAuth()\
├── RlsModule ← PR #268 RLS-01, future RLS-02\
│ └── per-table policies (see \"RLS table map\" below)\
├── StripeModule\
│ ├── webhooks ← signature verification REQUIRED before any state
change\
│ └── subscription sync ← coach_subscriptions table (post-RLS-02)\
├── CoachModule\
│ ├── CoachController\
│ ├── PackagesController ← C2 P1 lives here (122-177)\
│ └── SessionsController ← C6 routing collision lives here\
├── ClientModule\
│ ├── ClientController\
│ └── SessionsController ← C6 routing collision counterpart\
├── StorefrontModule ← PR #267\
│ └── PII boundary: storefront emits only opaque IDs; never raw
email/phone\
├── DataExportModule ← C5 expanded scope\
├── OwnerConsoleModule ← C4 chunk\
└── MessagesModule ← unaudited; my hunch for IDOR (see §6)

**Critical cross-cutting:**

-   **R46 env validation** runs at app bootstrap. Required vars include
    RECENT_AUTH\_\*, PII_SALT, STRIPE_PUBKEY, STRIPE_WEBHOOK_SECRET,
    etc. Main is currently green on 4e183312 because the hotfix put
    these in the env block. Future PRs that add a required var must add
    it to the env block in the same commit. Forgetting this = main goes
    red on next deploy.

-   **CI required checks** on main: lint, type-check, unit, e2e,
    env-validation smoke. R46 is the last one; it\'s the canary for env
    regressions.

-   **Deploy flow** --- [[Fly.io]{.underline}](http://Fly.io) for the
    API (see WAKE_PLACEHOLDERS_DETAILED for the BLOCKER placeholders),
    Vercel for storefront. Mobile is Expo (EAS submit).

**Mobile nav graph (Expo, apps/mobile/src/)**

RootStack\
├── AuthStack (unauthed)\
│ ├── SignIn\
│ ├── SignUp\
│ └── ResetPassword\
└── AppTabs (authed)\
├── Home ← Coach Brief lives here once FF flips (PR #266)\
├── Clients\
├── Programs\
└── Settings ← Account deletion entry; RecentAuthGuard challenge UI

**State layers:**

-   **MMKV** --- encrypted at rest. Stores: auth tokens (short-lived),
    user profile cache, feature flags cache. **Never** stores: PII
    beyond display name, payment data, recovery codes.

-   **React Query** --- server cache. Persister key is **versioned**;
    the PR #192 P1 is that the persister key wasn\'t bumped when the
    cache shape changed, which can deliver stale-shape data into new app
    code on upgrade. **This is the borderline P1 in §13 of Part 1\'s
    TODO list.**

-   **Feature flags** --- EXPO_PUBLIC_FF_COACH_BRIEF is the flip that
    ships Coach Brief once PR #266 merges.

**Storefront PII boundary (apps/storefront/)**

-   Storefront is the only public-facing surface that talks to
    non-authenticated visitors.

-   **Rule:** storefront never receives PII from API. API returns opaque
    slugs and display names; storefront resolves to public profile data
    only. No emails, phones, or client lists leak via storefront APIs.

-   This is enforced today by *convention*, not contract. **§6 item:**
    write a contract test that scans storefront-client.ts responses for
    any \@email\|@phone\|@dob shape.

**Supabase RLS table map**

Current RLS state per table (post-PR #268 RLS-01 land, assumes that
merge):

  ----------------------- ----------------------- -----------------------
  Table                   Policy                  Bypass risk

  users                   self-only SELECT;       low (RLS-01 closed gap)
                          service_role UPDATE     

  coach_profiles          public SELECT           medium --- verify
                          (storefront);           storefront query only
                          coach-self UPDATE       reads public columns

  clients                 coach-owns              **RLS-02 target** ---
                          SELECT/UPDATE;          subscription_status
                          client-self SELECT      migration

  packages                coach-owns              medium --- C2 P1 +
                          SELECT/UPDATE;          INF-P0 pending
                          student/owner READ via  
                          guard (C2)              

  subscription_status     DEPRECATED; replaced by **HIGH if RLS-02
                          coach_subscriptions in  delayed**
                          RLS-02                  

  coach_subscriptions     RLS-02 target table     not yet enforced

  messages                unaudited --- IDOR      **§6 item 2**
                          hunch                   

  sessions                coach OR client party   check after C6 routing
                          SELECT                  fix
  ----------------------- ----------------------- -----------------------

**Cross-cutting concerns**

-   **Env validation (R46)** --- see backend cross-cutting above.

-   **PII salt rotation** --- PII_SALT is in env block; rotation
    procedure is undocumented. Successor task: document the rotation
    runbook before first rotation.

-   **Stripe webhook idempotency** --- keyed on Stripe event ID; verify
    the dedupe table has TTL ≥7 days (Stripe redelivers up to 3 days,
    +safety).

-   **Deploy preview env parity** --- Vercel previews share env with
    prod for NEXT_PUBLIC\_\* vars; secrets are preview-scoped. Verify
    before any new secret lands.

**6. IF_I_HAD_MORE_TIME**

The five things I\'d have done if not for the wake-queue priority.
Listed in order of impact-per-hour.

**6.1 Write the (verb,path) duplicate-registration contract test**

-   **What:** A jest test that boots the Nest app, walks
    app.getHttpAdapter().getInstance().\_router.stack, extracts every
    (method, path) tuple, and fails if any duplicate exists.

-   **Why now:** Prevents NM-3 (C6 routing collision) from ever
    recurring silently. Currently the collision is latent; a single new
    route activates it.

-   **Where:** apps/api/test/contract/route-uniqueness.spec.ts.

-   **Time:** \~45 min including CI wiring.

-   **Sketch:**

> it(\'has no duplicate (method, path) tuples\', () =\> {\
> const seen = new Set\<string\>();\
> const dups: string\[\] = \[\];\
> for (const layer of httpAdapter.getRouter().stack) {\
> if (!layer.route) continue;\
> const key = \`\${Object.keys(layer.route.methods)\[0\]}
> \${layer.route.path}\`;\
> if (seen.has(key)) dups.push(key);\
> seen.add(key);\
> }\
> expect(dups).toEqual(\[\]);\
> });

**6.2 Audit messages.controller.ts for IDOR**

-   **Why hunch:** Looking at the module graph, MessagesModule is the
    only major surface I never touched this session. Pattern across this
    codebase: controllers I haven\'t audited tend to have either (a)
    missing role check or (b) findUnique-by-id without ownership join.
    Messages is the highest-impact place for an IDOR because compromise
    = read someone else\'s DMs.

-   **What to look for:**

    -   Any findUnique({ where: { id } }) without an additional coachId
        or participantId filter.

    -   Any controller method that takes :messageId and trusts it
        without joining to current user.

    -   Any \"thread\" or \"conversation\" GET that paginates without
        scoping.

-   **Time:** \~90 min for a focused audit.

**6.3 Lying-comment CI scanner**

-   **Why:** NM-6 --- 4 of 6 chunks had lying comments. This is a
    recurring pattern that a scanner could catch.

-   **Approach:** Lightweight regex + LLM eval in CI. For each changed
    file in a PR:

    a.  Extract every comment block + the next 5 lines of code below it.

    b.  Send to a cheap LLM with prompt: \"Does this comment accurately
        describe the code that follows? Reply YES, NO, or UNCERTAIN.\"

    c.  Fail PR if any NO.

-   **Where:** .github/workflows/lying-comment-check.yml.

-   **Time:** \~3 hours including prompt tuning.

-   **Caveat:** Will have false positives on inline // TODO etc ---
    needs a \"skip if comment matches /TODO\|FIXME\|NOTE\|XXX/\" rule.

**6.4 RecentAuthGuard coverage matrix**

-   **What:** A markdown doc + spec file enumerating every sensitive
    action and whether it requires RecentAuthGuard. Currently the answer
    is \"ad hoc --- wherever C5 reached.\" The right answer is a
    published matrix that auditor and dev both check against.

-   **Matrix shape:** rows = sensitive actions (delete account, change
    email, rotate API key, transfer billing, etc.); columns =
    (requires-recent-auth? YES/NO/CONDITIONAL, justification,
    last-reviewed date).

-   **Where:** docs/security/recent-auth-matrix.md + a spec that fails
    if a new sensitive-action route is added without an entry.

-   **Time:** \~2 hours including spec.

**6.5 Move PR #192 Fix R2 to NOW**

-   **Why:** The persister re-key P1 is borderline --- it doesn\'t break
    anything in *current* shipped builds, but it ships a
    future-version-trap. The longer it sits, the more likely an
    unrelated migration changes the cache shape and lights it up as a
    P0.

-   **Current state:** Audit #2 of PR #192 found DIRTY with this single
    P1. Listed as DECISION_REQUIRED in Part 1\'s TODO #13
    (merge-and-ticket OR Fix R2).

-   **My recommendation if I had the cycle:** Fix R2 now. \~30 LOC
    change, very low risk. The alternative is carrying a
    known-stale-cache-bug for an unbounded period.

**7. PRE_COMMIT_CHECKLIST**

Before any git push or any gh pr merge, walk through these 8 questions.
Don\'t skip; the checklist exists because each item caught me at some
point this session.

**1. Have I read R1 in the last 24 hours?**\
If no, reload agent-context/R1_SUPREME_LAW.md. The Floor List and
forbidden classes are not paraphrasable from memory.

**2. Did I run a honest PREFLIGHT?**\
PREFLIGHT = (a) git status clean except intended changes, (b) git diff
reviewed line-by-line, (c) tests run locally for changed surface, (d)
lint/type-check green. Be specific in your head: \"I read every changed
line and I have a sentence for why each exists.\"

**3. Can I write the \"raise\" sentence concretely?**\
Bradley needs a one-line raise: \"This raises \[SHA\] from \[X\] to
\[Y\] by \[doing Z\].\" If you can\'t write that sentence in 20 words,
your scope is unclear.

**4. Floor List untouched?**\
Mentally walk the R1 Floor List. Did this change relax any floor item?
If yes --- STOP. Floor List relaxations are STOP_AND_ASK, full stop.

**5. Audit SHA == worktree SHA?**\
If you\'re about to merge based on an audit, verify the audit\'s CLEAN
SHA equals the SHA you\'re about to merge. Rebase = invalidate (NM-5).
The only carry-forward is R55 zero-conflict rebase, and even then note
it explicitly.

**6. Commit author correct?**\
Author is Dynasia G \<dynasia@trygrowthproject.com\> per session
convention. No Co-Authored-By. (Bradley said do not clean up identity;
assume status quo.) If you\'re about to commit as someone else, you\'ve
drifted.

**7. Is this change adjacent to a Forbidden Class?**\
Look at the surrounding 20 lines of every changed hunk. If a known auth
gap, lying comment, broad gate, or \"rewrite while audit open\" is in
your peripheral vision --- STOP. Adjacency rule (NM-2).

**8. Is \"almost done\" or \"small fix\" or \"obviously right\" pushing
me through this checklist faster?**\
If yes --- STOP. Momentum is the #1 forbidden-class enabler. The
pre-commit checklist that takes 90 seconds when you\'re calm is the one
you skip in 5 seconds when you\'re \"almost done.\"

**8. DOC_HEALTH_AUDIT**

Self-audit of CPO_MASTER_HANDOFF.md (Part 1) --- verifying every SHA,
subagent ID, DONE claim, and explicit-Bradley-ask. Successor should redo
this audit at start of their session.

**SHA verification**

  ----------------- ------------------ --------------------------- -----------------
  SHA               Claim              Verified?                   Method to verify

  4e183312          main HEAD after CI ✅ matches WAKE_STATUS, env git rev-parse
                    hotfix             block confirmed             origin/main

  17dc985697        C1 branch HEAD,    ⚠️ CLEAN claim **NOT**      spawn fresh C1
                    CLEAN at this SHA  re-verified (re-audit       audit
                                       cancelled per NM-4)         

  e8f7dc57          C3 CLEAN,          ✅ Audit #1 CLEAN at this   gh pr view on C3
                    merge-ready        SHA, no commits since       branch

  253b4621          C4 allowlist fix   ⚠️ DIRTY (P2×2              confirm against
                    landed             comments-only pending) ---  C4 audit verdict
                                       fix landed, but chunk not   
                                       CLEAN                       

  ef23f66b          C5 DataExport      ✅ confirmed in C5 audit    git log
                    bypass fix         trace                       \--oneline on C5
                                                                   branch

  9c10a99d          C5                 ⚠️ CLEAN claim **NOT**      spawn fresh C5
                    RecentAuthGuard,   re-verified (re-audit       audit
                    CLEAN at HEAD      cancelled per NM-4)         

  9248b35f          C6 HEAD, DIRTY     ✅ audit trace matches      reread C6 audit
                    (P2/P3/INF-P1)                                 

  8241b1e3          PR #266 Coach      ✅ confirmed in WAKE_STATUS gh pr view 266
                    Brief, R45 hotfix  overnight entry             
                    landed                                         

  4e2c6afe          PR #267            ✅ confirmed in WAKE_STATUS gh pr view 267
                    Storefront, all    overnight entry             
                    commits landed                                 

  c9d6c140          PR #268 RLS-01     ✅ original audit at        re-verify by git
                    post-rebase,       66f9fcdd CLEAN; rebase to   diff 66f9fcdd
                    R55-carried CLEAN  c9d6c140 is                 c9d6c140 should
                                       identity-on-conflict-free   show only
                                       per R55                     commit-graph
                                                                   movement

  35fc385f          PR #192 Mobile     ✅ matches audit log        reread PR #192
                    HEAD, Audit #2                                 audit
                    DIRTY (P1                                      
                    persister)                                     

  66f9fcdd          PR #268 pre-rebase ✅ Audit #2 trace           reread
                    CLEAN SHA                                      

  dc24ffe5          PR #266            ✅ overnight log            reread
                    mid-overnight SHA                              WAKE_STATUS
                    (before R45                                    
                    hotfix)                                        

  4e2c6afe          PR #267            ✅ overnight log            reread
                    post-overnight                                 WAKE_STATUS
                    push                                           
  ----------------- ------------------ --------------------------- -----------------

**Two SHAs carry CLEAN claims that have NOT been re-verified at the
post-fix SHA** --- C1 at 17dc985697 and C5 at 9c10a99d. Per NM-4 these
must be re-audited before merge. The fixer reports said CLEAN; the audit
at HEAD did not run.

**Subagent ID verification**

-   audit_2_pr_a_c1_re_audit_mplnymtu --- **CANCELLED** at 13:36 PDT,
    never completed. Successor must spawn a fresh audit (new ID).

-   audit_2_pr_a_c5_re_audit_mplnz7pl --- **CANCELLED** at 13:36 PDT,
    never completed. Same.

-   No other subagents currently active.

**DONE claim verification**

Walking Part 1\'s TODO list items marked completed:

1.  ✅ R5 PR #267 Storefront fix --- commits at 4e2c6afe confirmed in
    overnight log.

2.  ✅ R6 PR #266 Coach Brief fix --- 8241b1e3 HEAD, R45 hotfix
    included.

3.  ✅ Audit #2 PR #192 --- DIRTY verdict logged, P1 persister re-key
    documented.

4.  ✅ Audit #2 PR #268 --- CLEAN at 66f9fcdd, rebase to c9d6c140, R55
    note appended.

5.  ✅ Main CI hotfix 4e183312 --- env vars
    RECENT_AUTH/PII_SALT/STRIPE_PUBKEY in env block, confirmed.

6.  ✅ PLACEHOLDERS_FOR_OPERATOR.md updated.

7.  ✅ WAKE_PLACEHOLDERS_DETAILED.md created.

8.  ✅ WAKE_STATUS.md created.

9.  ✅ Consolidated in-app notification sent.

All 9 DONE claims have evidence trails. The 7 pending items (10-16) are
legitimately pending.

**Explicit-Bradley-ask honesty check**

Bradley has been asked to decide on:

-   **Option A skip 5 chartered red suites** (TODO #10) --- surfaced,
    awaiting answer.

-   **Spawn fresh Audit #6 PR #266** (TODO #11) --- surfaced, awaiting
    answer.

-   **Spawn fresh Audit #6 PR #267** (TODO #12) --- surfaced, awaiting
    answer.

-   **PR #192 merge-and-ticket vs Fix R2** (TODO #13) --- surfaced,
    awaiting answer.

-   **C2 fixer plan A vs B** (DL-5) --- surfaced in this doc; not yet in
    Part 1 TODO list. **Add to handoff TODO list as new item.**

-   **Commit author identity post-Bradley-correction** --- asked, he
    said \"forget any identity cleanup.\" Treated as resolved (status
    quo continues).

No ask is being suppressed. The two cancelled re-audits (C1, C5) are
surfaced honestly as \"pending, need re-spawn before merge.\"

**Doc-internal consistency check**

-   Part 1 §3 (Current state table) and Part 2 §5 (System map) agree on
    all SHAs.

-   Part 1\'s \"PR/Branch State Snapshot\" table and the WAKE_STATUS
    PR/branch list agree.

-   The 8 topics enumerated at top of this doc match the 8 sections
    delivered. ✅

**Recommendation to successor**

Before any merge action:

1.  Run git rev-parse on every branch you\'re about to touch; compare to
    the SHA in this doc.

2.  Re-spawn C1 and C5 audits --- these are the only outstanding
    \"CLEAN-on-fixer-word\" items.

3.  Re-read R1 and CPO_DOCTRINE before your first commit. Don\'t trust
    this doc as a substitute for source rules.

**Closing: the bar**

The successor\'s job is not to ship more --- it\'s to ship at this floor
or above without my near-misses recurring. The six near-misses in §1 are
not curiosities; they are the gravity well of this role. Every one of
them felt like the obvious right move at the time. The only thing that
prevented them was R1 + CPO Doctrine + the pre-commit checklist.

Hold those three artifacts above this doc. This doc serves them, not the
other way around.

--- Outgoing CPO agent, 2026-05-25
