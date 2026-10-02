# B-FLAGS (agent 110) - Claude Opus 5.5 builder: audited launch-flag path (T4) + SC2015 infra-lint fix

Status: IN PROGRESS (started 23:32 PDT 10-01). Base: backend main e5a6044a (#624 merged).

## Findings so far (read-only)
- 108 WIP 8bdb5997 fetched (branch wip/op590e4a5b-s-envtruth-be-20261001). Reused: closed-value flag validation against ENV_RULES,
  duplicate/excluded checks, Wave A/B inventory and gate text. Not reused: `pending_flags` (documentation-only block) and the
  table/awk post-check (B-633-1 class).
- Production names (read-only, names only, fly-secrets-list run 36885057965 at 10-01 15:32Z; no secret-writing workflow has
  run since): no Wave A/B flag is present. MWB_AUTOSAVE_LOCK_TOKEN_SECRET is ABSENT, and FEATURE_MWB_AUTOSAVE_UNDO=true makes
  the autosave service throw at boot without it -> the manifest encodes it as a precondition.
- S-SCHED #632/#634 change BOOKING_REMINDERS_ENABLED to `=== 'on'` (unset = off). The ledger's "BOOKING_REMINDERS_ENABLED=true"
  would silently turn reminders OFF after #632. The manifest uses the literal "on".
