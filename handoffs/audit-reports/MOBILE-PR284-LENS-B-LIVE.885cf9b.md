# MOBILE-PR284 — Lens B Independent Live Audit (R4)

- **PR:** #284 — `feat(importer): default-off coach Import Data entry (v0.3 site-agnostic slice)`
- **Repo:** BradleyGleavePortfolio/growth-project-mobile
- **Head (exact):** `885cf9bb4cf834df8c43878e0d54f71d8243d0ba` (`885cf9b`)
- **Base:** `main` · **Merge-base:** `09b6cac`
- **Prior audited head:** `176c7f2` (Lens B R3 = CLEAN)
- **Lens:** B — independent, read-only, "angry" P0–P3 re-audit. No Lens A, no modify, no merge.
- **Date:** 2026-07-14

## VERDICT: **NOT CLEAN** — 0×P0 / 0×P1 / 0×P2 / **2×P3**

The code is functionally sound and unchanged from the R3 CLEAN head; the sole new
commit (`885cf9b`, "MA-02 — honest contract framing") is docs + one JSDoc comment
+ two additive tests. Its central substantive claim — that the backend **closes**
the `status` / `terminal_status` enums and mobile decodes defensively anyway — was
independently verified TRUE against `growth-project-backend`. Two low-severity
**documentation-precision** defects remain in the delta under review.

---

## Delta since last CLEAN audit (`176c7f2..885cf9b`)

One commit, 3 files, +48/-20:
- `docs/importer/MOBILE_IMPORT_DECISION.md` — reframe open-string → closed-enum.
- `src/types/extensionImport.ts` — **comment-only** reframe of the same (no code change).
- `src/types/__tests__/extensionImport.contract.test.ts` — 2 `it()` descriptions
  renamed + **2 new idempotency/totality tests** (20 → 22 blocks).

No production logic changed. Decoders, URL guard, screen, flag, nav, telemetry are
byte-identical to the R3 CLEAN head.

---

## Findings

### P3-1 — PR-body gate figure "3468 tests" is stale for the pushed head (should be 3470)
- **Where:** PR #284 body → "Gates (full CI-equivalent, **verified on the pushed head**)"
  → "Full jest suite green: **292 suites / 3468 tests** pass."
- **Evidence:** `885cf9b` adds exactly two `it()` blocks to
  `extensionImport.contract.test.ts` (20 → 22; the only test file changed in the
  delta, no removals). The "3468" figure is the R3 (`176c7f2`) count carried
  forward unchanged; the head now runs **3470**. Suite count (292) is still correct.
- **Impact:** Cosmetic/conservative (understates passing tests by 2); no false green,
  no functional risk. But it is a specific numeric claim asserted as "verified on the
  pushed head" that the pushed head contradicts — introduced by the very commit under
  audit, which added the tests without updating the body.
- **Fix:** Update PR body to `292 suites / 3470 tests` (and, for exactness, the
  test:src ratio / test-LOC figures, which are likewise slightly stale — still ≥ 2.0).

### P3-2 — `extensionImport.ts` JSDoc over-attributes `@IsIn` to the pair `status` field
- **Where:** `src/types/extensionImport.ts` decoder JSDoc: *"The backend constrains
  `status` / `terminal_status` to CLOSED enums at every layer (OpenAPI `enum`, DTO
  union + class-validator `@IsIn`)."*
