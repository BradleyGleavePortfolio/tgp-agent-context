# rules

**All rules now live in `/AGENT_RULES.md` (the TGP Master Doctrine).** The `R*.md` files in this directory are deprecated 2-line redirect stubs that point into the master file — they exist only to satisfy old cross-repo references and prevent 404s. Read the master file, not the stubs.

See the parent `README.md` for the full layout and the stranded-doc rescue backlog.

Files in this directory are referenced from product repos via the path `tgp-agent-context/rules/<filename>`. To survive cross-repo CI doc-reference checks, the bare filename should also appear on each product repo's `.agent-doc-allowlist` until cross-repo path resolution is wired into the verifier.
