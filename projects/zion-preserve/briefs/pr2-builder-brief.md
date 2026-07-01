# PR #2 · Builder Brief — `ZionPreserveVault` Contract Skeleton (Solidity)

You are the Opus 4.8 builder-of-record for PR #2 of `BradleyGleavePortfolio/zion-preserve`, running in PARALLEL with PR #1.

**Standard: hyperscaler / JPMorgan / Wall Street engineering discipline.** Every line survives an on-chain security auditor. No hacky shortcuts, no unchecked math, no assembly without a WHY comment, no re-entrancy holes.

## BUILD MATRIX (start-of-turn)

```
- zion-preserve main HEAD (start): 3bcb837d341535b06ef40f658a42a6bfd5ddfb81
- tgp-agent-context HEAD:          (verify with git ls-remote)
- Target branch:                   pr2/vault-skeleton
- Doctrine:                        /home/user/workspace/zion-context/AGENT_RULES.md
```

Verify start SHA with `gh api repos/BradleyGleavePortfolio/zion-preserve/branches/main --jq '.commit.sha'`. If not `3bcb837d341535b06ef40f658a42a6bfd5ddfb81`, halt with INFRA_DRIFT.

**IMPORTANT — parallel PR discipline:**  
PR #1 (`pr1/repo-foundation`) is running in parallel. PR #1 owns: `pyproject.toml`, `uv.lock`, `bot/zion_preserve/`, `Makefile`, `.env.example`, `configs/*.yaml`, `.github/workflows/python-ci.yml`, and additions to `prod-switches.yml` for RPC endpoints. **You must NOT touch any of those.** Your surface is Solidity + Foundry only.

## Non-negotiables (from doctrine)

- **R3**: every commit uses inline `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m …`. Zero AI/model/vendor tokens.
- **R4**: push every 2-3 commits.
- **R6**: foreground only.
- **R15**: you are Opus.
- **R23/R76**: ≤400 net prod LOC (excluding tests). Solidity + Foundry config counts as prod. Tests are excluded.
- **R74**: test:src ratio ≥2.0 for diff. Since this PR is source-only, tests must be at least 2× the LOC of new `.sol` prod code.
- **R75/R112 Solidity bans**: NO `assembly {}` without `// WHY: <reason>` inline comment. NO `unchecked {}` without a `// WHY: overflow impossible because <invariant>` comment. NO unchecked `.call{value:...}` — every low-level call must have `(bool success,) = ...; require(success, "...")`. NO `.transfer(` — use `.call{value:...}("")`.
- **R97**: every currency amount is `uint256` — no `int`, no fractional types.
- **R82**: no `TransparentUpgradeableProxy`, no UUPS. If upgradability is needed, use the "V1 deployed alongside V2" pattern documented in `docs/upgrade-strategy.md`.
- **R83**: reentrancy-guarded. Use `openzeppelin-contracts`'s `ReentrancyGuardTransient` (transient storage 0.8.24+).
- **R125**: any new ZION-N rule must have (a) automated enforcer, (b) documentation, (c) test — or be tracked in a follow-up issue.
- **R124**: BUILD MATRIX at start and end.
- **R126**: append JSONL row for this builder dispatch.

## PR #2 scope (do exactly this, nothing more)

### Group A — Foundry setup

**A1 · `contracts/lib/` — install OpenZeppelin**  
From the `contracts/` directory:
```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts@v5.1.0 --no-commit
forge install foundry-rs/forge-std@v1.9.4 --no-commit
```
Then commit `contracts/lib/openzeppelin-contracts` and `contracts/lib/forge-std` submodule refs + `.gitmodules`.

**A2 · `contracts/remappings.txt`**:
```
@openzeppelin/=lib/openzeppelin-contracts/
forge-std/=lib/forge-std/src/
```

### Group B — Interfaces (public API surface)

**B1 · `contracts/src/interfaces/IZionPreserveVault.sol`** (~60 LOC)
- Pragma: `pragma solidity 0.8.35;`
- SPDX: `// SPDX-License-Identifier: BUSL-1.1`
- Interface declares external functions (no implementation):
  - `deposit(uint256 amountUSDC) external returns (uint256 shares)`
  - `withdraw(uint256 shares) external returns (uint256 amountUSDC)`
  - `totalAssets() external view returns (uint256)`
  - `sharePrice() external view returns (uint256)`  // returns 1e18-scaled price
  - `pause() external`
  - `unpause() external`
