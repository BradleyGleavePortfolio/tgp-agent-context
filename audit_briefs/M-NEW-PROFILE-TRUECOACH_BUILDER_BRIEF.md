# 1. M-NEW-PROFILE-TRUECOACH — TrueCoach Export-Assisted Scout Profile

**Slug:** `M-NEW-PROFILE-TRUECOACH`  
**Target prod LOC:** ~300 generic reconstructor LOC + ~400 YAML config lines.  
**Profile path:** `config/scout_profiles/truecoach.yaml`.

## 2. Doctrine cites

- R0/R3: commits authored and committed by Bradley Gleave only.
- R74/R86: tests target real config/reconstruction failures, not YAML snapshot padding.
- R76: prod TypeScript target ~300 LOC; YAML config is not prod TS LOC but must still be reviewed for bloat.
- R98: TrueCoach exports include PII and fitness/health context; redact logs and preserve only source evidence needed for coach review.
- R107: import/reconstruction writes use H6A audit wrappers through downstream reconciler routes.
- R125: every loaded result and reconstructed diff remains Tier-1 coach-scoped.
- D-8 / M-NEW spine: this is a declarative scout-profile reference implementation; no vendor-specific TypeScript branches.
- Planner v2 reality check: TrueCoach is the first profile because official export surfaces make it the safest export-assisted proof path; unattended browser scout remains disabled unless written permission/legal gate exists.

## 3. Dependencies

Must land first:

1. **H6A/H6B/H6C** audit, breaker, and audit-wrap substrate.
2. **M-NEW-SCHEMA** tables and RLS.
3. **M-NEW-SUBSTRATE.A** profile loader with YAML validation and hot-reload.
4. **M-NEW-SUBSTRATE.B** selector/schema-map abstraction if any browser-assisted step is enabled later.
5. **M-NEW-SUBSTRATE.C** session/MFA only if browser scout mode is enabled; launch profile defaults to export-assisted mode.
6. **M-NEW-SUBSTRATE.D** diff engine.
7. **M-NEW-RECONCILER** canonical entity write/queue behavior.

Should land first:

- **M-NEW-ONBOARDING** for coach-visible export instructions and upload/review flow.

## 4. What this slice ships

File inventory and LOC budget:

| File | Purpose | Prod LOC budget |
|---|---|---:|
| `config/scout_profiles/truecoach.yaml` | Declarative TrueCoach profile: auth metadata, safe modes, export instructions, schema maps, reconciliation rules, reconstructor recipe. | ~400 config lines |
| `src/scout/reconstructors/exportAssistedReconstructor.ts` | Generic CSV/TXT/PDF evidence-to-scout-results reconstructor driven by profile recipes. | ~210 |
| `src/scout/reconstructors/profileRecipeRunner.ts` | Small dispatcher from validated YAML recipe to generic reconstructor steps. | ~70 |
| `src/scout/reconstructors/index.ts` | Exports only. | ~10 |
| `src/scout/reconstructors/types.ts` | Recipe/evidence/result types if not already in substrate. | ~10 |

**Total prod LOC budget:** ~300.  
**Total config budget:** ~400 lines.

## 5. Public API contract

YAML schema extension for export-assisted profiles:

```yaml
vendor: truecoach
version: "1.0"
display_name: "TrueCoach"
domains:
  - app.truecoach.co
  - truecoach.co
legal:
  default_mode: export_assisted
  browser_scout: disabled_until_written_permission
auth:
  flow: password
  fields:
    - { key: email, label: "Email", type: email }
    - { key: password, label: "Password", type: password }
  mfa:
    enabled: true
    challenges: [totp, sms, device_trust]
session:
  login_url: "https://app.truecoach.co/login"
  login_selectors:
    email: 'input[name="email"]'
    password: 'input[name="password"]'
    submit: 'button[type="submit"]'
  logged_in_marker: 'a[href="/dashboard"]'
  session_cookies: []
scout:
  source_modes: [export_upload, copilot]
  routes: {}
  reconstructor:
    enabled: true
    mode: export_assisted
    inputs:
      - key: clients_csv
        label: "Client CSV export"
        accept: [text/csv]
        entity: client
      - key: workouts_txt
        label: "Workout text export"
        accept: [text/plain]
        entity: workout
      - key: programs_pdf
        label: "Program PDF/text export"
        accept: [application/pdf, text/plain]
        entity: workout
    csv_columns_map:
      - { from: Email, to: client.email, required: true }
      - { from: Name, to: client.name, required: true }
      - { from: Phone, to: client.phone, required: false }
    text_patterns:
      workout_name: '^Workout:\s+(?<name>.+)$'
      exercise_line: '^(?<exercise>.+?)\s+-\s+(?<sets>\d+)x(?<reps>[^,]+)'
reconciliation:
  primary_key: client.vendor_id
  fallback_keys: [client.email]
  diff_strategy: deep_merge
  conflict_resolution: manual
kill_switch:
  default: enabled
```

