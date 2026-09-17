# C1 design checkpoint — before product edits

## BUILD MATRIX
- backend HEAD/base: c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7
- ctxrepo HEAD: 9b4f55d34b78dfe051b3ab5ca1366cc2bab078ab
- importer HEAD: 093b6b01c29123361b043ddd0f36cd4c578cffe2
- mobile HEAD: a5933fd6de5616493de75f0db907098b149b955c
- candidate PR/head: none; unchanged local base; no commits authorized
- timestamp: 2026-09-17T18:43:54.364231+00:00

Full 130-line exact brief, complete 2021-line canonical AGENT_RULES, redirected R100 mandate and full 336-line 50-failures reference read. Canonical R24–78 mapping, R23/R76 LOC and any-SHA R124 govern. User requested Astra; inheritance requested, runtime identity not verified.

## Decision / R138 gate
Goal: persist server-issued correlation across setup without inventing import authority.
Root cause: pairing code is short-lived and current extension chooses its own intent; mobile has no non-secret durable owner lookup.
Options: exposing old row IDs would falsely bind historical sessions; new lifecycle table duplicates pairing ownership; SELECTED nullable unique UUID import_intent_id on existing ExtensionPairCode, populated only for new init calls. Existing restrictive RLS and FK cascade survive unchanged.
Five steps: question new lifecycle machinery; delete second auth/state store; simplify to single nullable ID and owner read; accelerate isolated tests; automate existing generator/checks only after slot approval.
Hyperscaler lens: use deny-by-default ownership and additive rollout, consistent with AWS safe continuous delivery cited by canonical R138 (https://aws.amazon.com/builders-library/going-faster-with-continuous-delivery/). Offline reference only, no fresh web calls permitted. Apple/Notion framing: simple resumable setup, honest state labels, no false Start/completion.
GOOD: stable correlation plus secure retrieval. BAD excluded: token replay via status, trusting client IDs, relabeling old runs, fabricated import progress. Rollback: abandon isolated candidate; after hypothetical deployment retain nullable column on code rollback, explicit down only before durable use or in disposable proof.

## Contract and lifecycle
- Init mints crypto.randomUUID server-side and saves it beside existing code/owner/platform; no request intent accepted. Init/redeem/status echo import_intent_id only when stored, never mint during reads/redeem of old rows.
- POST /api/extension/pair/session accepts UUID import_intent_id in body, requires existing bearer/coach-owner guards and global authenticated throttle. Query includes authenticated owner and active coach/owner relation. Unknown, foreign, legacy/unbound, deleted/demoted owners return identical not-found. Response includes setup status, server ID, chosen_platform; no code or tokens.
- Code TTL remains 120 seconds with existing clamp. Session is correlation retained for row lifetime (no new independent auth TTL); used_at means paired setup only. Code expiry cannot destroy paired lookup. Existing schema has no cleanup writer; C1 adds none. Do not delete bound rows solely by code TTL. Account hard-delete cascades. Indefinite row/code retention inherits finite million-code capacity; parent must govern retention/code recycling before activation at scale, never silently delete this seam.
- Reconnect with saved ID reads same session; fresh init is a new independent intent and invalidates prior unused code, not paired history. No list discovery; consumer must retain returned ID. Not import resume/Start.
- Preserve existing mint-before-conditional-claim behavior: mint failure changes neither used_at nor ID; concurrent redeem returns one token pair only; orphaned loser mint is inherited authority behavior. Already-used codes never replay tokens. Expiry/lockout claim predicates and constant-time comparison unchanged.
- Old nullable rows keep old response shapes and extension-minted runs remain legacy/unbound. New ID echo alone does not bind scout ingestion; no ingest/progress/reconstruct validation is added.

## Hard constraints / assumptions / gates
Explicit OWNS, no auth changes, no network/DB/commits/installs/subdelegation, private dependencies, Node20 sanitized env. Inputs never mutated. Recovery frozen and mobile read-only; parent integrates.
Target one coherent slice under actual all-code 400-net-line workflow AND >=2 test:src. If complete safety tests do not fit, checkpoint a split and do not claim ready/waive cap.
Planned red tests: stable ID all boundaries, expiry vs retrieval, owner/role denial, no credential leak, mint failure/concurrent redeems, legacy omission, request UUID validation, default-off and decorator wiring. Existing old tests retained. Focused baseline must wait for slot confirmation; no new tests executed yet.
Known inherited blockers from brief: 14 high/1 critical dependency audit, 21 lint warnings. No audit repeat or dependency fix authorized.
