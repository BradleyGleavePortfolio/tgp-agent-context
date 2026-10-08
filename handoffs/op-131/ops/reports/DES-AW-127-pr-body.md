Tier: T1 — visual and copy only.
Why: Make joining screens calm, readable and truthful without changing role selection or invite attachment.
T4 trigger scan: Auth and pairing handlers, consent, identity, tenancy and storage are untouched. A pre-existing signed-in join omission is escalated below, not built.
T3 trigger scan: None; no API contract, navigator, flags or data model changes.
Bounded T1: Three auth screens, their tests, and only their own auth README rows; no dependencies or lockfiles.
Canonical builder: DES-AW-127, agent 128.
Parent owner: operator agent 128.
Acceptance evidence: Failing-first baseline proof; targeted tests and source-handler parity described below.
Promotion triggers: Any join/auth/consent change goes to a separately assigned T4-capable builder.

## What changes for coaches/clients
- Invite validation no longer tells clients they have already been linked to a coach.
- Real returned coach names use Cormorant; instructions and controls use Inter.
- Bone, theme-driven pages; hairline invite field/notices and secondary actions; no cream-filled boxes or shadows; outline status icons.
- One forest primary per state, sentence-case buttons, readable secondary copy, 44pt+ secondary targets and 52pt primaries.
- Scrollable layouts retain access with longer notices and larger text. No route, action, consent or pairing function is removed.
- Current RoleSelection only confirms the server's student role. Role-choice controls are in CreateAccount, outside this assignment; no new coach/client switch is invented.

## B/U list
- B1 fixed: an ordinary user opens a valid invite and sees a false claim of being linked, but the acceptance endpoint validates only. Copy now describes the resolved invite, not an attachment.
- B2 not changed (frozen): a signed-in user opens a valid invite, but Continue navigates to Welcome without attaching or carrying its code. Recommended separate operator action: use the existing explicit join/sharing flow with code preserved, reviewed as auth/pairing work. `src/screens/auth/AcceptInviteScreen.tsx:126-131`; backend `src/invite-codes/invite-codes.service.ts:1400-1505`.
- U1 fixed: the used-invite Welcome handler was labelled “Go to sign in”; now “Back to welcome”.
- U2 fixed: dense boxed hierarchy, small helpers and uppercase actions become a quieter, readable surface.

## Truthful sweep
Baseline references are from mobile main `c00a2a5f`.

| File:line | Before | What is true | After |
| --- | --- | --- | --- |
| AcceptInviteScreen.tsx:147 | Accepting your invite… | Endpoint validates an invite, not an authenticated relationship | Checking your invite… |
| AcceptInviteScreen.tsx:197 | You're in | Invite resolved; account connection is not established by this call | Invite ready |
| AcceptInviteScreen.tsx:200-203 | You've been linked to [coach]/your coach. | Response returns invite metadata only | This invite is ready to use. Real coach name shown separately only if returned |
| AcceptInviteScreen.tsx:275 | Go to sign in | Destination is Welcome | Back to welcome |

All other true sentences stay word for word. RoleSelection's “You will be paired with …” stays only under `invitePreview.valid`; a returned real coach name takes precedence over the business label. Pending/invalid/unresolved previews do not name a coach. Email confirmation/problem and signup-underneath variants remain unchanged, including the quoted real signup button label.

## Routes/actions before -> after
| Screen/state and label | Before destination/effect | After destination/effect |
| --- | --- | --- |
| RoleSelection: invite code | Edit code; blur previews | Same |
| RoleSelection: Paste invite code | Read clipboard on tap; preview parsed code | Same |
| RoleSelection: Continue | Confirm student or attach supplied invite once; complete cached session | Same |
| RoleSelection retry: Connect to my coach | Existing attach retry | Same |
| RoleSelection connected: Finish sign-up | Persist confirmed attachment; no second redemption | Same |
| RoleSelection: Keep my current coach | Clear pending notice/gate; emit auth event | Same |
| RoleSelection: Continue without a coach for now | Explicit codeless completion when policy permits | Same |
| RoleSelection notice: Continue | Acknowledge existing notice; emit auth event | Same |
| RoleSelection notice/error: Contact support | SupportInbox | Same |
| AcceptInvite signed-in: Continue to app | Welcome | Same |
| AcceptInvite signed-out: Sign in | Login with returned email | Same |
| AcceptInvite signed-out: Create account | CreateAccount with token and email | Same |
| AcceptInvite failure: Back to welcome / Go to sign in | Welcome for every failure | Same; all labelled Back to welcome |
| AcceptInvite network: Try again | Repeat existing acceptance request | Same |
| EmailVerified with signup underneath: Continue | goBack | Same |
| EmailVerified cold start/problem: Sign in | replace Login | Same |
| EmailVerified link problem: Contact support | SupportInbox | Same |

## Acceptance evidence
- New invite/verified test against unchanged baseline: 7 failures, 4 passes, proving the copy/label/style changes were required.
- New tests render both accepted session variants, named/unnamed invite responses, every failure, network retry and loading; press every invite/email route.
- Role preview tests prove no named coach in unresolved/invalid states and serif real names only after resolution.
- Existing role retry and stateful contract tests prove paste, student confirmation, mandatory retry, codeless skip, keep-current-coach, finish-signup without double redemption, acknowledgement and both support links.
- Targeted local runs use `/home/user/workspace/ops/heavy.sh`, one Jest file at a time. No full local suite, lint or typecheck.
- Local results: invite/verified 11, role retry 19, role contract 15, existing acceptance 9, email routing 9, voice guard 8, quiet-luxury doctrine 30: all 101 tests pass.
- TypeScript AST extraction confirms all ten original acceptance/attachment/completion/navigation handler declarations are byte-identical.
- Isolated navigation-stub typing proof passes locally; final-head CI passes typecheck, lint and the full test suite, plus both CodeQL analyses and CodeQL.
- Latest main `4185b9b2cb4e415234dc526af0f0da97d2dd8ef4` merged immediately before READY: already up to date, no conflicts. Final diff: 303 changed lines (225 additions / 78 deletions).
- README updates are only these screens' key-file rows; no appended shared-document section.
- No new dependencies, hex literals, forbidden type casts, shadows, filled secondary cards, celebration animation or production action.
