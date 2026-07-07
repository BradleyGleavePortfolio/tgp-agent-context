# HANDOFF — Wave 2 (Op 52)

**Author:** Op 52 / Wave-2 orchestrator
**Operator:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Successor label:** Agent 53
**As of:** 2026-07-07T17:10:00Z (10:10 AM PDT)
**Session canonical thread:** https://www.perplexity.ai/computer/tasks/98c6871b-d8a1-4e68-9334-bd176080521f

---

## 1. What Op 52 delivered

### 1a. Product-level pivot confirmed on the record
- **TGP is a mobile app**, not a web app. Confirmed by operator directly this session.
- Desktop extension cannot share cookies/origin with the mobile app → the bridge is a **6-digit pairing code** entered manually by the coach into the extension.
- **Site-agnostic vision** re-confirmed: extension captures JSON as it loads on any site → routes to TGP DB. No per-platform Day-1 tooling. Popup lives in browser always. Sign-in via pairing code. Data goes to that account.
- In-app "Install extension" CTA: **deferred** to v0.3.5 per operator direction.

### 1b. DESIGN v0.3 landed (PR #2 in tgp-importer-extension)
- Retired inline password/OAuth-window flow from v0.2.
- Adopted mobile-initiated 6-digit pairing code (RFC 8628 style, but 6 digits not URL-encoded pairing code).
- 11-step flow spec'd end-to-end.
- Head SHA at wave-2 fix completion: `ac774ee500192893af22d6c998335ad221e3c808`.

### 1c. R3-CLARIFY-1 ruling landed in context repo
- File: `roadmap/rulings/R3-CLARIFY-1_2026-07-06.md` (SHA `d11da64b`).
- Rationale (operator quote): "the fact that any word containing ai is flagged is insanioty — but why does ai need to be banned anyways?"
- Canonical anchored patterns replace raw substring scan.
- Substrings like "chai", "fail", "aix", "maintain", "domain" inside English words are **not** violations.

### 1d. Five PRs opened + audited + patched (see §3 for the full table)

### 1e. Wave-1 builder rescue completed
- 3 backend builders (scout/ingest, pairing, progress+complete) finished during the overnight sandbox pause.
- All committed under R3 identity and pushed on their own.
- Rescue tar snapshot preserved at `/home/user/workspace/tgp-parallel-run/rescue-20260707T164017Z/` as forensic insurance.
- Wave-1 builder subagents cancelled cleanly.

---

## 2. Doctrine bindings still in force

Every subagent + successor must obey without exception:

- **R3** — author + committer = `Bradley Gleave <bradley@bradleytgpcoaching.com>`.
- **R3-CLARIFY-1 (2026-07-06)** — anchored regex only. See ruling above.
- **R-META-4** — `claude_opus_4_8` fixers/builders + `gpt_5_5` auditors only. Sonnet/Haiku/Gemini forbidden.
- **R11** — Lens A / Lens B use independent `/tmp/*_lens_{a,b}/` clones.
- **R14/R15** — no merge until CLEAN of P0-P3.
- **R72** — dual-lens on every P0-P3 PR.
- **R74** — test:src ≥ 2.0 (waiver floor 1.74).
- **R76** — net prod LOC ≤ 400 unless `[LOC-EXEMPT: <reason>]` in title.
- **R80** — `extractors/_interface.js` is envelope truth. Backend DTOs conform.
- **R124** — verify `gh api head.sha == git rev-parse HEAD` before every push/merge.
- **R137** — wave closes with `handoffs/importer-wave/postmortem.md`.

Immutable data-plane assertions:
- **TGP is a mobile app** (not web).
- **Ruling #9 (2026-06-27)**: M-NEW-LIVE substrate SHELVED. Browser extension canonical.
- **Never propose**: F1 (AI video form analysis, killed), Bucket B dissolution, non-importer waves.

---

## 3. Open-PR ledger (verified live on GitHub at 2026-07-07T17:10Z)

