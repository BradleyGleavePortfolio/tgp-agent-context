# 1. M-NEW-ONBOARDING — Coach Scout Wizard UI and Operator-Assist Mode

**Slug:** `M-NEW-ONBOARDING`  
**Target prod LOC:** ~600 React/Next/tRPC UI LOC.  
**R76 status:** intentionally over 400; requires `[LOC-EXEMPT: onboarding-two-surface-ui]` and R86 no-waste block.

## 2. Doctrine cites

- R0/R3: commits must be Bradley Gleave authored and committed, with no AI/agent/co-author tokens.
- R74/R86: tests must cover real wizard/operator-assist failures; no shallow render padding.
- R76/R86: ~600 prod LOC exceeds the normal cap because one shippable onboarding UX has two coupled surfaces: coach wizard and operator-assist live intervention.
- R98: credentials, OTPs, cookies, emails, and client previews are PII/secrets; never log raw values and never render cookies.
- R107: every credential submission, MFA response, scout start/abort, operator intervention, and kill-switch flip must be audit-logged through H6A-backed backend routes.
- R125: all scout status/read routes are Tier-1 coach-scoped; operator surface requires operator role and audited access.
- D-8 / M-NEW spine: onboarding is P0 in v0 and exposes generic scout profiles, not vendor-specific code paths.
- Operator override doctrine: default `scout_authorized=true`; operator can flip `operator_overrides.scout_authorized=false`, in-flight runs abort at next checkpoint within 30s, and PG NOTIFY hot-reloads within 2s target.

## 3. Dependencies

Must land first:

1. **H6A/H6B/H6C** audit and breaker substrate.
2. **M-NEW-SCHEMA** tables and RLS.
3. **M-NEW-SUBSTRATE.A** profile loader so the wizard can list vendor profiles and auth fields.
4. **M-NEW-SUBSTRATE.C** session pool + MFA/device-trust handling.
5. **M-NEW-SUBSTRATE.E** kill-switch + PG NOTIFY hot-reload.
6. **M-NEW-SUBSTRATE.F** onboarding backend tRPC routes: scout-now, MFA challenge response, status polling, abort.

Should land first if available:

- **M-NEW-SUBSTRATE.D** diff engine for richer review page status.
- **M-NEW-RECONCILER** for canonical preview counts on `/onboarding/scout/review`.

## 4. What this slice ships

File inventory and LOC budget:

| File | Purpose | Prod LOC budget |
|---|---|---:|
| `src/app/onboarding/scout/page.tsx` | Coach wizard: platform picker, credential/export fields from profile, scout-now CTA, safe-mode copy. | ~145 |
| `src/app/onboarding/scout/mfa/page.tsx` | MFA/OTP/device-trust challenge UI with 90s timer, resend/abort states, no secret logging. | ~105 |
| `src/app/onboarding/scout/review/page.tsx` | Live progress and review handoff: found counts, warnings, conflict count, next action. | ~115 |
| `src/app/admin/scout/[coach_id]/live/page.tsx` | Operator-assist live surface: in-flight run, MFA intervention, abort, kill-switch flip. | ~145 |
| `src/components/scout/ScoutStatusTimeline.tsx` | Shared timeline component for coach and operator surfaces. | ~45 |
| `src/components/scout/MfaChallengeCard.tsx` | Shared MFA card with redacted challenge context. | ~35 |
| `src/lib/scout/onboardingCopy.ts` | Small copy/status mapper; no vendor hardcodes. | ~10 |

**Total prod LOC budget:** ~600.

## 5. Public API contract

This UI consumes backend routes from `M-NEW-SUBSTRATE.F` and operator routes from `M-NEW-SUBSTRATE.E`:

```ts
// Coach routes
trpc.scoutProfiles.list.useQuery(): {
  vendor: string;
  displayName: string;
  authFields: Array<{ key: string; label: string; type: 'email' | 'password' | 'text' | 'file' }>;
  sourceModes: Array<'export_upload' | 'browser_scout' | 'copilot' | 'support_assisted'>;
}[];

trpc.scoutOnboarding.start.useMutation({
  vendor: string;
  sourceMode: 'export_upload' | 'browser_scout' | 'copilot' | 'support_assisted';
  credentials?: Record<string, string>;
  uploadIds?: string[];
}): { scoutRunId: string; next: 'mfa' | 'review' | 'blocked_by_operator' };

trpc.scoutOnboarding.submitMfa.useMutation({
  scoutRunId: string;
  challengeId: string;
  code: string;
}): { accepted: boolean; next: 'review' | 'mfa' | 'failed' };

trpc.scoutOnboarding.status.useQuery({ scoutRunId: string }): ScoutRunLiveStatus;
trpc.scoutOnboarding.abort.useMutation({ scoutRunId: string }): { aborted: boolean };

// Operator routes
trpc.adminScout.live.useQuery({ coachId: string }): AdminScoutLiveState;
trpc.adminScout.submitMfa.useMutation({ coachId: string; scoutRunId: string; challengeId: string; code: string }): { accepted: boolean };
trpc.adminScout.setOverride.useMutation({
  coachId?: string;
  vendor: string;
  key: 'scout_authorized' | 'force_copilot' | 'profile_disabled';
  value: boolean;
  reason: string;
}): { overrideId: string; notifyPublished: boolean };
```

