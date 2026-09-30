# PR524 re-establishment evidence

This directory preserves the original dependency candidate and its fresh validation/audit evidence. Source remains frozen at `238f0f1f152ebbb1b4691f555e98c888473d8ee7`, tree `b2bb1666a91d60927d3ee1d6455ce687ce1c8739`, base `c23b9d9f3fcc106b92c061ceb7d04d7ec53038d7`. These records do not authorize a product merge.

## Independent reports

Lens A is preserved byte-for-byte under `audit-a/REPORT.md`, SHA256 `41799a8dade81ebb9e7028d34ae1dd4fb22d374427101c30af5463e583580b70`. It reports 22 findings and no unfinished review section; operator-level evidence remains outstanding. Lens B was still active when this index was created.

All 12 Lens A files are preserved, including its full diff, full lock inventory, native evidence summaries, counterexample, source verification and complete report. The Python file is historical analysis evidence, not installed product code or an instruction to execute it.

## Reading the original report references

Original report bytes and original relative workspace references are retained for evidentiary integrity. Several relative references therefore do not navigate in this publication layout. Use these exact-source mappings rather than assuming a broken local link means the input was unavailable:

| Original reference root | Durable equivalent |
|---|---|
| `../../op81-backend-audit-a/` | [Backend at exact candidate](https://github.com/BradleyGleavePortfolio/growth-project-backend/tree/238f0f1f152ebbb1b4691f555e98c888473d8ee7) |
| `../../op81-audit-context/` | [Canonical context at exact audit input](https://github.com/BradleyGleavePortfolio/tgp-agent-context/tree/2ead9b05e967713201c03619b564a3db4cadea35) |
| `../../op80-evidence/` | [Preserved Op80 archive](https://github.com/BradleyGleavePortfolio/tgp-agent-context/tree/3300d31539df4428c9b8f5f85215a4842c30728c) |
| `../PR524_REESTABLISHMENT_BRIEF.md` | [Frozen review brief](../../PR524_REESTABLISHMENT_BRIEF.md) |
| `../validation/` | `validation/` in this evidence directory; large original outputs are compressed without textual alteration |
| `../backend-*.json`, `../pr524.json` | Same basename in this evidence directory |
| Bare audit filenames | Same directory as the preserved report |

## Limits and next step

The supplied native commands returned success, including the full default suite, but the independent review identifies inherited enforcement and security-boundary gaps. No production test, restore drill, real source-account import or deployment is implied.

Reconcile both independent reports, preserve every finding, and create explicitly owned fix slices. No failed rule is waived because it is inherited. Source repairs, security-setting approval, real recovery evidence and independent exact-head clearance are separate obligations.
