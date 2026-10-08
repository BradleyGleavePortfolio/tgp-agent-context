Tier: T1
Why: A bounded, read-only redesign of the client macro-target screen.
T4 trigger scan: No auth, tenancy, consent, money, credentials, destructive data or server changes.
T3 trigger scan: No dependency, API contract, persistence or external-service changes. Reuses the existing daily food and current-coach reads.
Bounded T1: Target presentation, honest attribution, conditional food totals and existing pull-to-refresh only.
Canonical builder: GPT-6.1 Sol, DES-AC-127, agent 128.
Parent owner: operator agent 128.
Acceptance evidence: Corrected local test-first baseline at main d0875d26: 6 expected assertions fail, 2 pass. Implementation: all 8 targeted tests pass, including after the operator-requested current-main refresh. The initial tests-only CI at 2fe9acb56f3db9b1949c4b6dce55b6811e78072a stopped on an unsupported RNTL14 query, not a behavioral red result; the fixture now uses public queries. All required checks are green at refreshed head b76e2288d7742ca14a66e93e3e104d9077519a22, GitHub MERGEABLE: https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37685646981. No audit approval claimed.
Promotion triggers: New permission boundaries, writes, endpoint contracts or target-calculation rules leave this scope.

## What changes for coaches/clients
One calorie hero, monochrome QuietBar macro rows with real daily consumption where available, all existing target details and simple/full behavior preserved. Attribution uses a verified matching coach identity, otherwise neutral copy. Loading or failed food totals are never substituted with an invented zero.

## B/U list
- B1: A client without a coach opens an empty target screen and is told their coach has not set macros, although no coach exists.
- U1: Boxed target grids compete with the calorie hero and omit the food-log context.

## Routes/actions before -> after
| Label / surface | Before destination or effect | After destination or effect |
|---|---|---|
| Pull to refresh | Refetch current targets | Same, plus refresh today's food totals |
| Native stack back | Existing navigator-managed back | Same; no navigation file changes |
| Target edit / food-log link | Not present on this read-only screen | No action invented or removed |
| Simple mode | Calories, protein and explanatory line | Same target visibility |
| Full mode | Calories, protein, carbs, fat, fiber, notes and effective date | Same details, without boxes |

## Truthful sweep
| Before file:line | What it says | What is true | Replacement |
|---|---|---|---|
| ClientMacrosScreen.tsx:185-186 | Your coach has not set macros… | Null target does not establish a coach relationship | Daily targets appear here when set. |
| ClientMacrosScreen.tsx:120-126 | First-week guidance via SIMPLE_VIEW_NOTE | Simple visibility is known, but what the client needs is not | Only calories and protein are shown in this view. |
| ClientMacrosScreen.tsx:136 | Note from your coach | Profile targets do not establish a coach author | Coach-authored target retains wording; otherwise Target note |
| ClientMacrosScreen.tsx:194 | Effective recently for malformed dates | No valid effective date is available | Omit the date unless recorded and valid |

## Reference match and intentional divergence
Matches A23 restraint: bone background, hairlines, Cormorant/tabular calorie hero, Inter labels and one forest palette. No fictional denominator, consumed value, coach name or attribution is invented. Full-mode fiber and target notes remain visible; simple mode remains intentionally lighter. The native header stays with its existing back behavior.

## Test-first details
Saved local evidence: `ops/reports/DES-AC-127-local-baseline.log` (six expected old-presentation assertion failures), `ops/reports/DES-AC-127-local-test.log` (8/8 pass). The initial tests-only CI fixture error is recorded at https://github.com/BradleyGleavePortfolio/growth-project-mobile/actions/runs/37680966629 and is not claimed as behavioral proof.
