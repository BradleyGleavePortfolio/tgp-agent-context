# Acceptance run plan — awaiting parent allocation

**PLAN ONLY. All execution slots remain released; backend owns verification.**
This turn only inspected filesystem entries and source/report text. No candidate
edit, dependency copy/install, executable version probe, network request, scanner,
gate or test ran. Existing reports/DOCX were not regenerated.

## Frozen inputs and observed tool inventory

```
R=/tmp/tgp-op80-cycle3-importer-iac
E=/home/user/workspace/operator80/execution/importer-iac
A=$E/acceptance-v1                  # new evidence directory, create after grant
H=fc7fdf6e50df08cccad86da37c8b0f15f4b72e81
T=ef0c1abf2f0a7dfbee432631ad4dbf6b288e3398
B=0111be661922234d670bbf23e23d270eec1b4a4e
C=$E/tooling/checkov-v1
O=/tmp/tgp-op80-cycle2-inputs/importer
G=/home/user/workspace/operator80/execution/importer-supply-chain/tooling/bootstrap-tested/gitleaks
N=/home/user/.npm/_npx/52027bd8fc0022aa/node_modules/node/bin/node
```

Filesystem inventory: `$R/node_modules` does not exist; `$O/node_modules` exists
with Vitest, ESLint, TypeScript, Prettier, YAML and lefthook entry points.
`$C/bin/checkov`, `$C/bin/python`, `$G` and `$N` exist. Node package metadata
says22.23.2; global npm metadata says10.8.2, with CLI
`/usr/local/lib/node_modules/npm/bin/npm-cli.js`. Existing private Checkov lock
and96-wheel inventory are retained. No pip-audit/safety/osv-scanner/trivy/grype
entry point was found in the inspected private environment or standard executable
directories; `uv` exists but is not itself proof of an installed SCA scanner.
[Frozen matrix](./FINAL_BUILD_MATRIX.json),
[reviewed wheel inventory](./tooling/reviewed-wheel-lock.json).

## Approved preparation; execution allocation still required

1. Parent grants one serial acceptance slot and a separately bounded transient
   Python SCA install/network phase. No automatic retry/full-suite repeat.
2. Assert HEAD=`H`, index tree=`T`, clean tracked worktree, all seven owned file
   hashes and nine original R110 hashes, unchanged npm manifest/lock; fail on
   drift. Record these before/after every phase.
