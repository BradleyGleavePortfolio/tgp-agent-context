**CPO BRIEFING --- TGP Operator Synthesis**

**2026-05-24 · Primary sources: 4 strategy docs + live Supabase + mobile
repo + competitive intel**

This is the canonical \"what we are building and why\" document for
every subsequent agent action. All future audits, fix briefs, PR plans,
and architectural decisions check against this. **If a proposed change
conflicts with this, the change loses.**

**1. North Star (verbatim from TGP_PRODUCT_VISION)**

> **3 of 10 coaches who sign up reach Activated state.**\
> Activated = Stripe Connect onboarded + ≥1 package created + ≥1 charge
> collected.

Build is **65--70% complete.** Target: **800 founding users on
TestFlight.** iOS App Store launch is the forcing function --- every P0
must clear before launch.

**2. ICP (verified against product-dominance-playbook)**

**Sweet spot:** Personal trainers / online coaches billing
**\$2K--\$8K/mo** through their practice.

-   **Above \$8K/mo:** they hire a developer, build their own, or buy
    Trainerize Studio Plus (\$248/mo)

-   **Below \$2K/mo:** they\'re hobbyists, use Stan Store + DMs, won\'t
    pay the migration cost

-   **Sweet spot characteristics:** 10--40 clients, charges
    \$150--\$500/mo/client, runs the business solo or with 1 VA, came
    from SMMA acquisition or Instagram organic, currently using
    Trainerize/Everfit and frustrated by add-on bills

**NOT the ICP:**

-   ❌ Solo trainers with \<5 clients (Everfit free)

-   ❌ Gym chains (ABC Fitness owns this)

-   ❌ Course creators (Whop owns this)

-   ❌ B2B enterprise wellness (Wellable/Virgin Pulse own this)

**3. The Distribution Loop (Thiel test --- playbook §2)**

**SMMA → TGP Storefront → Mobile App → Recurring Billing → Coach
retains.**

The SMMA agencies who acquire clients for fitness coaches become a
distribution channel. TGP gives those SMMAs a coach-onboarding link
(joingrowthproject.com) that pre-sells the coach on TGP before the SMMA
even pitches them. **PR #267 (Storefront) is the top-of-funnel half of
this.** PR #266 (Coach Brief) is the activation half --- the AI helps a
brand-new coach draft their first program faster than Trainerize can
spin up an account.

**4. The 4 Killers Currently Threatening TGP**

From product-dominance-playbook 8-killers framework, applied to TGP:

1.  **Activation cliff** (KILLER) --- coach signs up, can\'t onboard
    Stripe Connect, drops. Today\'s CI flake on feat/coach-brief may
    indicate auth/wiring failures elsewhere.

2.  **Migration friction** (KILLER) --- coach has 30 clients in
    Trainerize, won\'t manually re-enter. **TGP currently has no
    Trainerize importer.** P0 before launch.

3.  **White-label gap** (CHRONIC) --- Trainerize/Everfit ship branded
    apps. TGP coaches use TGP-branded app. Defense: position as
    \"powered by TGP\" badge of quality, not weakness. Roadmap proper
    white-label for \>\$8K/mo coaches.

4.  **The 50-table RLS hole** (NEW KILLER, just discovered) --- see
    SUPABASE_RLS_CRISIS.md. Cannot launch to App Store reviewers without
    this fixed; reviewers actively probe data access on health apps.

**5. The Two Reality Checks (NEW today)**

**Reality Check #1 --- The Supabase database is not in the state we
thought it was**

**See SUPABASE_RLS_CRISIS.md for full detail.** Bottom line:

-   50 of 92 production tables have RLS disabled

-   Includes PHI-adjacent (bloodwork, consent), financial (refunds,
    disputes, idempotency), and privacy/compliance (data export,
    deletion audit) tables

-   Originally-scoped subscription_status → coach_subscriptions
    migration is **one small slice** --- actual scope is a 5--8 PR
    remediation program

-   5 RBAC helper functions have function_search_path_mutable --- a
    code-injection vector against the entire policy system

-   App Store reviewers will catch this with simple unauthenticated curl
    probes against PostgREST

**This jumps to the front of the work queue once #266 + #267 are
merged.** It supersedes the originally-planned subscription_status
migration scope.

**Reality Check #2 --- The mobile repo is more sophisticated than the
backend rules implied**

**Mobile AGENT_RULES.md has 33 rules vs backend\'s 14.** Rules 15--33
add critical mobile-specific discipline:

-   **R15** --- user-scoped storage keys + signOut wipe (prevents
    account confusion on shared devices)

-   **R16** --- server-authoritative time (client clock cannot be
    trusted for billing/streaks)

-   **R19** --- UUID idempotency key on all mutating API calls (prevents
    double-charge on retry)

-   **R22** --- server-authoritative RBAC (client UI gating is cosmetic
    only)

-   **R28** --- permission requests gated to value moments (don\'t ask
    for push perms at app open --- ask after first program completion)

-   **R31** --- rate limiting on all auth + paid + webhook endpoints

-   **R32** --- explicit CORS allowlist

-   **R33** --- no DB queries in loops + index all FK columns (Supabase
    performance advisor confirms many unindexed FKs today)

**These 19 mobile-specific rules must flow back into the backend rules
as well.** Backend R31 (rate limiting), R32 (CORS), R33 (FK indexing),
R22 (server-authoritative RBAC), R19 (idempotency keys) are all backend
concerns. The mobile team has caught discipline gaps the backend rules
missed.

