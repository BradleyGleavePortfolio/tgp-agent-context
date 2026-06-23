# H4 Split Audit — Lens B (Breadth) — R5 — PR #465 (H4.D provider-wiring)

## BUILD MATRIX (R124)
| Item | Value |
|---|---|
| Repo | `BradleyGleavePortfolio/growth-project-backend` |
| PR | `#465` — H4.D provider-wiring |
| Local `main` ref audited per brief | `8467c6f568a51337a7acbfb14f72ac85b996d605` |
| Recorded PR head SHA | `c5dd5bd97a29dce77f8e7afceb3025dd6250e4ec` |
| Observed `git log -1 --format=%H pr465` at audit start | `c5dd5bd97a29dce77f8e7afceb3025dd6250e4ec` |
| Observed `git log -1 --format=%H pr465` at final check | `c5dd5bd97a29dce77f8e7afceb3025dd6250e4ec` |
| Live GitHub PR base observed | `868000088fab1fc5929e02291bec4d4928e99aaf` |
| Live GitHub PR files observed | `test/prod-readiness/__fixtures__/provider-wiring/uses-stripe.tsx`, `test/prod-readiness/provider-wiring-stripe-mux-sendgrid.spec.ts`, `test/prod-readiness/provider-wiring-twilio-aws-fly-sentry-supabase-openai-cf.spec.ts`, `test/prod-readiness/provider-wiring.ts`, `tsconfig.json` |
| Local diff artifact | `/home/user/workspace/audit_briefs/H4_PR465_R5_full_diff.patch` |
| Extracted file copies | `/home/user/workspace/audit_briefs/pr465_files/` |
| Audit timestamp (UTC) | `2026-06-23T22:45:00Z` |

## Scope swept
- Read the R5 brief, `AGENT_RULES.md`, Lens B R4, Lens A R4, and the H4.D builder report in full before inspecting code.
- Verified the required head SHA exactly matched `c5dd5bd97a29dce77f8e7afceb3025dd6250e4ec` at start and before verdict.
- Walked `git diff main..pr465` and separately checked live GitHub PR metadata. Local `main..pr465` includes stale-base deletions because the live PR base is `868000088fab1fc5929e02291bec4d4928e99aaf`; the live PR file set is the provider-wiring implementation, two specs, the TSX fixture, and `tsconfig.json`.
- Reviewed every exported type, every provider definition, every `KEY_SHAPE_VALIDATORS` regex, every status branch (`WIRED` / `STUB` / `NOT_USED`), every spec assertion, import surfaces, error paths, and deterministic ordering paths.
- R75 banned token sweep over added diff lines: `@ts-ignore=0`, `as any=0`, `as unknown as=0`, `as never=0`, `.catch(()=>undefined)=0`, `.catch(()=>null)=0`, `.catch(()=>{})=0`, spaced `.catch(() => ...)` variants all `0`.
- Import sweep: `provider-wiring.ts` imports only `fs`, `path`, and `typescript`; specs import the module under test plus Node test harness helpers.
- Local focused Jest execution was attempted, but this sandbox lacks installed Jest (`sh: 1: jest: not found`), so runtime validation here is static/diff-based plus prior CI context rather than a fresh local test run.

## Finding R5-F001 — AWS IAM-role wiring reports `WIRED` without registering or requiring `AWS_ROLE_ARN`

**Priority:** P1
**Rules triggered:** R1, R10, R31, R40, R100, R108, R109, R117
**File:** `test/prod-readiness/provider-wiring.ts:97-103`; `test/prod-readiness/provider-wiring-twilio-aws-fly-sentry-supabase-openai-cf.spec.ts:99-105`
**Code:**
```ts
    // AWS_REGION is always needed; credentials may arrive via static keys OR an
    // IAM web-identity token file (IRSA / OIDC), so those are an either/or group.
    requires: ['AWS_REGION'],
    requiresAnyOf: [
      ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
      ['AWS_WEB_IDENTITY_TOKEN_FILE'],
    ],
```
```ts
  it('live via IAM role: region + web-identity token file, no static keys → WIRED', () => {
    const r = wired('aws-s3', {
      AWS_REGION: 'us-east-1',
      AWS_WEB_IDENTITY_TOKEN_FILE: '/var/run/secrets/eks.amazonaws.com/serviceaccount/token',
    });
    expect(r.status).toBe('WIRED');
```
**Why it's wrong:**
The IAM-role branch treats `AWS_WEB_IDENTITY_TOKEN_FILE` alone as a complete credential alternative, but the R5 breadth brief explicitly calls out the AWS either/or surface as static credentials OR `AWS_ROLE_ARN`. With `AWS_ROLE_ARN` absent from the provider definition and absent from every AWS spec assertion, the scanner can green-light S3 as `WIRED` even when the role identity needed for the IAM path is not registered, not checked, and not surfaced to the operator.
**Counter-example input:**
```ts
const imported = new Set(['@aws-sdk/client-s3']);
const env = {
  AWS_REGION: 'us-east-1',
  AWS_WEB_IDENTITY_TOKEN_FILE: '/var/run/secrets/eks.amazonaws.com/serviceaccount/token',
  // AWS_ROLE_ARN is missing
};
const evidence = { AWS_WEB_IDENTITY_TOKEN_FILE_EXISTS: true };
// Observed by current contract: aws-s3 => WIRED
// Expected: STUB with AWS_ROLE_ARN missing, unless the architecture explicitly registers a different role signal.
```
**Expected fix:**
Update the AWS provider contract and tests so the role-based alternative includes the registered role signal (`AWS_ROLE_ARN`, and if the intended mode is web identity, require it together with `AWS_WEB_IDENTITY_TOKEN_FILE` plus file evidence). Add negative tests for `AWS_ROLE_ARN` missing, token file missing, partial static keys, both credential modes present, and neither mode present; ensure the report surfaces the missing role field instead of `WIRED`.

## Breadth checks with no additional findings
| Surface | Result |
|---|---|
| Exported type/runtime parity | `ProviderStatus` is used consistently; `EnvMap`/`EvidenceMap` are read-only; no additional P-rated issue beyond the AWS role contract gap. |
| `KEY_SHAPE_VALIDATORS` | Regexes are anchored and bounded; no `/m` or nested quantifier ReDoS issue observed; Supabase JWT segments are size-capped before decode. |
| Status strings | Runtime assignments use the union members directly; no typo drift observed. |
| Spec quality | 180 `it(...)` blocks and 321 `expect(...)` calls across the two specs; no `.skip`, `.only`, `it.todo`, `xit`, `expect(true)`, `toBeTruthy`, `toBeDefined`, or `not.toThrow` added. Finding R5-F001 is a wrong-contract assertion, not an assertion-theater issue. |
| Cross-provider result shape | All providers return the same top-level shape; `diagnostic` is optional and value-free. AWS remains the only contract gap because the role credential branch is incomplete. |
| Stripe live/test detection | `sk_test_` is placeholder-gated case-insensitively via lowercase prefix matching; `STRIPE_SECRET_KEY` shape regex only accepts lower-case `sk_live_`/`sk_test_` prefixes, so mixed-case `Sk_Live_...` fails closed to `STUB`. |
| Error paths/secrets | Diagnostics mention env-var names only; no provider secret values are interpolated into error/diagnostic text. |
| Determinism | Provider order follows `PROVIDERS`; env lookups are by explicit var arrays, not object property iteration. |
| Imports | Implementation imports only `fs`, `path`, and `typescript`; no sibling scanner imports. |

VERDICT: FINDINGS
