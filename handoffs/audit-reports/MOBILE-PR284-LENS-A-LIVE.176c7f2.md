# MOBILE-PR284 — Lens A Live Re-Audit (R3)

- **PR:** #284 — `feat(importer): default-off coach Import Data entry (v0.3 site-agnostic slice)`
- **Repo:** BradleyGleavePortfolio/growth-project-mobile
- **Head SHA (verified, exact):** `176c7f209cd7a8e122129369ca229e2e7f13f9b7` (`176c7f2`) — matches request; audited at this checkout.
- **Lens:** A · **Mode:** read-only, independent, full P0–P3 sweep (R72) · **Repo modified:** no · **Merged:** no
- **Verdict:** **NOT_CLEAN** — P0: 0 · P1: 0 · P2: 0 · **P3: 1**

SHA integrity confirmed: `gh pr view 284 headRefOid` == `git rev-parse HEAD` == requested `176c7f2`. No mismatch. CI run `29323405136` (`Typecheck, lint, test`) `headSha` == `176c7f2`, conclusion **success**.

---

## Verdict rationale

The R2 finding **MA-01** (dual URL source-of-truth desync on Custom re-entry) is **RESOLVED** on this head, with a genuine re-entry regression test. Prior R2 observation OBS-3 (stale contract-test wording / `platformSelected` in the `known` set) is also **RESOLVED**.

One **new P3** is raised (**MA-02**): the decision record, the shipped type-file comments, and the contract-test titles state that the backend types the pairing/terminal `status` fields as **open strings** "not constrained to an enum," and present this as *verified against the frozen OpenAPI slice*. The cited contract and the backend DTOs actually constrain **both** fields to **closed enums**. The runtime behaviour (defensive decode → `'unknown'`) is safe and correct regardless, so this is a documentation/comment **truthfulness** defect, not a functional or security defect — but under the repo's decacorn truthfulness bar it blocks a CLEAN verdict.

---

## Findings

### MA-02 — P3 — Decision record + type comments misstate the backend contract as an "open string" when the cited OpenAPI slice constrains it to a closed enum

**Where (mobile):**
- `docs/importer/MOBILE_IMPORT_DECISION.md:86-89` — "The backend types this field as an **open string**; `pending | paired | expired` are the known values."
- `docs/importer/MOBILE_IMPORT_DECISION.md:92-94` — terminal `status` "is likewise an **open string** with known values `success | partial | failed`".
- `docs/importer/MOBILE_IMPORT_DECISION.md:98-99` — "Because the backend does **not** constrain these fields to an enum, mobile does not blind-cast…".
- `docs/importer/MOBILE_IMPORT_DECISION.md:79-82` — the doc claims all of the above is "Verified against `growth-project-backend/docs/contracts/importer-openapi.json`".
- `src/types/extensionImport.ts:26-33` — same claim in shipped source comments ("The backend types `status` / `terminal_status` as OPEN strings").
- `src/types/__tests__/extensionImport.contract.test.ts:40,50` — test titles frame the known values as "the decodable … subset of **the open string**".

**Contract reality (growth-project-backend, verified on disk):**
- OpenAPI `docs/contracts/importer-openapi.json`:
  - `components.schemas.PairStatusResult.properties.status` → `{ "type": "string", "enum": ["pending","paired","expired"] }`.
  - `components.schemas.ScoutCompleteDto.properties.terminal_status` → `{ "type": "string", "enum": ["success","partial","failed"] }`.
- Backend DTOs:
  - `src/extension-pair/extension-pair.dto.ts:53-54,78,81` — `PAIR_STATUSES = [...] as const`; `status!: PairStatus` (closed union); `@ApiProperty({ enum: PAIR_STATUSES })`.
  - `src/scout/scout.dto.ts:109-110,131-133` — `SCOUT_TERMINAL_STATUSES = [...] as const`; `@IsIn(SCOUT_TERMINAL_STATUSES)`; `terminal_status!: ScoutTerminalStatus` (closed union, request-validated).

Both fields are constrained to a closed enum at every layer (TS union, class-validator `@IsIn`, OpenAPI `enum`). The doc's central premise — "the backend does not constrain these fields to an enum" — is inverted from the contract it names as its evidence.

**Impact:** none at runtime. Decoding a closed enum defensively (unknown → `'unknown'`, never `paired`/`success`/`complete`) is still safe and arguably desirable for version-skew robustness. The defect is purely that a merged decision record and shipped comments assert a false, "verified" statement about the frozen contract, and the contract-test titles perpetuate it.

**Fix (truthful reframing, no code-behaviour change required):** state the honest rationale — "the backend constrains both fields to a closed enum (`PAIR_STATUSES` / `SCOUT_TERMINAL_STATUSES`); mobile still decodes defensively rather than blind-casting, so a future/renamed/garbled value survives as `'unknown'` instead of being asserted into the union." Update `MOBILE_IMPORT_DECISION.md`, the `extensionImport.ts` docstring, and the two contract-test titles accordingly.

---

## Prior findings — status on this head

