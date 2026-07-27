# P0-AUDIT — Lens B (process / contract / ops / governance) — backend SHA `5076a07a`

**Rung:** `P0-AUDIT` ([`OWNERSHIP_AND_PR_LADDER.md` §3](../op74/OWNERSHIP_AND_PR_LADDER.md)) ·
**Subject:** `5076a07a1e54b14e3db84d3aa128fb0bb44542d7` (PR #520) ·
**Companion:** [Lens A](P0-AUDIT-A-5076a07a.md) ·
**Date:** 2026-07-27 · **Operator:** Bradley Gleave \<bradley@bradleytgpcoaching.com\>

## VERDICT: FINDINGS — 0 P0 · 2 P1 · 2 P2 · 2 P3

Lens B exists to discharge blockers **B1** and **B2**. Both are **recorded, not repaired**: the
commit is published on shared `main`, and R3-INC-1 precedent plus R5 forbid rewriting it. This
document *is* the missing artifact.

---

## BUILD MATRIX (R124)

Identical to [Lens A](P0-AUDIT-A-5076a07a.md#build-matrix-r124). Backend HEAD verified both ways
as `5076a07a1e54b14e3db84d3aa128fb0bb44542d7`; context at `b76d0962`. No drift, no INFRA_DEATH.

---

## Findings

### P1-1 — R3 identity violation on a money-path commit published to shared `main` (blocker B1)

```
author    = BradleyGleavePortfolio <264851314+BradleyGleavePortfolio@users.noreply.github.com>
committer = BradleyGleavePortfolio <264851314+BradleyGleavePortfolio@users.noreply.github.com>
```

R3 requires **both** author and committer to be `Bradley Gleave
<bradley@bradleytgpcoaching.com>`. Both are wrong here — this is not a committer-only slip.

Already recorded as **R3-INC-4** in [`DECISION_LOG.md`](../../DECISION_LOG.md) with
status `OPEN_ACCEPTED_NOT_FIXED`. Lens B **confirms that disposition rather than reopening it**.
The remedy is record-only:

- **No force-push, no rebase, no amend.** Precedent R3-INC-1 (extension #5 `5eabeec`) and
  R3-INC-2 (backend #509 `1718293`) were both grandfathered on the same reasoning: rewriting a
  published `main` is a larger integrity loss than the identity defect it repairs, and R5
  forbids losing the record.
- The commit message itself is **clean** — 0 AI / agent / Claude / Anthropic / `Co-Authored-By`
  tokens. The violation is confined to the identity trailers.
- The identity-safe path is proven and already documented in
  [`R3_MERGE_RUNBOOK.md`](../importer-wave/R3_MERGE_RUNBOOK.md) (backend PR #508 →
  `95e2c637`, author **and** committer both Bradley). Every subsequent backend landing uses it.

**Route to:** closed as recorded. No rung. **Blocker B1 stays open by design** — it is a
permanent historical marker, not a work item.

---

### P1-2 — No R14 audit trail and no R138 Decision Record existed for a money-path change (blocker B2)

`5076a07a` mounts a guard that can return `403` on **every** authenticated route in the product.
It is, by any reading, a money-path and blast-radius-maximal change. At the time of this audit no
R14 dual-lens report and no R138 Decision Record were discoverable for it anywhere in the context
repo — confirmed by `DECISION_LOG.md`, which records exactly that absence and defers the remedy
to this rung.

The gap is not that the change was bad. Lens A finds **0 P0** and the two most dangerous
properties (flag-OFF hard no-op, fail-open on lookup error) both hold. The gap is that **nothing
established that before it landed**, so the safety was accidental from the reviewer's point of
view.

**Remedy — discharged by this rung:** Lens A + Lens B, produced against the exact head, with a
R124 BUILD MATRIX and explicit verdict lines. Retroactive R138 reconstruction below.

**Route to:** **B2 CLOSED** on landing of this audit pair. The backend ladder is unblocked from
`I1` onward.

#### Retroactive R138 four-question gate (reconstructed, `5076a07a`)

| # | Question | Reconstructed answer |
|---|---|---|
| 1 | What is the smallest change that delivers the value? | Mounting the already-written, already-tested `DunningLockoutGuard` as the terminal `APP_GUARD`. The guard existed; only the mount was new. Genuinely minimal. |
| 2 | What could this break? | Every authenticated route — the guard is global. Mitigated by the flag-OFF hard no-op (`:80`) and fail-open (`:99-105`). Both verified in Lens A. |
| 3 | Is it reversible? | Yes, two ways: delete one `APP_GUARD` provider line, or leave `FEATURE_DUNNING_V2` unset. The flag is the live rollback and it is the default. **No migration, no data write** — the guard is read-only. |
| 4 | What evidence proves it works? | 14 unit cases (`test/dunning-v2-lockout-guard.spec.ts`, 167 lines) + 10 over-the-wire e2e cases (`test/dunning-v2-lockout-guard.e2e.spec.ts`, 307 lines) covering flag-OFF no-op, 403 on protected routes, billing/auth/health not bricked, `/roman/*` reachable, `/ai/chat` still locked, envelope contents. **Gap:** no case asserts the allow-list against the repo's real controller table — which is exactly how Lens A **P1-1** survived review. |

Question 4's gap is the concrete lesson. The tests assert the allow-list against *hand-picked
example paths*, never against the mounted route table, so a route that accidentally matches was
unobservable. That test shape is a requirement on **DUN-1**.

---

### P2-1 — `FEATURE_DUNNING_V2` is registered in no switch registry, and R108's CI gate structurally cannot catch it

`FEATURE_DUNNING_V2` is **absent from all three** registries:

| Source | Present? |
|---|---|
| `prod-switches.yml` (226 switches) | **no** |
| `.env.example` (892 lines) | **no** |
| `src/common/env-validation.ts` ENV_RULES | **no** |

R108 is enforced by `test/prod-readiness/env-discovery.ts`, which fails the build when discovery
exceeds the registry. It does not fire here because of *how the flag is read*
(`src/checkout/dunning-v2/dunning-v2.feature.ts:34-36`):

```ts
export const FEATURE_DUNNING_V2_ENV = 'FEATURE_DUNNING_V2';
export function isDunningV2Enabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return (env[FEATURE_DUNNING_V2_ENV] ?? '').toLowerCase() === 'true';
}
```

The discovery scanner is **node-scoped to `process.env.*` / `process['env'].*`**
(`env-discovery.ts:196`). Here the read is `env[...]` on a **function parameter**; `process.env`
appears only as a default-parameter value with no property access. The flag is therefore
invisible to discovery, discovery never exceeds the registry, and CI stays green. This is not a
scanner bug — it is a legitimate blind spot of an injectable-env pattern that the registry
convention does not model.

That the pattern is known makes the omission sharper: the importer flags **are** registered, with
the read style spelled out in the description —

```yaml
- name: FEATURE_SCOUT_INGEST
  description: "Scout ingest feature flag (IMPORTER). Read via process.env[FEATURE_SCOUT_INGEST]; default OFF until rollout."
```

— while the master switch for a billing state machine has no row at all. No live risk today
(absent ⇒ OFF, which is the intended posture), but at **Gate B** the operator has no registry
entry to flip, no declared `prod_default`, and no owner.

**Route to:** **DUN-1** — add the `prod-switches.yml` row (`tier: feature`, `prod_default: OFF`,
`auto_flip_on_in_prod: false`, `owner: billing`) plus the `.env.example` entry. Separately, the
injectable-env blind spot should be raised as a registry-convention item so other
`isXEnabled(env = process.env)` flags are audited; it is a **cross-cutting concern, not W-IMP or
W-DUN property scope**.

---

### P2-2 — No declared SLO or audit event for a guard on the universal request path

The guard adds a per-request DB round trip on the hot path with the flag ON (Lens A **P2-3**),
emits no `AuditEvent` on a lockout 403, and has no declared p99 or error budget. R107 wants the
audit record; `R-DUNNING-BAR-1` **P5** wants the SLO. Neither exists at this head. A locked-out
403 is currently unobservable in the audit log — an operator cannot answer "who was locked out,
when, and why" from anything but application logs.

**Route to:** **DUN-4**.

---

### P3-1 — LOC and test:src ratios are not independently recomputable at this head

The managed worktree is a depth-1 partial clone (`git rev-list --count HEAD` = 1), so the
`5076a07a` parent tree is unavailable and the PR-#520 diff cannot be reconstructed locally.
R23/R76 (≤ 400 prod LOC) and R74 (test:src ≥ 2.0) therefore cannot be recomputed from the
worktree, and no recorded measurement exists to fall back on.

Absolute file sizes at the head are consistent with compliance and are recorded as the best
available proxy:

| File | Lines |
|---|---|
| `src/checkout/dunning-v2/dunning-lockout.guard.ts` | 171 |
| `test/dunning-v2-lockout-guard.spec.ts` | 167 |
| `test/dunning-v2-lockout-guard.e2e.spec.ts` | 307 |

474 test lines against a 171-line guard is ≈ **2.77:1**, comfortably over R74's 2.0 — but the
commit also touched `src/app.module.ts`, so this is an indication, **not** a measurement.
Recorded as P3 rather than asserted as a pass: per `R-DUNNING-BAR-1` §2, *status is derived,
never asserted*, and an unverifiable ratio must not be reported as green.

**Route to:** no rung. Future landings must record measured LOC and test:src in the PR body so
the number survives a shallow clone.

---

### P3-2 — Branch protection absent on the backend repo (blocker B3)

Recorded for completeness; unchanged by this rung. The absence of branch protection is the
mechanism by which a non-R3 identity reached shared `main` in the first place (**P1-1**). Until
B3 is resolved, R3 compliance rests entirely on operator discipline, and R3-INC-5 is a
question of when, not whether.

**Route to:** ops track; gates Gate A, Gate B, `DUN-11`, `I7`.

---

## Checks passed

- **Commit message hygiene (R3)** — 0 AI / agent / Claude / Anthropic / `Co-Authored-By` tokens
  in subject or body. The message accurately describes the change, names the flag posture
  ("`FEATURE_DUNNING_V2` is NOT flipped"), states the `/roman/*` scoping decision and its
  rationale, and documents the `lockout_copy` envelope behaviour honestly rather than claiming
  delivery. It cites PR #520.
- **Flag posture (R-DARK-1)** — `FEATURE_DUNNING_V2` default-OFF and enabled only on the exact
  string `'true'`. No auto-enable, no allowlist variant, no partial rollout. Correct for a
  billing state machine.
- **Rollback (R82/R106)** — no migration in this commit, so no expand-contract or down-migration
  obligation. Rollback is unsetting one env var; the guard is read-only and writes no state.
- **Contract (R80)** — `docs/contracts/importer-openapi.json` untouched. This commit does not
  enter W-IMP territory at all. No contract drift.
- **Ownership (Op 74 §1)** — the commit predates Op 74 but is retro-consistent with W-DUN's OWNS
  list (`src/checkout/dunning-v2/**`) plus the `app.module.ts` §2 serialization point. It does
  not touch `src/scout/**` or `src/import/**`.
- **Quarantine (B4)** — `build-sbom` and `release-please` remain RED and were not folded into
  this product commit.
- **No secrets** — no credential, key, or provider token in the diff surface, tests, or message.

---

## Rung disposition

**P0-AUDIT is discharged by this pair of documents.**

| Blocker | Before | After |
|---|---|---|
| **B1** — R3-INC-4 identity | open, unrecorded audit | **open by design**, permanently recorded, no history rewrite |
| **B2** — no R14 / R138 trail for `5076a07a` | open, **blocks all backend rungs** | **CLOSED** — dual-lens audit + retroactive R138 gate landed |
| **B3** — branch protection / secrets | open | unchanged (ops track) |
| **B4** — `build-sbom` / `release-please` RED | open | unchanged, quarantined |
| **B5** — email credentials | open | unchanged |
| **B6** — R127–R129 gap | permanent | unchanged, never renumbered |

With **B2** closed, the next permitted backend rung is **I1** (per §3's suggested order
`P0-AUDIT → I1 → DUN-1 → …`). The six Lens A + Lens B findings routed to `DUN-1`/`DUN-3`/`DUN-4`/
`DUN-9` are **preconditions of Gate B**, not of `I1`.

**Nothing in this rung authorizes a build, a merge, a flag flip, or a completion claim.**
`FEATURE_DUNNING_V2` remains default-OFF.

---

*Author: Bradley Gleave \<bradley@bradleytgpcoaching.com\> (R3). Audit evidence only; 0 production LOC.*
