# Roman ED.6 — Coach-Is-Watching micro-signal — Builder Brief

**Author:** Bradley Gleave <bradley@bradleytgpcoaching.com>
**Created:** 2026-06-14
**Lane:** L10 (parallel-safe with L9 v3-4)
**Parent doctrine:** [Roman backlog re-verification 2026-06-14](../audits/ROMAN_BACKLOG_VERIFIED_2026-06-14.md)
**Spec origin:** OPEN_ISSUES_2026-06-09.md §Cycle H ED.6 — "Coach-Is-Watching Micro-Signal — competence pill ('Your coach reviewed this in 2 hours.')"

---

## Why this matters (one paragraph)

A client submits a check-in, message, food log, workout, or progress photo and waits. The single most differentiating signal a fitness coaching app can give them is **proof that a human coach actually looked at it, and how recently.** Whoop and Linear lean hard on this kind of "someone is watching the system" feedback. We surface it as a small composed pill — Roman's calm, butler-register voice, not hype copy — so the client never feels their work is going into a void.

---

## Scope

A **competence pill** component shown on client-facing surfaces where the coach has reviewed the client's submission. Reads as Roman's voice:

- "Your coach reviewed this 2 hours ago."
- "Your coach reviewed this earlier today."
- "Your coach reviewed this yesterday."
- "Your coach reviewed this 4 days ago."

When NEVER reviewed: pill is **hidden** (this is not an empty-state surface; absence is itself information).

**Out of scope (defer to follow-up):**
- Push notification when coach reviews (a separate Cycle E feature)
- "Reviewed by Roman" vs "Reviewed by your coach" disambiguation (just say "your coach" — Roman is the butler, not the reviewer)
- Multiple coach attribution ("3 of your coaches reviewed this") — coach-brief v2 territory

---

## Surfaces (which client screens get the pill)

In priority order:

1. **`ClientCheckInScreen.tsx`** — when the client opens a past check-in detail, show pill below the check-in body
2. **`ClientMessageScreen.tsx`** — at the top of a thread, "Your coach reviewed this thread 30 min ago." (binds to last `coach_last_read_at` on the conversation)
3. **`FoodLogScreen.tsx` / progress photo / workout history detail** — when a coach has marked-read or commented

Phase-1 ships surfaces 1 + 2 only. Surface 3 is optional if the data model already carries the timestamp.

---

## Data model (backend)

Need a `coach_reviewed_at` timestamp on the relevant client artifact tables. **Empirical reality check:** `grep -nE "reviewedAt|coachReviewedAt" prisma/schema.prisma` on backend main returns **zero hits** — no such field exists today. Add it via migration.

### Migration

Add a nullable `coachReviewedAt DateTime?` column to (at minimum):

- `CheckIn` — when coach opens a specific check-in in their inbox, write timestamp
- `Conversation` — already has `coachLastReadAt`? If yes use that. If no, add it.

**Migration timestamp:** must be later than the L9 migration timestamp (look at `prisma/migrations/` sorted last after L9 lands). Until L9 lands, propose `20261218000000_add_coach_reviewed_at`.

### Write paths (backend)

- When coach opens a check-in detail endpoint (`GET /coach/check-ins/:id`) → fire a fire-and-forget write to set `coachReviewedAt = now()` if null
- When coach opens a conversation messages endpoint → update `coachLastReadAt`
- No new endpoints needed — purely a side-effect on existing read endpoints
- **Idempotent:** only writes when current value is `null` (we want the FIRST review time, not the latest re-open) — OR — operator decision needed on whether "reviewed 30 min ago" means "first looked at" or "most recently looked at". **Default:** most recently looked at (the pill text reads naturally with "X ago").

### Read paths (mobile)

- Existing GET endpoints just need to include the new field in their response DTOs
- Mobile consumes via existing TanStack Query hooks, no new API client work

---

## Component (mobile)

### `CompetencePill.tsx`

Location: `src/components/roman/CompetencePill.tsx`

Props:
```ts
interface CompetencePillProps {
  reviewedAt: string | null;  // ISO timestamp; null hides the pill
  testID?: string;
}
```

Behavior:
- If `reviewedAt` is null, returns `null` (no surface)
- Otherwise renders a small horizontal pill: monogram dot + "Your coach reviewed this {relative}." in Roman's serif text
- Relative time formatting:
  - < 1 hour → "Your coach reviewed this just now."
  - < 24 hours → "Your coach reviewed this {N} hour{s} ago."
  - same calendar day → "Your coach reviewed this earlier today."
  - yesterday → "Your coach reviewed this yesterday."
  - within 7 days → "Your coach reviewed this {N} days ago."
  - older → "Your coach reviewed this {Month D}."

### Voice rules

- Use the existing Roman voice helpers in `src/components/community/romanVoice.ts` / `src/lib/roman/copy.ts` — add a new stem `coachReviewSignal` with `straight`/`dry` variants. The pill ALWAYS uses `straight` (this is a micro-signal, not a moment for a quip)
- No exclamation marks. No emoji. No contractions.
- Use the existing `MonogramBadge` component for the dot

### Design tokens (per `quality-references/V3_3_BUILDER_BRIEF.md` style — sage warmth)

- Background: warm off-white surface (no card, no shadow, just a hairline border-bottom or border-top depending on placement)
- Text: near-black serif at small size
- Monogram: existing `MonogramBadge` sage-green variant, small size

---

## Feature flags

- Backend: `FEATURE_ROMAN_COACH_REVIEWED_AT` (controls the side-effect writes)
- Mobile: `EXPO_PUBLIC_FF_ROMAN_COMPETENCE_PILL` (controls pill rendering)

**Both default OFF.** When mobile flag is on and backend flag is OFF, the field is always null → pill never renders → no behavior change. Safe to ship asymmetrically.

---

## Tests

Backend (`/tmp/gpb-*` worktree):
- Migration roundtrip (model loads, field reads as null for existing rows, writes succeed)
- Side-effect handler test: GET check-in detail with null reviewedAt → field updated; with non-null → field updated (most-recent semantics) OR field preserved (first-look semantics) per operator decision above
- Idempotency under concurrent reads
- Flag-off pin: when `FEATURE_ROMAN_COACH_REVIEWED_AT=false`, the field stays null even after coach reads

Mobile (`/tmp/gpm-*` worktree):
- Snapshot of CompetencePill with each relative-time bucket
- Hidden when `reviewedAt` is null
- Doctrine pin: pill text has no exclamation, no emoji, no banned hype words, no fontWeight 700/800
- Flag-off pin: when `EXPO_PUBLIC_FF_ROMAN_COMPETENCE_PILL=false`, pill never renders even with a real timestamp

---

## Gates (per R0/R76/R79)

Same as all lanes: lint clean, tsc clean, full `npm test` green, ban scan clean, doctrine pins green, telemetry baseline updated if any new PostHog events (R78).

**Telemetry:** consider 1 event `roman.competence_pill.rendered` keyed by surface — if added, MUST update backend posthog-event-names.spec.ts pin (R78). If no telemetry needed for phase-1, omit it cleanly (no half-emit).

---

## Out-of-scope guardrails (R77)

- Do NOT touch any v3-4 search or wearable scope (L9 owns)
- Do NOT add notification kinds (Coach Brief v2 territory)
- Do NOT modify Roman voice contract
- Do NOT bundle ED.2 (3-arc widget) or ED.5 (onboarding polish) — those are separate lanes

---

## Recommended sequencing

This lane is **L10**, runs in parallel with L9 v3-4. Two PRs (backend + mobile). When L9 lands and consumes the migration slot, L10 rebases its migration timestamp forward and merges next.
