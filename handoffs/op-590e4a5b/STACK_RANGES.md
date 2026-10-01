# Backend stacked PRs — retargeted to main 2026-10-01 ~10:00 PDT for CI only
Audit the INCREMENTAL range (parent head..head); GitHub "Files changed" now shows the cumulative diff vs main.
| PR | parent PR | incremental range |
|---|---|---|
| #597 | — (main) | main..e3167fe7 (round 4: fc5c5a9e..e3167fe7 = 62649d83 + e3167fe7) |
| #599 | #597 | e3167fe7..7b496aca |
| #595 | #599 | 7b496aca..e1dd4c39 (round 4 fix = top commit e1dd4c39, B-595-1) |
| #604 | #595 | e1dd4c39..21ffc02c (round 4 adds only 21ffc02c, test double) |
| #606 | — (main) | main..7e00de0c |
| #607 | #606 | 7e00de0c..245da2e7 |
| #609 | #607 | 245da2e7..1f8b22b9 |
Merge order: #597 → #599 → #595 → #604 ; #606 → #607 → #609 (each after its own approvals).

Fix round 4 (2026-10-01 ~11:30 PDT): #597 62649d83 (A-597-1 non-destructive registration, B-597-2 password proof) + e3167fe7 (CodeQL: marker MAC over canonical address only); #599 pure rebase; #595 + B-595-1; #604 rebase + spec double fix. Previous heads: 597 fc5c5a9e, 599 9a0b9f94, 595 1b782ec8, 604 c3abde8d.
