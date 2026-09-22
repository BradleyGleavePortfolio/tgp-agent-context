# EW2 — Undo + Autosave Spec (Master Workout Builder)

**Status:** Draft for operator review
**Scope:** Undo + Autosave as a *foundational part* of the **Master Workout Builder** greenfield feature.
**Authoring model:** Opus 4.8
**Operator scope confirmation:** *"EW2 Undo + Autosave spec — mainly this is just for the master workout builder."*

> **This is NOT a generic builder undo/autosave system.** It is specifically the undo + autosave foundation for the **Master Workout Builder** — a greenfield feature that does not yet exist in the codebase. The implementing engineer will build the Master Workout Builder skeleton and these two capabilities together; they are co-designed, not bolted on.

---

## 0. Where this sits, and what already exists

### What exists in the codebase today

- `src/workout-builder/` — the **per-client** workout builder (Phase 11). It owns `WorkoutPlan` / `WorkoutPlanExercise` / `ClientWorkoutAssignment`. Its open PR (**PR #123**) carries 12 P1 bugs and is **not merged**. It has **no** autosave, **no** version table, **no** undo log — `setExercises` is a whole-array replace under a Serializable lock (see `specs/BACKEND_WORKOUT_INVENTORY.md` §1 "Autosave / draft / undo support: NONE").
- There is **no** `src/master-workout-builder/` module.
- There is **no** `MasterWorkoutTemplate` Prisma model, and **no** `Regime` model.

### What this spec assumes will be built alongside it

The Master Workout Builder is greenfield. This spec defines undo + autosave **as a foundational part** of it, so it necessarily sketches just enough of the surrounding feature to anchor the design. **Everything past the undo + autosave boundary is the separate Master Workout Builder spec** (`specs/MASTER_WORKOUT_BUILDER_SPEC.md` is the broader design; this EW2 spec is the authoritative contract for the undo + autosave slice and supersedes the broader spec where the two differ on undo/autosave specifics — snapshot history, 50-deep retention, 1.5s debounce).

### Roman voice contract

Confirmation, status, and error copy in the builder must follow the Roman voice contract (PR #1 — `tgp-agent-context` voice contract). The exact strings this spec mandates are in **§9**.

---

## 1. Master Workout Builder primer (brief)

> This is a *primer only*. The full Master Workout Builder design is a separate document. This section exists so the undo + autosave design has a concrete object model to attach to.

### 1.1 What it is

The Master Workout Builder is a multi-week program authoring tool where coaches build **named regimes** — coach-owned templates such as *"Hypertrophy Block 1"* or *"Pre-Comp Cut"*. These are the coach's reusable intellectual property, distinct from the per-client plans in `src/workout-builder/`.

### 1.2 Lifecycle

- **Auto-assign on package purchase.** A coach package can carry a default regime via a new `CoachPackage.default_master_regime_id`. When a client purchases that package, the regime is auto-assigned to them.
- **Editable per-client after assignment, without affecting the template.** Assignment takes a **snapshot copy** into the client's plan. The coach can then tailor that client's copy freely; edits to the client copy never mutate the master template, and edits to the master template never retroactively mutate already-assigned client copies. (The per-client copy mechanics live in the Master Builder spec, not here.)

### 1.3 Schema sketch (new models — names only here; full definitions in the Master Builder spec)

| Model | Grain | Holds |
|---|---|---|
| `MasterWorkoutTemplate` | the named regime | name, owner coach, status, `current_version_id` (FK → version, **defined in §3**), `default`-ability for packages |
| `MasterWorkoutBlock` | a 4-week phase | ordered phases within a template (e.g. "Weeks 1–4: Accumulation") |
| `MasterWorkoutDay` | a session | a training day within a block (e.g. "Day 4: Pull") |
| `MasterWorkoutExerciseSlot` | one exercise | exercise ref + set/rep scheme + RPE + tempo |
| `MasterWorkoutTemplateVersion` | one snapshot | full template state at a point in time — **the table that drives undo. Fully specified in §3.** |

### 1.4 The boundary of this spec

This spec covers **only** undo + autosave for the Master Workout Builder. It defines `MasterWorkoutTemplateVersion`, the save/restore endpoints, autosave behavior, undo UX, change-summary generation, and the Roman copy for save states. It explicitly does **not** define the block/day/slot CRUD endpoints, the assignment/snapshot-to-client flow, the AI builder, sub-coach permissions, or the builder's full UI — those are the Master Workout Builder spec.

---

## 2. Undo design — snapshot history (chosen) vs CRDT (rejected)

The core decision: how do we represent edit history such that undo is robust, survives reload, and is auditable?

| | **Snapshot history** | **CRDT (Yjs / Automerge)** |
|---|---|---|
| Simplicity | **High** — each save = new version row | Low — operational-transform / merge complexity |
| Concurrent multi-device edits | Last-write-wins per field, undo-per-device | Real-time merge across devices |
| Storage at 1M templates × 50 edits | **~5 GB JSON (cheap)** | ~50 GB binary (Yjs CRDT trees) |
| Implementation effort | **3–5 days** | 15–20 days |
| Audit trail | **Built-in (named versions)** | Possible but complex |

### Decision: **snapshot history.**

Coaches rarely edit the same template on two devices simultaneously. The real workflow is one coach, one device, iterating on a regime over time. CRDT pays a huge complexity tax (operational transform, conflict-free merge, binary state vectors) to solve real-time multi-device convergence — a near-zero-occurrence use case here. Snapshot history gives us robust reload-surviving undo, a built-in audit trail (named versions), and trivial storage, in a fraction of the effort.

**Concurrency stance:** last-write-wins per save, undo-per-device. If a coach somehow edits the same template on two devices at once, the later save wins; each device's undo stack reflects what *it* saw. We accept this. A future "another session has changes" banner can be layered on without changing the storage model. CRDT remains available as a v2 escape hatch if real-time co-editing ever becomes a real demand — but it is explicitly out of scope here.

---

## 3. Schema

### 3.1 New table: `MasterWorkoutTemplateVersion`

Append-only. One row per save (autosave or explicit). Holds a **full snapshot** of the template state — not a diff. Diffs are computed at write time only to generate the human-readable `change_summary` (see §7); the stored payload is always the complete state, which is what makes restore trivial and reload-safe.

```prisma
model MasterWorkoutTemplateVersion {
  id                 String   @id @default(uuid())
  template_id        String
  version_number     Int      // auto-increment PER template (1, 2, 3, …), not global
  snapshot_json      Json     // full template state at this version
  created_by_user_id String
  change_summary     String   // short human string, e.g. "Added Day 4: Pull"
  was_autosave       Boolean  @default(false)
  created_at         DateTime @default(now())

  template MasterWorkoutTemplate @relation(fields: [template_id], references: [id], onDelete: Cascade)

  @@unique([template_id, version_number])
  @@index([template_id, created_at(sort: Desc)]) // for "latest 50 versions" queries
}
```

- **`version_number`** is monotonic **per template**, not global. It is computed by the backend at write time as `(current max for this template) + 1`, inside the same transaction as the insert. The `@@unique([template_id, version_number])` constraint makes a racing double-insert fail loudly rather than silently duplicate.
- **`snapshot_json`** is the entire template state (blocks → days → exercise slots) serialized. See §8 for size analysis (~50 KB typical).
- **`change_summary`** is generated by the `DiffSummarizer` service (§7) before the row is written.
- **`was_autosave`** lets the version-history UI distinguish background autosaves from deliberate explicit saves, and lets a future pruning policy treat them differently.
- **`@@index([template_id, created_at desc])`** serves the dominant query: "give me the latest 50 versions for this template."

### 3.2 New nullable FK on `MasterWorkoutTemplate`

```prisma
model MasterWorkoutTemplate {
  // … (other fields defined in the Master Builder spec) …
  current_version_id String?  // FK → MasterWorkoutTemplateVersion.id, the active version
  current_version    MasterWorkoutTemplateVersion? @relation("CurrentVersion", fields: [current_version_id], references: [id])
  versions           MasterWorkoutTemplateVersion[]
}
```

`current_version_id` points at the version that is currently "live." On every save it is updated to the newly written version. On restore it is updated to the new restored-from row (§4.3). It is **nullable** because a brand-new template has no version until its first save.

### 3.3 Write rule

**On every save — autosave OR explicit save — the backend writes a new `MasterWorkoutTemplateVersion` row** and updates `MasterWorkoutTemplate.current_version_id` to point at it, in a single transaction. There is no "dirty in-place mutation" path for template content; the version row *is* the source of truth, and the live template tables are a materialized projection of `current_version`.

### 3.4 Migration

- **NEW table:** `MasterWorkoutTemplateVersion`.
- **NEW nullable FK column:** `MasterWorkoutTemplate.current_version_id`.
- **Zero alters on any other existing table.** `MasterWorkoutTemplate` itself is greenfield (created in the Master Builder migration); the only thing this slice adds beyond that is the version table and the nullable self-referencing FK. No backfill required — existing rows do not exist yet, and the FK is nullable so new templates start with `null`.

---

## 4. Backend endpoints

New controller in `src/master-workout-builder/`. Class-level guards mirror the existing builder: `JwtAuthGuard`, `RolesGuard`, `@Roles('coach', 'owner')`, with tenant scoping verified in the service (a coach may only touch templates they own; sub-coach scoping is the Master Builder spec's concern and is enforced there).

All routes are under `/master-workout-templates`.

### 4.1 `PUT /master-workout-templates/:id` — save current state

Saves the current template state, **creates a version row**, and updates `current_version_id`.

- **Body:** the full template state payload **plus** `was_autosave: boolean`.
- **Behavior (single transaction):**
  1. Verify ownership.
  2. Compute `version_number = max(existing) + 1` for this template.
  3. Run `DiffSummarizer` (§7) over `(previous snapshot, incoming snapshot)` → `change_summary`.
  4. Insert the `MasterWorkoutTemplateVersion` row.
  5. Update `MasterWorkoutTemplate.current_version_id`.
  6. Project the snapshot into the live block/day/slot tables (Master Builder spec owns the projection mechanics).
- **Response:** `{ version_number, snapshot_id, saved_at }`
  - `version_number` — the new per-template version number.
  - `snapshot_id` — the new version row id.
  - `saved_at` — server timestamp (drives the "saved at {time}" indicator, §5).

### 4.2 `GET /master-workout-templates/:id/versions` — list recent versions

Returns the **last 50 versions** for the template, newest first (served by the `created_at desc` index).

- **Each item:** `change_summary`, `was_autosave`, `created_at`, `created_by_user_id`, `version_number`.
- Used by the version-history drawer (§6) and to hydrate the undo stack on load.

### 4.3 `POST /master-workout-templates/:id/restore/:version_number` — restore to a prior version

Restores the template to a prior version. **Never destructive.**

- **Behavior:** reads the target version's `snapshot_json`, then **creates a NEW version row** whose snapshot equals the target's, with `change_summary` like `"Restored from v{version_number}"` and `was_autosave: false`. Updates `current_version_id` to the new row.
- Because restore appends rather than rewinds, the history stays linear and auditable — you can always see that a restore happened, and you can undo the restore itself.
- **Response:** same shape as `PUT` (`{ version_number, snapshot_id, saved_at }`) — the *new* version created by the restore.

### 4.4 Throttle

Autosave fires often, so the save endpoint must tolerate bursts without becoming an abuse vector. Per-user throttle on the controller:

```ts
@Throttle({ default: { ttl: 60_000, limit: 60 } })
```

60 saves per 60 seconds per user. With a 1.5s debounce and a 30s max-interval (§5), a single actively-editing session stays well under this; the limit only bites on pathological/abusive clients.

---

## 5. Autosave behavior (mobile + web)

Goal: **"like Google Docs."** The coach never thinks about saving. Edits persist on their own; status is the only UI signal.

### 5.1 Timing

- **Debounce 1.5s** after the last edit. Each new edit resets the debounce timer.
- **If the user is mid-stroke (typing), reset the debounce** — don't save in the middle of a word.
- **Maximum interval 30s.** Even if the user keeps typing continuously, force a save every 30s so a long uninterrupted edit session can never lose more than ~30s of work.

### 5.2 Offline / network failure

- **Queue locally** on failure — `AsyncStorage` on the web/RN-web path, `MMKV` on mobile.
- **Exponential backoff retry** on the queued saves.
- **Max queue depth 20 saves; drop the oldest on overflow.** Because every save carries the *full* snapshot, the newest queued save already supersedes older ones — dropping the oldest never loses the latest state.
- **On app background → immediate flush** of any pending (debounced-but-not-yet-sent) save, before the OS can suspend the process.

### 5.3 Optimistic UI

- **Edits apply instantly** in the UI; we never block the editor on the network.
- A **"saving…"** indicator sits in the **upper-right**.
- It resolves to **"saved at {time}"** on success, or **"save failed — retry"** on error (with the retry affordance wired to re-enqueue). The exact strings follow Roman (§9).

---

## 6. Undo UX (mobile + web)

### 6.1 Inputs

- **Web:** `Cmd/Ctrl-Z` keyboard shortcut for undo; `Cmd/Ctrl-Shift-Z` for redo.
- **Mobile:** an **"Undo" button** in the toolbar **plus the 3-finger swipe** gesture (the iOS-standard undo pattern).

### 6.2 Feedback

- On undo, a **brief toast at the top**: **"Reverted: {change_summary}"** with a **"Redo"** CTA.

### 6.3 Stack semantics

- **Undo stack depth: 50** — matches snapshot retention (the last-50 versions from §4.2). You can undo as far back as the history the server keeps.
- **Redo is possible until the next user edit.** Once the user makes a fresh edit, the redo stack clears — standard editor behavior.
- Undo/redo operate by moving `current_version_id` across the version chain client-side (driving an optimistic projection) and confirming with the server; because history survives in the version table, the undo stack **survives reload** — on load, the client hydrates the stack from `GET …/versions`.

### 6.4 Version history drawer

- Accessible from the **builder toolbar**.
- Shows the **full last-50 list** with **timestamps + change summaries**.
- Each entry distinguishes autosave vs explicit save (from `was_autosave`).
- Offers a **named-version pin option** (e.g. *"Pre-launch v1"*) so a coach can bookmark a meaningful version. (Whether pins are coach-only or client-visible is an open operator decision — §10.)
- Selecting an entry routes to `POST …/restore/:version_number` (§4.3).

---

## 7. Change summary generation

Every version row carries a human-readable `change_summary`. It is generated **before** the snapshot is stored by diffing the incoming snapshot against the previous one.

### 7.1 Heuristic rules (examples)

- `"Added Day 4: Pull"`
- `"Removed exercise: Squat from Day 2"`
- `"Changed reps 8→10 on Squat (Day 1)"`
- `"Renamed template to Hypertrophy Block 2"`

### 7.2 Multi-change saves

When a single save contains several changes (common with debounced autosave that batches a flurry of edits), the summary collapses to **"5 changes"** with **expansion-on-tap** to reveal the individual change list. Each line in the expansion uses the same heuristic phrasing as a single-change save.

### 7.3 Where it lives

A small **`DiffSummarizer`** service in **`src/master-workout-builder/`**. It is a **pure function over two snapshot JSONs** — `(prevSnapshot, nextSnapshot) → { summary: string, changes: string[] }` — with no I/O, no DB access, fully unit-testable, and reusable by both the save path and any future audit tooling.

---

## 8. Performance

### 8.1 Snapshot size

A typical template — **12 weeks × 4 days × 6 exercises** — serializes to **~50 KB JSON**.

- At **50 versions**: ~**2.5 MB per template**.
- At **1M templates**: ~**5 GB** total. Trivial for Postgres `Json` storage; the `created_at desc` index keeps the "latest 50" query fast regardless of total history depth.

### 8.2 Pruning

- **Never auto-prune.** History *is* the feature — silently dropping versions would undermine both undo depth and the audit trail.
- A **manual "compact history" admin endpoint** can collapse old versions for individual templates **if** storage ever becomes a real concern. **Not v1.** When/if built, it must preserve named/pinned versions and the current version.

---

## 9. Roman voice integration

All save-state, error, and restore copy in the builder must follow the Roman voice contract (PR #1). The mandated strings:

| Trigger | Copy |
|---|---|
| Save succeeded (inline, small) | **"Saved."** |
| First network error (toast) | **"Save failed. I will retry."** |
| Autosave queue empties (all pending saves flushed) | **"All changes saved."** |
| After a restore completes | **"Version history restored to {change_summary} from {date}."** |

These are the canonical strings; any additional micro-copy introduced during implementation must be cleared against the Roman voice contract before merge.

---

## 10. Open operator decisions

1. **Named version pinning visibility.** Is a pin like *"Pre-launch v1"* shown to **clients**, or **coach-only**? (Affects whether the drawer is rendered at all on the client-facing surface.)
2. **Long-term pruning policy.** Default to **1-year retention**, or **unlimited**? (§8 says no auto-prune for v1; this decides the eventual policy and whether the "compact history" admin endpoint gets built.)
3. **Client visibility of version history.** When a client views a coach's template (e.g. an assigned regime), should they **ever** see version history, or is it **coach-only**?
4. **Web app existence.** Does the **web** Master Workout Builder exist yet? If **yes**, undo + autosave UX is shared with mobile (Cmd-Z + drawer on web, 3-finger swipe + button on mobile). If **no**, this slice ships **mobile-only for v1** and the web inputs (§6.1) are deferred.

---

## 11. Implementation summary (the contract, condensed)

- **Approach:** snapshot history (CRDT rejected — §2).
- **New table:** `MasterWorkoutTemplateVersion` (append-only, full snapshots, per-template `version_number`).
- **New FK:** `MasterWorkoutTemplate.current_version_id` (nullable). Zero alters on other tables.
- **Endpoints:** `PUT …/:id` (save + version), `GET …/:id/versions` (last 50), `POST …/:id/restore/:version_number` (non-destructive restore). Throttle `{ ttl: 60_000, limit: 60 }`.
- **Autosave:** 1.5s debounce, 30s max interval, offline queue (MMKV/AsyncStorage, depth 20, drop-oldest), flush on background, optimistic UI with upper-right status.
- **Undo:** Cmd/Ctrl-Z (web) + button & 3-finger swipe (mobile), 50-deep, redo-until-next-edit, top toast, version-history drawer with pinning.
- **Change summaries:** `DiffSummarizer` pure function in `src/master-workout-builder/`.
- **Copy:** Roman voice contract (§9).
- **Scope boundary:** stops at undo + autosave; the rest of the Master Workout Builder is its own spec.