| # | Repo | Branch | HEAD | Wave-2 status | Next action |
|---|---|---|---|---|---|
| **#1** | tgp-importer-extension | `feat/capture-ring-buffer` | `126bcd5a` | PATCHED (12 fixes: 5 P1 + 6 P2 + 1 P3). CI 2/2 green. | Re-audit (dual lens). |
| **#2** | tgp-importer-extension | `docs/design-v0.3-pairing-flow` | `ac774ee5` | PATCHED (21 fixes: 4 P1 + 13 P2 + 4 P3). Docs-only, no CI. | Re-audit (dual lens). |
| **#500** | growth-project-backend | `feat/scout-progress-and-complete` | `3506584b` | AUDITED — FAIL. Lens A P1=1 P2=1 P3=0; Lens B P2=1 P3=3. | Fixer round after operator ruling. |
| **#501** | growth-project-backend | `feat/scout-ingest-endpoint` | `14692496` | AUDITED — FAIL. Lens A P1=1 P2=1 P3=1; Lens B P2=1 P3=2. | Fixer round after operator ruling. |
| **#502** | growth-project-backend | `feat/extension-pair-endpoints` | `2a01ac82` | AUDITED — FAIL. Lens A P1=3 P2=1 P3=0; Lens B P2=3 P3=3. | Fixer round after operator ruling. |

Merge order once ALL clean:
1. **#2** (docs, no code deps)
2. **#1** (extension foundation)
3. **#501** (scout/ingest)
4. **#500** (progress+complete — shares FEATURE_SCOUT_INGEST with #501)
5. **#502** (pairing endpoints — depends on nothing in the others but ships together)

---

## 4. The one operator decision blocking dispatch

### `DARK_ROUTE_GUARD_ORDERING` — cross-cutting P2 on ALL 3 backend PRs

**Symptom:** Controller-scoped `FeatureFlagGuard` runs AFTER global `JwtAuthGuard` + `RolesGuard`. With flag OFF, unauth callers get 401 and non-coach callers get 403 — leaking that the endpoint exists. Only coach role sees the intended 404. Contradicts the "ships dark, indistinguishable from unmounted" contract documented on the guards themselves.

**Independently confirmed by:** Lens A + Lens B on #500; Lens A + Lens B on #501; Lens A on #502.

**Options:**
- **A) Fix repo-wide.** Move feature-flag guards to a global middleware or ExceptionFilter that runs before auth, converting any request against a disabled route to 404 regardless of caller identity. ~50 net LOC + tests. Most defensible against enumeration.
- **B) Waive.** Downgrade the "ships dark" contract to "coach gets 404, others get standard auth errors." Amend guard docstrings + DESIGN. Zero code change. Pragmatic given the extension is not secret.

**Recommended:** B unless you value enumeration-resistance highly. The extension repo is not obfuscated; an attacker already knows `/api/scout/*` endpoints exist as a class.

---

## 5. Other landmines to know about

### 5a. R80 envelope drift (PR #501 P1 — Lens A)
`extractors/_interface.js` in `tgp-importer-extension` is **internally inconsistent**:
- The **comment** says `{source_id, payload}` with provenance inside `payload`.
- The **executable `makeEntity()`** emits `{sourceId (camelCase), sourcePlatform, payload, capturedAt}` with provenance at top level.

Backend DTO/service implement the **comment**. Verbatim `makeEntity()` batches would 400 under the global `whitelist`+`forbidNonWhitelisted` pipe.

**Needs operator ruling OR fixer resolves by aligning `_interface.js` `makeEntity()` to match the DTO shape** (which is the R80 direction — DTO conforms to `_interface.js`; but here the source of truth itself is inconsistent, so someone must call the tie-breaker).

### 5b. PR #502 CI is currently RED (P1 — Lens A)
`init` and `status` handlers lack `@Roles('coach')`. `CoachGuard` alone doesn't satisfy the `roles-enforced.spec.ts` meta-test. Fix is trivial (add the decorator). Test:src also below the 2.0 floor (1.87) and 7 net banned `@ts-expect-error` casts without ticket refs.

### 5c. Server-side redaction (PR #501 P2 — Lens B)
`/api/scout/ingest` stores `entity.payload` verbatim as JSONB — redaction fully delegated to the untrusted extension client. Regression there = secrets at rest. Options: server-side sensitive-key denylist strip, or explicit operator waiver assigning redaction to extension only.

---

## 6. Where everything lives

