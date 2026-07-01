# PR #4 Builder Brief — Share Accounting + PnL Surface

**Owner:** Bradley Gleave
**Repo:** BradleyGleavePortfolio/zion-preserve
**Base branch:** `main` (currently at `49a8cd43216721dbbde1812300a59ed6293c2dc8`)
**Feature branch:** `pr4/share-accounting-pnl-surface`
**Audit tier:** DUAL-LENS (Lens A + Lens B, per R11 / R15)
**Builder tier:** per R15
**Prior PR:** PR #3 (deposit/withdraw + share accounting) merged at `3cdabd54` — 101 tests, R74=2.73

---

## 1. Mission

Add the read-only accounting surface on top of the vault built in PR #3. PR #3 shipped `deposit()`, `withdraw()`, share minting with dead-shares mitigation, and `deposit(uint256, uint256 minSharesOut)` slippage overload. PR #4 exposes the numbers users, indexers, and future front-ends need — plus per-address realized/unrealized PnL — with fuzz-tested rounding invariants.

**No state-mutating logic in this PR.** External `view` functions and a small internal accounting struct only. Every rounding decision must be defensible under fuzz.

---

## 2. Scope

### 2.1 External view functions (add to `Vault.sol` or a sibling `VaultAccounting` mixin — builder chooses; keep in same contract if shares/assets storage lives there)

| Function | Returns | Semantics |
|---|---|---|
| `sharePrice()` | `uint256` (18-decimal WAD) | `totalAssets() * 1e18 / totalSupply()`. If `totalSupply() == 0`, return `1e18` (initial price). Uses rounding-down per ERC-4626 convention. |
| `totalAssets()` | `uint256` | Total asset-token balance the vault currently holds. Trust the underlying token's `balanceOf(address(this))`. Do not add any yield accrual — that lands in a later PR. |
| `convertToShares(uint256 assets)` | `uint256` | `assets * totalSupply() / totalAssets()` when supply > 0; else `assets` (1:1 initial). Round down. |
| `convertToAssets(uint256 shares)` | `uint256` | `shares * totalAssets() / totalSupply()` when supply > 0; else `shares`. Round down. |
| `previewDeposit(uint256 assets)` | `uint256 shares` | Must equal what `deposit(assets)` would mint. Round down. |
| `previewWithdraw(uint256 shares)` | `uint256 assets` | Must equal what `withdraw(shares)` would return. Round down. |
| `assetsOf(address account)` | `uint256` | `convertToAssets(balanceOf(account))`. |
| `pnlOf(address account)` | `(int256 realized, int256 unrealized)` | See §2.2 |
| `totalDeposited(address account)` | `uint256` | Lifetime asset-token deposits by `account`. |
| `totalWithdrawn(address account)` | `uint256` | Lifetime asset-token withdrawals by `account`. |
| `costBasisOf(address account)` | `uint256` | Weighted-average cost basis of `account`'s current shares, in asset-token units (18-decimal WAD if the asset itself is 18-decimal — otherwise scale to the asset's native decimals). |

Naming intentionally aligns with ERC-4626 previews but this contract is NOT declaring `IERC4626` in this PR — that adherence decision lands in a later slot. Do not add the `IERC4626` interface import.

### 2.2 Per-address PnL accounting

Add internal struct (in same contract, not a new file, unless net LOC forces it):

```solidity
struct AccountAccounting {
    uint256 totalAssetsDeposited;   // cumulative asset-token flowed in
    uint256 totalAssetsWithdrawn;   // cumulative asset-token flowed out
    uint256 costBasis;              // weighted-average cost basis (asset-token units) for current shares
    int256  realizedPnl;            // signed asset-token gains/losses locked in on withdrawal
}
mapping(address => AccountAccounting) internal _accounting;
```

