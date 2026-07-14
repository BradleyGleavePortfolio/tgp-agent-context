# EXT PR #4 — LENS A (Correctness / Security / Data-Integrity) — LIVE ADVERSARIAL AUDIT

- **Repo:** BradleyGleavePortfolio/tgp-importer-extension
- **PR:** #4 — "feat(replay): site-agnostic blueprint contract + bounded state machine"
- **Audited head (verified):** `16a03c5c184713e9fb6e993cdcf3cb1be4b68e89` ✅ resolved via `git rev-parse`; matches `gh pr view` `headRefOid` and the task-mandated head.
- **Base:** `main` @ `a8563853758bc369b01d9f1f7e03a28db8a520ef` (squash-merge of PR #3)
- **Merge-base:** `a8563853758bc369b01d9f1f7e03a28db8a520ef` (branches cleanly off main; no divergence)
- **Prior LENS-A head:** `a75827d1` (FAIL, P1=3/P2=3/P3=2) — that head bundled engine + orchestration + CTA at **817** prod LOC with **red CI** and a false evidence block. **This head is a full re-scope**: pure inert contract + state machine only.
- **Lens:** A (security R24–R36, SSRF/exfil/origin, data-integrity, doctrine gates R14/R23/R74/R76/R100/R109/R138, product invariant)
- **Method:** full line-by-line read of both prod files + both spec files + decision doc; live CI check-runs; local re-run of all four gate scripts + `vitest`; empirical `node` bypass probing of the SSRF boundary and state machine (IP/IDN/octal/hex/decimal/IPv6/trailing-dot/backslash/control-char/prototype-key); deferral-cleanliness proof.

## YOUR JOB (R11)
Findings produced independently from evidence. The PR body's "honest counts" block was treated as a set of hypotheses — **and this time every count claim VERIFIED true** (unlike `a75827d1`). But the PR's headline security guarantee ("no step can redirect off-origin", "no loopback/localhost") was probed adversarially and **two bypasses were demonstrated**, plus a state-machine invariant violation.

---

## HEADLINE

**This is a clean, honest, correctly-scoped re-do of the counts/CI/doctrine dimension — every prior P1 is resolved and the deferred wiring findings are genuinely absent from the diff — BUT the security primitive this PR exists to ship is porous.** The `normalizeBlueprint` SSRF boundary (the fix demanded by the predecessor's P2-3) is now present and largely solid (scheme, IP-literal in every radix, IPv6, credentials, allowlist capability all enforced), yet:

1. **Root-relative template validation is bypassable via backslash / control chars** → a step template escapes `apiBase` to an arbitrary off-origin host under WHATWG URL join semantics. The PR body headlines this exact guarantee and ships a test for it — both are **falsified**. (P2, latent — engine/untrusted-feed not in this PR.)
2. **The loopback guard is bypassable via a trailing-dot FQDN** (`https://localhost./…`, `https://svc.localhost./…`). (P3, latent.)
3. **The "pure bounded state machine" returns a non-null value for inherited-property event/state names** (`__proto__`, `constructor`, `toString`, …), violating its own documented "anything not in the table returns null" invariant and the exhaustiveness the spec claims. (P3, latent — events are internal constants today.)

Counts (356 prod / 768 test / ratio 2.157 / cap 400), CI (green), gates (all four pass locally), char-hygiene (0 NUL/control, UTF-8, truthful line counts), identity, deferral, and the site-agnostic invariant are all **verified correct**. But CLEAN requires P0=P1=P2=P3=0, and three genuine findings remain.

**VERDICT: FAIL** — P0=0, P1=0, P2=1, P3=2.

---

## VERIFICATION OF PR-BODY CLAIMS (all confirmed TRUE at this head)

| PR body claim | Independent result at `16a03c5` | Verdict |
|---|---|---|
| `prod_added=356 prod_removed=0 cap=400` | numstat: blueprint.js 268 + state.js 88 = **356 added, 0 removed** | ✅ TRUE |
| `ratio=2.157 floor=2` | test_added 768 (502+266) / 356 = **2.157** | ✅ TRUE |
| `banned-token net OK` | `node scripts/check-banned.mjs` → exit 0 | ✅ TRUE |
| `flag discipline PAIRING_ENABLED=true` | `check-flag-discipline.mjs` → exit 0 | ✅ TRUE |
| `Test Files … passed, Tests … passed` | `vitest run` on both specs → **118 passed** | ✅ TRUE |
| all four source files UTF-8, 0 NUL/control, numstat truthful | `file` = UTF-8; `grep -P '\x00'`/control = 0; `wc -l` == numstat | ✅ TRUE |
| `background.js`/`popup/*` unmodified (deferral) | `git diff --name-only main HEAD` touches only docs/, shared/replay/{blueprint,state}.js, test/replay-*.spec.js, package-lock.json | ✅ TRUE |
| canonical 400 cap governs over repo-CI 600; no exception requested | `check-prod-loc.mjs` CAP=600 env-overridable; 356 ≤ 400 ≤ 600 → satisfies both; no `R86 EXCEPTION` block needed | ✅ TRUE |

**Live CI (exact head):** `gh api …/commits/16a03c5…/check-runs` → two `test` runs, both `conclusion: success`. The workflow runs tests + all four gates as required steps. **CI is GREEN.** (Contrast `a75827d1`: red at "Production LOC budget".)

**Decision doc truth:** `docs/DECISION_V03_AUTONOMOUS_CRAWL.md` now states "This PR (#4) — contract + lifecycle (356 prod LOC). blueprint.js (268) + state.js (88)" and enumerates the chained split (PR-C1a engine, PR-C1b wiring, PR-C2 inference), explicitly: "This PR ships no engine, no resolver, no orchestration, and no CTA … must not be attested as shipped." The predecessor's P1-3 false "lands within the LOC cap" claim is **resolved** (356 genuinely ≤ 400). ✅

---

## STATUS OF PRIOR (`a75827d1`) FINDINGS

| Prior ID | Prior sev | Status at `16a03c5` | Basis |
|---|---|---|---|
| P1-1 LOC cap breached / CI red | P1 | **RESOLVED** | 356 ≤ 400; CI green |
| P1-2 test:src < 2.0 | P1 | **RESOLVED** | ratio 2.157 ≥ 2.0 |
| P1-3 false gate evidence in body + doc | P1 | **RESOLVED** | all counts verified true; doc rewritten honestly |
| P2-1 truncated→"complete" | P2 | **DEFERRED (out of diff)** | lives in `engine.js`+`background.js`, not in this PR; scoped mandatory to PR-C1a/C1b in body |
| P2-2 no single-flight guard | P2 | **DEFERRED (out of diff)** | `background.js` untouched (verified); mandatory in PR-C1b |
| P2-3 normalizer accepts any scheme/host (SSRF) | P2 | **PARTIALLY FIXED → new P2/P3** | boundary now built; solid for scheme/IP/creds/allowlist, but **template backslash escape (P2-A, new)** and **`localhost.` trailing-dot (P3-A, new)** bypasses remain |
| P3-1 router gated by id only | P3 | **DEFERRED (out of diff)** | `background.js` untouched; mandatory in PR-C1b |
| P3-2 space-delimited dedupe key | P3 | **DEFERRED (out of diff)** | lives in `engine.js`; body commits to `JSON.stringify([entityType,sourceId])` in PR-C1a |

Deferral is **doctrine-clean**: `git diff --name-only main HEAD` proves `background.js`, `popup/*`, `manifest.json`, `content/*` are untouched, so the wiring findings cannot exist in this diff. The PR body scopes each as mandatory in its owning chained PR. No dead code is shipped (both modules are inert-by-construction; nothing imports them at runtime — revert-to-disable holds).

---

## NEW FINDINGS (this head)

### P2-A — Root-relative template validation is bypassable via `\` / control chars → off-origin escape (SSRF / origin-confinement; R24-class; R2/R109 truth-of-claim)

- **Where:** `shared/replay/blueprint.js:162` — `if (!step.template.startsWith("/") || step.template.startsWith("//") || step.template.includes("://"))`.
- **Stated contract (same file, lines 159-164 + PR body):** *"A template is a ROOT-RELATIVE path … Absolute or protocol-relative templates could redirect the crawl to another origin, escaping the apiBase confinement — refuse them at parse time"*; PR body: *"root-relative step templates only — absolute-URL / protocol-relative / scheme-embedding templates rejected, so no step can redirect off-origin."*
- **Refutation (empirical, `node`):** the validator does a naive string check, but every consumer joins the template onto `apiBase` with WHATWG URL semantics, under which `\` is an alias for `/` and TAB/LF/CR are stripped. Result:
  ```
  template "/\evil.test"        → ACCEPTED   → new URL(t,"https://api.test/base/") = https://evil.test/
  template "/\\evil.test/x"     → ACCEPTED   → https://evil.test/x
  template "/<TAB>/evil"        → ACCEPTED   → https://evil/
  ```
  `//evil.test`, `https://evil/x`, and `/redirect://evil` are correctly rejected — the hole is specifically **backslash** (WHATWG `\`→`/`, so `/\` becomes protocol-relative `//`) and **C0 controls** (tab/newline/CR stripped, collapsing `/…/` into `//`).
- **Impact:** an inferred blueprint (PR-C2 feeds `normalizeBlueprint` from **untrusted** passive capture, per this PR's own rationale) can carry `template:"/\attacker.tld/api"`, pass normalization, and later drive the credentialed replay crawl to an arbitrary external origin — the exact SSRF/exfil the boundary is built to prevent. The step's `:param` values are separately `encodeURIComponent`-safe, but the **host** escape happens before any param fill.
- **Reachability (honest, same posture as predecessor P2-3):** **NOT reachable in this inert PR** — no engine resolves templates here and `resolveBlueprint`/untrusted feed is PR-C1a/C2. But the predecessor rated the identical boundary gap P2 precisely because "the security boundary is being built in *this* PR" for the future untrusted feed; consistency demands the same severity for a **live, tested-as-closed** bypass of that boundary. A test (`test/replay-blueprint.spec.js:276`) asserts `//host` is rejected but never probes `/\`, giving false confidence.
- **Required to clear (cheap, do it in the boundary now):** reject templates containing `\` or any C0 control char, AND/OR canonicalize: `const u = new URL(step.template, "https://blueprint.invalid/"); assert u.origin === "https://blueprint.invalid" && u.href.startsWith("https://blueprint.invalid/")` (i.e. resolve against a sentinel origin and require it stays on that origin + path-only). Add `/\evil`, `/\\evil`, and tab/newline templates to the rejection test.

### P3-A — Loopback/localhost host guard bypassable via trailing-dot FQDN (SSRF; R24-class)

- **Where:** `shared/replay/blueprint.js:47-56` `isForbiddenHost` — `host === "localhost" || host.endsWith(".localhost")`.
- **Refutation (empirical):**
  ```
  https://localhost./b        → ACCEPTED  (origin https://localhost.)
  https://svc.localhost./b    → ACCEPTED  ( "svc.localhost." !== "localhost", and endsWith(".localhost") is false )
  https://LOCALHOST/b         → REJECTED  (case handled)
  https://127.0.0.1./b        → REJECTED  (IPv4 parser strips the trailing dot → "127.0.0.1", caught)
  ```
  A trailing-dot hostname is a fully-qualified name that resolves to the same target; most resolvers treat `localhost.` as `localhost`. IP literals are safe here (the WHATWG IPv4 parser normalizes the trailing dot away, so the regex still matches), so this bypass is **loopback-name-only** — lower blast radius than P2-A (no arbitrary origin, no cloud-metadata: `169.254.169.254` is an IP literal and stays blocked).
- **Impact:** under the same future untrusted-feed model, a blueprint with `apiBase:"https://localhost.:PORT/…"` reaches a service on the coach's own machine with credentials, defeating the stated "no loopback/localhost" guarantee.
- **Reachability:** latent (as P2-A).
- **Required to clear:** strip a single trailing `.` from `hostname` before the localhost comparison (`host.replace(/\.$/, "")`), or reject any hostname ending in `.`. Add a `localhost.` / `svc.localhost.` rejection test.

### P3-B — State machine returns a non-null value for inherited-property event/state names (correctness; violates the module's own documented invariant)

- **Where:** `shared/replay/state.js:81-88` `transition` reads `TABLE[state]` then `row[event]` on **plain object literals**, returning `next === undefined ? null : next`.
- **Stated contract:** lines 44-45 *"Any (state,event) not listed is illegal and returns null, so an out-of-order event can never silently corrupt the surface"*; the spec (`test/replay-state.spec.js:140`) claims to prove "every (state,event) pair NOT in LEGAL returns null" — but it only iterates `Object.values(EVENT)`/`Object.values(STATE)`, so it never tests inherited keys.
- **Refutation (empirical):**
  ```
  transition("ready","__proto__")     → Object.prototype   (NOT null)
  transition("ready","constructor")   → Object (fn)        (NOT null)
  transition("ready","toString")      → fn                 (NOT null)
  transition("ready","hasOwnProperty")→ fn                 (NOT null)
  transition("__proto__","toString")  → fn                 (NOT null)
  ```
  For any inherited `Object.prototype` property name as `event` (or `state`), `row[event]` resolves to a truthy inherited member, so `transition` returns it instead of `null`. A caller applying the documented contract ("non-null ⇒ legal next state") would move the surface to a garbage value — exactly the "silent corruption" the machine promises to prevent.
- **Impact & reachability:** **latent** — today events are the frozen `EVENT` constants (internal), so unreachable with current callers. But the module is exported as a reusable "shared source of truth" that PR-C1b's background/popup dispatch will drive; if any dispatch derives the event from a message action string (`transition(state, message.event)`), it is directly reachable. Borderline P3/P4 given current internal-only callers, scored **P3** because it (a) falsifies an explicit, documented, security-relevant invariant and (b) sits in a foundational safety primitive whose entire justification is out-of-order-event containment.
- **Required to clear:** build `TABLE` with `Object.create(null)` (and `Object.freeze` each row), or guard with `Object.hasOwn(row, event)` / `Object.hasOwn(TABLE, state)`. Extend the "returns null" test with `"__proto__"`, `"constructor"`, `"toString"`, `"hasOwnProperty"`.

---

## WHAT IS CORRECT (verified, no finding)

- **Site-agnostic / data-only invariant upheld.** Core (`shared/replay/*`) contains **zero** hardcoded competitor endpoint map or hostname; the only "truecoach" token is a comment example ("`platform: "truecoach"` // provenance label only"). No `https://` literal constant in code (only doc-comment examples). The allowlist is an **injected** caller capability (`opts.allowedOrigins`), never a static competitor map. ✅
- **Scheme confinement solid.** `https:` required; `http/ftp/ws/gopher/file/data` rejected (parse-time, before any work). ✅
- **IP-literal confinement solid in every radix.** Empirically rejected: dotted-quad, `0x7f000001` (hex), `2130706433` (decimal), `0177.0.0.1` (octal), `127.1` (short), `0`, `①②⑦.0.0.1` (IDN digits → 127.0.0.1), all IPv6 incl. `[::1]`, `[::ffff:127.0.0.1]`, `[fe80::1]` (bracket check), public literal `8.8.8.8`. WHATWG host parser normalizes all radices to dotted-quad, then the regex catches them. ✅
- **IDN/homoglyph localhost — caught.** `ⓛocalhost` and fullwidth `ｌｏｃａｌｈｏｓｔ` map through IDNA to `localhost` and are rejected; the lowercase compare handles `LOCALHOST`. (Trailing-dot variant is the sole gap — P3-A.) ✅
- **Credential confinement.** `user:pass@host` and `user@host` rejected via `url.username/password`. ✅
- **Allowlist capability correct.** Origin (scheme+host+port) equality; trailing-slash-insensitive (normalized via `new URL().origin`); differing port = different origin (rejected); subdomain ≠ parent; empty allowlist rejects all; malformed/scheme-only entry throws; absent allowlist → intrinsic checks still apply; intrinsic https/host checks still run even when an allowlist is supplied. ✅
- **Method safety.** `SAFE_METHODS={GET,HEAD}` enforced at parse time, case-normalized; unsafe methods throw. ✅
- **forEach integrity + ordering.** Every `forEach` must reference a set produced by an **earlier** `collectAs`; later/ghost references throw; multi-level chains allowed. ✅
- **Structural validation fail-closed.** Non-object bp/step/pagination/budgets, empty/missing platform/apiBase/steps, duplicate step id, `:param` w/o forEach, non-absolute apiBase — all throw. Budgets clamp non-int/non-positive to frozen defaults. Input blueprint is not mutated (deep-copy of arrays; return shape pinned). ✅
- **State machine (aside from P3-B).** Pure transition table; 15 legal edges, 41 illegal pairs return null (over the constant surface); terminal states re-arm only via `RESET`; `STATE`/`EVENT` frozen; no self-loops; no terminal→terminal; namespaces disjoint. ✅
- **readPath/extractItems** read-only (no assignment → no prototype pollution); non-arrays yield `[]`; primitives/nulls yield `undefined`; a shape-shifted page contributes nothing, never throws. ✅
- **Char hygiene / honest counts / CI / identity / deferral** — all verified true (see claims table). Author == committer == `Bradley Gleave <bradley@bradleytgpcoaching.com>`; banned-token gate (which also checks R3 identity) green. ✅

---

## R100 CHECKLIST (Lens A scope; N/A = pure client-side data module, no server/DB/RLS/network in this PR)

| Rule | Status | Evidence |
|------|--------|----------|
| R100.1 Zero secrets | PASS | no secrets/high-entropy in diff |
| R100.4 No unsanitized output | N/A | no DOM in this PR |
| R100.8 Runtime input validation | PASS | `normalizeBlueprint`/`normalizeStep`/`normalizePagination`/`normalizeBudgets` guard every field, fail-closed |
| R100.12 No internal info in errors | PASS | error messages carry only the offending value/field |
| R100.13 HTTPS enforced | PASS (with caveats) | `https:` required on apiBase; **template `\`/control escape (P2-A)** and **`localhost.` (P3-A)** are boundary gaps |
| R100.20 No circular imports | PASS | state.js standalone; blueprint.js standalone |
| R100.29/52/90 Idempotency | N/A | no dedupe in this PR (deferred to engine) |
| R100.36 No swallowed errors | PASS | normalizer throws; extractItems returns `[]` by explicit design (documented) |
| R100.42 No impossible-edge defenses | PASS | guards map to real untrusted-blueprint inputs |
| R100.43 Zero dead code | PASS | both modules inert-by-construction, fully exercised by specs; LEARNING/CONFIRMING pre-wired for PR-C2 and tested |
| R100.A1 Test:src ≥ 2.0 | PASS | 768/356 = 2.157 |
| R100.A2 Banned-cast net = 0 | PASS | gate green |
| R100.A3 ≤ 400 prod LOC | PASS | 356 |
| R100.A4 CI pass-rate | PASS | both `test` runs green |
| R100.A5 Verdict line present | PASS | see final line |

## Doctrine notes
- **R14/R102:** head CI is **green**; the counts/gate dimension is merge-eligible. The three security/correctness findings are the only blockers to a CLEAN verdict.
- **R138 (builder-stage):** PR is a builder PR ("must not be attested as shipped"); a truthful four-question Decision Record lives in `docs/DECISION_V03_AUTONOMOUS_CRAWL.md`. Acceptable now; a Decision Gate block should accompany any merge authorization.
- **R20:** recommend tracking issues for (a) reconciling `check-prod-loc.mjs` CAP default 600 → doctrine 400 (currently satisfied only because 356 ≤ both), and (b) landing the P2-A/P3-A template+host hardening in this boundary before PR-C2 opens the untrusted feed.

---

## FIXER PUNCH LIST (clear ALL before re-audit — R14 "P0–P3 in any regard")
1. **P2-A** Reject `\`/C0-control templates and/or canonicalize `new URL(template, sentinel-origin)` requiring it stays on the sentinel origin + path-only; add `/\evil`, `/\\evil`, tab/newline rejection tests.
2. **P3-A** Strip/reject a trailing `.` on `hostname` before the localhost check; add `localhost.` / `svc.localhost.` rejection tests.
3. **P3-B** Use `Object.create(null)` tables (+ freeze rows) or `Object.hasOwn` guards in `transition`; extend the "returns null" test with `__proto__`/`constructor`/`toString`/`hasOwnProperty`.

---

VERDICT: FAIL — P0=0, P1=0, P2=1, P3=2 (not CLEAN; three latent security/correctness findings in the SSRF boundary and state machine. Counts, CI, gates, docs, identity, deferral, and site-agnostic invariant all verified true.)
