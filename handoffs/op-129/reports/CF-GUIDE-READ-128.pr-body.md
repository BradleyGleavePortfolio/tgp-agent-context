Tier: T4
Why: one route's role gate changes (GET /coach/my-guidelines goes from coach-only to the signed-in client), so a scoping mistake could show one client's coach guidelines to another person.
T4 trigger scan: role/ownership enforcement on one read route (A3 step 1). No RLS, tenancy, schema, money, credential or destructive-data change. The job entry said T3; graded up because the role gate moves.
T3 trigger scan: none beyond the above (no new architecture: the route mirrors the existing client reads, ClientCheckInsController / client meal plans).
Bounded T1: NO (privilege boundary).
Canonical builder: Claude Opus 5.5 (CF-GUIDE-READ-128, agent 129 fleet).
Parent owner: operator agent 129.
Acceptance evidence: test/client-guidelines-read.spec.ts (new, HTTP level, app built from CoachModule's own guideline controllers behind the real CoachGuard, RolesGuard and ClientEntitlementGuard). Failing first: the same file run on main fd190078 fails 4 of 5 with 403 (CoachGuard), passes 5 of 5 here. test/roles-enforced.spec.ts passes locally (stale allowlist entry removed).
Promotion triggers: any change to what the response contains, to who may call it, or to the coach write path.

## What changes for coaches and clients
- Clients: the clipboard "Coach guidelines" icon on the Train tab now opens the guidelines their coach wrote for them. Today every client gets "Could not load guidelines" because the route refuses non-coaches (403).
- No app change is needed. The path stays `GET /coach/my-guidelines` and the response uses the field names the shipped screen already reads (`description`, `created_at`), so every installed build and tonight's iOS cut work once this deploys. Nothing has to ship in a particular order.
- A client with no coach, or whose coach has written nothing, gets an empty 200. The screen already shows that as "No guidelines yet". A client without an active package gets the usual 402, the same as the rest of Train.
- Coaches: nothing changes. `GET/POST /coach/guidelines/:client_id` stay coach-only.

## Privacy scope
- `req.user.id` is the only input. There are no params, and any query string is ignored (tested).
- It reads only the row for (the client's current coach, this client). That is the same pair Roman reads (roman-client-context.service.ts:562-567), and RLS `p_coachguideline_select` already allows the guideline's client to read it.
- The response is the text and its two dates. It returns no row id, coach id or client id.
- The unscoped "latest row for this client_id" branch in `CoachService.getGuidelines` could not be reached any more, so it is removed. `getGuidelines` now always takes a clientId and checks ownership.

## Changes
- `src/coach/client-guidelines.controller.ts` (new): `ClientGuidelinesController`, `@Controller('coach')`, `@UseGuards(JwtAuthGuard, RolesGuard, ClientEntitlementGuard)`, `@Roles('student')`, `GET my-guidelines`.
- `src/coach/coach.controller.ts`: the `my-guidelines` handler is removed from the CoachGuard class.
- `src/coach/coach.service.ts`: new `getClientGuidelines(clientId)`, and the unreachable branch is removed.
- `src/coach/coach.module.ts`: registers the controller.
- `test/roles-enforced.spec.ts`: drops the stale `CoachController.getMyGuidelines` allowlist entry. The new controller carries `@Roles` at class level.
- `README.md` and `src/coach/README.md`: route tables updated.

## B/U list
- U1 (FW-TRAIN-128 / GUIDE-READ-128): the Coach guidelines icon did nothing for every client (403). Fixed here.
- No B.

## Overlap
Open PRs on the board when this was based on main (b#855 flags/docs; b#857 email/checkout, merged since) do not touch these files. The diff is minimal and makes no mobile change, so mobile m#518 and m#514 (src/services/api.ts) are unaffected.

## Not in this PR (for the operator)
- In production a coach has no visible way to write guidelines. The only writer is ProgramTemplatesScreen, which is behind mwbPrograms, and production has 0 CoachGuideline rows. Until a coach writes one, clients will see "No guidelines yet", which is true.
- CF-TRAIN-TAB-128 (J4) should keep the guidelines icon. The job says to hide it only if this fix is not live.

Signed: agent 129 (CF-GUIDE-READ-128)
