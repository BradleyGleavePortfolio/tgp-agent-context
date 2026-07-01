# PR #3 Builder Brief — Vault deposit/withdraw implementation

**Wave**: 0 (last foundation slice → first business-logic PR)
**Branch**: `pr3/vault-deposit-withdraw`
**Base**: `main` (HEAD `0cf90003f46080c52279b46329c6ee74326813f5`)
**Author identity (R3, LAW)**: `Bradley Gleave <bradley@bradleytgpcoaching.com>` — inline `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit ...` on every commit. **No** vendor tokens (claude/anthropic/openai/gpt/copilot/cursor/codex/perplexity/assistant/computer[- ]?agent/ai[- ]?agent/co-authored-by) in author/committer/message metadata — the R3 CI job greps and hard-fails.
**Builder**: Opus 4.8 (this brief).
**Auditors (after builder returns)**: **DUAL GPT-5.5** — Lens A (correctness + doctrine) and Lens B (security + runtime). Independent per R11. This is the first business-logic PR; foundational single-lens policy no longer applies.

---

## 0. Repository setup

Managed clone from `https://github.com/BradleyGleavePortfolio/zion-preserve`. Prepared by infrastructure as an isolated shallow sparse worktree — do not manually clone. Doctrine repo is a sibling read-only mount at `~/tgp-agent-context/` — read `AGENT_RULES.md` end-to-end and `AGENT_RULES_ZION_MAPPING.md` before touching any file. Doctrine SHA to pin against: `77a8b622d07628a413c728405cc9ef39d94f40b2`.

## 1. Scope

Replace the `NotImplemented()` reverts on `ZionPreserveVault.deposit` and `ZionPreserveVault.withdraw` with real, audit-ready implementations. Add all supporting share-accounting math, safety invariants, and tests. Nothing else. This is a **narrow, high-density PR** — every line has an audit target.

### 1a. Deposit — `deposit(uint256 usdcAmount) external whenNotPaused nonReentrant returns (uint256 sharesMinted)`

Behavior (exact):

1. **Input**: `usdcAmount` denominated in USDC's native 6-decimal units. Revert `ZeroAmount()` if `usdcAmount == 0`.
2. **Access**: no role required — public entry (any address may deposit their own USDC).
3. **Effects order (CEI, strict)**:
   a. Read `_totalAssets` (cached prior USDC managed by vault) and `_totalShares` (cached share supply).
   b. Compute `sharesMinted`:
      - First deposit (`_totalShares == 0`): `sharesMinted = usdcAmount` (1:1 seed, so share unit == 1e-6 USDC).
      - Subsequent deposits: `sharesMinted = mulDiv(usdcAmount, _totalShares, _totalAssets)` using OZ `Math.mulDiv(x, y, denom, Math.Rounding.Floor)` — **always round shares DOWN** so the vault never over-mints.
   c. Revert `ZeroShares()` if `sharesMinted == 0` (dust deposit that rounds to zero shares — reject rather than accept USDC for zero shares).
   d. Update state: `_totalAssets += usdcAmount; _totalShares += sharesMinted; _shareBalance[msg.sender] += sharesMinted;` (all `unchecked { ... }` only if the checked add would be provably safe — otherwise leave checked and let 0.8.35 handle overflow).
   e. Emit `Deposit(msg.sender, usdcAmount, sharesMinted)`.
4. **Interactions (LAST)**: `IERC20(USDC).safeTransferFrom(msg.sender, address(this), usdcAmount)` via OZ `SafeERC20`. USDC's `transferFrom` returns bool but OZ SafeERC20 handles both revert-and-return semantics. Do not read the return value manually.
5. **Reentrancy**: `nonReentrant` (transient-storage-backed from `ReentrancyGuardTransient` per Wave-0 decision).
6. **Pause**: `whenNotPaused`.
7. **Invariants**:
   - `_totalShares == 0 <=> _totalAssets == 0` (mint burns proportional; never one without the other).
   - `sharesMinted > 0` on any successful call.
   - After execution: caller's `_shareBalance` strictly increased by `sharesMinted`.

### 1b. Withdraw — `withdraw(uint256 shares) external whenNotPaused nonReentrant returns (uint256 usdcReturned)`

Behavior (exact):

