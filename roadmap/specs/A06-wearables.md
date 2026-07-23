# A6 · Wearable deep — full provider parity + recovery feed

**Status:** BUILT-BUT-DARK / ORPHANED-WIRING, DEFAULT-OFF (newest-wins, Op 73 · 2026-07-22) *(was: MOSTLY built (3 of 6 adapters PROD; 3 outstanding))*
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A6
**Tier/lane:** Tier 4 / T4.A6
**Rank rationale:** Operator **RED FLAG**: "Sleep data is a massive MOAT of ours, so we need to make sure ALL wearables are wired and working to hyperscaler quality!"

---

> **NEWEST-WINS SUPERSEDE (2026-07-22, Op 73 reconciliation — this block overrides the older `3 of 6 adapters PROD` framing above/below on conflict; historical prose retained, not rewritten).**
> Both the `3 of 6 adapters PROD` count and any "three unbuilt" shorthand are **imprecise and superseded by newest evidence.** The real inventory:
> - **Backend has EIGHT cloud OAuth provider adapters built**, but they are **dark behind `FEATURE_WEARABLES_CLOUD_CONNECTORS`** (default-off) — not live.
> - **Mobile has THREE on-device modules built** (`healthkit`, `healthConnect`, `samsungHealth`, coordinated via `onDeviceConnect`).
> - **Backend lacks on-device connection provisioning / normalizers** for those mobile on-device syncs — the mobile on-device path has no backend counterpart to provision connections or normalize samples.
> - **Mobile navigation / sync invocation is orphaned** — the sync hooks exist but are not reachably wired into navigation/invocation, so users cannot actually trigger them.
> - **4 providers are formally DEFERRED** (not in current scope).
> - **Do NOT conflate these wearable cloud adapters with the importer-wave adapters** (A2) — they are separate adapter surfaces with separate flags.
> **Default-OFF invariant holds; nothing is enabled.** "PROD" for any adapter here means code-present-behind-flag, not live. No completion claim. See `DECISION_LOG.md` (Op-73, 2026-07-22 · NEWEST-WINS RECONCILIATION) for the authoritative supersession map.

## State of build

**MOSTLY.** Apple/Google/Samsung shipped; Whoop/Oura/Garmin enumerated only.

**What's built:**
- `WearableConnection`, `WearableMetricDef`, `WearableSample`, `WearableProcessedEvent`, `WearableInsightCache`, `WearableUserMetricPreference`
- Mobile adapters: `services/health/{healthkit, healthConnect, samsungHealth, onDeviceConnect}`
- Hooks: `useHealthKitSync`, `useHealthConnectSync`, `useSamsungHealthSync`
- Community-side surfacing: `community/wearable-prompts/`

## What to build

- **Whoop adapter** (webhook + OAuth; their developer API)
- **Oura adapter** (REST polling or webhook)
- **Garmin adapter** (Connect IQ or webhook)
- **Coach client-card recovery-score badge** (green/yellow/red) in `ClientDetailScreen` / `CoachClientDetail`
- **Feed recovery score as primary signal into adaptive engine** (shared interface with A7)

## Acceptance criteria

- [ ] Whoop OAuth + webhook flow ships; round-trip test green
- [ ] Oura adapter ships; round-trip test green
- [ ] Garmin adapter ships; round-trip test green
- [ ] All 6 adapters write to same `WearableSample` schema (provider-agnostic downstream consumer)
- [ ] Recovery score badge renders on `ClientDetailScreen` and `CoachClientDetail`
- [ ] Shared `RecoverySignal` interface published for A7 consumption
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** standard (wearable samples scoped to user)
- **Idempotency:** webhook handlers must be retry-safe (dedup by provider event id)
- **Audit events:** wearable connect/disconnect emit `AuditEvent`
- **Voice/UI:** Maya voice on coach badge tooltip
- **Security:** OAuth tokens stored encrypted at rest; rotate per provider policy

## Dependencies

- **Blocks:** **A7** (closed-loop autopilot) — A7 cannot start until A6's shared `RecoverySignal` interface lands
- **Blocked by:** Tier 1–3 gates

## Operator decisions (locked)

> "RED FLAG — Sleep data is a massive MOAT of ours, so we need to make sure ALL wearables are wired and working to hyperscaler quality!"

## Open operator questions

- Whoop/Oura/Garmin: separate OAuth apps to register — operator decision on dev-account ownership.

## Previous-operator working notes

*First operator on this item appends here.*
