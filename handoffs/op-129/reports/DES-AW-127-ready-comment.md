FIX ROUND 1 (OPENING) (DES-AW-127, agent 128) — growth-project-mobile#502 @ 33c493c212b2fdcc98ea6f6ee2ddae0ed929140c — READY FOR AUDIT

303 changed lines (225 additions / 78 deletions), six assigned files.

Exact-head CI is green: Typecheck, lint, test; both CodeQL analyses; CodeQL check. Failing-first baseline proof failed 7/11 on the original copy/label/chrome. All 101 targeted local tests pass through heavy.sh; isolated navigation-stub typing proof also passes.

Fresh `origin/main` merge immediately before READY: “Already up to date” at main `4185b9b2cb4e415234dc526af0f0da97d2dd8ef4`. Worktree clean; diff check clean; no README conflict. Only these screens' key-file README rows changed.

B1 fixed: valid invite resolution no longer claims the account is linked to a coach. U1 fixed: used-link Welcome action is accurately labelled. Visual pass adds serif returned coach names, hairlines, outline status icons, readable Inter controls, one forest primary per state and scrollable layouts.

Every route/action remains reachable and tested. Ten original acceptance, pairing, completion and navigation handler declarations are byte-identical. Role/attachment/consent logic is frozen; no production action.

Operator-only, pre-existing B2: signed-in Continue currently opens Welcome without attaching or forwarding the invite. Public acceptance only validates. Recommended separate auth/pairing assignment: preserve the invite code into the existing explicit join/sharing flow; do not silently attach a coach in this visual PR.

Per the agent-128 override, this builder finishes after report/notify now; no waiting for lens verdicts and no second job.
