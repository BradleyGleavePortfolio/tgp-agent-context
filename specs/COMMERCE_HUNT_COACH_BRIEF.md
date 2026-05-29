# Commerce Hunt — COACH SIDE (Package Creation & Asset Attachment)

## Who you are
Read-only investigator for "TGP" (The Growth Project / trygrowthproject.com) — a fitness-coaching app. Backend = NestJS, mobile = React Native (Expo). You are GPT-5.5. Do NOT modify any code, do NOT open PRs, do NOT commit. This is a pure HUNT + DESIGN-THINKING pass that produces a written report.

## Repos (read-only — do not touch backend-main or mobile working trees beyond reading)
- Backend: https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-backend.git @ d8698b77
- Mobile:  https://git-agent-proxy.perplexity.ai/BradleyGleavePortfolio/growth-project-mobile.git @ 6d17664f
The coding subagent infra clones the BACKEND for you (repo_url in metadata). For MOBILE, clone it read-only yourself into a scratch dir (e.g. `/home/user/workspace/tgp/mobile-commerce-hunt-readonly`) with `git clone <mobile url>` and read from there. Do NOT touch /home/user/workspace/tgp/mobile (that is the operator's read-only main checkout).

## North star context
- North star metric: 3/10 coaches reach "Activated."
- ICP = trainers billing $2K–$8K/mo with 10–40 clients.
- A sibling Master Workout Builder spec already exists at /home/user/workspace/specs/MASTER_WORKOUT_BUILDER_SPEC.md. READ its §3.2.1 "sellable/droppable asset seam" — it defines an `AssignableAssetRef` contract, an `is_sellable` marker, and revision-pointer-for-sale. Your design MUST cross-reference and be consistent with that seam. Do not redesign it; consume it.
- Sibling infra-inventory subagent is separately cataloguing raw checkout/ClientPurchase/packages/storefront/notification/scheduling models → /home/user/workspace/specs/COMMERCE_DRIP_INVENTORY.md. You may read it IF it exists when you start, but do NOT block on it — your job is the JOURNEY + UX + design thinking on the COACH side, not the raw model catalogue.

## YOUR SCOPE — COACH SIDE ONLY
You own the COACH (and sub-coach) experience of **making packages to sell** and **attaching deliverables**. The client/buyer side, guest checkout, and web-page checkout are owned by a separate Opus agent — do NOT spec those, but DO note any boundary/handoff points you discover.

Investigate and produce a written report covering:

1. **Current state — "making packages to sell."** Find every screen, route, component, endpoint, DTO, service, and DB model involved in a coach creating/editing/pricing/publishing a sellable package today. Cite exact file:line. Map the actual current page path (navigation flow) a coach walks through. Screenshot-in-words each step.

2. **What's broken/weird ALREADY in package creation.** Hunt for: dead screens, half-wired endpoints, validation gaps, missing states, confusing flows, orphaned code, TODO/FIXME, inconsistent pricing/currency handling, missing publish/unpublish, no draft state, etc. List each with file:line and severity.

3. **Reuse vs rebuild vs build-new (coach side).** For each piece of the package-creation journey, give a verdict: REUSE as-is / REFACTOR / RIP-OUT-AND-REBUILD / BUILD-NEW. Justify each against the requirement that packages must now attach **content-agnostic deliverables** (workout plans, meal plans, uploaded PDFs, uploaded videos, in-app auto-messages).

4. **Attaching deliverables to a sellable package.** Design how a coach attaches assets to a package during creation. The package-creation page/logic must be EXPANDED to attach: workout programs, meal plans, PDFs, videos, and auto-messages. Specify: the UI affordance (asset picker pulling from the Assignables Library), the data contract (consume `AssignableAssetRef` from builder spec §3.2.1), how an attached asset carries an optional drip schedule, and the create/edit endpoint shape. Cite where this should live in the current codebase.

5. **Content-agnostic delivery model (design thinking).** Think through how a single package can carry N heterogeneous deliverables, each with its own cadence (fixed-calendar date, relative-to-purchase offset, on-completion/milestone, immediate-on-checkout). You are NOT writing the runtime scheduler (that's the drip spec) — you are defining the COACH-AUTHORING shape: what does the coach configure per attached asset, and what does that serialize to.

6. **Logical target page path (coach).** Propose the ideal end-state navigation flow for a coach: from Assignables Library / package list → create package → attach assets → set per-asset drip cadence → price → publish. Contrast with today's flow.

7. **Boundary notes.** Flag anything that touches the client/guest/web-checkout side so the Opus agent and final spec can stitch cleanly.

## Output
Write your full report to `/home/user/workspace/specs/COMMERCE_HUNT_COACH.md`. Dense, file:line-grounded, decisions explicit (REUSE/REFACTOR/REBUILD/BUILD-NEW per component). End with a prioritized "what to build first" list for the coach side. Then return a concise summary of your top findings and recommendations.
