# Agent 116 fleet (one job = one agent = one or two PRs). Times PDT from `date`.
| Job | Model | PRs | Subagent id | Launched | Status |
|---|---|---|---|---|---|
| AUD-OPUS-PRIV-116 | Claude Opus 5.5 | backend #611, then mobile #315 delta | aud_opus_priv_116_audit_611_315_mut7b6u4 | 19:27 | DONE 19:49: #611 RC 0/2/5 (B-611-10, B-611-11); Apple revocation sentence ruled: state only what is true today |
| AUD-SOL-PRIV-116 | GPT-6.1 Sol | backend #611, then mobile #315 delta | aud_sol_priv_116_audit_611_315_mut7b6ud | 19:27 | DONE 19:38: #611 REQUEST CHANGES 0/1/0 (B-611-7 policy says crash reports include email); #315 not re-audited |
| AUD-OPUS-F12-116 | Claude Opus 5.5 | backend #681, #682 | aud_opus_f12_116_audit_fees_681_682_mut7b6uk | 19:27 | DONE 19:55: #681 APPROVE 0/0/4, #682 RC 0/2/1 (B-682-1 800 vs 400 cents, B-682-3 first person); C-681-6 ruled keep number (OR-113-4) |
| AUD-SOL-F12-116 | GPT-6.1 Sol | backend #681, #682 | aud_sol_f12_116_audit_fees_681_682_mut7b6ur | 19:27 | DONE 19:41: #681 RC 0/2/0, #682 RC 0/2/1 |
| AUD-OPUS-F34-116 | Claude Opus 5.5 | backend #683, #684 | aud_opus_f34_116_audit_fees_683_684_mut7b6ux | 19:27 | DONE 19:49: #683 APPROVE 0/0/3, #684 RC 0/1/2 (B-684-1 first-person copy) |
| AUD-SOL-F34-116 | GPT-6.1 Sol | backend #683, #684 | aud_sol_f34_116_audit_fees_683_684_mut7b6v3 | 19:27 | DONE 19:42: #683 RC 0/3/0, #684 RC 0/2/1 |
| AUD-OPUS-F56-116 | Claude Opus 5.5 | backend #685, #686 | aud_opus_f56_116_audit_fees_685_686_mut7b6va | 19:27 | DONE 19:48: #685 APPROVE 0/0/3, #686 APPROVE 0/0/2, tree check passed; flagged first-person payout copy (#682/#684) + log leak #682:896 -> sent to B-F12/B-F34 |
| AUD-SOL-F56-116 | GPT-6.1 Sol | backend #685, #686 | aud_sol_f56_116_audit_fees_685_686_mut7b6vg | 19:27 | DONE 19:36: #685 APPROVE 0/0/1, #686 APPROVE 0/0/1, tree check passed |
| B-RECUR-116 | Claude Opus 5.5 | backend #679, #680 (#678 restack) | b_recur_116_recurring_fix_round_679_680_mut7b6vm | 19:27 | DONE 20:12: FIX ROUND 3 READY #678 b89c199d (unchanged), #679 958806d1 (2,952 lines), #680 2b10687c (2,914) |
| B-661-116 | Claude Opus 5.5 | backend #661 | b_661_116_paymentsheet_credentials_fix_round_3_mut7b6vs | 19:27 | DONE 20:05: FIX ROUND 3 READY @ a193d7e1 (B-661-3 closed; C-661-2 backfill SQL = operator deploy-window item) |
| AUD-OPUS-CM1-116 | Claude Opus 5.5 | backend #674, #676 | aud_opus_cm1_116_audit_coach_money_674_676_mut7b6w0 | 19:27 | DONE 20:00: #674 RC 0/4/5, #676 RC 0/2/1; admin guard pair on other routes -> queued B-ADMIN-GUARD |
| AUD-SOL-CM1-116 | GPT-6.1 Sol | backend #674, #676 | aud_sol_cm1_116_audit_coach_money_674_676_mut7b6w7 | 19:27 | DONE 19:41: #674 RC 0/4/0, #676 RC 0/2/2 |
| AUD-OPUS-D12-116 | Claude Opus 5.5 | backend #687, #688 | aud_opus_d12_116_audit_dunning_687_688_mut7b6we | 19:27 | DONE 19:50: #687 RC 0/1/3 (B-687-1 first-person footer), #688 RC 0/1/4 (B-688-1 lost dispute unlocked by renewal) |
| AUD-SOL-D12-116 | GPT-6.1 Sol | backend #687, #688 | aud_sol_d12_116_audit_dunning_687_688_mut7b6wk | 19:27 | DONE 19:41: #687 RC 0/2/1, #688 RC 0/5/0 |
| B-CI-116 | Claude Opus 5.5 | new backend PR (jest OOM) | b_ci_116_fix_jest_oom_in_build_and_test_mut7b6wr | 19:27 | DONE 20:13: opened #694 READY @ 14c84c75 (type-check off in jest, tsc gate kept + guard spec; jest 334 s -> 138-235 s) |
| AUD-SOL-CM2-116 | GPT-6.1 Sol | backend #677, #675 | aud_sol_cm2_116_audit_coach_677_675_mut7o8fd | 19:38 | DONE 19:49: #677 APPROVE 0/0/0, #675 APPROVE 0/0/0 |
| B-611-116 | Claude Opus 5.5 | backend #611 (FIX ROUND 8) | b_611_116_privacy_policy_fix_round_8_mut7opeo | 19:38 | DONE 20:25: FIX ROUND 8 READY @ 357c40fe (all findings closed; Apple sentence per ruling; 2,743 lines) |
| B-D12-116 | Claude Opus 5.5 | backend #687, #688 (+ restack #689-#691) | b_d12_116_dunning_fix_round_687_688_mut7sj2d | 19:41 | running |
| B-F12-116 | Claude Opus 5.5 | backend #681, #682 (+ restack #683-#686) | b_f12_116_fees_fix_round_681_682_mut7sw4y | 19:41 | running |
| B-CM1-116 | Claude Opus 5.5 | backend #674, #676 (+ restack #677) | b_cm1_116_coach_money_fix_round_674_676_mut7t1qb | 19:41 | running |
| B-F34-116 | Claude Opus 5.5 | backend #683, #684 (+ restack #685-#686) | b_f34_116_fees_fix_round_683_684_mut7ttx3 | 19:42 | running |
| AUD-OPUS-CM2-116 | Claude Opus 5.5 | backend #677, #675 | aud_opus_cm2_116_audit_coach_677_675_mut81fer | 19:48 | DONE 20:02: #677 APPROVE 0/0/1, #675 RC 0/1/2 (B-675-1 package_id dropped by filter); MRR excludes trials -> B-CM1 |
| AUD-OPUS-MRG1-116 | Claude Opus 5.5 | backend #664, then #652 (merge-only deltas) | aud_opus_mrg1_116_merge_only_deltas_664_652_mut828ay | 19:49 | DONE 20:32: #664 APPROVE, #652 APPROVE 0/0/1 @ 74667fe7 |
| AUD-SOL-MRG1-116 | GPT-6.1 Sol | backend #664, then #652 (merge-only deltas) | aud_sol_mrg1_116_merge_only_deltas_664_652_mut82f3k | 19:49 | DONE 20:30: #664 APPROVE 0/0/1, #652 APPROVE 0/0/0 @ 74667fe7 |
| AUD-OPUS-D34-116 | Claude Opus 5.5 | backend #689, #690 | aud_opus_d34_116_audit_dunning_689_690_mut82pl3 | 19:49 | DONE 20:18: #689 RC 0/2/2, #690 RC 0/1/4; ruling cancel in dispute cycle = end access now |
| AUD-SOL-D34-116 | GPT-6.1 Sol | backend #689, #690 | aud_sol_d34_116_audit_dunning_689_690_mut84nrz | 19:50 | DONE 20:04: #689 RC 0/4/0, #690 RC 0/5/1 |
| AUD-OPUS-T12-116 | Claude Opus 5.5 | backend #671, #672 | aud_opus_t12_116_audit_trials_671_672_mut8a3gz | 19:55 | DONE 20:24: #671 RC 0/1/3, #672 RC 0/1/6 (B-672-1 time zone) |
| AUD-SOL-T12-116 | GPT-6.1 Sol | backend #671, #672 | aud_sol_t12_116_audit_trials_671_672_mut8hn59 | 20:00 | DONE 20:16: #671 RC 0/1/0, #672 RC 0/2/1 |
| B-675-116 | Claude Opus 5.5 | backend #675 | b_675_116_package_create_fix_round_675_mut8jdcs | 20:02 | DONE 20:36: FIX ROUND 1 READY @ e45b06f9 (B-675-1, C-675-2, C-675-3 closed; 1,318 lines) |
| B-D34-116 | Claude Opus 5.5 | backend #689, #690 (+ restack #691) | b_d34_116_dunning_fix_round_689_690_mut8lzey | 20:04 | running |
| AUD-OPUS-661CI-116 | Claude Opus 5.5 | backend #661, then B-CI PR | aud_opus_661ci_116_audit_661_ci_pr_mut8mwmn | 20:05 | DONE 20:30: #661 RC 0/1/3 (B-661-5 hosted double activation), #694 APPROVE 0/0/2 |
| AUD-OPUS-R12-116 | Claude Opus 5.5 | backend #678, #679 | aud_opus_r12_116_audit_recurring_678_679_mut8wfl3 | 20:12 | DONE 20:30: #678 APPROVE 0/0/0, #679 APPROVE 0/0/2 (C-679-1 race, C-679-2 >100 subs); SBOM gate bug in main assert-prod-sbom.sh |
| AUD-SOL-661CI-116 | GPT-6.1 Sol | backend #661, #694 | aud_sol_661ci_116_audit_661_694_mut8x189 | 20:13 | DONE 20:27: #661 RC 0/1/0 (B-661-3 stale prefetch still open), #694 RC 0/1/1 (guard gap) |
| B-T12-116 | Claude Opus 5.5 | backend #671, #672 (+ restack #673) | b_t12_116_trials_fix_round_671_672_mut91onj | 20:16 | running |
| AUD-SOL-R12-116 | GPT-6.1 Sol | backend #678, #679 | aud_sol_r12_116_audit_recurring_678_679_mut93u7z | 20:18 | running |
| AUD-OPUS-R3-116 | Claude Opus 5.5 | backend #680 | aud_opus_r3_116_audit_recurring_680_mut9bay0 | 20:24 | running |
| AUD-OPUS-PRIV2-116 | Claude Opus 5.5 | backend #611 FR8, then #611 + mobile #315 refresh deltas | aud_opus_priv2_116_audit_611_fr8_315_mut9d37d | 20:25 | running |
| AUD-SOL-PRIV2-116 | GPT-6.1 Sol | backend #611 FR8, then #611 + mobile #315 refresh deltas | aud_sol_priv2_116_audit_611_fr8_315_mut9e6zw | 20:27 | running |
| B-661-R4-116 | Claude Opus 5.5 | backend #661 (round 4: Sol B-661-3, Opus B-661-5, C-661-6/7) | b_661_r4_116_661_fix_round_4_mut9j106 | 20:30 | running |
| B-CI2-116 | Claude Opus 5.5 | backend #694 round 2 + new SBOM gate PR | b_ci2_116_694_round_2_sbom_gate_pr_mut9jg9w | 20:30 | running |
| AUD-SOL-R3-116 | GPT-6.1 Sol | backend #680 | aud_sol_r3_116_audit_recurring_680_mut9jnd8 | 20:30 | running |
| AUD-OPUS-W12-116 | Claude Opus 5.5 | mobile #359, #360 | aud_opus_w12_116_audit_mobile_359_360_mut9mkg2 | 20:32 | running |
| AUD-OPUS-CM3-116 | Claude Opus 5.5 | backend #675 FR1, then #676 fix round | aud_opus_cm3_116_audit_675_then_676_mut9rfbi | 20:36 | running |

