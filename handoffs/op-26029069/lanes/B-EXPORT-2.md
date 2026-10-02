# Lane B-EXPORT-2 (agent 111) — Claude Opus 5.5 builder: data export round 2 (#636 stacked on #608, mobile #327; T4 privacy)

Read first: /home/user/workspace/ops/AGENT_BRIEF_COMMON.md; /home/user/workspace/ops/lanes110/B-EXPORT.md +
/home/user/workspace/ops/reports/B-EXPORT-110.md; every AUDIT comment on backend #608, #636 and mobile #327 (Sol #636 REQUEST
CHANGES 1/4/1 at 9b7a6a34; Sol #327 REQUEST CHANGES 0/6/1 at 227c5ad9; #608 at 2759e1a0: Opus APPROVE, Sol REQUEST CHANGES with
B-608-12 = export on ephemeral /tmp, which #636 closes). Plan of record: fix #636 + #327 in one pass -> dual approval of #636 ->
operator merges #636 into #608's branch -> #608 update + dual delta -> merge #608, then #327.
Fix in one pass, each with a failing-before test:
- #636: A-636-1 (privacy verifier false-green: it passed with an anon SELECT grant, an `OR true` policy and with storage.objects RLS
  disabled -> the verifier must prove the bucket is private: no anon/authenticated grants or policies that expose it, RLS on,
  bucket public=false), B-636-1 (missing READY archive -> 410 then status still READY / download_available=true and the 24 h
  limiter blocks a new export -> mark FAILED/expired truthfully and allow a replacement), B-636-2 (error page shows
  Bradley@Bradleytgpcoaching.com -> single SUPPORT_EMAIL Bradleyapple1031@gmail.com), B-636-3 (stale RUNNING read racing READY
  commit says FAILED), B-636-4 (storage info() returning {} marks READY without a size check), C-636-1 (storage-call deadline +
  cancel abandoned stream). Migration stays 20270221000000.
- #327: B-327-1 (support address -> Bradleyapple1031@gmail.com via the single constant), B-327-2 (account A's pending link opens
  A's archive in B's session -> bind to the signed-in user and drop on session retirement), B-327-3 (validate the 2xx body; no
  "apiundefined"; unknown status ends the spinner with a specific message), B-327-4 (visible searchable reference IDs), B-327-5
  (old failures must not overwrite READY; null status must not poll forever), B-327-6 (never forward the live archive URL/token
  to Sentry; scrub), C-327-1 (enable the replacement action when its deadline passes).
- #608: if Sol's latest #608 verdict has findings besides B-608-12, fix them on #608's branch in the same pass.
Merge main (backend e5a6044a / mobile e3986e89) where needed with merge commits (no rebase); register env names per #624.
Tests via heavy.sh (targeted jest --runInBand; tsc once per repo per round). PR bodies: fix-round tables. Never merge, dispatch
workflows or touch production. Report: /home/user/workspace/ops/reports/B-EXPORT-2-111.md. Final answer (<400 words).
