# PR #1 · Builder Brief — Repo Foundation (Python + Foundry skeleton)

You are the Opus 4.8 builder-of-record for PR #1 of `BradleyGleavePortfolio/zion-preserve`.

**Standard: hyperscaler / JPMorgan / Wall Street engineering discipline.** Every decision must survive that bar. No hacky shortcuts, no "we'll fix it later" scaffolding.

## BUILD MATRIX (start-of-turn)

```
- zion-preserve main HEAD (start): 3bcb837d341535b06ef40f658a42a6bfd5ddfb81
- tgp-agent-context HEAD:          (verify with git ls-remote)
- Target branch:                   pr1/repo-foundation
- Doctrine:                        /home/user/workspace/zion-context/AGENT_RULES.md
```

Verify start SHA with `gh api repos/BradleyGleavePortfolio/zion-preserve/branches/main --jq '.commit.sha'`. If not `3bcb837d341535b06ef40f658a42a6bfd5ddfb81`, halt with INFRA_DRIFT.

## Non-negotiables (from doctrine)

- **R3**: every commit uses inline `git -c user.name='Bradley Gleave' -c user.email='bradley@bradleytgpcoaching.com' commit -m …`. Zero AI/Claude/Computer/Agent/Opus/Anthropic/GPT/Sonnet/OpenAI tokens in author, committer, message, or trailers.
- **R4**: push every 2-3 commits at natural checkpoints.
- **R6**: foreground only.
- **R15**: you are Opus. Do all edits yourself.
- **R23/R76**: ≤400 net prod LOC (excluding docs and tests). Aim for ≤350.
- **R97**: money paths use `Decimal` (Python) or `uint256` (Solidity). Zero `float` in `bot/zion_preserve/{trading,vault,pnl,risk,execution,reconciliation,sizing}/`.
- **R75/R112**: zero net delta on banned tokens.
- **R101**: any new enforced rule → checkbox in PR template.
- **R108**: every env var → row in `prod-switches.yml`.
- **R114/R95**: every action pinned to full 40-char SHA.
- **R124**: BUILD MATRIX at start and end.
- **R126**: append JSONL row for this builder dispatch.

## Scope (do exactly this, nothing more)

### Group A — Python project (uv + Python 3.14.6)

**A1 · `pyproject.toml`** (~50 LOC)
```toml
[project]
name = "zion-preserve"
version = "0.0.1"
description = "ZION.PRESERVE crypto trading bot"
requires-python = "==3.14.*"
dependencies = [
    "pydantic>=2.9,<3",
    "pydantic-settings>=2.6,<3",
    "structlog>=24.4,<25",
    "web3>=7.5,<8",
    "eth-account>=0.13,<0.14",
    "httpx>=0.28,<0.29",
    "tenacity>=9.0,<10",
    "pyyaml>=6.0,<7",
]

[dependency-groups]
dev = [
    "pytest>=8.3,<9",
    "pytest-asyncio>=0.24,<1",
    "pytest-cov>=6.0,<7",
    "mypy>=1.13,<2",
    "ruff>=0.8,<1",
    "types-pyyaml",
]

[tool.uv]
managed = true

[tool.ruff]
line-length = 100
target-version = "py314"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "C4", "SIM", "TID", "PL", "RUF"]

[tool.mypy]
python_version = "3.14"
strict = true
disallow_any_generics = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

**A2 · `uv.lock`** — generate via `uv lock`. Commit the resulting lockfile.

**A3 · `bot/zion_preserve/__init__.py`** (~15 LOC)
- Structured logging setup via `structlog` (R57).
- Version export.
- No side effects at import except logging config.

**A4 · Package skeleton** — one directory each, with `__init__.py` containing a one-line module docstring. Directories:
- `bot/zion_preserve/config/`
- `bot/zion_preserve/trading/`
- `bot/zion_preserve/vault/`
- `bot/zion_preserve/pnl/`
- `bot/zion_preserve/risk/`
- `bot/zion_preserve/execution/`
- `bot/zion_preserve/reconciliation/`
- `bot/zion_preserve/sizing/`

Each `__init__.py` contains only `"""<name> module — <one-line purpose>."""` — no implementation yet.

**A5 · `bot/zion_preserve/config/settings.py`** (~60 LOC) — the ONE non-trivial module in PR #1.
- `pydantic-settings` `BaseSettings` subclass called `Settings`.
- Reads every env var listed in `prod-switches.yml` (parse the YAML at class construction, don't hardcode).
- Money-typed fields use `Decimal` (import from `decimal`).
- No float anywhere.
- Frozen model (`model_config = SettingsConfigDict(frozen=True)`).
- No secrets logged: use `SecretStr` for anything sensitive.
- Single global accessor: `def get_settings() -> Settings: return Settings()` with `@lru_cache(maxsize=1)`.

**A6 · Tests for `Settings`** — `tests/unit/config/test_settings.py`. At minimum:
- `test_settings_loads_from_prod_switches_yaml`: parses the YAML, instantiates `Settings`, no error.
- `test_settings_is_frozen`: mutation raises.
- `test_no_float_fields`: introspect model, assert zero float-typed fields.
- `test_secret_fields_not_in_repr`: `repr(settings)` does not leak secret values.

**A7 · `.env.example`** — every env var name from `prod-switches.yml`, one per line, `VAR_NAME=` (no values, no secrets).

### Group B — Foundry / Solidity project

**B1 · `contracts/foundry.toml`** (~30 LOC)
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.35"
optimizer = true
optimizer_runs = 200
via_ir = true
fs_permissions = [{ access = "read", path = "./" }]

[profile.ci]
verbosity = 3
fuzz = { runs = 1000 }
invariant = { runs = 256, depth = 15 }

[fmt]
line_length = 100
tab_width = 4
bracket_spacing = true

[rpc_endpoints]
base_sepolia = "${BASE_SEPOLIA_RPC_URL}"
base_mainnet = "${BASE_MAINNET_RPC_URL}"

[etherscan]
base_sepolia = { key = "${BASESCAN_API_KEY}" }
base_mainnet = { key = "${BASESCAN_API_KEY}" }
```

