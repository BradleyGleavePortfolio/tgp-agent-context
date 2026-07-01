# PR #4 Builder Brief (v2 — corrected) — Preview + PnL Surface

**Owner:** Bradley Gleave
**Repo:** BradleyGleavePortfolio/zion-preserve
**Base branch:** `main` (currently at `49a8cd43216721dbbde1812300a59ed6293c2dc8`)
**Feature branch:** `pr4/preview-pnl-surface`
**Audit tier:** DUAL-LENS (Lens A + Lens B, per R11 / R15)
**Builder tier:** per R15
**Prior PR:** PR #3 (deposit/withdraw + share accounting) merged at `3cdabd54` — 101 tests, R74=2.73

**This brief supersedes `pr4-builder-brief.md`. That version was written without inspecting the shipped Vault code and contained substantive errors — it referenced ERC20 transferable shares, `_update()` overrides, and duplicated views that already exist. This v2 is grounded in `contracts/src/ZionPreserveVault.sol` at commit `49a8cd43`.**

---

## 1. Reality check — what PR #3 actually shipped

`ZionPreserveVault` inherits `IZionPreserveVault, AccessControl, ReentrancyGuardTransient`. **It does NOT inherit ERC20.** Shares live in a private mapping (`mapping(address => uint256) _shares`), are non-transferable, and are only mutated by `_deposit` and `withdraw`. There is no `transfer`, no `_update`, no ERC20 storage.

**Already implemented** (do NOT re-add):
- `totalAssets() public view` → live USDC balance
- `totalShares() external view` → `_totalShares`
- `shareBalanceOf(address) external view` → `_shares[account]`
- `convertToShares(uint256 amountUSDC) external view` → floors, mirrors deposit
- `convertToAssets(uint256 shares) external view` → floors, mirrors withdraw
- `sharePrice() external view` → 1e18-scaled, returns 1e18 when totalShares==0

**Constants and errors already in scope:**
- `DEAD_SHARES = 1000` (first-deposit seed)
- `ZeroAmount`, `ZeroShares`, `ZeroAssets`, `InsufficientFirstDeposit`, `InsufficientShares`, `InsufficientSharesOut`, `VaultPaused`, `ZeroAddress`

**Modifiers in scope:** `whenNotPaused`, `nonReentrant`, `onlyRole(PAUSER_ROLE)`

Because shares are non-transferable, per-address PnL is well-defined and does NOT need a transfer hook. Cost basis moves only when the address itself deposits or withdraws.

---

## 2. Scope — what this PR adds

### 2.1 New external view functions (add to `ZionPreserveVault.sol`)

All are `external view` returning USDC 6-decimal base units unless noted. All are `whenNotPaused`-free (views never need to be blocked by pause).

| Function | Returns | Semantics |
|---|---|---|
| `previewDeposit(uint256 amountUSDC)` | `uint256 shares` | Exact preview of what `_deposit(amountUSDC, 0)` would mint. **First-deposit path**: if `_totalShares == 0` and `amountUSDC <= DEAD_SHARES`, return 0 (mirrors the `InsufficientFirstDeposit` revert path — preview never reverts). Else if `_totalShares == 0`, return `amountUSDC - DEAD_SHARES`. **Later path**: `Math.mulDiv(amountUSDC, _totalShares, totalAssets(), Math.Rounding.Floor)`. If `amountUSDC == 0` return 0. |
| `previewWithdraw(uint256 shares)` | `uint256 amountUSDC` | Exact preview of what `withdraw(shares)` would return. If `shares == 0` or `_totalShares == 0` return 0. Else `Math.mulDiv(shares, totalAssets(), _totalShares, Math.Rounding.Floor)`. Note: this preview does NOT enforce `shares <= caller.balance` — it's a pure conversion. That's the standard preview contract. |
| `assetsOf(address account)` | `uint256` | `convertToAssets(shareBalanceOf(account))` — a one-line wrapper. Preserves the residual dust accounting (returns 0 when totalShares==0). |
| `totalDeposited(address account)` | `uint256` | Lifetime USDC deposits by `account`. |
| `totalWithdrawn(address account)` | `uint256` | Lifetime USDC withdrawals by `account`. |
| `costBasisOf(address account)` | `uint256` | Weighted-average USDC cost basis of `account`'s currently-held shares, expressed as a 1e18-scaled USDC-per-share ratio. Returns 0 when `_shares[account] == 0`. |
| `pnlOf(address account)` | `(int256 realized, int256 unrealized)` | See §2.2. |