3. **Evidence-only snapshot commit approved by parent; NOT yet executed.** Existing
   `check:loc`/`check:ratio` read `base...HEAD`, not the candidate index; merely
   running them in `$R` does not measure `T`. Do not alter gate code, inject a
   Git shim, globally set staged-only mode, or mislabel inherited-HEAD success.
   [Actual scoping](file:///tmp/tgp-op80-cycle3-importer-iac/scripts/lib/git-diff.mjs).

   Parent approved this bounded solution on 2026-09-17 at approximately
   21:29Z; this is preparation authority, not an execution-slot grant.
   Once allocated, create a private independent local clone
   `$A/gate-repo` using `git clone --no-hardlinks --no-local "$R" "$A/gate-repo"`;
   transfer the exact frozen tree objects with a local pack if the unreachable
   staged tree is absent, using local `git pack-objects` / `git index-pack`
   (no remote fetch). In that evidence repo only, create a validation commit
   with `git commit-tree "$T" -p "$H"` and author/committer
   `Bradley Gleave <bradley@bradleytgpcoaching.com>`, message
   `Validate frozen workflow security candidate`, then detach checkout to it.
   Record the resulting synthetic SHA separately as `S`; assert
   `S^{tree} == T` and clean tracked worktree. Keep `$R` HEAD/index
   unchanged. This is a synthetic local verification identity, NOT a published
   PR commit or authorization for a source commit in `$R`.

   After the local import, remove every remote from this evidence clone
   (`git remote remove <name>` for each locally enumerated name), then restore
   only the local tracking ref with
   `git update-ref refs/remotes/origin/main "$B"`. Verify `git remote` is empty,
   no remote URL/pushURL remains in local configuration, and
   `git rev-parse refs/remotes/origin/main` equals `B`. A locally named
   `origin/main` ref is not a push remote. Never push `S`; never present it as
   a publication commit, original HEAD, installed-hook execution or hook bypass.

## Private dependency reuse — zero npm installations

After allocation, inventory/hash every regular file and symlink target in
`$O/node_modules`; reject escaping/absolute symlinks. Record mode, relative path,
size and SHA256 (symlink text separately). Copy once with
`cp -a --reflink=never "$O/node_modules" "$V/node_modules"` where `V=$A/gate-repo`
if the snapshot is authorized, otherwise `V=$R`. Never use symlinked
node_modules, hardlink copies, `npm ci`, `npm install` or lifecycle installation.
Require source-before = destination = source-after manifests and different
source/destination device+inode identities for regular files. Verify the
unchanged npm lock SHA256
`262d4b692e9cc1a7908435c36b8a4077d2dc130d37421a7a76175e4acc9cdae8`.
Copy Node22 and Gitleaks into `$A/bin`, hash-compare both copies to their existing
files; Gitleaks expected binary SHA256 is
`8b6fd684fcd5b4ebe39b68abb072ce59e1063ce7ed4abd556157697845f1f088`.
Use the existing global npm CLI read-only through copied Node22, or an
independently copied/hash-compared npm CLI package—no package installation.
[Inherited binary/install evidence](../importer-supply-chain/BUILD_REPORT.md).

Use explicit per-process allowlists: PATH=`$A/bin:/usr/local/bin:/usr/bin:/bin`,
HOME=`$A/home`, TMPDIR=`$A/tmp`, LANG=`C.UTF-8`, CI=`true`. Put npm cache in
`$A/home/.npm`. Python processes also get `PYTHONDONTWRITEBYTECODE=1`.
No inherited credentials, NODE_OPTIONS, BANNED_DIFF_CACHED, RATIO_BASE,
PROD_LOC_CAP or GOMAXPROCS in the full-suite environment. Git author/committer
identity variables apply only to the proposed isolated snapshot operation.

## Serial acceptance commands after grant

Capture argv/cwd/environment/start/duration/exit/stdout/stderr and frozen
identities in new per-phase files. Stop on unexpected failure; retain original
logs. No candidate repair without new scope authorization and explicit re-freeze.

**Execution order: transient SCA first, then final47 controls, four secret
scopes, existing npm gates/audit, and finally ONE full suite.** The SCA recipe
is listed below before expensive acceptance; stop on findings or unknowns.

**1. New96 Python pins: early transient native SCA, not source code.**
No suitable installed native scanner was found in the inspected paths.
Parent supplied verified pin **pip-audit2.10.1**, Python>=3.10, wheel SHA256
`99ef3f600a317c1945f1e89e227ef26e1c2d618429b8bd3fa6f4f7c440c4611a`.
This worker has not independently fetched or executed that release.
[Parent-cited release](https://pypi.org/project/pip-audit/2.10.1/).

After its specific network/install grant: resolve **pip-audit==2.10.1** in
a new private resolver, wheel-only, with no existing environment mutation;
require the selected pip-audit wheel hash to equal the supplied pin. Record
the complete transitive version/distribution/hash closure, produce an exact
require-hashes lock, checkpoint it, and perform ONE private wheel-only/hash-locked
installation under `$A/sca`. Actual downloaded wheel/closure hashes must match;
metadata alone is insufficient. No install into `$C`, no source
requirement/workflow edit and no unpinned `uvx` execution.

The audited target is the existing96-entry Checkov lock, not the SCA tool's
own environment. Verify installed Checkov distribution name/version
inventory matches those96 pins (record bootstrap pip separately). Parent
confirmed CLI support for the following flags; record actual installed
version/help before the one scan:

```sh
timeout 180 "$A/sca/bin/pip-audit" \
  --requirement "$R/scripts/checkov-requirements.txt" \
  --require-hashes --no-deps --disable-pip -s pypi \
  -f json --output "$A/python96-audit.json"
```

Require all96 names/versions accounted for, no skipped/unsupported targets or
lookup errors; advisory outage/unrecognized dependency is UNKNOWN/blocked,
not zero vulnerabilities. Preserve CVE/GHSA aliases, exact affected/fixed
versions and tool/database timestamp. Any findings return to parent: no
ignore flags, automatic upgrades or severity guesses. This is a transient
acceptance check, not an additional product scanner/SBOM/provenance subsystem.
[Target pins](./tooling/reviewed-wheel-lock.json).

**2. ONE final47-control run**, cwd `$R`, existing scanner environment:

```sh
timeout 300 "$C/bin/python" test/iac-security-controls.py "$A/iac-controls-final"
```

Require exactly47 executed, zero fail/error/skip. Keep prior46 and targeted1
records separate. No additional all-workflow rerun proposed: final136 native
checks already passed on `T`. [Current evidence](./NATIVE_GREEN_CHECKPOINT.md).

**3. Four fresh secret scopes**, private Gitleaks copy first on PATH.
The staged and full tracked-tree scans use the original frozen candidate;
fresh PR/history scans use the isolated synthetic commit so all candidate
additions are also covered by commit-diff scanning:

```sh
# cwd $R:
timeout 90 bash scripts/secrets-scan.sh staged
# cwd $A/gate-repo; S is the recorded synthetic SHA, not H:
timeout 90 bash scripts/secrets-scan.sh pr "$B" "$S"
timeout 90 bash scripts/secrets-scan.sh history
# cwd $R:
git archive "$T" | tar -x -C "$A/tracked-tree"
# cwd $A/tracked-tree for the fourth scan:
timeout 90 "$A/bin/gitleaks" dir . --config "$R/.gitleaks.toml" \
  --redact=100 --ignore-gitleaks-allow --gitleaks-ignore-path=/dev/null \
  --no-banner --no-color --log-level=error --timeout=60 \
  --report-format=json --report-path=-
```

Archive extraction must be supervised with pipeline failure handling. Use a
new empty destination; verify extracted tracked-file hashes against `T`.
Require successful exits and zero unexcepted findings; sanitize summaries,
never disclose token values. Record scope2 as `B..S`, with `S^{tree}=T`;
scope3 includes the synthetic detached HEAD and locally reachable imported
history. Ensure `S` is included by checking local history enumeration before
scanning; if necessary retain a local evidence ref to `S` (no remote).
These are candidate-inclusive **synthetic local history** scans, not published
PR-history evidence. Original `B..H`/history results remain preserved, not
overwritten or relabeled.
[Prior four-scope command model](../importer-supply-chain/candidate-scan-summary.json).

**4. Existing npm gates on exact-tree snapshot**, cwd `$V`; define `npm` below
as `$A/bin/node /usr/local/lib/node_modules/npm/bin/npm-cli.js`. Execute serially
with outer300s bounds; only the two indicated gate processes get scope overrides:

```sh
npm run check:banned
RATIO_BASE="$B" PROD_LOC_CAP=400 npm run check:loc
npm run check:flags
RATIO_BASE="$B" npm run check:ratio
npm run check:fixtures
npm run check:production-preflight
npm run check:hooks
npm run lint
npm run type-check
npm run format:check
timeout 180 npm audit --audit-level=high
```

Keep snapshot `origin/main` locally pinned to `B`, with no configured remote,
so ordinary unoverridden
base resolution matches the fixed main base. Record canonical counts180/1551
as expectations, not assumed outcomes. No build script exists in the unchanged
package manifest; report build N/A rather than inventing a build subsystem.
Do not repeat the known-bad globally staged-only runner.
[Manifest](file:///tmp/tgp-op80-cycle3-importer-iac/package.json),
[prior contamination](../importer-supply-chain/BUILD_REPORT.md).

**5. ONE full suite only after all prior required gates/scopes/SCA are green**
and exact-tree gate prerequisite is resolved, cwd `$V`, ordinary allowlist:

```sh
timeout 600 npm test -- --maxWorkers=1
```

Require real nonempty suite/no skips and record actual counts (1534 is inherited
expectation, not a result). No broad or automatic rerun. Recheck source tree,
original-nine hashes and dependency-copy provenance; retain any test-generated
private caches separately from the original source manifest.

## Release and qualitative resource estimate

Dependency copying/hash comparison is disk-I/O-heavy;47controls and secret
scopes are short serial native work; existing gates/full suite are the dominant
CPU/memory phase. SCA installation/advisory lookup and npm audit need bounded
public-network access and may fail on service availability. No parallel
heavy processes, DB, live accounts, customer API, extra scanner controls or
R110 native-suite repeat. Release immediately on blocker or after the one full
run, before source/report follow-up. No numerical completion/cost promise.

**READY FOR PARENT ALLOCATION; WAITING. All execution slots remain released.**