**B2 · `contracts/src/.gitkeep` and `contracts/test/.gitkeep` and `contracts/script/.gitkeep`** — directories only. PR #2 fills them.

**B3 · `contracts/lib/.gitkeep`** — same. Foundry deps land in PR #2 via `forge install`.

**B4 · `contracts/remappings.txt`** — empty file for now, PR #2 populates. Just placeholder.

### Group C — Config layering

**C1 · `configs/base-mainnet.yaml`** — chain params. Skeleton:
```yaml
chain_id: 8453
name: "Base Mainnet"
rpc_env: BASE_MAINNET_RPC_URL
explorer_url: "https://basescan.org"
solidity_version: "0.8.35"
```

**C2 · `configs/base-sepolia.yaml`** — chain params (chain_id 84532).

**C3 · `configs/hyperliquid-mainnet.yaml`** — Hyperliquid perps params:
```yaml
network: "mainnet"
api_url_env: HYPERLIQUID_API_URL
ws_url_env: HYPERLIQUID_WS_URL
```

**C4 · `configs/hyperliquid-testnet.yaml`** — same shape, testnet.

### Group D — Build & test tooling

**D1 · `Makefile`** (~40 LOC) — reproducible entrypoints:
```makefile
.PHONY: install lint typecheck test test-cov forge-build forge-test all clean

install:
	uv sync --all-extras --dev

lint:
	uv run ruff check bot/ tests/ scripts/
	uv run ruff format --check bot/ tests/ scripts/

typecheck:
	uv run mypy bot/ scripts/

test:
	uv run pytest tests/ -v

test-cov:
	uv run pytest tests/ --cov=bot/zion_preserve --cov-report=term-missing --cov-fail-under=80

forge-build:
	cd contracts && forge build

forge-test:
	cd contracts && forge test -vvv

all: lint typecheck test forge-build forge-test

clean:
	rm -rf .pytest_cache .mypy_cache .ruff_cache dist build
	cd contracts && forge clean
```

**D2 · `.github/workflows/python-ci.yml`** — add a Python CI workflow with:
- `uv sync`
- `uv run ruff check`
- `uv run mypy`
- `uv run pytest --cov=bot/zion_preserve --cov-fail-under=80`
- Pinned actions per R114/R95: `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683` (v4.2.2), `astral-sh/setup-uv@` — you must look up the current v3 or v4 SHA before pinning; do not use `@v3` or `@latest`.
- **Guard**: `if: hashFiles('bot/**/*.py', 'tests/**/*.py') != ''` to avoid failing on future empty commits.

**D3 · `.github/workflows/foundry-ci.yml`** — Foundry CI:
- `foundry-rs/foundry-toolchain@` (look up SHA before pinning)
- `cd contracts && forge build && forge test`
- Guard: `if: hashFiles('contracts/src/*.sol') != ''` — this workflow no-ops until PR #2 adds source.

**D4 · Update `.github/PULL_REQUEST_TEMPLATE.md`** — add two rows to the CI/Governance checkbox group:
- `R71 · python-ci passing`
- `R71 · foundry-ci passing (skipped if no .sol)`

### Group E — Updates to existing files