- Events:
  - `Deposit(address indexed depositor, uint256 amountUSDC, uint256 shares, uint256 pricePerShare)`
  - `Withdraw(address indexed depositor, uint256 amountUSDC, uint256 shares, uint256 pricePerShare)`
  - `Paused(address indexed operator, uint256 timestamp)`
  - `Unpaused(address indexed operator, uint256 timestamp)`
- Errors (custom errors — R101 pinned event/error signatures):
  - `error ZeroAmount()`
  - `error InsufficientShares(uint256 requested, uint256 available)`
  - `error VaultPaused()`
  - `error OnlyOperator()`

### Group C — `ZionPreserveVault.sol` skeleton

**C1 · `contracts/src/ZionPreserveVault.sol`** (~120 LOC)

Constraints:
- Inherits: `IZionPreserveVault`, `ReentrancyGuardTransient` (OZ 5.1), `AccessControl` (OZ 5.1)
- Storage layout — every slot documented, use `@dev` comments for storage packing:
  - `IERC20 public immutable USDC` — the deposit asset
  - `bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE")`
  - `bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE")`
  - `uint256 private _totalShares`
  - `mapping(address => uint256) private _shares`
  - `bool public paused`
- Constructor takes `address usdc, address admin, address operator, address pauser`. Grants roles.
- **`deposit` and `withdraw` bodies revert with `NotImplemented()` error for now.** This PR is a *skeleton* — the storage layout, interfaces, roles, events, and reentrancy guards are locked in but the logic lands in PR #3. Every function must have:
  - `whenNotPaused` modifier (add this modifier — check `paused == false`, else `revert VaultPaused()`)
  - `nonReentrant` modifier
  - The revert `NotImplemented()`
- `pause()` and `unpause()` are FUNCTIONAL in this PR:
  - `pause()`: `onlyRole(PAUSER_ROLE)`, sets `paused = true`, emits `Paused(msg.sender, block.timestamp)`
  - `unpause()`: `onlyRole(PAUSER_ROLE)`, sets `paused = false`, emits `Unpaused(msg.sender, block.timestamp)`
- `totalAssets()` returns `USDC.balanceOf(address(this))`.
- `sharePrice()` returns `1e18` if `_totalShares == 0`, else `(totalAssets() * 1e18) / _totalShares`. **Solidity 0.8.35 has built-in overflow protection** — no `unchecked {}` needed. If you use `unchecked` anywhere, add a `// WHY: ...` comment.
- **NO assembly. NO transfer(). NO unchecked math.** These are per-audit red flags.
- Every function has a NatSpec `@notice` and `@dev` comment.

Add this custom error:
```solidity
error NotImplemented();
```

### Group D — Foundry tests

**D1 · `contracts/test/ZionPreserveVault.t.sol`** (~250 LOC — tests exceed source per R74)

Use `forge-std/Test.sol`. Import `MockERC20` pattern (inline the mock — no external dep).

Required tests (each `test_...` or `testFail_...`):
- `test_Constructor_SetsUSDC()` — USDC address matches ctor arg
- `test_Constructor_SetsAdminRole()` — admin has DEFAULT_ADMIN_ROLE
- `test_Constructor_SetsOperatorRole()` — operator has OPERATOR_ROLE
- `test_Constructor_SetsPauserRole()` — pauser has PAUSER_ROLE
- `test_Constructor_RevertsOnZeroUSDC()` — reverts when USDC == address(0)
- `test_Deposit_RevertsNotImplemented()` — asserts `NotImplemented()` selector
- `test_Withdraw_RevertsNotImplemented()`
- `test_Pause_OnlyPauserRoleCanPause()` — non-pauser reverts
- `test_Pause_SetsPausedTrue()`
- `test_Pause_EmitsEvent()` — `vm.expectEmit` for `Paused(pauser, block.timestamp)`
- `test_Unpause_SetsPausedFalse()`
- `test_Unpause_EmitsEvent()`
- `test_Deposit_RevertsWhenPaused()` — pause first, then deposit call reverts with `VaultPaused()`
- `test_Withdraw_RevertsWhenPaused()`
- `test_TotalAssets_ReturnsUsdcBalance()` — mint USDC to vault, assert `totalAssets()`
- `test_SharePrice_Returns1e18WhenNoShares()`
- `test_SupportsInterface_IZionPreserveVault()` — via ERC165

