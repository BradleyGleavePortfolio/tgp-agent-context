# Two identical packages: free (clinic) and $49/mo (public) — design, agent 109, 2026-10-01 13:45 PDT

Owner 13:35: "I specifically need two packages - identical, but one is $49/mo and ones free. Make this code for a diff
package? You help me think this through DEEPLY". Status: proposal with defaults, waiting for owner OK on section 4.

## 1. What already exists (backend #595 @ e1dd4c39, in audit)
- Code -> package binding: an InviteCode row or the coach's permanent code is bound to one package with
  grant_mode none | free | prepaid (`PUT /v1/invite-codes/:code/package-binding`, audited).
- A free-bound code grants access inside the attach transaction (ClientPurchase $0, source invite_grant:free,
  grant_metadata keeps the code). Revoke is audited; re-entering a code never re-grants a revoked grant.
- Self-claim of a free package (`POST /v1/packages/:id/claim-free`) requires `published_at`. Code grants do not.
  So an UNPUBLISHED free package can only be obtained through its bound code. This is what keeps $49 clients from
  claiming the free twin.

## 2. Setup (operator, C04, through audited admin endpoints after deploy)
- Package F "free": $0, active, NOT published, bound to the clinic code (InviteCode row) with grant_mode free.
  Clinic QR = /join/<clinic code>. Never shown in the public app.
- Package P "$49/mo": recurring $49/month, published, bound to the owner's public code (permanent coach code) with
  grant_mode none (attach, then pay).
- Identical content: both packages list the same content items (programs, meal plans, videos). Items reference the same
  assets, so editing a program updates both; adding or removing an item must be done on both (add a twin-drift check).

## 3. Journeys
1. Clinic patient: scans QR -> signs up -> attached to the owner -> free access. Package prompts suppressed.
2. Public, no coach: banner -> enters public code -> sees "$49/mo coaching" -> pays -> full access.
3. $49 client later becomes a clinic patient: enters clinic code -> free grant -> paid subscription must stop.
4. $49 client cancels: access ends at period end, account and history stay, resubscribe offered.
5. Clinic code leaks: anyone could get free access. Mitigate with a use cap, daily redemption count to the owner,
   one-tap rotation (revoke + new QR), and per-grant revoke.

## 4. Owner decisions (operator defaults)
a. Public code text (owner picks; must not identify the clinic partner).
b. Free clinic access term: default open-ended; package duration (weeks) is supported if the owner wants a term.
c. Paid -> clinic switch: default auto-cancel the paid subscription at period end and notify the client.
d. Public-code users who have not paid: default attached as "not paid yet" (paywalled) so the owner sees them as leads.
e. iOS payments: default the $49 button opens web checkout in the browser (US storefront allows external purchase
   links; 3.1.3(d) only covers real-time one-to-one services, see docs App Review notes section 4), and v1.0 ships on
   the US storefront only.

## 5. Build items
- Banner + code entry on the coachless home; featured offer (code, package, text) from server config. Lane: banner.
- iOS external-browser checkout for packages; remove embedded checkout on iOS. Lane: App Review purchase path.
- Paid -> free auto-cancel at period end (T4 money). Lane: S-FEE.
- Verify every client package list hides unpublished packages (auditors).
- Clinic code use cap + daily redemption count + rotation runbook (C04).
