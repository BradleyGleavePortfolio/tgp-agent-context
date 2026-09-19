# Dependency checkpoint08 — full inventory and narrow harness proposal

## Completed run, unchanged product

The single allocated full suite completed exit1 in508.343s before the outer630-second tool timeout returned. Results:13 failed suites,518 passed,12 skipped;95 failed tests,7762 passed,159 skipped,5todo,8021total;6 snapshots passed. Every failed suite message contains the blanket socket denial, and all13 failing fixtures use a same-process ephemeral HTTP server. This is a harness-induced failure inventory, not a clean suite and not evidence of a dependency regression. No rerun started. [Run](full-suite.log), [exact results](full-suite-results.json), [classified inventory](full-suite-failure-inventory.json), [ledger](command-ledger.jsonl).

Frozen product tree remains `7e959c034fa8134f630a77784e733665d51352d5`; no source/index/test/manifest/lock change.

## Exact fixture endpoints observed

All13 files call `app.listen(0)` and send `node:http`/`http.request` to literal **127.0.0.1**, using the **actual dynamic port returned by app.getHttpServer().address().port**. They do not request a fixed known port. The original guard/log never recorded those assigned numeric ports; they cannot honestly be reconstructed from this completed run. [Exact source-line inventory](full-suite-failure-inventory.json).

| Fixture | listen(0) lines | Request host/port source | Failed tests |
|---|---:|---|---:|
| test/payouts-v2.spec.ts |793,898|127.0.0.1; server.address().port, lines61–68|6|
| test/talent-connect-webhook.spec.ts |282|127.0.0.1; server.address().port, lines37–44|5|
| test/community/ack/community-v2-2-ack.e2e.spec.ts |154,354|127.0.0.1; address().port, lines156–157,356–357|16|
| test/common/feature-flag-not-found.bootstrap.spec.ts |166|127.0.0.1; address().port, lines168–169|20|
| test/dunning-v2-lockout-guard.e2e.spec.ts |168|127.0.0.1; address().port, line170|10|
| test/wearables/wearables-module.integration.spec.ts |204|127.0.0.1; address().port, lines136–139|2|
| test/community/community-v1-6-feature-flag.e2e.spec.ts |125|127.0.0.1; address().port, lines127–128|7|
| test/scout/scout-ingest.validation.integration.spec.ts |144|127.0.0.1; address().port, lines146–147|5|
| src/talent-marketplace/__tests__/apply.controller.http.spec.ts |82|127.0.0.1; address().port, lines84–85|2|
| src/talent-marketplace/__tests__/admin-applications.controller.http.spec.ts |72|127.0.0.1; address().port, lines74–75|11|
| test/coach-empty-states.e2e.spec.ts |102|127.0.0.1; address().port, lines104–105|3|
| src/talent-marketplace/__tests__/admin-moderation.controller.http.spec.ts |72|127.0.0.1; address().port, lines74–75|6|
| src/talent-marketplace/__tests__/public-listing.controller.http.spec.ts |58|127.0.0.1; address().port, lines60–61|2|

## Proposed minimal harness-only correction — not yet implemented or executed

1. Keep the original blanket guard immutable as failed-run evidence. Create a new evidence-only preload, without product/test/config edits.
2. Intercept server listen. Admit **only plain HTTP server instances created in the same test process**, requested port0, no Unix path/FD/handle or inherited descriptor. Rebind even unspecified/default hosts to literal127.0.0.1; reject explicit nonloopback host, TLS/raw TCP listeners and fixed ports.
3. On the actual `listening` event, register the returned127.0.0.1+ephemeral port in private process-local state. Registration must precede the caller's listen callback. Do not scan the machine's open ports or use a broad localhost allowlist; existing DB/services never become registered.
4. Intercept every net.Socket.connect call shape before invoking the original implementation. Admit only literal127.0.0.1 plus a currently registered HTTP fixture port. Reject localhost/DNS aliases, IPv6, other127/8, Unix paths, external hosts, preexisting loopback listeners and all nonregistered ports. Explicitly reject database/cache well-known ports even if ever selected by the OS for a fixture.
5. Revoke admission at server.close invocation and on close/error; remove failed registrations. Child processes start with an empty registry; they cannot borrow a parent's allowed port. No changes to global fetch denial, Prisma/customer/DB settings or product guards.
6. Record only event type, process id, literal host and assigned port to an evidence-only JSONL file. Never log URLs, queries, headers, bodies or environment secrets. This supplies exact runtime ports on the corrected run.

This is a convenience isolation harness for cooperative tests, **not an OS security sandbox or defense against malicious test code**; the same limitation applies to the existing preload. No broad removal of network denial proposed.

## Required safety checks before any corrected product tests

Under parent allocation, execute a tiny standalone evidence-only harness test that verifies:

- A real owned ephemeral HTTP listener is rebound to127.0.0.1 and its own request completes.
- Every supported connect argument form reaches only the registered listener.
- After close/revocation the same destination fails before native connect.
- Unregistered127.0.0.1, localhost, IPv6, Unix path, public/example.invalid hosts, every listed DB/cache port, and child-process borrowing all reject synchronously, without actual outgoing connection.
- Raw TCP/TLS/fixed-port/nonloopback listeners reject; fetch remains blocked.
- Allow/deny logs contain only nonsecret endpoint metadata.

Then parent may allocate **only the13 failed suites first**. A second full suite requires a separate explicit grant after those controls and13suite correction pass. Nothing in this proposal retroactively converts the original full run to green.

Remaining audit/lock/graph/SBOM checks may finish under existing allocation before safe checkpoint; heavy/network/install slots will be explicitly released for the IaC builder then. No test run started after the inventory.