1. **Input**: `shares` denominated in vault share units.
2. **Access**: caller must own the shares — implicit via balance check; no explicit role.
3. **Effects order (CEI, strict)**:
   a. Revert `ZeroAmount()` if `shares == 0`.
   b. Revert `InsufficientShares(shares, _shareBalance[msg.sender])` if caller does not have enough.
   c. Compute `usdcReturned = Math.mulDiv(shares, _totalAssets, _totalShares, Math.Rounding.Floor)` — **always round USDC returned DOWN** so the vault never over-pays. Any residual dust stays with remaining depositors (a small pro-rata donation, standard ERC-4626-style).
   d. Revert `ZeroAssets()` if `usdcReturned == 0` (shares valued at zero — refuse to burn shares for nothing; caller almost certainly has stale accounting or the vault is in an invalid state).
   e. Update state: `_shareBalance[msg.sender] -= shares; _totalShares -= shares; _totalAssets -= usdcReturned;`
   f. Emit `Withdraw(msg.sender, shares, usdcReturned)`.
4. **Interactions (LAST)**: `IERC20(USDC).safeTransfer(msg.sender, usdcReturned)`.
5. **Reentrancy**: `nonReentrant`.
6. **Pause**: `whenNotPaused`.
7. **Invariants**:
   - Post-execution: caller's `_shareBalance` decreased by exactly `shares`.
   - Post-execution: `_totalShares` decreased by exactly `shares`; `_totalAssets` decreased by exactly `usdcReturned` (both bookkeeping, no external re-read).
   - If caller withdraws all their shares AND is the last holder: `_totalShares == 0` AND `_totalAssets == 0` (see rounding note below).

### 1c. Rounding & residual-dust policy (R14 attention)

Because `mulDiv` rounds down on both sides, over time small dust can accumulate — total ERC20 held by the vault may exceed `_totalAssets` by up to a handful of wei-USDC. This is intentional and standard.

- Vault-held USDC `>= _totalAssets` at all times (never less).
- `_totalAssets` tracks *entitlements*, not the live balance.
- Auditors: this is the exact ERC-4626 dust-sink convention — do NOT flag "vault holds more USDC than _totalAssets" as a bug.
- Add a NatSpec paragraph on this in the contract docstring.

### 1d. Getters (add if missing on skeleton)

Public view functions — add whatever isn't already on PR #14's skeleton:

- `totalAssets() external view returns (uint256)` → `_totalAssets`
- `totalShares() external view returns (uint256)` → `_totalShares`
- `shareBalanceOf(address) external view returns (uint256)` → `_shareBalance[a]`
- `convertToShares(uint256 usdcAmount) external view returns (uint256)` — pure preview using current ratio (same math as deposit, rounding floor)
- `convertToAssets(uint256 shares) external view returns (uint256)` — pure preview (same math as withdraw, rounding floor)

## 2. Files touched (exhaustive)

Prod source:

- `contracts/src/ZionPreserveVault.sol` — replace `NotImplemented()` bodies on `deposit` and `withdraw`; add getters listed in §1d; add the 4 custom errors below to the error section; ensure the storage layout from PR #2 is not disturbed.
- `contracts/src/interfaces/IZionPreserveVault.sol` — add function signatures for any new getter that wasn't on the skeleton; add error selectors; add Deposit / Withdraw events if they weren't declared on PR #2's interface.

Errors to declare (on interface + inherited):

```solidity
error ZeroAmount();
error ZeroShares();
error ZeroAssets();
error InsufficientShares(uint256 requested, uint256 available);
```

Events (declare on interface if not already there):

```solidity
event Deposit(address indexed depositor, uint256 usdcAmount, uint256 sharesMinted);
event Withdraw(address indexed withdrawer, uint256 sharesBurned, uint256 usdcReturned);
```

Prod source ceiling: **~180 net-added LOC in `.sol` files** (both deposit/withdraw plus getters plus NatSpec plus errors/events). If you find yourself past 250, stop and think — you're over-engineering.

Tests:

