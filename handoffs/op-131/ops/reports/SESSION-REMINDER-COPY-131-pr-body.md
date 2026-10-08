Tier: T1
Why: Two copy-only string changes remove false session-reminder claims without changing delivery. ([Backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend.git))
T4 trigger scan: none; no auth, tenancy, private-data, money, credentials or destructive-data changes.
T3 trigger scan: none; no scheduling, delivery, API or schema changes.
Bounded T1: YES; two literals in `BookingEmitter.reminder()` plus matching specs.
Canonical builder: GPT-6.1 Sol
Parent owner: agent 131
Acceptance evidence: three failing-first assertions; 52/52 tests passed across the three matching specs, each run separately through `heavy.sh`. ([Backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend.git))
Promotion triggers: changes to reminder scheduling, delivery, recipient access or persisted data beyond copy.

## What changes for coaches/clients

- Saved 24-hour reminders use the date-neutral title `Session reminder`, so the title does not name the wrong day when read later. ([Backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend.git))
- Clients with no call link see `It has no call link yet.` rather than a promise of a future coach action; this applies to both reminder intervals. ([Backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend.git))
- The coach's add-link prompt, 1-hour title, scheduled-time text, tap targets and separate lock-screen copy stay unchanged. ([Backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend.git))

## B / U list

- B1 — seen in a test, `src/notifications/emitters/booking.emitter.ts:513`: a client or coach reading the saved 24-hour reminder on the session day sees a title naming the wrong day; fixed with a neutral title. ([Backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend.git))
- B2 — seen in a test, `src/notifications/emitters/booking.emitter.ts:505`: a client with no session call link is promised that the coach will add one even though none exists; fixed with a factual missing-link line. ([Backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend.git))
- U: none.

## Acceptance evidence

Failing first, before changing the emitter:

```text
heavy.sh npx jest test/booking-emitter.spec.ts --runInBand --testNamePattern='reminders name|inbox copy'
3 failed assertions: unsupported promise (24h and 1h), date-relative saved title (24h).
```

Green, each file run separately with `heavy.sh npx jest <file> --runInBand`:

| Spec | Tests passed |
|---|---:|
| `test/booking-emitter.spec.ts` | 23 |
| `test/booking-reminder-local-time.spec.ts` | 8 |
| `test/scheduling-reminder-delivery.spec.ts` | 21 |

The red run reproduced both claims, and the green runs cover the inbox copy plus unchanged coach prompt, recipient routing and lock-screen delivery. ([Backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend.git))

Size: 35 additions + 12 deletions = 47 changed lines across four files; no dependency, lockfile, schema or flag changes. ([Backend repository](https://github.com/BradleyGleavePortfolio/growth-project-backend.git))

agent 131
