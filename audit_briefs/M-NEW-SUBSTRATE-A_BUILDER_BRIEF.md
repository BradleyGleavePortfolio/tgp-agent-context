# 1. M-NEW-SUBSTRATE.A — Scout-Profile Loader

Slug: `M-NEW-SUBSTRATE.A`

## 2. Doctrine cites

- R0/R3: builder commits must use `Bradley Gleave <bradley@bradleytgpcoaching.com>` as both author and committer; use `scripts/push_one.sh`; no assistant/agent/co-author trailers.
- R52/R71/R72: push WIP at checkpoints, keep active lanes bounded, and require dual-lens adversarial audit before merge.
- R74/R86: tests must target real profile-loader failure modes; no ratio padding. If test density is below 2.0, use `[TEST-EXEMPT: anti-padding-profile-loader-real-failure-modes]` plus the block in §8.
- R75: net banned-cast tokens must be zero; no `as any`, `as unknown as`, `as never`, or unreferenced `@ts-expect-error`.
- R76: prod code cap is ≤400 LOC for this sub-slice.
- R82: any migration introduced here must have a matching `down.sql` and expand-contract semantics.
- R98/R107/R125: scout profiles can reference PII-bearing fields; all user-data tables stay encrypted/redacted/audit-logged and Tier-1 RLS-scoped.
- D-7: per-vendor adapters are killed/absorbed into declarative scout profiles; no vendor-specific TypeScript.
- D-8: generic substrate is the canonical spine; profile drift is solved by config + hot reload, not code branches.
- D-H6-5: any audit write called by this slice must use `withAuditLog(tx, args, op)` with caller-provided transaction.

## 3. Dependencies

Must land first:

1. H6A audit substrate with corrected D-H6-5 caller-owned transaction contract.
2. H6B circuit breakers for noisy profile reloads and failed profile reads.
3. H6C audit-log coverage for user-mutating routes.
4. M-NEW-SCHEMA tables/columns for `scout_profiles`, `scout_profile_versions`, `operator_overrides`, and `scout_profile_reload_events` if not already present.

Can run before `.B` selector engine because it only validates selector syntax structurally, not runtime element matching.

## 4. What this slice ships

Prod LOC budget: **400 LOC max**.

| File | LOC budget | Purpose |
|---|---:|---|
| `src/migration-scout/profile/scout-profile.schema.ts` | 115 | Zod/JSON-Schema contract for YAML/JSON profiles: vendor, version, auth, session, scout routes, selector references, reconciliation, kill-switch defaults. |
| `src/migration-scout/profile/scout-profile-loader.ts` | 145 | Reads `config/scout_profiles/*.yaml|json`, parses YAML/JSON, validates, normalizes, computes content hash, rejects vendor-specific code hooks. |
| `src/migration-scout/profile/scout-profile-registry.ts` | 75 | In-memory registry keyed by `vendor + version`, atomic swap on reload, read API for downstream substrate slices. |
| `src/migration-scout/profile/scout-profile-notify.listener.ts` | 50 | PG `LISTEN scout_profile_reload` listener; debounced reload; fails closed on invalid replacement. |
| `src/migration-scout/profile/index.ts` | 15 | Public exports only. |
| **Total** | **400** | Hard R76 cap. |

Test LOC target: ≥800 if practical, but do not add filler tests; use the R74/R86 exception block if the only honest tests are fewer.

## 5. Public API contract

```ts
export type ScoutProfileVendor = string;
export type ScoutProfileVersion = `${number}.${number}` | string;

export interface ScoutProfileRef {
  vendor: ScoutProfileVendor;
  version: ScoutProfileVersion;
}

export interface LoadedScoutProfile {
  readonly ref: ScoutProfileRef;
  readonly displayName: string;
  readonly domains: readonly string[];
  readonly auth: ScoutProfileAuthConfig;
  readonly session: ScoutProfileSessionConfig;
  readonly scout: ScoutProfileScoutConfig;
  readonly reconciliation: ScoutProfileReconciliationConfig;
  readonly killSwitchDefault: 'enabled' | 'disabled';
  readonly contentHash: string;
  readonly loadedAt: Date;
}

export interface ScoutProfileLoader {
  loadAll(tx?: Prisma.TransactionClient): Promise<readonly LoadedScoutProfile[]>;
  loadOne(ref: ScoutProfileRef, tx?: Prisma.TransactionClient): Promise<LoadedScoutProfile>;
}

export interface ScoutProfileRegistry {
  get(ref: ScoutProfileRef): LoadedScoutProfile | null;
  getLatest(vendor: ScoutProfileVendor): LoadedScoutProfile | null;
  list(): readonly LoadedScoutProfile[];
  reload(tx?: Prisma.TransactionClient): Promise<ScoutProfileReloadResult>;
}

export interface ScoutProfileReloadResult {
  readonly accepted: boolean;
  readonly profilesLoaded: number;
  readonly rejectedProfiles: readonly ScoutProfileValidationError[];
  readonly previousGeneration: string;
  readonly nextGeneration: string;
}
```

