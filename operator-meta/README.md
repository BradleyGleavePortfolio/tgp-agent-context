# operator-meta

**All rules now live in `/AGENT_RULES.md` (the TGP Master Doctrine).** The `R*.md` files here are deprecated redirect stubs. A few files remain active in place for backward compatibility with running overnight crons — `ZOMBIE_AGENT_PROTOCOL.md`, `AUTONOMY_CONTRACT.md`, `R100_AUDIT_CHECKLIST_TEMPLATE.md`, `BRIEF_PREAMBLE_R100.md`, `AGENT_47_HANDOFF.md`, and `OPERATOR_STATE.md` — each carries a note that its content is also reflected in the master. Read the master file as the source of truth.

See the parent `README.md` for the full layout and the stranded-doc rescue backlog.

Files in this directory are referenced from product repos via the path `tgp-agent-context/operator-meta/<filename>`. To survive cross-repo CI doc-reference checks, the bare filename should also appear on each product repo's `.agent-doc-allowlist` until cross-repo path resolution is wired into the verifier.
