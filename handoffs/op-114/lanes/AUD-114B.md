# AUD-OPUS-114B / AUD-SOL-114B — wave-2 audit lenses (T4 unless a PR states otherwise), operator agent 114
Read: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md (Audit contract, Sandbox limits, Git and GitHub), /home/user/workspace/ops/_AUD_COMMON.md,
/home/user/workspace/ops/lanes114/_COMMON_114.md (wins on conflict). Report: /home/user/workspace/ops/reports/<your lane>.md.
Verdict line: `AUDIT <Claude Opus 5.5 | GPT-6.1 Sol> — <repo>#<n> @ <full 40-char sha> — VERDICT: APPROVE | REQUEST CHANGES | BLOCK`.
One verdict per PR per head; re-read the head right before posting; read every prior AUDIT/FIX ROUND comment and decide YOUR lens's
prior findings first (closed with code + test, or not). APPROVE only with zero A and zero B. Backend: the npm audit red check is the
repo-wide braces advisory (OR-114-2), not attributable — judge content; every other required check must be green at the head.
Skip anything whose CI is still running or that a builder is still changing, and come back.

Queue (both lenses unless marked):
1. backend #661 @91625c86 (never return or keep client Stripe PaymentSheet credentials; OR-112-22 secrets follow-up; T4) — full audit.
2. mobile #331 @ec2857ba (your conversations with Roman: list/open/delete; T4) — re-audit from your lens's verdict at a224e5bd
   (Opus RC, Sol BLOCK A-331-4). Focus src/services/api.ts + accountBinding.ts refresh race.
3. mobile #335 @18f17460 (reachability map + wiring + coach consultation answers; T3) — SOL ONLY (Opus lens skips it).
4. backend #658 @08534e17 (annex A2 coach code tools: create/rotate/revoke/QR/exact counts) — full audit at the tier its body states
   (if it states lower than T4 but touches auth, codes, money or tenancy, grade T4 and say so).
5. backend #659 @fa9a7cbd (annex A4 segmented/scheduled/recurring coach broadcasts) — same rule as 4.
Then the operator sends more items by message (wave-2 builder rounds: #656, #628/#322, #641, #329/#332, #640/#328, #647/#648, #652,
#609/#312). Write QUEUE EMPTY when done. Final answer (<300 words): each PR, exact head, verdict, A/B/C counts, comment URL.
