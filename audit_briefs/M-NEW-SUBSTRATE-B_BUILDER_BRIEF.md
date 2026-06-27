# 1. M-NEW-SUBSTRATE.B — Selector Engine

Slug: `M-NEW-SUBSTRATE.B`

## 2. Doctrine cites

- R0/R3: commits use Bradley Gleave identity only via `scripts/push_one.sh`; no assistant/agent attribution.
- R52/R71/R72: push at checkpoints, avoid lane collision, dual-lens adversarial audit before merge.
- R74/R86: test the real selector failure modes; do not pad with trivial getters or adapter wiring.
- R75: zero net banned-cast tokens.
- R76: ≤400 prod LOC.
- R82: no migration expected; if added, reversible `down.sql` is mandatory.
- R98/R107/R125: selector output can expose PII-bearing fields downstream; preserve redaction/audit/RLS contracts at boundaries.
- D-7/D-8: selectors are declarative, vendor-agnostic, and profile-driven; no per-vendor TypeScript.
- D-H6-5: if selector execution records audit facts, call H6A `withAuditLog(tx, args, op)` with caller-owned transaction.

## 3. Dependencies

Must land first:

1. H6A/H6B/H6C.
2. M-NEW-SCHEMA canonical paths for scout output.
3. `.A` profile loader exporting validated selector specs.

Can run before `.C` because it operates against abstract documents/responses and does not own browser sessions.

## 4. What this slice ships

Prod LOC budget: **390 LOC max**.

| File | LOC budget | Purpose |
|---|---:|---|
| `src/migration-scout/selector/selector.types.ts` | 55 | Selector spec/result/error types. |
| `src/migration-scout/selector/selector-parser.ts` | 75 | Parses `css:...`, `xpath:...`, `json:/...` into normalized AST. |
| `src/migration-scout/selector/selector-engine.ts` | 120 | Dispatches evaluation to DOM/JSON adapters; enforces result cardinality and structured errors. |
| `src/migration-scout/selector/dom-selector-adapter.ts` | 70 | CSS/XPath evaluation over a provided DOM/document abstraction. |
| `src/migration-scout/selector/json-pointer-adapter.ts` | 50 | RFC-style JSON pointer evaluation over unknown JSON payloads without unsafe casts. |
| `src/migration-scout/selector/index.ts` | 20 | Public exports. |
| **Total** | **390** | Leaves 10 LOC buffer under R76. |

## 5. Public API contract

```ts
export type SelectorKind = 'css' | 'xpath' | 'json_pointer';
export type SelectorCardinality = 'one' | 'zero_or_one' | 'many';

export interface SelectorSpec {
  readonly kind: SelectorKind;
  readonly path: string;
  readonly attr?: string;
  readonly text?: boolean;
  readonly cardinality?: SelectorCardinality;
  readonly required?: boolean;
}

export interface SelectorContext {
  readonly sourceKind: 'html' | 'json';
  readonly htmlDocument?: DocumentLike;
  readonly jsonValue?: unknown;
  readonly pageUrl?: string;
  readonly profileVendor: string;
  readonly profileVersion: string;
}

export interface SelectorMatch {
  readonly value: string | number | boolean | null | Record<string, unknown> | readonly unknown[];
  readonly evidencePath: string;
  readonly confidence: 'exact' | 'missing_optional' | 'ambiguous';
}

export interface SelectorEngine {
  parse(raw: string | SelectorSpec): SelectorSpec;
  evaluate(spec: string | SelectorSpec, ctx: SelectorContext): Promise<readonly SelectorMatch[]>;
  evaluateMap<TCanonical extends Record<string, unknown>>(
    mappings: readonly ScoutSchemaMapEntry[],
    ctx: SelectorContext,
  ): Promise<SelectorMapResult<TCanonical>>;
}
```

Behavior contract:

- CSS and XPath are valid only against `sourceKind: 'html'`.
- JSON pointer is valid only against `sourceKind: 'json'`.
- Required selector miss returns `SelectorError` with `code: 'REQUIRED_SELECTOR_MISSING'`; optional miss returns an empty match list.
- Cardinality mismatch returns `SelectorError` with evidence count, not a thrown string.
- No selector may execute JavaScript or call network/file APIs.
- `evaluateMap` returns values plus source evidence path so `.D` can build field-level diffs.

## 6. Database changes

None expected in this slice.

M-NEW-SCHEMA must already provide storage columns for selector evidence in `scout_results.raw_payload`, `scout_results.parsed_payload`, or equivalent observation tables. This slice does not write database rows directly unless future instrumentation records selector-health counters, in which case those events go through the central telemetry/audit substrate and must not store PII selector values.

RLS impact: none directly; downstream writes remain Tier-1 RLS by `coach_id + scout_session_id`.

## 7. Test strategy

Real failure modes only:

1. **Required selector missing fails closed.** Given HTML without the required marker, engine returns structured `REQUIRED_SELECTOR_MISSING` and does not silently return null.
2. **Selector kind/source mismatch is rejected.** `json:/client/id` against HTML and `css:.client` against JSON both fail with stable error codes.
3. **Ambiguous one-cardinality selector is surfaced.** `cardinality: one` with multiple matches returns an ambiguity error including evidence count.
4. **JSON pointer handles escaped keys and arrays.** Proves `/clients/0/full_name` and escaped path segments work without unsafe casts.

Rejected padding: parse-only duplicate tests, index export tests, and DOM happy paths that do not assert failure behavior.

## 8. Anti-padding R86 exception block

Expected: **not needed for R76** because prod LOC is ≤390.

If honest tests land below R74 density, PR title must include:

`[TEST-EXEMPT: anti-padding-selector-engine-real-failure-modes]`

PR body block:

```md
[R86 ANTI-PADDING EXCEPTION]
Slice: M-NEW-SUBSTRATE.B selector engine
Prod LOC: <actual>
Test LOC: <actual>
R74 ratio: <actual>
Real failure modes tested:
- Required selector miss fails closed with stable error code.
- Selector kind/source mismatch is rejected.
- One-cardinality ambiguity is surfaced with evidence count.
- JSON pointer escaped paths/arrays evaluate safely.
Padding explicitly rejected:
- Barrel export tests.
- Parser duplicate snapshots.
- CSS happy-path permutations with no distinct risk.
Split feasibility: Already below R76; splitting CSS/XPath/JSON into separate PRs would add adapters without reducing integration risk.
```

## 9. Out of scope

- Profile file parsing/hot reload; `.A`.
- Browser page lifecycle, login, cookies, MFA; `.C`.
- Schema reconciliation/conflict resolution; `.D`.
- Kill-switch enforcement and action wrapping; `.E`.
- Onboarding tRPC endpoints; `.F`.
- Vendor profile authoring or selector maintenance.

## 10. Verification gates

Must be green:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test -- selector-engine`
- `pnpm test -- json-pointer`
- `pnpm test -- dom-selector`
- `r100-banned-tokens`
- `r100-test-density` or accepted `[TEST-EXEMPT: ...]` block
- `r76-prod-loc` with ≤400 prod LOC

## 11. VERDICT line

VERDICT: _______________
