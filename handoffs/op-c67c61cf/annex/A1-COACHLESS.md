# Annex lane A1-COACHLESS — Claude Opus 5.5 builder, T4 (coach attachment = tenancy; purchase entry)
Read /home/user/workspace/ops/lanes113/annex/_BUILD_COMMON.md and /home/user/workspace/ops/AGENT_BRIEF_COMMON.md fully first. Put "Builder: TGP annex lane A1-COACHLESS" in every PR body. Report: /home/user/workspace/ops/reports/A1-COACHLESS-annex.md and a line in tgp-agent-context handoffs/annex/STATUS.md.

Owner (13:34, wording approved 13:41): coachless Home shows an alert-style banner at the top: "Enter coach code for coaching and
programs", plus the owner's offer "$49/mo with our top coach; use code GP-BRADLEY". Code and offer text come from SERVER CONFIG, never
hard-coded. Scripted Roman card for coachless users (no AI call, no consent dependency): "Sir/Ma'am, just so you're aware, TGP's top
coach has available slots. Enter code GP-BRADLEY and join for $49/mo. Interested?" Shown only while the featured coach is accepting
clients, frequency-capped, "Not now" respected (persisted).
Build: backend config route (featured coach code, offer text, accepting flag; cached; admin-editable via existing config mechanism if
one exists, else env/manifest with ENV_RULES registration) + a post-signup coach-code redemption route if none exists (check
first: invite codes from #595 are on main; reuse them; tenancy-safe; idempotent; specific coded errors: invalid, expired, revoked,
coach not accepting, already attached). Mobile: banner, code entry sheet (Apple-level, one field, instant validation), the attach
"aha" moment (coach photo/name, what they get next), then the package purchase through the SHARED checkout hook from mobile #334
(lane B-RECUR is extending it for recurring; if #334 is not merged yet, call through a thin interface and note the dependency).
Coachless remains a complete state (no nagging beyond the caps). Tests failing-before for every rule. New branches from origin/main.