### Wave-2 artifacts (workspace)
- Shared brief: `/home/user/workspace/tgp-parallel-run/wave2/SHARED_BRIEF.md`
- Fixer scopes: `.../wave2/FIXER_SCOPE_PR1.md`, `.../FIXER_SCOPE_PR2.md`
- Auditor template: `.../wave2/AUDITOR_TEMPLATE.md`
- Pinned heads at dispatch: `.../wave2/CURRENT_HEADS.md`
- Fixer patch logs: `.../wave2/fix_pr1/PATCH_LOG.md`, `.../fix_pr2/PATCH_LOG.md`
- Audit reports (6 files): `.../wave2/audit_pr{500,501,502}/lens_{a,b}_report.md`
- Verdict files: `.../wave2/audit_pr500/VERDICT.md` (Lens A wrote it despite instructions — that's the wave-2 outlier)

### Canonical spec (workspace)
- `/home/user/workspace/extension-docs/DESIGN.md.v0.3` (438 lines) — canonical DESIGN v0.3
- `/home/user/workspace/extension-docs/first-principles.md.v0.3`
- `/home/user/workspace/AUTO_DISCOVERY.md` (extension architecture)

### Context repo (cloned)
- `/home/user/workspace/tgp/tgp-agent-context/`
- Ruling: `roadmap/rulings/R3-CLARIFY-1_2026-07-06.md`
- Live state (this handoff pushed alongside): `handoffs/importer-wave/current-state.json`

### Rescue backup (insurance)
- `/home/user/workspace/tgp-parallel-run/rescue-20260707T164017Z/` (218 MB)
- Contains tarball + git metadata for all 3 wave-1 backend builders' worktrees at snapshot time.

---

## 7. Exact next-agent start sequence

```bash
# 1. Refresh context repo & read latest state
cd /home/user/workspace/tgp/tgp-agent-context && git pull
cat handoffs/importer-wave/current-state.json | jq .headline_status
cat roadmap/rulings/R3-CLARIFY-1_2026-07-06.md

# 2. Read the wave-2 audit findings for all 5 PRs
for lane in audit_pr500 audit_pr501 audit_pr502; do
  echo "=== $lane ==="
  cat /home/user/workspace/tgp-parallel-run/wave2/$lane/lens_a_report.md
  cat /home/user/workspace/tgp-parallel-run/wave2/$lane/lens_b_report.md
done

# 3. Verify no PR drift since handoff
gh api credentials=["github"]
for n in 1 2; do
  gh pr view $n --repo BradleyGleavePortfolio/tgp-importer-extension --json headRefOid,mergeable
done
for n in 500 501 502; do
  gh pr view $n --repo BradleyGleavePortfolio/growth-project-backend --json headRefOid,mergeable
done

# 4. Get operator ruling on DARK_ROUTE_GUARD_ORDERING (option A or B). See §4.

# 5. Once ruled + PR #501 R80 tie-break resolved (§5a):
#    Dispatch 3 parallel backend fixer subagents (claude_opus_4_8), scope = audit reports.
#    Then 6 parallel auditors (gpt_5_5) for backend re-audit + extension re-audit.

# 6. Once all 5 PRs CLEAN P0-P3: squash-merge in order #2 → #1 → #501 → #500 → #502.
#    R5-archive audits to audits/PR{N}-LENS-{A,B}-LIVE.<sha8>.archive.md.

# 7. Hand v0.3 Chrome-loadable build to operator via share_file.
# 8. Write handoffs/importer-wave/postmortem.md per R137.
```

---

## 8. Session-specific gotchas that bit us

1. **`gh pr edit` body fails silently** on repos with project associations. Use `gh api -X PATCH repos/.../pulls/N --input <(echo body_json)` instead.
2. **Codebase subagents cannot be messaged mid-run** — `message_subagent` rejects with "cannot be interrupted." Preload complete scope up front.
3. **`/tmp/claude_code_output.md` is a shared filename** across all codebase subagents. They clobber each other. Instruct auditors to write to lane-specific paths.
4. **Sandbox survives day-boundary pauses** — `/tmp`, subagent state, git worktrees, and running processes all persist. Verified across 2026-07-06 → 2026-07-07 gap: builders finished cleanly during the ~11-hour pause.
5. **R3-CLARIFY-1 required urgent operator ruling** because the pre-existing raw substring scan flagged "chai" (in "chain"), "aix" (in "prefix"), "fail" (everywhere). All future fixers must use the anchored regex from the ruling.

---

## 9. What's still open at handoff

- **Blocking:** operator ruling on `DARK_ROUTE_GUARD_ORDERING` (§4).
- **Blocking:** operator ruling OR fixer decision on `_interface.js` internal inconsistency (§5a).
- **After ruling:** backend fixer round (3 parallel), extension re-audit (2 parallel), backend re-audit (6 parallel), then merges in order.

**Verdict:** IN_PROGRESS. Ball is on the operator's side of the net.
