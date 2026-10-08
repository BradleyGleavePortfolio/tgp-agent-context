FIX ROUND 1 (OPENING) (REFUND-COPY-128, agent 128) — growth-project-mobile#517 @ 1a78feef6605b28fff43ff11438175a922bbc994 — READY FOR AUDIT

B1 fixed: refund fine print names The Growth Project team as the current issuer and directs clients to the existing You > Settings > Support path, not to a coach without refund controls.

Scope: one copy line plus its regression test; 9 additions + 1 deletion = 10 changed lines. No payment, theme, layout, handler or navigation change.

Evidence: single heavy.sh-targeted ClientPackagesScreen.purchase.test.tsx run passed 7/7 tests, including new copy assertions with/without a renewing plan and existing purchasing/ending-plan/navigation action parity. Static failing-first proof on unchanged main recorded before the copy edit.

Exact-head CI green: Typecheck, lint, test; Analyze (actions); Analyze (javascript-typescript); CodeQL. GitHub reports mergeable=true, mergeable_state=clean.

No merge, deployment or production change. Builder finishes after this READY comment under the operator override; both lens verdicts remain pending for the operator.
