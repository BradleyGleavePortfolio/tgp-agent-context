# Annex lane A2-COACH-TOOLS — Claude Opus 5.5 builder, T4 (codes, access, money)
Read /home/user/workspace/ops/lanes113/annex/_BUILD_COMMON.md and /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. Put "Builder: TGP annex lane A2-COACH-TOOLS" in every PR body. Report: /home/user/workspace/ops/reports/A2-COACH-TOOLS-annex.md and a line in tgp-agent-context handoffs/annex/STATUS.md.

Owner: coaches see a daily signup count by code/package (to catch a leaked clinic code), and can create, rotate and revoke codes
and generate QR codes in the app; coach CSV export (decision 6; backend tax CSV export route is in open PR #641 owned by agent 113's
lane S-COACH-3 — do not edit #641; build the mobile export UI against its contract and note the dependency); "stop billing but keep
access" for a client (coach comps the client: their subscription stops renewing at period end or immediately per a clear choice, and
access continues as comp access; audit row; client gets a calm notice) — agent 113's lane B-RECUR owns subscription creation/cancel
code; reuse its cancel route when merged, otherwise stack and note it.
Build backend (new PR from origin/main): code management routes (create with prefix GP-, rotate = new code + old revoked with grace
period option, revoke, list with usage), QR payload (deep link https://app.trygrowthproject.com/join/<code> — universal links /join/*
are live), daily signup counts per code and package (timezone = coach's), RLS/tenancy tests. Mobile (new PR): Codes screen (list, create,
rotate, revoke with confirmation, share sheet + QR render), signups chart (simple, clear), export button, comp access action on client
detail. Specific copy for every error. Tests failing-before.
