# A5 · White-label multi-tenant (scope-cut)

**Status:** SCAFFOLD (foundation present, theme layer + opt-in flow outstanding)
**Owner:** *(set by operator on agent dispatch)*
**v2 source:** [`TGP-MASTER-PLAN-v2.md`](https://github.com/BradleyGleavePortfolio/tgp-agent-context/blob/main/roadmap/TGP-MASTER-PLAN-v2.md) §1.A A5 *(promoted from old Bucket B3 on 2026-06-19 dissolution pass)*
**Tier/lane:** Tier 4 / T4.A5
**Rank rationale:** Operator: "super important, but only to colors + name/logo work, nothing huge — also should be a side flow, not the default." Folded into Bucket A as part of dissolution pass.

---

## State of build

**SCAFFOLD.** Foundation present:
- `CommunityWorkspace` model
- `landing-pages/custom-domain.controller`, `custom-domain.service`, `dns-verifier`
- RLS tier 1–5 (precondition)
- `Role.owner`

## Operator scope cut

**IN (this scope):**
- Colors + name + logo only
- Clean, luxurious, dead-simple upload
- Opt-in toggle (default UX stays TGP-branded)

**OUT (this scope):**
- App-store-per-tenant (separate Apple/Google developer accounts)
- Full per-tenant data partitioning beyond RLS
- Custom domain (already exists via `custom-domain.service`)

## What to build

- Theme configuration table (`TenantTheme` or per-coach-team theme columns): `brand_color_primary`, `brand_color_secondary`, `logo_url`, `display_name`, `opt_in_at`
- Logo upload + crop + validation (luxury bar: rendering checks)
- Live preview on coach dashboard + client app
- Render path: when opt-in is on, swap brand surfaces (header, splash, push templates) for the tenant's
- Reversibility: opt-out instantly reverts

## Acceptance criteria

- [ ] `TenantTheme` schema migrated + RLS policy
- [ ] Logo upload UI: drag-drop, crop, validation (min size, aspect, transparency check)
- [ ] Live preview renders inline (no save-and-reload)
- [ ] Opt-in toggle in coach settings; default OFF
- [ ] Render path swaps header + splash + push templates when opt-in ON
- [ ] Opt-out: revert is instant (no cache lag)
- [ ] All PRs dual-CLEAN

## Doctrine flags

- **RLS tier:** standard (theme rows scoped to tenant)
- **Idempotency:** logo upload retry-safe
- **Audit events:** opt-in toggle and logo changes emit `AuditEvent`
- **Voice/UI:** Maya voice on settings UI. Luxurious bar — no consumer-grade affordances.

## Dependencies

- **Blocks:** nothing further in Tier 4
- **Blocked by:** Tier 1–3 gates

## Operator decisions (locked)

> "only to colors + name/logo work, nothing huge — also should be a side flow, not the default — but still, when opted in, needs to be dead simple, easy to upload logos and customize, clean and luxurious."
> *(Dissolution pass 2026-06-19: dissolved B → A.)*

## Previous-operator working notes

*First operator on this item appends here.*