- `contracts/test/ZionPreserveVault.t.sol` — extend, do not delete PR #2 tests. Add:
  - **Unit tests** — one per happy path (deposit first, deposit subsequent, withdraw partial, withdraw all, withdraw last holder, deposit while paused reverts, withdraw while paused reverts, deposit zero reverts, deposit dust that rounds to zero shares reverts with ZeroShares, withdraw more than owned reverts with InsufficientShares, withdraw when totalShares==0 reverts with ZeroAssets or InsufficientShares).
  - **Invariant / property tests** using forge-std invariants OR direct fuzz functions — at minimum:
    - `invariant_totalAssetsMatchesUsdcOrLess`: vault USDC balance ≥ `_totalAssets` (dust sink).
    - `invariant_sharesZeroIffAssetsZero`: `_totalShares == 0 ⇔ _totalAssets == 0` (checked after every fuzz step).
    - `invariant_sumOfShareBalancesEqualsTotalShares`: track handlers' cumulative balances and assert equality post-step.
  - **Fuzz tests** — parameterize `usdcAmount` and `shares` over broad ranges:
    - `testFuzz_depositThenWithdrawAllReturnsInitialUsdc` (single-user round-trip, allow ≤ 1 wei loss to dust).
    - `testFuzz_depositProportionalShares` (two-user: shares issued proportional to USDC contributed at deposit time).
    - `testFuzz_withdrawNeverOverpays` (∀ shares, `usdcReturned <= mulDiv(shares, _totalAssets, _totalShares)`).

Test source **must** satisfy R74: `test_LOC / src_LOC >= 2.0` on the delta. Given ~180 src LOC of new prod code, target ≥ 380 net test LOC. Keep old tests, add new ones.

- `bot/zion_preserve/vault_client.py` — thin Python-side read-only wrapper (deferred to a later Python PR). **Do not add Python in this PR.** This PR is Solidity-only to keep the audit surface tight.

Registry / config:

- `prod-switches.yml` — no changes expected. If you find yourself adding an env-var-shaped constant to Deploy.s.sol, stop and register it here first per R108.

## 3. Rules that MUST pass (R101 checklist template — fill exhaustively in PR body)

- **R3** — every commit `Bradley Gleave <bradley@bradleytgpcoaching.com>`; no banned tokens in messages.
- **R11 / R14 / R15** — this PR triggers **dual auditors** (Lens A + Lens B, both GPT-5.5). Builder = Opus 4.8 (you).
- **R22** — no doctrine drift; do not edit `AGENT_RULES.md`, do not edit `AGENT_RULES_ZION_MAPPING.md` R-row semantics, do not touch anything under `governance/`.
- **R23** — target ≤ 400 rule-text prod LOC. Tests are excluded from the 400 cap but the diff-counter (`xl-gate`) still fires at >400 total additions. If total additions > 400, add an `R23 EXCEPTION` block + `r23-override` label. Do **NOT** split this PR — deposit and withdraw are one atomic invariant surface; splitting risks a half-implemented vault on main.
- **R51 / R82** — reentrancy: use existing `ReentrancyGuardTransient` on all state-mutating externals. Pause: use existing `whenNotPaused`. Do not add a new guard mechanism.
- **R74** — test:src ratio ≥ 2.0 on the delta. Solidity delta counts.
- **R75 / R112** — no vendor tokens in code, tests, or comments.
- **R101** — full checklist present in PR body (this file is the source).
- **R102 / R103** — CodeQL: waived per W-001 (see below).
- **R108 / R125** — switch registry: no new env vars expected in this PR. If you introduce one, register it first.
- **R110** — gitleaks: no secrets. Test constants only (well-known Base mainnet USDC address `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` is fine).
- **R118** — semgrep: green on the diff.
- **R124** — PR body has a `BUILD MATRIX` block (see template below).
- **R135** — LIVE_STATE.json update runs *after* merge; you do NOT touch it in this PR.
- **R144** — PR body declares `MERGE_ORDER`. For business-logic PRs: `MERGE_ORDER=1` (single-file merge to main), `AUDIT_TIER=DUAL`.

## 4. Waivers to declare in PR body

