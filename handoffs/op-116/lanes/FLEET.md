# Agent 116 fleet (one job = one agent = one or two PRs). Times PDT from `date`.
| Job | Model | PRs | Subagent id | Launched | Status |
|---|---|---|---|---|---|
| AUD-OPUS-PRIV-116 | Claude Opus 5.5 | backend #611, then mobile #315 delta | aud_opus_priv_116_audit_611_315_mut7b6u4 | 19:27 | running |
| AUD-SOL-PRIV-116 | GPT-6.1 Sol | backend #611, then mobile #315 delta | aud_sol_priv_116_audit_611_315_mut7b6ud | 19:27 | running |
| AUD-OPUS-F12-116 | Claude Opus 5.5 | backend #681, #682 | aud_opus_f12_116_audit_fees_681_682_mut7b6uk | 19:27 | running |
| AUD-SOL-F12-116 | GPT-6.1 Sol | backend #681, #682 | aud_sol_f12_116_audit_fees_681_682_mut7b6ur | 19:27 | running |
| AUD-OPUS-F34-116 | Claude Opus 5.5 | backend #683, #684 | aud_opus_f34_116_audit_fees_683_684_mut7b6ux | 19:27 | running |
| AUD-SOL-F34-116 | GPT-6.1 Sol | backend #683, #684 | aud_sol_f34_116_audit_fees_683_684_mut7b6v3 | 19:27 | running |
| AUD-OPUS-F56-116 | Claude Opus 5.5 | backend #685, #686 | aud_opus_f56_116_audit_fees_685_686_mut7b6va | 19:27 | running |
| AUD-SOL-F56-116 | GPT-6.1 Sol | backend #685, #686 | aud_sol_f56_116_audit_fees_685_686_mut7b6vg | 19:27 | running |
| B-RECUR-116 | Claude Opus 5.5 | backend #679, #680 (#678 restack) | b_recur_116_recurring_fix_round_679_680_mut7b6vm | 19:27 | running |
| B-661-116 | Claude Opus 5.5 | backend #661 | b_661_116_paymentsheet_credentials_fix_round_3_mut7b6vs | 19:27 | running |
| AUD-OPUS-CM1-116 | Claude Opus 5.5 | backend #674, #676 | aud_opus_cm1_116_audit_coach_money_674_676_mut7b6w0 | 19:27 | running |
| AUD-SOL-CM1-116 | GPT-6.1 Sol | backend #674, #676 | aud_sol_cm1_116_audit_coach_money_674_676_mut7b6w7 | 19:27 | running |
| AUD-OPUS-D12-116 | Claude Opus 5.5 | backend #687, #688 | aud_opus_d12_116_audit_dunning_687_688_mut7b6we | 19:27 | running |
| AUD-SOL-D12-116 | GPT-6.1 Sol | backend #687, #688 | aud_sol_d12_116_audit_dunning_687_688_mut7b6wk | 19:27 | running |
| B-CI-116 | Claude Opus 5.5 | new backend PR (jest OOM) | b_ci_116_fix_jest_oom_in_build_and_test_mut7b6wr | 19:27 | running |

Operator actions: 19:28 update-branch backend #664 (from 3e976861) and mobile #312 (from f8375ca6); both wait for a merge-only delta pair.
