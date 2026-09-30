# Frozen assertion preservation map

All ten frozen pairing/contract spec files are byte-identical in final C1b. Every original assertion, including helpers outside test callbacks, is therefore preserved. AST mapping additionally hashes 170 recognized test blocks containing 365 expect calls; parameterized expansion produces 175 executed tests. C1a carries 158 recognized blocks (including unchanged baseline tests); C1b adds 12 blocks / 44 expect calls, which expand to 17 additional executed tests. No assertions are rewritten, compressed or skipped.

[Complete block hashes and temporal mapping](assertion-preservation.json), [tree delta](original-to-split-delta.json), [C1a run](C1a-focused.log), [C1b run](C1b-focused.log).

| File | A blocks | B blocks | A expect calls | B expect calls |
|---|---:|---:|---:|---:|
| `src/extension-pair/__tests__/auth-mint-extension-session.spec.ts` | 10 | 0 | 21 | 0 |
| `src/extension-pair/__tests__/coach-guard-role.spec.ts` | 5 | 0 | 5 | 0 |
| `src/extension-pair/__tests__/durable-intent.spec.ts` | 11 | 1 | 35 | 4 |
| `src/extension-pair/__tests__/durable-session.spec.ts` | 0 | 10 | 0 | 33 |
| `src/extension-pair/__tests__/extension-pair-redeem-contract.spec.ts` | 10 | 0 | 35 | 0 |
| `src/extension-pair/__tests__/extension-pair.controller-wiring.spec.ts` | 12 | 0 | 16 | 0 |
| `src/extension-pair/__tests__/extension-pair.controller.spec.ts` | 4 | 0 | 7 | 0 |
| `src/extension-pair/__tests__/extension-pair.dto.spec.ts` | 19 | 0 | 26 | 0 |
| `src/extension-pair/__tests__/extension-pair.service.spec.ts` | 39 | 0 | 81 | 0 |
| `test/contracts/importer-contract.spec.ts` | 48 | 1 | 95 | 7 |

The complete init→status→redeem→session chain remains at its original durable-intent.spec.ts position when introduced by B; A excludes the entire 13-line block. All of durable-session.spec.ts and the 16-line generated-session contract assertion are likewise introduced only by B. [A boundary check](C1a-boundary.json), [B relative patch](C1b-relative.patch).
