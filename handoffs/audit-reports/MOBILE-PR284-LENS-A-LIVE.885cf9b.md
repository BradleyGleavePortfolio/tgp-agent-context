# MOBILE-PR284 — Lens A Live Re-Audit (R4, final)

- **PR:** #284 — `feat(importer): default-off coach Import Data entry (v0.3 site-agnostic slice)`
- **Repo:** BradleyGleavePortfolio/growth-project-mobile
- **Head SHA (verified, exact):** `885cf9bb4cf834df8c43878e0d54f71d8243d0ba` (`885cf9b`) — matches request; audited at this checkout.
- **Lens:** A · **Mode:** read-only, independent, full P0–P3 sweep · **Repo modified:** no · **Merged:** no
- **Verdict:** **CLEAN** — P0: 0 · P1: 0 · P2: 0 · P3: 0

SHA integrity confirmed: `gh pr view 284 --json headRefOid` == `git rev-parse HEAD` == requested `885cf9b`. No mismatch. All four checks on the exact head SHA are green: `Typecheck, lint, test` (full jest), `CodeQL`, `Analyze (actions)`, `Analyze (javascript-typescript)` — each `head_sha == 885cf9b`, conclusion **success**.

---

## Verdict rationale

The single open finding from R3 — **MA-02** (decision record, type-file comments, and two contract-test titles falsely framed the backend `status` / `terminal_status` fields as "open strings … not constrained to an enum," citing the frozen OpenAPI slice as evidence, when the contract actually constrains both to closed enums) — is **RESOLVED** on this head. The `885cf9b` commit reframes all three surfaces truthfully, and its only production-file change is comment text (zero non-comment code lines changed), so the entire R3 functional/security sweep carries forward unchanged. Independent re-verification of every prior finding, the runtime decoder, URL/address semantics, state source, flags/nav/Linking/accessibility/telemetry/contracts, doc/body truthfulness, LOC/ratio gates, and full CI found **no new defect at any severity**.

---

## MA-02 — RESOLVED (was R3 P3)

**Fix verified on this head:**
- `docs/importer/MOBILE_IMPORT_DECISION.md:83-108` — now states `pair/status` is a **closed enum** `pending|paired|expired` (OpenAPI `enum` + DTO `PAIR_STATUSES` union) and terminal `status` a **closed enum** `success|partial|failed` (OpenAPI `enum` + `SCOUT_TERMINAL_STATUSES` + `@IsIn`); the rationale paragraph now reads "Although the backend constrains both fields to a closed enum, mobile still does not blind-cast … forward-compatible version-skew defense, not a claim that the contract is open." The inverted "does not constrain … to an enum" sentence is gone.
- `src/types/extensionImport.ts:26-36` — docstring now: "The backend constrains `status` / `terminal_status` to CLOSED enums at every layer … Mobile still … decodes defensively … forward-compatible version-skew defense, not a claim that the published contract is open."
- `src/types/__tests__/extensionImport.contract.test.ts:42,52` — titles reworded to "pair status union mirrors the backend closed enum (pending/paired/expired)" and "terminal status union mirrors the backend closed enum (success/partial/failed)." Two new assertions (`:91-110`) prove `decodePairStatus` / `decodeTerminalStatus` are **total** (every output ∈ {members, `'unknown'`}) and **idempotent** (re-decoding never re-promotes `'unknown'` into a lifecycle member).

**Contract reality re-verified on disk (growth-project-backend):**
- `docs/contracts/importer-openapi.json` — `PairStatusResult.status` → `enum: [pending,paired,expired]`; `ScoutCompleteDto.terminal_status` → `enum: [success,partial,failed]`.
- `src/extension-pair/extension-pair.dto.ts:53-54,78` — `PAIR_STATUSES = [...] as const`; `PairStatusResult.status: PairStatus`; `@ApiProperty({ enum: PAIR_STATUSES })`.
- `src/scout/scout.dto.ts:109-110,129-132` — `SCOUT_TERMINAL_STATUSES = [...] as const`; `@ApiProperty({ enum })`; `@IsIn(SCOUT_TERMINAL_STATUSES)`; `terminal_status: ScoutTerminalStatus`.

The revised prose matches the contract at every layer. The runtime decoder (`unknown → 'unknown'`, never `paired`/`success`/`complete`) is unchanged and remains correct.

**Observation (non-blocking, not a P0–P3 finding):** the `extensionImport.ts:28` parenthetical lists `class-validator @IsIn` among the layers for *both* fields; `@IsIn` in fact guards only the inbound `terminal_status` request DTO — the pair `status` is an outbound result carrying `@ApiProperty({ enum })` + union type, no `@IsIn`. The decision record (authoritative) is field-precise and correct; the source comment is a compressed collective enumeration of the enforcement toolkit that genuinely exists across the boundary, the core "closed enum" claim is true for both fields, and mobile behaviour is identical regardless. No material falsehood, no inversion, no functional/security impact — recorded for transparency only, does not block CLEAN.

---

## Prior findings — status on this head