**E1 · Update `prod-switches.yml`** — add the following env vars:
- `BASE_MAINNET_RPC_URL` — tier: prod, prod_default: (empty), owner: Bradley Gleave, description: Base mainnet RPC endpoint, auto_flip_on_in_prod: false
- `BASE_SEPOLIA_RPC_URL` — tier: testnet, similar
- `BASESCAN_API_KEY` — tier: prod (SecretStr), similar
- `HYPERLIQUID_API_URL` — tier: prod
- `HYPERLIQUID_WS_URL` — tier: prod
- `HYPERLIQUID_TESTNET_API_URL` — tier: testnet
- `HYPERLIQUID_TESTNET_WS_URL` — tier: testnet
- `ZION_ENV` — tier: prod, values: `dev|staging|prod`

**E2 · Update `AGENT_RULES_ZION_MAPPING.md`** — check off any rules newly enforceable now that the package skeleton exists. Do NOT rewrite the doc — just update relevant `enforcement` cells (e.g., R41 env parity, R57 structured logging, R97 no-float — reference `test_no_float_fields`).

**E3 · Update `handoffs/wave-0/dispatch-ledger.jsonl`** — append one row for this builder dispatch per R126 schema.

## Explicitly out of scope

- Do NOT write `ZionPreserveVault.sol` — that's PR #2 running in parallel.
- Do NOT write any `trading/`, `vault/`, `pnl/`, `risk/`, `execution/`, `reconciliation/`, `sizing/` implementation modules — those come in later PRs. Only `__init__.py` skeletons.
- Do NOT wire Supabase or any backup infrastructure — R70 drill is a later PR.
- Do NOT touch `contracts/src/` or `contracts/test/` beyond `.gitkeep` placeholders.
- Do NOT modify `scripts/deploy-readiness.py` or `.github/workflows/switch-registry-check.yml` — but DO ensure your new env-var additions to `prod-switches.yml` don't create drift.

## Commit sequence

1. `[R71] pyproject.toml + uv.lock` (Groups A1-A2)
2. `[R37] bot/zion_preserve package skeleton (config, trading, vault, pnl, risk, execution, reconciliation, sizing)` (A3-A4)
3. `[R41/R97/R108] bot/zion_preserve/config/settings.py + tests + .env.example` (A5-A7)
4. `[R71] contracts/foundry.toml + placeholders` (B1-B4)
5. `[R41] configs/{base,hyperliquid}-{mainnet,testnet,sepolia}.yaml` (C1-C4)
6. `[R71] Makefile + python-ci.yml + foundry-ci.yml workflows` (D1-D3)
7. `[R101] PR template CI/Governance checkboxes` (D4)
8. `[R108] prod-switches.yml — add chain/API env vars` (E1)
9. `[R125] mapping doc — update enforcement cells` (E2)
10. `[R126] dispatch ledger append` (E3)

Push after every 2-3 commits.

## End-of-turn checklist

- [ ] `gh pr checks N` shows all checks green (or failing only on the newly-added python-ci/foundry-ci if empty-repo guards are wrong)
- [ ] `python scripts/deploy-readiness.py --check` exits 0 (no drift between code and `prod-switches.yml`)
- [ ] `uv sync --all-extras --dev` succeeds locally (in `/tmp/zion-preserve` clone)
- [ ] `uv run pytest tests/unit/config/test_settings.py -v` all pass
- [ ] `uv run mypy bot/` clean
- [ ] `uv run ruff check bot/ tests/` clean
- [ ] `git log main..HEAD --format='%an <%ae>' | sort -u` shows only `Bradley Gleave <bradley@bradleytgpcoaching.com>`
- [ ] `git log main..HEAD --format='%B' | grep -iE 'claude|anthropic|opus|sonnet|gpt|openai|computer|agent'` returns empty
- [ ] Net prod LOC (excluding docs + tests) ≤400
- [ ] BUILD MATRIX (end-of-turn) recorded in report

## Return format

Save your full report to `/home/user/workspace/zion-context/pr1-builder-report.md` and include in your response:

1. BUILD MATRIX (start + end)
2. Per-group summary (A-E) with commit SHAs
3. Net LOC additions
4. PR number and URL
5. Final line: exactly `BUILDER_STATUS: READY_FOR_AUDIT` or `BUILDER_STATUS: BLOCKED — <reason>`

## PR creation

After all commits are pushed, open PR with:

```bash
gh pr create \
  --repo BradleyGleavePortfolio/zion-preserve \
  --base main \
  --head pr1/repo-foundation \
  --title 'PR #1 — Repo foundation (uv/pyproject + package skeleton + Foundry config)' \
  --body-file /tmp/pr1-body.md
```

Body must include: BUILD MATRIX, scope summary, checklist ticks, R131 challenges (none expected), R23 exception (only if >400 prod LOC — should not be needed).