TypeScript API:

```ts
export interface ExportAssistedRunInput {
  scoutRunId: string;
  coachId: string;
  vendor: string;
  profileVersion: string;
  uploads: Array<{ key: string; uploadId: string; contentType: string }>;
  actorUserId: string;
}

export interface ExportAssistedRunResult {
  scoutRunId: string;
  emittedResults: number;
  warnings: Array<{ code: string; message: string; evidenceRef?: string }>;
}

export async function runExportAssistedReconstructor(
  tx: Prisma.TransactionClient,
  profile: ScoutProfile,
  input: ExportAssistedRunInput,
): Promise<ExportAssistedRunResult>;
```

## 6. Database changes

No new tables expected.

Writes performed through existing schema:

- `scout_results`: emit reconstructed `client`, `workout`, `session`, and `message` candidates with source evidence references.
- `scout_diffs`: downstream diff engine/reconciler writes reviewable diffs.
- `scout_audit_events`: write redacted operational events such as `truecoach_export_uploaded`, `reconstructor_warning`, and `profile_recipe_version_used`.
- `session_cookies`: not used by launch mode; if future browser mode is enabled, cookies must use the `M-NEW-SCHEMA` envelope-encryption contract and never appear in YAML or logs.

RLS remains inherited from `M-NEW-SCHEMA`; no direct bypasses.

## 7. Test strategy targeting REAL failure modes

Required tests:

1. `test/scout/profiles/truecoach.schema.spec.ts`
   - Validates `config/scout_profiles/truecoach.yaml` against the scout-profile contract and export-assisted extension.
   - Fails if a vendor-specific TypeScript hook is referenced.
2. `test/scout/profiles/truecoach.client-csv.spec.ts`
   - Parses a realistic client CSV fixture with missing optional phone/timezone and required email/name.
   - Emits `scout_results` with normalized email and warning for missing optional fields, not a hard failure.
3. `test/scout/profiles/truecoach.workout-text.spec.ts`
   - Parses workout text with ambiguous exercise lines.
   - Emits evidence-preserving workout candidates and warnings rather than hallucinated structured certainty.
4. `test/scout/profiles/truecoach.manual-conflict.spec.ts`
   - Profile `conflict_resolution: manual` causes conflicting client/workout fields to queue `scout_diffs` instead of auto-overwriting TGP canonical data.
5. `test/scout/profiles/truecoach.no-browser-by-default.spec.ts`
   - Proves `browser_scout` is disabled by default and the wizard sees export-assisted/copilot modes unless operator/legal gate enables otherwise.

Padding rejected: asserting every YAML key equals itself, snapshotting the full config, or one test per CSV column when required/optional behavior is already covered.

## 8. R86 anti-padding exception block

Expected status: **not expected to exceed R76 for prod LOC**.

If R74 ratio is below 2.0:

```md
[TEST-EXEMPT: anti-padding-truecoach-profile-real-failure-modes]
R86 TEST EXCEPTION REQUESTED
- Real failure modes covered: profile contract drift, client CSV required/optional handling, workout TXT ambiguity, manual conflict queue, browser mode disabled by default.
- Padding rejected: full-YAML snapshots, one-test-per-column duplication, tests that only assert static literals.
- Split feasibility: not useful; config and generic export-assisted runner are the minimum end-to-end proof for the first profile.
```

## 9. Out of scope

- No unattended TrueCoach browser scout in v0 unless explicit legal/written-permission gate exists.
- No billing/subscription migration from TrueCoach.
- No vendor-specific TypeScript such as `truecoach.ts` branches.
- No Roman AI drafting; preserve evidence for later Roman overlay.
- No claim of perfect PDF reconstruction; ambiguous data must surface to coach review.
- No storage of coach password or plaintext cookies.

## 10. CI verification gates

- `npm run lint`
- `npm run typecheck`
- `npm test -- scout/profiles/truecoach`
- YAML schema validation in CI for all `config/scout_profiles/*.yaml`.
- R75 banned-cast token gate: net +0.
- R74 density gate or valid `[TEST-EXEMPT: ...]` block.
- R76 LOC gate: prod TypeScript ≤400; target ~300.
- Static check: no vendor-specific TypeScript filename or branch for TrueCoach.
- Secret scan: YAML contains no real credentials, cookies, tokens, or coach/client PII.

## 11. VERDICT line

VERDICT: <builder fills after implementation>
