# HK-5a R3 Fixer Brief (single-finding contrast fix)

**Target PR:** #225 — `hk/PR-HK-5a-coach-ai-panel`
**Base SHA (R2):** `aad8931848c701720a6f1ca68436d2c66501e694`
**Worktree:** `/tmp/wt-hk5a` (already at this SHA)
**Model:** Opus 4.8
**Commit author:** `Dynasia G <dynasia@trygrowthproject.com>` — title-only, NO Co-Authored-By, NO Generated-By
**Audit verdicts:** both R2 audits (code GPT-5.5 + visual Opus 4.8 fresh) = NEEDS_FIX on a single P2 contrast finding. Everything else CLEAN.

R0 LAW: NO "Coming soon" literal anywhere in the diff (production, tests, test titles, regex), NO `@ts-ignore`/`@ts-nocheck`/`as any`/`as unknown as`/empty-catch/`.catch(()=>undefined)`/spinner-only empty states.

---

## Sole finding to fix

**F1 (P2)** — Warm `accentInk` token still fails WCAG AA at 4.39:1 (needs ≥4.5:1 for normal-size text).

**File:** `src/screens/client/wearables/wearablesTheme.ts`
**Lines:** ~30–55 (the `WARM` tone literal and the `ToneTokens.accentInk` declaration).

**Current state (R2):** `WARM.accentInk = gold[700]` (`#8A6A2A`). Independent computation:
- `#8A6A2A` on `bone #F5EFE4` = **4.394:1** (FAIL — needs 4.5:1)
- `#8A6A2A` on `cream #F1E8D5` = **4.130:1** (FAIL)
- `bone` text on `#8A6A2A` CTA fill = **4.394:1** (FAIL)
- `#8A6A2A` on the 10%-camel-tinted card = **4.024:1** (FAIL)

**Fix:** swap `WARM.accentInk` to `gold[800]` (`#6B4F1A`). Recomputed:
- `#6B4F1A` on `bone` = **6.652:1** (PASS)
- `#6B4F1A` on `cream` = **6.251:1** (PASS)
- `bone` on `#6B4F1A` CTA fill = **6.652:1** (PASS)
- `#6B4F1A` on tinted card = **6.092:1** (PASS)

`gold[800] = #6B4F1A` already exists in `src/theme/tokens.ts:127`. No new palette entries needed.

### Patch

```ts
// wearablesTheme.ts
const WARM: ToneTokens = {
  accent: colors.camel, // clay/amber warm accent (#B08D57) — hairline borders/icons only
  accentInk: gold[800], // AA-safe (≥6.25:1) on bone/cream + as fill behind bone text
  tint: withAlpha(colors.camel, 0.1),
  glow: withAlpha(colors.mutedGold, 0.6),
  track: withAlpha(colors.camel, 0.16),
};
```

(`COOL.accentInk = colors.forest` is correct and unchanged — forest on bone = 8.575:1.)

### Update the inline comment

The R2 patch's comment claimed `gold[700]` was "≈5.10:1 on bone" — that was wrong. Replace with verified numbers:

```ts
// AA-safe (6.65:1 on bone / 6.25:1 on cream) — used as on-light text/link colour
// AND as filled-CTA background behind bone text.
```

---

## OUT OF SCOPE (do NOT touch)

- Any other file. Only `wearablesTheme.ts` should change.
- Do NOT modify `WearableInsightPanel.tsx`, tests, hook, or API — the F2/F3/F4/F5/F6/F7 fixes from R2 are all CLEAN; only the warm `accentInk` constant is wrong.
- Do NOT add new tests — the existing visual contract tests (if any) still pass; the change is a single token swap that affects no test assertions.

---

## Gates BEFORE reporting CLEAN

1. `npx tsc --noEmit` → exit 0
2. `npx eslint src/screens/client/wearables/wearablesTheme.ts` → exit 0
3. `npx jest --testPathPattern='(WearableInsightPanel|useWearableInsight|HealthFitnessTab|SleepRecoveryTab|wearableInsightsApi)' --runInBand` → exit 0, no "did not exit" warning, same suites/test counts as R2 (5 suites / 37 tests).
4. R0 added-line sweep:
   ```bash
   git diff origin/main..HEAD -- '*.ts' '*.tsx' | grep '^+' | grep -v '^+++' \
     | grep -niE 'coming soon|@ts-ignore|@ts-nocheck|as any|as unknown as|\.catch\(\(\) => undefined\)|catch\s*\([a-z_]*\)\s*\{\s*\}'
   ```
   Must return empty.
5. `git log -1 --format='%an <%ae>%n%B'` → `Dynasia G <dynasia@trygrowthproject.com>`, title-only.

## Deliverables

- Single commit. Conventional title: `fix(wearables): HK-5a R3 — bump warm accentInk to gold[800] for AA contrast`.
- Push to `hk/PR-HK-5a-coach-ai-panel` (rebase only if origin moved; this branch shouldn't have moved).
- Write `/home/user/workspace/_fixer_result_HK_5a_R3.md` with: new HEAD SHA, gate results, R0 sweep result, contrast-computation summary, no-deviations note.
- R64: copy that result to `/tmp/tgp-agent-context/applehealthkit/expansion/`, commit as Dynasia G, push (use `api_credentials=["github"]`).

Begin.