**Fuzz tests:**
- `testFuzz_Pause_OnlyPauserCanCall(address caller)` — assume caller has no role, expect revert

**D2 · `contracts/script/Deploy.s.sol`** (~40 LOC)
- Forge script that deploys `ZionPreserveVault` to Base Sepolia FIRST (per doctrine testnet-first). Reads USDC address from env, admin/operator/pauser from env.
- `run()` function only — no auto-execution.

### Group E — Documentation

**E1 · Update `docs/upgrade-strategy.md`** — add a section confirming `ZionPreserveVault` V1 is deployed WITHOUT any proxy. Migration path is V2 alongside V1 with user-approved migration.

**E2 · Update `AGENT_RULES_ZION_MAPPING.md`** — check off rules newly enforceable (R83 reentrancy via `ReentrancyGuardTransient`, R97 uint256 money, R82 no proxy, R101 pinned events/errors — reference the interface file).

**E3 · Update `handoffs/wave-0/dispatch-ledger.jsonl`** — append one row per R126.

## Explicitly out of scope

- Do NOT implement `deposit` or `withdraw` logic — those come in PR #3. Just the `NotImplemented()` revert.
- Do NOT touch any file that PR #1 owns (Python, configs YAML, Makefile, python-ci workflow, `.env.example`, `pyproject.toml`, `bot/zion_preserve/`).
- Do NOT modify `AGENT_RULES.md` — this is doctrine, not project files.
- Do NOT modify existing workflows unless it's `.github/workflows/foundry-ci.yml` — and even that is owned by PR #1 setup. If foundry-ci is absent when you push, note it in your report; PR #1 will add it (and the empty-repo guard means it stays green).

## Commit sequence

1. `[R82/R83] contracts/lib — install openzeppelin-contracts@v5.1.0 + forge-std@v1.9.4` (A1)
2. `[R82] contracts/remappings.txt` (A2)
3. `[R101] contracts/src/interfaces/IZionPreserveVault.sol` (B1)
4. `[R83/R97] contracts/src/ZionPreserveVault.sol — skeleton with pause + reentrancy guard + role setup + NotImplemented reverts` (C1)
5. `[R74] contracts/test/ZionPreserveVault.t.sol` (D1)
6. `[R71] contracts/script/Deploy.s.sol` (D2)
7. `[R82] docs/upgrade-strategy.md update` (E1)
8. `[R125] mapping doc — update enforcement cells for R83/R97/R82/R101` (E2)
9. `[R126] dispatch ledger append` (E3)

Push after every 2-3 commits.

## End-of-turn checklist

- [ ] `cd contracts && forge build` succeeds locally
- [ ] `cd contracts && forge test -vvv` — all tests pass
- [ ] `cd contracts && forge coverage` — vault contract at ≥95% line coverage (skeleton has few lines; realistic)
- [ ] No `assembly`, `.transfer(`, or unjustified `unchecked` in `contracts/src/`
- [ ] `grep -rE 'pragma solidity' contracts/src/ contracts/test/ contracts/script/` — every file `0.8.35`
- [ ] Every low-level `.call{}` followed by `require(success, ...)`
- [ ] `git log main..HEAD --format='%an <%ae>' | sort -u` shows only Bradley Gleave
- [ ] `git log main..HEAD --format='%B' | grep -iE 'claude|anthropic|opus|sonnet|gpt|openai|computer|agent'` returns empty
- [ ] Net prod LOC ≤400
- [ ] Test:src ratio ≥ 2.0

## Return format

Save full report to `/home/user/workspace/zion-context/pr2-builder-report.md`. Include in response:

1. BUILD MATRIX (start + end)
2. Per-group summary (A-E) with commit SHAs
3. Net LOC additions (prod + test separately)
4. `forge test` output summary
5. PR number and URL
6. Final line: `BUILDER_STATUS: READY_FOR_AUDIT` or `BUILDER_STATUS: BLOCKED — <reason>`

## PR creation

After all commits pushed:

```bash
gh pr create \
  --repo BradleyGleavePortfolio/zion-preserve \
  --base main \
  --head pr2/vault-skeleton \
  --title 'PR #2 — ZionPreserveVault skeleton (interface + storage + pause + reentrancy guard)' \
  --body-file /tmp/pr2-body.md
```