**ACTION:** Update /home/user/workspace/agent-context/AGENT_RULES.md to
incorporate the mobile rules 15--33 as backend rules where they apply
server-side. Both repos should share the canonical rule list.

**6. Competitive Position Locked**

See COMPETITIVE_INTEL.md. Summary:

-   **TGP wins on price at every coach size** (2% platform fee + \$0
    SaaS undercuts Whop\'s 2.7%, Trainerize\'s \$123--\$248+addons,
    Everfit\'s \$128 at 25 clients)

-   **TGP loses on white-label and AI builders** today --- both are
    roadmap items

-   **TGP\'s defensible moat:** fitness-specific data model (bloodwork,
    programs, habits, body metrics) + 1:1 coach-client paradigm +
    iOS-native opinionated UX

-   **Don\'t compete with Whop on generalist creator features**
    (Discord, affiliates, community) --- that\'s their lane and we lose

-   **Don\'t compete with Trainerize on feature count** --- they have
    100 features and are drowning in them

**7. Simplicity Mandate (from simplicity-ideology)**

Every screen, every endpoint, every flow must justify itself against:

1.  **Tesler\'s Law** --- complexity is conserved; if we don\'t absorb
    it server-side, the coach absorbs it. TGP exists to absorb
    complexity (Stripe Connect setup, tax forms, package pricing logic,
    recurring billing edge cases) so the coach doesn\'t have to.

2.  **Hick\'s Law** --- fewer choices at decision points. Coach
    onboarding should never present \>3 paths at once.

3.  **Miller\'s 7±2** --- no dashboard with \>7 primary actions visible
    at once. Group, hide, or kill.

4.  **Progressive disclosure** --- first run shows 3 actions: create
    package, add client, take payment. Everything else is one tap
    deeper.

5.  **Smart defaults** --- never make the coach pick a unit, a timezone,
    a currency unless we genuinely can\'t infer it.

**Anti-pattern watch:** Any PR that adds a new top-level nav item, a new
modal, a new wizard step, or a new \"settings\" subsection must be
challenged. The product is too small to afford complexity drift.

**8. The Active Work Queue (post this turn)**

In strict order --- R33 serial (one PR at a time, CI green before next
starts):

**Cycle A --- Close out #266 + #267**

1.  **Wait for fix_round_3_pr_266_mpksa67e** to finish (PR #266 Coach
    Brief)

2.  **Wait for fix_round_2_pr_267_mpksajxv** to finish (PR #267
    Storefront)

3.  **Audit #3** on PR #266 via GPT-5.5 general_purpose subagent ---
    exhaustive, no \"enough found\"

4.  **Audit #3** on PR #267 via GPT-5.5 general_purpose subagent ---
    exhaustive

5.  If clean: merge #266 first, wait for main CI green, then merge #267

**Cycle B --- RLS Crisis (NEW --- supersedes original
subscription_status scope)**

6.  PR-RLS-01: Helper function lockdown + HaveIBeenPwned enablement

7.  PR-RLS-02: Stripe/Financial/Idempotency tables (includes
    subscription_status → coach_subscriptions)

8.  PR-RLS-03: Medical/Consent tables

9.  PR-RLS-04: Privacy/Compliance tables

10. PR-RLS-05+: Coaching domain families (sessions, meals, habits,
    lessons)

11. Add CI check: fail build if any public.\* table has relrowsecurity =
    false

**Cycle C --- Dependabot**

12. Triage 6 Dependabot PRs --- categorize as patch/minor/major, merge
    patch+minor in batched PRs

**Cycle D --- Mobile**

13. Investigate mobile open PRs #123 + #192 (per prior summary)

14. Sync mobile + backend AGENT_RULES.md to shared canonical 33-rule
    list

**Cycle E --- Pre-launch hardening (after RLS crisis closes)**

15. Trainerize CSV importer (kills the #2 killer above)

16. White-label roadmap decision (kill or commit + scope)

17. Coach Brief AI v1 (closes feature-parity gap with Trainerize/Everfit
    AI builders)

**9. What I Need from Bradley (only when blocked)**

Nothing right now. The audit cycle continues autonomously. Will surface
only:

-   If audit finds a P0 that needs his judgment (e.g. trade-off between
    launch date and feature scope)

-   If Stripe Connect / financial flow has an ambiguity the rules don\'t
    resolve

-   If the App Store reviewer rejection probability looks \>30% on
    something I\'d ship

**10. Files Created This Turn (Canonical Context)**

-   /home/user/workspace/agent-context/SUPABASE_RLS_CRISIS.md --- the
    50-table RLS gap, full remediation plan

-   /home/user/workspace/agent-context/COMPETITIVE_INTEL.md ---
    Trainerize / Everfit / Whop / Stan Store, all cited

-   /home/user/workspace/agent-context/CPO_BRIEFING.md --- this file,
    the master synthesis

These join the existing canonical context:

-   AGENT_RULES.md (backend 14 rules --- needs update to incorporate
    mobile R15--R33)

-   ENGINEERING_RULES.md (backend 11 sections)

-   HOUSE_RULES.md

-   50_FAILURES.md

-   R36_TO_R45_OPERATOR_RULES.md

-   SECURITY_SKILL.md

-   AUDIT_MANDATE.md (exhaustive audit law)

-   CURRENT_TEST_FAILURES.md