| ID | Prior | Status on 176c7f2 |
|----|-------|-------------------|
| MA-01 (R2 P3) | Dual URL source-of-truth desync on Custom re-entry | **RESOLVED** — `customUrl` `useState` removed; input `value={state.url}`, gate/`accessibilityState`/open all read `state.valid`; `selectPlatform('custom')` resets `{url:'', valid:false}`; new regression test asserts field/validity/hint all reset on re-entry (`ImportDataScreen.test.tsx:404-417`). |
| OBS-3 (R2) | Stale contract-test wording; `platformSelected` in `known` set | **RESOLVED** — `platformSelected` removed from the `known` set (`extensionImport.contract.test.ts:137`); titles reworded. (New residue folded into MA-02.) |
| LB-01 (P0 CI red, `fontWeight:'700'`) | | **RESOLVED** — title weight `'600'`; CI green on exact head. |
| LB-02/03 (P1 LOC/ratio) | | **RESOLVED** on SLOC basis (see below). |
| LB-04 (P2 mapped-IPv6 SSRF bypass) | | **RESOLVED** — semantic v6 parser; mapped/compat range-checked + tests. |
| LB-05 (fe80 partial) | | **RESOLVED** — full `fe80::/10` (0xfe80–0xfebf) + tests. |
| LB-06 (over-block fc/fd/fe public) | | **RESOLVED** — v6 checks gated to bracketed literals; public DNS tests. |
| LB-07/08/09 (doc/phase/enum drift) | | **RESOLVED**, except the contract-accuracy residue now escalated as **MA-02**. |

---

## LOC / ratio (task gate: prod ≤ 400, ratio ≥ 2)

Measured against baseline `main` (`09b6cac`), purely additive diff (0 deletions vs main).

- **Prod added SLOC (non-blank, non-comment):** **394 ≤ 400** ✓ (margin 6).
- **Test added SLOC (non-blank, non-comment):** **886**.
- **test:src ratio (SLOC basis):** **886 / 394 = 2.25 ≥ 2.0** ✓.
- Raw `--numstat` (for reference): prod 524 / test 1047 → ratio 1.998 (bordering 2.0 on the raw basis; the doctrine review-time basis is non-blank/non-comment SLOC, which is compliant with margin). A follow-up adding prod code MUST recount — the prod SLOC margin is thin (6 lines).

---

## Verified green (Lens A full sweep)

- **URL parser / SSRF guard (`safeImportLoginUrl.ts`):** https-only; rejects `http`/`javascript`/`data`/`file`/`ftp`, embedded credentials (full + username-only + password-only), hostless/scheme-relative/bare inputs. IPv4 canonicalised across dotted/decimal/hex/octal/shorthand and range-checked (0/8, 10/8, 127/8, 169.254/16, 172.16–31/12, 192.168/16); IPv6 expanded to 8 hextets incl. IPv4-mapped `::ffff:a.b.c.d` (dotted + hextet), IPv4-compatible `::a.b.c.d`, `fc00::/7`, full `fe80::/10`, `::`/`::1`; unparseable bracketed literal → reject (fail-closed). Bare DNS names never IPv6-classified, so `fdny.gov`/`fcbarcelona.com`/IDN hosts correctly allowed. Public borders (172.15/172.32/128/9/192.169) correctly allowed. No new bypass found.
- **Routing / kill switch:** `extensionImport` defaults `false` **unconditionally** (not `isDev`), reads `EXPO_PUBLIC_FF_EXTENSION_IMPORT`. Route (`CoachNavigator.tsx:429-431`) and Settings row (`SettingsScreen.tsx:355-374`) both gated by the same flag; static + isolated-module runtime flag-off tests are real (read source + re-require under mutated env). Coach-only surface; Day-1 `CoachPairing` untouched (asserted).
- **UI state / accessibility:** single `ImportFlowState` source of truth; header role; button roles + labels + hints; polite live region on status; labelled URL input; `accessibilityState.disabled` mirrors `state.valid`; hint shows only when `state.url.length>0 && !state.valid` — all test-backed.
- **Honest states / no fake progress:** rendered set = intro / customUrlEntry / openingLogin / awaitingExtension / failed. Deferred phases are type-level vocabulary for PR-M2 and are asserted NOT present in `SUPPORTED_IMPORT_PHASES`. `openLogin` re-validates via `safeImportLoginUrl` before any `Linking` call; `canOpenURL` gate before `openURL`; unsupported + throw both recover to a calm retryable `failed`.
- **Telemetry / contract:** events carry platform slug + coarse funnel step only; no URL / 6-digit code / token / password / secret attached (`events.ts:46-51`, screen `track` calls). Decoders map unknown/future/garbled → `'unknown'`, never `paired`/`success`/`complete` (tests exhaustive). NOTE: the *decoder behaviour* is contract-accurate; only the *prose describing the contract* is not (MA-02).
- **Hygiene:** 0 emoji, no control/zero-width/NBSP/BOM chars, no placeholder copy, no TODO/FIXME in added lines. No raw error codes to users (Rule 9): both failure paths surface plain-language copy.
- **R3 authorship:** all 7 branch commits (`4b07484..176c7f2`) authored **and** committed by Bradley Gleave.
- **Full-suite standard:** CI job `Typecheck, lint, test` runs `npm test` (full jest) and is green on the exact head; local run N/A (no `node_modules` in audit checkout) — CI on the exact SHA is authoritative.

---

## Re-audit gate for CLEAN

1. Fix **MA-02** — reframe the "open string / not constrained to an enum" claim in `MOBILE_IMPORT_DECISION.md`, `src/types/extensionImport.ts`, and the two `extensionImport.contract.test.ts` titles to match the frozen contract (both fields are closed enums; mobile decodes defensively anyway). No runtime code change required.

*Artifacts:* `/home/user/workspace/tgp-agent-context/audits/MOBILE-PR284-LENS-A-LIVE.176c7f2.md`, `/home/user/workspace/mobile284_a_r3.json`. Read-only; repo not modified, PR not merged.