UI behavior contract:

- `/onboarding/scout` never asks for fields not declared by the selected scout profile.
- `/onboarding/scout/mfa` accepts TOTP/SMS/email OTP within 90s and supports operator-assisted intervention without exposing stored secrets.
- `/onboarding/scout/review` shows live progress, partial results, warnings, and a single next action.
- `/admin/scout/[coach_id]/live` is operator-only, audited, and can flip the kill-switch.

## 6. Database changes

None directly in this UI slice.

Required database behavior from dependencies:

- Reads `scout_runs`, `scout_results`, `scout_diffs`, `operator_overrides`, and redacted `scout_audit_events` through tRPC only.
- Does not read `session_cookies` directly.
- Kill-switch writes go to `operator_overrides` through audited backend route.
- MFA responses are not stored as plaintext; backend may write redacted audit events only.

## 7. Test strategy targeting REAL failure modes

Required tests:

1. `test/scout/onboarding.profile-fields.spec.tsx`
   - Given a profile with password auth and MFA, the wizard renders only declared auth fields and source modes.
   - Prevents hardcoded vendor field drift.
2. `test/scout/onboarding.mfa-timeout.spec.tsx`
   - MFA timer expires at 90s, disables submit, and offers retry/abort without preserving OTP in component state after unmount.
3. `test/scout/onboarding.operator-guard.spec.tsx`
   - Non-operator cannot load `/admin/scout/[coach_id]/live`; operator can see redacted live state.
4. `test/scout/onboarding.kill-switch.spec.tsx`
   - Operator flips `scout_authorized=false`; UI shows blocked state and does not allow new coach scout start.
5. `test/scout/onboarding.no-secret-render.spec.tsx`
   - DOM and mocked log sink do not contain plaintext password, OTP, or cookie material after submit.

Padding rejected: button snapshot tests, duplicate loading-spinner tests for each page, and tests that mock every tRPC route but assert no behavior.

## 8. R86 anti-padding exception block

This slice is expected to exceed R76. Builder must add `[LOC-EXEMPT: onboarding-two-surface-ui]` to PR title and paste:

```md
[LOC-EXEMPT: onboarding-two-surface-ui]
R86 LOC EXCEPTION REQUESTED
| File | LOC | No-waste justification |
|---|---:|---|
| src/app/onboarding/scout/page.tsx | ~145 | Coach-facing P0 platform/auth/source-mode entry surface; cannot be split without shipping unusable onboarding. |
| src/app/onboarding/scout/mfa/page.tsx | ~105 | MFA/device-trust intervention is P0 for rising MFA enforcement and must be live in v0. |
| src/app/onboarding/scout/review/page.tsx | ~115 | Live progress/review is the coach trust moment and handoff to reconciliation. |
| src/app/admin/scout/[coach_id]/live/page.tsx | ~145 | Operator-assist mode is explicitly P0 for white-glove onboarding and kill-switch control. |
| src/components/scout/ScoutStatusTimeline.tsx | ~45 | Shared component removes duplication across coach/admin pages. |
| src/components/scout/MfaChallengeCard.tsx | ~35 | Shared redacted MFA UI removes duplication and secret-render risk. |
| src/lib/scout/onboardingCopy.ts | ~10 | Centralizes status copy; no vendor hardcodes. |

Split-feasibility: splitting coach wizard and operator-assist would violate the operator's P0 requirement that onboarding be accessible to coaches and to Bradley's live assist calls in v0. The shared MFA/status components keep the over-cap slice smaller than two duplicated sub-slices.
```

If R74 ratio is below 2.0, also add:

```md
[TEST-EXEMPT: anti-padding-onboarding-real-failure-modes]
R86 TEST EXCEPTION REQUESTED
- Real failure modes covered: profile-driven field rendering, MFA timeout, operator route guard, kill-switch blocked state, secret non-rendering.
- Padding rejected: snapshot-only page tests, spinner-only tests, duplicate mocked route tests.
- Split feasibility: see LOC exception; surfaces are coupled by the same live scout state and MFA intervention path.
```

## 9. Out of scope

- No backend tRPC route implementation; consumed from `M-NEW-SUBSTRATE.F/E`.
- No profile YAML parsing.
- No scout runner, reconstructor, or canonical commit logic.
- No billing migration UI.
- No vendor-specific copy beyond profile-provided display names.
- No storage or display of plaintext cookies/passwords.

## 10. CI verification gates

- `npm run lint`
- `npm run typecheck`
- `npm test -- scout/onboarding`
- Route auth tests for `/admin/scout/[coach_id]/live`.
- R75 banned-cast token gate: net +0.
- R74 density gate or valid `[TEST-EXEMPT: ...]` block.
- R76 gate with required `[LOC-EXEMPT: onboarding-two-surface-ui]` and R86 table.
- Accessibility smoke check for form labels, focus management, and error text.
- Secret scan proving no password/OTP/cookie values in DOM snapshots or logs.

## 11. VERDICT line

VERDICT: <builder fills after implementation>