**Add these to `IZionPreserveVault.sol`** as part of the pinned public surface (R101). Update the interface's ERC165 selector coverage if `type(IZionPreserveVault).interfaceId` changes — it will, since new functions are added.

**Preview parity contract:** `previewDeposit(x) == _deposit(x, 0).shares` for all non-reverting x. `previewWithdraw(x) == withdraw(x).amountUSDC` for all x where the caller holds >= x shares. Fuzz this.

### 2.2 Per-address PnL accounting

New internal struct + mapping (in the STORAGE section, after the existing `_shares` mapping):

```solidity
/// @dev Per-address accounting for realized/unrealized PnL. Because shares are non-transferable,
///      cost basis and realized PnL are unambiguous per address.
struct AccountAccounting {
    uint256 totalDeposited;   // lifetime USDC in (base units)
    uint256 totalWithdrawn;   // lifetime USDC out (base units)
    uint256 costBasisWad;     // weighted-average USDC-per-share cost, 1e18-scaled
    int256  realizedPnl;      // signed USDC (base units); locked in on each withdraw
}

/// @dev Slot N — per-depositor PnL accounting. See AccountAccounting docs.
mapping(address depositor => AccountAccounting acct) private _accounting;
```

**Update rules (hook into existing `_deposit` and `withdraw` paths; both already have `nonReentrant` + `whenNotPaused`):**

**On deposit (`_deposit` end-of-body, after share writes, before the event emit — order matters so the event carries the pre-hook state):**

```solidity
AccountAccounting storage acct = _accounting[msg.sender];
acct.totalDeposited += amountUSDC;

uint256 balanceAfter = _shares[msg.sender]; // already updated above
if (balanceAfter == shares) {
    // Address's first deposit into this vault: basis = amount / shares (1e18-scaled).
    acct.costBasisWad = Math.mulDiv(amountUSDC, 1e18, shares, Math.Rounding.Floor);
} else {
    // Weighted-average: (oldBasis * (balanceAfter - shares) + amountUSDC * 1e18) / balanceAfter
    uint256 balanceBefore = balanceAfter - shares;
    uint256 newBasisWad = Math.mulDiv(
        acct.costBasisWad * balanceBefore + amountUSDC * 1e18,
        1,
        balanceAfter,
        Math.Rounding.Floor
    );
    // OR simpler: acct.costBasisWad = (acct.costBasisWad * balanceBefore + amountUSDC * 1e18) / balanceAfter;
    acct.costBasisWad = newBasisWad;
}
emit CostBasisUpdated(msg.sender, acct.costBasisWad);
```

Builder: pick the cleanest form (checked math is fine — Solidity 0.8.x). Watch for overflow at extreme values; `Math.mulDiv` protects against intermediate overflow when needed.

**On withdraw (in `withdraw`, after the share/total burns, before the transfer/event):**

```solidity
AccountAccounting storage acct = _accounting[msg.sender];
acct.totalWithdrawn += amountUSDC;

// Cost portion of the burned shares (WAD-scaled basis → USDC base units)
uint256 costPortion = Math.mulDiv(acct.costBasisWad, shares, 1e18, Math.Rounding.Floor);

// Signed delta in USDC base units. Casts are safe: USDC max supply << 2^255.
int256 delta = int256(amountUSDC) - int256(costPortion);
acct.realizedPnl += delta;

// If the account has fully exited, reset costBasisWad so a fresh entry starts clean.
if (_shares[msg.sender] == 0) {
    acct.costBasisWad = 0;
    emit CostBasisUpdated(msg.sender, 0);
}

emit PnlRealized(msg.sender, delta, acct.realizedPnl);
```

**Unrealized PnL derivation (in `pnlOf` view):**

```solidity
function pnlOf(address account) external view returns (int256 realized, int256 unrealized) {
    AccountAccounting storage acct = _accounting[account];
    realized = acct.realizedPnl;
    uint256 bal = _shares[account];
    if (bal == 0) return (realized, int256(0));
    uint256 currentValue = convertToAssets(bal);           // USDC base units
    uint256 currentBasis = Math.mulDiv(acct.costBasisWad, bal, 1e18, Math.Rounding.Floor);
    unrealized = int256(currentValue) - int256(currentBasis);
}
```

### 2.3 Events (add to `IZionPreserveVault.sol` events block)