**W-001 (codeql-waiver)**: still active — GHAS remains paywalled. Apply `codeql-waiver` label + R86 exception block (copy pattern from PR #14 / PR #15 bodies on main). Even though this is a business-logic PR, the sunset criterion is "GHAS available OR waiver retired via separate PR", and neither has happened. Note in the R86 block: "Business-logic PR reached — waiver re-examined and continued because underlying paywall condition unchanged. Waiver will be retired in a dedicated cleanup PR when GHAS becomes available (org migration or repo made public)."

No other waivers expected. If tests force an `r23-override`, the pattern from PR #14 applies.

## 5. PR body — required blocks (in this order)

1. **Summary** (2–4 sentences)
2. **What this PR does** (bulleted deposit/withdraw behavior — copy from §1 above)
3. **Rounding & dust policy** (copy §1c)
4. **Files touched** (exhaustive)
5. **R101 checklist** (every rule from §3, checked)
6. **BUILD MATRIX** table:
   | Item | Value |
   |---|---|
   | Wave | 0 (last foundation slice → first business logic) |
   | PR slot | 3 |
   | Author | Bradley Gleave (R3) |
   | Builder | Opus 4.8 |
   | Auditor | DUAL GPT-5.5 (Lens A + Lens B, R11) |
   | Base | main @ 0cf90003 |
   | Merge order | 1 (single merge) |
   | Audit tier | DUAL |
7. **R86 EXCEPTION — R102/R103 CodeQL waiver** (copy from PR #14/15 with the "business-logic PR reached" note)
8. **Auditor read order** (interface → contract → tests → NatSpec)
9. **Known risks / attention areas** (bullet: rounding dust, first-deposit inflation attack considerations, MEV in first deposit — see §7 below)

## 6. Merge-safety checklist

- Contract remains non-upgradeable (R82). Storage layout must not shift PR #2's slots. Add-only.
- Every external function has `whenNotPaused` + `nonReentrant` where it mutates state (deposit, withdraw). View functions have neither.
- No `delegatecall`, no assembly, no low-level `call`, no `selfdestruct`.
- `SafeERC20` for all USDC transfers.
- USDC address is a constructor-set immutable (already on skeleton — do not change).

## 7. Known adversarial concerns (call these out in PR body under "Known risks")

- **First-depositor inflation attack**: an attacker could deposit 1 wei-USDC to mint 1 share, then donate a huge USDC amount directly to the vault (bypassing `deposit`) to inflate share price, then subsequent depositors get rounded to 0 shares. **Mitigation in this PR**: `ZeroShares()` revert catches the victim path (they can't unknowingly deposit into an inflated pool). **Deferred mitigation**: dead-shares seeding at deploy or minimum-deposit floor — track as a follow-up in `LIVE_STATE.json` `next_planned_pr` when this merges; do not implement here to keep PR #3 focused.
- **Dust accumulation**: intentional, documented in §1c.
- **Direct USDC donation**: the vault does not have a "sweep dust" function yet — donated USDC is stranded in favor of remaining depositors. Acceptable for V1.
- **Reentrancy via callback tokens**: USDC has no callback. Guard is still applied for defense-in-depth (future non-USDC support).

## 8. Definition of done (builder self-check before opening PR)

- `forge build` green.
- `forge test -vvv` green — all PR #2 tests still pass, new tests pass.
- `forge test --gas-report` produced, spot-check that deposit ≤ ~120k gas / withdraw ≤ ~90k gas (rough sanity, no hard gate).
- `slither .` (if installed) has no new HIGH findings.
- `semgrep --config=.semgrep.yml contracts/` clean on the diff.
- `python3 ./scripts/deploy-readiness.py --check` clean.
- Every commit passes R3 identity regex locally: `git log --format='%an <%ae> // %s'` shows only `Bradley Gleave <bradley@bradleytgpcoaching.com>` and no banned tokens in subjects.
- PR body has all §5 blocks.
- Base is `main` at `0cf90003f46080c52279b46329c6ee74326813f5` or newer.
- Branch pushed to `pr3/vault-deposit-withdraw`.

## 9. Non-goals (do NOT do these — save for later PRs)

- Do NOT implement rebalancing / harvest / strategy hooks.
- Do NOT add Hyperliquid perp legs.
- Do NOT add role rotation.
- Do NOT touch the Python bot layer.
- Do NOT change the token address (USDC immutable stays).
- Do NOT add EIP-4626 formal interface conformance (V2 concern per R82 dual-track).
- Do NOT add a proxy or upgradeability (R82: parallel V1+V2, no proxy).
- Do NOT sweep or add "rescue" functions.
