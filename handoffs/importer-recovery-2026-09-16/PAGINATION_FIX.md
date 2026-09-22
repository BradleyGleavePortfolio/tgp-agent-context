# Pagination audit repair

## Build matrix

- Extension main: `0111be661922234d670bbf23e23d270eec1b4a4e`
- Input PR21 head: `fd588bf1db0781b8a8aaa1c241e30f20c96eb79d`
- Context at dispatch preparation: `e6cf1f8422205ca17775c81c4bf6ea4eed944a93`
- Backend: `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`
- Evidence date: 2026-09-16 UTC

## Ownership and independent work

Dedicated worktree `/home/user/workspace/tgp/extension-pagination-fix`,
branch `fix/c2b-0a-pagination-audit`. Own only:

- `shared/replay/blueprint.js`
- `shared/replay/engine.js`
- `test/replay-blueprint.spec.js`
- `test/replay-engine.spec.js`
- `test/replay-engine-edge.spec.js`

Membership builder owns different `shared/blueprint/` and membership/template
test files. No overlap. No other writer owns replay files. Preserve all PR21
work additively; no force-push, amend, gate/config/dependency edits or main push.

## Required behavior

Read both independent pagination reports in full. They independently reproduced
the same three product defects on base and input head. Fix all three:

- Sparse cursor path must fail before any request, even as a later blueprint
  step. Copy and validate the same effective dense snapshot; no input mutation.
- Arbitrary accepted query names including `__proto__` must reach the URL in
  page and cursor modes and traverse through a real finite terminal condition.
- Integer page traversal must remain representable or report truthful
  non-success. Preserve normal zero/negative starts, absent/null defaults and
  valid query names. Reject unsafe initial integers at normalization and detect
  advancement overflow after a valid maximal safe initial value. Never coerce
  malformed values into defaults or call a repeated URL proof of exhaustion.

Add regression tests first. Include missing/sparse paths, normalization
idempotence, frozen inputs, special-key page/cursor traversal, unsafe start
zero-fetch, safe-limit progression, repeated-cursor non-success, normal negative
and zero starts. Keep all work bounded and status compatible with existing
error/degraded/truncated handling.

Both reviews also identify missing signature/code-owner enforcement. That
governance finding is NOT closed by this code repair. Do not change GitHub
settings, invent a signing identity, waive doctrine or label the whole PR clean.

## Decision and verification

R138 Decision Gate:

1. Delete ambiguous silent fallback behavior rather than adding a parallel
   paginator. Repair the shared normalizer and actual execution consumer.
2. Validate at the boundary and preserve exact accepted values into execution.
   AWS describes request validation before integration, while noting that backend
   validation is still necessary:
   https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html
3. Preserve read-only source requests, bounded traversal and existing consumers;
   remove false success without adding new platform or credential behavior.
4. Fix the actual sparse-array, ordinary-object-key and numeric-progress causes,
   not only the audit fixtures. Rollback is an isolated revert; no schema or flag.

Run targeted tests, full suite and PR-context gates, production LOC <=400 and
test:source >=2 across the aggregate main-to-result diff. The home sandbox
has an independently reproduced ancestor dependency type-check failure.
Do not weaken checks. Parent will mirror the exact owned tree into a clean
Node22 clone for full gates and hooked commit. Stage owned files explicitly:
the local `node_modules` is an untracked symlink and must never be committed.
After each code checkpoint notify parent for foreground durability.
No code push or merge without parent integration. Return all files written,
commands/results, remaining limitations, exact input/output state.
