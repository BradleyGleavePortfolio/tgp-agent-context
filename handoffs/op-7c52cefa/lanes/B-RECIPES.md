# Lane B-RECIPES — recipes private by default and tenant-scoped (backend, T3 privacy/tenancy; mobile copy if needed). Builder: Claude Opus 5.5

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first and follow it exactly.
Source: Opus C-625-1 on backend #625. Once #625 creates the Recipe table, dormant code goes live: `POST /recipes` (any
student) defaults `is_public` to true (src/recipes/recipes.service.ts:71); `GET /recipes` returns every public recipe
platform-wide (:22-27); the client RecipesScreen renders `image_url` as a remote image. One client's title,
description and arbitrary image URL reach every other coach's clients with no moderation, reporting, blocking or tenant
scope (App Store guideline 1.2 risk; privacy; tenancy).
Deliver: recipes private by default (owner-only); sharing limited to the client's own coach tenant (coach-curated recipes
visible to that coach's clients) — no platform-wide public feed in v1.0; reject arbitrary remote image URLs unless they
come from our own upload storage (or drop image_url display); existing rows (if any) become private in an additive
migration only if needed (production has no Recipe table before #625, so none expected). Tests: cross-tenant read
denied, default private, coach-curated visible to own clients only, image URL validation. Specific error codes and
messages (no generic errors). PR against main after #625 merges; tier header; report
/home/user/workspace/ops/reports/B-RECIPES.md + final answer.