Operator actions: 19:28 update-branch backend #664 (from 3e976861) and mobile #312 (from f8375ca6); both wait for a merge-only delta pair.
19:38 rerun failed build-and-test on #664 (run 37171159421, jest OOM in community-message-shape.live.spec.ts, known flake)
19:48 queued: B-F56-116 (#685 r5 copy expectations + Sol C-685-1 + Opus Cs) after B-F34 restack
19:49 posted FIX ROUND 1 (merge-only) READY FOR AUDIT on #664 @ d35333d3 (11/11 green after one OOM rerun)
20:00 queued: B-ADMIN-GUARD-116 (new backend PR: pre-existing admin guard pair makes owner admin routes unreachable; from AUD-OPUS-CM1-116 report)
20:01 MERGED backend #664 @ d35333d3 -> main f57baba35af51981d0b778ddf4bbdba3e3dfbb07 (dual APPROVE, 11/11). 20:01 update-branch #652 1d43c9d9 -> 74667fe7.
20:13 deploy run 37173413080 dispatched for main f57baba3 (#664). 20:13 rerun #652 build-and-test (OOM in cors-config.spec.ts).
20:18 OWNER ACTION to ask: Stripe Billing retry setting 'If all retries for a payment fail' must be 'leave the subscription past-due' (else access ends Day 7, not the Day-10 lockout).
20:24 queued: B-T3 (#673 integrates with recurring #680 one-trial check); mobile push route ClientPackages for trial notice (with #338 job).
20:25 queued: B-APPLE-REVOKE (small #611 follow-up restoring the revocation sentence after owner sets Apple key + test deletion).
20:27 queued next: B-661-R4 (#661) and B-694-R2 (#694) after Opus 661CI verdicts.
20:28 posted FIX ROUND (merge-only) READY on #652 @ 74667fe7 (parents 1d43c9d9 + f57baba3), 11/11 green; MRG1 lenses to audit.
20:30 queued: B-CI2 (#694 round 2 for Sol B-694-1 + new SBOM gate PR fixing scripts/ci/assert-prod-sbom.sh lines 59/62 pipe check). C-679-1/C-679-2 -> next #679 round if Sol RCs, else follow-up PR right after recurring lands.
20:30 deploy 37173413080 failed at migration-delta gate (no delta, apply-migrations given) -> re-dispatched with migrations empty. Rule: migrations=apply-migrations ONLY when the delta has migrations/schema.
20:31 MERGED backend #652 @ 74667fe7 -> main a5b605d1aa86f3afcece6061dc0502f20b83f27e (dual APPROVE, 11/11). 20:32 update-branch #611 357c40fe -> acf9ff0f; mobile #315 8fff3f8f -> refreshed (PRIV2 lenses audit merge-only deltas). Deploy a5b605d1 needs migrations=apply-migrations (#652 has a migration); post-deploy check app.community_win_author_coach revoked from authenticated (C-652-1).
