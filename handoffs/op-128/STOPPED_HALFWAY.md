# Work stopped early or left unfinished (operator agent 128, 15:01 PDT 2026-10-07)
Reports live in the operator workspace at /home/user/workspace/ops/reports/<ID>.md and are copied to handoffs/op-128/reports/.

## A. Audits stopped early by the 14:46 credit order (report saved; each has a "Not checked" list)
| audit | report | Bs found | fix status | not checked |
|---|---|---|---|---|
| FW-ONB-128 onboarding | reports/FW-ONB-128.md | B1 no way to resend the sign-up email; B2 Roman's tour says untrue things (no coach/plan) | B1: ONB-RESEND-128 running; B2: job ONB-TOUR-128 not started | 4 items listed in report |
| FW-MONEY-128 payments | reports/FW-MONEY-128.md | B1 "refunds are handled by your coach" (false); B2 payment emails reply to a dead noreply inbox; B3 Membership "Active" from the coach link only | B1: REFUND-COPY-128 running (interim honest line); B2: MONEY-MAIL-128 running (Reply-To = coach); B3: job MONEY-MEMBER-128 not started | Deliverables, UpdateCard, one-time payment path, Stripe webhook access, money push copy |
| FW-TRAIN-128 training | reports/FW-TRAIN-128.md | B1 returning to the app closes the live workout; "Start Fresh" deletes it | TRAIN-GATE-128 running | coach view of client logs, Android back mid-workout, routine-delete wording |
| FW-BODY-128 body/health | reports/FW-BODY-128.md | B1 iPhone number pad hides Log weight Save; B2 health-app data ignores sharing switches (disclosed on Connect sheet) | B1: WEIGH-KB-128 running; B2: job J3 not started | B1 not confirmed on a real iPhone |
| FW-COACH-128 coach link | reports/FW-COACH-128.md | none (7 U; Coach Guidelines button 403s) | jobs not started | booking reminder delivery, coach-side AI vs sharing switches |
| FW-FOOD-128 food logging | reports/FW-FOOD-128.md | none (12 U; Meal Reminders switch sends nothing) | jobs not started | Home food/water card, Food paywall copy, coach view of food, Apple Health water |
| DESIGN-QA-128 cross-screen design | reports/DESIGN-QA-128.md | none; 10 Opus fix jobs (shared primitives first) | not started | vertical spacing, coach empty/loading states |
Finished fully before the order: FW-ROMAN-128, FW-NOTIF-128, FW-ACCOUNT-128, FW-COMM-128, NUTR-AUD-128, R11-INT-AUD-128 (all fix jobs not started).

## B. Reviewers stopped at 14:46 (no half-done reviews): LN-OPUS-C/D/E-128, LN-SOL-C/D/E-128 (reports/LN-*-128.md). Kept: Opus A/B, Sol A/B until 17:30.

## C. Open PRs with a REQUEST CHANGES and no fixer (must be fixed before merge)
| PR | screen | finding | builder report |
|---|---|---|---|
| mobile#506 | Roman conversations | Sol: false guidance-availability banner | reports/DES-BC-127.md |
| mobile#507 | preferences | Sol: System maps an unused email field; stored-only choices need on-screen disclosure (head moved to f39057d4) | reports/DES-BA-127.md |
| mobile#502 | role choice and invite | Sol REQUEST CHANGES at 33c493c2 | reports/DES-AW-127.md |
| mobile#513 | coach AI-credits line (playbook) | Opus REQUEST CHANGES at 3cc98257 | reports/PB-POOL-128.md |
| mobile#494 | recipes | Sol REQUEST CHANGES; FIX-494-128 running (also folds saved-recipe fix) | reports/FIX-494-128.md |

## D. Ready, waiting for both reviews: mobile#516 privacy/data, #512 challenges, #510 learning, #504 sign in, #490 meal plan, #485 assigned workout (the last three got an operator README-only main merge at 14:53).

## E. Still running at 15:01: FLIP-MEM-PB-128 (memory + playbook flag PRs), R11-FIX-128 (Roman tools timeout + consent-first notes read), NUTR-BE-128 (prep guide source, grocery merge, ended plans), FIX-494-128, FIX-500-128 (prep guide honest copy, Add all once), DES-K2-128 (Home child cards), FIX lane Sol B, and FIXWAVE-128: WEIGH-KB, TRAIN-GATE, ONB-RESEND, MONEY-MAIL, EXLIB, REFUND-COPY.

## F. Written but never started (owner 14:33 drain, then credits)
DES-AQ-127, DES-AZ-127, DES-P-128 (after WEIGH-KB merges: same file), CHECKOUT-COPY-128, NUTR-LOGPLAN-128 ("Log this meal", owner YES), every fix-job row in the FW-* reports, DESIGN-QA-128's 10 jobs, ONB-TOUR-128, MONEY-MEMBER-128.

## Stopped at 15:24 PDT (owner credit line, 44k): 48 agents launched at 15:21
41 CLIENTFIX-128 builders, 6 lenses (C2, D2, E2) and the Sol standing fixer were stopped two minutes after launch, before any push.
Their jobs are rows in ops/JOBS128.md '## CLIENTFIX-128'. Their stale claim comments on m#517, m#514, m#506 and b#857 were deleted.
