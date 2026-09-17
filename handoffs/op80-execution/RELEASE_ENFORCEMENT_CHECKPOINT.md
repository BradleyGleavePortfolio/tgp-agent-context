# Release Enforcement: Verified State and Remaining Authority

## Read-only inspection

Parent queried the live GitHub APIs on September 17, 2026, around 21:05–21:06 UTC. No branch, ruleset, permission, approval setting or required check was changed.

| Repository | Observed main protection | Observed repository/parent rulesets |
|---|---|---|
| `BradleyGleavePortfolio/tgp-importer-extension` | Classic protection enabled; strict required `test` and `codeql` checks, both Actions app 15368; one review; stale reviews dismissed; administrators enforced; linear history; no force push/deletion; conversation resolution required. CODEOWNERS review and last-push approval are false. | Empty result from rulesets query with parent inclusion |
| `BradleyGleavePortfolio/growth-project-backend` | Main branch reports protected=false/enabled=false; classic-protection endpoint reports “Branch not protected” | Empty result from rulesets query with parent inclusion |
| `BradleyGleavePortfolio/growth-project-mobile` | Main branch reports protected=false/enabled=false; classic-protection endpoint reports “Branch not protected” | Empty result from rulesets query with parent inclusion |

These are point-in-time observations, not permanent claims. Earlier reports marked live protection unverified; this record supersedes that uncertainty only for the observations above.

## Consequence

R122 remains unsatisfied. Backend/mobile require actual protection reconciliation; importer requires the policy-review gap and new required workflow producers to be addressed. Do not add a required check before confirming its exact name, producer and applicable-trigger behavior. A skipped path-filtered workflow must not leave an unexplained permanently pending requirement.

The original publication authorization did not authorize security-setting changes. Parent must obtain the specific required approval for an exact reviewed protection change before making it; no agent may work around that boundary. Prepare the desired-state diff and rollback first, preserve all existing restrictions, and re-read live state immediately before and after any authorized mutation.

Importer PR21 remains draft at `fc7fdf6e50df08cccad86da37c8b0f15f4b72e81`, with both CI test runs and CodeQL successful on that head. That is not final audit approval and is not evidence for the later uncommitted security tree. No product merge or activation is authorized by this checkpoint.

## Existing reconciler is not safe to run unchanged

Parent read the backend's existing `scripts/setup-branch-protection.sh` without executing it. It binds required checks to any producer (`app_id: -1`), omits CodeQL based on a now-stale absence claim, replaces the full configuration, and treats any failed protection read as an empty baseline. A permission or transport failure must not be mistaken for confirmed absence. An authorized reconciliation must preserve readable existing restrictions, bind verified check producers and stop on ambiguous reads.

The checked-in backend CODEOWNERS file names only `@BradleyGleavePortfolio`. Its script suggests using a second token for owner review, but another token does not establish an independent reviewer identity. Verify an eligible approving reviewer before enabling a configuration that could prevent all merges; do not manufacture peer approval or lower the required review count.

The present CodeQL workflow contains an analyze-error tolerance path when its Advanced Security lookup is missing, disabled or fails. A successful job is therefore not, by itself, proof of an effective fail-closed analysis gate. This is an inherited control finding, not a dependency-patch regression; keep it in the enforcement queue rather than changing the active backend worker's scope.