- **Evidence (backend, PR #504 head `c20651b`):**
  - Pair `status` → `PairStatusResult.status` is a **response** field:
    `@ApiProperty({ enum: PAIR_STATUSES })` + `PairStatus` union
    (`extension-pair.dto.ts:53,78,81`). **No `@IsIn`** — and none is applicable, as
    the value is server-derived (`deriveStatus()` only ever emits pending/paired/expired),
    never client-supplied.
  - Only the extension-only inbound `terminal_status` carries `@IsIn`
    (`scout.dto.ts:132`, `SCOUT_TERMINAL_STATUSES` + OpenAPI enum).
- **Impact:** The core claim ("both fields are closed enums") is **true**; the loose
  parenthetical implies `@IsIn` guards pair `status`, which it does not. The decision
  doc (`MOBILE_IMPORT_DECISION.md`) states the split correctly — only the shipped code
  comment is imprecise. Given MA-02's stated purpose is *honest contract framing*, an
  auditor flags this precision gap.
- **Caveat:** A distributive reading ("each field is closed at the layers applicable
  to it") is defensible, which is why this is P3, not higher.
- **Fix:** Split the mechanism attribution as the decision doc already does — pair
  `status` = OpenAPI enum + `PAIR_STATUSES` union; scout `terminal_status` = enum +
  `SCOUT_TERMINAL_STATUSES` union + `@IsIn`.

---

## Deep re-checks (all verified — no regression from R3)

- **Contract evidence (the crux of MA-02):** VERIFIED against backend source, not
  taken on faith. `PAIR_STATUSES = ['pending','paired','expired']` (enum+union) and
  `SCOUT_TERMINAL_STATUSES = ['success','partial','failed']` (enum+union+`@IsIn`) both
  exist and are genuinely closed. The reframe from "open string" → "closed enum, decode
  defensively anyway (version-skew defense)" is substantively honest.
- **Honest decoders:** `PairStatusResponse.status` stays `string` on the wire;
  `decodePairStatus`/`decodeTerminalStatus` map only known members via `===`, else
  `'unknown'`; never coerced to paired/success/complete. New tests prove totality +
  idempotency (`decode(decode(x)) === decode(x)`). No blind narrowing, no `as` cast.
- **URL/IP guard (`safeImportLoginUrl.ts`):** https-only; rejects embedded creds &
  empty host; IPv4 canonicalised across dotted/decimal/hex/octal/shorthand to a 32-bit
  int; IPv6 expanded to 8 hextets incl. `::ffff:v4` mapped / `::v4` compat; private
  blocks 0/8,10/8,127/8,169.254/16,172.16-31/12,192.168/16 and `::`,`::1`,fc00::/7,
  fe80::/10 all rejected; boundary public hosts (172.15/172.32/128/9/192.169) and DNS
  names `fdny.gov`/`fcbarcelona.com` correctly accepted; parser independent of WHATWG
  normalisation (Hermes-safe). Exotic NAT64/6to4/CGNAT acceptance remains **out of
  documented scope** and irrelevant to threat model (URL opens in the coach's own
  browser via `Linking`, no server-side fetch → no SSRF surface). Not a finding.
- **Phases / dual-state:** `SUPPORTED_IMPORT_PHASES` = exactly the 5 honest phases;
  deferred vocabulary typed but neither advertised nor constructed.
- **Flag + coach nav:** `extensionImport` defaults `false` **unconditionally** (not
  `isDev`); route and Settings row gated by the same flag, route registered exactly
  once (no orphan); Day-1 `CoachPairing` untouched.
- **Linking path:** `safeImportLoginUrl` gate → `canOpenURL` → `openURL`; failure/throw
  → calm recoverable `failed` + retry.
- **MA-01 single-source-of-truth:** re-entering Custom resets url/valid/hint together;
  `TextInput` reads `state.url`.
- **Telemetry/PII:** events carry only platform slug + coarse reason
  (`invalid_url`/`open_failed`); no tokens/codes/URLs/PII.
- **Authorship:** all 8 commits `main..head` authored + committed as
  Bradley Gleave <bradley@bradleytgpcoaching.com>.
- **Banned-cast scan (delta):** clean — no `as Type` coercion introduced.

---

## Gate posture (transparency on method)

This environment has **no `node_modules`** in any mobile clone and a 3% sparse
checkout, so the live `tsc` / ESLint / full jest suite could **not** be re-run here.
Gate status is therefore **derived**, not freshly executed:

- Baseline: R3 ran the **full** suite green at `176c7f2` (292 suites / 3468 tests /
  5 snapshots; tsc clean; ESLint 0 errors; net-prod-LOC 394 ≤ 400; ratio 2.25 ≥ 2.0).
- Delta `176c7f2..885cf9b` is docs + one comment-only prod change + two **additive**
  passing tests importing already-exported type names — none of which can flip a green
  suite red or break tsc/ESLint.
- **net-prod-LOC:** unchanged at **394** — the only prod change is comment lines, which
  the non-blank/non-comment gate excludes (raw added prod lines = 526 ≠ 394 confirms the
  gate strips comments). Claim holds exactly.
- **Derived head totals:** 292 suites / **3470** tests (see P3-1).

If a CI-authoritative recount is required, run `npm ci && npm test` on `885cf9b`.

---

## Files audited (14 changed, +1730/-0)

Prod: `safeImportLoginUrl.ts`, `types/extensionImport.ts`, `ImportDataScreen.tsx`,
`importPlatforms.ts`, `CoachNavigator.tsx`, `SettingsScreen.tsx`, `featureFlags.ts`,
`analytics/events.ts`.
Tests: `safeImportLoginUrl.test.ts`, `extensionImport.contract.test.ts`,
`ImportDataScreen.test.tsx`, `importPlatforms.test.ts`, `importDataFlagOff.test.ts`.
Docs: `docs/importer/MOBILE_IMPORT_DECISION.md`.

**Recommendation:** Both findings are P3 documentation-precision nits with zero
functional/security/contract impact and conservative direction. The code is safe to
merge on its merits; resolving P3-1 (bump body to 3470) and P3-2 (split the `@IsIn`
attribution to match the decision doc) clears Lens B to CLEAN.
