# Annex lane A6-PHOTOS — Claude Opus 5.5 builder, T4 (user media: privacy, moderation)
Read /home/user/workspace/ops/lanes113/annex/_BUILD_COMMON.md and /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. Put "Builder: TGP annex lane A6-PHOTOS" in every PR body. Report: /home/user/workspace/ops/reports/A6-PHOTOS-annex.md and a line in tgp-agent-context handoffs/annex/STATUS.md.

Owner verdict 10-01 13:00 item 4: photos in messaging. Build: backend upload flow to a PRIVATE bucket (signed short-lived URLs,
size/type limits, server-side EXIF/GPS strip, image moderation hook consistent with #610's report/review/action loop, erasure on
message delete and on account deletion — add to the deletion manifest used by #608 (agent 113's lane owns #608; if #608 is unmerged,
note the manifest entry needed), report/block parity); mobile: picker (camera + library with the right permission strings), upload
progress, retry, full-screen viewer with pinch-zoom, plug into lane A3's attachment slot (coordinate via PR comments; build
backend + standalone components first). App Store: permission purpose strings accurate. Tests failing-before. Flag OFF by default
until audit + device pass.