| ID | Prior | Status on 885cf9b |
|----|-------|-------------------|
| MA-02 (R3 P3) | Doc/comments/test-titles frame closed enum as "open string, not constrained" | **RESOLVED** — all three surfaces reframed to closed-enum + defensive-decode; totality/idempotency tests added; contract re-verified on disk. |
| MA-01 (R2 P3) | Dual URL source-of-truth desync on Custom re-entry | **RESOLVED** — single `ImportFlowState.url`; `selectPlatform('custom')` resets `{url:'',valid:false}`; re-entry regression test present. |
| OBS-3 (R2) | Stale contract-test wording; `platformSelected` in `known` set | **RESOLVED**. |
| LB-01 (P0 CI red, `fontWeight:'700'`) | | **RESOLVED** — title weight `'600'` (`ImportDataScreen.tsx:190`); CI green. |
| LB-02/03 (P1 LOC/ratio) | | **RESOLVED** — see gates below. |
| LB-04 (P2 mapped-IPv6 SSRF bypass) | | **RESOLVED** — semantic v6 parser; mapped/compat range-checked. |
| LB-05 (fe80 partial) | | **RESOLVED** — full `fe80::/10`. |
| LB-06 (over-block public fc/fd/fe) | | **RESOLVED** — v6 checks gated to bracketed literals; public DNS allowed. |
| LB-07/08/09 (doc/phase/enum drift) | | **RESOLVED** (contract residue closed via MA-02). |

---

## LOC / ratio (task gate: prod ≤ 400, canonical + raw ratio ≥ 2)

Measured against baseline `main` (`09b6cac`); purely additive (0 deletions vs main).

- **Prod added SLOC (non-blank, non-comment):** **394 ≤ 400** ✓ (margin 6 — unchanged from R3; `885cf9b` altered only comments/tests/docs).
- **Test added SLOC (non-blank, non-comment):** **904**.
- **Canonical test:src ratio (SLOC):** **904 / 394 = 2.29 ≥ 2.0** ✓.
- **Raw `--numstat` ratio:** test 1069 / prod 526 = **2.03 ≥ 2.0** ✓.
- Both bases satisfy ratio ≥ 2. Prod margin remains thin (6 SLOC) — any follow-up adding prod code MUST recount.

---

## Verified green (Lens A full sweep)

- **Safe runtime unknown decoder:** `decodePairStatus` / `decodeTerminalStatus` narrow via literal `===` control-flow (no `as` cast); recognised → member, everything else → `'unknown'`; proven total + idempotent by new tests. Never coerces to `paired`/`success`/`complete`.
- **URL / address semantics (`safeImportLoginUrl.ts`, unchanged):** https-only; rejects embedded credentials (user/pass), non-https schemes, hostless input. IPv4 canonicalised across dotted/decimal/hex/octal/shorthand → 32-bit + range-checked (0/8,10/8,127/8,169.254/16,172.16-31/12,192.168/16). IPv6 expanded to 8 hextets incl. IPv4-mapped `::ffff:a.b.c.d`, IPv4-compat `::a.b.c.d`, `fc00::/7`, full `fe80::/10`, `::`/`::1`; unparseable bracketed literal → fail-closed reject. Bare DNS never v6-classified → `fdny.gov`/`fcbarcelona.com` allowed; public borders (172.15/172.32/128/192.169) allowed. Parse independent of URL normalisation → RN/Hermes & Node classify identically. No new bypass found.
- **State source:** one `ImportFlowState` discriminated union; Custom URL lives solely in `customUrlEntry.url`; input `value`, open-button `disabled`/`accessibilityState`, and hint all read `state.valid` / `state.url`; leaving+re-entering Custom resets field+validity+hint together.
- **Flags / kill switch:** `extensionImport` defaults `false` **unconditionally** (`featureFlags.ts:374`, not `isDev`); reads `EXPO_PUBLIC_FF_EXTENSION_IMPORT`. Route (`CoachNavigator.tsx:429-430`) and Settings row (`SettingsScreen.tsx:357-365`) gated by the same flag — OFF removes both; no orphan route, no network path.
- **Nav / Linking:** `openLogin` re-validates via `safeImportLoginUrl` before any `Linking` call; `canOpenURL` gate precedes `openURL`; unsupported + throw both recover to calm retryable `failed`. Day-1 `CoachPairing` untouched.
- **Accessibility:** header role; per-platform button roles + labels + hints; `accessibilityLiveRegion="polite"` on status; labelled custom URL input; `accessibilityState.disabled` mirrors validity.
- **Telemetry / contracts:** events (`events.ts:48-51`) carry platform slug + coarse funnel step / `reason` only — no URL, 6-digit code, token, password, or PII. Platform catalog is a hardcoded https allowlist; Custom `loginUrl:null`. Mobile-callable vs extension-only boundary matches backend; no faked progress/completion endpoint.
- **Truthful docs / PR body:** decision record and PR body now describe closed-enum contract, deferred phases as type-only vocabulary, and the earlier targeted-run retraction honestly. `SUPPORTED_IMPORT_PHASES` = intro/customUrlEntry/openingLogin/awaitingExtension/failed; deferred phases asserted absent.
- **Hygiene:** no emoji, control/zero-width/NBSP/BOM chars, placeholder copy, or TODO/FIXME in added lines; no raw error codes surfaced to users.
- **Authorship (R4):** all 8 branch commits (`4b07484..885cf9b`) authored **and** committed by Bradley Gleave.
- **Full-suite standard:** CI `Typecheck, lint, test` runs full jest and is green on the exact head; per PR body 292 suites / 3468 tests. Local run N/A (no `node_modules` in audit checkout) — CI on the exact SHA is authoritative.

---

## Conclusion

Zero P0–P3 findings at head `885cf9b`. All prior findings resolved; MA-02 fix is truthful and contract-accurate; no new defect. **Verdict: CLEAN.** Read-only: repo not modified, PR not merged.

*Artifacts:* this report + `/home/user/workspace/mobile284_a_r4.json`.