```solidity
/// @notice Emitted when a withdraw locks in realized PnL for the caller.
/// @param account The withdrawing depositor.
/// @param delta Signed USDC PnL of this withdraw (base units): `assetsOut - costPortion`.
/// @param realizedTotal The account's realized PnL running total after applying delta.
event PnlRealized(address indexed account, int256 delta, int256 realizedTotal);

/// @notice Emitted when an account's cost-basis-per-share changes (on deposit or full exit).
/// @param account The depositor whose basis changed.
/// @param costBasisWad New weighted-average USDC-per-share cost, 1e18-scaled. Zero on full exit.
event CostBasisUpdated(address indexed account, uint256 costBasisWad);
```

### 2.4 Errors

No new errors. Preview functions never revert (they return 0 on pathological inputs, mirroring the existing `convertToShares`/`convertToAssets` guards).

---

## 3. Non-scope (do NOT do in this PR)

- No ERC20 inheritance for shares — shares remain non-transferable in V1
- No IERC4626 interface declaration — deferred
- No yield / rewards / performance fees
- No pausable consolidation onto OZ `Pausable` (R20 issue #19 stays open)
- No OPERATOR_ROLE consumption (R20 issue #20 stays open)
- No fmt CI changes (R20 issue #21 stays open)
- No changes to the pinned event signatures for `Deposit` / `Withdraw` / `Paused` / `Unpaused` / `DeadSharesSeeded`
- No changes to error signatures
- No new mutating externals (`redeem`, `mint`, `flush`, etc.)
- No touching `.github/workflows/foundry-ci.yml` or `python-ci.yml` — known pre-existing workflow-level push-event failures, non-blocking, tracked as tech debt

---

## 4. Tests (target ≥ 25 new, keep R74 ≥ 2.5)

### 4.1 Preview parity unit tests
- `test_PreviewDeposit_FirstDeposit_MatchesActualMint`
- `test_PreviewDeposit_FirstDeposit_BelowDeadShares_Returns0`
- `test_PreviewDeposit_LaterDeposit_MatchesActualMint`
- `test_PreviewDeposit_ZeroAmount_Returns0`
- `test_PreviewWithdraw_MatchesActualPayout`
- `test_PreviewWithdraw_ZeroShares_Returns0`
- `test_PreviewWithdraw_PreDeposit_Returns0`
- `test_AssetsOf_ZeroBalance_Returns0`
- `test_AssetsOf_MatchesConvertToAssetsOfBalance`

### 4.2 PnL unit tests
- `test_CostBasis_FirstDeposit_EqualsAmountPerShareWad`
- `test_CostBasis_SecondDeposit_WeightedAverage`
- `test_TotalDeposited_TotalWithdrawn_Accumulate`
- `test_RealizedPnl_ZeroOnEntry`
- `test_RealizedPnl_Positive_WhenPriceRisesAcrossWithdraw` — donate USDC into the vault between deposit and withdraw
- `test_RealizedPnl_Negative_WhenPriceFallsAcrossWithdraw` — first depositor absorbs seed effect (or simulate a hypothetical loss path, e.g. share dilution)
- `test_UnrealizedPnl_ZeroWhenNoBalance`
- `test_UnrealizedPnl_TracksSharePrice_UpDown`
- `test_CostBasis_ResetsToZero_OnFullExit`
- `test_PnlEvent_Emitted_OnWithdraw`
- `test_CostBasisEvent_Emitted_OnDeposit_And_OnFullExit`

### 4.3 Fuzz tests (mandatory — this is why the tier is DUAL-LENS)

```solidity
function testFuzz_PreviewDeposit_EqualsActualMint(uint128 amount) external;
function testFuzz_PreviewWithdraw_EqualsActualPayout(uint128 amount) external;
function testFuzz_ConvertRoundtrip_NeverGainsAssets(uint128 amount) external;
    // convertToAssets(convertToShares(x)) <= x, always (after seeding).
function testFuzz_PnlIdentity(uint128 dep1, uint128 dep2, uint128 wd1) external;
    // realized + unrealized == assetsOf(account) + totalWithdrawn - totalDeposited, within 1 wei rounding.
function testFuzz_CostBasis_BoundedByDepositPrices(uint128 dep1, uint128 dep2) external;
    // After two deposits at prices p1, p2, costBasisWad ∈ [min(p1,p2), max(p1,p2)].
```

Use `bound()` for realistic USDC ranges (avoid uint128.max grief). Constrain to `> DEAD_SHARES` for first-deposit paths.

### 4.4 Invariant test (add one)

```solidity
function invariant_SumOfAccountingBalancesEqualsTotalShares() external {
    // sum over actors of _shares[actor] + DEAD_SHARES == _totalShares (after first deposit)
}
function invariant_RealizedPlusUnrealizedIdentity() external {
    // For every actor: realized + unrealized == currentValue + totalWithdrawn - totalDeposited (± dust)
}
```

Actor handler: random `deposit(amount)`, `deposit(amount, minSharesOut)`, `withdraw(shares)`, with `USDC.mint`/`approve` shims via the mock token.

---

## 5. Metrics targets

| Metric | Target |
|---|---|
| Tests total (repo-wide) | ≥ 126 (101 existing + ≥ 25 new) |
| R74 ratio (test:src net LOC) | ≥ 2.0, aim ≥ 2.5 |
| Src net LOC added | ≤ 130 |
| Test net LOC added | ≤ 500 |
| forge coverage on new view fns | 100% line & branch |
| Gas: `previewDeposit` view | < 10k gas |
| Gas: `previewWithdraw` view | < 8k gas |
| Gas: `pnlOf` view | < 15k gas |
| Gas: `_deposit` overhead vs PR #3 | < +8k gas (accounting struct write) |
| Gas: `withdraw` overhead vs PR #3 | < +6k gas |
| Slither | 0 new High / 0 new Medium |

---

## 6. Doctrine gates that MUST pass

- **R3**: identity — inline `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com'`. **Operator explicitly attests: this code is theirs; AI is a tool used at their direction; R3 is operator policy for their own portfolio repo and is not to be waived this cycle.**
- **R11**: dual-lens audit tier locked
- **R15**: builder tier per R15; auditor tier per R15
- **R22 / R75 / R112**: doctrine sweep — zero vendor tokens in commit AND PR body. Regex (case-insensitive): `(claude|anthropic|openai|gpt[- ]?[0-9]|copilot|cursor|codex|perplexity|assistant|computer[- ]?agent|ai[- ]?agent|co-authored-by|opus|sonnet)`
- **R74**: test:src ratio ≥ 2.0
- **R82**: no proxy / no delegatecall storage hazard — unchanged
- **R84 / R93**: pinned event/error signatures — new events additive-only
- **R86**: PR body includes "why unblocked" block naming W-001 (CodeQL/GHAS paywall) and W-002 (branch protection waiver)
- **R101**: interface (`IZionPreserveVault`) is source of truth — new externals added there first
- **R102/R103**: CodeQL waived via W-001; add label `codeql-waiver`
- **R108**: switch registry — no new env vars expected. If any, register in `CI_INTERNAL` in `scripts/deploy-readiness.py`
- **R124**: PR body includes `BUILD MATRIX` block

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

1. Feature branch `pr4/preview-pnl-surface` pushed to origin
2. Open PR against `main`
3. PR body includes: scope summary, BUILD MATRIX, R86 waivers block, `codeql-waiver` label applied
4. Report at `/home/user/workspace/zion-context/pr4-builder-report.md` with:
   - Head SHA
   - PR number + URL
   - Test count total + delta (target ≥ 126)
   - R74 net-LOC ratio (target ≥ 2.5)
   - Gas snapshot deltas for new views and existing deposit/withdraw
   - Coverage report for new functions (target 100%)
   - Slither summary (informational)
   - Any deviations from this brief with justification
   - Confirmation `scripts/deploy-readiness.py` PASSED

---

## 10. Auditor focus areas (for Lens A + Lens B next round)

- **Lens A (mechanical / spec-conformance):** rounding-direction consistency across preview↔actual↔convert triple, overflow at extremes, event correctness, gas targets, first-deposit DEAD_SHARES path in `previewDeposit`.
- **Lens B (adversarial / economic):**
  - Donation attack on `costBasisWad` — attacker donates USDC between two deposits by same address, does the weighted average lie?
  - Rounding drift accumulating across many small deposits — does cost basis stay within `[min(depositPrices), max(depositPrices)]`?
  - Off-by-one in the exit reset (`costBasisWad = 0`) — can partial exits leave stale basis that under- or over-counts a subsequent deposit?
  - PnL identity: does `realized + unrealized == assetsOf + totalWithdrawn - totalDeposited` hold across arbitrary sequences within rounding dust?
  - Interaction with the DEAD_SHARES seed on first deposit — is the first depositor's cost basis defined against `amountUSDC / (amountUSDC - DEAD_SHARES)` shares correctly?

---

**End of brief v2.**
