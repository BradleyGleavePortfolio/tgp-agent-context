# TM-7a audit — Lens A (correctness / security / RLS) — SHA 409a4bfa

## Verdict: FINDINGS (in progress)

## Findings

### P3-1 — Prod LOC exceeds the 400-line hard cap
**File:** whole-PR diff vs `origin/main`
**Issue:** Prod LOC (excluding tests + migrations) = **436** (controller 63 + dto
76 + service 237 + cursor 52 + module +8), over the 400 hard cap that this very
PR exists to satisfy (it was split out of #448 *because* #448 was 476). Much of
the bulk is the shared cursor (52) + dto (76) carried in 7a so 7b can import
them, but the diff a reviewer sees is still 436.
**Recommended fix:** Acceptable-with-justification at most; the cap is a review
convention (no CI gate enforces it — confirmed `.github/workflows/ci.yml` has no
line-count step). If the cap is hard, the only real lever is trimming the
service's non-load-bearing comments (~49 comment/blank lines), but those
document the P1-3 invariant and are worth keeping. Flagging per scope item #9;
defer to release owner.

## Checks passed (running)
