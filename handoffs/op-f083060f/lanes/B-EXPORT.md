# Lane B-EXPORT (agent 110) — Claude Opus 5.5 builder: data export users can actually download (T4 privacy)

Read /home/user/workspace/ops/AGENT_BRIEF_COMMON.md first, then /home/user/workspace/ops/reports/B-FIX2-110.md (item 18/30 note)
and backend #608's body + verdicts. Finding: on #608's head the data export writes to LOCAL disk (DATA_EXPORT_FS_DIR default
/tmp/exports, local:// URLs) and getLatestStatus returns download_available=false for local files, so production users cannot
download their export (Fly machines are ephemeral, multi-machine). Build: store export archives in a PRIVATE Supabase storage bucket
(or the existing S3 client if the backend already uses one; check src for @aws-sdk/client-s3 / supabase storage usage and reuse it),
deliver through a short-lived signed URL bound to the requesting user, expire and delete archives (TTL + nightly sweep), make
account deletion remove any archive (pairs with #608's cleanup path and B-608-11 retry semantics), and show the user a working
download in the app (mobile: existing data-export screen; Android/iOS share sheet or browser open). Bucket creation must be a
migration or an audited workflow step, never a manual console change; document the exact production step. Base your PR on main
after #608 merges if #608 has merged; otherwise stack on #608's branch and say so. Tier T4. Tests: signed URL scoping, expiry,
cross-user denial, deletion removes archive, retry on storage errors. Report to /home/user/workspace/ops/reports/B-EXPORT-110.md.
Final answer (<400 words): PRs + heads, tests, CI, risks, exact production step.
