# v3-3 voice notes — empirical pre-flight notes (R76)

**Pre-flight by:** Operator, 2026-06-14 03:08 PDT
**Branch checked:** `main` @ HEAD (post L1+L6 merge; v3-2 NOT yet merged at time
of pre-flight — re-verify after v3-2 lands).

The L8 brief assumes:

1. `src/messaging/messaging.service.ts` exists and contains a voice-upload code
   path that can be extracted.
2. There is at least one `as any` / `as unknown as X` cast that the extraction
   should clean up.
3. The extracted helper can live at
   `src/community/voice/voice-upload.provider.ts`.

## Empirical findings (against main as of 2026-06-14 03:08 PDT)

### 1. File exists, 841 LOC

```
src/messaging/messaging.service.ts  — 841 lines
```

### 2. Voice-upload code path

The method `createVoiceUpload()` starts at line 589 with this signature:

```ts
async createVoiceUpload(
  userId: string,
  request: SignedVoiceUploadRequest,
): Promise<SignedVoiceUploadResponse>
```

The request/response types (`SignedVoiceUploadRequest`,
`SignedVoiceUploadResponse`) are defined at lines 47 and 53. These should
move with the helper into `voice-upload.provider.ts`.

### 3. Single `as unknown as X` cast (line 615)

```ts
const fn = (
  storage as unknown as {
    createSignedUploadUrl?: (
      path: string,
    ) => Promise<{
      data: { signedUrl: string; token?: string } | null;
      error: { message: string } | null;
    }>;
  }
).createSignedUploadUrl;
```

**This cast is deliberate, not lazy.** The inline comment explains: the
Supabase JS SDK shape for `createSignedUploadUrl` varies across minor
versions, so the call site narrows to a structural type rather than relying
on the SDK's typed export.

### 4. R77 lane-scope discipline for the typed extraction

The brief says "REMOVE any `as any` / `as unknown as X` that was tolerated in
messaging.service". For this single cast that means **moving the structural
narrowing into a small typed interface** in the extracted provider, e.g.:

```ts
// voice-upload.provider.ts
interface SupabaseStorageWithSignedUpload {
  createSignedUploadUrl?: (path: string) => Promise<{
    data: { signedUrl: string; token?: string } | null;
    error: { message: string } | null;
  }>;
}
```

Then the call site uses the interface name, not `as unknown as { ... }`. The
runtime check (`typeof fn !== 'function'`) MUST be preserved — it's the
SDK-version-skew guard documented in the inline comment.

**Do NOT remove the runtime check just because the type narrowed.** Doing so
would regress the version-skew behavior and likely trip a downstream test.

### 5. Existing callers

`createVoiceUpload` is currently called from messaging controllers (DMs).
After extraction, BOTH the existing messaging caller AND the new voice-notes
caller import from the provider. The brief already calls this out ("The
method is shared between both controllers" — line 587 inline comment).

The extraction is essentially:
- Move the method body + helper types into `voice-upload.provider.ts`
- Make it a Nest provider with `@Injectable()`
- Replace the `messaging.service.ts` definition with a call to the new provider
- Existing messaging tests should pass without modification

### 6. Migration timestamp ordering (R76)

After v3-2 lands on main, the LAST community migration timestamp is the
classroom posts migration (timestamp from L7's HEAD). L8's voice-notes
migration MUST have a timestamp strictly greater than that. Builder must:

```bash
ls prisma/migrations/ | sort | tail -5
```

before authoring the migration filename, and pick a timestamp greater than
the highest one shown.

### 7. R78 telemetry events expected to be added

Voice notes will plausibly add events like:
- `voiceNotePublished: 'community.voice.note_published'`
- `voicePublishFailed: 'community.voice.publish_failed'`
- `voiceUploadIssued: 'community.voice.upload_issued'`

If added, pin update (`posthog-event-names.spec.ts`) must bump from current
post-v3-2 baseline (9) accordingly.

## Action for L8 builder

When dispatching L8, reference this pre-flight note so the builder doesn't
re-discover scope. Specifically:

> "Empirical pre-flight at `quality-references/V3_3_PREFLIGHT_NOTES.md`
> confirms messaging.service.ts has ONE structural `as unknown as` cast at
> line 615 (deliberate Supabase SDK version-skew guard). Move the
> structural narrowing into a named interface inside the extracted provider;
> preserve the runtime `typeof fn !== 'function'` guard."

This is part of R76 (plan-doc empirical verification before lane dispatch).