**Update rules (must be added to existing `deposit()` / `withdraw()` paths — this WILL modify PR #3 code but only the write paths; no new external mutating functions):**

- **On deposit of `assets` → mints `shares`:**
  - `totalAssetsDeposited += assets`
  - `costBasis = (costBasis * balanceBefore + assets * 1e18) / (balanceBefore + shares)` — track cost per share as WAD-scaled asset units. If `balanceBefore == 0`, `costBasis = assets * 1e18 / shares`.
- **On withdraw of `shares` → returns `assets`:**
  - `totalAssetsWithdrawn += assets`
  - Cost portion released: `costPortion = costBasis * shares / 1e18`
  - `realizedPnl += int256(assets) - int256(costPortion)` (using safe casts; expected magnitudes fit `int256` comfortably at asset scales)
  - `costBasis` remains the WAD-scaled per-share basis; unchanged unless `balanceOf(account) == 0` after burn, in which case reset to `0`

- **Unrealized PnL derivation (view-only):**
  - `currentValue = convertToAssets(balanceOf(account))`
  - `currentBasis = costBasis * balanceOf(account) / 1e18`
  - `unrealized = int256(currentValue) - int256(currentBasis)`

- **`realized` is simply `_accounting[account].realizedPnl`.**

### 2.3 Events

Emit these on the mutating paths (PR #3 already emits `Deposit` / `Withdraw`; add these alongside — DO NOT rename existing events):

```solidity
event PnlRealized(address indexed account, int256 delta, int256 newRealizedTotal);
event CostBasisUpdated(address indexed account, uint256 newBasisWad);
```

### 2.4 Errors

Reuse existing custom errors. No new revert paths in this PR beyond what preview/convert overflow protection needs (Solidity 0.8.x built-in checks are sufficient — do NOT add explicit `require` guards where the compiler already covers it).

---

## 3. Non-scope (do NOT do in this PR)

- No `IERC4626` interface declaration (later slot)
- No yield / rewards accrual logic
- No admin fees or performance fees
- No new mutating externals (`redeem`, `mint`, etc.)
- No changes to `deposit(uint256, uint256 minSharesOut)` slippage semantics beyond hooking accounting updates
- No pausable, no OPERATOR_ROLE (issues #19, #20 remain open)
- No fmt CI changes (issue #21)

---

## 4. Tests (target ≥ 20 new, keep R74 ≥ 2.0)

### 4.1 Unit tests — happy path
- `test_SharePrice_Initial_Returns1e18` — empty vault
- `test_SharePrice_AfterFirstDeposit_Returns1e18` — single deposit doesn't move price
- `test_ConvertToShares_RoundsDown`
- `test_ConvertToAssets_RoundsDown`
- `test_PreviewDeposit_Matches_ActualMint`
- `test_PreviewWithdraw_Matches_ActualBurn`
- `test_AssetsOf_ZeroBalance_Returns0`
- `test_TotalDeposited_Withdrawn_Accumulate`
- `test_CostBasis_SingleDeposit`
- `test_CostBasis_TwoDeposits_WeightedAverage`
- `test_RealizedPnl_ZeroOnEntry`
- `test_RealizedPnl_Positive_WhenWithdrawAboveBasis`
- `test_RealizedPnl_Negative_WhenWithdrawBelowBasis`
- `test_UnrealizedPnl_TracksSharePrice`
- `test_UnrealizedPnl_ZeroWhenNoShares`
- `test_CostBasis_ResetsWhenBalanceZero`

### 4.2 Fuzz tests (mandatory — this is why the tier is DUAL-LENS)

```solidity
function testFuzz_PreviewDeposit_EqualsActualDeposit(uint128 assets) external { ... }
function testFuzz_PreviewWithdraw_EqualsActualWithdraw(uint128 shares) external { ... }
function testFuzz_ConvertRoundtrip_NeverGainsAssets(uint128 assets) external {
    // convertToAssets(convertToShares(x)) <= x, always
}
function testFuzz_RealizedPlusUnrealized_Equals_NetFlow(uint128 dep1, uint128 dep2, uint128 wd) external {
    // realized + unrealized == currentValue + totalWithdrawn - totalDeposited (within 1 wei rounding)
}
function testFuzz_CostBasis_MonotonicUnderDeposits(uint128 dep1, uint128 dep2, uint256 priceShockBps) external {
    // Cost basis after two deposits is bounded between the two deposit prices
}
```

Constrain fuzz inputs with `vm.assume` to avoid trivial reverts (non-zero assets, cap at token supply, etc.). Use `bound()` for ranges.

### 4.3 Invariant test (add one)

```solidity
function invariant_TotalSharesConserved() external {
    // sum of balanceOf(actor_i) == totalSupply() across all actors
}
```

Actor handler should call `deposit`, `withdraw`, `depositWithMin` in random order.

---

## 5. Metrics targets

| Metric | Target |
|---|---|
| Tests total (repo-wide) | ≥ 121 (101 existing + 20 new) |
| R74 ratio (test:src net LOC) | ≥ 2.0, aim ≥ 2.5 |
| Src net LOC added | ≤ 180 |
| Test net LOC added | ≤ 500 |
| forge coverage on new view fns | 100% line & branch |
| Gas: `sharePrice()` view | < 5k gas |
| Gas: `pnlOf()` view | < 15k gas |
| Slither | 0 High / 0 Medium new findings |

---

## 6. Doctrine gates that MUST pass (rerun locally before push)

- R3: identity — inline `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com'`
- R11: dual-lens audit tier (this brief locks the tier)
- R15: builder tier = per R15; auditor tier = per R15
- R22: doctrine sweep — commit message + PR body contain zero vendor tokens (regex: `claude|anthropic|openai|gpt[- ]?[0-9]|copilot|cursor|codex|perplexity|assistant|computer[- ]?agent|ai[- ]?agent|co-authored-by|opus|sonnet`, case-insensitive)
- R74: test:src ratio ≥ 2.0
- R86: PR body includes "why unblocked" block naming W-001 (CodeQL/GHAS paywall) and W-002 (branch protection waiver)
- R102/R103: CodeQL waived via W-001; add label `codeql-waiver`
- R108: switch registry — no new env vars added; if any workflow-level env changes, register in `scripts/deploy-readiness.py`'s `CI_INTERNAL` allowlist
- R124: PR body includes `BUILD MATRIX` block

---

## 7. Waivers to declare in PR body

- **W-001** — CodeQL / GHAS unavailable on private personal repo; `codeql-waiver` label applied. Sunsets when GHAS is on this repo.
- **W-002** — Branch protection permanently waived per operator ("i DONT fuck with" branch protection on main).

---

## 8. Locked technical decisions (unchanged from PR #3)

| Setting | Value |
|---|---|
| Chain | Base mainnet + Base Sepolia |
| Solidity | 0.8.35 |
| Python | 3.14.6 |
| OpenZeppelin | v5.1.0 exact |
| forge-std | v1.9.4 exact |
| Reentrancy | ReentrancyGuardTransient (cancun EVM) |
| Test:src net LOC | ≥ 2.0 |
| Rule-text LOC cap | 400 |

---

## 9. Deliverables the builder returns

1. Feature branch `pr4/share-accounting-pnl-surface` pushed to origin
2. Open PR against `main`
3. PR body includes: scope summary, BUILD MATRIX, R86 waivers block, `codeql-waiver` label applied
4. Report at `/home/user/workspace/zion-context/pr4-builder-report.md` with:
   - Head SHA
   - Test count (total + delta)
   - R74 net-LOC ratio
   - Gas snapshot deltas for the new views
   - Coverage report for the new functions
   - Any deviations from this brief with justification

---

## 10. Handoff to auditors (Lens A + Lens B, R11)

After builder push, dual audit runs in parallel. Focus areas for both lenses:

- **Lens A (mechanical / spec-conformance):** rounding direction consistency, preview↔actual parity, overflow at extremes, event correctness, gas targets.
- **Lens B (adversarial / economic):** cost-basis manipulation via dust deposits, PnL griefing across transfers (shares are ERC-20 transferable — how does that interact with per-address `costBasis`? THIS IS A KNOWN GAP TO SURFACE), donation attacks against `sharePrice`, precision loss compounding.

**Explicit auditor-attention item:** If shares are freely transferable (they are — inherited ERC20), then `costBasis` and `realizedPnl` become manipulable by transferring shares between addresses. Two options for the fixer if this comes back as a P0/P1:
1. Reset destination's `costBasis` to current `sharePrice()` on `_update` hook (weight-average with existing basis)
2. Document explicitly that per-address PnL is best-effort and transfers reset accounting; add `PnlAccountingReset(address indexed account, string reason)` event

Builder should PICK OPTION 1 in the first pass (implement `_update` hook override in `Vault.sol` that recomputes destination cost basis) — this preempts the finding.

---

**End of brief.**