Validation requirements:

- Profile files may be YAML or JSON only.
- `vendor` must be lowercase slug and must match filename.
- `auth.fields[*].type` is limited to `email | password | text | token`.
- `auth.mfa.challenges` is limited to `totp | sms | email | device_trust`.
- Selectors are strings but must include a declared kind (`css:`, `xpath:`, or `json:`) unless the schema key is legacy CSS-only.
- `scout.routes[*].schema_map[*].to` must target canonical schema paths from M-NEW-SCHEMA.
- No executable code, inline JS, shell snippets, or vendor-specific TypeScript module references are allowed in profile config.

## 6. Database changes

Expected migration ownership: **M-NEW-SCHEMA**. This slice may only add a tiny follow-up migration if M-NEW-SCHEMA omits reload metadata.

Required schema contract:

- `scout_profiles`
  - `id uuid pk`
  - `vendor text not null`
  - `version text not null`
  - `display_name text not null`
  - `content_hash text not null`
  - `profile_json jsonb not null`
  - `is_active boolean not null default true`
  - `loaded_at timestamptz not null default now()`
  - unique `(vendor, version)`
- `scout_profile_reload_events`
  - `id uuid pk`
  - `actor_user_id uuid null`
  - `vendor text null`
  - `previous_generation text not null`
  - `next_generation text not null`
  - `accepted boolean not null`
  - `error_json jsonb null`
  - `created_at timestamptz not null default now()`
- PG channel: `scout_profile_reload` with payload `{ vendor?: string, reason: string }`.

RLS:

- `scout_profiles` is not coach-user data, but writes are service/operator only; reads are service-only.
- `scout_profile_reload_events` can include actor metadata and must deny direct coach access.
- If any coach-scoped profile override is added later, it is Tier-1 RLS by `coach_id` per R125.

R82:

- Any migration added here must include `down.sql` dropping policy/index/table changes in reverse order.

## 7. Test strategy

Real failure modes only:

1. **Invalid replacement must not poison the registry.** Start with a valid profile, emit PG NOTIFY for a malformed replacement, assert reload rejects the new profile and old generation remains active.
2. **Vendor-code escape hatch is rejected.** Profile containing `module`, `script`, inline JS, or unknown selector kind is rejected with a structured validation error.
3. **Filename/vendor mismatch is rejected.** `truecoach.yaml` with `vendor: trainerize` fails and emits an audit/reload event without activating.
4. **Schema-map target drift is caught.** A profile mapping to a non-canonical `to` path fails validation.

Do not add constructor/getter/import-barrel tests just to raise R74 density.

## 8. Anti-padding R86 exception block

Expected: **not needed for R76** because prod LOC is capped at 400.

If honest tests land below R74 density, PR title must include:

`[TEST-EXEMPT: anti-padding-profile-loader-real-failure-modes]`

PR body block:

```md
[R86 ANTI-PADDING EXCEPTION]
Slice: M-NEW-SUBSTRATE.A profile loader
Prod LOC: <actual>
Test LOC: <actual>
R74 ratio: <actual>
Real failure modes tested:
- Invalid hot-reload replacement preserves previous registry generation.
- Executable/vendor-specific profile escape hatches are rejected.
- Filename/vendor mismatch and canonical schema-map drift fail closed.
Padding explicitly rejected:
- Getter/export-barrel tests.
- Constructor-only tests.
- YAML happy-path permutations that do not cover a distinct outage mode.
Split feasibility: Already ≤400 prod LOC; splitting would create interface churn without reducing risk.
```

If prod LOC exceeds 400 by even one line, stop and obtain operator approval before proceeding; do not self-approve a LOC exception.

## 9. Out of scope

- Runtime selector evaluation; that is `.B`.
- Browser/session login, MFA, device-trust cookie capture; that is `.C`.
- Reconciliation output or diff generation; that is `.D`.
- Kill-switch enforcement beyond reading profile defaults; that is `.E`.
- tRPC onboarding routes; that is `.F`.
- TrueCoach or any vendor-specific profile content.

## 10. Verification gates

Must be green:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test -- scout-profile`
- `pnpm test -- scout-profile-loader`
- `r100-banned-tokens`
- `r100-test-density` or accepted `[TEST-EXEMPT: ...]` block
- `r76-prod-loc` with ≤400 prod LOC
- Migration reversibility gate if this slice adds any migration
- Audit-log contract tests if reload events are persisted through H6A

## 11. VERDICT line

VERDICT: _______________
