**Tier:** T1 (copy payload of one share action on the no-clients state)
**Why:** U-622-B2-1 (LN-SOL-B2-134 on m#622): "Share my link" (prototype 86 K-LAND) sent only the code when the invite-code row has no `deep_link_url`, which is the usual production case.
**T4 trigger scan:** auth no; tenancy no; money no; PII no (the coach's own invite code, as before); credentials no; destructive data no.
**T3 trigger scan:** none (no navigation, flag, backend or dependency change).
**Bounded T1:** `src/ui/empty-states/EmptyStateNoClients.tsx` (+4/-3), `emptyStateLook.test.tsx` (+14), `ClientsListLookup124.test.tsx` (1 expected message). 23 changed lines.
**Canonical builder:** COACH-CONSULT-M-134 (claude_opus_5_5), agent 134.
**Parent owner:** operator agent 134.
**Acceptance evidence:** jest (locally one file at a time and in CI): `emptyStateLook.test.tsx` (9, new: Share my link sends `https://app.trygrowthproject.com/join/GP-TEST` when the row has no deep link, and the row's `deep_link_url` when it has one), `ClientsListLookup124.test.tsx` (18, real empty-roster Share now carries the join link), guards `truthfulCopy.guard` (20), `copyVoice.guard` (8). Scoped typecheck and eslint clean (0 errors).
**Promotion triggers:** none.

Follow-up to m#622 (merged at 6c26ab65 before this fix was pushed).

## What changes for coaches/clients
- A new coach on Clients (or Messages) with no clients taps "Share my link": the message is now "Join me on Growth Project. Use code <code> or tap: <link>", where the link is the invite row's deep link, or the app's universal invite link `https://app.trygrowthproject.com/join/<code>` (`buildInviteUniversalLink`, the same link the Invite codes screen shares). Before, without a row deep link, the client got only the code.

## Bugs
- U-622-B2-1: "Share my link" without a link.

## WHY / WHEN / WHO
- Root cause: `EmptyStateNoClients` only added a link when `GET /coach/invite-codes` returned `deep_link_url`, which ordinary rows do not carry.
- Introduced: the share message predates m#622 (it said "Share your code" then); m#622 (agent 134, this lane) renamed the button to "Share my link" without changing the payload.
- Who: agent 134, COACH-CONSULT-M-134.

## Routes and actions, before → after
| Route / action | Before | After |
| --- | --- | --- |
| Clients / Messages (no clients) → Share my link | message with the code only (unless the row had `deep_link_url`) | message with the code and a join link (row deep link, else universal invite link) |

## Parity (prototype)
| Prototype screen | Today's file | What matches | What differs and why |
| --- | --- | --- | --- |
| 86 K-LAND | `src/ui/empty-states/EmptyStateNoClients.tsx` | "Share my link" shares a link | none |

## Not seen on a device
Not run on Android or iOS; the share sheet content is seen in a test only.

## README
No README change (the `src/ui/empty-states/README.md` row already says "Share my link").

agent 134
